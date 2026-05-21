// src/components/client/cart/CustomizationModal.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronDown, Star } from "lucide-react";
import type { ModalOption, CartCustomization } from "@/lib/api-service";

// ─── PROPS ────────────────────────────────────────────────────────────────────
interface CustomizationModalProps {
  isOpen: boolean;
  /** Nome del piatto mostrato nell'header del modal */
  itemName: string;
  options: ModalOption[];
  onClose: () => void;
  /** Restituisce CartCustomization[] — una entry per ogni opzione selezionata */
  onConfirm: (customizations: CartCustomization[]) => void;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function CustomizationModal({
  isOpen,
  itemName,
  options,
  onClose,
  onConfirm,
}: CustomizationModalProps) {
  /**
   * selections: optionId → choiceId[]
   * Anche per opzioni "single" usiamo un array (max 1 elemento) per uniformità.
   */
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [errors, setErrors]         = useState<Record<string, string>>({});

  // Inizializza le selezioni quando il modal si apre o cambiano le options
  useEffect(() => {
    if (!isOpen) return;
    const initial: Record<string, string[]> = {};
    options.forEach((opt) => {
      // Pre-seleziona le choices con is_default === true
      const defaults = opt.choices.filter((c) => c.isDefault).map((c) => c.id);
      initial[opt.id] = defaults;
    });
    setSelections(initial);
    setErrors({});
  }, [isOpen, options]);

  if (!isOpen) return null;

  // ─── SELEZIONE CHOICE ────────────────────────────────────────────────────
  const toggleChoice = (optionId: string, choiceId: string, isMultiple: boolean) => {
    setSelections((prev) => {
      const current = prev[optionId] ?? [];
      const exists  = current.includes(choiceId);
      if (isMultiple) {
        return { ...prev, [optionId]: exists ? current.filter((id) => id !== choiceId) : [...current, choiceId] };
      }
      // single: sostituisce o toglie
      return { ...prev, [optionId]: exists ? [] : [choiceId] };
    });
    // Rimuove l'errore su quell'opzione appena l'utente tocca qualcosa
    setErrors((prev) => { const e = { ...prev }; delete e[optionId]; return e; });
  };

  // ─── CONFERMA ────────────────────────────────────────────────────────────
  const handleConfirm = () => {
    // Validazione obbligatorie
    const newErrors: Record<string, string> = {};
    options.forEach((opt) => {
      if (opt.isRequired && (!selections[opt.id] || selections[opt.id].length === 0)) {
        newErrors[opt.id] = "Selezione obbligatoria";
      }
    });
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    // Costruisce CartCustomization[] — formato canonico verso store e DB
    const customizations: CartCustomization[] = [];
    options.forEach((opt) => {
      (selections[opt.id] ?? []).forEach((choiceId) => {
        const choice = opt.choices.find((c) => c.id === choiceId);
        if (!choice) return;
        customizations.push({
          optionId:          opt.id,
          optionName:        opt.name,
          choiceId:          choice.id,
          choiceName:        choice.name,
          priceModifierCents: choice.priceModifierCents,
        });
      });
    });

    onConfirm(customizations);
    onClose();
  };

  // ─── PREZZO TOTALE EXTRA ─────────────────────────────────────────────────
  const extraCents = options.reduce((sum, opt) => {
    return sum + (selections[opt.id] ?? []).reduce((s, choiceId) => {
      const ch = opt.choices.find((c) => c.id === choiceId);
      return s + (ch?.priceModifierCents ?? 0);
    }, 0);
  }, 0);

  // ─── UI ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-lg bg-white sm:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[85vh]">

        {/* ── Header ── */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-green-600 mb-0.5">
              Personalizza
            </p>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">{itemName}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all ml-3 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Options ── */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
          {options.map((opt) => {
            const selected        = selections[opt.id] ?? [];
            const isMultiple      = opt.isMultiple;
            const hasError        = !!errors[opt.id];

            return (
              <div key={opt.id}>
                {/* Option header */}
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="font-semibold text-gray-900 text-sm flex-1">{opt.name}</span>
                  {/* Badge tipo */}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isMultiple
                    ? "bg-blue-50 text-blue-600"
                    : "bg-gray-100 text-gray-500"}`}>
                    {isMultiple ? "Multipla" : "Singola"}
                  </span>
                  {/* Badge obbligatorio */}
                  {opt.isRequired
                    ? <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-50 text-red-500">Obbligatoria</span>
                    : <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-50 text-green-600">Opzionale</span>}
                </div>

                {/* Choices */}
                <div className="space-y-1.5">
                  {opt.choices.map((choice) => {
                    const active = selected.includes(choice.id);
                    const hasExtra = choice.priceModifierCents > 0;

                    return (
                      <button
                        key={choice.id}
                        type="button"
                        onClick={() => toggleChoice(opt.id, choice.id, isMultiple)}
                        className={`w-full flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-all ${
                          active
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Checkbox / radio indicator */}
                          <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                            active ? "border-green-500 bg-green-500" : "border-gray-300"
                          }`}>
                            {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>

                          <span className={`text-sm font-medium truncate ${active ? "text-green-800" : "text-gray-800"}`}>
                            {choice.name}
                          </span>

                          {/* Badge predefinita */}
                          {choice.isDefault && (
                            <span className="shrink-0 text-xs px-1.5 py-0.5 rounded-md bg-yellow-50 text-yellow-600 font-medium flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5" /> default
                            </span>
                          )}
                        </div>

                        {/* Sovrapprezzo */}
                        {hasExtra ? (
                          <span className={`text-xs font-semibold shrink-0 ml-2 ${active ? "text-green-700" : "text-gray-500"}`}>
                            +€{(choice.priceModifierCents / 100).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 shrink-0 ml-2">incluso</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Errore validazione */}
                {hasError && (
                  <p className="text-xs text-red-500 mt-1.5 ml-1">{errors[opt.id]}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 pb-5 pt-4 border-t border-gray-100 shrink-0 space-y-3">
          {/* Riepilogo selezioni */}
          {Object.values(selections).some((arr) => arr.length > 0) && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Riepilogo</p>
              {options.map((opt) => {
                const chosen = (selections[opt.id] ?? []).map((id) => opt.choices.find((c) => c.id === id)?.name).filter(Boolean);
                if (!chosen.length) return null;
                return (
                  <div key={opt.id} className="flex items-baseline gap-1.5 text-xs">
                    <span className="text-gray-500 font-medium shrink-0">{opt.name}:</span>
                    <span className="text-gray-800">{chosen.join(", ")}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sovrapprezzo totale + bottoni */}
          <div className="flex items-center gap-3">
            <Button variant="outline" className="flex-1 h-12" onClick={onClose}>
              Annulla
            </Button>
            <button
              onClick={handleConfirm}
              className="flex-1 h-12 bg-gray-900 hover:bg-green-600 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              Aggiungi
              {extraCents > 0
                ? <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs">+€{(extraCents / 100).toFixed(2)}</span>
                : null}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}