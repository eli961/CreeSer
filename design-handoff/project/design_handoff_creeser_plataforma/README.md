# Handoff: Cree Ser — Plataforma del ciclo (web + pagos + admin)

## Overview
Cree Ser es una organización que enseña Torá y valores a jóvenes mujeres (18–21 y preparatoria), con clases impartidas por Jajamim. Este paquete contiene el **diseño completo del sitio** (hi-fi, en HTML) y la **especificación funcional** para convertirlo en una plataforma productiva con:

1. **Sitio público**: hero, programas, temario (6 pilares), calendario del ciclo, avisos, inscripción, pagos, acerca de, contacto.
2. **Inscripción + pago de inscripción** ($1,000 MXN, único) con subida de comprobante.
3. **Cobro mensual recurrente por grupo** (Mañanas $2,500 · Tardes $800 MXN/mes) con tarjeta.
4. **Área privada**: las grabaciones solo se ven con sesión iniciada (alumna inscrita y al corriente).
5. **Panel de administración**: ver alumnas, estado de pago (pagó / debe), inscripciones, comprobantes por validar, y gestión de contenido (clases/temas/avisos).
6. **Calendario en vivo**: se alimenta de un Google Sheet (o del panel admin) — al editarlo, el sitio se actualiza.

> **IMPORTANTE — sobre los archivos de este bundle:** los archivos `.html/.css/.js` son **referencias de diseño creadas en HTML** (prototipos que muestran el aspecto y el comportamiento buscado), **no** código de producción para copiar tal cual. La tarea es **recrear estos diseños en un stack real** usando sus patrones y librerías. Todo el login/pagos actuales del prototipo son **demostración con localStorage** y deben reemplazarse por backend real.

## About the Design Files
- Construidos con HTML + CSS + JS vanilla (sin framework), pensados para comunicar diseño e interacción.
- El login, el bloqueo de grabaciones y los "pagos" del prototipo son **simulados en el navegador** (localStorage). Sirven como especificación de UX, no como implementación.
- Recrear en el entorno objetivo. Si no existe, ver "Stack recomendado".

## Fidelity
**Hi-fi.** Colores, tipografía, espaciados e interacciones son finales. Recrear la UI fielmente con las librerías del stack elegido. El único contenido de ejemplo (a reemplazar con datos reales) son: grabaciones de muestra, y temas/ponentes por fecha aún vacíos en el Sheet.

---

## Stack recomendado
Para lograr pagos recurrentes + área privada + admin con el menor esfuerzo:

- **Framework**: Next.js (App Router) + React + TypeScript.
- **Auth**: Supabase Auth (email/contraseña) o Clerk.
- **Base de datos**: Supabase (Postgres) o similar.
- **Pagos y suscripción mensual**: **Mercado Pago** (pasarela principal, mercado local MX).
  - Inscripción = pago único ($1,000 MXN) — Checkout Pro / Payment Brick.
  - Mensualidad = **suscripción recurrente** con **cargo automático a tarjeta** vía **preapproval** de Mercado Pago. Dos planes: **Mañanas $2,500/mes** y **Tardes $800/mes**. Webhooks (IPN / notificaciones) para marcar “al corriente / vencido”.
  - Alternativa: Stripe Billing si en algún momento se requiere internacional.
- **Almacenamiento de comprobantes**: Supabase Storage / S3.
- **Hosting**: Vercel.
- **Admin**: rutas protegidas por rol `admin`.

> Nota MXN: la pasarela principal es **Mercado Pago**. La mensualidad recurrente usa **preapproval** (suscripción con cargo automático a la tarjeta). Crear **dos planes de preapproval**: Mañanas $2,500/mes y Tardes $800/mes. Manejar notificaciones/webhooks (IPN) para actualizar estado de pago.

---

## Modelo de datos (mínimo)

