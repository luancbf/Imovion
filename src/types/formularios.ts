import type { Imovel } from '@/types/Imovel';

export interface FormularioImovelProps {
  patrocinadores: { id: string; nome: string }[];
  cidadesComBairros: Record<string, string[]>;
  opcoesTipoImovel: Record<string, string[]>;
  onSuccess?: () => void;
  onSalvar?: (dados: Partial<Imovel>) => Promise<void>;
  dadosIniciais?: Partial<{
    cidade: string;
    bairro: string;
    enderecoDetalhado: string;
    valor: string;
    metragem: string;
    descricao: string;
    tipoImovel: string;
    tipoNegocio: string;
    setorNegocio: string;
    whatsapp: string;
    patrocinador: string;
    imagens: string[];
    itens: Record<string, number>;
  }>;
}