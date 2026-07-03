/* ============================================================
   Cree Ser — interacciones
   ============================================================ */
(function(){
  'use strict';

  /* ---------- Nav scroll state ---------- */
  const nav = document.querySelector('.nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 12);
  onScroll(); window.addEventListener('scroll', onScroll, { passive:true });

  /* ---------- Mobile menu ---------- */
  const burger = document.querySelector('.nav__burger');
  const menu = document.querySelector('.mobile-menu');
  const back = document.querySelector('.mm-back');
  const toggleMenu = (open) => {
    menu.classList.toggle('open', open);
    back.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger && burger.addEventListener('click', () => toggleMenu(!menu.classList.contains('open')));
  back && back.addEventListener('click', () => toggleMenu(false));
  menu && menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));

  /* ---------- Countdown a la próxima sesión ---------- */
  // próxima clase: Lunes 11:30 o Miércoles 12:40 (lo que ocurra antes)
  function nextSession(){
    const now = new Date();
    const slots = [ {day:1,h:11,m:30}, {day:1,h:12,m:40}, {day:3,h:11,m:30}, {day:3,h:12,m:40}, {day:3,h:19,m:30} ];
    let best = null;
    slots.forEach(s => {
      const d = new Date(now);
      let add = (s.day - d.getDay() + 7) % 7;
      d.setDate(d.getDate() + add);
      d.setHours(s.h, s.m, 0, 0);
      if (d <= now) d.setDate(d.getDate() + 7);
      if (!best || d < best) best = d;
    });
    return best;
  }
  const target = nextSession();
  const cdEls = {
    d: document.getElementById('cd-d'),
    h: document.getElementById('cd-h'),
    m: document.getElementById('cd-m'),
    s: document.getElementById('cd-s')
  };
  function tick(){
    if(!cdEls.d) return;
    let diff = Math.max(0, target - new Date());
    const dd = Math.floor(diff/86400000); diff -= dd*86400000;
    const hh = Math.floor(diff/3600000); diff -= hh*3600000;
    const mm = Math.floor(diff/60000); diff -= mm*60000;
    const ss = Math.floor(diff/1000);
    const p = n => String(n).padStart(2,'0');
    cdEls.d.textContent = p(dd);
    cdEls.h.textContent = p(hh);
    cdEls.m.textContent = p(mm);
    cdEls.s.textContent = p(ss);
  }
  tick(); setInterval(tick, 1000);

  /* ---------- Calendario ---------- */
  const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const DOW = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

  // Calendario dirigido por config.js (sesiones mañana/tarde + jaguim)
  const CFG = window.CREESER_CONFIG || {};
  const SES = CFG.sesiones || [
    { id:"manana", nombre:"Mañanas", dias:[1,3], horas:["11:30 – 12:30","12:40 – 13:40"], horaCorta:"11:30 y 12:40" },
    { id:"tarde",  nombre:"Tardes",  dias:[3],   horas:["19:30 – 20:30"], horaCorta:"7:30 pm" }
  ];
  const FECHAS = CFG.fechasImportantes || {};
  const CLASES = CFG.clases || {};
  const cycleStart = CFG.ciclo ? new Date(CFG.ciclo.inicio + "T00:00:00") : null;
  const cycleEnd   = CFG.ciclo ? new Date(CFG.ciclo.fin + "T00:00:00") : null;

  let activeTrack = SES[0].id;
  const iso = (y,m,d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const escAttr = s => (s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const sesById = id => SES.find(s => s.id === id) || SES[0];
  function classesFor(key, ses){
    const rec = CLASES[key];
    let arr = rec && rec[ses.id];
    if(arr && !Array.isArray(arr)) arr = [arr]; // tolera shape antiguo {tema,ponente}
    if(arr && arr.length){
      return arr.map((c,i) => ({ hora: c.hora || ses.horas[i] || ses.horas[0], tema: c.tema||'', ponente: c.ponente||'' }));
    }
    return ses.horas.map(h => ({ hora:h, tema:'', ponente:'' }));
  }
  // ¿hay clase de este programa en esta fecha? (según datos del Sheet)
  function hasClassData(){ return Object.keys(CLASES).length > 3; }
  function dayHasProgram(key, ses){
    const rec = CLASES[key];
    return !!(rec && rec[ses.id] && (Array.isArray(rec[ses.id]) ? rec[ses.id].length : true));
  }
  function inCycle(dt){
    if(!cycleStart || !cycleEnd) return true;
    return dt >= cycleStart && dt <= cycleEnd;
  }

  // Vista inicial: mes actual si está dentro del ciclo; si no, inicio del ciclo
  let viewDate = (function(){
    const n = new Date();
    if(cycleStart && cycleEnd && n >= cycleStart && n <= cycleEnd) return new Date(n.getFullYear(), n.getMonth(), 1);
    return cycleStart ? new Date(cycleStart.getFullYear(), cycleStart.getMonth(), 1) : new Date(2025, 7, 1);
  })();
  const calTitle = document.getElementById('cal-title');
  const calGrid = document.getElementById('cal-grid');

  function renderCal(){
    if(!calGrid) return;
    const y = viewDate.getFullYear(), m = viewDate.getMonth();
    const ses = sesById(activeTrack);
    calTitle.textContent = `${MONTHS[m]} ${y}`;
    const first = new Date(y, m, 1).getDay();
    const days = new Date(y, m+1, 0).getDate();
    const prevDays = new Date(y, m, 0).getDate();
    const today = new Date();
    let html = DOW.map(d => `<div class="cal__dow">${d}</div>`).join('');
    for(let i=first-1; i>=0; i--) html += `<div class="cal__cell out">${prevDays-i}</div>`;
    for(let day=1; day<=days; day++){
      const dt = new Date(y, m, day);
      const key = iso(y,m,day);
      const dots = [];
      // Marca clase si el Sheet la tiene esa fecha; si no hay datos, usa la regla de día de semana
      const isClassDay = hasClassData()
        ? dayHasProgram(key, ses)
        : (ses.dias.includes(dt.getDay()) && inCycle(dt));
      if(isClassDay) dots.push('live');
      if(FECHAS[key]) dots.push('spec');
      const isToday = today.getFullYear()===y && today.getMonth()===m && today.getDate()===day;
      // Tooltip: programa + clases + tema; y festividad real si la hay
      const tipParts = [];
      if(isClassDay){
        const cls = classesFor(key, ses);
        tipParts.push(ses.nombre + (ses.id==='manana' ? ' · Lun y Mié' : ' · Solo Mié'));
        cls.forEach(c => tipParts.push('· ' + c.hora.split('–')[0].trim() + ' — ' + (c.tema || 'Tema por definir') + (c.ponente ? ' · '+c.ponente : '')));
      }
      if(FECHAS[key]) tipParts.push('✡ ' + FECHAS[key]);
      const tip = tipParts.join('\n');
      const tipAttr = dots.length ? ` data-tip="${escAttr(tip)}"` : '';
      const dotsHtml = dots.length ? `<div class="evts">${dots.map(t=>`<span class="ev ev-${t}"></span>`).join('')}</div>` : '';
      html += `<div class="cal__cell ${dots.length?'has':''} ${isToday?'today':''}"${tipAttr}><span>${day}</span>${dotsHtml}</div>`;
    }
    const total = first + days;
    const trail = (7 - (total % 7)) % 7;
    for(let i=1; i<=trail; i++) html += `<div class="cal__cell out">${i}</div>`;
    calGrid.innerHTML = html;
    renderUpcoming();
  }

  // Próximas clases de la sesión activa
  const MS_3 = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  function renderUpcoming(){
    const list = document.getElementById('uplist');
    const upTitle = document.getElementById('up-title');
    const ses = sesById(activeTrack);
    if(upTitle) upTitle.textContent = `Próximas clases · ${ses.nombre}`;
    if(!list) return;
    const today = new Date(); today.setHours(0,0,0,0);
    const todayKey = iso(today.getFullYear(), today.getMonth(), today.getDate());
    let items = [];

    if(hasClassData()){
      // Toma las fechas reales del Sheet para este programa
      const keys = Object.keys(CLASES)
        .filter(k => dayHasProgram(k, ses))
        .sort();
      let sel = keys.filter(k => k >= todayKey).slice(0, 4);
      if(!sel.length) sel = keys.slice(0, 4); // ciclo ya pasó: muestra las primeras
      items = sel.map(k => {
        const [yy,mm,dd] = k.split('-').map(Number);
        return { d: dd, mo: MS_3[mm-1], jag: FECHAS[k] || '', classes: classesFor(k, ses) };
      });
    } else {
      const base = (cycleStart && today < cycleStart) ? new Date(cycleStart) : today;
      const cursor = new Date(base);
      for(let i=0; i<400 && items.length<4; i++){
        if(ses.dias.includes(cursor.getDay()) && inCycle(cursor)){
          const key = iso(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
          items.push({ d: cursor.getDate(), mo: MS_3[cursor.getMonth()], jag: FECHAS[key] || '', classes: classesFor(key, ses) });
        }
        cursor.setDate(cursor.getDate()+1);
      }
    }
    list.innerHTML = items.map(it => `
      <div class="up">
        <div class="up__date"><b>${it.d}</b><span>${it.mo}</span></div>
        <div class="up__body">
          ${it.classes.map((c,i) => i===0
            ? `<h4>${c.tema || 'Tema por definir'}</h4><p><span class="tm">${c.hora}</span>${c.ponente ? ' · '+c.ponente : ''}${it.jag ? ' · '+it.jag : ''}</p>`
            : `<p class="up__more"><span class="tm">${c.hora}</span> · ${c.tema || 'Tema por definir'}${c.ponente ? ' · '+c.ponente : ''}</p>`
          ).join('')}
        </div>
      </div>`).join('') || '<p style="color:var(--ink-soft)">Próximamente.</p>';
  }

  // Toggle de sesión
  document.querySelectorAll('.cal__track').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.cal__track').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeTrack = btn.dataset.track;
    renderCal();
  }));
  document.getElementById('cal-prev')?.addEventListener('click', ()=>{ viewDate.setMonth(viewDate.getMonth()-1); renderCal(); });
  document.getElementById('cal-next')?.addEventListener('click', ()=>{ viewDate.setMonth(viewDate.getMonth()+1); renderCal(); });
  renderCal();

  // Tooltip flotante del calendario (mouseover)
  (function(){
    const wrap = calGrid && calGrid.closest('.calendar');
    if(!wrap) return;
    const tip = document.createElement('div');
    tip.className = 'cal-tip'; tip.style.display = 'none';
    wrap.appendChild(tip);
    calGrid.addEventListener('mousemove', e => {
      const cell = e.target.closest('.cal__cell.has');
      if(!cell || !cell.dataset.tip){ tip.style.display = 'none'; return; }
      tip.textContent = cell.dataset.tip;
      tip.style.display = 'block';
      const r = wrap.getBoundingClientRect();
      let x = e.clientX - r.left + 14, y = e.clientY - r.top + 14;
      if(x + 250 > r.width) x = e.clientX - r.left - 250;
      tip.style.left = Math.max(6, x) + 'px';
      tip.style.top = y + 'px';
    });
    calGrid.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
  })();

  // Hook para datos en vivo del Sheet (sheets.js lo usa)
  window.CreeSerData = {
    merge(obj){
      if(!obj || typeof obj !== 'object') return;
      Object.keys(obj).forEach(k => { CLASES[k] = obj[k]; });
      renderCal();
    }
  };
  const chips = document.querySelectorAll('.chip');
  const recs = document.querySelectorAll('.rec');
  chips.forEach(chip => chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const f = chip.dataset.filter;
    recs.forEach(r => {
      const show = f === 'all' || r.dataset.tema === f;
      r.style.display = show ? '' : 'none';
    });
  }));

  /* ---------- Form (demo) ---------- */
  const form = document.getElementById('enroll-form');
  form && form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn');
    btn.textContent = '¡Lugar reservado! Te escribiremos pronto ✓';
    btn.style.background = 'linear-gradient(135deg,#5bbf8a,#2e8a5a)';
    btn.disabled = true;
  });

  /* ---------- Reveal on scroll (robust) ---------- */
  const reveals = document.querySelectorAll('.reveal');
  function revealInView(){
    const vh = window.innerHeight || document.documentElement.clientHeight;
    reveals.forEach(el => {
      if(el.classList.contains('in')) return;
      const r = el.getBoundingClientRect();
      if(r.top < vh * 0.92 && r.bottom > 0) el.classList.add('in');
    });
  }
  function forceShow(){
    reveals.forEach(el => { el.style.transition='none'; el.style.opacity='1'; el.style.transform='none'; });
  }
  revealInView();
  window.addEventListener('scroll', revealInView, { passive:true });
  window.addEventListener('resize', revealInView);
  window.addEventListener('load', revealInView);
  // If CSS transitions don't advance (capture/preview/reduced envs), force content visible.
  setTimeout(() => {
    const s = document.querySelector('.reveal.in');
    if(!s || parseFloat(getComputedStyle(s).opacity) < 0.05) forceShow();
  }, 320);
  // Absolute failsafe — nothing should ever stay hidden.
  setTimeout(forceShow, 2800);

})();
