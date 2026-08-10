'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SITE_CONFIG, PricingPackage } from '@/config/site';
import { HeaderNavbar } from '@/components/HeaderNavbar';
import { HeroSection } from '@/components/HeroSection';
import { TrustAboutSection } from '@/components/TrustAboutSection';
import { ToolsGridSection } from '@/components/ToolsGridSection';
import { CourseDetailsSection } from '@/components/CourseDetailsSection';
import { DataEgyptBonusSection } from '@/components/DataEgyptBonusSection';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { PricingSection } from '@/components/PricingSection';
import { FaqSection } from '@/components/FaqSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { Footer } from '@/components/Footer';
import { FloatingElements } from '@/components/FloatingElements';
import { LiveSalesToast } from '@/components/LiveSalesToast';
import { JsonLd } from '@/components/JsonLd';

export default function Home() {
  const router = useRouter();

  const handleNavigateToCheckout = (pkg?: PricingPackage | unknown, toolId?: string) => {
    let url = '/checkout';
    const params = new URLSearchParams();
    if (pkg && typeof pkg === 'object' && 'id' in pkg && typeof (pkg as { id?: unknown }).id === 'string') {
      params.set('package', (pkg as { id: string }).id);
    } else if (typeof pkg === 'string') {
      params.set('package', pkg);
    }
    if (toolId && typeof toolId === 'string') {
      params.set('tool', toolId);
    }
    const query = params.toString();
    if (query) {
      url += `?${query}`;
    }
    router.push(url);
  };

  return (
    <main className="min-h-screen bg-[#F7F9FA] text-[#0B1220] flex flex-col font-sans">
      {/* Structured Data (JSON-LD) */}
      <JsonLd />

      {/* Sticky Header Navbar */}
      <HeaderNavbar onOpenPaymentModal={() => handleNavigateToCheckout()} />

      {/* Hero Section */}
      <HeroSection onOpenPaymentModal={() => handleNavigateToCheckout()} />

      {/* Trust & About Section */}
      <TrustAboutSection onOpenPaymentModal={() => handleNavigateToCheckout()} />

      {/* 12 Tools Grid Section */}
      <ToolsGridSection onOpenPaymentModal={(pkg, toolId) => handleNavigateToCheckout(pkg, toolId)} />

      {/* Digital Marketing Course Details */}
      <CourseDetailsSection onOpenPaymentModal={() => handleNavigateToCheckout()} />

      {/* Bonus Data Egypt Section */}
      <DataEgyptBonusSection onOpenPaymentModal={() => handleNavigateToCheckout()} />

      {/* How it Works / Delivery Flow */}
      <HowItWorksSection onOpenPaymentModal={() => handleNavigateToCheckout()} />

      {/* Pricing & Packages */}
      <PricingSection onSelectPackage={(pkg, toolId) => handleNavigateToCheckout(pkg, toolId)} />

      {/* FAQ Section */}
      <FaqSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Footer */}
      <Footer onOpenPaymentModal={() => handleNavigateToCheckout()} />

      {/* Floating CTA Buttons */}
      <FloatingElements onOpenPaymentModal={() => handleNavigateToCheckout()} />

      {/* Social Proof Live Sales Popup */}
      <LiveSalesToast />
    </main>
  );
}
