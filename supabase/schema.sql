-- =====================================================================
-- CRM Pilmaiquen · Esquema Supabase (PostgreSQL)
-- Ejecutar en el SQL Editor o con `supabase db push`.
-- =====================================================================

-- ---------- CLIENTES ----------
create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  razon_social text,
  rut text,
  email text,
  telefono text,
  direccion text,
  comuna text,
  region text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- PERFILES ----------
create table if not exists public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null,
  email text not null,
  rol text not null default 'lectura'
    check (rol in ('admin', 'consultor', 'comercial', 'lectura')),
  activo boolean not null default true
);

-- ---------- PROYECTOS ----------
create table if not exists public.proyectos (
  id uuid primary key default gen_random_uuid(),
  nombre_proyecto text not null,
  cliente_id uuid references public.clientes (id) on delete set null,
  web text,
  tipo_presentacion text check (tipo_presentacion in ('DIA', 'EIA')),
  region text,
  comuna text,
  provincia text,
  tipo_proyecto text,
  razon_ingreso text,
  inversion_mmus numeric,
  fecha_presentacion date,
  estado_proyecto text
    check (estado_proyecto in ('Ingreso', 'En evaluación', 'Calificado', 'Rechazado', 'Desistido')),
  fecha_calificacion date,
  sector_productivo text,
  latitud numeric,
  longitud numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- DOCUMENTOS ----------
create table if not exists public.documentos (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references public.proyectos (id) on delete cascade,
  nombre_archivo text not null,
  ruta_storage text not null,
  tipo_documento text
    check (tipo_documento in (
      'Declaración de Impacto Ambiental',
      'Estudio de Impacto Ambiental',
      'Adenda',
      'Resolución',
      'Informe',
      'Otro'
    )),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  fecha_subida timestamptz not null default now()
);

-- ---------- OBSERVACIONES ----------
create table if not exists public.observaciones (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references public.proyectos (id) on delete cascade,
  usuario_id uuid not null references auth.users (id) on delete cascade,
  comentario text not null,
  fecha timestamptz not null default now()
);

-- ---------- OPORTUNIDADES ----------
create table if not exists public.oportunidades (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references public.clientes (id) on delete set null,
  nombre text not null,
  descripcion text,
  monto_estimado numeric,
  estado text not null default 'Prospecto'
    check (estado in (
      'Prospecto',
      'Contactado',
      'En negociación',
      'Propuesta enviada',
      'Ganada',
      'Perdida'
    )),
  fecha_cierre_estimada date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- HITOS ----------
create table if not exists public.hitos (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references public.proyectos (id) on delete cascade,
  nombre text not null,
  descripcion text,
  fecha_compromiso date,
  estado text not null default 'Pendiente'
    check (estado in ('Pendiente', 'En progreso', 'Completado', 'Vencido', 'Cancelado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- ALERTAS ----------
create table if not exists public.alertas (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references public.proyectos (id) on delete cascade,
  titulo text not null,
  descripcion text,
  fecha_alerta timestamptz not null default now(),
  leida boolean not null default false
);

-- ---------- STAGING PROYECTOS (importación SEA/SEIA) ----------
create table if not exists public.staging_proyectos (
  id uuid primary key default gen_random_uuid(),
  nombre_proyecto text,
  web text,
  tipo_presentacion text,
  region text,
  comuna text,
  provincia text,
  tipo_proyecto text,
  inversion_mmus numeric,
  fecha_presentacion date,
  estado_proyecto text,
  sector_productivo text,
  estado_importacion text not null default 'Pendiente'
    check (estado_importacion in ('Pendiente', 'Validado', 'Importado', 'Rechazado')),
  created_at timestamptz not null default now()
);

-- =====================================================================
-- Índices
-- =====================================================================
create index if not exists idx_proyectos_cliente on public.proyectos (cliente_id);
create index if not exists idx_proyectos_estado on public.proyectos (estado_proyecto);
create index if not exists idx_documentos_proyecto on public.documentos (proyecto_id);
create index if not exists idx_observaciones_proyecto on public.observaciones (proyecto_id);
create index if not exists idx_observaciones_fecha on public.observaciones (fecha desc);
create index if not exists idx_oportunidades_cliente on public.oportunidades (cliente_id);
create index if not exists idx_oportunidades_estado on public.oportunidades (estado);
create index if not exists idx_hitos_proyecto on public.hitos (proyecto_id);
create index if not exists idx_alertas_proyecto on public.alertas (proyecto_id);

-- =====================================================================
-- Disparador: mantener updated_at
-- =====================================================================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_clientes_touch on public.clientes;
create trigger trg_clientes_touch before update on public.clientes
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_proyectos_touch on public.proyectos;
create trigger trg_proyectos_touch before update on public.proyectos
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_oportunidades_touch on public.oportunidades;
create trigger trg_oportunidades_touch before update on public.oportunidades
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_hitos_touch on public.hitos;
create trigger trg_hitos_touch before update on public.hitos
  for each row execute function public.touch_updated_at();

-- =====================================================================
-- Disparador: crear perfil automáticamente al registrarse
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.perfiles (id, nombre, email, rol, activo)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)),
    new.email,
    'lectura',
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- Row Level Security
-- Nota: los roles dependen del claim app_metadata.role. Ver docs.
-- =====================================================================
alter table public.clientes enable row level security;
alter table public.perfiles enable row level security;
alter table public.proyectos enable row level security;
alter table public.documentos enable row level security;
alter table public.observaciones enable row level security;
alter table public.oportunidades enable row level security;
alter table public.hitos enable row level security;
alter table public.alertas enable row level security;
alter table public.staging_proyectos enable row level security;

-- Usuario autenticado puede leer todo
create policy "Lectura para usuarios autenticados"
  on public.clientes for select to authenticated using (true);
create policy "Lectura para usuarios autenticados"
  on public.proyectos for select to authenticated using (true);
create policy "Lectura para usuarios autenticados"
  on public.documentos for select to authenticated using (true);
create policy "Lectura para usuarios autenticados"
  on public.observaciones for select to authenticated using (true);
create policy "Lectura para usuarios autenticados"
  on public.oportunidades for select to authenticated using (true);
create policy "Lectura para usuarios autenticados"
  on public.hitos for select to authenticated using (true);
create policy "Lectura para usuarios autenticados"
  on public.alertas for select to authenticated using (true);
create policy "Lectura para usuarios autenticados"
  on public.staging_proyectos for select to authenticated using (true);

-- El usuario solo puede leer su propio perfil
create policy "Perfil propio"
  on public.perfiles for select to authenticated using (auth.uid() = id);

-- Escritura para roles admin/consultor/comercial (ajustar según necesidad)
create policy "Insertar para equipos"
  on public.clientes for insert to authenticated
  with check (exists (
    select 1 from public.perfiles p
    where p.id = auth.uid() and p.rol in ('admin', 'comercial')
  ));

create policy "Insertar para equipos"
  on public.proyectos for insert to authenticated
  with check (exists (
    select 1 from public.perfiles p
    where p.id = auth.uid() and p.rol in ('admin', 'consultor')
  ));

create policy "Actualizar para equipos"
  on public.proyectos for update to authenticated
  using (exists (
    select 1 from public.perfiles p
    where p.id = auth.uid() and p.rol in ('admin', 'consultor')
  ));

create policy "Insertar documentos del usuario"
  on public.documentos for insert to authenticated
  with check (auth.uid() = usuario_id);

create policy "Eliminar documentos propios"
  on public.documentos for delete to authenticated
  using (auth.uid() = usuario_id);

create policy "Insertar observaciones del usuario"
  on public.observaciones for insert to authenticated
  with check (auth.uid() = usuario_id);

create policy "Insertar oportunidades para equipos"
  on public.oportunidades for insert to authenticated
  with check (exists (
    select 1 from public.perfiles p
    where p.id = auth.uid() and p.rol in ('admin', 'comercial')
  ));

create policy "Actualizar oportunidades para equipos"
  on public.oportunidades for update to authenticated
  using (exists (
    select 1 from public.perfiles p
    where p.id = auth.uid() and p.rol in ('admin', 'comercial')
  ));

create policy "Insertar hitos para equipos"
  on public.hitos for insert to authenticated
  with check (exists (
    select 1 from public.perfiles p
    where p.id = auth.uid() and p.rol in ('admin', 'consultor')
  ));

create policy "Actualizar hitos para equipos"
  on public.hitos for update to authenticated
  using (exists (
    select 1 from public.perfiles p
    where p.id = auth.uid() and p.rol in ('admin', 'consultor')
  ));

create policy "Eliminar hitos para equipos"
  on public.hitos for delete to authenticated
  using (exists (
    select 1 from public.perfiles p
    where p.id = auth.uid() and p.rol in ('admin', 'consultor')
  ));

-- =====================================================================
-- Storage: bucket de documentos
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('documentos', 'documentos', false)
on conflict (id) do nothing;

create policy "Subir documentos autenticados"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'documentos');

create policy "Leer documentos autenticados"
  on storage.objects for select to authenticated
  using (bucket_id = 'documentos');

create policy "Eliminar documentos propios"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1] is not null
  );
