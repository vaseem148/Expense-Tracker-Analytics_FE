import { create } from 'zustand';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: 'success' | 'error' | 'info' | 'warning';
  duration: number;
}

interface ToastState {
  toasts: Toast[];
  push: (toast: Omit<Toast, 'id' | 'duration'> & { duration?: number }) => string;
  dismiss: (id: string) => void;
}

export const useToasts = create<ToastState>((set, get) => ({
  toasts: [],
  push: (toast) => {
    const id = Math.random().toString(36).slice(2);
    const duration = toast.duration ?? (toast.variant === 'error' ? 6000 : 3800);
    set({ toasts: [...get().toasts, { ...toast, id, duration }] });
    window.setTimeout(() => get().dismiss(id), duration);
    return id;
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

export const toast = {
  success: (title: string, description?: string) =>
    useToasts.getState().push({ title, description, variant: 'success' }),
  error: (title: string, description?: string) =>
    useToasts.getState().push({ title, description, variant: 'error' }),
  info: (title: string, description?: string) =>
    useToasts.getState().push({ title, description, variant: 'info' }),
  warning: (title: string, description?: string) =>
    useToasts.getState().push({ title, description, variant: 'warning' }),
};
