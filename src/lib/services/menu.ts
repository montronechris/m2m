// src/lib/services/menu.ts
import { createClient } from '@/lib/supabase/client'
import type { MenuItem, MenuCategory } from '@/types'

export const menuService = {
  // FETCH
  getCategories: async (restaurantId: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('sort_order', { ascending: true })
    if (error) throw error
    return data as MenuCategory[]
  },

  getItems: async (restaurantId: string, categoryIds: string[]) => {
    if (categoryIds.length === 0) return []
    const supabase = createClient()
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .in('category_id', categoryIds)
      .order('name', { ascending: true })
    if (error) throw error
    return data as MenuItem[]
  },

  // CREATE
  createCategory: async (name: string, sort_order: number, restaurantId: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('menu_categories')
      .insert([{ name, sort_order, restaurant_id: restaurantId }])
      .select()
      .single()
    if (error) throw error
    return data as MenuCategory
  },

  createItem: async (item: Omit<MenuItem, 'id'>) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('menu_items')
      .insert([item])
      .select()
      .single()
    if (error) throw error
    return data as MenuItem
  },

  // UPDATE
  updateItem: async (id: string, updates: Partial<MenuItem>) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', id)
    if (error) throw error
  },

  // DELETE
  deleteItem: async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('menu_items').delete().eq('id', id)
    if (error) throw error
  },

  deleteCategory: async (categoryId: string, restaurantId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('menu_categories')
      .delete()
      .eq('id', categoryId)
      .eq('restaurant_id', restaurantId)
    if (error) throw error
  },

  // MOVE ITEMS TO UNASSIGNED
  moveItemsToCategory: async (itemIds: string[], targetCategoryId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('menu_items')
      .update({ category_id: targetCategoryId })
      .in('id', itemIds)
    if (error) throw error
  },

  getOrCreateUnassignedCategory: async (restaurantId: string) => {
    const supabase = createClient()
    // Cerca esistente
    const { data: existing } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .ilike('name', 'non associato')
      .maybeSingle()
    
    if (existing) return existing as MenuCategory
    
    // Crea nuova
    const { data, error } = await supabase
      .from('menu_categories')
      .insert([{ name: 'Non associato', sort_order: 9999, restaurant_id: restaurantId }])
      .select()
      .single()
    if (error) throw error
    return data as MenuCategory
  }
}