import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// SEGURANÇA MÁXIMA: Service Role obrigatória
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY é obrigatória para API admin');
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Cliente normal para verificação de autenticação
const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // 1. VERIFICAR TOKEN JWT
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de autenticação obrigatório' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // 2. VALIDAR TOKEN COM SUPABASE
    const { data: tokenData, error: tokenError } = await supabaseClient.auth.getUser(token);
    
    if (tokenError || !tokenData.user) {
      return NextResponse.json({ error: 'Token de autenticação inválido' }, { status: 401 });
    }

    const user = tokenData.user;

    // 3. VERIFICAÇÃO RIGOROSA DE ADMIN
    const { data: adminProfile, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role, ativo')
      .eq('email', user.email)
      .eq('role', 'admin')
      .eq('ativo', true)
      .single();

    if (adminError || !adminProfile) {
      return NextResponse.json({ 
        error: 'Acesso negado. Apenas administradores ativos.' 
      }, { status: 403 });
    }

    // 4. CARREGAR USUÁRIOS (COM NOVOS CAMPOS DA MIGRATION)
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        email,
        role,
        nome,
        sobrenome,
        telefone,
        corretor,
        creci,
        is_corretor,
        total_imoveis,
        categoria,
        categoria_id,
        limite_imoveis,
        ativo,
        ultimo_acesso,
        created_at,
        updated_at,
        tipo_usuario,
        plano_ativo,
        status_plano,
        data_inicio_plano,
        data_fim_plano,
        data_ultimo_pagamento,
        valor_plano,
        metodo_pagamento,
        observacoes
      `)
      .eq('ativo', true)
      .neq('role', 'admin')  // Excluir administradores da listagem
      .order('created_at', { ascending: false });

    if (profilesError) {
      return NextResponse.json({ 
        error: 'Erro interno ao carregar usuários',
        code: 'DATABASE_ERROR'
      }, { status: 500 });
    }

    // 5. RESPOSTA OTIMIZADA (baseado apenas em categorias)
    return NextResponse.json({
      usuarios: profiles || [],
      total: profiles?.length || 0
    });

  } catch (error) {
    // Log apenas erros críticos (manter para monitoramento)
    console.error('ERRO CRÍTICO na API admin/usuarios:', error);
    return NextResponse.json({ 
      error: 'Erro interno crítico',
      code: 'CRITICAL_ERROR'
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Endpoint para operações futuras (criar usuário, etc.)
    return NextResponse.json({ message: 'POST endpoint em desenvolvimento' });
  } catch (error) {
    console.error('Erro no POST admin/usuarios:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // 1. VERIFICAR AUTENTICAÇÃO
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token necessário' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verificar o token JWT
    const { data: { user }, error: verifyError } = await supabaseClient.auth.getUser(token);
    
    if (verifyError || !user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // 2. VERIFICAR SE É ADMIN
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // 3. OBTER DADOS DA REQUISIÇÃO
    const body = await request.json();
    const { usuarioId, categoria, limite_imoveis } = body;

    if (!usuarioId || !categoria) {
      return NextResponse.json({ error: 'usuarioId e categoria são obrigatórios' }, { status: 400 });
    }

    // 4. ATUALIZAR USUÁRIO
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        categoria,
        limite_imoveis: limite_imoveis || 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', usuarioId)
      .select()
      .single();

    if (updateError) {
      console.error('Erro ao atualizar usuário:', updateError);
      return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Categoria alterada com sucesso',
      usuario: updatedUser
    });

  } catch (error) {
    console.error('Erro no PATCH admin/usuarios:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}