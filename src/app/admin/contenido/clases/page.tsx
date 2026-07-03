import { createClient } from "@/lib/supabase/server";
import type { Clase, PlanGrupo } from "@/lib/types";
import { actualizarClase, importarDesdeSheet } from "./actions";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export default async function ClasesPage({
  searchParams,
}: {
  searchParams: Promise<{ grupo?: string; mes?: string }>;
}) {
  const { grupo: grupoParam, mes: mesParam } = await searchParams;
  const grupo = (grupoParam as PlanGrupo) || "manana";
  const supabase = await createClient();

  const { data: clases } = await supabase
    .from("clases")
    .select("*")
    .eq("grupo", grupo)
    .order("fecha")
    .order("orden")
    .returns<Clase[]>();

  const porMes = new Map<string, Clase[]>();
  (clases ?? []).forEach((c) => {
    const key = c.fecha.slice(0, 7);
    porMes.set(key, [...(porMes.get(key) || []), c]);
  });
  const meses = Array.from(porMes.keys()).sort();
  const mesActivo = mesParam && porMes.has(mesParam) ? mesParam : meses[0];
  const visibles = mesActivo ? porMes.get(mesActivo) || [] : [];

  return (
    <>
      <div className="admin__head">
        <h1>Clases del ciclo</h1>
      </div>
      <p style={{ color: "var(--ink-soft)", marginBottom: 16 }}>
        Edita el tema y ponente de cada clase. Esto alimenta el calendario público y sus tooltips al instante.
      </p>

      <div className="admin-card">
        <form action={importarDesdeSheet} className="admin-toolbar" style={{ marginBottom: 0 }}>
          <input
            name="sheetId"
            placeholder="ID del Google Sheet"
            defaultValue="1yBk7Yjwk5LbWiAzi92eT_Es4cIUtqkCm_nYZaW4Yr0k"
            style={{ minWidth: 280 }}
          />
          <button type="submit" className="btn btn--primary btn--sm">
            Importar tema/ponente desde el Sheet
          </button>
        </form>
        <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 10 }}>
          Lee las pestañas &quot;Calendario Mañanas&quot; / &quot;Calendario Tardes&quot; (deben estar compartidas
          como &quot;Cualquiera con el enlace: Lector&quot;) y actualiza tema/ponente de las fechas ya existentes.
        </p>
      </div>

      <form className="admin-toolbar" method="get">
        <select name="grupo" defaultValue={grupo}>
          <option value="manana">Mañanas</option>
          <option value="tarde">Tardes</option>
        </select>
        <select name="mes" defaultValue={mesActivo}>
          {meses.map((m) => {
            const [y, mm] = m.split("-").map(Number);
            return (
              <option key={m} value={m}>
                {MESES[mm - 1]} {y}
              </option>
            );
          })}
        </select>
        <button type="submit" className="btn btn--ghost btn--sm">
          Ver
        </button>
      </form>

      <div className="admin-card" style={{ overflowX: "auto" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Tema</th>
              <th>Ponente</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((c) => (
              <tr key={c.id}>
                <td>{c.fecha}</td>
                <td>{c.hora}</td>
                <td colSpan={3}>
                  <form action={actualizarClase} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input type="hidden" name="id" value={c.id} />
                    <input name="tema" defaultValue={c.tema} placeholder="Tema" style={{ flex: 1 }} />
                    <input name="ponente" defaultValue={c.ponente} placeholder="Ponente" style={{ flex: 1 }} />
                    <button type="submit" className="btn btn--primary btn--sm">
                      Guardar
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visibles.length === 0 && <p className="admin-empty">No hay clases seed para este mes/grupo.</p>}
      </div>
    </>
  );
}
