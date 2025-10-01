// src/app/api/admin/api-configs/[id]/route.ts - CRIAR ESTE ARQUIVO:

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params;
    
    const { data, error } = await supabase
      .from('api_configs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuração não encontrada' 
      }, { status: 404 });
    }

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
      mapping: data.mapping,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    const updateData = {
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
    };

    const { data, error } = await supabase
      .from('api_configs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Configuração atualizada com sucesso' 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params;
    
    const { data: existingConfig, error: checkError } = await supabase
      .from('api_configs')
      .select('id, name')
      .eq('id', id)
      .single();

    if (checkError || !existingConfig) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuração não encontrada' 
      }, { status: 404 });
    }

    const { error } = await supabase
      .from('api_configs')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      message: `Configuração "${existingConfig.name}" deletada com sucesso`
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }, { status: 500 });
  }
}