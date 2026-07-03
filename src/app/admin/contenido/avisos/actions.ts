"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function crearAviso(formData: FormData) {
  await requireAdmin();
  const titulo = String(formData.get("titulo") || "").trim();
  const texto = String(formData.get("texto") || "").trim();
  if (!titulo) return;
  const admin = createAdminClient();
  const { count } = await admin.from("avisos").select("id", { count: "exact", head: true });
  await admin.from("avisos").insert({ titulo, texto, activo: true, orden: count ?? 0 });
  revalidatePath("/admin/contenido/avisos");
  revalidatePath("/");
}

export async function alternarAviso(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const activo = formData.get("activo") === "true";
  const admin = createAdminClient();
  await admin.from("avisos").update({ activo: !activo }).eq("id", id);
  revalidatePath("/admin/contenido/avisos");
  revalidatePath("/");
}

export async function eliminarAviso(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const admin = createAdminClient();
  await admin.from("avisos").delete().eq("id", id);
  revalidatePath("/admin/contenido/avisos");
  revalidatePath("/");
}
