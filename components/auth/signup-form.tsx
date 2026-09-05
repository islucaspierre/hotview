"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, Store, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldSeparator,
} from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { createClient } from "@/lib/supabase/client"

export function SignupForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    const form = new FormData(event.currentTarget)
    const storeName = String(form.get("storeName"))
    const { data, error } = await createClient().auth.signUp({
      email: String(form.get("email")),
      password: String(form.get("password")),
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
        data: { store_name: storeName, full_name: storeName },
      },
    })
    if (error) {
      setMessage(error.message.toLowerCase().includes("already") ? "Este e-mail já possui uma conta." : "Não foi possível criar sua conta. Verifique os dados e tente novamente.")
      setIsSubmitting(false)
      return
    }
    if (data.session) router.push("/dashboard")
    else setMessage("Conta criada. Confira seu e-mail para confirmar o cadastro.")
    setIsSubmitting(false)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {message ? <FieldDescription className="text-primary">{message}</FieldDescription> : null}
            <Field>
              <FieldLabel htmlFor="signup-store">Nome da loja</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Store />
                </InputGroupAddon>
                <InputGroupInput
                  id="signup-store"
                  name="storeName"
                  type="text"
                  placeholder="Nome do seu negócio"
                  autoComplete="organization"
                  required
                />
              </InputGroup>
            </Field>

            <Field>
              <FieldLabel htmlFor="signup-email">E-mail</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Mail />
                </InputGroupAddon>
                <InputGroupInput
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder="voce@exemplo.com"
                  autoComplete="email"
                  required
                />
              </InputGroup>
            </Field>

            <Field>
              <FieldLabel htmlFor="signup-password">Senha</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Lock />
                </InputGroupAddon>
                <InputGroupInput
                  id="signup-password"
                  name="password"
                  type="password"
                  placeholder="Mínimo de 8 caracteres"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </InputGroup>
              <FieldDescription>Use pelo menos 8 caracteres.</FieldDescription>
            </Field>

            <Field>
              <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Spinner />
                ) : (
                  <>
                    Criar minha vitrine
                    <ArrowRight className="size-4" data-icon="inline-end" />
                  </>
                )}
              </Button>
            </Field>

            <FieldDescription className="text-center">
              Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade.
            </FieldDescription>

            <FieldSeparator>ou</FieldSeparator>

            <p className="text-center text-sm text-foreground">
              Já tem uma conta?{" "}
              <Link href="/entrar" className="font-semibold text-primary underline underline-offset-4">
                Entrar
              </Link>
            </p>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
