# Cálculo de frete real (Melhor Envio) — a implementar no futuro

## Contexto

Hoje o app não tem nenhum campo de taxa de entrega — só um texto de "tempo de entrega"
(editável em Personalização desde 25/08/2026). Isso funciona bem pra negócios locais
(comida, entrega própria), mas não resolve para lojistas que vendem pro Brasil inteiro
e despacham por transportadora — caso de uma usuária de papelaria em teste, que hoje
usa a plataforma Melhor Envio com a transportadora J&T na cidade dela.

Pedido dela: o cliente final informa o CEP no carrinho e vê o valor real do frete antes
de fechar o pedido pelo WhatsApp.

## Opções consideradas

1. **Taxa fixa por loja** — simples, mas não varia por região. Não resolve o caso.
2. **Tabela de regiões/estados** — a lojista define um valor por região (ex: Sudeste
   R$15, Sul R$20, resto do Brasil R$25). Sem custo/dependência externa, mas é uma
   aproximação, não o valor real da transportadora.
3. **Integração real via Melhor Envio** (escolhida como objetivo final) — usa a
   tarifa contratada de cada lojista com a transportadora dela.

## O que a pesquisa da API do Melhor Envio mostrou

- Endpoint de cotação: `POST /api/v2/me/shipment/calculate` (o `/me/` indica que o
  cálculo usa a conta e as tarifas contratadas de quem está autenticado — não dá pra
  usar uma chave única da plataforma pra todo mundo).
- Autenticação: **OAuth2**. É preciso cadastrar um "aplicativo" no painel de
  desenvolvedor do Melhor Envio (isso gera `client_id` e `client_secret`), e **cada
  lojista autoriza esse aplicativo a acessar a própria conta dela** — mesmo modelo que
  já usamos pra outras integrações neste app.
- Token de acesso dura 30 dias; o `refresh_token` dura 45 dias — precisa de rotina de
  renovação (ou renovar sob demanda quando expira).
- Corpo da requisição de cotação precisa de: CEP de origem (`from.postal_code`), CEP
  de destino (`to.postal_code`), e itens com peso (kg) + dimensões (altura/largura/
  comprimento em cm) + valor declarado (`insurance_value`). **Hoje o cadastro de
  produto não tem peso nem dimensões.**
- Resposta: lista de opções de transportadora/serviço, cada uma com preço e prazo
  estimado — a lojista/cliente escolhe uma.
- Documentação oficial: https://docs.melhorenvio.com.br/

## Bloqueio para começar

Alguém (a Tetra Educação ou a própria usuária) precisa criar um aplicativo no painel
de desenvolvedor do Melhor Envio (docs.melhorenvio.com.br) para gerar:
- `client_id`
- `client_secret`
- Definir a **redirect URI** de callback (ex: `https://v0-hotview.vercel.app/api/melhor-envio/callback`)

Sem isso não dá pra implementar nada — é o mesmo tipo de credencial que a Asaas exigiu
antes de integrarmos as assinaturas.

## Plano de implementação (quando os dados acima existirem)

Seguindo o mesmo padrão já usado pra Asaas neste app:

1. **Schema** (migration nova):
   - Tabela `shipping_connections` (ou colunas em `stores`): `store_id`, `access_token`,
     `refresh_token`, `expires_at`, `origin_postal_code` (CEP de onde ela despacha).
   - Colunas novas em `products`: `weight_kg`, `width_cm`, `height_cm`, `length_cm`
     (nullable — só obrigatório pra quem usar cálculo real de frete).
2. **Conexão OAuth2** (`app/api/melhor-envio/connect` + `app/api/melhor-envio/callback`,
   Route Handlers, seguindo o padrão de `app/api/subscriptions`): fluxo de autorização,
   troca do `code` pelo `access_token`/`refresh_token`, salvar vinculado à loja.
3. **Renovação de token**: checar `expires_at` antes de cada cotação; se perto de
   expirar, renovar via `refresh_token` antes de chamar a API de cálculo.
4. **Formulário de produto**: campos opcionais de peso/dimensões (só aparecem/são
   exigidos se a loja tiver o Melhor Envio conectado).
5. **Personalização**: campo pra CEP de origem (de onde ela despacha) + botão
   "Conectar Melhor Envio".
6. **Carrinho do cliente**: campo de CEP + botão "Calcular frete", chamando uma rota
   própria (`app/api/melhor-envio/calculate`) que usa o token da loja pra cotar via
   `/api/v2/me/shipment/calculate`, mostra as opções e soma ao total antes de montar
   a mensagem do WhatsApp.
7. **Fallback**: lojas sem Melhor Envio conectado continuam como hoje (sem cálculo de
   frete, ou usando uma taxa fixa/tabela de região se decidirmos implementar isso como
   alternativa mais simples em paralelo).

## Perguntas em aberto pra quando for implementar

- Isso deve ficar disponível pra **todo lojista** ou só faz sentido pra quem vende
  fora da própria cidade (evitar complexidade desnecessária pra quem usa entrega local)?
- Vale implementar a opção mais simples (tabela de regiões) primeiro, como fallback
  pra quem não quiser conectar o Melhor Envio?
- Como tratar produtos sem peso/dimensão cadastrados quando o cálculo de frete real
  estiver ativo (bloquear o cálculo, ou usar um valor padrão)?
