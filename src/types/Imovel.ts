export interface Imovel {
  id: string;
  cidade: string;
  bairro: string;
  enderecodetalhado: string;
  valor: number;
  metragem: number;
  descricao: string;
  tipoimovel: string;
  tiponegocio: string;
  setornegocio?: string;
  whatsapp: string;
  patrocinador?: string;
  patrocinadorid?: string;
  imagens: string[];
  datacadastro?: Date | string;
  itens?: Record<string, unknown>;
  ativo?: boolean;
  latitude?: number | null;
  longitude?: number | null;
}