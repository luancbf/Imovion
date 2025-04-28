import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { cidade, tipo, preco } = await req.json();
  
  const resultado = await prisma.imovel.findMany({
    where: {
      cidade: { contains: cidade, mode: 'insensitive' },
      tipo,
      preco: { lte: parseFloat(preco) }
    }
  });

  return NextResponse.json(resultado);
}
