/* DEPT 06: Waiting. A progress bar that lies, and a mini-game: catch bananas while Gerald steals them. */
(function () {
  const BB = window.BB, U = BB.util;
  const GOAL = 15;
  const STATUS = [
    'Reticulating bananas…', 'Asking the moon for permission…', 'Peeling the bureaucracy…', 'Waiting for Kevin to finish his nap…',
    'Downloading more RAM for the banana…', 'Bribing the progress bar…', "Untangling the banana's family tree…", 'Consulting a horoscope…',
    'Converting banana to PDF…', 'Faxing the banana to itself…', 'Almost there (lie)…', 'Rebooting Gerald…',
  ];

  BB.depts.waiting = {
    title: 'WAITING', short: 'Waiting', icon: '⏳', music: 'disco',
    render(el, x) {
      el.innerHTML = `
      <div class="card tilt-l wait-card">
        <h2 class="headline">Your banana is being prepared ⏳</h2>
        <div class="fake-progress"><div class="fp-fill" id="fp-fill"></div><span class="fp-label" id="fp-label">Loading… 0%</span></div>
        <p class="status-line" id="status-line">${STATUS[0]}</p>
        <p class="lead">The banana machine runs on bananas. Please catch <b>${GOAL}</b> 🍌 to power it. Avoid 🥥 coconuts and don't catch Kevin's cousins 🐟. Click Gerald to shoo him away!</p>
        <div class="game-wrap"><canvas id="game"></canvas><div class="game-hud" id="hud">🍌 0 / ${GOAL}</div></div>
        <p class="hint">Move: mouse / finger / ← → keys</p>
      </div>`;

      const $ = (s) => el.querySelector(s);
      const cv = $('#game'), g = cv.getContext('2d');
      const hud = $('#hud'), fill = $('#fp-fill'), label = $('#fp-label'), statusLine = $('#status-line');
      let Wd = 0, Ht = 0;
      const resize = () => {
        const d = window.devicePixelRatio || 1;
        Wd = cv.clientWidth; Ht = cv.clientHeight;
        cv.width = Wd * d; cv.height = Ht * d;
        g.setTransform(d, 0, 0, d, 0, 0);
      };
      resize();
      x.on(window, 'resize', resize);

      let caught = 0, basketX = Wd / 2, stun = 0, items = [], spawnT = 0, floaters = [], done = false;
      let pigeon = null, nextPigeon = U.rand(7, 10);
      const keys = {};
      const flip = () => (document.body.classList.contains('upside') ? -1 : 1);

      x.on(cv, 'pointermove', (e) => {
        const r = cv.getBoundingClientRect();
        let px = e.clientX - r.left;
        if (flip() < 0) px = r.width - px;
        basketX = U.clamp(px, 30, Wd - 30);
      });
      x.on(document, 'keydown', (e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { keys[e.key] = true; e.preventDefault(); } });
      x.on(document, 'keyup', (e) => { keys[e.key] = false; });

      x.on(cv, 'pointerdown', (e) => {
        if (!pigeon) return;
        const r = cv.getBoundingClientRect();
        let px = e.clientX - r.left, py = e.clientY - r.top;
        if (flip() < 0) { px = r.width - px; py = r.height - py; }
        if (Math.hypot(px - pigeon.x, py - pigeon.y) < 45) {
          pigeon.state = 'leave';
          pigeon.vx = pigeon.x < Wd / 2 ? -500 : 500;
          x.sfx('honk');
          float('SHOO! 💨', pigeon.x, pigeon.y);
          x.say(U.pick(['Okay okay! I was just looking!', 'I was not going to take anything. Probably.', 'Rude. Accurate, but rude.']), { mood: 'panic' });
        }
      });

      const TYPES = [
        { e: '🍌', w: 68, v: 1 },
        { e: '🌟', w: 5, v: 3, gold: true },
        { e: '🥥', w: 16, v: -2, bad: true },
        { e: '🐟', w: 11, v: -1, fish: true },
      ];
      const pickType = () => { let r = Math.random() * 100; for (const t of TYPES) { if ((r -= t.w) < 0) return t; } return TYPES[0]; };
      const float = (text, fx, fy, color = '#1d1d1d') => floaters.push({ text, x: fx, y: fy, t: 0, color });

      // Lying progress label.
      const lies = [(p) => `Loading… ${p}%`, (p) => `Loading… ${-p}%`, () => 'Loading… 99.999%', () => 'Loading… 🍌%', (p) => `Loading… ${p * 7}%`, () => 'Loading… ∞%', (p) => `Loading… ${p}% (±400%)`];
      let li = 0;
      x.interval(() => {
        li = (li + 1) % lies.length;
        label.textContent = lies[li](Math.round((caught / GOAL) * 100));
      }, 1500);
      let si = 0;
      x.interval(() => { si = (si + 1) % STATUS.length; statusLine.textContent = STATUS[si]; }, 2300);

      const setCaught = (n) => {
        caught = U.clamp(n, 0, 999);
        hud.textContent = `🍌 ${caught} / ${GOAL}`;
        fill.style.width = Math.min(100, (caught / GOAL) * 100) + '%';
        if (caught >= GOAL && !done) finish();
      };

      x.loop((dt) => {
        if (done) return false;
        if (keys.ArrowLeft) basketX -= 520 * dt * flip();
        if (keys.ArrowRight) basketX += 520 * dt * flip();
        basketX = U.clamp(basketX, 30, Wd - 30);
        if (stun > 0) stun -= dt;

        spawnT -= dt;
        if (spawnT <= 0) {
          spawnT = U.rand(0.45, 0.85);
          const t = pickType();
          items.push({ ...t, x: U.rand(24, Wd - 24), y: -30, vy: U.rand(150, 250), rot: U.rand(-1, 1), vr: U.rand(-3, 3) });
        }
        const by = Ht - 34;
        for (const it of items) {
          it.y += it.vy * dt;
          it.rot += it.vr * dt;
          if (!it.gone && it.y > by - 26 && it.y < by + 10 && Math.abs(it.x - basketX) < 44 && stun <= 0) {
            it.gone = true;
            if (it.bad) { stun = 1; x.sfx('bonk'); float('BONK! −2', it.x, by - 40, '#e63946'); setCaught(caught - 2); }
            else if (it.fish) { x.sfx('splash'); float("Kevin's cousin! −1 🐟", it.x, by - 40, '#2563eb'); setCaught(caught - 1); }
            else { x.sfx(it.gold ? 'tada' : 'coin'); float(it.gold ? '+3 ✨' : '+1', it.x, by - 40, '#16a34a'); setCaught(caught + it.v); }
          }
        }
        items = items.filter((it) => !it.gone && it.y < Ht + 40);

        // Gerald swoops in to steal from the basket.
        nextPigeon -= dt;
        if (!pigeon && nextPigeon <= 0 && caught > 0) {
          const fromLeft = Math.random() < 0.5;
          pigeon = { x: fromLeft ? -40 : Wd + 40, y: 40, vx: 0, state: 'come', t: 0 };
          x.sfx('coo');
          x.say(U.pick(["I'm just going to borrow a few…", "Don't mind me. Ministry inspection.", 'Those look delicious. For inspection purposes.']), { mood: 'love' });
        }
        if (pigeon) {
          pigeon.t += dt;
          if (pigeon.state === 'come') {
            const tx = basketX, ty = by - 30;
            pigeon.x += (tx - pigeon.x) * Math.min(1, dt * 1.6);
            pigeon.y += (ty - pigeon.y) * Math.min(1, dt * 1.6);
            if (Math.hypot(tx - pigeon.x, ty - pigeon.y) < 18) {
              const stolen = Math.min(caught, U.randInt(1, 2));
              setCaught(caught - stolen);
              x.sfx('chomp');
              float(`Gerald stole ${stolen}! 🐦`, pigeon.x, pigeon.y - 30, '#7b2ff7');
              x.say('That was not me.', { mood: 'love' });
              pigeon.state = 'leave';
              pigeon.vx = Math.random() < 0.5 ? -420 : 420;
            }
          } else {
            pigeon.x += pigeon.vx * dt;
            pigeon.y -= 220 * dt;
            if (pigeon.x < -80 || pigeon.x > Wd + 80 || pigeon.y < -80) { pigeon = null; nextPigeon = U.rand(8, 13); }
          }
        }

        // ---- draw
        g.clearRect(0, 0, Wd, Ht);
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        for (const it of items) {
          g.save();
          g.translate(it.x, it.y);
          g.rotate(it.rot);
          if (it.gold) { g.shadowColor = '#ffd60a'; g.shadowBlur = 20; }
          g.font = '38px serif';
          g.fillText(it.gold ? '🍌' : it.e, 0, 0);
          g.restore();
        }
        g.save();
        g.translate(basketX, by);
        if (stun > 0) g.rotate(Math.sin(stun * 30) * 0.3);
        g.font = '56px serif';
        g.fillText('🧺', 0, 0);
        g.restore();
        if (stun > 0) { g.font = '22px serif'; g.fillText('💫', basketX + 26, by - 34); }
        if (pigeon) {
          g.save();
          g.translate(pigeon.x, pigeon.y + Math.sin(pigeon.t * 12) * 5);
          if (pigeon.vx > 0 || (pigeon.state === 'come' && basketX > pigeon.x)) g.scale(-1, 1);
          g.font = '52px serif';
          g.fillText('🐦', 0, 0);
          g.restore();
        }
        floaters = floaters.filter((f) => (f.t += dt) < 1.1);
        for (const f of floaters) {
          g.globalAlpha = 1 - f.t / 1.1;
          g.fillStyle = f.color;
          g.font = 'bold 20px Fredoka, sans-serif';
          g.fillText(f.text, f.x, f.y - f.t * 50);
          g.globalAlpha = 1;
        }
      });

      function finish() {
        done = true;
        label.textContent = 'Loading… 100% (for real this time)';
        statusLine.textContent = '✅ Banana prepared!';
        x.sfx('tada');
        BB.confetti({ count: 150, emoji: ['🍌'] });
        x.say('THE BANANA IS READY! 🍌 Follow me to the Grand Ceremony Hall!', { mood: 'love' });
        x.timeout(() => x.next(), 2600);
      }

      x.say("Department of Waiting! Your banana is being prepared. Please enjoy this complimentary mini-game while you wait.");
    },
  };
})();
