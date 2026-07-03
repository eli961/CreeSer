"use client";

import { useSite } from "@/components/providers/SiteProvider";

export default function GateLoginButton() {
  const { openModal } = useSite();
  return (
    <button type="button" className="btn btn--primary btn--lg" onClick={() => openModal("login")}>
      Iniciar sesión
    </button>
  );
}
