"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface PatrocinioConfig {
  id: string;
  image_url: string;
  image_alt: string;
  display_order: number;
  is_clickable: boolean;
  patrocinador_id: string | null;
  patrocinadores?: {
    id: string;
    nome: string;
    slug: string;
  } | null;
}

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

export default function Patrocinios() {
  const [patrocinios, setPatrocinios] = useState<PatrocinioConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPatrocinios() {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('patrocinio_configs')
          .select(`
            id, 
            image_url, 
            image_alt, 
            display_order,
            is_clickable,
            patrocinador_id,
            patrocinadores (
              id,
              nome,
              slug
            )
          `)
          .eq('is_active', true)
          .not('image_url', 'is', null)
          .order('display_order', { ascending: true });

        if (error) {
          setPatrocinios([]);
          return;
        }

        if (!data || data.length === 0) {
          setPatrocinios([]);
          return;
        }

        const validPatrocinios = data
          .filter(item => item.image_url && typeof item.image_url === 'string' && item.image_url.trim() !== '')
          .map(item => ({
            id: item.id,
            image_url: item.image_url,
            image_alt: item.image_alt || 'Patrocínio',
            display_order: item.display_order,
            is_clickable: item.is_clickable || false,
            patrocinador_id: item.patrocinador_id,
            patrocinadores: Array.isArray(item.patrocinadores) 
              ? item.patrocinadores[0] 
              : item.patrocinadores
          }));

        setPatrocinios(validPatrocinios);

      } catch {
        setPatrocinios([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPatrocinios();
  }, []);

  if (loading) {
    return (
      <section className="py-8 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto w-fit">
          <div className="grid grid-cols-4 gap-4">
            {[...Array(24)].map((_, index) => (
              <div 
                key={`loading-${index}`}
                className="w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl shadow-sm animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (patrocinios.length === 0) {
    return null;
  }

  return (
    <section className="px-4">
      <div className="mx-auto w-fit">
        <div className="grid grid-cols-4 gap-2 sm:gap-5">
          {patrocinios.map((patrocinio, index) => {
            const isClickable = patrocinio.is_clickable && patrocinio.patrocinadores?.slug;
            
            const PatrocinioCard = (
              <div 
                className={`w-22 h-22 sm:w-40 sm:h-40 lg:w-50 lg:h-50 group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1 ${
                  isClickable ? 'cursor-pointer' : ''
                }`}
                style={{ 
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Imagem principal */}
                <Image
                  src={patrocinio.image_url}
                  alt={patrocinio.image_alt}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, (max-width: 1536px) 16vw, 12vw"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                  onLoad={() => {
                  }}
                />
              </div>
            );

            if (isClickable && patrocinio.patrocinadores?.slug) {
              return (
                <Link 
                  key={`patrocinio-${patrocinio.id}`}
                  href={`/patrocinadores/${patrocinio.patrocinadores.slug}`}
                  className="block"
                  title={`Ver mais sobre ${patrocinio.patrocinadores.nome}`}
                >
                  {PatrocinioCard}
                </Link>
              );
            }

            return (
              <div key={`patrocinio-${patrocinio.id}`}>
                {PatrocinioCard}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}