'use client';

import React, { useState, useEffect } from 'react';
import { isIosDevice, isStandalonePwa } from '@/lib/push-client';
import { Share, PlusSquare, Smartphone, X } from 'lucide-react';

export const PwaInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Only show for iOS users who haven't installed as standalone PWA yet
    const isIos = isIosDevice();
    const isStandalone = isStandalonePwa();
    const dismissed = localStorage.getItem('growix_pwa_prompt_dismissed');

    if (isIos && !isStandalone && !dismissed) {
      setShowPrompt(true);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('growix_pwa_prompt_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-[#0B1220]/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-white/10 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3 left-3 text-gray-400 hover:text-white transition-colors p-1"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3 pl-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0F9D58] to-[#2ECC8F] flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-[#0F9D58]/30">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">تثبيت تطبيق GROWIX على iPhone</h4>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">
              لتفعيل الإشعارات الفورية وتجربة سريعة كالتطبيق المستقل:
            </p>
            <div className="mt-2 text-xs bg-white/10 rounded-lg p-2 flex items-center gap-1.5 text-gray-200">
              <span>اضغط</span>
              <Share className="w-3.5 h-3.5 text-blue-400 inline" />
              <span>ثم</span>
              <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" />
              <span className="font-medium text-white">"إضافة إلى الشاشة الرئيسية"</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
