-- 0008_orders_anon_insert_policy.sql
-- Permite que clientes anônimos (vitrine pública) registrem pedidos.
-- Idempotente: DROP IF EXISTS antes de cada CREATE POLICY.

-- orders: qualquer visitante pode inserir; só o dono da loja lê.
alter table orders enable row level security;

drop policy if exists "anon can insert orders" on orders;
create policy "anon can insert orders" on orders
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "owner can read own store orders" on orders;
create policy "owner can read own store orders" on orders
  for select
  to authenticated
  using (
    store_id in (
      select id from stores where owner_id = auth.uid()
    )
  );

-- order_items: vinculado ao pedido inserido acima.
alter table order_items enable row level security;

drop policy if exists "anon can insert order_items" on order_items;
create policy "anon can insert order_items" on order_items
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "owner can read own order_items" on order_items;
create policy "owner can read own order_items" on order_items
  for select
  to authenticated
  using (
    order_id in (
      select o.id from orders o
      join stores s on s.id = o.store_id
      where s.owner_id = auth.uid()
    )
  );

-- order_item_addons: vinculado ao order_item inserido acima.
alter table order_item_addons enable row level security;

drop policy if exists "anon can insert order_item_addons" on order_item_addons;
create policy "anon can insert order_item_addons" on order_item_addons
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "owner can read own order_item_addons" on order_item_addons;
create policy "owner can read own order_item_addons" on order_item_addons
  for select
  to authenticated
  using (
    order_item_id in (
      select oi.id from order_items oi
      join orders o on o.id = oi.order_id
      join stores s on s.id = o.store_id
      where s.owner_id = auth.uid()
    )
  );
