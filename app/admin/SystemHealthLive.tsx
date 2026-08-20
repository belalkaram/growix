'use client';

import React, { useState, useEffect } from 'react';
import { getLiveSystemHealthAction, SystemHealthData } from '@/lib/actions/system';
import { 
  Database, 
  Server, 
  HardDrive, 
  Send, 
  Activity, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Zap,
  Users,
  CreditCard,
  Eye,
  Lock
} from 'lucide-react';

export const SystemHealthLive: React.FC = () => {
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchHealth = async () => {
    setLoading(true);
    const res = await getLiveSystemHealthAction();
    if (res.success && res.data) {
      setHealth(res.data);
      setLastRefreshed(new Date());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHealth();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 rounded-3xl bg-[#0F172A] border border-white/10 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0F9D58]/20 text-[#2ECC8F] flex items-center justify-center font-black">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <span>حالة النظام والبيانات الحية (100% Live System)</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Data
              </span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              فحص حي لحظي لاتصال قاعدة البيانات، السيرفر، التخزين السحابي، وإشعارات تليجرام
            </p>
          </div>
        </div>

        <button
          onClick={fetchHealth}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-bold flex items-center gap-2 border border-white/10 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#2ECC8F]' : ''}`} />
          <span>تحديث الحالة الحية</span>
          <span className="text-[10px] text-gray-500 font-mono dir-ltr">
            ({lastRefreshed.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
          </span>
        </button>
      </div>

      {/* 4 Core Services Health Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Database (PostgreSQL) */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-blue-400" />
              <span>قاعدة البيانات</span>
            </span>
            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              متصل 🟢
            </span>
          </div>
          <div className="text-lg font-black text-white font-mono">
            {health ? `${health.database.pingMs} ms` : '...'}
          </div>
          <div className="text-[11px] text-gray-400">
            {health?.database.provider || 'PostgreSQL'} • {health?.database.totalTables || 15} جدول
          </div>
        </div>

        {/* 2. Cloudflare R2 Storage */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-amber-400" />
              <span>تخزين الملفات (R2)</span>
            </span>
            <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
              health?.r2Storage.connected
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {health?.r2Storage.connected ? 'نشط 🟢' : 'جاهز'}
            </span>
          </div>
          <div className="text-lg font-black text-white font-mono">
            {health ? `${health.r2Storage.objectsCount} ملفات` : '...'}
          </div>
          <div className="text-[11px] text-gray-400 truncate" title={health?.r2Storage.bucketName}>
            Bucket: {health?.r2Storage.bucketName || 'growix-files'}
          </div>
        </div>

        {/* 3. Telegram Bot Notifications */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <Send className="w-4 h-4 text-[#2ECC8F]" />
              <span>بوت تليجرام</span>
            </span>
            <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
              health?.telegramBot.status === 'connected'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : health?.telegramBot.status === 'not_configured'
                ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {health?.telegramBot.status === 'connected' ? 'متصل 🟢' : health?.telegramBot.status === 'not_configured' ? 'غير مهيأ' : 'خطأ ⚠️'}
            </span>
          </div>
          <div className="text-sm font-black text-white">
            {health?.telegramBot.status === 'connected' ? 'جاهز لإرسال الإشعارات' : health?.telegramBot.status === 'not_configured' ? 'بانتظار التوكن' : 'فحص الإعدادات'}
          </div>
          <div className="text-[11px] text-gray-400">
            إشعارات الاشتراكات الفورية
          </div>
        </div>

        {/* 4. Server Node & Memory */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-purple-400" />
              <span>السيرفر والذاكرة</span>
            </span>
            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {health?.server.environment || 'Production'}
            </span>
          </div>
          <div className="text-lg font-black text-white font-mono">
            {health ? `${health.server.memoryUsageMb} MB` : '...'}
          </div>
          <div className="text-[11px] text-gray-400">
            Node {health?.server.nodeVersion || process.version} • Uptime {health ? `${Math.round(health.server.uptimeSeconds / 60)} دقيقة` : '—'}
          </div>
        </div>

      </div>

      {/* Live Counts Row */}
      {health && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          <div className="p-2">
            <span className="text-[11px] text-gray-400 block mb-1">المستخدمين المسجلين</span>
            <span className="text-base font-black text-white">{health.counts.totalUsers}</span>
          </div>
          <div className="p-2 border-r border-white/10">
            <span className="text-[11px] text-gray-400 block mb-1">الطلبات المعلقة</span>
            <span className="text-base font-black text-amber-400">{health.counts.pendingOrders}</span>
          </div>
          <div className="p-2 border-r border-white/10">
            <span className="text-[11px] text-gray-400 block mb-1">الطلبات المعتمدة</span>
            <span className="text-base font-black text-emerald-400">{health.counts.approvedOrders}</span>
          </div>
          <div className="p-2 border-r border-white/10">
            <span className="text-[11px] text-gray-400 block mb-1">الإيرادات المحققة</span>
            <span className="text-base font-black text-[#2ECC8F]">{health.counts.totalRevenue.toLocaleString('ar-EG')} ج</span>
          </div>
          <div className="p-2 border-r border-white/10">
            <span className="text-[11px] text-gray-400 block mb-1">الكوبونات النشطة</span>
            <span className="text-base font-black text-blue-400">{health.counts.activeCoupons}</span>
          </div>
          <div className="p-2 border-r border-white/10">
            <span className="text-[11px] text-gray-400 block mb-1">سجلات الحماية والأمان</span>
            <span className="text-base font-black text-purple-400">{health.counts.securityEvents}</span>
          </div>
        </div>
      )}
    </div>
  );
};
