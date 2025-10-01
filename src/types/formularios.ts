import type { Imovel } from './Imovel';

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
  patrocinadores?: { id: string; nome: string; telefone?: string; creci?: string }[];
  opcoesTipoImovel?: Record<string, string[]>;
  onSuccess?: () => void;
  dadosIniciais?: ImovelEdicao | null;
  onLimpar?: () => void;
  onImovelCadastrado?: () => void;
  isUserPanel?: boolean;
}