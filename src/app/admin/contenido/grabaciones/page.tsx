import { createClient } from "@/lib/supabase/server";
import type { Grabacion } from "@/lib/types";
import { crearGrabacion, alternarGrabacion, eliminarGrabacion } from "./actions";

const FILTROS = ["asher", "valor", "comunicacion", "eshet", "jasidut", "tefila"];

export default async function GrabacionesAdminPage() {
  const supabase = await createClient();
  const { data: grabaciones } = await supabase.from("grabaciones").select("*").order("orden").returns<Grabacion[]>();

  return (
    <>
      <div className="admin__head">
        <h1>Grabaciones</h1>
      </div>
      <p style={{ color: "var(--ink-soft)", marginBottom: 16 }}>
        Sube el link del video (YouTube/Vimeo privado, o el que uses). Solo se ven en el sitio a alumnas con sesión
        iniciada y mensualidad al corriente.
      </p>

      <div className="admin-card">
        <form action={crearGrabacion} className="admin-form">
          <div>
            <label htmlFor="titulo">Título</label>
            <input id="titulo" name="titulo" required />
          </div>
          <div>
            <label htmlFor="pilar">Pilar (1-6)</label>
            <input id="pilar" name="pilar" type="number" min={1} max={6} />
          </div>
          <div>
            <label htmlFor="tema_hebreo">Tema en hebreo</label>
            <input id="tema_hebreo" name="tema_hebreo" dir="rtl" />
          </div>
          <div>
            <label htmlFor="tema_filtro">Filtro</label>
            <select id="tema_filtro" name="tema_filtro" defaultValue="asher">
              {FILTROS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="url_video">URL del video</label>
            <input id="url_video" name="url_video" type="url" placeholder="https://..." />
          </div>
          <div>
            <label htmlFor="duracion">Duración</label>
            <input id="duracion" name="duracion" placeholder="52 min" />
          </div>
          <button type="submit" className="btn btn--primary btn--sm" style={{ alignSelf: "flex-start" }}>
            Agregar grabación
          </button>
        </form>
      </div>

      <div className="admin-card" style={{ overflowX: "auto" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Pilar</th>
              <th>Filtro</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(grabaciones ?? []).map((g) => (
              <tr key={g.id}>
                <td>{g.titulo}</td>
                <td>{g.pilar ?? "—"}</td>
                <td>{g.tema_filtro}</td>
                <td>
                  <span className={`badge ${g.publicada ? "badge--ok" : "badge--bad"}`}>
                    {g.publicada ? "publicada" : "oculta"}
                  </span>
                </td>
                <td style={{ display: "flex", gap: 8 }}>
                  <form action={alternarGrabacion}>
                    <input type="hidden" name="id" value={g.id} />
                    <input type="hidden" name="publicada" value={String(g.publicada)} />
                    <button type="submit" className="btn btn--ghost btn--sm">
                      {g.publicada ? "Ocultar" : "Publicar"}
                    </button>
                  </form>
                  <form action={eliminarGrabacion}>
                    <input type="hidden" name="id" value={g.id} />
                    <button type="submit" className="btn btn--ghost btn--sm">
                      Eliminar
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!grabaciones || grabaciones.length === 0) && <p className="admin-empty">No hay grabaciones.</p>}
      </div>
    </>
  );
}
