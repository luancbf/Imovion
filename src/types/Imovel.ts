export interface Imovel {
  id?: string;
  cidade: string;
  bairro: string;
  enderecodetalhado: string;
  valor: number;
  metragem: number;
  descricao: string;
  tipoimovel: string;
  tiponegocio: string;
  setornegocio: string;
  whatsapp?: string;
  patrocinadorid?: string;
  patrocinador?: string;
  itens?: Record<string, unknown> | string;
  imagens?: string[];
  datacadastro?: string | Date;
  updated_at?: string | Date;
  ativo?: boolean;
  latitude?: number;
  longitude?: number;
  codigoimovel?: string;
  user_id?: string; // Referência ao usuário que cadastrou o imóvel

  // Campos para integração de APIs
  fonte_api?: string;           // 'internal' | 'parceiro' | nome da API
  external_id?: string;         // ID original da API externa
  data_sincronizacao?: Date | string;
  data_atualizacao?: Date | string;
  api_source_name?: string;     // Nome amigável da fonte
  api_logo?: string;           // Logo da imobiliária parceira
  
  // Novos campos que podem vir das APIs
  codigo_parceiro?: string;     // Código usado pela imobiliária parceira
  url_original?: string;       // Link para o anúncio original
  status_sync?: 'active' | 'inactive' | 'error';
}