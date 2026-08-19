import React from 'react';
import { getAllCouponsAction } from '@/lib/actions/coupons';
import { CouponsClient } from './CouponsClient';

export const metadata = {
  title: 'إدارة الكوبونات وقسائم الخصم | GrowiX Admin',
  description: 'لوحة التحكم في قسائم الخصم والكوبونات ومتابعة المستخدمين المستفيدين',
};

export default async function AdminCouponsPage() {
  const res = await getAllCouponsAction();
  const coupons = res.coupons || [];

  return <CouponsClient initialCoupons={coupons as any} />;
}
