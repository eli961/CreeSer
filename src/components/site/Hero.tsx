import Image from "next/image";

export default function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="hero__bg" />
      <div className="wrap hero__in">
        <div className="hero__mark reveal in">
          <Image src="/assets/creeser-logo.png" alt="Cree Ser" width={420} height={216} priority />
        </div>
        <p className="eyebrow eyebrow--gold reveal in" style={{ justifyContent: "center", marginBottom: 20 }}>
          Nuevo ciclo · 5787
        </p>
        <h1 className="reveal in">
          <span className="hl">Cree</span> en ti misma,
          <br />
          <span className="hl">sé</span> tu mejor versión.
        </h1>
        <p className="hero__sub reveal in">
          Desarrollando el <span className="heb">דְּבֵקוּת</span> con la Torá,
          <br />
          desde el amor y la profundidad.
        </p>
        <div className="hero__cta reveal in">
          <a href="#inscripciones" className="btn btn--primary btn--lg">
            Inscríbete
          </a>
          <a href="#calendario" className="btn btn--ghost btn--lg">
            Ver calendario
          </a>
        </div>
      </div>
    </section>
  );
}
