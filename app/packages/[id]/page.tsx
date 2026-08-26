import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPackageById, getPackages, getTools } from '@/lib/queries';
import { getSiteSettingsAction } from '@/lib/actions/settings';
import { MaintenanceScreen } from '@/components/MaintenanceScreen';
import { HeaderNavbar } from '@/components/HeaderNavbar';
import { Footer } from '@/components/Footer';
import { PackageDetailClient } from '@/components/PackageDetailClient';
import { SITE_CONFIG } from '@/config/site';

interface PackagePageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const packages = await getPackages();
  return packages.map((pkg) => ({
    id: pkg.id,
  }));
}

export async function generateMetadata({ params }: PackagePageProps): Promise<Metadata> {
  const { id } = await params;
  const packageData = await getPackageById(id);

  if (!packageData) {
    return {
      title: 'الباقة غير موجودة | GROWIX',
    };
  }

  const title = `${packageData.name} | GROWIX منصة التسويق والأدوات الذكية`;
  const description = `${packageData.description} - بسعر ${packageData.discountedPrice} ج بدلاً من ${packageData.originalPrice} ج. تفعيل مدى الحياة ودعم فني 24/7.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://growix.belalkaram.dev/packages/${id}`,
      siteName: 'GROWIX',
      locale: 'ar_EG',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://growix.belalkaram.dev/packages/${id}`,
    },
  };
}

export default async function PackageDetailPage({ params }: PackagePageProps) {
  const { id } = await params;

  // Maintenance check
  const settings = await getSiteSettingsAction();
  if (settings.maintenance_mode === 'true') {
    return (
      <MaintenanceScreen
        message={settings.maintenance_message || 'الموقع قيد الصيانة والتحديثات المباشرة. سنعود خلال دقائق!'}
      />
    );
  }

  const [packageData, allPackages, tools] = await Promise.all([
    getPackageById(id),
    getPackages(),
    getTools(),
  ]);

  if (!packageData) {
    notFound();
  }

  // Product Structured Data (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: packageData.name,
    description: packageData.description,
    image: 'https://growix.belalkaram.dev/og-image.png',
    brand: {
      '@type': 'Brand',
      name: 'GROWIX',
    },
    offers: {
      '@type': 'Offer',
      price: packageData.discountedPrice.replace(/[^0-9]/g, ''),
      priceCurrency: 'EGP',
      availability: 'https://schema.org/InStock',
      url: `https://growix.belalkaram.dev/packages/${packageData.id}`,
      seller: {
        '@type': 'Organization',
        name: 'GROWIX',
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col justify-between selection:bg-[#2ECC8F]/20 selection:text-[#0F9D58]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <HeaderNavbar settings={settings} />

      <main className="flex-1">
        <PackageDetailClient
          packageData={packageData}
          allPackages={allPackages}
          tools={tools}
        />
      </main>

      <Footer settings={settings} />
    </div>
  );
}
