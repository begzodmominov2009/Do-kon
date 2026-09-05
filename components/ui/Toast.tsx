"use client";

import { useEffect } from "react";
import { Check, X } from "lucide-react";
import { create } from "zustand";

type ToastState = {
  message: string | null;
  show: (message: string) => void;
  hide: () => void;
};

const useToastStore = create<ToastState>((set) => ({
  message: null,
  show: (message) => set({ message }),
  hide: () => set({ message: null }),
}));

export function useToast() {
  return useToastStore((state) => state.show);
}

export function ToastViewport() {
  const message = useToastStore((state) => state.message);
  const hide = useToastStore((state) => state.hide);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(hide, 3000);
    return () => clearTimeout(timer);
  }, [message, hide]);

  if (!message) return null;

  return (
    <div
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
      role="status"
    >
      <div className="flex items-center gap-2 rounded-chip border border-border bg-surface px-4 py-3 shadow-lg">
        <Check className="h-4 w-4 shrink-0 text-success" />
        <span className="text-sm text-text">{message}</span>
        <button
          type="button"
          onClick={hide}
          aria-label="close"
          className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center text-text-muted"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
