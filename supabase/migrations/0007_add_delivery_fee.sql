-- Adiciona taxa de entrega padrão configurável pelo lojista
ALTER TABLE stores ADD COLUMN IF NOT EXISTS delivery_fee numeric(10,2) NOT NULL DEFAULT 0;
