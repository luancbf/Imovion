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

  // Novos campos para integração
  fonte_api?: string; // ID da configuração da API de origem
  data_sincronizacao?: Date | string; // Quando foi sincronizado
  external_id?: string; // ID original da API externa
  data_atualizacao?: Date | string; // Última atualização
}