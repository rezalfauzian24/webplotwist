'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData?.session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', sessionData.session.user.id)
            .single()
          
          if (data?.role === 'admin') {
            setIsAdmin(true)
          }
        }
      } catch (err) {
        console.error('Failed to check admin role:', err)
      }
    }
    
    checkAdmin()
  }, [])

  return isAdmin
}
