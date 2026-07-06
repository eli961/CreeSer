-- Cree Ser — esquema inicial
-- Ejecutar en el SQL editor de Supabase, o con `supabase db push`.

create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES (alumnas / admin) — 1:1 con auth.users
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null default '',
  email text not null,
  telefono text,
  edad int,
  grupo text check (grupo in ('manana','tarde','ambas')),
  rol text not null default 'alumna' check (rol in ('alumna','admin')),
  estado_inscripcion text not null default 'pendiente' check (estado_inscripcion in ('pendiente','pagada','confirmada')),
  created_at timestamptz not null default now()
);

-- Crea el profile automáticamente cuando alguien se registra en Supabase Auth.
-- El login es con Google: su nombre llega en el metadata OAuth como "full_name"
-- o "name" (no "nombre", que era el campo del signup por correo/contraseña que
-- ya no se usa, pero se deja como último recurso por compatibilidad).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, email)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'nombre',
      split_part(new.email,'@',1)
    ),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- PAGOS
-- ============================================================
create table if not exists public.pagos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.profiles(id) on delete cascade,
  tipo text not null check (tipo in ('inscripcion','mensualidad')),
  monto numeric(10,2) not null,
  moneda text not null default 'MXN',
  periodo text, -- "2026-08" para mensualidad
  metodo text not null check (metodo in ('tarjeta','transferencia')),
  estado text not null default 'pendiente' check (estado in ('pendiente','pagado','vencido','rechazado')),
  comprobante_url text,
  mp_payment_id text,
  mp_preference_id text,
  created_at timestamptz not null default now(),
  pagado_en timestamptz
);
create index if not exists pagos_usuario_idx on public.pagos(usuario_id);

-- ============================================================
-- SUSCRIPCIONES (mensualidad recurrente vía Mercado Pago preapproval)
-- ============================================================
create table if not exists public.suscripciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.profiles(id) on delete cascade,
  mp_preapproval_id text,
  estado text not null default 'pendiente' check (estado in ('pendiente','activa','vencida','cancelada')),
  plan text not null check (plan in ('manana','tarde')),
  monto numeric(10,2) not null,
  proximo_cobro date,
  created_at timestamptz not null default now()
);
create index if not exists suscripciones_usuario_idx on public.suscripciones(usuario_id);

-- ============================================================
-- CLASES (alimenta el calendario)
-- ============================================================
create table if not exists public.clases (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  grupo text not null check (grupo in ('manana','tarde')),
  orden int not null default 1, -- 1 = 11:30, 2 = 12:40 (Tardes siempre 1)
  hora text not null,
  tema text not null default '',
  ponente text not null default '',
  unique (fecha, grupo, orden)
);
create index if not exists clases_fecha_idx on public.clases(fecha);

-- ============================================================
-- AVISOS
-- ============================================================
create table if not exists public.avisos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  texto text not null default '',
  activo boolean not null default true,
  orden int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- FECHAS IMPORTANTES (jaguim)
-- ============================================================
create table if not exists public.fechas_importantes (
  fecha date primary key,
  etiqueta text not null
);

-- ============================================================
-- GRABACIONES
-- ============================================================
create table if not exists public.grabaciones (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  pilar int,
  tema_hebreo text,
  tema_filtro text not null default 'asher',
  url_video text,
  duracion text,
  thumbnail text,
  publicada boolean not null default true,
  orden int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Helper: ¿el usuario autenticado es admin?
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and rol = 'admin'
  );
$$;

-- Blinda columnas sensibles de `profiles`: la política de UPDATE de abajo permite
-- que una alumna edite SU propia fila (nombre, teléfono, edad, grupo), pero sin este
-- trigger también podría reescribir `rol` (auto-ascenderse a admin) o
-- `estado_inscripcion` (marcarse "confirmada" sin pagar). Solo un admin puede
-- cambiar esas dos columnas.
--
-- auth.uid() solo existe cuando el UPDATE llega autenticado a través de la app
-- (PostgREST/Supabase Auth). Cuando se corre desde el SQL Editor o con la
-- service_role key (auth.uid() es null), se deja pasar sin restricción — así
-- se puede seguir haciendo admin a la primera cuenta a mano.
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.rol := old.rol;
    new.estado_inscripcion := old.estado_inscripcion;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_fields_trigger on public.profiles;
create trigger protect_profile_fields_trigger
  before update on public.profiles
  for each row execute procedure public.protect_profile_fields();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.pagos enable row level security;
alter table public.suscripciones enable row level security;
alter table public.clases enable row level security;
alter table public.avisos enable row level security;
alter table public.fechas_importantes enable row level security;
alter table public.grabaciones enable row level security;

-- profiles
drop policy if exists "profiles: propio o admin puede ver" on public.profiles;
create policy "profiles: propio o admin puede ver" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
drop policy if exists "profiles: propio o admin puede actualizar" on public.profiles;
create policy "profiles: propio o admin puede actualizar" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

-- pagos
drop policy if exists "pagos: propio o admin puede ver" on public.pagos;
create policy "pagos: propio o admin puede ver" on public.pagos
  for select using (auth.uid() = usuario_id or public.is_admin());
