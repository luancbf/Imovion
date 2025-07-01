"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface PatrocinioConfig {
  id: string;
  image_url: string;
  image_alt: string;
  display_order: number;
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

        // UMA ÚNICA QUERY SIMPLES - SEM FALLBACK
        const { data, error } = await supabase
          .from('patrocinio_configs')
          .select('id, image_url, image_alt, display_order')
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

        // PROCESSAMENTO SIMPLES - SEM LOOPS COMPLEXOS
        const validPatrocinios = data
          .filter(item => item.image_url && typeof item.image_url === 'string' && item.image_url.trim() !== '')
          .map(item => ({
            id: item.id,
            image_url: item.image_url,
            image_alt: item.image_alt || 'Patrocínio',
            display_order: item.display_order
          }));

        console.log('📊 [FILTERED] Patrocínios válidos:', validPatrocinios.length);
        console.log('📋 [IDS] IDs únicos:', validPatrocinios.map(p => `${p.id}(${p.display_order})`));
        
        setPatrocinios(validPatrocinios);

      } catch (error) {
        console.error('❌ [CATCH] Erro ao buscar patrocínios:', error);
        setPatrocinios([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPatrocinios();
  }, []); // DEPENDÊNCIAS VAZIAS - SEM RE-EXECUÇÃO

  if (loading) {
    return (
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-6">
            {[...Array(4)].map((_, index) => (
              <div 
                key={`loading-${index}`}
                className="w-40 h-28 bg-gray-200 rounded-lg shadow-sm animate-pulse"
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
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Grid de imagens */}
        <div className="flex flex-wrap justify-center gap-6">
          {patrocinios.map((patrocinio, index) => (
            <div 
              key={`patrocinio-${patrocinio.id}`}
              className="group relative w-40 h-28 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
              style={{ 
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              <Image
                src={patrocinio.image_url}
                alt={patrocinio.image_alt}
                fill
                className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                sizes="160px"
                onError={(e) => {
                  console.error('❌ [IMAGE ERROR] Erro ao carregar:', patrocinio.image_url);
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
                onLoad={() => {
                  console.log('✅ [IMAGE LOADED]:', patrocinio.image_url);
                }}
              />
              
              {/* Overlay sutil no hover */}
              <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg"></div>
              
              {/* Badge de posição */}
              <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                #{patrocinio.display_order + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS para animação */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}