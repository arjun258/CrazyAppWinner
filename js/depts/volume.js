/* DEPT 03: Sound Regulations. Set the volume to exactly 42% with a bicycle pump or a catapult. */
(function () {
  const BB = window.BB, U = BB.util;
  const TARGET = 42;

  BB.depts.volume = {
    title: 'SOUND REGULATIONS', short: 'Volume', icon: '🔊', music: 'lobby',
    render(el, x) {
      el.innerHTML = `
      <div class="card tilt-r vol-card">
        <h2 class="headline">Set the volume to exactly <span class="target">${TARGET}%</span></h2>
        <p class="lead">By Ministry regulation 42-B, all websites must be listened to at exactly ${TARGET}% volume. For your safety, the volume has been reset to 0%.</p>
        <div class="vol-readout"><span class="vol-label">VOLUME</span><span class="vol-num" id="vol-num">0</span><span class="vol-pct">%</span></div>
        <div class="vol-machines">
          <div class="machine pump-zone">
            <h3>🚲 Option A: The Pump</h3>
            <div class="pump-scene">
              <div class="tyre-wrap"><div class="tyre" id="tyre"><div class="hub"></div></div><div class="burst-text" id="burst">POP!</div></div>
              <div class="hose"></div>
              <div class="pump">
                <div class="pump-handle" id="pump-handle"><div class="handle-bar"></div><div class="rod"></div></div>
                <div class="pump-body"><span>AIR</span></div>
                <div class="pump-foot"></div>
              </div>
            </div>
            <p class="hint">Drag the handle up ⬆️ and down ⬇️. The tyre leaks. Don't overdo it.</p>
          </div>
          <div class="machine cata-zone">
            <h3>🏹 Option B: The Catapult <small>(premium)</small></h3>
            <div class="ruler" id="ruler">${[0, 20, 40, 60, 80, 100].map((n) => `<span style="left:${n}%">${n}</span>`).join('')}<div class="ruler-mark" style="left:${TARGET}%"></div><div class="landed" id="landed"></div></div>
            <div class="cata-scene" id="cata-scene">
              <svg class="sling-svg" viewBox="0 0 300 160" preserveAspectRatio="none" aria-hidden="true">
                <path d="M210 160 L210 95 L185 45 M210 95 L235 45" stroke="#7a4a1e" stroke-width="12" fill="none" stroke-linecap="round"/>
                <line id="band1" x1="185" y1="45" x2="210" y2="60" stroke="#e63946" stroke-width="5"/>
                <line id="band2" x1="235" y1="45" x2="210" y2="60" stroke="#e63946" stroke-width="5"/>
              </svg>
              <div class="knob" id="knob">🔘</div>
            </div>
            <p class="hint">Pull the knob back ⬅️ and let go. Aim for ${TARGET}.</p>
          </div>
        </div>
        <div class="row center"><button class="btn btn-primary btn-big" id="btn-lock">🔒 LOCK IN VOLUME</button></div>
      </div>`;

      const $ = (s) => el.querySelector(s);
      let vol = 0, locked = false, bursting = false;
      const num = $('#vol-num'), tyre = $('#tyre');
      const prevVolume = BB.sound.volume;

      function setVol(v, silent) {
        vol = Math.round(U.clamp(v, 0, 999));
        num.textContent = vol;
        num.classList.toggle('perfect', vol === TARGET);
        num.classList.remove('bump'); void num.offsetWidth; num.classList.add('bump');
        tyre.style.setProperty('--inflate', 0.55 + Math.min(vol, 110) / 100 * 0.75);
        BB.sound.setVolume(Math.min(vol, 100) / 100 * 1.6);
        if (!silent && vol === TARGET) x.sfx('ding');
      }
      setVol(0, true);
      x.cleanup(() => { if (!locked) BB.sound.setVolume(prevVolume); });

      function burst() {
        bursting = true;
        x.sfx('explode');
        tyre.classList.add('burst');
        $('#burst').classList.add('show');
        U.shake();
        x.say(U.pick(['You popped the volume. That is a first. (It is not a first.)', 'BOOM. The volume exploded. The Ministry will invoice you.', 'Too much air! The tyre has gone to a better place.']), { mood: 'panic' });
        x.timeout(() => {
          tyre.classList.remove('burst');
          $('#burst').classList.remove('show');
          bursting = false;
          setVol(0, true);
          x.say('Here is a new tyre. Gently this time.');
        }, 1800);
      }

      // Slow leak.
      x.interval(() => {
        if (locked || bursting || vol <= 0) return;
        setVol(vol - 1, true);
        if (Math.random() < 0.3) x.sfx('hiss');
      }, 1500);

      // --- Pump: drag the handle down for a stroke
      const handle = $('#pump-handle');
      let dragging = false, startY = 0, baseY = 0, y = 0, phase = 'up';
      const MAXY = 90;
      x.on(handle, 'pointerdown', (e) => {
        if (locked) return;
        dragging = true;
        startY = e.clientY;
        baseY = y;
        handle.setPointerCapture(e.pointerId);
        e.preventDefault();
      });
      x.on(handle, 'pointermove', (e) => {
        if (!dragging) return;
        const flip = document.body.classList.contains('upside') ? -1 : 1;
        y = U.clamp(baseY + (e.clientY - startY) * flip, 0, MAXY);
        handle.style.transform = `translateY(${y}px)`;
        if (y > MAXY - 10 && phase === 'up') {
          phase = 'down';
          if (!bursting) {
            x.sfx('pump');
            const nv = vol + U.randInt(3, 8);
            if (nv > 100) { setVol(nv, true); burst(); } else setVol(nv);
          }
        } else if (y < 15 && phase === 'down') phase = 'up';
      });
      const endDrag = () => { dragging = false; };
      x.on(handle, 'pointerup', endDrag);
      x.on(handle, 'pointercancel', endDrag);

      // --- Catapult: pull the knob left and release
      const knob = $('#knob'), scene = $('#cata-scene'), ruler = $('#ruler'), landed = $('#landed');
      const b1 = $('#band1'), b2 = $('#band2');
      let pulling = false, px0 = 0, py0 = 0, pull = 0, pullY = 0, flying = false;
      const MAXPULL = 150;
      const setBands = () => {
        const W = scene.clientWidth, H = scene.clientHeight;
        const kx = (210 - pull * 300 / W), ky = 60 + pullY * 160 / H;
        [b1, b2].forEach((b) => { b.setAttribute('x2', kx); b.setAttribute('y2', ky); });
      };
      x.on(knob, 'pointerdown', (e) => {
        if (flying || locked) return;
        pulling = true;
        px0 = e.clientX; py0 = e.clientY;
        knob.setPointerCapture(e.pointerId);
        e.preventDefault();
      });
      x.on(knob, 'pointermove', (e) => {
        if (!pulling) return;
        pull = U.clamp(px0 - e.clientX, 0, MAXPULL);
        pullY = U.clamp(e.clientY - py0, -20, 40);
        knob.style.transform = `translate(${-pull}px, ${pullY}px)`;
        setBands();
      });
      x.on(knob, 'pointerup', () => {
        if (!pulling) return;
        pulling = false;
        if (pull < 8) { pull = 0; pullY = 0; knob.style.transform = ''; setBands(); return; }
        fire(pull / MAXPULL);
      });

      function fire(power) {
        flying = true;
        x.sfx('boing');
        const landing = Math.round(power * 105 + U.rand(-6, 6));
        const kr = knob.getBoundingClientRect(), rr = ruler.getBoundingClientRect();
        const fly = U.h('<div class="knob-fly">🔘</div>');
        document.body.appendChild(fly);
        const sx = kr.left, sy = kr.top;
        const ex = rr.left + (U.clamp(landing, -5, 115) / 100) * rr.width - kr.width / 2, ey = rr.top - kr.height / 2;
        const t0 = performance.now(), D = 800;
        pull = 0; pullY = 0; knob.style.transform = ''; knob.style.opacity = 0; setBands();
        x.loop((dt, now) => {
          const t = Math.min(1, (now - t0) / D);
          const xx = sx + (ex - sx) * t, yy = sy + (ey - sy) * t - Math.sin(t * Math.PI) * 160;
          fly.style.transform = `translate(${xx}px, ${yy}px) rotate(${t * 720}deg)`;
          if (t >= 1) {
            fly.remove();
            knob.style.opacity = 1;
            flying = false;
            if (landing > 100 || landing < 0) {
              x.sfx('honk');
              x.say(landing > 100 ? 'Out of bounds! The knob landed in Belgium. 🇧🇪' : 'The knob went backwards. Physics is broken.', { mood: 'panic' });
            } else {
              x.sfx('bonk');
              landed.style.left = landing + '%';
              landed.classList.add('show');
              setVol(landing);
              if (landing !== TARGET) x.say(`Landed on ${landing}. ${Math.abs(landing - TARGET) <= 3 ? 'SO close!' : 'Not even close.'}`);
            }
            return false;
          }
        });
        x.cleanup(() => fly.remove());
      }

      x.on($('#btn-lock'), 'click', () => {
        if (locked) return;
        if (vol === TARGET) {
          locked = true;
          x.sfx('tada');
          BB.confetti({ count: 100, emoji: ['🔊', '🎺'] });
          x.say('42%! Perfect! The Ministry Hearing Committee is delighted. 🎺', { mood: 'love' });
          x.timeout(() => x.next(), 2200);
          return;
        }
        x.sfx('wrong');
        U.shake($('.vol-readout'));
        const msg = vol === 41 ? '41 is illegal in this Ministry.' : vol === 43 ? '43?! That is a FELONY.' : vol < TARGET ? 'Too quiet. The banana will not hear its name being called.' : 'Too loud! You will wake up Kevin.';
        x.say(msg, { mood: 'panic' });
      });

      x.script(['Department of Sound Regulations! 🔊', `Please set the volume to EXACTLY ${TARGET}%. Not 41. Not 43. We will know.`]);
    },
  };
})();
