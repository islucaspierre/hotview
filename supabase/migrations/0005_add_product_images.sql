-- 0005_add_product_images.sql
-- Permite mais de uma foto por produto. "image" continua sendo a foto
-- principal (capa, usada nas listas); "images" guarda fotos adicionais,
-- mostradas em galeria na página do produto.
alter table products add column if not exists images text[] not null default '{}'::text[];
