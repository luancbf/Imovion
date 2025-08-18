// src/services/dataMapper.ts
import { Imovel } from '@/types/Imovel';
import { ExternalImovelData, FieldMapping } from '@/types/apiIntegration';

export class DataMapper {
  private mapping: FieldMapping;

  constructor(mapping: FieldMapping) {
    this.mapping = mapping;
  }

  // ✅ CORRIGIDO: Função para acessar propriedades aninhadas sem 'any'
  private getNestedValue(obj: ExternalImovelData, path: string): unknown {
    return path.split('.').reduce((current: unknown, key: string): unknown => {
      if (current && typeof current === 'object' && current !== null) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  }

  // ✅ CORRIGIDO: Converter unknown para string de forma segura
  private toString(value: unknown): string | undefined {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    return String(value);
  }

  // ✅ CORRIGIDO: Parse de número sem 'any'
  private parseNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') return undefined;
    
    const parsed = Number(value);
    return isNaN(parsed) ? undefined : parsed;
  }

  // ✅ CORRIGIDO: Parse de imagens sem 'any'
  private parseImages(imagesData: unknown): string[] {
    if (!imagesData) return [];
    
    if (Array.isArray(imagesData)) {
      return imagesData
        .map(img => this.toString(img))
        .filter((img): img is string => Boolean(img));
    }
    
    if (typeof imagesData === 'string') {
      return imagesData.split(',').map(img => img.trim()).filter(Boolean);
    }
    
    return [];
  }

  // ✅ CORRIGIDO: Helper para verificar se propriedade existe no tipo Imovel
  private hasProperty<K extends keyof Imovel>(key: K): boolean {
    // Lista das propriedades conhecidas do tipo Imovel
    const knownProperties: (keyof Imovel)[] = [
      'id', 'cidade', 'bairro', 'valor', 'tipoimovel', 'tiponegocio', 
      'setornegocio', 'descricao', 'metragem', 'whatsapp', 'imagens', 'itens'
    ];
    return knownProperties.includes(key);
  }

  // ✅ CORRIGIDO: Mapear dados externos para formato interno (sem any)
  mapToInternal(externalData: ExternalImovelData): Partial<Imovel> {
    try {
      const mapped: Partial<Imovel> = {
        // Campos obrigatórios que existem no tipo Imovel
        id: this.toString(this.getNestedValue(externalData, this.mapping.id)),
        cidade: this.toString(this.getNestedValue(externalData, this.mapping.cidade)),
        bairro: this.toString(this.getNestedValue(externalData, this.mapping.bairro)),
        valor: this.parseNumber(this.getNestedValue(externalData, this.mapping.valor)),
        tipoimovel: this.toString(this.getNestedValue(externalData, this.mapping.tipoImovel)),
        tiponegocio: this.toString(this.getNestedValue(externalData, this.mapping.tipoNegocio)),
        setornegocio: this.toString(this.getNestedValue(externalData, this.mapping.setorNegocio)),
        
        // Campos opcionais que existem no tipo Imovel
        descricao: this.mapping.descricao 
          ? this.toString(this.getNestedValue(externalData, this.mapping.descricao)) 
          : undefined,
        metragem: this.mapping.metragem 
          ? this.parseNumber(this.getNestedValue(externalData, this.mapping.metragem)) 
          : undefined,
        whatsapp: this.mapping.whatsapp 
          ? this.toString(this.getNestedValue(externalData, this.mapping.whatsapp)) 
          : undefined,
        
        // Imagens
        imagens: this.parseImages(
          this.mapping.imagens 
            ? this.getNestedValue(externalData, this.mapping.imagens) 
            : null
        ),
        
        // Características customizadas
        itens: this.mapCaracteristicas(externalData),
      };

      // ✅ CORRIGIDO: Adicionar campos de metadados de forma type-safe
      const mappedWithMeta = this.addMetadataFields(mapped);

      return mappedWithMeta;
    } catch (error) {
      console.error('Erro ao mapear dados externos:', error);
      throw new Error(`Erro no mapeamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  // ✅ NOVA FUNÇÃO: Adicionar campos de metadados de forma type-safe
  private addMetadataFields(mapped: Partial<Imovel>): Partial<Imovel> {
    const result = { ...mapped };
    
    // Verificar se existem campos de data no tipo Imovel e adicionar se existirem
    const sampleImovel = {} as Imovel;
    
    if ('dataCadastro' in sampleImovel) {
      (result as Record<string, unknown>)['dataCadastro'] = new Date();
    }
    
    if ('dataAtualizacao' in sampleImovel) {
      (result as Record<string, unknown>)['dataAtualizacao'] = new Date();
    }
    
    return result;
  }

  // ✅ CORRIGIDO: Mapear características sem 'any'
  private mapCaracteristicas(externalData: ExternalImovelData): Record<string, number> {
    const caracteristicas: Record<string, number> = {};
    
    if (this.mapping.caracteristicas) {
      Object.entries(this.mapping.caracteristicas).forEach(([chaveInterna, chaveExterna]) => {
        const valor = this.getNestedValue(externalData, chaveExterna);
        const numeroValor = this.parseNumber(valor);
        if (numeroValor !== undefined) {
          caracteristicas[chaveInterna] = numeroValor;
        }
      });
    }
    
    return caracteristicas;
  }

  // ✅ CORRIGIDO: Validar usando nomes corretos das propriedades
  validateMappedData(data: Partial<Imovel>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validações obrigatórias (apenas campos que existem no tipo Imovel)
    if (!data.id) errors.push('ID é obrigatório');
    if (!data.cidade) errors.push('Cidade é obrigatória');
    if (!data.bairro) errors.push('Bairro é obrigatório');
    if (!data.valor || data.valor <= 0) errors.push('Valor deve ser maior que zero');
    if (!data.tipoimovel) errors.push('Tipo de imóvel é obrigatório');
    if (!data.tiponegocio) errors.push('Tipo de negócio é obrigatório');
    if (!data.setornegocio) errors.push('Setor de negócio é obrigatório');
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // ✅ NOVA FUNÇÃO: Validar se o mapeamento está correto
  validateMapping(mapping: FieldMapping): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Verificar se todos os campos obrigatórios estão mapeados
    if (!mapping.id) errors.push('Mapeamento do campo ID é obrigatório');
    if (!mapping.cidade) errors.push('Mapeamento do campo cidade é obrigatório');
    if (!mapping.bairro) errors.push('Mapeamento do campo bairro é obrigatório');
    if (!mapping.valor) errors.push('Mapeamento do campo valor é obrigatório');
    if (!mapping.tipoImovel) errors.push('Mapeamento do campo tipoImovel é obrigatório');
    if (!mapping.tipoNegocio) errors.push('Mapeamento do campo tipoNegocio é obrigatório');
    if (!mapping.setorNegocio) errors.push('Mapeamento do campo setorNegocio é obrigatório');
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // ✅ NOVA FUNÇÃO: Mapear campos extras para serem salvos separadamente
  mapExtraFields(externalData: ExternalImovelData): Record<string, unknown> {
    const extraFields: Record<string, unknown> = {};
    
    // Mapear campos que não existem no tipo Imovel mas podem ser úteis
    if (this.mapping.creci) {
      const creci = this.toString(this.getNestedValue(externalData, this.mapping.creci));
      if (creci) extraFields.creci = creci;
    }
    
    if (this.mapping.enderecoDetalhado) {
      const endereco = this.toString(this.getNestedValue(externalData, this.mapping.enderecoDetalhado));
      if (endereco) extraFields.enderecoDetalhado = endereco;
    }
    
    if (this.mapping.codigoImovel) {
      const codigo = this.toString(this.getNestedValue(externalData, this.mapping.codigoImovel));
      if (codigo) extraFields.codigoImovel = codigo;
    }
    
    return extraFields;
  }

  // ✅ NOVA FUNÇÃO: Mapear dados completos (incluindo campos extras)
  mapToInternalComplete(externalData: ExternalImovelData): {
    imovel: Partial<Imovel>;
    extraFields: Record<string, unknown>;
  } {
    const imovel = this.mapToInternal(externalData);
    const extraFields = this.mapExtraFields(externalData);
    
    return { imovel, extraFields };
  }

  // ✅ NOVA FUNÇÃO: Teste de mapeamento com dados de exemplo
  testMapping(externalData: ExternalImovelData): { 
    success: boolean; 
    mappedData?: Partial<Imovel>; 
    extraFields?: Record<string, unknown>;
    errors: string[] 
  } {
    try {
      // Primeiro validar o mapeamento
      const mappingValidation = this.validateMapping(this.mapping);
      if (!mappingValidation.valid) {
        return {
          success: false,
          errors: mappingValidation.errors
        };
      }

      // Tentar mapear os dados
      const { imovel, extraFields } = this.mapToInternalComplete(externalData);
      
      // Validar dados mapeados
      const dataValidation = this.validateMappedData(imovel);
      
      return {
        success: dataValidation.valid,
        mappedData: dataValidation.valid ? imovel : undefined,
        extraFields: dataValidation.valid ? extraFields : undefined,
        errors: dataValidation.errors
      };
      
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Erro desconhecido no teste']
      };
    }
  }

  // ✅ NOVA FUNÇÃO: Criar mapeamento de exemplo para testes
  static createSampleMapping(): FieldMapping {
    return {
      id: 'id',
      cidade: 'city',
      bairro: 'neighborhood',
      valor: 'price',
      tipoImovel: 'type',
      tipoNegocio: 'business',
      setorNegocio: 'sector',
      descricao: 'description',
      metragem: 'area',
      whatsapp: 'phone',
      imagens: 'images',
      creci: 'creci',
      enderecoDetalhado: 'address',
      codigoImovel: 'code',
      caracteristicas: {
        quartos: 'bedrooms',
        banheiros: 'bathrooms',
        vagas: 'parking'
      }
    };
  }
}

// ✅ NOVA FUNÇÃO: Factory para criar mapper com validação
export function createDataMapper(mapping: FieldMapping): DataMapper {
  const mapper = new DataMapper(mapping);
  const validation = mapper.validateMapping(mapping);
  
  if (!validation.valid) {
    throw new Error(`Mapeamento inválido: ${validation.errors.join(', ')}`);
  }
  
  return mapper;
}

// ✅ TIPOS AUXILIARES para melhor type safety
export type MappingResult = {
  success: boolean;
  mappedData?: Partial<Imovel>;
  extraFields?: Record<string, unknown>;
  errors: string[];
};

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};