"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLANES } from "@/lib/mercadopago";
import type { PlanGrupo } from "@/lib/types";

export async function aprobarPago(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const admin = createAdminClient();

  const { data: pago } = await admin.from("pagos").select("*").eq("id", id).single();
  if (!pago) return;

  await admin.from("pagos").update({ estado: "pagado", pagado_en: new Date().toISOString() }).eq("id", id);

  if (pago.tipo === "inscripcion") {
    await admin.from("profiles").update({ estado_inscripcion: "confirmada" }).eq("id", pago.usuario_id);
  } else if (pago.tipo === "mensualidad") {
    // El monto del pago puede traer descuento de temporada, así que el plan
    // se toma del grupo ya elegido en el perfil de la alumna (no del monto).
    const { data: perfil } = await admin.from("profiles").select("grupo").eq("id", pago.usuario_id).single();
    const plan: PlanGrupo = perfil?.grupo === "tarde" ? "tarde" : "manana";
    const proximo = new Date();
    proximo.setMonth(proximo.getMonth() + 1);

    const { data: existente } = await admin
      .from("suscripciones")
      .select("id")
      .eq("usuario_id", pago.usuario_id)
      .eq("plan", plan)
      .maybeSingle();

    if (existente) {
      await admin
        .from("suscripciones")
        .update({ estado: "activa", proximo_cobro: proximo.toISOString().slice(0, 10) })
        .eq("id", existente.id);
    } else {
      await admin.from("suscripciones").insert({
        usuario_id: pago.usuario_id,
        estado: "activa",
        plan,
        monto: PLANES[plan].monto,
        pasarela: pago.pasarela ?? "mercadopago",
        proximo_cobro: proximo.toISOString().slice(0, 10),
      });
    }
  }

  revalidatePath("/admin/pagos");
  revalidatePath("/admin/alumnas");
  revalidatePath("/admin");
}

export async function rechazarPago(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const admin = createAdminClient();
  await admin.from("pagos").update({ estado: "rechazado" }).eq("id", id);
  revalidatePath("/admin/pagos");
}
