// src/app/api/admin/api-configs/[id]/route.ts - CRIAR ESTE ARQUIVO:

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('api_configs')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuração não encontrada' 
      }, { status: 404 });
    }

    // Converter snake_case para camelCase para o frontend
    const config = {
      id: data.id,
      name: data.name,
      baseUrl: data.base_url,
      authType: data.auth_type,
      authKey: data.auth_key,
      rateLimit: data.rate_limit,
      isActive: data.is_active,
      enableDeletion: data.enable_deletion,
      deletionStrategy: data.deletion_strategy,
      keepDaysBeforeDelete: data.keep_days_before_delete,
      webhookSecret: data.webhook_secret,
      mapping: data.mapping
    };

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('api_configs')
      .update({
        name: body.name,
        base_url: body.baseUrl,
        auth_type: body.authType,
        auth_key: body.authKey,
        rate_limit: body.rateLimit,
        is_active: body.isActive,
        enable_deletion: body.enableDeletion,
        deletion_strategy: body.deletionStrategy,
        keep_days_before_delete: body.keepDaysBeforeDelete,
        webhook_secret: body.webhookSecret,
        mapping: body.mapping,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('api_configs')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar configuração:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }, { status: 500 });
  }
}