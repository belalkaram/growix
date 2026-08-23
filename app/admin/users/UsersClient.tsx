'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteUserAction, updateUserRole } from '@/lib/actions/users';
import { CreateUserModal } from './CreateUserModal';
import { EditUserModal } from './EditUserModal';
import { CreateOrderModal, PackageOption, ToolOption } from '@/app/admin/orders/CreateOrderModal';
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  Edit, 
  Shield, 
  Check, 
  Filter, 
  Sparkles,
  ArrowUpDown,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  Beaker,
  User,
  PackagePlus,
  Send
} from 'lucide-react';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: Date;
  lastLoginAt: Date | null;
}

interface UsersClientProps {
  initialUsers: UserRecord[];
  toolsList?: ToolOption[];
  packagesList?: PackageOption[];
  paidUserIds?: string[];
}

export const UsersClient: React.FC<UsersClientProps> = ({ 
  initialUsers,
  toolsList = [],
  packagesList = [],
  paidUserIds = [],
}) => {
  const router = useRouter();
  const [usersList, setUsersList] = useState<UserRecord[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user' | 'test'>('all');
  const [purchaseFilter, setPurchaseFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [orderModalUser, setOrderModalUser] = useState<UserRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const paidSet = new Set(paidUserIds);

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const isPaid = paidSet.has(u.id);
    const matchesPurchase = 
      purchaseFilter === 'all' || 
      (purchaseFilter === 'paid' && isPaid) || 
      (purchaseFilter === 'unpaid' && !isPaid);

    return matchesSearch && matchesRole && matchesPurchase;
  });

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`هل أنت متأكد من حذف المستخدم "${userName}" نهائياً من النظام؟`)) {
      return;
    }
    setDeletingId(userId);
    const res = await deleteUserAction(userId);
    setDeletingId(null);
    if (res.success) {
      setUsersList((prev) => prev.filter((u) => u.id !== userId));
      router.refresh();
    } else {
      alert(res.error || 'حدث خطأ أثناء الحذف');
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    // Cycle roles: user -> test -> admin -> user
    let nextRole: 'user' | 'admin' | 'test' = 'user';
    if (currentRole === 'user') nextRole = 'test';
    else if (currentRole === 'test') nextRole = 'admin';
    else nextRole = 'user';

    const res = await updateUserRole(userId, nextRole);
    if (res.success) {
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: nextRole } : u))
      );
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[#2ECC8F]" />
            <span>إدارة المستخدمين والحسابات (Full CRUD)</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            إضافة، تعديل، حذف، وتحديد حسابات المستخدمين (حقيقي، مدير، أو تجريبي Test)
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-3 rounded-2xl bg-[#00FF87] hover:bg-[#00E676] text-[#0A1128] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00FF87]/25 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>إضافة مستخدم جديد</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0F172A] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم، البريد، أو رقم الهاتف..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white placeholder:text-gray-500 focus:outline-none focus:border-[#2ECC8F]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#0F172A] text-white">الأدوار: الكل ({usersList.length})</option>
              <option value="user" className="bg-[#0F172A] text-white">مستخدمين ({usersList.filter(u => u.role === 'user').length})</option>
              <option value="test" className="bg-[#0F172A] text-white">تجريبيين ({usersList.filter(u => u.role === 'test').length})</option>
              <option value="admin" className="bg-[#0F172A] text-white">المدراء ({usersList.filter(u => u.role === 'admin').length})</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10">
            <select
              value={purchaseFilter}
              onChange={(e) => setPurchaseFilter(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#0F172A] text-white">الاشتراك: الكل</option>
              <option value="paid" className="bg-[#0F172A] text-white">مشتركون بالفعل ({paidUserIds.length})</option>
              <option value="unpaid" className="bg-[#0F172A] text-white">مسجلون بدون شراء ({usersList.filter(u => u.role === 'user' && !paidSet.has(u.id)).length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#0F172A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-white/5 text-gray-400 border-b border-white/10">
              <tr>
                <th className="p-4">الاسم والبيانات</th>
                <th className="p-4">البريد الإلكتروني</th>
                <th className="p-4">رقم الهاتف</th>
                <th className="p-4 text-center">حالة الشراء</th>
                <th className="p-4 text-center">الدور والصلاحية</th>
                <th className="p-4">تاريخ التسجيل</th>
                <th className="p-4 text-center">الإجراءات والتحكم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    لا يوجد مستخدمين مطابقين للبحث
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black ${
                        u.role === 'admin'
                          ? 'bg-amber-500/20 text-amber-400'
                          : u.role === 'test'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-[#0F9D58]/20 text-[#2ECC8F]'
                      }`}>
                        {u.role === 'test' ? <Beaker className="w-4 h-4" /> : u.name.charAt(0)}
                      </div>
                      <div>
                        <span className="block font-black text-white">{u.name}</span>
                        <span className="text-[10px] text-gray-500 font-mono">ID: {u.id.slice(0, 8)}...</span>
                      </div>
                    </td>

                    <td className="p-4 text-gray-300 font-mono">{u.email}</td>
                    
                    <td className="p-4 text-gray-300 font-mono">
                      {u.phone ? (
                        <span className="text-amber-300 font-bold">{u.phone}</span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>

                    <td className="p-4 text-center">
                      {paidSet.has(u.id) ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-[#2ECC8F] border border-emerald-500/30">
                          ✓ مشترك
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-500/20 text-gray-400 border border-white/10">
                          لم يشترك بعد
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleRole(u.id, u.role)}
                        title="انقر للتبديل السريع بين (مستخدم / تجريبي / مدير)"
                        className={`px-3 py-1 rounded-full text-[10px] font-black transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                          u.role === 'admin'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
                            : u.role === 'test'
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 hover:bg-purple-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/40 hover:bg-blue-500/30'
                        }`}
                      >
                        {u.role === 'admin' ? (
                          <>
                            <Shield className="w-3 h-3" />
                            <span>مدير (Admin)</span>
                          </>
                        ) : u.role === 'test' ? (
                          <>
                            <Beaker className="w-3 h-3" />
                            <span>تجريبي (Test)</span>
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3" />
                            <span>مستخدم (User)</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="p-4 text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'medium' })}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {/* WhatsApp Direct Chat Button */}
                        {u.phone && (
                          <a
                            href={`https://wa.me/${u.phone.replace(/[^0-9]/g, '').startsWith('01') ? '2' + u.phone.replace(/[^0-9]/g, '') : u.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحباً ${u.name}، أهلاً بك في منصة GROWIX! هل لديك أي استفسار حول البرامج أو العروض المتاحة؟`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-[#2ECC8F] transition-colors"
                            title="مراسلة على واتساب"
                          >
                            <Send className="w-4 h-4" />
                          </a>
                        )}

                        {/* Add Subscription Order Button */}
                        <button
                          onClick={() => setOrderModalUser(u)}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-[#2ECC8F] border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 transition-all shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer"
                          title="إضافة وتفعيل اشتراك لهذا المستخدم"
                        >
                          <PackagePlus className="w-3.5 h-3.5" />
                          <span>+ اشتراك</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => setEditingUser(u)}
                          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                          title="تعديل بيانات المستخدم وكلمة المرور"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(u.id, u.name)}
                          disabled={deletingId === u.id}
                          className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors disabled:opacity-50 cursor-pointer"
                          title="حذف المستخدم نهائياً"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onUserCreated={() => router.refresh()}
      />

      {/* EDIT USER MODAL */}
      {editingUser && (
        <EditUserModal
          isOpen={Boolean(editingUser)}
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUserUpdated={() => router.refresh()}
        />
      )}

      {/* CREATE ORDER / SUBSCRIPTION FOR USER MODAL */}
      {orderModalUser && (
        <CreateOrderModal
          isOpen={Boolean(orderModalUser)}
          onClose={() => setOrderModalUser(null)}
          onOrderCreated={() => {
            router.refresh();
          }}
          users={usersList}
          packages={packagesList}
          tools={toolsList}
          initialUserId={orderModalUser.id}
        />
      )}
    </div>
  );
};
