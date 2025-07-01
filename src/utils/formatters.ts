export function formatarParaMoeda(valor: string): string {
  const numeros = valor.replace(/\D/g, '');
  const numeroFloat = (parseInt(numeros) / 100).toFixed(2);
  return Number(numeroFloat).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarMetragem(valor: string): string {
  const numeros = valor.replace(/\D/g, '');
  return numeros ? `${numeros} m²` : '';
}

export function formatarTelefone(valor: string): string {
  const numeros = valor.replace(/\D/g, '');
  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 6) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  if (numeros.length <= 10) return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
}