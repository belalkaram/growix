import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#0B1220] text-white flex flex-col items-center justify-center p-4 dir-rtl">
      {/* Top Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-growix-gradient animate-loader-pulse shadow-[0_0_20px_#2ECC8F]" />

      <div className="text-center space-y-4 max-w-sm mx-auto p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
        <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-[#0F9D58]/20 border-t-[#2ECC8F] animate-spin" />
          <Loader2 className="w-8 h-8 text-[#2ECC8F] animate-spin" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-white flex items-center justify-center gap-1.5">
            <span>GROWIX</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </h3>
          <p className="text-xs text-gray-300 font-bold">جاري تحميل الصفحة والمحتوى...</p>
        </div>
      </div>
    </div>
  );
}
