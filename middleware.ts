// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const logado = request.cookies.get('logado')?.value;

  const isProtectedRoute = request.nextUrl.pathname.startsWith('/cadastrar-imovel');

  if (isProtectedRoute && logado !== 'true') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/cadastrar-imovel'],
};
