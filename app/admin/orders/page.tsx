import React from 'react';
import { getAllOrdersForAdmin } from '@/lib/actions/orders';
import { OrderStatusButtons } from './OrderStatusButtons';
import { PackageCheck, Clock, CheckCircle2, XCircle, User, Phone, CreditCard } from 'lucide-react';

export default async function AdminOrdersPage() {
  const ordersList = await getAllOrdersForAdmin();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-2">
          <PackageCheck className="w-6 h-6 text-[#2ECC8F]" />
          <span>إدارة الطلبات والتحويلات</span>
        </h1>
        <p className="text-xs text-gray-400">مراجعة التحويلات المالية الواردة، وقبولها أو رفضها لتفعيل حسابات المشتركين</p>
      </div>

      <div className="bg-[#0F172A] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {ordersList.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            لا توجد طلبات اشتراك مسجلة حتى الآن.
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
                  <th className="p-4">التحكم والقبول</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ordersList.map((ord) => {
                  const isPending = ord.status === 'pending';
                  const isApproved = ord.status === 'approved';
                  const isRejected = ord.status === 'rejected';

                  return (
                    <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                      {/* Customer Info */}
                      <td className="p-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-[#2ECC8F]" />
                          <div>
                            <span className="block font-black">{ord.userName}</span>
                            <span className="text-[11px] text-gray-400 font-mono block">{ord.userEmail}</span>
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
                            : 'باقة برنامج واحد'}
                        </span>
                        {ord.toolId && (
                          <span className="text-[11px] text-[#2ECC8F] block font-mono">
                            الأداة: {ord.toolId}
                          </span>
                        )}
                      </td>

                      {/* Payment Method & Sender Phone */}
                      <td className="p-4 text-gray-300">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <CreditCard className="w-3.5 h-3.5 text-[#2ECC8F]" />
                          <span className="font-bold">{ord.paymentMethod === 'instapay' ? 'إنستاباي (InstaPay)' : 'محفظة إلكترونية'}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded dir-ltr inline-block">
                          {ord.senderNumber}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="p-4 font-black text-white text-sm">
                        {ord.amount} جنية
                      </td>

                      {/* Date */}
                      <td className="p-4 text-gray-400">
                        {new Date(ord.createdAt).toLocaleDateString('ar-EG')}
                        <span className="block text-[10px] text-gray-500">
                          {new Date(ord.createdAt).toLocaleTimeString('ar-EG')}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="p-4">
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
    </div>
  );
}
