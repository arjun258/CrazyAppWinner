/* DEPT 00: The Lobby. Cookie consent with an actual cookie, and a big green NO. */
(function () {
  const BB = window.BB, U = BB.util;

  BB.depts.lobby = {
    title: 'THE LOBBY', short: 'Lobby', icon: '🏛️', music: 'lobby',
    render(el, x) {
      const st = x.state;
      el.innerHTML = `
      <div class="card tilt-l lobby-card">
        <h2 class="headline">Welcome to the <span class="rainbow">Ministry of Absolutely Necessary Paperwork</span></h2>
        <p class="lead">Your free banana 🍌 is waiting at the end of only <b>7</b> tiny, quick, painless formalities.<sup>*</sup></p>
        <p class="fineprint">*not tiny. not quick. extremely painful.</p>
        <div class="lobby-grid">
          <div class="cookie-zone">
            <div class="cookie" id="cookie">${'<span class="chip"></span>'.repeat(7)}</div>
            <div class="cookie-text">
              <h3>We use cookies 🍪</h3>
              <p>This cookie tracks how much you like cookies. It is also very hungry and slightly afraid of you.</p>
              <div class="row wrap">
                <button class="btn btn-sm" data-c="accept">Accept</button>
                <button class="btn btn-sm btn-pink" data-c="loud">ACCEPT LOUDLY</button>
                <button class="btn btn-sm btn-cyan" data-c="eat">Eat the cookie</button>
              </div>
            </div>
          </div>
          <div class="proceed-zone">
            <p class="instructions">To proceed to the Department of Identity, please press the big green button below.
            The Ministry kindly asks that you do <b>not</b> click <a href="#" class="sneaky" id="sneaky">here</a>, as that entrance is reserved for staff, pigeons, and people who read instructions.</p>
            <button class="btn btn-no" id="btn-no">NO</button>
            <button class="btn btn-broken" id="btn-fake"><s>NEXT</s> <small>(out of order since 1997)</small></button>
          </div>
        </div>
      </div>`;

      const cookie = el.querySelector('#cookie');
      let bites = 0, consent = false, noCount = 0;

      const bite = (n = 1) => {
        for (let i = 0; i < n && bites < 7; i++) {
          bites++;
          const a = U.rand(0, Math.PI * 2);
          const b = document.createElement('span');
          b.className = 'bite';
          b.style.left = 75 + Math.cos(a) * 72 - 32 + 'px';
          b.style.top = 75 + Math.sin(a) * 72 - 32 + 'px';
          cookie.appendChild(b);
        }
        x.sfx('chomp');
        cookie.classList.remove('jelly');
        void cookie.offsetWidth;
        cookie.classList.add('jelly');
        if (bites >= 7 && !cookie.classList.contains('gone')) {
          cookie.classList.add('gone');
          consent = true;
          x.say('The cookie has been fully consumed. Consent is… implied? Legally that is how it works.', { mood: 'panic' });
        }
      };
      let lastHoverBite = 0;
      x.on(cookie, 'pointerenter', () => {
        if (Date.now() - lastHoverBite > 900) { lastHoverBite = Date.now(); bite(1); }
      });
      x.on(cookie, 'click', () => bite(1));

      el.querySelectorAll('[data-c]').forEach((b) => x.on(b, 'click', () => {
        const c = b.dataset.c;
        consent = true;
        if (c === 'accept') { x.sfx('ding'); x.say('Wonderful. The cookie thanks you. It is crying a little.'); }
        if (c === 'loud') {
          x.sfx('honk'); U.shake(); BB.confetti({ count: 60, emoji: ['🍪'] });
          x.say('THE COOKIE HEARD YOU. EVERYONE HEARD YOU. THE MOON HEARD YOU.', { mood: 'panic' });
        }
        if (c === 'eat') { bite(3); x.say('You ate the consent form. Bold. I respect it.'); }
      }));

      const noBtn = el.querySelector('#btn-no');
      const NO_TEXT = ['NO', 'STILL NO', 'NOPE', 'NO (but bigger)', 'ABSOLUTELY NOT', 'NO NO NO', 'NEIN', 'NON', '🙅'];
      const NO_LINES = [
        'You clicked NO. I respect that.',
        'You clicked NO again. Bold strategy.',
        "Psst… I'm not allowed to say this, but maybe READ the tiny words? I'm saying it with my eyes. 👀",
        'The button will keep growing. That is just how buttons work.',
        "It's the word \"here\". In the paragraph. I did not tell you that. I'm a pigeon. I can't talk.",
      ];
      x.on(noBtn, 'click', () => {
        noCount++;
        st.noClicks++;
        x.sfx('honk');
        noBtn.textContent = NO_TEXT[noCount % NO_TEXT.length];
        noBtn.style.setProperty('--grow', Math.min(1 + noCount * 0.12, 1.8));
        U.shake(noBtn);
        x.say(NO_LINES[Math.min(noCount - 1, NO_LINES.length - 1)], { mood: noCount > 2 ? 'panic' : 'normal' });
      });
      x.on(el.querySelector('#btn-fake'), 'click', () => {
        x.sfx('buzz');
        x.say('That button has been out of order since 1997. We have a ticket open. The ticket is also out of order.');
      });
      x.on(el.querySelector('#sneaky'), 'click', (e) => {
        e.preventDefault();
        if (!consent) {
          x.sfx('wrong');
          cookie.classList.remove('jelly'); void cookie.offsetWidth; cookie.classList.add('jelly');
          x.say('Wait! The cookie needs your consent first. It has feelings. 🍪', { mood: 'panic' });
          return;
        }
        x.sfx('slideUp');
        x.say('You found the staff entrance! You are now honorary staff. Unpaid. Obviously.');
        x.next();
      });

      if (st.rounds > 0) {
        x.script([
          ["Welcome back! You want ANOTHER banana? After what happened?", { mood: 'panic' }],
          'Something feels different today. Is it my hair?',
          'Anyway. Same rules. Cookie first.',
        ]);
      } else {
        x.script([
          ["Hi!! I'm Gerald! 🐦 I run the Ministry.", { mood: 'love' }],
          'Well. I AM the Ministry. Also the janitor. And the security guard.',
          'Your banana is ready! Just a few formalities. Start by dealing with the cookie situation.',
        ]);
      }
    },
  };
})();
