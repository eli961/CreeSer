import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookSignature, matchesWebhookToken } from "@/lib/billpocket";

/**
 * Billpocket llama esta ruta por HTTP POST solo cuando una autorización es
 * APROBADA (según su documentación, las rechazadas no se notifican por este
 * medio). Debe responder 200 en menos de 2 segundos — se mantiene el trabajo
 * al mínimo indispensable.
 *
 * Verificación de campos sin confirmar verbatim: el payload y los nombres
 * exactos de sus campos (transacción, referencia, monto) se infirieron de un
 * resumen de la documentación, no de la especificación original. Ajustar
 * `extractFields` si la notificación real trae otros nombres — revisar el
 * campo `raw` que se guarda de todos modos en cada pago para poder
 * diagnosticarlo después.
 */
// Billpocket hace una prueba de conectividad al guardar la URL del webhook en
// su dashboard — típicamente sin cuerpo ni firma. Responder 200 aquí para que
// esa prueba pase.
export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-bp-signature") || "";
  const signatureKeyIndex = req.headers.get("x-bp-signaturekey") || "";

  let payload: Record<string, unknown> = {};
  try {
    payload = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  // Nombre de header/campo del "Token" del dashboard sin confirmar — se
  // revisan varias variantes plausibles (header o body) hasta ver una
  // notificación real y confirmar cuál usa Billpocket.
  const tokenCandidate =
    req.headers.get("x-bp-token") ||
    req.headers.get("token") ||
    req.headers.get("x-bp-webhook-token") ||
    (payload.token as string | undefined) ||
    null;

  // Sin firma NI token: no es una notificación real de pago (probablemente el
  // ping de conectividad de Billpocket al guardar la URL). Nada que procesar.
  if (!signature && !tokenCandidate) {
    return NextResponse.json({ ok: true });
  }

  const validSignature = signature && signatureKeyIndex ? await verifyWebhookSignature(rawBody, signature, signatureKeyIndex) : false;
  const validToken = matchesWebhookToken(tokenCandidate);
  if (!validSignature && !validToken) {
    return NextResponse.json({ error: "Firma/token inválido." }, { status: 401 });
  }

  const opId = String(payload.opId ?? payload.id ?? payload.transactionId ?? "");
  const reference = String(payload.reference ?? payload.merchantReference ?? payload.contractNumber ?? "");

  const admin = createAdminClient();

  if (opId) {
    await admin
      .from("pagos")
      .update({ estado: "pagado", pagado_en: new Date().toISOString() })
      .eq("bp_transaction_id", opId);
  }

  // El webhook también confirma cargos recurrentes (mensualidad) — si la
  // referencia coincide con un contractNumber, asegura que la suscripción
  // quede activa (por si el cron aún no procesó la respuesta síncrona).
  if (reference) {
    const { data: pagoPorRef } = await admin
      .from("pagos")
      .select("id, usuario_id, tipo")
      .eq("bp_transaction_id", opId)
      .maybeSingle();

    if (pagoPorRef?.tipo === "inscripcion") {
      await admin.from("profiles").update({ estado_inscripcion: "confirmada" }).eq("id", pagoPorRef.usuario_id);
    }

    await admin.from("suscripciones").update({ estado: "activa" }).eq("bp_contract_number", reference);
  }

  return NextResponse.json({ received: true });
}
