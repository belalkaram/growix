'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PackageCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  User, 
  Phone, 
  CreditCard, 
  Radio, 
  Tag, 
  PlusCircle, 
  Search, 
  Filter,
  Check
} from 'lucide-react';
import { OrderStatusButtons } from './OrderStatusButtons';
import { OrderReceiptViewer } from './OrderReceiptViewer';
import { OrderTestToggle } from './OrderTestToggle';
import { CreateOrderModal, UserOption, PackageOption, ToolOption } from './CreateOrderModal';

export interface OrderAdminRow {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  userPhone: string | null;
  packageId: string;
  toolId: string | null;
  paymentMethod: string;
  paymentProvider: string | null;
  senderNumber: string;
  amount: string;
  originalAmount: string | null;
  discountAmount: string | null;
  couponCode: string | null;
  receiptUrl: string | null;
  receiptKey: string | null;
  isTest: boolean;
  userRole: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: Date;
}

interface OrdersClientProps {
  initialOrders: OrderAdminRow[];
  usersList: UserOption[];
  packagesList?: PackageOption[];
  toolsList?: ToolOption[];
}

export const OrdersClient: React.FC<OrdersClientProps> = ({
  initialOrders,
  usersList,
  packagesList = [],
  toolsList = [],
}) => {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const pendingCount = initialOrders.filter((o) => o.status === 'pending').length;
  const approvedCount = initialOrders.filter((o) => o.status === 'approved').length;
  const rejectedCount = initialOrders.filter((o) => o.status === 'rejected').length;

  const filteredOrders = initialOrders.filter((ord) => {
    const matchesStatus = statusFilter === 'all' || ord.status === statusFilter;
    
    if (!searchQuery.trim()) return matchesStatus;

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (ord.userName && ord.userName.toLowerCase().includes(q)) ||
      (ord.userEmail && ord.userEmail.toLowerCase().includes(q)) ||
      (ord.userPhone && ord.userPhone.includes(q)) ||
      ord.senderNumber.includes(q) ||
      ord.id.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-2">
            <PackageCheck className="w-6 h-6 text-[#00FF87]" />
            <span>إدارة الطلبات والتحويلات</span>
          </h1>
          <p className="text-xs text-gray-400">
            مراجعة التحويلات المالية، وتفعيل اشتراكات المشتركين، أو إضافة اشتراك يدوي لمستخدم مسجل
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Add Order Button */}
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#00FF87] hover:bg-[#00E676] text-[#0A1128] font-black rounded-xl text-xs shadow-lg shadow-[#00FF87]/20 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ إضافة طلب اشتراك لمستخدم</span>
          </button>

          {/* Webhook Stream Link */}
          <Link
            href="/admin/transactions"
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-black transition-all shadow-sm"
          >
            <Radio className="w-4 h-4 animate-pulse text-[#00FF87]" />
            <span>سجل رسائل الـ Webhook المباشرة</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-black">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white/20 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            الكل ({initialOrders.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-amber-400 hover:bg-amber-500/10'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>قيد المراجعة ({pendingCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'approved'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-emerald-400 hover:bg-emerald-500/10'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>مقبول ومُفعل ({approvedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'rejected'
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : 'text-red-400 hover:bg-red-500/10'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>مرفوض ({rejectedCount})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم، الإيميل، الهاتف، أو رقم الطلب..."
            className="w-full pr-10 pl-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00FF87]"
          />
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-[#0F172A] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs space-y-3">
            <p>لا توجد طلبات تطابق معايير البحث والفلترة.</p>
            {initialOrders.length === 0 && (
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#00FF87] text-[#0A1128] text-xs font-black inline-flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>إضافة أول طلب اشتراك يدوي</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-white/5 text-gray-400 border-b border-white/10">
                <tr>
                  <th className="p-4">العميل</th>
                  <th className="p-4">الباقة / الأداة</th>
                  <th className="p-4">طريقة الدفع والرقم المحوّل منه</th>
                  <th className="p-4">المبلغ</th>
                  <th className="p-4">تاريخ الطلب</th>
                  <th className="p-4">الحالة الحالية</th>
                  <th className="p-4">إثبات الدفع (R2)</th>
                  <th className="p-4">التحكم والقبول</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((ord) => {
                  const isPending = ord.status === 'pending';
                  const isApproved = ord.status === 'approved';
                  const isRejected = ord.status === 'rejected';

                  return (
                    <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                      {/* Customer Info */}
                      <td className="p-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-[#00FF87]" />
                          <div>
                            <span className="block font-black">{ord.userName || 'عميل مسجل'}</span>
                            <span className="text-[11px] text-gray-400 font-mono block">{ord.userEmail || '—'}</span>
                            {ord.userPhone && (
                              <span className="text-[10px] text-gray-400 font-mono block">{ord.userPhone}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Package / Tool */}
                      <td className="p-4 text-gray-200">
                        <span className="font-bold block text-white">
                          {ord.packageId === 'bundle-vip'
                            ? 'باقة VIP الشاملة (12 أداة + كورس)'
                            : ord.packageId === 'bundle-premium'
                            ? 'باقة Premium (12 أداة + داتا)'
                            : ord.packageId === 'single-tool'
                            ? 'باقة برنامج واحد'
                            : ord.packageId}
                        </span>
                        {ord.toolId && (
                          <span className="text-[11px] text-[#00FF87] block font-mono">
                            الأداة: {ord.toolId}
                          </span>
                        )}
                      </td>

                      {/* Payment Method & Sender Phone */}
                      <td className="p-4 text-gray-300">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <CreditCard className="w-3.5 h-3.5 text-[#00FF87]" />
                          <span className="font-bold">
                            {ord.paymentMethod === 'instapay' 
                              ? 'إنستاباي (InstaPay)' 
                              : ord.paymentMethod === 'vodafone_cash'
                              ? 'فودافون كاش'
                              : ord.paymentMethod}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded dir-ltr inline-block">
                          {ord.senderNumber}
                        </span>
                      </td>

                      {/* Amount & Coupon */}
                      <td className="p-4">
                        <span className="font-black text-white text-sm block">
                          {ord.amount} جنية
                        </span>
                        {ord.couponCode && (
                          <div className="mt-1 space-y-0.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded dir-ltr">
                              <Tag className="w-3 h-3 text-emerald-400" />
                              <span>{ord.couponCode}</span>
                            </span>
                            {ord.originalAmount && (
                              <span className="block text-[10px] text-gray-500 line-through">
                                الأصلي: {ord.originalAmount} ج
                              </span>
                            )}
                          </div>
                        )}
                        {ord.adminNotes && (
                          <span className="block text-[10px] text-gray-400 italic mt-0.5">
                            📝 {ord.adminNotes}
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="p-4 text-gray-400">
                        {new Date(ord.createdAt).toLocaleDateString('ar-EG')}
                        <span className="block text-[10px] text-gray-500">
                          {new Date(ord.createdAt).toLocaleTimeString('ar-EG')}
                        </span>
                      </td>

                      {/* Status & Test Mode Badges */}
                      <td className="p-4 space-y-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isPending && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 w-fit">
                              <Clock className="w-3 h-3" />
                              <span>قيد المراجعة</span>
                            </span>
                          )}
                          {isApproved && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>مقبول ومُفعل</span>
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1 w-fit">
                              <XCircle className="w-3 h-3" />
                              <span>مرفوض</span>
                            </span>
                          )}
                        </div>

                        {/* Toggle Test vs Live Order */}
                        <div>
                          <OrderTestToggle orderId={ord.id} initialIsTest={Boolean(ord.isTest)} />
                        </div>
                      </td>

                      {/* Payment Proof Receipt Image */}
                      <td className="p-4">
                        <OrderReceiptViewer
                          orderId={ord.id}
                          receiptUrl={ord.receiptUrl}
                          receiptKey={ord.receiptKey}
                          customerName={ord.userName || 'عميل'}
                          customerPhone={ord.userPhone || ord.senderNumber}
                          amount={ord.amount}
                        />
                      </td>

                      {/* Action Buttons */}
                      <td className="p-4">
                        <OrderStatusButtons orderId={ord.id} currentStatus={ord.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Creating Manual Order */}
      <CreateOrderModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onOrderCreated={() => {
          router.refresh();
        }}
        users={usersList}
        packages={packagesList}
        tools={toolsList}
      />
    </div>
  );
};
