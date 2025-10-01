import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createServerSupabaseClient()
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Erro na confirmação:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=confirmation_failed`)
    }
  }

  // Redirecionar para página de sucesso
  return NextResponse.redirect(`${requestUrl.origin}/email-confirmado`)
}