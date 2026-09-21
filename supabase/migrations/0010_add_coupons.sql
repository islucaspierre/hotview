-- 0010_add_coupons.sql
-- Cupons de desconto por loja.
-- Idempotente: seguro rodar mais de uma vez.

create table if not exists coupons (
  id           uuid primary key default gen_random_uuid(),
  store_id     uuid not null references stores(id) on delete cascade,
  code         text not null,
  type         text not null check (type in ('percent', 'fixed')),
  value        numeric(10,2) not null check (value > 0),
  min_order    numeric(10,2),
  max_uses     int,
  uses_count   int not null default 0,
  expires_at   timestamptz,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  unique (store_id, code)
);

alter table coupons enable row level security;

-- Dono da loja pode criar/ler/atualizar/deletar seus próprios cupons
drop policy if exists "owner full access on coupons" on coupons;
create policy "owner full access on coupons" on coupons
  for all
  to authenticated
  using (
    store_id in (select id from stores where owner_id = auth.uid())
  )
  with check (
    store_id in (select id from stores where owner_id = auth.uid())
  );

-- Clientes anônimos podem validar cupons (leitura por code + store_id)
drop policy if exists "anon can validate coupons" on coupons;
create policy "anon can validate coupons" on coupons
  for select
  to anon, authenticated
  using (active = true);

-- Função para incrementar o uso de um cupom (chamada após pedido enviado)
create or replace function increment_coupon_uses(p_store_id uuid, p_code text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  update coupons
  set uses_count = uses_count + 1
  where store_id = p_store_id
    and code = upper(trim(p_code))
    and active = true;
end;
$$;

grant execute on function increment_coupon_uses(uuid, text) to anon, authenticated;
