'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SITE_CONFIG } from '@/config/site';
import { GrowixLogo } from '@/components/GrowixLogo';
import { PromoAnnouncementBar } from '@/components/PromoAnnouncementBar';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { Menu, X, Sparkles, MessageSquare } from 'lucide-react';

interface HeaderNavbarProps {
  onOpenPaymentModal: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({ onOpenPaymentModal }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const navLinks = [
    { name: 'الرئيسية', href: '#hero' },
    { name: 'الـ 12 أداة', href: '#tools' },
    { name: 'محتوى الكورس', href: '#course' },
    { name: 'هدية الداتا', href: '#data-bonus' },
    { name: 'كيف تعمل المنصة', href: '#how-it-works' },
    { name: 'الأسعار والباقات', href: '#pricing' },
    { name: 'الأسئلة الشائعة', href: '#faq' },
  ];

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100'
          : 'bg-[#0B1220] text-white border-b border-white/10'
      }`}
    >
      {/* Promo Announcement Ticker Bar */}
      <PromoAnnouncementBar />

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between dir-rtl transition-all duration-300 ${
        isScrolled ? 'py-2.5' : 'py-3.5'
      }`}>
        
        {/* Mobile Menu Toggle Button (On Right in RTL on Mobile, hidden on desktop) */}
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
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold transition-colors hover:text-[#2ECC8F] ${
                isScrolled ? 'text-gray-700 hover:text-[#0F9D58]' : 'text-gray-200'
              }`}
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Left Side (In RTL): Desktop Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href={`https://wa.me/${SITE_CONFIG.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-2.5 rounded-2xl border transition-colors flex items-center gap-2 text-xs font-bold ${
              isScrolled
                ? 'border-gray-200 text-gray-700 hover:bg-gray-100'
                : 'border-white/15 text-gray-200 hover:bg-white/10'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-[#2ECC8F]" />
            <span>تواصل معنا</span>
          </a>

          <button
            onClick={() => onOpenPaymentModal()}
            className="py-2.5 px-5 rounded-2xl bg-growix-gradient hover:bg-growix-gradient-hover text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-[#0F9D58]/20 transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>اشترك الآن</span>
          </button>
        </div>

        {/* Brand Logo: On mobile (RTL) it sits on the LEFT (last child). On desktop (lg+) it stays on the RIGHT (order-first) */}
        <a href="#hero" className="flex items-center gap-3 group lg:order-first">
          <GrowixLogo theme={isScrolled ? 'light' : 'dark'} iconSize={38} showSubtitle />
        </a>
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
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenPaymentModal();
                  }}
                  className="w-full py-3.5 px-5 rounded-2xl bg-growix-gradient text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#0F9D58]/30 active:scale-98 transition-transform"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>اشترك في GROWIX الآن</span>
                </button>
                
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-5 rounded-2xl border border-white/20 text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-white/5"
                >
                  <MessageSquare className="w-4 h-4 text-[#2ECC8F]" />
                  <span>استفسار عبر الواتساب</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

