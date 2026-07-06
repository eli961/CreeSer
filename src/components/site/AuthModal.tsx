"use client";

import { useState } from "react";
import Image from "next/image";
import { useSite } from "@/components/providers/SiteProvider";
import { createClient } from "@/lib/supabase/client";
import { IconClose, IconUpload } from "@/components/icons";

const CONCEPTOS = [
  { label: "Inscripción · $1,000 MXN", tipo: "inscripcion" as const, monto: 1000 },
  { label: "Mensualidad Mañanas · $2,500 MXN", tipo: "mensualidad" as const, monto: 2500, plan: "manana" },
  { label: "Mensualidad Tardes · $800 MXN", tipo: "mensualidad" as const, monto: 800, plan: "tarde" },
];

function IconGoogle() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.8 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.6 35.1 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.6 39.6 16.3 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.2 5.6l6.6 5.6C39.4 37.6 44 31.4 44 24c0-1.3-.1-2.7-.4-3.5z"/>
    </svg>
  );
}

export default function AuthModal() {
  const { modalView, closeModal, openModal, user, profile, refresh, signInWithGoogle } = useSite();
  const supabase = createClient();

  const [googleErr, setGoogleErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [conceptoIdx, setConceptoIdx] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [compStatus, setCompStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const open = modalView !== null;

  async function handleGoogleLogin() {
    setGoogleErr(null);
    setBusy(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setGoogleErr(error);
      setBusy(false);
    }
    // si no hay error, el navegador redirige a Google — no hay más que hacer aquí.
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    await refresh();
    openModal("login");
  }

  async function handleComprobante(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user || !file) return;
    setCompStatus("sending");
    const concepto = CONCEPTOS[conceptoIdx];
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadErr } = await supabase.storage.from("comprobantes").upload(path, file);
    if (uploadErr) {
      setCompStatus("error");
      return;
    }
    const periodo =
      concepto.tipo === "mensualidad"
        ? new Date().toISOString().slice(0, 7)
        : null;
    const { error: insertErr } = await supabase.from("pagos").insert({
      usuario_id: user.id,
      tipo: concepto.tipo,
      monto: concepto.monto,
      moneda: "MXN",
      periodo,
      metodo: "transferencia",
      estado: "pendiente",
      comprobante_url: path,
    });
    if (insertErr) {
      setCompStatus("error");
      return;
    }
    setCompStatus("done");
    setTimeout(() => {
      closeModal();
      setCompStatus("idle");
      setFile(null);
    }, 1600);
  }

  return (
    <>
      <div
        className={`modal-back${open ? " open" : ""}`}
        onClick={closeModal}
        aria-hidden={!open}
      />
      <div
        className={`modal${open ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
      >
        <button
          type="button"
          className="modal__close"
          aria-label="Cerrar"
          onClick={closeModal}
        >
          <IconClose />
        </button>
        <div className="modal__mark">
          <Image src="/assets/creeser-logo.png" alt="Cree Ser" width={140} height={72} />
        </div>

        {modalView === "login" && (
          <div>
            <h3 id="auth-title">Inicia sesión</h3>
            <p className="modal__sub">Acceso para alumnas inscritas al ciclo.</p>
            <button
              type="button"
              className="btn btn--ghost btn--lg"
              style={{ width: "100%", gap: 10 }}
              onClick={handleGoogleLogin}
              disabled={busy}
            >
              <IconGoogle /> {busy ? "Abriendo Google…" : "Continuar con Google"}
            </button>
            {googleErr && <p className="modal__err" style={{ marginTop: 14 }}>{googleErr}</p>}
          </div>
        )}

        {modalView === "account" && (
          <div>
            <h3>Hola, {profile?.nombre || "alumna"} 🌟</h3>
            <p className="modal__sub">
              {profile?.estado_inscripcion === "confirmada"
                ? "Ya tienes acceso a las grabaciones y a tu área de pagos."
                : "Tu inscripción está en revisión. En cuanto la confirmemos verás las grabaciones aquí."}
            </p>
            <div className="modal__actions">
              <a href="#grabaciones" className="btn btn--primary btn--lg" style={{ width: "100%" }} onClick={closeModal}>
                Ver grabaciones
              </a>
              <button type="button" className="btn btn--ghost btn--lg" style={{ width: "100%" }} onClick={handleLogout}>
                Cerrar sesión
              </button>
            </div>
          </div>
        )}

        {modalView === "comprobante" && (
          <div>
            <h3>Subir comprobante</h3>
            <p className="modal__sub">Adjunta tu comprobante de pago. Validaremos y confirmaremos tu lugar.</p>
            <form onSubmit={handleComprobante}>
              <div className="field">
                <label htmlFor="cp-concepto">Concepto</label>
                <select
                  id="cp-concepto"
                  value={conceptoIdx}
                  onChange={(e) => setConceptoIdx(Number(e.target.value))}
                >
                  {CONCEPTOS.map((c, i) => (
                    <option key={c.label} value={i}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <label className="filedrop" htmlFor="cp-file">
                <IconUpload />
                <span>{file ? file.name : "Toca para elegir imagen o PDF"}</span>
                <input
                  id="cp-file"
                  type="file"
                  accept="image/*,application/pdf"
                  hidden
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
              <button
                type="submit"
                className="btn btn--primary btn--lg"
                style={{
                  width: "100%",
                  ...(compStatus === "done" ? { background: "linear-gradient(135deg,#5bbf8a,#2e8a5a)" } : {}),
                }}
                disabled={!file || compStatus === "sending" || compStatus === "done"}
              >
                {compStatus === "done"
                  ? "¡Comprobante enviado! Te confirmamos pronto ✓"
                  : compStatus === "sending"
                  ? "Enviando…"
                  : compStatus === "error"
                  ? "Error — intenta de nuevo"
                  : "Enviar comprobante"}
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
