import { Imovel } from '@/types/Imovel';
import { ExternalImovelData, FieldMapping } from '@/types/apiIntegration';

export class DataMapper {
  private mapping: FieldMapping;

  constructor(mapping: FieldMapping) {
    this.mapping = mapping;
  }

  private getNestedValue(obj: ExternalImovelData, path: string): unknown {
    return path.split('.').reduce((current: unknown, key: string): unknown => {
      if (current && typeof current === 'object' && current !== null) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  }

  private toString(value: unknown): string | undefined {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    return String(value);
  }

  private parseNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') return undefined;
    
    const parsed = Number(value);
    return isNaN(parsed) ? undefined : parsed;
  }

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

  private hasProperty<K extends keyof Imovel>(key: K): boolean {
    const knownProperties: (keyof Imovel)[] = [
      'id', 'cidade', 'bairro', 'valor', 'tipoimovel', 'tiponegocio', 
      'setornegocio', 'descricao', 'metragem', 'whatsapp', 'imagens', 'itens'
    ];
    return knownProperties.includes(key);
  }

  mapToInternal(externalData: ExternalImovelData): Partial<Imovel> {
    try {
      const mapped: Partial<Imovel> = {
        id: this.toString(this.getNestedValue(externalData, this.mapping.id)),
        cidade: this.toString(this.getNestedValue(externalData, this.mapping.cidade)),
        bairro: this.toString(this.getNestedValue(externalData, this.mapping.bairro)),
        valor: this.parseNumber(this.getNestedValue(externalData, this.mapping.valor)),
        tipoimovel: this.toString(this.getNestedValue(externalData, this.mapping.tipoImovel)),
        tiponegocio: this.toString(this.getNestedValue(externalData, this.mapping.tipoNegocio)),
        setornegocio: this.toString(this.getNestedValue(externalData, this.mapping.setorNegocio)),
        
        descricao: this.mapping.descricao 
          ? this.toString(this.getNestedValue(externalData, this.mapping.descricao)) 
          : undefined,
        metragem: this.mapping.metragem 
          ? this.parseNumber(this.getNestedValue(externalData, this.mapping.metragem)) 
          : undefined,
        whatsapp: this.mapping.whatsapp 
          ? this.toString(this.getNestedValue(externalData, this.mapping.whatsapp)) 
          : undefined,
        
        imagens: this.parseImages(
          this.mapping.imagens 
            ? this.getNestedValue(externalData, this.mapping.imagens) 
            : null
        ),
        
        itens: this.mapCaracteristicas(externalData),
      };

      const mappedWithMeta = this.addMetadataFields(mapped);

      return mappedWithMeta;
    } catch (error) {
      throw new Error(`Erro no mapeamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  private addMetadataFields(mapped: Partial<Imovel>): Partial<Imovel> {
    const result = { ...mapped };
    
    const sampleImovel = {} as Imovel;
    
    if ('dataCadastro' in sampleImovel) {
      (result as Record<string, unknown>)['dataCadastro'] = new Date();
    }
    
    if ('dataAtualizacao' in sampleImovel) {
      (result as Record<string, unknown>)['dataAtualizacao'] = new Date();
    }
    
    return result;
  }

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

  validateMappedData(data: Partial<Imovel>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
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

  validateMapping(mapping: FieldMapping): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
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

  mapExtraFields(externalData: ExternalImovelData): Record<string, unknown> {
    const extraFields: Record<string, unknown> = {};
    
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

  mapToInternalComplete(externalData: ExternalImovelData): {
    imovel: Partial<Imovel>;
    extraFields: Record<string, unknown>;
  } {
    const imovel = this.mapToInternal(externalData);
    const extraFields = this.mapExtraFields(externalData);
    
    return { imovel, extraFields };
  }

  testMapping(externalData: ExternalImovelData): { 
    success: boolean; 
    mappedData?: Partial<Imovel>; 
    extraFields?: Record<string, unknown>;
    errors: string[] 
  } {
    try {
      const mappingValidation = this.validateMapping(this.mapping);
      if (!mappingValidation.valid) {
        return {
          success: false,
          errors: mappingValidation.errors
        };
      }

      const { imovel, extraFields } = this.mapToInternalComplete(externalData);
      
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

export function createDataMapper(mapping: FieldMapping): DataMapper {
  const mapper = new DataMapper(mapping);
  const validation = mapper.validateMapping(mapping);
  
  if (!validation.valid) {
    throw new Error(`Mapeamento inválido: ${validation.errors.join(', ')}`);
  }
  
  return mapper;
}

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