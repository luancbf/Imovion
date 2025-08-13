'use client';

import { useEffect, useState } from 'react';
import useAuthGuard from '@/hooks/useAuthGuard';
import FormularioImovel from '@/components/cadastrar-imovel/FormularioImovel';
import FiltroCadastroImoveis from '@/components/cadastrar-imovel/FiltroCadastroImoveis';
import ListaImoveis from '@/components/cadastrar-imovel/ListaImoveis';
import { opcoesTipoImovel } from '@/constants/opcoesTipoImovel';
import type { Imovel } from '@/types/Imovel';
import type { ImovelEdicao } from '@/types/formularios';
import type { Patrocinador } from '@/types/cadastrar-patrocinador';
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

export default function CadastrarImovel() {
  useAuthGuard();

  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [patrocinadores, setPatrocinadores] = useState<Patrocinador[]>([]);
  const [filtros, setFiltros] = useState({ tipoNegocio: '', setorNegocio: '', patrocinador: '' });
  const [carregando, setCarregando] = useState(false);
  const [imovelEditando, setImovelEditando] = useState<ImovelEdicao | null>(null);

  useEffect(() => {
    (async () => {
      setCarregando(true);
      try {
        let query = supabase
          .from('imoveis')
          .select('*')
          .order('datacadastro', { ascending: false });
        
        if (filtros.tipoNegocio) {
          query = query.eq('tiponegocio', filtros.tipoNegocio);
        }
        if (filtros.setorNegocio) {
          query = query.eq('setornegocio', filtros.setorNegocio);
        }
        if (filtros.patrocinador) {
          query = query.eq('patrocinadorid', filtros.patrocinador);
        }
        
        const { data: imoveisData, error: imoveisError } = await query;
        
        if (imoveisError) {
          setImoveis([]);
        } else {
          setImoveis(imoveisData as Imovel[] || []);
        }
        
        const { data: patrocinadoresData, error: patrocinadorError } = await supabase
          .from('patrocinadores')
          .select('id, nome, slug, telefone, creci');
        
        if (patrocinadorError) {
          setPatrocinadores([]);
        } else {
          // Garante que só patrocinadores válidos são usados
          setPatrocinadores(
            (patrocinadoresData || []).filter(
              (p: { id?: string; nome?: string }) => !!p && !!p.id && !!p.nome
            )
          );
        }
        
      } catch {
        setImoveis([]);
        setPatrocinadores([]);
      } finally {
        setCarregando(false);
      }
    })();
  }, [filtros]);

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este imóvel?')) {
      try {
        const { error } = await supabase
          .from('imoveis')
          .delete()
          .eq('id', id);
        
        if (error) {
          alert('Erro ao excluir imóvel: ' + error.message);
        } else {
          setImoveis(imoveis => imoveis.filter(imovel => imovel.id !== id));
          if (imovelEditando?.id === id) {
            setImovelEditando(null);
          }
          alert('Imóvel excluído com sucesso!');
        }
      } catch {
        alert('Erro inesperado ao excluir imóvel.');
      }
    }
  };

  const handleEditarNoFormulario = (imovel: Imovel) => {
    // Parse seguro do campo itens
    let itensProcessados: Record<string, number> | undefined;
    
    if (imovel.itens) {
      try {
        if (typeof imovel.itens === 'string') {
          // Se for string, faz o parse do JSON
          const itensParsed = JSON.parse(imovel.itens);
          itensProcessados = Object.fromEntries(
            Object.entries(itensParsed).map(([k, v]) => [k, Number(v) || 0])
          );
        } else if (typeof imovel.itens === 'object') {
          // Se já for objeto, converte os valores para number
          itensProcessados = Object.fromEntries(
            Object.entries(imovel.itens).map(([k, v]) => [k, Number(v) || 0])
          );
        }
      } catch (error) {
        console.error('Erro ao processar itens do imóvel:', error);
        itensProcessados = undefined;
      }
    }

    const imovelParaEdicao: ImovelEdicao = {
      ...imovel,
      tipoImovel: imovel.tipoimovel,
      setorNegocio: imovel.setornegocio,
      tipoNegocio: imovel.tiponegocio,
      itens: itensProcessados, // Campo itens corretamente tipado
    };

    setImovelEditando(imovelParaEdicao);

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleLimparEdicao = () => {
    setImovelEditando(null);
  };

  const handleSuccess = async () => {
    setCarregando(true);
    
    try {
      const { data, error } = await supabase
        .from('imoveis')
        .select('*')
        .order('datacadastro', { ascending: false });
      
      if (error) {
        setImoveis([]);
      } else {
        setImoveis(data as Imovel[] || []);
      }
      
      setImovelEditando(null);

    } catch {
      setImoveis([]);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="space-y-8">
          
          <FormularioImovel
            patrocinadores={patrocinadores}
            opcoesTipoImovel={opcoesTipoImovel}
            onSuccess={handleSuccess}
            dadosIniciais={imovelEditando}
            onLimpar={handleLimparEdicao}
          />

          <FiltroCadastroImoveis
            patrocinadores={patrocinadores}
            onFiltroChange={setFiltros}
          />

          <ListaImoveis
            imoveis={imoveis}
            carregando={carregando}
            onDelete={handleDelete}
            onEdit={handleEditarNoFormulario}
            patrocinadores={patrocinadores}
          />

        </div>
      </main>
    </div>
  );
}