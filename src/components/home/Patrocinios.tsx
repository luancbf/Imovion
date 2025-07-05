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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

export default function Patrocinios() {
  const [patrocinios, setPatrocinios] = useState<PatrocinioConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPatrocinios() {
      try {
        setLoading(true);
        console.log('🔍 [FETCH] Iniciando busca de patrocínios...');

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
          console.error('❌ [FETCH ERROR]:', error);
          setPatrocinios([]);
          return;
        }

        console.log('✅ [FETCH SUCCESS] Dados recebidos:', data);

        if (!data || data.length === 0) {
          console.log('⚠️ [NO DATA] Nenhum patrocínio encontrado');
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

        console.log('📊 [FILTERED] Patrocínios válidos:', validPatrocinios.length);
        setPatrocinios(validPatrocinios);

      } catch (error) {
        console.error('❌ [CATCH] Erro ao buscar patrocínios:', error);
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {[...Array(6)].map((_, index) => (
              <div 
                key={`loading-${index}`}
                className="w-40 h-40 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl shadow-sm animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (patrocinios.length === 0) {
    console.log('📭 [RENDER] Nenhum patrocínio para exibir');
    return null;
  }

  console.log('🎨 [RENDER] Renderizando', patrocinios.length, 'patrocínios');

  return (
    <section className="py-12 px-6">
      <div className="mx-auto w-fit">
        {/* Grid que se ajusta ao próprio conteúdo */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {patrocinios.map((patrocinio, index) => {
            // ✅ Determinar se é clicável e tem patrocinador
            const isClickable = patrocinio.is_clickable && 
                               patrocinio.patrocinadores?.slug;
            
            const PatrocinioCard = (
              <div 
                className={`w-60 h-60 group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1 ${
                  isClickable ? 'cursor-pointer' : ''
                }`}
                style={{ 
                  animationDelay: `${index * 150}ms`,
                }}
              >
                {/* Imagem principal */}
                <Image
                  src={patrocinio.image_url}
                  alt={patrocinio.image_alt}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                  onError={(e) => {
                    console.error('❌ [IMAGE ERROR] Erro ao carregar:', patrocinio.image_url);
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('✅ [IMAGE LOADED]:', patrocinio.image_url);
                  }}
                />
              </div>
            );

            // ✅ Se é clicável e tem slug, envolve com Link
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

            // ✅ Se não é clicável, retorna apenas o card
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