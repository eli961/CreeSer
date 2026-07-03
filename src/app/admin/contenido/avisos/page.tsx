import { createClient } from "@/lib/supabase/server";
import type { Aviso } from "@/lib/types";
import { crearAviso, alternarAviso, eliminarAviso } from "./actions";

export default async function AvisosPage() {
  const supabase = await createClient();
  const { data: avisos } = await supabase.from("avisos").select("*").order("orden").returns<Aviso[]>();

  return (
    <>
      <div className="admin__head">
        <h1>Avisos</h1>
      </div>
      <p style={{ color: "var(--ink-soft)", marginBottom: 16 }}>
        Se recomienda máximo 3 avisos activos a la vez — es lo que se ve en la sección pública de Avisos.
      </p>

      <div className="admin-card">
        <form action={crearAviso} className="admin-form">
          <div>
            <label htmlFor="titulo">Título</label>
            <input id="titulo" name="titulo" required />
          </div>
          <div>
            <label htmlFor="texto">Texto</label>
            <input id="texto" name="texto" />
          </div>
          <button type="submit" className="btn btn--primary btn--sm" style={{ alignSelf: "flex-start" }}>
            Agregar aviso
          </button>
        </form>
      </div>

      <div className="admin-card" style={{ overflowX: "auto" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Texto</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(avisos ?? []).map((a) => (
              <tr key={a.id}>
                <td>{a.titulo}</td>
                <td>{a.texto}</td>
                <td>
                  <span className={`badge ${a.activo ? "badge--ok" : "badge--bad"}`}>
                    {a.activo ? "activo" : "oculto"}
                  </span>
                </td>
                <td style={{ display: "flex", gap: 8 }}>
                  <form action={alternarAviso}>
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="activo" value={String(a.activo)} />
                    <button type="submit" className="btn btn--ghost btn--sm">
                      {a.activo ? "Ocultar" : "Activar"}
                    </button>
                  </form>
                  <form action={eliminarAviso}>
                    <input type="hidden" name="id" value={a.id} />
                    <button type="submit" className="btn btn--ghost btn--sm">
                      Eliminar
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!avisos || avisos.length === 0) && <p className="admin-empty">No hay avisos.</p>}
      </div>
    </>
  );
}
