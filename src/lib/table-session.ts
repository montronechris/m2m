// src/lib/table-session.ts

export interface TableSession {
  sessionId: string;
  tableCode: string;
  restaurantSlug: string;
  tableNumber?: string;
  restaurantId?: string;
  createdAt: number;
}

const STORAGE_KEY = "tavolarapida_table_session";
const SESSION_DURATION_MS = 15 * 60 * 1000; // 15 minuti

// ─── Core ────────────────────────────────────────────────────────────────────

export const saveTableSession = (session: Omit<TableSession, "createdAt">) => {
  if (typeof window === "undefined") return;
  try {
    const newSession: TableSession = {
      ...session,
      createdAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
  } catch (e) {
    console.error("Failed to save table session:", e);
  }
};

export const getTableSession = (): TableSession | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const session: TableSession = JSON.parse(stored);

    if (Date.now() - session.createdAt > SESSION_DURATION_MS) {
      clearTableSession();
      return null;
    }

    return session;
  } catch (e) {
    console.error("Failed to parse table session:", e);
    clearTableSession();
    return null;
  }
};

export const clearTableSession = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear table session:", e);
  }
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Restituisce true se esiste una sessione valida (non scaduta) */
export const hasValidSession = (): boolean => {
  return getTableSession() !== null;
};

/** Restituisce il sessionId salvato, o null se scaduto/assente */
export const getSessionId = (): string | null => {
  return getTableSession()?.sessionId ?? null;
};

/** Costruisce l'href del menu a partire dalla sessione salvata */
export const getMenuHref = (): string => {
  const session = getTableSession();
  if (!session) return "/";
  return `/order/${session.sessionId}?slug=${session.restaurantSlug}&table=${session.tableCode}`;
};

/** Costruisce l'href del cart a partire dalla sessione salvata */
export const getCartHref = (): string => {
  const sessionId = getSessionId();
  return sessionId ? `/cart/${sessionId}` : "/";
};