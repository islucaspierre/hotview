"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowRight, Store, ImagePlus, Phone, Check, Loader2, ChevronLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const STEPS = ["boas-vindas", "nome", "logo", "whatsapp", "pronto"] as const
type Step = (typeof STEPS)[number]

interface Props {
  storeId: string
  initialName: string
  initialSlug: string
}

export function OnboardingWizard({ storeId, initialName, initialSlug }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>("boas-vindas")
  const [direction, setDirection] = useState<"forward" | "back">("forward")
  const [animating, setAnimating] = useState(false)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState(initialName)
  const [logo, setLogo] = useState("")
  const [whatsapp, setWhatsapp] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)

  const stepIndex = STEPS.indexOf(step)
  const progress = (stepIndex / (STEPS.length - 1)) * 100

  function goTo(target: Step, dir: "forward" | "back" = "forward") {
    if (animating) return
    setDirection(dir)
    setAnimating(true)
    setTimeout(() => {
      setStep(target)
      setAnimating(false)
    }, 280)
  }

  function next() {
    const nextStep = STEPS[stepIndex + 1]
    if (nextStep) goTo(nextStep, "forward")
  }

  function back() {
    const prevStep = STEPS[stepIndex - 1]
    if (prevStep) goTo(prevStep, "back")
  }

  function handleLogoFile(file: File | undefined) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setLogo(String(reader.result ?? ""))
    reader.readAsDataURL(file)
  }

  function formatWhatsapp(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11)
    if (digits.length <= 2) return digits
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  async function finish() {
    setSaving(true)
    try {
      const supabase = createClient()
      const rawWhatsapp = whatsapp.replace(/\D/g, "")
      await supabase
        .from("stores")
        .update({
          name: name.trim() || initialName,
          logo: logo || "",
          whatsapp: rawWhatsapp,
        })
        .eq("id", storeId)
      goTo("pronto", "forward")
    } catch {
      // falhou silenciosamente, mas ainda avança
      goTo("pronto", "forward")
    } finally {
      setSaving(false)
    }
  }

  const slideClass = animating
    ? direction === "forward"
      ? "opacity-0 translate-x-8"
      : "opacity-0 -translate-x-8"
    : "opacity-100 translate-x-0"

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-background">
      {/* Barra de progresso */}
      {step !== "boas-vindas" && step !== "pronto" && (
        <div className="absolute inset-x-0 top-0 z-10 h-1 bg-border">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Botão voltar */}
      {step !== "boas-vindas" && step !== "pronto" && (
        <button
          onClick={back}
          className="absolute left-4 top-4 z-10 flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Voltar
        </button>
      )}

      {/* Conteúdo */}
      <div
        className={`flex flex-1 flex-col items-center justify-center px-6 py-20 transition-all duration-[280ms] ease-in-out ${slideClass}`}
      >
        {step === "boas-vindas" && <WelcomeStep onNext={next} />}
        {step === "nome" && (
          <NameStep value={name} onChange={setName} onNext={next} initialName={initialName} />
        )}
        {step === "logo" && (
          <LogoStep
            logo={logo}
            name={name || initialName}
            fileInputRef={fileInputRef}
            onFile={handleLogoFile}
            onClear={() => setLogo("")}
            onNext={next}
          />
        )}
        {step === "whatsapp" && (
          <WhatsappStep
            value={whatsapp}
            onChange={(v) => setWhatsapp(formatWhatsapp(v))}
            onNext={finish}
            saving={saving}
          />
        )}
        {step === "pronto" && (
          <DoneStep slug={initialSlug} onGo={() => router.push("/dashboard")} />
        )}
      </div>
    </div>
  )
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex max-w-sm flex-col items-center gap-8 text-center">
      <div className="relative flex size-24 items-center justify-center rounded-full bg-primary/20 ring-4 ring-primary/30">
        <img src="/hotview-logo.png" alt="Hotview" className="size-16 rounded-full object-cover" />
        <span className="absolute -right-1 -top-1 flex size-7 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground shadow">
          ✨
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Vamos criar sua vitrine!
        </h1>
        <p className="text-base text-muted-foreground">
          Em menos de 2 minutos seu cardápio estará pronto para receber pedidos pelo WhatsApp.
        </p>
      </div>

      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        {["Nome da loja", "Logo do seu negócio", "Número do WhatsApp"].map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
              {i + 1}
            </span>
            {item}
          </div>
        ))}
      </div>

      <Button size="lg" className="w-full gap-2 rounded-full text-base" onClick={onNext}>
        Começar agora
        <ArrowRight className="size-5" />
      </Button>
    </div>
  )
}

