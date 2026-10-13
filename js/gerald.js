/* Gerald: the Ministry's only employee. Animated SVG pigeon + speech bubble engine. */
(function () {
  const BB = window.BB, U = BB.util;
  let uid = 0;

  function svg(cls = '') {
    const u = ++uid;
    return `<svg class="gerald-svg ${cls}" viewBox="0 0 200 230" aria-hidden="true">
      <defs><linearGradient id="iri${u}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#36d1a0"/><stop offset=".5" stop-color="#5b8def"/><stop offset="1" stop-color="#b05cff"/></linearGradient></defs>
      <g class="g-legs" stroke="#e8743b" stroke-width="6" stroke-linecap="round" fill="none">
        <path class="g-leg-l" d="M88 184 L84 214 M84 214 L72 221 M84 214 L91 223"/>
        <path class="g-leg-r" d="M114 184 L118 214 M118 214 L108 222 M118 214 L131 220"/>
      </g>
      <g class="g-body">
        <path d="M48 150 L8 176 L18 188 L58 170 Z" fill="#6f788c" stroke="#1d1d1d" stroke-width="4" stroke-linejoin="round"/>
        <ellipse cx="100" cy="148" rx="62" ry="44" fill="#9aa4b8" stroke="#1d1d1d" stroke-width="4"/>
        <path class="g-wing" d="M56 132 Q 98 112 130 140 Q 108 182 62 170 Q 46 152 56 132 Z" fill="#7c879d" stroke="#1d1d1d" stroke-width="4" stroke-linejoin="round"/>
        <path d="M70 150 Q 92 157 112 150 M73 160 Q 92 167 108 160" stroke="#5d667a" stroke-width="3" fill="none" stroke-linecap="round"/>
        <g class="g-head">
          <ellipse cx="116" cy="104" rx="30" ry="25" fill="url(#iri${u})" stroke="#1d1d1d" stroke-width="4"/>
          <path class="g-tie" d="M110 116 L124 116 L121 126 L129 158 L117 170 L106 158 L114 126 Z" fill="#e63946" stroke="#1d1d1d" stroke-width="3.5" stroke-linejoin="round"/>
          <circle cx="122" cy="62" r="34" fill="#aab3c6" stroke="#1d1d1d" stroke-width="4"/>
          <path class="g-tuft" d="M114 30 Q 108 14 120 20 Q 122 8 130 22" stroke="#1d1d1d" stroke-width="3.5" fill="none" stroke-linecap="round"/>
          <ellipse class="g-blush" cx="112" cy="80" rx="8" ry="5" fill="#ff8fb1" opacity=".75"/>
          <g class="g-eye">
            <circle class="g-eyeball" cx="134" cy="54" r="13" fill="#fff" stroke="#ff8a00" stroke-width="4"/>
            <g class="g-pupil"><circle cx="134" cy="54" r="5.5" fill="#111"/><circle cx="136" cy="52" r="1.7" fill="#fff"/></g>
          </g>
          <path class="g-heart" d="M134 64 C 120 52, 124 38, 134 46 C 144 38, 148 52, 134 64 Z" fill="#ff2e63" stroke="#1d1d1d" stroke-width="2.5"/>
          <path class="g-brow" d="M120 36 L146 39" stroke="#1d1d1d" stroke-width="4" stroke-linecap="round"/>
          <path class="g-beak-bot" d="M151 69 L174 70 L151 79 Z" fill="#e39a2e" stroke="#1d1d1d" stroke-width="3.5" stroke-linejoin="round"/>
          <path class="g-beak-top" d="M151 57 L182 66 L151 70 Z" fill="#f5b041" stroke="#1d1d1d" stroke-width="3.5" stroke-linejoin="round"/>
          <ellipse cx="154" cy="57" rx="5" ry="3.5" fill="#f4f4f4" stroke="#1d1d1d" stroke-width="2"/>
          <path class="g-sweat" d="M100 32 Q 93 45 100 50 Q 107 45 100 32 Z" fill="#7fd3ff" stroke="#1d1d1d" stroke-width="2"/>
        </g>
      </g>
    </svg>`;
  }

  function transform(text) {
    const L = BB.lang;
    const swap = (word) => (w) => (w.length > 1 && w === w.toUpperCase() ? word.toUpperCase() : /^[A-Z]/.test(w) ? word[0].toUpperCase() + word.slice(1) : word);
    if (L === 'pigeon') return text.replace(/[A-Za-z']+/g, swap('coo'));
    if (L === 'banana') return text.replace(/[A-Za-z']+/g, swap('banana'));
    if (L === 'shout') return text.toUpperCase().replace(/[.!?…]*$/, '!!!');
    return text;
  }

  function typeInto(el, text, opts = {}) {
    if (el._cancelType) el._cancelType();
    const chars = [...text];
    let i = 0;
    el.textContent = '';
    const speed = opts.speed || 22;
    return new Promise((res) => {
      const t = setInterval(() => {
        i++;
        el.textContent = chars.slice(0, i).join('');
        if (opts.sound !== false && i % 3 === 0) BB.sound.play(opts.voice || 'chirp');
        if (i >= chars.length) { clearInterval(t); el._cancelType = null; res(); }
      }, speed);
      el._cancelType = () => { clearInterval(t); el._cancelType = null; res(); };
    });
  }

  const G = (BB.gerald = { svg, transform, typeInto });
  let dock, bubble, txt, holder, gen = 0, holdTimer = null, pendingResolve = null;

  function setMood(m) { if (holder) holder.dataset.mood = m; }
  G.setMood = setMood;

  G.say = function (text, opts = {}) {
    if (!bubble) return Promise.resolve(false);
    const my = ++gen;
    if (pendingResolve) { pendingResolve(false); pendingResolve = null; }
    clearTimeout(holdTimer);
    const t = transform(text);
    setMood(opts.mood || 'normal');
    bubble.classList.add('show');
    bubble.classList.remove('pop');
    void bubble.offsetWidth;
    bubble.classList.add('pop');
    holder.classList.add('talking');
    return new Promise((res) => {
      pendingResolve = res;
      typeInto(txt, t, { speed: opts.speed }).then(() => {
        if (my !== gen) return;
        holder.classList.remove('talking');
        const hold = opts.hold != null ? opts.hold : Math.max(2000, [...t].length * 48);
        holdTimer = setTimeout(() => {
          if (my !== gen) return;
          if (!opts.sticky) bubble.classList.remove('show');
          if (!opts.keepMood) setMood('normal');
          pendingResolve = null;
          res(true);
        }, hold);
      });
    });
  };

  G.hide = function () {
    gen++;
    if (pendingResolve) { pendingResolve(false); pendingResolve = null; }
    clearTimeout(holdTimer);
    if (txt && txt._cancelType) txt._cancelType();
    bubble && bubble.classList.remove('show');
    holder && holder.classList.remove('talking');
  };

  const QUIPS = [
    'Fun fact: I have never actually seen a banana. I just love the idea of one.',
    'Please do not poke the staff. The staff is me.',
    'I have a tie. That makes this a professional organisation.',
    'Coo. (That was a business coo.)',
    'I am not a bird. I am a Senior Ministry Official who happens to have feathers.',
    'If you see Kevin, tell him I said hi. He is a fish. He cannot respond.',
    'My salary is one breadcrumb per decade.',
    'Do not trust the duck.',
    'Ouch! That was my professional face.',
  ];

  // Eyes follow the cursor on every Gerald on the page.
  let eyeRaf = 0;
  function trackEyes() {
    eyeRaf = 0;
    const mx = BB.mouse ? BB.mouse.x : 0, my = BB.mouse ? BB.mouse.y : 0;
    document.querySelectorAll('.gerald-svg').forEach((s) => {
      const ball = s.querySelector('.g-eyeball');
      const pupil = s.querySelector('.g-pupil');
      if (!ball || !pupil) return;
      const r = ball.getBoundingClientRect();
      const dx = mx - (r.left + r.width / 2), dy = my - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(5, d / 30);
      pupil.setAttribute('transform', `translate(${((dx / d) * k).toFixed(2)} ${((dy / d) * k).toFixed(2)})`);
    });
  }
  G.trackEyes = () => { if (!eyeRaf) eyeRaf = requestAnimationFrame(trackEyes); };

  G.init = function () {
    dock = document.getElementById('gerald-dock');
    dock.innerHTML = `<div class="bubble" id="gerald-bubble"><span class="txt"></span></div><div class="gerald-holder" data-mood="normal" title="Gerald (Senior Ministry Official)">${svg()}</div>`;
    bubble = dock.querySelector('.bubble');
    txt = bubble.querySelector('.txt');
    holder = dock.querySelector('.gerald-holder');
    holder.addEventListener('click', () => {
      BB.sound.play('coo');
      holder.classList.remove('boop');
      void holder.offsetWidth;
      holder.classList.add('boop');
      G.say(U.pick(QUIPS), { mood: Math.random() < 0.3 ? 'love' : 'normal' });
    });
    bubble.addEventListener('click', () => { bubble.classList.remove('show'); });
    document.addEventListener('pointermove', G.trackEyes, { passive: true });
    const blink = () => {
      document.querySelectorAll('.gerald-holder').forEach((h) => {
        h.classList.add('blink');
        setTimeout(() => h.classList.remove('blink'), 160);
      });
      setTimeout(blink, U.rand(2500, 6000));
    };
    setTimeout(blink, 2000);
  };
})();
