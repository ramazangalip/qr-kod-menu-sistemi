'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, X, Sparkles } from 'lucide-react';

interface CallWaiterToastProps {
  isVisible: boolean;
  onClose: () => void;
  tableNumber: string;
}

export const CallWaiterToast: React.FC<CallWaiterToastProps> = ({
  isVisible,
  onClose,
  tableNumber,
}) => {
  const [seconds, setSeconds] = useState<number>(30);

  useEffect(() => {
    if (!isVisible) {
      setSeconds(30);
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed top-4 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
        <motion.div
          initial={{ y: -50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -50, opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-stone-900 text-white rounded-2xl p-4 shadow-2xl border border-stone-800 pointer-events-auto flex items-center justify-between gap-3 backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 rounded-xl bg-emerald-600 text-white shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Servis Personeline Bildirildi</span>
              </div>
              <p className="text-xs text-stone-200 font-medium mt-0.5">
                <strong className="text-white font-semibold">{tableNumber}</strong> için garson yönlendirildi ({seconds}s)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
