import { createClient } from "@/lib/supabase/server";
import type { Profile, Suscripcion } from "@/lib/types";
import { estaAlCorriente } from "@/lib/types";

export default async function CobranzaPage() {
  const supabase = await createClient();
  const [{ data: alumnas }, { data: suscripciones }] = await Promise.all([
    supabase.from("profiles").select("*").eq("rol", "alumna").returns<Profile[]>(),
    supabase.from("suscripciones").select("*").returns<Suscripcion[]>(),
  ]);

  const subsByUser = new Map<string, Suscripcion[]>();
  (suscripciones ?? []).forEach((s) => subsByUser.set(s.usuario_id, [...(subsByUser.get(s.usuario_id) || []), s]));

  const deben = (alumnas ?? []).filter(
    (a) => a.estado_inscripcion === "confirmada" && !estaAlCorriente(a, subsByUser.get(a.id) || [])
  );

  return (
    <>
      <div className="admin__head">
        <h1>Cobranza · quién debe</h1>
      </div>
      <p style={{ color: "var(--ink-soft)", marginBottom: 20 }}>
        Alumnas ya inscritas cuya mensualidad no está activa este mes. Envía un recordatorio por WhatsApp con un
        toque.
      </p>
      <div className="admin-card" style={{ overflowX: "auto" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Grupo</th>
              <th>Estado mensualidad</th>
              <th>Recordatorio</th>
            </tr>
          </thead>
          <tbody>
            {deben.map((a) => {
              const subs = subsByUser.get(a.id) || [];
              const estado = subs[0]?.estado || "sin suscripción";
              const monto = a.grupo === "manana" ? 2500 : a.grupo === "tarde" ? 800 : null;
              const msg = encodeURIComponent(
                `Hola ${a.nombre}, te escribimos de Cree Ser: tu mensualidad${
                  monto ? ` ($${monto} MXN)` : ""
                } sigue pendiente. Puedes completarla desde la página en la sección de Pagos. ¡Gracias! 🌟`
              );
              return (
                <tr key={a.id}>
                  <td>{a.nombre}</td>
                  <td>{a.grupo || "—"}</td>
                  <td>
                    <span className="badge badge--bad">{estado}</span>
                  </td>
                  <td>
                    {a.telefono ? (
                      <a
                        className="btn btn--ghost btn--sm"
                        href={`https://wa.me/${a.telefono.replace(/\D/g, "")}?text=${msg}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Enviar WhatsApp
                      </a>
                    ) : (
                      "sin teléfono"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {deben.length === 0 && <p className="admin-empty">Nadie debe la mensualidad este mes. 🎉</p>}
      </div>
    </>
  );
}
