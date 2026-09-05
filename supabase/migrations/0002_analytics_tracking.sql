-- 0002_analytics_tracking.sql
-- Liga o dashboard a dados reais: visualizações da vitrine pública e
-- pedidos iniciados/enviados, usando as tabelas que já existiam
-- (store_metrics_daily, orders) mas nunca eram escritas pelo app.
-- Idempotente: seguro rodar mais de uma vez.

-- 1. Função central de incremento diário (SECURITY DEFINER: store_metrics_daily
--    só tem policy de escrita para o dono da loja, não para "anon"). ----------
create or replace function record_store_metric(p_store_id uuid, p_kind text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_kind = 'view' then
    insert into store_metrics_daily (store_id, metric_date, views)
      values (p_store_id, current_date, 1)
      on conflict (store_id, metric_date) do update set views = store_metrics_daily.views + 1;
  elsif p_kind = 'order_started' then
    insert into store_metrics_daily (store_id, metric_date, orders_started)
      values (p_store_id, current_date, 1)
      on conflict (store_id, metric_date) do update set orders_started = store_metrics_daily.orders_started + 1;
  elsif p_kind = 'order_sent' then
    insert into store_metrics_daily (store_id, metric_date, orders_sent)
      values (p_store_id, current_date, 1)
      on conflict (store_id, metric_date) do update set orders_sent = store_metrics_daily.orders_sent + 1;
  end if;
end;
$$;

-- 2. Visualização da vitrine pública: chamada pela página /loja/[slug] -------
create or replace function record_store_view(p_slug text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_store_id uuid;
begin
  select id into v_store_id from stores where slug = p_slug;
  if v_store_id is not null then
    perform record_store_metric(v_store_id, 'view');
  end if;
end;
$$;

grant execute on function record_store_view(text) to anon, authenticated;

-- 3. Pedido iniciado/enviado: dispara sozinho quando o app grava em "orders" -
create or replace function sync_order_metrics() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'INSERT' then
    if new.status = 'started' then
      perform record_store_metric(new.store_id, 'order_started');
    elsif new.status = 'sent' then
      perform record_store_metric(new.store_id, 'order_sent');
    end if;
  elsif TG_OP = 'UPDATE' and new.status = 'sent' and old.status is distinct from 'sent' then
    perform record_store_metric(new.store_id, 'order_sent');
  end if;
  return new;
end;
$$;

drop trigger if exists orders_sync_metrics on orders;
create trigger orders_sync_metrics
  after insert or update on orders
  for each row execute function sync_order_metrics();

-- 4. Agregações para "produto mais vendido" / "adicionais mais pedidos" ------
-- SECURITY INVOKER (padrão): respeita a RLS de quem chama, então cada dono só
-- enxerga os pedidos da própria loja — igual já acontece hoje lendo "orders".
create or replace function get_top_product(p_store_id uuid, p_since timestamptz)
returns table(product_name text, total_quantity bigint)
language sql stable as $$
  select oi.product_name, sum(oi.quantity)::bigint as total_quantity
  from order_items oi
  join orders o on o.id = oi.order_id
  where o.store_id = p_store_id and o.status = 'sent' and o.created_at >= p_since
  group by oi.product_name
  order by total_quantity desc
  limit 1
$$;

create or replace function get_top_addons(p_store_id uuid, p_since timestamptz, p_limit int default 3)
returns table(addon_name text, uses bigint)
language sql stable as $$
  select oia.addon_name, count(*)::bigint as uses
  from order_item_addons oia
  join order_items oi on oi.id = oia.order_item_id
  join orders o on o.id = oi.order_id
  where o.store_id = p_store_id and o.status = 'sent' and o.created_at >= p_since
  group by oia.addon_name
  order by uses desc
  limit p_limit
$$;

grant execute on function get_top_product(uuid, timestamptz) to authenticated;
grant execute on function get_top_addons(uuid, timestamptz, int) to authenticated;

-- 5. Backfill: os pedidos "sent" que já existem não passaram pelo trigger ----
-- (só dispara para inserts/updates novos). Recalcula o total real a partir de
-- "orders" (fonte da verdade) e SOBRESCREVE orders_sent — não soma — então
-- rodar este arquivo de novo não conta em dobro.
insert into store_metrics_daily (store_id, metric_date, orders_sent)
select store_id, created_at::date, count(*)
from orders
where status = 'sent'
group by store_id, created_at::date
on conflict (store_id, metric_date) do update
  set orders_sent = excluded.orders_sent;
