import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminSidebar } from './AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white flex flex-col md:flex-row font-sans" dir="rtl">
      {/* Responsive Admin Sidebar / Mobile Header */}
      <AdminSidebar userEmail={session.user.email || 'Admin'} />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
