import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Copy, 
  CheckCircle2, 
  Smartphone, 
  CreditCard, 
  Wallet, 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  Clock, 
  ArrowLeft,
  Sparkles,
  Layers,
  Wrench
} from 'lucide-react';
import { SITE_CONFIG, SITE_PRICING, PricingPackage } from '@/config/site';
import { GrowixLogo } from '@/components/GrowixLogo';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: PricingPackage | null;
  initialToolId?: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  selectedPackage,
  initialToolId,
}) => {
  useBodyScrollLock(isOpen);

  const [activePaymentMethod, setActivePaymentMethod] = useState<string>('electronic-wallet');
  const [senderNumber, setSenderNumber] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // User selection overrides (null means fall back to prop values)
  const [userPkgId, setUserPkgId] = useState<string | null>(null);
  const [userToolId, setUserToolId] = useState<string | null>(null);

  const activePkgId = userPkgId ?? selectedPackage?.id ?? 'bundle-vip';
  const selectedToolId = userToolId ?? initialToolId ?? SITE_CONFIG.tools[0].id;

  const setActivePkgId = (id: string) => setUserPkgId(id);
  const setSelectedToolId = (id: string) => setUserToolId(id);

  if (!isOpen) return null;

  const currentPkg = SITE_CONFIG.packages.find((p) => p.id === activePkgId) || SITE_CONFIG.packages[0];
  const currentTool = SITE_CONFIG.tools.find((t) => t.id === selectedToolId) || SITE_CONFIG.tools[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  // Generate WhatsApp pre-filled message
  const generateWhatsAppUrl = () => {
    let message = '';
    const currentMethod = SITE_CONFIG.paymentMethods.find((m) => m.id === activePaymentMethod) || SITE_CONFIG.paymentMethods[0];
    const senderInfoText = senderNumber.trim() ? senderNumber.trim() : 'لم يتم إدخاله';

    if (currentPkg.id === 'single-tool') {
      message = `مرحباً فريق GROWIX!\nلقد قمت بتحويل مبلغ ${currentPkg.discountedPrice} ${currentPkg.currency} لشراء برنامج: [${currentTool.name}].\n\nالبيانات والتحويل:\n- طريقة التحويل: ${currentMethod.name}\n- رقم/حساب المحوِّل منه: ${senderInfoText}\n\nيرجى الاطلاع على صورة إيصال التحويل المرفقة وتفعيل حسابي وشرح الأداة. شكراً لكم!`;
    } else {
      message = `مرحباً فريق GROWIX!\nلقد قمت بتحويل مبلغ ${currentPkg.discountedPrice} ${currentPkg.currency} لشراء [${currentPkg.name}].\n\nالبيانات والتحويل:\n- طريقة التحويل: ${currentMethod.name}\n- رقم/حساب المحوِّل منه: ${senderInfoText}\n\nيرجى الاطلاع على صورة إيصال التحويل المرفقة وتفعيل حسابي وشرح الأدوات والكورس. شكراً لكم!`;
    }
    const text = encodeURIComponent(message);
    return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${text}`;
  };

  // Generate Telegram pre-filled message
  const generateTelegramUrl = () => {
    return `https://t.me/${SITE_CONFIG.telegramUsername}`;
  };

  return (
    <AnimatePresence>
      <div 
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto overscroll-contain bg-[#0B1220]/80 backdrop-blur-md touch-pan-y"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-auto max-h-[92vh] sm:max-h-[88vh] flex flex-col overscroll-contain dir-rtl"
        >
          {/* Header Banner */}
          <div className="bg-[#0B1220] text-white p-5 sm:p-6 relative overflow-hidden shrink-0">
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-[#0F9D58]/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#2ECC8F]/20 rounded-full blur-2xl pointer-events-none" />

            <button
              onClick={() => onClose()}
              className="absolute top-4 left-4 text-gray-400 hover:text-white bg-white/10 p-2 rounded-full transition-colors z-10"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1 bg-[#0F9D58]/20 text-[#2ECC8F] border border-[#2ECC8F]/30 rounded-full w-fit">
                <Sparkles className="w-3.5 h-3.5" />
                <span>إتمام الطلب والتفعيل الفوري</span>
              </div>
              <GrowixLogo theme="dark" iconSize={28} className="opacity-90 hidden sm:flex" />
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold mb-1">خطوة واحدة لبدء استخدام GROWIX</h3>
            <p className="text-gray-300 text-xs sm:text-sm">
              حدد الباقة المناسبة لك وأكمل التحويل لتفعيل حسابك فوراً:
            </p>

            {/* Package Summary Badge */}
            <div className="mt-3.5 p-3 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-between border border-white/10">
              <div>
                <span className="text-xs text-gray-300 block">المبلغ المطلوب تحويله:</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-black text-[#2ECC8F]">
                    {currentPkg.discountedPrice} {currentPkg.currency}
                  </span>
                  <span className="text-xs text-gray-400 line-through">
                    {currentPkg.originalPrice} {currentPkg.currency}
                  </span>
                </div>
              </div>
              <div className="text-left text-xs text-gray-300 flex items-center gap-1.5 bg-[#2ECC8F]/10 px-3 py-1.5 rounded-xl border border-[#2ECC8F]/20">
                <Clock className="w-4 h-4 text-[#2ECC8F]" />
                <span>تفعيل خلال أقل من ساعة</span>
              </div>
            </div>
          </div>

          {/* Body Content - Scrollable independently */}
          <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto overscroll-contain touch-pan-y flex-1 dir-rtl scrollbar-thin">
            
            {/* Step 0: Package Selector */}
            <div className="space-y-3">
              <label className="block text-xs sm:text-sm font-extrabold text-[#0B1220] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#0F9D58]" />
                <span>1. اختر الباقة التي تريد الاشتراك بها:</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* VIP Bundle Card */}
                <button
                  type="button"
                  onClick={() => setActivePkgId('bundle-vip')}
                  className={`p-3.5 rounded-2xl border text-right transition-all relative flex flex-col justify-between ${
                    activePkgId === 'bundle-vip'
                      ? 'bg-[#0B1220] text-white border-[#2ECC8F] ring-2 ring-[#2ECC8F]/30 shadow-md'
                      : 'bg-white text-[#0B1220] border-gray-200 hover:border-gray-300 hover:bg-gray-50/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-[#2ECC8F] text-[#0B1220]">
                      الأكثر طلباً ({SITE_PRICING.fullPackagePrice} ج)
                    </span>
                    {activePkgId === 'bundle-vip' && (
                      <CheckCircle2 className="w-5 h-5 text-[#2ECC8F] shrink-0" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-1">الباقة الكاملة (الكورس + 12 أداة + الداتا)</h4>
                    <p className={`text-[11px] leading-tight ${activePkgId === 'bundle-vip' ? 'text-gray-300' : 'text-gray-500'}`}>
                      الكورس الكامل + الـ 12 أداة تسويق بالكامل + هدية داتا مصر + الدعم الفني.
                    </p>
                  </div>
                </button>

                {/* Single Tool Card */}
                <button
                  type="button"
                  onClick={() => setActivePkgId('single-tool')}
                  className={`p-3.5 rounded-2xl border text-right transition-all relative flex flex-col justify-between ${
                    activePkgId === 'single-tool'
                      ? 'bg-[#0B1220] text-white border-[#2ECC8F] ring-2 ring-[#2ECC8F]/30 shadow-md'
                      : 'bg-white text-[#0B1220] border-gray-200 hover:border-gray-300 hover:bg-gray-50/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
                      برنامج واحد ({SITE_PRICING.singleToolPrice} ج)
                    </span>
                    {activePkgId === 'single-tool' && (
                      <CheckCircle2 className="w-5 h-5 text-[#2ECC8F] shrink-0" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-1">باقة برنامج واحد فقط من الـ 12</h4>
                    <p className={`text-[11px] leading-tight ${activePkgId === 'single-tool' ? 'text-gray-300' : 'text-gray-500'}`}>
                      اختر برنامج واحد محدد من الـ 12 أداة مع فيديو الشرح والتفعيل.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 0.5: Tool Selector for Single Tool Package */}
            {activePkgId === 'single-tool' && (
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 sm:p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs sm:text-sm font-extrabold text-[#0B1220] flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-[#0F9D58]" />
                    <span>حدد البرنامج المطلوب ({SITE_PRICING.singleToolPrice} جنيه):</span>
                  </label>
                  <span className="text-[11px] bg-[#0F9D58] text-white px-2.5 py-0.5 rounded-full font-bold">
                    12 أداة متاحة
                  </span>
                </div>

                {/* 12 Tools Selection Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 sm:max-h-52 overflow-y-auto overscroll-contain p-1 dir-rtl scrollbar-thin touch-pan-y">
                  {SITE_CONFIG.tools.map((tool) => {
                    const isChosen = selectedToolId === tool.id;
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => setSelectedToolId(tool.id)}
                        className={`p-2.5 rounded-xl border text-right text-xs font-bold transition-all flex items-center justify-between gap-2 ${
                          isChosen
                            ? 'bg-[#0B1220] text-white border-[#2ECC8F] shadow-md ring-2 ring-[#2ECC8F]/30'
                            : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-[10px] font-mono ${
                            isChosen ? 'bg-[#2ECC8F] text-[#0B1220]' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {tool.number}
                          </span>
                          <span className="truncate font-bold">{tool.name}</span>
                        </div>
                        {isChosen && <CheckCircle2 className="w-4 h-4 text-[#2ECC8F] shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="text-xs font-semibold text-emerald-900 bg-white p-2.5 rounded-xl border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0F9D58] shrink-0" />
                  <span>
                    البرنامج المختار: <strong className="text-[#0F9D58] font-black underline">{currentTool.name}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Sender Phone Number Input Box */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-extrabold text-[#0B1220] flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#0F9D58]" />
                <span>2. أدخل رقم المحفظة / الحساب المحوِّل منه:</span>
              </label>
              <input
                type="text"
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                placeholder="مثال: 01012345678 أو اسم حساب إنستاباي"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-bold text-[#0B1220] focus:outline-none focus:border-[#0F9D58] focus:ring-1 focus:ring-[#0F9D58] dir-rtl"
              />
            </div>

            {/* Step 2: Payment Method Selection (2 options) */}
            <div>
              <label className="block text-sm font-bold text-[#0B1220] mb-2.5">
                3. اختر طريقة التحويل المناسبة:
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SITE_CONFIG.paymentMethods.map((method) => {
                  const isSelected = activePaymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setActivePaymentMethod(method.id)}
                      className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-2.5 relative ${
                        isSelected
                          ? 'border-[#0F9D58] bg-[#0F9D58]/5 ring-2 ring-[#0F9D58]/20 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#0F9D58] text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {method.id === 'instapay' ? <CreditCard className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-[#0B1220] block truncate">{method.name}</span>
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-[#0F9D58] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Payment Method Display Box */}
            {(() => {
              const currentMethod = SITE_CONFIG.paymentMethods.find((m) => m.id === activePaymentMethod) || SITE_CONFIG.paymentMethods[0];
              const isCopied = copiedId === currentMethod.id;

              return (
                <div className="p-4 bg-[#F7F9FA] rounded-2xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-500 block">{currentMethod.type}:</span>
                      <span className="text-lg font-black text-[#0B1220] dir-ltr tracking-wider font-mono">
                        {currentMethod.number}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(currentMethod.number, currentMethod.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isCopied
                          ? 'bg-[#0F9D58] text-white shadow-md scale-105'
                          : 'bg-white text-[#0B1220] border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-white" />
                          <span>تم النسخ بنجاح!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>نسخ الرقم</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-gray-600 bg-white p-2.5 rounded-xl border border-gray-100 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#0F9D58] shrink-0 mt-0.5" />
                    <span>{currentMethod.instructions}</span>
                  </p>
                </div>
              );
            })()}

            {/* Step 2: Confirmation Instructions */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900 text-xs leading-relaxed space-y-1">
              <p className="font-bold text-amber-950 flex items-center gap-1.5 mb-1 text-sm">
                <CheckCircle2 className="w-4 h-4 text-[#0F9D58] shrink-0" />
                <span>خطوات إتمام الدفع والتفعيل:</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 pr-1 font-medium">
                <li>قم بتحويل مبلغ <strong className="text-amber-950">{currentPkg.discountedPrice} {currentPkg.currency}</strong> على الرقم الموضح أعلاه.</li>
                <li>التقط صورة شاشة (Screenshot) أو صورة لإيصال عملية التحويل.</li>
                <li>اضغط على زر الواتساب الأخضر أدناه لإرسال الإثبات مباشرة لفريق الخدمة.</li>
              </ol>
            </div>

            {/* Primary Action Button: Open WhatsApp */}
            <div className="space-y-3 pt-1">
              <a
                href={generateWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-2xl bg-growix-gradient hover:bg-growix-gradient-hover text-white font-extrabold text-base flex items-center justify-center gap-3 shadow-lg shadow-[#0F9D58]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageSquare className="w-5 h-5 fill-current" />
                <span>أرسل إثبات الدفع على الواتساب الآن</span>
                <ArrowLeft className="w-5 h-5 mr-auto" />
              </a>

              <div className="flex items-center justify-between text-xs text-gray-500 px-2 pt-1">
                <a
                  href={generateTelegramUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-[#0B1220] underline flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5 text-sky-500" />
                  <span>تفضل التواصل عبر تليجرام؟ اضغط هنا</span>
                </a>
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  ضمان تفعيل آمن وسريع
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

