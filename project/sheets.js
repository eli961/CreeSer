/* ============================================================
   Cree Ser — Lectura del Google Sheet EN VIVO
   ------------------------------------------------------------
   En producción, el sitio lee el Google Sheet como CSV y
   actualiza el calendario solo. Si editas el Sheet, la página
   refleja los cambios (al recargar).

   Requisitos:
   • El Sheet debe estar compartido: "Cualquiera con el enlace: Lector".
   • Las pestañas se llaman "Calendario Mananas" y "Calendario Tardes"
     (ajústalas en config.js → sheet.pestanas si cambian).

   Cómo arma la fecha: usa el mes (columna Sección/Mes) + el número
   de día (columna Fecha) e infiere el año por el ciclo
   (ago–dic = 2025, ene–jul = 2026).
   ============================================================ */
(function(){
  'use strict';
  const CFG = window.CREESER_CONFIG || {};
  const SHEET = CFG.sheet;
  if(!SHEET || !SHEET.id || !window.CreeSerData) return;

  const MESES = {
    enero:0, febrero:1, marzo:2, abril:3, mayo:4, junio:5, julio:6,
    agosto:7, septiembre:8, setiembre:8, octubre:9, noviembre:10, diciembre:11
  };
  const strip = s => (s||'').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();

  // --- CSV parser (maneja comillas) ---
  function parseCSV(text){
    const rows = []; let row = [], val = '', q = false;
    for(let i=0; i<text.length; i++){
      const c = text[i];
      if(q){
        if(c === '"'){ if(text[i+1] === '"'){ val += '"'; i++; } else q = false; }
        else val += c;
      } else {
        if(c === '"') q = true;
        else if(c === ','){ row.push(val); val = ''; }
        else if(c === '\n'){ row.push(val); rows.push(row); row = []; val = ''; }
        else if(c === '\r'){ /* skip */ }
        else val += c;
      }
    }
    if(val.length || row.length){ row.push(val); rows.push(row); }
    return rows;
  }

  function yearFor(monthIdx){
    return monthIdx >= 7 ? 2026 : 2027; // ago–dic = 2026; ene–jul = 2027
  }
  const iso = (y,m,d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

  // Encuentra la fila de encabezados y mapea columnas por nombre
  function mapHeaders(rows){
    for(let r=0; r<Math.min(rows.length, 8); r++){
      const h = rows[r].map(strip);
      const has = kw => h.some(x => x.includes(kw));
      if(has('tema') || (has('ponente') && (has('fecha') || has('dia')))){
        const idx = { mes:-1, dia:-1, fecha:-1, tema:[], ponente:[], hora:[] };
        h.forEach((x,i) => {
          if(idx.mes<0 && (x==='seccion' || x==='mes')) idx.mes = i;
          if(idx.dia<0 && (x==='fecha' || x.startsWith('fecha') || x==='dia del mes')) idx.dia = i;
          if(idx.fecha<0 && (x==='fecha completa' || x==='date')) idx.fecha = i;
          if(x.includes('tema')) idx.tema.push(i);
          if(x.includes('ponente')) idx.ponente.push(i);
          if(x.includes('horario') || x==='hora') idx.hora.push(i);
        });
        return { headerRow:r, idx };
      }
    }
    return null;
  }

  function parseTab(text, programa){
    const rows = parseCSV(text);
    const map = mapHeaders(rows);
    if(!map) return {};
    const { headerRow, idx } = map;
    const out = {};
    for(let r=headerRow+1; r<rows.length; r++){
      const row = rows[r];
      if(!row || !row.length) continue;

      // fecha
      let key = null;
      if(idx.fecha >= 0 && row[idx.fecha]){
        const d = new Date(row[idx.fecha]);
        if(!isNaN(d)) key = iso(d.getFullYear(), d.getMonth(), d.getDate());
      }
      if(!key && idx.mes >= 0 && idx.dia >= 0){
        const mi = MESES[strip(row[idx.mes])];
        const day = parseInt((row[idx.dia]||'').toString().match(/\d+/)?.[0], 10);
        if(mi != null && day >= 1 && day <= 31) key = iso(yearFor(mi), mi, day);
      }
      if(!key) continue;

      // clases: una entrada por cada columna de Tema (Mañanas=2, Tardes=1); registra la fecha aunque el tema esté vacío
      const ses = (CFG.sesiones || []).find(s => s.id === programa) || {};
      const horas = ses.horas || [];
      const nCols = idx.tema.length || idx.ponente.length || horas.length || 1;
      const clases = [];
      for(let k=0; k<nCols; k++){
        const tema = idx.tema[k] != null ? (row[idx.tema[k]]||'').trim() : '';
        const ponente = idx.ponente[k] != null ? (row[idx.ponente[k]]||'').trim() : '';
        const hora = horas[k] || (idx.hora[k] != null ? (row[idx.hora[k]]||'').trim() : '');
        clases.push({ hora, tema, ponente });
      }
      if(clases.length){
        out[key] = out[key] || {};
        out[key][programa] = clases;
      }
    }
    return out;
  }

  function urlFor(name){
    return `https://docs.google.com/spreadsheets/d/${SHEET.id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`;
  }

  async function fetchTab(pest){
    for(const name of pest.nombres){
      try{
        const res = await fetch(urlFor(name), { cache:'no-store' });
        if(!res.ok) continue;
        const text = await res.text();
        if(/<html|DOCTYPE/i.test(text.slice(0,200))) continue; // página de error, no CSV
        const data = parseTab(text, pest.programa);
        if(Object.keys(data).length) return data;
      }catch(e){ /* intenta el siguiente nombre */ }
    }
    return {};
  }

  // 1) Pinta de inmediato lo cacheado (rápido y offline-resistente)
  try{
    const cached = localStorage.getItem('creeser_clases_v1');
    if(cached) window.CreeSerData.merge(JSON.parse(cached));
  }catch(e){}

  // 2) Trae lo último del Sheet y actualiza
  (async function(){
    const merged = {};
    for(const pest of (SHEET.pestanas || [])){
      const data = await fetchTab(pest);
      Object.keys(data).forEach(k => { merged[k] = Object.assign(merged[k]||{}, data[k]); });
    }
    if(Object.keys(merged).length){
      window.CreeSerData.merge(merged);
      try{ localStorage.setItem('creeser_clases_v1', JSON.stringify(merged)); }catch(e){}
      console.log('[Cree Ser] Calendario actualizado desde el Sheet:', Object.keys(merged).length, 'fechas.');
    } else {
      console.log('[Cree Ser] No se pudo leer el Sheet en vivo (revisa permisos/nombres de pestaña). Usando datos de config.js.');
    }
  })();
})();
