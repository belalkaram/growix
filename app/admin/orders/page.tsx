import React from 'react';
import { getAllOrdersForAdmin } from '@/lib/actions/orders';
import { db } from '@/db';
import { users, tools, packages } from '@/db/schema';
import { desc, asc, eq } from 'drizzle-orm';
import { OrdersClient } from './OrdersClient';

export default async function AdminOrdersPage() {
  const [ordersList, allUsers, activeTools, activePackages] = await Promise.all([
    getAllOrdersForAdmin(),
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
      })
      .from(users)
      .orderBy(desc(users.createdAt)),
    db
      .select({
        id: tools.id,
        name: tools.name,
        category: tools.category,
      })
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
    <OrdersClient
      initialOrders={ordersList}
      usersList={allUsers}
      packagesList={activePackages}
      toolsList={activeTools}
    />
  );
}
