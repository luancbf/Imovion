'use client';

import Head from 'next/head';
import { Imovel } from '@/types/Imovel';

interface OpenGraphMetaProps {
  imovel: Imovel;
}

export default function OpenGraphMeta({ imovel }: OpenGraphMetaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://imovion.vercel.app';
  const imageUrl = imovel.imagens?.[0] || `${baseUrl}/imovion.webp`;
  
  const title = `${imovel.tipoimovel} para ${imovel.tiponegocio} em ${imovel.cidade} - ${imovel.bairro}`;
  const description = imovel.descricao || 
    `${imovel.tipoimovel} de ${imovel.metragem}m² em ${imovel.cidade}, ${imovel.bairro}. ${imovel.tiponegocio} por R$ ${imovel.valor.toLocaleString('pt-BR')}.`;
  
  const canonicalUrl = `${baseUrl}/imoveis/${imovel.id}`;
  const keywords = `${imovel.tipoimovel}, ${imovel.tiponegocio}, ${imovel.cidade}, ${imovel.bairro}, imóvel, casa, apartamento, ${imovel.setornegocio}`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title} | Imovion</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={imovel.patrocinador || 'Imovion'} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="article" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content="Imovion" />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Real estate specific Open Graph */}
      <meta property="og:price:amount" content={imovel.valor.toString()} />
      <meta property="og:price:currency" content="BRL" />
      <meta property="product:price:amount" content={imovel.valor.toString()} />
      <meta property="product:price:currency" content="BRL" />
      
      {/* Location */}
      {imovel.latitude && (
        <meta property="place:location:latitude" content={imovel.latitude.toString()} />
      )}
      {imovel.longitude && (
        <meta property="place:location:longitude" content={imovel.longitude.toString()} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@imovion" />
      <meta name="twitter:creator" content="@imovion" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Additional images */}
      {imovel.imagens?.slice(1, 4).map((img, index) => (
        <meta key={index} property="og:image" content={img} />
      ))}
    </Head>
  );
}

// Home page Open Graph
interface HomeOpenGraphProps {
  featuredProperties?: Imovel[];
}

export function HomeOpenGraph({ featuredProperties = [] }: HomeOpenGraphProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://imovion.vercel.app';
  const title = 'Imovion - Encontre seu imóvel ideal';
  const description = 'A melhor plataforma para encontrar imóveis em sua região. Compre, venda ou alugue com segurança e praticidade.';

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="imóveis, casas, apartamentos, terrenos, comprar casa, alugar apartamento, venda imóveis, corretora, imobiliária" />
      <link rel="canonical" href={baseUrl} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={baseUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${baseUrl}/imovion.webp`} />
      <meta property="og:site_name" content="Imovion" />
      <meta property="og:locale" content="pt_BR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@imovion" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${baseUrl}/imovion.webp`} />

      {/* Featured properties images */}
      {featuredProperties.slice(0, 3).map((imovel) => 
        imovel.imagens?.[0] ? (
          <meta key={imovel.id} property="og:image" content={imovel.imagens[0]} />
        ) : null
      )}
    </Head>
  );
}

// Search results Open Graph
interface SearchOpenGraphProps {
  query: {
    cidade?: string;
    tiponegocio?: string;
    tipoimovel?: string;
    priceMin?: number;
    priceMax?: number;
  };
  resultsCount: number;
}

export function SearchOpenGraph({ query, resultsCount }: SearchOpenGraphProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://imovion.vercel.app';
  
  const titleParts = [];
  if (query.tipoimovel) titleParts.push(query.tipoimovel);
  if (query.tiponegocio) titleParts.push(`para ${query.tiponegocio}`);
  if (query.cidade) titleParts.push(`em ${query.cidade}`);
  
  const title = titleParts.length > 0 
    ? `${titleParts.join(' ')} - ${resultsCount} imóveis encontrados | Imovion`
    : `${resultsCount} imóveis encontrados | Imovion`;

  const description = `Encontre ${query.tipoimovel || 'imóveis'} para ${query.tiponegocio || 'compra ou aluguel'} ${query.cidade ? `em ${query.cidade}` : ''}. ${resultsCount} opções disponíveis.`;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={resultsCount > 0 ? 'index, follow' : 'noindex, follow'} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${baseUrl}/imovion.webp`} />
      <meta property="og:site_name" content="Imovion" />
      <meta property="og:locale" content="pt_BR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${baseUrl}/imovion.webp`} />
    </Head>
  );
}