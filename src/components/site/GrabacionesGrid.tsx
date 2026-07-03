"use client";

import { useState } from "react";
import { IconPlay } from "@/components/icons";
import type { Grabacion } from "@/lib/types";

const FILTROS = [
  { key: "all", label: "Todas" },
  { key: "asher", label: "Asher bajar banu" },
  { key: "valor", label: "Valor propio" },
  { key: "comunicacion", label: "Comunicación" },
  { key: "eshet", label: "Eshet Jayil" },
  { key: "jasidut", label: "Jasidut" },
  { key: "tefila", label: "Tefilá" },
];

const THUMBS: Record<string, string> = {
  asher: "linear-gradient(150deg,#2A9CA8,#1B6E78)",
  valor: "linear-gradient(150deg,#5E8AD0,#37589e)",
  comunicacion: "linear-gradient(150deg,#C5933E,#A9772A)",
  eshet: "linear-gradient(150deg,#DD7E97,#b85675)",
  jasidut: "linear-gradient(150deg,#3CB6BE,#2A9CA8)",
  tefila: "linear-gradient(150deg,#1B6E78,#0E3A40)",
};

export default function GrabacionesGrid({ grabaciones }: { grabaciones: Grabacion[] }) {
  const [filter, setFilter] = useState("all");
  const visible = filter === "all" ? grabaciones : grabaciones.filter((g) => g.tema_filtro === filter);

  return (
    <>
      <div className="filters reveal in">
        {FILTROS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`chip${filter === f.key ? " active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="recs">
        {visible.map((rec) => (
          <article
            className="rec reveal in"
            key={rec.id}
            onClick={() => rec.url_video && window.open(rec.url_video, "_blank")}
            style={{ cursor: rec.url_video ? "pointer" : "default" }}
          >
            <div className="rec__thumb" style={{ background: THUMBS[rec.tema_filtro] || THUMBS.asher }}>
              <span className="pill pill--soft rec__tema" style={{ background: "rgba(255,255,255,.85)" }}>
                {FILTROS.find((f) => f.key === rec.tema_filtro)?.label || rec.tema_filtro}
              </span>
              <div className="rec__play">
                <IconPlay />
              </div>
              {rec.duracion && <span className="rec__dur">{rec.duracion}</span>}
            </div>
            <div className="rec__body">
              <h4>{rec.titulo}</h4>
              <div className="meta">
                {rec.tema_hebreo && <span className="heb" style={{ color: "var(--gold-deep)" }}>{rec.tema_hebreo}</span>}
                {rec.pilar && <> · Pilar {String(rec.pilar).padStart(2, "0")}</>}
              </div>
            </div>
          </article>
        ))}
        {visible.length === 0 && <p style={{ color: "var(--ink-soft)" }}>Aún no hay grabaciones en este tema.</p>}
      </div>
    </>
  );
}
