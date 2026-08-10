'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CheckCircle2, X } from 'lucide-react';

const mockOrders = [
  { name: 'أحمد مصطفى', location: 'القاهرة', pkg: 'الباقة الشاملة VIP', time: 'منذ دقيقتين' },
  { name: 'محمود السيد', location: 'الإسكندرية', pkg: 'باقة الأدوات الـ 12', time: 'منذ 5 دقائق' },
  { name: 'سارة حسن', location: 'الجيزة', pkg: 'الباقة الشاملة VIP', time: 'منذ 8 دقائق' },
  { name: 'عمر الفاروق', location: 'الشرقية', pkg: 'كورس التسويق الكامل', time: 'منذ 12 دقيقة' },
  { name: 'خالد عبد الوهاب', location: 'أسيوط', pkg: 'الباقة الشاملة VIP', time: 'منذ 15 دقيقة' },
];

export const LiveSalesToast: React.FC = () => {
  const [currentToast, setCurrentToast] = useState<typeof mockOrders[0] | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let index = 0;
    let hideTimer: NodeJS.Timeout;

    const interval = setInterval(() => {
      setCurrentToast(mockOrders[index % mockOrders.length]);
      setIsVisible(true);

      // Hide after 5 seconds
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      index++;
    }, 14000); // Trigger every 14 seconds

    return () => {
      clearInterval(interval);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  if (!currentToast) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -30, y: 10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -30, y: 10 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-20 sm:bottom-6 left-3 sm:left-6 z-40 max-w-[calc(100vw-1.5rem)] sm:max-w-xs w-full bg-white rounded-2xl p-2.5 sm:p-3.5 shadow-2xl border border-gray-200/90 flex items-center justify-between gap-2.5 text-right dir-rtl overflow-hidden pointer-events-auto"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0F9D58]/10 text-[#0F9D58] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#0F9D58]" />
            </div>

            <div className="text-xs space-y-0.5 min-w-0">
              <div className="flex items-center gap-1 min-w-0">
                <span className="font-extrabold text-[#0B1220] truncate text-xs">{currentToast.name}</span>
                <span className="text-[10px] text-gray-400 shrink-0">({currentToast.location})</span>
              </div>
              <p className="text-[11px] text-[#0F9D58] font-black truncate">{currentToast.pkg}</p>
              <span className="text-[9px] text-gray-400 block shrink-0">{currentToast.time} • تم التفعيل بنجاح</span>
            </div>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
            aria-label="إغلاق"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
