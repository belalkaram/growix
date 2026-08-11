import React from 'react';
import { db } from '@/db';
import { users } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { UserRoleButton } from './UserRoleButton';
import { Users, ShieldCheck, User as UserIcon } from 'lucide-react';

export default async function AdminUsersPage() {
  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-2">
          <Users className="w-6 h-6 text-[#2ECC8F]" />
          <span>إدارة المستخدمين والأدوار</span>
        </h1>
        <p className="text-xs text-gray-400">عرض قائمة المسجلين، تغيير الأدوار (Admin/User)، ومتابعة آخر تسجيلات الدخول</p>
      </div>

      <div className="bg-[#0F172A] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-white/5 text-gray-400 border-b border-white/10">
              <tr>
                <th className="p-4">الاسم</th>
                <th className="p-4">البريد الإلكتروني</th>
                <th className="p-4">رقم الموبايل</th>
                <th className="p-4">الدور الحالية</th>
                <th className="p-4">تاريخ التسجيل</th>
                <th className="p-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {allUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#0F9D58]/20 text-[#2ECC8F] flex items-center justify-center font-black">
                      {u.name.charAt(0)}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="p-4 text-gray-300 font-mono">{u.email}</td>
                  <td className="p-4 text-gray-300 font-mono">{u.phone || '—'}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                      u.role === 'admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {u.role === 'admin' ? 'مدير (Admin)' : 'مستخدم (User)'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400">{new Date(u.createdAt).toLocaleDateString('ar-EG')}</td>
                  <td className="p-4">
                    <UserRoleButton userId={u.id} currentRole={u.role} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
