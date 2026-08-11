import React from 'react';
import { 
  getTools, 
  getPackages, 
  getFaqs, 
  getTestimonials, 
  getSiteSettings, 
  getAllToolsSeo 
} from '@/lib/queries';
import { auth } from '@/lib/auth';
import { HomePageClient } from '@/components/HomePageClient';

export default async function Home() {
  const [tools, packages, faqs, testimonials, siteSettings, toolsSeo, session] = await Promise.all([
    getTools(),
    getPackages(),
    getFaqs(),
    getTestimonials(),
    getSiteSettings(),
    getAllToolsSeo(),
    auth(),
  ]);

  const userSession = session?.user
    ? {
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: (session.user as { role?: string }).role || 'user',
        },
      }
    : null;

  return (
    <HomePageClient
      tools={tools}
      packages={packages}
      faqs={faqs}
      testimonials={testimonials}
      toolsSeo={toolsSeo}
      settings={siteSettings}
      session={userSession}
    />
  );
}
