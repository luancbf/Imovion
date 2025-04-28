import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { localizacao, tipo, area } = await req.json();

  const resultado = await prisma.imovel.findMany({
    where: {
      cidade: { contains: localizacao, mode: 'insensitive' },
      tipo,
      area: { gte: parseFloat(area) }
    }
  });

  return NextResponse.json(resultado);
}
