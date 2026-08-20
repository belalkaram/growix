'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import { 
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
  X,
  UploadCloud,
  Image as ImageIcon,
  FileCheck
} from 'lucide-react';
import { SITE_CONFIG, SITE_PRICING, PricingPackage } from '@/config/site';
import { GrowixLogo } from '@/components/GrowixLogo';
import { CustomToolSelector } from '@/components/CustomToolSelector';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createOrderAction } from '@/lib/actions/orders';
import { validateCouponAction } from '@/lib/actions/coupons';
import { getAllPackagesAction } from '@/lib/actions/packages';
import { uploadReceiptAction } from '@/lib/actions/receipts';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Auto-validate initial coupon from query param if present
  useEffect(() => {
    if (initialCouponParam && !appliedCoupon) {
      validateCouponAction(initialCouponParam.trim(), packagePriceNum).then((res) => {
        if (res.success && res.coupon) {
          setAppliedCoupon(res.coupon);
          setCouponMessage({
            type: 'success',
            text: `تم استعادة وتطبيق الكوبون (${res.coupon.code}) بنجاح! خصم ${res.coupon.discountPercent}%`,
          });
        }
      });
    }
  }, [initialCouponParam]);

  const availablePackages = packages && packages.length > 0 ? packages : SITE_CONFIG.packages;
  const currentPkg = availablePackages.find((p) => p.id === activePkgId) || availablePackages[0];
  const currentTool = SITE_CONFIG.tools.find((t) => t.id === selectedToolId) || SITE_CONFIG.tools[0];
  const currentPayment = SITE_CONFIG.paymentMethods.find((m) => m.id === activePaymentMethod) || SITE_CONFIG.paymentMethods[0];

  const packagePriceNum = parseInt(currentPkg.discountedPrice.replace(/[^0-9]/g, '')) || 0;

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
  }, [activePkgId, packagePriceNum]);

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

  const finalPayableAmount = appliedCoupon ? appliedCoupon.finalPrice : packagePriceNum;

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
    // 1. If user is guest/unauthenticated, redirect to login while preserving full checkout choices
    if (status === 'unauthenticated') {
      const returnUrl = `/checkout?package=${activePkgId}${
        activePkgId === 'single-tool' ? `&tool=${selectedToolId}` : ''
      }${appliedCoupon ? `&coupon=${appliedCoupon.code}` : ''}${
        senderNumber ? `&sender=${encodeURIComponent(senderNumber)}` : ''
      }&method=${activePaymentMethod}`;

      router.push(`/login?callbackUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    if (!senderNumber || senderNumber.trim().length < 4) {
      setOrderMessage({ type: 'error', text: 'يرجى إدخال رقم المحفظة أو الحساب المحوّل منه أولاً' });
      return;
    }

    setIsSubmittingOrder(true);
    setOrderMessage(null);
    setUploadStatusText('جاري معالجة الطلب...');

    // 2. Upload Receipt Image to Cloudflare R2 if attached
    let receiptUrl: string | undefined = undefined;
    let receiptKey: string | undefined = undefined;

    if (receiptFile) {
      setUploadStatusText('جاري رفع صورة الإثبات إلى السيرفر الآمن (R2)...');
      const formData = new FormData();
      formData.append('file', receiptFile);
      formData.append('senderNumber', senderNumber.trim());

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

    setUploadStatusText('جاري توثيق وتأكيد الطلب...');

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
    });

    setIsSubmittingOrder(false);
    setUploadStatusText('');

    if (!res.success) {
      setOrderMessage({ type: 'error', text: res.error || 'حدث خطأ أثناء حفظ الطلب' });
    } else {
      // Direct instant redirection to My Orders page without WhatsApp
      router.push(`/my-orders?orderId=${res.orderId}&success=1`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0B1220] flex flex-col dir-rtl font-sans selection:bg-[#0F9D58] selection:text-white">
      
      {/* Distraction-Free Light Header */}
      <header className="bg-white text-[#0B1220] border-b border-gray-200 shadow-2xs sticky top-0 z-30">
        <div className="max-w-5xl mx-auto py-3.5 px-4 sm:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <GrowixLogo theme="light" iconSize={34} showSubtitle={false} />
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-[#0F9D58] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>دفع وتأكيد آمن 100%</span>
            </span>

            <Link
              href="/"
              className="text-xs font-bold text-gray-700 hover:text-[#0B1220] flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors border border-gray-200"
            >
              <span>الرئيسية</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#0F9D58]" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area - Clean White & High Contrast Theme */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-7">
        
        {/* Title Header Card */}
        <div className="bg-[#0B1220] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-gray-100 shadow-xl space-y-4">
          <div className="absolute top-0 left-0 w-80 h-80 bg-[#0F9D58]/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div className="inline-flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 bg-[#0F9D58]/20 text-[#2ECC8F] border border-[#2ECC8F]/30 rounded-full w-fit">
              <Sparkles className="w-4 h-4" />
              <span>صفحة تأكيد الاشتراك والتفعيل</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-300 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 w-fit">
              <Clock className="w-4 h-4 text-[#2ECC8F]" />
              <span>التفعيل فور التحويل خلال أقل من ساعة</span>
            </div>
          </div>

          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-black text-white">إتمام الطلب وتأكيد الاشتراك</h1>
            <p className="text-gray-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              اختر الباقة المناسبة، حول المبلغ بالطريقة المريحة لك، ثم أرسل إثبات الدفع عبر الواتساب لتشغيل حسابك فوراً.
            </p>
          </div>

          {/* Pricing Summary Banner */}
          <div className="p-4 bg-white/10 backdrop-blur rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/15 relative z-10">
            <div>
              <span className="text-xs text-gray-300 block mb-0.5">المبلغ المطلوب تحويله حالياً:</span>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black text-[#2ECC8F]">
                  {finalPayableAmount} {currentPkg.currency}
                </span>

                {appliedCoupon ? (
                  <>
                    <span className="text-sm text-gray-400 line-through">
                      {currentPkg.discountedPrice} {currentPkg.currency}
                    </span>
                    <span className="text-[11px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-md font-black border border-emerald-400/40">
                      وفرت {appliedCoupon.discountAmount} ج ({appliedCoupon.discountPercent}%)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-gray-400 line-through">
                      {currentPkg.originalPrice} {currentPkg.currency}
                    </span>
                    <span className="text-[11px] bg-[#2ECC8F]/20 text-[#2ECC8F] px-2 py-0.5 rounded-md font-bold">
                      خصم لفترة محدودة
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="text-right sm:text-left">
              <span className="text-xs text-gray-300 block">الباقة المختارة:</span>
              <span className="font-bold text-white text-sm">{currentPkg.name}</span>
            </div>
          </div>
        </div>

        {/* STEP 1: Package Selector (Clean Interactive Cards) */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-200 space-y-4 shadow-sm text-[#0B1220]">
          <div className="flex items-center justify-between">
            <label className="block text-sm sm:text-base font-extrabold text-[#0B1220] flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#0F9D58]/10 text-[#0F9D58] flex items-center justify-center font-black text-xs border border-[#0F9D58]/20">1</div>
              <span>اختر نوع الباقة أو الخدمة:</span>
            </label>
            <span className="text-xs text-gray-400">خطوة 1 من 4</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {availablePackages.map((pkg) => {
              const isSelected = pkg.id === activePkgId;
              const isVIP = pkg.id === 'bundle-vip';
              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setActivePkgId(pkg.id)}
                  className={`p-4 rounded-2xl border text-right transition-all relative flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-[#0F9D58] bg-emerald-50/70 ring-2 ring-[#0F9D58]/20 shadow-2xs'
                      : 'border-gray-200 bg-gray-50/60 hover:bg-gray-100/80 text-gray-700'
                  }`}
                >
                  {isVIP && (
                    <span className="absolute -top-2.5 left-3 text-[10px] bg-[#0F9D58] text-white px-2 py-0.5 rounded-full font-black shadow-xs">
                      الأكثر طلباً ⭐
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-black ${isSelected ? 'text-[#0F9D58]' : 'text-[#0B1220]'}`}>
                        {pkg.name}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0F9D58]" />}
                    </div>
                    <p className="text-[11px] text-gray-500 leading-snug line-clamp-2 mb-3">
                      {pkg.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-200/80 flex items-baseline justify-between">
                    <span className="text-xs font-bold text-gray-400 line-through">{pkg.originalPrice}</span>
                    <span className="text-sm font-black text-[#0B1220]">{pkg.discountedPrice} {pkg.currency}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {activePkgId === 'single-tool' && (
            <div className="pt-3 border-t border-gray-100">
              <CustomToolSelector
                selectedToolId={selectedToolId}
                onSelectTool={setSelectedToolId}
              />
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-200 space-y-4 shadow-sm text-[#0B1220]">
          <div className="flex items-center justify-between">
            <label className="text-sm font-extrabold text-[#0B1220] flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#0F9D58]" />
              <span>هل لديك كود خصم أو كوبون؟</span>
            </label>
            <span className="text-[11px] text-gray-400 font-medium">اختياري</span>
          </div>

          {appliedCoupon ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-emerald-900 text-sm dir-ltr font-mono">{appliedCoupon.code}</span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded font-black">
                      خصم {appliedCoupon.discountPercent}%
                    </span>
                  </div>
                  <span className="text-xs text-emerald-700 font-medium">
                    تم توفير {appliedCoupon.discountAmount} جنية من إجمالي الطلب
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-xs text-red-600 hover:text-red-800 font-bold flex items-center gap-1 bg-red-50 hover:bg-red-100 p-2 rounded-xl border border-red-200 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">إلغاء الكوبون</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                  placeholder="أدخل كود الكوبون هنا..."
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-300 text-xs font-mono font-bold text-[#0B1220] uppercase placeholder:normal-case placeholder:text-gray-400 focus:bg-white focus:outline-none focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/20 transition-all dir-ltr"
                />
              </div>

              <button
                type="submit"
                disabled={couponLoading || !couponCodeInput.trim()}
                className="px-6 py-3 bg-[#0B1220] hover:bg-gray-800 text-white text-xs font-extrabold rounded-2xl transition-all disabled:opacity-40 cursor-pointer shrink-0"
              >
                {couponLoading ? 'جاري الفحص...' : 'تطبيق الكود'}
              </button>
            </form>
          )}

          {couponMessage && (
            <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              couponMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{couponMessage.text}</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-200 space-y-4 shadow-sm text-[#0B1220]">
          <div className="flex items-center justify-between">
            <label className="block text-sm sm:text-base font-extrabold text-[#0B1220] flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#0F9D58]/10 text-[#0F9D58] flex items-center justify-center font-black text-xs border border-[#0F9D58]/20">2</div>
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
                      ? 'border-[#0F9D58] bg-emerald-50/70 ring-2 ring-[#0F9D58]/20 text-[#0B1220] shadow-2xs'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-[#0F9D58] text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {method.id === 'instapay' ? <CreditCard className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="block text-xs font-bold text-[#0B1220] truncate">{method.name}</span>
                    <span className="text-[11px] text-gray-500 block truncate">{method.type}</span>
                  </div>

                  {isSelected && <CheckCircle2 className="w-5 h-5 text-[#0F9D58] shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="p-4 sm:p-5 bg-gray-50/90 rounded-2xl border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600">{currentPayment.type}:</span>
              <span className="text-[10px] text-[#0F9D58] font-extrabold bg-[#0F9D58]/10 px-2.5 py-0.5 rounded-full border border-[#0F9D58]/20">
                تحويل مباشر
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-inner">
              <span className="font-black text-lg sm:text-xl text-[#0B1220] tracking-wider dir-ltr font-mono">
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
              {currentPayment.instructions}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-200 space-y-4 shadow-sm text-[#0B1220]">
          <div className="flex items-center justify-between">
            <label className="block text-sm sm:text-base font-extrabold text-[#0B1220] flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#0F9D58]/10 text-[#0F9D58] flex items-center justify-center font-black text-xs border border-[#0F9D58]/20">3</div>
              <span>أدخل رقم الهاتف / الحساب الذي قمت بالتحويل منه:</span>
            </label>
            <span className="text-xs text-gray-400">خطوة 3 من 4</span>
          </div>

          <div>
            <input
              type="tel"
              required
              value={senderNumber}
              onChange={(e) => setSenderNumber(e.target.value)}
              placeholder="مثال: 01012345678 أو عنوان إنستاباي المحوّل منه"
              className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-300 text-sm font-bold text-[#0B1220] placeholder:text-gray-400 focus:bg-white focus:outline-none focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/20 transition-all dir-rtl"
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-200 space-y-4 shadow-sm text-[#0B1220]">
          <div className="flex items-center justify-between">
            <label className="block text-sm sm:text-base font-extrabold text-[#0B1220] flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#0F9D58]/10 text-[#0F9D58] flex items-center justify-center font-black text-xs border border-[#0F9D58]/20">4</div>
              <span>إرفاق لقطة شاشة لإثبات التحويل:</span>
            </label>
            <span className="text-xs text-[#0F9D58] font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
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
            <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 w-full sm:w-auto">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-emerald-200 bg-white shrink-0 relative shadow-xs">
                  <img
                    src={receiptPreview}
                    alt="معاينة إيصال التحويل"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900 mb-0.5">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span className="truncate">{receiptFile?.name || 'صورة الإثبات'}</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 block">
                    الحجم: {((receiptFile?.size || 0) / (1024 * 1024)).toFixed(2)} ميجابايت (جاهز للرفع والتأكيد)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 transition-colors"
                >
                  تغيير الصورة
                </button>
                <button
                  type="button"
                  onClick={handleRemoveReceipt}
                  className="p-2 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors"
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
                  ? 'border-[#0F9D58] bg-emerald-50/80 scale-[1.01]'
                  : 'border-gray-300 bg-gray-50/70 hover:bg-gray-100 hover:border-gray-400'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-[#0F9D58]/10 text-[#0F9D58] flex items-center justify-center shadow-xs">
                <UploadCloud className="w-6 h-6" />
              </div>

              <div>
                <span className="text-xs sm:text-sm font-black text-[#0B1220] block">
                  اضغط هنا لاختيار لقطة الشاشة أو اسحب الصورة وأفلتها
                </span>
                <span className="text-[11px] text-gray-500 block mt-0.5">
                  ندعم صور PNG, JPG, WEBP بحد أقصى 5 ميجابايت (تُحفظ بشكل آمن ومشفر)
                </span>
              </div>
            </div>
          )}

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

          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              disabled={isSubmittingOrder}
              onClick={handleOrderSubmit}
              className="w-full py-4 px-6 rounded-2xl bg-[#0F9D58] hover:bg-[#0D8B4E] active:scale-[0.99] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl shadow-[#0F9D58]/25 transition-all text-center cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>
                {isSubmittingOrder
                  ? uploadStatusText || 'جاري تأكيد الطلب...'
                  : 'تأكيد وإرسال الطلب الآن'}
              </span>
            </button>

            <p className="text-xs text-gray-500 text-center font-medium leading-relaxed">
              بمجرد تأكيد الطلب، سيتم تسجيل عملية الدفع والتحقق من صحتها وتفعيل حسابك تلقائياً وبشكل فوري.
            </p>
          </div>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-3xl p-6 space-y-4 shadow-sm text-[#0B1220]">
          <h4 className="text-xs font-black text-[#0B1220] uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0F9D58]" />
            <span>ماذا يحدث بعد إرسال الطلب؟</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-2xs space-y-1">
              <span className="text-[#0F9D58] font-black block">1. توثيق المعاملة</span>
              <p className="text-gray-600 text-xs leading-relaxed">يتم استلام بيانات التحويل ولقطة الشاشة وحفظها بأمان داخل النظام.</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-2xs space-y-1">
              <span className="text-[#0F9D58] font-black block">2. المطابقة المالية</span>
              <p className="text-gray-600 text-xs leading-relaxed">يقوم فريق الدعم بمراجعة وتأكيد إيصال التحويل مع حساب البنك.</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-2xs space-y-1">
              <span className="text-[#0F9D58] font-black block">3. التفعيل الفوري</span>
              <p className="text-gray-600 text-xs leading-relaxed">يتم فتح الأدوات والدورة في صفحة طلباتك خلال أقل من 60 دقيقة.</p>
            </div>
          </div>
        </div>

      </main>

      {/* Distraction-Free Minimal Light Footer */}
      <footer className="py-6 border-t border-gray-200 text-center text-xs text-gray-500 bg-white">
        <p suppressHydrationWarning>© {new Date().getFullYear()} GROWIX — جميع الحقوق محفوظة | عملية دفع وتأكيد مشفرة 100%</p>
      </footer>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] text-[#0B1220] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#0F9D58] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-600 font-bold">جاري تحميل صفحة الدفع والتأكيد...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
