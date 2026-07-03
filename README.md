# Cree Ser — Plataforma del ciclo

Sitio + inscripción + pagos (Mercado Pago) + grabaciones protegidas + panel de administración
para Cree Ser. Construido con Next.js (App Router) + TypeScript + Supabase + Mercado Pago,
implementando el diseño hi-fi y la especificación funcional en `design-handoff/`.

> ¿Vas a publicar el sitio y no eres de perfil técnico? Sigue **[`LANZAMIENTO.md`](./LANZAMIENTO.md)**,
> es la guía paso a paso pensada para eso. Este README es la referencia técnica del proyecto.

## Stack

- **Next.js 16** (App Router, React 19, TypeScript)
- **Supabase** — Auth (email/contraseña), Postgres (RLS), Storage (comprobantes)
- **Mercado Pago** — Checkout Pro (inscripción, pago único) + Preapproval (mensualidad recurrente)
- Diseño: fuentes Cormorant Garamond / Mulish / Frank Ruhl Libre vía `next/font`, CSS del
  sistema visual original portado a `src/app/globals.css`.

## Estructura

```
src/
  app/
    page.tsx              sitio público (todas las secciones)
    admin/                panel de administración (protegido por rol)
    api/mp/                rutas de Mercado Pago (preference, preapproval, webhook)
  components/
    site/                  secciones del sitio público
    admin/                 (reservado para componentes de admin compartidos)
    providers/             SiteProvider (sesión, perfil, modal)
  lib/
    supabase/              clientes browser/server/admin + middleware de sesión
    types.ts                tipos del dominio
    mercadopago.ts          configuración del SDK de Mercado Pago
    sheets.ts               importador del Google Sheet del calendario
supabase/
  migrations/
    0001_init.sql           esquema + RLS + bucket de comprobantes
    0002_seed.sql            79 fechas reales del ciclo 5787, jaguim, avisos, grabaciones de ejemplo
design-handoff/             bundle de diseño original (Claude Design) — solo referencia
```

## Puesta en marcha

### 1. Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En el **SQL editor**, ejecuta en orden:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_seed.sql`
   - (o usa `supabase db push` si tienes el CLI vinculado al proyecto)
3. Copia `Project URL`, `anon public key` y `service_role key` desde Settings → API.
4. **Crea tu primer admin**: registra una cuenta normal desde el sitio (Ingresar → Crear cuenta,
   o el formulario de Inscripciones), luego en el SQL editor:
   ```sql
   update public.profiles set rol = 'admin' where email = 'tu@correo.com';
   ```
5. Si quieres que las alumnas reciban correo de confirmación/reset, configura SMTP en
   Authentication → Settings (o desactiva "Confirm email" para pruebas).

### 2. Mercado Pago

1. Crea una app en el [panel de desarrolladores de Mercado Pago](https://www.mercadopago.com.mx/developers/panel).
2. Copia el **Access Token** y la **Public Key** (usa credenciales de prueba mientras desarrollas).
3. En "Tus integraciones" → tu app → **Notificaciones webhook**, registra:
   `https://tu-dominio.com/api/mp/webhook` y copia el **secreto de firma**.
4. En producción MXN, la mensualidad usa **Preapproval** (suscripción con cargo automático a
   tarjeta); no requiere crear planes previos — el monto se fija en cada suscripción
   (`src/lib/mercadopago.ts` → `PLANES`).

### 3. Variables de entorno

```
cp .env.example .env.local
```

Rellena las llaves de Supabase y Mercado Pago (ver `.env.example`).

### 4. Instalar y correr

```
npm install
npm run dev
```

Abre http://localhost:3000.

### 5. Desplegar (Vercel)

1. Importa el repo en [Vercel](https://vercel.com/new).
2. Agrega las mismas variables de entorno de `.env.example` en Project Settings → Environment
   Variables (usa credenciales de **producción** de Mercado Pago).
3. Actualiza `NEXT_PUBLIC_SITE_URL` al dominio real — se usa en las `back_urls` y el
   `notification_url` que se le pasan a Mercado Pago.
4. Actualiza la URL de webhook en el panel de Mercado Pago al dominio de producción.

## Flujos implementados

- **Inscripción**: el formulario público crea la cuenta (Supabase Auth) + perfil
  (`estado_inscripcion = pendiente`) y deja a la alumna lista para pagar la inscripción.
- **Pago de inscripción** ($1,000 MXN): Checkout Pro de Mercado Pago (`/api/mp/preference`) o
  transferencia + comprobante (sube a Supabase Storage, cola de validación en `/admin/pagos`).
  El webhook marca `pagos.estado = pagado` y `profiles.estado_inscripcion = confirmada`.
- **Mensualidad recurrente**: Preapproval de Mercado Pago (`/api/mp/preapproval`), dos planes —
  Mañanas $2,500/mes y Tardes $800/mes. El webhook activa/cancela `suscripciones`.
- **Grabaciones**: solo visibles con sesión iniciada **y** al corriente (inscripción confirmada +
  mensualidad activa) — ver `estaAlCorriente()` en `src/lib/types.ts`.
- **Calendario**: alimentado por la tabla `clases` (79 fechas reales del ciclo agosto 2026 → julio
  2027, sembradas desde el `config.js` del prototipo). El panel admin permite editar tema/ponente
  por fecha, o importarlos en bloque desde el Google Sheet del ciclo.
- **Panel admin** (`/admin`, protegido por `rol = admin`): resumen, alumnas (con filtros),
  pagos + cola de comprobantes (aprobar/rechazar), cobranza ("quién debe" con recordatorio por
  WhatsApp), y gestión de clases/avisos/grabaciones.

## Sobre `design-handoff/`

Contiene el bundle original exportado de Claude Design: el prototipo hi-fi en HTML/CSS/JS
vanilla, la transcripción del chat de diseño, y la especificación funcional. Se conserva como
referencia de diseño — no se ejecuta ni se importa desde la app.
