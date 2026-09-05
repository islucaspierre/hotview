import type { Metadata } from "next"
import { LandingHeader } from "@/components/landing/landing-header"
import { LandingHero } from "@/components/landing/landing-hero"
import { PainPointsSection } from "@/components/landing/pain-points-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { SegmentsSection } from "@/components/landing/segments-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { DemoSection } from "@/components/landing/demo-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { FaqSection } from "@/components/landing/faq-section"
import { FinalCtaSection } from "@/components/landing/final-cta-section"
import { LandingFooter } from "@/components/landing/landing-footer"

export const metadata: Metadata = {
  title: "Hotview | Vitrine digital para vender pelo WhatsApp",
  description:
    "Uma plataforma para pequenos negócios criarem sua própria vitrine digital e venderem diretamente pelo WhatsApp.",
}

export default function ParaLojistasPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <PainPointsSection />
        <HowItWorksSection />
        <SegmentsSection />
        <FeaturesSection />
        <DemoSection />
        <PricingSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
