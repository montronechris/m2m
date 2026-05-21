// src/hooks/useToast.ts

import { useState, useCallback } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastState {
  show: boolean;
  message: string;
  type: ToastType;
}

interface UseToastReturn {
  toast: ToastState;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

export function useToast(): UseToastReturn {
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: "",
    type: "info",
  });

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  return { toast, showToast, hideToast };
}