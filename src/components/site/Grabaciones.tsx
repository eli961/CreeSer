import { createClient } from "@/lib/supabase/server";
import { estaAlCorriente } from "@/lib/types";
import type { Grabacion, Profile, Suscripcion } from "@/lib/types";
import { IconLock } from "@/components/icons";
import GateLoginButton from "./GateLoginButton";
import GrabacionesGrid from "./GrabacionesGrid";

export default async function Grabaciones() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let unlocked = false;
  let grabaciones: Grabacion[] = [];
  let motivoNoAlCorriente = false;

  if (user) {
    const [{ data: profile }, { data: subs }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single<Profile>(),
      supabase.from("suscripciones").select("*").eq("usuario_id", user.id).returns<Suscripcion[]>(),
    ]);
    unlocked = profile ? estaAlCorriente(profile, subs ?? []) : false;
    motivoNoAlCorriente = !unlocked;

    if (unlocked) {
      const { data } = await supabase
        .from("grabaciones")
        .select("*")
        .eq("publicada", true)
        .order("orden")
        .returns<Grabacion[]>();
      grabaciones = data ?? [];
    }
  }

  return (
    <section className="section" id="grabaciones">
      <div className="wrap">
        <div className="section-head reveal in">
          <p className="eyebrow eyebrow--gold">
            Grabaciones · <span className="heb">הַקְלָטוֹת</span>
          </p>
          <h2 className="display">Vuelve a cada clase, cuando la necesites</h2>
          <p className="lead">Toda la biblioteca de shiurim, organizada por tema. Nunca te pierdas una palabra de Torá.</p>
        </div>

        <div className={`gated${unlocked ? " unlocked" : ""}`}>
          {!unlocked && (
            <div className="gate-lock reveal in">
              <div className="gate-lock__ic">
                <IconLock />
              </div>
              <h3>Contenido solo para inscritas</h3>
              <p>
                {motivoNoAlCorriente
                  ? "Tu cuenta existe, pero tu inscripción o mensualidad aún no está al corriente. Completa tu pago para desbloquear las grabaciones."
                  : "Las grabaciones están disponibles para las alumnas del ciclo. Inicia sesión con tu cuenta para verlas."}
              </p>
              <div className="gate-lock__cta">
                {motivoNoAlCorriente ? (
                  <a href="#pagos" className="btn btn--primary btn--lg">
                    Completar pago
                  </a>
                ) : (
                  <GateLoginButton />
                )}
                <a href="#inscripciones" className="btn btn--ghost btn--lg">
                  Quiero inscribirme
                </a>
              </div>
            </div>
          )}

          <div className="gate-content">
            {unlocked && <GrabacionesGrid grabaciones={grabaciones} />}
          </div>
        </div>
      </div>
    </section>
  );
}
