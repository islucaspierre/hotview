"use client"

import { useState } from "react"
import Image from "next/image"
import { toast } from "sonner"
import { MoreVertical, Pencil, Trash2, Star, Plus } from "lucide-react"
import type { Product } from "@/lib/types"
import { useStoreSettings } from "@/lib/store-settings-context"
import { formatCurrency } from "@/lib/format"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ProductFormDialog } from "@/components/dashboard/product-form-dialog"
import { CategoryManager } from "@/components/dashboard/category-manager"

export function ProductTable() {
  const { store, productList, categoryList, toggleProductActive, removeProduct, removeProducts } = useStoreSettings()
  const categories = categoryList.filter((c) => c.storeId === store.id)
  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "Sem categoria"

  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [confirmingBulkDelete, setConfirmingBulkDelete] = useState(false)

  const allSelected = productList.length > 0 && selectedIds.length === productList.length

  function toggleSelectAll() {
    setSelectedIds(allSelected ? [] : productList.map((p) => p.id))
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  function handleCreate() {
    setEditingProduct(null)
    setFormOpen(true)
  }

  function handleEdit(product: Product) {
    setEditingProduct(product)
    setFormOpen(true)
  }

  function handleConfirmDelete() {
    if (!deletingProduct) return
    removeProduct(deletingProduct.id)
    toast.success(`${deletingProduct.name} removido do cardápio`)
    setDeletingProduct(null)
  }

  function handleConfirmBulkDelete() {
    const count = selectedIds.length
    removeProducts(selectedIds)
    toast.success(`${count} produto${count > 1 ? "s" : ""} removido${count > 1 ? "s" : ""} do cardápio`)
    setSelectedIds([])
    setConfirmingBulkDelete(false)
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Produtos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie o cardápio da sua vitrine. As mudanças refletem na página pública.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              className="gap-2 rounded-full"
              onClick={() => setConfirmingBulkDelete(true)}
            >
              <Trash2 className="size-4" />
              Excluir {selectedIds.length} selecionado{selectedIds.length > 1 ? "s" : ""}
            </Button>
          )}
          <CategoryManager />
          <Button onClick={handleCreate} className="gap-2 rounded-full">
            <Plus className="size-4" />
            Novo produto
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Selecionar todos os produtos"
                />
              </TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Destaque</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {productList.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(product.id)}
                    onCheckedChange={() => toggleSelect(product.id)}
                    aria-label={`Selecionar ${product.name}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-secondary">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{product.name}</p>
                      <p className="line-clamp-1 max-w-56 text-xs text-muted-foreground">
                        {product.description}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {categoryName(product.categoryId)}
                </TableCell>
                <TableCell className="text-sm font-medium text-foreground">
                  {formatCurrency(product.price)}
                </TableCell>
                <TableCell>
                  {product.featured ? (
                    <Badge variant="secondary" className="gap-1">
                      <Star className="size-3" />
                      Destaque
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={product.active}
                    onCheckedChange={() => toggleProductActive(product.id)}
                    aria-label={`Ativar ou desativar ${product.name}`}
                  />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon-sm" aria-label="Ações do produto" />}
                    >
                      <MoreVertical className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => handleEdit(product)}>
                          <Pencil className="size-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeletingProduct(product)}
                        >
                          <Trash2 className="size-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editingProduct} />

      <AlertDialog open={Boolean(deletingProduct)} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {deletingProduct?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação remove o produto do cardápio da sua vitrine. Não é possível desfazer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmingBulkDelete} onOpenChange={setConfirmingBulkDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {selectedIds.length} produto{selectedIds.length > 1 ? "s" : ""}?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação remove os produtos selecionados do cardápio da sua vitrine. Não é possível desfazer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBulkDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
