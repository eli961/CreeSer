/**
 * Constantes y cálculo de precio del link de pago de Billpocket — sin
 * dependencias de Node (crypto), para poder importarse tanto desde
 * componentes de cliente como desde rutas de servidor.
 */

export const BILLPOCKET_LINK = "https://pay.billpocket.com/creerser";

export const BILLPOCKET_MONTO_INSCRIPCION = 1000;

/**
 * Promoción de lanzamiento: septiembre 2026 al 50%.
 * `periodoYYYYMM` es el mes que se está cobrando (ej. "2026-09"), no la fecha
 * en que se procesa el cobro.
 */
const PROMO_FACTOR_POR_PERIODO: Record<string, number> = {
  "2026-09": 0.5,
};

export function montoParaPeriodo(montoBase: number, periodoYYYYMM: string): number {
  const factor = PROMO_FACTOR_POR_PERIODO[periodoYYYYMM];
  if (factor === undefined) return montoBase;
  return Math.round(montoBase * factor);
}
