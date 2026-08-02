# Pilmaiquen CRM

CRM Operacional para la consultora ambiental **Pilmaiquen**: gestión de proyectos
del SEA/SEIA, hitos, documentos, observaciones y oportunidades comerciales.

Construido con **Next.js 16** (App Router, Server Actions, RSC) + **Supabase**
(PostgreSQL, Auth, Storage, Realtime) + **TypeScript estricto** + **Tailwind CSS**.

## Requisitos

- Node.js 20.9+
- Un proyecto en [Supabase](https://supabase.com) con las tablas del esquema.

## Puesta en marcha

```bash
npm install
cp .env.local.example .env.local
```

Completa `.env.local` con los valores de tu proyecto Supabase
(Project Settings → API):

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=TU_PUBLISHABLE_KEY
```

Ejecuta el esquema en Supabase (SQL Editor → pegar el contenido de
`supabase/schema.sql` → Run) o con `supabase db push`. El esquema incluye:

- Las 9 tablas del modelo (`clientes`, `proyectos`, `perfiles`, `documentos`,
  `observaciones`, `oportunidades`, `hitos`, `alertas`, `staging_proyectos`).
- Triggers para `updated_at` y para crear el `perfil` automáticamente al
  registrarse.
- **Row Level Security** con políticas de lectura para usuarios autenticados y
  escritura según rol.
- Bucket privado `documentos` en Storage.

## Desarrollo

```bash
npm run dev      # http://localhost:3000
npm run build    # build de producción (Turbopack)
npm run lint     # ESLint
```

Configura en Supabase **Auth → URL Configuration**:

- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`
- (Opcional) Email: desactiva *Confirm email* para pruebas más ágiles.

## Estructura

```
src/
  app/
    (app)/                    # Rutas protegidas (layout con sidebar + auth)
      dashboard/              # Métricas: proyectos activos, MMUS$, hitos, alertas
      proyectos/              # Lista + ficha de proyecto (cabecera SEA, hitos, documentos, observaciones)
      oportunidades/          # Pipeline Kanban por estado
    login/                    # Inicio de sesión / registro
    auth/                     # Callbacks de OAuth y confirmación de email
    api/documentos/           # Upload de archivos (multipart → Storage + registro)
  components/
    sidebar.tsx, app-shell.tsx
    dashboard/ metric-cards.tsx
    proyectos/ cabecera, tabs, hitos, documentos, observaciones, card
    oportunidades/ kanban-board.tsx
  lib/
    supabase/ client.ts, server.ts, middleware.ts, types.ts
    services/ proyectos, documentos, hitos, observaciones, oportunidades, clientes, perfiles
  proxy.ts                     # Refresco de sesión en cada request (ex-middleware)
```

## Servicios principales

- `getProyectosWithDetails()` — proyectos con `clientes`, `hitos` y `alertas`
  vía JOIN relacional.
- `getProyectoById(id)` — detalle completo con `observaciones` (y perfil del
  autor) y `documentos`.
- `uploadDocumento(proyectoId, file, tipo, usuarioId)` — sube a Storage y crea
  el registro en `documentos`.
- `getOportunidadesByCliente(clienteId)` — pipeline comercial por cliente.

## Seguridad

- Sesión protegida vía `proxy.ts` (renombrado de `middleware` en Next 16).
- Server Actions y Route Handlers verifican la sesión (`supabase.auth.getUser`).
- RLS en todas las tablas y bucket privado en Storage.
- Las descargas usan URL firmadas (5 min).
