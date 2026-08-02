-- =====================================================================
-- Migración: agregar columnas a clientes y ajustar tipo_presentacion
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================================

-- Agregar columnas a la tabla clientes
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS razon_social text,
  ADD COLUMN IF NOT EXISTS rut text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS telefono text,
  ADD COLUMN IF NOT EXISTS direccion text,
  ADD COLUMN IF NOT EXISTS comuna text,
  ADD COLUMN IF NOT EXISTS region text;

-- Ajustar la constraint de tipo_presentacion para incluir SEA/SEIA
ALTER TABLE public.proyectos DROP CONSTRAINT IF EXISTS proyectos_tipo_presentacion_check;
ALTER TABLE public.proyectos
  ADD CONSTRAINT proyectos_tipo_presentacion_check
  CHECK (tipo_presentacion IN ('DIA', 'EIA', 'SEA', 'SEIA', 'VIA'));
