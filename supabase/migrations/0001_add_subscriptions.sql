-- 0001_add_subscriptions.sql
-- Assinatura Asaas: trial de 15 dias + paywall (edição bloqueada no dia 15,
-- vitrine pública bloqueada no dia 20). Idempotente: seguro rodar mais de uma vez.

create extension if not exists pgcrypto;

-- 1. subscriptions -----------------------------------------------------------
create table if not exists subscriptions (
  id                    uuid primary key default gen_random_uuid(),
  store_id              uuid not null unique references stores(id) on delete cascade,
  status                text not null default 'trialing'
                          check (status in ('trialing','active','past_due','canceled')),
  trial_ends_at         timestamptz not null,
  current_period_end    timestamptz,
  billing_type          text check (billing_type in ('PIX','CREDIT_CARD')),
  cpf_cnpj              text,
  asaas_customer_id     text,
  asaas_subscription_id text,
  canceled_at           timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists subscriptions_asaas_subscription_id_idx
  on subscriptions (asaas_subscription_id);
create index if not exists subscriptions_asaas_customer_id_idx
  on subscriptions (asaas_customer_id);
create index if not exists subscriptions_status_idx
  on subscriptions (status);

create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists subscriptions_set_updated_at on subscriptions;
create trigger subscriptions_set_updated_at
  before update on subscriptions
  for each row execute function set_updated_at();

alter table subscriptions enable row level security;

drop policy if exists "owners can read own subscription" on subscriptions;
create policy "owners can read own subscription" on subscriptions
  for select
  using (exists (
    select 1 from stores
    where stores.id = subscriptions.store_id
      and stores.owner_id = auth.uid()
  ));
-- Sem policy de insert/update/delete para authenticated/anon: só o service role
-- (usado pelas rotas de API) escreve nesta tabela.

-- 2. dedupe de eventos de webhook --------------------------------------------
create table if not exists asaas_webhook_events (
  dedupe_key   text primary key,
  event_type   text not null,
  payload      jsonb not null,
  status       text not null default 'processing' check (status in ('processing','done','failed')),
  created_at   timestamptz not null default now()
);

alter table asaas_webhook_events enable row level security;
-- Sem policies: só o service role acessa esta tabela.

-- 3. lógica única de bloqueio -------------------------------------------------
create or replace function subscription_locks(
  p_status text,
  p_trial_ends_at timestamptz,
  p_current_period_end timestamptz
) returns table(editing_locked boolean, storefront_locked boolean)
language sql stable as $$
  select
    case
      when p_status = 'active'   then false
      when p_status = 'trialing' then now() > p_trial_ends_at
      when p_status = 'past_due' then p_current_period_end is not null and now() > p_current_period_end
      when p_status = 'canceled' then true
      else false
    end,
    case
      when p_status = 'active'   then false
      when p_status = 'trialing' then now() > (p_trial_ends_at + interval '5 days')
      when p_status = 'past_due' then p_current_period_end is not null and now() > (p_current_period_end + interval '5 days')
      when p_status = 'canceled' then true
      else false
    end
$$;

-- 4. view para o dono da loja (respeita RLS de subscriptions) ----------------
create or replace view owner_subscription_view
  with (security_invoker = true) as
select
  s.*,
  l.editing_locked,
  l.storefront_locked
from subscriptions s
cross join lateral subscription_locks(s.status, s.trial_ends_at, s.current_period_end) l;

grant select on owner_subscription_view to authenticated;

-- 5. checagem pública (sem expor dado financeiro) -----------------------------
create or replace function is_store_locked(p_slug text)
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select l.storefront_locked
     from stores st
     join subscriptions s on s.store_id = st.id
     cross join lateral subscription_locks(s.status, s.trial_ends_at, s.current_period_end) l
     where st.slug = p_slug),
    false
  )
$$;

grant execute on function is_store_locked(text) to anon, authenticated;

-- 6. trigger de bootstrap: toda loja nasce com um trial ----------------------
create or replace function bootstrap_subscription_for_store() returns trigger
language plpgsql as $$
begin
  insert into subscriptions (store_id, status, trial_ends_at)
  values (new.id, 'trialing', now() + interval '15 days')
  on conflict (store_id) do nothing;
  return new;
end;
$$;

drop trigger if exists stores_bootstrap_subscription on stores;
create trigger stores_bootstrap_subscription
  after insert on stores
  for each row execute function bootstrap_subscription_for_store();

-- 7. trigger de bloqueio real (a trava à prova de burla) ---------------------
create or replace function enforce_subscription_active() returns trigger
language plpgsql as $$
declare
  v_store_id uuid;
  v_sub subscriptions%rowtype;
  v_locked boolean;
begin
  v_store_id := case
    when TG_TABLE_NAME = 'stores' then new.id
    else new.store_id
  end;

  select * into v_sub from subscriptions where store_id = v_store_id;

  if not found then
    -- Sem linha de assinatura: não trava (evita quebrar tudo por dado ausente).
    return new;
  end if;

  select editing_locked into v_locked
  from subscription_locks(v_sub.status, v_sub.trial_ends_at, v_sub.current_period_end);

  if v_locked then
    raise exception 'SUBSCRIPTION_LOCKED: assine para continuar editando sua vitrine'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

-- stores: só bloqueia UPDATE (o INSERT inicial tem que ficar livre, é o que
-- dispara o trial via bootstrap_subscription_for_store).
drop trigger if exists stores_enforce_subscription on stores;
create trigger stores_enforce_subscription
  before update on stores
  for each row execute function enforce_subscription_active();

drop trigger if exists categories_enforce_subscription on categories;
create trigger categories_enforce_subscription
  before insert or update on categories
  for each row execute function enforce_subscription_active();

drop trigger if exists products_enforce_subscription on products;
create trigger products_enforce_subscription
  before insert or update on products
  for each row execute function enforce_subscription_active();

-- 8. backfill: lojas existentes ganham 15 dias de trial a partir de agora ----
insert into subscriptions (store_id, status, trial_ends_at)
select st.id, 'trialing', now() + interval '15 days'
from stores st
where not exists (select 1 from subscriptions sub where sub.store_id = st.id);
