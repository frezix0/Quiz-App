import { useState, useCallback } from 'react';
import { ENV } from '../config/env';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback(
        (message: string, type: ToastType = 'info', duration = ENV.UI.TOAST_DURATION) => {
        const id = Date.now().toString();
        const toast: Toast = { id, message, type };

        setToasts((prev) => [...prev, toast]);

        if (duration > 0) {
            setTimeout(() => {
            removeToast(id);
            }, duration);
        }

        return id;
        },
        []
    );

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return {
        toasts,
        addToast,
        removeToast,
        success: (msg: string) => addToast(msg, 'success'),
        error: (msg: string) => addToast(msg, 'error'),
        warning: (msg: string) => addToast(msg, 'warning'),
        info: (msg: string) => addToast(msg, 'info'),
    };
}