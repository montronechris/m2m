// src/hooks/useMenuManager.ts
"use client";
import { useState, useCallback } from 'react'
import { menuService } from '@/lib/services/menu'
import type { MenuItem, MenuCategory } from '@/types'

export function useMenuManager(restaurantId: string | null, onNotify?: (msg: string, type: 'success' | 'error') => void) {
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all')

  const notify = (msg: string, type: 'success' | 'error') => onNotify?.(msg, type)

  const loadData = useCallback(async () => {
    if (!restaurantId) return
    try {
      setLoading(true)
      const cats = await menuService.getCategories(restaurantId)
      setCategories(cats)
      const itms = await menuService.getItems(restaurantId, cats.map(c => c.id))
      setItems(itms)
    } catch (err: any) {
      console.error(err)
      notify('Errore caricamento menu', 'error')
    } finally {
      setLoading(false)
    }
  }, [restaurantId])

  const handleAddCategory = async (name: string) => {
    if (!restaurantId) return
    try {
      await menuService.createCategory(name, categories.length + 1, restaurantId)
      await loadData()
      notify('Categoria aggiunta', 'success')
    } catch (err: any) {
      notify(`Errore: ${err.message}`, 'error')
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!restaurantId) return
    const itemsInCat = items.filter(i => i.category_id === categoryId)
    
    try {
      if (itemsInCat.length > 0) {
        const unassigned = await menuService.getOrCreateUnassignedCategory(restaurantId)
        await menuService.moveItemsToCategory(itemsInCat.map(i => i.id), unassigned.id)
      }
      await menuService.deleteCategory(categoryId, restaurantId)
      await loadData()
      notify('Categoria eliminata', 'success')
    } catch (err: any) {
      notify(`Errore: ${err.message}`, 'error')
    }
  }

  const handleSaveItem = async (item: Partial<MenuItem>, isUpdate: boolean) => {
    if (!restaurantId) return
    try {
      setSaving(true)
      if (isUpdate && item.id) {
        await menuService.updateItem(item.id, item)
      } else {
        await menuService.createItem(item as Omit<MenuItem, 'id'>)
      }
      await loadData()
      notify(isUpdate ? 'Piatto aggiornato' : 'Piatto aggiunto', 'success')
      return true
    } catch (err: any) {
      notify(`Errore: ${err.message}`, 'error')
      return false
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      await menuService.deleteItem(id)
      await loadData()
      notify('Piatto eliminato', 'success')
    } catch (err: any) {
      notify(`Errore: ${err.message}`, 'error')
    }
  }

  const filteredItems = selectedCategoryFilter === 'all'
    ? items
    : items.filter(i => i.category_id === selectedCategoryFilter)

  return {
    // Data
    items: filteredItems,
    allItems: items,
    categories,
    loading,
    saving,
    
    // Filters
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    
    // Actions
    loadData,
    handleAddCategory,
    handleDeleteCategory,
    handleSaveItem,
    handleDeleteItem,
    
    // Helpers
    getCategoryName: (id: string) => categories.find(c => c.id === id)?.name || '—'
  }
}