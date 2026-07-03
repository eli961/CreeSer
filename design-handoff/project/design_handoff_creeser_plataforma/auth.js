/* ============================================================
   Cree Ser — Autenticación (DEMO)
   ------------------------------------------------------------
   Login/registro de DEMOSTRACIÓN usando localStorage, solo para
   mostrar el comportamiento: las grabaciones y el pago requieren
   sesión. En PRODUCCIÓN esto se reemplaza por autenticación real
   (servidor + base de datos + verificación de pago).
   ============================================================ */
(function(){
  'use strict';
  const LS_USERS = 'creeser_users_v1';
  const LS_SESSION = 'creeser_session_v1';

  const $ = s => document.querySelector(s);
  const modal = $('#auth-modal');
  const back = $('#modal-back');
  const navAccount = $('#nav-account');
  const gate = $('#grab-gate');
  if(!modal) return;

  const getUsers = () => { try { return JSON.parse(localStorage.getItem(LS_USERS)) || {}; } catch(e){ return {}; } };
  const setUsers = u => localStorage.setItem(LS_USERS, JSON.stringify(u));
  const getSession = () => { try { return JSON.parse(localStorage.getItem(LS_SESSION)); } catch(e){ return null; } };
  const setSession = s => s ? localStorage.setItem(LS_SESSION, JSON.stringify(s)) : localStorage.removeItem(LS_SESSION);

  function showView(name){
    modal.querySelectorAll('[data-view]').forEach(v => v.hidden = v.dataset.view !== name);
  }
  function openModal(view){
    const s = getSession();
    showView(view || (s ? 'account' : 'login'));
    if(s && $('#acct-name')) $('#acct-name').textContent = s.name || 'alumna';
    modal.classList.add('open'); back.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    modal.classList.remove('open'); back.classList.remove('open');
    document.body.style.overflow = '';
    const le = $('#login-err'); if(le) le.hidden = true;
  }

  // ----- Estado del gate + nav según sesión -----
  function refresh(){
    const s = getSession();
    if(gate) gate.classList.toggle('unlocked', !!s);
    if(navAccount) navAccount.textContent = s ? 'Mi cuenta' : 'Ingresar';
  }

  // ----- Delegación de clics -----
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if(!el) return;
    const action = el.dataset.action;
    if(action === 'login'){ e.preventDefault(); openModal(); }
    else if(action === 'close-modal'){ closeModal(); }
    else if(action === 'logout'){ setSession(null); refresh(); showView('login'); closeModal(); }
    else if(action === 'comprobante'){
      e.preventDefault();
      getSession() ? openModal('comprobante') : openModal('login');
    }
    else if(action === 'mensualidad'){
      e.preventDefault();
      getSession() ? openModal('comprobante') : openModal('login');
    }
  });
  modal.querySelectorAll('[data-view-go]').forEach(b => b.addEventListener('click', () => showView(b.dataset.viewGo)));
  back.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

  // Botones que requieren sesión pero no son acciones especiales
  document.querySelectorAll('[data-requires-auth]').forEach(btn => {
    // ya manejados por data-action arriba; este es respaldo
  });

  // ----- Registro -----
  const suForm = $('#signup-form');
  suForm && suForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#su-name').value.trim();
    const email = $('#su-email').value.trim().toLowerCase();
    const pass = $('#su-pass').value;
    const users = getUsers();
    users[email] = { name, pass };
    setUsers(users);
    setSession({ email, name });
    refresh(); openModal('account');
    suForm.reset();
  });

  // ----- Login -----
  const liForm = $('#login-form');
  liForm && liForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = $('#li-email').value.trim().toLowerCase();
    const pass = $('#li-pass').value;
    const users = getUsers();
    const err = $('#login-err');
    // DEMO: acepta cualquier cuenta creada; o cualquier correo válido con contraseña (para pruebas)
    if(users[email] && users[email].pass === pass){
      setSession({ email, name: users[email].name });
    } else if(!users[email] && pass.length >= 4){
      // permitir entrar en la demo aunque no se haya registrado antes
      const name = email.split('@')[0];
      setSession({ email, name });
    } else {
      if(err) err.hidden = false; return;
    }
    if(err) err.hidden = true;
    refresh(); openModal('account'); liForm.reset();
  });

  // ----- Comprobante -----
  const cpFile = $('#cp-file');
  cpFile && cpFile.addEventListener('change', () => {
    const n = cpFile.files && cpFile.files[0] ? cpFile.files[0].name : 'Toca para elegir imagen o PDF';
    $('#cp-filename').textContent = n;
  });
  const cpForm = $('#comp-form');
  cpForm && cpForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn = cpForm.querySelector('button[type=submit]');
    btn.textContent = '¡Comprobante enviado! Te confirmamos pronto ✓';
    btn.style.background = 'linear-gradient(135deg,#5bbf8a,#2e8a5a)';
    btn.disabled = true;
    setTimeout(closeModal, 1600);
  });

  refresh();
})();
