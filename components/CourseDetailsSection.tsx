'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SITE_CONFIG } from '@/config/site';
import { 
  GraduationCap, 
  CheckCircle2, 
  Play, 
  Target, 
  Sparkles, 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Layers, 
  Check, 
  Award,
  Video
} from 'lucide-react';

interface CourseDetailsSectionProps {
  onOpenPaymentModal: () => void;
}

export const CourseDetailsSection: React.FC<CourseDetailsSectionProps> = ({ onOpenPaymentModal }) => {
  const [activeAudienceTab, setActiveAudienceTab] = useState<number>(0);

  return (
    <section id="course" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0F9D58]/10 text-[#0F9D58] text-xs font-extrabold">
            <GraduationCap className="w-4 h-4" />
            <span>المحتوى التعليمي والتطبيقي</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B1220]">
            {SITE_CONFIG.course.title}
          </h2>

          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
            {SITE_CONFIG.course.subtitle}
          </p>
        </div>

        {/* Main Course Details Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
          
          {/* Right Column: Course Features Checklist */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 bg-[#F7F9FA] rounded-3xl border border-gray-200 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0F9D58] uppercase">
                <Video className="w-4 h-4" />
                <span>فيديوهات مسجلة شرح صوت وصورة HD</span>
              </div>

              <h3 className="text-2xl font-bold text-[#0B1220]">
                ماذا ستتعلم في كورس التسويق الإلكتروني من GROWIX؟
              </h3>

              <p className="text-sm text-gray-600 leading-relaxed">
                {SITE_CONFIG.course.description}
              </p>

              {/* Topics List */}
              <div className="space-y-3 pt-2">
                {SITE_CONFIG.course.topics.map((topic, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-[#0F9D58]/15 text-[#0F9D58] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-[#0B1220]">{topic}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Left Column: Interactive Visual Highlights */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-8 bg-[#0B1220] text-white rounded-3xl relative overflow-hidden shadow-2xl space-y-6">
              <div className="absolute top-0 left-0 w-32 h-32 bg-[#2ECC8F]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs text-[#2ECC8F] font-bold border border-white/10">
                <Award className="w-4 h-4 text-[#2ECC8F]" />
                <span>تطبيق عملي 100%</span>
              </div>

              <h4 className="text-2xl font-black leading-snug">
                تعلم استراتيجيات التسويق الحديثة التي تجلب العملاء أوتوماتيكياً
              </h4>

              <div className="space-y-3 text-xs text-gray-300">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#2ECC8F]" />
                    <span>مرونة الوقت:</span>
                  </span>
                  <span className="font-bold text-white">وصول دائم 24/7</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#2ECC8F]" />
                    <span>أسلوب الشرح:</span>
                  </span>
                  <span className="font-bold text-white">خطوة بخطوة بالعامية الفصحى</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#2ECC8F]" />
                    <span>المُحتوى:</span>
                  </span>
                  <span className="font-bold text-white">تحديثات دورية مجانية</span>
                </div>
              </div>

              <button
                onClick={() => onOpenPaymentModal()}
                className="w-full py-4 px-6 rounded-2xl bg-growix-gradient hover:bg-growix-gradient-hover text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#0F9D58]/30 transition-all hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4" />
                <span>اشترك في الكورس المباشر الآن</span>
              </button>
            </div>
          </div>

        </div>

        {/* "لمين هذا الكورس؟" Target Audience Section */}
        <div className="space-y-8 pt-6">
          <div className="text-center max-w-xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-black text-[#0B1220] mb-2">
              لمين هذا الكورس والباقة؟
            </h3>
            <p className="text-sm text-gray-600">
              تم إعداد الكورس والأدوات لخدمة كافة القطاعات الراغبة في التوسع الرقمي:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SITE_CONFIG.course.audience.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="p-6 rounded-3xl bg-[#F7F9FA] border border-gray-200 hover:border-[#0F9D58] hover:bg-white hover:shadow-lg transition-all space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B1220] text-[#2ECC8F] flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                    0{idx + 1}
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-[#0B1220] leading-snug">{item.title}</h4>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed pt-1">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
