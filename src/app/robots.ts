import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://imovion.vercel.app';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/painel-usuario/',
          '/api/',
          '/auth/',
          '/email-confirmado',
          '/*.pdf$',
          '/private/',
          '/temp/'
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/painel-usuario/',
          '/api/',
          '/auth/',
          '/email-confirmado'
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/admin/',
          '/painel-usuario/',
          '/api/',
          '/auth/',
          '/email-confirmado'
        ],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  };
}