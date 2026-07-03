"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSite } from "@/components/providers/SiteProvider";
import type { Grupo } from "@/lib/types";

export default function Inscripciones() {
  const supabase = createClient();
  const { refresh } = useSite();
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg(null);
    const form = new FormData(e.currentTarget);
    const nombre = String(form.get("nombre") || "").trim();
    const edad = Number(form.get("edad"));
    const email = String(form.get("email") || "").trim().toLowerCase();
    const tel = String(form.get("tel") || "").trim();
    const grupo = String(form.get("sesion") || "") as Grupo | "";
    const password = String(form.get("password") || "");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } },
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    if (data.user) {
      await supabase
        .from("profiles")
        .update({
          nombre,
          edad: Number.isFinite(edad) ? edad : null,
          telefono: tel,
          grupo: grupo || null,
        })
        .eq("id", data.user.id);
    }

    if (data.session) {
      await refresh();
      setStatus("done");
    } else {
      setStatus("done");
      setConfirmMsg("Te enviamos un correo para confirmar tu cuenta. Después inicia sesión para completar tu pago.");
    }
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
                  <h4>Elige tu grupo</h4>
                  <p>Mañanas (18–21) o Tardes (preparatoria). Si tienes dudas, te orientamos.</p>
                </div>
              </div>
              <div className="step">
                <div className="step__n">2</div>
                <div>
                  <h4>Realiza tu pago</h4>
                  <p>Tu lugar se aparta solo con el pago de inscripción. Sin pago no se reserva el cupo.</p>
                </div>
              </div>
              <div className="step">
                <div className="step__n">3</div>
                <div>
                  <h4>Confirma y comienza</h4>
                  <p>Validamos tu pago y te enviamos accesos, calendario y todo para empezar.</p>
                </div>
              </div>
            </div>
          </div>

          <form className="form reveal in" onSubmit={handleSubmit}>
            <h3>Reserva tu lugar</h3>
            <p style={{ color: "var(--ink-soft)", fontSize: 14.5, margin: 0 }}>Ciclo 5787 · cupo limitado</p>

            {status === "done" ? (
              <div style={{ marginTop: 20 }}>
                <p style={{ fontWeight: 700, color: "var(--teal-deep)" }}>
                  {confirmMsg ?? "¡Cuenta creada! Ya puedes continuar con el pago de tu inscripción."}
                </p>
                {!confirmMsg && (
                  <a href="#pagos" className="btn btn--primary btn--lg" style={{ width: "100%", marginTop: 14 }}>
                    Continuar al pago
                  </a>
                )}
              </div>
            ) : (
              <>
                <div className="field row">
                  <div>
                    <label htmlFor="nombre">Nombre</label>
                    <input id="nombre" name="nombre" type="text" placeholder="Tu nombre" required />
                  </div>
                  <div>
                    <label htmlFor="edad">Edad</label>
                    <input id="edad" name="edad" type="number" min={14} max={120} placeholder="18" required />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="email">Correo</label>
                  <input id="email" name="email" type="email" placeholder="tu@correo.com" required />
                </div>
                <div className="field">
                  <label htmlFor="tel">WhatsApp</label>
                  <input id="tel" name="tel" type="tel" placeholder="+52 ..." required />
                </div>
                <div className="field">
                  <label htmlFor="password">Crea una contraseña</label>
                  <input id="password" name="password" type="password" placeholder="Mínimo 6 caracteres" minLength={6} required />
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
                  {status === "sending" ? "Reservando…" : "Continuar al pago"}
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
