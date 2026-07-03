import { IconCheck } from "@/components/icons";

export default function Programas() {
  return (
    <section className="section" id="programas">
      <div className="wrap">
        <div className="section-head reveal in">
          <p className="eyebrow eyebrow--gold">
            Nuestros programas · <span className="heb">שְׁנֵי מַסְלוּלִים</span>
          </p>
          <h2 className="display">Elige tu grupo</h2>
          <p className="lead">Dos caminos para sumarte al ciclo, según el horario que mejor te acomode.</p>
        </div>
        <div className="tracks" style={{ gridTemplateColumns: "repeat(2,1fr)", maxWidth: 840, marginInline: "auto" }}>
          <div className="track reveal in">
            <div className="track__top" style={{ background: "linear-gradient(90deg,var(--teal-bright),var(--teal-deep))" }} />
            <p className="age">Programa</p>
            <h3>Mañanas</h3>
            <p className="track__heb">בֹּקֶר</p>
            <p>Dos veces por semana · edades de 18 a 21 años.</p>
            <ul>
              <li>
                <IconCheck /> Lunes y Miércoles
              </li>
              <li>
                <IconCheck /> Dos clases por día · 11:30 y 12:40
              </li>
            </ul>
            <a href="#inscripciones" className="btn btn--primary">
              Quiero Mañanas
            </a>
          </div>

          <div className="track reveal in">
            <div className="track__top" style={{ background: "linear-gradient(90deg,var(--gold-soft),var(--gold))" }} />
            <p className="age">Programa</p>
            <h3>Tardes</h3>
            <p className="track__heb">עֶרֶב</p>
            <p>Una vez a la semana · edad preparatoria.</p>
            <ul>
              <li>
                <IconCheck /> Miércoles
              </li>
              <li>
                <IconCheck /> Una clase · 7:30 pm
              </li>
            </ul>
            <a href="#inscripciones" className="btn btn--ghost">
              Quiero Tardes
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
