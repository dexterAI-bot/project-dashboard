// auth.js
// Lightweight auth gate for GitHub Pages.
//
// Goal: ship UI + code structure now without blocking. Tomorrow we can swap
// to Supabase Auth by setting window.PROJECT_HQ_AUTH = { kind: 'supabase', ... }.
//
// SECURITY NOTE: Client-side only auth on GH Pages is not real security.
// Use Supabase (or move to a server) for real access control.

(function () {
  const AUTH_KEY = 'projecthq_auth_ok_v1';

  function getConfig() {
    // Optional config injected via inline script or another file.
    // Example tomorrow:
    // window.PROJECT_HQ_AUTH = {
    //   kind: 'supabase',
    //   supabaseUrl: 'https://....supabase.co',
    //   supabaseAnonKey: 'eyJ...',
    //   allowedEmails: ['you@example.com']
    // }
    return window.PROJECT_HQ_AUTH || { kind: 'mock' };
  }

  function isAuthed() {
    const cfg = getConfig();
    if (cfg.kind === 'mock') return true; // non-blocking for now
    return localStorage.getItem(AUTH_KEY) === '1';
  }

  function setAuthed(val) {
    localStorage.setItem(AUTH_KEY, val ? '1' : '0');
  }

  function ensureOverlay() {
    let el = document.getElementById('auth-overlay');
    if (el) return el;

    el = document.createElement('div');
    el.id = 'auth-overlay';
    el.innerHTML = `
      <div class="auth-card">
        <div class="auth-title">Project HQ</div>
        <div class="auth-subtitle">Login required</div>
        <div class="auth-body">
          <p class="auth-note">
            Temporary gate. Tomorrow we’ll connect Supabase Auth for real login.
          </p>
          <label class="auth-label">Passcode (temporary)</label>
          <input class="auth-input" id="auth-passcode" type="password" placeholder="Enter passcode" />
          <div class="auth-row">
            <button class="auth-btn" id="auth-submit">Continue</button>
            <button class="auth-btn secondary" id="auth-logout">Logout</button>
          </div>
          <div class="auth-error" id="auth-error" style="display:none"></div>
        </div>
      </div>
    `;

    document.body.appendChild(el);

    el.querySelector('#auth-submit').addEventListener('click', () => {
      const cfg = getConfig();
      const pass = el.querySelector('#auth-passcode').value;

      // Mock passcode flow (not secure). If cfg.passcode is set, enforce it.
      if (cfg.kind === 'passcode') {
        if (!cfg.passcode) {
          showError('Passcode is not configured.');
          return;
        }
        if (pass !== cfg.passcode) {
          showError('Wrong passcode.');
          return;
        }
        setAuthed(true);
        el.style.display = 'none';
        window.dispatchEvent(new Event('projecthq:authed'));
        return;
      }

      // If no real auth configured, don’t block.
      setAuthed(true);
      el.style.display = 'none';
      window.dispatchEvent(new Event('projecthq:authed'));
    });

    el.querySelector('#auth-logout').addEventListener('click', () => {
      setAuthed(false);
      el.style.display = '';
      window.location.reload();
    });

    function showError(msg) {
      const box = el.querySelector('#auth-error');
      box.textContent = msg;
      box.style.display = 'block';
    }

    return el;
  }

  function gate() {
    const cfg = getConfig();

    // Non-blocking by default (mock). This matches your request.
    if (cfg.kind === 'mock') return;

    const overlay = ensureOverlay();
    overlay.style.display = isAuthed() ? 'none' : '';
  }

  // Gate immediately on load.
  document.addEventListener('DOMContentLoaded', gate);
  // If config is set after load, allow re-gating.
  window.projectHQGate = gate;
})();
