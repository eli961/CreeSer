import { IconStar, IconCheckCircle, IconCalendar } from "@/components/icons";
import type { Aviso } from "@/lib/types";

const STYLES = [
  { bg: "linear-gradient(135deg,var(--rose),#c85f7d)", Icon: IconStar },
  { bg: "linear-gradient(135deg,var(--teal-bright),var(--teal-deep))", Icon: IconCheckCircle },
  { bg: "linear-gradient(135deg,var(--gold-soft),var(--gold))", Icon: IconCalendar },
];

export default function Avisos({ avisos }: { avisos: Aviso[] }) {
  if (!avisos.length) return null;
  return (
    <section className="section deep" id="avisos">
      <div className="wrap">
        <div className="section-head reveal in">
          <p className="eyebrow">
            Avisos · <span className="heb">הוֹדָעוֹת</span>
          </p>
          <h2 className="display">Lo que necesitas saber</h2>
        </div>
        <div className={`avisos avisos--${avisos.length === 3 ? "3" : ""}`}>
          {avisos.map((a, i) => {
            const style = STYLES[i % STYLES.length];
            const Icon = style.Icon;
            return (
              <div
                className="aviso reveal in"
                key={a.id}
                style={{ background: "rgba(255,255,255,.05)", borderColor: "var(--line-light)" }}
              >
                <div className="aviso__ic" style={{ background: style.bg }}>
                  <Icon />
                </div>
                <div>
                  <h4 style={{ color: "#fff" }}>{a.titulo}</h4>
                  <p style={{ color: "rgba(234,246,247,.78)" }}>{a.texto}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
