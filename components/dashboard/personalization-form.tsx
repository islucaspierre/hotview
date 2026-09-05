"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, Copy } from "lucide-react"
import { toast } from "sonner"
import { useStoreSettings } from "@/lib/store-settings-context"
import { ThemePicker } from "@/components/dashboard/theme-picker"
import { CustomThemeEditor } from "@/components/dashboard/custom-theme-editor"
import { ImageUploadField } from "@/components/dashboard/image-upload-field"
import { StoreHoursEditor } from "@/components/dashboard/store-hours-editor"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export function PersonalizationForm() {
  const { store, updateStore, saveStore, setTheme } = useStoreSettings()
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await saveStore()
    } catch (error) {
      if (error instanceof Error && error.message === "SLUG_TAKEN") {
        toast.error("Esse link já está em uso por outra vitrine. Escolha outro.")
      } else {
        toast.error("Não foi possível salvar as alterações")
      }
    } finally {
      setSaving(false)
    }
  }

  function sanitizeSlug(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
  }

  const publicHost = (process.env.NEXT_PUBLIC_APP_URL ?? "https://v0-hotview.vercel.app").replace(/^https?:\/\//, "")
  const publicUrl = `${publicHost}/loja/${store.slug}`

  function handleCopyLink() {
    navigator.clipboard?.writeText(`https://${publicUrl}`).catch(() => {})
    setCopied(true)
    toast.success("Link copiado para a área de transferência")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-end gap-3 border-b border-border pb-4">
        <span className="text-xs text-muted-foreground">Salve para publicar as alterações</span>
        <Button type="button" onClick={handleSave} disabled={saving} className="rounded-full">
          {saving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">Identidade da loja</h2>
          <p className="text-sm text-muted-foreground">
            Essas informações aparecem no topo da sua vitrine pública.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="store-logo">Logo da loja</Label>
            <ImageUploadField
              id="store-logo"
              shape="circle"
              value={store.logo}
              onChange={(value) => updateStore({ logo: value })}
              emptyLabel="Enviar logo"
              helperText="Imagem quadrada, aparece em formato circular"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="store-banner">Banner de capa</Label>
            <ImageUploadField
              id="store-banner"
              shape="wide"
              value={store.coverImage}
              onChange={(value) => updateStore({ coverImage: value })}
              emptyLabel="Enviar banner"
              helperText="Recomendado 1200x400px, aparece no topo da vitrine"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Nome da loja</Label>
          <Input
            id="name"
            value={store.name}
            onChange={(e) => updateStore({ name: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="tagline">Frase de destaque</Label>
          <Input
            id="tagline"
            value={store.tagline}
            onChange={(e) => updateStore({ tagline: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            rows={3}
            value={store.description}
            onChange={(e) => updateStore({ description: e.target.value })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={store.whatsapp}
              onChange={(e) => updateStore({ whatsapp: e.target.value })}
              placeholder="5511987654321"
            />
            <p className="text-xs text-muted-foreground">
              Comece com 55 (Brasil) + DDD + número, só números. Ex: 5511987654321.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              value={store.instagram ?? ""}
              onChange={(e) => updateStore({ instagram: e.target.value })}
              placeholder="@sualoja"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="minOrder">Pedido mínimo (R$)</Label>
            <Input
              id="minOrder"
              type="number"
              min={0}
              step={1}
              value={store.minOrder}
              onChange={(e) => updateStore({ minOrder: Number(e.target.value) || 0 })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="deliveryTime">Tempo de entrega (min)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="deliveryTime"
                type="number"
                min={0}
                step={5}
                value={store.deliveryTimeMinutes[0]}
                onChange={(e) => updateStore({ deliveryTimeMinutes: [Number(e.target.value) || 0, store.deliveryTimeMinutes[1]] })}
                aria-label="Tempo mínimo de entrega"
              />
              <span className="text-sm text-muted-foreground">até</span>
              <Input
                type="number"
                min={0}
                step={5}
                value={store.deliveryTimeMinutes[1]}
                onChange={(e) => updateStore({ deliveryTimeMinutes: [store.deliveryTimeMinutes[0], Number(e.target.value) || 0] })}
                aria-label="Tempo máximo de entrega"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="noteLabel">Pergunta de personalização do produto</Label>
            <Input
              id="noteLabel"
              value={store.noteLabel ?? ""}
              onChange={(e) => updateStore({ noteLabel: e.target.value })}
              placeholder="Alguma observação?"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notePlaceholder">Exemplo mostrado no campo</Label>
            <Input
              id="notePlaceholder"
              value={store.notePlaceholder ?? ""}
              onChange={(e) => updateStore({ notePlaceholder: e.target.value })}
              placeholder="Ex: sem cebola, ponto mais crocante..."
            />
          </div>
        </div>
        <p className="-mt-2 text-xs text-muted-foreground">
          Esse campo aparece na hora de o cliente adicionar um produto ao carrinho. Ajuste o texto
          para o seu tipo de negócio — ex: "Alguma personalização?" com exemplo "Nome ou frase" para
          produtos customizados.
        </p>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">Horário de funcionamento</h2>
          <p className="text-sm text-muted-foreground">
            Define o "Aberto agora" / "Fechado agora" que aparece na sua vitrine pública.
          </p>
        </div>
        <StoreHoursEditor />
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">Tema visual</h2>
          <p className="text-sm text-muted-foreground">
            Escolha uma paleta de cores e estilo prontos para o seu segmento. O preview atualiza na
            hora. Quer um cardápio pronto junto com o tema? Veja a{" "}
            <Link
              href="/dashboard/vitrines-prontas"
              className="underline underline-offset-4 hover:text-foreground"
            >
              biblioteca de vitrines prontas
            </Link>
            .
          </p>
        </div>
        <ThemePicker value={store.theme} onChange={setTheme} />
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">Cores da marca</h2>
          <p className="text-sm text-muted-foreground">
            Prefere suas próprias cores? Ative a personalização e ajuste a paleta do template escolhido.
          </p>
        </div>
        <CustomThemeEditor />
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">Link da vitrine</h2>
          <p className="text-sm text-muted-foreground">
            Compartilhe esse link com seus clientes nas redes sociais. Mudar o link quebra links
            antigos que já foram compartilhados.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <InputGroup className="h-9">
            <InputGroupAddon>
              <InputGroupText className="font-mono text-xs sm:text-sm">{publicHost}/loja/</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              value={store.slug}
              onChange={(e) => updateStore({ slug: sanitizeSlug(e.target.value) })}
              className="font-mono text-xs sm:text-sm"
              aria-label="Link personalizado da vitrine"
            />
          </InputGroup>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={handleCopyLink}
            aria-label="Copiar link da vitrine"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </Button>
        </div>
      </section>
    </div>
  )
}
