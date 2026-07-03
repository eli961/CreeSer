const TEMAS = [
  {
    n: "01",
    titulo: "Asher bajar banu",
    heb: "אֲשֶׁר בָּחַר בָּנוּ",
    bullets: [
      <>Haolam Hazé y Olam Habá <em className="heb">הָעוֹלָם הַזֶּה וְהַבָּא</em></>,
      <>La neshamá <em className="heb">נְשָׁמָה</em></>,
      <>Extremos: no somos iguales</>,
    ],
  },
  {
    n: "02",
    titulo: "Valor propio",
    heb: "יָקָר",
    bullets: [<>Autoconocimiento</>, <>Presión social</>, <>Aprobación</>],
  },
  {
    n: "03",
    titulo: "Comunicación",
    heb: "תִּקְשֹׁרֶת",
    bullets: [<>En pareja</>, <>Social</>, <>Familiar</>, <>Conflictos</>],
  },
  {
    n: "04",
    titulo: "Eshet Jayil",
    heb: "אֵשֶׁת חַיִל",
    bullets: [
      <>El tafkid de la mujer <em className="heb">תַּפְקִיד</em></>,
      <>Tzniut <em className="heb">צְנִיעוּת</em></>,
    ],
  },
  {
    n: "05",
    titulo: "Midat HaJasidut",
    heb: "מִדַּת הַחֲסִידוּת",
    bullets: [
      <>Zrizut · Emet · Tzniut <em className="heb">זְרִיזוּת · אֱמֶת · צְנִיעוּת</em></>,
      <>Amor y relación con Hashem <em className="heb">אַהֲבַת ה׳</em></>,
      <>Neshamá y tefilá <em className="heb">נְשָׁמָה וּתְפִלָּה</em></>,
    ],
  },
  {
    n: "06",
    titulo: "Tefilá",
    heb: "תְּפִלָּה",
    bullets: [<>Concentración</>, <>Entendimiento</>, <>Vínculo y gozo</>],
  },
];

export default function Temario() {
  return (
    <section className="section" id="temario">
      <div className="wrap">
        <div className="section-head reveal in">
          <p className="eyebrow eyebrow--gold">
            Temario del ciclo · <span className="heb">תָּכְנִית הַלִּמּוּד</span>
          </p>
          <h2 className="display">Lo que estudiaremos juntas</h2>
          <p className="lead">
            Seis pilares que abordan una construcción personal y espiritual de todas las áreas de la vida y nuestra
            Neshamá <span className="heb">נְשָׁמָה</span>.
          </p>
          <p className="temas-kicker">
            <span className="temas-kicker__line" /> Los 6 pilares del ciclo <span className="temas-kicker__line" />
          </p>
        </div>

        <div className="temas">
          {TEMAS.map((t) => (
            <article className="tema-card reveal in" key={t.n}>
              <span className="tema-card__n">{t.n}</span>
              <h3>{t.titulo}</h3>
              <p className="tema-card__heb">{t.heb}</p>
              <ul>
                {t.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="temas-fijos reveal in">
          <span className="temas-fijos__label">Cada semana, además:</span>
          <span className="temas-fijos__pill">
            Navi <em className="heb">נָבִיא</em>
          </span>
          <span className="temas-fijos__pill">
            Parashat HaShavua <em className="heb">פָּרָשַׁת הַשָּׁבוּעַ</em>
          </span>
          <span className="temas-fijos__pill">
            Jaguim · maagal hashaná <em className="heb">מַעְגַּל הַשָּׁנָה</em>
          </span>
        </div>
      </div>
    </section>
  );
}
