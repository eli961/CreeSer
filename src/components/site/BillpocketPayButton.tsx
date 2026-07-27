"use client";

import { useState } from "react";
import { useSite } from "@/components/providers/SiteProvider";
import { IconClose } from "@/components/icons";

interface Props {
  endpoint: string;
  extra?: Record<string, string>;
  buttonLabel: string;
  buttonClassName?: string;
  montoLabel: string;
  fullWidth?: boolean;
}

/**
 * Botón + formulario de tarjeta para pagar vía Billpocket. A diferencia de
 * Mercado Pago (que redirige a un checkout alojado), Billpocket recibe el
 * número de tarjeta en esta misma página — por eso el formulario vive aquí en
 * vez de ser un simple link. El número nunca se guarda en el navegador más
 * allá de este formulario ni en ningún lado de nuestro código; se envía
 * directo a /api/billpocket/* por HTTPS.
 */
export default function BillpocketPayButton({
  endpoint,
  extra,
  buttonLabel,
  buttonClassName,
  montoLabel,
  fullWidth = true,
}: Props) {
  const { requireAuth } = useSite();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<"idle" | "approved" | "declined" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleOpen() {
    if (!requireAuth()) return;
    setOpen(true);
    setResult("idle");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErrorMsg(null);
    const form = new FormData(e.currentTarget);
    const cardNumber = String(form.get("cardNumber") || "").replace(/\s+/g, "");
    const expMonth = String(form.get("expMonth") || "");
    const expYear = String(form.get("expYear") || "");
    const cvv = String(form.get("cvv") || "");
    const holderName = String(form.get("holderName") || "");

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardNumber, expMonth, expYear, cvv, holderName, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo procesar el pago.");
      setResult(data.approved ? "approved" : "declined");
    } catch (err) {
      setResult("error");
      setErrorMsg(err instanceof Error ? err.message : "Error al procesar el pago.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className={buttonClassName || "btn btn--ghost"}
        style={fullWidth ? { width: "100%" } : undefined}
        onClick={handleOpen}
      >
        {buttonLabel}
      </button>

      <div className={`modal-back${open ? " open" : ""}`} onClick={() => setOpen(false)} aria-hidden={!open} />
      <div className={`modal${open ? " open" : ""}`} role="dialog" aria-modal="true">
        <button type="button" className="modal__close" aria-label="Cerrar" onClick={() => setOpen(false)}>
          <IconClose />
        </button>
        <h3>Pagar con tarjeta</h3>
        <p className="modal__sub">{montoLabel} · vía Billpocket</p>

        {result === "approved" ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontWeight: 700, color: "var(--teal-deep)" }}>¡Pago aprobado! ✓</p>
            <button type="button" className="btn btn--primary btn--lg" style={{ width: "100%", marginTop: 14 }} onClick={() => setOpen(false)}>
              Listo
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="bp-holder">Nombre en la tarjeta</label>
              <input id="bp-holder" name="holderName" type="text" required autoComplete="cc-name" />
            </div>
            <div className="field">
              <label htmlFor="bp-number">Número de tarjeta</label>
              <input
                id="bp-number"
                name="cardNumber"
                type="text"
                inputMode="numeric"
                placeholder="0000 0000 0000 0000"
                autoComplete="cc-number"
                required
              />
            </div>
            <div className="field row">
              <div>
                <label htmlFor="bp-month">Mes (MM)</label>
                <input id="bp-month" name="expMonth" type="text" inputMode="numeric" placeholder="08" maxLength={2} autoComplete="cc-exp-month" required />
              </div>
              <div>
                <label htmlFor="bp-year">Año (AAAA)</label>
                <input id="bp-year" name="expYear" type="text" inputMode="numeric" placeholder="2027" maxLength={4} autoComplete="cc-exp-year" required />
              </div>
            </div>
            <div className="field">
              <label htmlFor="bp-cvv">CVV</label>
              <input id="bp-cvv" name="cvv" type="text" inputMode="numeric" maxLength={4} autoComplete="cc-csc" required />
            </div>
            {result === "declined" && <p className="modal__err">Tu banco rechazó el cargo. Intenta con otra tarjeta.</p>}
            {result === "error" && <p className="modal__err">{errorMsg}</p>}
            <button type="submit" className="btn btn--primary btn--lg" style={{ width: "100%" }} disabled={busy}>
              {busy ? "Procesando…" : "Pagar"}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
