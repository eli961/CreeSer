import { NextResponse } from "next/server";
import { verifyWebhookSignature, matchesWebhookToken } from "@/lib/billpocket";

/**
 * El pago ahora se hace en la página hospedada de Billpocket
 * (pay.billpocket.com/creerser), sin que nuestro servidor sepa de antemano a
 * qué alumna/plan corresponde cada cobro — por eso no hay forma confiable de
 * conciliar automáticamente aquí todavía. La confirmación real ocurre a mano
 * en /admin/pagos. Esta ruta solo queda lista para el día que se confirme el
 * formato exacto de la notificación (y, de haber un campo de referencia que
 * la alumna pueda capturar en la página de pago, usarlo para cruzarlo).
 */
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

  const tokenCandidate =
    req.headers.get("x-bp-token") ||
    req.headers.get("token") ||
    req.headers.get("x-bp-webhook-token") ||
    (payload.token as string | undefined) ||
    null;

  // Sin firma NI token: probablemente el ping de conectividad de Billpocket
  // al guardar la URL del webhook en su dashboard. Nada que procesar.
  if (!signature && !tokenCandidate) {
    return NextResponse.json({ ok: true });
  }

  const validSignature = signature && signatureKeyIndex ? await verifyWebhookSignature(rawBody, signature, signatureKeyIndex) : false;
  const validToken = matchesWebhookToken(tokenCandidate);
  if (!validSignature && !validToken) {
    return NextResponse.json({ error: "Firma/token inválido." }, { status: 401 });
  }

  return NextResponse.json({ received: true });
}
