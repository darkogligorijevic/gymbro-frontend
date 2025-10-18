'use client';
import { useEffect } from 'react';
import { Icons } from './Icons';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  showCancel?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
  showCancel = true,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const icons = {
    danger: <Icons.AlertCircle className="w-12 h-12 text-red-500" />,
    warning: <Icons.AlertCircle className="w-12 h-12 text-yellow-500" />,
    info: <Icons.FileText className="w-12 h-12 text-blue-500" />,
  };

  const confirmButtonStyles = {
    danger: 'bg-red-500 hover:bg-red-600',
    warning: 'bg-yellow-500 hover:bg-yellow-600',
    info: 'bg-primary-500 hover:bg-primary-600',
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-dark-300 rounded-2xl shadow-2xl border-2 border-dark-200 max-w-md w-full animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-8">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            {icons[type]}
          </div>
          
          {/* Title */}
          <h3 className="text-xl sm:text-2xl font-bold text-white text-center mb-3">
            {title}
          </h3>
          
          {/* Message */}
          <p className="text-gray-300 text-center text-sm sm:text-base mb-6 leading-relaxed whitespace-pre-line">
            {message}
          </p>
          
          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            {showCancel && (
              <button
                onClick={onClose}
                className="flex-1 bg-dark-200 hover:bg-dark-100 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={() => {
                onConfirm?.();
                onClose();
              }}
              className={`flex-1 ${confirmButtonStyles[type]} text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<Omit<ModalProps, 'isOpen' | 'onClose'>>({
    title: '',
    message: '',
  });

  const show = (newConfig: Omit<ModalProps, 'isOpen' | 'onClose'>) => {
    setConfig(newConfig);
    setIsOpen(true);
  };

  const hide = () => {
    setIsOpen(false);
  };

  return { isOpen, config, show, hide };
}

import { useState } from 'react';