import { createClient } from "@/lib/supabase/server";
import type { Profile, Suscripcion } from "@/lib/types";
import { estaAlCorriente } from "@/lib/types";

function Badge({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    confirmada: "badge--ok",
    pagada: "badge--ok",
    activa: "badge--ok",
    pendiente: "badge--warn",
    vencida: "badge--bad",
    cancelada: "badge--bad",
    rechazada: "badge--bad",
  };
  return <span className={`badge ${map[estado] || "badge--warn"}`}>{estado}</span>;
}

export default async function AlumnasPage({
  searchParams,
}: {
  searchParams: Promise<{ grupo?: string; estado?: string }>;
}) {
  const { grupo, estado } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("profiles").select("*").eq("rol", "alumna").order("created_at", { ascending: false });
  if (grupo) query = query.eq("grupo", grupo);
  if (estado) query = query.eq("estado_inscripcion", estado);
  const { data: alumnas } = await query.returns<Profile[]>();

  const { data: suscripciones } = await supabase.from("suscripciones").select("*").returns<Suscripcion[]>();
  const subsByUser = new Map<string, Suscripcion[]>();
  (suscripciones ?? []).forEach((s) => subsByUser.set(s.usuario_id, [...(subsByUser.get(s.usuario_id) || []), s]));

  return (
    <>
      <div className="admin__head">
        <h1>Alumnas</h1>
      </div>
      <form className="admin-toolbar" method="get">
        <select name="grupo" defaultValue={grupo || ""}>
          <option value="">Todos los grupos</option>
          <option value="manana">Mañanas</option>
          <option value="tarde">Tardes</option>
          <option value="ambas">Ambos</option>
        </select>
        <select name="estado" defaultValue={estado || ""}>
          <option value="">Cualquier estado de inscripción</option>
          <option value="pendiente">Pendiente</option>
          <option value="pagada">Pagada</option>
          <option value="confirmada">Confirmada</option>
        </select>
        <button type="submit" className="btn btn--ghost btn--sm">
          Filtrar
        </button>
      </form>

      <div className="admin-card" style={{ overflowX: "auto" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Grupo</th>
              <th>Inscripción</th>
              <th>Mensualidad</th>
              <th>Próximo cobro</th>
              <th>Contacto</th>
            </tr>
          </thead>
          <tbody>
            {(alumnas ?? []).map((a) => {
              const subs = subsByUser.get(a.id) || [];
              const activa = subs.find((s) => s.estado === "activa");
              const alCorriente = estaAlCorriente(a, subs);
              return (
                <tr key={a.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{a.nombre || "—"}</div>
                    <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{a.email}</div>
                  </td>
                  <td>{a.grupo || "—"}</td>
                  <td>
                    <Badge estado={a.estado_inscripcion} />
                  </td>
                  <td>
                    <Badge estado={alCorriente ? "activa" : subs.length ? subs[0].estado : "pendiente"} />
                    {!alCorriente && <span style={{ marginLeft: 6, fontSize: 12.5, color: "var(--ink-soft)" }}>debe</span>}
                  </td>
                  <td>{activa?.proximo_cobro || "—"}</td>
                  <td>
                    {a.telefono ? (
                      <a href={`https://wa.me/${a.telefono.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                        WhatsApp
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(!alumnas || alumnas.length === 0) && <p className="admin-empty">No hay alumnas con estos filtros.</p>}
      </div>
    </>
  );
}
