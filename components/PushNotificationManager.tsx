'use client';

import React, { useState, useEffect } from 'react';
import {
  isPushSupported,
  isIosDevice,
  isStandalonePwa,
  getNotificationPermission,
  getActiveSubscription,
  subscribeUserToPush,
  unsubscribeUserFromPush,
  registerServiceWorker,
} from '@/lib/push-client';
import {
  Bell,
  BellRing,
  BellOff,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Share,
  PlusSquare,
  Sparkles,
  Loader2,
  RefreshCw,
  Send,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface PushNotificationManagerProps {
  compact?: boolean;
  className?: string;
  showTestButton?: boolean;
}

export const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({
  compact = false,
  className = '',
  showTestButton = true,
}) => {
  const [mounted, setMounted] = useState(false);
  const [supported, setSupported] = useState(true);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testingPush, setTestingPush] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Check state on mount
  useEffect(() => {
    setMounted(true);
    const checkState = async () => {
      const isSupp = isPushSupported();
      setSupported(isSupp);
      const ios = isIosDevice();
      setIsIos(ios);
      const standalone = isStandalonePwa();
      setIsStandalone(standalone);

      if (isSupp) {
        // Register SW in background to prepare push manager
        await registerServiceWorker();
        const perm = getNotificationPermission();
        setPermission(perm);
        const sub = await getActiveSubscription();
        setIsSubscribed(Boolean(sub));
      } else {
        setPermission('unsupported');
      }
    };

    checkState();
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    setFeedback(null);

    const result = await subscribeUserToPush();
    setLoading(false);

    if (result.success && result.subscription) {
      setIsSubscribed(true);
      setPermission('granted');
      setFeedback({
        type: 'success',
        message: 'تم تفعيل إشعارات الهاتف بنجاح! ستصلك الآن كافة إشعارات المنصة مباشرة على هاتفك.',
      });
    } else {
      setPermission(result.permission || getNotificationPermission());
      setFeedback({
        type: 'error',
        message: result.error || 'حدث خطأ أثناء تفعيل الإشعارات. يرجى التأكد من السماح بالإشعارات.',
      });
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    setFeedback(null);

    const result = await unsubscribeUserFromPush();
    setLoading(false);

    if (result.success) {
      setIsSubscribed(false);
      setFeedback({
        type: 'info',
        message: 'تم إيقاف الإشعارات لهذا الجهاز.',
      });
    } else {
      setFeedback({
        type: 'error',
        message: result.error || 'حدث خطأ أثناء إيقاف الإشعارات.',
      });
    }
  };

  const handleTestPush = async () => {
    setTestingPush(true);
    setFeedback(null);

    try {
      const sub = await getActiveSubscription();
      const res = await fetch('/api/push/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub ? sub.toJSON() : undefined }),
      });

      const data = await res.json();
      setTestingPush(false);

      if (data.success) {
        setFeedback({
          type: 'success',
          message: data.message || 'تم إرسال إشعار التجربة بنجاح! تفقّد شاشة هاتفك الآن 🚀',
        });
      } else {
        setFeedback({
          type: 'error',
          message: data.error || 'فشل إرسال إشعار التجربة.',
        });
      }
    } catch (err: any) {
      setTestingPush(false);
      setFeedback({
        type: 'error',
        message: 'حدث خطأ في الاتصال أثناء إرسال إشعار الاختبار.',
      });
    }
  };

  if (!mounted) return null;

  // Render Compact Badge
  if (compact) {
    if (isSubscribed) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <BellRing className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          إشعارات الهاتف مفعّلة
        </span>
      );
    }

    return (
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-[#0F9D58]/10 text-[#0F9D58] hover:bg-[#0F9D58]/20 transition-colors border border-[#0F9D58]/20"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
        تفعيل الإشعارات
      </button>
    );
  }

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 transition-all relative overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              isSubscribed
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-emerald-50 text-[#0F9D58]'
            }`}
          >
            {isSubscribed ? <BellRing className="w-6 h-6 animate-bounce" /> : <Bell className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              إشعارات الهاتف اللحظية (Web Push)
              {isSubscribed && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> نشط ومقترن
                </span>
              )}
            </h3>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">
              استقبل تنبيهات فورية للطلبات، التحويلات، وتغييرات الحساب مباشرة على شاشة قفل هاتفك iPhone.
            </p>
          </div>
        </div>

        {/* Refresh Status */}
        <button
          onClick={async () => {
            const sub = await getActiveSubscription();
            setIsSubscribed(Boolean(sub));
            setPermission(getNotificationPermission());
          }}
          title="تحديث حالة الاشتراك"
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* iOS Safari Not Standalone Notice */}
      {isIos && !isStandalone && (
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4 mb-4 text-amber-900">
          <div className="flex items-center gap-2 font-semibold text-sm mb-2 text-amber-800">
            <Smartphone className="w-4 h-4 text-amber-600" />
            خطوة مهمة لمستخدمي iPhone (iOS):
          </div>
          <p className="text-xs md:text-sm leading-relaxed mb-3 text-amber-800">
            تتطلب أبل على هواتف iPhone إضافة الموقع إلى <b>الشاشة الرئيسية</b> لتشغيل الإشعارات الفورية:
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs bg-white/70 backdrop-blur p-2.5 rounded-lg border border-amber-200 text-gray-700">
            <span className="flex items-center gap-1 font-medium text-gray-900">
              1. اضغط زر المشاركة <Share className="w-3.5 h-3.5 text-blue-600 inline" /> أسفل Safari
            </span>
            <span>→</span>
            <span className="flex items-center gap-1 font-medium text-gray-900">
              2. اختر <PlusSquare className="w-3.5 h-3.5 text-emerald-600 inline" /> إضافة إلى الشاشة الرئيسية (Add to Home Screen)
            </span>
            <span>→</span>
            <span className="font-medium text-gray-900">3. افتح التطبيق من الشاشة الرئيسية ثم فعّل الإشعارات.</span>
          </div>
        </div>
      )}

      {/* Permission Denied Warning */}
      {permission === 'denied' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-red-900 text-xs md:text-sm">
          <div className="flex items-center gap-2 font-semibold text-red-800 mb-1">
            <AlertCircle className="w-4 h-4 text-red-600" />
            تم حظر الإشعارات في هذا المتصفح
          </div>
          <p className="leading-relaxed">
            للسماح بالإشعارات، افتح إعدادات هاتفك / المتصفح، ابحث عن <b>GROWIX</b>، وقُم بتفعيل خيار <b>السماح بالإشعارات (Allow Notifications)</b> ثم أعد المحاولة.
          </p>
        </div>
      )}

      {/* Unsupported Browser */}
      {!supported && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-gray-700 text-xs md:text-sm">
          <div className="flex items-center gap-2 font-semibold text-gray-800 mb-1">
            <AlertCircle className="w-4 h-4 text-gray-500" />
            المتصفح الحالي لا يدعم Web Push
          </div>
          <p>يرجى فتح الموقع عبر متصفح Safari على iPhone (مع التثبيت على الشاشة الرئيسية) أو متصفح Chrome/Edge الحديث.</p>
        </div>
      )}

      {/* Feedback message */}
      {feedback && (
        <div
          className={`rounded-xl p-3 mb-4 text-xs md:text-sm font-medium flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : feedback.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        {!isSubscribed ? (
          <button
            onClick={handleSubscribe}
            disabled={loading || !supported || permission === 'denied'}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#0F9D58] to-[#2ECC8F] hover:from-[#0c8047] hover:to-[#28b37e] text-white font-semibold text-sm rounded-xl shadow-sm shadow-[#0F9D58]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellRing className="w-4 h-4" />}
            تفعيل إشعارات الهاتف الآن
          </button>
        ) : (
          <>
            {showTestButton && (
              <button
                onClick={handleTestPush}
                disabled={testingPush}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-sm rounded-xl border border-emerald-200 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {testingPush ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                إرسال إشعار تجريبي (Test Push)
              </button>
            )}

            <button
              onClick={handleUnsubscribe}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellOff className="w-4 h-4" />}
              تعطيل الإشعارات
            </button>
          </>
        )}
      </div>

      {/* Feature Footnote */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          تشفير تام VAPID RFC-8291 متوافق مع Apple APNs و Google FCM
        </span>
        <span>Multi-Channel Dispatcher</span>
      </div>
    </div>
  );
};
