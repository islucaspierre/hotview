-- 0009_add_pix_key.sql
-- Adiciona chave Pix à loja para pagamento estático no checkout da vitrine.
-- Idempotente: seguro rodar mais de uma vez.

alter table stores add column if not exists pix_key text;
