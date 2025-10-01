'use client';

import { Imovel } from '@/types/Imovel';

interface ImovelStructuredDataProps {
  imovel: Imovel;
}

export default function ImovelStructuredData({ imovel }: ImovelStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://imovion.vercel.app';
  
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "RealEstateListing",
    "name": `${imovel.tipoimovel} em ${imovel.cidade}`,
    "description": imovel.descricao,
    "url": `${baseUrl}/imoveis/${imovel.id}`,
    "image": imovel.imagens?.[0] || `${baseUrl}/imovion.webp`,
    "datePosted": imovel.datacadastro || new Date().toISOString(),
    "validThrough": new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 180 days
    
    // Price and offers
    "offers": {
      "@type": "Offer",
      "price": imovel.valor || 0,
      "priceCurrency": "BRL",
      "priceValidUntil": new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "RealEstateAgent",
        "name": imovel.patrocinador || "Imovion",
        "url": baseUrl
      }
    },

    // Property details
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": imovel.metragem || 0,
      "unitCode": "MTK" // Square meters
    },

    // Address
    "address": {
      "@type": "PostalAddress",
      "streetAddress": imovel.enderecodetalhado || '',
      "addressLocality": imovel.cidade || '',
      "addressRegion": imovel.bairro || '',
      "addressCountry": "BR"
    },

    // Geo coordinates (if available)
    ...(imovel.latitude && imovel.longitude && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": imovel.latitude,
        "longitude": imovel.longitude
      }
    }),

    // Property type
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Tipo do Imóvel",
        "value": imovel.tipoimovel || "Residencial"
      },
      {
        "@type": "PropertyValue",
        "name": "Tipo de Negócio",
        "value": imovel.tiponegocio || "Venda"
      },
      {
        "@type": "PropertyValue",
        "name": "Setor",
        "value": imovel.setornegocio || "Residencial"
      }
    ].concat(
      imovel.codigoimovel ? [{
        "@type": "PropertyValue",
        "name": "Código do Imóvel",
        "value": imovel.codigoimovel
      }] : []
    )
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
}

// Additional structured data for search results
interface BreadcrumbStructuredDataProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
}

// Organization structured data
export function OrganizationStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://imovion.vercel.app';
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Imovion",
    "alternateName": "Imovion - Encontre seu imóvel ideal",
    "description": "Plataforma digital especializada em compra, venda e aluguel de imóveis. Encontre sua casa dos sonhos com segurança e praticidade.",
    "url": baseUrl,
    "logo": `${baseUrl}/imovion.webp`,
    "image": `${baseUrl}/imovion.webp`,
    "telephone": "+55-11-99999-9999", // Add real phone when available
    "email": "contato@imovion.com.br", // Add real email when available
    
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "BR",
      "addressRegion": "SP" // Update with real address
    },
    
    "sameAs": [
      // Add social media links when available
      // "https://www.facebook.com/imovion",
      // "https://www.instagram.com/imovion",
      // "https://twitter.com/imovion"
    ],
    
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Catálogo de Imóveis",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Venda de Imóveis",
            "description": "Serviço de intermediação para venda de imóveis residenciais e comerciais"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Aluguel de Imóveis",
            "description": "Serviço de intermediação para locação de imóveis residenciais e comerciais"
          }
        }
      ]
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
}