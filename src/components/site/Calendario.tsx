"use client";

import { useMemo, useRef, useState } from "react";
import { IconChevronLeft, IconChevronRight } from "@/components/icons";
import type { Clase, FechaImportante, PlanGrupo } from "@/lib/types";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const MS_3 = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const DOW = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const SESIONES: Record<PlanGrupo, { nombre: string; subtitulo: string; dias: string }> = {
  manana: { nombre: "Mañanas", subtitulo: "Lun y Mié · 11:30 y 12:40", dias: "Lun y Mié" },
  tarde: { nombre: "Tardes", subtitulo: "Solo Mié · 7:30 pm", dias: "Solo Mié" },
};

const CYCLE_START = new Date(2026, 7, 1);
const CYCLE_END = new Date(2027, 6, 31);

const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

interface Props {
  clases: Clase[];
  fechas: FechaImportante[];
}

export default function Calendario({ clases, fechas }: Props) {
  const [track, setTrack] = useState<PlanGrupo>("manana");
  const [viewDate, setViewDate] = useState(() => {
    const n = new Date();
    if (n >= CYCLE_START && n <= CYCLE_END) return new Date(n.getFullYear(), n.getMonth(), 1);
    return new Date(CYCLE_START.getFullYear(), CYCLE_START.getMonth(), 1);
  });

  const gridRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  const fechasMap = useMemo(() => {
    const m = new Map<string, string>();
    fechas.forEach((f) => m.set(f.fecha, f.etiqueta));
    return m;
  }, [fechas]);

  const clasesByFechaTrack = useMemo(() => {
    const m = new Map<string, Clase[]>();
    clases
      .filter((c) => c.grupo === track)
      .forEach((c) => {
        const arr = m.get(c.fecha) || [];
        arr.push(c);
        m.set(c.fecha, arr);
      });
    m.forEach((arr) => arr.sort((a, b) => a.orden - b.orden));
    return m;
  }, [clases, track]);

  const y = viewDate.getFullYear();
  const m = viewDate.getMonth();
  const first = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const prevDays = new Date(y, m, 0).getDate();
  const today = new Date();
  const todayKey = iso(today.getFullYear(), today.getMonth(), today.getDate());

  const cells: { label: number; out: boolean; key?: string }[] = [];
  for (let i = first - 1; i >= 0; i--) cells.push({ label: prevDays - i, out: true });
  for (let day = 1; day <= daysInMonth; day++) cells.push({ label: day, out: false, key: iso(y, m, day) });
  const trail = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= trail; i++) cells.push({ label: i, out: true });

  function tooltipFor(key: string) {
    const parts: string[] = [];
    const cls = clasesByFechaTrack.get(key);
    if (cls?.length) {
      parts.push(SESIONES[track].nombre + " · " + SESIONES[track].dias);
      cls.forEach((c) =>
        parts.push(
          "· " +
            c.hora.split("–")[0].trim() +
            " — " +
            (c.tema || "Tema por definir") +
            (c.ponente ? " · " + c.ponente : "")
        )
      );
    }
    if (fechasMap.has(key)) parts.push("✡ " + fechasMap.get(key));
    return parts.join("\n");
  }

  function onGridMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const wrap = wrapRef.current;
    const tip = tipRef.current;
    if (!wrap || !tip) return;
    const target = (e.target as HTMLElement).closest<HTMLElement>(".cal__cell.has");
    if (!target || !target.dataset.tip) {
      tip.style.display = "none";
      return;
    }
    tip.textContent = target.dataset.tip;
    tip.style.display = "block";
    const r = wrap.getBoundingClientRect();
    let x = e.clientX - r.left + 14;
    const yPos = e.clientY - r.top + 14;
    if (x + 250 > r.width) x = e.clientX - r.left - 250;
    tip.style.left = Math.max(6, x) + "px";
    tip.style.top = yPos + "px";
  }
  function onGridMouseLeave() {
    if (tipRef.current) tipRef.current.style.display = "none";
  }

  const upcoming = useMemo(() => {
    const keys = Array.from(clasesByFechaTrack.keys()).sort();
    let sel = keys.filter((k) => k >= todayKey).slice(0, 4);
    if (!sel.length) sel = keys.slice(0, 4);
    return sel.map((k) => {
      const [, mm, dd] = k.split("-").map(Number);
      return {
        d: dd,
        mo: MS_3[mm - 1],
        jag: fechasMap.get(k) || "",
        cls: clasesByFechaTrack.get(k) || [],
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clasesByFechaTrack, fechasMap]);

  return (
    <section className="section about" id="calendario">
      <div className="wrap">
        <div className="section-head reveal in">
          <p className="eyebrow eyebrow--gold">
            Calendario anual · <span className="heb">לוּחַ שִׁעוּרִים</span>
          </p>
          <h2 className="display">Todo el ciclo, en un solo lugar</h2>
          <p className="lead">Clases los lunes y miércoles. Cambia entre Mañanas y Tardes para ver cada programa.</p>
          <div className="cal__tracks">
            {(["manana", "tarde"] as PlanGrupo[]).map((t) => (
              <button
                key={t}
                type="button"
                className={`cal__track${track === t ? " active" : ""}`}
                onClick={() => setTrack(t)}
              >
                <b>{SESIONES[t].nombre}</b>
                <span>{SESIONES[t].subtitulo}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="calwrap">
          <div className="calendar reveal in" ref={wrapRef}>
            <div className="cal__head">
              <div className="cal__title">
                {MONTHS[m]} {y}
              </div>
              <div className="cal__nav">
                <button
                  aria-label="Mes anterior"
                  onClick={() => setViewDate(new Date(y, m - 1, 1))}
                >
                  <IconChevronLeft />
                </button>
                <button
                  aria-label="Mes siguiente"
                  onClick={() => setViewDate(new Date(y, m + 1, 1))}
                >
                  <IconChevronRight />
                </button>
              </div>
            </div>
            <div className="cal__grid" ref={gridRef} onMouseMove={onGridMouseMove} onMouseLeave={onGridMouseLeave}>
              {DOW.map((d) => (
                <div className="cal__dow" key={d}>
                  {d}
                </div>
              ))}
              {cells.map((c, i) => {
                if (c.out || !c.key) return <div className="cal__cell out" key={i}>{c.label}</div>;
                const hasClass = clasesByFechaTrack.has(c.key);
                const hasJag = fechasMap.has(c.key);
                const has = hasClass || hasJag;
                const isToday = c.key === todayKey;
                return (
                  <div
                    key={i}
                    className={`cal__cell${has ? " has" : ""}${isToday ? " today" : ""}`}
                    data-tip={has ? tooltipFor(c.key) : undefined}
                  >
                    <span>{c.label}</span>
                    {has && (
                      <div className="evts">
                        {hasClass && <span className="ev ev-live" />}
                        {hasJag && <span className="ev ev-spec" />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="cal-tip" ref={tipRef} style={{ display: "none" }} />
            <div className="callegend">
              <span>
                <span className="ev ev-live" style={{ width: 9, height: 9, borderRadius: "50%" }} /> Clase de la
                sesión
              </span>
              <span>
                <span className="ev ev-spec" style={{ width: 9, height: 9, borderRadius: "50%" }} /> Jag / fecha
                importante
              </span>
            </div>
          </div>

          <div className="reveal in">
            <p className="eyebrow" style={{ marginBottom: 18 }}>
              Próximas clases · {SESIONES[track].nombre}
            </p>
            <div className="uplist">
              {upcoming.length === 0 && <p style={{ color: "var(--ink-soft)" }}>Próximamente.</p>}
              {upcoming.map((it, i) => (
                <div className="up" key={i}>
                  <div className="up__date">
                    <b>{it.d}</b>
                    <span>{it.mo}</span>
                  </div>
                  <div className="up__body">
                    {it.cls.map((c, ci) =>
                      ci === 0 ? (
                        <div key={ci}>
                          <h4>{c.tema || "Tema por definir"}</h4>
                          <p>
                            <span className="tm">{c.hora}</span>
                            {c.ponente ? " · " + c.ponente : ""}
                            {it.jag ? " · " + it.jag : ""}
                          </p>
                        </div>
                      ) : (
                        <p className="up__more" key={ci}>
                          <span className="tm">{c.hora}</span> · {c.tema || "Tema por definir"}
                          {c.ponente ? " · " + c.ponente : ""}
                        </p>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
