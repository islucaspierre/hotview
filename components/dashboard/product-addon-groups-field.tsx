"use client"

import { Plus, Trash2, X } from "lucide-react"
import type { ProductAddonGroup } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

interface ProductAddonGroupsFieldProps {
  value: ProductAddonGroup[]
  onChange: (value: ProductAddonGroup[]) => void
}

// Grupos de opções de um produto — ex: "Cor do miolo" (obrigatório, 1
// opção), "Adicionais" (opcional, várias opções). Cada opção pode ter um
// preço extra (0 se só muda a cor/variação, sem custo a mais).
export function ProductAddonGroupsField({ value, onChange }: ProductAddonGroupsFieldProps) {
  function addGroup() {
    onChange([...value, { id: crypto.randomUUID(), title: "", required: false, maxSelections: 1, options: [] }])
  }
  function updateGroup(groupId: string, patch: Partial<ProductAddonGroup>) {
    onChange(value.map((g) => (g.id === groupId ? { ...g, ...patch } : g)))
  }
  function removeGroup(groupId: string) {
    onChange(value.filter((g) => g.id !== groupId))
  }
  function addOption(groupId: string) {
    onChange(value.map((g) => (g.id === groupId ? { ...g, options: [...g.options, { id: crypto.randomUUID(), name: "", price: 0 }] } : g)))
  }
  function updateOption(groupId: string, optionId: string, patch: Partial<ProductAddonGroup["options"][number]>) {
    onChange(value.map((g) => (g.id === groupId ? { ...g, options: g.options.map((o) => (o.id === optionId ? { ...o, ...patch } : o)) } : g)))
  }
  function removeOption(groupId: string, optionId: string) {
    onChange(value.map((g) => (g.id === groupId ? { ...g, options: g.options.filter((o) => o.id !== optionId) } : g)))
  }

  return (
    <div className="flex flex-col gap-3">
      {value.map((group) => (
        <div key={group.id} className="flex flex-col gap-3 rounded-xl border border-border p-3">
          <div className="flex items-center gap-2">
            <Input
              value={group.title}
              onChange={(e) => updateGroup(group.id, { title: e.target.value })}
              placeholder="Ex: Cor do miolo"
              className="flex-1"
            />
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeGroup(group.id)} aria-label="Remover grupo de opções">
              <Trash2 className="size-4" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <Switch checked={group.required} onCheckedChange={(checked) => updateGroup(group.id, { required: Boolean(checked) })} />
              Obrigatório
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              Máx. de opções
              <Input
                type="number"
                min={1}
                value={group.maxSelections}
                onChange={(e) => updateGroup(group.id, { maxSelections: Math.max(1, Number(e.target.value) || 1) })}
                className="w-16"
              />
            </label>
          </div>

          <div className="flex flex-col gap-2">
            {group.options.map((option) => (
              <div key={option.id} className="flex items-center gap-2">
                <Input
                  value={option.name}
                  onChange={(e) => updateOption(group.id, option.id, { name: e.target.value })}
                  placeholder="Ex: Azul"
                  className="flex-1"
                />
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={option.price}
                  onChange={(e) => updateOption(group.id, option.id, { price: Number(e.target.value) || 0 })}
                  placeholder="+R$"
                  className="w-24"
                />
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeOption(group.id, option.id)} aria-label="Remover opção">
                  <X className="size-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" onClick={() => addOption(group.id)} className="w-fit gap-1.5">
              <Plus className="size-3.5" />
              Adicionar opção
            </Button>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addGroup} className="w-fit gap-1.5">
        <Plus className="size-4" />
        Adicionar grupo de opções
      </Button>
    </div>
  )
}
