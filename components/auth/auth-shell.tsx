import type { ReactNode } from "react"
import Link from "next/link"

export function AuthShell({
  children,
  eyebrow,
  title,
  description,
}: {
  children: ReactNode
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <main className="flex min-h-svh flex-col bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/para-lojistas" className="flex items-center gap-2">
            <img src="/hotview-logo.png" alt="Hotview" className="size-9 rounded-full object-cover" />
            <span className="font-display text-lg font-bold tracking-tight text-foreground">Hotview</span>
          </Link>
          <Link
            href="/para-lojistas"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Voltar ao site
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-2 text-center">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {eyebrow}
            </span>
            <h1 className="font-display text-2xl font-bold text-balance text-foreground">{title}</h1>
            <p className="text-sm text-pretty text-muted-foreground">{description}</p>
          </div>

          {children}
        </div>
      </div>
    </main>
  )
}
