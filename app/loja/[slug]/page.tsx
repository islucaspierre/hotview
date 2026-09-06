import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getPublicStore, recordStoreView } from "@/lib/supabase/server-data"
import { StoreHeader } from "@/components/store/store-header"
import { ProductCatalog } from "@/components/store/product-catalog"
import { StoreShell } from "@/components/store/store-shell"
import { StoreUnavailable } from "@/components/store/store-unavailable"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await getPublicStore(slug)
  if (!data || "unavailable" in data) return {}
  const { store } = data
  const images = store.logo ? [{ url: store.logo, width: 512, height: 512, alt: store.name }] : []
  return {
    title: `${store.name} | Cardápio digital`,
    description: store.description,
    openGraph: {
      title: store.name,
      description: store.description ?? `Faça seu pedido na ${store.name}`,
      images,
      type: "website",
    },
    twitter: {
      card: images.length ? "summary" : "summary_large_image",
      title: store.name,
      description: store.description ?? `Faça seu pedido na ${store.name}`,
      images,
    },
  }
}

export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getPublicStore(slug)
  if (!data) notFound()
  if ("unavailable" in data) return <StoreUnavailable />
  const { store, categories, products } = data
  await recordStoreView(slug)

  return (
    <StoreShell store={store}>
      <main className="mx-auto max-w-lg">
        <StoreHeader store={store} />
        <ProductCatalog store={store} categories={categories} products={products} />
      </main>
    </StoreShell>
  )
}
