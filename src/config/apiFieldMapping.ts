type TransformValue = string | number | boolean | null | undefined;
type TransformFunction = (value: TransformValue) => TransformValue;

export interface ApiFieldMapping {
  [apiName: string]: {
    fieldMap: Record<string, string>;
    transforms?: Record<string, TransformFunction>;
  };
}

export const API_FIELD_MAPPINGS: ApiFieldMapping = {
  // Exemplo: API da Imobiliária XYZ
  'imobiliaria_xyz': {
    fieldMap: {
      // Campo da API -> Campo interno
      'valorimovel': 'valor',
      'precoimovel': 'valor',
      'codigointerno': 'codigo_parceiro',
      'codigoref': 'codigoimovel',
      'descricaoimovel': 'descricao',
      'tipoimov': 'tipoimovel',
      'cidadeimovel': 'cidade',
      'bairrolocal': 'bairro',
      'enderecoimovel': 'enderecodetalhado',
      'areametros': 'metragem',
      'telefonecontato': 'whatsapp',
      'linkoriginal': 'url_original'
    },
    transforms: {
      'valor': (value: TransformValue): number => {
        if (typeof value === 'string') {
          return parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
        }
        if (typeof value === 'number') {
          return value;
        }
        return 0;
      },
      
      'metragem': (value: TransformValue): number => {
        if (typeof value === 'string') {
          return parseInt(value.replace(/\D/g, '')) || 0;
        }
        if (typeof value === 'number') {
          return Math.floor(value);
        }
        return 0;
      },
      
      'whatsapp': (value: TransformValue): string => {
        if (typeof value === 'string') {
          return value.replace(/\D/g, '');
        }
        if (typeof value === 'number') {
          return value.toString().replace(/\D/g, '');
        }
        return '';
      }
    }
  },

  // Exemplo: Outra API
  'api_parceiro_2': {
    fieldMap: {
      'price': 'valor',
      'property_code': 'codigo_parceiro',
      'description_text': 'descricao',
      'property_type': 'tipoimovel',
      'city_name': 'cidade',
      'neighborhood': 'bairro'
    },
    transforms: {
      'valor': (value: TransformValue): number => {
        if (typeof value === 'string') {
          // Remove caracteres não numéricos e converte
          const cleanValue = value.replace(/[^\d.]/g, '');
          return parseFloat(cleanValue) || 0;
        }
        if (typeof value === 'number') {
          return value;
        }
        return 0;
      },
      
      'codigo_parceiro': (value: TransformValue): string => {
        if (value === null || value === undefined) {
          return '';
        }
        return value.toString().trim();
      }
    }
  }
};

// ✅ Função utilitária para validar transformações
export function validateTransformValue(value: unknown): TransformValue {
  if (value === null || value === undefined) {
    return value;
  }
  
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  
  // Converte outros tipos para string como fallback
  return String(value);
}

// ✅ Funções de transformação reutilizáveis
export const commonTransforms = {
  // Limpar e formatar valores monetários
  currency: (value: TransformValue): number => {
    if (typeof value === 'string') {
      return parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
    }
    if (typeof value === 'number') {
      return value;
    }
    return 0;
  },

  // Limpar números inteiros
  integer: (value: TransformValue): number => {
    if (typeof value === 'string') {
      return parseInt(value.replace(/\D/g, '')) || 0;
    }
    if (typeof value === 'number') {
      return Math.floor(value);
    }
    return 0;
  },

  // Limpar telefones/WhatsApp
  phone: (value: TransformValue): string => {
    if (typeof value === 'string') {
      return value.replace(/\D/g, '');
    }
    if (typeof value === 'number') {
      return value.toString().replace(/\D/g, '');
    }
    return '';
  },

  // Limpar e formatar texto
  text: (value: TransformValue): string => {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value).trim();
  },

  // Converter para boolean
  boolean: (value: TransformValue): boolean => {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      return ['true', '1', 'yes', 'sim', 'on'].includes(value.toLowerCase());
    }
    if (typeof value === 'number') {
      return value > 0;
    }
    return false;
  }
};