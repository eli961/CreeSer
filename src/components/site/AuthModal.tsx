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

export default function AuthModal() {
  const { modalView, closeModal, openModal, user, profile, refresh } = useSite();
  const supabase = createClient();

  const [loginErr, setLoginErr] = useState<string | null>(null);
  const [signupErr, setSignupErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [conceptoIdx, setConceptoIdx] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [compStatus, setCompStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const open = modalView !== null;

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoginErr(null);
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setLoginErr("Correo o contraseña incorrectos.");
      return;
    }
    await refresh();
    openModal("account");
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSignupErr(null);
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const nombre = String(form.get("nombre") || "").trim();
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } },
    });
    setBusy(false);
    if (error) {
      setSignupErr(error.message);
      return;
    }
    if (data.session) {
      await refresh();
      openModal("account");
    } else {
      setSignupErr("Cuenta creada. Revisa tu correo para confirmarla antes de iniciar sesión.");
    }
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
            <form onSubmit={handleLogin}>
              <div className="field">
                <label htmlFor="li-email">Correo</label>
                <input id="li-email" name="email" type="email" placeholder="tu@correo.com" required />
              </div>
              <div className="field">
                <label htmlFor="li-pass">Contraseña</label>
                <input id="li-pass" name="password" type="password" placeholder="••••••••" required />
              </div>
              {loginErr && <p className="modal__err">{loginErr}</p>}
              <button type="submit" className="btn btn--primary btn--lg" style={{ width: "100%" }} disabled={busy}>
                {busy ? "Entrando…" : "Entrar"}
              </button>
            </form>
            <p className="modal__switch">
              ¿Aún no tienes cuenta?{" "}
              <button type="button" onClick={() => openModal("signup")}>
                Crear cuenta
              </button>
            </p>
          </div>
        )}

        {modalView === "signup" && (
          <div>
            <h3>Crea tu cuenta</h3>
            <p className="modal__sub">
              Para alumnas ya inscritas. Si aún no te inscribes,{" "}
              <a href="#inscripciones" onClick={closeModal}>
                hazlo aquí
              </a>
              .
            </p>
            <form onSubmit={handleSignup}>
              <div className="field">
                <label htmlFor="su-name">Nombre</label>
                <input id="su-name" name="nombre" type="text" placeholder="Tu nombre" required />
              </div>
              <div className="field">
                <label htmlFor="su-email">Correo</label>
                <input id="su-email" name="email" type="email" placeholder="tu@correo.com" required />
              </div>
              <div className="field">
                <label htmlFor="su-pass">Contraseña</label>
                <input id="su-pass" name="password" type="password" placeholder="Crea una contraseña" required minLength={6} />
              </div>
              {signupErr && <p className="modal__err">{signupErr}</p>}
              <button type="submit" className="btn btn--primary btn--lg" style={{ width: "100%" }} disabled={busy}>
                {busy ? "Creando…" : "Crear cuenta"}
              </button>
            </form>
            <p className="modal__switch">
              ¿Ya tienes cuenta?{" "}
              <button type="button" onClick={() => openModal("login")}>
                Inicia sesión
              </button>
            </p>
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
