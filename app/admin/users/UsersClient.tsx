'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteUserAction, updateUserRole } from '@/lib/actions/users';
import { CreateUserModal } from './CreateUserModal';
import { EditUserModal } from './EditUserModal';
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
  Calendar
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

export const UsersClient: React.FC<{ initialUsers: UserRecord[] }> = ({ initialUsers }) => {
  const router = useRouter();
  const [usersList, setUsersList] = useState<UserRecord[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user' | 'test'>('all');
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
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

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-[#2ECC8F] cursor-pointer"
          >
            <option value="all" className="bg-[#0F172A] text-white">جميع الأدوار ({usersList.length})</option>
            <option value="user" className="bg-[#0F172A] text-white">👤 مستخدمين حقيقيين ({usersList.filter(u => u.role === 'user').length})</option>
            <option value="test" className="bg-[#0F172A] text-white">🧪 مستخدمين تجريبيين ({usersList.filter(u => u.role === 'test').length})</option>
            <option value="admin" className="bg-[#0F172A] text-white">👑 المدراء فقط ({usersList.filter(u => u.role === 'admin').length})</option>
          </select>
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
                        {u.role === 'test' ? '🧪' : u.name.charAt(0)}
                      </div>
                      <div>
                        <span className="block font-black text-white">{u.name}</span>
                        <span className="text-[10px] text-gray-500 font-mono">ID: {u.id.slice(0, 8)}...</span>
                      </div>
                    </td>

                    <td className="p-4 text-gray-300 font-mono">{u.email}</td>
                    
                    <td className="p-4 text-gray-300 font-mono">
                      {u.phone ? u.phone : <span className="text-gray-500">—</span>}
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleRole(u.id, u.role)}
                        title="انقر للتبديل السريع بين (مستخدم / تجريبي / مدير)"
                        className={`px-3 py-1 rounded-full text-[10px] font-black transition-all cursor-pointer ${
                          u.role === 'admin'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
                            : u.role === 'test'
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 hover:bg-purple-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/40 hover:bg-blue-500/30'
                        }`}
                      >
                        {u.role === 'admin' ? '👑 مدير (Admin)' : u.role === 'test' ? '🧪 تجريبي (Test)' : '👤 مستخدم (User)'}
                      </button>
                    </td>

                    <td className="p-4 text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'medium' })}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => setEditingUser(u)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                          title="تعديل بيانات المستخدم وكلمة المرور"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(u.id, u.name)}
                          disabled={deletingId === u.id}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors disabled:opacity-50 cursor-pointer"
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
    </div>
  );
};
