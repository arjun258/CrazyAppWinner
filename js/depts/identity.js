/* DEPT 01: Identity. Form 27-B/6: phone-number slider, birthday slot machine, sneaky checkboxes. */
(function () {
  const BB = window.BB, U = BB.util;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Smarch', 'Octember', 'Banuary'];
  const COUNTRIES = ['Bananaland 🍌', 'Ohio', 'The Moon', 'Inside a Wall', 'Atlantis (sunk)', 'Narnia', 'Pigeonia 🐦', 'The Shadow Realm', 'A Group Chat', 'Prefer not to exist'];

  const fmtPhone = (n) => {
    const s = String(n).padStart(10, '0');
    return `${s.slice(0, 3)}-${s.slice(3, 6)}-${s.slice(6)}`;
  };

  BB.depts.identity = {
    title: 'IDENTITY', short: 'Identity', icon: '🪪', music: 'bossa',
    render(el, x) {
      const st = x.state;
      el.innerHTML = `
      <div class="card tilt-r form-card">
        <div class="form-head"><h2>FORM 27-B/6</h2><span class="stamp-tag">OFFICIAL-ISH</span></div>
        <p class="lead">Proof of Being Someone. Fields marked with <b>*</b> are mandatory. All fields are marked with <b>*</b>.</p>

        <div class="field" data-f="name">
          <label for="f-name">Full Name *</label>
          <input id="f-name" autocomplete="off" spellcheck="false" placeholder="Type slowly. It's shy.">
          <div class="hint" id="name-hint">&nbsp;</div>
        </div>

        <div class="field" data-f="phone">
          <label for="f-phone">Phone Number *</label>
          <div class="phone-display" id="phone-display">000-000-0000</div>
          <input type="range" id="f-phone" min="0" max="9999999999" step="1" value="0" class="phone-slider">
          <div class="row wrap">
            <button class="btn btn-xs" id="ph-minus">−1</button>
            <button class="btn btn-xs" id="ph-plus">+1</button>
            <button class="btn btn-xs btn-cyan" id="ph-rand">🎲 Close enough</button>
          </div>
          <div class="hint">Accuracy: approximately 25,000,000 phone numbers per pixel. Good luck.</div>
        </div>

        <div class="field" data-f="birthday">
          <label>Date of Birth *</label>
          <div class="slots"><div class="reel" id="r-day">??</div><div class="reel" id="r-month">???</div><div class="reel" id="r-year">????</div></div>
          <button class="btn btn-sm btn-pink" id="btn-spin">🎰 SPIN FOR BIRTHDAY</button>
          <div class="hint" id="age-hint">Our records show you have not been born yet.</div>
        </div>

        <div class="field" data-f="country">
          <label for="f-country">Country of Residence *</label>
          <select id="f-country"></select>
          <div class="hint">For your convenience, the list re-shuffles every time you look at it.</div>
        </div>

        <div class="field" data-f="banana">
          <label>Are you a banana? *</label>
          <div class="radio-row">
            <label><input type="radio" name="isbanana" value="yes"> Yes 🍌</label>
            <label><input type="radio" name="isbanana" value="no"> No</label>
            <label><input type="radio" name="isbanana" value="pigeon"> I'd prefer to be a pigeon</label>
            <label><input type="radio" name="isbanana" value="complicated"> It's complicated</label>
          </div>
        </div>

        <div class="checks" data-f="terms">
          <label><input type="checkbox" id="c-terms" checked> I do <b>NOT</b> accept the terms and conditions</label>
          <label><input type="checkbox" id="c-spam" checked> <span id="spam-label">Send me 400 emails a day about bananas</span></label>
        </div>

        <ul class="errors" id="errors"></ul>
        <button class="btn btn-primary btn-big" id="btn-submit">SUBMIT FORM 27-B/6 ✉️</button>
      </div>`;

      const $ = (s) => el.querySelector(s);

      // --- name: letters get shuffled if you type too fast
      const nameIn = $('#f-name'), nameHint = $('#name-hint');
      let lastKey = 0;
      x.on(nameIn, 'input', (e) => {
        const now = Date.now();
        const fast = now - lastKey < 140;
        lastKey = now;
        x.sfx('key');
        if (fast && nameIn.value.length > 2 && e.inputType === 'insertText') {
          const a = nameIn.value.split('');
          const i = U.randInt(0, a.length - 2);
          [a[i], a[i + 1]] = [a[i + 1], a[i]];
          nameIn.value = a.join('');
          nameHint.textContent = '⚠️ Too fast! Two letters got scared and swapped places.';
          nameHint.classList.add('warn');
        } else {
          nameHint.classList.remove('warn');
          nameHint.textContent = nameIn.value ? `Your name in Pigeon: ${nameIn.value.split(/\s+/).map(() => 'Coo').join('-')}` : ' ';
        }
      });

      // --- phone slider
      const ph = $('#f-phone'), phD = $('#phone-display');
      const updPhone = () => { phD.textContent = fmtPhone(ph.value); };
      let lastTick = 0;
      x.on(ph, 'input', () => { updPhone(); if (Date.now() - lastTick > 60) { lastTick = Date.now(); x.sfx('tick'); } });
      x.on($('#ph-minus'), 'click', () => { ph.value = Math.max(0, +ph.value - 1); updPhone(); x.sfx('blip'); });
      x.on($('#ph-plus'), 'click', () => { ph.value = Math.min(9999999999, +ph.value + 1); updPhone(); x.sfx('blip'); });
      x.on($('#ph-rand'), 'click', () => {
        ph.value = U.randInt(1000000000, 9999999999);
        updPhone(); x.sfx('boing');
        x.say("Is that your number? It is now. Congratulations on your new number.");
      });

      // --- birthday slot machine
      let spun = false, spinning = false;
      x.on($('#btn-spin'), 'click', () => {
        if (spinning) return;
        spinning = true;
        const reels = [$('#r-day'), $('#r-month'), $('#r-year')];
        const finals = [U.randInt(1, 35), U.pick(MONTHS), U.randInt(1066, 3024)];
        reels.forEach((r, i) => {
          r.classList.add('spinning');
          const t = setInterval(() => {
            r.textContent = i === 0 ? U.randInt(1, 35) : i === 1 ? U.pick(MONTHS) : U.randInt(1000, 3999);
            x.sfx('tick');
          }, 70);
          x.timeout(() => {
            clearInterval(t);
            r.textContent = finals[i];
            r.classList.remove('spinning');
            x.sfx('blip');
            if (i === 2) {
              spinning = false;
              spun = true;
              x.sfx('ding');
              const age = new Date().getFullYear() - finals[2];
              st.birthday = `${finals[0]} ${finals[1]} ${finals[2]}`;
              st.age = age;
              $('#age-hint').textContent = age >= 0 ? `Age: ${age} years. You look great for ${age}!` : `You will be born in ${-age} years. Congratulations in advance! 🎂`;
              x.say(age > 120 ? `${age} years old?! You should be in a museum. A nice one.` : age < 0 ? 'A time traveller! We get those on Tuesdays.' : 'A perfectly normal birthday. Suspicious.');
            }
          }, 900 + i * 500);
          x.cleanup(() => clearInterval(t));
        });
      });

      // --- country: the list reshuffles on every focus
      const sel = $('#f-country');
      const fillCountries = () => {
        const v = sel.value;
        sel.innerHTML = '<option value="">— pick one —</option>' + U.shuffle(COUNTRIES).map((c) => `<option ${c === v ? 'selected' : ''}>${c}</option>`).join('');
      };
      fillCountries();
      x.on(sel, 'pointerdown', fillCountries);
      x.on(sel, 'change', () => {
        x.sfx('blip');
        if (sel.value.startsWith('Ohio')) x.say('Ohio. Of course. Everyone is from Ohio eventually.');
        if (sel.value.startsWith('The Shadow')) x.say('Ah, a neighbour! I live there on weekends.', { mood: 'love' });
      });

      el.querySelectorAll('input[name=isbanana]').forEach((r) => x.on(r, 'change', () => {
        x.sfx('blip');
        if (r.value === 'yes') x.say('…we need to talk after this. Privately.', { mood: 'panic' });
        if (r.value === 'pigeon') x.say('Excellent choice. Welcome to the flock. 🐦', { mood: 'love' });
      }));

      // --- the spam checkbox refuses to stay unchecked (for a while)
      const spam = $('#c-spam');
      let spamTries = 0;
      x.on(spam, 'change', () => {
        if (spam.checked) return;
        spamTries++;
        if (spamTries < 3) {
          x.timeout(() => { spam.checked = true; x.sfx('boing'); x.say(spamTries === 1 ? 'Whoops, it slipped. Happens to the best of us.' : 'It slipped again! Weird. Very weird.'); }, 700);
        } else {
          $('#spam-label').textContent = 'Send me 399 emails a day about bananas (we compromised)';
          x.say('Fine. 399 emails. Final offer.');
        }
      });

      // --- submit
      x.on($('#btn-submit'), 'click', () => {
        const errs = [];
        const bad = (f, msg) => { errs.push(msg); const fe = el.querySelector(`[data-f="${f}"]`); if (fe) U.shake(fe); };
        const name = nameIn.value.trim();
        if (name.length < 2) bad('name', 'Name is too short. Even "Gerald" has 6 letters.');
        else if (/\d/.test(name)) bad('name', 'Names with numbers are reserved for robots and passwords.');
        if (+ph.value === 0) bad('phone', '000-000-0000 is the Ministry\'s own phone number. Pick another.');
        if (!spun) bad('birthday', 'You have not been born yet. Please spin the birthday machine.');
        if (!sel.value) bad('country', 'Everyone lives somewhere. Even Gerald (a gutter).');
        const ban = el.querySelector('input[name=isbanana]:checked');
        if (!ban) bad('banana', 'Please answer the banana question honestly.');
        if ($('#c-terms').checked) bad('terms', 'You have indicated that you do NOT accept the terms. Read it again. Slowly. We believe in you.');

        const list = $('#errors');
        if (errs.length) {
          x.sfx('wrong');
          list.innerHTML = errs.map((e) => `<li>❌ ${e}</li>`).join('');
          x.say(errs.length > 3 ? `${errs.length} errors! A new Ministry record! 🏆` : 'Almost! A few teeny tiny errors.', { mood: 'panic' });
          return;
        }
        list.innerHTML = '';
        st.name = name;
        st.phone = fmtPhone(ph.value);
        st.country = sel.value;
        st.banana = ban.value;
        const card = el.querySelector('.form-card');
        card.appendChild(U.h('<div class="big-stamp">APPROVED</div>'));
        x.sfx('stamp');
        x.timeout(() => x.sfx('yay'), 300);
        x.say(`Welcome to the system, ${name}! You are now a number. Specifically: ${st.phone}.`, { mood: 'love' });
        x.timeout(() => x.next(), 2200);
      });

      x.script(['Department of Identity! Please tell us who you are.', 'Also, I recommend you read the checkboxes. Like, really read them.']);
    },
  };
})();
