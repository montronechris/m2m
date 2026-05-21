// src/components/admin/menu/MenuTable.tsx
import { Edit, Trash2 } from 'lucide-react'
import type { MenuItem, MenuCategory } from '@/types'

interface MenuTableProps {
  items: MenuItem[]
  categories: MenuCategory[]
  selectedFilter: string
  onFilterChange: (id: string) => void
  onEdit: (item: MenuItem) => void
  onDelete: (id: string) => void
  loading: boolean
  theme: 'light' | 'dark'
}

export function MenuTable({ items, categories, selectedFilter, onFilterChange, onEdit, onDelete, loading, theme }: MenuTableProps) {
  const bg = theme === 'light' ? 'bg-white' : 'bg-[#1a1a25]'
  const textPrimary = theme === 'light' ? 'text-gray-900' : 'text-white'
  // ... altri stili dinamici ...

  if (loading) return <TableLoader />

  return (
    <section className={`${bg} rounded-2xl border ${theme === 'light' ? 'border-gray-200' : 'border-white/10'} overflow-hidden`}>
      {/* Header con filtro */}
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <h3 className={`font-semibold ${textPrimary}`}>Piatti ({items.length})</h3>
        <select value={selectedFilter} onChange={(e) => onFilterChange(e.target.value)} className="...">
          <option value="all">Tutte le categorie</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      
      {/* Tabella */}
      <table className="w-full">
        {/* ... rendering righe ... */}
      </table>
    </section>
  )
}