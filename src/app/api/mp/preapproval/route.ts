import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPreApprovalClient, PLANES, siteUrl } from "@/lib/mercadopago";
import type { PlanGrupo } from "@/lib/types";

/**
 * Crea una suscripción (preapproval) de Mercado Pago para el cargo mensual
 * automático a tarjeta. Dos planes: Mañanas $2,500/mes y Tardes $800/mes.
 * El webhook confirma la autorización y activa `suscripciones`.
 */
export async function POST(req: Request) {
  const { plan } = (await req.json()) as { plan: PlanGrupo };
  if (plan !== "manana" && plan !== "tarde") {
    return NextResponse.json({ error: "Plan inválido." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) return NextResponse.json({ error: "Perfil no encontrado." }, { status: 404 });

  const admin = createAdminClient();
  const { monto, nombre } = PLANES[plan];

  const { data: suscripcion, error: subErr } = await admin
    .from("suscripciones")
    .insert({
      usuario_id: user.id,
      estado: "pendiente",
      plan,
      monto,
    })
    .select()
    .single();
  if (subErr || !suscripcion) {
    return NextResponse.json({ error: "No se pudo iniciar la suscripción." }, { status: 500 });
  }

  try {
    const preapproval = getPreApprovalClient();
    const result = await preapproval.create({
      body: {
        reason: `Cree Ser · Mensualidad ${nombre}`,
        external_reference: suscripcion.id,
        payer_email: profile.email,
        back_url: `${siteUrl()}/#pagos`,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: monto,
          currency_id: "MXN",
        },
        status: "pending",
      },
    });

    await admin
      .from("suscripciones")
      .update({ mp_preapproval_id: result.id })
      .eq("id", suscripcion.id);

    return NextResponse.json({ init_point: result.init_point });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error de Mercado Pago." },
      { status: 500 }
    );
  }
}
