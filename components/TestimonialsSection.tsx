'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { SITE_CONFIG } from '@/config/site';
import { Star, ShieldCheck, Quote, ThumbsUp } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F9D58]/10 text-[#0F9D58] text-xs font-black">
            <ThumbsUp className="w-4 h-4" />
            <span>آراء وتجارب مشتركين GROWIX</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-[#0B1220]">
            ماذا يقول عملاؤنا بعد استخدام <span className="text-growix-gradient">الأدوات والكورس؟</span>
          </h2>

          <p className="text-gray-600 text-sm sm:text-base">
            تجارب نجاح حقيقية لأصحاب مشاريع ومسوّقين تضاعفت أعمالهم معنا.
          </p>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SITE_CONFIG.testimonials.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="p-8 rounded-3xl bg-[#F7F9FA] border border-gray-200 flex flex-col justify-between shadow-sm hover:shadow-lg hover:border-[#0F9D58] transition-all relative"
            >
              <Quote className="w-10 h-10 text-[#0F9D58]/15 absolute top-6 left-6" />

              <div>
                {/* Star Rating */}
                <div className="flex items-center gap-1 mb-4 text-amber-400">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium mb-6 relative z-10">
                  &quot;{item.content}&quot;
                </p>
              </div>

              {/* Author Footer */}
              <div className="pt-4 border-t border-gray-200/80 flex items-center gap-3">
                <Image
                  src={item.avatar}
                  alt={item.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#0F9D58]"
                  unoptimized
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-[#0B1220]">{item.name}</h4>
                    {item.verified && (
                      <span title="مشترك موثّق">
                        <ShieldCheck className="w-4 h-4 text-[#0F9D58]" />
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-500 block">{item.role}</span>
                  <span className="text-[10px] text-[#0F9D58] font-bold block mt-0.5">{item.packageTaken}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
