import { NextRequest, NextResponse } from 'next/server';
import { APIIntegrationService } from '@/services/apiIntegration';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const integrationService = new APIIntegrationService();
    const results = await integrationService.syncAllAPIs();

    return NextResponse.json({
      success: true,
      results: results.map(r => ({
        apiConfigId: r.apiConfigId,
        status: r.status,
        totalProcessed: r.totalProcessed,
        totalErrors: r.totalErrors,
        totalDeleted: r.totalDeleted
      }))
    });

  } catch (error) {
    console.error('Erro no cron de sincronização:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}