-- 0004_fix_bootstrap_trigger_rls.sql
-- Bug crítico: bootstrap_subscription_for_store() não era SECURITY DEFINER,
-- então rodava com o privilégio do usuário comum (sem policy de INSERT em
-- subscriptions, de propósito — só o service role deveria escrever ali).
-- Resultado: toda criação de loja nova (INSERT em stores) disparava o
-- trigger, que tentava inserir em subscriptions, era barrado pela RLS, e a
-- transação inteira da criação da loja falhava. Isso quebrava a conta de
-- QUALQUER usuário novo desde que a migration 0001 foi aplicada.

create or replace function bootstrap_subscription_for_store() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into subscriptions (store_id, status, trial_ends_at)
  values (new.id, 'trialing', now() + interval '15 days')
  on conflict (store_id) do nothing;
  return new;
end;
$$;
