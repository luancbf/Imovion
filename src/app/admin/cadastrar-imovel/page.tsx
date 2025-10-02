'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { opcoesTipoImovel } from '@/constants/opcoesTipoImovel';
import { supabase } from '@/lib/supabase';
import { useGerenciamentoUsuarios } from '@/hooks/useGerenciamentoUsuarios';
import { useImoveis } from '@/hooks/useImoveis';
import { sincronizarWhatsAppImoveisExistentes } from '@/utils/sincronizarWhatsApp';
import logger from '@/utils/logger';
import type { Imovel } from '@/types/Imovel';
import type { ImovelEdicao, UsuarioFormulario } from '@/types/formularios';

const FormularioImovel = dynamic(() => import('@/components/cadastrar-imovel/FormularioImovel'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>
});

const ListaImoveis = dynamic(() => import('@/components/cadastrar-imovel/ListaImoveis'), {
  loading: () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>
      ))}
    </div>
  )
});

export default function CadastrarImovel() {
  const { filtrarUsuarios } = useGerenciamentoUsuarios();
  const [usuarios, setUsuarios] = useState<UsuarioFormulario[]>([]);
  const [filtroState, setFiltroState] = useState({ 
    tipoNegocio: '', 
    setorNegocio: '', 
    usuario: '',
    codigoImovel: ''
  });
  const [imovelEditando, setImovelEditando] = useState<ImovelEdicao | null>(null);
  
  // Memoizar filtros para useImoveis (mapeamento correto para o banco)
  const filtrosHook = useMemo(() => ({
    tipoNegocio: filtroState.setorNegocio, // setorNegocio do filtro vai para tipoNegocio do useImoveis
    setorNegocio: filtroState.tipoNegocio, // tipoNegocio do filtro vai para setorNegocio do useImoveis  
    usuarioId: filtroState.usuario,
    cidade: undefined // codigoImovel não é usado no useImoveis atual
  }), [
    filtroState.tipoNegocio,
    filtroState.setorNegocio, 
    filtroState.usuario
  ]);

  // Filtros para componentes (interface original)
  const filtrosComponente = useMemo(() => ({
    tipoNegocio: filtroState.tipoNegocio,
    setorNegocio: filtroState.setorNegocio,
    usuario: filtroState.usuario,
    codigoImovel: filtroState.codigoImovel
  }), [
    filtroState.tipoNegocio,
    filtroState.setorNegocio, 
    filtroState.usuario,
    filtroState.codigoImovel
  ]);
  
  // Função para alterar filtros de forma otimizada
  const handleFiltroChange = useCallback((novosFiltros: typeof filtroState) => {
    setFiltroState(novosFiltros);
  }, []);

  // Usar hook otimizado para imóveis
  const { imoveis, carregando, erro, recarregar } = useImoveis(filtrosHook);
  
  // Mostrar erro se houver
  useEffect(() => {
    if (erro) {
      logger.component.error('CadastrarImovel', erro);
    }
  }, [erro]);

  // Carregar usuários uma única vez na montagem
  useEffect(() => {
    const carregarUsuarios = async () => {
      try {
        const todosUsuarios = filtrarUsuarios({
          busca: '',
          categoria: 'todos',
          creci: 'todos',
          plano: 'todos',
          status: 'todos',
          ordenar_por: 'nome',
          ordem: 'asc'
        });

        const usuariosFormatados: UsuarioFormulario[] = todosUsuarios.map(usuario => ({
          id: usuario.id,
          nome: usuario.nome,
          sobrenome: usuario.sobrenome,
          email: usuario.email,
          telefone: usuario.telefone,
          categoria: usuario.categoria,
          creci: usuario.creci
        }));

        setUsuarios(usuariosFormatados);
      } catch (error) {
        logger.component.error('CadastrarImovel', 'Erro ao carregar usuários:', error);
      }
    };

    carregarUsuarios();
  }, [filtrarUsuarios]); // Depende do hook de filtrar usuários

  const handleDelete = useCallback(async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este imóvel?')) {
      try {
        const { error } = await supabase
          .from('imoveis')
          .delete()
          .eq('id', id);
        
        if (error) {
          logger.component.error('CadastrarImovel', 'Erro ao excluir:', error);
          alert('Erro ao excluir imóvel: ' + error.message);
        } else {
          // Recarregar lista após exclusão
          recarregar();
          if (imovelEditando?.id === id) {
            setImovelEditando(null);
          }
          alert('Imóvel excluído com sucesso!');
        }
      } catch (error) {
        logger.component.error('CadastrarImovel', 'Erro inesperado ao excluir:', error);
        alert('Erro inesperado ao excluir imóvel.');
      }
    }
  }, [recarregar, imovelEditando?.id]);

  const handleEditarNoFormulario = useCallback((imovel: Imovel) => {
    let itensProcessados: Record<string, number> | undefined;
    
    if (imovel.itens) {
      try {
        if (typeof imovel.itens === 'string') {
          const itensParsed = JSON.parse(imovel.itens);
          itensProcessados = Object.fromEntries(
            Object.entries(itensParsed).map(([k, v]) => [k, Number(v) || 0])
          );
        } else if (typeof imovel.itens === 'object') {
          itensProcessados = Object.fromEntries(
            Object.entries(imovel.itens).map(([k, v]) => [k, Number(v) || 0])
          );
        }
      } catch (error) {
        logger.component.error('CadastrarImovel', 'Erro ao processar itens do imóvel:', error);
        itensProcessados = undefined;
      }
    }

    const imovelParaEdicao: ImovelEdicao = {
      ...imovel,
      tipoImovel: imovel.tipoimovel,
      setorNegocio: imovel.setornegocio,
      tipoNegocio: imovel.tiponegocio,
      itens: itensProcessados,
    };

    setImovelEditando(imovelParaEdicao);

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }, []);

  const handleLimparEdicao = useCallback(() => {
    setImovelEditando(null);
  }, []);

  const handleSuccess = useCallback(() => {
    // Recarregar lista após sucesso
    recarregar();
    setImovelEditando(null);
  }, [recarregar]);

  const handleSincronizarWhatsApp = useCallback(async () => {
    if (!confirm('Deseja sincronizar o WhatsApp em todos os imóveis que não possuem este campo preenchido? Esta operação pode demorar alguns minutos.')) {
      return;
    }

    try {
      const resultado = await sincronizarWhatsAppImoveisExistentes();
      
      if (resultado.sucesso) {
        alert(`Sincronização concluída!\n\nImóveis atualizados: ${resultado.imoveisAtualizados}\nErros: ${resultado.erros || 0}\nTotal processado: ${resultado.total || 0}`);
        // Recarregar lista para mostrar os dados atualizados
        recarregar();
      } else {
        alert(`Erro na sincronização: ${resultado.erro}`);
      }
    } catch (error) {
      console.error('Erro ao sincronizar WhatsApp:', error);
      alert('Erro inesperado durante a sincronização');
    }
  }, [recarregar]);

  return (
    <div className="space-y-4">
      {/* Botão de sincronização WhatsApp */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-yellow-800">Sincronização de WhatsApp</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Atualiza o campo WhatsApp em imóveis existentes com o telefone dos usuários
            </p>
          </div>
          <button
            onClick={handleSincronizarWhatsApp}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Sincronizar WhatsApp
          </button>
        </div>
      </div>

      <FormularioImovel
        usuarios={usuarios}
        opcoesTipoImovel={opcoesTipoImovel}
        onSuccess={handleSuccess}
        dadosIniciais={imovelEditando}
        onLimpar={handleLimparEdicao}
      />

      <ListaImoveis
        imoveis={imoveis}
        carregando={carregando}
        onDelete={handleDelete}
        onEdit={handleEditarNoFormulario}
        usuarios={usuarios}
        filtros={filtrosComponente}
        onFiltroChange={handleFiltroChange}
      />
    </div>
  );
}