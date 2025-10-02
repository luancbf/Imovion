import type { Imovel } from './Imovel';
import type { CategoriaUsuario } from './usuarios';

export interface UsuarioFormulario {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  telefone?: string;
  whatsapp?: string;
  creci?: string;
  categoria: CategoriaUsuario;
}

export interface ImovelEdicao extends Partial<Imovel> {
  id?: string;
  enderecoDetalhado?: string;
  tipoImovel?: string;
  tipoNegocio?: string;
  setorNegocio?: string;
  usuario_id?: string; // Substitui patrocinador
  dataCadastro?: Date | string;
  itens?: Record<string, number> | Record<string, unknown>;
  imagens?: string[];
}

export interface FormularioImovelProps {
  usuarios?: UsuarioFormulario[]; // Substitui patrocinadores
  opcoesTipoImovel?: Record<string, string[]>;
  onSuccess?: () => void;
  dadosIniciais?: ImovelEdicao | null;
  onLimpar?: () => void;
  onImovelCadastrado?: () => void;
  isUserPanel?: boolean;
}