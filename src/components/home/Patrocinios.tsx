"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase'

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

export default function Patrocinios() {
  const [patrocinios, setPatrocinios] = useState<PatrocinioConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPatrocinios() {
      try {
        setLoading(true);

        // Primeira query: buscar apenas os dados de patrocinio_configs
        const { data, error } = await supabase
          .from('patrocinio_configs')
          .select(`
            id, 
            image_url, 
            image_alt, 
            display_order,
            is_clickable,
            patrocinador_id
          `)
          .eq('is_active', true)
          .not('image_url', 'is', null)
          .order('display_order', { ascending: true });

        if (error) {
          console.error('Erro ao buscar patrocínios:', error);
          setPatrocinios([]);
          return;
        }

        if (!data || data.length === 0) {
          setPatrocinios([]);
          return;
        }

        // Segunda query: buscar dados dos patrocinadores apenas para os que têm patrocinador_id
        const patrocinadorIds = data
          .filter(item => item.patrocinador_id)
          .map(item => item.patrocinador_id);

        let patrocinadores: Array<{id: string, nome: string, slug: string}> = [];
        if (patrocinadorIds.length > 0) {
          const { data: patrocinadorData } = await supabase
            .from('patrocinadores')
            .select('id, nome, slug')
            .in('id', patrocinadorIds);
          
          patrocinadores = patrocinadorData || [];
        }

        // Mapear dados combinando as duas queries
        const validPatrocinios = data
          .filter(item => item.image_url && typeof item.image_url === 'string' && item.image_url.trim() !== '')
          .map(item => {
            const patrocinador = patrocinadores.find(p => p.id === item.patrocinador_id);
            return {
              id: item.id,
              image_url: item.image_url,
              image_alt: item.image_alt || 'Patrocínio',
              display_order: item.display_order,
              is_clickable: item.is_clickable || false,
              patrocinador_id: item.patrocinador_id,
              patrocinadores: patrocinador || null
            };
          });

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
      <section className="px-4">
        <div className="mx-auto w-fit">
          <div className="grid grid-cols-4 gap-2 sm:gap-5">
            {[...Array(16)].map((_, index) => (
              <div 
                key={`loading-${index}`}
                className="w-20 h-20 sm:w-40 sm:h-40 lg:w-50 lg:h-50 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl shadow-sm animate-pulse"
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
                className={`w-20 h-20 sm:w-40 sm:h-40 lg:w-50 lg:h-50 group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1 ${
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
                  width={80}
                  height={80}
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out w-full h-full"
                  sizes="(max-width: 640px) 128px, (max-width: 1024px) 160px, 200px"
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
                  onClick={() => {
                    if (
                      typeof window !== "undefined" &&
                      window.gtag &&
                      patrocinio.patrocinadores
                    ) {
                      window.gtag("event", "click_patrocinador", {
                        patrocinador_id: patrocinio.patrocinadores.id,
                        patrocinador_nome: patrocinio.patrocinadores.nome,
                        patrocinador_slug: patrocinio.patrocinadores.slug,
                        page_path: window.location.pathname,
                      });
                    }
                  }}
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