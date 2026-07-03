import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Pago, Profile } from "@/lib/types";
import { aprobarPago, rechazarPago } from "./actions";

export default async function PagosPage() {
  const supabase = await createClient();

  const [{ data: pagos }, { data: alumnas }] = await Promise.all([
    supabase.from("pagos").select("*").order("created_at", { ascending: false }).returns<Pago[]>(),
    supabase.from("profiles").select("*").returns<Profile[]>(),
  ]);

  const alumnaById = new Map((alumnas ?? []).map((a) => [a.id, a]));
  const pendientesTransferencia = (pagos ?? []).filter((p) => p.metodo === "transferencia" && p.estado === "pendiente");

  const admin = createAdminClient();
  const conUrl = await Promise.all(
    pendientesTransferencia.map(async (p) => {
      if (!p.comprobante_url) return { pago: p, url: null };
      const { data } = await admin.storage.from("comprobantes").createSignedUrl(p.comprobante_url, 600);
      return { pago: p, url: data?.signedUrl ?? null };
    })
  );

  return (
    <>
      <div className="admin__head">
        <h1>Pagos y comprobantes</h1>
      </div>

      <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", marginBottom: 12 }}>
        Comprobantes por validar ({conUrl.length})
      </h3>
      {conUrl.length === 0 && <p className="admin-empty">No hay comprobantes pendientes.</p>}
      {conUrl.map(({ pago, url }) => {
        const alumna = alumnaById.get(pago.usuario_id);
        return (
          <div className="admin-card" key={pago.id} style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            {url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="Comprobante" style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 12, border: "1px solid var(--line)" }} />
            )}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 700 }}>{alumna?.nombre || pago.usuario_id}</div>
              <div style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>{alumna?.email}</div>
              <div style={{ marginTop: 6, fontSize: 14.5 }}>
                {pago.tipo === "inscripcion" ? "Inscripción" : `Mensualidad · ${pago.periodo || ""}`} · ${pago.monto} {pago.moneda}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <form action={aprobarPago}>
                <input type="hidden" name="id" value={pago.id} />
                <button type="submit" className="btn btn--primary btn--sm">
                  Aprobar
                </button>
              </form>
              <form action={rechazarPago}>
                <input type="hidden" name="id" value={pago.id} />
                <button type="submit" className="btn btn--ghost btn--sm">
                  Rechazar
                </button>
              </form>
            </div>
          </div>
        );
      })}

      <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", margin: "32px 0 12px" }}>Todos los pagos</h3>
      <div className="admin-card" style={{ overflowX: "auto" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Alumna</th>
              <th>Tipo</th>
              <th>Monto</th>
              <th>Método</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {(pagos ?? []).map((p) => {
              const alumna = alumnaById.get(p.usuario_id);
              return (
                <tr key={p.id}>
                  <td>{alumna?.nombre || p.usuario_id}</td>
                  <td>{p.tipo === "inscripcion" ? "Inscripción" : `Mensualidad ${p.periodo || ""}`}</td>
                  <td>
                    ${p.monto} {p.moneda}
                  </td>
                  <td>{p.metodo}</td>
                  <td>
                    <span
                      className={`badge ${
                        p.estado === "pagado" ? "badge--ok" : p.estado === "rechazado" ? "badge--bad" : "badge--warn"
                      }`}
                    >
                      {p.estado}
                    </span>
                  </td>
                  <td>{new Date(p.created_at).toLocaleDateString("es-MX")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(!pagos || pagos.length === 0) && <p className="admin-empty">Aún no hay pagos.</p>}
      </div>
    </>
  );
}
