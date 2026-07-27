-- Cree Ser — soporte para Billpocket (Flex / Basic Gateway) como pasarela alterna a
-- Mercado Pago. No reemplaza nada existente, solo agrega columnas para poder
-- distinguir qué pasarela procesó cada pago/suscripción.

alter table public.pagos
  add column if not exists pasarela text check (pasarela in ('mercadopago', 'billpocket')),
  add column if not exists bp_transaction_id text;

alter table public.suscripciones
  add column if not exists pasarela text not null default 'mercadopago' check (pasarela in ('mercadopago', 'billpocket')),
  add column if not exists bp_contract_number text,
  add column if not exists bp_card_token text;

-- Pagos ya existentes hechos con Mercado Pago (tienen mp_preference_id o mp_payment_id):
-- se etiquetan retroactivamente para que el panel admin los muestre bien.
update public.pagos
  set pasarela = 'mercadopago'
  where pasarela is null and (mp_preference_id is not null or mp_payment_id is not null);
