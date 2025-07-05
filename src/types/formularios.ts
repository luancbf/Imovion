import type { Imovel } from './Imovel';

// ✅ Interface extendida para dados de edição
export interface ImovelEdicao extends Partial<Imovel> {
  id?: string;
  enderecoDetalhado?: string;
  tipoImovel?: string;
  tipoNegocio?: string;
  setorNegocio?: string;
  patrocinador?: string;
  dataCadastro?: Date | string;
  itens?: Record<string, number> | Record<string, unknown>;
  imagens?: string[];
}

// ✅ Props do formulário com tipos corretos
export interface FormularioImovelProps {
  patrocinadores: { id: string; nome: string }[];
  cidadesComBairros: Record<string, string[]>;
  opcoesTipoImovel: Record<string, string[]>;
  onSuccess: () => void;
  dadosIniciais?: ImovelEdicao | null;
  onLimpar?: () => void;
}