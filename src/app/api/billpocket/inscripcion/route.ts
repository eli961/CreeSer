import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { tokenizeCard, charge, BILLPOCKET_MONTO_INSCRIPCION } from "@/lib/billpocket";

interface Body {
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  holderName?: string;
}

/**
 * Pago único de inscripción ($1,000 MXN) vía Billpocket. El número de tarjeta
 * llega aquí desde el formulario y se reenvía de inmediato a Billpocket — no
 * se guarda ni se registra en ningún log de esta ruta.
 */
export async function POST(req: Request) {
  const body = (await req.json()) as Body;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const admin = createAdminClient();
  const { data: pago, error: pagoErr } = await admin
    .from("pagos")
    .insert({
      usuario_id: user.id,
      tipo: "inscripcion",
      monto: BILLPOCKET_MONTO_INSCRIPCION,
      moneda: "MXN",
      metodo: "tarjeta",
      pasarela: "billpocket",
      estado: "pendiente",
    })
    .select()
    .single();
  if (pagoErr || !pago) {
    return NextResponse.json({ error: "No se pudo iniciar el pago." }, { status: 500 });
  }

  try {
    const { cardToken } = await tokenizeCard({
      cardNumber: body.cardNumber,
      expMonth: body.expMonth,
      expYear: body.expYear,
      holderName: body.holderName,
    });
    const result = await charge({
      cardToken,
      cvv: body.cvv,
      amount: BILLPOCKET_MONTO_INSCRIPCION,
      txnType: "sale",
      reference: pago.id,
    });

    await admin
      .from("pagos")
      .update({
        estado: result.approved ? "pagado" : "rechazado",
        bp_transaction_id: result.opId || null,
        pagado_en: result.approved ? new Date().toISOString() : null,
      })
      .eq("id", pago.id);

    if (result.approved) {
      await admin.from("profiles").update({ estado_inscripcion: "confirmada" }).eq("id", user.id);
    }

    return NextResponse.json({ approved: result.approved });
  } catch (err) {
    await admin.from("pagos").update({ estado: "rechazado" }).eq("id", pago.id);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al procesar el pago." },
      { status: 500 }
    );
  }
}
