import { createClient } from "@/lib/supabase/server";
import type { Profile, Suscripcion } from "@/lib/types";
import { estaAlCorriente } from "@/lib/types";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [{ data: profiles }, { data: suscripciones }, { count: comprobantesPendientes }] = await Promise.all([
    supabase.from("profiles").select("*").eq("rol", "alumna").returns<Profile[]>(),
    supabase.from("suscripciones").select("*").returns<Suscripcion[]>(),
    supabase
      .from("pagos")
      .select("id", { count: "exact", head: true })
      .eq("metodo", "transferencia")
      .eq("estado", "pendiente"),
  ]);

  const alumnas = profiles ?? [];
  const subs = suscripciones ?? [];
  const subsByUser = new Map<string, Suscripcion[]>();
  subs.forEach((s) => subsByUser.set(s.usuario_id, [...(subsByUser.get(s.usuario_id) || []), s]));

  const confirmadas = alumnas.filter((a) => a.estado_inscripcion === "confirmada").length;
  const pendientesInscripcion = alumnas.filter((a) => a.estado_inscripcion === "pendiente").length;
  const alCorriente = alumnas.filter((a) => estaAlCorriente(a, subsByUser.get(a.id) || [])).length;
  const debe = alumnas.length - alCorriente;

  return (
    <>
      <div className="admin__head">
        <h1>Resumen</h1>
      </div>
      <div className="admin-stats">
        <div className="admin-card admin-stat">
          <b>{alumnas.length}</b>
          <span>Alumnas totales</span>
        </div>
        <div className="admin-card admin-stat">
          <b>{confirmadas}</b>
          <span>Inscripción confirmada</span>
        </div>
        <div className="admin-card admin-stat">
          <b>{pendientesInscripcion}</b>
          <span>Inscripción pendiente</span>
        </div>
        <div className="admin-card admin-stat">
          <b>{alCorriente}</b>
          <span>Al corriente</span>
        </div>
        <div className="admin-card admin-stat">
          <b>{debe}</b>
          <span>Deben mensualidad</span>
        </div>
        <div className="admin-card admin-stat">
          <b>{comprobantesPendientes ?? 0}</b>
          <span>Comprobantes por validar</span>
        </div>
      </div>
      <div className="admin-card">
        <p style={{ color: "var(--ink-soft)" }}>
          Usa el menú para revisar alumnas, validar comprobantes, ver quién debe la mensualidad, y gestionar el
          calendario, los avisos y las grabaciones del ciclo.
        </p>
      </div>
    </>
  );
}
