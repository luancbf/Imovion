import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';  // Verifique se o caminho está correto

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { cidade, tipo, area, preco } = req.body;

    try {
      const novoImovel = await prisma.imovel.create({
        data: {
          cidade,
          tipo,
          area,
          preco,
        },
      });

      res.status(201).json(novoImovel);  // Retorna o imóvel cadastrado
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao cadastrar imóvel' });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
}
