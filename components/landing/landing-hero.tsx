import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const BADGES = ["Sem comissão por venda", "Sem aplicativo para o cliente", "Pedidos direto no WhatsApp"]

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-[#001e16]">
      {/* Hero02 como background no desktop */}
      <div className="absolute inset-0 hidden lg:block">
        <Image
          src="/hero02.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Gradiente para garantir legibilidade do texto à esquerda */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#001e16] via-[#001e16]/70 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:flex lg:min-h-[640px] lg:items-center lg:py-0">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-16 lg:w-full">

          {/* Coluna de texto */}
          <div className="flex max-w-[540px] flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            <h1 className="font-display text-4xl font-bold text-balance text-white sm:text-5xl lg:text-6xl">
              Transforme seu WhatsApp em uma{" "}
              <span className="text-green-400">loja online.</span>
            </h1>

            <p className="max-w-xl text-lg text-pretty text-white/75 sm:text-xl">
              Crie sua loja online, receba pedidos pelo WhatsApp e venda sem pagar comissão por pedido.
            </p>

            <p className="text-sm font-medium text-white/50">
              Sua loja profissional pronta em poucos minutos.
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row lg:items-start">
              <Button
                size="lg"
                className="rounded-full gap-2 px-8 text-base bg-green-500 text-black font-bold hover:bg-green-400"
                render={<Link href="/cadastro" />}
                nativeButton={false}
              >
                Criar minha loja grátis
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="rounded-full gap-2 text-white/80 hover:text-white hover:bg-white/10"
                render={<a href="#demonstracao" />}
                nativeButton={false}
              >
                Ver como funciona
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 lg:justify-start">
              {BADGES.map((badge) => (
                <span key={badge} className="flex items-center gap-1.5 text-sm text-white/60">
                  <span className="text-green-400 font-bold">✓</span>
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Hero01 visível apenas no mobile/tablet (no desktop já está no background) */}
          <div className="flex w-full justify-center lg:hidden">
            <Image
              src="/hero01.png"
              alt="Exemplos de lojas criadas na Hotview"
              width={320}
              height={560}
              priority
              className="w-full max-w-[320px] rounded-2xl shadow-2xl"
            />
          </div>

        </div>
      </div>
    </section>
  )
}
