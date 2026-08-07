"use client";

import { useState } from "react";
import { useSite } from "@/components/providers/SiteProvider";
import { BILLPOCKET_LINK } from "@/lib/billpocket-link";
import type { PlanGrupo } from "@/lib/types";

interface Props {
  tipo: "inscripcion" | "mensualidad";
  plan?: PlanGrupo;
  buttonClassName?: string;
  fullWidth?: boolean;
}

/**
 * Abre la página de pago hospedada de Billpocket en otra pestaña. El pago
 * queda "pendiente" hasta que un admin lo confirme en /admin/pagos, igual
 * que una transferencia — esta página no ve ni procesa la tarjeta.
 */
export default function PagarConTarjetaLink({ tipo, plan, buttonClassName, fullWidth = true }: Props) {
  const { requireAuth } = useSite();
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleClick() {
    if (!requireAuth()) return;
    setEnviando(true);
    try {
      await fetch("/api/billpocket/registrar-intento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, plan }),
      });
      setEnviado(true);
    } finally {
      setEnviando(false);
      window.open(BILLPOCKET_LINK, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div>
      <button
        type="button"
        className={buttonClassName || "btn btn--ghost"}
        style={fullWidth ? { width: "100%" } : undefined}
        onClick={handleClick}
        disabled={enviando}
      >
        {enviando ? "Un momento…" : "Pagar con tarjeta"}
      </button>
      {enviado && (
        <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 6 }}>
          Se abrió la página de pago en otra pestaña. Cuando termines, tu pago queda en revisión — lo confirmamos en
          cuanto lo veamos reflejado.
        </p>
      )}
    </div>
  );
}
