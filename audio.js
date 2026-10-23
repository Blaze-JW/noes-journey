// audio.js — chiptune music and sound effects, all made in code with Web Audio.
(function () {
  "use strict";
  let ac = null, master, musicGain, sfxGain, ambGain, noiseBuf, brownBuf, pinkBuf;
  let muted = false;
  try { muted = localStorage.getItem("jonah.muted") === "1"; } catch (e) {}

  function init() {
    if (ac) { if (ac.state === "suspended") ac.resume(); return true; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ac = new AC();
    master = ac.createGain(); master.gain.value = muted ? 0 : 1; master.connect(ac.destination);
    musicGain = ac.createGain(); musicGain.gain.value = 0.2; musicGain.connect(master);
    sfxGain = ac.createGain(); sfxGain.gain.value = 0.5; sfxGain.connect(master);
    ambGain = ac.createGain(); ambGain.gain.value = 0; ambGain.connect(master);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    // softer noise colours for the sea and rain: brown rumbles like waves, pink hisses gently like rain
    const len = ac.sampleRate * 6;
    brownBuf = ac.createBuffer(1, len, ac.sampleRate); pinkBuf = ac.createBuffer(1, len, ac.sampleRate);
    const br = brownBuf.getChannelData(0), pk = pinkBuf.getChannelData(0);
    let last = 0, b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02; br[i] = last * 3.2;
      b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913;
      pk[i] = (b0 + b1 + b2 + w * 0.1848) * 0.18;
    }
    // fade the loop ends together so the 6-second loop never clicks
    for (let i = 0; i < 2000; i++) { const k = i / 2000; br[i] *= k; br[len - 1 - i] *= k; pk[i] *= k; pk[len - 1 - i] *= k; }
    return true;
  }

  function tone(f, dur, type = "square", vol = 0.25, when = 0, slide = null, dest) {
    if (!ac) return;
    const t = ac.currentTime + when, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || sfxGain); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, vol = 0.3, ftype = "lowpass", freq = 1000, when = 0, dest, q = 1) {
    if (!ac) return;
    const t = ac.currentTime + when, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noiseBuf; s.loop = true; f.type = ftype; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest || sfxGain); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }

  const SFX = {
    jump() { tone(280, 0.14, "square", 0.12, 0, 620); },
    swim() { tone(220, 0.18, "sine", 0.2, 0, 380); noise(0.15, 0.06, "bandpass", 900); },
    coin() { tone(988, 0.06, "square", 0.14); tone(1319, 0.14, "square", 0.14, 0.06); },
    blip() { tone(700, 0.03, "square", 0.05); },
    talk() { tone(520, 0.05, "triangle", 0.15); tone(660, 0.05, "triangle", 0.12, 0.05); },
    ok() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.12, "square", 0.13, i * 0.07)); },
    no() { tone(196, 0.28, "sawtooth", 0.12, 0, 130); },
    gate() { noise(0.9, 0.25, "lowpass", 260); [392, 523, 659, 784].forEach((f, i) => tone(f, 0.2, "triangle", 0.2, 0.3 + i * 0.08)); },
    scroll() { [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.1, "triangle", 0.18, i * 0.05)); },
    gem() { [659, 880, 1109, 1319, 1760].forEach((f, i) => tone(f, 0.14, "square", 0.1, i * 0.06)); },
    hurt() { tone(420, 0.25, "square", 0.16, 0, 110); },
    splash() { noise(0.7, 0.5, "bandpass", 700, 0, null, 0.6); noise(1.2, 0.2, "lowpass", 400, 0.1); },
    thunder() { noise(0.1, 0.35, "bandpass", 900, 0, null, 0.5); noise(2.4, 0.9, "lowpass", 220, 0.05); noise(1.8, 0.6, "lowpass", 110, 0.35); },
    rumble() { noise(1.5, 0.6, "lowpass", 90); },
    gulp() { tone(160, 0.7, "sine", 0.6, 0, 40); noise(0.6, 0.3, "lowpass", 300); },
    heart() { tone(62, 0.12, "sine", 0.9); tone(55, 0.14, "sine", 0.7, 0.2); },
    drum() { tone(95, 0.3, "sine", 0.8, 0, 38); noise(0.1, 0.25, "lowpass", 900); },
    bubble() { tone(420 + Math.random() * 200, 0.08, "sine", 0.12, 0, 900); },
    wave() { noise(1.6, 0.6, "lowpass", 500, 0, null, 0.5); noise(1.2, 0.25, "lowpass", 1400, 0.25, null, 0.5); },
    shout() { tone(330, 0.2, "sawtooth", 0.08, 0, 300); },
    light() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 1.6, "sine", 0.08, i * 0.12)); },
    crack() { noise(0.3, 0.6, "highpass", 1500); tone(90, 0.4, "square", 0.2, 0, 50); },
    step() { noise(0.04, 0.06, "lowpass", 600); },
    chomp() { tone(140, 0.12, "square", 0.25, 0, 60); noise(0.1, 0.3, "lowpass", 500); },
  };

  // ---------- Ambient beds ----------
  // Each bed is a few layers of soft noise. Waves come from slow volume swells, never from a sweeping
  // filter (that is what made the old sea whistle).
  const AMB = {
    // calm sea: deep rolling swell plus a gentle wash on top
    sea: [{ n: "brown", f: [["lowpass", 420]], v: 0.9, lfo: [0.11, 0.55] }, { n: "pink", f: [["lowpass", 1200], ["highpass", 200]], v: 0.22, lfo: [0.11, 0.85], lag: 1.4 }],
    // storm at sea: heavy rain, big crashing waves and a low rumble
    storm: [
      { n: "pink", f: [["highpass", 350], ["lowpass", 5200]], v: 0.55, lfo: [0.5, 0.12] },
      { n: "brown", f: [["lowpass", 520]], v: 1.1, lfo: [0.14, 0.6] },
      { n: "pink", f: [["lowpass", 1400], ["highpass", 250]], v: 0.3, lfo: [0.14, 0.9], lag: 1.6 },
      { n: "brown", f: [["lowpass", 110]], v: 0.7, lfo: [0.06, 0.4] },
    ],
    deep: [{ n: "brown", f: [["lowpass", 200]], v: 1, lfo: [0.05, 0.3] }],
    fish: [{ n: "brown", f: [["lowpass", 150]], v: 1, lfo: [0.22, 0.45] }],
    crowd: [{ n: "pink", f: [["bandpass", 700, 0.6]], v: 0.9, lfo: [0.3, 0.35] }],
    heat: [{ n: "pink", f: [["highpass", 2500], ["lowpass", 6000]], v: 0.35, lfo: [1.6, 0.4] }],
    wind: [{ n: "pink", f: [["lowpass", 650], ["highpass", 120]], v: 1, lfo: [0.18, 0.6] }],
  };
  AMB.rain = AMB.storm;
  let amb = null;
  function ambient(type, vol = 0.3) {
    if (!ac) return;
    if (amb) { const old = amb; old.g.gain.setTargetAtTime(0.0001, ac.currentTime, 0.4); setTimeout(() => old.nodes.forEach(n => { try { n.stop(); } catch (e) {} }), 1500); amb = null; }
    if (!type || !AMB[type]) return;
    const g = ac.createGain(); g.gain.value = 0.0001; g.gain.setTargetAtTime(vol, ac.currentTime, 0.6); g.connect(ambGain);
    const nodes = [];
    AMB[type].forEach(L => {
      const src = ac.createBufferSource(); src.buffer = L.n === "brown" ? brownBuf : pinkBuf; src.loop = true;
      let node = src;
      L.f.forEach(([ft, fq, q]) => { const f = ac.createBiquadFilter(); f.type = ft; f.frequency.value = fq; f.Q.value = q || 0.5; node.connect(f); node = f; });
      const lg = ac.createGain(); lg.gain.value = L.v; node.connect(lg); lg.connect(g);
      if (L.lfo) {
        // swell: volume rises and falls between (1 - depth) and 1 of the layer's level
        const [rate, depth] = L.lfo, o = ac.createOscillator(), og = ac.createGain();
        o.frequency.value = rate; og.gain.value = L.v * depth / 2; lg.gain.value = L.v * (1 - depth / 2);
        if (L.lag) { const dl = ac.createDelay(5); dl.delayTime.value = L.lag; o.connect(dl); dl.connect(og); } else o.connect(og);
        og.connect(lg.gain); o.start(); nodes.push(o);
      }
      src.start(0, Math.random() * 5); nodes.push(src);
    });
    ambGain.gain.value = 1;
    amb = { g, nodes, type };
  }

  // ---------- Music ----------
  const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function freq(n) {
    const m = /^([A-G])([#b]?)(-?\d)$/.exec(n);
    if (!m) return 0;
    let s = NOTE[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0);
    const midi = (parseInt(m[3], 10) + 1) * 12 + s;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }
  function parse(str) {
    const ev = new Map(); let step = 0;
    str.replace(/\|/g, " ").trim().split(/\s+/).forEach(tok => {
      const [n, l] = tok.split(":"); const len = l ? parseFloat(l) : 1;
      if (n !== ".") { if (!ev.has(step)) ev.set(step, []); ev.get(step).push({ n, len }); }
      step += len;
    });
    return { ev, len: step };
  }
  function arp(chords, pat) {
    const C = { C: ["C4", "E4", "G4"], G: ["G3", "B3", "D4"], F: ["F3", "A3", "C4"], Am: ["A3", "C4", "E4"], Dm: ["D4", "F4", "A4"], E: ["E3", "G#3", "B3"] };
    return chords.map(c => pat.map(i => C[c][i]).join(" ")).join(" ");
  }

  const SONGS = {
    title: { bpm: 100, tracks: [
      { w: "square", v: 0.07, n: "E5:2 D5 C5 G4:4 | A4:2 C5 D5 E5:4 | E5:2 D5 C5 A4:2 G4:2 | C5:8" },
      { w: "triangle", v: 0.22, n: "C3:4 G2:4 | F2:4 C3:4 | A2:4 F2:4 | G2:4 C3:4" },
    ] },
    home: { bpm: 96, tracks: [
      { w: "square", v: 0.06, n: "G4:2 B4 D5 E5:2 D5:2 | B4:2 A4 G4 A4:4 | G4:2 B4 D5 G5:2 E5:2 | D5:2 B4:2 A4:4 | E5:2 D5 B4 C5:2 B4:2 | A4:2 G4 A4 B4:4 | C5:2 B4 A4 G4:2 E4:2 | D4:2 F#4:2 G4:4" },
      { w: "triangle", v: 0.22, n: "G2:4 D3:4 | E2:4 D3:4 | G2:4 B2:4 | D3:4 D2:4 | C3:4 G2:4 | A2:4 D3:4 | C3:4 E3:4 | D3:4 G2:4" },
      { w: "drum", v: 0.12, n: "k . h . s . h ." },
    ] },
    night: { bpm: 72, tracks: [
      { w: "triangle", v: 0.14, n: "D5:4 C5:2 A4:2 | Bb4:4 A4:4 | G4:4 A4:2 F4:2 | E4:4 A4:4" },
      { w: "triangle", v: 0.18, n: "D3:8 | G2:8 | Bb2:8 | A2:8" },
    ] },
    road: { bpm: 124, tracks: [
      { w: "square", v: 0.06, n: "D5 . F#5 A5 . F#5 D5 . | E5 . G5 B5 . A5 G5 . | F#5 . A5 D6 . A5 F#5 . | E5 D5 C#5 E5 D5:3 ." },
      { w: "triangle", v: 0.22, n: "D3 . A2 . D3 . A2 . | G2 . D3 . G2 . D3 . | D3 . A2 . D3 . A2 . | A2 . E3 . D3 . A2 ." },
      { w: "drum", v: 0.14, n: "k h s h k k s h" },
    ] },
    sail: { bpm: 90, tracks: [
      { w: "triangle", v: 0.14, n: "A4:2 C5:2 E5:4 | D5:2 C5:2 B4:4 | A4:2 B4:2 C5:2 E5:2 | A4:8" },
      { w: "triangle", v: 0.2, n: "A2:4 E3:4 | G2:4 D3:4 | F2:4 C3:4 | E2:4 A2:4" },
    ] },
    storm: { bpm: 150, tracks: [
      { w: "square", v: 0.045, n: "D5 F5 A5 F5 D5 F5 A5 F5 | C5 E5 G5 E5 C5 E5 G5 E5 | Bb4 D5 F5 D5 Bb4 D5 F5 D5 | A4 C#5 E5 A5 E5 C#5 A4 ." },
      { w: "sawtooth", v: 0.05, n: "D2 D2 D3 D2 D2 D2 D3 D2 | C2 C2 C3 C2 C2 C2 C3 C2 | Bb1 Bb1 Bb2 Bb1 Bb1 Bb1 Bb2 Bb1 | A1 A1 A2 A1 A1 A1 A2 A1" },
      { w: "drum", v: 0.2, n: "k h s h k k s s" },
    ] },
    deep: { bpm: 70, tracks: [
      { w: "sine", v: 0.16, n: "A4:4 C5:4 | E5:6 D5:2 | C5:4 B4:4 | A4:8 | F4:4 A4:4 | C5:6 B4:2 | G#4:4 B4:4 | A4:8" },
      { w: "triangle", v: 0.2, n: "A2:8 | A2:8 | F2:8 | E2:8 | D2:8 | F2:8 | E2:8 | A2:8" },
    ] },
    fish: { bpm: 60, tracks: [
      { w: "sine", v: 0.12, n: ".:6 B4:2 .:6 G4:2 .:6 C5:2 .:4 B4:4" },
      { w: "triangle", v: 0.24, n: "E2:16 F2:8 E2:8" },
    ] },
    prayer: { bpm: 66, tracks: [
      { w: "triangle", v: 0.14, n: "C5:4 E5:4 | G5:6 F5:2 | E5:4 D5:4 | C5:8 | A4:4 C5:4 | F5:6 E5:2 | D5:4 G4:4 | C5:8" },
      { w: "sine", v: 0.18, n: "C3:8 | E3:8 | F3:8 | C3:8 | F3:8 | A2:8 | G2:8 | C3:8" },
    ] },
    trek: { bpm: 100, tracks: [
      { w: "square", v: 0.06, n: "A4:2 C#5 E5 D5:2 C#5:2 | B4:2 D5 E5 C#5:4 | A4:2 C#5 E5 F#5:2 E5:2 | D5 C#5 B4:2 A4:4" },
      { w: "triangle", v: 0.22, n: "A2:4 E3:4 | G2:4 A2:4 | A2:4 D3:4 | E3:4 A2:4" },
      { w: "drum", v: 0.1, n: "k . h . k s h ." },
    ] },
    city: { bpm: 112, tracks: [
      { w: "square", v: 0.06, n: "E4 F4 G#4 A4 B4:2 A4 G#4 | F4 G#4 A4 B4 C5:2 B4 A4 | G#4 A4 B4 C5 D5:2 C5 B4 | A4 G#4 F4 G#4 E4:4" },
      { w: "triangle", v: 0.22, n: "E2 . E2 B2 E2 . E2 B2 | F2 . F2 C3 F2 . F2 C3 | E2 . E2 B2 E2 . E2 B2 | D2 . D2 A2 E2 . E2 B2" },
      { w: "drum", v: 0.16, n: "k . s k k . s h" },
    ] },
    vision: { bpm: 80, tracks: [
      { w: "sawtooth", v: 0.035, n: "D4:6 Eb4:2 D4:6 C#4:2" },
      { w: "triangle", v: 0.26, n: "D2:8 D2:8 C#2:8 D2:8" },
      { w: "drum", v: 0.32, n: "k . . k s . k ." },
    ] },
    gourd: { bpm: 80, tracks: [
      { w: "triangle", v: 0.14, n: "A4:3 B4 C5:2 B4:2 | A4:2 G#4:2 A4:4 | E5:3 D5 C5:2 B4:2 | C5:2 B4:2 A4:4" },
      { w: "triangle", v: 0.2, n: "A2:8 | E2:8 | A2:8 | E2:4 A2:4" },
    ] },
    question: { bpm: 72, tracks: [
      { w: "sine", v: 0.12, n: "C5:8 | B4:8 | A4:8 | G4:8" },
      { w: "triangle", v: 0.16, n: "F2:8 | G2:8 | A2:8 | G2:8" },
    ] },
    white: { bpm: 60, tracks: [
      { w: "sine", v: 0.1, n: "E5:8 | D5:8 | C5:8 | D5:8" },
      { w: "sine", v: 0.1, n: "C4:8 | B3:8 | A3:8 | G3:8" },
    ] },
    ending: { bpm: 76, tracks: [
      { w: "triangle", v: 0.2, n: "C5:2 C5 D5 E5:2 E5:2 D5 C5 D5:2 E5:4 | C5:2 C5 D5 E5:2 G5:2 F5 E5 D5:2 C5:4 | A4:2 A4 C5 D5:2 D5:2 E5 D5 C5:2 A4:4 | G4:2 A4 C5 D5:2 E5:2 D5:2 C5:2 D5:4 | E5:2 G5:2 G5:2 E5:2 F5:2 A5:2 A5:4 | G5:2 E5:2 C5:2 E5:2 D5:2 C5 D5 E5:4 | E5:2 G5:2 G5:2 E5:2 F5:2 A5:2 C6:4 | B5:2 G5:2 A5:2 F5:2 D5:2 E5 D5 C5:4" },
      { w: "square", v: 0.025, n: arp(["C", "G", "C", "G", "Am", "F", "C", "G", "C", "F", "C", "G", "C", "F", "G", "C"], [0, 1, 2, 1, 0, 1, 2, 1]) },
      { w: "triangle", v: 0.2, n: "C3:8 G2:8 C3:8 G2:4 C3:4 A2:8 F2:8 C3:8 G2:8 C3:8 F2:8 C3:8 G2:8 C3:8 F2:8 G2:8 C3:8" },
      { w: "drum", v: 0.06, n: "k . h . s . h ." },
    ] },
  };
  SONGS.mash = Object.assign({}, SONGS.city, { bpm: 168 });

  let cur = null, timer = null;
  function playSong(name, opt = {}) {
    if (cur && cur.name === name && !opt.restart) return;
    stopSong();
    if (!name || !init()) return;
    const s = SONGS[name]; if (!s) return;
    const stepDur = 60 / (opt.bpm || s.bpm) / 2;
    const tracks = s.tracks.map(t => Object.assign({ w: t.w, v: t.v }, parse(t.n)));
    cur = { name, stepDur, tracks, start: ac.currentTime + 0.08, next: 0 };
    musicGain.gain.cancelScheduledValues(ac.currentTime);
    musicGain.gain.setValueAtTime(0.2, ac.currentTime);
    timer = setInterval(tick, 30); tick();
  }
  function tick() {
    if (!cur) return;
    const ahead = ac.currentTime + 0.2;
    while (cur.start + cur.next * cur.stepDur < ahead) {
      const when = cur.start + cur.next * cur.stepDur, delay = Math.max(0, when - ac.currentTime);
      cur.tracks.forEach(tr => {
        const local = cur.next % tr.len, evs = tr.ev.get(local);
        if (!evs) return;
        evs.forEach(e => {
          if (tr.w === "drum") {
            if (e.n === "k") tone(110, 0.16, "sine", tr.v * 4, delay, 40, musicGain);
            else if (e.n === "s") noise(0.12, tr.v * 1.6, "highpass", 1400, delay, musicGain);
            else if (e.n === "h") noise(0.03, tr.v, "highpass", 6000, delay, musicGain);
          } else {
            const f = freq(e.n); if (f) tone(f, e.len * cur.stepDur * 0.95, tr.w, tr.v, delay, null, musicGain);
          }
        });
      });
      cur.next++;
    }
  }
  function stopSong(fade) {
    if (timer) clearInterval(timer); timer = null;
    if (cur && ac && fade) { musicGain.gain.setTargetAtTime(0.0001, ac.currentTime, 0.3); }
    cur = null;
  }
  function songStep() { return cur && ac ? Math.max(0, (ac.currentTime - cur.start) / cur.stepDur) : 0; }

  function setMuted(m) {
    muted = m;
    try { localStorage.setItem("jonah.muted", m ? "1" : "0"); } catch (e) {}
    if (master) master.gain.setTargetAtTime(m ? 0 : 1, ac.currentTime, 0.05);
  }

  window.SND = {
    init, sfx: n => { if (SFX[n] && init()) SFX[n](); }, music: playSong, stop: stopSong, ambient,
    songStep, isMuted: () => muted, setMuted, songs: SONGS,
  };
})();
