'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import { 
  User,
  Mail,
  ArrowRight, 
  CheckCircle2, 
  Copy, 
  Check, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  Smartphone,
  CreditCard,
  AlertCircle,
  Lock,
  Send,
  Tag,
  Percent,
  Trash2,
  UploadCloud,
  FileCheck,
  Package,
  ExternalLink,
  Zap
} from 'lucide-react';
import { SITE_CONFIG, SITE_PRICING, PricingPackage } from '@/config/site';
import { GrowixLogo } from '@/components/GrowixLogo';
import { CustomToolSelector } from '@/components/CustomToolSelector';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { createOrderAction } from '@/lib/actions/orders';
import { validateCouponAction } from '@/lib/actions/coupons';
import { getAllPackagesAction } from '@/lib/actions/packages';
import { uploadReceiptAction } from '@/lib/actions/receipts';
import { trackMetaEvent } from '@/components/FacebookPixel';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Guest details state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Auto-populate from active session if logged in
  useEffect(() => {
    if (session?.user) {
      if (session.user.name && !customerName) setCustomerName(session.user.name);
      if (session.user.email && !customerEmail) setCustomerEmail(session.user.email);
    }
  }, [session]);

  const [packages, setPackages] = useState<PricingPackage[]>(SITE_CONFIG.packages);

  useEffect(() => {
    getAllPackagesAction().then((pkgs) => {
      if (pkgs && pkgs.length > 0) {
        setPackages(pkgs);
      }
    });
  }, []);

  const initialPkgParam = searchParams.get('package');
  const initialToolParam = searchParams.get('tool');
  const initialCouponParam = searchParams.get('coupon');
  const initialSenderParam = searchParams.get('sender');
  const initialMethodParam = searchParams.get('method');

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

  const [activePaymentMethod, setActivePaymentMethod] = useState<string>(initialMethodParam || 'electronic-wallet');
  const [senderNumber, setSenderNumber] = useState<string>(initialSenderParam || '');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Receipt Upload State
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');

  // Coupon State
  const [couponCodeInput, setCouponCodeInput] = useState(initialCouponParam || '');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string;
    code: string;
    discountPercent: number;
    discountAmount: number;
    finalPrice: number;
    description?: string | null;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const availablePackages = packages && packages.length > 0 ? packages : SITE_CONFIG.packages;
  const currentPkg = availablePackages.find((p) => p.id === activePkgId) || availablePackages[0];
  const currentTool = SITE_CONFIG.tools.find((t) => t.id === selectedToolId) || SITE_CONFIG.tools[0];
  const currentPayment = SITE_CONFIG.paymentMethods.find((m) => m.id === activePaymentMethod) || SITE_CONFIG.paymentMethods[0];

  const packagePriceNum = parseInt(currentPkg.discountedPrice.replace(/[^0-9]/g, '')) || 0;

  // Auto-validate initial coupon from query param if present
  useEffect(() => {
    if (initialCouponParam && !appliedCoupon) {
      validateCouponAction(initialCouponParam.trim(), packagePriceNum).then((res) => {
        if (res.success && res.coupon) {
          setAppliedCoupon(res.coupon);
          setCouponMessage({
            type: 'success',
            text: `تم تفعيل الكوبون (${res.coupon.code}) بنجاح! خصم ${res.coupon.discountPercent}%`,
          });
        }
      });
    }
  }, [initialCouponParam, packagePriceNum]);

  // Recalculate coupon discount if package changes
  useEffect(() => {
    if (appliedCoupon) {
      const discountRate = appliedCoupon.discountPercent / 100;
      const newDiscountAmount = Math.round(packagePriceNum * discountRate);
      const newFinalPrice = Math.max(0, packagePriceNum - newDiscountAmount);
      setAppliedCoupon((prev) => prev ? {
        ...prev,
        discountAmount: newDiscountAmount,
        finalPrice: newFinalPrice,
      } : null);
    }
    if (currentPkg) {
      trackMetaEvent('InitiateCheckout', {
        content_name: currentPkg.name,
        value: packagePriceNum,
        currency: 'EGP',
      });
    }
  }, [activePkgId, packagePriceNum]);

  const finalPayableAmount = appliedCoupon ? appliedCoupon.finalPrice : packagePriceNum;

  // 🎯 Realtime Abandoned Checkout / Lead Recovery Auto-capture
  useEffect(() => {
    const trimmed = senderNumber.trim();
    if (trimmed.length < 8) return;

    const timer = setTimeout(() => {
      let sid = 'unknown';
      if (typeof window !== 'undefined') {
        sid = sessionStorage.getItem('growix_session_id') || 'gx_' + Math.random().toString(36).substring(2, 11);
      }
      fetch('/api/track/abandoned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sid,
          phone: trimmed,
          packageId: activePkgId,
          toolId: activePkgId === 'single-tool' ? selectedToolId : undefined,
          amount: finalPayableAmount,
          couponCode: appliedCoupon ? appliedCoupon.code : undefined,
          lastStep: receiptFile ? 4 : 3,
        }),
      }).catch(() => {});
    }, 1200);

    return () => clearTimeout(timer);
  }, [senderNumber, activePkgId, selectedToolId, finalPayableAmount, appliedCoupon, receiptFile]);

  const handleApplyCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!couponCodeInput || !couponCodeInput.trim()) {
      setCouponMessage({ type: 'error', text: 'يرجى إدخال كود الكوبون' });
      return;
    }

    setCouponLoading(true);
    setCouponMessage(null);

    const res = await validateCouponAction(couponCodeInput.trim(), packagePriceNum);
    setCouponLoading(false);

    if (!res.success || !res.coupon) {
      setCouponMessage({ type: 'error', text: res.error || 'كود الكوبون غير صالح' });
    } else {
      setAppliedCoupon(res.coupon);
      setCouponMessage({ 
        type: 'success', 
        text: `تم تفعيل الكوبون (${res.coupon.code}) بنجاح! خصم ${res.coupon.discountPercent}% (وفرت ${res.coupon.discountAmount} جنية)` 
      });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
    setCouponMessage(null);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Receipt File Handlers
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setOrderMessage({ type: 'error', text: 'يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP)' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setOrderMessage({ type: 'error', text: 'حجم الصورة كبير جداً، الحد الأقصى 5 ميجابايت' });
      return;
    }

    setReceiptFile(file);
    const objectUrl = URL.createObjectURL(file);
    setReceiptPreview(objectUrl);
    setOrderMessage(null);
  };

  const handleRemoveReceipt = () => {
    if (receiptPreview) {
      URL.revokeObjectURL(receiptPreview);
    }
    setReceiptFile(null);
    setReceiptPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOrderSubmit = async () => {
    // 1. If guest (not logged in), validate Name and Email
    if (!session?.user) {
      if (!customerName.trim() || customerName.trim().length < 2) {
        setOrderMessage({ type: 'error', text: 'يرجى إدخال اسمك بالكامل (حرفين على الأقل) لإنشاء حسابك وتفعيل اشتراكك' });
        const nameElement = document.getElementById('step-customer-details');
        if (nameElement) {
          nameElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      if (!customerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
        setOrderMessage({ type: 'error', text: 'يرجى إدخال بريد إلكتروني صحيح لاستلام بيانات الدخول والبرامج' });
        const emailElement = document.getElementById('step-customer-details');
        if (emailElement) {
          emailElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
    }

    // 2. Validate Egyptian Mobile Number / InstaPay Handle
    const cleanInput = senderNumber.trim().replace(/\s+/g, '');
    if (!cleanInput) {
      setOrderMessage({ type: 'error', text: 'يرجى إدخال رقم الهاتف أو الحساب الذي قمت بالتحويل منه أولاً' });
      return;
    }

    const normalizedPhone = cleanInput.replace(/^(?:\+20|0020|20)/, '0');
    const isEgyptianPhone = /^(010|011|012|015)[0-9]{8}$/.test(normalizedPhone);

    if (activePaymentMethod === 'electronic-wallet') {
      // Vodafone Cash must be a valid 11-digit Egyptian phone number
      if (!isEgyptianPhone) {
        setOrderMessage({ 
          type: 'error', 
          text: 'يرجى إدخال رقم هاتف محفظة مصري صحيح يبدأ بـ (010 أو 011 أو 012 أو 015) ومكون من 11 رقماً.' 
        });
        return;
      }
    } else if (activePaymentMethod === 'instapay') {
      // InstaPay can be an Egyptian phone number or valid InstaPay handle/account (min 3 chars)
      if (!isEgyptianPhone && cleanInput.length < 3) {
        setOrderMessage({ 
          type: 'error', 
          text: 'يرجى إدخال رقم الهاتف أو عنوان إنستاباي الصحيح (مثال: 01012345678 أو username@instapay).' 
        });
        return;
      }
    }

    setIsSubmittingOrder(true);
    setOrderMessage(null);
    setUploadStatusText('جاري معالجة وتأكيد الطلب...');

    // 3. Upload Receipt Image to Cloudflare R2 if provided
    let receiptUrl: string | undefined = undefined;
    let receiptKey: string | undefined = undefined;

    if (receiptFile) {
      setUploadStatusText('جاري رفع صورة الإثبات إلى السيرفر الآمن (R2)...');
      const formData = new FormData();
      formData.append('file', receiptFile);
      formData.append('senderNumber', isEgyptianPhone ? normalizedPhone : cleanInput);

      const uploadRes = await uploadReceiptAction(formData);
      if (!uploadRes.success) {
        setIsSubmittingOrder(false);
        setUploadStatusText('');
        setOrderMessage({ type: 'error', text: uploadRes.error || 'فشل في رفع صورة الإثبات، يرجى المحاولة مرة أخرى' });
        return;
      }

      receiptUrl = uploadRes.url;
      receiptKey = uploadRes.key;
    }

    setUploadStatusText('جاري توثيق وتأكيد الطلب وإنشاء الحساب...');

    // Determine paymentMethod and paymentProvider according to business logic
    let resolvedPaymentMethod = 'electronic-wallet';
    let resolvedPaymentProvider = 'vodafone_cash';

    if (activePaymentMethod === 'instapay') {
      resolvedPaymentMethod = 'electronic-wallet';
      resolvedPaymentProvider = 'instapay';
    } else if (activePaymentMethod === 'electronic-wallet') {
      resolvedPaymentMethod = 'electronic-wallet';
      resolvedPaymentProvider = 'vodafone_cash'; 
    } else {
      resolvedPaymentMethod = activePaymentMethod;
      resolvedPaymentProvider = 'other';
    }

    const res = await createOrderAction({
      packageId: currentPkg.id,
      toolId: currentPkg.id === 'single-tool' ? currentTool.id : undefined,
      paymentMethod: resolvedPaymentMethod,
      paymentProvider: resolvedPaymentProvider,
      senderNumber: senderNumber.trim(),
      amount: finalPayableAmount.toString(),
      originalAmount: currentPkg.discountedPrice,
      discountAmount: appliedCoupon ? appliedCoupon.discountAmount.toString() : undefined,
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      receiptUrl,
      receiptKey,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
    });

    if (!res.success) {
      setIsSubmittingOrder(false);
      setUploadStatusText('');
      setOrderMessage({ type: 'error', text: res.error || 'حدث خطأ أثناء حفظ الطلب' });
      return;
    }

    // Trigger Meta Pixel Purchase Event
    trackMetaEvent('Purchase', {
      value: finalPayableAmount,
      currency: 'EGP',
      content_name: currentPkg.name,
      content_type: 'product',
      order_id: res.orderId,
    });

    setUploadStatusText('تم تأكيد الطلب وإنشاء الحساب بنجاح! جاري التوجيه...');

    // If magicToken is available (for guest), perform background login
    if (res.magicToken) {
      try {
        await signIn('credentials', {
          magicToken: res.magicToken,
          redirect: false,
        });
      } catch (authErr) {
        console.error('Silent auto login error:', authErr);
      }
    }

    // Direct hard navigation to success page to guarantee session persistence
    window.location.href = `/success?orderId=${res.orderId}`;
  };

  return (
    <div className="min-h-screen bg-[#070C1A] text-white flex flex-col dir-rtl font-sans selection:bg-[#00FF87] selection:text-[#0A1128]">
      
      {/* Background Cyber Glowing Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 right-1/4 w-96 h-96 bg-[#00FF87]/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-[#0F9D58]/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#38BDF8]/10 rounded-full blur-[120px]" />
      </div>

      {/* Top Header */}
      <header className="bg-[#0B1220]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl sticky top-0 z-30 relative">
        <div className="max-w-6xl mx-auto py-4 px-4 sm:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <GrowixLogo theme="dark" iconSize={36} showSubtitle={false} />
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-[#00FF87] bg-[#00FF87]/10 border border-[#00FF87]/30 px-3.5 py-1.5 rounded-full font-bold shadow-xs">
              <Lock className="w-3.5 h-3.5" />
              <span>دفع وتأكيد آمن 100% مشفر</span>
            </span>

            <Link
              href="/"
              className="text-xs font-bold text-gray-300 hover:text-white flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
            >
              <span>الرئيسية</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#00FF87]" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 space-y-8 relative z-10">
        
        {/* Title Header Card */}
        <div className="bg-gradient-to-br from-[#0B1528] via-[#0F1E36] to-[#070C1A] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-white/15 shadow-2xl space-y-4">
          <div className="absolute top-0 left-0 w-80 h-80 bg-[#00FF87]/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div className="inline-flex items-center gap-2 text-xs font-black px-4 py-1.5 bg-[#00FF87]/15 text-[#00FF87] border border-[#00FF87]/30 rounded-full w-fit shadow-xs">
              <Sparkles className="w-4 h-4 text-[#00FF87]" />
              <span>صفحة تأكيد الاشتراك والتفعيل الفوري</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-300 bg-white/5 px-3.5 py-1.5 rounded-xl border border-white/10 w-fit font-medium">
              <Clock className="w-4 h-4 text-[#00FF87]" />
              <span>التفعيل التلقائي خلال أقل من ساعة</span>
            </div>
          </div>

          <div className="relative z-10">
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-wide">
              إتمام الطلب وتفعيل اشتراكك
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
              اختر الباقة المناسبة، ثم حوّل المبلغ بالوسيلة الأسهل لك، وأدخل بياناتك لإنشاء حسابك وتفعيل الحزمة فوراً.
            </p>
          </div>

          {/* Pricing Summary Banner */}
          <div className="p-4 sm:p-5 bg-white/5 backdrop-blur-md rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10 relative z-10">
            <div>
              <span className="text-xs text-gray-400 block mb-1 font-bold">المبلغ المطلوب تحويله حالياً:</span>
              <div className="flex items-baseline gap-2.5 flex-wrap">
                <span className="text-2xl sm:text-4xl font-black text-[#00FF87] tracking-tight">
                  {finalPayableAmount} {currentPkg.currency}
                </span>

                {appliedCoupon ? (
                  <>
                    <span className="text-sm text-gray-400 line-through font-mono">
                      {currentPkg.discountedPrice} {currentPkg.currency}
                    </span>
                    <span className="text-[11px] bg-[#00FF87]/20 text-[#00FF87] px-2.5 py-0.5 rounded-md font-black border border-[#00FF87]/40">
                      وفرت {appliedCoupon.discountAmount} ج ({appliedCoupon.discountPercent}%)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-gray-400 line-through font-mono">
                      {currentPkg.originalPrice} {currentPkg.currency}
                    </span>
                    <span className="text-[11px] bg-[#00FF87]/15 text-[#00FF87] px-2.5 py-0.5 rounded-md font-bold border border-[#00FF87]/30">
                      خصم لفترة محدودة 🔥
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="text-right sm:text-left space-y-1">
              <span className="text-xs text-gray-400 block font-bold">الباقة المختارة:</span>
              <span className="font-black text-white text-sm sm:text-lg block">{currentPkg.name}</span>
              <Link
                href={`/packages/${currentPkg.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#00FF87] hover:underline"
              >
                <span>استعراض كل محتويات وشرح الباقة</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Layout for Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Transaction Form Column (8 cols on lg) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-7">

            {/* Stepper Progress Bar */}
            <div className="bg-[#0F172A]/90 backdrop-blur-xl rounded-3xl p-4 sm:p-6 border border-white/10 shadow-xl text-white">
              <div className="flex items-center justify-between relative">
                {/* Background line */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 -translate-y-1/2 rounded-full z-0"></div>
                {/* Progress line */}
                <div 
                  className="absolute top-1/2 right-0 h-1 bg-[#00FF87] -translate-y-1/2 rounded-full z-0 transition-all duration-500 shadow-sm shadow-[#00FF87]/50"
                  style={{ width: `${(Math.min((activePkgId ? 1 : 0) + (activePaymentMethod ? 1 : 0) + (senderNumber.trim().length >= 10 ? 1 : 0) + (receiptFile ? 1 : 0), 3) / 3) * 100}%` }}
                ></div>
                
                {[
                  { id: 1, title: 'الباقة', icon: <Package className="w-4 h-4" />, completed: !!activePkgId, current: true },
                  { id: 2, title: 'الدفع', icon: <CreditCard className="w-4 h-4" />, completed: !!activePaymentMethod, current: !!activePkgId },
                  { id: 3, title: 'البيانات', icon: <Smartphone className="w-4 h-4" />, completed: senderNumber.trim().length >= 10, current: !!activePaymentMethod },
                  { id: 4, title: 'تأكيد', icon: <FileCheck className="w-4 h-4" />, completed: !!receiptFile, current: senderNumber.trim().length >= 10 }
                ].map((step) => (
                  <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 bg-[#0F172A] px-2 sm:px-4">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      step.completed 
                        ? 'bg-[#00FF87] border-[#00FF87] text-[#0A1128] font-black shadow-lg shadow-[#00FF87]/30' 
                        : step.current 
                          ? 'bg-[#00FF87]/20 border-[#00FF87] text-[#00FF87]' 
                          : 'bg-[#070C1A] border-white/15 text-gray-500'
                    }`}>
                      {step.completed ? <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" /> : step.icon}
                    </div>
                    <span className={`text-[10px] sm:text-xs font-bold ${step.completed || step.current ? 'text-white' : 'text-gray-500'}`}>
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* STEP 1: Package Selector */}
            <div className="bg-[#0F172A]/90 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-white/10 space-y-4 shadow-xl text-white">
              <div className="flex items-center justify-between">
                <label className="block text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#00FF87]/20 text-[#00FF87] flex items-center justify-center font-black text-xs border border-[#00FF87]/30">1</div>
                  <span>اختر نوع الباقة المطلوبة:</span>
                </label>
                <span className="text-xs text-gray-400">خطوة 1 من 4</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {availablePackages.map((pkg) => {
                  const isSelected = pkg.id === activePkgId;
                  const isVIP = pkg.id === 'bundle-vip';
                  return (
                    <div
                      key={pkg.id}
                      className={`p-4 rounded-2xl border text-right transition-all relative flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-[#00FF87] bg-gradient-to-b from-[#00FF87]/15 to-[#0F172A] ring-2 ring-[#00FF87]/30 shadow-xl shadow-[#00FF87]/10'
                          : 'border-white/10 bg-[#070C1A]/70 hover:bg-[#070C1A] hover:border-white/20 text-gray-300'
                      }`}
                      onClick={() => setActivePkgId(pkg.id)}
                    >
                      {isVIP && (
                        <span className="absolute -top-2.5 left-3 text-[10px] bg-gradient-to-l from-amber-400 to-yellow-300 text-[#0A1128] px-2.5 py-0.5 rounded-full font-black shadow-md flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>الأقوى ⭐</span>
                        </span>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs sm:text-sm font-black ${isSelected ? 'text-[#00FF87]' : 'text-white'}`}>
                            {pkg.name}
                          </span>
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                            isSelected ? 'bg-[#00FF87] border-[#00FF87] text-[#0A1128]' : 'border-white/30 bg-[#070C1A]'
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </div>

                        <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2 mb-2 font-medium">
                          {pkg.description}
                        </p>

                        {/* Deliverables checklist */}
                        <div className="space-y-1 mb-3 pt-1 border-t border-white/10 text-[10.5px]">
                          {pkg.features.slice(0, 3).map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-center gap-1.5 text-gray-300">
                              <Check className="w-3 h-3 text-[#00FF87] shrink-0" />
                              <span className="truncate">{feat.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-white/10">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs font-bold text-gray-500 line-through font-mono">{pkg.originalPrice}</span>
                          <span className="text-sm font-black text-[#00FF87]">{pkg.discountedPrice} {pkg.currency}</span>
                        </div>

                        <Link
                          href={`/packages/${pkg.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="w-full py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10.5px] font-bold text-gray-300 hover:text-[#00FF87] flex items-center justify-center gap-1 transition-colors"
                        >
                          <span>تفاصيل أكثر عن الباقة</span>
                          <ExternalLink className="w-3 h-3 text-[#00FF87]" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {activePkgId === 'single-tool' && (
                <div className="pt-3 border-t border-white/10">
                  <CustomToolSelector
                    selectedToolId={selectedToolId}
                    onSelectTool={setSelectedToolId}
                  />
                </div>
              )}
            </div>

            {/* DISCOUNT COUPON CARD */}
            <div className="bg-[#0F172A]/90 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-white/10 space-y-4 shadow-xl text-white">
              <div className="flex items-center justify-between">
                <label className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#00FF87]" />
                  <span>هل لديك كود خصم أو كوبون؟</span>
                </label>
                <span className="text-[11px] text-gray-400 font-medium">اختياري</span>
              </div>

              {appliedCoupon ? (
                <div className="p-4 sm:p-5 bg-gradient-to-r from-[#00FF87]/15 via-[#00FF87]/5 to-transparent border border-[#00FF87]/40 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#00FF87] text-[#0A1128] flex items-center justify-center font-black shadow-md shadow-[#00FF87]/30">
                        <Percent className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-[#00FF87] text-sm sm:text-base dir-ltr font-mono">{appliedCoupon.code}</span>
                          <span className="text-[10px] bg-[#00FF87]/20 text-[#00FF87] px-2 py-0.5 rounded-md font-black border border-[#00FF87]/40">
                            خصم {appliedCoupon.discountPercent}%
                          </span>
                        </div>
                        <span className="text-xs text-gray-300 font-medium">
                          وفرت {appliedCoupon.discountAmount} جنية من السعر الأساسي
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-xl border border-red-500/30 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>إلغاء الكوبون</span>
                    </button>
                  </div>

                  <div className="p-3 bg-[#070C1A] rounded-xl border border-[#00FF87]/30 flex items-center justify-between text-xs">
                    <span className="text-gray-300 font-bold">المبلغ المطلوب تحويله بعد الخصم:</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-gray-500 line-through text-xs font-mono">{packagePriceNum} ج</span>
                      <span className="text-base sm:text-lg font-black text-[#00FF87] font-mono">{finalPayableAmount} جنية مصري</span>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      placeholder="أدخل كود الكوبون هنا..."
                      className="w-full px-4 py-3 rounded-2xl bg-[#070C1A] border border-white/15 text-xs font-mono font-bold text-white uppercase placeholder:normal-case placeholder:text-gray-500 focus:outline-none focus:border-[#00FF87] focus:ring-2 focus:ring-[#00FF87]/20 transition-all dir-ltr"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={couponLoading || !couponCodeInput.trim()}
                    className="px-6 py-3 bg-[#00FF87] hover:bg-[#00E676] text-[#0A1128] text-xs font-black rounded-2xl transition-all disabled:opacity-40 cursor-pointer shrink-0 shadow-md shadow-[#00FF87]/20"
                  >
                    {couponLoading ? 'جاري الفحص...' : 'تطبيق الكود'}
                  </button>
                </form>
              )}

              {couponMessage && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  couponMessage.type === 'success'
                    ? 'bg-[#00FF87]/15 text-[#00FF87] border border-[#00FF87]/30'
                    : 'bg-red-500/15 text-red-300 border border-red-500/30'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{couponMessage.text}</span>
                </div>
              )}
            </div>

            {/* STEP 2: Payment Method Selector */}
            <div className="bg-[#0F172A]/90 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-white/10 space-y-4 shadow-xl text-white">
              <div className="flex items-center justify-between">
                <label className="block text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#00FF87]/20 text-[#00FF87] flex items-center justify-center font-black text-xs border border-[#00FF87]/30">2</div>
                  <span>اختر وسيلة التحويل والدفع:</span>
                </label>
                <span className="text-xs text-gray-400">خطوة 2 من 4</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SITE_CONFIG.paymentMethods.map((method) => {
                  const isSelected = method.id === activePaymentMethod;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setActivePaymentMethod(method.id)}
                      className={`p-4 rounded-2xl border text-right transition-all flex items-center gap-3 relative cursor-pointer ${
                        isSelected
                          ? 'border-[#00FF87] bg-gradient-to-b from-[#00FF87]/15 to-[#0F172A] ring-2 ring-[#00FF87]/30 text-white shadow-lg'
                          : 'border-white/10 bg-[#070C1A] text-gray-300 hover:bg-[#0B1528] hover:border-white/20'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#00FF87] text-[#0A1128]' : 'bg-white/10 text-gray-400'
                      }`}>
                        {method.id === 'instapay' ? <CreditCard className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="block text-xs font-bold text-white truncate">{method.name}</span>
                        <span className="text-[11px] text-gray-400 block truncate">{method.type}</span>
                      </div>

                      {isSelected && <CheckCircle2 className="w-5 h-5 text-[#00FF87] shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Active Payment Details Box */}
              <div className="p-4 sm:p-5 bg-[#070C1A] rounded-2xl border border-white/10 space-y-3.5">
                
                {/* Price Reminder Box */}
                <div className="p-3.5 sm:p-4 bg-[#00FF87]/10 border border-[#00FF87]/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#00FF87] text-[#0A1128] flex items-center justify-center font-black text-xs shrink-0 shadow-md shadow-[#00FF87]/20">
                      EGP
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-gray-400 block">المبلغ المطلوب تحويله بالضبط:</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl sm:text-2xl font-black text-[#00FF87] font-mono tracking-tight">
                          {finalPayableAmount} {currentPkg.currency}
                        </span>
                        {appliedCoupon && (
                          <span className="text-xs text-gray-500 line-through font-mono">
                            {packagePriceNum} {currentPkg.currency}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(finalPayableAmount.toString(), 'amount-copy')}
                      className="px-3.5 py-1.5 rounded-xl text-[11px] font-extrabold bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                      title="نسخ المبلغ المطلوب"
                    >
                      {copiedId === 'amount-copy' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#00FF87]" />
                          <span className="text-[#00FF87]">تم نسخ المبلغ!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-gray-400" />
                          <span>نسخ المبلغ ({finalPayableAmount})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400">{currentPayment.type}:</span>
                  <span className="text-[10px] text-[#00FF87] font-extrabold bg-[#00FF87]/15 px-2.5 py-0.5 rounded-full border border-[#00FF87]/30">
                    تحويل مباشر
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 bg-[#0B1528] p-3.5 rounded-xl border border-white/15">
                  <span className="font-black text-lg sm:text-xl text-[#00FF87] tracking-wider dir-ltr font-mono">
                    {currentPayment.number}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleCopy(currentPayment.number, currentPayment.id)}
                    className={`py-2 px-3.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                      copiedId === currentPayment.id
                        ? 'bg-[#00FF87] text-[#0A1128]'
                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/15'
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

                <p className="text-xs text-gray-400 leading-relaxed font-medium">
                  {currentPayment.instructions}
                </p>
              </div>
            </div>

            {/* STEP 3: Customer Details & Sender Phone Number */}
            <div id="step-customer-details" className="bg-[#0F172A]/90 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-white/10 space-y-5 shadow-xl text-white scroll-mt-24">
              <div className="flex items-center justify-between">
                <label className="block text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#00FF87]/20 text-[#00FF87] flex items-center justify-center font-black text-xs border border-[#00FF87]/30">3</div>
                  <span>بيانات المشترك ورقم التحويل:</span>
                </label>
                <span className="text-xs text-gray-400">خطوة 3 من 4</span>
              </div>

              {/* If Logged in, show active account banner */}
              {session?.user ? (
                <div className="p-4 rounded-2xl bg-[#00FF87]/10 border border-[#00FF87]/30 flex items-center gap-3 text-xs">
                  <div className="w-9 h-9 rounded-xl bg-[#00FF87] text-[#0A1128] flex items-center justify-center font-black shrink-0 shadow-md">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-extrabold text-white block truncate">
                      أنت مسجل الدخول حالياً كـ: {session.user.name || 'عميل GROWIX'}
                    </span>
                    <span className="text-gray-300 block text-[11px] truncate mt-0.5">
                      البريد المسجل: {session.user.email} (سيتم ربط الباقة بحسابك فوراً)
                    </span>
                  </div>
                </div>
              ) : (
                /* If Guest, show Name & Email inputs */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#00FF87]" />
                      <span>الاسم بالكامل <span className="text-red-400">*</span></span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="مثال: أحمد محمد"
                      className="w-full px-4 py-3.5 bg-[#070C1A] border border-white/15 rounded-2xl text-sm font-bold text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00FF87] focus:ring-2 focus:ring-[#00FF87]/25 transition-all"
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#00FF87]" />
                        <span>البريد الإلكتروني <span className="text-red-400">*</span></span>
                      </span>
                      <span className="text-[10px] text-gray-400 font-normal">لاستلام تفاصيل الدخول</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="example@domain.com"
                      className="w-full px-4 py-3.5 bg-[#070C1A] border border-white/15 rounded-2xl text-sm font-bold text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00FF87] focus:ring-2 focus:ring-[#00FF87]/25 transition-all dir-ltr text-right font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Sender Phone Number Input */}
              <div>
                <label className="block text-xs font-bold text-gray-200 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-[#00FF87]" />
                    <span>رقم الهاتف / الحساب الذي قمت بالتحويل منه <span className="text-red-400">*</span></span>
                  </span>
                  <span className="text-[10px] text-[#00FF87] font-extrabold bg-[#00FF87]/15 px-2 py-0.5 rounded-md border border-[#00FF87]/30">
                    هو نفسه كلمة مرور حسابك
                  </span>
                </label>
                <input
                  type="tel"
                  required
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  placeholder="مثال: 01012345678 أو عنوان إنستاباي المحوّل منه"
                  className="w-full px-4 py-3.5 rounded-2xl bg-[#070C1A] border border-white/15 text-sm font-bold text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00FF87] focus:ring-2 focus:ring-[#00FF87]/25 transition-all dir-rtl font-mono"
                />
              </div>

              {!session?.user && (
                <div className="p-3.5 bg-[#00FF87]/10 border border-[#00FF87]/25 rounded-2xl text-[11px] text-gray-200 leading-relaxed flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#00FF87] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#00FF87]">تنبيه ذكي:</strong> سيتم إنشاء حسابك فوراً وتعيين رقم هاتفك المحوّل منه ككلمة مرور لتتمكن من تسجيل الدخول في أي وقت، كما سيصلك بريد إلكتروني فوري يحتوي على زر الدخول السريع بنقرة واحدة وروابط الأدوات.
                  </span>
                </div>
              )}
            </div>

            {/* STEP 4: Receipt Image Upload */}
            <div id="step-receipt-upload" className="bg-[#0F172A]/90 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-white/10 space-y-4 shadow-xl text-white scroll-mt-24">
              <div className="flex items-center justify-between">
                <label className="block text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#00FF87]/20 text-[#00FF87] flex items-center justify-center font-black text-xs border border-[#00FF87]/30">4</div>
                  <span>إرفاق لقطة شاشة لإثبات تحويل ({finalPayableAmount} ج):</span>
                </label>
                <span className="text-xs text-[#00FF87] font-bold bg-[#00FF87]/15 border border-[#00FF87]/30 px-2.5 py-0.5 rounded-md">
                  مستحسن للتفعيل الفوري
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />

              {receiptPreview ? (
                <div className="p-4 bg-[#070C1A] border border-[#00FF87]/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 w-full sm:w-auto">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/20 bg-black shrink-0 relative shadow-md">
                      <img
                        src={receiptPreview}
                        alt="معاينة إيصال التحويل"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-black text-[#00FF87] mb-0.5">
                        <FileCheck className="w-4 h-4" />
                        <span className="truncate">{receiptFile?.name || 'صورة الإثبات'}</span>
                      </div>
                      <span className="text-[11px] text-gray-400 block">
                        الحجم: {((receiptFile?.size || 0) / (1024 * 1024)).toFixed(2)} ميجابايت (جاهز للرفع والتأكيد)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-colors cursor-pointer"
                    >
                      تغيير الصورة
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveReceipt}
                      className="p-2 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors cursor-pointer"
                      title="حذف الصورة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileSelect(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
                    isDragging
                      ? 'border-[#00FF87] bg-[#00FF87]/15 scale-[1.01]'
                      : 'border-white/15 bg-[#070C1A]/70 hover:bg-[#070C1A] hover:border-[#00FF87]/50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#00FF87]/15 text-[#00FF87] flex items-center justify-center shadow-md">
                    <UploadCloud className="w-6 h-6" />
                  </div>

                  <div>
                    <span className="text-xs sm:text-sm font-black text-white block">
                      اضغط هنا لاختيار لقطة الشاشة أو اسحب الصورة وأفلتها
                    </span>
                    <span className="text-[11px] text-gray-400 block mt-0.5">
                      ندعم صور PNG, JPG, WEBP بحد أقصى 5 ميجابايت (تُحفظ بشكل آمن ومشفر)
                    </span>
                  </div>
                </div>
              )}

              {orderMessage && (
                <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                  orderMessage.type === 'success'
                    ? 'bg-[#00FF87]/15 text-[#00FF87] border border-[#00FF87]/30'
                    : 'bg-red-500/15 text-red-300 border border-red-500/30'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{orderMessage.text}</span>
                </div>
              )}

              {/* Final Summary Card before submission */}
              <div className="p-4 bg-[#070C1A] border border-white/10 rounded-2xl flex items-center justify-between text-xs font-bold">
                <span className="text-gray-300">إجمالي المبلغ المطلوب تأكيده:</span>
                <div className="flex items-baseline gap-2">
                  {appliedCoupon && (
                    <span className="text-gray-500 line-through text-xs font-mono font-normal">
                      {packagePriceNum} ج
                    </span>
                  )}
                  <span className="text-lg font-black text-[#00FF87] font-mono">
                    {finalPayableAmount} {currentPkg.currency}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  disabled={isSubmittingOrder}
                  onClick={handleOrderSubmit}
                  className="w-full py-4 px-6 rounded-2xl bg-[#00FF87] hover:bg-[#00E676] active:scale-[0.99] text-[#0A1128] font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl shadow-[#00FF87]/25 transition-all text-center cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>
                    {isSubmittingOrder
                      ? uploadStatusText || 'جاري تأكيد الطلب...'
                      : `تأكيد وإرسال الطلب الآن (${finalPayableAmount} ج)`}
                  </span>
                </button>

                <p className="text-xs text-gray-400 text-center font-medium leading-relaxed">
                  بمجرد تأكيد الطلب، سيتم مطابقة تحويل الـ ({finalPayableAmount} ج) وتفعيل حسابك تلقائياً وبشكل فوري.
                </p>

                {/* Trust & Guarantee Badges under submit button */}
                <div className="grid grid-cols-3 gap-2 pt-3 text-center text-[11px] text-gray-300 border-t border-white/10">
                  <div className="p-2.5 rounded-xl bg-[#070C1A] flex flex-col items-center gap-1 border border-white/10">
                    <ShieldCheck className="w-4 h-4 text-[#00FF87]" />
                    <span className="font-bold text-[10px] sm:text-[11px]">دفع وتأكيد مشفر</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#070C1A] flex flex-col items-center gap-1 border border-white/10">
                    <Clock className="w-4 h-4 text-[#00FF87]" />
                    <span className="font-bold text-[10px] sm:text-[11px]">تفعيل فوري سحابي</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#070C1A] flex flex-col items-center gap-1 border border-white/10">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-[10px] sm:text-[11px]">ضمان تشغيل 100%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0B1528] to-[#070C1A] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl text-white">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#00FF87]" />
                <span>ماذا يحدث بعد إرسال الطلب؟</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-[#0F172A] rounded-2xl border border-white/10 space-y-1">
                  <span className="text-[#00FF87] font-black block">1. توثيق المعاملة</span>
                  <p className="text-gray-400 text-xs leading-relaxed">يتم استلام بيانات التحويل ولقطة الشاشة وحفظها بأمان داخل النظام.</p>
                </div>

                <div className="p-4 bg-[#0F172A] rounded-2xl border border-white/10 space-y-1">
                  <span className="text-[#00FF87] font-black block">2. المطابقة الذكية</span>
                  <p className="text-gray-400 text-xs leading-relaxed">مطابقة فورية وتأكيد إشعار التحويل من البنك أو المحفظة مع طلبك.</p>
                </div>

                <div className="p-4 bg-[#0F172A] rounded-2xl border border-white/10 space-y-1">
                  <span className="text-[#00FF87] font-black block">3. التفعيل الفوري</span>
                  <p className="text-gray-400 text-xs leading-relaxed">يتم فتح الأدوات والدورة في صفحة طلباتك خلال أقل من 60 دقيقة.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Desktop Sticky Order Summary Sidebar (4-5 cols on lg) */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-4 sticky top-24 space-y-5">
            
            {/* Sticky Order Summary Card */}
            <div className="bg-[#0F172A]/95 backdrop-blur-xl rounded-3xl p-6 border border-white/15 shadow-2xl space-y-5 text-white">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#00FF87]/15 text-[#00FF87] flex items-center justify-center font-black">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 font-bold block">تفاصيل الطلب</span>
                    <h3 className="text-sm sm:text-base font-black text-white">{currentPkg.name}</h3>
                  </div>
                </div>
                <span className="text-xs font-black text-[#00FF87] bg-[#00FF87]/15 px-3 py-1 rounded-full border border-[#00FF87]/30">
                  مدى الحياة
                </span>
              </div>

              {/* Package Included Highlights with Dedicated Details Button */}
              <div className="space-y-2.5 text-xs text-gray-300 bg-[#070C1A] p-4 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[11px] text-white">أبرز ما تشمله باقتك:</span>
                  <span className="text-[10px] text-[#00FF87] font-bold">تفعيل دائم</span>
                </div>

                {currentPkg.features.slice(0, 4).map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF87] shrink-0 mt-0.5" />
                    <span className="font-medium text-gray-300">{f.text}</span>
                  </div>
                ))}

                <div className="pt-2 border-t border-white/10">
                  <Link
                    href={`/packages/${currentPkg.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-[#00FF87]/10 border border-white/15 hover:border-[#00FF87]/30 text-gray-200 hover:text-[#00FF87] font-black text-[11px] flex items-center justify-center gap-1.5 transition-colors group"
                  >
                    <span>عرض الشرح الكامل والمميزات بالتفصيل</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#00FF87] group-hover:translate-x-[-2px] transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs pt-2 border-t border-white/10">
                <div className="flex justify-between text-gray-400 font-medium">
                  <span>السعر الأصلي:</span>
                  <span className="line-through font-mono">{currentPkg.originalPrice} {currentPkg.currency}</span>
                </div>
                <div className="flex justify-between text-gray-300 font-bold">
                  <span>سعر العرض:</span>
                  <span className="font-mono">{currentPkg.discountedPrice} {currentPkg.currency}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-[#00FF87] font-bold">
                    <span>خصم الكوبون ({appliedCoupon.code}):</span>
                    <span className="font-mono">- {appliedCoupon.discountAmount} {currentPkg.currency}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-white/15">
                  <span>الإجمالي المطلوب:</span>
                  <span className="text-xl text-[#00FF87] font-mono">{finalPayableAmount} {currentPkg.currency}</span>
                </div>
              </div>

              {/* Trust Badges in Sidebar */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Lock className="w-3.5 h-3.5 text-[#00FF87] shrink-0" />
                  <span>تشفير آمن 256-bit SSL</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="w-3.5 h-3.5 text-[#00FF87] shrink-0" />
                  <span>تفعيل فوري خلال أقل من 60 دقيقة</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>تحديثات مجانية مستمرة مدى الحياة</span>
                </div>
              </div>

              {/* Help WhatsApp Support */}
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(`مرحباً، أحتاج مساعدة في إتمام طلبي لـ ${currentPkg.name}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-white/15"
              >
                <span>تحتاج مساعدة؟ تواصل عبر واتساب</span>
                <Send className="w-3.5 h-3.5 text-[#00FF87]" />
              </a>
            </div>

          </div>

        </div>

      </main>

      {/* 🚀 STICKY FLOATING SUMMARY BAR (Always visible on Mobile & Desktop) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B1220]/95 backdrop-blur-md border-t border-white/10 px-4 py-3 text-white shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#00FF87] text-[#0A1128] flex items-center justify-center font-black text-xs shrink-0 shadow-md">
              ✓
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-gray-300 block truncate max-w-[140px] sm:max-w-xs">{currentPkg.name}</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm sm:text-lg font-black text-[#00FF87] font-mono">
                  {finalPayableAmount} {currentPkg.currency}
                </span>
                {appliedCoupon ? (
                  <span className="text-[10px] bg-[#00FF87]/20 text-[#00FF87] px-1.5 py-0.5 rounded border border-[#00FF87]/30 font-bold">
                    خصم {appliedCoupon.discountPercent}% ({appliedCoupon.code})
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-400 line-through font-mono">
                    {currentPkg.originalPrice}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={isSubmittingOrder}
            onClick={handleOrderSubmit}
            className="px-4 sm:px-6 py-2.5 bg-[#00FF87] hover:bg-[#00E676] text-[#0A1128] text-xs sm:text-sm font-black rounded-xl transition-all shrink-0 cursor-pointer shadow-md shadow-[#00FF87]/20 flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            <span>
              {isSubmittingOrder ? 'جاري التأكيد...' : `تأكيد الطلب (${finalPayableAmount} ج)`}
            </span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 pb-24 border-t border-white/10 text-center text-xs text-gray-400 bg-[#070C1A]">
        <p suppressHydrationWarning>© {new Date().getFullYear()} GROWIX — جميع الحقوق محفوظة | عملية دفع وتأكيد مشفرة 100%</p>
      </footer>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070C1A] text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#00FF87] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-400 font-bold">جاري تحميل صفحة الدفع والتأكيد...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
