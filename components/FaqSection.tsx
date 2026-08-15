'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SITE_CONFIG, FAQItem } from '@/config/site';
import { ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';

interface FaqSectionProps {
  faqs?: FAQItem[];
}

export const FaqSection: React.FC<FaqSectionProps> = ({ faqs }) => {
  const faqList = faqs && faqs.length > 0 ? faqs : SITE_CONFIG.faqs;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-[#F7F9FA] relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B1220] text-[#2ECC8F] text-xs font-black shadow-sm">
            <HelpCircle className="w-4 h-4 text-[#2ECC8F]" />
            <span>الأسئلة الشائعة والإجابات</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-[#0B1220]">
            لديك استفسار؟ <span className="text-growix-gradient">إليك الإجابات</span>
          </h2>

          <p className="text-gray-600 text-sm sm:text-base">
            إليك إجابات لأكثر الأسئلة تكراراً حول كيفية الاشتراك والتفعيل والأدوات المتاحة.
          </p>
        </div>

        {/* Accordion List - Top 4 Questions */}
        <div className="space-y-4">
          {faqList.slice(0, 4).map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(idx)}
                  className="w-full p-5 text-right font-bold text-sm sm:text-base text-[#0B1220] flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#0F9D58]/10 text-[#0F9D58] text-xs flex items-center justify-center shrink-0 font-bold">
                      ؟
                    </span>
                    {faq.question}
                  </span>

                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-[#0F9D58]' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/30">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* CTA to Full FAQ Page & Direct WhatsApp */}
        <div className="mt-12 text-center space-y-4">
          <div>
            <a
              href="/faq"
              className="inline-flex items-center gap-2 py-3.5 px-8 rounded-2xl bg-white border border-[#0F9D58] text-[#0F9D58] hover:bg-[#0F9D58] hover:text-white font-extrabold text-xs sm:text-sm shadow-sm transition-all hover:scale-105"
            >
              <span>شاهد جميع الأسئلة الشائعة والإجابات</span>
            </a>
          </div>

          <p className="text-xs text-gray-500">
            لم تجد إجابة لسؤالك؟ نحن هنا لمساعدتك على مدار الساعة عبر الواتساب.
          </p>
        </div>

      </div>
    </section>
  );
};
