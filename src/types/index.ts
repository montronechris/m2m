export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
export type Allergen = 'gluten' | 'milk' | 'eggs' | 'fish' | 'peanuts' | 'soy' | 'nuts' | 'celery' | 'mustard' | 'sesame' | 'sulphites' | 'lupin' | 'molluscs';

export interface Restaurant { id: string; slug: string; name: string; logo_url: string | null; currency: string; settings: Record<string, unknown>; created_at: string; }
export interface Table { id: string; restaurant_id: string; table_number: number; qr_payload: string; is_active: boolean; created_at: string; }
export interface MenuCategory { id: string; restaurant_id: string; name: string; sort_order: number; is_visible: boolean; }
export interface MenuItemOptionChoice { id: string; option_id: string; name: string; price_modifier_cents: number; }
export interface MenuItemOption { id: string; item_id: string; name: string; type: 'single' | 'multiple'; is_required: boolean; min_selection: number; max_selection: number; choices: MenuItemOptionChoice[]; }
export interface MenuItem { id: string; category_id: string; name: string; description: string | null; price_cents: number; image_url: string | null; is_available: boolean; is_vegetarian: boolean; is_vegan: boolean; is_gluten_free: boolean; allergens: Allergen[]; options: MenuItemOption[]; }
export interface OrderItemCustomization { selectedChoices: { choiceId: string; name: string; price_cents: number }[]; notes?: string; }
export interface OrderItem { id: string; order_id: string; menu_item_id: string | null; quantity: number; unit_price_cents: number; customizations: OrderItemCustomization; item?: Pick<MenuItem, 'name' | 'image_url'>; }
export interface Order { id: string; table_id: string; restaurant_id: string; status: OrderStatus; total_cents: number; notes: string | null; created_at: string; updated_at: string; items?: OrderItem[]; }
