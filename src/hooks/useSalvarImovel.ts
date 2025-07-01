import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { Imovel } from "@/types/Imovel";

interface UseSalvarImovelResult {
  salvarImovel: (
    dados: Partial<Imovel> & { imagens: File[] }
  ) => Promise<{ sucesso: boolean; erro?: string }>;
  carregando: boolean;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

export function useSalvarImovel(): UseSalvarImovelResult {
  const [carregando, setCarregando] = useState(false);

  async function uploadImagens(imagens: File[], imovelId: string): Promise<string[]> {
    const urls: string[] = [];
    for (const imagem of imagens) {
      if (!imagem.type.startsWith("image/")) continue;
      if (imagem.size > 5 * 1024 * 1024)
        throw new Error(`A imagem ${imagem.name} excede o limite de 5MB`);
      const filePath = `imoveis/${imovelId}/${Date.now()}_${imagem.name}`;
      const { error: uploadError } = await supabase.storage
        .from("imagens")
        .upload(filePath, imagem);
      if (uploadError) throw new Error(uploadError.message);
      const { data: urlData } = supabase.storage.from("imagens").getPublicUrl(filePath);
      urls.push(urlData.publicUrl);
    }
    return urls;
  }

  async function salvarImovel(
    dados: Partial<Imovel> & { imagens: File[] }
  ): Promise<{ sucesso: boolean; erro?: string }> {
    setCarregando(true);
    try {
      const { imagens, ...resto } = dados;
      const { data, error } = await supabase
        .from("imoveis")
        .insert([{ ...resto, imagens: [], dataCadastro: new Date().toISOString() }])
        .select()
        .single();

      if (error || !data?.id) {
        return { sucesso: false, erro: error?.message || "Erro ao criar imóvel." };
      }

      let urlsImagens: string[] = [];
      if (imagens && imagens.length > 0) {
        urlsImagens = await uploadImagens(imagens, data.id);
        await supabase.from("imoveis").update({ imagens: urlsImagens }).eq("id", data.id);
      }

      return { sucesso: true };
    } catch (err) {
      if (err instanceof Error) {
        return { sucesso: false, erro: err.message };
      }
      return { sucesso: false, erro: "Erro desconhecido." };
    } finally {
      setCarregando(false);
    }
  }

  return { salvarImovel, carregando };
}

export default useSalvarImovel;