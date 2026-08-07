import crypto from "node:crypto";

/**
 * Pago con tarjeta vía el link de pago hospedado de Billpocket
 * (ver BILLPOCKET_LINK en ./billpocket-link) — la alumna captura su tarjeta
 * en la página de Billpocket, nunca en nuestro servidor. Este archivo solo
 * trae lo que requiere Node (verificación del webhook); las constantes de
 * precio están en ./billpocket-link para poder usarse también en el cliente.
 */

export { BILLPOCKET_LINK, BILLPOCKET_MONTO_INSCRIPCION, montoParaPeriodo } from "./billpocket-link";

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
