const faqs = [
  {
    question: "Preciso saber programar ou mexer com tecnologia?",
    answer:
      "Não. Você monta a vitrine direto do celular ou computador, escolhendo tema, produtos e fotos — sem precisar de desenvolvedor.",
  },
  {
    question: "Preciso ter CNPJ?",
    answer: "Não. Você pode assinar usando seu CPF normalmente.",
  },
  {
    question: "Como funciona o pagamento?",
    answer:
      "Você usa a Hotview de graça por 15 dias, sem informar cartão. Depois do teste, a assinatura é de R$ 39,70/mês via Pix ou cartão de crédito, direto pelo painel.",
  },
  {
    question: "Posso cancelar quando quiser?",
    answer: "Sim, o cancelamento é feito direto no painel, sem burocracia e sem fidelidade.",
  },
  {
    question: "Vocês cobram comissão por pedido?",
    answer:
      "Não. Você paga só a mensalidade fixa — o pedido do cliente vai direto para o seu WhatsApp, sem intermediário.",
  },
  {
    question: "O que acontece se eu não assinar depois do teste grátis?",
    answer:
      "Sua vitrine continua existindo, mas a edição do cardápio fica bloqueada até você assinar. Alguns dias depois, a página pública também sai do ar até a assinatura ser regularizada.",
  },
]

export function FaqSection() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-display text-3xl font-bold text-balance text-foreground sm:text-4xl">
          Perguntas frequentes
        </h2>
      </div>

      <div className="mt-10 flex flex-col divide-y divide-border/60 rounded-2xl border border-border/60 bg-card">
        {faqs.map((faq) => (
          <details key={faq.question} className="group px-6 py-4 open:pb-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-foreground marker:content-none">
              {faq.question}
              <span className="shrink-0 text-lg leading-none text-muted-foreground transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-2 text-pretty text-sm text-muted-foreground">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
