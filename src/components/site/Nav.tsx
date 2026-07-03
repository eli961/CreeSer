"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSite } from "@/components/providers/SiteProvider";
import { IconMenu } from "@/components/icons";

const LINKS = [
  { href: "#temario", label: "Temario" },
  { href: "#calendario", label: "Calendario" },
  { href: "#avisos", label: "Avisos" },
  { href: "#inscripciones", label: "Inscripciones" },
  { href: "#pagos", label: "Pagos" },
  { href: "#acerca", label: "Acerca de" },
  { href: "#grabaciones", label: "Grabaciones" },
];

const MOBILE_LINKS = [
  { href: "#programas", label: "Programas" },
  { href: "#temario", label: "Temario" },
  { href: "#calendario", label: "Calendario" },
  { href: "#grabaciones", label: "Grabaciones" },
  { href: "#avisos", label: "Avisos" },
  { href: "#inscripciones", label: "Inscripciones" },
  { href: "#pagos", label: "Pagos" },
  { href: "#acerca", label: "Acerca de" },
];

export default function Nav() {
  const { user, openModal } = useSite();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  return (
    <>
      <header className={`nav${scrolled ? " scrolled" : ""}`}>
        <div className="nav__in">
          <a href="#inicio" className="nav__logo" aria-label="Cree Ser inicio">
            <Image src="/assets/creeser-logo.png" alt="Cree Ser" width={132} height={68} priority />
          </a>
          <nav className="nav__links">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="nav__cta">
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => openModal()}>
              {user ? "Mi cuenta" : "Ingresar"}
            </button>
            <a href="#inscripciones" className="btn btn--primary btn--sm">
              Inscríbete
            </a>
            <button className="nav__burger" aria-label="Menú" onClick={() => setMenuOpen(true)}>
              <IconMenu />
            </button>
          </div>
        </div>
      </header>

      <div className={`mm-back${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(false)} />
      <aside className={`mobile-menu${menuOpen ? " open" : ""}`}>
        {MOBILE_LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>
            {l.label}
          </a>
        ))}
        <button
          type="button"
          className="btn btn--ghost"
          style={{ textAlign: "left" }}
          onClick={() => {
            setMenuOpen(false);
            openModal();
          }}
        >
          {user ? "Mi cuenta" : "Ingresar"}
        </button>
        <a href="#inscripciones" className="btn btn--primary" onClick={() => setMenuOpen(false)}>
          Inscríbete
        </a>
      </aside>
    </>
  );
}
