import React from 'react';
import { db } from '@/db';
import { users } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { UsersClient } from './UsersClient';

export default async function AdminUsersPage() {
  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));

  return <UsersClient initialUsers={allUsers} />;
}
