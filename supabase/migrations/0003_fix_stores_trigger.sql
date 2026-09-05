-- 0003_fix_stores_trigger.sql
-- Corrige um bug real: enforce_subscription_active() usava uma única função
-- para stores/categories/products com `case ... else new.store_id end`.
-- Como NEW é do tipo RECORD genérico (a mesma função serve tabelas
-- diferentes), o Postgres tenta resolver `new.store_id` mesmo no branch não
-- tomado quando a tabela é "stores" — e "stores" não tem coluna store_id
-- (tem "id"). Resultado: TODA atualização de stores falhava com
-- 'record "new" has no field "store_id"', quebrando silenciosamente
-- "Salvar alterações" e "Usar vitrine pronta" desde que o trigger foi criado.
-- Correção: uma função dedicada por tabela, cada uma só referenciando campos
-- que realmente existem no seu próprio NEW.

create or replace function enforce_subscription_active_store() returns trigger
language plpgsql as $$
declare
  v_sub subscriptions%rowtype;
  v_locked boolean;
begin
  select * into v_sub from subscriptions where store_id = new.id;

  if not found then
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

create or replace function enforce_subscription_active_child() returns trigger
language plpgsql as $$
declare
  v_sub subscriptions%rowtype;
  v_locked boolean;
begin
  select * into v_sub from subscriptions where store_id = new.store_id;

  if not found then
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

drop trigger if exists stores_enforce_subscription on stores;
create trigger stores_enforce_subscription
  before update on stores
  for each row execute function enforce_subscription_active_store();

drop trigger if exists categories_enforce_subscription on categories;
create trigger categories_enforce_subscription
  before insert or update on categories
  for each row execute function enforce_subscription_active_child();

drop trigger if exists products_enforce_subscription on products;
create trigger products_enforce_subscription
  before insert or update on products
  for each row execute function enforce_subscription_active_child();

-- A função antiga fica sem nenhum trigger apontando pra ela; removê-la.
drop function if exists enforce_subscription_active();
