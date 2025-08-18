import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  console.log("=== API UPLOAD WEBP OTIMIZADA ===");
  
  try {
    const formData = await request.formData();
    const file = formData.get("imagem") as File;
    const imovelId = (formData.get("imovelId") as string) || "temp";
    const pasta = (formData.get("pasta") as string) || "imoveis"; // Novo parâmetro
    
    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    console.log(`📁 Processando: ${file.name} para pasta: ${pasta}`);

    // Validar se é imagem
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: "Arquivo deve ser uma imagem" }, { status: 400 });
    }

    // Converter para Buffer
    const arrayBuffer = await file.arrayBuffer();
    const originalBuffer = Buffer.from(arrayBuffer);
    
    console.log(`📏 Tamanho original: ${(originalBuffer.length / 1024).toFixed(2)} KB`);

    // Processar com Sharp - APENAS WEBP
    const processedBuffer = await sharp(originalBuffer)
      .resize(1920, 1280, { 
        fit: 'inside',
        withoutEnlargement: true,
        background: { r: 255, g: 255, b: 255 }
      })
      .webp({ 
        quality: 88,
        effort: 6,
        smartSubsample: true
      })
      .toBuffer();

    console.log(`🗜️ Tamanho comprimido: ${(processedBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`📉 Redução: ${((1 - processedBuffer.length / originalBuffer.length) * 100).toFixed(1)}%`);

    // Nome do arquivo único
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(7);
    const fileName = `${timestamp}_${randomSuffix}.webp`;
    
    // Caminho baseado na pasta especificada
    let filePath: string;
    
    switch (pasta) {
      case "slider":
        filePath = `slider/${fileName}`;
        break;
      case "patrocinios":
        filePath = `patrocinios/${fileName}`;
        break;
      case "imoveis":
      default:
        filePath = `imoveis/${imovelId}/${fileName}`;
        break;
    }

    console.log(`💾 Salvando em: ${filePath}`);

    // Upload APENAS do WebP otimizado
    const { error } = await supabase.storage
      .from("imagens")
      .upload(filePath, processedBuffer, {
        contentType: "image/webp",
        cacheControl: "31536000", // 1 ano de cache
        upsert: false
      });

    if (error) {
      console.error("❌ Erro no Supabase:", error);
      return NextResponse.json({ 
        error: `Erro no upload: ${error.message}` 
      }, { status: 500 });
    }

    // Gerar URL pública
    const { data: urlData } = supabase.storage
      .from("imagens")
      .getPublicUrl(filePath);

    console.log(`✅ Upload concluído: ${urlData.publicUrl}`);

    return NextResponse.json({ 
      url: urlData.publicUrl,
      path: filePath,
      originalSize: originalBuffer.length,
      compressedSize: processedBuffer.length,
      compressionRatio: `${((1 - processedBuffer.length / originalBuffer.length) * 100).toFixed(1)}%`
    });

  } catch (error) {
    console.error("💥 ERRO GERAL:", error);
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Erro interno do servidor" 
    }, { status: 500 });
  }
}