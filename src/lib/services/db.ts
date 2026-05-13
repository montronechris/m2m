import { createClient } from '@/lib/supabase/client'
import type { OrderStatus } from '@/types'

// Mappatura per pulire i dati grezzi di Supabase
const cleanItem = (item: any) => ({
  ...item,
  allergens: item.allergens || [],
  options: [] // Per ora semplifichiamo, le opzioni si possono espandere dopo
})

export const db = {
  // --- CLIENTE ---
  
  getMenu: async () => {
    const supabase = createClient()
    
    const { data: categories } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true })

    const { data: items } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_available', true)

    return { 
      categories: categories || [], 
      items: (items || []).map(cleanItem) 
    }
  },

// src/lib/services/db.ts

  createOrder: async (orderData: any) => {
    const supabase = createClient()
    
    // Usiamo l'ID hardcoded o passato dinamicamente. 
    // Per sicurezza, forziamo l'ID del ristorante che ci hai dato.
    const TARGET_RESTAURANT_ID = "65bd3c11-e961-4421-9f40-cf0c3cfc6e73";

    const {  order, error: orderError } = await supabase
      .from('orders')
      .insert({
        table_id: orderData.table_id,
        restaurant_id: TARGET_RESTAURANT_ID, // <-- ID Fisso per ora
        total_cents: orderData.total_cents,
        notes: orderData.notes,
        status: 'pending'
      })
      .select()
      .single()

    if (orderError) {
      console.error("Errore ordine:", orderError)
      throw orderError
    }

    const orderItems = orderData.items.map((item: any) => ({
      order_id: order.id,
      menu_item_id: item.menuItemId,
      quantity: item.quantity,
      unit_price_cents: item.priceCents,
      customizations: item.customizations
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    return order
  },

  callWaiter: async (tableId: string, restaurantId: string) => {
    const supabase = createClient()
    return await supabase.from('waiter_calls').insert({ 
      table_id: tableId, 
      restaurant_id: restaurantId 
    })
  },

  // --- ADMIN ---

  getOrders: async (restaurantId: string) => {
    const supabase = createClient()
    // Fetch ordini con i relativi items
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })
    
    return data || []
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    const supabase = createClient()
    return await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
  }
}