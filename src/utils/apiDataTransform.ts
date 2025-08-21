import { API_FIELD_MAPPINGS, validateTransformValue } from '@/config/apiFieldMapping';
import { Imovel } from '@/types/Imovel';

export function transformApiDataToImovel(
  apiData: Record<string, unknown>, // ✅ CORRIGIDO: unknown ao invés de any
  apiName: string
): Partial<Imovel> {
  const mapping = API_FIELD_MAPPINGS[apiName];
  
  if (!mapping) {
    console.warn(`Mapeamento não encontrado para API: ${apiName}`);
    return apiData as Partial<Imovel>; // ✅ CORRIGIDO: cast específico
  }

  const transformedData: Partial<Imovel> = {
    // Campos padrão de API
    fonte_api: apiName,
    external_id: getExternalId(apiData),
    api_source_name: getApiDisplayName(apiName),
    data_sincronizacao: new Date(),
    status_sync: 'active'
  };

  // Mapear campos usando a configuração
  Object.entries(mapping.fieldMap).forEach(([apiField, internalField]) => {
    if (apiData[apiField] !== undefined) {
      // ✅ CORRIGIDO: Validar e converter o valor para TransformValue
      let value = validateTransformValue(apiData[apiField]);
      
      // Aplicar transformação se existir
      if (mapping.transforms?.[internalField]) {
        try {
          // ✅ CORRIGIDO: value agora é compatível com TransformValue
          const transformedValue = mapping.transforms[internalField](value);
          value = transformedValue;
        } catch (error) {
          console.warn(`Erro ao transformar campo ${internalField}:`, error);
          // Em caso de erro, manter o valor original
        }
      }
      
      // ✅ CORRIGIDO: Atribuir apenas se o valor não for undefined
      if (value !== undefined) {
        (transformedData as Record<string, unknown>)[internalField] = value;
      }
    }
  });

  return transformedData;
}

// ✅ Função auxiliar para extrair ID externo
function getExternalId(apiData: Record<string, unknown>): string {
  // Tentar diferentes campos comuns para ID
  const possibleIdFields = ['id', 'external_id', 'codigo', 'ref', 'reference'];
  
  for (const field of possibleIdFields) {
    const value = apiData[field];
    if (value !== undefined && value !== null) {
      return String(value);
    }
  }
  
  // Fallback: usar timestamp + hash dos dados
  const dataString = JSON.stringify(apiData);
  const hash = dataString.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return `auto_${Date.now()}_${Math.abs(hash)}`;
}

function getApiDisplayName(apiName: string): string {
  const displayNames: Record<string, string> = {
    'imobiliaria_xyz': 'Imobiliária XYZ',
    'api_parceiro_2': 'Parceiro Imóveis',
    'vivareal': 'VivaReal',
    'zapimoveis': 'ZAP Imóveis',
    'olx': 'OLX Imóveis',
    // Adicione mais conforme necessário
  };
  
  return displayNames[apiName] || apiName.charAt(0).toUpperCase() + apiName.slice(1);
}

// ✅ Função utilitária para validar e sanitizar dados da API
export function sanitizeApiData(data: unknown): Record<string, unknown> {
  if (data === null || data === undefined) {
    return {};
  }
  
  if (typeof data === 'object' && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }
  
  console.warn('Dados da API não são um objeto válido:', typeof data);
  return {};
}

// ✅ Função para validar se os dados transformados são válidos
export function validateTransformedData(data: Partial<Imovel>): boolean {
  // Campos obrigatórios mínimos
  const requiredFields = ['fonte_api', 'external_id'];
  
  for (const field of requiredFields) {
    if (!data[field as keyof Imovel]) {
      console.warn(`Campo obrigatório ausente: ${field}`);
      return false;
    }
  }
  
  return true;
}

// ✅ Função para transformar com validação completa
export function transformApiDataToImovelSafe(
  apiData: unknown,
  apiName: string
): { success: boolean; data?: Partial<Imovel>; error?: string } {
  try {
    // 1. Sanitizar dados de entrada
    const sanitizedData = sanitizeApiData(apiData);
    
    // 2. Transformar dados
    const transformedData = transformApiDataToImovel(sanitizedData, apiName);
    
    // 3. Validar dados transformados
    if (!validateTransformedData(transformedData)) {
      return {
        success: false,
        error: 'Dados transformados não passaram na validação'
      };
    }
    
    return {
      success: true,
      data: transformedData
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return {
      success: false,
      error: `Erro na transformação: ${errorMessage}`
    };
  }
}

// ✅ Tipos para uso em outras partes do sistema
export interface ApiTransformResult {
  success: boolean;
  data?: Partial<Imovel>;
  error?: string;
}

export interface ApiDataInput {
  [key: string]: unknown;
}

// ✅ Função helper para lidar com valores de transformação de forma segura
export function safeTransformValue<T>(
  value: unknown,
  transformer: (val: unknown) => T,
  fallback: T
): T {
  try {
    return transformer(value);
  } catch (error) {
    console.warn('Erro na transformação, usando fallback:', error);
    return fallback;
  }
}