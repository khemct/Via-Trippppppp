import { useEffect, useRef } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', cancelText = 'Cancel', danger = true }) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (isOpen && confirmRef.current) confirmRef.current.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card border border-line rounded-2xl shadow-soft-lg p-6 w-full max-w-sm mx-4 animate-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-line/60 text-muted transition-all"
        >
          <X size={14} />
        </button>

        <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${danger ? 'bg-red-50 text-red-500' : 'bg-brand-light/60 text-brand-text'}`}>
          <AlertTriangle size={22} />
        </div>

        <h3 className="text-base font-semibold text-heading mb-1">{title}</h3>
        <p className="text-sm text-muted mb-5 leading-relaxed">{message}</p>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 border border-line-strong rounded-xl px-4 py-2.5 text-sm font-medium text-body hover:bg-input transition-all"
          >
            {cancelText}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-all ${
              danger
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-brand hover:bg-brand-hover'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
