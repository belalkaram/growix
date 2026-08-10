import { MetadataRoute } from 'next';
import { TOOLS_SEO } from '@/config/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://growix.belalkaram.dev';

  const toolPages: MetadataRoute.Sitemap = TOOLS_SEO.map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    ...toolPages,
    {
      url: `${baseUrl}/checkout`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];
}
