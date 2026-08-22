'use client';

import React, { useState, useEffect } from 'react';
import { createAdminManualOrderAction } from '@/lib/actions/orders';
import { 
  X, 
  UserPlus, 
  PackageCheck, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Crown, 
  Sparkles, 
  Wrench, 
  Loader2,
  Tag,
  ShieldCheck,
  Clock,
  Check
} from 'lucide-react';

export interface UserOption {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
}

export interface PackageOption {
  id: string;
  name: string;
  discountedPrice: string;
  originalPrice?: string;
}

export interface ToolOption {
  id: string;
  name: string;
  category?: string;
}

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: () => void;
  users: UserOption[];
  packages?: PackageOption[];
  tools?: ToolOption[];
  initialUserId?: string;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  onOrderCreated,
  users,
  packages = [],
  tools = [],
  initialUserId,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(initialUserId || '');
  const [userSearch, setUserSearch] = useState('');
  
  const [packageId, setPackageId] = useState('bundle-vip');
  const [toolId, setToolId] = useState(tools[0]?.id || '');
  const [amount, setAmount] = useState('500');
  const [paymentMethod, setPaymentMethod] = useState('تحويل يدوي / أدمن');
  const [senderNumber, setSenderNumber] = useState('');
  const [status, setStatus] = useState<'approved' | 'pending'>('approved');
  const [isTest, setIsTest] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Set initial user when modal opens or initialUserId changes
  useEffect(() => {
    if (initialUserId) {
      setSelectedUserId(initialUserId);
    }
  }, [initialUserId]);

  // Auto-set sender number and test mode when user is selected
  useEffect(() => {
    if (selectedUserId) {
      const selectedUser = users.find((u) => u.id === selectedUserId);
      if (selectedUser) {
        if (!senderNumber && selectedUser.phone) {
          setSenderNumber(selectedUser.phone);
        }
        if (selectedUser.role === 'test') {
          setIsTest(true);
        }
      }
    }
  }, [selectedUserId, users]);

  // Auto-set amount when package changes
  const handlePackageChange = (newPkgId: string) => {
    setPackageId(newPkgId);
    if (newPkgId === 'bundle-vip') setAmount('500');
    else if (newPkgId === 'bundle-premium') setAmount('300');
    else if (newPkgId === 'single-tool') setAmount('200');
    else {
      const custom = packages.find((p) => p.id === newPkgId);
      if (custom) {
        setAmount(custom.discountedPrice.replace(/[^0-9]/g, '') || '500');
      }
    }
  };

  if (!isOpen) return null;

  const selectedUser = users.find((u) => u.id === selectedUserId);

  const filteredUsers = users.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q))
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setError('يرجى اختيار المستخدم أولاً من القائمة');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const res = await createAdminManualOrderAction({
      userId: selectedUserId,
      packageId,
      toolId: packageId === 'single-tool' ? toolId : undefined,
      amount: amount || '0',
      paymentMethod,
      senderNumber: senderNumber || selectedUser?.phone || 'لوحة تحكم الأدمن',
      status,
      isTest,
      adminNotes: adminNotes || undefined,
    });

    setLoading(false);

    if (res.success) {
      setSuccessMsg('تم إضافة وتفعيل الطلب للمستخدم بنجاح! 🎉');
      setTimeout(() => {
        onOrderCreated();
        onClose();
        // Reset state
        setSelectedUserId('');
        setUserSearch('');
        setPackageId('bundle-vip');
        setAmount('500');
        setAdminNotes('');
        setSuccessMsg(null);
      }, 1200);
    } else {
      setError(res.error || 'حدث خطأ أثناء إضافة الطلب');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto" dir="rtl">
      <div className="w-full max-w-2xl bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00FF87]/20 text-[#00FF87] flex items-center justify-center font-bold shadow-inner">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">إضافة طلب اشتراك جديد لمستخدم</h3>
              <p className="text-xs text-gray-400">تفعيل اشتراك فوري أو تسجيل طلب يدوي لأي مستخدم مسجل بالموقع</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* STEP 1: USER SELECTION */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-white flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#00FF87]" />
                <span>1. اختيار المستخدم المسجل</span>
              </span>
              {selectedUser && (
                <button
                  type="button"
                  onClick={() => { setSelectedUserId(''); setUserSearch(''); }}
                  className="text-[11px] text-gray-400 hover:text-red-400 underline font-bold"
                >
                  تغيير المستخدم
                </button>
              )}
            </label>

            {selectedUser ? (
              // Selected User Card
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-[#00FF87] flex items-center justify-center font-black">
                    {selectedUser.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white text-sm">{selectedUser.name}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        selectedUser.role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                        selectedUser.role === 'test' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {selectedUser.role === 'admin' ? 'مدير' : selectedUser.role === 'test' ? 'تجريبي' : 'مستخدم'}
                      </span>
                    </div>
                    <span className="text-gray-400 font-mono text-[11px] block">{selectedUser.email}</span>
                    {selectedUser.phone && (
                      <span className="text-gray-400 font-mono text-[10px] block">{selectedUser.phone}</span>
                    )}
                  </div>
                </div>

                <div className="text-emerald-400 flex items-center gap-1 font-bold text-[11px]">
                  <Check className="w-4 h-4" />
                  <span>تم التحديد</span>
                </div>
              </div>
            ) : (
              // Search & List
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-3" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="ابحث بالاسم أو البريد الإلكتروني أو رقم الهاتف..."
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00FF87]"
                  />
                </div>

                <div className="max-h-44 overflow-y-auto space-y-1.5 rounded-2xl bg-black/30 border border-white/5 p-2 divide-y divide-white/5">
                  {filteredUsers.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-500">
                      لا يوجد مستخدم يطابق البحث &ldquo;{userSearch}&rdquo;
                    </div>
                  ) : (
                    filteredUsers.slice(0, 15).map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setSelectedUserId(u.id)}
                        className="w-full p-2.5 rounded-xl hover:bg-white/5 text-right flex items-center justify-between transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-white/10 text-gray-300 flex items-center justify-center font-bold text-xs group-hover:bg-[#00FF87]/20 group-hover:text-[#00FF87] transition-colors">
                            {u.name.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-white text-xs block group-hover:text-[#00FF87] transition-colors">
                              {u.name}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono block">{u.email}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {u.phone && (
                            <span className="text-[10px] text-gray-400 font-mono hidden sm:inline-block">
                              {u.phone}
                            </span>
                          )}
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            u.role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                            u.role === 'test' ? 'bg-amber-500/20 text-amber-300' :
                            'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {u.role === 'admin' ? 'مدير' : u.role === 'test' ? 'تجريبي' : 'مستخدم'}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: PACKAGE & TOOL SELECTION */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <label className="block text-xs font-black text-white flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>2. تحديد الباقة / الاشتراك</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* VIP Bundle */}
              <button
                type="button"
                onClick={() => handlePackageChange('bundle-vip')}
                className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                  packageId === 'bundle-vip'
                    ? 'bg-amber-500/15 border-amber-500/50 text-white ring-1 ring-amber-500/30'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-xs text-amber-400 flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5" />
                    <span>باقة VIP الشاملة</span>
                  </span>
                  <span className="text-xs font-black text-white">500 ج</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-tight">12 أداة تسويق + الكورس + داتا 50 مليون</p>
              </button>

              {/* Premium Bundle */}
              <button
                type="button"
                onClick={() => handlePackageChange('bundle-premium')}
                className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                  packageId === 'bundle-premium'
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-white ring-1 ring-emerald-500/30'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-xs text-[#00FF87] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>باقة Premium</span>
                  </span>
                  <span className="text-xs font-black text-white">300 ج</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-tight">الـ 12 أداة تسويق + داتا مصر الكاملة</p>
              </button>

              {/* Single Tool */}
              <button
                type="button"
                onClick={() => handlePackageChange('single-tool')}
                className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                  packageId === 'single-tool'
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-white ring-1 ring-cyan-500/30'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-xs text-cyan-400 flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>باقة برنامج واحد</span>
                  </span>
                  <span className="text-xs font-black text-white">200 ج</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-tight">تفعيل أداة واحدة محددة يختارها العميل</p>
              </button>
            </div>

            {/* If Single Tool, select the tool */}
            {packageId === 'single-tool' && (
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-1.5 animate-fadeIn">
                <label className="block text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>اختر الأداة المطلوب تفعيلها:</span>
                </label>
                <select
                  value={toolId}
                  onChange={(e) => setToolId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0F172A] border border-cyan-500/30 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                >
                  {tools.length > 0 ? (
                    tools.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.id})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="whatsapp-sender">برنامج إرسال وتسويق واتساب (WhatsApp Sender)</option>
                      <option value="telegram-scraper">برنامج سحب وإرسال تليجرام (Telegram Marketing)</option>
                      <option value="google-maps-extractor">مستخرج بيانات خرائط جوجل (Google Maps Extractor)</option>
                      <option value="facebook-marketing">برنامج تسويق فيسبوك (Facebook Marketing)</option>
                      <option value="tiktok-extractor">برنامج استخراج تيك توك (TikTok Extractor)</option>
                    </>
                  )}
                </select>
              </div>
            )}
          </div>

          {/* STEP 3: AMOUNT & PAYMENT METHOD */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10">
            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#00FF87]" />
                <span>المبلغ المسجل (جنية)</span>
              </label>
              <input
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="500"
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-black text-[#00FF87] focus:outline-none focus:border-[#00FF87]"
              />
              <span className="text-[10px] text-gray-500 mt-0.5 block">ضع 0 للاشتراكات المجانية</span>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-[#00FF87]" />
                <span>طريقة الدفع</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-[#00FF87]"
              >
                <option value="تحويل يدوي / أدمن">تحويل يدوي / أدمن</option>
                <option value="vodafone_cash">فودافون كاش (Vodafone Cash)</option>
                <option value="instapay">إنستاباي (InstaPay)</option>
                <option value="دفع نقدي / كاش">دفع نقدي / كاش</option>
                <option value="اشتراك مجاني / مكافأة">اشتراك مجاني / هدية</option>
              </select>
            </div>

            {/* Sender Phone/Ref */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#00FF87]" />
                <span>الرقم المحوّل منه / المرجع</span>
              </label>
              <input
                type="text"
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                placeholder="010xxxxxxx أو لوحة الأدمن"
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00FF87] dir-ltr text-right"
              />
            </div>
          </div>

          {/* STEP 4: STATUS & OPTIONS */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Status Radio Buttons */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00FF87]" />
                  <span>حالة الطلب الأولية</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('approved')}
                    className={`py-2 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                        : 'bg-white/5 text-gray-400 border-white/10'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>مقبول ومُفعل فوراً</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('pending')}
                    className={`py-2 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      status === 'pending'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm'
                        : 'bg-white/5 text-gray-400 border-white/10'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>قيد المراجعة</span>
                  </button>
                </div>
              </div>

              {/* Test Mode Toggle */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-gray-400" />
                  <span>نوع العملية</span>
                </label>
                <label className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5 cursor-pointer hover:bg-white/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={isTest}
                    onChange={(e) => setIsTest(e.target.checked)}
                    className="w-4 h-4 rounded text-[#00FF87] focus:ring-0 focus:ring-offset-0 bg-transparent border-white/20"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">طلب تجريبي (Test Order)</span>
                    <span className="text-[10px] text-gray-400 block">استثناء الطلب من الإحصائيات والأرباح الفعلية</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Admin Notes */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                <span>ملاحظات الأدمن (اختياري)</span>
              </label>
              <input
                type="text"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="مثال: تم التفعيل بناءً على طلب عبر واتساب، أو اشتراك هدية"
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00FF87]"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-3 border-t border-white/10 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading || !selectedUserId}
              className="flex-1 py-3.5 rounded-2xl bg-[#00FF87] hover:bg-[#00E676] text-[#0A1128] font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00FF87]/25 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري تسجيل وتفعيل الطلب...</span>
                </>
              ) : (
                <>
                  <PackageCheck className="w-4 h-4" />
                  <span>
                    {status === 'approved' ? 'تأكيد وإضافة الاشتراك وتفعيله الآن' : 'تسجيل الطلب كـ قيد المراجعة'}
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              إلغاء
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
