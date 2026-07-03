import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPreferenceClient, PRECIO_INSCRIPCION, siteUrl } from "@/lib/mercadopago";

/**
 * Crea una preferencia de Checkout Pro para el pago único de inscripción ($1,000 MXN).
 * El webhook (/api/mp/webhook) confirma el pago y actualiza `pagos` + `profiles`.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) return NextResponse.json({ error: "Perfil no encontrado." }, { status: 404 });

  // Se usa el cliente con service role para las escrituras: esta ruta ya validó
  // la sesión arriba, y necesita actualizar el pago tras crear la preferencia
  // (la política de UPDATE de `pagos` es admin-only, por diseño).
  const admin = createAdminClient();
  const { data: pago, error: pagoErr } = await admin
    .from("pagos")
    .insert({
      usuario_id: user.id,
      tipo: "inscripcion",
      monto: PRECIO_INSCRIPCION,
      moneda: "MXN",
      metodo: "tarjeta",
      estado: "pendiente",
    })
    .select()
    .single();
  if (pagoErr || !pago) {
    return NextResponse.json({ error: "No se pudo iniciar el pago." }, { status: 500 });
  }

  try {
    const preference = getPreferenceClient();
    const result = await preference.create({
      body: {
        items: [
          {
            id: "inscripcion",
            title: "Inscripción Cree Ser — ciclo 5787",
            quantity: 1,
            unit_price: PRECIO_INSCRIPCION,
            currency_id: "MXN",
          },
        ],
        payer: { email: profile.email },
        external_reference: pago.id,
        back_urls: {
          success: `${siteUrl()}/#pagos`,
          failure: `${siteUrl()}/#pagos`,
          pending: `${siteUrl()}/#pagos`,
        },
        auto_return: "approved",
        notification_url: `${siteUrl()}/api/mp/webhook`,
      },
    });

    await admin.from("pagos").update({ mp_preference_id: result.id }).eq("id", pago.id);

    return NextResponse.json({ init_point: result.init_point });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error de Mercado Pago." },
      { status: 500 }
    );
  }
}
