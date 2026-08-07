import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { chargeRecurring, montoParaPeriodo } from "@/lib/billpocket";

/**
 * Billpocket no cobra la mensualidad sola cada mes — a diferencia del
 * Preapproval de Mercado Pago, aquí el comercio es quien debe llamar
 * /txn/recurring cada periodo. Este endpoint lo hace: revisa las
 * suscripciones de Billpocket activas cuyo `proximo_cobro` ya llegó, cobra, y
 * mueve la fecha un mes. Vercel lo llama por cron (ver vercel.json).
 *
 * Protegido con CRON_SECRET para que no cualquiera pueda dispararlo.
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const admin = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: suscripciones } = await admin
    .from("suscripciones")
    .select("*")
    .eq("pasarela", "billpocket")
    .eq("estado", "activa")
    .lte("proximo_cobro", today);

  const periodo = today.slice(0, 7);
  const resultados = [];
  for (const s of suscripciones ?? []) {
    if (!s.bp_contract_number || !s.bp_card_token) continue;
    try {
      const montoCobrado = montoParaPeriodo(s.monto, periodo);
      // Con promoción al 100% no hay nada que cobrar este mes — se registra
      // el pago en $0 y se avanza la fecha sin llamar a Billpocket.
      const result =
        montoCobrado > 0
          ? await chargeRecurring({
              cardToken: s.bp_card_token,
              contractNumber: s.bp_contract_number,
              amount: montoCobrado,
              reference: s.bp_contract_number,
            })
          : { opId: "", approved: true, raw: null };

      const proximoCobro = new Date();
      proximoCobro.setMonth(proximoCobro.getMonth() + 1);

      await admin.from("pagos").insert({
        usuario_id: s.usuario_id,
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

      await admin
        .from("suscripciones")
        .update({
          estado: result.approved ? "activa" : "vencida",
          proximo_cobro: result.approved ? proximoCobro.toISOString().slice(0, 10) : s.proximo_cobro,
        })
        .eq("id", s.id);

      resultados.push({ suscripcionId: s.id, approved: result.approved });
    } catch (err) {
      await admin.from("suscripciones").update({ estado: "vencida" }).eq("id", s.id);
      resultados.push({ suscripcionId: s.id, error: err instanceof Error ? err.message : "error" });
    }
  }

  return NextResponse.json({ procesadas: resultados.length, resultados });
}
