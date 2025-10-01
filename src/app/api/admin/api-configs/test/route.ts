import { NextRequest, NextResponse } from 'next/server';
import { APIIntegrationService } from '@/services/apiIntegration';
import { DataMapper } from '@/services/dataMapper';

export async function POST(request: NextRequest) {
  try {
    const config = await request.json();
    const integrationService = new APIIntegrationService();
    const testData = await integrationService.fetchFromExternalAPI(config);
    
    if (!testData || testData.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'API retornou dados vazios'
      });
    }

    const mapper = new DataMapper(config.mapping);
    const testResult = mapper.testMapping(testData[0]);

    return NextResponse.json({
      success: testResult.success,
      mappedData: testResult.mappedData,
      extraFields: testResult.extraFields,
      errors: testResult.errors,
      sampleData: testData[0] 
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}