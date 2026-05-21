// src/components/client/cart/NoteModal.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { X, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_CHARS = 200;

interface NoteModalProps {
  isOpen:    boolean;
  itemName:  string;
  /** Nota attuale già salvata (pre-riempie il textarea) */
  initialNote: string;
  onClose:   () => void;
  onSave:    (note: string) => void;
}

export default function NoteModal({
  isOpen,
  itemName,
  initialNote,
  onClose,
  onSave,
}: NoteModalProps) {
  const [text, setText]     = useState("");
  const textareaRef         = useRef<HTMLTextAreaElement>(null);

  // Precompila il testo ogni volta che il modal si apre
  useEffect(() => {
    if (!isOpen) return;
    setText(initialNote ?? "");
    // Focus automatico sul textarea
    setTimeout(() => textareaRef.current?.focus(), 80);
  }, [isOpen, initialNote]);

  if (!isOpen) return null;

  const remaining = MAX_CHARS - text.length;

  const handleSave = () => {
    onSave(text.trim());
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
              <StickyNote className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-500 leading-none mb-0.5">
                Nota personalizzata
              </p>
              <h2 className="text-base font-bold text-gray-900 leading-tight line-clamp-1">
                {itemName}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all ml-2 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-2">
          <p className="text-xs text-gray-500">
            Scrivi preferenze specifiche per questo piatto (es. "senza cipolla", "cottura media", "allergie").
          </p>
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
              onKeyDown={handleKeyDown}
              rows={4}
              placeholder="Es. senza cipolla, poco sale, allergia al glutine..."
              className="w-full resize-none rounded-xl border-2 border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none px-4 py-3 text-sm text-gray-800 placeholder-gray-400 transition-all"
            />
            {/* Contatore caratteri */}
            <span
              className={`absolute bottom-3 right-3 text-xs tabular-nums ${
                remaining < 20 ? "text-red-400 font-semibold" : "text-gray-400"
              }`}
            >
              {remaining}
            </span>
          </div>

          {/* Chip "rimuovi nota" se c'è già del testo salvato */}
          {initialNote && (
            <button
              onClick={() => setText("")}
              className="text-xs text-red-400 hover:text-red-600 underline underline-offset-2 transition-colors"
            >
              Rimuovi nota esistente
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-2 flex gap-3">
          <Button variant="outline" className="flex-1 h-11" onClick={onClose}>
            Annulla
          </Button>
          <button
            onClick={handleSave}
            className="flex-1 h-11 bg-gray-900 hover:bg-amber-500 text-white rounded-xl font-semibold text-sm transition-all"
          >
            Salva nota
          </button>
        </div>

      </div>
    </div>
  );
}