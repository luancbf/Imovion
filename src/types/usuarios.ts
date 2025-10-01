// Tipos para gerenciamento de usuários
import { TipoUsuario, PlanoUsuario } from '@/constants/tiposUsuarioPlanos';

export type CategoriaUsuario = 'usuario_comum' | 'corretor' | 'imobiliaria' | 'proprietario_com_plano';

export interface Usuario {
  id: string;
  email: string;
  nome: string;
  sobrenome: string;
  telefone?: string;
  role: 'admin' | 'user';
  categoria: CategoriaUsuario;
  tipo_usuario: TipoUsuario; // Novo campo
  plano_ativo: PlanoUsuario; // Novo campo
  creci?: string;
  limite_imoveis: number;
  imoveis_ativos_count?: number; // Para controle de limite
  data_inicio_plano?: string; // Quando iniciou o plano atual
  data_fim_plano?: string; // Quando expira o plano (se aplicável)
  status_plano?: 'ativo' | 'suspenso' | 'cancelado'; // Status do plano
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  plano_id?: string;
  total_imoveis?: number;
}

export interface Plano {
  id: string;
  nome: string;
  tipo: 'mensal' | 'por_anuncio';
  valor: number;
  limite_imoveis?: number | null; // null = ilimitado
  descricao: string;
  ativo: boolean;
  created_at: string;
}

export interface UsuarioPlano {
  id: string;
  usuario_id: string;
  plano_id: string;
  data_inicio: string;
  data_fim?: string;
  status: 'ativo' | 'cancelado' | 'suspenso';
  valor_pago: number;
  created_at: string;
  plano: Plano;
}

export interface UsuarioComEstatisticas extends Usuario {
  total_imoveis: number;
  imoveis_ativos: number;
  ultimo_acesso?: string;
  plano_atual?: UsuarioPlano;
  receita_total: number;
}

export interface EstatisticasUsuarios {
  total: number;
  usuarios_comuns: number;
  corretores: number;
  imobiliarias: number;
  proprietarios_com_plano: number;
  novos_este_mes: number;
  confirmados: number;
  com_creci: number;
  sem_creci: number;
  planos_ativos: number;
  receita_mensal: number;
  // Estatísticas por plano
  plano_comum: number;
  plano_5_imoveis: number;
  plano_30_imoveis: number;
  plano_50_imoveis: number;
  plano_100_imoveis: number;
}

export interface FiltrosUsuarios {
  busca: string;
  categoria: 'todos' | 'usuario_comum' | 'corretor' | 'imobiliaria' | 'proprietario_com_plano';
  creci: 'todos' | 'com' | 'sem';
  plano: 'todos' | 'mensal' | 'por_anuncio' | 'sem_plano';
  status: 'todos' | 'ativo' | 'inativo';
  ordenar_por: 'nome' | 'data_cadastro' | 'ultimo_acesso' | 'total_imoveis' | 'receita';
  ordem: 'asc' | 'desc';
}

// Configuração de limites por categoria
export const LIMITES_POR_CATEGORIA = {
  usuario_comum: 1,
  corretor: 50,
  imobiliaria: 150,
  proprietario_com_plano: 25
} as const;