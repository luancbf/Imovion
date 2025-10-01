// Hook para verificar se usuário é admin via banco de dados
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export function useAdminCheck() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user?.email) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      try {
        // Buscar perfil do usuário
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Erro ao verificar admin:', error)
          setIsAdmin(false)
        } else {
          setIsAdmin(profile?.role === 'admin')
        }
      } catch (error) {
        console.error('Erro ao verificar status admin:', error)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [user])

  return { isAdmin, loading }
}

// Função utilitária para verificar admin em server components
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Erro ao verificar admin:', error)
      return false
    }

    return profile?.role === 'admin'
  } catch (error) {
    console.error('Erro ao verificar status admin:', error)
    return false
  }
}

// Gerenciamento de admins feito diretamente na tabela admin_emails do Supabase
// Para adicionar admin: INSERT INTO admin_emails (email) VALUES ('novo@email.com');
// Para remover admin: UPDATE admin_emails SET active = false WHERE email = 'email@remover.com';