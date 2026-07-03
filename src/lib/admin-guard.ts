import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/** Defense-in-depth: middleware already blocks non-admins from /admin, this re-checks server-side. */
export async function requireAdmin(): Promise<{ profile: Profile }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();
  if (!profile || profile.rol !== "admin") redirect("/");

  return { profile };
}
