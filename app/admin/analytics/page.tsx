import React, { Suspense } from 'react';
import { getAnalyticsSummary } from '@/lib/queries/analytics';
import { AnalyticsFilterBar } from './AnalyticsFilterBar';
import { BarChart3, Eye, Users, Smartphone, Monitor, Globe, Filter } from 'lucide-react';

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; device?: string; path?: string }>;
}) {
  const params = await searchParams;
  const range = params.range || 'all';
  const device = params.device || 'all';
  const path = params.path || 'all';

  const analytics = await getAnalyticsSummary({
    timeRange: range as any,
    deviceType: device as any,
    path,
  });

  const mobileCount = analytics.deviceStats.find((d) => d.deviceType === 'mobile')?.views || 0;
  const desktopCount = analytics.deviceStats.find((d) => d.deviceType === 'desktop')?.views || 0;
  const totalDeviceCount = mobileCount + desktopCount || 1;
  const mobilePct = Math.round((mobileCount / totalDeviceCount) * 100);
  const desktopPct = Math.round((desktopCount / totalDeviceCount) * 100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[#2ECC8F]" />
          <span>إحصائيات الترافيك والزيارات المتقدمة</span>
        </h1>
        <p className="text-xs text-gray-400">تحليل وتصفية زوار الموقع بحسب الوقت، الأجهزة، والصفحات دون الحاجة لأي أدوات خارجية</p>
      </div>

      {/* Advanced Filter Control Bar */}
      <Suspense fallback={null}>
        <AnalyticsFilterBar availablePaths={analytics.availablePaths} />
      </Suspense>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-semibold block mb-1">المشاهدات المفلترة (Page Views)</span>
            <span className="text-3xl font-black text-white">{analytics.totalViews}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-semibold block mb-1">الزوار الفريدين (Unique Sessions)</span>
            <span className="text-3xl font-black text-[#2ECC8F]">{analytics.uniqueSessions}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-[#2ECC8F] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-semibold block mb-1">نسبة الأجهزة (Device Ratio)</span>
            <span className="text-sm font-black text-white">📱 {mobilePct}% | 💻 {desktopPct}%</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Smartphone className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Top Visited Pages & Realtime Visits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/10 space-y-4">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#2ECC8F]" />
            <span>أكثر الصفحات زيارة (حسب الفلترة)</span>
          </h2>

          {analytics.topPages.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">لا توجد زيارات تطابق فلاتر البحث الحالية</p>
          ) : (
            <div className="space-y-3">
              {analytics.topPages.map((page, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 text-xs">
                  <span className="font-mono text-gray-300 truncate max-w-xs">{page.path}</span>
                  <span className="font-bold text-[#2ECC8F] bg-[#2ECC8F]/10 px-2.5 py-1 rounded-md">
                    {page.views} مشاهدة
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Realtime Visits Table */}
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/10 space-y-4">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-400" />
            <span>سجل الزيارات المفلترة المباشرة</span>
          </h2>

          {analytics.recentViews.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">لا توجد زيارات مطابقة للبحث</p>
          ) : (
            <div className="space-y-3">
              {analytics.recentViews.map((rv, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 text-xs">
                  <div>
                    <span className="font-mono text-white block">{rv.path}</span>
                    <span className="text-[10px] text-gray-400">
                      {rv.deviceType === 'mobile' ? '📱 موبايل' : '💻 ديسكتوب'} • {new Date(rv.createdAt).toLocaleTimeString('ar-EG')}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                    {rv.country || 'EG'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
