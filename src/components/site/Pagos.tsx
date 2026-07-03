"use client";

import { useState } from "react";
import { useSite } from "@/components/providers/SiteProvider";
import { IconCheck } from "@/components/icons";
import type { PlanGrupo } from "@/lib/types";

export default function Pagos() {
  const { requireAuth, openModal } = useSite();
  const [loadingPlan, setLoadingPlan] = useState<PlanGrupo | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleMensualidad(plan: PlanGrupo) {
    if (!requireAuth()) return;
    setErrorMsg(null);
    setLoadingPlan(plan);
    try {
      const res = await fetch("/api/mp/preapproval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "No se pudo iniciar el cobro.");
      window.location.href = json.init_point;
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Ocurrió un error.");
      setLoadingPlan(null);
    }
  }

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

        {errorMsg && (
          <p style={{ textAlign: "center", color: "#c14f6f", marginBottom: 20 }}>{errorMsg}</p>
        )}

        <div className="pay">
          <div className="pay-card pay-card--feature reveal in">
            <span className="pay-card__tag pay-card__tag--gold">Paquete · Mañanas</span>
            <h3>Mañanas</h3>
            <p className="pay-card__sub">Lun y Mié · 11:30 y 12:40 · edades 18–21.</p>
            <div className="pay-amount">
              $2,500<small> MXN / mes</small>
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
            <button
              type="button"
              className="btn btn--gold"
              style={{ width: "100%" }}
              onClick={() => handleMensualidad("manana")}
              disabled={loadingPlan === "manana"}
            >
              {loadingPlan === "manana" ? "Redirigiendo…" : "Pagar mensualidad"}
            </button>
            <p className="pay-card__mini">Tarjeta · SPEI · PayPal</p>
          </div>

          <div className="pay-card reveal in">
            <span className="pay-card__tag">Paquete · Tardes</span>
            <h3>Tardes</h3>
            <p className="pay-card__sub">Solo Miércoles · 7:30 pm · preparatoria.</p>
            <div className="pay-amount">
              $800<small> MXN / mes</small>
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
            <button
              type="button"
              className="btn btn--primary"
              style={{ width: "100%" }}
              onClick={() => handleMensualidad("tarde")}
              disabled={loadingPlan === "tarde"}
            >
              {loadingPlan === "tarde" ? "Redirigiendo…" : "Pagar mensualidad"}
            </button>
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
            <button type="button" className="btn btn--primary" onClick={handleComprobante}>
              Subir comprobante
            </button>
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
