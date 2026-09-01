'use client';

import React, { useState, useEffect } from 'react';
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
  BarChart2,
  LogOut, 
  ExternalLink,
  Menu,
  X,
  Shield,
  FolderDown,
  FolderOpen,
  Tag,
  Radio
} from 'lucide-react';

interface AdminSidebarProps {
  userEmail: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ userEmail }) => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer whenever route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open to prevent background scrolling glitch
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const navItems = [
    { label: 'اللوحة الرئيسية', href: '/admin', icon: LayoutDashboard },
    { label: 'طلبات الاشتراك والتحويلات', href: '/admin/orders', icon: PackageCheck },
    { label: 'سجل تحويلات الـ Webhook', href: '/admin/transactions', icon: Radio },
    { label: 'الكوبونات وقسائم الخصم', href: '/admin/coupons', icon: Tag },
    { label: 'ملفات الباقات (R2)', href: '/admin/files', icon: FolderDown },
    { label: 'فيديوهات الشرح', href: '/admin/videos', icon: Wrench },
    { label: 'كورسات MEGA', href: '/admin/mega', icon: FolderOpen },
    { label: 'الباقات والأسعار', href: '/admin/packages', icon: Package },
    { label: 'الـ 12 أداة', href: '/admin/tools', icon: Wrench },
    { label: 'المستخدمون', href: '/admin/users', icon: Users },
    { label: 'تدقيق تفاعل العملاء', href: '/admin/engagement', icon: BarChart2 },
    { label: 'إعدادات الموقع', href: '/admin/settings', icon: Settings },
    { label: 'الإحصائيات والزيارات', href: '/admin/analytics', icon: BarChart3 },
  ];

  return (
    <>
      {/* ─── Mobile Top Sticky Navbar (Visible on md:hidden) ─── */}
      <header className="md:hidden bg-[#0F172A]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-40 dir-rtl">
        <div className="flex items-center gap-2.5">
          <GrowixLogo iconSize={30} />
          <span className="text-[10px] bg-[#00FF87]/20 text-[#00FF87] border border-[#00FF87]/30 px-2 py-0.5 rounded-full font-black">
            ADMIN
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10 cursor-pointer"
          aria-label="فتح القائمة الجانبية"
        >
          <Menu className="w-5 h-5 text-[#00FF87]" />
        </button>
      </header>

      {/* ─── Mobile Slide-in Drawer with Backdrop Overlay ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 md:hidden"
            />

            {/* Sliding Drawer */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed top-0 right-0 bottom-0 w-72 max-w-[85vw] bg-[#0F172A] border-l border-white/10 z-50 flex flex-col h-full shadow-2xl md:hidden dir-rtl"
            >
              {/* Drawer Header */}
              <div className="p-4 flex items-center justify-between border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2.5">
                  <GrowixLogo iconSize={28} />
                  <span className="text-[10px] bg-[#00FF87]/20 text-[#00FF87] border border-[#00FF87]/30 px-2 py-0.5 rounded-full font-black">
                    ADMIN
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  aria-label="إغلاق"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Nav List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1 overscroll-contain">
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-gradient-to-l from-[#00FF87]/20 to-[#0F9D58]/30 text-[#00FF87] border border-[#00FF87]/30 shadow-md'
                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#00FF87]' : 'text-gray-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-white/10 space-y-2.5 shrink-0 bg-[#0B1220]/70">
                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center justify-between text-xs text-gray-400 hover:text-white transition-colors px-2 py-1"
                >
                  <span>معاينة الموقع الحقيقي</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#00FF87]" />
                </Link>

                <div className="flex items-center justify-between px-2 pt-1 text-xs">
                  <span className="text-gray-400 truncate max-w-[160px] font-mono">{userEmail}</span>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-red-400 hover:text-red-300 font-bold text-xs flex items-center gap-1 cursor-pointer bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>خروج</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ─── Desktop Fixed & Smooth Scrollable Sidebar (Visible on md:flex) ─── */}
      <aside className="hidden md:flex w-64 bg-[#0F172A] border-l border-white/10 shrink-0 flex-col h-screen sticky top-0 z-30 dir-rtl select-none">
        
        {/* Top Pinned Logo Header */}
        <div className="p-5 pb-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <GrowixLogo iconSize={32} />
          <span className="text-[10px] bg-[#00FF87]/20 text-[#00FF87] border border-[#00FF87]/30 px-2.5 py-0.5 rounded-full font-black">
            ADMIN
          </span>
        </div>

        {/* Middle Smooth Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-1 overscroll-contain">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-l from-[#00FF87]/20 to-[#0F9D58]/30 text-[#00FF87] border border-[#00FF87]/30 shadow-md shadow-[#00FF87]/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#00FF87]' : 'text-gray-400'}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Pinned User Profile & Quick Actions */}
        <div className="p-4 border-t border-white/10 space-y-2.5 shrink-0 bg-[#0B1220]/80">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
          >
            <span>معاينة الموقع الحقيقي</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#00FF87]" />
          </Link>

          <div className="flex items-center justify-between px-2 pt-1">
            <span className="text-xs text-gray-400 truncate max-w-[130px] font-mono">{userEmail}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              title="تسجيل الخروج"
              className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
