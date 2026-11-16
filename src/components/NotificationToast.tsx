import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { cn } from '../lib/utils'; // Assuming standard cn helper exists or I'll create a simple one if not.

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationToastProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ message, type, onClose }) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    error: <XCircle className="w-5 h-5 text-rose-600" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
  };

  const colors = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    error: 'bg-rose-50 border-rose-200 text-rose-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={cn(
        "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border-2 shadow-lg backdrop-blur-sm max-w-xs md:max-w-md",
        colors[type]
      )}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <p className="text-sm font-bold leading-tight flex-1">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4 opacity-50" />
      </button>
    </motion.div>
  );
};
