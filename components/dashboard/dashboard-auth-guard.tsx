"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function DashboardAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    let active = true
    createClient().auth.getUser().then(({ data }) => {
      if (active && !data.user) router.replace("/entrar")
    })
    return () => { active = false }
  }, [router])

  return children
}
