import { createClient } from '@/lib/supabase/server'
import type { Restaurant, Table, MenuItem, MenuCategory, Order, OrderStatus } from '@/types'

// Helper per mappare i dati grezzi di Supabase ai nostri Tipi TypeScript
const mapItem = (item: any): MenuItem => ({
  id: item.id,
  category_id: item.category_id,
  name: item.name,
  description: item.description,
  price_cents: item.price_cents,
  image_url: item.image_url,
  is_available: item.is_available,
  is_vegetarian: item.is_vegetarian,
  is_vegan: item.is_vegan,
  is_gluten_free: item.is_gluten_free,
  allergens: item.allergens || [],
  options: [] // Per ora lasciamo vuoto, lo popoleremo dopo se serve
})

export const db = {
  // --- LATO CLIENTE (Menu & Ordini) ---
  
  getMenu: async () => {
    const supabase = await createClient()
    
    // Fetch Categorie
    const { data: categories } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true })

    // Fetch Piatti
    const { data: items } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_available', true)

    return { 
      categories: categories || [], 
      items: (items || []).map(mapItem) 
    }
  },

  createOrder: async (orderData: any) => {
    const supabase = await createClient()
    
    // 1. Inserisci l'ordine principale
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        table_id: orderData.table_id,
        restaurant_id: orderData.restaurant_id,
        total_cents: orderData.total_cents,
        notes: orderData.notes,
        status: 'pending'
      })
      .select()
      .single()

    if (orderError) throw orderError

    // 2. Inserisci gli articoli dell'ordine
    const orderItems = orderData.items.map((item: any) => ({
      order_id: order.id,
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
      unit_price_cents: item.unit_price_cents,
      customizations: item.customizations
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    return order
  },

  callWaiter: async (tableId: string, restaurantId: string) => {
    const supabase = await createClient()
    return await supabase.from('waiter_calls').insert({ table_id: tableId, restaurant_id: restaurantId })
  },

  // --- LATO ADMIN (Dashboard) ---

  getOrders: async (restaurantId: string) => {
    const supabase = await createClient()
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })
    
    return data || []
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    const supabase = await createClient()
    return await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
  }
}
