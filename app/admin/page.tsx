import React from 'react';
import Link from 'next/link';
import { db } from '@/db';
import { users, packages, tools, pageViews, orders } from '@/db/schema';
import { count, eq } from 'drizzle-orm';
import { Users, Package, Wrench, Eye, ArrowUpRight, ShoppingBag, ShieldCheck, Tag, Film, FolderOpen, Sliders } from 'lucide-react';
import { SystemHealthLive } from './SystemHealthLive';
import { PushNotificationManager } from '@/components/PushNotificationManager';

export default async function AdminDashboardPage() {
  const [
    [{ value: usersCount }],
    [{ value: packagesCount }],
    [{ value: toolsCount }],
    [{ value: viewsCount }],
    [{ value: pendingOrdersCount }],
  ] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(packages),
    db.select({ value: count() }).from(tools),
    db.select({ value: count() }).from(pageViews),
    db.select({ value: count() }).from(orders).where(eq(orders.status, 'pending')),
  ]);

  const stats = [
    { label: 'طلبات الاشتراك المعلقة', value: pendingOrdersCount.toString(), icon: ShoppingBag, color: 'text-amber-400', href: '/admin/orders', alert: Number(pendingOrdersCount) > 0 },
    { label: 'إجمالي المستخدمين المسجلين', value: usersCount.toString(), icon: Users, color: 'text-blue-400', href: '/admin/users' },
    { label: 'الأدوات التسويقية الـ 12', value: toolsCount.toString(), icon: Wrench, color: 'text-emerald-400', href: '/admin/tools' },
    { label: 'إجمالي مشاهدات الصفحات', value: viewsCount.toString(), icon: Eye, color: 'text-purple-400', href: '/admin/analytics' },
  ];

  const quickNav = [
    { label: 'إدارة المستخدمين والأدوار', href: '/admin/users', icon: Users, desc: 'إنشاء يدوي/تلقائي بضغطة زر وتعديل وحذف' },
    { label: 'طلبات الاشتراك والتحويلات', href: '/admin/orders', icon: ShoppingBag, desc: 'مراجعة وتأكيد إيصالات التحويل وإشعارات تليجرام' },
    { label: 'الكوبونات وقسائم الخصم', href: '/admin/coupons', icon: Tag, desc: 'إضافة وتتبع المستفيدين وتعديل نسب الخصم' },
    { label: 'الأدوات التسويقية والـ SEO', href: '/admin/tools', icon: Wrench, desc: 'تعديل وحذف وإضافة برامج المونتاج والرسائل' },
    { label: 'روابط الكورسات السحابية', href: '/admin/mega', icon: FolderOpen, desc: 'إدارة روابط مجلدات MEGA والكورسات' },
    { label: 'فيديوهات الشرح والتثبيت', href: '/admin/videos', icon: Film, desc: 'إضافة وتعديل شروحات اليوتيوب لصفحة طلباتي' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">لوحة التحكم وإدارة النظام</h1>
        <p className="text-xs sm:text-sm text-gray-400">تحكم كامل وشامل في مستخدمي منصة GROWIX، الطلبات، الأسعار، والفيديوهات والملفات (Full CRUD)</p>
      </div>

      {/* Top 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link
              key={i}
              href={stat.href}
              className={`p-6 rounded-3xl bg-[#0F172A] border transition-all shadow-xl group relative overflow-hidden ${
                stat.alert ? 'border-amber-500/50 ring-1 ring-amber-500/30' : 'border-white/10 hover:border-[#2ECC8F]/50'
              }`}
            >
              {stat.alert && (
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black animate-pulse">
                  يتطلب المراجعة
                </span>
              )}
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
              </div>
              <span className="text-xs text-gray-400 block mb-1 font-semibold">{stat.label}</span>
              <span className="text-2xl font-black text-white">{stat.value}</span>
            </Link>
          );
        })}
      </div>

      {/* Live System Health Section (100% Real Live Data) */}
      <SystemHealthLive />

      {/* iPhone & Web Push Notifications Link Card */}
      <PushNotificationManager />

      {/* Full CRUD Management Quick Hub */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-white/10 space-y-6 shadow-xl">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#2ECC8F]" />
            <span>بوابة التحكم وإدارة الأقسام (Full CRUD Management)</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            اختر القسم الذي ترغب في تعديل أو إضافة أو حذف بياناته مباشرةً:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickNav.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                className="p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#2ECC8F]/40 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-[#0F9D58]/15 text-[#2ECC8F] flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-[#2ECC8F] transition-colors">{item.label}</h3>
                <p className="text-[11px] text-gray-400 leading-relaxed">{item.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
