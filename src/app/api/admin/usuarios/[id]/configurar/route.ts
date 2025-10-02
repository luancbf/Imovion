import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { TipoUsuario, PlanoUsuario } from '@/constants/tiposUsuarioPlanos';

interface DadosAtualizacao {
  tipo_usuario: TipoUsuario;
  plano_ativo: PlanoUsuario;
  data_inicio_plano: string;
  status_plano: string;
  updated_at: string;
  limite_imoveis: number | null;
  categoria?: string;
  is_corretor?: boolean;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { tipo_usuario, plano_ativo } = await request.json();

    if (!tipo_usuario || !plano_ativo) {
      return NextResponse.json(
        { error: 'Tipo de usuário e plano são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar se os valores são válidos
    const tiposValidos = ['usuario', 'imobiliaria', 'corretor'] as TipoUsuario[];
    const planosValidos = ['comum', '5_imoveis', '30_imoveis', '50_imoveis', '100_imoveis'] as PlanoUsuario[];

    if (!tiposValidos.includes(tipo_usuario)) {
      return NextResponse.json(
        { error: 'Tipo de usuário inválido' },
        { status: 400 }
      );
    }

    if (!planosValidos.includes(plano_ativo)) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Buscar usuário atual
    const { data: usuarioAtual, error: errorBusca } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', params.id)
      .single();

    if (errorBusca) {
      console.error('Erro ao buscar usuário:', errorBusca);
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Definir dados extras baseado no plano
    const dadosExtras: DadosAtualizacao = {
      tipo_usuario,
      plano_ativo,
      data_inicio_plano: new Date().toISOString(),
      status_plano: 'ativo',
      updated_at: new Date().toISOString(),
      limite_imoveis: null
    };

    // Definir limite de imóveis baseado no plano
    switch (plano_ativo) {
      case 'comum':
        dadosExtras.limite_imoveis = null; // Sem limite, paga por imóvel
        break;
      case '5_imoveis':
        dadosExtras.limite_imoveis = 5;
        break;
      case '30_imoveis':
        dadosExtras.limite_imoveis = 30;
        break;
      case '50_imoveis':
        dadosExtras.limite_imoveis = 50;
        break;
      case '100_imoveis':
        dadosExtras.limite_imoveis = 100;
        break;
    }

    // Atualizar categoria baseado no tipo de usuário
    let categoria;
    switch (tipo_usuario) {
      case 'usuario':
        categoria = 'proprietario';
        break;
      case 'imobiliaria':
        categoria = 'imobiliaria';
        break;
      case 'corretor':
        categoria = 'corretor';
        dadosExtras.is_corretor = true;
        break;
    }

    if (categoria) {
      dadosExtras.categoria = categoria;
    }

    // Atualizar usuário no banco
    const { data, error } = await supabase
      .from('usuarios')
      .update(dadosExtras)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar usuário:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar configurações do usuário' },
        { status: 500 }
      );
    }

    // Log de auditoria
    await supabase
      .from('log_admin_acoes')
      .insert({
        acao: 'CONFIGURAR_USUARIO',
        usuario_id: params.id,
        dados_anteriores: {
          tipo_usuario: usuarioAtual.tipo_usuario,
          plano_ativo: usuarioAtual.plano_ativo,
          categoria: usuarioAtual.categoria,
          limite_imoveis: usuarioAtual.limite_imoveis
        },
        dados_novos: dadosExtras,
        timestamp: new Date().toISOString()
      });

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