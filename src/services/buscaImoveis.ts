import { createBrowserClient } from "@supabase/ssr";
import type { Imovel } from "@/types/Imovel";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

export async function buscarImoveis(
  filtros: Record<string, string>,
  setor: string,
  tipoNegocio: string
): Promise<Imovel[]> {
  let query = supabase
    .from("imoveis")
    .select("*")
    .eq("setorNegocio", setor)
    .eq("tipoNegocio", tipoNegocio);

  if (filtros.cidade) {
    query = query.eq("cidade", filtros.cidade);
  }
  if (filtros.bairro) {
    query = query.eq("bairro", filtros.bairro);
  }

  // Filtros quantitativos (exemplo: quartos, banheiros, metragem, etc)
  Object.entries(filtros).forEach(([chave, valor]) => {
    if (
      ["quartos", "suites", "banheiros", "garagens", "metragem", "salas", "hectares", "casasFuncionarios", "galpoes"].includes(chave) &&
      valor &&
      !isNaN(Number(valor))
    ) {
      query = query.gte(`itens->>${chave}`, Number(valor));
    }
  });

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar imóveis:", error.message);
    return [];
  }

  return (
    data?.map((data: Imovel) => ({
      id: data.id,
      cidade: data.cidade ?? "",
      bairro: data.bairro ?? "",
      enderecoDetalhado: data.enderecoDetalhado ?? "",
      valor: data.valor ?? 0,
      metragem: data.metragem ?? 0,
      descricao: data.descricao ?? "",
      tipoImovel: data.tipoImovel ?? "",
      tipoNegocio: data.tipoNegocio ?? "",
      setorNegocio: data.setorNegocio ?? "",
      whatsapp: data.whatsapp ?? "",
      patrocinador: data.patrocinador ?? "",
      imagens: data.imagens ?? [],
      dataCadastro: data.dataCadastro ?? "",
      itens: data.itens ?? {},
    })) ?? []
  );
}