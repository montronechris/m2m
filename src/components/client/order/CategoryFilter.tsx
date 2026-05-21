// src/components/client/order/CategoryFilter.tsx

"use client";

interface CategoryFilterProps {
  categories: Array<{ id: string; name: string }>;
  activeCat: string;
  onCategoryChange: (catId: string) => void;
}

export function CategoryFilter({
  categories,
  activeCat,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center py-4">
      {/* Bottone "Tutti i Piatti" */}
      <button
        onClick={() => onCategoryChange("all")}
        className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 border-2 ${
          activeCat === "all"
            ? "bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-900/20 scale-105"
            : "bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:text-green-600 hover:shadow-md hover:-translate-y-0.5"
        }`}
      >
        Tutti i Piatti
      </button>

      {/* Categorie Dinamiche */}
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 border-2 ${
            activeCat === cat.id
              ? "bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-900/20 scale-105"
              : "bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:text-green-600 hover:shadow-md hover:-translate-y-0.5"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}