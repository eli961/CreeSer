import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { tokenizeCard, charge, montoParaPeriodo } from "@/lib/billpocket";
import { PLANES } from "@/lib/mercadopago";
import type { PlanGrupo } from "@/lib/types";

interface Body {
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  holderName?: string;
  plan: PlanGrupo;
}

/**
 * Primer cobro de la mensualidad recurrente vía Billpocket. Crea un
 * "contractNumber" propio y lo guarda junto al cardToken en `suscripciones`
 * para que el cron mensual (/api/billpocket/cron-mensualidad) pueda seguir
 * cobrando sin que la alumna vuelva a capturar su tarjeta cada mes.
 */
export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  if (body.plan !== "manana" && body.plan !== "tarde") {
    return NextResponse.json({ error: "Plan inválido." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const { monto } = PLANES[body.plan];
  const admin = createAdminClient();
  const contractNumber = `${body.plan}-${user.id}-${Date.now()}`;
  const periodo = new Date().toISOString().slice(0, 7);
  const montoCobrado = montoParaPeriodo(monto, periodo);

  try {
    const { cardToken } = await tokenizeCard({
      cardNumber: body.cardNumber,
      expMonth: body.expMonth,
      expYear: body.expYear,
      holderName: body.holderName,
    });
    // Con promoción al 100% (agosto gratis) no hay nada que cobrar — solo se
    // guarda la tarjeta para los cargos de los meses siguientes.
    const result =
      montoCobrado > 0
        ? await charge({
            cardToken,
            cvv: body.cvv,
            amount: montoCobrado,
            txnType: "recurring",
            contractNumber,
            reference: contractNumber,
          })
        : { opId: "", approved: true, raw: null };

    const proximoCobro = new Date();
    proximoCobro.setMonth(proximoCobro.getMonth() + 1);

    const { data: suscripcion } = await admin
      .from("suscripciones")
      .insert({
        usuario_id: user.id,
        estado: result.approved ? "activa" : "pendiente",
        plan: body.plan,
        monto,
        pasarela: "billpocket",
        bp_contract_number: contractNumber,
        bp_card_token: cardToken,
        proximo_cobro: result.approved ? proximoCobro.toISOString().slice(0, 10) : null,
      })
      .select()
      .single();

    await admin.from("pagos").insert({
      usuario_id: user.id,
      tipo: "mensualidad",
      monto: montoCobrado,
      moneda: "MXN",
      periodo,
      metodo: "tarjeta",
      pasarela: "billpocket",
      estado: result.approved ? "pagado" : "rechazado",
      bp_transaction_id: result.opId || null,
      pagado_en: result.approved ? new Date().toISOString() : null,
    });

    return NextResponse.json({ approved: result.approved, suscripcionId: suscripcion?.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al procesar el pago." },
      { status: 500 }
    );
  }
}
