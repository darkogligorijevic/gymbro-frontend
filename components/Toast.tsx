'use client';
import { useEffect } from 'react';
import { Icons } from './Icons';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({ id, type, message, duration = 5000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const icons = {
    success: <Icons.Check className="w-5 h-5" />,
    error: <Icons.AlertCircle className="w-5 h-5" />,
    warning: <Icons.AlertCircle className="w-5 h-5" />,
    info: <Icons.FileText className="w-5 h-5" />,
  };

  const styles = {
    success: 'bg-green-500/10 border-green-500/50 text-green-500',
    error: 'bg-red-500/10 border-red-500/50 text-red-500',
    warning: 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500',
    info: 'bg-blue-500/10 border-blue-500/50 text-blue-500',
  };

  return (
    <div
      className={`
        ${styles[type]}
        border-2 rounded-xl p-4 mb-3 shadow-2xl backdrop-blur-xl
        flex items-start gap-3 animate-slide-in-right
        max-w-md w-full
      `}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <p className="flex-1 text-white text-sm leading-relaxed">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onClose }: { toasts: ToastProps[]; onClose: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-end">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </div>
    </div>
  );
}