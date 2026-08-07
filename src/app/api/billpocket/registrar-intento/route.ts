import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { BILLPOCKET_MONTO_INSCRIPCION, montoParaPeriodo } from "@/lib/billpocket-link";
import { PLANES } from "@/lib/mercadopago";
import type { PlanGrupo } from "@/lib/types";

interface Body {
  tipo: "inscripcion" | "mensualidad";
  plan?: PlanGrupo;
}

/**
 * La alumna paga en la página hospedada de Billpocket (fuera de este sitio),
 * así que aquí solo se deja un registro en "pagos" con estado "pendiente"
 * antes de redirigirla — igual que con una transferencia, un admin lo marca
 * como pagado en /admin/pagos una vez que ve el cobro reflejado.
 */
export async function POST(req: Request) {
  const body = (await req.json()) as Body;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const admin = createAdminClient();
  const periodo = new Date().toISOString().slice(0, 7);

  if (body.tipo === "inscripcion") {
    await admin.from("pagos").insert({
      usuario_id: user.id,
      tipo: "inscripcion",
      monto: BILLPOCKET_MONTO_INSCRIPCION,
      moneda: "MXN",
      metodo: "tarjeta",
      pasarela: "billpocket",
      estado: "pendiente",
    });
    return NextResponse.json({ ok: true });
  }

  if (body.tipo === "mensualidad" && (body.plan === "manana" || body.plan === "tarde")) {
    const monto = montoParaPeriodo(PLANES[body.plan].monto, periodo);
    await admin.from("pagos").insert({
      usuario_id: user.id,
      tipo: "mensualidad",
      monto,
      moneda: "MXN",
      periodo,
      metodo: "tarjeta",
      pasarela: "billpocket",
      estado: "pendiente",
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
}
