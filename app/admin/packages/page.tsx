import React from 'react';
import { db } from '@/db';
import { packages } from '@/db/schema';
import { asc } from 'drizzle-orm';
import { PackageEditForm } from './PackageEditForm';
import { Package, Sparkles } from 'lucide-react';

export default async function AdminPackagesPage() {
  const allPackages = await db.select().from(packages).orderBy(asc(packages.sortOrder));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-2">
          <Package className="w-6 h-6 text-[#2ECC8F]" />
          <span>إدارة الباقات والأسعار</span>
        </h1>
        <p className="text-xs text-gray-400">تعديل أسعار الباقة الكاملة وباقة الأداة الواحدة والمميزات</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {allPackages.map((pkg) => (
          <PackageEditForm key={pkg.id} initialData={pkg} />
        ))}
      </div>
    </div>
  );
}
