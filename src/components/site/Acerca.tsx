import Image from "next/image";
import { IconHeart, IconBook, IconFlame } from "@/components/icons";

export default function Acerca() {
  return (
    <section className="section" id="acerca">
      <div className="wrap">
        <div className="about__grid">
          <div className="reveal in">
            <p className="eyebrow eyebrow--gold">
              Acerca de · <span className="heb">מִי אֲנַחְנוּ</span>
            </p>
            <p className="about__lead">
              Cree Ser es donde la Torá <span className="gold-text">se vive desde el corazón</span> — donde las bases
              de la Torá son la base de tu vida, tu avodat Hashem es auténtica y logramos ser quienes queremos ser.
            </p>
            <div className="spark-rule" style={{ justifyContent: "flex-start", marginTop: 14 }}>
              <Image src="/assets/creeser-logo.png" alt="" width={120} height={62} />
            </div>
          </div>
          <div className="values reveal in">
            <div className="value">
              <div className="value__ic" style={{ background: "linear-gradient(135deg,var(--rose),#c85f7d)" }}>
                <IconHeart />
              </div>
              <div>
                <h4>
                  Desde el corazón <span className="heb">בְּלֵב שָׁלֵם</span>
                </h4>
                <p>Transmitimos valores desde el alma, no solo desde la mente.</p>
              </div>
            </div>
            <div className="value">
              <div className="value__ic" style={{ background: "linear-gradient(135deg,var(--teal-bright),var(--teal-deep))" }}>
                <IconBook />
              </div>
              <div>
                <h4>
                  Con bases de Torá <span className="heb">תּוֹרָה</span>
                </h4>
                <p>Pensar diferente, sí — pero siempre con fuentes y fundamentos sólidos.</p>
              </div>
            </div>
            <div className="value">
              <div className="value__ic" style={{ background: "linear-gradient(135deg,var(--gold-soft),var(--gold))" }}>
                <IconFlame />
              </div>
              <div>
                <h4>
                  Avodat Hashem auténtica <span className="heb">עֲבוֹדַת ה׳</span>
                </h4>
                <p>Una relación con Hashem real, viva y profundamente personal.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
