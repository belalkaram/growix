'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SITE_CONFIG } from '@/config/site';
import { GrowixLogo } from '@/components/GrowixLogo';
import { PromoAnnouncementBar } from '@/components/PromoAnnouncementBar';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Sparkles, MessageSquare, User, LogOut, PackageCheck, Shield, Video, Wrench, FolderOpen, Headphones } from 'lucide-react';

interface HeaderNavbarProps {
  onOpenPaymentModal?: () => void;
  session?: any;
  isSubscriberPage?: boolean;
  settings?: Record<string, string>;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({ 
  onOpenPaymentModal, 
  session, 
  isSubscriberPage,
  settings 
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const isMyOrders = isSubscriberPage || pathname === '/my-orders';
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleOpenPaymentModal = () => {
    if (onOpenPaymentModal) {
      onOpenPaymentModal();
    } else {
      router.push('/checkout');
    }
  };

  useBodyScrollLock(mobileMenuOpen);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const defaultNavLinks = [
    { name: 'الرئيسية', href: '/' },
    { name: 'الأدوات', href: '/tools' },
    { name: 'الكورس', href: '/course' },
    { name: 'الأسعار', href: '/pricing' },
    { name: 'كيف تبدأ؟', href: '/how-it-works' },
    { name: 'الأسئلة الشائعة', href: '/faq' },
  ];

  const subscriberNavLinks = [
    { name: 'الرئيسية', href: '/' },
    { name: 'فيديوهات الشرح', href: '#my-videos' },
    { name: 'الكورسات السحابية', href: '#my-courses' },
    { name: 'البرامج والأدوات', href: '#my-tools' },
    { name: 'هدية الداتا', href: '#my-bonus' },
    { name: 'الدعم الفني', href: '#my-support' },
  ];

  const navLinks = isMyOrders ? subscriberNavLinks : defaultNavLinks;

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100'
          : 'bg-[#0B1220] text-white border-b border-white/10'
      }`}
    >
      {/* Promo Announcement Ticker Bar (Hidden for subscribers) */}
      {!isMyOrders && <PromoAnnouncementBar settings={settings} />}

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between dir-rtl transition-all duration-300 ${
        isScrolled ? 'py-2.5' : 'py-3.5'
      }`}>
        
        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`lg:hidden p-2 rounded-xl transition-colors flex items-center justify-center ${
            isScrolled ? 'text-[#0B1220] hover:bg-gray-100' : 'text-white hover:bg-white/10'
          }`}
          aria-label="فتح القائمة"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Center Side (In RTL): Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm sm:text-base font-extrabold transition-colors hover:text-[#2ECC8F] ${
                isScrolled ? 'text-gray-800 hover:text-[#0F9D58]' : 'text-white hover:text-[#2ECC8F]'
              }`}
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Left Side (In RTL): Desktop Action Buttons & Auth */}
        <div className="hidden sm:flex items-center gap-3">
          {session?.user ? (
            <div className="flex items-center gap-2">
              {session.user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="py-2 px-3 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black flex items-center gap-1.5 hover:bg-amber-500/30 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>لوحة الأدمن</span>
                </Link>
              )}

              <Link
                href="/my-orders"
                className="py-2.5 px-4 rounded-xl bg-gradient-to-l from-[#0F9D58] to-[#2ECC8F] text-white text-xs font-extrabold flex items-center gap-2 shadow-md shadow-[#0F9D58]/20 hover:opacity-95 transition-opacity"
              >
                <PackageCheck className="w-4 h-4 text-white" />
                <span>طلباتي وحسابي</span>
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                title="تسجيل الخروج"
                className={`p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors ${
                  isScrolled ? 'hover:bg-red-50' : 'hover:bg-white/10'
                }`}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className={`py-2.5 px-4 rounded-xl border text-xs font-extrabold flex items-center gap-1.5 transition-colors ${
                  isScrolled
                    ? 'border-[#0F9D58] text-[#0F9D58] hover:bg-[#0F9D58]/10'
                    : 'border-[#2ECC8F] text-[#2ECC8F] hover:bg-[#2ECC8F]/10'
                }`}
              >
                <User className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </Link>

              <button
                onClick={handleOpenPaymentModal}
                className="py-2.5 px-6 rounded-2xl bg-growix-gradient hover:bg-growix-gradient-hover text-white font-black text-sm sm:text-base flex items-center gap-2 shadow-md shadow-[#0F9D58]/20 transition-all hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>اشترك الآن</span>
              </button>
            </>
          )}
        </div>

        {/* Brand Logo: On mobile (RTL) it sits on the LEFT (last child). On desktop (lg+) it stays on the RIGHT (order-first) */}
        <Link href="/" className="flex items-center gap-3 group lg:order-first">
          <GrowixLogo theme={isScrolled ? 'light' : 'dark'} iconSize={38} showSubtitle />
        </Link>
      </div>

      {/* Smooth Animated Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden bg-[#0B1220] text-white border-b border-white/10 overflow-hidden shadow-2xl dir-rtl"
          >
            <div className="px-4 pt-4 pb-6 space-y-4 max-h-[85vh] overflow-y-auto overscroll-contain">
              <nav className="flex flex-col space-y-3">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-semibold text-gray-200 hover:text-[#2ECC8F] py-2.5 border-b border-white/5 flex items-center justify-between"
                  >
                    <span>{link.name}</span>
                    <span className="text-xs text-gray-500">←</span>
                  </a>
                ))}
              </nav>

              <div className="pt-3 flex flex-col gap-3">
                {session?.user ? (
                  <div className="flex flex-col gap-2">
                    {session.user.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full py-3 px-4 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black flex items-center justify-center gap-2"
                      >
                        <Shield className="w-4 h-4" />
                        <span>لوحة الأدمن</span>
                      </Link>
                    )}

                    <Link
                      href="/my-orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-3 px-4 rounded-xl bg-white/10 border border-white/15 text-white text-xs font-extrabold flex items-center justify-center gap-2"
                    >
                      <PackageCheck className="w-4 h-4 text-[#2ECC8F]" />
                      <span>طلباتي وحسابي</span>
                    </Link>

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-extrabold flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-3 px-4 rounded-xl border border-[#2ECC8F] text-[#2ECC8F] text-xs font-extrabold flex items-center justify-center gap-2 hover:bg-[#2ECC8F]/10"
                    >
                      <User className="w-4 h-4" />
                      <span>تسجيل الدخول</span>
                    </Link>

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleOpenPaymentModal();
                      }}
                      className="w-full py-3.5 px-5 rounded-2xl bg-growix-gradient text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#0F9D58]/30 active:scale-98 transition-transform"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>اشترك الآن</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

