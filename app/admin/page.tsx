import React from 'react';
import Link from 'next/link';
import { db } from '@/db';
import { users, packages, tools, pageViews } from '@/db/schema';
import { count } from 'drizzle-orm';
import { Users, Package, Wrench, Eye, ArrowUpRight, ShieldCheck } from 'lucide-react';

export default async function AdminDashboardPage() {
  const [
    [{ value: usersCount }],
    [{ value: packagesCount }],
    [{ value: toolsCount }],
    [{ value: viewsCount }],
  ] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(packages),
    db.select({ value: count() }).from(tools),
    db.select({ value: count() }).from(pageViews),
  ]);

  const stats = [
    { label: 'إجمالي المستخدمين المسجلين', value: usersCount.toString(), icon: Users, color: 'text-blue-400', href: '/admin/users' },
    { label: 'الباقات المتاحة', value: packagesCount.toString(), icon: Package, color: 'text-emerald-400', href: '/admin/packages' },
    { label: 'الأدوات التسويقية الـ 12', value: toolsCount.toString(), icon: Wrench, color: 'text-amber-400', href: '/admin/tools' },
    { label: 'إجمالي مشاهدات الصفحات', value: viewsCount.toString(), icon: Eye, color: 'text-purple-400', href: '/admin/analytics' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">لوحة التحكم والأدمن</h1>
        <p className="text-xs sm:text-sm text-gray-400">إدارة الباقات والأدوات والمستخدمين والإعدادات العامة لمنصة GROWIX</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link
              key={i}
              href={stat.href}
              className="p-6 rounded-2xl bg-[#0F172A] border border-white/10 hover:border-[#2ECC8F]/50 transition-all shadow-md group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
              </div>
              <span className="text-xs text-gray-400 block mb-1 font-semibold">{stat.label}</span>
              <span className="text-2xl font-black text-white">{stat.value}</span>
            </Link>
          );
        })}
      </div>

      {/* Quick Quicklinks & Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/10 space-y-4">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#2ECC8F]" />
            <span>إدارة المحتوى السريعة</span>
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            يمكنك تعديل أسعار الباقات أو وصف البرامج الـ 12 أو تحديث رقم الواتساب فوراً من الأقسام المخصصة وتنعكس التغيرات مباشرة على الموقع دون إعادة نشر.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link href="/admin/packages" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors">
              تعديل الأسعار
            </Link>
            <Link href="/admin/tools" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors">
              تعديل الأدوات
            </Link>
            <Link href="/admin/settings" className="px-4 py-2 rounded-xl bg-[#0F9D58] hover:bg-[#0F9D58]/80 text-xs font-bold text-white transition-colors">
              تعديل الواتساب والروابط
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/10 space-y-4">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#2ECC8F]" />
            <span>حالة النظام والبيانات</span>
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
              <span className="text-gray-400">قاعدة البيانات (Neon PostgreSQL):</span>
              <span className="text-emerald-400 font-bold">متصلة 🟢</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
              <span className="text-gray-400">نظام الأرشفة والـ SEO:</span>
              <span className="text-emerald-400 font-bold">مُفعل 🟢</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
              <span className="text-gray-400">التفعيل التلقائي للزوار:</span>
              <span className="text-emerald-400 font-bold">نشط ⚡</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
