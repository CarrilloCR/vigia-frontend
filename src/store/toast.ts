import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: { label: string; onClick: () => void }
}

interface ToastState {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearAll: () => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

let counter = 0

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${++counter}-${Date.now()}`
    const newToast: Toast = { ...toast, id, duration: toast.duration ?? 4500 }
    set((state) => ({ toasts: [...state.toasts, newToast] }))
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
      }, newToast.duration)
    }
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  clearAll: () => set({ toasts: [] }),
  success: (title, message) =>
    set((state) => {
      const id = `toast-${++counter}-${Date.now()}`
      const t: Toast = { id, type: 'success', title, message, duration: 4500 }
      setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 4500)
      return { toasts: [...state.toasts, t] }
    }),
  error: (title, message) =>
    set((state) => {
      const id = `toast-${++counter}-${Date.now()}`
      const t: Toast = { id, type: 'error', title, message, duration: 6000 }
      setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 6000)
      return { toasts: [...state.toasts, t] }
    }),
  warning: (title, message) =>
    set((state) => {
      const id = `toast-${++counter}-${Date.now()}`
      const t: Toast = { id, type: 'warning', title, message, duration: 5000 }
      setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 5000)
      return { toasts: [...state.toasts, t] }
    }),
  info: (title, message) =>
    set((state) => {
      const id = `toast-${++counter}-${Date.now()}`
      const t: Toast = { id, type: 'info', title, message, duration: 4000 }
      setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 4000)
      return { toasts: [...state.toasts, t] }
    }),
}))
