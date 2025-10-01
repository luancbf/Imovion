// Centralized TypeScript types for the Imovion project
// This file exports all types from their respective modules

// Core entities
export * from './Imovel';
export * from './cadastrar-patrocinador';

// Forms and UI
export * from './formularios';

// API Integration
export * from './apiIntegration';

// User Management
export * from './usuarios';

// Importar tipos de planos e usuários
import { TipoUsuario, PlanoUsuario } from '@/constants/tiposUsuarioPlanos';

// Auth and User types
export interface User {
  id: string;
  email: string;
  nome: string;
  sobrenome: string;
  telefone?: string;
  role: 'admin' | 'user';
  tipo_usuario?: TipoUsuario;
  plano_ativo?: PlanoUsuario;
  is_corretor?: boolean;
  creci?: string;
  imoveis_ativos_count?: number;
  data_inicio_plano?: string;
  status_plano?: 'ativo' | 'suspenso' | 'cancelado';
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Common API Response types
export interface ApiResponse<T> {
  data: T;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Common Filter types
export interface BaseFilter {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Performance monitoring types
export interface PerformanceMetrics {
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  TTFB: number; // Time to First Byte
}

// Component props types
export interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

// Error types
export interface AppError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}