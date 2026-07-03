"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function crearGrabacion(formData: FormData) {
  await requireAdmin();
  const titulo = String(formData.get("titulo") || "").trim();
  if (!titulo) return;
  const admin = createAdminClient();
  await admin.from("grabaciones").insert({
    titulo,
    pilar: Number(formData.get("pilar")) || null,
    tema_hebreo: String(formData.get("tema_hebreo") || "") || null,
    tema_filtro: String(formData.get("tema_filtro") || "asher"),
    url_video: String(formData.get("url_video") || "") || null,
    duracion: String(formData.get("duracion") || "") || null,
    publicada: true,
  });
  revalidatePath("/admin/contenido/grabaciones");
  revalidatePath("/");
}

export async function alternarGrabacion(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const publicada = formData.get("publicada") === "true";
  const admin = createAdminClient();
  await admin.from("grabaciones").update({ publicada: !publicada }).eq("id", id);
  revalidatePath("/admin/contenido/grabaciones");
  revalidatePath("/");
}

export async function eliminarGrabacion(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const admin = createAdminClient();
  await admin.from("grabaciones").delete().eq("id", id);
  revalidatePath("/admin/contenido/grabaciones");
  revalidatePath("/");
}
