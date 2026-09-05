"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { ImagePlus, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FieldDescription } from "@/components/ui/field"

const MAX_FILE_SIZE_MB = 5

interface ImageUploadFieldProps {
  id?: string
  value: string
  onChange: (value: string) => void
  shape?: "square" | "circle" | "wide"
  helperText?: string
  emptyLabel?: string
}

// Upload de imagem client-side: lê o arquivo escolhido (câmera, galeria ou
// computador) e converte para data URL, guardado em memória junto com o
// resto do estado da vitrine. Sem banco de dados conectado ainda, então a
// imagem não persiste entre sessões — assim como os demais dados do painel.
export function ImageUploadField({
  id,
  value,
  onChange,
  shape = "wide",
  helperText,
  emptyLabel = "Enviar imagem",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  const hasImage = Boolean(value)

  function handleFile(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem")
      return
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`A imagem deve ter no máximo ${MAX_FILE_SIZE_MB}MB`)
      return
    }
    setLoading(true)
    const reader = new FileReader()
    reader.onload = () => {
      onChange(String(reader.result ?? ""))
      setLoading(false)
    }
    reader.onerror = () => {
      toast.error("Não foi possível ler a imagem, tente outro arquivo")
      setLoading(false)
    }
    reader.readAsDataURL(file)
  }

  const frameClass = cn(
    "relative flex items-center justify-center overflow-hidden border border-dashed border-border bg-secondary/40 text-muted-foreground transition-colors",
    shape === "square" && "size-28 rounded-xl",
    shape === "circle" && "size-28 rounded-full",
    shape === "wide" && "h-32 w-full rounded-xl",
  )

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className={frameClass}>
        {loading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : hasImage ? (
          <>
            <Image
              src={value || "/placeholder.svg"}
              alt=""
              fill
              className="object-cover"
              unoptimized={value.startsWith("data:")}
            />
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Remover imagem"
              className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm hover:bg-background"
            >
              <X className="size-3.5" />
            </button>
          </>
        ) : (
          <ImagePlus className="size-6" aria-hidden />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
        >
          {hasImage ? "Trocar imagem" : emptyLabel}
        </Button>
        {helperText && <FieldDescription>{helperText}</FieldDescription>}
      </div>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}
