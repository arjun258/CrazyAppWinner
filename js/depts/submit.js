/* DEPT 05: Submission. The button runs away. Scream at it (or hold SPACE) to blow it into the mailbox. */
(function () {
  const BB = window.BB, U = BB.util;

  BB.depts.submit = {
    title: 'SUBMISSION', short: 'Submit', icon: '📮', music: 'chase', calm: true,
    render(el, x) {
      const st = x.state;
      el.innerHTML = `
      <div class="card tilt-r submit-card">
        <h2 class="headline">Just press <span class="rainbow">SUBMIT</span>. That's it.</h2>
        <p class="lead">One button. One click. What could possibly go wrong?</p>
        <div class="arena" id="arena">
          <div class="mailbox" id="mailbox"><span class="flag" id="flag"></span>📮<small>SUBMISSIONS</small></div>
          <button class="btn btn-primary run-btn" id="run-btn">SUBMIT</button>
        </div>
        <div class="loud-zone" id="loud-zone" hidden>
          <p class="lead">The button only respects <b>LOUD</b> people. Blow it into the mailbox!</p>
          <div class="row center wrap">
            <button class="btn btn-pink" id="btn-scream">🎤 SCREAM AT IT</button>
            <button class="btn btn-cyan" id="btn-hold">🤫 I'm in a library (hold me / hold SPACE)</button>
          </div>
          <div class="meter big-meter"><i id="loud-meter"></i></div>
          <div class="meter big-meter progress-meter"><i id="push-meter"></i></div>
          <p class="hint" id="loud-hint">Loudness ⬆️ · Progress to mailbox ⬇️</p>
        </div>
      </div>`;

      const $ = (s) => el.querySelector(s);
      const arena = $('#arena'), btn = $('#run-btn'), mailbox = $('#mailbox');
      let bx = 0, by = 0, dodges = 0, mode = 'flee', finished = false, decoys = 0, hinted = false;
      const W = () => arena.clientWidth, H = () => arena.clientHeight;

      const place = (nx, ny, anim = true) => {
        bx = U.clamp(nx, 4, W() - btn.offsetWidth - 4);
        by = U.clamp(ny, 4, H() - btn.offsetHeight - 4);
        btn.style.transition = anim ? 'left .18s ease-out, top .18s ease-out' : 'none';
        btn.style.left = bx + 'px';
        btn.style.top = by + 'px';
      };
      place(W() / 2 - 70, H() / 2 - 30, false);

      const TAUNTS = ['Nope!', 'Too slow!', 'Hehe', 'Not today!', 'Catch me!', 'Wheee!', '🏃💨', 'Missed!', 'lol'];
      function teleport(px, py) {
        let nx, ny, tries = 0;
        do { nx = U.rand(0, W() - btn.offsetWidth); ny = U.rand(0, H() - btn.offsetHeight); tries++; }
        while (Math.hypot(nx - px, ny - py) < 200 && tries < 20);
        btn.classList.add('poof');
        x.timeout(() => btn.classList.remove('poof'), 300);
        place(nx, ny, false);
        x.sfx('pop');
      }

      function dodge(px, py) {
        dodges++;
        const r = btn.getBoundingClientRect(), ar = arena.getBoundingClientRect();
        const cx = r.left + r.width / 2 - ar.left, cy = r.top + r.height / 2 - ar.top;
        let dx = cx - px, dy = cy - py;
        const d = Math.hypot(dx, dy) || 1;
        dx /= d; dy /= d;
        const ox = bx, oy = by;
        place(bx + dx * 130 + U.rand(-30, 30), by + dy * 130 + U.rand(-30, 30));
        if (Math.hypot(bx - ox, by - oy) < 40) teleport(px, py);
        if (dodges % 3 === 0) x.sfx('boing');
        if (dodges % 4 === 0) btn.textContent = U.pick(TAUNTS);
        else if (dodges % 4 === 1) btn.textContent = 'SUBMIT';
        if (dodges === 8) spawnDecoys();
        if (dodges === 16 && !hinted) offerLoud();
      }

      x.on(document, 'pointermove', (e) => {
        if (mode !== 'flee' || finished) return;
        const ar = arena.getBoundingClientRect();
        const px = e.clientX - ar.left, py = e.clientY - ar.top;
        if (px < -60 || py < -60 || px > ar.width + 60 || py > ar.height + 60) return;
        const r = btn.getBoundingClientRect();
        const cx = r.left + r.width / 2 - ar.left, cy = r.top + r.height / 2 - ar.top;
        if (Math.hypot(cx - px, cy - py) < 110) dodge(px, py);
      });
      // Touch users can't hover, so the button dodges taps most of the time.
      let dodgedTap = false;
      x.on(btn, 'pointerdown', (e) => {
        if (mode !== 'flee' || e.pointerType === 'mouse') return;
        if (Math.random() < 0.8) {
          dodgedTap = true;
          const ar = arena.getBoundingClientRect();
          dodge(e.clientX - ar.left, e.clientY - ar.top);
        }
      });
      x.on(btn, 'click', () => {
        if (dodgedTap) { dodgedTap = false; return; }
        if (finished || mode !== 'flee') return;
        x.say('WHAT?! You actually caught it! Nobody has EVER caught it! Fine. FINE.', { mood: 'panic' });
        win();
      });

      function spawnDecoys() {
        x.say('Uh oh, it called its friends.', { mood: 'panic' });
        for (let i = 0; i < 3; i++) {
          const dcy = U.h('<button class="btn btn-primary decoy">SUBMIT</button>');
          dcy.style.left = U.rand(10, W() - 140) + 'px';
          dcy.style.top = U.rand(10, H() - 60) + 'px';
          arena.appendChild(dcy);
          decoys++;
          x.on(dcy, 'click', () => {
            x.sfx('quack');
            dcy.textContent = '🦆';
            dcy.classList.add('decoy-duck');
            x.say(U.pick(['DECOY! It was a duck in disguise. 🦆', 'Another decoy! The ducks are in on it.', 'That was a duck wearing a button costume.']));
            x.timeout(() => dcy.remove(), 1600);
          });
        }
      }

      function offerLoud() {
        hinted = true;
        x.say('Okay. New approach. The button only respects LOUD people. Scroll down. 📢', { mood: 'panic' });
        $('#loud-zone').hidden = false;
        $('#loud-zone').classList.add('pop-in');
      }
      x.timeout(() => { if (!hinted && !finished) offerLoud(); }, 20000);

      // ---- the push towards the mailbox, shared by scream & hold modes
      let progress = 0, startX = 0, startY = 0;
      const pushMeter = $('#push-meter'), loudMeter = $('#loud-meter');
      function beginPush() {
        startX = bx; startY = by;
        btn.textContent = '😖 SUBMIT';
        btn.classList.add('pushed');
        el.querySelectorAll('.decoy').forEach((d) => d.remove());
      }
      function updatePush() {
        const mr = mailbox.offsetLeft + mailbox.offsetWidth / 2 - btn.offsetWidth / 2;
        const mt = mailbox.offsetTop + mailbox.offsetHeight / 2 - btn.offsetHeight / 2;
        const t = progress / 100;
        place(startX + (mr - startX) * t, startY + (mt - startY) * t + Math.sin(t * Math.PI * 6) * 8 * (1 - t), false);
        btn.style.transform = `rotate(${Math.sin(performance.now() / 60) * progress * 0.15}deg) scale(${1 - t * 0.4})`;
        pushMeter.style.width = progress + '%';
        if (progress >= 100) win();
      }

      const CHEERS = [[15, 'Keep going!'], [35, 'THE NEIGHBOURS CAN HEAR YOU. GOOD.'], [55, 'HALFWAY! I am sweating and I am a bird.'], [75, 'ALMOST! DO NOT STOP!'], [90, 'AAAAAAAAAAA']];
      let cheerIdx = 0;
      const cheer = () => {
        while (cheerIdx < CHEERS.length && progress >= CHEERS[cheerIdx][0]) {
          x.say(CHEERS[cheerIdx][1], { mood: 'panic', hold: 1500 });
          cheerIdx++;
        }
      };

      let stream = null;
      x.on($('#btn-scream'), 'click', async () => {
        if (mode !== 'flee' || finished) return;
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return holdMode('Your browser has no ears. Hold SPACE instead.');
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
        } catch (e) {
          return holdMode('Your microphone said no. Rude. Hold SPACE (or the button) instead.');
        }
        if (!x.alive) { stream.getTracks().forEach((t) => t.stop()); return; }
        mode = 'scream';
        st.screams++;
        beginPush();
        BB.sound.duckMusic(0.25);
        const c = BB.sound.ensure();
        const src = c.createMediaStreamSource(stream);
        const an = c.createAnalyser();
        an.fftSize = 1024;
        src.connect(an);
        const buf = new Float32Array(an.fftSize);
        x.say('NOW SCREAM! AS LOUD AS YOU CAN! AAAAAA!', { mood: 'panic' });
        x.loop((dt) => {
          if (finished) return false;
          an.getFloatTimeDomainData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
          const rms = Math.sqrt(sum / buf.length);
          loudMeter.style.width = Math.min(100, rms * 420) + '%';
          if (rms > 0.06) progress = Math.min(100, progress + (rms - 0.06) * dt * 260);
          else progress = Math.max(0, progress - dt * 6);
          cheer();
          updatePush();
        });
      });
      x.cleanup(() => { if (stream) stream.getTracks().forEach((t) => t.stop()); BB.sound.duckMusic(1); });

      let holding = false;
      function holdMode(msg) {
        if (finished) return;
        if (mode !== 'hold') {
          mode = 'hold';
          beginPush();
          x.say(msg || 'Library mode. Hold SPACE or hold the blue button for 10 seconds. Gerald will cheer quietly. (He will not.)');
          x.loop((dt) => {
            if (finished) return false;
            loudMeter.style.width = holding ? 60 + Math.random() * 40 + '%' : '0%';
            if (holding) progress = Math.min(100, progress + dt * 10);
            else progress = Math.max(0, progress - dt * 5);
            cheer();
            updatePush();
          });
        }
      }
      const holdBtn = $('#btn-hold');
      x.on(holdBtn, 'pointerdown', (e) => { e.preventDefault(); holdMode(); holding = true; holdBtn.classList.add('held'); });
      const release = () => { holding = false; holdBtn.classList.remove('held'); };
      x.on(holdBtn, 'pointerup', release);
      x.on(holdBtn, 'pointerleave', release);
      x.on(document, 'keydown', (e) => {
        if (e.code !== 'Space' || $('#loud-zone').hidden || e.target.closest('input,textarea')) return;
        e.preventDefault();
        if (mode === 'flee') holdMode();
        if (mode === 'hold') { holding = true; holdBtn.classList.add('held'); }
      });
      x.on(document, 'keyup', (e) => { if (e.code === 'Space') release(); });

      function win() {
        if (finished) return;
        finished = true;
        if (stream) { stream.getTracks().forEach((t) => t.stop()); BB.sound.duckMusic(1); }
        btn.style.transition = 'all .5s ease-in';
        btn.style.left = mailbox.offsetLeft + mailbox.offsetWidth / 2 - btn.offsetWidth / 2 + 'px';
        btn.style.top = mailbox.offsetTop + 'px';
        btn.style.transform = 'scale(.1) rotate(720deg)';
        btn.style.opacity = '0';
        x.sfx('slideDown');
        x.timeout(() => {
          $('#flag').classList.add('up');
          x.sfx('ding');
          BB.confetti({ count: 120, emoji: ['📮', '✉️'] });
          x.say('Your submission has been submitted! It will be processed in 3-5 business centuries.', { mood: 'love' });
        }, 550);
        x.timeout(() => x.next(), 3000);
      }

      x.script(['Department of Submission! Easiest department. Just one button.', 'Go on. Click it. 😇']);
    },
  };
})();
