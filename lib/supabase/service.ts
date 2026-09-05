import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Client com a service role key — ignora RLS. Usar SÓ em Route Handlers
// (webhook e rotas de assinatura), nunca em código que roda no navegador.
export function createServiceClient() {
  return createSupabaseClient(
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}
