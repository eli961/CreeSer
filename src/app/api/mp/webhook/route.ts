import { NextResponse } from "next/server";
import { WebhookSignatureValidator, InvalidWebhookSignatureError } from "mercadopago";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentClient, getPreApprovalClient } from "@/lib/mercadopago";

/**
 * Mercado Pago llama esta ruta (IPN / webhooks) cuando cambia el estado de un
 * pago (Checkout Pro, inscripción) o de una suscripción (preapproval, mensualidad).
 * Configúrala como "notification_url" / URL de webhooks en la app de Mercado Pago:
 *   https://tu-dominio.com/api/mp/webhook
 */
async function handle(req: Request) {
  const url = new URL(req.url);
  let body: { type?: string; data?: { id?: string } } | null = null;
  if (req.method === "POST") {
    body = await req.json().catch(() => null);
  }

  const type = body?.type || url.searchParams.get("type") || url.searchParams.get("topic");
  const dataId = body?.data?.id || url.searchParams.get("data.id") || url.searchParams.get("id");

  if (!type || !dataId) return NextResponse.json({ received: true });

  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    // Sin secreto no hay forma de confirmar que la notificación viene de Mercado Pago.
    // En producción eso dejaría la ruta abierta a que cualquiera fuerce cambios de estado
    // en pagos/suscripciones reales — mejor rechazar que degradar en silencio.
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "MP_WEBHOOK_SECRET no está configurado." }, { status: 503 });
    }
  } else {
    try {
      WebhookSignatureValidator.validate({
        xSignature: req.headers.get("x-signature"),
        xRequestId: req.headers.get("x-request-id"),
        dataId,
        secret,
        toleranceSeconds: 300,
      });
    } catch (err) {
      const reason = err instanceof InvalidWebhookSignatureError ? err.reason : "unknown";
      return NextResponse.json({ error: `Firma inválida (${reason})` }, { status: 401 });
    }
  }

  const admin = createAdminClient();

  if (type === "payment") {
    const payment = await getPaymentClient().get({ id: dataId });
    const externalRef = payment.external_reference;
    if (externalRef) {
      const estado =
        payment.status === "approved" ? "pagado" : payment.status === "rejected" ? "rechazado" : "pendiente";
      await admin
        .from("pagos")
        .update({
          estado,
          mp_payment_id: String(payment.id),
          pagado_en: estado === "pagado" ? new Date().toISOString() : null,
        })
        .eq("id", externalRef);

      if (estado === "pagado") {
        const { data: pago } = await admin
          .from("pagos")
          .select("usuario_id, tipo")
          .eq("id", externalRef)
          .single();
        if (pago?.tipo === "inscripcion") {
          await admin.from("profiles").update({ estado_inscripcion: "confirmada" }).eq("id", pago.usuario_id);
        }
      }
    }
  } else if (type === "subscription_preapproval" || type === "preapproval") {
    const sub = await getPreApprovalClient().get({ id: dataId });
    const externalRef = sub.external_reference;
    if (externalRef) {
      const estado =
        sub.status === "authorized"
          ? "activa"
          : sub.status === "cancelled"
          ? "cancelada"
          : sub.status === "paused"
          ? "vencida"
          : "pendiente";
      await admin
        .from("suscripciones")
        .update({
          estado,
          mp_preapproval_id: String(sub.id),
          proximo_cobro: sub.next_payment_date ? sub.next_payment_date.slice(0, 10) : null,
        })
        .eq("id", externalRef);
    }
  }

  return NextResponse.json({ received: true });
}

export async function POST(req: Request) {
  return handle(req);
}

export async function GET(req: Request) {
  return handle(req);
}
