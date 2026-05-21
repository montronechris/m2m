// src/lib/api-service.ts
// Self-contained: no dependency on supabase-client.ts exports

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ─── INTERNAL REST HELPERS ────────────────────────────────────────────────────

function baseHeaders(): HeadersInit {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function restGet<T = any>(table: string, query: string): Promise<T[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    headers: baseHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`[GET ${table}] ${res.status}: ${await res.text()}`);
  return res.json();
}

async function restPost<T = any>(table: string, body: object | object[]): Promise<T[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: { ...baseHeaders(), Prefer: "return=representation" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`[POST ${table}] ${res.status}: ${await res.text()}`);
  return res.json();
}

async function restPatch(table: string, id: string, body: object): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...baseHeaders(), Prefer: "return=minimal" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`[PATCH ${table}] ${res.status}: ${await res.text()}`);
}

async function restDelete(table: string, id: string): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: "DELETE",
    headers: { ...baseHeaders(), Prefer: "return=minimal" },
  });
  if (!res.ok) throw new Error(`[DELETE ${table}] ${res.status}: ${await res.text()}`);
}

// ─── CANONICAL TYPES (single source of truth) ─────────────────────────────────
//
// Rule: ALL prices are in CENTS (integer). Never euros in the data layer.
// Conversion to "€X.XX" happens only in the render layer.

/** Single choice inside an option, as shown in the customization modal. */
export type ModalChoice = {
  id: string;
  name: string;
  priceModifierCents: number; // cents — 0 if free
  isDefault: boolean;         // true → preselezionata all'apertura del modal
};

/** Option group shown in the customization modal. */
export type ModalOption = {
  id: string;
  name: string;
  isRequired: boolean;
  isMultiple: boolean; // true → checkbox; false → radio
  choices: ModalChoice[];
};

/**
 * One customization row persisted in the cart / DB.
 * Uses explicit field names to avoid the "name" vs "choiceName" bug.
 */
export type CartCustomization = {
  optionId: string;
  optionName: string;         // e.g. "Cottura"
  choiceId: string;
  choiceName: string;         // e.g. "Ben cotto"  ← always "choiceName", never "name"
  priceModifierCents: number; // cents
};

/** Item stored in the local cart (Zustand) + synced to DB. */
export type CartItem = {
  orderItemId?: string;       // set after successful DB write
  menuItemId: string;
  name: string;
  priceCents: number;         // base + extras combined (for display & total)
  quantity: number;
  customizations: CartCustomization[];
  note?: string;              // nota libera sul piatto
};

/** Pending order row from the DB. */
export type PendingOrder = {
  id: string;
  table_id: string | null;
  restaurant_id: string | null;
  status: string;
  total_cents: number;
  notes: string | null;
  ordine: string | null;
};

// ─── RESTAURANT ───────────────────────────────────────────────────────────────

export const getRestaurantBySlug = async (slug: string) => {
  const rows = await restGet("restaurants", `?slug=eq.${encodeURIComponent(slug)}&limit=1`);
  if (!rows.length) throw new Error("Ristorante non trovato");
  return rows[0];
};

// ─── TABLE ────────────────────────────────────────────────────────────────────

export const getTableByToken = async (restaurantId: string, token: string) => {
  const rows = await restGet(
    "tables",
    `?restaurant_id=eq.${restaurantId}&qr_payload=eq.${encodeURIComponent(token)}&is_active=eq.true&limit=1`
  );
  if (!rows.length) throw new Error(`Tavolo "${token}" non disponibile o non attivo`);
  return rows[0];
};

// ─── MENU ─────────────────────────────────────────────────────────────────────

export const getMenuCategories = async (restaurantId: string) => {
  return restGet(
    "menu_categories",
    `?restaurant_id=eq.${restaurantId}&is_visible=eq.true&order=sort_order.asc`
  );
};

export const getMenuItems = async (categoryIds: string[]) => {
  if (!categoryIds.length) return [];
  // Filter server-side — no full-table scan in JS
  const inList = `(${categoryIds.join(",")})`;
  return restGet("menu_items", `?category_id=in.${inList}&is_available=eq.true&order=name.asc`);
};

// ─── MENU ITEM OPTIONS ────────────────────────────────────────────────────────

export const getMenuItemOptions = async (menuItemId: string): Promise<ModalOption[]> => {
  const rows = await restGet(
    "menu_item_options",
    `?item_id=eq.${menuItemId}&select=*,choices:menu_item_option_choices(*)`
  );

  return rows.map((opt: any): ModalOption => ({
    id: opt.id,
    name: opt.name,
    isRequired: opt.is_required ?? false,
    isMultiple: opt.type === "multiple",
    choices: (opt.choices ?? []).map((c: any): ModalChoice => ({
      id: c.id,
      name: c.name,
      priceModifierCents: c.price_modifier_cents ?? 0,
      isDefault: c.is_default ?? false,
    })),
  }));
};

// ─── DB CART — ORDERS ─────────────────────────────────────────────────────────

/**
 * Returns an existing pending order for a table or creates a new one.
 * Uses table_id to resume sessions after page refresh.
 */
export const getOrCreatePendingOrder = async (
  tableId: string | null,
  restaurantId: string | null
): Promise<PendingOrder> => {
  if (tableId) {
    const existing = await restGet<PendingOrder>(
      "orders",
      `?table_id=eq.${tableId}&status=eq.pending&order=created_at.desc&limit=1`
    );
    if (existing.length) return existing[0];
  }

  const created = await restPost<PendingOrder>("orders", {
    table_id: tableId ?? null,
    restaurant_id: restaurantId ?? null,
    status: "pending",
    total_cents: 0,
    notes: null,
    ordine: null,
  });
  return created[0];
};

