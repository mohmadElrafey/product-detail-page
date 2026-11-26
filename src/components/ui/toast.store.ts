import { create } from 'zustand'

export interface Toast {
  id: number
  message: string
  action?: { label: string; onClick: () => void }
}

interface ToastStore {
  toasts: Toast[]
  show: (toast: Omit<Toast, 'id'>, durationMs?: number) => void
  dismiss: (id: number) => void
}

let nextId = 1

export const useToastStore = create<ToastStore>()((set, get) => ({
  toasts: [],
  show: (toast, durationMs = 3500) => {
    const id = nextId++
    // Keep at most 3 on screen; newest last.
    set((state) => ({ toasts: [...state.toasts.slice(-2), { ...toast, id }] }))
    window.setTimeout(() => get().dismiss(id), durationMs)
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}))

/** Imperative helper usable outside React components (e.g. inside event handlers). */
export const toast = (message: string, action?: Toast['action']) =>
  useToastStore.getState().show({ message, action })
