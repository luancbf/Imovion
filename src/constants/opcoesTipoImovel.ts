export const opcoesTipoImovel: Record<string, string[]> = {
  "Residencial-Aluguel": [ "Casa", "Casa em Condomínio", "Apartamento", "Kitnet", "Flat", "Outros", ],
  "Residencial-Venda": [ "Casa", "Casa em Condomínio", "Apartamento", "Terreno", "Terreno em Condomínio", "Outros", ],
  "Comercial-Aluguel": [ "Sala", "Salão", "Casa", "Galpão", "Terreno", "Outros", ],
  "Comercial-Venda": [ "Sala", "Salão", "Casa", "Galpão", "Terreno", "Outros", ],
  "Rural-Aluguel": [ "Chácara", "Sítio", "Fazenda", "Terreno", "Barracão", "Outros", ],
  "Rural-Venda": [ "Chácara", "Sítio", "Fazenda", "Terreno", "Barracão", "Outros", ],
};

export const getTiposPorCategoriaFinalidade = (categoria: string, finalidade: string): string[] => {
  const categoriaCapitalizada = categoria.charAt(0).toUpperCase() + categoria.slice(1).toLowerCase();
  const finalidadeCapitalizada = finalidade.charAt(0).toUpperCase() + finalidade.slice(1).toLowerCase();
  const chave = `${categoriaCapitalizada}-${finalidadeCapitalizada}`;
  return opcoesTipoImovel[chave] || [];
};

export const getTiposPorCategoria = (categoria: string): string[] => {
  const tipos = new Set<string>();
  const categoriaCapitalizada = categoria.charAt(0).toUpperCase() + categoria.slice(1).toLowerCase();
  
  Object.keys(opcoesTipoImovel)
    .filter(chave => chave.startsWith(categoriaCapitalizada))
    .forEach(chave => {
      opcoesTipoImovel[chave].forEach(tipo => tipos.add(tipo));
    });
  return Array.from(tipos).sort();
};

export const existeCombinacao = (categoria: string, finalidade: string): boolean => {
  const categoriaCapitalizada = categoria.charAt(0).toUpperCase() + categoria.slice(1).toLowerCase();
  const finalidadeCapitalizada = finalidade.charAt(0).toUpperCase() + finalidade.slice(1).toLowerCase();
  const chave = `${categoriaCapitalizada}-${finalidadeCapitalizada}`;
  return chave in opcoesTipoImovel;
};

export const mapearUrlParaBanco = (categoria: string, tipoNegocio: string) => {
  return {
    setornegocio: categoria.charAt(0).toUpperCase() + categoria.slice(1).toLowerCase(),
    tiponegocio: tipoNegocio.charAt(0).toUpperCase() + tipoNegocio.slice(1).toLowerCase()
  };
};

export const gerarChaveFiltro = (setor: string, tipoNegocio: string): string => {
  return `${setor}-${tipoNegocio}`;
};