// src/app/api/webhooks/imoveis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { APIIntegrationService } from '@/services/apiIntegration';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase'

function validateWebhookSignature(signature: string, body: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  
  return signature === `sha256=${expectedSignature}`;
}

export async function POST(request: NextRequest) {
  
  try {
    const signature = request.headers.get('x-webhook-signature');
    const apiKey = request.headers.get('x-api-key');
    const body = await request.text();
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key requerida' }, { status: 401 });
    }

    const { data: config, error: configError } = await supabase
      .from('api_configs')
      .select('*')
      .eq('auth_key', apiKey)
      .eq('is_active', true)
      .single();

    if (configError || !config) {
      return NextResponse.json({ error: 'API key inválida' }, { status: 401 });
    }

    if (config.webhook_secret && signature) {
      if (!validateWebhookSignature(signature, body, config.webhook_secret)) {
        return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
      }
    }

    const payload = JSON.parse(body);
    const integrationService = new APIIntegrationService();
    const result = await integrationService.processWebhookData(config, payload);

    return NextResponse.json({
      success: true,
      processed: result.processed,
      errors: result.errors,
      errorMessages: result.errorMessages
    });

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Erro interno'
    }, { status: 500 });
  }
}