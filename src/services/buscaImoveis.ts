import { createBrowserClient } from "@supabase/ssr";
import type { Imovel } from "@/types/Imovel";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

interface ImovelBanco {
  id: string;
  cidade: string;
  bairro: string;
  enderecodetalhado: string;
  valor: number;
  metragem: number;
  descricao: string;
  tipoimovel: string;
  tiponegocio: string;
  setornegocio: string;
  whatsapp: string;
  patrocinador: string;
  imagens: string[];
  datacadastro: string;
  itens: Record<string, unknown>;
  ativo: boolean;
  patrocinadorid: string;
  codigoimovel?: string;
}

const FILTROS_QUANTITATIVOS = [
  "quartos", "suites", "banheiros", "garagens", 
  "salas", "hectares", "casasFuncionarios", "galpoes"
] as const;

const CAMPOS_BASICOS = [
  "cidade", "bairro", "tipoImovel"
] as const;

const isNumerico = (valor: string): boolean => 
  valor !== "" && !isNaN(Number(valor));

const mapearImovelDoBanco = (item: ImovelBanco): Imovel => ({
  id: item.id,
  cidade: item.cidade ?? "",
  bairro: item.bairro ?? "",
  enderecodetalhado: item.enderecodetalhado ?? "",
  valor: item.valor ?? 0,
  metragem: item.metragem ?? 0,
  descricao: item.descricao ?? "",
  tipoimovel: item.tipoimovel ?? "",
  tiponegocio: item.tiponegocio ?? "",
  setornegocio: item.setornegocio ?? "",
  whatsapp: item.whatsapp ?? "",
  patrocinador: item.patrocinador ?? "",
  imagens: item.imagens ?? [],
  datacadastro: item.datacadastro ?? "",
  itens: item.itens ?? {},
  ativo: item.ativo ?? true,
  patrocinadorid: item.patrocinadorid ?? "",
  codigoimovel: item.codigoimovel ?? undefined, // MAPEAMENTO ADICIONADO
});

export async function buscarImoveis(
  filtros: Record<string, string>,
  setor: string,
  tipoNegocio: string
): Promise<Imovel[]> {
  try {
    let query = supabase
      .from("imoveis")
      .select("*") // Já seleciona todos os campos, incluindo codigoimovel
      .eq("setornegocio", setor)
      .eq("tiponegocio", tipoNegocio)
      .eq("ativo", true);

    CAMPOS_BASICOS.forEach(campo => {
      const valor = filtros[campo];
      if (valor) {
        const campoDb = campo === "tipoImovel" ? "tipoimovel" : campo;
        query = query.eq(campoDb, valor.trim().toLowerCase());
      }
    });

    if (filtros.valorMin && isNumerico(filtros.valorMin)) {
      query = query.gte("valor", Number(filtros.valorMin));
    }
    if (filtros.valorMax && isNumerico(filtros.valorMax)) {
      query = query.lte("valor", Number(filtros.valorMax));
    }
    if (filtros.metragemMin && isNumerico(filtros.metragemMin)) {
      query = query.gte("metragem", Number(filtros.metragemMin));
    }
    if (filtros.metragemMax && isNumerico(filtros.metragemMax)) {
      query = query.lte("metragem", Number(filtros.metragemMax));
    }

    Object.entries(filtros).forEach(([chave, valor]) => {
      if (
        !['tipoImovel', 'cidade', 'bairro', 'valor', 'valorMin', 'valorMax', 'metragem', 'metragemMin', 'metragemMax'].includes(chave) &&
        valor !== ""
      ) {
        if ((FILTROS_QUANTITATIVOS as readonly string[]).includes(chave)) {
          query = query.gte(`itens->>${chave}`, Number(valor));
        } else {
          query = query.eq(`itens->>${chave}`, valor);
        }
      }
    });

    query = query.order('datacadastro', { ascending: false });

    const { data, error } = await query;
    
    if (error) {
      console.error("❌ [ERRO BUSCA]:", error.message);
      return [];
    }

    const imoveisProcessados = (data as ImovelBanco[])?.map(mapearImovelDoBanco) ?? [];
    
    // Debug para verificar se codigoimovel está sendo retornado
    console.log("🔍 [DEBUG] Primeiros imóveis com código:", 
      imoveisProcessados
        .filter(imovel => imovel.codigoimovel)
        .slice(0, 3)
        .map(imovel => ({ id: imovel.id, codigo: imovel.codigoimovel }))
    );

    return imoveisProcessados;
  } catch (error) {
    console.error("❌ [ERRO INESPERADO]:", error);
    return [];
  }
}

