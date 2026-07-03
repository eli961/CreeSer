# Guía de lanzamiento — Cree Ser (paso a paso, sin experiencia técnica)

Esta guía asume que no sabes programar. Sigue los pasos EN ORDEN. Tiempo estimado: 45–60 min.

Antes de empezar, ten a la mano:
- Un correo para la cuenta de Supabase y de Mercado Pago (puede ser el mismo, ej. eli@c3ntro.com).
- Una cuenta de GitHub (gratis, [github.com](https://github.com)).
- Una cuenta de Vercel (gratis, [vercel.com](https://vercel.com) — puedes entrar con tu cuenta de GitHub).

---

## Paso 1 — Crear el proyecto en Supabase (base de datos + login)

1. Entra a [supabase.com](https://supabase.com) → **Start your project** → crea una cuenta / inicia sesión.
2. **New project**. Ponle un nombre (ej. `creeser-produccion`), elige una contraseña de base de
   datos (guárdala en un lugar seguro, no la necesitarás de nuevo) y la región más cercana a México
   (`South America` o `US East`). Espera 1-2 minutos a que se cree.
3. En el menú izquierdo entra a **SQL Editor** → **New query**.
4. Abre el archivo `supabase/migrations/0001_init.sql` de este proyecto, copia TODO su contenido,
   pégalo en el editor y dale **Run**. Debe decir "Success. No rows returned".
5. Repite el mismo paso con `supabase/migrations/0002_seed.sql` (nueva query, pegar, Run). Esto
   carga las 79 fechas del ciclo, avisos de ejemplo, etc.
6. Ve a **Settings → API** (ícono de engrane, abajo a la izquierda). Copia y guarda en un documento
   temporal estos 3 valores, los vas a necesitar en el Paso 5:
   - `Project URL` → será `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → será `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (dale clic a "Reveal") → será `SUPABASE_SERVICE_ROLE_KEY`
     ⚠️ Esta clave es secreta, nunca la compartas ni la pongas en el sitio público.

## Paso 2 — Crear tu cuenta de administradora

La cuenta admin se crea igual que cualquier alumna y luego se "asciende" por base de datos:

1. Esto lo harás **después** de desplegar el sitio (Paso 6), porque necesitas el sitio ya en línea
   para registrarte. Sáltate al Paso 6 si quieres hacerlo en orden real, o regresa aquí cuando el
   sitio esté publicado.
2. En el sitio ya publicado, da clic en "Ingresar" → "Crear cuenta" y regístrate con tu correo real
   (ej. eli@c3ntro.com) y una contraseña.
3. Vuelve a Supabase → **SQL Editor** → **New query**, pega esto (cambia el correo por el tuyo) y
   dale **Run**:
   ```sql
   update public.profiles set rol = 'admin' where email = 'eli@c3ntro.com';
   ```
4. Vuelve a entrar al sitio (o recarga) y entra a `/admin` — ya deberías ver el panel.

**Opcional pero recomendado:** en Supabase ve a **Authentication → Settings** y desactiva
"Confirm email" mientras haces las primeras pruebas, así no dependes de que llegue un correo de
confirmación. Puedes reactivarlo después si configuras un proveedor de correo (SMTP).

## Paso 3 — Crear la app de Mercado Pago

1. Entra a [mercadopago.com.mx/developers/panel](https://www.mercadopago.com.mx/developers/panel)
   con tu cuenta de Mercado Pago (o crea una).
2. **Crear aplicación** → dale un nombre (ej. "Cree Ser") → tipo de integración "Pagos online" →
   Crear.
3. Dentro de tu app, ve a **"Credenciales de producción"** (no las de prueba, ya que vas a publicar
   en vivo hoy). Copia:
   - `Access Token` → será `MP_ACCESS_TOKEN`
   - `Public Key` → será `NEXT_PUBLIC_MP_PUBLIC_KEY`
4. Ve a **"Notificaciones webhook"** (a veces bajo "Tus integraciones" → tu app → esa pestaña).
   Ahí vas a registrar la URL del webhook, pero necesitas primero saber el dominio de tu sitio.
   Puedes dejar esto a medias y regresar en el Paso 7 — Mercado Pago te deja editarlo cuantas veces
   quieras.
5. Cuando registres la URL (Paso 7), Mercado Pago te dará un **"Secreto de firma"** — cópialo, será
   `MP_WEBHOOK_SECRET`.

## Paso 4 — Subir el código a GitHub

1. Entra a [github.com/new](https://github.com/new), crea un repositorio nuevo (ej. `creeser`),
   déjalo **privado**, sin plantillas adicionales. Dale "Create repository".
2. Si alguien de tu equipo tiene línea de comandos, puede correr desde la carpeta del proyecto:
   ```
   git remote add origin https://github.com/TU-USUARIO/creeser.git
   git push -u origin main
   ```
   Si nadie en tu equipo usa terminal, GitHub también permite arrastrar los archivos desde el
   navegador (botón "uploading an existing file" en el repo vacío) — sube toda la carpeta del
   proyecto excepto `node_modules` y `.next` (son carpetas generadas, no hace falta subirlas).

## Paso 5 — Desplegar en Vercel

1. Entra a [vercel.com/new](https://vercel.com/new), inicia sesión con tu cuenta de GitHub y
   autoriza acceso al repositorio que acabas de crear.
2. Selecciona el repo `creeser` → **Import**. Vercel detecta automáticamente que es Next.js, no
   cambies nada de la configuración de build.
3. Antes de dar clic en "Deploy", abre la sección **Environment Variables** y agrega una por una
   (nombre a la izquierda, valor a la derecha) — usa los valores que guardaste en los Pasos 1 y 3:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `MP_ACCESS_TOKEN`
   - `NEXT_PUBLIC_MP_PUBLIC_KEY`
   - `MP_WEBHOOK_SECRET` (si ya lo tienes; si no, lo agregas en el Paso 7 y vuelves a desplegar)
   - `NEXT_PUBLIC_SITE_URL` → pon un valor temporal como `https://creeser.vercel.app` (lo vas a
     corregir en el Paso 6 con el dominio final)
4. Dale **Deploy**. Espera 1-2 minutos. Al terminar te da una URL tipo `https://creeser-xxxx.vercel.app`.

## Paso 6 — Configurar el dominio final

1. Si vas a usar un dominio propio (ej. `creeser.mx`): en Vercel entra al proyecto → **Settings →
   Domains** → agrega tu dominio y sigue las instrucciones para apuntar el DNS (Vercel te da los
   registros exactos a poner donde compraste el dominio).
2. Si por ahora usarás el dominio gratis de Vercel, no necesitas hacer nada más en este paso.
3. Ve a **Settings → Environment Variables**, edita `NEXT_PUBLIC_SITE_URL` con el dominio real y
   final (ej. `https://www.creeser.mx` o `https://creeser.vercel.app`, sin `/` al final).
4. Ve a la pestaña **Deployments**, en el último despliegue da clic en los tres puntos → **Redeploy**
   para que tome el nuevo valor.

## Paso 7 — Terminar de conectar el webhook de Mercado Pago

1. Vuelve a Mercado Pago → tu app → **Notificaciones webhook**.
2. Registra la URL: `https://TU-DOMINIO-FINAL/api/mp/webhook` (usa el mismo dominio del Paso 6).
3. Copia el **Secreto de firma** que te muestra.
4. En Vercel, agrega/edita la variable `MP_WEBHOOK_SECRET` con ese valor → **Redeploy** de nuevo.

## Paso 8 — Crear tu cuenta admin (si no lo hiciste en el Paso 2)

Repite el Paso 2 ahora que el sitio ya está en su dominio final.

## Paso 9 — Prueba de punta a punta (antes de anunciar el sitio)

Hazlo tú misma, como si fueras una alumna nueva:

1. Abre el sitio en una ventana de incógnito.
2. Da clic en "Inscripciones" y crea una cuenta de prueba con un correo que puedas revisar.
3. Ve al apartado de pago de inscripción ($1,000 MXN) y paga con una tarjeta real (puedes ser tú
   misma; Mercado Pago con credenciales de producción cobra de verdad). Si prefieres no cobrarte
   de verdad, usa la opción de "transferencia + subir comprobante" para probar ese flujo, y prueba
   el pago con tarjeta más adelante con un pago real de una alumna.
4. Verifica en el panel `/admin/pagos` que el pago/comprobante aparece.
   - Si pagaste con tarjeta: en unos segundos debe aparecer como "pagado" automáticamente (gracias
     al webhook). Si se queda "pendiente" varios minutos, revisa el Paso 7 (URL del webhook).
   - Si subiste comprobante: apruébalo manualmente con el botón "Aprobar".
5. Confirma que a la alumna de prueba le aparece "inscripción confirmada" al volver a entrar.
6. Revisa `/admin` en general: alumnas, calendario, avisos — que se vea la información sembrada
   por `0002_seed.sql`.
7. Si todo esto funciona, ¡ya puedes compartir el enlace del sitio!

---

### Si algo falla

- **El webhook no marca pagos como "pagado":** revisa que la URL en Mercado Pago sea exactamente
  `https://TU-DOMINIO/api/mp/webhook` (con `https`, sin espacios) y que `MP_WEBHOOK_SECRET` en
  Vercel sea igual al que muestra Mercado Pago. Después de cualquier cambio de variables, haz
  **Redeploy** en Vercel — los cambios de variables de entorno no se aplican solos.
- **No puedo entrar a `/admin`:** confirma en Supabase → SQL Editor que el `update` del Paso 2 sí
  se ejecutó (puedes revisarlo con `select email, rol from public.profiles;`).
- **La página se ve sin estilos o rota:** revisa en Vercel → Deployments que el último build diga
  "Ready" (verde) y no "Error" — si dice Error, entra y lee el log, casi siempre es una variable de
  entorno mal copiada (espacios de más, comillas de más).
