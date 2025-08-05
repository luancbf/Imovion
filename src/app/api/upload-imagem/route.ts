import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  console.log("=== API UPLOAD CHAMADA (App Router) ===");
  
  try {
    console.log("1. Iniciando upload...");
    
    const formData = await request.formData();
    console.log("2. FormData parseado");
    
    const file = formData.get("imagem") as File;
    const pasta = (formData.get("pasta") as string) || "imoveis";

    if (!file) {
      console.log("3. Nenhum arquivo encontrado");
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    console.log("4. Arquivo encontrado:", file.name, "Tamanho:", file.size, "Pasta:", pasta);

    // Converter File para Buffer
    console.log("5. Convertendo File para Buffer...");
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log("6. Buffer criado, tamanho:", buffer.length);

    // Comprimir com Sharp
    console.log("7. Comprimindo imagem...");
    const compressedBuffer = await sharp(buffer)
      .resize(1280, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ 
        quality: 85,
        effort: 4
      })
      .toBuffer();

    console.log("8. Imagem comprimida, novo tamanho:", compressedBuffer.length);

    // Nome único do arquivo
    const timestamp = Date.now();
    const fileName = `${timestamp}.webp`;
    const filePath = `${pasta}/${fileName}`;

    console.log("9. Fazendo upload para Supabase:", filePath);

    // Upload para Supabase
    const { data, error } = await supabase.storage
      .from("imagens")
      .upload(filePath, compressedBuffer, {
        contentType: "image/webp",
        cacheControl: "3600"
      });

    if (error) {
      console.log("10. Erro no Supabase:", error);
      return NextResponse.json({ error: `Erro no upload: ${error.message}` }, { status: 500 });
    }

    console.log("11. Upload realizado com sucesso:", data);

    // Gerar URL pública
    const { data: urlData } = supabase.storage
      .from("imagens")
      .getPublicUrl(filePath);

    console.log("12. URL gerada:", urlData.publicUrl);
    console.log("13. Retornando sucesso");

    return NextResponse.json({ 
      url: urlData.publicUrl,
      path: filePath 
    });

  } catch (error) {
    console.log("ERRO GERAL NA API:", error);
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Erro interno do servidor" 
    }, { status: 500 });
  }
}