# Prompt para Claude Code

Copia y pega esto en Claude Code (dentro de una carpeta de proyecto nueva, con este bundle disponible):

---

Voy a construir **Cree Ser**, una plataforma para una organización que enseña Torá y valores a jóvenes mujeres. En esta carpeta tienes un paquete de diseño (`design_handoff_creeser_plataforma/`) con el sitio completo en HTML (referencia hi-fi) y un `README.md` con toda la especificación funcional. **Léelo completo antes de empezar.**

Los archivos HTML/CSS/JS son **referencia de diseño**, no para copiar tal cual. El login y los pagos del prototipo son demo con localStorage: reemplázalos por implementación real.

## Objetivo
Recrear el sitio hi-fi y añadir funcionalidad real:
1. **Login de usuaria (alumna) y login de admin** (roles separados).
2. **Inscripción + pago de inscripción ($1,000 MXN)**: no se confirma el lugar sin pago. Pago con **Mercado Pago** o subida de comprobante (validado por admin).
3. **Mensualidad recurrente con cargo automático a tarjeta** vía **Mercado Pago (preapproval)**: dos planes — **Mañanas $2,500/mes** y **Tardes $800/mes** — con recordatorios y webhooks.
4. **Grabaciones privadas**: solo visibles con sesión iniciada y estado al corriente.
5. **Panel de administración**: ver **quién se inscribió, quién pagó, quién debe**, estado de cada mensualidad (al corriente / debe / vencida), validar comprobantes, y gestionar contenido (clases/temas por fecha, avisos, grabaciones).
6. **Calendario del ciclo** (ago 2026 → jul 2027) con toggle Mañanas/Tardes y tooltips por día; alimentado desde la BD (o el Google Sheet como respaldo).

## Stack sugerido (ajústalo si tienes uno mejor)
Next.js (App Router) + TypeScript + Supabase (Auth + Postgres + Storage) + **Mercado Pago** (Checkout Pro para inscripción + **preapproval** para mensualidad recurrente) + Vercel.

## Cómo trabajar
1. Lee `design_handoff_creeser_plataforma/README.md` (modelo de datos, reglas de negocio, tokens de diseño, pantallas).
2. Propón el esquema de BD y el plan de rutas (público + área privada + admin) y espera mi OK.
3. Implementa por fases: (a) sitio público + auth, (b) inscripción + pago inscripción + comprobantes, (c) suscripción mensual + webhooks, (d) grabaciones protegidas, (e) panel admin.
4. Respeta fielmente los tokens de diseño (colores, tipografías Cormorant Garamond / Mulish / Frank Ruhl Libre, radios, sombras) y el hebreo RTL.
5. Deja `.env.example` con las llaves necesarias (Mercado Pago: access token + public key + webhook secret; Supabase) y un README de despliegue.

## Datos reales a usar
- Cuenta para transferencia: **CreeSer · CLABE 684180253007001522 · OPM/TRANSFER · Concepto: Nombre + grupo**.
- Precios: inscripción **$1,000 MXN** (único). Mensualidad por grupo: **Mañanas $2,500/mes**, **Tardes $800/mes** (dos planes de preapproval en Mercado Pago).
- Contacto (footer): Bella Sitt +52 56 3444 4434, Jenny Sitt +52 55 5509 8288 (WhatsApp).
- Grupos: **Mañanas** (Lun y Mié, 11:30 y 12:40, edades 18–21) y **Tardes** (Mié 7:30 pm, preparatoria).
- Google Sheet del calendario: `1yBk7Yjwk5LbWiAzi92eT_Es4cIUtqkCm_nYZaW4Yr0k` (pestañas Calendario Mananas / Calendario Tardes).

Empieza leyendo el README y proponiendo el esquema de datos + plan de rutas.