```
usuarios (alumnas)
  id, nombre, email, password_hash (o proveedor auth),
  grupo ("manana" | "tarde"), rol ("alumna" | "admin"),
  estado_inscripcion ("pendiente" | "pagada" | "confirmada"),
  creado_en

pagos
  id, usuario_id, tipo ("inscripcion" | "mensualidad"),
  monto, moneda ("MXN"), periodo ("2026-08" para mensualidad),
  metodo ("tarjeta" | "transferencia"),
  estado ("pendiente" | "pagado" | "vencido" | "rechazado"),
  comprobante_url (si es transferencia), mp_payment_id, creado_en, pagado_en

suscripciones
  id, usuario_id, mp_preapproval_id,
  estado ("activa" | "vencida" | "cancelada"),
  plan ("manana" | "tarde"), monto (2500 | 800),
  proximo_cobro (fecha)

clases  (alimenta el calendario)
  id, fecha ("YYYY-MM-DD"), grupo ("manana" | "tarde"),
  orden (1 = 11:30, 2 = 12:40), hora, tema, ponente

avisos
  id, titulo, texto, activo, orden

fechas_importantes (jaguim)
  fecha ("YYYY-MM-DD"), etiqueta

grabaciones
  id, titulo, pilar, tema_hebreo, url_video, duracion, thumbnail, publicada
```

---

## Reglas de negocio clave

### Inscripción + pago
1. La alumna llena el formulario de inscripción (nombre, edad, correo, WhatsApp, **grupo**: Mañanas / Tardes / Ambos).
2. **No se confirma el lugar sin pago.** Estado inicial `pendiente`.
3. Paga la **inscripción ($1,000 MXN)**:
   - Opción tarjeta (Stripe) → al confirmar webhook, `estado_inscripcion = pagada`.
   - Opción transferencia → sube comprobante; queda `pendiente` hasta que un admin lo valida → `confirmada`.
4. Cuenta bancaria para transferencia (mostrar en la UI):
   - **Nombre:** CreeSer
   - **CLABE:** `684180253007001522`
   - **Institución:** OPM / TRANSFER
   - **Concepto:** Nombre + grupo

### Mensualidad recurrente
- **Según grupo**: Mañanas **$2,500 MXN/mes**, Tardes **$800 MXN/mes**, mediante **suscripción** en Stripe/Mercado Pago (dos precios distintos).
- Cargo automático mensual; enviar **recordatorio antes de cada cobro**.
- Si un cobro falla o no se paga → `estado = vencido` y (opcional) **bloquear acceso a grabaciones** hasta regularizar.
- Webhooks actualizan `pagos` y `suscripciones`.

### Área privada (grabaciones)
- Solo visibles con **sesión iniciada** y estado **al corriente** (inscripción confirmada + mensualidad activa).
- Si no hay sesión → mostrar el "gate" con candado (ver diseño) y botón Iniciar sesión / Inscribirme.

### Panel de administración (sencillo pero completo)
Vistas mínimas:
1. **Alumnas**: tabla con nombre, grupo, estado de inscripción, estado de mensualidad (**Al corriente / Debe / Vencida**), próximo cobro, contacto (WhatsApp). Filtro por grupo y por estado.
2. **Pagos**: lista de pagos (inscripción y mensualidad) con estado; **cola de comprobantes por validar** (ver imagen del comprobante, botón Aprobar / Rechazar → cambia estado y confirma inscripción).
3. **Cobranza / “quién debe”**: vista rápida de morosas del mes actual, con acción de enviar recordatorio (WhatsApp/email).
4. **Contenido**:
   - **Clases/temas**: editar tema + ponente por fecha y grupo (esto alimenta el calendario y los tooltips).
   - **Avisos**: crear/editar/activar (máx. 3 visibles).
   - **Grabaciones**: subir video (o link), título, pilar, publicar.
5. **Rol admin** protegido; solo usuarios con `rol = admin`.

---

