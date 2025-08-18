import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('api_configs')
      .select('*')
      .order('name');

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('api_configs')
      .insert([{
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
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }, { status: 500 });
  }
}