// src/components/client/order/ItemDetailModal.tsx
"use client";

import { useEffect, useState } from "react";
import { X, Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ModalOption, CartCustomization } from "@/lib/api-service";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price_cents: number;
  image_url?: string;
  is_vegetarian?: boolean;
  is_gluten_free?: boolean;
}

interface ItemDetailModalProps {
  isOpen: boolean;
  item: MenuItem | null;
  options: ModalOption[];
  onClose: () => void;
  onConfirm: (customizations: CartCustomization[], quantity: number) => void;
}

const fmt = (cents: number) => (cents / 100).toFixed(2);

export default function ItemDetailModal({
  isOpen,
  item,
  options,
  onClose,
  onConfirm,
}: ItemDetailModalProps) {
  // Mappa optionId → choiceId[] selezionati
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inizializza con le scelte predefinite ogni volta che si apre
  useEffect(() => {
    if (!isOpen || !options.length) return;

    const init: Record<string, string[]> = {};
    options.forEach((opt) => {
      const defaults = opt.choices
        .filter((c) => c.isDefault)
        .map((c) => c.id);
      init[opt.id] = defaults;
    });
    setSelected(init);
    setQuantity(1);
    setErrors({});
  }, [isOpen, options]);

  if (!isOpen || !item) return null;

  const toggleChoice = (optionId: string, choiceId: string, isMultiple: boolean) => {
    setSelected((prev) => {
      const current = prev[optionId] ?? [];
      const exists = current.includes(choiceId);
      if (isMultiple) {
        return {
          ...prev,
          [optionId]: exists
            ? current.filter((id) => id !== choiceId)
            : [...current, choiceId],
        };
      }
      // Radio: deseleziona se già attivo, altrimenti sostituisci
      return { ...prev, [optionId]: exists ? [] : [choiceId] };
    });
  };

  // Calcola extra totale in centesimi in base alle selezioni correnti
  const extraCents = options.reduce((sum, opt) => {
    return sum + (selected[opt.id] ?? []).reduce((s, choiceId) => {
      const choice = opt.choices.find((c) => c.id === choiceId);
      return s + (choice?.priceModifierCents ?? 0);
    }, 0);
  }, 0);

  const unitCents = item.price_cents + extraCents;
  const totalCents = unitCents * quantity;

  const handleConfirm = () => {
    // Validazione obbligatori
    const newErrors: Record<string, string> = {};
    options.forEach((opt) => {
      if (opt.isRequired && (!selected[opt.id] || selected[opt.id].length === 0)) {
        newErrors[opt.id] = "Opzione obbligatoria";
      }
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Costruisce CartCustomization[]
    const customizations: CartCustomization[] = [];
    options.forEach((opt) => {
      (selected[opt.id] ?? []).forEach((choiceId) => {
        const choice = opt.choices.find((c) => c.id === choiceId);
        if (!choice) return;
        customizations.push({
          optionId: opt.id,
          optionName: opt.name,
          choiceId: choice.id,
          choiceName: choice.name,
          priceModifierCents: choice.priceModifierCents,
        });
      });
    });

    onConfirm(customizations, quantity);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative z-10 w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* Immagine */}
        <div className="relative w-full h-52 bg-gray-100 flex-shrink-0">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <ShoppingCart className="w-16 h-16" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Contenuto scrollabile */}
        <div className="flex-1 overflow-y-auto px-5 pt-5 pb-2 space-y-5">
          {/* Titolo e prezzo base */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
            {item.description && (
              <p className="text-gray-500 text-sm mt-1 leading-relaxed">{item.description}</p>
            )}
            <p className="mt-2 text-lg font-semibold text-gray-800">
              €{fmt(item.price_cents)}
              {extraCents > 0 && (
                <span className="text-green-600 ml-2 text-base">+€{fmt(extraCents)} extra</span>
              )}
            </p>
          </div>

          {/* Opzioni */}
          {options.map((opt) => {
            const selectedIds = selected[opt.id] ?? [];
            return (
              <div key={opt.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 text-base">
                    {opt.name}
                    {opt.isRequired && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {opt.isMultiple ? "Scelta multipla" : "Scelta singola"}
                  </span>
                </div>

                <div className="grid gap-2">
                  {opt.choices.map((choice) => {
                    const active = selectedIds.includes(choice.id);
                    return (
                      <button
                        key={choice.id}
                        type="button"
                        onClick={() => toggleChoice(opt.id, choice.id, opt.isMultiple)}
                        className={`w-full rounded-xl border-2 px-4 py-3 text-left flex items-center justify-between transition-all ${
                          active
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {/* Radio/checkbox visivo */}
                          <span
                            className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                              active ? "border-green-500 bg-green-500" : "border-gray-300"
                            }`}
                          >
                            {active && (
                              <span className="w-2 h-2 rounded-full bg-white block" />
                            )}
                          </span>
                          <span className="font-medium text-gray-800">{choice.name}</span>
                          {choice.isDefault && !active && (
                            <span className="text-xs text-gray-400 italic">(predefinito)</span>
                          )}
                        </div>
                        {choice.priceModifierCents > 0 ? (
                          <span className="text-sm font-semibold text-green-600">
                            +€{fmt(choice.priceModifierCents)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">incluso</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {errors[opt.id] && (
                  <p className="text-xs text-red-500">{errors[opt.id]}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer fisso */}
        <div className="flex-shrink-0 border-t border-gray-100 px-5 py-4 space-y-3 bg-white">
          {/* Selettore quantità */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Quantità</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-gray-400 disabled:opacity-40 transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center font-bold text-gray-900 text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-gray-400 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottone aggiungi */}
          <Button
            onClick={handleConfirm}
            className="w-full py-6 text-base font-bold bg-gray-900 hover:bg-green-600 text-white rounded-2xl transition-all"
          >
            Aggiungi al carrello — €{fmt(totalCents)}
          </Button>
        </div>
      </div>
    </div>
  );
}