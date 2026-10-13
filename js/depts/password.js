/* DEPT 02: Passwords. Rules get worse one at a time. Kevin the goldfish lives in your password. */
(function () {
  const BB = window.BB, U = BB.util;
  const MOONS = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
  const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const HEXES = ['#FAB', '#ACE', '#BAD', '#DAD', '#FED', '#CAB', '#BEE', '#ADD'];

  function moonIndex(d = new Date()) {
    const syn = 29.530588853;
    const ref = Date.UTC(2000, 0, 6, 18, 14);
    const days = (d - ref) / 86400000;
    const ph = (((days % syn) + syn) % syn) / syn;
    return Math.floor(ph * 8 + 0.5) % 8;
  }
  const isPrime = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
  const count = (s, sub) => s.split(sub).length - 1;

  BB.depts.password = {
    title: 'PASSWORDS', short: 'Password', icon: '🔐', music: 'bureau',
    render(el, x) {
      const st = x.state;
      const moon = MOONS[moonIndex()];
      let hex = U.pick(HEXES);

      const RULES = [
        { t: 'Your password must be at least 5 characters.', c: (p, k) => k.len >= 5 },
        { t: 'Your password must include a number.', c: (p) => /\d/.test(p) },
        { t: 'Your password must include an uppercase letter.', c: (p) => /[A-Z]/.test(p) },
        { t: 'Your password must include a special character.', c: (p) => /[^A-Za-z0-9\s]/.test(p) },
        { t: 'The digits in your password must add up to <b>25</b>.', c: (p, k) => k.digitSum === 25, say: 'Math! My nemesis. 🧮' },
        { t: 'Your password must include a month of the year.', c: (p) => MONTHS.some((m) => p.toLowerCase().includes(m)) },
        { t: 'Your password must include the Roman numeral for <b>9</b>.', c: (p) => p.includes('IX'), say: 'Romans. Famous for their numbers and their salads.' },
        { t: 'Your password must include the current phase of the moon as an emoji. 🔭', c: (p) => p.includes(moon), say: 'Look up! No, at the real sky. Or use the telescope button.' },
        { t: "Your password must include the name of the Ministry's CEO.", c: (p) => p.toLowerCase().includes('gerald'), say: 'Who could the CEO possibly be? 🐦👔' },
        { t: '🐟 <b>Kevin</b> the goldfish has moved into your password. Keep exactly one 🐟 in it. He drinks 💧 drops from your password. Do not let him dry out.', c: (p) => count(p, '🐟') === 1, kevin: true, say: 'Meet Kevin! My emotional support fish. Please keep him alive. Please.' },
        { t: 'Your password must contain a banana. Obviously. 🍌', c: (p) => p.includes('🍌') },
        { t: 'Your password must rhyme with "banana". (Its letters must end in <b>-ana</b>.)', c: (p) => p.replace(/[^a-z]/gi, '').toLowerCase().endsWith('ana'), say: 'Banana, cabana, Montana, bandana… so many options!' },
        { t: () => `Your password must include the hex colour of this box: <span class="hexbox" style="background:${hex}"><span>${hex}</span></span>`, c: (p) => p.toUpperCase().includes(hex), dyn: true, say: 'The box changes colour sometimes. It is going through a phase.' },
        { t: (k) => `The length of your password must be a prime number. <small>(currently ${k.len})</small>`, c: (p, k) => isPrime(k.len), dyn: true, say: 'Primes: 2, 3, 5, 7, 11… I stopped counting at "many".' },
        { t: 'Your password must include at least one 😭 because, honestly, this is hard.', c: (p) => p.includes('😭') },
      ];

      el.innerHTML = `
      <div class="card tilt-l pw-card">
        <h2 class="headline">Choose a password 🔐</h2>
        <p class="lead">Security is very important to the Ministry. Please choose a password.</p>
        <div class="pw-layout">
          <div class="pw-main">
            <div class="pw-box-wrap">
              <textarea id="pw" rows="2" spellcheck="false" autocomplete="off" placeholder="Type your password…"></textarea>
              <div class="pw-len" id="pw-len">0</div>
            </div>
            <div class="emoji-bar" id="emoji-bar">
              ${MOONS.map((m) => `<button data-e="${m}" title="moon">${m}</button>`).join('')}
              <button data-e="💧">💧</button><button data-e="🐟">🐟</button><button data-e="🍌">🍌</button><button data-e="😭">😭</button><button data-e="🐔" title="Paul?">🐔</button>
              <button class="btn btn-xs btn-cyan" id="telescope">🔭 Borrow telescope</button>
            </div>
            <div class="rules" id="rules"></div>
            <button class="btn btn-primary btn-big" id="btn-set" hidden>SET PASSWORD ✅</button>
          </div>
          <div class="kevin-zone" id="kevin-zone" hidden>
            <div class="bowl" id="bowl"><div class="water" id="water"><div class="bubbles"><i></i><i></i><i></i></div></div><div class="kevin" id="kevin">${BB.art.kevin()}</div></div>
            <div class="kevin-name" id="kevin-name">KEVIN</div>
            <div class="meter"><i id="water-meter"></i></div>
            <div class="kevin-status" id="kevin-status">Kevin is waiting to move in.</div>
          </div>
        </div>
      </div>`;

      const $ = (s) => el.querySelector(s);
      const pw = $('#pw'), rulesEl = $('#rules'), lenEl = $('#pw-len');
      let unlocked = 1, ruleEls = [], done = false;

      const ctxOf = (p) => {
        const cps = [...p];
        return { len: cps.length, digitSum: cps.filter((c) => /[0-9]/.test(c)).reduce((a, c) => a + +c, 0) };
      };

      function evaluate() {
        if (done) return;
        const p = pw.value, k = ctxOf(p);
        lenEl.textContent = k.len;
        while (unlocked < RULES.length && RULES.slice(0, unlocked).every((r) => r.c(p, k))) {
          unlocked++;
          const r = RULES[unlocked - 1];
          x.sfx('blip');
          if (r.say) x.say(r.say);
          if (r.kevin) startKevin();
        }
        let allOk = true;
        for (let i = 0; i < unlocked; i++) {
          const r = RULES[i];
          const ok = r.c(p, k);
          if (!ok) allOk = false;
          if (!ruleEls[i]) {
            ruleEls[i] = U.h(`<div class="rule pop-in"><div class="rule-head">Rule ${i + 1}</div><div class="rule-text"></div></div>`);
            ruleEls[i].querySelector('.rule-text').innerHTML = typeof r.t === 'function' ? r.t(k) : r.t;
            rulesEl.appendChild(ruleEls[i]);
          } else if (r.dyn) {
            ruleEls[i].querySelector('.rule-text').innerHTML = r.t(k);
          }
          ruleEls[i].classList.toggle('ok', ok);
          ruleEls[i].classList.toggle('bad', !ok);
          ruleEls[i].style.order = ok ? 1000 - i : -i - 1;
        }
        $('#btn-set').hidden = !(allOk && unlocked === RULES.length);
      }
      x.on(pw, 'input', () => { x.sfx('key'); evaluate(); });

      function insert(str) {
        const s = pw.selectionStart ?? pw.value.length, e = pw.selectionEnd ?? pw.value.length;
        pw.value = pw.value.slice(0, s) + str + pw.value.slice(e);
        const pos = s + str.length;
        pw.focus();
        pw.setSelectionRange(pos, pos);
        x.sfx('pop');
        evaluate();
      }
      el.querySelectorAll('[data-e]').forEach((b) => x.on(b, 'click', () => {
        if (b.dataset.e === '🐔') x.say('Paul? Never heard of him. Different website. 🐔', { mood: 'panic' });
        insert(b.dataset.e);
      }));
      let scopeClicks = 0;
      x.on($('#telescope'), 'click', () => {
        scopeClicks++;
        x.sfx('slideUp');
        if (scopeClicks === 1) x.say('Gerald squints through the telescope… it is definitely 🌝. (That is not in the list. Try again.)');
        else x.say(`Okay okay, I cleaned the lens. Tonight's moon is ${moon}.`);
      });

      // The hex box changes colour now and then.
      x.interval(() => {
        hex = U.pick(HEXES.filter((h) => h !== hex));
        if (unlocked >= 13) { evaluate(); x.sfx('boing'); }
      }, 22000);

      // ---- Kevin the goldfish ----
      let kevinOn = false, water = 100, alive = true, generation = 1, moved = false;
      const zone = $('#kevin-zone'), waterEl = $('#water'), meter = $('#water-meter'), status = $('#kevin-status'), bowl = $('#bowl');
      const ROMAN = ['', '', ' II', ' III', ' IV', ' V', ' VI', ' VII', ' VIII', ' IX', ' X'];
      function startKevin() {
        if (kevinOn) return;
        kevinOn = true;
        zone.hidden = false;
        zone.classList.add('pop-in');
        x.sfx('splash');
      }
      function setWater() {
        waterEl.style.height = Math.max(4, water) + '%';
        meter.style.width = water + '%';
        meter.classList.toggle('low', water < 30);
        bowl.classList.toggle('dry', water < 30);
      }
      x.interval(() => {
        if (!kevinOn || !alive || done) return;
        const inside = count(pw.value, '🐟') >= 1;
        if (inside) moved = true;
        if (!moved) { status.textContent = '🧳 Kevin is waiting to move in. Add a 🐟 to your password.'; return; }
        water -= inside ? 0.25 : 1.0;
        status.textContent = !inside ? '⚠️ Kevin is OUT OF THE PASSWORD. He is flopping. Add a 🐟!' : water < 55 && !pw.value.includes('💧') ? '😰 Kevin is thirsty! Add 💧 to your password!' : '😊 Kevin is swimming happily.';
        if (water <= 0) killKevin(inside ? 'Kevin dried up.' : 'Kevin flopped out of the password.');
        setWater();
      }, 200);
      // Every few seconds Kevin drinks a drop of water from the password.
      x.interval(() => {
        if (!kevinOn || !alive || done) return;
        if (water < 55 && pw.value.includes('💧') && count(pw.value, '🐟') >= 1) {
          const idx = pw.value.indexOf('💧');
          const caret = pw.selectionStart;
          pw.value = pw.value.slice(0, idx) + pw.value.slice(idx + 2);
          if (document.activeElement === pw) { const c = caret > idx ? caret - 2 : caret; pw.setSelectionRange(c, c); }
          water = Math.min(100, water + 45);
          x.sfx('gulp');
          bowl.classList.remove('gulp'); void bowl.offsetWidth; bowl.classList.add('gulp');
          evaluate();
        }
      }, 2600);
      function killKevin(why) {
        alive = false;
        st.kevinDeaths++;
        bowl.classList.add('dead');
        x.sfx('sadTrombone');
        status.textContent = `💀 ${why}`;
        x.say(`KEVIN!!! 😭 ${why} Out of respect, your password has been deleted.`, { mood: 'panic', hold: 3500 });
        pw.value = '';
        evaluate();
        x.timeout(() => {
          generation++;
          water = 100;
          alive = true;
          moved = false;
          setWater();
          bowl.classList.remove('dead');
          $('#kevin-name').textContent = 'KEVIN' + (ROMAN[generation] || ` #${generation}`);
          x.sfx('splash');
          x.say(generation === 2 ? 'Meet Kevin II. He is legally a different fish. Tip: copy your password somewhere before typing.' : `Kevin${ROMAN[generation] || ' #' + generation} has arrived. He has heard stories.`);
        }, 3600);
      }

      x.on($('#btn-set'), 'click', async () => {
        done = true;
        x.sfx('ding');
        BB.confetti({ count: 80, emoji: ['🔐', '🐟'] });
        const ok = await x.script([
          ['Password saved successfully! ✅', { mood: 'love', hold: 1500 }],
          ['…oh no.', { mood: 'panic', hold: 1200 }],
          ['I forgot it. I am so sorry. I have a very small brain.', { mood: 'panic' }],
          "Don't worry! I've reset it to \"banana123\". Very secure. Kevin can come with you.",
        ]);
        if (ok !== false) x.next();
      });

      evaluate();
      x.say('Department of Passwords. Please create a nice, secure password. What could go wrong?');
    },
  };
})();
