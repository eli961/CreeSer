"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSite } from "@/components/providers/SiteProvider";
import type { Grupo } from "@/lib/types";

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

export default function Inscripciones() {
  const supabase = createClient();
  const { user, profile, refresh, signInWithGoogle } = useSite();
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [googleBusy, setGoogleBusy] = useState(false);

  const perfilCompleto = !!profile && profile.edad != null && !!profile.telefono && !!profile.grupo;

  async function handleGoogle() {
    setGoogleBusy(true);
    const { error } = await signInWithGoogle("/#inscripciones");
    if (error) {
      setErrorMsg(error);
      setGoogleBusy(false);
    }
  }

  async function handleCompletarDatos(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setStatus("sending");
    setErrorMsg(null);
    const form = new FormData(e.currentTarget);
    const edad = Number(form.get("edad"));
    const tel = String(form.get("tel") || "").trim();
    const grupo = String(form.get("sesion") || "") as Grupo | "";

    const { error } = await supabase
      .from("profiles")
      .update({
        edad: Number.isFinite(edad) ? edad : null,
        telefono: tel,
        grupo: grupo || null,
      })
      .eq("id", user.id);

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }
    await refresh();
    setStatus("idle");
  }

  return (
    <section className="section" id="inscripciones">
      <div className="wrap">
        <div className="enroll">
          <div className="reveal in">
            <p className="eyebrow eyebrow--gold">
              Inscripciones · <span className="heb">הַרְשָׁמָה</span>
            </p>
            <h2 className="display" style={{ fontSize: "clamp(2.2rem,4.5vw,3.2rem)", margin: ".2em 0 .5em" }}>
              Tu lugar te está
              <br />
              esperando
            </h2>
            <div className="steps">
              <div className="step">
                <div className="step__n">1</div>
                <div>
                  <h4>Entra con tu cuenta de Google</h4>
                  <p>Así de simple — nada de contraseñas que recordar.</p>
                </div>
              </div>
              <div className="step">
                <div className="step__n">2</div>
                <div>
                  <h4>Elige tu grupo</h4>
                  <p>Mañanas (18–21) o Tardes (preparatoria). Si tienes dudas, te orientamos.</p>
                </div>
              </div>
              <div className="step">
                <div className="step__n">3</div>
                <div>
                  <h4>Realiza tu pago</h4>
                  <p>Tu lugar se aparta solo con el pago de inscripción. Sin pago no se reserva el cupo.</p>
                </div>
              </div>
            </div>
          </div>

          <form className="form reveal in" onSubmit={handleCompletarDatos}>
            <h3>Reserva tu lugar</h3>
            <p style={{ color: "var(--ink-soft)", fontSize: 14.5, margin: 0 }}>Ciclo 5787 · cupo limitado</p>

            {!user ? (
              <div style={{ marginTop: 20 }}>
                <button
                  type="button"
                  className="btn btn--ghost btn--lg"
                  style={{ width: "100%", gap: 10 }}
                  onClick={handleGoogle}
                  disabled={googleBusy}
                >
                  <IconGoogle /> {googleBusy ? "Abriendo Google…" : "Continuar con Google"}
                </button>
                {errorMsg && <p style={{ color: "#c14f6f", fontSize: 13.5, marginTop: 10 }}>{errorMsg}</p>}
              </div>
            ) : perfilCompleto ? (
              <div style={{ marginTop: 20 }}>
                <p style={{ fontWeight: 700, color: "var(--teal-deep)" }}>
                  ¡Ya tienes tu lugar reservado! Continúa con el pago de tu inscripción.
                </p>
                <a href="#pagos" className="btn btn--primary btn--lg" style={{ width: "100%", marginTop: 14 }}>
                  Continuar al pago
                </a>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 14, color: "var(--ink-soft)", margin: "16px 0 0" }}>
                  Hola {profile?.nombre?.split(" ")[0] || ""} — solo faltan estos datos:
                </p>
                <div className="field">
                  <label htmlFor="edad">Edad</label>
                  <input id="edad" name="edad" type="number" min={14} max={120} placeholder="18" required />
                </div>
                <div className="field">
                  <label htmlFor="tel">WhatsApp</label>
                  <input id="tel" name="tel" type="tel" placeholder="+52 ..." required />
                </div>
                <div className="field">
                  <label htmlFor="sesion">¿A qué programa quieres inscribirte?</label>
                  <select id="sesion" name="sesion" defaultValue="manana">
                    <option value="manana">Mañanas · Lun y Mié, 11:30 y 12:40 (dos clases)</option>
                    <option value="tarde">Tardes · Solo Miércoles, 7:30 pm</option>
                    <option value="ambas">Ambos programas</option>
                    <option value="">Aún no estoy segura — oriéntenme</option>
                  </select>
                </div>
                {status === "error" && <p style={{ color: "#c14f6f", fontSize: 13.5 }}>{errorMsg}</p>}
                <button type="submit" className="btn btn--primary btn--lg" disabled={status === "sending"}>
                  {status === "sending" ? "Guardando…" : "Continuar al pago"}
                </button>
                <p style={{ textAlign: "center", fontSize: 13, color: "var(--ink-soft)", margin: "12px 0 0" }}>
                  Tu lugar se confirma una vez recibido el pago de inscripción.
                </p>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
