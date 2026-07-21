import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastNotification } from '../types';

interface ToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const bgColors = {
            success: 'bg-white/95 border-emerald-200 text-slate-800',
            error: 'bg-white/95 border-rose-200 text-slate-800',
            warning: 'bg-white/95 border-amber-200 text-slate-800',
            info: 'bg-white/95 border-indigo-200 text-slate-800',
          };

          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
            error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
            info: <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />,
          };

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={`pointer-events-auto flex items-start justify-between p-4 rounded-2xl border shadow-xl backdrop-blur-md ${bgColors[toast.type]}`}
            >
              <div className="flex items-start gap-3">
                {icons[toast.type]}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 leading-tight">{toast.title}</h4>
                  {toast.message && (
                    <p className="text-xs font-medium text-slate-600 mt-1 leading-normal">{toast.message}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => onDismiss(toast.id)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
