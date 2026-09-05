"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

export function LoginForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError("")
    const form = new FormData(event.currentTarget)
    const { error } = await createClient().auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    })
    if (error) {
      setError(error.message.toLowerCase().includes("confirm") ? "Confirme seu e-mail antes de entrar." : "E-mail ou senha inválidos.")
      setIsSubmitting(false)
      return
    }
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {error ? <FieldDescription className="text-destructive">{error}</FieldDescription> : null}
            <Field>
              <FieldLabel htmlFor="login-email">E-mail</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Mail />
                </InputGroupAddon>
                <InputGroupInput
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="voce@exemplo.com"
                  autoComplete="email"
                  required
                />
              </InputGroup>
            </Field>

            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="login-password">Senha</FieldLabel>
                <Link
                  href="#"
                  className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <InputGroup>
                <InputGroupAddon>
                  <Lock />
                </InputGroupAddon>
                <InputGroupInput
                  id="login-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </InputGroup>
            </Field>

            <Field>
              <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Spinner />
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="size-4" data-icon="inline-end" />
                  </>
                )}
              </Button>
            </Field>

            <FieldSeparator>ou</FieldSeparator>

            <FieldDescription className="text-center">
              Ainda não tem uma vitrine?{" "}
              <Link href="/cadastro" className="font-medium text-primary">
                Crie a sua gratuitamente
              </Link>
            </FieldDescription>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
