import React from 'react';
import { db } from '@/db';
import { tools } from '@/db/schema';
import { asc } from 'drizzle-orm';
import { ToolsClient } from './ToolsClient';

export default async function AdminToolsPage() {
  const allTools = await db.select().from(tools).orderBy(asc(tools.number));

  return <ToolsClient initialTools={allTools} />;
}
