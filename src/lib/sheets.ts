/**
 * Lector del Google Sheet del calendario — puerto a servidor del sheets.js
 * original. Lee las pestañas "Calendario Mañanas" / "Calendario Tardes"
 * publicadas como CSV y las convierte en filas listas para `clases`.
 *
 * Reglas heredadas del prototipo: el año se infiere por el ciclo
 * (ago–dic = 2026, ene–jul = 2027); Mañanas trae dos columnas de
 * tema/ponente (una por horario), Tardes trae una.
 */
import type { PlanGrupo } from "@/lib/types";

const MESES: Record<string, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5, julio: 6,
  agosto: 7, septiembre: 8, setiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
};

const strip = (s: unknown) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let val = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') { val += '"'; i++; }
        else q = false;
      } else val += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(val); val = ""; }
    else if (c === "\n") { row.push(val); rows.push(row); row = []; val = ""; }
    else if (c === "\r") { /* skip */ }
    else val += c;
  }
  if (val.length || row.length) { row.push(val); rows.push(row); }
  return rows;
}

function yearFor(monthIdx: number) {
  return monthIdx >= 7 ? 2026 : 2027; // ago–dic = 2026; ene–jul = 2027
}
const iso = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

interface HeaderMap {
  headerRow: number;
  idx: { mes: number; dia: number; fecha: number; tema: number[]; ponente: number[]; hora: number[] };
}

function mapHeaders(rows: string[][]): HeaderMap | null {
  for (let r = 0; r < Math.min(rows.length, 8); r++) {
    const h = rows[r].map(strip);
    const has = (kw: string) => h.some((x) => x.includes(kw));
    if (has("tema") || (has("ponente") && (has("fecha") || has("dia")))) {
      const idx: HeaderMap["idx"] = { mes: -1, dia: -1, fecha: -1, tema: [], ponente: [], hora: [] };
      h.forEach((x, i) => {
        if (idx.mes < 0 && (x === "seccion" || x === "mes")) idx.mes = i;
        if (idx.dia < 0 && (x === "fecha" || x.startsWith("fecha") || x === "dia del mes")) idx.dia = i;
        if (idx.fecha < 0 && (x === "fecha completa" || x === "date")) idx.fecha = i;
        if (x.includes("tema")) idx.tema.push(i);
        if (x.includes("ponente")) idx.ponente.push(i);
        if (x.includes("horario") || x === "hora") idx.hora.push(i);
      });
      return { headerRow: r, idx };
    }
  }
  return null;
}

export interface ClaseRow {
  fecha: string;
  grupo: PlanGrupo;
  orden: number;
  hora: string;
  tema: string;
  ponente: string;
}

const HORAS_DEFAULT: Record<PlanGrupo, string[]> = {
  manana: ["11:30 – 12:30", "12:40 – 13:40"],
  tarde: ["7:30 – 8:30 pm"],
};

function parseTab(text: string, grupo: PlanGrupo): ClaseRow[] {
  const rows = parseCSV(text);
  const map = mapHeaders(rows);
  if (!map) return [];
  const { headerRow, idx } = map;
  const out: ClaseRow[] = [];

  for (let r = headerRow + 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || !row.length) continue;

    let key: string | null = null;
    if (idx.fecha >= 0 && row[idx.fecha]) {
      const d = new Date(row[idx.fecha]);
      if (!isNaN(d.getTime())) key = iso(d.getFullYear(), d.getMonth(), d.getDate());
    }
    if (!key && idx.mes >= 0 && idx.dia >= 0) {
      const mi = MESES[strip(row[idx.mes])];
      const day = parseInt((row[idx.dia] || "").toString().match(/\d+/)?.[0] || "", 10);
      if (mi != null && day >= 1 && day <= 31) key = iso(yearFor(mi), mi, day);
    }
    if (!key) continue;

    const horas = HORAS_DEFAULT[grupo];
    const nCols = idx.tema.length || idx.ponente.length || horas.length || 1;
    for (let k = 0; k < nCols; k++) {
      const tema = idx.tema[k] != null ? (row[idx.tema[k]] || "").trim() : "";
      const ponente = idx.ponente[k] != null ? (row[idx.ponente[k]] || "").trim() : "";
      const hora = horas[k] || (idx.hora[k] != null ? (row[idx.hora[k]] || "").trim() : horas[0]);
      out.push({ fecha: key, grupo, orden: k + 1, hora, tema, ponente });
    }
  }
  return out;
}

const PESTANAS: { nombres: string[]; grupo: PlanGrupo }[] = [
  { nombres: ["Calendario Mananas", "Calendario Mañanas", "Mañanas", "Mananas"], grupo: "manana" },
  { nombres: ["Calendario Tardes", "Tardes"], grupo: "tarde" },
];

function urlFor(sheetId: string, tabName: string) {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
}

/** Descarga y parsea las pestañas Mañanas/Tardes del Google Sheet del ciclo. */
export async function fetchClasesFromSheet(sheetId: string): Promise<ClaseRow[]> {
  const all: ClaseRow[] = [];
  for (const pest of PESTANAS) {
    for (const nombre of pest.nombres) {
      try {
        const res = await fetch(urlFor(sheetId, nombre), { cache: "no-store" });
        if (!res.ok) continue;
        const text = await res.text();
        if (/<html|DOCTYPE/i.test(text.slice(0, 200))) continue;
        const parsed = parseTab(text, pest.grupo);
        if (parsed.length) {
          all.push(...parsed);
          break;
        }
      } catch {
        // intenta el siguiente nombre de pestaña
      }
    }
  }
  return all;
}
