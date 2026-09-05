"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { toast } from "sonner"
import type { Category, Product, Store, StoreThemeOverrides, Subscription, ThemeId } from "@/lib/types"
import { THEME_PRESETS } from "@/lib/theme-presets"
import { PRESET_CATALOGS } from "@/lib/preset-catalogs"
import { createClient } from "@/lib/supabase/client"
import { getOwnerStore, storeRowFromStore, formatHours } from "@/lib/supabase/data"

interface StoreSettingsState { store: Store; productList: Product[]; categoryList: Category[]; subscription: Subscription | null }
interface StoreSettingsContextValue extends StoreSettingsState {
  access: { editingLocked: boolean; storefrontLocked: boolean; trialEndsAt?: string }
  updateStore: (patch: Partial<Store>) => void
  saveStore: () => Promise<void>
  setTheme: (theme: ThemeId) => void
  setThemeOverrides: (overrides: StoreThemeOverrides | null) => void
  updateThemeOverride: (key: keyof StoreThemeOverrides, value: string) => void
  addProduct: (product: Product) => void
  updateProduct: (id: string, patch: Partial<Product>) => void
  removeProduct: (id: string) => void
  removeProducts: (ids: string[]) => void
  toggleProductActive: (id: string) => void
  addCategory: (name: string) => void
  renameCategory: (id: string, name: string) => void
  removeCategory: (id: string) => void
  reorderCategory: (id: string, direction: "up" | "down") => void
  applyPresetCatalog: (catalogId: ThemeId) => Promise<number | null>
  resetToDefaults: () => void
}
const StoreSettingsContext = createContext<StoreSettingsContextValue | null>(null)
const initialState = (): StoreSettingsState => ({
  store: { id: "", slug: "", name: "Minha loja", tagline: "", description: "", logo: "", coverImage: "", whatsapp: "", instagram: undefined, rating: 0, reviewsCount: 0, minOrder: 0, deliveryTimeMinutes: [30, 45], hours: [], theme: "premium", themeOverrides: null },
  productList: [],
  categoryList: [],
  subscription: null,
})

const SUBSCRIPTION_LOCKED_MESSAGE = "Sua assinatura expirou. Acesse Assinatura para continuar editando."

