"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Pencil, Plus, Settings2, Trash2, X, Check, ChevronUp, ChevronDown } from "lucide-react"
import { useStoreSettings } from "@/lib/store-settings-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
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

export function CategoryManager() {
  const { store, categoryList, productList, addCategory, renameCategory, removeCategory, reorderCategory } = useStoreSettings()
  const categories = categoryList.filter((c) => c.storeId === store.id).sort((a, b) => a.position - b.position)

  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    addCategory(newName)
    setNewName("")
  }

  function startEditing(id: string, name: string) {
    setEditingId(id)
    setEditingName(name)
  }

  function confirmEditing() {
    if (!editingId) return
    renameCategory(editingId, editingName)
    setEditingId(null)
  }

  function handleDelete(id: string) {
    const hasProducts = productList.some((p) => p.categoryId === id)
    if (hasProducts) {
      toast.error("Mova ou exclua os produtos dessa categoria antes de removê-la")
      return
    }
    setDeletingId(id)
  }

  function confirmDelete() {
    if (!deletingId) return
    removeCategory(deletingId)
    setDeletingId(null)
  }

  const deletingCategory = categories.find((c) => c.id === deletingId)

  return (
    <>
      <Button variant="secondary" className="gap-2 rounded-full" onClick={() => setOpen(true)}>
        <Settings2 className="size-4" />
        Categorias
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Categorias do cardápio</DialogTitle>
            <DialogDescription>
              Use as setas para definir a ordem em que as categorias aparecem na sua vitrine.
            </DialogDescription>
          </DialogHeader>

          <ul className="flex flex-col gap-2">
            {categories.map((category, index) => (
              <li key={category.id} className="flex items-center gap-2 rounded-lg border border-border p-2">
                {editingId === category.id ? (
                  <>
                    <Input
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && confirmEditing()}
                      className="h-8"
                    />
                    <Button type="button" variant="ghost" size="icon-sm" onClick={confirmEditing} aria-label="Confirmar">
                      <Check className="size-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => setEditingId(null)} aria-label="Cancelar">
                      <X className="size-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => reorderCategory(category.id, "up")}
                        disabled={index === 0}
                        aria-label={`Mover ${category.name} para cima`}
                      >
                        <ChevronUp className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => reorderCategory(category.id, "down")}
                        disabled={index === categories.length - 1}
                        aria-label={`Mover ${category.name} para baixo`}
                      >
                        <ChevronDown className="size-3.5" />
                      </Button>
                    </div>
                    <span className="flex-1 text-sm font-medium text-foreground">{category.name}</span>
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => startEditing(category.id, category.name)} aria-label={`Editar ${category.name}`}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => handleDelete(category.id)} aria-label={`Excluir ${category.name}`}>
                      <Trash2 className="size-4" />
                    </Button>
                  </>
                )}
              </li>
            ))}
            {categories.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">Nenhuma categoria ainda.</p>
            )}
          </ul>

          <form onSubmit={handleAdd} className="flex items-center gap-2 border-t border-border pt-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nova categoria"
              className="flex-1"
            />
            <Button type="submit" size="icon" className="shrink-0 rounded-full" aria-label="Adicionar categoria">
              <Plus className="size-4" />
            </Button>
          </form>

          <DialogFooter className="mt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deletingId)} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {deletingCategory?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação remove a categoria do seu cardápio. Não é possível desfazer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
