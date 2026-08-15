'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PricingPackage, MarketingTool, FAQItem, Testimonial } from '@/config/site';
import { ToolSeoData } from '@/config/seo';
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
import { MaintenanceScreen } from '@/components/MaintenanceScreen';

interface HomePageClientProps {
  tools: MarketingTool[];
  packages: PricingPackage[];
  faqs: FAQItem[];
  testimonials: Testimonial[];
  toolsSeo: ToolSeoData[];
  settings: Record<string, string>;
  session?: any;
}

export const HomePageClient: React.FC<HomePageClientProps> = ({
  tools,
  packages,
  faqs,
  testimonials,
  toolsSeo,
  settings,
  session,
}) => {
  const router = useRouter();

  const handleNavigateToCheckout = (pkg?: PricingPackage | unknown, toolId?: string) => {
    // Guard against synthetic React MouseEvent objects passed from event handlers
    if (pkg && typeof pkg === 'object' && ('nativeEvent' in pkg || 'preventDefault' in pkg || 'target' in pkg)) {
      pkg = undefined;
    }
    if (toolId && typeof toolId === 'object' && ('nativeEvent' in toolId || 'preventDefault' in toolId || 'target' in toolId)) {
      toolId = undefined;
    }

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

    // Require login before going to checkout
    if (!session?.user) {
      router.push(`/login?callbackUrl=${encodeURIComponent(url)}`);
      return;
    }

    router.push(url);
  };

  if (settings?.maintenance_mode === 'true' && session?.user?.role !== 'admin') {
    return (
      <MaintenanceScreen
        message={settings.maintenance_message}
        whatsappNumber={settings.whatsapp_number}
        telegramUsername={settings.telegram_username}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F9FA] text-[#0B1220] flex flex-col font-sans">
      {/* Structured Data (JSON-LD) */}
      <JsonLd toolsSeo={toolsSeo} />

      {/* Sticky Header Navbar */}
      <HeaderNavbar onOpenPaymentModal={() => handleNavigateToCheckout()} session={session} />

      {/* Hero Section */}
      <HeroSection onOpenPaymentModal={() => handleNavigateToCheckout()} />

      {/* Trust & About Section */}
      <TrustAboutSection onOpenPaymentModal={() => handleNavigateToCheckout()} />

      {/* Tools Section Summary */}
      <ToolsGridSection 
        tools={tools} 
        onOpenPaymentModal={(pkg, toolId) => handleNavigateToCheckout(pkg, toolId)} 
        isHomepage={true}
      />

      {/* Digital Marketing Course Details */}
      <CourseDetailsSection onOpenPaymentModal={() => handleNavigateToCheckout()} />

      {/* Bonus Data Egypt Section */}
      <DataEgyptBonusSection onOpenPaymentModal={() => handleNavigateToCheckout()} />

      {/* How it Works / Delivery Flow */}
      <HowItWorksSection onOpenPaymentModal={() => handleNavigateToCheckout()} />

      {/* Pricing & Packages */}
      <PricingSection 
        packages={packages} 
        tools={tools} 
        onSelectPackage={(pkg, toolId) => handleNavigateToCheckout(pkg, toolId)} 
      />

      {/* FAQ Section */}
      <FaqSection faqs={faqs} />

      {/* Testimonials */}
      <TestimonialsSection testimonials={testimonials} />

      {/* Footer */}
      <Footer onOpenPaymentModal={() => handleNavigateToCheckout()} settings={settings} />

      {/* Floating CTA Buttons */}
      <FloatingElements onOpenPaymentModal={() => handleNavigateToCheckout()} settings={settings} />

      {/* Social Proof Live Sales Popup */}
      <LiveSalesToast />
    </main>
  );
};
