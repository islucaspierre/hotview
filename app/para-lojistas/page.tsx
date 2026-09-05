import type { Metadata } from "next"
import { LandingHeader } from "@/components/landing/landing-header"
import { LandingHero } from "@/components/landing/landing-hero"
import { QuickProofSection } from "@/components/landing/quick-proof-section"
import { DemoSection } from "@/components/landing/demo-section"
import { PainPointsSection } from "@/components/landing/pain-points-section"
import { SolutionSection } from "@/components/landing/solution-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { CasesSection } from "@/components/landing/cases-section"
import { MarketplaceSection } from "@/components/landing/marketplace-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { FaqSection } from "@/components/landing/faq-section"
import { FinalCtaSection } from "@/components/landing/final-cta-section"
import { LandingFooter } from "@/components/landing/landing-footer"

export const metadata: Metadata = {
  title: "Hotview | Loja online para vender pelo WhatsApp",
  description:
    "Crie sua loja online, receba pedidos pelo WhatsApp e venda sem pagar comissão por pedido. 15 dias grátis.",
}

export default function ParaLojistasPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <QuickProofSection />
        <DemoSection />
        <PainPointsSection />
        <SolutionSection />
        <HowItWorksSection />
        <FeaturesSection />
        <CasesSection />
        <MarketplaceSection />
        <PricingSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
