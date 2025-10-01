import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  
  try {
    const formData = await request.formData();
    const file = formData.get("imagem") as File;
    const imovelId = (formData.get("imovelId") as string) || "temp";
    const pasta = (formData.get("pasta") as string) || "imoveis"; 
    
    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: "Arquivo deve ser uma imagem" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const originalBuffer = Buffer.from(arrayBuffer);
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

    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(7);
    const fileName = `${timestamp}_${randomSuffix}.webp`;
    
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

    const { error } = await supabase.storage
      .from("imagens")
      .upload(filePath, processedBuffer, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: false
      });

    if (error) {
      return NextResponse.json({ 
        error: `Erro no upload: ${error.message}` 
      }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from("imagens")
      .getPublicUrl(filePath);

    return NextResponse.json({ 
      url: urlData.publicUrl,
      path: filePath,
      originalSize: originalBuffer.length,
      compressedSize: processedBuffer.length,
      compressionRatio: `${((1 - processedBuffer.length / originalBuffer.length) * 100).toFixed(1)}%`
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Erro interno do servidor" 
    }, { status: 500 });
  }
}