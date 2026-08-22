import React from 'react';
import { db } from '@/db';
import { users, tools, packages } from '@/db/schema';
import { desc, asc, eq } from 'drizzle-orm';
import { UsersClient } from './UsersClient';

export default async function AdminUsersPage() {
  const [allUsers, activeTools, activePackages] = await Promise.all([
    db.select().from(users).orderBy(desc(users.createdAt)),
    db
      .select({ id: tools.id, name: tools.name, category: tools.category })
      .from(tools)
      .where(eq(tools.isActive, true))
      .orderBy(asc(tools.sortOrder)),
    db
      .select({
        id: packages.id,
        name: packages.name,
        discountedPrice: packages.discountedPrice,
        originalPrice: packages.originalPrice,
      })
      .from(packages)
      .where(eq(packages.isActive, true))
      .orderBy(asc(packages.sortOrder)),
  ]);

  return (
    <UsersClient 
      initialUsers={allUsers} 
      toolsList={activeTools} 
      packagesList={activePackages} 
    />
  );
}
