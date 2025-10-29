import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { TipoUsuario, PlanoUsuario } from '@/constants/tiposUsuarioPlanos';

// SEGURANÇA: Service Role obrigatória para admin
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

// Interface completa para dados de atualização do usuário (APÓS MIGRATION)
interface DadosAtualizacao {
  // Campos existentes
  categoria?: string;
  limite_imoveis?: number | null;
  is_corretor?: boolean;
  updated_at: string;
  
  // Novos campos da migration
  tipo_usuario?: 'proprietario' | 'imobiliaria' | 'corretor' | 'admin';
  plano_ativo?: 'comum' | '5_imoveis' | '30_imoveis' | '50_imoveis' | '100_imoveis';
  status_plano?: 'ativo' | 'inativo' | 'suspenso' | 'cancelado';
  data_inicio_plano?: string;
  data_fim_plano?: string | null;
  data_ultimo_pagamento?: string | null;
  valor_plano?: number | null;
  metodo_pagamento?: string | null;
  observacoes?: string | null;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Aguardar os parâmetros no Next.js 15
    const { id: userId } = await params;
    const body = await request.json();
    const { tipo_usuario, plano_ativo } = body;

    console.log('Dados recebidos:', { userId, tipo_usuario, plano_ativo, body });

    if (!tipo_usuario || !plano_ativo) {
      console.error('Dados obrigatórios ausentes:', { tipo_usuario, plano_ativo });
      return NextResponse.json(
        { error: 'Tipo de usuário e plano são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar se os valores são válidos
    const tiposValidos = ['proprietario', 'imobiliaria', 'corretor'] as TipoUsuario[];
    const planosValidos = ['comum', '5_imoveis', '30_imoveis', '50_imoveis', '100_imoveis'] as PlanoUsuario[];

    if (!tiposValidos.includes(tipo_usuario)) {
      console.error('Tipo de usuário inválido:', tipo_usuario);
      return NextResponse.json(
        { error: 'Tipo de usuário inválido' },
        { status: 400 }
      );
    }

    if (!planosValidos.includes(plano_ativo)) {
      console.error('Plano inválido:', plano_ativo);
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;
    console.log('Cliente Supabase Admin criado com sucesso');

    // Buscar usuário atual
    console.log('Buscando usuário com ID:', userId);
    const { data: usuarioAtual, error: errorBusca } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (errorBusca) {
      console.error('Erro ao buscar usuário:', errorBusca);
      return NextResponse.json(
        { error: 'Usuário não encontrado', details: errorBusca.message },
        { status: 404 }
      );
    }

    console.log('Usuário encontrado:', usuarioAtual?.email);

    // VERSÃO COMPLETA: Usar todos os campos após migration aplicada
    const dadosExtras: DadosAtualizacao = {
      updated_at: new Date().toISOString(),
      tipo_usuario,
      plano_ativo,
      status_plano: 'ativo',
      data_inicio_plano: new Date().toISOString(),
      limite_imoveis: null,
      valor_plano: null,
      metodo_pagamento: null,
      observacoes: null
    };

    // Definir limite de imóveis e valor baseado no plano
    switch (plano_ativo) {
      case 'comum':
        dadosExtras.limite_imoveis = null; // Sem limite, paga por imóvel
        dadosExtras.valor_plano = null;
        break;
      case '5_imoveis':
        dadosExtras.limite_imoveis = 5;
        dadosExtras.valor_plano = 50.00;
        break;
      case '30_imoveis':
        dadosExtras.limite_imoveis = 30;
        dadosExtras.valor_plano = 200.00;
        break;
      case '50_imoveis':
        dadosExtras.limite_imoveis = 50;
        dadosExtras.valor_plano = 300.00;
        break;
      case '100_imoveis':
        dadosExtras.limite_imoveis = 100;
        dadosExtras.valor_plano = 500.00;
        break;
    }

    // Atualizar categoria e flags baseado no tipo de usuário
    switch (tipo_usuario) {
      case 'proprietario':
        dadosExtras.categoria = 'proprietario';
        dadosExtras.is_corretor = false;
        break;
      case 'imobiliaria':
        dadosExtras.categoria = 'imobiliaria';
        dadosExtras.is_corretor = false;
        break;
      case 'corretor':
        dadosExtras.categoria = 'corretor';
        dadosExtras.is_corretor = true;
        break;
      case 'admin':
        dadosExtras.categoria = 'admin';
        dadosExtras.is_corretor = false;
        break;
    }

    console.log('Dados para atualização (versão completa):', dadosExtras);

    // Atualizar usuário no banco
    console.log('Dados para atualização:', dadosExtras);
    const { data, error } = await supabase
      .from('profiles')
      .update(dadosExtras)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar usuário - Detalhes:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json(
        { 
          error: 'Erro ao atualizar configurações do usuário',
          details: error.message,
          hint: error.hint
        },
        { status: 500 }
      );
    }

    console.log('Usuário atualizado com sucesso:', data?.email);

    // Log de auditoria (não crítico)
    try {
      await supabase
        .from('log_admin_acoes')
        .insert({
          acao: 'CONFIGURAR_USUARIO',
          usuario_id: userId,
          dados_anteriores: {
            tipo_usuario: usuarioAtual.tipo_usuario,
            plano_ativo: usuarioAtual.plano_ativo,
            categoria: usuarioAtual.categoria,
            limite_imoveis: usuarioAtual.limite_imoveis
          },
          dados_novos: dadosExtras,
          timestamp: new Date().toISOString()
        });
      console.log('Log de auditoria registrado com sucesso');
    } catch (logError) {
      console.warn('Erro ao registrar log de auditoria (não crítico):', logError);
      // Não retorna erro, pois o log é opcional
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Configurações do usuário atualizadas com sucesso'
    });

  } catch (error) {
    console.error('Erro na API de configuração de usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}