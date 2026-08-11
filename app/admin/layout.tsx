import React from 'react';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { GrowixLogo } from '@/components/GrowixLogo';
import { 
  LayoutDashboard, 
  PackageCheck,
  Package, 
  Wrench, 
  Settings, 
  Users, 
  BarChart3, 
  LogOut, 
  ExternalLink 
} from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    redirect('/login');
  }

  const navItems = [
    { label: 'اللوحة الرئيسية', href: '/admin', icon: LayoutDashboard },
    { label: 'طلبات الاشتراك والتحويلات', href: '/admin/orders', icon: PackageCheck },
    { label: 'الباقات والأسعار', href: '/admin/packages', icon: Package },
    { label: 'الـ 12 أداة', href: '/admin/tools', icon: Wrench },
    { label: 'المستخدمون', href: '/admin/users', icon: Users },
    { label: 'إعدادات الموقع', href: '/admin/settings', icon: Settings },
    { label: 'الإحصائيات والزيارات', href: '/admin/analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[#0B1220] text-white flex flex-col md:flex-row font-sans" dir="rtl">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#0F172A] border-b md:border-b-0 md:border-l border-white/10 p-5 shrink-0 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <GrowixLogo />
            <span className="text-[10px] bg-[#0F9D58] text-white px-2 py-0.5 rounded-full font-black">
              ADMIN
            </span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-extrabold text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Icon className="w-4 h-4 text-[#2ECC8F]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-white/10 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between text-xs text-gray-400 hover:text-white transition-colors px-2"
          >
            <span>معاينة الموقع الحقيقي</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="text-xs text-gray-400 px-2 truncate">
            مسجل بـ: <span className="text-[#2ECC8F] font-bold">{session.user.email}</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