export async function buscarImoveisPorCategoria(
  categoria: string, 
  tipoNegocio: string
): Promise<Imovel[]> {
  
  try {
    let query = supabase
      .from("imoveis")
      .select("*") // Seleciona todos os campos, incluindo codigoimovel
      .eq("ativo", true);

    if (categoria && categoria.trim() !== "") {
      query = query.eq("setornegocio", categoria.trim());
    }
    
    if (tipoNegocio && tipoNegocio.trim() !== "") {
      query = query.eq("tiponegocio", tipoNegocio.trim());
    }

    query = query.order('datacadastro', { ascending: false });

    const { data, error } = await query;
    
    if (error) {
      console.error("❌ [ERRO BUSCA CATEGORIA]:", error.message);
      return [];
    }
    
    const imoveisProcessados = (data as ImovelBanco[])?.map(mapearImovelDoBanco) ?? [];
    
    // Debug específico para busca por categoria
    console.log("🔍 [DEBUG CATEGORIA] Total de imóveis:", imoveisProcessados.length);
    console.log("🔍 [DEBUG CATEGORIA] Imóveis com código:", 
      imoveisProcessados
        .filter(imovel => imovel.codigoimovel)
        .slice(0, 3)
        .map(imovel => ({ id: imovel.id, codigo: imovel.codigoimovel }))
    );
    console.log("🔍 [DEBUG CATEGORIA] Amostra de dados brutos:", 
      (data as ImovelBanco[])?.slice(0, 2).map(item => ({
        id: item.id,
        codigoimovel: item.codigoimovel,
        tipoimovel: item.tipoimovel
      }))
    );
    
    return imoveisProcessados;
    
  } catch (error) {
    console.error("❌ [ERRO INESPERADO CATEGORIA]:", error);
    return [];
  }
}

export async function buscarImoveisDestaque(limite: number = 8): Promise<Imovel[]> {
  try {
    const { data, error } = await supabase
      .from("imoveis")
      .select("*")
      .eq("ativo", true)
      .order('datacadastro', { ascending: false })
      .limit(limite);

    if (error) {
      console.error("❌ [ERRO BUSCA DESTAQUE]:", error.message);
      return [];
    }

    return (data as ImovelBanco[])?.map(mapearImovelDoBanco) ?? [];
    
  } catch (error) {
    console.error("❌ [ERRO INESPERADO DESTAQUE]:", error);
    return [];
  }
}

export async function buscarImovelPorId(id: string): Promise<Imovel | null> {
  if (!id) return null;

  try {
    const { data, error } = await supabase
      .from("imoveis")
      .select("*")
      .eq("id", id)
      .eq("ativo", true)
      .single();

    if (error) {
      console.error("❌ [ERRO BUSCA POR ID]:", error.message);
      return null;
    }

    return data ? mapearImovelDoBanco(data as ImovelBanco) : null;

  } catch (error) {
    console.error("❌ [ERRO INESPERADO BUSCA ID]:", error);
    return null;
  }
}

export async function buscarCidadesDisponiveis(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("imoveis")
      .select("cidade")
      .eq("ativo", true)
      .not("cidade", "is", null);

    if (error) {
      console.error("❌ [ERRO BUSCA CIDADES]:", error.message);
      return [];
    }

    const cidades = [...new Set(data?.map(item => item.cidade).filter(Boolean))] as string[];
    return cidades.sort();

  } catch (error) {
    console.error("❌ [ERRO INESPERADO CIDADES]:", error);
    return [];
  }
}

export async function buscarBairrosPorCidade(cidade: string): Promise<string[]> {
  if (!cidade) return [];

  try {
    const { data, error } = await supabase
      .from("imoveis")
      .select("bairro")
      .eq("cidade", cidade)
      .eq("ativo", true)
      .not("bairro", "is", null);

    if (error) {
      console.error("❌ [ERRO BUSCA BAIRROS]:", error.message);
      return [];
    }

    const bairros = [...new Set(data?.map(item => item.bairro).filter(Boolean))] as string[];
    return bairros.sort();

  } catch (error) {
    console.error("❌ [ERRO INESPERADO BAIRROS]:", error);
    return [];
  }
}

export async function buscarEstatisticas(): Promise<{
  total: number;
  porSetor: Record<string, number>;
  porTipo: Record<string, number>;
  cidadesAtendidas: number;
}> {
  try {
    const { data, error } = await supabase
      .from("imoveis")
      .select("setornegocio, tiponegocio, cidade")
      .eq("ativo", true);

    if (error || !data) {
      console.error("❌ [ERRO BUSCA ESTATÍSTICAS]:", error?.message);
      return { total: 0, porSetor: {}, porTipo: {}, cidadesAtendidas: 0 };
    }

    const total = data.length;
    const porSetor: Record<string, number> = {};
    const porTipo: Record<string, number> = {};
    const cidades = new Set<string>();

    data.forEach(item => {
      const setor = item.setornegocio || "Outros";
      porSetor[setor] = (porSetor[setor] || 0) + 1;

      const tipo = item.tiponegocio || "Outros";
      porTipo[tipo] = (porTipo[tipo] || 0) + 1;

      if (item.cidade) cidades.add(item.cidade);
    });

    return {
      total,
      porSetor,
      porTipo,
      cidadesAtendidas: cidades.size
    };

  } catch (error) {
    console.error("❌ [ERRO INESPERADO ESTATÍSTICAS]:", error);
    return { total: 0, porSetor: {}, porTipo: {}, cidadesAtendidas: 0 };
  }
}