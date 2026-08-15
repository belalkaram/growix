'use client';

import React from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { SITE_CONFIG } from '@/config/site';
import { CheckCircle2, ArrowLeft, Clock, ShieldCheck, Sparkles } from 'lucide-react';

interface HowItWorksSectionProps {
  onOpenPaymentModal?: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onOpenPaymentModal }) => {
  const router = useRouter();

  const handleSubscribe = () => {
    if (onOpenPaymentModal) {
      onOpenPaymentModal();
    } else {
      router.push('/checkout');
    }
  };
  return (
    <section id="how-it-works" className="py-24 bg-[#F7F9FA] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B1220] text-[#2ECC8F] text-xs font-black shadow-sm">
            <Clock className="w-4 h-4 text-[#2ECC8F]" />
            <span>خطوات التفعيل والاستلام</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B1220]">
            كيف تصلك <span className="text-growix-gradient">الباقة والأدوات؟</span>
          </h2>

          <p className="text-gray-600 text-base sm:text-lg">
            4 خطوات بسيطة وسريعة جداً لبدء الاستفادة الفورية من المنصة والتفعيل خلال أقل من ساعة:
          </p>
        </div>

        {/* 4 Steps Stepper */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {SITE_CONFIG.steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm hover:shadow-md hover:border-[#0F9D58] transition-all relative flex flex-col justify-between"
            >
              <div>
                {/* Step Number Badge & Bold Title inline */}
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-[#0B1220] text-[#2ECC8F] font-black text-lg flex items-center justify-center shadow-md shrink-0">
                    {step.number}
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#0B1220] leading-snug">{step.title}</h3>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{step.desc}</p>
              </div>

              {idx < SITE_CONFIG.steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 -left-3 transform -translate-x-1/2 text-gray-300 pointer-events-none">
                  <ArrowLeft className="w-6 h-6 text-[#0F9D58]" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Guarantee Callout Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 max-w-3xl mx-auto shadow-sm text-center space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#0F9D58] bg-[#0F9D58]/10 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4" />
            <span>ضمان التفعيل الفوري مع الدعم الفني المباشر</span>
          </div>

          <h3 className="text-xl font-bold text-[#0B1220]">
            فريق الدعم الفني جاهز لمساعدتك وإرشادك فور استلام إيصال التحويل
          </h3>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleSubscribe}
              className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-growix-gradient hover:bg-growix-gradient-hover text-white font-extrabold text-sm inline-flex items-center justify-center gap-2 shadow-lg shadow-[#0F9D58]/20 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>ابدأ الآن واختر باقتك</span>
            </button>

            <a
              href="/how-it-works"
              className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-gray-100 hover:bg-gray-200 text-[#0B1220] font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-colors border border-gray-200"
            >
              <span>تفاصيل طريقة الاشتراك والدفع</span>
              <ArrowLeft className="w-4 h-4 text-[#0F9D58]" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
