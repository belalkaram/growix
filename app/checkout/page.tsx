'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
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
  HelpCircle
} from 'lucide-react';
import { SITE_CONFIG, SITE_PRICING, PricingPackage } from '@/config/site';
import { GrowixLogo } from '@/components/GrowixLogo';
import { PromoAnnouncementBar } from '@/components/PromoAnnouncementBar';
import { CustomToolSelector } from '@/components/CustomToolSelector';
import { Footer } from '@/components/Footer';
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

  // User selection overrides (null means fall back to searchParams)
  const [userPkgId, setUserPkgId] = useState<string | null>(null);
  const [userToolId, setUserToolId] = useState<string | null>(null);

  const activePkgId = userPkgId ?? (initialPkgParam === 'single-tool' ? 'single-tool' : 'bundle-vip');
  const selectedToolId = userToolId ?? (initialToolParam && SITE_CONFIG.tools.some((t) => t.id === initialToolParam) ? initialToolParam : SITE_CONFIG.tools[0].id);

  const setActivePkgId = (id: string) => setUserPkgId(id);
  const setSelectedToolId = (id: string) => setUserToolId(id);

  // Payment method selection ('electronic-wallet' or 'instapay')
  const [activePaymentMethod, setActivePaymentMethod] = useState<string>('electronic-wallet');
  
  // Sender phone number / account input box state
  const [senderNumber, setSenderNumber] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
      setOrderMessage({
        type: 'success',
        text: 'تم تسليم طلبك بنجاح وفي انتظار مراجعة وقبول الأدمن! جارٍ التوجيه للواتساب لارسال الإثبات المالي...',
      });

      // Construct WhatsApp message URL
      const text = `مرحباً فريق GROWIX 👋%0A%0Aأنا قمت بتحويل المبلغ لتأكيد اشتراكي:%0A- الباقة: ${encodeURIComponent(currentPkg.name)}%0A- المبلغ: ${currentPkg.discountedPrice} ${currentPkg.currency}%0A- طريقة الدفع: ${encodeURIComponent(currentPayment.name)}%0A- رقم المحفظة/الحساب المحول منه: ${encodeURIComponent(senderNumber.trim())}%0A- رقم الطلب: ${res.orderId}%0A%0Aبرجاء تفعيل حسابي فوراً وشكراً!`;
      const waUrl = `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${text}`;

      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 1000);
    }
  };

  // Generate WhatsApp pre-filled message with sender phone number
  const generateWhatsAppUrl = () => {
    let message = '';
    const senderInfoText = senderNumber.trim() ? senderNumber.trim() : 'لم يتم إدخاله';

    if (currentPkg.id === 'single-tool') {
      message = `مرحباً فريق GROWIX!\nلقد قمت بتحويل مبلغ ${currentPkg.discountedPrice} ${currentPkg.currency} لشراء برنامج: [${currentTool.name}].\n\n📌 البيانات والتحويل:\n- طريقة التحويل: ${currentPayment.name}\n- رقم/حساب المحوِّل منه: ${senderInfoText}\n\nيرجى الاطلاع على صورة إيصال التحويل المرفقة وتفعيل حسابي وشرح الأداة. شكراً لكم!`;
    } else {
      message = `مرحباً فريق GROWIX!\nلقد قمت بتحويل مبلغ ${currentPkg.discountedPrice} ${currentPkg.currency} لشراء [${currentPkg.name}].\n\n📌 البيانات والتحويل:\n- طريقة التحويل: ${currentPayment.name}\n- رقم/حساب المحوِّل منه: ${senderInfoText}\n\nيرجى الاطلاع على صورة إيصال التحويل المرفقة وتفعيل حسابي وشرح الأدوات والكورس. شكراً لكم!`;
    }
    const text = encodeURIComponent(message);
    return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-[#F7F9FA] text-[#0B1220] flex flex-col dir-rtl">
      {/* Checkout Navbar */}
      <header className="bg-[#0B1220] text-white sticky top-0 z-30 backdrop-blur-md bg-[#0B1220]/95 border-b border-white/10">
        <PromoAnnouncementBar />
        <div className="max-w-5xl mx-auto py-3.5 px-4 sm:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <GrowixLogo theme="dark" iconSize={32} showSubtitle={false} />
          </Link>

          <Link
            href="/"
            className="text-xs sm:text-sm font-bold text-gray-300 hover:text-white flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/15"
          >
            <ArrowRight className="w-4 h-4 text-[#2ECC8F]" />
            <span>العودة للرئيسية</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        
        {/* Title Header Card */}
        <div className="bg-[#0B1220] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl border border-white/10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-[#0F9D58]/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 bg-[#0F9D58]/20 text-[#2ECC8F] border border-[#2ECC8F]/30 rounded-full w-fit">
              <Sparkles className="w-4 h-4" />
              <span>صفحة الدفع والتفعيل المباشر</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-300 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 w-fit">
              <Clock className="w-4 h-4 text-[#2ECC8F]" />
              <span>التفعيل يتم خلال أقل من ساعة</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black mb-2">إتمام الطلب وتفعيل الحساب</h1>
          <p className="text-gray-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            حدد الباقة المطلوبة، أدخل الرقم أو الحساب الذي قمت بالتحويل منه، واكتمال العملية عبر الواتساب لتلقي تفعيلك فوراً.
          </p>

          {/* Pricing Highlight Box */}
          <div className="mt-6 p-4 bg-white/10 backdrop-blur rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-white/10">
            <div>
              <span className="text-xs text-gray-300 block mb-0.5">المبلغ المطلوب تحويله:</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-[#2ECC8F]">
                  {currentPkg.discountedPrice} {currentPkg.currency}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  {currentPkg.originalPrice} {currentPkg.currency}
                </span>
                <span className="text-xs bg-[#2ECC8F]/20 text-[#2ECC8F] px-2 py-0.5 rounded-md font-bold">
                  خصم لفترة محدودة
                </span>
              </div>
            </div>

            <div className="text-xs text-gray-200 flex items-center gap-2 bg-[#2ECC8F]/10 px-3.5 py-2 rounded-xl border border-[#2ECC8F]/20">
              <ShieldCheck className="w-4 h-4 text-[#2ECC8F] shrink-0" />
              <span>تفعيل دائم بدون اشتراكات شهرية</span>
            </div>
          </div>
        </div>

        {/* STEP 1: Package Selection */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-200 space-y-4">
          <label className="block text-sm sm:text-base font-extrabold text-[#0B1220] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#0F9D58]" />
            <span>1. اختر الباقة المناسبة لك:</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* VIP Bundle Card */}
            <button
              type="button"
              onClick={() => setActivePkgId('bundle-vip')}
              className={`p-4 rounded-2xl border text-right transition-all relative flex flex-col justify-between ${
                activePkgId === 'bundle-vip'
                  ? 'bg-[#0B1220] text-white border-[#2ECC8F] ring-2 ring-[#2ECC8F]/30 shadow-md'
                  : 'bg-white text-[#0B1220] border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-black px-2.5 py-1 rounded-md bg-[#2ECC8F] text-[#0B1220]">
                  الأكثر طلباً ({SITE_PRICING.fullPackagePrice} ج)
                </span>
                {activePkgId === 'bundle-vip' && (
                  <CheckCircle2 className="w-5 h-5 text-[#2ECC8F] shrink-0" />
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base mb-1">الباقة الكاملة (الكورس + 12 أداة + الداتا)</h3>
                <p className={`text-xs leading-relaxed ${activePkgId === 'bundle-vip' ? 'text-gray-300' : 'text-gray-500'}`}>
                  الكورس الكامل + الـ 12 أداة تسويق بالكامل + هدية داتا مصر + الدعم الفني المباشر.
                </p>
              </div>
            </button>

            {/* Single Tool Card */}
            <button
              type="button"
              onClick={() => setActivePkgId('single-tool')}
              className={`p-4 rounded-2xl border text-right transition-all relative flex flex-col justify-between ${
                activePkgId === 'single-tool'
                  ? 'bg-[#0B1220] text-white border-[#2ECC8F] ring-2 ring-[#2ECC8F]/30 shadow-md'
                  : 'bg-white text-[#0B1220] border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-black px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
                  برنامج واحد فقط ({SITE_PRICING.singleToolPrice} ج)
                </span>
                {activePkgId === 'single-tool' && (
                  <CheckCircle2 className="w-5 h-5 text-[#2ECC8F] shrink-0" />
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base mb-1">باقة برنامج واحد محدد من الـ 12</h3>
                <p className={`text-xs leading-relaxed ${activePkgId === 'single-tool' ? 'text-gray-300' : 'text-gray-500'}`}>
                  اختر أداة واحدة فقط من ترسانة الـ 12 مع فيديو الشرح والتفعيل الدائم.
                </p>
              </div>
            </button>
          </div>

          {/* Custom Interactive Tool Selector for Single Tool Package */}
          {activePkgId === 'single-tool' && (
            <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 sm:p-5 mt-3">
              <CustomToolSelector
                id="checkout-tool-selector"
                selectedToolId={selectedToolId}
                onSelectTool={(toolId) => setUserToolId(toolId)}
                label={`حدد البرنامج المطلوب (${SITE_PRICING.singleToolPrice} جنيه):`}
              />
            </div>
          )}
        </div>

        {/* STEP 2: Sender Phone Number / Account Input Box */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-200 space-y-3">
          <label className="block text-sm sm:text-base font-extrabold text-[#0B1220] flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-[#0F9D58]" />
            <span>2. أدخل رقم المحفظة / الحساب الذي قمت بالتحويل منه:</span>
          </label>
          <p className="text-xs text-gray-500 leading-relaxed">
            اكتب رقم هاتفك أو اسم حسابك في إنستاباي الذي حولت منه الفلوس لتسريع مراجعة وتأكيد التحويل.
          </p>

          <div className="relative">
            <input
              type="text"
              value={senderNumber}
              onChange={(e) => setSenderNumber(e.target.value)}
              placeholder="مثال: 01012345678 أو اسم حسابك في إنستاباي"
              className="w-full bg-gray-50 border border-gray-300 rounded-2xl py-3.5 px-4 text-sm font-bold text-[#0B1220] placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/20 transition-all dir-rtl"
            />
          </div>

          {senderNumber.trim() ? (
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F9D58] bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>سيتم إرسال هذا الرقم تلقائياً لفريق الدعم على الواتساب: ({senderNumber})</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200/70">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>ملاحظة: يمكنك إدخال الرقم ليرفق تلقائياً في رسالة التأكيد.</span>
            </div>
          )}
        </div>

        {/* STEP 3: Payment Method Selection (Electronic Wallet vs InstaPay) */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-200 space-y-4">
          <label className="block text-sm sm:text-base font-extrabold text-[#0B1220] flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#0F9D58]" />
            <span>3. اختر طريقة التحويل المناسبة لك (محفظة أو إنستاباي):</span>
          </label>

          {/* 2 Payment Tabs ONLY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SITE_CONFIG.paymentMethods.map((method) => {
              const isSelected = activePaymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setActivePaymentMethod(method.id)}
                  className={`p-4 rounded-2xl border text-right transition-all flex items-center gap-3 relative ${
                    isSelected
                      ? 'border-[#0F9D58] bg-emerald-50/60 ring-2 ring-[#0F9D58]/20 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-[#0F9D58] text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {method.id === 'instapay' ? (
                      <CreditCard className="w-5 h-5" />
                    ) : (
                      <Smartphone className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="block text-xs font-bold text-[#0B1220] truncate">{method.name}</span>
                    <span className="text-[11px] text-gray-500 block truncate">{method.type}</span>
                  </div>

                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-[#0F9D58] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Payment Method Details & Copy Card */}
          <div className="p-4 sm:p-5 bg-gray-50 rounded-2xl border border-gray-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600">
                {currentPayment.type}:
              </span>
              <span className="text-[11px] text-[#0F9D58] font-extrabold bg-[#0F9D58]/10 px-2.5 py-0.5 rounded-full">
                تأكيد فوري
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-inner">
              <span className="font-black text-lg sm:text-xl text-[#0B1220] tracking-wider dir-ltr">
                {currentPayment.number}
              </span>

              <button
                type="button"
                onClick={() => handleCopy(currentPayment.number, currentPayment.id)}
                className={`py-2 px-3.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                  copiedId === currentPayment.id
                    ? 'bg-[#0F9D58] text-white'
                    : 'bg-[#0B1220] text-white hover:bg-gray-800'
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

            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              💡 {currentPayment.instructions}
            </p>
          </div>
        </div>

        {/* STEP 4: Input Sender Phone Number & Order Submission */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 text-[#0B1220] font-black text-base">
            <Smartphone className="w-5 h-5 text-[#0F9D58]" />
            <span>ادخل رقم المحفظة/الحساب المحوّل منه للمطابقة:</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              رقم الموبايل أو المحفظة الإلكترونية المحوّل منها المبلغ:
            </label>
            <input
              type="tel"
              required
              value={senderNumber}
              onChange={(e) => setSenderNumber(e.target.value)}
              placeholder="مثال: 01012345678"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-sm font-bold text-[#0B1220] focus:outline-none focus:border-[#0F9D58]"
            />
          </div>

          {orderMessage && (
            <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
              orderMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : 'bg-red-50 text-red-800 border border-red-300'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{orderMessage.text}</span>
            </div>
          )}

          <button
            type="button"
            disabled={isSubmittingOrder}
            onClick={handleOrderSubmit}
            className="w-full py-4 px-6 rounded-2xl bg-[#0F9D58] hover:bg-[#0D8B4E] active:scale-[0.99] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl shadow-[#0F9D58]/30 transition-all text-center cursor-pointer disabled:opacity-50"
          >
            <MessageSquare className="w-5 h-5 shrink-0" />
            <span>{isSubmittingOrder ? 'جاري تسجيل الطلب...' : 'إرسال وتأكيد الطلب عبر الواتساب'}</span>
          </button>
        </div>

        {/* Trust Badges Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 bg-white rounded-2xl border border-gray-200 text-center flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0F9D58]" />
            <span className="text-xs font-bold text-[#0B1220]">تفعيل رسمي معتمد</span>
          </div>
          <div className="p-3.5 bg-white rounded-2xl border border-gray-200 text-center flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-[#0F9D58]" />
            <span className="text-xs font-bold text-[#0B1220]">دعم فني مباشر 24/7</span>
          </div>
          <div className="p-3.5 bg-white rounded-2xl border border-gray-200 text-center flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0F9D58]" />
            <span className="text-xs font-bold text-[#0B1220]">تحديثات مجانية مستمرة</span>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0B1220] text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#2ECC8F] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-300 font-bold">جاري تحميل صفحة الدفع...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
