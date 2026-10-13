/* Sound engine: every sound effect is synthesised live with the Web Audio API. */
(function () {
  const BB = window.BB;
  let ctx = null, master, sfxBus, musicBus, noiseBuf;

  const S = (BB.sound = {
    volume: 0.8,
    musicOn: true,
    musicLevel: 0.55,
    ensure() {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -12;
        comp.ratio.value = 4;
        master = ctx.createGain();
        master.gain.value = S.volume;
        master.connect(comp);
        comp.connect(ctx.destination);
        sfxBus = ctx.createGain();
        sfxBus.gain.value = 0.85;
        sfxBus.connect(master);
        musicBus = ctx.createGain();
        musicBus.gain.value = S.musicOn ? S.musicLevel : 0;
        musicBus.connect(master);
        noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const d = noiseBuf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    },
    get ctx() { return ctx; },
    get musicBus() { return musicBus; },
    get noiseBuf() { return noiseBuf; },
    now() { return ctx ? ctx.currentTime : 0; },
    setVolume(v) {
      S.volume = v;
      if (master) master.gain.setTargetAtTime(v, ctx.currentTime, 0.05);
    },
    setMusicOn(on) {
      S.musicOn = on;
      if (musicBus) musicBus.gain.setTargetAtTime(on ? S.musicLevel : 0, ctx.currentTime, 0.1);
    },
    duckMusic(amount) {
      if (musicBus && S.musicOn) musicBus.gain.setTargetAtTime(S.musicLevel * amount, ctx.currentTime, 0.2);
    },
    play(name, ...args) {
      try {
        if (!S.ensure() || !fx[name]) return;
        fx[name](...args);
      } catch (e) {
        console.warn('sound', name, e);
      }
    },
    tone,
    noise,
  });

  function tone(o) {
    const c = S.ensure();
    if (!c) return;
    const t = o.when || c.currentTime;
    const dur = o.dur || 0.2;
    const osc = c.createOscillator();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.freq, t);
    if (o.freqEnd) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.freqEnd), t + (o.glide || dur));
    if (o.detune) osc.detune.value = o.detune;
    const g = c.createGain();
    const peak = o.gain == null ? 0.3 : o.gain;
    const a = o.attack == null ? 0.005 : o.attack;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    if (o.vibrato) {
      const l = c.createOscillator();
      l.frequency.value = o.vibrato.rate;
      const lg = c.createGain();
      lg.gain.value = o.vibrato.depth;
      l.connect(lg);
      lg.connect(osc.frequency);
      l.start(t);
      l.stop(t + dur + 0.05);
    }
    let last = osc;
    if (o.filter) {
      const f = c.createBiquadFilter();
      f.type = o.filter.type || 'lowpass';
      f.frequency.value = o.filter.freq;
      f.Q.value = o.filter.q || 1;
      last.connect(f);
      last = f;
    }
    last.connect(g);
    g.connect(o.out || sfxBus);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  function noise(o) {
    const c = S.ensure();
    if (!c) return;
    const t = o.when || c.currentTime;
    const dur = o.dur || 0.1;
    const src = c.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const f = c.createBiquadFilter();
    f.type = o.type || 'bandpass';
    f.frequency.setValueAtTime(o.freq || 1000, t);
    if (o.freqEnd) f.frequency.exponentialRampToValueAtTime(o.freqEnd, t + dur);
    f.Q.value = o.q || 1;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.gain || 0.3, t + (o.attack || 0.003));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(o.out || sfxBus);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.05);
  }

  const now = () => S.now();

  function kazoo(freq, when, dur, gain = 0.16) {
    tone({ when, type: 'sawtooth', freq, dur, gain, attack: 0.02, filter: { type: 'bandpass', freq: 1100, q: 1.6 }, vibrato: { rate: 6, depth: freq * 0.012 } });
  }

  const fx = {
    boing() { tone({ type: 'sine', freq: 140, freqEnd: 520, glide: 0.25, dur: 0.5, gain: 0.35, vibrato: { rate: 22, depth: 40 } }); },
    pop() {
      tone({ type: 'sine', freq: 900, freqEnd: 200, dur: 0.08, gain: 0.3 });
      noise({ freq: 1500, dur: 0.05, gain: 0.15 });
    },
    honk() {
      [0, 7].forEach((d) => tone({ type: 'sawtooth', freq: 300 + d, freqEnd: 260, glide: 0.35, dur: 0.38, gain: 0.16, attack: 0.02, filter: { type: 'bandpass', freq: 900, q: 1.2 } }));
    },
    slideUp() { tone({ type: 'sine', freq: 380, freqEnd: 1500, dur: 0.45, gain: 0.2, attack: 0.03, vibrato: { rate: 7, depth: 20 } }); },
    slideDown() { tone({ type: 'sine', freq: 1400, freqEnd: 280, dur: 0.5, gain: 0.2, attack: 0.03, vibrato: { rate: 7, depth: 20 } }); },
    quack(p = 1) {
      const t = now();
      tone({ when: t, type: 'sawtooth', freq: 560 * p, freqEnd: 360 * p, dur: 0.14, gain: 0.22, attack: 0.01, filter: { type: 'bandpass', freq: 1300, q: 3 } });
      if (Math.random() < 0.6) tone({ when: t + 0.16, type: 'sawtooth', freq: 540 * p, freqEnd: 340 * p, dur: 0.16, gain: 0.2, attack: 0.01, filter: { type: 'bandpass', freq: 1250, q: 3 } });
    },
    chomp() {
      const t = now();
      for (let i = 0; i < 3; i++) {
        noise({ when: t + i * 0.13, type: 'lowpass', freq: 900, dur: 0.08, gain: 0.5 });
        tone({ when: t + i * 0.13, type: 'square', freq: 90, freqEnd: 60, dur: 0.06, gain: 0.1 });
      }
    },
    ding() {
      tone({ type: 'sine', freq: 1318, dur: 0.7, gain: 0.22 });
      tone({ type: 'sine', freq: 1976, dur: 0.5, gain: 0.1 });
    },
    buzz() {
      tone({ type: 'square', freq: 110, dur: 0.3, gain: 0.13, filter: { freq: 900 } });
      tone({ type: 'square', freq: 117, dur: 0.3, gain: 0.1, filter: { freq: 900 } });
    },
    blip() { tone({ type: 'square', freq: 880 + Math.random() * 300, dur: 0.04, gain: 0.06 }); },
    chirp() { tone({ type: 'sine', freq: 1700 + Math.random() * 900, freqEnd: 2500 + Math.random() * 700, dur: 0.05, gain: 0.05 }); },
    coo() {
      tone({ type: 'sine', freq: 420, freqEnd: 330, dur: 0.35, gain: 0.22, attack: 0.04, vibrato: { rate: 14, depth: 25 } });
      tone({ when: now() + 0.38, type: 'sine', freq: 400, freqEnd: 300, dur: 0.45, gain: 0.2, attack: 0.04, vibrato: { rate: 14, depth: 25 } });
    },
    splash() { noise({ type: 'lowpass', freq: 4000, freqEnd: 300, dur: 0.5, gain: 0.3 }); },
    gulp() {
      tone({ type: 'sine', freq: 300, freqEnd: 700, dur: 0.12, gain: 0.25 });
      tone({ when: now() + 0.15, type: 'sine', freq: 280, freqEnd: 650, dur: 0.12, gain: 0.2 });
    },
    whoosh() { noise({ type: 'bandpass', freq: 300, freqEnd: 2500, dur: 0.35, gain: 0.22, q: 2, attack: 0.08 }); },
    burp() { tone({ type: 'sawtooth', freq: 95, freqEnd: 60, dur: 0.8, gain: 0.3, attack: 0.03, filter: { freq: 500 }, vibrato: { rate: 28, depth: 12 } }); },
    peck() {
      tone({ type: 'sine', freq: 1200, freqEnd: 700, dur: 0.04, gain: 0.25 });
      noise({ type: 'highpass', freq: 3000, dur: 0.03, gain: 0.12 });
    },
    coin() {
      tone({ type: 'square', freq: 988, dur: 0.08, gain: 0.08 });
      tone({ when: now() + 0.08, type: 'square', freq: 1319, dur: 0.3, gain: 0.08 });
    },
    bonk() {
      tone({ type: 'triangle', freq: 220, freqEnd: 70, dur: 0.25, gain: 0.4 });
      noise({ type: 'lowpass', freq: 600, dur: 0.1, gain: 0.25 });
    },
    explode() {
      noise({ type: 'lowpass', freq: 1800, freqEnd: 80, dur: 1.1, gain: 0.7, attack: 0.005 });
      tone({ type: 'sine', freq: 120, freqEnd: 30, dur: 0.8, gain: 0.5 });
    },
    pump() { noise({ type: 'bandpass', freq: 500, freqEnd: 1800, dur: 0.25, gain: 0.2, q: 3, attack: 0.05 }); },
    hiss() { noise({ type: 'highpass', freq: 5000, dur: 0.25, gain: 0.04, attack: 0.05 }); },
    sadTrombone() {
      const notes = [392, 370, 349, 330];
      notes.forEach((f, i) => {
        const last = i === 3;
        tone({ when: now() + i * 0.5, type: 'sawtooth', freq: f, freqEnd: last ? f * 0.93 : undefined, glide: 1.3, dur: last ? 1.4 : 0.46, gain: 0.17, attack: 0.04, filter: { freq: 1100 }, vibrato: last ? { rate: 6, depth: 9 } : null });
      });
    },
    fanfare() {
      const t = now();
      [523, 659, 784, 1047].forEach((f, i) => kazoo(f, t + i * 0.13, i === 3 ? 0.7 : 0.12, 0.2));
    },
    tada() {
      const t = now();
      kazoo(784, t, 0.12, 0.2);
      kazoo(1047, t + 0.14, 0.6, 0.2);
      kazoo(1319, t + 0.14, 0.6, 0.12);
    },
    key() { noise({ type: 'highpass', freq: 2500, dur: 0.02, gain: 0.06 }); },
    stamp() {
      noise({ type: 'lowpass', freq: 400, dur: 0.15, gain: 0.7 });
      tone({ type: 'sine', freq: 90, freqEnd: 40, dur: 0.2, gain: 0.5 });
    },
    tick() { tone({ type: 'square', freq: 2200, dur: 0.015, gain: 0.04 }); },
    wrong() {
      tone({ type: 'square', freq: 300, dur: 0.15, gain: 0.08, filter: { freq: 1500 } });
      tone({ when: now() + 0.17, type: 'square', freq: 200, dur: 0.3, gain: 0.08, filter: { freq: 1500 } });
    },
    yay() {
      const t = now();
      [659, 784, 988, 1319].forEach((f, i) => tone({ when: t + i * 0.07, type: 'triangle', freq: f, dur: 0.2, gain: 0.15 }));
    },
  };
})();
