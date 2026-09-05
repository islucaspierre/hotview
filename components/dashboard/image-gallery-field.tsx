"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { ImagePlus, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { FieldDescription } from "@/components/ui/field"

const MAX_FILE_SIZE_MB = 5
const MAX_IMAGES = 6

interface ImageGalleryFieldProps {
  id?: string
  value: string[]
  onChange: (value: string[]) => void
  helperText?: string
}

// Fotos adicionais de um produto (além da foto principal). Mesma lógica de
// upload client-side da ImageUploadField (converte pra data URL), só que
// mantém uma lista em vez de um valor único.
export function ImageGalleryField({ id, value, onChange, helperText }: ImageGalleryFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  function handleFile(file: File | undefined) {
    if (!file) return
    if (value.length >= MAX_IMAGES) {
      toast.error(`Máximo de ${MAX_IMAGES} fotos adicionais`)
      return
    }
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
      onChange([...value, String(reader.result ?? "")])
      setLoading(false)
    }
    reader.onerror = () => {
      toast.error("Não foi possível ler a imagem, tente outro arquivo")
      setLoading(false)
    }
    reader.readAsDataURL(file)
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-3">
        {value.map((image, index) => (
          <div key={index} className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-border bg-secondary/40">
            <Image src={image || "/placeholder.svg"} alt="" fill className="object-cover" unoptimized={image.startsWith("data:")} />
            <button
              type="button"
              onClick={() => removeAt(index)}
              aria-label="Remover foto"
              className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm hover:bg-background"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}

        {value.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="flex size-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-border bg-secondary/40 text-muted-foreground transition-colors hover:bg-secondary/60"
          >
            {loading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" aria-hidden />}
          </button>
        )}
      </div>
      {helperText && <FieldDescription>{helperText}</FieldDescription>}

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = "" }}
      />
    </div>
  )
}
