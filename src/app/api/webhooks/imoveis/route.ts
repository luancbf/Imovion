// src/app/api/webhooks/imoveis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { APIIntegrationService } from '@/services/apiIntegration';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validar assinatura do webhook
function validateWebhookSignature(signature: string, body: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  
  return signature === `sha256=${expectedSignature}`;
}

export async function POST(request: NextRequest) {
  console.log('📥 Webhook recebido');
  
  try {
    const signature = request.headers.get('x-webhook-signature');
    const apiKey = request.headers.get('x-api-key');
    const body = await request.text();
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key requerida' }, { status: 401 });
    }

    // Buscar configuração da API
    const { data: config, error: configError } = await supabase
      .from('api_configs')
      .select('*')
      .eq('auth_key', apiKey)
      .eq('is_active', true)
      .single();

    if (configError || !config) {
      return NextResponse.json({ error: 'API key inválida' }, { status: 401 });
    }

    // Validar assinatura se configurada
    if (config.webhook_secret && signature) {
      if (!validateWebhookSignature(signature, body, config.webhook_secret)) {
        return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
      }
    }

    const payload = JSON.parse(body);
    console.log(`📦 Dados recebidos de ${config.name}:`, payload);

    // ✅ CORRIGIDO: Remover mapper não utilizado e usar apenas integrationService
    const integrationService = new APIIntegrationService();
    
    // ✅ USAR: Delegar processamento para o service
    const result = await integrationService.processWebhookData(config, payload);

    console.log(`✅ Webhook processado: ${result.processed} salvos, ${result.errors} erros`);

    return NextResponse.json({
      success: true,
      processed: result.processed,
      errors: result.errors,
      errorMessages: result.errorMessages
    });

  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Erro interno'
    }, { status: 500 });
  }
}