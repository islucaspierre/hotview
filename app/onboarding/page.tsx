import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"

export const metadata = {
  title: "Configurar vitrine | Hotview",
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/entrar")

  const { data: store } = await supabase
    .from("stores")
    .select("id, name, slug, whatsapp")
    .eq("owner_id", user.id)
    .maybeSingle()

  if (!store) redirect("/dashboard")
  if (store.whatsapp) redirect("/dashboard")

  return (
    <OnboardingWizard
      storeId={store.id}
      initialName={store.name}
      initialSlug={store.slug}
    />
  )
}
