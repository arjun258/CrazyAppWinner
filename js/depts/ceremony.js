/* DEPT 07: The Grand Banana Ceremony. You finally get your banana. Then Gerald eats it. */
(function () {
  const BB = window.BB, U = BB.util;

  BB.depts.ceremony = {
    title: 'THE GRAND CEREMONY', short: 'Banana!', icon: '🍌', music: 'ceremony', calm: true,
    render(el, x) {
      const st = x.state;
      const name = U.esc(st.name || 'Anonymous Human');
      el.innerHTML = `
      <div class="card ceremony-card">
        <div class="cert" id="cert">
          <div class="cert-inner">
            <div class="cert-top">THE BANANA BUREAU</div>
            <h2 class="cert-title">Certificate of Banana Ownership</h2>
            <p>This certifies that</p>
            <p class="cert-name">${name}</p>
            <p>age <b>${st.age || '???'}</b>, of <b>${U.esc(st.country || 'Somewhere')}</b>, reachable at <b>${st.phone || '000-000-0000'}</b>,<br>is the rightful and legal owner of</p>
            <p class="cert-big">ONE (1) BANANA 🍌</p>
            <div class="cert-foot"><span class="sig">Gerald</span><span class="seal">🏅</span><span class="sig">Kevin 🐟</span></div>
          </div>
          <div class="void-stamp" id="void">VOID</div>
        </div>
        <div class="banana-stage" id="bstage">
          <div class="spotlight"></div>
          <div class="stage-gerald" id="sg"><div class="sg-bubble" id="sg-bubble"><span></span></div><div class="gerald-holder" data-mood="normal">${BB.gerald.svg('big')}</div></div>
          <div class="pedestal-wrap">
            <div class="banana-bubble" id="ban-bubble"><span></span></div>
            <div class="the-banana" id="the-banana">${BB.art.banana(true, 'hero-banana')}</div>
            <div class="crumbs" id="crumbs"></div>
            <div class="pedestal">🏛️ YOUR BANANA</div>
          </div>
        </div>
        <div class="row center wrap" id="cer-actions"></div>
      </div>`;

      const $ = (s) => el.querySelector(s);
      const actions = $('#cer-actions'), sg = $('#sg'), holder = sg.querySelector('.gerald-holder');
      const banana = $('#the-banana');
      document.body.classList.add('ceremony-mode');
      x.cleanup(() => document.body.classList.remove('ceremony-mode'));
      BB.gerald.hide();

      const gSay = (t, mood = 'normal', hold = 1600) => {
        holder.dataset.mood = mood;
        const b = $('#sg-bubble');
        b.classList.add('show');
        holder.classList.add('talking');
        return BB.gerald.typeInto(b.querySelector('span'), BB.gerald.transform(t)).then(() => { holder.classList.remove('talking'); return x.sleep(hold); });
      };
      const bSay = (t, hold = 1200) => {
        const b = $('#ban-bubble');
        b.classList.add('show');
        return BB.gerald.typeInto(b.querySelector('span'), BB.gerald.transform(t), { voice: 'blip', speed: 28 }).then(() => x.sleep(hold));
      };
      const button = (label, cls = 'btn-primary') => new Promise((res) => {
        const b = U.h(`<button class="btn ${cls} btn-big pop-in">${label}</button>`);
        actions.appendChild(b);
        x.on(b, 'click', () => { actions.innerHTML = ''; x.sfx('blip'); res(); });
      });
      const choice = (a, b) => new Promise((res) => {
        actions.innerHTML = '';
        [a, b].forEach((l, i) => {
          const btn = U.h(`<button class="btn ${i ? 'btn-pink' : 'btn-cyan'} btn-big pop-in">${l}</button>`);
          actions.appendChild(btn);
          x.on(btn, 'click', () => { actions.innerHTML = ''; x.sfx('blip'); res(i); });
        });
      });
      const crumbs = (n) => {
        const c = $('#crumbs');
        for (let i = 0; i < n; i++) {
          const s = U.h(`<span>${U.pick(['🟡', '🟨', '✨', '💛'])}</span>`);
          s.style.setProperty('--dx', U.rand(-90, 90) + 'px');
          s.style.setProperty('--dy', U.rand(-120, -20) + 'px');
          c.appendChild(s);
          x.timeout(() => s.remove(), 1200);
        }
      };

      async function run() {
        x.sfx('fanfare');
        BB.confetti({ count: 220, emoji: ['🍌', '🎉', '🏅'] });
        await x.sleep(900);
        await bSay('Hi!! I am your banana! 🥹 I have waited my whole life for you.');
        await button('🤲 RECEIVE MY BANANA');
        // Gerald bursts in
        x.sfx('whoosh');
        sg.classList.add('enter');
        await x.sleep(700);
        await gSay('WAIT!!! Before you take it…', 'panic', 900);
        await gSay('…can I just look at it? For a second?', 'love', 900);
        await gSay("It's so… beautiful. 😍", 'love', 1000);
        const said = await choice('Sure, Gerald', 'Absolutely not');
        await gSay(said ? 'I heard "yes". Thank you!' : 'You are too kind!', 'love', 700);
        // Gerald moves to the banana and eats it.
        sg.classList.add('lean');
        await bSay('Uh… why is he so close…', 600);
        BB.music.stop();
        const bites = [30, 60, 100];
        const lines = ['wait—', 'WAIT—', 'aaaaaaa—'];
        for (let i = 0; i < bites.length; i++) {
          holder.dataset.mood = 'eat';
          sg.classList.remove('peck'); void sg.offsetWidth; sg.classList.add('peck');
          x.sfx('chomp');
          crumbs(10);
          banana.style.clipPath = `inset(0 0 0 ${bites[i]}%)`;
          U.shake(banana);
          if (i < 2) bSay(lines[i], 300);
          else $('#ban-bubble').classList.remove('show');
          await x.sleep(900);
        }
        banana.classList.add('eaten');
        holder.dataset.mood = 'normal';
        await x.sleep(500);
        x.sfx('burp');
        await x.sleep(1100);
        sg.classList.remove('lean');
        await gSay('…', 'normal', 1000);
        await gSay('Your banana has been successfully delivered.', 'normal', 900);
        await gSay('…to me. 🐦', 'love', 600);
        x.sfx('stamp');
        $('#void').classList.add('show');
        $('#cert').classList.add('voided');
        await x.sleep(400);
        x.sfx('sadTrombone');
        await x.sleep(2500);
        await gSay('Thank you for using the Banana Bureau! Please rate us 5 stars.', 'love', 900);
        BB.music.play('bossa');
        credits();
      }

      function credits() {
        const mins = Math.floor((Date.now() - st.startTime) / 60000), secs = Math.floor(((Date.now() - st.startTime) / 1000) % 60);
        const kevin = st.kevinDeaths ? `(deceased ×${st.kevinDeaths})` : '(survived, somehow)';
        const ov = U.h(`<div class="credits">
          <div class="credits-roll">
            <h1>THE BANANA BUREAU</h1><p class="sub">a Gerald production</p>
            <h3>Starring</h3>
            <p><span>Gerald</span><i>himself</i></p>
            <p><span>Kevin the Goldfish</span><i>${kevin}</i></p>
            <p><span>Duck Support</span><i>quack</i></p>
            <p><span>The Cookie</span><i>(eaten)</i></p>
            <p><span>The Banana</span><i>(eaten)</i></p>
            <p><span>${name}</span><i>barely</i></p>
            <h3>Statistics</h3>
            <p><span>Time wasted</span><i>${mins}m ${secs}s</i></p>
            <p><span>Times you clicked NO</span><i>${st.noClicks}</i></p>
            <p><span>Screams</span><i>${st.screams}</i></p>
            <p><span>Departments skipped</span><i>${st.skips}${st.skips ? ' (cheater)' : ''}</i></p>
            <p><span>Bananas received</span><i>0</i></p>
            <p><span>Bananas eaten by Gerald</span><i>${st.rounds + 1}</i></p>
            <h3>Special thanks</h3>
            <p class="c">The Ministry of Absolutely Necessary Paperwork<br>The kazoo player (fired)<br>The moon, for its phases</p>
            <p class="c big">No bananas were harmed in the making of this website.</p>
            <p class="c">Except one.</p>
            <p class="c">🍌</p>
          </div>
          <div class="credits-end" id="credits-end">
            <h2>Want another banana?</h2>
            <button class="btn btn-primary btn-mega" id="btn-again">🔁 GET ANOTHER BANANA</button>
            <p class="tiny">Warning: the second banana experience may be slightly different.</p>
          </div>
          <button class="btn btn-xs credits-skip" id="credits-skip">Skip credits ⏩</button>
        </div>`);
        document.body.appendChild(ov);
        x.cleanup(() => ov.remove());
        const end = ov.querySelector('#credits-end');
        const showEnd = () => { if (end.classList.contains('show')) return; end.classList.add('show'); ov.classList.add('ended'); startRunaway(); };
        x.timeout(showEnd, 21000);
        x.on(ov.querySelector('#credits-skip'), 'click', showEnd);

        function startRunaway() {
          const b = ov.querySelector('#btn-again');
          let tired = false, dx = 0, dy = 0;
          x.timeout(() => { tired = true; b.style.transform = ''; b.textContent = '😮‍💨 FINE. CLICK ME.'; x.sfx('slideDown'); }, 8000);
          x.on(document, 'pointermove', (e) => {
            if (tired) return;
            const r = b.getBoundingClientRect();
            const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
            const d = Math.hypot(e.clientX - cx, e.clientY - cy);
            if (d < 140) {
              dx = U.clamp(dx + ((cx - e.clientX) / d) * 90, -innerWidth / 2 + 160, innerWidth / 2 - 160);
              dy = U.clamp(dy + ((cy - e.clientY) / d) * 70, -innerHeight / 3, innerHeight / 3);
              b.style.transform = `translate(${dx}px, ${dy}px) rotate(${U.rand(-10, 10)}deg)`;
              x.sfx('boing');
            }
          });
          x.on(b, 'click', () => {
            x.sfx('slideUp');
            BB.app.restart();
          });
        }
      }

      run();
    },
  };
})();
