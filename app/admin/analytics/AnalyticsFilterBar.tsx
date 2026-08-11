'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, Calendar, Smartphone, Globe, RefreshCw } from 'lucide-react';

interface AnalyticsFilterBarProps {
  availablePaths: string[];
}

export const AnalyticsFilterBar: React.FC<AnalyticsFilterBarProps> = ({ availablePaths }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const timeRange = searchParams.get('range') || 'all';
  const deviceType = searchParams.get('device') || 'all';
  const selectedPath = searchParams.get('path') || 'all';

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/admin/analytics?${params.toString()}`);
  };

  const resetFilters = () => {
    router.push('/admin/analytics');
  };

  const hasActiveFilters = timeRange !== 'all' || deviceType !== 'all' || selectedPath !== 'all';

  return (
    <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-extrabold text-sm">
          <Filter className="w-4 h-4 text-[#2ECC8F]" />
          <span>فلترة وتصنيف الإحصائيات المتقدم:</span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>إعادة ضبط الفلاتر</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Time Range Filter */}
        <div>
          <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#2ECC8F]" />
            <span>الفترة الزمنية</span>
          </label>
          <select
            value={timeRange}
            onChange={(e) => updateFilters('range', e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-[#2ECC8F]"
          >
            <option value="all" className="bg-[#0F172A] text-white">كل الأوقات (All Time)</option>
            <option value="today" className="bg-[#0F172A] text-white">اليوم فقط (Today)</option>
            <option value="7days" className="bg-[#0F172A] text-white">آخر 7 أيام (Last 7 Days)</option>
            <option value="30days" className="bg-[#0F172A] text-white">آخر 30 يوم (Last 30 Days)</option>
          </select>
        </div>

        {/* Device Type Filter */}
        <div>
          <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-[#2ECC8F]" />
            <span>نوع الجهاز والمصفح</span>
          </label>
          <select
            value={deviceType}
            onChange={(e) => updateFilters('device', e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-[#2ECC8F]"
          >
            <option value="all" className="bg-[#0F172A] text-white">جميع الأجهزة (Mobile & Desktop)</option>
            <option value="desktop" className="bg-[#0F172A] text-white">💻 كمبيوتر / ديسكتوب (Desktop)</option>
            <option value="mobile" className="bg-[#0F172A] text-white">📱 هاتف محمول / موبايل (Mobile)</option>
          </select>
        </div>

        {/* Path Filter */}
        <div>
          <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#2ECC8F]" />
            <span>فلترة برابط الصفحة (Path)</span>
          </label>
          <select
            value={selectedPath}
            onChange={(e) => updateFilters('path', e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-[#2ECC8F]"
          >
            <option value="all" className="bg-[#0F172A] text-white">جميع الصفحات والمجالات</option>
            <option value="/" className="bg-[#0F172A] text-white">الرئيسية (/)</option>
            <option value="/checkout" className="bg-[#0F172A] text-white">صفحة الاشتراك والشراء (/checkout)</option>
            {availablePaths
              .filter((p) => p !== '/' && p !== '/checkout')
              .map((p) => (
                <option key={p} value={p} className="bg-[#0F172A] text-white">
                  {p}
                </option>
              ))}
          </select>
        </div>
      </div>
    </div>
  );
};
