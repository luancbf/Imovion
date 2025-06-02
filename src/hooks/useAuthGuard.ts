'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function useAuthGuard() {
  const router = useRouter()
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usuario) => {
      if (!usuario) {
        router.replace('/login')
      } else {
        setCarregando(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  return carregando
}