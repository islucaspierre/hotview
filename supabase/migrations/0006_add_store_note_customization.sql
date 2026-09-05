-- 0006_add_store_note_customization.sql
-- A pergunta/exemplo do campo de observação do produto era fixa e voltada
-- pra comida ("Alguma observação?" / "Ex: sem cebola..."), mas o app atende
-- vários segmentos (papelaria, etc.). Deixa configurável por loja.
alter table stores add column if not exists note_label text;
alter table stores add column if not exists note_placeholder text;
