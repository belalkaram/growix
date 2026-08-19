'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'motion/react';
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
  ExternalLink,
  Menu,
  X,
  Shield,
  FolderDown,
  FolderOpen,
  Tag
} from 'lucide-react';

interface AdminSidebarProps {
  userEmail: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ userEmail }) => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'اللوحة الرئيسية', href: '/admin', icon: LayoutDashboard },
    { label: 'طلبات الاشتراك والتحويلات', href: '/admin/orders', icon: PackageCheck },
    { label: 'الكوبونات وقسائم الخصم', href: '/admin/coupons', icon: Tag },
    { label: 'ملفات الباقات (R2)', href: '/admin/files', icon: FolderDown },
    { label: 'فيديوهات الشرح', href: '/admin/videos', icon: Wrench },
    { label: 'كورسات MEGA', href: '/admin/mega', icon: FolderOpen },
    { label: 'الباقات والأسعار', href: '/admin/packages', icon: Package },
    { label: 'الـ 12 أداة', href: '/admin/tools', icon: Wrench },
    { label: 'المستخدمون', href: '/admin/users', icon: Users },
    { label: 'إعدادات الموقع', href: '/admin/settings', icon: Settings },
    { label: 'الإحصائيات والزيارات', href: '/admin/analytics', icon: BarChart3 },
  ];

  return (
    <>
      {/* ─── Mobile Header Bar (Visible on md:hidden) ─── */}
      <header className="md:hidden bg-[#0F172A] border-b border-white/10 p-4 flex items-center justify-between sticky top-0 z-40 dir-rtl">
        <div className="flex items-center gap-3">
          <GrowixLogo iconSize={32} />
          <span className="text-[10px] bg-[#0F9D58] text-white px-2 py-0.5 rounded-full font-black">
            ADMIN
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
          aria-label="القائمة"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* ─── Mobile Drawer Menu Overlay (Visible on md:hidden when open) ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden bg-[#0F172A] border-b border-white/10 overflow-hidden shadow-2xl dir-rtl z-30 sticky top-[65px]"
          >
            <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-extrabold transition-all ${
                        isActive
                          ? 'bg-gradient-to-l from-[#0F9D58] to-[#2ECC8F] text-white shadow-md'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#2ECC8F]'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-white/10 space-y-3">
                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center justify-between text-xs text-gray-400 hover:text-white transition-colors px-2 py-1"
                >
                  <span>معاينة الموقع الحقيقي</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center justify-between px-2 pt-1 text-xs">
                  <span className="text-gray-400 truncate max-w-[180px]">{userEmail}</span>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-red-400 hover:text-red-300 font-bold text-xs flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>خروج</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Desktop Sidebar (Visible on md:flex) ─── */}
      <aside className="hidden md:flex w-64 bg-[#0F172A] border-l border-white/10 p-5 shrink-0 flex-col justify-between min-h-screen sticky top-0 h-screen dir-rtl">
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
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-extrabold transition-all ${
                    isActive
                      ? 'bg-gradient-to-l from-[#0F9D58] to-[#2ECC8F] text-white shadow-md shadow-[#0F9D58]/20'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#2ECC8F]'}`} />
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

          <div className="flex items-center justify-between px-2 pt-1">
            <span className="text-xs text-gray-400 truncate max-w-[140px]">{userEmail}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              title="تسجيل الخروج"
              className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
