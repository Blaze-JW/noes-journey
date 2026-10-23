// art.js — Jonah's Journey. Every picture in the game is drawn here in code, pixel by pixel.
(function () {
  "use strict";
  const ART = (window.ART = {});
  const OL = "#1c1426";
  ART.OL = OL;

  function mk(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
  ART.mk = mk;
  function hex(c) {
    c = c.replace("#", "");
    if (c.length === 3) c = c.split("").map(s => s + s).join("");
    const n = parseInt(c, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function shade(c, a) {
    const [r, g, b] = hex(c);
    const f = v => Math.max(0, Math.min(255, Math.round(a < 0 ? v * (1 + a) : v + (255 - v) * a)));
    return "#" + [f(r), f(g), f(b)].map(v => v.toString(16).padStart(2, "0")).join("");
  }
  function mix(c1, c2, t) {
    const a = hex(c1), b = hex(c2);
    return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, "0")).join("");
  }
  ART.shade = shade; ART.mix = mix;

  // A dark 1px outline around every solid pixel gives the classic pixel-game look.
  function outline(c, col = OL) {
    const x = c.getContext("2d"), w = c.width, h = c.height;
    const d = x.getImageData(0, 0, w, h), s = new Uint8ClampedArray(d.data), [r, g, b] = hex(col);
    const op = (i, j) => i >= 0 && j >= 0 && i < w && j < h && s[(j * w + i) * 4 + 3] > 0;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const k = (j * w + i) * 4;
      if (s[k + 3]) continue;
      if (op(i - 1, j) || op(i + 1, j) || op(i, j - 1) || op(i, j + 1)) { d.data[k] = r; d.data[k + 1] = g; d.data[k + 2] = b; d.data[k + 3] = 255; }
    }
    x.putImageData(d, 0, 0);
    return c;
  }
  function painter(c, ox = 0, oy = 0) {
    const x = c.getContext("2d");
    return (a, b, w, h, col) => { if (!col) return; x.fillStyle = col; x.fillRect(a + ox, b + oy, w, h); };
  }

  // ---------- People (16x24, drawn facing right, 1px margin for the outline) ----------
  const charCache = new Map();
  ART.char = function (L, pose = "idle", frame = 0) {
    const key = L.id + "|" + pose + "|" + frame;
    if (charCache.has(key)) return charCache.get(key);
    const c = mk(18, 26), R = painter(c, 1, 1);
    const skin = L.skin, sk2 = shade(skin, -0.2), robe = L.robe, robe2 = L.robe2 || shade(robe, -0.22);
    const hair = L.hair || "#2b1a10", sandal = L.sandal || "#5a3a22", sl = L.sleeve || robe2;

    function head(dy) {
      R(6, 3 + dy, 5, 6, skin); R(11, 5 + dy, 1, 2, skin);
      if (!L.wrap && !L.veil && !L.helmet && !L.crown && !L.cap) { R(5, 1 + dy, 6, 2, hair); R(4, 2 + dy, 2, 5, hair); }
      if (pose === "sleep") R(8, 5 + dy, 2, 1, sk2); else R(9, 5 + dy, 1, 1, OL);
      if (L.mood === "angry") R(8, 4 + dy, 2, 1, OL);
      if (L.mood === "sad") { R(9, 3 + dy, 1, 1, hair); }
      if (L.beard) { R(6, 7 + dy, 5, 2, L.beard); R(7, 9 + dy, 4, 1, L.beard); if (L.longBeard) R(7, 10 + dy, 3, 2, L.beard); }
      else R(9, 7 + dy, 2, 1, sk2);
      if (L.wrap) { R(4, 1 + dy, 7, 3, L.wrap); R(3, 3 + dy, 2, 5, L.wrap); R(4, 3 + dy, 7, 1, shade(L.wrap, -0.25)); }
      if (L.veil) { R(4, 0 + dy, 7, 3, L.veil); R(3, 2 + dy, 3, 13, L.veil); R(5, 3 + dy, 1, 6, L.veil); }
      if (L.helmet) { R(7, 0 + dy, 2, 1, L.helmet); R(6, 1 + dy, 4, 1, L.helmet); R(5, 2 + dy, 6, 1, L.helmet); R(4, 3 + dy, 8, 1, shade(L.helmet, -0.35)); R(4, 4 + dy, 2, 4, hair); }
      if (L.crown) { R(5, 0 + dy, 6, 3, L.crown); R(5, 2 + dy, 6, 1, "#b0303a"); R(4, 3 + dy, 2, 5, hair); }
      if (L.cap) { R(5, 1 + dy, 6, 2, L.cap); R(3, 3 + dy, 9, 1, shade(L.cap, -0.3)); R(4, 4 + dy, 2, 3, hair); }
      if (L.band) R(5, 3 + dy, 6, 1, L.band);
    }

    if (pose === "sit") {
      R(9, 19, 5, 3, robe2); R(13, 20, 2, 3, skin); R(14, 23, 2, 1, sandal);
      R(4, 12, 7, 8, robe); R(4, 12, 2, 8, robe2); R(3, 18, 10, 4, robe);
      if (L.sash) R(4, 15, 7, 1, L.sash);
      R(9, 14, 2, 4, sl); R(10, 18, 2, 1, skin);
      head(4);
    } else if (pose === "kneel") {
      R(2, 20, 10, 3, robe); R(1, 23, 4, 1, sandal);
      R(4, 12, 7, 9, robe); R(4, 12, 2, 9, robe2);
      if (L.sash) R(4, 16, 7, 1, L.sash);
      R(9, 12, 3, 2, sl); R(11, 10, 2, 3, skin);
      head(4);
    } else if (pose === "write") {
      R(9, 19, 5, 3, robe2); R(13, 20, 2, 3, skin);
      R(4, 12, 7, 8, robe); R(4, 12, 2, 8, robe2); R(3, 18, 10, 4, robe);
      R(9, 13, 4, 2, sl); R(12, 14, 2, 2, skin); R(13, 12, 1, 3, "#3a2a1a");
      head(5);
    } else {
      const short = !!L.short, lt = short ? 16 : 19, ll = 23 - lt;
      if (pose === "jump") { R(5, lt - 1, 2, 3, sk2); R(10, lt - 2, 2, 3, skin); R(4, lt + 2, 3, 1, sandal); R(10, lt + 1, 3, 1, sandal); }
      else if (frame === 1) { R(4, lt, 2, ll, sk2); R(10, lt, 2, ll, skin); R(3, 23, 3, 1, sandal); R(10, 23, 3, 1, sandal); }
      else if (frame === 2) { R(6, lt, 2, ll, sk2); R(8, lt, 2, ll, skin); R(5, 23, 3, 1, sandal); R(8, 23, 3, 1, sandal); }
      else { R(5, lt, 2, ll, sk2); R(9, lt, 2, ll, skin); R(4, 23, 3, 1, sandal); R(9, 23, 3, 1, sandal); }
      const sk = pose === "jump" ? 4 : 5;
      if (short) { R(4, 9, 8, 6, robe); R(4, 14, 8, 3, robe); R(4, 9, 2, 8, robe2); }
      else { R(4, 9, 8, 7, robe); R(3, 15, 10, sk, robe); R(4, 9, 2, 7, robe2); R(3, 15, 2, sk, robe2); R(3, 14 + sk, 10, 1, robe2); }
      if (L.stripe) R(7, 9, 1, short ? 8 : 10, L.stripe);
      if (L.sash) R(4, 13, 8, 1, L.sash);
      if (L.spear) { R(13, 2, 1, 21, "#8a6a3a"); R(12, 0, 3, 2, "#c8c8d0"); }
      if (L.staff) R(13, 6, 1, 17, "#7a5230");
      if (pose === "jump" || pose === "shout") { R(10, 5, 2, 5, sl); R(10, 3, 2, 2, skin); }
      else if (frame === 1) { R(10, 10, 2, 4, sl); R(11, 14, 2, 2, skin); }
      else if (frame === 2) { R(7, 10, 2, 4, sl); R(6, 14, 2, 2, skin); }
      else { R(9, 10, 2, 5, sl); R(9, 15, 2, 2, skin); }
      if (L.shield) { R(1, 10, 4, 7, L.shield); R(2, 12, 2, 3, shade(L.shield, 0.3)); }
      head(0);
    }
    outline(c);
    charCache.set(key, c);
    return c;
  };

  // ---------- Faces (32x32) for the talk box and close-ups ----------
  const faceCache = new Map();
  ART.face = function (L, mood = "calm") {
    const key = L.id + "|" + mood;
    if (faceCache.has(key)) return faceCache.get(key);
    const c = mk(32, 32), R = painter(c);
    const skin = L.skin, sk2 = shade(skin, -0.18), hair = L.hair || "#2b1a10", robe = L.robe;
    R(4, 28, 24, 4, robe); R(10, 26, 12, 3, robe);
    R(9, 6, 14, 19, skin); R(8, 8, 16, 15, skin); R(10, 25, 12, 2, sk2);
    if (!L.wrap && !L.veil && !L.helmet && !L.crown && !L.cap) {
      if (L.old) { R(7, 7, 3, 9, hair); R(22, 7, 3, 9, hair); R(10, 5, 12, 2, hair); }
      else { R(8, 4, 16, 5, hair); R(7, 6, 3, 10, hair); R(22, 6, 3, 10, hair); }
    }
    R(6, 13, 2, 4, sk2); R(24, 13, 2, 4, sk2);
    const W = "#f4ecd8";
    if (mood === "happy" || mood === "smile") {
      R(11, 15, 1, 1, OL); R(12, 14, 2, 1, OL); R(14, 15, 1, 1, OL);
      R(17, 15, 1, 1, OL); R(18, 14, 2, 1, OL); R(20, 15, 1, 1, OL);
    } else if (mood === "scared") {
      R(11, 13, 4, 3, W); R(12, 14, 2, 1, OL); R(17, 13, 4, 3, W); R(18, 14, 2, 1, OL);
    } else if (mood === "sleep") {
      R(11, 15, 4, 1, OL); R(17, 15, 4, 1, OL);
    } else {
      R(11, 14, 4, 2, W); R(13, 14, 2, 2, OL); R(17, 14, 4, 2, W); R(19, 14, 2, 2, OL);
    }
    const br = L.beard || hair;
    if (mood === "angry") { R(11, 11, 2, 1, br); R(13, 12, 2, 1, br); R(17, 12, 2, 1, br); R(19, 11, 2, 1, br); }
    else if (mood === "sad" || mood === "scared") { R(11, 12, 2, 1, br); R(13, 11, 2, 1, br); R(17, 11, 2, 1, br); R(19, 12, 2, 1, br); }
    else { R(11, 12, 4, 1, br); R(17, 12, 4, 1, br); }
    R(15, 16, 2, 3, sk2);
    if (L.old) { R(11, 9, 10, 1, sk2); R(10, 17, 2, 1, sk2); R(20, 17, 2, 1, sk2); }
    if (L.beard) {
      R(9, 19, 14, 7, L.beard); R(8, 18, 2, 4, L.beard); R(22, 18, 2, 4, L.beard); R(11, 26, 10, L.longBeard ? 4 : 2, L.beard);
      if (L.longBeard) R(13, 30, 6, 2, L.beard);
      const lip = shade(skin, -0.35);
      if (mood === "happy" || mood === "smile") { R(12, 20, 1, 1, lip); R(13, 21, 6, 1, lip); R(19, 20, 1, 1, lip); R(13, 20, 6, 1, "#f4ecd8"); }
      else if (mood === "sad" || mood === "angry" || mood === "scared") { R(13, 21, 6, 1, lip); R(12, 22, 1, 1, lip); R(19, 22, 1, 1, lip); }
      else R(13, 21, 6, 1, lip);
    } else {
      const lip = shade(skin, -0.35);
      if (mood === "happy" || mood === "smile") { R(12, 20, 1, 1, lip); R(13, 21, 6, 1, lip); R(19, 20, 1, 1, lip); }
      else if (mood === "sad" || mood === "scared" || mood === "angry") { R(13, 21, 6, 1, lip); R(12, 22, 1, 1, lip); R(19, 22, 1, 1, lip); }
      else R(13, 21, 6, 1, lip);
    }
    if (L.wrap) { R(6, 3, 20, 7, L.wrap); R(6, 9, 20, 1, shade(L.wrap, -0.25)); R(5, 8, 3, 12, L.wrap); R(24, 8, 3, 12, L.wrap); }
    if (L.veil) { R(6, 2, 20, 7, L.veil); R(4, 7, 5, 22, L.veil); R(23, 7, 5, 22, L.veil); }
    if (L.helmet) { R(14, 0, 4, 2, L.helmet); R(11, 2, 10, 2, L.helmet); R(8, 4, 16, 4, L.helmet); R(7, 8, 18, 2, shade(L.helmet, -0.35)); }
    if (L.crown) { R(8, 1, 16, 8, L.crown); R(8, 7, 16, 2, "#b0303a"); R(10, 3, 2, 2, "#fff3a0"); R(20, 3, 2, 2, "#fff3a0"); }
    if (L.cap) { R(8, 4, 16, 5, L.cap); R(5, 9, 22, 2, shade(L.cap, -0.3)); }
    if (L.band) R(8, 8, 16, 2, L.band);
    outline(c);
    faceCache.set(key, c);
    return c;
  };

  // Jehovah is never drawn as a person: only light.
  ART.lightFace = function () {
    if (ART._lf) return ART._lf;
    const c = mk(32, 32), x = c.getContext("2d");
    const g = x.createRadialGradient(16, 16, 1, 16, 16, 16);
    g.addColorStop(0, "#fffbe6"); g.addColorStop(0.4, "#ffe58a"); g.addColorStop(1, "rgba(255,200,60,0)");
    x.fillStyle = g; x.fillRect(0, 0, 32, 32);
    x.fillStyle = "#fff6c8";
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; for (let r = 6; r < 15; r++) x.fillRect(Math.round(16 + Math.cos(a) * r), Math.round(16 + Math.sin(a) * r), 1, 1); }
    return (ART._lf = c);
  };

  // ---------- Small sprites ----------
  const spr = {};
  function sprite(name, w, h, frames, draw, ol = true) {
    spr[name] = [];
    for (let f = 0; f < frames; f++) { const c = mk(w + 2, h + 2), R = painter(c, 1, 1); draw(R, f); if (ol) outline(c); spr[name].push(c); }
  }
  ART.spr = (name, f = 0) => { const a = spr[name]; return a[f % a.length]; };

  sprite("coin", 8, 8, 4, (R, f) => {
    const w = [6, 4, 2, 4][f], x0 = (8 - w) / 2;
    R(x0, 1, w, 6, "#e8b53a"); R(x0 + (w > 2 ? 1 : 0), 0, Math.max(1, w - 2), 8, "#e8b53a");
    if (w > 2) R(x0 + 1, 2, 1, 3, "#fff1a8");
  });
  sprite("scroll", 12, 10, 2, (R, f) => {
    R(2, 1, 8, 8, "#f2e3bd"); R(0, 0, 3, 10, "#b8834a"); R(9, 0, 3, 10, "#b8834a");
    R(1, 0, 1, 10, "#d9a66a"); R(10, 0, 1, 10, "#d9a66a");
    R(4, 3, 4, 1, "#8a6a3a"); R(4, 5, 4, 1, "#8a6a3a"); R(4, 7, 3, 1, "#8a6a3a");
    if (f) R(5, 1, 1, 1, "#ffffff");
  });
  sprite("jelly", 12, 14, 2, (R, f) => {
    R(2, 0, 8, 2, "#e79bd8"); R(1, 2, 10, 4, "#e79bd8"); R(1, 5, 10, 1, "#c56fb8"); R(3, 1, 2, 2, "#ffd6f5");
    const t = f ? 1 : 0;
    for (let i = 0; i < 4; i++) R(2 + i * 2 + (i % 2 ? t : -t + 1), 6, 1, 6 + (i % 2), "#d78bd0");
  });
  sprite("crab", 14, 9, 2, (R, f) => {
    R(3, 3, 8, 4, "#d9573a"); R(4, 2, 6, 1, "#d9573a"); R(4, 1, 1, 2, "#d9573a"); R(9, 1, 1, 2, "#d9573a");
    R(4, 0, 1, 1, OL); R(9, 0, 1, 1, OL);
    R(0, 1 + f, 3, 3, "#e66a4a"); R(11, 1 + (1 - f), 3, 3, "#e66a4a");
    R(3, 7, 1, 2, "#b8432a"); R(6, 7, 1, 2, "#b8432a"); R(8, 7, 1, 2, "#b8432a"); R(10, 7, 1, 2, "#b8432a");
  });
  sprite("barrel", 14, 14, 4, (R, f) => {
    R(2, 0, 10, 14, "#9a6232"); R(0, 2, 14, 10, "#9a6232"); R(1, 1, 12, 12, "#9a6232");
    R(0, 3 + f % 2, 14, 1, "#5a3a1a"); R(0, 10 - f % 2, 14, 1, "#5a3a1a");
    R(4 + f, 1, 1, 12, "#b8783e"); R(9 - f, 1, 1, 12, "#7a4a22");
  });
  sprite("branch", 14, 6, 1, R => {
    R(0, 3, 14, 2, "#8a5a2b"); R(3, 1, 1, 2, "#8a5a2b"); R(9, 0, 1, 3, "#8a5a2b"); R(2, 0, 3, 1, "#6b9a3a"); R(8, 0, 1, 1, "#6b9a3a"); R(12, 2, 2, 1, "#6b9a3a");
  });
  sprite("sheep", 14, 11, 2, (R, f) => {
    R(2, 2, 10, 6, "#f0ece0"); R(1, 3, 12, 4, "#f0ece0"); R(11, 1, 3, 4, "#4a3a30"); R(12, 2, 1, 1, "#fff");
    R(3, 8, 1, 3, "#4a3a30"); R(9, 8, 1, 3, "#4a3a30"); R(5 + f, 8, 1, 3, "#4a3a30");
  });
  sprite("sheepSack", 14, 11, 2, (R, f) => {
    R(2, 2, 10, 6, "#f0ece0"); R(1, 3, 12, 4, "#f0ece0"); R(2, 2, 9, 5, "#7a6040"); R(3, 3, 1, 3, "#5e4a30"); R(7, 3, 1, 3, "#5e4a30");
    R(11, 1, 3, 4, "#4a3a30"); R(12, 2, 1, 1, "#fff");
    R(3, 8, 1, 3, "#4a3a30"); R(9, 8, 1, 3, "#4a3a30"); R(5 + f, 8, 1, 3, "#4a3a30");
  });
  sprite("worm", 9, 4, 2, (R, f) => {
    if (f) { R(0, 2, 2, 2, "#c9a35a"); R(2, 1, 3, 2, "#c9a35a"); R(5, 2, 4, 2, "#c9a35a"); }
    else { R(0, 2, 9, 2, "#c9a35a"); }
    R(7, 2, 1, 1, OL);
  });
  sprite("lamp", 10, 8, 2, (R, f) => {
    R(1, 4, 8, 4, "#b8743a"); R(0, 5, 2, 2, "#b8743a"); R(8, 3, 2, 2, "#b8743a"); R(3, 4, 4, 1, "#d79a5a");
    if (f) { R(8, 0, 2, 3, "#ffd34a"); R(9, 0, 1, 1, "#fff6b0"); }
  });
  sprite("bubble", 4, 4, 1, R => { R(1, 0, 2, 1, "#bfe8ff"); R(0, 1, 1, 2, "#bfe8ff"); R(3, 1, 1, 2, "#bfe8ff"); R(1, 3, 2, 1, "#bfe8ff"); R(1, 1, 1, 1, "#fff"); }, false);
  sprite("spot", 12, 12, 4, (R, f) => {
    const c = ["#ffe58a", "#fff3c0", "#ffe58a", "#e8c25a"][f];
    R(5, 0, 2, 12, c); R(0, 5, 12, 2, c); R(4, 4, 4, 4, "#fffbe6");
    if (f % 2) { R(2, 2, 1, 1, c); R(9, 2, 1, 1, c); R(2, 9, 1, 1, c); R(9, 9, 1, 1, c); }
  }, false);
  sprite("cow", 20, 13, 2, (R, f) => {
    R(2, 2, 14, 7, "#8a5a3a"); R(15, 0, 5, 6, "#8a5a3a"); R(19, 3, 1, 2, "#d9a0a0"); R(17, 1, 1, 1, OL);
    R(5, 3, 4, 3, "#f0e0d0"); R(3, 9, 2, 4, "#6a4028"); R(13, 9, 2, 4, "#6a4028"); R(7 + f, 9, 2, 4, "#6a4028");
  });

  // ---------- Tiles ----------
  const THEMES = {
    hills: { top: "#5aa33a", top2: "#3f7f2a", fill: "#8b5a2b", fill2: "#6e4420", dot: "#a8743c" },
    night: { top: "#2f5f3a", top2: "#234a2c", fill: "#4a3424", fill2: "#3a2618", dot: "#5a4030" },
    road: { top: "#b7a35a", top2: "#93803e", fill: "#a5784a", fill2: "#87603a", dot: "#c49a68" },
    port: { top: "#e6d29a", top2: "#c9b27a", fill: "#cfb27a", fill2: "#b0925a", dot: "#e8d8a8" },
    ship: { top: "#a0683a", top2: "#7a4a22", fill: "#7a4a22", fill2: "#5e3618", dot: "#b8783e", plank: true },
    hold: { top: "#6a4222", top2: "#4a2c14", fill: "#4a2c14", fill2: "#3a2010", dot: "#7a4a22", plank: true },
    deep: { top: "#4a5f7a", top2: "#3a4a62", fill: "#2e3a52", fill2: "#232c40", dot: "#5a7090" },
    fish: { top: "#d4687a", top2: "#b04a60", fill: "#9a3a50", fill2: "#7e2c42", dot: "#e48a9a", slime: true },
    trek: { top: "#b39a5a", top2: "#8f7a40", fill: "#9c7448", fill2: "#7e5a34", dot: "#bf9868" },
    city: { top: "#d8b47a", top2: "#b8925a", fill: "#c9a56b", fill2: "#a8844a", dot: "#e0c48e", brick: true },
    east: { top: "#e2c27a", top2: "#c6a45c", fill: "#d4ad66", fill2: "#b88f4a", dot: "#ecd09a" },
  };
  ART.THEMES = THEMES;
  const tileCache = new Map();
  ART.tile = function (theme, kind, v = 0) {
    const key = theme + kind + v;
    if (tileCache.has(key)) return tileCache.get(key);
    const T = THEMES[theme] || THEMES.hills, c = mk(16, 16), R = painter(c);
    const rnd = (() => { let s = (v + 1) * 9301 + kind.length * 49297; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); })();
    if (kind === "fill" || kind === "top") {
      if (T.plank) {
        R(0, 0, 16, 16, T.fill); R(0, 7, 16, 1, T.fill2); R(0, 15, 16, 1, T.fill2);
        R((v * 5) % 16, 0, 1, 7, T.fill2); R((v * 5 + 8) % 16, 8, 1, 7, T.fill2);
        R(2, 3, 1, 1, T.dot); R(12, 11, 1, 1, T.dot);
      } else if (T.brick) {
        R(0, 0, 16, 16, T.fill);
        for (let y = 0; y < 16; y += 4) { R(0, y + 3, 16, 1, T.fill2); const o = (y / 4) % 2 ? 4 : 0; for (let x = o; x < 16; x += 8) R(x, y, 1, 3, T.fill2); }
      } else {
        R(0, 0, 16, 16, T.fill);
        for (let i = 0; i < 6; i++) R(Math.floor(rnd() * 15), Math.floor(rnd() * 15), 2, 1, i % 2 ? T.dot : T.fill2);
      }
      if (kind === "top") {
        if (T.plank) { R(0, 0, 16, 2, T.top); R(0, 2, 16, 1, T.top2); }
        else if (T.slime) { R(0, 0, 16, 3, T.top); R(0, 3, 16, 1, T.top2); R(3 + v % 5, 3, 2, 3, T.top); R(11, 3, 1, 2, T.top); R(2, 0, 3, 1, "#f7b0bc"); }
        else { R(0, 0, 16, 4, T.top); R(0, 4, 16, 1, T.top2); for (let i = 0; i < 4; i++) R(Math.floor(rnd() * 15), 4, 1, 1 + Math.floor(rnd() * 2), T.top); R((v * 3) % 14, 0, 2, 1, shade(T.top, 0.25)); }
      }
      if (T.slime && kind === "fill") { R(4, 5, 3, 2, T.dot); R(10, 11, 2, 2, T.dot); }
    } else if (kind === "plat") {
      R(0, 0, 16, 5, theme === "fish" ? "#c45a6e" : "#a0683a"); R(0, 4, 16, 1, theme === "fish" ? "#8e3a4e" : "#6a4020");
      R(3, 1, 1, 1, "#d9a066"); R(12, 2, 1, 1, "#d9a066");
    } else if (kind === "block") {
      const b = theme === "fish" ? ["#b04a60", "#7e2c42"] : theme === "ship" || theme === "hold" ? ["#8a5a2b", "#5e3618"] : theme === "deep" ? ["#3a4a62", "#232c40"] : ["#b9a585", "#8c7a5c"];
      R(0, 0, 16, 16, b[0]); R(0, 0, 16, 1, shade(b[0], 0.25)); R(0, 7, 16, 1, b[1]); R(0, 15, 16, 1, b[1]); R(7, 0, 1, 7, b[1]); R(3, 8, 1, 7, b[1]); R(12, 8, 1, 7, b[1]);
    } else if (kind === "spike") {
      if (theme === "deep" || theme === "fish") {
        const col = theme === "fish" ? "#f2e6d0" : "#6c7f9a";
        for (let i = 0; i < 4; i++) { R(i * 4 + 1, 8, 3, 8, col); R(i * 4 + 2, 4, 1, 4, col); }
      } else {
        R(1, 8, 14, 8, "#3f6b2a"); R(3, 5, 10, 4, "#4f8a3a");
        for (let i = 0; i < 5; i++) R(1 + i * 3, 3 + (i % 2) * 2, 1, 3, "#c9c0a0");
        R(4, 9, 2, 2, "#b8302a"); R(10, 11, 2, 2, "#b8302a");
      }
    } else if (kind === "water") {
      R(0, 0, 16, 16, "rgba(40,110,170,.85)"); R(0, 0, 16, 2, "#9fd8ff"); R(v % 8, 1, 4, 1, "#ffffff");
    }
    tileCache.set(key, c);
    return c;
  };

  // ---------- Backgrounds ----------
  function grad(ctx, stops, h = 192) { const g = ctx.createLinearGradient(0, 0, 0, h); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); ctx.fillStyle = g; ctx.fillRect(0, 0, 320, h); }
  function hillLayer(ctx, camX, par, base, amp, freq, col, seed = 0) {
    ctx.fillStyle = col;
    const off = camX * par;
    for (let x = 0; x < 320; x += 2) {
      const wx = x + off;
      const y = base - Math.abs(Math.sin((wx + seed) * freq)) * amp - Math.sin((wx + seed * 3) * freq * 2.3) * amp * 0.3;
      ctx.fillRect(x, Math.round(y), 2, 192 - Math.round(y));
    }
  }
  function stars(ctx, t, n = 40, seed = 1) {
    for (let i = 0; i < n; i++) { const x = (i * 73 + seed * 31) % 320, y = (i * 37 + seed * 17) % 110; ctx.fillStyle = (Math.sin(t * 2 + i) > 0.6) ? "#ffffff" : "#b9c4ff"; ctx.fillRect(x, y, 1, 1); }
  }
  function clouds(ctx, camX, t, col = "rgba(255,255,255,.85)", y0 = 20) {
    ctx.fillStyle = col;
    for (let i = 0; i < 5; i++) {
      const x = ((i * 97 - camX * 0.08 - t * 4) % 420 + 420) % 420 - 60, y = y0 + (i * 23) % 40;
      ctx.fillRect(x, y, 34, 6); ctx.fillRect(x + 6, y - 4, 20, 5); ctx.fillRect(x + 14, y - 7, 10, 4);
    }
  }
  function sun(ctx, x, y, r, col) { ctx.fillStyle = col; for (let j = -r; j <= r; j++) { const w = Math.round(Math.sqrt(r * r - j * j)); ctx.fillRect(x - w, y + j, w * 2, 1); } }
  ART.sun = sun;

  function city(ctx, camX, par, base, col, t, lights) {
    const off = camX * par;
    ctx.fillStyle = col;
    for (let i = -1; i < 12; i++) {
      const wx = i * 40 - (off % 40);
      const k = Math.floor((i * 40 + off) / 40);
      const h = 18 + ((k * 37) % 5) * 6;
      ctx.fillRect(wx, base - h, 34, h + 60);
      if (k % 4 === 0) { // ziggurat
        ctx.fillRect(wx + 4, base - h - 10, 26, 10); ctx.fillRect(wx + 9, base - h - 18, 16, 8); ctx.fillRect(wx + 13, base - h - 24, 8, 6);
      }
      if (lights) { ctx.fillStyle = "#ffcf6a"; ctx.fillRect(wx + 8, base - h + 6, 2, 2); ctx.fillRect(wx + 22, base - h + 10, 2, 2); ctx.fillStyle = col; }
    }
    // battlements
    for (let x = -((off) % 8); x < 320; x += 8) ctx.fillRect(x, base - 4, 4, 4);
  }

  ART.bg = function (ctx, theme, camX, camY, t, v) {
    switch (theme) {
      case "hills": {
        if (v.night) {
          grad(ctx, ["#0d1430", "#1d2a5a", "#3a3f6e"]); stars(ctx, t, 50, 2); sun(ctx, 260, 30, 9, "#f4f0d0"); sun(ctx, 264, 28, 8, "#1d2a5a");
          hillLayer(ctx, camX, 0.15, 130, 22, 0.012, "#1f2c4a", 5); hillLayer(ctx, camX, 0.35, 150, 18, 0.02, "#1a3a33", 17);
        } else {
          grad(ctx, ["#7cc4f2", "#bfe6ff", "#f2f2d8"]); sun(ctx, 270, 34, 12, "#fff3a8"); clouds(ctx, camX, t);
          hillLayer(ctx, camX, 0.15, 128, 24, 0.012, "#8fb7c9", 5); hillLayer(ctx, camX, 0.35, 150, 20, 0.02, "#6fa35a", 17);
          // olive trees on the far hills
          ctx.fillStyle = "#4f7f3a";
          for (let i = 0; i < 8; i++) { const x = ((i * 53 - camX * 0.35) % 400 + 400) % 400 - 40; ctx.fillRect(x, 136, 8, 6); ctx.fillRect(x + 3, 142, 2, 5); }
        }
        break;
      }
      case "road": {
        grad(ctx, ["#8fd0f2", "#d8eef6", "#f6e8c8"]); sun(ctx, 60, 30, 12, "#fff3a8"); clouds(ctx, camX, t, "rgba(255,255,255,.8)", 26);
        // the Great Sea to the west comes into view as Jonah nears Joppa
        const sea = Math.min(1, Math.max(0, (camX - 700) / 600));
        if (sea > 0) { ctx.fillStyle = "#3d8ec2"; ctx.fillRect(0, 140 - sea * 22, 320, 60); ctx.fillStyle = "#9fd8ff"; for (let x = 0; x < 320; x += 12) ctx.fillRect((x + t * 6) % 320, 140 - sea * 22, 6, 1); }
        hillLayer(ctx, camX, 0.15, 132, 20, 0.014, "#c9b48a", 9); hillLayer(ctx, camX, 0.35, 152, 16, 0.022, "#a89060", 21);
        break;
      }
      case "ship": {
        const s = v.storm || 0;
        grad(ctx, [mix("#7cc4f2", "#14141f", s), mix("#cdeaff", "#262636", s), mix("#e8f4ff", "#3a3a48", s)]);
        if (s < 0.5) { sun(ctx, 250, 30, 11, "rgba(255,243,168," + (1 - s * 2) + ")"); clouds(ctx, camX, t); }
        else { ctx.fillStyle = "rgba(20,20,30,.8)"; for (let i = 0; i < 9; i++) { const x = ((i * 61 - t * 30) % 420 + 420) % 420 - 60; ctx.fillRect(x, 10 + (i * 13) % 30, 70, 14); } }
        if (v.flash > 0) { ctx.fillStyle = "rgba(255,255,255," + v.flash + ")"; ctx.fillRect(0, 0, 320, 192); }
        const amp = 2 + s * 12;
        for (let layer = 0; layer < 3; layer++) {
          ctx.fillStyle = [mix("#4aa0d6", "#1c2c3c", s), mix("#2f7fb8", "#16222e", s), mix("#1f5f94", "#0e1822", s)][layer];
          const base = 118 + layer * 18;
          for (let x = 0; x < 320; x += 2) {
            const y = base + Math.sin((x + camX * (0.2 + layer * 0.2)) * 0.05 + t * (1 + s * 3) + layer) * amp;
            ctx.fillRect(x, Math.round(y), 2, 192);
          }
        }
        break;
      }
      case "hold": {
        grad(ctx, ["#2a1a10", "#3a2414", "#2a1a10"]);
        ctx.fillStyle = "#4a2e18";
        for (let x = -((camX * 0.5) % 24); x < 320; x += 24) ctx.fillRect(x, 0, 3, 192);
        for (let y = 20; y < 192; y += 30) ctx.fillRect(0, y, 320, 2);
        break;
      }
      case "deep": {
        const d = Math.min(1, camX / 1400);
        grad(ctx, [mix("#2f8fb0", "#0a1a38", d), mix("#1d5f8a", "#060f24", d), mix("#0f3560", "#03081a", d)]);
        ctx.fillStyle = "rgba(200,240,255," + (0.12 * (1 - d)) + ")";
        for (let i = 0; i < 5; i++) { const x = ((i * 70 - camX * 0.1) % 380 + 380) % 380 - 30; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 14, 0); ctx.lineTo(x + 50, 192); ctx.lineTo(x + 30, 192); ctx.fill(); }
        hillLayer(ctx, camX, 0.2, 170, 40, 0.01, mix("#1c4a6a", "#081430", d), 3);
        ctx.fillStyle = "rgba(190,230,255,.5)";
        for (let i = 0; i < 20; i++) { const x = ((i * 47 - camX * 0.3) % 340 + 340) % 340, y = ((i * 89 - t * 12) % 200 + 200) % 200; ctx.fillRect(x, y, 1, 1); }
        break;
      }
      case "fish": {
        grad(ctx, ["#3a0c18", "#5a1626", "#3a0c18"]);
        const off = camX * 0.4;
        ctx.fillStyle = "#6e2236";
        for (let i = -1; i < 8; i++) {
          const x = i * 56 - (off % 56);
          for (let a = 0; a <= 20; a++) { const yy = 10 + Math.sin(a / 20 * Math.PI) * -6 + a * 0; ctx.fillRect(x + a * 2, Math.round(20 + Math.pow((a - 10) / 10, 2) * 60), 4, 4); }
        }
        ctx.fillStyle = "rgba(255,170,190,.25)";
        for (let i = 0; i < 12; i++) { const x = ((i * 53 - camX * 0.6) % 340 + 340) % 340, y = ((i * 31 + t * 20) % 200); ctx.fillRect(x, y, 1, 3); }
        break;
      }
      case "trek": {
        const dusk = v.dusk || 0;
        grad(ctx, [mix("#88c8ee", "#2a2050", dusk), mix("#d6ecf6", "#a0507a", dusk), mix("#f4e4c0", "#f0a060", dusk)]);
        if (dusk < 0.8) sun(ctx, 250, 30 + dusk * 100, 12, "#fff0a0"); else stars(ctx, t, 30, 4);
        hillLayer(ctx, camX, 0.1, 110, 40, 0.008, mix("#9aa6b8", "#3a3050", dusk), 11);
        hillLayer(ctx, camX, 0.25, 140, 24, 0.016, mix("#b49a70", "#4a3a40", dusk), 23);
        hillLayer(ctx, camX, 0.4, 160, 12, 0.03, mix("#9c8050", "#3a2a2a", dusk), 41);
        break;
      }
      case "city": {
        grad(ctx, ["#f2b46a", "#f8d8a0", "#fbe8c8"]); sun(ctx, 60, 40, 14, "#fff0b0");
        city(ctx, camX, 0.15, 120, "#c99a68", t, false); city(ctx, camX, 0.35, 140, "#a87a4a", t, false);
        break;
      }
      case "east": {
        const n = v.night || 0, heat = v.heat || 0;
        if (n > 0.5) { grad(ctx, ["#0d1430", "#24305a", "#3a3a5e"]); stars(ctx, t, 50, 6); }
        else if (v.dawn) { grad(ctx, ["#5a6aa0", "#f0a0a0", "#ffd8a0"]); }
        else { grad(ctx, [mix("#8cc8ee", "#f2d9a0", heat), mix("#e2f0f4", "#ffe8b0", heat), "#fff0c8"]); sun(ctx, 250, 30, 14 + heat * 6, heat > 0.3 ? "#fff8d0" : "#fff3a8"); }
        // Nineveh far to the west
        const cx = 40 - camX * 0.1;
        ctx.save(); ctx.translate(cx, 0); city(ctx, 0, 0, 128, n > 0.5 ? "#2a2a48" : "#c8a880", t, n > 0.5); ctx.restore();
        hillLayer(ctx, camX, 0.3, 150, 14, 0.02, n > 0.5 ? "#2a2a40" : "#d8b47a", 13);
        break;
      }
      default: grad(ctx, ["#7cc4f2", "#e8f4ff"]);
    }
  };

  // ---------- Decorations (drawn behind the tiles, at screen x,y = bottom-left on the ground) ----------
  function R2(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); }
  ART.R = R2;
  ART.decor = function (ctx, type, x, y, t, o = {}) {
    const R = (a, b, w, h, c) => R2(ctx, x + a, y + b, w, h, c);
    switch (type) {
      case "house": { // a flat-roofed Israelite house, bottom-left at (x,y)
        const w = o.w || 56, h = o.h || 44, wall = o.wall || "#d6b88a", dark = shade(wall, -0.25);
        R(0, -h, w, h, wall); R(0, -h, w, 2, dark); R(-3, -h - 4, w + 6, 5, "#8a6a42"); R(-3, -h - 4, w + 6, 1, "#a8865a");
        R(Math.floor(w / 2) - 6, -18, 12, 18, "#5a3a22"); R(Math.floor(w / 2) - 5, -17, 10, 17, "#6e4a2c");
        R(6, -h + 10, 8, 7, "#3a2a1a"); R(w - 14, -h + 10, 8, 7, "#3a2a1a");
        if (o.ladder) { for (let i = 0; i < h; i += 5) R(w + 4, -i - 2, 8, 1, "#8a5a2b"); R(w + 4, -h - 2, 1, h + 2, "#8a5a2b"); R(w + 11, -h - 2, 1, h + 2, "#8a5a2b"); }
        if (o.lamp) R(Math.floor(w / 2) + 10, -h + 12, 2, 3, "#ffd34a");
        break;
      }
      case "palm": {
        for (let i = 0; i < 40; i += 4) R(Math.sin(i / 14) * 3, -i - 4, 4, 4, i % 8 ? "#8a6a3a" : "#6a4e2a");
        const tx = Math.sin(40 / 14) * 3;
        ctx.fillStyle = "#3f8a3a";
        for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * 0.7 + Math.sin(t + k) * 0.05; for (let r = 0; r < 18; r++) R(tx + 2 + Math.cos(a) * r, -44 + Math.sin(a) * r * 0.6 + r * r * 0.03, 3, 2, k % 2 ? "#3f8a3a" : "#4fa04a"); }
        break;
      }
      case "olive": {
        R(6, -16, 4, 16, "#6a4e2a"); R(3, -10, 3, 2, "#6a4e2a");
        R(-4, -30, 24, 12, "#6f9a5a"); R(0, -36, 16, 8, "#6f9a5a"); R(-2, -22, 20, 6, "#5a8448");
        R(2, -32, 2, 2, "#8fb878"); R(12, -26, 2, 2, "#8fb878");
        break;
      }
      case "well": {
        R(0, -12, 20, 12, "#a8a090"); R(0, -12, 20, 2, "#c8c0b0"); R(2, -10, 16, 1, "#7a7468");
        R(1, -30, 2, 18, "#6a4e2a"); R(17, -30, 2, 18, "#6a4e2a"); R(0, -31, 20, 2, "#6a4e2a"); R(9, -29, 1, 10, "#c8b080"); R(7, -20, 5, 4, "#8a5a2b");
        break;
      }
      case "stall": {
        const c1 = o.c1 || "#c8433a", c2 = o.c2 || "#f2e2c0";
        R(0, -30, 2, 30, "#6a4e2a"); R(36, -30, 2, 30, "#6a4e2a");
        for (let i = 0; i < 6; i++) R(-2 + i * 7, -34, 7, 8, i % 2 ? c1 : c2);
        R(0, -12, 38, 12, "#8a5a2b"); R(0, -12, 38, 2, "#a8743c");
        const g = o.goods || ["#e8b53a", "#d9573a", "#6fa35a"];
        g.forEach((c, i) => { R(4 + i * 11, -16, 8, 4, c); R(5 + i * 11, -18, 6, 2, c); });
        break;
      }
      case "sign": {
        R(7, -22, 2, 22, "#6a4e2a");
        const dir = o.dir || 1;
        R(dir > 0 ? 0 : -6, -22, 22, 8, "#a8743c"); R(dir > 0 ? 0 : -6, -22, 22, 1, "#c89a5a");
        if (dir > 0) { R(20, -20, 4, 4, "#a8743c"); } else { R(-8, -20, 4, 4, "#a8743c"); }
        if (o.dir2) { R(o.dir2 > 0 ? 0 : -6, -12, 22, 7, "#a8743c"); }
        break;
      }
      case "fence": { for (let i = 0; i < (o.w || 32); i += 6) R(i, -12, 2, 12, "#8a6a3a"); R(0, -10, o.w || 32, 2, "#8a6a3a"); R(0, -5, o.w || 32, 2, "#8a6a3a"); break; }
      case "bush": { R(0, -8, 16, 8, "#4f8a3a"); R(3, -12, 10, 5, "#5aa33a"); R(5, -10, 2, 2, "#8fd06a"); break; }
      case "rock": { R(0, -10, 20, 10, o.c || "#8a8478"); R(3, -14, 12, 5, o.c || "#8a8478"); R(4, -13, 4, 2, shade(o.c || "#8a8478", 0.3)); break; }
      case "boat": { // a ship tied up in the harbour (background prop)
        R(0, -10, 70, 10, "#6a4220"); R(4, -14, 62, 4, "#8a5a2b"); R(-4, -18, 8, 8, "#6a4220"); R(66, -20, 8, 10, "#6a4220");
        R(34, -70, 3, 56, "#5a3a1a"); R(14, -64, 42, 30, "#efe6d0"); R(14, -64, 42, 3, "#c8a878"); R(20, -50, 30, 2, "#c8433a");
        break;
      }
      case "mast": {
        R(0, -150, 4, 150, "#6a4220"); R(1, -150, 1, 150, "#8a5a2b");
        const sail = o.torn ? "#d8ccb0" : "#efe6d0";
        if (!o.furled) { R(-34, -140, 72, 44, sail); R(-34, -140, 72, 3, "#c8a878"); R(-30, -120, 64, 3, "#c8433a"); }
        else R(-34, -142, 72, 6, "#d8ccb0");
        R(-36, -144, 76, 3, "#5a3a1a");
        break;
      }
      case "rail": { const w = o.w || 64; R(0, -10, w, 2, "#7a4a22"); for (let i = 0; i < w; i += 8) R(i, -10, 2, 10, "#7a4a22"); break; }
      case "crates": { R(0, -12, 14, 12, "#a87a4a"); R(1, -11, 12, 1, "#c89a68"); R(0, -6, 14, 1, "#7a5230"); R(14, -10, 12, 10, "#9a6a3a"); R(4, -22, 12, 10, "#b88a58"); break; }
      case "hatch": { R(0, -3, 24, 3, "#4a2c14"); R(2, -2, 20, 1, "#2a1a10"); break; }
      case "ladder": { const h = o.h || 48; R(0, -h, 2, h, "#8a5a2b"); R(10, -h, 2, h, "#8a5a2b"); for (let i = 4; i < h; i += 6) R(0, -i, 12, 2, "#8a5a2b"); break; }
      case "lantern": { R(3, -o.h || -40, 1, 10, "#3a2a1a"); const sw = Math.sin(t * 2) * 2; R(1 + sw, -(o.h || 40) + 10, 6, 7, "#ffcf6a"); R(1 + sw, -(o.h || 40) + 10, 6, 1, "#3a2a1a"); break; }
      case "seaweed": {
        const h = o.h || 40, c = o.c || "#2f7a4a";
        for (let i = 0; i < h; i += 2) R(Math.sin(i * 0.15 + t * 2 + x * 0.1) * 3, -i - 2, 3, 2, c);
        break;
      }
      case "coral": { R(0, -10, 4, 10, "#e06a7a"); R(-4, -16, 4, 8, "#e06a7a"); R(4, -18, 4, 10, "#f08a8a"); R(8, -12, 4, 6, "#e06a7a"); break; }
      case "rib": { const h = o.h || 120; for (let i = 0; i < h; i += 3) R(Math.sin(i / h * Math.PI) * 10, -i, 6, 3, "#e0b8a8"); break; }
      case "drip": { const p = (t * 0.6 + (x % 7) * 0.13) % 1; R(0, -o.h || -100, 3, 4, "#d47a8e"); if (p < 0.8) R(1, -(o.h || 100) + 4 + p * (o.h || 100), 1, 3, "#f0a0b0"); break; }
      case "teethDecor": { for (let i = 0; i < 4; i++) R(i * 8, -12, 6, 12, "#f2e6d0"); break; }
      case "tent": { R(0, -2, 40, 2, "#5a3a1a"); ctx.fillStyle = "#c8a878"; ctx.beginPath(); ctx.moveTo(x, y - 2); ctx.lineTo(x + 20, y - 26); ctx.lineTo(x + 40, y - 2); ctx.fill(); R(17, -14, 6, 12, "#5a3a1a"); break; }
      case "fire": {
        R(0, -3, 16, 3, "#5a3a22"); R(2, -5, 12, 2, "#6a4a2a");
        const f = Math.floor(t * 8) % 3;
        R(5, -9 - f, 6, 6, "#e8742a"); R(6, -13 - f, 4, 5, "#f8b04a"); R(7, -15 - f, 2, 3, "#fff0a0");
        ctx.fillStyle = "rgba(255,180,80,.12)"; ctx.beginPath(); ctx.arc(x + 8, y - 8, 40, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case "river": { R(0, -2, o.w || 80, 18, "#3d8ec2"); for (let i = 0; i < (o.w || 80); i += 10) R(i + (t * 10) % 10, 0, 5, 1, "#9fd8ff"); break; }
      case "wall": { // Nineveh's great wall
        const w = o.w || 96, h = o.h || 110;
        R(0, -h, w, h, "#b8925a"); for (let yy = 6; yy < h; yy += 8) R(0, -h + yy, w, 1, "#9a7848");
        for (let i = 0; i < w; i += 10) R(i, -h - 6, 6, 6, "#b8925a");
        break;
      }
      case "gatehouse": {
        R(0, -120, 22, 120, "#a8844a"); R(74, -120, 22, 120, "#a8844a");
        for (let i = 0; i < 22; i += 8) { R(i, -126, 5, 6, "#a8844a"); R(74 + i, -126, 5, 6, "#a8844a"); }
        R(22, -100, 52, 20, "#b8925a"); R(22, -104, 52, 4, "#9a7848");
        R(28, -96, 6, 6, "#3a6ea5"); R(44, -96, 6, 6, "#e8b53a"); R(60, -96, 6, 6, "#3a6ea5");
        // winged bull guardians (lamassu), simple shapes
        [4, 78].forEach(bx => { R(bx, -40, 14, 16, "#d8c8a0"); R(bx + 2, -50, 8, 10, "#d8c8a0"); R(bx - 2, -36, 4, 10, "#c8b890"); });
        break;
      }
      case "ziggurat": { const c = o.c || "#c9a56b"; R(0, -20, 90, 20, c); R(10, -38, 70, 18, shade(c, -0.08)); R(22, -54, 46, 16, c); R(34, -66, 22, 12, shade(c, -0.08)); R(40, -54, 10, 54, shade(c, -0.18)); break; }
      case "palace": { R(0, -80, 120, 80, "#d8b47a"); for (let i = 0; i < 120; i += 12) R(i, -86, 7, 6, "#d8b47a"); R(46, -46, 28, 46, "#5a3a22"); R(44, -48, 32, 3, "#e8b53a"); R(10, -60, 10, 14, "#3a2a1a"); R(100, -60, 10, 14, "#3a2a1a"); break; }
      case "shelter": {
        R(0, -30, 3, 30, "#8a5a2b"); R(33, -30, 3, 30, "#8a5a2b"); R(-4, -34, 44, 5, "#a8743c");
        for (let i = -2; i < 40; i += 5) R(i, -36, 4, 2, "#6b9a3a");
        break;
      }
      case "gourd": { // the bottle-gourd plant growing over the shelter; o.g = growth 0..1, o.dead = withered
        const g = o.g == null ? 1 : o.g, dead = o.dead || 0;
        const leaf = dead ? mix("#4f9a3a", "#8a7a40", dead) : "#4f9a3a", leaf2 = dead ? mix("#6fbf4a", "#a08a50", dead) : "#6fbf4a";
        const hh = Math.round(36 * g);
        R(36, -hh, 3, hh, "#5a7a2a");
        if (g > 0.5) {
          const n = Math.floor((g - 0.5) * 2 * 9);
          for (let i = 0; i < n; i++) { const lx = 36 - i * 5, ly = -38 - (i % 2) * 3 + dead * (i % 3) * 3; R(lx - 4, ly, 9, 6, i % 2 ? leaf : leaf2); R(lx, ly + 6, 1, 2 + dead * 3, "#5a7a2a"); }
          if (g >= 1 && !dead) { R(6, -28, 5, 7, "#c8d870"); R(7, -30, 3, 2, "#c8d870"); }
        }
        break;
      }
      case "throne": { R(0, -26, 22, 26, "#e8b53a"); R(2, -24, 18, 14, "#b0303a"); R(-2, -10, 26, 4, "#c8952a"); break; }
      case "table": { R(0, -12, 30, 3, "#8a5a2b"); R(2, -9, 2, 9, "#6a4220"); R(26, -9, 2, 9, "#6a4220"); break; }
      case "flag": { R(0, -26, 2, 26, "#6a4e2a"); R(2, -26, 12, 8, o.on ? "#3a6ea5" : "#9a9a9a"); R(2, -22, 12, 1, o.on ? "#f2e2c0" : "#c0c0c0"); break; }
      default: break;
    }
  };
})();
