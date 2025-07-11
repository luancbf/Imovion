import type { Imovel } from './Imovel';
import type { Patrocinador } from './cadastrar-patrocinador';

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

export interface FormularioImovelProps {
  patrocinadores: Patrocinador[];
  cidadesComBairros: Record<string, string[]>;
  opcoesTipoImovel: Record<string, string[]>;
  onSuccess: () => void;
  dadosIniciais?: ImovelEdicao | null;
  onLimpar?: () => void;
}