## Screens / Views (sitio público)

Medida base de diseño: ancho de contenido `max 1200px`, centrado, con `padding` lateral de 24px (`.wrap`). Secciones con `padding` vertical de 104px (desktop), 64px (móvil).

### 1. Barra superior + Nav (sticky)
- **Topbar**: franja teal degradada `linear-gradient(90deg, #1B6E78, #2A9CA8)`, texto crema `#eafbfc`, 13.5px, centrado: “Inscripciones abiertas para el nuevo ciclo תשפ״ז 5787 · Reserva tu lugar →”.
- **Nav** (sticky, `rgba(251,247,239,.78)` + blur 14px; al hacer scroll añade borde inferior + sombra):
  - Logo Cree Ser (altura 42px, `max-width:132px`, `object-fit:contain`).
  - Links (14.5px, peso 600, color `#41666C`, hover `#143A41` con subrayado teal animado): **Temario, Calendario, Grabaciones, Avisos, Inscripciones, Pagos, Acerca de**.
  - CTA: botón fantasma **“Ingresar”** (abre modal login) + botón primario **“Inscríbete”**.
  - En ≤820px: links y botón fantasma ocultos; aparece **hamburguesa** que abre menú lateral (drawer 82vw máx 340px, entra desde la derecha, con backdrop).

### 2. Hero
- Fondo crema `#FBF7EF` con un “glow” radial dorado/teal detrás (círculo 1100–1200px, blur), y viñeta inferior.
- **Logo grande centrado** (`width: min(420px, 72vw)`, drop-shadow dorado suave).
- Eyebrow dorado centrado: “Nuevo ciclo · 5787”.
- **H1** (serif Cormorant Garamond, 600, `clamp(2.9rem,7vw,5.4rem)`, line-height 1.02):
  “**Cree** en ti misma, **sé** tu mejor versión.” — las palabras **Cree** y **sé** en teal `#2A9CA8` (clase `.hl`).
