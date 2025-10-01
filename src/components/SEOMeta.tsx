'use client';

import Head from 'next/head';
import { usePathname } from 'next/navigation';

interface SEOMetaProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  price?: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

const defaultMeta = {
  title: 'Imovion - Encontre seu imóvel ideal',
  description: 'A melhor plataforma para encontrar imóveis em sua região. Compre, venda ou alugue com segurança e praticidade.',
  keywords: 'imóveis, casas, apartamentos, terrenos, comprar casa, alugar apartamento, venda imóveis, corretora',
  image: '/imovion.webp',
  type: 'website' as const
};

export default function SEOMeta({
  title,
  description,
  keywords,
  image,
  type = 'website',
  price,
  currency = 'BRL',
  availability,
  author,
  publishedTime,
  modifiedTime,
  canonical,
  noindex = false,
  nofollow = false
}: SEOMetaProps) {
  const pathname = usePathname();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://imovion.vercel.app';
  
  const meta = {
    title: title || defaultMeta.title,
    description: description || defaultMeta.description,
    keywords: keywords || defaultMeta.keywords,
    image: image || defaultMeta.image,
    type: type || defaultMeta.type,
    url: canonical || `${baseUrl}${pathname}`
  };

  const fullTitle = title && title !== defaultMeta.title 
    ? `${title} | Imovion` 
    : defaultMeta.title;

  const imageUrl = meta.image.startsWith('http') 
    ? meta.image 
    : `${baseUrl}${meta.image}`;

  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow'
  ].join(', ');

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={meta.description} />
      <meta name="keywords" content={meta.keywords} />
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={meta.url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={meta.type} />
      <meta property="og:url" content={meta.url} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content="Imovion" />
      <meta property="og:locale" content="pt_BR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={meta.url} />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Article specific */}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}

      {/* Product specific (for real estate listings) */}
      {type === 'product' && price && (
        <>
          <meta property="product:price:amount" content={price.toString()} />
          <meta property="product:price:currency" content={currency} />
          {availability && (
            <meta property="product:availability" content={availability} />
          )}
        </>
      )}

      {/* Structured Data for Real Estate */}
      {type === 'product' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "RealEstateListing",
              "name": meta.title,
              "description": meta.description,
              "image": imageUrl,
              "url": meta.url,
              ...(price && {
                "offers": {
                  "@type": "Offer",
                  "price": price,
                  "priceCurrency": currency,
                  "availability": availability ? `https://schema.org/${availability}` : undefined
                }
              })
            })
          }}
        />
      )}

      {/* General Website Structured Data */}
      {type === 'website' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              "name": "Imovion",
              "description": "Plataforma digital para compra, venda e aluguel de imóveis",
              "url": baseUrl,
              "logo": `${baseUrl}/imovion.webp`,
              "sameAs": [
                // Add social media links when available
              ],
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "BR"
              }
            })
          }}
        />
      )}
    </Head>
  );
}