/**
 * Fetch a specific order by id.
 */
export const getPendingOrderById = async (orderId: string): Promise<PendingOrder | null> => {
  const rows = await restGet<PendingOrder>("orders", `?id=eq.${orderId}&limit=1`);
  return rows[0] ?? null;
};

// ─── DB CART — ORDER ITEMS ────────────────────────────────────────────────────

/**
 * Load all items for a given order and map them to CartItem shape.
 * Called on mount to rehydrate the local store from DB.
 */
export const getOrderItems = async (orderId: string): Promise<CartItem[]> => {
  const rows = await restGet(
    "order_items",
    `?order_id=eq.${orderId}&order=id.asc`
  );

  return rows.map((row: any): CartItem => ({
    orderItemId: row.id,
    menuItemId: row.menu_item_id,
    name: row.name_snapshot ?? row.name ?? "",
    // base_price nel DB è in EURO (es. 16.50) → convertiamo in centesimi
    priceCents: Math.round((row.base_price ?? 0) * 100),
    quantity: row.quantity ?? 1,
    customizations: (row.customizations ?? []) as CartCustomization[],
    note: row.note ?? "",
  }));
};

/**
 * Persist one item to order_items, then recalculate and update orders.total_cents.
 * Returns the new order_item id.
 */
export const addItemToOrder = async (
  orderId: string,
  item: {
    menuItemId: string;
    name: string;
    priceCents: number;          // base + extras combined
    quantity: number;
    customizations: CartCustomization[];
  }
): Promise<string> => {
  // 1. Insert order_item — colonne reali del DB: name_snapshot, base_price
  const created = await restPost("order_items", {
    order_id: orderId,
    menu_item_id: item.menuItemId,
    name_snapshot: item.name,      // ← colonna reale
    quantity: item.quantity,
    base_price: item.priceCents / 100,  // DB numeric in euro (es. 16.50), il codice lavora in centesimi
    customizations: item.customizations,
  });

  // 2. Recalculate order total (sum all items from DB — single source of truth)
  const allRows = await restGet(
    "order_items",
    `?order_id=eq.${orderId}&select=base_price,quantity`
  );
  // base_price nel DB è in euro → moltiplica ×100 per ottenere centesimi
  const newTotal = allRows.reduce(
    (sum: number, r: any) => sum + Math.round((r.base_price ?? 0) * 100) * (r.quantity ?? 1),
    0
  );

  await restPatch("orders", orderId, {
    total_cents: newTotal,
    updated_at: new Date().toISOString(),
  });

  return created[0]?.id ?? "";
};

/**
 * Elimina un order_item dal DB e ricalcola il totale dell'ordine.
 */
export const removeOrderItem = async (
  orderItemId: string,
  orderId: string
): Promise<void> => {
  await restDelete("order_items", orderItemId);

  const allRows = await restGet(
    "order_items",
    `?order_id=eq.${orderId}&select=base_price,quantity`
  );
  const newTotal = allRows.reduce(
    (sum: number, r: any) => sum + Math.round((r.base_price ?? 0) * 100) * (r.quantity ?? 1),
    0
  );
  await restPatch("orders", orderId, { total_cents: newTotal });
};

/**
 * Aggiorna la quantità di un order_item nel DB e ricalcola il totale.
 */
export const updateOrderItemQuantity = async (
  orderItemId: string,
  orderId: string,
  newQuantity: number
): Promise<void> => {
  await restPatch("order_items", orderItemId, { quantity: newQuantity });

  const allRows = await restGet(
    "order_items",
    `?order_id=eq.${orderId}&select=base_price,quantity`
  );
  const newTotal = allRows.reduce(
    (sum: number, r: any) => sum + Math.round((r.base_price ?? 0) * 100) * (r.quantity ?? 1),
    0
  );
  await restPatch("orders", orderId, { total_cents: newTotal });
};

/**
 * Aggiorna la nota libera di un order_item.
 */
export const updateOrderItemNote = async (
  orderItemId: string,
  note: string
): Promise<void> => {
  await restPatch("order_items", orderItemId, { note });
};

/**
 * Cancella un ordine: imposta status → "cancelled" e elimina tutti gli order_items.
 */
export const cancelOrder = async (orderId: string): Promise<void> => {
  await restPatch("orders", orderId, {
    status: "cancelled",
    updated_at: new Date().toISOString(),
  });
  // Elimina gli order_items uno per uno (REST non supporta DELETE senza filtro id)
  const rows = await restGet("order_items", `?order_id=eq.${orderId}&select=id`);
  await Promise.all(rows.map((r: any) => restDelete("order_items", r.id)));
};

// ─── SESSION ──────────────────────────────────────────────────────────────────

export const validateSession = async (sessionId: string) => {
  const res = await fetch(`/api/session/${sessionId}`);
  if (!res.ok) {
    let msg = "Sessione non valida o scaduta.";
    try { const d = await res.json(); msg = d.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
};

export const validateScanToken = async (token: string) => {
  const res = await fetch(`/api/scan/${token}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Token non valido");
  return data;
};
// ─── DB CART — REMOVE / UPDATE ────────────────────────────────────────────────