- **Subtítulo** (`clamp(1.05rem,2.2vw,1.3rem)`, `#41666C`): “Desarrollando el **דְּבֵקוּת** con la Torá, desde el amor y la profundidad.” (la palabra hebrea con fuente Frank Ruhl Libre, RTL).
- **CTAs**: botón primario **“Inscríbete”** (→ #inscripciones) + botón fantasma **“Ver calendario”** (→ #calendario). En móvil se apilan al 100% de ancho.
- (Se quitaron las estadísticas +40/3/בס״ד que existían antes.)

### 3. Programas — “Elige tu grupo”
- Eyebrow dorado “Nuestros programas · שְׁנֵי מַסְלוּלִים”, título serif “Elige tu grupo”, lead.
- **2 tarjetas** (grid 2 col, máx 840px, centrado; 1 col en móvil):
  - **Mañanas** (barra superior teal): “Programa · Mañanas · בֹּקֶר”. Texto: “Dos veces por semana · edades de 18 a 21 años.” Lista: “Lunes y Miércoles”, “Dos clases por día · 11:30 y 12:40”. Botón primario “Quiero Mañanas”.
  - **Tardes** (barra superior dorada): “Programa · Tardes · עֶרֶב”. Texto: “Una vez a la semana · edad preparatoria.” Lista: “Miércoles”, “Una clase · 7:30 pm”. Botón fantasma “Quiero Tardes”.
- Tarjeta: fondo blanco, borde `rgba(20,58,65,.12)`, radio 22px, sombra suave, hover sube 5px.

### 4. Temario — “Lo que estudiaremos juntas”
- Lead: describe una construcción personal de todas las áreas de la vida.
- Divisor dorado: “**Los 6 pilares del ciclo**”.
- **6 tarjetas** (grid 3 col; 2 en tablet; 1 en móvil), cada una con número (01–06), título, palabra hebrea (teal), y bullets:
  1. **Asher bajar banu** · אֲשֶׁר בָּחַר בָּנוּ — Haolam Hazé y Olam Habá · La neshamá · Extremos: no somos iguales
  2. **Valor propio** · יָקָר — Autoconocimiento · Presión social · Aprobación
  3. **Comunicación** · תִּקְשֹׁרֶת — En pareja · Social · Familiar · Conflictos
  4. **Eshet Jayil** · אֵשֶׁת חַיִל — El tafkid de la mujer · Tzniut
  5. **Midat HaJasidut** · מִדַּת הַחֲסִידוּת — Zrizut · Emet · Tzniut · Amor y relación con Hashem · Neshamá y tefilá
  6. **Tefilá** · תְּפִלָּה — Concentración · Entendimiento · Vínculo y gozo
- Franja de temas fijos (pills): **Navi (נָבִיא)** · **Parashat HaShavua (פָּרָשַׁת הַשָּׁבוּעַ)** · **Jaguim · maagal hashaná (מַעְגַּל הַשָּׁנָה)**.

### 5. Calendario del ciclo
- Fondo crema-2 `#F4ECDD`. Título “Todo el ciclo, en un solo lugar”.
- **Toggle Mañanas / Tardes** (segmented). Cambia el calendario y la lista de próximas clases.
  - Mañanas: Lunes y Miércoles, **dos clases por día** (11:30 y 12:40).
  - Tardes: solo Miércoles, **una clase** 7:30 pm.
- **Calendario mensual** (grid 7 col): marca con punto las fechas con clase (rosa/teal) y jaguim (dorado). Navegación de meses (‹ ›). Empieza en **Agosto 2026**. Ciclo: **ago 2026 → jul 2027**.
- **Tooltip al hover** sobre un día con clase: muestra el programa, los horarios y el/los tema(s) + ponente; si la fecha es jag, muestra la festividad (✡). Ver `app.js` → `renderCal()` y el bloque de tooltip.
- Panel lateral “**Próximas clases**”: las siguientes 4 fechas del grupo activo, con sus clases (Mañanas muestra 2 renglones, Tardes 1).
- Datos actuales: 79 fechas reales del ciclo en `config.js` (`clases`), fechas de jaguim 5787 en `fechasImportantes`. Ponente/tema están vacíos hasta que se llenen.
- Botón “Descargar calendario completo”.

### 6. Grabaciones (área privada)
- Título “Vuelve a cada clase, cuando la necesites”.
- **Gate de login** (`#grab-gate`): candado, “Contenido solo para inscritas”, botones **Iniciar sesión** / **Quiero inscribirme**. El contenido detrás se ve borroso hasta iniciar sesión (clase `.gated.unlocked` lo revela).
- **Filtros** (chips): Todas · Asher bajar banu · Valor propio · Comunicación · Eshet Jayil · Jasidut · Tefilá.
- **Grid de tarjetas** (3 col) con thumbnail degradado, botón play, duración, pill de tema, título y hebreo + “Pilar 0X”. (Contenido de ejemplo — reemplazar por videos reales.)

### 7. Avisos (3 mensajes)
- Fondo teal profundo. 3 tarjetas centradas:
  1. **Inscripciones abiertas** — “Hasta el 15 de agosto.”
  2. **Aparta tu lugar** — “Con el pago de inscripción reservas tu cupo.”
  3. **Calendario final** — “Se publica el 30 de julio.”

### 8. Inscripciones
- Izquierda: 3 pasos (1. Elige tu grupo · 2. Realiza tu pago · 3. Confirma y comienza).
- Derecha: **formulario** (Nombre, Edad, Correo, WhatsApp, **Programa**: Mañanas 18–21 / Tardes preparatoria / Ambos / “Aún no estoy segura”). Botón **“Continuar al pago”**. Debajo: “Tu lugar se confirma una vez recibido el pago de inscripción.”
- Comportamiento real: al enviar → crear usuaria `pendiente` → llevar a pago (Stripe Checkout) o a subir comprobante.

### 9. Pagos — “Elige tu paquete”
- Fondo crema-2. **Dos paquetes de mensualidad** (2 col; 1 en móvil):
  - **Mañanas** (tarjeta destacada teal) — **$2,500 MXN/mes**. Lun y Mié · 11:30 y 12:40 · edades 18–21. Botón **“Pagar mensualidad”** (requiere sesión → preapproval Mercado Pago plan Mañanas).
  - **Tardes** — **$800 MXN/mes**. Solo Miércoles · 7:30 pm · preparatoria. Botón **“Pagar mensualidad”** (→ preapproval plan Tardes).
- **Bloque de inscripción** ($1,000 MXN, pago único) con la caja de datos bancarios (CreeSer · CLABE 684180253007001522 · OPM/TRANSFER · Concepto: Nombre + grupo) y botón **“Subir comprobante”** (requiere sesión → modal comprobante).
- Pie: “¿Necesitas beca o facilidades? Escríbenos — ninguna joven se queda fuera por motivos económicos.”

### 10. Acerca de
- Frase principal (serif grande): “Cree Ser es donde la Torá **se vive desde el corazón** — donde las bases de la Torá son la base de tu vida, tu avodat Hashem es auténtica y logramos ser quienes queremos ser.”
- 3 valores (corazón / Torá / vela): Desde el corazón (בְּלֵב שָׁלֵם) · Con bases de Torá (תּוֹרָה) · Avodat Hashem auténtica (עֲבוֹדַת ה׳).

### 11. Footer
- Fondo teal profundo. Logo (invertido a blanco), lema, frase hebrea עִבְדוּ אֶת ה׳ בְּשִׂמְחָה.
- Columnas: Programa, Comunidad, **Contacto** (WhatsApp: **Bella Sitt · 56 3444 4434** → `https://wa.me/525634444434`; **Jenny Sitt · 55 5509 8288** → `https://wa.me/525555098288`).

### 12. Modal (login / registro / cuenta / comprobante)
- Diálogo centrado (máx 430px), con logo, 4 vistas conmutables:
  - **login** (correo + contraseña) · **signup** (nombre, correo, contraseña) · **account** (saludo + Ver grabaciones + Cerrar sesión) · **comprobante** (concepto + file drop imagen/PDF + enviar).
- Reemplazar por auth real. El file-drop de comprobante debe subir a storage y crear registro en `pagos` (estado pendiente).

---

## Interactions & Behavior
- **Reveal on scroll**: elementos `.reveal` aparecen con fade+translateY al entrar en viewport (`app.js`). Incluir fallback para que nunca queden ocultos.
- **Nav sticky**: añade `.scrolled` tras 12px de scroll.
- **Menú móvil**: drawer + backdrop, cierra al elegir link.
- **Calendario**: navegación de meses, toggle de grupo, tooltip flotante en hover.
- **Filtros de grabaciones**: muestran/ocultan tarjetas por `data-tema`.
- **Modal**: abrir con `[data-action=login]`, cerrar con backdrop/Esc/botón; `[data-requires-auth]` exige sesión.
- **Countdown**: (existía en “clase de la semana”, sección retirada por ahora; reactivar al iniciar el curso).

## Responsive
- Breakpoints: **940px** (grids a 2 col, pay/enroll/about a 1 col), **820px** (nav → hamburguesa), **680px** (grids a 1 col, hero CTAs apiladas, calendario compacto, footer 2 col), **420px** (footer 1 col, modal padding menor).

---

## Design Tokens

**Colores**
- Ink `#143A41`, Ink-soft `#41666C`
- Teal `#2A9CA8`, Teal-deep `#1B6E78`, Teal-bright `#3CB6BE`, Teal-ink `#0E3A40`, Teal-ink2 `#082226`
- Gold `#C5933E`, Gold-soft `#E6C982`, Gold-deep `#A9772A`
- Rose `#DD7E97`, Blue `#5E8AD0`
- Cream `#FBF7EF`, Cream-2 `#F4ECDD`, Paper `#FFFFFF`
- Líneas: `rgba(20,58,65,.12)`, `rgba(20,58,65,.07)`, claras `rgba(255,255,255,.14)`

**Tipografía**
- Serif (títulos): **Cormorant Garamond** (500–700)
- Sans (texto/UI): **Mulish** (300–800)
- Hebreo: **Frank Ruhl Libre** (500/700), siempre `direction: rtl`
- Escala títulos: h1 `clamp(2.9rem,7vw,5.4rem)`; section title `clamp(2.3rem,5vw,3.6rem)`.

**Radios**: 8 / 14 / 22 / 32px. **Sombras**: sm `0 2px 10px rgba(14,58,64,.06)`, md `0 14px 40px -18px rgba(14,58,64,.28)`, lg `0 30px 70px -28px rgba(14,58,64,.40)`. **Easing**: `cubic-bezier(.22,1,.36,1)`.

---

## Calendario en vivo (Google Sheet)
- El prototipo lee un Google Sheet publicado como CSV (`sheets.js`) para poblar el calendario, de modo que editar el Sheet actualice el sitio.
  - Sheet ID: `1yBk7Yjwk5LbWiAzi92eT_Es4cIUtqkCm_nYZaW4Yr0k`
  - Pestañas: “Calendario Mananas” / “Calendario Tardes”; columnas: Sección(mes) · Día · Fecha(nº) · Ponente · Tema (Mañanas tiene dos pares tema/ponente).
  - Regla de año: ago–dic = 2026, ene–jul = 2027.
- En producción, se puede: (a) mantener la lectura del Sheet, o (b) migrar la gestión de clases al **panel admin** (recomendado a mediano plazo). Idealmente el admin escribe en la BD y el Sheet queda como respaldo/importador.

## Assets
- `assets/creeser-logo.png` — logo Cree Ser (extraído de foto del usuario, fondo transparente, ~1237×638). Si existe versión vectorial (SVG/AI), preferirla.
- Íconos: SVG inline (Lucide-style, stroke 1.6–2).
- Fuentes: Google Fonts (Cormorant Garamond, Mulish, Frank Ruhl Libre).

## Files (en este bundle)
- `index.html` — sitio completo (todas las secciones + modal).
- `styles.css` — sistema visual + componentes + responsive.
- `app.js` — nav, menú móvil, calendario (render + toggle + tooltip), filtros, reveal, countdown, hook `CreeSerData.merge`.
- `sheets.js` — lectura en vivo del Google Sheet → calendario.
- `auth.js` — login/registro/comprobante **DEMO** (localStorage). Reemplazar por auth+pagos reales.
- `config.js` — contenido: ciclo, sesiones, 79 fechas de clase reales, jaguim 5787, avisos.
- `posts.html` — (aparte) generador de estados de WhatsApp; no es parte del sitio.

## Checklist de implementación
- [ ] Auth real (email/contraseña) + rol admin.
- [ ] Inscripción → usuaria `pendiente` → pago inscripción $1,000 (tarjeta o comprobante).
- [ ] Validación de comprobante en admin → `confirmada`.
- [ ] Suscripción mensual (Mercado Pago preapproval) con **cargo automático** — dos planes ($2,500 Mañanas / $800 Tardes) + recordatorios + webhooks.
- [ ] Grabaciones protegidas (solo al corriente).
- [ ] Panel admin: alumnas, pagos, quién debe, validar comprobantes, gestión de clases/avisos/grabaciones.
- [ ] Calendario alimentado por BD (o Sheet), con tooltips.
- [ ] Recrear UI hi-fi con los tokens de arriba.
- [ ] Responsive en los 4 breakpoints.