-- Una alumna solo puede crear pagos PROPIOS y en estado "pendiente"
-- (subir comprobante, o iniciar un pago con tarjeta antes del webhook de Mercado Pago).
-- Solo un admin puede marcarlos como pagado/rechazado (ver política de update).
drop policy if exists "pagos: alumna crea su propio pago pendiente" on public.pagos;
create policy "pagos: alumna crea su propio pago pendiente" on public.pagos
  for insert with check (
    public.is_admin() or (auth.uid() = usuario_id and estado = 'pendiente')
  );
drop policy if exists "pagos: admin actualiza cualquier pago" on public.pagos;
create policy "pagos: admin actualiza cualquier pago" on public.pagos
  for update using (public.is_admin());

-- suscripciones
drop policy if exists "suscripciones: propio o admin puede ver" on public.suscripciones;
create policy "suscripciones: propio o admin puede ver" on public.suscripciones
  for select using (auth.uid() = usuario_id or public.is_admin());
drop policy if exists "suscripciones: admin gestiona" on public.suscripciones;
create policy "suscripciones: admin gestiona" on public.suscripciones
  for all using (public.is_admin()) with check (public.is_admin());

-- clases: calendario público
drop policy if exists "clases: lectura pública" on public.clases;
create policy "clases: lectura pública" on public.clases
  for select using (true);
drop policy if exists "clases: admin gestiona" on public.clases;
create policy "clases: admin gestiona" on public.clases
  for insert with check (public.is_admin());
drop policy if exists "clases: admin actualiza" on public.clases;
create policy "clases: admin actualiza" on public.clases
  for update using (public.is_admin());
drop policy if exists "clases: admin elimina" on public.clases;
create policy "clases: admin elimina" on public.clases
  for delete using (public.is_admin());

-- avisos: público ve solo activos; admin ve/gestiona todos
drop policy if exists "avisos: lectura pública de activos" on public.avisos;
create policy "avisos: lectura pública de activos" on public.avisos
  for select using (activo = true or public.is_admin());
drop policy if exists "avisos: admin inserta" on public.avisos;
create policy "avisos: admin inserta" on public.avisos
  for insert with check (public.is_admin());
drop policy if exists "avisos: admin actualiza" on public.avisos;
create policy "avisos: admin actualiza" on public.avisos
  for update using (public.is_admin());
drop policy if exists "avisos: admin elimina" on public.avisos;
create policy "avisos: admin elimina" on public.avisos
  for delete using (public.is_admin());

-- fechas_importantes: lectura pública
drop policy if exists "fechas_importantes: lectura pública" on public.fechas_importantes;
create policy "fechas_importantes: lectura pública" on public.fechas_importantes
  for select using (true);
drop policy if exists "fechas_importantes: admin gestiona" on public.fechas_importantes;
create policy "fechas_importantes: admin gestiona" on public.fechas_importantes
  for insert with check (public.is_admin());
drop policy if exists "fechas_importantes: admin actualiza" on public.fechas_importantes;
create policy "fechas_importantes: admin actualiza" on public.fechas_importantes
  for update using (public.is_admin());
drop policy if exists "fechas_importantes: admin elimina" on public.fechas_importantes;
create policy "fechas_importantes: admin elimina" on public.fechas_importantes
  for delete using (public.is_admin());

-- grabaciones: solo alumnas AL CORRIENTE (inscripción confirmada/pagada + suscripción activa).
-- Antes esta política solo exigía "autenticada", así que cualquiera con cuenta gratis podía
-- leer los videos directo por la API REST de Supabase saltándose el gate de la UI. Esta versión
-- espeja exactamente la regla de `estaAlCorriente()` en src/lib/types.ts.
drop policy if exists "grabaciones: lectura para alumnas al corriente" on public.grabaciones;
create policy "grabaciones: lectura para alumnas al corriente" on public.grabaciones
  for select using (
    public.is_admin()
    or (
      publicada = true
      and exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.estado_inscripcion in ('confirmada', 'pagada')
      )
      and exists (
        select 1 from public.suscripciones s
        where s.usuario_id = auth.uid() and s.estado = 'activa'
      )
    )
  );
drop policy if exists "grabaciones: admin gestiona" on public.grabaciones;
create policy "grabaciones: admin gestiona" on public.grabaciones
  for insert with check (public.is_admin());
drop policy if exists "grabaciones: admin actualiza" on public.grabaciones;
create policy "grabaciones: admin actualiza" on public.grabaciones
  for update using (public.is_admin());
drop policy if exists "grabaciones: admin elimina" on public.grabaciones;
create policy "grabaciones: admin elimina" on public.grabaciones
  for delete using (public.is_admin());

-- ============================================================
-- Storage: comprobantes de pago
-- ============================================================
insert into storage.buckets (id, name, public)
values ('comprobantes', 'comprobantes', false)
on conflict (id) do nothing;

drop policy if exists "comprobantes: alumna sube el suyo" on storage.objects;
create policy "comprobantes: alumna sube el suyo"
  on storage.objects for insert
  with check (bucket_id = 'comprobantes' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "comprobantes: propio o admin puede ver" on storage.objects;
create policy "comprobantes: propio o admin puede ver"
  on storage.objects for select
  using (bucket_id = 'comprobantes' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
