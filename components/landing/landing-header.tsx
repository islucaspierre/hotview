import Link from "next/link"
import { Button } from "@/components/ui/button"

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/para-lojistas" className="flex items-center gap-2">
          <img src="/hotview-logo.png" alt="Hotview" className="size-9 rounded-full object-cover" />
          <span className="font-display text-lg font-bold tracking-tight text-foreground">Hotview</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <a href="#como-funciona" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Como funciona
          </a>
          <a href="#segmentos" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Segmentos
          </a>
          <a href="#demonstracao" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Demonstração
          </a>
          <a href="#planos" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Planos
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="hidden sm:inline-flex"
            render={<Link href="/entrar" />}
            nativeButton={false}
          >
            Entrar
          </Button>
          <Button
            size="sm"
            className="rounded-full"
            render={<Link href="/cadastro" />}
            nativeButton={false}
          >
            Criar minha vitrine grátis
          </Button>
        </div>
      </div>
    </header>
  )
}
