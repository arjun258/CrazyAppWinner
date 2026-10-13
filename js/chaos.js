/* The chaos layer: things that happen on every page whether you like it or not. */
(function () {
  const BB = window.BB, U = BB.util;
  const C = (BB.chaos = {});
  let mx = innerWidth / 2, my = innerHeight / 2, lastActivity = Date.now();
  BB.mouse = { get x() { return mx; }, get y() { return my; } };
  const $ = (id) => document.getElementById(id);
  const say = (t, o) => BB.gerald.say(t, o);

  /* ---------- floating background junk ---------- */
  function initFloaters() {
    const box = $('bg-floaters');
    const em = ['🍌', '🐦', '🍪', '🐟', '🦆', '📎', '🧾', '⭐', '🌈', '🍌', '🍌', '✨', '📠', '🗂️'];
    for (let i = 0; i < 22; i++) {
      const s = document.createElement('span');
      s.textContent = U.pick(em);
      s.style.left = U.rand(0, 100) + 'vw';
      s.style.fontSize = U.rand(22, 60) + 'px';
      s.style.animationDuration = U.rand(16, 34) + 's';
      s.style.animationDelay = -U.rand(0, 34) + 's';
      s.style.setProperty('--drift', U.rand(-120, 120) + 'px');
      box.appendChild(s);
    }
  }

  /* ---------- banana cursor trail + idle tracking ---------- */
  let lastTrail = 0, trailCount = 0;
  function initPointer() {
    document.addEventListener('pointermove', (e) => {
      mx = e.clientX; my = e.clientY;
      lastActivity = Date.now();
      if (lightsOn) lightsEl.style.setProperty('--mx', mx + 'px'), lightsEl.style.setProperty('--my', my + 'px');
      if (e.pointerType !== 'mouse') return;
      const now = performance.now();
      if (now - lastTrail < 45 || trailCount > 24) return;
      lastTrail = now;
      const s = document.createElement('span');
      s.className = 'trail';
      s.textContent = Math.random() < 0.1 ? '✨' : '🍌';
      s.style.left = mx + 'px';
      s.style.top = my + 'px';
      s.style.setProperty('--r', U.rand(-120, 120) + 'deg');
      document.body.appendChild(s);
      trailCount++;
      setTimeout(() => { s.remove(); trailCount--; }, 900);
    }, { passive: true });
    ['keydown', 'pointerdown', 'wheel'].forEach((ev) => document.addEventListener(ev, () => (lastActivity = Date.now()), { passive: true }));

    // Idle? Gerald comes and pecks your cursor.
    let lastPeck = 0;
    setInterval(() => {
      if (!BB.app || !BB.app.started || document.hidden) return;
      const idle = Date.now() - lastActivity;
      if (idle > 22000 && Date.now() - lastPeck > 40000) {
        lastPeck = Date.now();
        peck();
      }
    }, 2000);
  }

  function peck() {
    const p = U.h(`<div class="pecker">🐦</div>`);
    p.style.left = mx + 'px';
    p.style.top = my + 'px';
    document.body.appendChild(p);
    [600, 900, 1200].forEach((t) => setTimeout(() => BB.sound.play('peck'), t));
    setTimeout(() => p.remove(), 2400);
    say(U.pick(['Hello?? Are you still alive? I am pecking your cursor.', 'You stopped moving. Are you a robot? Peck peck.', 'Excuse me. The banana is getting impatient.', 'If you are asleep, blink twice.']), { mood: 'panic' });
  }

  /* ---------- popups ---------- */
  C.popup = function ({ title = 'Bureau.exe', html = '', cls = '', closable = true, x, y } = {}) {
    const layer = $('popup-layer');
    const el = U.h(`<div class="popup ${cls}" role="dialog">
      <div class="popup-bar"><span class="popup-title">${title}</span>
        <div class="popup-btns"><span class="pb">_</span><span class="pb">□</span><button class="pb pb-close" aria-label="Close">✕</button></div></div>
      <div class="popup-body">${html}</div></div>`);
    layer.appendChild(el);
    const w = el.offsetWidth, hgt = el.offsetHeight;
    el.style.left = U.clamp(x != null ? x : U.rand(10, innerWidth - w - 10), 6, Math.max(6, innerWidth - w - 6)) + 'px';
    el.style.top = U.clamp(y != null ? y : U.rand(80, innerHeight - hgt - 140), 6, Math.max(6, innerHeight - hgt - 6)) + 'px';
    let closed = false;
    const api = {
      el,
      body: el.querySelector('.popup-body'),
      onClose: null,
      onCloseClick: null,
      get closed() { return closed; },
      close() {
        if (closed) return;
        closed = true;
        el.classList.add('closing');
        setTimeout(() => el.remove(), 260);
        if (api.onClose) api.onClose();
      },
    };
    el.querySelector('.pb-close').addEventListener('click', () => {
      if (api.onCloseClick) return api.onCloseClick();
      if (closable) { BB.sound.play('pop'); api.close(); } else { BB.sound.play('buzz'); U.shake(el); }
    });
    const bar = el.querySelector('.popup-bar');
    bar.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.pb')) return;
      const sx = e.clientX - el.offsetLeft, sy = e.clientY - el.offsetTop;
      const mv = (ev) => { el.style.left = ev.clientX - sx + 'px'; el.style.top = ev.clientY - sy + 'px'; };
      const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); };
      addEventListener('pointermove', mv);
      addEventListener('pointerup', up);
    });
    BB.sound.play('pop');
    return api;
  };

  const RANDOM_POPUPS = {
    update() {
      const p = C.popup({ title: '🪟 Banana Update', closable: false, html: `<p><b>Updating your banana…</b><br>Please do not turn off your fruit.</p><div class="mini-bar"><i></i></div><p class="tiny" data-s>0% complete</p>` });
      const bar = p.body.querySelector('i'), st = p.body.querySelector('[data-s]');
      let v = 0, phase = 0;
      p.onCloseClick = () => { BB.sound.play('buzz'); st.textContent = "You can't close an update. That's the law."; };
      const t = setInterval(() => {
        if (phase === 0) { v += U.rand(4, 14); if (v >= 99) { v = 99; phase = 1; setTimeout(() => (phase = 2), 1600); } }
        else if (phase === 2) { v = 3; phase = 3; st.textContent = 'Oops. Starting over (for quality)'; BB.sound.play('wrong'); setTimeout(() => (phase = 4), 1200); return; }
        else if (phase === 4) { v += 25; if (v >= 100) { v = 100; clearInterval(t); st.textContent = 'Banana updated to v2.0 (now 4% more yellow)'; BB.sound.play('ding'); setTimeout(() => p.close(), 1600); } }
        bar.style.width = v + '%';
        if (phase < 3) st.textContent = Math.floor(v) + '% complete' + (phase === 1 ? ' (thinking really hard)' : '');
      }, 220);
    },
    session() {
      const p = C.popup({ title: '⚠️ Warning', closable: false, html: `<p class="big-center">Your session expires in <b data-n>3</b>…</p>` });
      const n = p.body.querySelector('[data-n]');
      let c = 3;
      const t = setInterval(() => {
        c--;
        BB.sound.play('tick');
        if (c > 0) n.textContent = c;
        else { clearInterval(t); p.body.innerHTML = '<p class="big-center">jk 😜</p>'; BB.sound.play('boing'); setTimeout(() => p.close(), 1300); }
      }, 1000);
    },
    cat() {
      const animals = U.shuffle(['🐈', '🐕', '🐄', '🦒', '🐧', '🦔', '🐊', '🦙', '🐸']);
      const names = { '🐕': 'dog', '🐄': 'cow', '🦒': 'giraffe', '🐧': 'penguin', '🦔': 'hedgehog', '🐊': 'crocodile', '🦙': 'llama', '🐸': 'frog' };
      const p = C.popup({ title: '👀 Still there?', closable: false, html: `<p>Are you still there? Click the <b>cat</b> to prove it.</p><div class="animal-grid">${animals.map((a) => `<button data-a="${a}">${a}</button>`).join('')}</div><p class="tiny" data-m></p>` });
      p.body.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
        if (b.dataset.a === '🐈') { BB.sound.play('ding'); p.body.innerHTML = '<p class="big-center">Verified ✅ You are definitely here.</p>'; setTimeout(() => p.close(), 1100); }
        else { BB.sound.play('honk'); p.body.querySelector('[data-m]').textContent = `That is a ${names[b.dataset.a]}. Disappointing.`; U.shake(p.el); }
      }));
    },
    singles() {
      const p = C.popup({ title: '🔥 HOT DEAL 🔥', cls: 'popup-hot', html: `<p class="big-center blink">HOT SINGLE BANANAS<br>IN YOUR AREA</p><div class="sunglass-bananas">🍌😎 🍌😎 🍌😎</div><p class="tiny">Distance: 0.3 m (they are in your kitchen)</p>` });
      const x = p.el.querySelector('.pb-close');
      let tries = 0;
      p.onCloseClick = () => {
        tries++;
        if (tries > 3) { BB.sound.play('pop'); return p.close(); }
        BB.sound.play('boing');
        x.style.transform = `translate(${U.rand(-200, 0)}px, ${U.rand(0, 120)}px) rotate(${U.rand(-40, 40)}deg)`;
      };
    },
    survey() {
      const faces = ['🙂', '😐', '😕', '🙁', '😢', '😭'];
      const p = C.popup({ title: '📋 Quick survey', html: `<p>How satisfied are you with the Banana Bureau?</p><div class="survey-face" data-f>🙂</div><input type="range" min="0" max="100" value="50" data-r><div class="row"><button class="btn btn-xs" data-s>Submit feedback</button></div>` });
      const r = p.body.querySelector('[data-r]'), f = p.body.querySelector('[data-f]');
      r.addEventListener('input', () => { f.textContent = faces[Math.min(5, Math.floor(Math.abs(r.value - 50) / 9))]; });
      p.body.querySelector('[data-s]').addEventListener('click', () => { BB.sound.play('sadTrombone'); p.body.innerHTML = '<p class="big-center">Thank you. Gerald has read your feedback and is now crying. 😭</p>'; setTimeout(() => p.close(), 2200); });
    },
    hug() {
      const p = C.popup({ title: '🥺 Request', html: `<p>Gerald needs a hug. Hold the button for 2 seconds.</p><div class="row"><button class="btn btn-sm" data-h>🤗 HOLD TO HUG</button></div><div class="mini-bar"><i></i></div>` });
      const b = p.body.querySelector('[data-h]'), bar = p.body.querySelector('i');
      let v = 0, t = null;
      const start = (e) => { e.preventDefault(); clearInterval(t); t = setInterval(() => { v += 5; bar.style.width = v + '%'; if (v >= 100) { clearInterval(t); BB.sound.play('coo'); p.body.innerHTML = '<p class="big-center">Thank you. That was weird. Never again. 🐦</p>'; setTimeout(() => p.close(), 1500); } }, 100); };
      const stop = () => { clearInterval(t); if (v < 100) { v = 0; bar.style.width = '0%'; } };
      b.addEventListener('pointerdown', start);
      b.addEventListener('pointerup', stop);
      b.addEventListener('pointerleave', stop);
    },
    antivirus() {
      const p = C.popup({ title: '🦠 Bureau Antivirus', html: `<p><b>1 threat found:</b> <code>kevin.fish</code></p><p class="tiny">Risk level: wet</p><div class="row"><button class="btn btn-xs" data-q>Quarantine</button><button class="btn btn-xs" data-l>Let him swim</button></div>` });
      p.body.querySelector('[data-q]').addEventListener('click', () => { BB.sound.play('splash'); p.body.innerHTML = '<p class="big-center">Kevin has been placed in a slightly smaller bowl. 🐟</p>'; setTimeout(() => p.close(), 1500); });
      p.body.querySelector('[data-l]').addEventListener('click', () => { BB.sound.play('gulp'); p.body.innerHTML = '<p class="big-center">Kevin thanks you. Blub. 🐟💙</p>'; setTimeout(() => p.close(), 1500); });
    },
    download() {
      const p = C.popup({ title: '⬇️ Download', html: `<p>Would you like to download more bananas?</p><div class="row"><button class="btn btn-xs" data-y>Yes</button><button class="btn btn-xs" data-g>Yes, but green</button></div>` });
      p.body.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { BB.sound.play('wrong'); p.body.innerHTML = "<p class='big-center'>You can't download a banana. Grow up. (Literally, like a banana.)</p>"; setTimeout(() => p.close(), 1800); }));
    },
  };
  C.randomPopup = (name) => {
    if (document.querySelector('.popup:not(.closing)')) return;
    (RANDOM_POPUPS[name] || RANDOM_POPUPS[U.pick(Object.keys(RANDOM_POPUPS))])();
  };
  function schedulePopups() {
    setTimeout(function next() {
      const busy = !BB.app || !BB.app.started || document.hidden || document.body.classList.contains('no-popups') || document.querySelector('.popup:not(.closing)');
      if (!busy) C.randomPopup();
      setTimeout(next, U.rand(55000, 95000));
    }, 45000);
  }

  /* ---------- Duck Support live chat ---------- */
  function initDuck() {
    const root = $('duck-chat');
    root.innerHTML = `<button class="duck-toggle" id="duck-toggle">🦆 Live Support <span class="online-dot"></span><small>1 duck online</small></button>
      <div class="duck-panel" id="duck-panel" hidden>
        <div class="duck-head"><span>🦆 Duck Support</span><small>Typically replies in quacks</small><button class="duck-close" aria-label="Close chat">✕</button></div>
        <div class="duck-msgs" id="duck-msgs"></div>
        <form class="duck-form" id="duck-form"><input id="duck-input" placeholder="Describe your problem…" autocomplete="off"><button class="btn btn-xs">Send</button></form>
      </div>`;
    const panel = $('duck-panel'), msgs = $('duck-msgs'), input = $('duck-input');
    let greeted = false;
    const add = (who, html) => {
      const m = U.h(`<div class="msg ${who}">${html}</div>`);
      msgs.appendChild(m);
      msgs.scrollTop = msgs.scrollHeight;
      return m;
    };
    const duckReply = (text) => {
      const typing = add('duck typing', 'Duck is typing<span class="dots">…</span> 🦆✍️');
      setTimeout(() => {
        typing.remove();
        add('duck', BB.lang === 'en' ? text : BB.gerald.transform(text.replace(/<[^>]+>/g, '')));
        BB.sound.play('quack', U.rand(0.8, 1.3));
      }, U.rand(800, 2000));
    };
    $('duck-toggle').addEventListener('click', () => {
      panel.hidden = !panel.hidden;
      BB.sound.play('quack');
      if (!panel.hidden && !greeted) { greeted = true; add('duck', 'Quack! 👋 <i>(Translation: Hello! How can I quack you today?)</i>'); }
      if (!panel.hidden) input.focus();
    });
    panel.querySelector('.duck-close').addEventListener('click', () => (panel.hidden = true));
    $('duck-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const q = input.value.trim();
      if (!q) return;
      add('me', U.esc(q));
      input.value = '';
      const l = q.toLowerCase();
      let r;
      if (/help|stuck|how/.test(l)) r = 'Quack quack quack. <i>(Translation: no.)</i>';
      else if (/banana/.test(l)) r = 'QUACK!!! 🍌 <i>(He is very excited.)</i>';
      else if (/gerald|pigeon/.test(l)) r = 'quack… <i>(He does not like Gerald.)</i>';
      else if (/password|kevin|fish/.test(l)) r = 'Quack. <i>(Translation: Kevin is fine. Probably.)</i>';
      else if (/human|real|bot|robot|ai/.test(l)) r = 'I am 100% a real human customer service representative. Quack.';
      else if (/refund|money|price/.test(l)) r = 'Quack. 🍞 <i>(He is offering you bread as compensation.)</i>';
      else if (/quack/.test(l)) r = 'Quack? 🤨 <i>(You have a terrible accent.)</i>';
      else r = U.pick([
        'Quack.', 'Quack quack.', 'QUACK.', 'quack? 🤔', '…quack. <i>(sincerely)</i>',
        'Quack quack quack quack. <i>(Translation: have you tried turning the banana off and on again?)</i>',
        'Quack. <i>(Your call is important to us.)</i>', '🍞', 'Quack. Quack. Quack. <i>(He is reading you the Terms & Conditions.)</i>',
      ]);
      duckReply(r);
    });
  }

  /* ---------- GRAVITY ---------- */
  let gravityOn = false;
  C.gravity = function () {
    if (gravityOn) return;
    gravityOn = true;
    BB.sound.play('slideDown');
    say('Uh oh. Who turned on gravity?!', { mood: 'panic' });
    const els = [...document.querySelectorAll('#topbar .logo, #topbar .widget, #topbar .ctl, #progress li, .dept-ribbon, .card > *, #footer > *')]
      .filter((el) => { const r = el.getBoundingClientRect(); return r.width && r.top < innerHeight && r.bottom > 0; });
    const bodies = els.map((el) => {
      const r = el.getBoundingClientRect();
      el.style.transition = 'none';
      return { el, y: 0, vy: U.rand(-150, 0), x: 0, vx: U.rand(-60, 60), rot: 0, vr: U.rand(-220, 220), floor: Math.max(0, innerHeight - r.bottom - U.rand(0, 20)) };
    });
    const t0 = performance.now();
    let last = t0, bonks = 0;
    const step = (now) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      for (const b of bodies) {
        b.vy += 2400 * dt;
        b.y += b.vy * dt;
        b.x += b.vx * dt;
        b.rot += b.vr * dt;
        if (b.y > b.floor) {
          b.y = b.floor;
          if (Math.abs(b.vy) > 250 && bonks < 14) { bonks++; BB.sound.play('bonk'); }
          b.vy *= -0.42; b.vx *= 0.7; b.vr *= 0.6;
        }
        b.el.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${b.rot}deg)`;
      }
      if (now - t0 < 3200) requestAnimationFrame(step);
      else setTimeout(restore, 1800);
    };
    requestAnimationFrame(step);
    const restore = () => {
      say("Hold on, I'll put everything back. With my beak. 🐦");
      bodies.forEach((b) => { b.el.style.transition = 'transform .9s cubic-bezier(.5,1.6,.4,1)'; b.el.style.transform = ''; });
      BB.sound.play('slideUp');
      setTimeout(() => { bodies.forEach((b) => (b.el.style.transition = '')); gravityOn = false; }, 1000);
    };
  };

  /* ---------- lights off (flashlight mode) ---------- */
  let lightsOn = false, lightsEl;
  C.toggleLights = function () {
    lightsOn = !lightsOn;
    document.body.classList.toggle('lights-off', lightsOn);
    lightsEl.style.setProperty('--mx', mx + 'px');
    lightsEl.style.setProperty('--my', my + 'px');
    $('btn-lights').textContent = lightsOn ? '💡 Find the switch' : '🌙 Dark mode';
    BB.sound.play(lightsOn ? 'slideDown' : 'slideUp');
    say(lightsOn ? "Who turned off the lights?! I'm scared of the dark. And of the light. Mostly of you." : "Ahh, light. My old nemesis. Welcome back.", { mood: lightsOn ? 'panic' : 'normal' });
  };

  /* ---------- header widgets ---------- */
  function initWidgets() {
    const clock = $('w-clock'), weather = $('w-weather'), vis = $('w-visitors');
    let visitors = 1000000;
    const W = ['☁️ Currently: vibes', '🌧️ 40% chance of soup', '🌪️ Mildly suspicious', '☀️ 451°F (feels like Tuesday)', '🌈 Raining bananas (light)', '🌫️ Foggy, emotionally', '❄️ Snowing upwards'];
    let wi = 0;
    setInterval(() => {
      const d = new Date();
      const h = (d.getHours() + 5) % 24, m = d.getMinutes() + 37, s = 59 - d.getSeconds();
      clock.textContent = `🕐 ${String(h).padStart(2, '0')}:${m}:${String(s).padStart(2, '0')} (approx.)`;
      visitors -= U.randInt(1, 3);
      if (Math.random() < 0.04) visitors += 5000;
      vis.textContent = `👀 Visitors: ${U.fmt(visitors)}`;
    }, 1000);
    setInterval(() => { wi = (wi + 1) % W.length; weather.textContent = W[wi]; }, 6000);
  }

  /* ---------- Terms & Conditions ---------- */
  function initTnc() {
    const clauses = [
      'By reading this sentence you agree to have read this sentence.',
      'The Bureau is not responsible for bananas that are lost, stolen, or emotionally unavailable.',
      'Gerald may, at any time, for any reason, coo.',
      'All bananas remain the property of the Bureau until peeled, and then they belong to Gerald.',
      'You agree not to look directly at Kevin.',
      'This agreement is governed by the laws of Bananaland and, on weekends, Ohio.',
      'Clicking "No" counts as "Yes" in 14 countries.',
      'The Bureau reserves the right to rename you "Steve".',
      'Your data will be stored securely in a shoebox under Gerald\'s nest.',
      'Screaming at the website is encouraged but not legally required.',
      'Any resemblance to a functional website is purely coincidental.',
      'If you have read this far, please contact a doctor.',
      'The duck is not a licensed customer service representative.',
      'Refunds are issued in breadcrumbs.',
      'You waive your right to waive your rights.',
      'Paragraph 17 has been eaten.',
      'Bananas are curved because of a legal technicality.',
      'This website is best viewed with your eyes closed.',
      'By scrolling you agree to scroll.',
      'You may not use this banana for evil, or for smoothies.',
    ];
    const box = $('tnc-scroll');
    const html = clauses.map((c, i) => `<p>§${i + 1}. ${c}</p>`).join('');
    box.innerHTML = html + html;
  }

  /* ---------- language ---------- */
  function initLang() {
    const sel = $('lang-select');
    sel.addEventListener('change', () => {
      BB.lang = sel.value;
      document.body.classList.toggle('shouting', BB.lang === 'shout');
      BB.sound.play('boing');
      const lines = { en: 'Back to English. How boring.', pigeon: 'Hello! I am now speaking my native language.', banana: 'I am speaking Banana now. It is a very simple language.', shout: 'Why is everyone shouting' };
      say(lines[BB.lang]);
    });
  }

  /* ---------- Konami code → disco ---------- */
  function initKonami() {
    const code = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
    let pos = 0, prevSong = null, discoTimer = null;
    document.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      pos = k === code[pos] ? pos + 1 : k === code[0] ? 1 : 0;
      if (pos === code.length) { pos = 0; C.disco(); }
    });
    C.disco = function () {
      const on = !document.body.classList.contains('disco');
      document.body.classList.toggle('disco', on);
      clearTimeout(discoTimer);
      if (on) {
        prevSong = BB.music.current;
        BB.music.play('disco');
        BB.music.rate = 1.1;
        BB.confetti({ count: 160, emoji: ['🪩', '🕺', '💃', '🍌'] });
        say('🕺 DISCO MODE ACTIVATED. The Ministry approves of your moves.', { mood: 'love' });
        discoTimer = setTimeout(() => document.body.classList.contains('disco') && C.disco(), 25000);
      } else {
        BB.music.rate = 1;
        if (prevSong) { BB.music.current = null; BB.music.play(prevSong); }
      }
    };
  }

  /* ---------- confetti ---------- */
  function initConfetti() {
    const cv = $('confetti-canvas'), cx = cv.getContext('2d');
    let parts = [], running = false;
    const resize = () => {
      const d = window.devicePixelRatio || 1;
      cv.width = innerWidth * d; cv.height = innerHeight * d;
      cx.setTransform(d, 0, 0, d, 0, 0);
    };
    resize();
    addEventListener('resize', resize);
    const cols = ['#FFE135', '#FF4FA3', '#2EE6D6', '#7B2FF7', '#B8FF3B', '#FF8A00'];
    BB.confetti = function ({ count = 140, x = innerWidth / 2, y = innerHeight * 0.35, spread = 1, emoji = null } = {}) {
      for (let i = 0; i < count; i++) {
        const a = U.rand(0, Math.PI * 2), sp = U.rand(200, 800) * spread;
        parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - U.rand(200, 500), r: U.rand(0, 6), vr: U.rand(-8, 8), w: U.rand(6, 12), h: U.rand(8, 16), c: U.pick(cols), e: emoji && Math.random() < 0.35 ? U.pick(emoji) : null, life: 0 });
      }
      if (running) return;
      running = true;
      let last = performance.now();
      const step = (now) => {
        const dt = Math.min(0.04, (now - last) / 1000);
        last = now;
        cx.clearRect(0, 0, innerWidth, innerHeight);
        parts = parts.filter((p) => p.y < innerHeight + 40 && p.life < 6);
        for (const p of parts) {
          p.life += dt;
          p.vy += 900 * dt;
          p.vx *= 0.985; p.vy *= 0.985;
          p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
          cx.save();
          cx.translate(p.x, p.y);
          cx.rotate(p.r);
          if (p.e) { cx.font = '26px serif'; cx.fillText(p.e, -13, 10); }
          else { cx.fillStyle = p.c; cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.life * 8))); }
          cx.restore();
        }
        if (parts.length) requestAnimationFrame(step);
        else { running = false; cx.clearRect(0, 0, innerWidth, innerHeight); }
      };
      requestAnimationFrame(step);
    };
  }

  C.init = function () {
    lightsEl = $('lights-overlay');
    initFloaters();
    initPointer();
    initDuck();
    initWidgets();
    initTnc();
    initLang();
    initKonami();
    initConfetti();
    schedulePopups();
    $('btn-gravity').addEventListener('click', C.gravity);
    $('btn-lights').addEventListener('click', C.toggleLights);
    const mb = $('btn-music');
    mb.addEventListener('click', () => {
      const on = !BB.sound.musicOn;
      BB.sound.setMusicOn(on);
      mb.textContent = on ? '🎵 Music: ON' : '🔇 Music: OFF (sad)';
      if (!on) say('You turned off the music. The kazoo player has been let go.', { mood: 'panic' });
    });
  };
})();
