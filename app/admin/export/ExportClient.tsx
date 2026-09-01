'use client';

import React, { useState } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Users, 
  Phone, 
  Mail, 
  PackageCheck, 
  Radio, 
  ShoppingCart, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Filter, 
  Loader2,
  Database,
  ArrowDownToLine,
  Layers
} from 'lucide-react';
import { 
  getExportUsersData, 
  getExportOrdersData, 
  getExportAbandonedCheckoutsData, 
  getExportTransactionsData,
  getRawListForExport 
} from '@/lib/actions/export';

interface ExportStats {
  totalUniquePhones: number;
  totalCustomerPhones: number;
  totalUniqueEmails: number;
  totalUsers: number;
  totalOrders: number;
  totalAbandoned: number;
  totalTransactions: number;
}

/**
 * Utility to download CSV file with UTF-8 BOM so Excel opens Arabic correctly
 */
function downloadCsv(filename: string, headers: string[], rows: (string | number | null | undefined)[][]) {
  const processCell = (cell: string | number | null | undefined): string => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(processCell).join(','),
    ...rows.map((row) => row.map(processCell).join(',')),
  ].join('\r\n');

  // \uFEFF is UTF-8 Byte Order Mark for Excel
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Utility to download Plain TXT list (one entry per line)
 */
