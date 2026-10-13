/* DEPT 04: Not-Being-A-Robot. Lying bananas, an emotionally unstable duck, and a square that's thinking about you. */
(function () {
  const BB = window.BB, U = BB.util;
  const TRUTHS = ['I am a banana.', 'I am yellow-ish.', 'I contain potassium.', 'I am curved.', 'Gerald is a pigeon.', 'I grow in bunches.', 'Water is wet.', 'I have a peel.', 'I am a fruit.', 'Ducks say quack.'];
  const LIES = ['I am a cucumber.', '2 + 2 = 5.', 'I have never been yellow.', 'I can fly.', 'Gerald is very tall.', 'I am a licensed dentist.', 'I invented Wi-Fi.', 'I am a vegetable.', 'I have a driving licence.', 'Kevin owes me money.'];

  BB.depts.captcha = {
    title: 'NOT-BEING-A-ROBOT', short: 'Robot?', icon: '🤖', music: 'robot',
    render(el, x) {
      el.innerHTML = `
      <div class="card tilt-l captcha-card">
        <div class="captcha-head"><span class="cb-fake">☑️</span> <b>I'm not a robot</b> <span class="recaptchaa">reCAPTCHAAAA<br><small>Privacy - Bananas</small></span></div>
        <div class="captcha-steps" id="cap-steps"><span class="on">1</span><span>2</span><span>3</span></div>
        <div id="cap-stage"></div>
      </div>`;
      const stage = el.querySelector('#cap-stage');
      const steps = el.querySelectorAll('#cap-steps span');
      const setStep = (i) => steps.forEach((s, j) => { s.classList.toggle('on', j === i); s.classList.toggle('done', j < i); });

      // ---- Challenge 1: lying bananas
      function lyingBananas() {
        setStep(0);
        const nLies = U.randInt(3, 4);
        const items = U.shuffle([...U.shuffle(LIES).slice(0, nLies).map((t) => ({ t, lie: true })), ...U.shuffle(TRUTHS).slice(0, 9 - nLies).map((t) => ({ t, lie: false }))]);
        stage.innerHTML = `
          <div class="cap-prompt">Select all bananas that are <b>LYING</b>.</div>
          <div class="banana-grid">${items.map((it, i) => `<button class="banana-tile" data-i="${i}"><span class="say">“${it.t}”</span><span class="b-emoji">🍌</span><span class="tick">✔</span></button>`).join('')}</div>
          <div class="row center"><button class="btn btn-primary" id="cap-verify">VERIFY</button></div>`;
        stage.querySelectorAll('.banana-tile').forEach((b) => x.on(b, 'click', () => { b.classList.toggle('sel'); x.sfx('blip'); }));
        x.on(stage.querySelector('#cap-verify'), 'click', () => {
          const sel = [...stage.querySelectorAll('.banana-tile')].map((b) => b.classList.contains('sel'));
          const ok = items.every((it, i) => it.lie === sel[i]);
          if (ok) { x.sfx('ding'); x.say('Correct! Those bananas have been reported to the Fruit Police. 🚓'); duck(); }
          else {
            x.sfx('wrong');
            U.shake(stage);
            const hurt = items.some((it, i) => !it.lie && sel[i]);
            x.say(hurt ? 'One of those bananas was telling the truth. You hurt its feelings. New bananas!' : 'You missed a liar. They are everywhere. New bananas!', { mood: 'panic' });
            x.timeout(lyingBananas, 900);
          }
        });
      }

      // ---- Challenge 2: rotate the duck until it is emotionally upright
      function duck() {
        setStep(1);
        const target = U.randInt(2, 22) * 15;
        let angle = 0;
        stage.innerHTML = `
          <div class="cap-prompt">Rotate the duck until it is <b>emotionally upright</b>.</div>
          <div class="duck-arena"><div class="duck-spin" id="duck-spin">🦆</div></div>
          <div class="duck-mood" id="duck-mood"></div>
          <div class="row center wrap">
            <button class="btn btn-sm" id="rot-l">↺ 15°</button>
            <button class="btn btn-sm" id="rot-r">↻ 15°</button>
            <button class="btn btn-primary" id="duck-ok">THE DUCK IS AT PEACE</button>
          </div>`;
        const d = stage.querySelector('#duck-spin'), mood = stage.querySelector('#duck-mood');
        const dist = () => { const a = (((angle - target) % 360) + 360) % 360; return Math.min(a, 360 - a); };
        const upd = () => {
          d.style.transform = `rotate(${angle}deg)`;
          const k = dist();
          mood.textContent = k <= 8 ? '😌 Duck feels: emotionally upright. Inner peace achieved.' : k < 35 ? '🙂 Duck feels: almost centred' : k < 70 ? '😐 Duck feels: a bit uneasy' : k < 110 ? '😟 Duck feels: dizzy' : k < 150 ? '😰 Duck feels: anxious about taxes' : '😱 Duck feels: full existential crisis';
          mood.classList.toggle('calm', k <= 8);
        };
        upd();
        x.on(stage.querySelector('#rot-l'), 'click', () => { angle -= 15; upd(); x.sfx('quack', 1.2); });
        x.on(stage.querySelector('#rot-r'), 'click', () => { angle += 15; upd(); x.sfx('quack', 0.9); });
        // drag to rotate as well
        let drag = false;
        x.on(d, 'pointerdown', (e) => { drag = true; d.setPointerCapture(e.pointerId); e.preventDefault(); });
        x.on(d, 'pointermove', (e) => {
          if (!drag) return;
          const r = d.getBoundingClientRect();
          angle = Math.round((Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI + 90);
          upd();
        });
        x.on(d, 'pointerup', () => { drag = false; x.sfx('quack'); });
        x.on(stage.querySelector('#duck-ok'), 'click', () => {
          if (dist() <= 8) { x.sfx('ding'); x.say('The duck has found inner peace. More than I ever will.', { mood: 'love' }); thinking(); }
          else { x.sfx('honk'); U.shake(stage); x.say('That duck is clearly NOT at peace. Look at its face. Well. Read its face.', { mood: 'panic' }); }
        });
      }

      // ---- Challenge 3: click the square that is thinking about you
      function thinking() {
        setStep(2);
        let chosen = U.randInt(0, 8);
        stage.innerHTML = `
          <div class="cap-prompt">Click the square that is <b>thinking about you</b>.</div>
          <div class="eye-grid">${Array.from({ length: 9 }, (_, i) => `<button class="eye-tile" data-i="${i}"><span class="eye"><i></i></span><span class="eye"><i></i></span></button>`).join('')}</div>`;
        const tiles = [...stage.querySelectorAll('.eye-tile')];
        const randomLook = () => tiles.forEach((t, i) => {
          if (i === chosen) return;
          const a = U.rand(0, Math.PI * 2), k = U.rand(3, 9);
          t.querySelectorAll('i').forEach((p) => (p.style.transform = `translate(${Math.cos(a) * k}px, ${Math.sin(a) * k}px)`));
        });
        randomLook();
        x.interval(randomLook, 1100);
        x.on(document, 'pointermove', (e) => {
          tiles[chosen].querySelectorAll('.eye').forEach((eye) => {
            const r = eye.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
            const dd = Math.hypot(dx, dy) || 1, k = Math.min(9, dd / 12);
            eye.firstElementChild.style.transform = `translate(${(dx / dd) * k}px, ${(dy / dd) * k}px)`;
          });
        });
        tiles.forEach((t, i) => x.on(t, 'click', () => {
          if (i === chosen) {
            x.sfx('tada');
            t.classList.add('love');
            done();
          } else {
            x.sfx('wrong');
            x.say(U.pick(['That square was thinking about lunch.', 'That square was thinking about its ex.', 'That square was thinking about nothing. It is a square.']));
            chosen = U.randInt(0, 8);
          }
        }));
      }

      function done() {
        setStep(3);
        x.timeout(() => {
          stage.innerHTML = `<div class="cap-result"><div class="robot-score">73%</div><p>You are <b>73% not a robot</b>.<br>The passing grade is 70%. Congratulations, human(ish).</p><div class="row center"><button class="btn btn-primary btn-big" id="cap-next">CONTINUE (AS A HUMAN) 🧍</button></div></div>`;
          BB.confetti({ count: 80, emoji: ['🤖', '🧍'] });
          x.say('73%! A solid C-minus human. Welcome.');
          x.on(stage.querySelector('#cap-next'), 'click', () => x.next());
        }, 900);
      }

      lyingBananas();
      x.say('Department of Not-Being-A-Robot. Beep boop. I mean… hello, fellow human.');
    },
  };
})();
