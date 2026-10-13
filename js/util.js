/* Shared helpers + hand-drawn SVG art */
(function () {
  const BB = (window.BB = window.BB || {});
  BB.depts = BB.depts || {};
  BB.lang = 'en';

  const U = (BB.util = {
    rand: (a, b) => a + Math.random() * (b - a),
    randInt: (a, b) => Math.floor(a + Math.random() * (b - a + 1)),
    pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
    sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
    h(html) {
      const t = document.createElement('template');
      t.innerHTML = html.trim();
      return t.content.firstElementChild;
    },
    esc(s) {
      return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    },
    shake(el) {
      el = el || document.getElementById('stage');
      if (!el) return;
      el.classList.remove('shake');
      void el.offsetWidth;
      el.classList.add('shake');
      setTimeout(() => el.classList.remove('shake'), 600);
    },
    fmt: (n) => Math.round(n).toLocaleString('en-US'),
  });

  let artId = 0;
  BB.art = {
    banana(face = true, cls = '') {
      const id = 'bg' + ++artId;
      return `<svg class="banana-svg ${cls}" viewBox="0 0 200 130" aria-hidden="true">
        <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fff08a"/><stop offset=".55" stop-color="#ffd60a"/><stop offset="1" stop-color="#f2b600"/></linearGradient></defs>
        <path d="M178 34 L190 12 L198 17 L187 38 Z" fill="#7a5a1e" stroke="#1d1d1d" stroke-width="4" stroke-linejoin="round"/>
        <path d="M16 38 C 30 104, 152 120, 186 32 C 168 66, 122 82, 90 76 C 58 70, 32 56, 16 38 Z" fill="url(#${id})" stroke="#1d1d1d" stroke-width="5" stroke-linejoin="round"/>
        <path d="M40 66 C 70 92, 128 98, 166 64" stroke="#fff7b8" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/>
        <circle cx="17" cy="39" r="5" fill="#5b4314"/>
        ${face ? `<g class="banana-face">
          <ellipse cx="88" cy="88" rx="5" ry="6.5" fill="#1d1d1d"/><ellipse cx="114" cy="89" rx="5" ry="6.5" fill="#1d1d1d"/>
          <circle cx="90" cy="86" r="1.8" fill="#fff"/><circle cx="116" cy="87" r="1.8" fill="#fff"/>
          <ellipse cx="76" cy="97" rx="7" ry="4" fill="#ff8fb1" opacity=".75"/><ellipse cx="127" cy="98" rx="7" ry="4" fill="#ff8fb1" opacity=".75"/>
          <path class="banana-mouth" d="M94 98 Q 101 106 108 98" stroke="#1d1d1d" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        </g>` : ''}
      </svg>`;
    },
    kevin(cls = '') {
      return `<svg class="kevin-svg ${cls}" viewBox="0 0 84 52" aria-hidden="true">
        <path d="M60 26 L82 10 L77 26 L82 42 Z" fill="#ff6b00" stroke="#1d1d1d" stroke-width="3" stroke-linejoin="round"/>
        <path d="M30 10 Q 40 0 50 10" fill="#ff6b00" stroke="#1d1d1d" stroke-width="3"/>
        <ellipse cx="35" cy="26" rx="27" ry="17" fill="#ff9a1f" stroke="#1d1d1d" stroke-width="3"/>
        <path d="M40 18 Q 46 26 40 34" stroke="#ff6b00" stroke-width="3" fill="none"/>
        <circle cx="20" cy="22" r="6" fill="#fff" stroke="#1d1d1d" stroke-width="2"/>
        <circle class="k-pupil" cx="18.5" cy="22" r="2.8" fill="#111"/>
        <path class="k-x" d="M16 18 L24 26 M24 18 L16 26" stroke="#111" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M11 32 Q 15 35 19 32" stroke="#1d1d1d" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      </svg>`;
    },
  };
})();
