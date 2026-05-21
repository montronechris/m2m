// src/components/admin/ui/Toast.tsx

"use client";

import { CheckCircle, AlertCircle, Sparkles, X } from "lucide-react";
import { ToastType } from "@/hooks/useToast";

interface ToastProps {
  show: boolean;
  message: string;
  type: ToastType;
  onClose: () => void;
}

export function Toast({ show, message, type, onClose }: ToastProps) {
  if (!show) return null;

  const styles = {
    success: "bg-green-500/10 border-green-500/30 text-green-400",
    error: "bg-red-500/10 border-red-500/30 text-red-400",
    info: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Sparkles className="w-5 h-5" />,
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slide-up ${styles[type]}`}
    >
      {icons[type]}
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 p-1 hover:bg-white/10 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}