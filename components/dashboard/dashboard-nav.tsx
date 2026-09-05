"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, LayoutTemplate, Palette, Package, CreditCard, ExternalLink, Menu, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useStoreSettings } from "@/lib/store-settings-context"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/dashboard/vitrines-prontas", label: "Vitrines prontas", icon: LayoutTemplate },
  { href: "/dashboard/personalizacao", label: "Personalização", icon: Palette },
  { href: "/dashboard/produtos", label: "Produtos", icon: Package },
  { href: "/dashboard/assinatura", label: "Assinatura", icon: CreditCard },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function DashboardNav() {
  const { store } = useStoreSettings()
  const router = useRouter()

  async function handleSignOut() {
    const { error } = await createClient().auth.signOut()
    if (error) {
      toast.error("Não foi possível sair agora")
      return
    }
    router.replace("/entrar")
    router.refresh()
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card px-4 py-6 lg:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground">
            K
          </div>
          <span className="font-display text-base font-semibold text-card-foreground">Painel</span>
        </div>
        <NavLinks />
        <div className="mt-auto flex flex-col gap-2 pt-6">
          <Button
            variant="secondary"
            size="sm"
            className="gap-2 rounded-full"
            nativeButton={false}
            render={<Link href={`/loja/${store.slug}`} target="_blank" rel="noopener noreferrer" />}
          >
            <ExternalLink className="size-3.5" />
            Ver vitrine pública
          </Button>
          <Button variant="ghost" size="sm" className="justify-start gap-2 rounded-full text-muted-foreground" onClick={handleSignOut}>
            <LogOut className="size-3.5" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 lg:hidden">
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Abrir menu" />}>
            <Menu className="size-5" />
          </SheetTrigger>
          <span className="font-display text-base font-semibold text-card-foreground">Painel</span>
          <SheetContent side="left" className="w-64 bg-card p-4">
            <div className="mb-6 flex items-center gap-2 px-2 pt-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground">
                K
              </div>
              <span className="font-display text-base font-semibold text-card-foreground">Painel</span>
            </div>
            <NavLinks />
            <div className="mt-6 flex flex-col gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="w-full gap-2 rounded-full"
                nativeButton={false}
                render={<Link href={`/loja/${store.slug}`} target="_blank" rel="noopener noreferrer" />}
              >
                <ExternalLink className="size-3.5" />
                Ver vitrine pública
              </Button>
              <Button variant="ghost" size="sm" className="justify-start gap-2 rounded-full text-muted-foreground" onClick={handleSignOut}>
                <LogOut className="size-3.5" />
                Sair
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
