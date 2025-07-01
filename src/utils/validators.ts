export function validarLocalizacao(latitude: number | null, longitude: number | null): boolean {
  return typeof latitude === 'number' && typeof longitude === 'number';
}

export function validarImagens(imagens: File[], imagensIniciais?: string[]): boolean {
  return imagens.length > 0 || !!(imagensIniciais && imagensIniciais.length > 0);
}

export function campoObrigatorio(valor: string | undefined | null): boolean {
  return !!valor && valor.trim().length > 0;
}