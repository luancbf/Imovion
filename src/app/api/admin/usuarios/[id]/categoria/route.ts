import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { CategoriaUsuario, LIMITES_POR_CATEGORIA } from '@/types/usuarios';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const body = await request.json();
    const { categoria } = body as { categoria: CategoriaUsuario };

    // Validar categoria
    if (!categoria || !['proprietario', 'corretor', 'imobiliaria'].includes(categoria)) {
      return NextResponse.json(
        { error: 'Categoria inválida' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Validar se o usuário existe
    const { data: usuarioExiste, error: errorUsuario } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (errorUsuario || !usuarioExiste) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar categoria e limite de imóveis
    const limite_imoveis = LIMITES_POR_CATEGORIA[categoria];
    
    const { data, error } = await supabase
      .from('profiles')
      .update({
        categoria,
        limite_imoveis,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select();

    if (error) {
      console.error('Erro ao atualizar categoria:', error);
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Categoria atualizada com sucesso'
    });

  } catch (error) {
    console.error('Erro na API de categoria:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('id, categoria, limite_imoveis, nome, sobrenome, email')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Erro ao buscar categoria do usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}