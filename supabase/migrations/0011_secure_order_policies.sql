-- 0011_secure_order_policies.sql
-- Orders e order_items agora são inseridos server-side via /api/order/create.
-- Coupons são validados server-side via /api/coupon/validate.
-- Remove as políticas anon que expunham inserção livre e enumeração de cupons.

drop policy if exists "anon can insert orders" on orders;
drop policy if exists "anon can insert order_items" on order_items;
drop policy if exists "anon can insert order_item_addons" on order_item_addons;
drop policy if exists "anon can validate coupons" on coupons;