function downloadTxt(filename: string, lines: string[]) {
  const content = lines.filter(Boolean).join('\r\n');
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Utility to download JSON
 */
function downloadJson(filename: string, data: any) {
  const content = JSON.stringify(data, null, 2);
  const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function ExportClient({ stats }: { stats: ExportStats }) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Orders Filter state
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'user' | 'admin'>('all');

  // Handle Raw Phone/Email Lists
  const handleQuickExport = async (type: 'all_phones' | 'customer_phones' | 'abandoned_phones' | 'all_emails', format: 'txt' | 'csv') => {
    const key = `${type}-${format}`;
    setLoadingKey(key);
    try {
      const list = await getRawListForExport(type);
      if (format === 'txt') {
        downloadTxt(type, list);
      } else {
        const header = type.includes('email') ? ['البريد الإلكتروني'] : ['رقم الهاتف'];
        downloadCsv(type, header, list.map((item) => [item]));
      }
    } catch (e: any) {
      alert(e.message || 'حدث خطأ أثناء تصدير القائمة');
    } finally {
      setLoadingKey(null);
    }
  };

  // Copy Quick List to Clipboard
  const handleQuickCopy = async (type: 'all_phones' | 'customer_phones' | 'abandoned_phones' | 'all_emails') => {
    setLoadingKey(`copy-${type}`);
    try {
      const list = await getRawListForExport(type);
      await navigator.clipboard.writeText(list.join('\n'));
      setCopiedKey(type);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch (e) {
      alert('حدث خطأ أثناء نسخ القائمة');
    } finally {
      setLoadingKey(null);
    }
  };

  // Export Users Table
  const handleExportUsers = async (format: 'csv' | 'json') => {
    const key = `users-${format}`;
    setLoadingKey(key);
    try {
      const data = await getExportUsersData({ role: userRoleFilter });
      if (format === 'json') {
        downloadJson('growix_users', data);
      } else {
        const headers = [
          'المعرف (ID)',
          'الاسم بالكامل',
          'البريد الإلكتروني',
          'رقم الهاتف',
          'الدور (Role)',
          'تاريخ التسجيل',
          'آخر تسجيل دخول',
        ];
        const rows = data.map((u) => [
          u.id,
          u.name,
          u.email,
          u.phone || '',
          u.role,
          u.createdAt ? new Date(u.createdAt).toLocaleString('ar-EG') : '',
          u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('ar-EG') : 'لم يسجل دخول بعد',
        ]);
        downloadCsv('growix_users', headers, rows);
      }
    } catch (e: any) {
      alert(e.message || 'فشل في تصدير بيانات المستخدمين');
    } finally {
      setLoadingKey(null);
    }
  };

  // Export Orders Table
  const handleExportOrders = async (format: 'csv' | 'json') => {
    const key = `orders-${format}`;
    setLoadingKey(key);
    try {
      const data = await getExportOrdersData({ status: orderStatusFilter });
      if (format === 'json') {
        downloadJson('growix_orders', data);
      } else {
        const headers = [
          'رقم الطلب (Order ID)',
          'اسم العميل',
          'البريد الإلكتروني',
          'رقم الهاتف المسجل',
          'الرقم المحوّل منه',
          'الباقة المطلوبة',
          'الأداة المحددة',
          'المبلغ النهائي (جنية)',
          'السعر الأصلي',
          'قيمة الخصم',
          'كود الكوبون',
          'طريقة الدفع',
          'المزود',
          'حالة الطلب',
          'نوع التفعيل',
          'تجريبي؟',
          'ملاحظات الأدمن',
          'تاريخ ووقت الطلب',
        ];
        const rows = data.map((o) => [
          o.id,
          o.userName || '',
          o.userEmail || '',
          o.userPhone || '',
          o.senderNumber,
          o.packageId,
          o.toolId || '',
          o.amount,
          o.originalAmount || '',
          o.discountAmount || '',
          o.couponCode || '',
          o.paymentMethod,
          o.paymentProvider || '',
          o.status === 'approved' ? 'مقبول' : o.status === 'pending' ? 'قيد المراجعة' : 'مرفوض',
          o.approvalType || 'manual',
          o.isTest ? 'نعم (تجريبي)' : 'لا (حقيقي)',
          o.adminNotes || '',
          o.createdAt ? new Date(o.createdAt).toLocaleString('ar-EG') : '',
        ]);
        downloadCsv('growix_orders', headers, rows);
      }
    } catch (e: any) {
      alert(e.message || 'فشل في تصدير بيانات الطلبات');
    } finally {
      setLoadingKey(null);
    }
  };

  // Export Abandoned Checkouts Table
  const handleExportAbandoned = async (format: 'csv' | 'json') => {
    const key = `abandoned-${format}`;
    setLoadingKey(key);
    try {
      const data = await getExportAbandonedCheckoutsData();
      if (format === 'json') {
        downloadJson('growix_abandoned_leads', data);
      } else {
        const headers = [
          'المعرف',
          'رقم الهاتف',
          'الباقة المختارة',
          'الأداة',
          'المبلغ',
          'كود الكوبون',
          'هل اكتمل الطلب؟',
          'تاريخ المحاولة',
        ];
        const rows = data.map((a) => [
          a.id,
          a.phone,
          a.packageId || '',
          a.toolId || '',
          a.amount || '',
          a.couponCode || '',
          a.isCompleted ? 'نعم (مكتمل)' : 'لا (سلة متروكة)',
          a.createdAt ? new Date(a.createdAt).toLocaleString('ar-EG') : '',
        ]);
        downloadCsv('growix_abandoned_leads', headers, rows);
      }
    } catch (e: any) {
      alert(e.message || 'فشل في تصدير بيانات السلات المتروكة');
    } finally {
      setLoadingKey(null);
    }
  };

  // Export Webhook Transactions Table
  const handleExportTransactions = async (format: 'csv' | 'json') => {
    const key = `transactions-${format}`;
    setLoadingKey(key);
    try {
      const data = await getExportTransactionsData();
      if (format === 'json') {
        downloadJson('growix_webhook_transactions', data);
      } else {
        const headers = [
          'المعرف',
          'رقم المعاملة (TxID)',
          'المزود',
          'المبلغ المستلم',
          'هاتف المحوّل',
          'اسم المحوّل',
          'محفظة الشركة',
          'الرقم المرجعي',
          'الحالة',
          'سبب المراجعة',
          'نص الرسالة الأصلية',
          'تاريخ الاستلام',
        ];
        const rows = data.map((t) => [
          t.id,
          t.transactionId,
          t.provider,
          t.amount,
          t.senderPhone,
          t.senderName || '',
          t.walletPhone,
          t.referenceId || '',
          t.status,
          t.reviewReason || '',
          t.rawMessage,
          t.createdAt ? new Date(t.createdAt).toLocaleString('ar-EG') : '',
        ]);
        downloadCsv('growix_webhook_transactions', headers, rows);
      }
    } catch (e: any) {
      alert(e.message || 'فشل في تصدير معاملات الويب هوك');
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <div className="space-y-8 dir-rtl text-white font-sans">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-[#0B1528] via-[#0F1E36] to-[#070C1A] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden space-y-3">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#00FF87]/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-black px-4 py-1.5 bg-[#00FF87]/15 text-[#00FF87] border border-[#00FF87]/30 rounded-full w-fit shadow-xs">
            <Database className="w-4 h-4" />
            <span>مركز تصدير واستخراج البيانات وقواعد العملاء</span>
          </div>

          <span className="text-xs text-gray-400 font-medium">
            تصدير متوافق 100% مع Excel (UTF-8) وبرامج التسويق والواتساب
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white relative z-10">
          تصدير وتنزيل البيانات (Excel / TXT / JSON)
        </h1>
        <p className="text-gray-300 text-xs sm:text-sm max-w-2xl leading-relaxed relative z-10">
          استخرج كافة بيانات المشتركين، أرقام الهواتف لحملات الواتساب والرسائل، الإيميلات للنشرات البريدية، وطلبات الاشتراك والمعاملات المالية بنقرة واحدة.
        </p>
      </div>

      {/* Summary KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-[#0F172A] rounded-2xl border border-white/10 shadow-md space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>إجمالي الهواتف الفريدة</span>
            <Phone className="w-4 h-4 text-[#00FF87]" />
          </div>
          <span className="text-2xl font-black text-[#00FF87] font-mono block">{stats.totalUniquePhones}</span>
          <span className="text-[10px] text-gray-500 block">جاهزة لحملات الواتساب</span>
        </div>

        <div className="p-4 bg-[#0F172A] rounded-2xl border border-white/10 shadow-md space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>هواتف المشتركين المفعلين</span>
            <Users className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <span className="text-2xl font-black text-[#38BDF8] font-mono block">{stats.totalCustomerPhones}</span>
          <span className="text-[10px] text-gray-500 block">عملاء أتموا الدفع</span>
        </div>

        <div className="p-4 bg-[#0F172A] rounded-2xl border border-white/10 shadow-md space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>إجمالي الإيميلات المسجلة</span>
            <Mail className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black text-amber-400 font-mono block">{stats.totalUniqueEmails}</span>
          <span className="text-[10px] text-gray-500 block">للنشرات البريدية و Resend</span>
        </div>

        <div className="p-4 bg-[#0F172A] rounded-2xl border border-white/10 shadow-md space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>سلات الشراء والمهتمين</span>
            <ShoppingCart className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-emerald-400 font-mono block">{stats.totalAbandoned}</span>
          <span className="text-[10px] text-gray-500 block">لإعادة الاستهداف الفوري</span>
        </div>
      </div>

      {/* SECTION 1: Fast 1-Click Marketing Lists (Phones & Emails) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#00FF87]" />
          <h2 className="text-lg font-black text-white">1. استخراج القوائم السريعة لحملات التسويق</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: All Unique Phone Numbers */}
          <div className="bg-[#0F172A] p-5 rounded-2xl border border-white/10 hover:border-[#00FF87]/30 transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#00FF87]/15 text-[#00FF87] flex items-center justify-center font-black">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-white">جميع أرقام الهواتف المجمعة</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                كل الأرقام المسجلة في الموقع والطلبات والتحويلات ({stats.totalUniquePhones} رقم فريد).
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickExport('all_phones', 'txt')}
                  disabled={!!loadingKey}
                  className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#00FF87]" />
                  <span>ملف TXT</span>
                </button>
                <button
                  onClick={() => handleQuickExport('all_phones', 'csv')}
                  disabled={!!loadingKey}
                  className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#00FF87]" />
                  <span>Excel CSV</span>
                </button>
              </div>

              <button
                onClick={() => handleQuickCopy('all_phones')}
                disabled={!!loadingKey}
                className="w-full py-2 px-3 rounded-xl bg-[#00FF87]/10 hover:bg-[#00FF87]/20 text-[#00FF87] font-bold text-xs flex items-center justify-center gap-1.5 border border-[#00FF87]/30 transition-colors cursor-pointer"
              >
                {copiedKey === 'all_phones' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>تم نسخ الأرقام!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ الأرقام للحافظة</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 2: Active Customer Phones */}
          <div className="bg-[#0F172A] p-5 rounded-2xl border border-white/10 hover:border-[#38BDF8]/30 transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/15 text-[#38BDF8] flex items-center justify-center font-black">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-white">أرقام المشتركين المفعلين فقط</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                أرقام العملاء الذين تم قبول وتفعيل باقاتهم بالفعل ({stats.totalCustomerPhones} عميل مفعل).
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickExport('customer_phones', 'txt')}
                  disabled={!!loadingKey}
                  className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>ملف TXT</span>
                </button>
                <button
                  onClick={() => handleQuickExport('customer_phones', 'csv')}
                  disabled={!!loadingKey}
                  className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Excel CSV</span>
                </button>
              </div>

              <button
                onClick={() => handleQuickCopy('customer_phones')}
                disabled={!!loadingKey}
                className="w-full py-2 px-3 rounded-xl bg-[#38BDF8]/10 hover:bg-[#38BDF8]/20 text-[#38BDF8] font-bold text-xs flex items-center justify-center gap-1.5 border border-[#38BDF8]/30 transition-colors cursor-pointer"
              >
                {copiedKey === 'customer_phones' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>تم نسخ الأرقام!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ الأرقام للحافظة</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 3: Abandoned Checkout Phones */}
          <div className="bg-[#0F172A] p-5 rounded-2xl border border-white/10 hover:border-emerald-400/30 transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-black">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-white">أرقام السلات المتروكة (Leads)</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                أرقام المهتمين الذين بدأوا الشيك أوت ولم يكملوا ({stats.totalAbandoned} جهة اتصال).
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickExport('abandoned_phones', 'txt')}
                  disabled={!!loadingKey}
                  className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ملف TXT</span>
                </button>
                <button
                  onClick={() => handleQuickExport('abandoned_phones', 'csv')}
                  disabled={!!loadingKey}
                  className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Excel CSV</span>
                </button>
              </div>

              <button
                onClick={() => handleQuickCopy('abandoned_phones')}
                disabled={!!loadingKey}
                className="w-full py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-500/30 transition-colors cursor-pointer"
              >
                {copiedKey === 'abandoned_phones' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>تم نسخ الأرقام!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ الأرقام للحافظة</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 4: All Email Addresses */}
          <div className="bg-[#0F172A] p-5 rounded-2xl border border-white/10 hover:border-amber-400/30 transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-black">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-white">قائمة الإيميلات الشاملة</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                جميع الإيميلات المسجلة بالنظام ({stats.totalUniqueEmails} بريد إلكتروني فريد).
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickExport('all_emails', 'txt')}
                  disabled={!!loadingKey}
                  className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>ملف TXT</span>
                </button>
                <button
                  onClick={() => handleQuickExport('all_emails', 'csv')}
                  disabled={!!loadingKey}
                  className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                  <span>Excel CSV</span>
                </button>
              </div>

              <button
                onClick={() => handleQuickCopy('all_emails')}
                disabled={!!loadingKey}
                className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-500/30 transition-colors cursor-pointer"
              >
                {copiedKey === 'all_emails' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>تم نسخ الإيميلات!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ الإيميلات للحافظة</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 2: Detailed Full Database Tables Exporters */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#00FF87]" />
          <h2 className="text-lg font-black text-white">2. تصدير الجداول الشاملة وقواعد البيانات</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* Table Exporter 1: Orders & Subscriptions */}
          <div className="bg-[#0F172A] p-6 rounded-3xl border border-white/10 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-[#00FF87]" />
                  <h3 className="text-base font-black text-white">تصدير جدول طلبات الاشتراك والمعاملات</h3>
                </div>
                <p className="text-xs text-gray-400">
                  يشمل: رقم الطلب، الاسم، الإيميل، رقم التحويل، الباقة، المبلغ، الكوبون، الحالة، والملاحظات.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#00FF87] bg-[#00FF87]/15 px-2.5 py-1 rounded-full border border-[#00FF87]/30">
                {stats.totalOrders} طلب
              </span>
            </div>

            {/* Filter by Status */}
            <div className="flex items-center gap-2 flex-wrap text-xs bg-white/5 p-3 rounded-2xl border border-white/10">
              <span className="text-gray-400 font-bold">فلترة الحالة:</span>
              {(['all', 'approved', 'pending', 'rejected'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                    orderStatusFilter === st
                      ? 'bg-[#00FF87] text-[#0A1128]'
                      : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {st === 'all' ? 'جميع الطلبات' : st === 'approved' ? 'المقبولة والمفعلة' : st === 'pending' ? 'قيد المراجعة' : 'المرفوضة'}
                </button>
              ))}
            </div>

            {/* Export Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => handleExportOrders('csv')}
                disabled={!!loadingKey}
                className="flex-1 py-3 px-4 rounded-2xl bg-[#00FF87] hover:bg-[#00E676] text-[#0A1128] font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#00FF87]/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loadingKey === 'orders-csv' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4" />
                )}
                <span>تصدير ملف Excel (CSV)</span>
              </button>

              <button
                onClick={() => handleExportOrders('json')}
                disabled={!!loadingKey}
                className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/15 transition-all cursor-pointer disabled:opacity-50"
              >
                {loadingKey === 'orders-json' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowDownToLine className="w-4 h-4 text-gray-400" />
                )}
                <span>JSON</span>
              </button>
            </div>
          </div>

          {/* Table Exporter 2: Users Database */}
          <div className="bg-[#0F172A] p-6 rounded-3xl border border-white/10 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#38BDF8]" />
                  <h3 className="text-base font-black text-white">تصدير جدول المستخدمين والحسابات</h3>
                </div>
                <p className="text-xs text-gray-400">
                  يشمل: معرف المستخدم، الاسم، البريد، رقم الهاتف، الدور، تاريخ التسجيل، ووقت آخر دخول.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#38BDF8] bg-[#38BDF8]/15 px-2.5 py-1 rounded-full border border-[#38BDF8]/30">
                {stats.totalUsers} مستخدم
              </span>
            </div>

            {/* Filter by Role */}
            <div className="flex items-center gap-2 flex-wrap text-xs bg-white/5 p-3 rounded-2xl border border-white/10">
              <span className="text-gray-400 font-bold">نوع الحساب:</span>
              {(['all', 'user', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setUserRoleFilter(r)}
                  className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                    userRoleFilter === r
                      ? 'bg-[#38BDF8] text-[#0A1128]'
                      : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {r === 'all' ? 'الكل' : r === 'user' ? 'العملاء (Users)' : 'المدراء (Admins)'}
                </button>
              ))}
            </div>

            {/* Export Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => handleExportUsers('csv')}
                disabled={!!loadingKey}
                className="flex-1 py-3 px-4 rounded-2xl bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-[#0A1128] font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#38BDF8]/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loadingKey === 'users-csv' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4" />
                )}
                <span>تصدير ملف Excel (CSV)</span>
              </button>

              <button
                onClick={() => handleExportUsers('json')}
                disabled={!!loadingKey}
                className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/15 transition-all cursor-pointer disabled:opacity-50"
              >
                {loadingKey === 'users-json' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowDownToLine className="w-4 h-4 text-gray-400" />
                )}
                <span>JSON</span>
              </button>
            </div>
          </div>

          {/* Table Exporter 3: Abandoned Checkouts */}
          <div className="bg-[#0F172A] p-6 rounded-3xl border border-white/10 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-black text-white">تصدير بيانات السلات المتروكة (Leads)</h3>
                </div>
                <p className="text-xs text-gray-400">
                  قائمة العملاء الذين بدأوا الشيك أوت وأدخلوا أرقام هواتفهم ولم يكملوا الدفع.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30">
                {stats.totalAbandoned} سجل
              </span>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={() => handleExportAbandoned('csv')}
                disabled={!!loadingKey}
                className="flex-1 py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loadingKey === 'abandoned-csv' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4" />
                )}
                <span>تصدير Excel (CSV)</span>
              </button>

              <button
                onClick={() => handleExportAbandoned('json')}
                disabled={!!loadingKey}
                className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/15 transition-all cursor-pointer disabled:opacity-50"
              >
                {loadingKey === 'abandoned-json' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowDownToLine className="w-4 h-4 text-gray-400" />
                )}
                <span>JSON</span>
              </button>
            </div>
          </div>

          {/* Table Exporter 4: Webhook Transactions */}
          <div className="bg-[#0F172A] p-6 rounded-3xl border border-white/10 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-black text-white">تصدير سجل الـ Webhook والمعاملات</h3>
                </div>
                <p className="text-xs text-gray-400">
                  سجل رسائل تحويلات فودافون كاش وإنستاباي الواردة من الآيفون ونصوص الـ SMS الخام.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/15 px-2.5 py-1 rounded-full border border-amber-500/30">
                {stats.totalTransactions} معاملة
              </span>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={() => handleExportTransactions('csv')}
                disabled={!!loadingKey}
                className="flex-1 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loadingKey === 'transactions-csv' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4" />
                )}
                <span>تصدير Excel (CSV)</span>
              </button>

              <button
                onClick={() => handleExportTransactions('json')}
                disabled={!!loadingKey}
                className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/15 transition-all cursor-pointer disabled:opacity-50"
              >
                {loadingKey === 'transactions-json' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowDownToLine className="w-4 h-4 text-gray-400" />
                )}
                <span>JSON</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Safety & Compliance Notice */}
      <div className="p-4 bg-[#00FF87]/10 border border-[#00FF87]/25 rounded-2xl flex items-center gap-3 text-xs text-gray-300">
        <ShieldCheck className="w-5 h-5 text-[#00FF87] shrink-0" />
        <span>
          <strong className="text-[#00FF87]">ملاحظة أمان وتوافق:</strong> ملفات الـ CSV المصدرة يتم ترميزها بـ (UTF-8 with BOM) لضمان ظهور النصوص والأسماء العربية بدقة ووضوح تام فور فتحها ببرنامج Microsoft Excel أو Google Sheets.
        </span>
      </div>

    </div>
  );
}
