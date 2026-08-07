"use client";

import { useSite } from "@/components/providers/SiteProvider";
import { IconCheck } from "@/components/icons";
import BillpocketPayButton from "@/components/site/BillpocketPayButton";

// Promoción de lanzamiento: agosto 2026 gratis, septiembre 2026 al 50%.
// Debe coincidir con PROMO_FACTOR_POR_PERIODO en src/lib/billpocket.ts —
// aquí solo se usa para mostrar el precio correcto, el cobro real lo decide
// el servidor.
const PROMO_FACTOR_POR_PERIODO: Record<string, number> = {
  "2026-08": 0,
  "2026-09": 0.5,
};
const PERIODO_ACTUAL = new Date().toISOString().slice(0, 7);

function precioMostrado(base: number) {
  const factor = PROMO_FACTOR_POR_PERIODO[PERIODO_ACTUAL];
  if (factor === undefined) return { monto: base, promo: null as string | null };
  if (factor === 0) return { monto: 0, promo: "Gratis este mes" };
  return { monto: Math.round(base * factor), promo: `${Math.round((1 - factor) * 100)}% de descuento este mes` };
}

export default function Pagos() {
  const { requireAuth, openModal } = useSite();
  const manana = precioMostrado(2500);
  const tarde = precioMostrado(800);

  function handleComprobante() {
    if (!requireAuth()) return;
    openModal("comprobante");
  }

  return (
    <section className="section about" id="pagos">
      <div className="wrap">
        <div className="section-head reveal in">
          <p className="eyebrow eyebrow--gold">
            Pagos · <span className="heb">תַּשְׁלוּמִים</span>
          </p>
          <h2 className="display">Elige tu paquete</h2>
          <p className="lead">Cada grupo tiene su mensualidad. La inscripción es única y aparta tu lugar.</p>
        </div>

        <div className="pay">
          <div className="pay-card pay-card--feature reveal in">
            <span className="pay-card__tag pay-card__tag--gold">Paquete · Mañanas</span>
            <h3>Mañanas</h3>
            <p className="pay-card__sub">Lun y Mié · 11:30 y 12:40 · edades 18–21.</p>
            {manana.promo && <p style={{ color: "var(--gold, #b8934a)", fontWeight: 700, margin: "0 0 6px" }}>{manana.promo}</p>}
            <div className="pay-amount">
              {manana.monto === 0 ? "Gratis" : `$${manana.monto.toLocaleString("es-MX")}`}
              <small> MXN / mes</small>
              {manana.monto !== 2500 && (
                <span style={{ fontSize: "0.5em", color: "var(--ink-soft)", textDecoration: "line-through", marginLeft: 8 }}>
                  $2,500
                </span>
              )}
            </div>
            <ul className="pay-list">
              <li>
                <IconCheck /> Dos clases por día, dos veces por semana
              </li>
              <li>
                <IconCheck /> Pago en línea con tarjeta · cargo automático
              </li>
              <li>
                <IconCheck /> Acceso a las grabaciones del ciclo
              </li>
            </ul>
            <div style={{ marginTop: 10 }}>
              <BillpocketPayButton
                endpoint="/api/billpocket/mensualidad"
                extra={{ plan: "manana" }}
                buttonLabel="Pagar con tarjeta"
                buttonClassName="btn btn--gold"
                montoLabel={`Mensualidad Mañanas · ${manana.monto === 0 ? "Gratis este mes" : `$${manana.monto.toLocaleString("es-MX")} MXN`}`}
              />
            </div>
            <p className="pay-card__mini">Tarjeta · SPEI · PayPal</p>
          </div>

          <div className="pay-card reveal in">
            <span className="pay-card__tag">Paquete · Tardes</span>
            <h3>Tardes</h3>
            <p className="pay-card__sub">Solo Miércoles · 7:30 pm · preparatoria.</p>
            {tarde.promo && <p style={{ color: "var(--gold, #b8934a)", fontWeight: 700, margin: "0 0 6px" }}>{tarde.promo}</p>}
            <div className="pay-amount">
              {tarde.monto === 0 ? "Gratis" : `$${tarde.monto.toLocaleString("es-MX")}`}
              <small> MXN / mes</small>
              {tarde.monto !== 800 && (
                <span style={{ fontSize: "0.5em", color: "var(--ink-soft)", textDecoration: "line-through", marginLeft: 8 }}>
                  $800
                </span>
              )}
            </div>
            <ul className="pay-list">
              <li>
                <IconCheck /> Una clase por semana
              </li>
              <li>
                <IconCheck /> Pago en línea con tarjeta · cargo automático
              </li>
              <li>
                <IconCheck /> Acceso a las grabaciones del ciclo
              </li>
            </ul>
            <div style={{ marginTop: 10 }}>
              <BillpocketPayButton
                endpoint="/api/billpocket/mensualidad"
                extra={{ plan: "tarde" }}
                buttonLabel="Pagar con tarjeta"
                buttonClassName="btn btn--primary"
                montoLabel={`Mensualidad Tardes · ${tarde.monto === 0 ? "Gratis este mes" : `$${tarde.monto.toLocaleString("es-MX")} MXN`}`}
              />
            </div>
            <p className="pay-card__mini" style={{ color: "var(--ink-soft)" }}>
              Tarjeta · SPEI · PayPal
            </p>
          </div>
        </div>

        <div className="pay-insc reveal in">
          <div className="pay-insc__head">
            <span className="pay-card__tag">Inscripción · pago único</span>
            <h3 className="pay-insc__price">
              $1,000 <small>MXN</small>
            </h3>
            <p>
              Aparta tu lugar. Realiza una transferencia y sube tu comprobante — confirmamos tu cupo en cuanto lo
              validamos.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" className="btn btn--primary" onClick={handleComprobante}>
                Subir comprobante
              </button>
              <BillpocketPayButton
                endpoint="/api/billpocket/inscripcion"
                buttonLabel="Pagar con tarjeta"
                buttonClassName="btn btn--ghost"
                montoLabel="Inscripción · $1,000 MXN"
                fullWidth={false}
              />
            </div>
          </div>
          <div className="bankbox">
            <div className="bankrow">
              <span>Nombre</span>
              <b>CreeSer</b>
            </div>
            <div className="bankrow">
              <span>CLABE</span>
              <b>684180253007001522</b>
            </div>
            <div className="bankrow">
              <span>Institución</span>
              <b>OPM / TRANSFER</b>
            </div>
            <div className="bankrow">
              <span>Concepto</span>
              <b>Nombre + grupo</b>
            </div>
          </div>
        </div>

        <p className="pay-foot reveal in">
          ¿Necesitas una beca o facilidades de pago? <a href="#inscripciones">Escríbenos</a> — ninguna joven se queda
          fuera por motivos económicos.
        </p>
      </div>
    </section>
  );
}
