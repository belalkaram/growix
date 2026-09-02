import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/queries';
import { auth } from '@/lib/auth';
import { HeaderNavbar } from '@/components/HeaderNavbar';
import { Footer } from '@/components/Footer';
import { SITE_CONFIG, SITE_PRICING } from '@/config/site';
import { 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  ShoppingCart, 
  Bot, 
  Palette, 
  Search, 
  PenTool, 
  Briefcase, 
  FolderOpen, 
  HardDrive, 
  Cloud, 
  Download, 
  Zap, 
  ShieldCheck, 
  Clock, 
  Star, 
  ArrowLeft, 
  PlayCircle,
  HelpCircle,
  Check,
  ExternalLink,
  MessageSquare,
  Flame,
  Award
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'مكتبة كورسات الـ 500 جيجا الشاملة في التسويق والتجارة والذكاء الاصطناعي | GROWIX',
  description: 'أقوى مكتبة سحابية لكورسات التسويق الإلكتروني، الميديا باينج، التجارة الإلكترونية، الدروب شيبنج، التصميم، المونتاج، والذكاء الاصطناعي (+500 GB MEGA). اشترك الآن بـ 200 جنيه فقط.',
};

export default async function CoursesLandingPage() {
  const [siteSettings, session] = await Promise.all([
    getSiteSettings(),
    auth(),
  ]);

  const courseDomains = [
    {
      id: 'media-buying',
      icon: TrendingUp,
      badge: 'الأعلى طلباً 🚀',
      badgeColor: 'from-emerald-500 to-green-400',
      title: '1. إعلانات السوشيال ميديا والميديا باينج المتقدم',
      desc: 'احترف إدارة الميزانيات الإعلانية وتحقيق أعلى عائد مبيعات (ROAS) على جميع المنصات.',
      size: '120+ GB',
      items: [
        'كورس إعلانات فيسبوك وانستجرام من الصفر للاحتراف (Meta Ads Mastery)',
        'كورس إعلانات تيك توك وسكالينج الحملات (TikTok Ads Scaling Secrets)',
        'كورس إعلانات جوجل وشبكة البحث واليوتيوب (Google & YouTube Ads)',
        'كورس إعلانات سناب شات واستهداف السوق الخليجي والمحلي (Snapchat Ads)',
        'أسرار تتبع الـ Pixel والـ CAPI وتجاوز قيود وتحديثات iOS'
      ]
    },
    {
      id: 'ecommerce',
      icon: ShoppingCart,
      badge: 'مبيعات وأرباح 💰',
      badgeColor: 'from-amber-500 to-yellow-400',
      title: '2. التجارة الإلكترونية والدروب شيبنج (E-Commerce & COD)',
      desc: 'بناء وإطلاق المتاجر الإلكترونية المربحة، اختيار المنتجات الرابحة، وإدارة الشحن والتأكيد.',
      size: '95+ GB',
      items: [
        'إنشاء وتصميم المتاجر الاحترافية على Shopify و YouCan',
        'استراتيجيات الدفع عند الاستلام (COD) في مصر والوطن العربي والخليج',
        'طرق التجسس على المنافسين واستخراج المنتجات الأكثر مبيعاً (Winning Products)',
        'إدارة المخازن، التوريد، وتقليل نسبة المرتجعات ورفع تأكيد الأوردرات'
      ]
    },
    {
      id: 'ai-automation',
      icon: Bot,
      badge: 'توفير وقت ومجهود 🤖',
      badgeColor: 'from-blue-500 to-cyan-400',
      title: '3. الذكاء الاصطناعي والأتمتة في التسويق (AI & Automation)',
      desc: 'تسخير أدوات الذكاء الاصطناعي لصناعة المحتوى، كتابة الإعلانات، وأتمتة خدمة العملاء.',
      size: '60+ GB',
      items: [
        'هندسة الأوامر المتقدمة (Prompt Engineering) لـ ChatGPT و Claude',
        'توليد الصور الإعلانية والتصاميم التجارية بـ Midjourney بدقة مذهلة',
        'بناء بوتات وأتمتة الردود التلقائية لرسائل واتساب وماسنجر',
        'إنتاج فيديوهات الذكاء الاصطناعي بصوت واقعي وشخصيات افتراضية'
      ]
    },
    {
      id: 'design-video',
      icon: Palette,
      badge: 'محتوى فيروسي 🎬',
      badgeColor: 'from-purple-500 to-pink-400',
      title: '4. التصميم الجرافيكي وصناعة الفيديو والمونتاج',
      desc: 'صناعة التصاميم الإعلانية الجذابة ومونتاج فيديوهات الـ Reels والـ TikTok التي تضاعف المبيعات.',
      size: '110+ GB',
      items: [
        'أساسيات واحتراف الفوتوشوب والإليستريتور للمسوّقين (Photoshop & Illustrator)',
        'مونتاج الفيديوهات الإعلانية والريلز والشوربس على Premiere Pro و CapCut',
        'صناعة فيديوهات الوايت بورد والموشن جرافيك السريعة والمقنعة',
        'أسرار الـ Hooks البصرية لجذب انتباه العميل في أول 3 ثوانٍ'
      ]
    },
    {
      id: 'seo-content',
      icon: Search,
      badge: 'زيارات مجانية 📈',
      badgeColor: 'from-teal-500 to-emerald-400',
      title: '5. تحسين محركات البحث والسيو وتصدر جوجل (SEO)',
      desc: 'كيف تجعل موقعك أو متجرك في النتيجة الأولى على جوجل بدون دفع تكاليف إعلانية.',
      size: '45+ GB',
      items: [
        'السيو الداخلي (On-Page SEO) واستخراج الكلمات المفتاحية الأكثر ربحية',
        'السيو الخارجي وبناء الروابط الخلفية القوية (Backlinks & Domain Authority)',
        'سيو المتاجر الإلكترونية وتصدر صفحات المنتجات لنتائج البحث المجانية',
        'التحليل الفني للمواقع والسرعة وتجربة المستخدم (Technical SEO)'
      ]
    },
    {
      id: 'copywriting',
      icon: PenTool,
      badge: 'إقناع العميل ✍️',
      badgeColor: 'from-rose-500 to-orange-400',
      title: '6. كتابة النصوص الإعلانية والـ Copywriting والبيع',
      desc: 'فن صياغة العبارات والنصوص التي تجعل العميل يشتري فوراً بدون تردد.',
      size: '40+ GB',
      items: [
        'معادلات الـ Copywriting العالمية لكتابة إعلانات تحقق أعلى نسب نقر ومبيعات',
        'صناعة العرض الذي لا يُقاوم (The Irresistible Offer) وتسعير المنتجات',
        'سيكولوجية اتخاذ قرار الشراء وكيفية معالجة اعتراضات العملاء (Handling Objections)',
        'نماذج نصوص إعلانية وسكريبتات بيع جاهزة للتطبيق الفوري'
      ]
    },
    {
      id: 'freelancing-agency',
      icon: Briefcase,
      badge: 'بناء بيزنس 🏢',
      badgeColor: 'from-indigo-500 to-blue-400',
      title: '7. بناء وكالات التسويق والعمل كفريلانسر محترف',
      desc: 'تحويل مهاراتك التسويقية إلى دخل شهري مستمر والتعامل مع كبرى الشركات والعملاء.',
      size: '50+ GB',
      items: [
        'كيفية الحصول على عملاء بميزانيات عالية في مصر والخليج',
        'تسعير خدمات التسويق وصياغة العقود وتقارير الأداء الاحترافية',
        'أسرار غلق الصفقات الكبيرة وإدارة حسابات الشركات كـ Freelancer أو Agency'
      ]
    }
  ];

  const courseStats = [
    { value: '+500 GB', label: 'محتوى سحابي مسجل' },
    { value: '+30', label: 'كورس تدريبي تطبيقي' },
    { value: '+1,500', label: 'فيديو وشرح عملي' },
    { value: 'مدى الحياة', label: 'وصول دائم وتحديثات' },
  ];

  const megaAdvantages = [
    {
      title: 'سيرفرات MEGA السريعة والمباشرة',
      desc: 'روابط تحميل سريعة تدعم استئناف التحميل في أي وقت بدون روابط معقدة أو إعلانات مزعجة.'
    },
    {
      title: 'مشاهدة مباشرة بدون تنزيل (Streaming)',
      desc: 'يمكنك مشاهدة الفيديوهات مباشرة أونلاين على متصفحك أو هاتفك بدون استهلاك مساحة جهازك.'
    },
    {
      title: 'مجلدات مقسمة ومصنفة بدقة',
      desc: 'كل مجال وكل كورس مفصول في مجلد منظم يحتوي على الفيديوهات، الملفات، والأدوات الخاصة به.'
    },
    {
      title: 'تحديثات مستمرة تضاف لحسابك',
      desc: 'أي كورسات أو تحديثات جديدة نقوم بإضافتها للسيرفر تظهر في حسابك تلقائياً وبشكل مجاني.'
    }
  ];

  return (
    <main className="min-h-screen bg-[#070C1A] text-white font-sans selection:bg-[#00FF87] selection:text-[#0A1128]" dir="rtl">
      <HeaderNavbar session={session} settings={siteSettings} />

      {/* Cyber Glowing Background Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-[#00FF87]/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] bg-[#38BDF8]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-[#0F9D58]/15 rounded-full blur-[130px]" />
      </div>

      {/* ─── HERO SECTION ─── */}
      <section className="pt-32 sm:pt-40 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative z-10 text-center space-y-8">
        
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00FF87]/15 text-[#00FF87] border border-[#00FF87]/30 text-xs sm:text-sm font-black shadow-lg shadow-[#00FF87]/15">
          <Flame className="w-4 h-4 text-[#00FF87] animate-pulse" />
          <span>المكتبة السحابية الأضخم في الوطن العربي (+500 GB MEGA)</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight sm:leading-tight">
            امتلك كنز كورسات التسويق والتجارة والذكاء الاصطناعي{' '}
            <span className="bg-gradient-to-l from-[#00FF87] to-[#2ECC8F] text-transparent bg-clip-text">
              بأكثر من 500 جيجابايت
            </span>
          </h1>
          <p className="text-gray-300 text-sm sm:text-lg leading-relaxed max-w-3xl mx-auto">
            أكثر من 30 كورس عملي مسجل، تغطي أسرار الميديا باينج، إعلانات السوشيال ميديا، الدروب شيبنج، السيو، التصميم، المونتاج، وكتابة الإعلانات. منظمة ومتاحة على سيرفرات MEGA السحابية السريعة مدى الحياة.
          </p>
        </div>

        {/* Pricing & CTA Banner */}
        <div className="max-w-xl mx-auto bg-gradient-to-br from-[#0F1E36] via-[#0F172A] to-[#070C1A] p-6 sm:p-8 rounded-3xl border border-[#00FF87]/40 shadow-2xl space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF87]/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="text-right">
              <span className="text-xs text-gray-400 block font-bold">السعر المخفض لفترة محدودة:</span>
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl sm:text-4xl font-black text-[#00FF87] font-mono">
                  200 جنية
                </span>
                <span className="text-sm sm:text-base text-gray-500 line-through font-mono">
                  1000 جنية
                </span>
                <span className="text-xs bg-[#00FF87]/20 text-[#00FF87] px-2 py-0.5 rounded-md font-black border border-[#00FF87]/30">
                  خصم 80% 🔥
                </span>
              </div>
            </div>

            <span className="text-xs font-black text-white bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
              تفعيل سحابي فوري ⚡
            </span>
          </div>

          <div className="space-y-3">
            <Link
              href="/checkout?package=courses-500gb"
              className="w-full py-4 px-6 rounded-2xl bg-[#00FF87] hover:bg-[#00E676] active:scale-95 text-[#0A1128] font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-xl shadow-[#00FF87]/25 transition-all cursor-pointer"
            >
              <span>احصل على باقة الـ 500 جيجا الآن (200 ج)</span>
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#00FF87]" />
                <span>دفع وتأكيد آمن</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-[#00FF87]" />
                <span>تفعيل فوري خلال دقائق</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Cloud className="w-4 h-4 text-[#38BDF8]" />
                <span>سيرفرات MEGA سريعة</span>
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6">
          {courseStats.map((st, idx) => (
            <div key={idx} className="bg-[#0F172A]/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 text-center space-y-1">
              <span className="text-xl sm:text-3xl font-black text-[#00FF87] font-mono block">{st.value}</span>
              <span className="text-xs sm:text-sm text-gray-300 font-bold block">{st.label}</span>
            </div>
          ))}
        </div>

      </section>

      {/* ─── THE 7 MEGA COURSE DOMAINS (تفاصيل محتويات الـ 500 جيجا) ─── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12 relative z-10">
        
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-black px-3.5 py-1.5 rounded-full bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30">
            <FolderOpen className="w-4 h-4" />
            <span>خريطة ومجالات الكورسات الشاملة</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            ماذا ستجد داخل مجلدات الـ +500 جيجا على MEGA؟
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
            تم ترتيب وتصنيف المحتوى في مجلدات سحابية منظمة تغطي كافة مهارات التسويق والبيزنس المطلوبة في سوق العمل لعام 2026.
          </p>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courseDomains.map((domain) => {
            const Icon = domain.icon;
            return (
              <div 
                key={domain.id}
                className="bg-[#0F172A]/90 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-white/10 hover:border-[#00FF87]/40 transition-all duration-300 shadow-xl space-y-5 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  
                  {/* Header of card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#00FF87]/15 text-[#00FF87] flex items-center justify-center font-black shrink-0 border border-[#00FF87]/30 shadow-md">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className={`text-[10px] bg-gradient-to-r ${domain.badgeColor} text-[#0A1128] px-2.5 py-0.5 rounded-full font-black inline-block mb-1`}>
                          {domain.badge}
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-white group-hover:text-[#00FF87] transition-colors">
                          {domain.title}
                        </h3>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-black text-[#00FF87] bg-[#00FF87]/10 px-2.5 py-1 rounded-xl border border-[#00FF87]/20 shrink-0">
                      {domain.size}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed font-medium">
                    {domain.desc}
                  </p>

                  {/* Checklist of sub-courses */}
                  <div className="space-y-2 pt-3 border-t border-white/10 text-xs">
                    {domain.items.map((item, iIdx) => (
                      <div key={iIdx} className="flex items-start gap-2 text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-[#00FF87] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>

                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1.5 font-bold text-gray-300">
                    <Cloud className="w-4 h-4 text-[#38BDF8]" />
                    <span>مجلد MEGA منظم وسحابي</span>
                  </span>
                  <span className="text-[11px] text-[#00FF87] font-bold">
                    جاهز للمشاهدة والتحميل 📥
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* ─── WHY MEGA CLOUD SECTION ─── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10 relative z-10">
        
        <div className="bg-gradient-to-br from-[#0B1528] to-[#070C1A] p-8 sm:p-12 rounded-3xl border border-white/15 shadow-2xl space-y-8">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-black px-3.5 py-1.5 rounded-full bg-[#00FF87]/15 text-[#00FF87] border border-[#00FF87]/30">
              <Cloud className="w-4 h-4" />
              <span>تجربة سحابية فائقة السهولة والسرعة</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              لماذا رفعنا الكورسات على سيرفرات MEGA السحابية؟
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              لنوفر لك تجربة تعليمية مريحة جداً بدون تعقيد وبدون الحاجة لامتلاك مساحة تخزين ضخمة على هاتفك أو كمبيوترك.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {megaAdvantages.map((adv, idx) => (
              <div key={idx} className="bg-[#0F172A] p-5 rounded-2xl border border-white/10 space-y-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#00FF87]/15 text-[#00FF87] flex items-center justify-center font-black text-xs">
                  0{idx + 1}
                </div>
                <h3 className="text-sm font-black text-white">{adv.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{adv.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* ─── FINAL PRICING & CALL TO ACTION ─── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-8 relative z-10">
        
        <div className="bg-gradient-to-b from-[#0F1E36] to-[#0B1220] p-8 sm:p-12 rounded-3xl border-2 border-[#00FF87]/40 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-80 h-80 bg-[#00FF87]/15 rounded-full blur-3xl pointer-events-none" />
          
          <span className="text-xs sm:text-sm font-black text-[#00FF87] bg-[#00FF87]/15 px-4 py-1.5 rounded-full border border-[#00FF87]/30 inline-block">
            💎 استثمارك الأفضل في مستقبلك التسويقي
          </span>

          <h2 className="text-2xl sm:text-4xl font-black text-white">
            احصل على مكتبة الـ 500 جيجا كاملة بـ 200 جنية فقط!
          </h2>

          <p className="text-gray-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            دفع لمرة واحدة فقط بدون أي اشتراكات شهرية متكررة. تفعيل فوري ومباشر على حسابك مع كافة التحديثات القادمة.
          </p>

          <div className="pt-2">
            <Link
              href="/checkout?package=courses-500gb"
              className="inline-flex items-center justify-center gap-3 py-4.5 px-10 rounded-2xl bg-[#00FF87] hover:bg-[#00E676] active:scale-95 text-[#0A1128] font-black text-base sm:text-lg shadow-2xl shadow-[#00FF87]/30 transition-all cursor-pointer hover:scale-105"
            >
              <span>اشترك الآن واستلم الكورسات فوراً (200 ج)</span>
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#00FF87]" />
              <span>فودافون كاش / إنستاباي</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#00FF87]" />
              <span>دعم فني عبر الواتساب 24/7</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#00FF87]" />
              <span>وصول دائم بدون انتهاء</span>
            </span>
          </div>

        </div>

      </section>

      {/* ─── FAQS ─── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 relative z-10">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-black px-3.5 py-1.5 rounded-full bg-[#00FF87]/15 text-[#00FF87] border border-[#00FF87]/30">
            <HelpCircle className="w-4 h-4" />
            <span>الأسئلة الشائعة عن باقة الكورسات</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">إجابات أهم الاستفسارات</h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'كيف أصل إلى الكورسات بعد إتمام الدفع؟',
              a: 'بمجرد تأكيد الطلب، يتم تفعيل حسابك فوراً، وستجد داخل لوحة «طلباتي وحسابي» قسماً مخصصاً يحتوي على جميع روابط مجلدات الـ MEGA مقسمة ومصنفة، ويمكنك الضغط على أي مجلد لفتحه أو مشاهدته أو تحميله بنقرة واحدة.'
            },
            {
              q: 'هل أحتاج لدفع اشتراك شهري في MEGA للمشاهدة؟',
              a: 'لا نهائياً! يمكنك المشاهدة مجاناً أو تحميل ما تحتاجه على هاتفك أو حاسوبك بدون أي اشتراكات إضافية.'
            },
            {
              q: 'هل الكورسات مناسبة للمبتدئين أم تتطلب خبرة سابقة؟',
              a: 'الكورسات تبدأ معك من الصفر التام خطوة بخطوة بالشرح العملي والصوت والصورة حتى الاحتراف المتقدم في كل مجال.'
            },
            {
              q: 'هل باقة الكورسات تشمل البرامج والأدوات الـ 12؟',
              a: 'هذه الباقة مخصصة فقط لمكتبة الكورسات الـ 500 جيجا. إذا كنت تريد امتلاك البرامج الـ 12 + الكورسات معاً، يمكنك اختيار باقة VIP الشاملة من الشيك أوت.'
            }
          ].map((faq, fIdx) => (
            <div key={fIdx} className="bg-[#0F172A] p-5 sm:p-6 rounded-2xl border border-white/10 space-y-2 text-right">
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#00FF87]/15 text-[#00FF87] flex items-center justify-center font-bold text-xs shrink-0">؟</span>
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed pr-8 font-medium">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

      </section>

      <Footer settings={siteSettings} />
    </main>
  );
}
