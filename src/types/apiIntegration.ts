// src/types/apiIntegration.ts
export interface ExternalAPIConfig {
  id: string;
  name: string;
  baseUrl: string;
  authKey?: string;
  authType: 'bearer' | 'api-key' | 'basic' | 'none';
  mapping: FieldMapping;
  rateLimit: number; // requests per minute
  isActive: boolean;
  webhookSecret?: string;

  // Novas configurações para exclusão
  enableDeletion: boolean; // Se deve excluir imóveis que não existem mais na API
  deletionStrategy: 'hard_delete' | 'soft_delete' | 'archive'; // Como tratar exclusões
  keepDaysBeforeDelete?: number; // Dias antes de excluir definitivamente (para soft delete)
}

export interface FieldMapping {
  // Campos obrigatórios
  id: string;
  cidade: string;
  bairro: string;
  valor: string;
  tipoImovel: string;
  tipoNegocio: string;
  setorNegocio: string;
  
  // Campos opcionais
  descricao?: string;
  metragem?: string;
  imagens?: string;
  whatsapp?: string;
  creci?: string;
  enderecoDetalhado?: string;
  codigoImovel?: string;
  
  // Mapeamento de características customizadas
  caracteristicas?: Record<string, string>;
}

export interface SyncLog {
  id: string;
  apiConfigId: string;
  timestamp: Date;
  status: 'success' | 'error' | 'partial';
  totalProcessed: number;
  totalErrors: number;
  errorMessages?: string[];
  duration: number; // em milissegundos

  // Novos campos para exclusões
  totalDeleted: number; // Quantos foram excluídos
  deletedIds?: string[]; // IDs dos imóveis excluídos
}

// ✅ CORRIGIDO: Tipagem mais específica para dados externos
export type ExternalImovelData = Record<string, unknown>;

// ✅ ALTERNATIVA: Interface mais específica se quiser mais controle
export interface ExternalImovelDataTyped {
  // Campos que podem existir nos dados externos
  id?: string | number;
  codigo?: string | number;
  cidade?: string;
  bairro?: string;
  endereco?: string;
  valor?: string | number;
  preco?: string | number;
  price?: string | number;
  metragem?: string | number;
  area?: string | number;
  descricao?: string;
  description?: string;
  tipo?: string;
  type?: string;
  categoria?: string;
  category?: string;
  negocio?: string;
  business?: string;
  finalidade?: string;
  purpose?: string;
  telefone?: string;
  phone?: string;
  whatsapp?: string;
  creci?: string;
  imagens?: string[] | string;
  images?: string[] | string;
  fotos?: string[] | string;
  photos?: string[] | string;
  caracteristicas?: Record<string, unknown>;
  features?: Record<string, unknown>;
  attributes?: Record<string, unknown>;
  detalhes?: Record<string, unknown>;
  details?: Record<string, unknown>;
  
  // Para propriedades aninhadas (ex: location.city)
  location?: {
    city?: string;
    neighborhood?: string;
    address?: string;
    [key: string]: unknown;
  };
  
  pricing?: {
    value?: string | number;
    currency?: string;
    [key: string]: unknown;
  };
  
  // Para qualquer outra propriedade não mapeada
  [key: string]: unknown;
}

// ✅ União dos tipos para máxima flexibilidade
export type ExternalAPIData = ExternalImovelData | ExternalImovelDataTyped;