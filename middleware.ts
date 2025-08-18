// middleware.ts - VERSÃO LIMPA SEM PARÂMETRO
import { NextResponse } from 'next/server';

export function middleware() {
  // ✅ DESABILITADO: Sistema antigo de cookies
  return NextResponse.next();
}

export const config = {
  matcher: [], // ✅ VAZIO para desabilitar
};
