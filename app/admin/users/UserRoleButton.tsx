'use client';

import React, { useState } from 'react';
import { updateUserRole } from '@/lib/actions/users';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

export const UserRoleButton: React.FC<{ userId: string; currentRole: string }> = ({ userId, currentRole }) => {
  const [loading, setLoading] = useState(false);

  const toggleRole = async () => {
    setLoading(true);
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    await updateUserRole(userId, newRole);
    setLoading(false);
    window.location.reload();
  };

  return (
    <button
      type="button"
      onClick={toggleRole}
      disabled={loading}
      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all ${
        currentRole === 'admin' 
          ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30'
          : 'bg-[#0F9D58]/10 hover:bg-[#0F9D58]/20 text-[#2ECC8F] border border-[#0F9D58]/30'
      }`}
    >
      {currentRole === 'admin' ? (
        <>
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>تغيير إلى مستخدم</span>
        </>
      ) : (
        <>
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>ترقية لأدمن</span>
        </>
      )}
    </button>
  );
};
