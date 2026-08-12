'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Copy, 
  Check, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  Layers,
  Wrench,
  Smartphone,
  CreditCard,
  PhoneCall,
  AlertCircle,
  Lock,
  Send,
  CheckSquare
} from 'lucide-react';
import { SITE_CONFIG, SITE_PRICING, PricingPackage } from '@/config/site';
import { GrowixLogo } from '@/components/GrowixLogo';
import { CustomToolSelector } from '@/components/CustomToolSelector';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createOrderAction } from '@/lib/actions/orders';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      const currentUrl = window.location.pathname + window.location.search;
      router.push(`/login?callbackUrl=${encodeURIComponent(currentUrl)}`);
    }
  }, [status, router]);

  const initialPkgParam = searchParams.get('package');
  const initialToolParam = searchParams.get('tool');

  const [userPkgId, setUserPkgId] = useState<string | null>(null);
  const [userToolId, setUserToolId] = useState<string | null>(null);

  const activePkgId = userPkgId ?? (
    initialPkgParam === 'single-tool' ? 'single-tool' :
    initialPkgParam === 'bundle-premium' ? 'bundle-premium' :
    'bundle-vip'
  );
  const selectedToolId = userToolId ?? (initialToolParam && SITE_CONFIG.tools.some((t) => t.id === initialToolParam) ? initialToolParam : SITE_CONFIG.tools[0].id);

  const setActivePkgId = (id: string) => setUserPkgId(id);
  const setSelectedToolId = (id: string) => setUserToolId(id);

  const [activePaymentMethod, setActivePaymentMethod] = useState<string>('electronic-wallet');
  const [senderNumber, setSenderNumber] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const currentPkg = SITE_CONFIG.packages.find((p) => p.id === activePkgId) || SITE_CONFIG.packages[0];
  const currentTool = SITE_CONFIG.tools.find((t) => t.id === selectedToolId) || SITE_CONFIG.tools[0];
  const currentPayment = SITE_CONFIG.paymentMethods.find((m) => m.id === activePaymentMethod) || SITE_CONFIG.paymentMethods[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOrderSubmit = async () => {
    if (!senderNumber || senderNumber.trim().length < 6) {
      setOrderMessage({ type: 'error', text: 'يرجى إدخال رقم المحفظة أو الحساب المحوّل منه أولاً' });
      return;
    }

    setIsSubmittingOrder(true);
    setOrderMessage(null);

    const res = await createOrderAction({
      packageId: currentPkg.id,
      toolId: currentPkg.id === 'single-tool' ? currentTool.id : undefined,
      paymentMethod: activePaymentMethod,
      senderNumber: senderNumber.trim(),
      amount: currentPkg.discountedPrice,
    });

    setIsSubmittingOrder(false);

    if (!res.success) {
      setOrderMessage({ type: 'error', text: res.error || 'حدث خطأ أثناء حفظ الطلب' });
    } else {
      const waText = `مرحباً فريق GROWIX 👋%0A%0Aأنا قمت بتحويل المبلغ لتأكيد اشتراكي:%0A- الباقة: ${encodeURIComponent(currentPkg.name)}%0A- المبلغ: ${currentPkg.discountedPrice} ${currentPkg.currency}%0A- طريقة الدفع: ${encodeURIComponent(currentPayment.name)}%0A- رقم المحفظة/الحساب المحول منه: ${encodeURIComponent(senderNumber.trim())}%0A- رقم الطلب: ${res.orderId}%0A%0Aبرجاء تفعيل حسابي فوراً وشكراً!`;
      const waUrl = `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${waText}`;

      // Start 3..2..1 Countdown for WhatsApp Redirect
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            window.open(waUrl, '_blank');
            router.push('/my-orders');
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-white flex flex-col dir-rtl font-sans selection:bg-[#0F9D58] selection:text-white">
      
      {/* Distraction-Free Header (No sales popups, no distracting ticker) */}
      <header className="bg-[#0B1220]/90 backdrop-blur-md sticky top-0 z-30 border-b border-white/10">
        <div className="max-w-5xl mx-auto py-3.5 px-4 sm:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <GrowixLogo theme="dark" iconSize={34} showSubtitle={false} />
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>دفع وتأكيد آمن 100%</span>
            </span>

            <Link
              href="/"
              className="text-xs font-bold text-gray-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
            >
              <span>الرئيسية</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#2ECC8F]" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area - Unified Sleek Dark Aesthetic */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-7">
        
        {/* Title Header Card */}
        <div className="bg-gradient-to-l from-white/10 via-white/5 to-transparent rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-white/10 shadow-2xl space-y-4">
          <div className="absolute top-0 left-0 w-80 h-80 bg-[#0F9D58]/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 bg-[#0F9D58]/20 text-[#2ECC8F] border border-[#2ECC8F]/30 rounded-full w-fit">
              <Sparkles className="w-4 h-4" />
              <span>صفحة تأكيد الاشتراك والتفعيل</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-300 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 w-fit">
              <Clock className="w-4 h-4 text-[#2ECC8F]" />
              <span>التفعيل فور التحويل خلال أقل من ساعة</span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">إتمام الطلب وتأكيد الاشتراك</h1>
            <p className="text-gray-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              اختر الباقة المناسبة، حول المبلغ بالطريقة المريحة لك، ثم أرسل إثبات الدفع عبر الواتساب لتشغيل حسابك فوراً.
            </p>
          </div>

          {/* Pricing Summary Banner */}
          <div className="p-4 bg-white/5 backdrop-blur rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10">
            <div>
              <span className="text-xs text-gray-400 block mb-0.5">المبلغ المطلوب تحويله حالياً:</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-[#2ECC8F]">
                  {currentPkg.discountedPrice} {currentPkg.currency}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  {currentPkg.originalPrice} {currentPkg.currency}
                </span>
                <span className="text-[11px] bg-[#2ECC8F]/20 text-[#2ECC8F] px-2 py-0.5 rounded-md font-bold">
                  خصم 75%
                </span>
              </div>
            </div>

            <div className="text-xs text-emerald-300 flex items-center gap-2 bg-[#0F9D58]/15 px-3.5 py-2 rounded-xl border border-[#0F9D58]/30">
              <ShieldCheck className="w-4 h-4 text-[#2ECC8F] shrink-0" />
              <span>تفعيل دائم مدى الحياة بدون اشتراكات</span>
            </div>
          </div>
        </div>

        {/* STEP 1: Package Selection Cards */}
        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 sm:p-7 border border-white/10 space-y-4 shadow-xl">
          <label className="block text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0F9D58]/20 text-[#2ECC8F] flex items-center justify-center font-black text-xs border border-[#0F9D58]/30">1</div>
            <span>اختر باقتك المفضلة:</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* VIP Package Card */}
            <button
              type="button"
              onClick={() => setActivePkgId('bundle-vip')}
              className={`p-4 rounded-2xl border text-right transition-all relative flex flex-col justify-between cursor-pointer ${
                activePkgId === 'bundle-vip'
                  ? 'bg-gradient-to-b from-[#0F172A] to-[#0B1220] border-[#2ECC8F] ring-2 ring-[#2ECC8F]/40 shadow-xl'
                  : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[11px] font-black px-2.5 py-1 rounded-md bg-amber-400 text-[#0B1220]">
                  VIP ({SITE_PRICING.vipPackagePrice} ج)
                </span>
                {activePkgId === 'bundle-vip' && (
                  <CheckCircle2 className="w-5 h-5 text-[#2ECC8F] shrink-0" />
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white mb-1">باقة VIP (كورسات + 12 أداة)</h3>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  أكثر من 1 تيرابايت كورسات على MEGA + الـ 12 أداة + داتا مصر.
                </p>
              </div>
            </button>

            {/* Premium Package Card */}
            <button
              type="button"
              onClick={() => setActivePkgId('bundle-premium')}
              className={`p-4 rounded-2xl border text-right transition-all relative flex flex-col justify-between cursor-pointer ${
                activePkgId === 'bundle-premium'
                  ? 'bg-gradient-to-b from-[#0F172A] to-[#0B1220] border-[#2ECC8F] ring-2 ring-[#2ECC8F]/40 shadow-xl'
                  : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[11px] font-black px-2.5 py-1 rounded-md bg-[#2ECC8F] text-[#0B1220]">
                  Premium ({SITE_PRICING.fullPackagePrice} ج)
                </span>
                {activePkgId === 'bundle-premium' && (
                  <CheckCircle2 className="w-5 h-5 text-[#2ECC8F] shrink-0" />
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white mb-1">باقة Premium (12 أداة)</h3>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  جميع الأدوات التسويقية الـ 12 بالكامل + هدية داتا مصر.
                </p>
              </div>
            </button>

            {/* Single Tool Card */}
            <button
              type="button"
              onClick={() => setActivePkgId('single-tool')}
              className={`p-4 rounded-2xl border text-right transition-all relative flex flex-col justify-between cursor-pointer ${
                activePkgId === 'single-tool'
                  ? 'bg-gradient-to-b from-[#0F172A] to-[#0B1220] border-[#2ECC8F] ring-2 ring-[#2ECC8F]/40 shadow-xl'
                  : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[11px] font-black px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  أداة واحدة ({SITE_PRICING.singleToolPrice} ج)
                </span>
                {activePkgId === 'single-tool' && (
                  <CheckCircle2 className="w-5 h-5 text-[#2ECC8F] shrink-0" />
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white mb-1">برنامج واحد محدد</h3>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  اختر أداة واحدة محددة من بين الـ 12 مع تفعيل دائم وشرح.
                </p>
              </div>
            </button>
          </div>

          {/* Custom Interactive Tool Selector */}
          {activePkgId === 'single-tool' && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 mt-3">
              <CustomToolSelector
                id="checkout-tool-selector"
                selectedToolId={selectedToolId}
                onSelectTool={(toolId) => setUserToolId(toolId)}
                label={`حدد البرنامج المطلوب (${SITE_PRICING.singleToolPrice} جنيه):`}
              />
            </div>
          )}
        </div>

        {/* STEP 2: Payment Method Selection */}
        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 sm:p-7 border border-white/10 space-y-4 shadow-xl">
          <label className="block text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0F9D58]/20 text-[#2ECC8F] flex items-center justify-center font-black text-xs border border-[#0F9D58]/30">2</div>
            <span>اختر طريقة التحويل (محفظة إلكترونية أو إنستاباي):</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SITE_CONFIG.paymentMethods.map((method) => {
              const isSelected = activePaymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setActivePaymentMethod(method.id)}
                  className={`p-4 rounded-2xl border text-right transition-all flex items-center gap-3 relative cursor-pointer ${
                    isSelected
                      ? 'border-[#2ECC8F] bg-[#0F9D58]/10 ring-2 ring-[#2ECC8F]/30 text-white'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-[#0F9D58] text-white' : 'bg-white/10 text-gray-400'
                  }`}>
                    {method.id === 'instapay' ? <CreditCard className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="block text-xs font-bold text-white truncate">{method.name}</span>
                    <span className="text-[11px] text-gray-400 block truncate">{method.type}</span>
                  </div>

                  {isSelected && <CheckCircle2 className="w-5 h-5 text-[#2ECC8F] shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Active Payment Details Box */}
          <div className="p-4 sm:p-5 bg-white/5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300">{currentPayment.type}:</span>
              <span className="text-[10px] text-[#2ECC8F] font-extrabold bg-[#0F9D58]/20 px-2.5 py-0.5 rounded-full border border-[#0F9D58]/30">
                تحويل مباشر
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 bg-[#0B1220] p-3.5 rounded-xl border border-white/10">
              <span className="font-black text-lg sm:text-xl text-[#2ECC8F] tracking-wider dir-ltr font-mono">
                {currentPayment.number}
              </span>

              <button
                type="button"
                onClick={() => handleCopy(currentPayment.number, currentPayment.id)}
                className={`py-2 px-3.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                  copiedId === currentPayment.id
                    ? 'bg-[#0F9D58] text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {copiedId === currentPayment.id ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ الرقم</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              {currentPayment.instructions}
            </p>
          </div>
        </div>

        {/* STEP 3: Phone Number Input & Submit Button */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-5 sm:p-7 space-y-5 shadow-xl">
          <label className="block text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0F9D58]/20 text-[#2ECC8F] flex items-center justify-center font-black text-xs border border-[#0F9D58]/30">3</div>
            <span>أدخل رقم الهاتف / الحساب الذي قمت بالتحويل منه:</span>
          </label>

          <div>
            <input
              type="tel"
              required
              value={senderNumber}
              onChange={(e) => setSenderNumber(e.target.value)}
              placeholder="مثال: 01012345678 أو عنوان إنستاباي المحوّل منه"
              className="w-full px-4 py-3.5 rounded-2xl bg-[#0B1220] border border-white/15 text-sm font-bold text-white placeholder:text-gray-500 placeholder:font-normal focus:outline-none focus:border-[#2ECC8F] focus:ring-2 focus:ring-[#2ECC8F]/20 transition-all dir-rtl"
            />
          </div>

          {orderMessage && (
            <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
              orderMessage.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-red-500/10 text-red-400 border border-red-500/30'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{orderMessage.text}</span>
            </div>
          )}

          {/* WhatsApp Submit Action Button */}
          <div className="space-y-2.5">
            <button
              type="button"
              disabled={isSubmittingOrder || countdown !== null}
              onClick={handleOrderSubmit}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-l from-[#0F9D58] to-[#2ECC8F] hover:opacity-95 active:scale-[0.99] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl shadow-[#0F9D58]/30 transition-all text-center cursor-pointer disabled:opacity-50"
            >
              <Send className="w-5 h-5 shrink-0" />
              <span>
                {isSubmittingOrder
                  ? 'جاري التسجيل...'
                  : countdown !== null
                  ? `جارٍ التوجيه للواتساب خلال (${countdown})...`
                  : 'تأكيد وإرسال الإثبات عبر الواتساب'}
              </span>
            </button>

            {/* Clear WhatsApp Explanation Text */}
            <p className="text-[11px] text-gray-400 text-center font-medium leading-relaxed">
              بمجرد الضغط على الزر، سيتم فتح تطبيق الواتساب مباشرة مجهزاً بنص الرسالة الذي يتضمن بيانات تحويلك ورقم طلبك لتأكيد التفعيل فوريًا.
            </p>
          </div>
        </div>

        {/* What Happens Next Timeline Banner (شريط الخطوات التوضيحية) */}
        <div className="bg-gradient-to-l from-white/5 to-white/2 border border-white/10 rounded-3xl p-6 space-y-4 shadow-sm">
          <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#2ECC8F]" />
            <span>ماذا يحدث بعد التحويل والإرسال؟</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5 space-y-1">
              <span className="text-[#2ECC8F] font-black block">1. إرسال الرسالة</span>
              <p className="text-gray-400 text-[11px]">يفتح تطبيق الواتساب وبداخل الرسالة بيانات الطلب تلقائياً.</p>
            </div>

            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5 space-y-1">
              <span className="text-[#2ECC8F] font-black block">2. المطابقة المالية</span>
              <p className="text-gray-400 text-[11px]">يقوم فريق الدعم بمراجعة وتأكيد إيصال التحويل مع حساب البنك.</p>
            </div>

            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5 space-y-1">
              <span className="text-[#2ECC8F] font-black block">3. التفعيل الفوري</span>
              <p className="text-gray-400 text-[11px]">يتم فتح الأدوات والدورة في صفحة طلباتك خلال أقل من 60 دقيقة.</p>
            </div>
          </div>
        </div>

      </main>

      {/* Distraction-Free Minimal Footer (No sales links / CTAs) */}
      <footer className="py-6 border-t border-white/10 text-center text-xs text-gray-500">
        <p suppressHydrationWarning>© {new Date().getFullYear()} GROWIX — جميع الحقوق محفوظة | عملية دفع وتأكيد مشفرة 100%</p>
      </footer>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0B1220] text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#2ECC8F] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-300 font-bold">جاري تحميل صفحة الدفع والتأكيد...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