function NameStep({
  value, onChange, onNext, initialName,
}: {
  value: string
  onChange: (v: string) => void
  onNext: () => void
  initialName: string
}) {
  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <div className="flex flex-col gap-2 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/15">
          <Store className="size-7 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">Qual é o nome da sua loja?</h2>
        <p className="text-sm text-muted-foreground">É como seus clientes vão te encontrar.</p>
      </div>

      <div className="flex flex-col gap-3">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={initialName || "Ex: Pizza & Cia, Açaí do João..."}
          className="h-14 rounded-xl text-center text-lg font-semibold"
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && value.trim() && onNext()}
        />
        {value.trim() && (
          <p className="text-center text-xs text-muted-foreground">
            Sua vitrine vai se chamar{" "}
            <span className="font-semibold text-foreground">{value.trim()}</span>
          </p>
        )}
      </div>

      <Button
        size="lg"
        className="w-full gap-2 rounded-full"
        onClick={onNext}
        disabled={!value.trim()}
      >
        Continuar
        <ArrowRight className="size-4" />
      </Button>
    </div>
  )
}

function LogoStep({
  logo, name, fileInputRef, onFile, onClear, onNext,
}: {
  logo: string
  name: string
  fileInputRef: React.RefObject<HTMLInputElement>
  onFile: (f: File | undefined) => void
  onClear: () => void
  onNext: () => void
}) {
  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <div className="flex flex-col gap-2 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/15">
          <ImagePlus className="size-7 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">Adicione o logo da sua loja</h2>
        <p className="text-sm text-muted-foreground">Aparece no topo da vitrine. Pode pular se não tiver agora.</p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative flex size-32 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-muted/40 transition-colors hover:border-primary hover:bg-primary/5"
        >
          {logo ? (
            <Image src={logo} alt="Logo" fill className="object-cover" unoptimized />
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <ImagePlus className="size-8" />
              <span className="text-xs">Escolher</span>
            </div>
          )}
        </button>
        {logo ? (
          <button onClick={onClear} className="text-xs text-muted-foreground underline-offset-2 hover:underline">
            Remover foto
          </button>
        ) : (
          <p className="text-xs text-muted-foreground">PNG, JPG até 5MB</p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Button size="lg" className="w-full gap-2 rounded-full" onClick={onNext}>
          {logo ? "Continuar" : "Pular por agora"}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}

function WhatsappStep({
  value, onChange, onNext, saving,
}: {
  value: string
  onChange: (v: string) => void
  onNext: () => void
  saving: boolean
}) {
  const digits = value.replace(/\D/g, "")
  const valid = digits.length === 10 || digits.length === 11

  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <div className="flex flex-col gap-2 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#25d366]/15">
          <Phone className="size-7 text-[#25d366]" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">Qual é o seu WhatsApp?</h2>
        <p className="text-sm text-muted-foreground">Os pedidos vão chegar nesse número.</p>
      </div>

      <div className="flex flex-col gap-3">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="(11) 99999-9999"
          type="tel"
          className="h-14 rounded-xl text-center text-lg font-semibold tracking-wide"
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && valid && onNext()}
        />
        {valid && (
          <p className="text-center text-xs text-muted-foreground">
            Pedidos chegarão no{" "}
            <span className="font-semibold text-foreground">{value}</span>
          </p>
        )}
      </div>

      <Button
        size="lg"
        className="w-full gap-2 rounded-full"
        onClick={onNext}
        disabled={!valid || saving}
      >
        {saving ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            Finalizar configuração
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>
    </div>
  )
}

function DoneStep({ slug, onGo }: { slug: string; onGo: () => void }) {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://hotview.com.br").replace(/\/$/, "")

  return (
    <div className="flex max-w-sm flex-col items-center gap-8 text-center">
      <div className="relative flex size-24 items-center justify-center rounded-full bg-primary/20 ring-4 ring-primary/30">
        <Check className="size-12 text-primary" strokeWidth={2.5} />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-3xl font-bold text-foreground">
          Vitrine criada! 🎉
        </h2>
        <p className="text-base text-muted-foreground">
          Sua loja já está no ar. Compartilhe o link com seus clientes.
        </p>
      </div>

      <div className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm font-medium text-primary">
        {appUrl}/loja/{slug}
      </div>

      <Button size="lg" className="w-full gap-2 rounded-full text-base" onClick={onGo}>
        Ir para o painel
        <ArrowRight className="size-5" />
      </Button>
    </div>
  )
}
