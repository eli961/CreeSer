import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses RLS. Only for trusted server contexts:
 * Mercado Pago webhooks and admin-only route handlers that need to act on
 * behalf of a user who isn't the current request's caller.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
