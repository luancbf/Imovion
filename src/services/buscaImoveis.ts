import { createBrowserClient } from "@supabase/ssr";
import type { Imovel } from "@/types/Imovel";

// ✅ CONFIGURAÇÃO SUPABASE
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

// ✅ INTERFACE PARA DADOS DO BANCO
interface ImovelBanco {
  id: string;
  cidade: string;
  bairro: string;
  enderecodetalhado: string;
  valor: number;
  metragem: number;
  descricao: string;
  tipoimovel: string;
  tiponegocio: string;    // Aluguel/Venda
  setornegocio: string;   // Residencial/Comercial/Rural
  whatsapp: string;
  patrocinador: string;
  imagens: string[];
  datacadastro: string;
  itens: Record<string, unknown>;
  ativo: boolean;
  patrocinadorid: string;
}

// ✅ CONSTANTES
const FILTROS_QUANTITATIVOS = [
  "quartos", "suites", "banheiros", "garagens", 
  "salas", "hectares", "casasFuncionarios", "galpoes"
] as const;

const CAMPOS_BASICOS = [
  "cidade", "bairro", "tipoImovel"
] as const;

// ✅ UTILITÁRIOS
const capitalizarString = (str: string): string => 
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const isNumerico = (valor: string): boolean => 
  valor !== "" && !isNaN(Number(valor));

// ✅ MAPEAMENTO DE DADOS (SEM INVERSÃO)
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
});

// ✅ FUNÇÃO PRINCIPAL DE BUSCA
export async function buscarImoveis(
  filtros: Record<string, string>,
  setor: string,
  tipoNegocio: string
): Promise<Imovel[]> {
  
  try {
    // Construir query base
    let query = supabase
      .from("imoveis")
      .select("*")
      .eq("setornegocio", setor)
      .eq("tiponegocio", tipoNegocio)
      .eq("ativo", true);

    // Aplicar filtros básicos
    CAMPOS_BASICOS.forEach(campo => {
      const valor = filtros[campo];
      if (valor) {
        const campoDb = campo === "tipoImovel" ? "tipoimovel" : campo;
        query = query.eq(campoDb, valor);
      }
    });

    // Filtros numéricos especiais
    if (filtros.valor && isNumerico(filtros.valor)) {
      query = query.lte("valor", Number(filtros.valor));
    }
    
    if (filtros.metragem && isNumerico(filtros.metragem)) {
      query = query.gte("metragem", Number(filtros.metragem));
    }

    // Filtros quantitativos (JSONB)
    FILTROS_QUANTITATIVOS.forEach(chave => {
      const valor = filtros[chave];
      if (valor && isNumerico(valor) && Number(valor) > 0) {
        query = query.gte(`itens->>${chave}`, Number(valor));
      }
    });

    // Ordenação
    query = query.order('datacadastro', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("❌ [ERRO BUSCA]:", error.message);
      return [];
    }

    console.log('✅ [BUSCA] Encontrados:', data?.length || 0);
    return (data as ImovelBanco[])?.map(mapearImovelDoBanco) ?? [];

  } catch (error) {
    console.error("❌ [ERRO INESPERADO]:", error);
    return [];
  }
}

// ✅ BUSCAR POR CATEGORIA (OTIMIZADA)
export async function buscarImoveisPorCategoria(
  categoria: string, 
  tipoNegocio: string,
  filtros: Record<string, string> = {}
): Promise<Imovel[]> {
  
  const setorCapitalizado = capitalizarString(categoria);
  const tipoCapitalizado = capitalizarString(tipoNegocio);
  
  console.log('🔍 [CATEGORIA]:', {
    categoria: `${categoria} → ${setorCapitalizado}`,
    tipoNegocio: `${tipoNegocio} → ${tipoCapitalizado}`,
    filtros: Object.keys(filtros).filter(k => filtros[k]).length
  });

  return buscarImoveis(filtros, setorCapitalizado, tipoCapitalizado);
}

// ✅ BUSCAR IMÓVEIS EM DESTAQUE
export async function buscarImoveisDestaque(limite: number = 8): Promise<Imovel[]> {
  try {
    const { data, error } = await supabase
      .from("imoveis")
      .select("*")
      .eq("ativo", true)
      .order('datacadastro', { ascending: false })
      .limit(limite);

    if (error) {
      console.error("❌ [ERRO DESTAQUE]:", error.message);
      return [];
    }

    return (data as ImovelBanco[])?.map(mapearImovelDoBanco) ?? [];
    
  } catch (error) {
    console.error("❌ [ERRO INESPERADO DESTAQUE]:", error);
    return [];
  }
}

// ✅ BUSCAR IMÓVEL POR ID
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
      console.error("❌ [ERRO BUSCA ID]:", error.message);
      return null;
    }

    return data ? mapearImovelDoBanco(data as ImovelBanco) : null;
    
  } catch (error) {
    console.error("❌ [ERRO INESPERADO ID]:", error);
    return null;
  }
}

// ✅ BUSCAR CIDADES DISPONÍVEIS
export async function buscarCidadesDisponiveis(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("imoveis")
      .select("cidade")
      .eq("ativo", true)
      .not("cidade", "is", null);

    if (error) {
      console.error("❌ [ERRO CIDADES]:", error.message);
      return [];
    }

    const cidades = [...new Set(data?.map(item => item.cidade).filter(Boolean))] as string[];
    return cidades.sort();
    
  } catch (error) {
    console.error("❌ [ERRO INESPERADO CIDADES]:", error);
    return [];
  }
}

// ✅ BUSCAR BAIRROS POR CIDADE
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
      console.error("❌ [ERRO BAIRROS]:", error.message);
      return [];
    }

    const bairros = [...new Set(data?.map(item => item.bairro).filter(Boolean))] as string[];
    return bairros.sort();
    
  } catch (error) {
    console.error("❌ [ERRO INESPERADO BAIRROS]:", error);
    return [];
  }
}

// ✅ ESTATÍSTICAS RÁPIDAS
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
      return { total: 0, porSetor: {}, porTipo: {}, cidadesAtendidas: 0 };
    }

    const total = data.length;
    const porSetor: Record<string, number> = {};
    const porTipo: Record<string, number> = {};
    const cidades = new Set<string>();

    data.forEach(item => {
      // Contar por setor
      const setor = item.setornegocio || "Outros";
      porSetor[setor] = (porSetor[setor] || 0) + 1;

      // Contar por tipo
      const tipo = item.tiponegocio || "Outros";
      porTipo[tipo] = (porTipo[tipo] || 0) + 1;

      // Coletar cidades
      if (item.cidade) cidades.add(item.cidade);
    });

    return {
      total,
      porSetor,
      porTipo,
      cidadesAtendidas: cidades.size
    };
    
  } catch (error) {
    console.error("❌ [ERRO ESTATÍSTICAS]:", error);
    return { total: 0, porSetor: {}, porTipo: {}, cidadesAtendidas: 0 };
  }
}