import Image from "next/image";
import { IconInstagram, IconWhatsApp, IconYouTube } from "@/components/icons";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__grid">
          <div className="footer__brand">
            <Image src="/assets/creeser-logo.png" alt="Cree Ser" width={140} height={42} />
            <p>Torá y valores desde el corazón. Un nuevo ciclo de crecimiento espiritual para jóvenes.</p>
            <p className="footer__heb">עִבְדוּ אֶת ה׳ בְּשִׂמְחָה</p>
          </div>
          <div>
            <h5>Programa</h5>
            <ul>
              <li><a href="#calendario">Calendario</a></li>
              <li><a href="#grabaciones">Grabaciones</a></li>
              <li><a href="#programas">Programas</a></li>
            </ul>
          </div>
          <div>
            <h5>Comunidad</h5>
            <ul>
              <li><a href="#inscripciones">Inscripciones</a></li>
              <li><a href="#avisos">Avisos</a></li>
              <li><a href="#acerca">Acerca de</a></li>
            </ul>
          </div>
          <div>
            <h5>Contacto</h5>
            <ul>
              <li><a href="https://wa.me/525634444434">Bella Sitt · 56 3444 4434</a></li>
              <li><a href="https://wa.me/525555098288">Jenny Sitt · 55 5509 8288</a></li>
            </ul>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© 2026 Cree Ser · בס״ד · Todos los derechos reservados.</span>
          <div className="footer__social">
            <a href="#" aria-label="Instagram">
              <IconInstagram />
            </a>
            <a href="https://wa.me/525634444434" aria-label="WhatsApp">
              <IconWhatsApp />
            </a>
            <a href="#" aria-label="YouTube">
              <IconYouTube />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
