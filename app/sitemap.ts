import { MetadataRoute } from 'next';
import { getBeritaList } from '@/lib/google-sheets';

const baseUrl = 'https://dusun-topoindah.my.id';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all news for dynamic routes
  const beritaList = await getBeritaList();
  
  // Filter for public news
  const publicBerita = beritaList.filter(
    (b) => b.status_publikasi === 'Publik' || !b.status_publikasi
  );

  const beritaUrls: MetadataRoute.Sitemap = publicBerita.map((berita) => ({
    url: `${baseUrl}/berita/${berita.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${baseUrl}/profil`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/berita`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/galeri`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/pengaduan`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  return [...staticUrls, ...beritaUrls];
}
