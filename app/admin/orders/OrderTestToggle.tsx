'use client';

import React, { useState } from 'react';
import { toggleOrderTestAction } from '@/lib/actions/orders';
import { Beaker, CheckCircle } from 'lucide-react';

export const OrderTestToggle: React.FC<{ orderId: string; initialIsTest: boolean }> = ({
  orderId,
  initialIsTest,
}) => {
  const [isTest, setIsTest] = useState(initialIsTest);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    const next = !isTest;
    const res = await toggleOrderTestAction(orderId, next);
    setLoading(false);
    if (res.success) {
      setIsTest(next);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      title={
        isTest
          ? 'هذا الطلب تجريبي ومستبعد من إيرادات المتجر. انقر لتحويله لطلب حقيقي.'
          : 'هذا الطلب حقيقي ومحسوب ضمن الأرباح. انقر لتحويله لطلب تجريبي.'
      }
      className={`px-2 py-0.5 rounded-md text-[10px] font-black border transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
        isTest
          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30'
          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
      }`}
    >
      {isTest ? (
        <>
          <Beaker className="w-3 h-3 text-purple-300" />
          <span>تجريبي (Test)</span>
        </>
      ) : (
        <>
          <CheckCircle className="w-3 h-3 text-emerald-400" />
          <span>حقيقي (Live)</span>
        </>
      )}
    </button>
  );
};
