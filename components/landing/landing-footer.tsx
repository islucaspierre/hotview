import Link from "next/link"

export function LandingFooter() {
  return (
    <footer className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <Link href="/para-lojistas" className="flex items-center gap-2">
          <img src="/hotview-logo.png" alt="Hotview" className="size-8 rounded-full object-cover" />
          <span className="font-display text-sm font-bold tracking-tight text-foreground">Hotview</span>
        </Link>
        <p className="text-xs text-muted-foreground">
          {new Date().getFullYear()} Hotview. Sua vitrine digital no WhatsApp.
        </p>
      </div>
    </footer>
  )
}
