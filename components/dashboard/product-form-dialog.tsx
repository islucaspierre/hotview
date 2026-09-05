"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import type { Product } from "@/lib/types"
import { useStoreSettings } from "@/lib/store-settings-context"
import { ImageUploadField } from "@/components/dashboard/image-upload-field"
import { ImageGalleryField } from "@/components/dashboard/image-gallery-field"
import { ProductAddonGroupsField } from "@/components/dashboard/product-addon-groups-field"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
}

const PLACEHOLDER_IMAGE = "/placeholder.svg?height=200&width=200"

function emptyDraft(storeId: string, categoryId: string): Product {
  return {
    id: crypto.randomUUID(),
    storeId,
    categoryId,
    name: "",
    description: "",
    price: 0,
    image: PLACEHOLDER_IMAGE,
    images: [],
    active: true,
    featured: false,
    addonGroups: [],
  }
}

export function ProductFormDialog({ open, onOpenChange, product }: ProductFormDialogProps) {
  const { store, categoryList, addProduct, updateProduct } = useStoreSettings()
  const categories = categoryList.filter((c) => c.storeId === store.id)
  const isEditing = Boolean(product)

  const [draft, setDraft] = useState<Product>(() =>
    product ?? emptyDraft(store.id, categories[0]?.id ?? ""),
  )

  useEffect(() => {
    if (open) {
      setDraft(product ?? emptyDraft(store.id, categories[0]?.id ?? ""))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.name.trim()) {
      toast.error("Dê um nome ao produto antes de salvar")
      return
    }
    if (draft.price <= 0) {
      toast.error("Informe um preço maior que zero")
      return
    }

    if (isEditing) {
      updateProduct(draft.id, draft)
      toast.success("Produto atualizado")
    } else {
      addProduct(draft)
      toast.success("Produto criado")
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar produto" : "Novo produto"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="product-image">Foto do produto</FieldLabel>
              <ImageUploadField
                id="product-image"
                value={draft.image}
                onChange={(value) => setDraft({ ...draft, image: value || PLACEHOLDER_IMAGE })}
                shape="square"
                helperText="PNG ou JPG, formato quadrado funciona melhor"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="product-gallery">Fotos adicionais</FieldLabel>
              <ImageGalleryField
                id="product-gallery"
                value={draft.images}
                onChange={(images) => setDraft({ ...draft, images })}
                helperText="Opcional — até 6 fotos extras, mostradas em galeria na vitrine"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="product-name">Nome</FieldLabel>
              <Input
                id="product-name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Ex: Batata Suprema"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="product-description">Descrição</FieldLabel>
              <Textarea
                id="product-description"
                rows={2}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="Descreva os ingredientes do produto"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="product-price">Preço (R$)</FieldLabel>
                <Input
                  id="product-price"
                  type="number"
                  min={0}
                  step={0.5}
                  value={draft.price}
                  onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) || 0 })}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="product-category">Categoria</FieldLabel>
                <Select
                  items={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
                  value={draft.categoryId}
                  onValueChange={(value) => setDraft({ ...draft, categoryId: value as string })}
                >
                  <SelectTrigger id="product-category">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {categories.length === 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Crie uma categoria primeiro (botão "Categorias" na tela de produtos).
                  </p>
                )}
              </Field>
            </div>

            <Field>
              <FieldLabel>Opções do produto (cor, tamanho, adicionais...)</FieldLabel>
              <p className="mb-1 text-xs text-muted-foreground">
                Ex: um grupo "Cor do miolo" obrigatório com as opções Azul, Rosa, Preto.
              </p>
              <ProductAddonGroupsField
                value={draft.addonGroups}
                onChange={(addonGroups) => setDraft({ ...draft, addonGroups })}
              />
            </Field>

            <Field orientation="horizontal">
              <FieldLabel htmlFor="product-featured" className="flex-1">
                Produto em destaque
              </FieldLabel>
              <Switch
                id="product-featured"
                checked={draft.featured}
                onCheckedChange={(checked) => setDraft({ ...draft, featured: Boolean(checked) })}
              />
            </Field>

            <Field orientation="horizontal">
              <FieldLabel htmlFor="product-active" className="flex-1">
                Produto ativo no cardápio
              </FieldLabel>
              <Switch
                id="product-active"
                checked={draft.active}
                onCheckedChange={(checked) => setDraft({ ...draft, active: Boolean(checked) })}
              />
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!isEditing && categories.length === 0}>
              {isEditing ? "Salvar alterações" : "Criar produto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
