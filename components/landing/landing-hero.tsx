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

      {/* Mobile: texto em cima, imagem embaixo */}
      <div className="relative z-10 lg:hidden">
        <div className="flex flex-col items-center gap-6 px-5 pt-12 pb-8 text-center">
          <h1 className="font-display text-4xl font-bold text-balance text-white">
            Transforme seu WhatsApp em uma{" "}
            <span className="text-green-400">loja online.</span>
          </h1>
          <p className="text-base text-pretty text-white/75">
            Crie sua loja online, receba pedidos pelo WhatsApp e venda sem pagar comissão por pedido.
          </p>
          <div className="flex flex-col items-center gap-3 w-full">
            <Button
              size="lg"
              className="w-full rounded-full gap-2 text-base bg-green-500 text-black font-bold hover:bg-green-400"
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
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {BADGES.map((badge) => (
              <span key={badge} className="flex items-center gap-1.5 text-sm text-white/60">
                <span className="text-green-400 font-bold">✓</span>
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Imagem dos telefones — altura fixa para não dominar a tela */}
        <div className="relative h-[340px] w-full overflow-hidden">
          <Image
            src="/hero01.png"
            alt="Exemplos de lojas criadas na Hotview"
            fill
            priority
            className="object-cover object-center"
          />
          {/* Fades para integrar com o fundo */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#001e16] to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#001e16] to-transparent" />
        </div>
      </div>

      {/* Desktop: background Hero02 + texto à esquerda */}
      <div className="relative z-10 mx-auto hidden max-w-6xl px-6 lg:flex lg:min-h-[640px] lg:items-center">
        <div className="flex max-w-[540px] flex-col items-start gap-6 text-left">
          <h1 className="font-display text-5xl font-bold text-balance text-white xl:text-6xl">
            Transforme seu WhatsApp em uma{" "}
            <span className="text-green-400">loja online.</span>
          </h1>
          <p className="text-xl text-pretty text-white/75">
            Crie sua loja online, receba pedidos pelo WhatsApp e venda sem pagar comissão por pedido.
          </p>
          <p className="text-sm font-medium text-white/50">
            Sua loja profissional pronta em poucos minutos.
          </p>
          <div className="flex items-center gap-3">
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
          <div className="flex flex-wrap gap-x-5 gap-y-1.5">
            {BADGES.map((badge) => (
              <span key={badge} className="flex items-center gap-1.5 text-sm text-white/60">
                <span className="text-green-400 font-bold">✓</span>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
