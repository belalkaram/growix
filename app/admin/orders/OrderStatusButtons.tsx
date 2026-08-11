'use client';

import React, { useState } from 'react';
import { updateOrderStatusAction } from '@/lib/actions/orders';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export const OrderStatusButtons: React.FC<{ orderId: string; currentStatus: string }> = ({ orderId, currentStatus }) => {
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (newStatus: 'approved' | 'rejected') => {
    setLoading(true);
    await updateOrderStatusAction(orderId, newStatus);
    setLoading(false);
  };

  if (loading) {
    return <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />;
  }

  return (
    <div className="flex items-center gap-2">
      {currentStatus !== 'approved' && (
        <button
          type="button"
          onClick={() => handleUpdate('approved')}
          className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>قبول وتفعيل</span>
        </button>
      )}

      {currentStatus !== 'rejected' && (
        <button
          type="button"
          onClick={() => handleUpdate('rejected')}
          className="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors"
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>رفض</span>
        </button>
      )}
    </div>
  );
};
