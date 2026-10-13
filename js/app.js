/* Router, state, progress strip, splash screen. */
(function () {
  const BB = window.BB, U = BB.util;
  const $ = (id) => document.getElementById(id);

  const ORDER = ['lobby', 'identity', 'password', 'volume', 'captcha', 'submit', 'waiting', 'ceremony'];

  BB.state = {
    name: '', phone: '', birthday: '', age: 0, country: '', banana: '',
    kevinDeaths: 0, noClicks: 0, screams: 0, skips: 0, rounds: 0,
    startTime: Date.now(), upside: false,
  };

  function makeScope(el) {
    const s = { alive: true, el, state: BB.state, _t: [], _i: [], _l: [], _loops: [], _c: [] };
    s.timeout = (fn, ms) => { const id = setTimeout(() => s.alive && fn(), ms); s._t.push(id); return id; };
    s.interval = (fn, ms) => { const id = setInterval(() => s.alive && fn(), ms); s._i.push(id); return id; };
    s.on = (t, e, f, o) => { t.addEventListener(e, f, o); s._l.push([t, e, f, o]); };
    s.loop = (fn) => {
      const L = { id: 0 };
      let last = performance.now();
      const step = (now) => {
        if (!s.alive) return;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (fn(dt, now) !== false) L.id = requestAnimationFrame(step);
      };
      L.id = requestAnimationFrame(step);
      s._loops.push(L);
    };
    s.sleep = (ms) => new Promise((res) => s.timeout(res, ms));
    s.cleanup = (fn) => s._c.push(fn);
    s.say = (t, o) => (s.alive ? BB.gerald.say(t, o) : Promise.resolve(false));
    s.script = async (lines) => {
      for (const l of lines) {
        if (!s.alive) return false;
        const [text, opts] = Array.isArray(l) ? l : [l, {}];
        const ok = await BB.gerald.say(text, opts);
        if (!ok || !s.alive) return false;
      }
      return true;
    };
    s.sfx = (n, ...a) => BB.sound.play(n, ...a);
    s.next = () => s.alive && BB.app.next();
    s.dispose = () => {
      s.alive = false;
      s._t.forEach(clearTimeout);
      s._i.forEach(clearInterval);
      s._loops.forEach((L) => cancelAnimationFrame(L.id));
      s._l.forEach(([t, e, f, o]) => t.removeEventListener(e, f, o));
      s._c.forEach((f) => { try { f(); } catch (e) { console.error(e); } });
    };
    return s;
  }

  const app = (BB.app = {
    index: -1,
    scope: null,
    started: false,
    order: ORDER,

    go(i) {
      i = U.clamp(i, 0, ORDER.length - 1);
      if (app.scope) app.scope.dispose();
      document.body.classList.remove('no-popups');
      const key = ORDER[i];
      const dept = BB.depts[key];
      app.index = i;
      const stage = $('stage');
      stage.innerHTML = '';
      const sec = U.h(`<section class="dept dept-${key}">
        <div class="dept-ribbon"><span class="floor">${String(i).padStart(2, '0')}</span><span class="ribbon-text">DEPARTMENT ${String(i).padStart(2, '0')} · ${dept.title}</span><span class="ribbon-icon">${dept.icon}</span></div>
        <div class="dept-body"></div></section>`);
      stage.appendChild(sec);
      const scope = (app.scope = makeScope(sec.querySelector('.dept-body')));
      if (dept.calm) {
        document.body.classList.add('no-popups');
        document.querySelectorAll('.popup').forEach((p) => p.remove());
      }
      if (dept.music) BB.music.play(dept.music);
      renderProgress();
      BB.sound.play('whoosh');
      try {
        dept.render(scope.el, scope);
      } catch (e) {
        console.error(e);
      }
      // Upside down, the top of the page is at the bottom.
      window.scrollTo({ top: BB.state.upside ? document.body.scrollHeight : 0, behavior: 'smooth' });
      $('btn-skip').hidden = i === ORDER.length - 1;
    },

    next() { app.go(app.index + 1); },

    restart() {
      const st = BB.state;
      st.rounds++;
      st.upside = !st.upside;
      document.body.classList.toggle('upside', st.upside);
      $('btn-flip').hidden = !st.upside;
      BB.music.inverted = st.upside;
      app.go(0);
    },
  });

  function renderProgress() {
    const ol = $('progress');
    ol.innerHTML = ORDER.map((k, i) => {
      const d = BB.depts[k];
      const cls = i < app.index ? 'done' : i === app.index ? 'current' : '';
      return `<li class="${cls}"><span class="p-icon">${i < app.index ? '✅' : d.icon}</span><span class="p-name">${d.short || d.title}</span></li>`;
    }).join('');
  }

  function initHeader() {
    $('btn-skip').addEventListener('click', () => {
      BB.state.skips++;
      BB.sound.play('slideUp');
      BB.gerald.say(U.pick(['Skipping? In THIS economy?', 'Fine. I will tell the banana you cheated.', 'Judges only! …you ARE a judge, right?', 'Skipping. I am writing this down in my little book.']), { mood: 'panic' });
      app.next();
    });
    $('btn-flip').addEventListener('click', () => {
      BB.state.upside = false;
      document.body.classList.remove('upside');
      $('btn-flip').hidden = true;
      BB.music.inverted = false;
      BB.sound.play('slideUp');
      BB.gerald.say('Okay okay, everything is right side up again. Spoilsport.');
    });
  }

  function initSplash() {
    const splash = $('splash');
    $('splash-banana').innerHTML = BB.art.banana(true, 'wiggle');
    $('btn-claim').addEventListener('click', () => {
      BB.sound.ensure();
      BB.sound.play('fanfare');
      BB.confetti({ count: 200, emoji: ['🍌', '🎉'] });
      splash.classList.add('gone');
      setTimeout(() => splash.remove(), 700);
      app.started = true;
      BB.state.startTime = Date.now();
      setTimeout(() => app.go(0), 350);
    });
  }

  function boot() {
    BB.gerald.init();
    BB.chaos.init();
    initHeader();
    initSplash();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
