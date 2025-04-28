import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import prisma from '@/lib/prisma'; // ajuste esse import se seu prisma estiver em outro lugar

// Permitir parsing de multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

const readFile = promisify(fs.readFile);

export async function POST(req: NextRequest) {
  try {
    const form = formidable({
      multiples: false,
      uploadDir: path.join(process.cwd(), '/public/uploads'),
      keepExtensions: true,
    });

    // Garante que a pasta exista
    fs.mkdirSync(path.join(process.cwd(), '/public/uploads'), { recursive: true });

    const data: any = await new Promise((resolve, reject) => {
      form.parse(req as any, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    const { cidade, tipo, area, preco } = data.fields;
    const imagem = data.files.imagem?.[0] || data.files.imagem;

    const imageUrl = imagem ? `/uploads/${path.basename(imagem.filepath)}` : null;

    // Salvar no banco de dados
    await prisma.imovel.create({
      data: {
        cidade,
        tipo,
        area: parseFloat(area),
        preco: parseFloat(preco),
        imagemUrl: imageUrl,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao cadastrar imóvel:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar imóvel' }, { status: 500 });
  }
}