export function StoreSettingsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreSettingsState>(initialState)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const data = await getOwnerStore()
      if (cancelled) return
      if (data) setState({ store: data.store, productList: data.products, categoryList: data.categories, subscription: data.subscription })
      setReady(true)
    }
    load().catch(() => setReady(true))
    return () => { cancelled = true }
  }, [])

  async function persistStore(next: Store) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Sessão expirada")
    const payload = storeRowFromStore(next, user.id)
    const { error } = next.id
      ? await supabase.from("stores").update(payload).eq("id", next.id).eq("owner_id", user.id)
      : await supabase.from("stores").insert(payload)
    if (error) {
      if (error.code === "23505" && error.message?.includes("slug")) throw new Error("SLUG_TAKEN")
      throw error
    }

    if (next.id && next.hours.length === 7) {
      const hoursPayload = formatHours(next.hours).map((h) => ({ ...h, store_id: next.id }))
      const { error: hoursError } = await supabase.from("store_hours").upsert(hoursPayload, { onConflict: "store_id,day_of_week" })
      if (hoursError) throw hoursError
    }
  }

  // Substitui todos os grupos de opções (cor, tamanho, adicionais...) de um
  // produto pelos do rascunho atual. Mais simples que tentar diferenciar
  // grupo por grupo, e como isso só roda quando a lojista salva o formulário
  // (não a cada tecla), apagar e recriar é barato o suficiente.
  async function syncAddonGroups(productId: string, addonGroups: Product["addonGroups"]) {
    const supabase = createClient()
    const { error: deleteError } = await supabase.from("addon_groups").delete().eq("product_id", productId)
    if (deleteError) throw deleteError
    for (const [groupIndex, group] of addonGroups.entries()) {
      const { error: groupError } = await supabase.from("addon_groups").insert({
        id: group.id, product_id: productId, title: group.title, required: group.required, max_selections: group.maxSelections, position: groupIndex,
      })
      if (groupError) throw groupError
      if (group.options.length > 0) {
        const { error: optionsError } = await supabase.from("addons").insert(
          group.options.map((option, optionIndex) => ({ id: option.id, group_id: group.id, name: option.name, price: option.price, max_per_product: option.maxPerProduct ?? null, position: optionIndex })),
        )
        if (optionsError) throw optionsError
      }
    }
  }

  const value = useMemo<StoreSettingsContextValue>(() => {
    const access = {
      editingLocked: state.subscription?.editingLocked ?? false,
      storefrontLocked: state.subscription?.storefrontLocked ?? false,
      trialEndsAt: state.subscription?.trialEndsAt,
    }
    const updateStore = (patch: Partial<Store>) => { setState((s) => ({ ...s, store: { ...s.store, ...patch } })) }
    const saveStore = async () => {
      if (access.editingLocked) { toast.error(SUBSCRIPTION_LOCKED_MESSAGE); return }
      const next = state.store
      await persistStore(next)
      toast.success("Alterações salvas na sua vitrine")
    }
    const setTheme = (theme: ThemeId) => updateStore({ theme, themeOverrides: null })
    const setThemeOverrides = (themeOverrides: StoreThemeOverrides | null) => updateStore({ themeOverrides })
    const updateThemeOverride = (key: keyof StoreThemeOverrides, value: string) => updateStore({ themeOverrides: { ...(state.store.themeOverrides ?? THEME_PRESETS[state.store.theme]), [key]: value } })
    const addProduct = (product: Product) => {
      if (access.editingLocked) { toast.error(SUBSCRIPTION_LOCKED_MESSAGE); return }
      if (!state.store.id || !product.categoryId) { toast.error("Crie uma categoria antes de adicionar produtos"); return }
      setState((s) => ({ ...s, productList: [...s.productList, product] }))
      createClient().from("products").insert({ id: product.id, store_id: state.store.id, category_id: product.categoryId, name: product.name, description: product.description, price: product.price, image: product.image, images: product.images, active: product.active, featured: product.featured }).then(async ({ error }) => {
        if (error) {
          setState((s) => ({ ...s, productList: s.productList.filter((item) => item.id !== product.id) }))
          console.error("Falha ao criar produto", error)
          toast.error(error.message?.includes("SUBSCRIPTION_LOCKED") ? SUBSCRIPTION_LOCKED_MESSAGE : "Não foi possível salvar o produto")
          return
        }
        if (product.addonGroups.length > 0) {
          try {
            await syncAddonGroups(product.id, product.addonGroups)
          } catch (addonError) {
            console.error("Falha ao salvar opções do produto", addonError)
            toast.error("Produto salvo, mas não foi possível salvar as opções (cores, tamanhos, etc.)")
          }
        }
      })
    }
    const updateProduct = (id: string, patch: Partial<Product>) => {
      if (access.editingLocked) { toast.error(SUBSCRIPTION_LOCKED_MESSAGE); return }
      const previous = state.productList.find((p) => p.id === id)
      setState((s) => ({ ...s, productList: s.productList.map((p) => p.id === id ? { ...p, ...patch } : p) }))
      const dbPatch: Record<string, unknown> = {}
      if (patch.name !== undefined) dbPatch.name = patch.name
      if (patch.description !== undefined) dbPatch.description = patch.description
      if (patch.price !== undefined) dbPatch.price = patch.price
      if (patch.image !== undefined) dbPatch.image = patch.image
      if (patch.images !== undefined) dbPatch.images = patch.images
      if (patch.active !== undefined) dbPatch.active = patch.active
      if (patch.featured !== undefined) dbPatch.featured = patch.featured
      if (patch.categoryId !== undefined) dbPatch.category_id = patch.categoryId
      createClient().from("products").update(dbPatch).eq("id", id).then(async ({ error }) => {
        if (error) {
          if (previous) setState((s) => ({ ...s, productList: s.productList.map((p) => p.id === id ? previous : p) }))
          console.error("Falha ao atualizar produto", error)
          toast.error(error.message?.includes("SUBSCRIPTION_LOCKED") ? SUBSCRIPTION_LOCKED_MESSAGE : "Não foi possível atualizar o produto")
          return
        }
        if (patch.addonGroups !== undefined) {
          try {
            await syncAddonGroups(id, patch.addonGroups)
          } catch (addonError) {
            console.error("Falha ao salvar opções do produto", addonError)
            toast.error("Produto salvo, mas não foi possível salvar as opções (cores, tamanhos, etc.)")
          }
        }
      })
    }
    const removeProduct = (id: string) => {
      const previous = state.productList.find((p) => p.id === id)
      setState((s) => ({ ...s, productList: s.productList.filter((p) => p.id !== id) }))
      createClient().from("products").delete().eq("id", id).then(({ error }) => {
        if (!error) return
        if (previous) setState((s) => ({ ...s, productList: [...s.productList, previous] }))
        toast.error("Não foi possível excluir o produto")
      })
    }
    const removeProducts = (ids: string[]) => {
      if (ids.length === 0) return
      const previous = state.productList.filter((p) => ids.includes(p.id))
      setState((s) => ({ ...s, productList: s.productList.filter((p) => !ids.includes(p.id)) }))
      createClient().from("products").delete().in("id", ids).then(({ error }) => {
        if (!error) return
        setState((s) => ({ ...s, productList: [...s.productList, ...previous] }))
        console.error("Falha ao excluir produtos em lote", error)
        toast.error("Não foi possível excluir os produtos selecionados")
      })
    }
    const toggleProductActive = (id: string) => { const product = state.productList.find((p) => p.id === id); if (product) updateProduct(id, { active: !product.active }) }
    const addCategory = (name: string) => {
      if (access.editingLocked) { toast.error(SUBSCRIPTION_LOCKED_MESSAGE); return }
      const trimmed = name.trim()
      if (!trimmed) { toast.error("Dê um nome à categoria"); return }
      if (state.categoryList.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
        toast.error("Já existe uma categoria com esse nome")
        return
      }
      const nextPosition = state.categoryList.reduce((max, c) => Math.max(max, c.position), 0) + 1
      const category: Category = { id: crypto.randomUUID(), storeId: state.store.id, name: trimmed, position: nextPosition }
      setState((s) => ({ ...s, categoryList: [...s.categoryList, category] }))
      createClient().from("categories").insert({ id: category.id, store_id: state.store.id, name: category.name, position: category.position }).then(({ error }) => {
        if (!error) return
        setState((s) => ({ ...s, categoryList: s.categoryList.filter((c) => c.id !== category.id) }))
        console.error("Falha ao criar categoria", error)
        toast.error(error.message?.includes("SUBSCRIPTION_LOCKED") ? SUBSCRIPTION_LOCKED_MESSAGE : "Não foi possível criar a categoria")
      })
    }
    const renameCategory = (id: string, name: string) => {
      if (access.editingLocked) { toast.error(SUBSCRIPTION_LOCKED_MESSAGE); return }
      const trimmed = name.trim()
      if (!trimmed) { toast.error("Dê um nome à categoria"); return }
      const previous = state.categoryList.find((c) => c.id === id)
      if (!previous || previous.name === trimmed) return
      if (state.categoryList.some((c) => c.id !== id && c.name.toLowerCase() === trimmed.toLowerCase())) {
        toast.error("Já existe uma categoria com esse nome")
        return
      }
      setState((s) => ({ ...s, categoryList: s.categoryList.map((c) => c.id === id ? { ...c, name: trimmed } : c) }))
      createClient().from("categories").update({ name: trimmed }).eq("id", id).then(({ error }) => {
        if (!error) return
        setState((s) => ({ ...s, categoryList: s.categoryList.map((c) => c.id === id ? previous : c) }))
        console.error("Falha ao renomear categoria", error)
        toast.error(error.message?.includes("SUBSCRIPTION_LOCKED") ? SUBSCRIPTION_LOCKED_MESSAGE : "Não foi possível renomear a categoria")
      })
    }
    const reorderCategory = (id: string, direction: "up" | "down") => {
      if (access.editingLocked) { toast.error(SUBSCRIPTION_LOCKED_MESSAGE); return }
      const sorted = [...state.categoryList].sort((a, b) => a.position - b.position)
      const index = sorted.findIndex((c) => c.id === id)
      const swapIndex = direction === "up" ? index - 1 : index + 1
      if (index === -1 || swapIndex < 0 || swapIndex >= sorted.length) return

      const current = sorted[index]
      const swapWith = sorted[swapIndex]
      const currentPosition = current.position
      const swapPosition = swapWith.position

      setState((s) => ({
        ...s,
        categoryList: s.categoryList.map((c) => {
          if (c.id === current.id) return { ...c, position: swapPosition }
          if (c.id === swapWith.id) return { ...c, position: currentPosition }
          return c
        }),
      }))

      const supabase = createClient()
      Promise.all([
        supabase.from("categories").update({ position: swapPosition }).eq("id", current.id),
        supabase.from("categories").update({ position: currentPosition }).eq("id", swapWith.id),
      ]).then(([r1, r2]) => {
        const error = r1.error || r2.error
        if (!error) return
        setState((s) => ({
          ...s,
          categoryList: s.categoryList.map((c) => {
            if (c.id === current.id) return { ...c, position: currentPosition }
            if (c.id === swapWith.id) return { ...c, position: swapPosition }
            return c
          }),
        }))
        console.error("Falha ao reordenar categorias", error)
        toast.error(error.message?.includes("SUBSCRIPTION_LOCKED") ? SUBSCRIPTION_LOCKED_MESSAGE : "Não foi possível reordenar as categorias")
      })
    }
    const removeCategory = (id: string) => {
      if (access.editingLocked) { toast.error(SUBSCRIPTION_LOCKED_MESSAGE); return }
      if (state.productList.some((p) => p.categoryId === id)) {
        toast.error("Mova ou exclua os produtos dessa categoria antes de removê-la")
        return
      }
      const previous = state.categoryList.find((c) => c.id === id)
      setState((s) => ({ ...s, categoryList: s.categoryList.filter((c) => c.id !== id) }))
      createClient().from("categories").delete().eq("id", id).then(({ error }) => {
        if (!error) return
        if (previous) setState((s) => ({ ...s, categoryList: [...s.categoryList, previous] }))
        console.error("Falha ao excluir categoria", error)
        toast.error("Não foi possível excluir a categoria")
      })
    }
    const applyPresetCatalog = async (catalogId: ThemeId): Promise<number | null> => {
      if (access.editingLocked) { toast.error(SUBSCRIPTION_LOCKED_MESSAGE); return null }
      const catalog = PRESET_CATALOGS[catalogId]
      if (!catalog) return null

      const previousStore = state.store
      const nextStore: Store = {
        ...previousStore,
        theme: catalogId,
        themeOverrides: null,
        // Banner e logo seguem o catálogo escolhido — "usar esta vitrine" troca
        // o visual inteiro. Se estivesse condicionado a "só se ainda tiver vazio",
        // trocar de catálogo depois de já ter usado outro nunca atualizaria o
        // banner/logo, deixando a foto do catálogo anterior "presa".
        coverImage: catalog.cover,
        logo: catalog.cover,
      }

      const categories = [...state.categoryList]
      let nextPosition = categories.reduce((max, c) => Math.max(max, c.position), 0) + 1
      const addedCategories: Category[] = []
      const getCategory = (name: string) => {
        const found = categories.find((c) => c.name.toLowerCase() === name.toLowerCase())
        if (found) return found.id
        const id = crypto.randomUUID()
        const created: Category = { id, storeId: state.store.id, name, position: nextPosition++ }
        categories.push(created)
        addedCategories.push(created)
        return id
      }
      const addedProducts: Product[] = catalog.products
        .filter((p) => !state.productList.some((existing) => existing.name === p.name))
        .map((p) => ({ id: crypto.randomUUID(), storeId: state.store.id, categoryId: getCategory(p.categoryName), name: p.name, description: p.description, price: p.price, image: p.image, active: true, featured: Boolean(p.featured), addonGroups: [] }))

      setState((s) => ({ ...s, store: nextStore, categoryList: categories, productList: [...s.productList, ...addedProducts] }))

      // Reverte só o estado local (nada foi persistido ainda no banco).
      const rollbackLocal = () => setState((s) => ({
        ...s,
        store: previousStore,
        categoryList: s.categoryList.filter((c) => !addedCategories.some((ac) => ac.id === c.id)),
        productList: s.productList.filter((p) => !addedProducts.some((ap) => ap.id === p.id)),
      }))
      // Reverte o estado local E desfaz o tema já salvo no banco (usado quando
      // persistStore(nextStore) já teve sucesso antes de uma etapa seguinte falhar).
      const rollbackAfterThemePersisted = async () => {
        rollbackLocal()
        try {
          await persistStore(previousStore)
        } catch (revertError) {
          console.error("Falha ao reverter o tema da vitrine após erro", revertError)
        }
      }

      try {
        await persistStore(nextStore)
      } catch (error) {
        console.error("Falha ao aplicar tema da vitrine pronta", error)
        rollbackLocal()
        toast.error("Não foi possível aplicar o tema da vitrine")
        return null
      }

      const supabase = createClient()
      if (addedCategories.length > 0) {
        const { error: categoryError } = await supabase.from("categories").insert(
          addedCategories.map((c) => ({ id: c.id, store_id: state.store.id, name: c.name, position: c.position })),
        )
        if (categoryError) {
          console.error("Falha ao salvar categorias da vitrine pronta", categoryError)
          await rollbackAfterThemePersisted()
          toast.error(categoryError.message?.includes("SUBSCRIPTION_LOCKED") ? SUBSCRIPTION_LOCKED_MESSAGE : "Não foi possível salvar as categorias da vitrine")
          return null
        }
      }

      if (addedProducts.length > 0) {
        const { error: productError } = await supabase.from("products").insert(
          addedProducts.map((p) => ({ id: p.id, store_id: state.store.id, category_id: p.categoryId, name: p.name, description: p.description, price: p.price, image: p.image, active: p.active, featured: p.featured })),
        )
        if (productError) {
          console.error("Falha ao salvar produtos da vitrine pronta", productError)
          await rollbackAfterThemePersisted()
          toast.error(productError.message?.includes("SUBSCRIPTION_LOCKED") ? SUBSCRIPTION_LOCKED_MESSAGE : "Não foi possível salvar os produtos da vitrine")
          return null
        }
      }

      return addedProducts.length
    }
    return { ...state, access, updateStore, saveStore, setTheme, setThemeOverrides, updateThemeOverride, addProduct, updateProduct, removeProduct, removeProducts, toggleProductActive, addCategory, renameCategory, removeCategory, reorderCategory, applyPresetCatalog, resetToDefaults: () => setState(initialState) }
  }, [state])

  return <StoreSettingsContext.Provider value={value}>{ready ? children : <div className="min-h-svh bg-background" />}</StoreSettingsContext.Provider>
}
export function useStoreSettings() { const context = useContext(StoreSettingsContext); if (!context) throw new Error("useStoreSettings must be used within StoreSettingsProvider"); return context }
