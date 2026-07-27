import crypto from "node:crypto";

/**
 * Cliente para Billpocket Flex (E-Commerce Basic Gateway).
 *
 * ADVERTENCIA — nombres de campo sin verificar: esta especificación se obtuvo
 * de un resumen relayed de la documentación de Confluence de Billpocket (no
 * pude leerla directamente — está bloqueada para herramientas automáticas, y
 * el entorno donde corre este código tampoco tiene salida de red hacia
 * Billpocket para probarlo). Los endpoints y el flujo general (tokenizar,
 * cobrar, cobrar recurrente con contractNumber, webhook firmado) son reales,
 * pero los nombres EXACTOS de los campos JSON son la mejor inferencia posible
 * a partir de esa descripción — pruébalo contra el ambiente demo
 * (BILLPOCKET_BASE_URL=https://lancehorn.billpocket.dev/scops) antes de usarlo
 * con dinero real, y ajusta los nombres de campo en `bpFetch`/`normalizeChargeResult`
 * si la respuesta real no calza.
 *
 * ADVERTENCIA — alcance PCI: /card recibe el número de tarjeta completo y lo
 * reenvía a Billpocket desde este servidor (no hay, en la documentación que
 * pude conseguir, un flujo de tokenización 100% desde el navegador). El número
 * nunca se guarda ni se registra en logs, pero transita por este servidor —
 * eso probablemente implica un nivel de cumplimiento PCI-DSS más alto que
 * Mercado Pago (que nunca ve la tarjeta). Confirma esto con Billpocket.
 */

const BASE_URL = process.env.BILLPOCKET_BASE_URL || "https://lancehorn.billpocket.com/scops";
const API_KEY = process.env.BILLPOCKET_API_KEY;

function requireApiKey(): string {
  if (!API_KEY) throw new Error("Falta BILLPOCKET_API_KEY en las variables de entorno.");
  return API_KEY;
}

async function bpFetch<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const apiKey = requireApiKey();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apiKey },
    body: JSON.stringify({ ...body, apiKey }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Billpocket ${path} respondió ${res.status}: ${JSON.stringify(data)}`);
  }
  return data as T;
}

export interface TokenizeCardInput {
  cardNumber: string;
  expMonth: string;
  expYear: string;
  holderName?: string;
}

export interface TokenizeCardResult {
  cardToken: string;
  maskedPan?: string;
}

/** Tokeniza una tarjeta. Ver advertencia de alcance PCI arriba. */
export async function tokenizeCard(input: TokenizeCardInput): Promise<TokenizeCardResult> {
  const data = await bpFetch<Record<string, unknown>>("/card", {
    cardNumber: input.cardNumber,
    expMonth: input.expMonth,
    expYear: input.expYear,
    holderName: input.holderName,
  });
  const cardToken = String(data.cardToken ?? data.token ?? "");
  if (!cardToken) throw new Error("Billpocket no devolvió un cardToken.");
  return { cardToken, maskedPan: (data.maskedPan ?? data.pan) as string | undefined };
}

export type TxnType = "sale" | "recurring" | "recurringCheckIn";

export interface ChargeInput {
  cardToken: string;
  cvv: string;
  amount: number;
  txnType?: TxnType;
  contractNumber?: string;
  reference?: string;
}

export interface ChargeResult {
  opId: string;
  approved: boolean;
  authCode?: string;
  raw: unknown;
}

function normalizeChargeResult(data: Record<string, unknown>): ChargeResult {
  const opId = String(data.opId ?? data.id ?? data.transactionId ?? "");
  const resultField = String(data.result ?? data.status ?? "").toLowerCase();
  const approved = resultField === "approved" || resultField === "aprobada" || data.approved === true;
  return { opId, approved, authCode: data.authCode as string | undefined, raw: data };
}

/** Autoriza un cargo (venta única, o el primer cobro de un contrato recurrente). */
export async function charge(input: ChargeInput): Promise<ChargeResult> {
  const data = await bpFetch<Record<string, unknown>>("/txn", {
    cardToken: input.cardToken,
    cvv: input.cvv,
    amount: input.amount,
    txnType: input.txnType || "sale",
    contractNumber: input.contractNumber,
    reference: input.reference,
  });
  return normalizeChargeResult(data);
}

/** Cobra un contrato recurrente ya establecido (llamar una vez al mes por suscripción). */
export async function chargeRecurring(input: {
  cardToken: string;
  contractNumber: string;
  amount: number;
  reference?: string;
}): Promise<ChargeResult> {
  const data = await bpFetch<Record<string, unknown>>("/txn/recurring", {
    cardToken: input.cardToken,
    contractNumber: input.contractNumber,
    amount: input.amount,
    reference: input.reference,
  });
  return normalizeChargeResult(data);
}

/**
 * Verifica la firma RSA-SHA256 de un webhook de Billpocket contra su llave
 * pública publicada (keys.billpocket.com/webhook/<índice>.pem).
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signatureBase64: string,
  signatureKeyIndex: string
): Promise<boolean> {
  if (!signatureBase64 || !signatureKeyIndex) return false;
  try {
    const pemRes = await fetch(`https://keys.billpocket.com/webhook/${signatureKeyIndex}.pem`);
    if (!pemRes.ok) return false;
    const publicKeyPem = await pemRes.text();
    const verifier = crypto.createVerify("RSA-SHA256");
    verifier.update(rawBody, "utf8");
    verifier.end();
    return verifier.verify(publicKeyPem, signatureBase64, "base64");
  } catch {
    return false;
  }
}

export const BILLPOCKET_MONTO_INSCRIPCION = 1000;

/**
 * El dashboard de Billpocket (Configuración → Integraciones → Webhook
 * General) tiene un campo "Token" sin descripción, junto a la config del
 * webhook. No apareció documentado en la especificación de firma RSA que sí
 * está confirmada — puede ser un mecanismo alterno de validación (token
 * compartido en vez de firma asimétrica). Se acepta como verificación
 * ADICIONAL a la firma RSA, nunca en su lugar, hasta confirmar en qué
 * header/campo exacto lo manda Billpocket.
 */
export function matchesWebhookToken(candidate: string | null | undefined): boolean {
  const expected = process.env.BILLPOCKET_WEBHOOK_TOKEN;
  if (!expected || !candidate) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
