const MENSAJE_SEGUIMIENTO_INSCRIPCION = `Hola, vimos tu inscripción, estamos muy emocionadas de tenerte en este gran proyecto. Te mando el link, ya puedes pagar en la página directo o por transferencia! Avísame cuando quede tu pago plis!

https://creesermx.com/#inscripciones

Datos de transferencia SPEI
Nombre CreeSer
CLABE 684180253007001522
Institución OPM / TRANSFER
Concepto Nombre + grupo`;

/** Antepone el 52 de México si el teléfono se guardó como 10 dígitos sin lada de país. */
function numeroWhatsapp(telefono: string): string {
  const digits = telefono.replace(/\D/g, "");
  return digits.length === 10 ? `52${digits}` : digits;
}

export function whatsappSeguimientoInscripcionUrl(telefono: string): string {
  return `https://wa.me/${numeroWhatsapp(telefono)}?text=${encodeURIComponent(MENSAJE_SEGUIMIENTO_INSCRIPCION)}`;
}
