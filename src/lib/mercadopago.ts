import { MercadoPagoConfig, Preference, PreApproval, Payment } from "mercadopago";

let config: MercadoPagoConfig | null = null;

function getConfig() {
  if (!config) {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) throw new Error("Falta MP_ACCESS_TOKEN en las variables de entorno.");
    config = new MercadoPagoConfig({ accessToken });
  }
  return config;
}

export const PLANES = {
  manana: { monto: 2500, nombre: "Mañanas" },
  tarde: { monto: 800, nombre: "Tardes" },
} as const;

export const PRECIO_INSCRIPCION = 1000;

export function getPreferenceClient() {
  return new Preference(getConfig());
}

export function getPreApprovalClient() {
  return new PreApproval(getConfig());
}

export function getPaymentClient() {
  return new Payment(getConfig());
}

export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
