import type { NextApiRequest, NextApiResponse } from "next";
import sharp from "sharp";
import { createBrowserClient } from "@supabase/ssr";
import formidable, { Fields, Files } from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const form = new formidable.IncomingForm();
  form.parse(
    req,
    async (
      err: Error | null,
      fields: Fields,
      files: Files
    ) => {
      if (err || !files.imagem) return res.status(400).json({ error: "Arquivo não enviado" });

      const file = Array.isArray(files.imagem) ? files.imagem[0] : files.imagem;
      const buffer = fs.readFileSync(file.filepath);

      // Comprime a imagem
      const compressed = await sharp(buffer)
        .resize(1280)
        .webp({ quality: 70 })
        .toBuffer();

      // Envie para o Supabase Storage
      const filePath = `imoveis/${Date.now()}_${file.originalFilename}`;
      const { error } = await supabase.storage.from("imagens").upload(filePath, compressed, {
        contentType: "image/webp",
      });

      if (error) return res.status(500).json({ error: error.message });

      const { data } = supabase.storage.from("imagens").getPublicUrl(filePath);
      return res.status(200).json({ url: data.publicUrl });
    }
  );
}