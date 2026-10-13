/* Background music: a tiny step sequencer playing original chiptune-kazoo songs, synthesised live. */
(function () {
  const BB = window.BB;
  const NOTE = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
  const CHORD = { '': [0, 4, 7], m: [0, 3, 7], 7: [0, 4, 7, 10], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], dim: [0, 3, 6], sus4: [0, 5, 7] };
  const toMidi = (n) => {
    const m = /^([A-G][#b]?)(-?\d)$/.exec(n);
    return NOTE[m[1]] + (parseInt(m[2], 10) + 1) * 12;
  };
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const parseChord = (sym) => {
    const m = /^([A-G][#b]?)(.*)$/.exec(sym);
    return { root: NOTE[m[1]], iv: CHORD[m[2]] || CHORD[''] };
  };

  // Melody tokens are 8th notes: a note name, '-' to hold, '.' for rest.
  const SONGS = {
    lobby: {
      bpm: 128, style: 'oompah', lead: 'square', pivot: 76,
      chords: ['C', 'G', 'Am', 'F', 'C', 'F', 'G', 'C'],
      mel: [
        'C5 E5 G5 E5 C6 - G5 -', 'B4 D5 G5 D5 B5 - G5 -', 'A4 C5 E5 C5 A5 - E5 -', 'F5 E5 D5 C5 A4 - . .',
        'G5 G5 A5 G5 E5 - C5 -', 'F5 F5 G5 F5 D5 - A4 -', 'B4 C5 D5 E5 F5 G5 A5 B5', 'C6 - G5 - C5 - . .',
      ],
    },
    bossa: {
      bpm: 100, style: 'bossa', lead: 'flute', pivot: 76, swing: 0,
      chords: ['Fmaj7', 'Em7', 'Dm7', 'G7', 'Cmaj7', 'Am7', 'Dm7', 'G7'],
      mel: [
        'A5 - . G5 - . F5 -', 'E5 - . D5 - . . .', 'F5 - E5 - D5 - C5 -', 'B4 - . D5 - G5 - .',
        'E5 - . G5 - . B5 -', 'A5 - . E5 - . C5 -', 'D5 E5 F5 - A5 - G5 F5', 'E5 - - - D5 - . .',
      ],
    },
    tense: {
      bpm: 150, style: 'gallop', lead: 'square', pivot: 72,
      chords: ['Am', 'Am', 'F', 'E', 'Am', 'Dm', 'E', 'Am'],
      mel: [
        'A4 . A4 C5 E5 . D5 C5', 'B4 . B4 D5 E5 - . .', 'F5 . E5 D5 C5 . B4 A4', 'G#4 - B4 - E5 - . .',
        'A5 G5 F5 E5 D5 C5 B4 A4', 'D5 . F5 . A5 - F5 .', 'E5 D#5 E5 F5 E5 D5 B4 G#4', 'A4 - E4 - A4 - . .',
      ],
    },
    chase: {
      bpm: 172, style: 'gallop', lead: 'kazoo', pivot: 74,
      chords: ['F', 'C', 'C', 'F', 'Bb', 'F', 'C', 'F'],
      mel: [
        'C5 A4 C5 F5 A5 - F5 -', 'G5 E5 C5 E5 G5 - . .', 'G5 Bb5 A5 G5 E5 F5 G5 E5', 'F5 - C5 - F4 - . .',
        'D5 F5 Bb5 F5 D5 F5 Bb5 -', 'C5 F5 A5 F5 C5 F5 A5 -', 'G5 A5 Bb5 A5 G5 F5 E5 G5', 'F5 - A5 - F5 - . .',
      ],
    },
    robot: {
      bpm: 124, style: 'robot', lead: 'square', pivot: 76,
      chords: ['Em', 'C', 'G', 'D', 'Em', 'C', 'G', 'D'],
      mel: [
        'E5 . B4 . E5 G5 F#5 E5', 'G5 . E5 . C5 . E5 .', 'D5 . B4 . D5 G5 A5 B5', 'A5 - F#5 - D5 - . .',
        'B5 A5 G5 F#5 E5 . B4 .', 'C5 E5 G5 C6 B5 . G5 .', 'D5 G5 B5 D6 C6 B5 A5 G5', 'F#5 - A5 - D6 - . .',
      ],
    },
    disco: {
      bpm: 118, style: 'disco', lead: 'square', pivot: 74,
      chords: ['Am', 'Am', 'Dm', 'E7', 'Am', 'C', 'Dm', 'E7'],
      mel: [
        'A4 . A5 . G5 . E5 .', 'C5 D5 E5 . G5 . A5 .', 'F5 . D5 . F5 . A5 .', 'G#5 - E5 - B4 - . .',
        'A5 G5 A5 . E5 . C5 .', 'G5 F5 G5 . E5 . C5 .', 'F5 E5 D5 C5 B4 C5 D5 E5', 'E5 - G#5 - B5 - . .',
      ],
    },
    ceremony: {
      bpm: 112, style: 'march', lead: 'kazoo', pivot: 76,
      chords: ['C', 'F', 'C', 'G', 'C', 'F', 'G', 'C'],
      mel: [
        'G4 - C5 - E5 - G5 -', 'A5 - - A5 F5 - A5 -', 'G5 - E5 - C5 - E5 -', 'D5 - - - G4 - . .',
        'G4 - C5 - E5 - G5 -', 'C6 - - C6 A5 - F5 -', 'G5 - B5 - D6 - B5 -', 'C6 - - - - - . .',
      ],
    },
  };

  // Pre-parse songs into per-bar, per-16th-step event tables.
  for (const name in SONGS) {
    const s = SONGS[name];
    s.name = name;
    s._chords = s.chords.map(parseChord);
    s._mel = s.mel.map((bar) => {
      const toks = bar.trim().split(/\s+/);
      const steps = new Array(16).fill(null);
      toks.forEach((tok, i) => {
        if (tok === '-' || tok === '.') return;
        let len = 1;
        while (toks[i + len] === '-') len++;
        steps[i * 2] = { midi: toMidi(tok), len: len * 2 };
      });
      return steps;
    });
  }

  const M = (BB.music = { rate: 1, inverted: false, current: null, songs: SONGS });
  let cur = null, step = 0, nextTime = 0, timer = null, loop = 0, songGain = null;

  function out() { return songGain; }

  function envGain(c, t, peak, a, dur, rel) {
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.setTargetAtTime(peak * 0.7, t + a, 0.08);
    g.gain.setTargetAtTime(0, t + dur, rel);
    return g;
  }

  function lead(t, freq, dur, kind) {
    const c = BB.sound.ctx;
    if (kind === 'kazoo') {
      const o = c.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = freq;
      const lfo = c.createOscillator();
      lfo.frequency.value = 5.5;
      const lg = c.createGain();
      lg.gain.value = 14;
      lfo.connect(lg); lg.connect(o.detune);
      const bp = c.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 1150; bp.Q.value = 1.4;
      const g = envGain(c, t, 0.2, 0.02, dur, 0.05);
      o.connect(bp); bp.connect(g); g.connect(out());
      o.start(t); lfo.start(t); o.stop(t + dur + 0.4); lfo.stop(t + dur + 0.4);
    } else if (kind === 'flute') {
      const o = c.createOscillator();
      o.type = 'triangle';
      o.frequency.value = freq;
      const o2 = c.createOscillator();
      o2.type = 'sine';
      o2.frequency.value = freq * 2;
      const lfo = c.createOscillator();
      lfo.frequency.value = 5;
      const lg = c.createGain();
      lg.gain.value = 9;
      lfo.connect(lg); lg.connect(o.detune);
      const g2 = c.createGain(); g2.gain.value = 0.25;
      const g = envGain(c, t, 0.15, 0.04, dur, 0.08);
      o.connect(g); o2.connect(g2); g2.connect(g); g.connect(out());
      [o, o2, lfo].forEach((n) => { n.start(t); n.stop(t + dur + 0.5); });
    } else {
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 2600;
      const g = envGain(c, t, 0.05, 0.005, dur, 0.04);
      [-7, 7].forEach((d) => {
        const o = c.createOscillator();
        o.type = 'square';
        o.frequency.value = freq;
        o.detune.value = d;
        o.connect(lp);
        o.start(t); o.stop(t + dur + 0.3);
      });
      lp.connect(g); g.connect(out());
    }
  }

  function bass(t, midi, dur) {
    const c = BB.sound.ctx;
    const o = c.createOscillator();
    o.type = 'triangle';
    o.frequency.value = mtof(midi);
    const o2 = c.createOscillator();
    o2.type = 'square';
    o2.frequency.value = mtof(midi);
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 500;
    const g2 = c.createGain(); g2.gain.value = 0.35;
    const g = envGain(c, t, 0.26, 0.005, dur, 0.05);
    o.connect(g); o2.connect(lp); lp.connect(g2); g2.connect(g); g.connect(out());
    [o, o2].forEach((n) => { n.start(t); n.stop(t + dur + 0.3); });
  }

  function stab(t, ch, dur, gain = 0.03) {
    const c = BB.sound.ctx;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1500;
    const g = envGain(c, t, gain, 0.005, dur, 0.03);
    ch.iv.slice(0, 4).forEach((iv) => {
      const o = c.createOscillator();
      o.type = 'square';
      o.frequency.value = mtof(60 + ((ch.root + iv) % 12) + (ch.root + iv >= 12 ? 0 : 0));
      o.connect(lp);
      o.start(t); o.stop(t + dur + 0.2);
    });
    lp.connect(g); g.connect(out());
  }

  function arp(t, midi, dur) {
    const c = BB.sound.ctx;
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.value = mtof(midi);
    const g = envGain(c, t, 0.045, 0.003, dur, 0.03);
    o.connect(g); g.connect(out());
    o.start(t); o.stop(t + dur + 0.2);
  }

  function kick(t, gain = 0.55) {
    BB.sound.tone({ when: t, type: 'sine', freq: 160, freqEnd: 45, glide: 0.12, dur: 0.25, gain, out: out() });
  }
  function snare(t, gain = 0.18) {
    BB.sound.noise({ when: t, type: 'highpass', freq: 1300, dur: 0.14, gain, out: out() });
    BB.sound.tone({ when: t, type: 'triangle', freq: 190, freqEnd: 150, dur: 0.08, gain: gain * 0.8, out: out() });
  }
  function hat(t, open = false, gain = 0.05) {
    BB.sound.noise({ when: t, type: 'highpass', freq: 7500, dur: open ? 0.18 : 0.035, gain, out: out() });
  }
  function rim(t) {
    BB.sound.tone({ when: t, type: 'square', freq: 1700, dur: 0.025, gain: 0.04, out: out() });
  }

  const STYLES = {
    oompah(s, ch, t, sp) {
      if (s === 0) bass(t, 48 + ch.root, sp * 3);
      if (s === 8) bass(t, 48 + ((ch.root + 7) % 12), sp * 3);
      if (s === 4 || s === 12) stab(t, ch, sp * 1.5);
      if (s === 0 || s === 8) kick(t, 0.4);
      if (s === 4 || s === 12) snare(t, 0.1);
      if (s % 4 === 2) hat(t);
    },
    gallop(s, ch, t, sp) {
      if (s === 0 || s === 8) bass(t, 48 + ch.root, sp * 1.8);
      if (s === 4 || s === 12) bass(t, 48 + ((ch.root + 7) % 12), sp * 1.8);
      if (s % 4 === 2) stab(t, ch, sp * 0.9);
      if (s === 0 || s === 8) kick(t, 0.45);
      if (s === 4 || s === 12) snare(t, 0.14);
      if (s % 2 === 0) hat(t);
    },
    bossa(s, ch, t, sp) {
      if (s === 0) bass(t, 48 + ch.root, sp * 5);
      if (s === 6 || s === 8) bass(t, 48 + ((ch.root + 7) % 12), sp * 1.8);
      if (s === 14) bass(t, 48 + ch.root, sp * 1.8);
      if ([0, 3, 6, 10, 12].includes(s)) stab(t, ch, sp * 1.4, 0.022);
      if ([0, 3, 6, 10, 12].includes(s)) rim(t);
      if (s % 2 === 0) hat(t, false, 0.03);
      if (s === 0 || s === 8) kick(t, 0.3);
    },
    march(s, ch, t, sp) {
      if (s === 0 || s === 8) bass(t, 48 + ch.root, sp * 3);
      if (s === 4 || s === 12) bass(t, 48 + ((ch.root + 7) % 12), sp * 3);
      if (s === 4 || s === 12) stab(t, ch, sp * 2);
      if (s === 0 || s === 8) kick(t, 0.5);
      if (s === 4 || s === 12 || s === 14 || s === 15) snare(t, 0.12);
    },
    disco(s, ch, t, sp) {
      if (s % 2 === 0) bass(t, 36 + ch.root + (s % 4 === 2 ? 12 : 0), sp * 1.6);
      if (s % 4 === 2) stab(t, ch, sp * 1.2);
      if (s % 4 === 0) kick(t, 0.55);
      if (s % 4 === 2) hat(t, true, 0.05);
      if (s === 4 || s === 12) snare(t, 0.16);
    },
    robot(s, ch, t, sp) {
      const notes = [0, 7, 12, 7];
      if (s % 2 === 0) bass(t, 36 + ch.root + notes[(s / 2) % 4], sp * 1.5);
      if (s === 6 || s === 14) stab(t, ch, sp * 1.2);
      if (s === 0 || s === 8 || s === 10) kick(t, 0.5);
      if (s === 4 || s === 12) snare(t, 0.15);
      hat(t, false, s % 2 ? 0.02 : 0.045);
    },
  };

  function scheduleStep(st, t, sp) {
    const bars = cur._mel.length;
    const bar = Math.floor(st / 16) % bars;
    const s = st % 16;
    if (s === 0 && bar === 0 && st > 0) loop++;
    let tt = t;
    if (cur.swing && s % 4 === 2) tt += cur.swing * sp;
    const ch = cur._chords[bar];
    STYLES[cur.style](s, ch, tt, sp);
    const ev = cur._mel[bar][s];
    if (ev) {
      let m = ev.midi;
      if (M.inverted) m = 2 * cur.pivot - m;
      lead(tt, mtof(m), ev.len * sp * 0.92, cur.lead);
    }
    // Every other loop add a sparkly arpeggio so it isn't too repetitive.
    if (loop % 2 === 1 && s % 2 === 1) {
      const iv = ch.iv[((s - 1) / 2) % ch.iv.length];
      arp(tt, 72 + ch.root + iv, sp * 0.8);
    }
  }

  function tick() {
    const c = BB.sound.ctx;
    if (!c || !cur) return;
    if (nextTime < c.currentTime - 0.3) nextTime = c.currentTime + 0.05;
    const sp = 60 / (cur.bpm * M.rate) / 4;
    while (nextTime < c.currentTime + 0.15) {
      scheduleStep(step, nextTime, sp);
      nextTime += sp;
      step++;
    }
  }

  M.play = function (name) {
    const c = BB.sound.ensure();
    if (!c) return;
    if (cur && cur.name === name) return;
    const song = SONGS[name];
    if (!song) return;
    fadeOut();
    songGain = c.createGain();
    songGain.gain.value = 1;
    songGain.connect(BB.sound.musicBus);
    cur = song;
    M.current = name;
    step = 0;
    loop = 0;
    nextTime = c.currentTime + 0.12;
    if (!timer) timer = setInterval(tick, 25);
  };

  function fadeOut() {
    const c = BB.sound.ctx;
    if (songGain && c) {
      const old = songGain;
      old.gain.setTargetAtTime(0, c.currentTime, 0.12);
      setTimeout(() => old.disconnect(), 1500);
    }
    songGain = null;
  }

  M.stop = function () {
    fadeOut();
    cur = null;
    M.current = null;
  };
})();
