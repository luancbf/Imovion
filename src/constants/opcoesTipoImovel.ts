export const opcoesTipoImovel: Record<string, string[]> = {
  "Residencial-Aluguel": [
    "Casa",
    "Casa em Condomínio Fechado",
    "Apartamento",
    "Kitnet",
    "Flat",
    "Loft",
    "Quitinete",
    "Estúdio",
    "Outros",
  ],
  "Residencial-Venda": [
    "Casa",
    "Casa em Condomínio Fechado",
    "Apartamento",
    "Terreno",
    "Sobrado",
    "Cobertura",
    "Outros",
  ],
  "Comercial-Aluguel": [
    "Ponto Comercial",
    "Sala",
    "Salão",
    "Prédio",
    "Terreno",
    "Galpão",
    "Box Comercial",
    "Outros",
  ],
  "Comercial-Venda": [
    "Ponto Comercial",
    "Sala",
    "Salão",
    "Prédio",
    "Terreno",
    "Galpão",
    "Box Comercial",
    "Outros",
  ],
  "Rural-Aluguel": [
    "Chácara",
    "Sítio",
    "Fazenda",
    "Terreno",
    "Barracão",
    "Pousada",
    "Outros",
  ],
  "Rural-Venda": [
    "Chácara",
    "Sítio",
    "Fazenda",
    "Terreno",
    "Barracão",
    "Pousada",
    "Outros",
  ],
};

// Função utilitária para obter tipos por categoria e finalidade
export const getTiposPorCategoriaFinalidade = (categoria: string, finalidade: string): string[] => {
  const chave = `${categoria}-${finalidade}`;
  return opcoesTipoImovel[chave] || [];
};

// Função para obter todas as opções de uma categoria
export const getTiposPorCategoria = (categoria: string): string[] => {
  const tipos = new Set<string>();
  Object.keys(opcoesTipoImovel)
    .filter(chave => chave.startsWith(categoria))
    .forEach(chave => {
      opcoesTipoImovel[chave].forEach(tipo => tipos.add(tipo));
    });
  return Array.from(tipos).sort();
};

// Função para obter todos os tipos únicos
export const getTodosOsTipos = (): string[] => {
  const tipos = new Set<string>();
  Object.values(opcoesTipoImovel).forEach(lista => {
    lista.forEach(tipo => tipos.add(tipo));
  });
  return Array.from(tipos).sort();
};