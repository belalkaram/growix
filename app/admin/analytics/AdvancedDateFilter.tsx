'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, Calendar, Clock, RotateCcw, Smartphone, Globe, Sparkles } from 'lucide-react';

interface AdvancedDateFilterProps {
  availablePaths?: string[];
}

export const AdvancedDateFilter: React.FC<AdvancedDateFilterProps> = ({ availablePaths = [] }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentRange = searchParams.get('range') || 'all';
  const currentDevice = searchParams.get('device') || 'all';
  const currentPath = searchParams.get('path') || 'all';
  const currentStartDate = searchParams.get('startDate') || '';
  const currentStartTime = searchParams.get('startTime') || '00:00';
  const currentEndDate = searchParams.get('endDate') || '';
  const currentEndTime = searchParams.get('endTime') || '23:59';

  const [range, setRange] = useState(currentRange);
  const [device, setDevice] = useState(currentDevice);
  const [path, setPath] = useState(currentPath);
  const [startDate, setStartDate] = useState(currentStartDate);
  const [startTime, setStartTime] = useState(currentStartTime);
  const [endDate, setEndDate] = useState(currentEndDate);
  const [endTime, setEndTime] = useState(currentEndTime);
  const [showCustom, setShowCustom] = useState(currentRange === 'custom' || Boolean(currentStartDate));

  const applyFilters = (customOverride?: Partial<{
    range: string;
    device: string;
    path: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
  }>) => {
    const params = new URLSearchParams();

    const finalRange = customOverride?.range ?? range;
    const finalDevice = customOverride?.device ?? device;
    const finalPath = customOverride?.path ?? path;
    const finalStartDate = customOverride?.startDate ?? startDate;
    const finalStartTime = customOverride?.startTime ?? startTime;
    const finalEndDate = customOverride?.endDate ?? endDate;
    const finalEndTime = customOverride?.endTime ?? endTime;

    if (finalRange !== 'all') params.set('range', finalRange);
    if (finalDevice !== 'all') params.set('device', finalDevice);
    if (finalPath !== 'all') params.set('path', finalPath);

    if (finalRange === 'custom' && finalStartDate) {
      params.set('startDate', finalStartDate);
      if (finalStartTime) params.set('startTime', finalStartTime);
      if (finalEndDate) params.set('endDate', finalEndDate);
      if (finalEndTime) params.set('endTime', finalEndTime);
    }

    router.push(`/admin/analytics?${params.toString()}`);
  };

  const handleReset = () => {
    setRange('all');
    setDevice('all');
    setPath('all');
    setStartDate('');
    setStartTime('00:00');
    setEndDate('');
    setEndTime('23:59');
    setShowCustom(false);
    router.push('/admin/analytics');
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-[#0F172A] border border-white/10 space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[#2ECC8F]" />
          <h2 className="text-sm font-black text-white">نظام الفلترة الديناميكي الشامل (Advanced Dynamic Filter)</h2>
        </div>

        <button
          onClick={handleReset}
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>إعادة تعيين الفلاتر</span>
        </button>
      </div>

      {/* Main Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Time Range */}
        <div>
          <label className="block text-[11px] font-bold text-gray-300 mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#2ECC8F]" />
            <span>الفترة الزمنية</span>
          </label>
          <select
            value={range}
            onChange={(e) => {
              const val = e.target.value;
              setRange(val);
              if (val === 'custom') {
                setShowCustom(true);
              } else {
                setShowCustom(false);
                applyFilters({ range: val });
              }
            }}
            className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-[#2ECC8F] cursor-pointer"
          >
            <option value="all" className="bg-[#0F172A]">كل الفترات (All Time)</option>
            <option value="today" className="bg-[#0F172A]">اليوم فقط (Today)</option>
            <option value="yesterday" className="bg-[#0F172A]">أمس (Yesterday)</option>
            <option value="7days" className="bg-[#0F172A]">آخر 7 أيام (Last 7 Days)</option>
            <option value="30days" className="bg-[#0F172A]">آخر 30 يوماً (Last 30 Days)</option>
            <option value="month" className="bg-[#0F172A]">الشهر الحالي (This Month)</option>
            <option value="year" className="bg-[#0F172A]">السنة الحالية (This Year)</option>
            <option value="custom" className="bg-[#0F172A]">نطاق تاريخ ووقت مخصص (Custom Range)</option>
          </select>
        </div>

        {/* 2. Device Filter */}
        <div>
          <label className="block text-[11px] font-bold text-gray-300 mb-1 flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-[#2ECC8F]" />
            <span>نوع الجهاز</span>
          </label>
          <select
            value={device}
            onChange={(e) => {
              setDevice(e.target.value);
              applyFilters({ device: e.target.value });
            }}
            className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-[#2ECC8F] cursor-pointer"
          >
            <option value="all" className="bg-[#0F172A]">جميع الأجهزة</option>
            <option value="mobile" className="bg-[#0F172A]">موبايل فقط (Mobile)</option>
            <option value="desktop" className="bg-[#0F172A]">كمبيوتر فقط (Desktop)</option>
          </select>
        </div>

        {/* 3. Page Path Filter */}
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-bold text-gray-300 mb-1 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-[#2ECC8F]" />
            <span>الصفحة المحددة</span>
          </label>
          <select
            value={path}
            onChange={(e) => {
              setPath(e.target.value);
              applyFilters({ path: e.target.value });
            }}
            className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-[#2ECC8F] cursor-pointer"
          >
            <option value="all" className="bg-[#0F172A]">جميع صفحات ومسارات الموقع</option>
            {availablePaths.map((p) => (
              <option key={p} value={p} className="bg-[#0F172A]">
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Custom Date & Time Range Panel */}
      {showCustom && (
        <div className="p-4 rounded-2xl bg-white/5 border border-[#2ECC8F]/30 space-y-3 pt-4">
          <div className="text-xs font-bold text-[#2ECC8F] flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>تحديد نطاق دقيق بالتاريخ والوقت (من / إلى):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-gray-400 mb-1">من تاريخ (Start Date)</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-white/10 text-white focus:outline-none focus:border-[#2ECC8F]"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">من وقت (Start Time)</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-white/10 text-white focus:outline-none focus:border-[#2ECC8F]"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">إلى تاريخ (End Date)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-white/10 text-white focus:outline-none focus:border-[#2ECC8F]"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">إلى وقت (End Time)</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-white/10 text-white focus:outline-none focus:border-[#2ECC8F]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => applyFilters({ range: 'custom' })}
              className="px-6 py-2.5 rounded-xl bg-[#00FF87] hover:bg-[#00E676] text-[#0A1128] font-black text-xs shadow-md cursor-pointer transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>تطبيق النطاق المخصص الآن</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
