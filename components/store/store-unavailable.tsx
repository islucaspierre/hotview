export function StoreUnavailable() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4">
      <div className="max-w-sm text-center">
        <h1 className="font-display text-xl font-semibold text-foreground">
          Esta loja está temporariamente indisponível
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Volte mais tarde ou entre em contato com o lojista.
        </p>
      </div>
    </div>
  )
}
