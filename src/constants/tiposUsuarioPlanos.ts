// Tipos de usuário disponíveis no sistema
export const TIPOS_USUARIO = {
  USUARIO: 'usuario',
  IMOBILIARIA: 'imobiliaria', 
  CORRETOR: 'corretor'
} as const;

export type TipoUsuario = typeof TIPOS_USUARIO[keyof typeof TIPOS_USUARIO];

// Planos de pagamento disponíveis
export const PLANOS = {
  COMUM: 'comum',
  PLANO_5: '5_imoveis',
  PLANO_30: '30_imoveis', 
  PLANO_50: '50_imoveis',
  PLANO_100: '100_imoveis'
} as const;

export type PlanoUsuario = typeof PLANOS[keyof typeof PLANOS];

// Configurações dos planos
export const CONFIGURACAO_PLANOS = {
  [PLANOS.COMUM]: {
    nome: 'Comum',
    descricao: 'Pagamento por imóvel',
    limite_imoveis: null, // sem limite, paga por imóvel
    preco_imovel: 50, // R$ 50 por imóvel
    preco_mensal: null,
    cor: 'bg-gray-100 text-gray-800',
    icone: '🏠'
  },
  [PLANOS.PLANO_5]: {
    nome: 'Plano 5 Imóveis',
    descricao: 'Até 5 imóveis por mês',
    limite_imoveis: 5,
    preco_imovel: null,
    preco_mensal: 150, // R$ 150/mês
    cor: 'bg-blue-100 text-blue-800',
    icone: '📍'
  },
  [PLANOS.PLANO_30]: {
    nome: 'Plano 30 Imóveis',
    descricao: 'Até 30 imóveis por mês',
    limite_imoveis: 30,
    preco_imovel: null,
    preco_mensal: 300, // R$ 300/mês
    cor: 'bg-green-100 text-green-800',
    icone: '🏢'
  },
  [PLANOS.PLANO_50]: {
    nome: 'Plano 50 Imóveis',
    descricao: 'Até 50 imóveis por mês',
    limite_imoveis: 50,
    preco_imovel: null,
    preco_mensal: 450, // R$ 450/mês
    cor: 'bg-orange-100 text-orange-800',
    icone: '🏘️'
  },
  [PLANOS.PLANO_100]: {
    nome: 'Plano 100 Imóveis',
    descricao: 'Até 100 imóveis por mês',
    limite_imoveis: 100,
    preco_imovel: null,
    preco_mensal: 700, // R$ 700/mês
    cor: 'bg-purple-100 text-purple-800',
    icone: '🏙️'
  }
} as const;

// Labels para tipos de usuário
export const LABELS_TIPO_USUARIO = {
  [TIPOS_USUARIO.USUARIO]: {
    nome: 'Usuário',
    descricao: 'Usuário comum',
    cor: 'bg-gray-100 text-gray-800',
    icone: '👤'
  },
  [TIPOS_USUARIO.IMOBILIARIA]: {
    nome: 'Imobiliária',
    descricao: 'Empresa imobiliária',
    cor: 'bg-blue-100 text-blue-800',
    icone: '🏢'
  },
  [TIPOS_USUARIO.CORRETOR]: {
    nome: 'Corretor',
    descricao: 'Corretor de imóveis',
    cor: 'bg-green-100 text-green-800',
    icone: '🤝'
  }
} as const;

// Função utilitária para obter configuração do plano
export function getConfiguracaoPlano(plano: PlanoUsuario) {
  return CONFIGURACAO_PLANOS[plano];
}

// Função utilitária para obter label do tipo de usuário
export function getLabelTipoUsuario(tipo: TipoUsuario) {
  return LABELS_TIPO_USUARIO[tipo];
}

// Função para verificar se usuário pode adicionar mais imóveis
export function podeAdicionarImovel(plano: PlanoUsuario, imoveisAtivos: number): boolean {
  const config = CONFIGURACAO_PLANOS[plano];
  
  if (config.limite_imoveis === null) {
    return true; // Plano comum sem limite
  }
  
  return imoveisAtivos < config.limite_imoveis;
}

// Função para calcular custo baseado no plano
export function calcularCusto(plano: PlanoUsuario, quantidade?: number): number {
  const config = CONFIGURACAO_PLANOS[plano];
  
  if (config.preco_mensal) {
    return config.preco_mensal;
  }
  
  if (config.preco_imovel && quantidade) {
    return config.preco_imovel * quantidade;
  }
  
  return 0;
}