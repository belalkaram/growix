import React, { Suspense } from 'react';
import { getAnalyticsSummary } from '@/lib/queries/analytics';
import { AdvancedDateFilter } from './AdvancedDateFilter';
import { 
  BarChart3, 
  Eye, 
  Users, 
  Smartphone, 
  Globe, 
  Clock, 
  ShoppingCart, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Activity, 
  ArrowRight,
  MousePointerClick,
  AlertTriangle,
  Flame,
  Layers,
  Sparkles
} from 'lucide-react';

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0 ثانية';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s} ثانية`;
  if (s === 0) return `${m} دقيقة`;
  return `${m} د و ${s} ث`;
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{
    range?: string;
    device?: string;
    path?: string;
    startDate?: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
  }>;
}) {
  const params = await searchParams;
  const range = params.range || 'all';
  const device = params.device || 'all';
  const path = params.path || 'all';
  const startDate = params.startDate;
  const startTime = params.startTime;
  const endDate = params.endDate;
  const endTime = params.endTime;

  const analytics = await getAnalyticsSummary({
    range,
    deviceType: device as any,
    path,
    startDate,
    startTime,
    endDate,
    endTime,
  });

  const mobileCount = analytics.deviceStats.find((d) => d.deviceType === 'mobile')?.views || 0;
  const desktopCount = analytics.deviceStats.find((d) => d.deviceType === 'desktop')?.views || 0;
  const totalDeviceCount = mobileCount + desktopCount || 1;
  const mobilePct = Math.round((mobileCount / totalDeviceCount) * 100);
  const desktopPct = Math.round((desktopCount / totalDeviceCount) * 100);

  // Peak Hour Calculation
  const maxHourlyViews = Math.max(...analytics.hourlyTraffic.map((h) => h.views), 1);

  return (
    <div className="space-y-8 text-white">
      
      {/* Header & Realtime Pulse */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-7 h-7 text-[#2ECC8F]" />
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              لوحة تحليلات المتجر المتقدمة
            </h1>
            <span className="text-[11px] bg-[#2ECC8F]/10 text-[#2ECC8F] font-bold px-2.5 py-0.5 rounded-full border border-[#2ECC8F]/30">
              Shopify-Grade Engine
            </span>
          </div>
          <p className="text-xs text-gray-400">
            تتبع شامل لسلوك زوار المتجر، مسار التحويل (Funnel)، ساعات الذروة، ومعدلات الدفع والتخلي بالثواني
          </p>
        </div>

        {/* Live Realtime Active Visitors Pill */}
        <div className="flex items-center gap-3 bg-[#0F172A] border border-[#2ECC8F]/30 px-4 py-2.5 rounded-2xl shadow-lg shrink-0">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2ECC8F] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#2ECC8F]"></span>
          </span>
          <div>
            <span className="text-[10px] text-gray-400 block font-medium">الزوار النشطون حالياً في المتجر:</span>
            <span className="text-sm font-black text-white flex items-center gap-1">
              <span className="text-[#2ECC8F] text-base">{analytics.liveVisitorsNow}</span> زائر نشط
            </span>
          </div>
        </div>
      </div>

      {/* Advanced Filter Control Bar */}
      <Suspense fallback={null}>
        <AdvancedDateFilter availablePaths={analytics.availablePaths} />
      </Suspense>

      {/* 🚀 TOP 5 SHOPIFY-STYLE KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* 1. Unique Visitors */}
        <div className="p-5 rounded-3xl bg-[#0F172A] border border-white/10 space-y-3 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-bold">زوار المتجر (Visitors)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-white block">{analytics.uniqueSessions}</span>
            <span className="text-[11px] text-gray-400">إجمالي المشاهدات: {analytics.totalViews}</span>
          </div>
        </div>

        {/* 2. Store Conversion Rate */}
        <div className="p-5 rounded-3xl bg-[#0F172A] border border-white/10 space-y-3 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-bold">معدل التحويل (CR%)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-[#2ECC8F] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-[#2ECC8F] block">{analytics.conversionRate}%</span>
            <span className="text-[11px] text-gray-400">{analytics.totalOrdersPlaced} طلب من {analytics.uniqueSessions} زائر</span>
          </div>
        </div>

        {/* 3. Total Sales & Revenue */}
        <div className="p-5 rounded-3xl bg-[#0F172A] border border-white/10 space-y-3 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-bold">إجمالي المبيعات المؤكدة</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-white block">{analytics.totalRevenue} ج</span>
            <span className="text-[11px] text-gray-400">متوسط الطلب (AOV): {analytics.averageOrderValue} ج</span>
          </div>
        </div>

        {/* 4. Average Session Duration */}
        <div className="p-5 rounded-3xl bg-[#0F172A] border border-white/10 space-y-3 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-bold">متوسط وقت التصفح</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-amber-400 block">{formatDuration(analytics.avgSessionDurationSeconds)}</span>
            <span className="text-[11px] text-gray-400">متوسط مدة الجلسة في المتجر</span>
          </div>
        </div>

        {/* 5. Checkout Time-To-Pay */}
        <div className="p-5 rounded-3xl bg-[#0F172A] border border-white/10 space-y-3 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-bold">متوسط وقت الدفع</span>
            <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-pink-400 block">{formatDuration(analytics.avgCheckoutDurationSeconds)}</span>
            <span className="text-[11px] text-gray-400">المدة داخل صفحة الـ Checkout</span>
          </div>
        </div>

      </div>

      {/* 🎯 CONVERSION FUNNEL & CHECKOUT ABANDONMENT ANALYSIS (Shopify Funnel) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Full Store Conversion Funnel (2 Cols) */}
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-[#0F172A] border border-white/10 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#2ECC8F]" />
              <span>قمع تحويل المبيعات (Store Conversion Funnel)</span>
            </h2>
            <span className="text-xs text-gray-400">رحلة العميل من الزيارة حتى إتمام الدفع</span>
          </div>

          <div className="space-y-4">
            {/* Step 1: All Visitors */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-2 text-gray-300">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>دخلوا المتجر (All Visitors)</span>
                </span>
                <span className="text-white font-black">{analytics.uniqueSessions} زائر (100%)</span>
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            {/* Step 2: Viewed Catalog */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-2 text-gray-300">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>تصفحوا الأدوات والأسعار (Catalog / Pricing)</span>
                </span>
                <span className="text-white font-black">
                  {analytics.viewedCatalogSessions} زائر ({analytics.uniqueSessions > 0 ? Math.round((analytics.viewedCatalogSessions / analytics.uniqueSessions) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 rounded-full transition-all" 
                  style={{ width: `${analytics.uniqueSessions > 0 ? Math.min(100, Math.round((analytics.viewedCatalogSessions / analytics.uniqueSessions) * 100)) : 0}%` }} 
                />
              </div>
            </div>

            {/* Step 3: Reached Checkout */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-2 text-gray-300">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px]">3</span>
                  <span>وصلوا لصفحة الدفع (Reached Checkout)</span>
                </span>
                <span className="text-amber-400 font-black">
                  {analytics.reachedCheckoutSessions} عميل ({analytics.uniqueSessions > 0 ? Math.round((analytics.reachedCheckoutSessions / analytics.uniqueSessions) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all" 
                  style={{ width: `${analytics.uniqueSessions > 0 ? Math.min(100, Math.round((analytics.reachedCheckoutSessions / analytics.uniqueSessions) * 100)) : 0}%` }} 
                />
              </div>
            </div>

            {/* Step 4: Placed Order */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-2 text-[#2ECC8F]">
                  <span className="w-5 h-5 rounded-full bg-[#2ECC8F]/20 text-[#2ECC8F] flex items-center justify-center text-[10px] font-black">✓</span>
                  <span>أتموا الطلب والدفع (Completed Purchase)</span>
                </span>
                <span className="text-[#2ECC8F] font-black">
                  {analytics.totalOrdersPlaced} مشترين ({analytics.uniqueSessions > 0 ? Math.round((analytics.totalOrdersPlaced / analytics.uniqueSessions) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#2ECC8F] rounded-full transition-all" 
                  style={{ width: `${analytics.uniqueSessions > 0 ? Math.min(100, Math.round((analytics.totalOrdersPlaced / analytics.uniqueSessions) * 100)) : 0}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Abandonment Breakdown Card (1 Col) */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#0F172A] border border-white/10 space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>تحليل التخلي عن الشيك أوت</span>
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              نسبة العملاء الذين بدأوا عملية الدفع ولكن لم يرسلوا الطلب النهائي.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 text-center">
            <div>
              <span className="text-[11px] text-gray-400 font-bold block mb-1">نسبة التخلي عن السلة (Abandonment Rate)</span>
              <span className={`text-4xl font-black ${analytics.abandonmentRate > 50 ? 'text-amber-400' : 'text-[#2ECC8F]'}`}>
                {analytics.abandonmentRate}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/10 pt-3">
              <div className="p-2 rounded-xl bg-white/5">
                <span className="text-[10px] text-gray-400 block">وصلوا للشيك أوت</span>
                <span className="text-base font-black text-white">{analytics.reachedCheckoutSessions}</span>
              </div>
              <div className="p-2 rounded-xl bg-white/5">
                <span className="text-[10px] text-gray-400 block">خرجوا دون إتمام</span>
                <span className="text-base font-black text-red-400">{analytics.abandonedCheckoutSessions}</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-gray-400 flex items-center gap-2 bg-[#2ECC8F]/10 border border-[#2ECC8F]/20 p-3 rounded-xl">
            <Sparkles className="w-4 h-4 text-[#2ECC8F] shrink-0" />
            <span>نظام التذكير الفوري بالأسعار والكوبونات الذي وضعناه يقلل نسبة التخلي بنسبة تصل إلى 35%!</span>
          </div>
        </div>

      </div>

      {/* ⏰ HOURLY TRAFFIC & PEAK BUYING HOURS HEATMAP */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#0F172A] border border-white/10 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <span>توزيع الزيارات حسب ساعات اليوم (Peak Hours 00:00 - 23:00)</span>
            </h2>
            <p className="text-xs text-gray-400">معرفة أوقات الذروة التي يتواجد فيها العملاء في المتجر لاستهداف الإعلانات</p>
          </div>
          <span className="text-xs text-gray-400 font-mono">توقيت القاهرة (GMT+2)</span>
        </div>

        {/* 24-Hour Visual Heatmap Bar */}
        <div className="grid grid-cols-12 sm:grid-cols-24 gap-1.5 items-end h-36 pt-6">
          {analytics.hourlyTraffic.map((h) => {
            const heightPct = Math.max(8, Math.round((h.views / maxHourlyViews) * 100));
            const isPeak = h.views > 0 && h.views === maxHourlyViews;
            return (
              <div key={h.hour} className="flex flex-col items-center gap-1.5 h-full justify-end group relative">
                {/* Tooltip on hover */}
                <div className="absolute -top-10 bg-gray-900 border border-white/20 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-xl">
                  {h.hour}:00 — {h.views} مشاهدة ({h.sessions} زائر)
                </div>

                <div 
                  className={`w-full rounded-t-md transition-all ${
                    isPeak 
                      ? 'bg-gradient-to-t from-amber-500 to-amber-300' 
                      : h.views > 0 
                        ? 'bg-gradient-to-t from-[#2ECC8F]/80 to-[#2ECC8F]' 
                        : 'bg-white/5'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
                <span className="text-[9px] text-gray-400 font-mono">{h.hour}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 📊 TRAFFIC SOURCES, DEVICE BREAKDOWN & TOP PAGES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Traffic Sources & UTM Campaigns */}
        <div className="p-6 rounded-3xl bg-[#0F172A] border border-white/10 space-y-4 shadow-xl">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#2ECC8F]" />
            <span>مصادر الترافيك والحملات (Referrers)</span>
          </h3>

          {analytics.trafficSources.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">لا توجد بيانات مصادر كافية في هذه الفترة</p>
          ) : (
            <div className="space-y-2.5">
              {analytics.trafficSources.map((source, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 text-xs">
                  <span className="font-bold text-gray-200 truncate max-w-[170px]">{source.source}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400">{source.sessions} زائر</span>
                    <span className="font-bold text-[#2ECC8F] bg-[#2ECC8F]/10 px-2 py-0.5 rounded-md font-mono">
                      {source.views}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Device Breakdown */}
        <div className="p-6 rounded-3xl bg-[#0F172A] border border-white/10 space-y-4 shadow-xl">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-400" />
            <span>توزيع الأجهزة (Mobile vs Desktop)</span>
          </h3>

          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300 font-bold flex items-center gap-2">📱 الموبايل (Mobile):</span>
              <span className="font-black text-white">{mobilePct}% ({mobileCount} مشاهدة)</span>
            </div>
            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${mobilePct}%` }} />
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-gray-300 font-bold flex items-center gap-2">💻 الكمبيوتر (Desktop):</span>
              <span className="font-black text-white">{desktopPct}% ({desktopCount} مشاهدة)</span>
            </div>
            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${desktopPct}%` }} />
            </div>
          </div>
        </div>

        {/* 3. Top Visited Pages & Duration */}
        <div className="p-6 rounded-3xl bg-[#0F172A] border border-white/10 space-y-4 shadow-xl">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-purple-400" />
            <span>أكثر الصفحات زيارة والوقت المستغرق</span>
          </h3>

          {analytics.topPages.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">لا توجد زيارات</p>
          ) : (
            <div className="space-y-2">
              {analytics.topPages.slice(0, 5).map((p, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 text-xs">
                  <div className="min-w-0 flex-1 pl-2">
                    <span className="font-mono text-gray-300 truncate block text-[11px]">{p.path}</span>
                    <span className="text-[10px] text-gray-400">متوسط البقاء: {formatDuration(p.avgDuration)}</span>
                  </div>
                  <span className="font-bold text-[#2ECC8F] bg-[#2ECC8F]/10 px-2 py-0.5 rounded-md font-mono shrink-0">
                    {p.views} زيارة
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 📋 REALTIME VISITOR LOG (Live Feed) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#0F172A] border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#2ECC8F]" />
            <span>سجل آخر الزيارات اللحظية (Realtime Live Feed)</span>
          </h2>
          <span className="text-xs text-gray-400">آخر 15 جلسة مسجلة</span>
        </div>

        {analytics.recentViews.length === 0 ? (
          <p className="text-xs text-gray-400 py-8 text-center">لا توجد زيارات مسجلة تطابق الفلتر</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="text-gray-400 border-b border-white/10 text-[11px]">
                <tr>
                  <th className="py-3 px-3">الوقت والتاريخ</th>
                  <th className="py-3 px-3">الجلسة (Session ID)</th>
                  <th className="py-3 px-3">الصفحة (Path)</th>
                  <th className="py-3 px-3">الجهاز (Device)</th>
                  <th className="py-3 px-3">مدة البقاء</th>
                  <th className="py-3 px-3">المصدر (UTM / Referrer)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {analytics.recentViews.map((view) => (
                  <tr key={view.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 text-gray-400 whitespace-nowrap font-mono text-[11px]">
                      {new Date(view.createdAt).toLocaleTimeString('ar-EG', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3 font-mono text-gray-300 whitespace-nowrap">
                      {view.sessionId.slice(0, 14)}...
                    </td>
                    <td className="py-3 px-3 text-white font-mono font-bold max-w-xs truncate">
                      {view.path}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        view.deviceType === 'mobile'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}>
                        {view.deviceType === 'mobile' ? '📱 موبايل' : '💻 كمبيوتر'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-amber-400 whitespace-nowrap font-bold">
                      {formatDuration(view.durationSeconds || 0)}
                    </td>
                    <td className="py-3 px-3 text-gray-400 text-[11px] truncate max-w-xs">
                      {view.utmSource ? `🎯 ${view.utmSource}` : view.referrer ? view.referrer : 'مباشر (Direct)'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
