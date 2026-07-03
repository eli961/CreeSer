"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchClasesFromSheet } from "@/lib/sheets";

export async function actualizarClase(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const tema = String(formData.get("tema") || "").trim();
  const ponente = String(formData.get("ponente") || "").trim();
  const admin = createAdminClient();
  await admin.from("clases").update({ tema, ponente }).eq("id", id);
  revalidatePath("/admin/contenido/clases");
}

/**
 * Importa tema/ponente desde el Google Sheet del ciclo (pestañas
 * "Calendario Mañanas" / "Calendario Tardes"). Solo actualiza fechas que ya
 * existen en `clases` (creadas por la migración de semilla) — no inventa
 * fechas nuevas fuera del calendario oficial.
 */
export async function importarDesdeSheet(formData: FormData) {
  await requireAdmin();
  const sheetId = String(formData.get("sheetId") || "").trim();
  if (!sheetId) return;

  const filas = await fetchClasesFromSheet(sheetId);
  const admin = createAdminClient();

  for (const fila of filas) {
    if (!fila.tema && !fila.ponente) continue;
    await admin
      .from("clases")
      .update({ tema: fila.tema, ponente: fila.ponente })
      .eq("fecha", fila.fecha)
      .eq("grupo", fila.grupo)
      .eq("orden", fila.orden);
  }

  revalidatePath("/admin/contenido/clases");
  revalidatePath("/");
}
