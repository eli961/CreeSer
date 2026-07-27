export type Grupo = "manana" | "tarde" | "ambas";
export type Rol = "alumna" | "admin";
export type EstadoInscripcion = "pendiente" | "pagada" | "confirmada";

export interface Profile {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  edad: number | null;
  grupo: Grupo | null;
  rol: Rol;
  estado_inscripcion: EstadoInscripcion;
  created_at: string;
}

export type TipoPago = "inscripcion" | "mensualidad";
export type MetodoPago = "tarjeta" | "transferencia";
export type EstadoPago = "pendiente" | "pagado" | "vencido" | "rechazado";
export type Pasarela = "mercadopago" | "billpocket";

export interface Pago {
  id: string;
  usuario_id: string;
  tipo: TipoPago;
  monto: number;
  moneda: string;
  periodo: string | null;
  metodo: MetodoPago;
  estado: EstadoPago;
  comprobante_url: string | null;
  mp_payment_id: string | null;
  mp_preference_id: string | null;
  pasarela: Pasarela | null;
  bp_transaction_id: string | null;
  created_at: string;
  pagado_en: string | null;
}

export type EstadoSuscripcion = "pendiente" | "activa" | "vencida" | "cancelada";
export type PlanGrupo = "manana" | "tarde";

export interface Suscripcion {
  id: string;
  usuario_id: string;
  mp_preapproval_id: string | null;
  estado: EstadoSuscripcion;
  plan: PlanGrupo;
  monto: number;
  proximo_cobro: string | null;
  pasarela: Pasarela;
  bp_contract_number: string | null;
  bp_card_token: string | null;
  created_at: string;
}

export interface Clase {
  id: string;
  fecha: string; // YYYY-MM-DD
  grupo: PlanGrupo;
  orden: number;
  hora: string;
  tema: string;
  ponente: string;
}

export interface Aviso {
  id: string;
  titulo: string;
  texto: string;
  activo: boolean;
  orden: number;
  created_at: string;
}

export interface FechaImportante {
  fecha: string;
  etiqueta: string;
}

export interface Grabacion {
  id: string;
  titulo: string;
  pilar: number | null;
  tema_hebreo: string | null;
  tema_filtro: string;
  url_video: string | null;
  duracion: string | null;
  thumbnail: string | null;
  publicada: boolean;
  orden: number;
  created_at: string;
}

/** true una vez que la alumna está al corriente: inscripción confirmada + mensualidad activa. */
export function estaAlCorriente(profile: Pick<Profile, "estado_inscripcion">, suscripciones: Pick<Suscripcion, "estado">[]) {
  const inscripcionOk = profile.estado_inscripcion === "confirmada" || profile.estado_inscripcion === "pagada";
  const mensualidadOk = suscripciones.some((s) => s.estado === "activa");
  return inscripcionOk && mensualidadOk;
}
