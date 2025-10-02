import { createClient } from '@supabase/supabase-js';

// Verificar se estamos no servidor
if (typeof window !== 'undefined') {
  throw new Error('supabase-admin só pode ser usado no servidor (API routes ou server components)');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY não encontrada. Esta variável deve estar configurada no .env.local');
}

// Cliente admin com permissões elevadas para operações administrativas
// ATENÇÃO: Usar apenas em rotas de API ou páginas protegidas por autenticação admin
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});