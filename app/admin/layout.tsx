import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Toaster } from "@/components/ui/sonner"

const ADMIN_EMAIL = process.env.ADMIN_EMAIL

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!ADMIN_EMAIL || !user || user.email !== ADMIN_EMAIL) redirect("/")

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <span className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Hotview Admin</span>
        <span className="text-xs text-muted-foreground">{user.email}</span>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
      <Toaster position="top-center" />
    </div>
  )
}
