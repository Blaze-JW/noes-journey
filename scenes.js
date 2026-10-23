// scenes.js — the cutscenes ("mini movies"), the title screen, the map and the ending song.
(function () {
  "use strict";
  const W = 320, H = 192;
  const D = window.JONAH_DATA, L = D.LOOKS, V = D.V;
  const R = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

  function sky(ctx, stops) { const g = ctx.createLinearGradient(0, 0, 0, H); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  function stars(ctx, t, n = 50) { for (let i = 0; i < n; i++) { ctx.fillStyle = Math.sin(t * 2 + i) > 0.5 ? "#fff" : "#9aa8e0"; ctx.fillRect((i * 73) % W, (i * 37) % 120, 1, 1); } }
  function ch(ctx, look, x, y, pose = "idle", frame = 0, face = 1, scale = 1, rot = 0) {
    const img = ART.char(typeof look === "string" ? L[look] : look, pose, frame);
    ctx.save(); ctx.translate(Math.round(x), Math.round(y)); if (rot) ctx.rotate(rot); if (face < 0) ctx.scale(-1, 1);
    ctx.drawImage(img, -9 * scale, -26 * scale, 18 * scale, 26 * scale); ctx.restore();
  }
  function face(ctx, look, mood, x, y, size) { ctx.drawImage(ART.face(L[look], mood), Math.round(x), Math.round(y), size, size); }
  function waves(ctx, t, s, y0 = 120, cols) {
    cols = cols || [ART.mix("#4aa0d6", "#1c2c3c", s), ART.mix("#2f7fb8", "#16222e", s), ART.mix("#1f5f94", "#0e1822", s)];
    const amp = 2 + s * 14;
    for (let l = 0; l < 3; l++) {
      ctx.fillStyle = cols[l];
      for (let x = 0; x < W; x += 2) ctx.fillRect(x, Math.round(y0 + l * 18 + Math.sin(x * 0.045 + t * (1 + s * 3) + l) * amp), 2, H);
    }
  }
  function rain(ctx, t, n) { ctx.strokeStyle = "rgba(180,200,255,.5)"; ctx.beginPath(); for (let i = 0; i < n; i++) { const x = (i * 53 + t * 420) % 340 - 10, y = (i * 97 + t * 660) % 210 - 10; ctx.moveTo(x, y); ctx.lineTo(x - 4, y + 9); } ctx.stroke(); }
  function ship(ctx, x, y, rot, sailUp = true) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    R(ctx, -70, -6, 140, 14, "#6a4220"); R(ctx, -64, 8, 128, 8, "#5a3618"); R(ctx, -56, 16, 112, 6, "#4a2c12");
    R(ctx, -76, -14, 14, 12, "#6a4220"); R(ctx, 62, -18, 14, 14, "#6a4220"); R(ctx, -70, -8, 140, 3, "#8a5a2b");
    R(ctx, -2, -96, 4, 90, "#5a3a1a");
    if (sailUp) { R(ctx, -40, -88, 80, 46, "#efe6d0"); R(ctx, -40, -70, 80, 4, "#c8433a"); } else R(ctx, -40, -92, 80, 6, "#d8ccb0");
    ctx.restore();
  }
  function fish(ctx, x, y, s, mouth, t) {
    // the huge fish Jehovah sent: drawn in pixel rows
    const body = "#36486a", belly = "#8aa0b8", dark = "#22304a";
    for (let j = -30; j <= 30; j++) {
      const w = Math.sqrt(1 - (j / 30) * (j / 30)) * 90;
      const span = 4 + mouth * 16, cut = Math.abs(j) < span ? mouth * 45 * (1 - Math.abs(j) / span) : 0;
      ctx.fillStyle = j > 8 ? belly : j < -20 ? dark : body;
      ctx.fillRect(Math.round(x - w * s + cut * s), Math.round(y + j * s), Math.max(0, Math.round((w * 2 - cut) * s)), Math.ceil(s));
      if (cut > 1) { ctx.fillStyle = "#1a0810"; ctx.fillRect(Math.round(x - w * s + cut * s * 0.2), Math.round(y + j * s), Math.round(cut * s * 0.8), Math.ceil(s)); }
    }
    // tail
    const tw = Math.sin(t * 3) * 6;
    ctx.fillStyle = body;
    for (let i = 0; i < 30; i++) ctx.fillRect(Math.round(x + (88 + i) * s), Math.round(y + (-i * 1.2 + tw * i / 30) * s), Math.ceil(3 * s), Math.ceil((i * 2.4 + 4) * s));
    // eye
    R(ctx, x - 58 * s, y - 14 * s, 6 * s, 6 * s, "#f2e6d0"); R(ctx, x - 56 * s, y - 12 * s, 3 * s, 3 * s, "#101018");
    for (let i = 0; i < 4; i++) R(ctx, x + (-10 + i * 14) * s, y - 4 * s, 2 * s, 14 * s, dark);
  }
  function hills(ctx, base, amp, col, seed) { ctx.fillStyle = col; for (let x = 0; x < W; x += 2) { const y = base - Math.abs(Math.sin((x + seed) * 0.012)) * amp; ctx.fillRect(x, Math.round(y), 2, H); } }
  function nineveh(ctx, base, col, lights, t) {
    ctx.fillStyle = col;
    ctx.fillRect(0, base - 34, W, 60);
    for (let x = 0; x < W; x += 10) ctx.fillRect(x, base - 40, 6, 6);
    [[30, 50], [120, 70], [210, 46], [270, 60]].forEach(([x, h]) => { ctx.fillRect(x, base - h, 40, h); ctx.fillRect(x + 6, base - h - 10, 28, 10); ctx.fillRect(x + 12, base - h - 18, 16, 8); });
    if (lights) { ctx.fillStyle = "#ffcf6a"; for (let i = 0; i < 14; i++) ctx.fillRect((i * 23) % W, base - 20 - (i * 7) % 30, 2, 2); }
  }

  const S = {};

  // ---------- Title screen & map ----------
  S.titleDraw = function (ctx, t, mode) {
    if (mode === "map") return drawMap(ctx, t);
    sky(ctx, ["#1a1f4a", "#5a4a8a", "#f2a070"]); stars(ctx, t, 40);
    ART.sun(ctx, 250, 118, 22, "#ffd88a");
    waves(ctx, t * 0.6, 0.15, 128, ["#3a5a9a", "#2a4a80", "#1a3460"]);
    ship(ctx, 44 + Math.sin(t * 0.3) * 6, 152 + Math.sin(t) * 2, Math.sin(t * 0.8) * 0.04, true);
    ctx.globalAlpha = 0.5; fish(ctx, 220 + Math.sin(t * 0.2) * 30, 172, 0.55, 0, t); ctx.globalAlpha = 1;
  };
  function drawMap(ctx, t) {
    R(ctx, 0, 0, W, H, "#e8d4a0");
    // the Great Sea (Mediterranean) on the left
    ctx.fillStyle = "#4a8ec0";
    for (let y = 0; y < H; y += 2) { const w = 104 + Math.sin(y * 0.05) * 8 + (y > 120 ? (y - 120) * 0.3 : 0); ctx.fillRect(0, y, w, 2); }
    ctx.fillStyle = "#6aaad8"; for (let i = 0; i < 18; i++) ctx.fillRect((i * 41 + t * 3) % 96, (i * 29) % H, 6, 1);
    // rivers Euphrates and Tigris
    ctx.strokeStyle = "#4a8ec0"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(190, 0); ctx.bezierCurveTo(200, 60, 230, 110, 300, 192); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(262, 0); ctx.bezierCurveTo(265, 60, 290, 120, 320, 150); ctx.stroke();
    // mountains
    for (let i = 0; i < 8; i++) { const x = 140 + i * 18, y = 20 + (i % 3) * 8; ctx.fillStyle = "#b89a68"; ctx.beginPath(); ctx.moveTo(x, y + 12); ctx.lineTo(x + 8, y); ctx.lineTo(x + 16, y + 12); ctx.fill(); }
    // desert dots
    ctx.fillStyle = "#d8bf88"; for (let i = 0; i < 60; i++) ctx.fillRect(130 + (i * 37) % 140, 100 + (i * 23) % 80, 2, 1);
    // the journey path
    const pts = D.LEVELS.map(l => [l.map[0] * W / 100, l.map[1] * H / 100]);
    const path = [pts[0], pts[1], pts[2], pts[3], [84, 78], [150, 70], pts[4], pts[5]];
    ctx.fillStyle = "#8a3a1a";
    for (let k = 0; k < path.length - 1; k++) { const [a, b] = [path[k], path[k + 1]]; const d = Math.hypot(b[0] - a[0], b[1] - a[1]); for (let s = 0; s < d; s += 6) ctx.fillRect(a[0] + (b[0] - a[0]) * s / d, a[1] + (b[1] - a[1]) * s / d, 2, 2); }
    // Tarshish arrow far to the west
    ctx.fillStyle = "#3a2616"; ctx.fillRect(4, 40, 22, 2); ctx.fillRect(4, 38, 3, 6);
    ctx.globalAlpha = 0.45; fish(ctx, 50, 172, 0.18, 0.2, t); ctx.globalAlpha = 1;
  }

  // ---------- Day 2 crowd for the mash game ----------
  S.mashDraw = function (ctx, t, v) {
    ART.bg(ctx, "city", 300, 0, t, {});
    R(ctx, 0, 150, W, 42, "#c9a56b");
    R(ctx, 140, 120, 40, 30, "#b8925a");
    ch(ctx, "jonah", 160, 122, v > 0.5 ? "shout" : "idle", 0, 1, 1);
    const n = 3 + Math.floor(v * 26);
    const looks = ["ninevite", "ninevite2", "soldier", "ninevite", "ninevite2"];
    for (let i = 0; i < n; i++) {
      const x = 16 + ((i * 47) % 288), y = 160 + (i % 3) * 10;
      if (Math.abs(x - 160) < 22 && y < 168) continue;
      ch(ctx, looks[i % looks.length], x, y + Math.sin(t * 6 + i) * (v > 0.8 ? 2 : 0.5), "idle", 0, x < 160 ? 1 : -1);
    }
  };

  // ---------- Cutscenes ----------
  // 1. The message
  S.message = async (G, v) => {
    G.music("night"); v.fade = 1; v.lightX = 160; v.beat = 0;
    G.scene((ctx, t) => {
      sky(ctx, ["#0b1030", "#1d2a5a", "#2e3a6a"]); stars(ctx, t);
      ART.sun(ctx, 270, 30, 9, "#f4f0d0");
      hills(ctx, 150, 26, "#1a2440", 30);
      ART.decor(ctx, "house", 40, 190, t, { w: 70, h: 54, wall: "#4a4a6a" });
      ART.decor(ctx, "house", 220, 190, t, { w: 60, h: 46, wall: "#4a4a6a" });
      ART.decor(ctx, "house", 122, 190, t, { w: 80, h: 60, wall: "#6a5a7a", lamp: true });
      ch(ctx, v.beat ? "jonah_sad" : "jonah", 162, 126, "sit", 0, 1, 1);
    });
    await G.tween(v, "fade", 0, 1200);
    await G.narr("That night, Jonah sat on the flat roof of his house in Gath-hepher. Everything was quiet.", { top: true });
    await G.wait(500);
    await G.jehovah(V.j12[0], V.j12[1], { top: true });
    v.beat = 1;
    for (let i = 0; i < 3; i++) { G.sfx("heart"); await G.wait(600); }
    await G.think("Nineveh?! The great city of the Assyrians?", { mood: "scared", top: true });
  };

  // 2. The vision of Nineveh: what the Assyrians were known for (kept gentle: no blood, nobody hurt on screen)
  S.vision = async (G, v) => {
    G.music("vision"); v.ph = 0; v.fade = 1; v.march = 0;
    G.scene((ctx, t) => {
      if (v.ph < 2) {
        sky(ctx, v.ph ? ["#2a0e10", "#6a1e18", "#c85a2a"] : ["#3a2a3a", "#7a4a3a", "#d89a5a"]);
        if (v.ph === 1) {
          // villages burning far away on the hills
          hills(ctx, 120, 22, "#2a1210", 80);
          for (let i = 0; i < 4; i++) {
            const x = 30 + i * 80, y = 112 - (i % 2) * 8;
            R(ctx, x, y - 10, 20, 10, "#1a0a08");
            for (let f = 0; f < 3; f++) R(ctx, x + 4 + f * 5, y - 18 - Math.abs(Math.sin(t * 7 + i + f)) * 8, 4, 10, f % 2 ? "#f8b04a" : "#e8542a");
            ctx.fillStyle = "rgba(60,40,40,.5)"; for (let s = 0; s < 6; s++) ctx.fillRect(x + 6 + Math.sin(t + s) * 6, y - 26 - s * 8 - (t * 10) % 8, 8, 6);
          }
          R(ctx, 0, 140, W, 60, "#3a2418");
          // frightened people running away
          for (let i = 0; i < 6; i++) { const x = ((i * 60 - t * 60) % 380 + 380) % 380 - 30; ch(ctx, i % 2 ? "woman" : "traveller", x, 172 + (i % 2) * 6, "idle", 1 + (Math.floor(t * 8 + i) % 2), -1); }
        } else {
          nineveh(ctx, 140, "#4a3028", false, t);
          R(ctx, 0, 140, W, 60, "#6a4a30");
          // the army marches
          for (let i = 0; i < 9; i++) { const x = ((i * 34 + v.march) % 400) - 40; ch(ctx, "soldier", x, 176, "idle", 1 + (Math.floor(t * 4) % 2), 1); }
        }
      } else {
        sky(ctx, ["#120a14", "#2a1420", "#120a14"]);
        face(ctx, "jonah", "scared", 112, 40, 96);
      }
    });
    const marching = setInterval(() => { v.march += 1.2; }, 16);
    await G.tween(v, "fade", 0, 900);
    await G.narr("Jonah knew about Nineveh. It was the great city of the Assyrians.", { top: true });
    await G.narr("Their armies were feared everywhere. They were known for being violent, even cruel.", { top: true });
    v.ph = 1; G.sfx("drum");
    await G.narr("They attacked towns and villages. People ran away in fear.", { top: true });
    await G.narr("Later, the Bible would even call Nineveh “the city of bloodshed” (Nahum 3:1).", { top: true });
    v.ph = 2; clearInterval(marching); G.stopMusic(true);
    for (let i = 0; i < 2; i++) { G.sfx("heart"); await G.wait(650); }
    await G.think("I can't go there... I can't!", { mood: "scared", top: true });
    await G.tween(v, "fade", 1, 900);
  };

  // 3. The storm
  S.storm = async (G, v) => {
    G.music("storm"); G.ambient("storm", 0.45);
    v.s = 0; v.ph = 0; v.fade = 0; v.toss = 0;
    G.scene((ctx, t) => {
      if (v.ph < 2) {
        sky(ctx, [ART.mix("#7cc4f2", "#101018", v.s), ART.mix("#cdeaff", "#20202c", v.s), ART.mix("#e8f4ff", "#34343e", v.s)]);
        if (v.s > 0.4) { ctx.fillStyle = "rgba(15,15,22,.85)"; for (let i = 0; i < 10; i++) ctx.fillRect(((i * 61 - t * 40) % 420 + 420) % 420 - 60, 6 + (i * 13) % 40, 80, 16); }
        const rot = Math.sin(t * 1.6) * 0.12 * v.s, sy = 128 + Math.sin(t * 1.3) * 10 * v.s;
        waves(ctx, t, v.s, 136);
        ship(ctx, 160, sy, rot, v.s < 0.6);
        // sailors on deck: some pray to their gods, some throw cargo
        ctx.save(); ctx.translate(160, sy); ctx.rotate(rot);
        if (v.ph === 1) {
          ch(ctx, "sailor1", -44, -8, "kneel", 0, 1); ch(ctx, "sailor3", 40, -8, "kneel", 0, -1);
          ch(ctx, "sailor2", -12, -8, "shout", 0, 1); ch(ctx, "sailor4", 20, -8, "shout", 0, -1);
          const k = (t * 0.7) % 1;
          ctx.drawImage(ART.spr("barrel", Math.floor(t * 8)), -20 + k * 120, -30 - Math.sin(k * Math.PI) * 50 + k * 60);
        } else { ch(ctx, "sailor2", -30, -8, "idle", 0, 1); ch(ctx, "sailor3", 30, -8, "idle", 0, -1); }
        ctx.restore();
        waves(ctx, t + 1, v.s, 160);
        if (v.s > 0.5) rain(ctx, t, 140);
      } else {
        // below deck: Jonah fast asleep
        sky(ctx, ["#1a100a", "#2a1a10", "#1a100a"]);
        const rot = Math.sin(t * 1.6) * 0.06;
        ctx.save(); ctx.translate(160, 96); ctx.rotate(rot); ctx.translate(-160, -96);
        R(ctx, 0, 150, W, 50, "#4a2c14"); for (let x = 0; x < W; x += 24) R(ctx, x, 0, 3, 150, "#3a2010");
        ART.decor(ctx, "crates", 40, 150, t); ART.decor(ctx, "crates", 250, 150, t);
        ch(ctx, "jonah", 150, 142, "idle", 0, 1, 1, -Math.PI / 2);
        ctx.fillStyle = "#fff"; const z = (t * 0.8) % 1; ctx.font = "8px monospace"; ctx.globalAlpha = 1 - z; ctx.fillText("z", 168 + z * 10, 130 - z * 20); ctx.globalAlpha = 1;
        ctx.restore();
        ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.fillRect(0, 0, W, H);
      }
    });
    await G.narr(V.j14[0] + " (" + V.j14[1] + ")", { top: true });
    await G.tween(v, "s", 1, 2500);
    G.sfx("thunder"); v.flash = 1; v.shake = 8;
    v.ph = 1;
    await G.narr("The mariners were so frightened that each of them began to call on his god for help. (Jonah 1:5)", { top: true });
    G.sfx("thunder"); v.flash = 0.8;
    await G.narr(V.j15[0] + " (" + V.j15[1] + ")", { top: true });
    v.ph = 2; G.sfx("crack");
    await G.narr("And Jonah? He was fast asleep below deck. (Jonah 1:5)", { top: true });
    G.sfx("thunder"); v.shake = 6;
    await G.wait(800);
  };

  // 4. Thrown into the sea
  S.overboard = async (G, v) => {
    v.s = 1; v.ph = 0; v.fall = 0; v.sink = 0; v.fade = 0;
    G.scene((ctx, t) => {
      if (v.ph < 2) {
        sky(ctx, [ART.mix("#7cc4f2", "#101018", v.s), ART.mix("#cdeaff", "#20202c", v.s), ART.mix("#ffe8c8", "#34343e", v.s)]);
        if (v.s < 0.4) ART.sun(ctx, 260, 40, 14, "#fff3a8");
        const rot = Math.sin(t * 1.6) * 0.12 * v.s, sy = 120 + Math.sin(t * 1.3) * 10 * v.s;
        waves(ctx, t, v.s, 132);
        ship(ctx, 140, sy, rot, v.s < 0.5);
        ctx.save(); ctx.translate(140, sy); ctx.rotate(rot);
        if (v.ph === 0) {
          ch(ctx, "sailor1", -30, -8, "jump", 0, 1); ch(ctx, "sailor2", 40, -8, "jump", 0, -1);
          const k = v.fall;
          ch(ctx, "jonah", 10 + k * 90, -30 - Math.sin(Math.min(1, k) * Math.PI) * 40 + k * k * 110, "jump", 0, 1, 1, k * 3);
        } else {
          ["sailor1", "sailor2", "sailor3", "sailor4"].forEach((s, i) => ch(ctx, s, -45 + i * 28, -8, "kneel", 0, 1));
          if (v.s < 0.3) { R(ctx, 50, -22, 12, 8, "#8a8478"); for (let f = 0; f < 3; f++) R(ctx, 52 + f * 3, -28 - Math.abs(Math.sin(t * 6 + f)) * 5, 2, 6, f % 2 ? "#f8b04a" : "#e8742a"); }
        }
        ctx.restore();
        waves(ctx, t + 1, v.s, 156);
        if (v.splash > 0) { ctx.fillStyle = "#e8f6ff"; for (let i = 0; i < 16; i++) ctx.fillRect(240 + Math.cos(i) * v.splash * 30, 150 - Math.abs(Math.sin(i * 1.7)) * v.splash * 40, 3, 3); }
        if (v.s > 0.5) rain(ctx, t, 120);
      } else {
        // sinking into the deep blue
        sky(ctx, [ART.mix("#2f8fb0", "#04091a", v.sink), ART.mix("#1d5f8a", "#030614", v.sink), "#020410"]);
        ctx.fillStyle = `rgba(200,240,255,${0.15 * (1 - v.sink)})`;
        for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(60 + i * 60, 0); ctx.lineTo(72 + i * 60, 0); ctx.lineTo(110 + i * 60, H); ctx.lineTo(90 + i * 60, H); ctx.fill(); }
        for (let i = 0; i < 14; i++) ctx.drawImage(ART.spr("bubble"), 150 + Math.sin(i * 3 + t) * 20, ((i * 31 - t * 40) % 200 + 200) % 200);
        ch(ctx, "jonah", 160, 60 + v.sink * 70, "jump", 0, 1, 1, Math.PI * 0.9 + Math.sin(t) * 0.2);
        if (v.sink > 0.6) { ctx.globalAlpha = (v.sink - 0.6) * 1.5; fish(ctx, 420 - v.sink * 120, 160, 1.1, 0, t); ctx.globalAlpha = 1; }
      }
    });
    G.music("storm");
    await G.narr("Then they lifted Jonah up and threw him into the sea...", { top: true });
    G.sfx("wave");
    await G.tween(v, "fall", 1.6, 1800, "in");
    G.sfx("splash"); v.splash = 0; G.tween(v, "splash", 1, 500);
    await G.wait(600); v.splash = 0;
    v.ph = 1; G.stopMusic(true); G.ambient("sea", 0.15);
    await G.tween(v, "s", 0, 2200);
    await G.narr("...and the sea ceased its raging. (Jonah 1:15)", { top: true });
    G.music("sail");
    await G.narr("Then the men were struck with great fear of Jehovah, and they offered a sacrifice to Jehovah and made vows. (Jonah 1:16)", { top: true });
    await G.narr("The sailors learned about Jehovah, the true God, because of what happened to Jonah.", { top: true });
    v.ph = 2; G.music("deep"); G.ambient("deep", 0.3);
    await G.tween(v, "sink", 1, 4000);
    await G.think("Down, down, down... into the deep.", { mood: "scared", top: true });
    await G.tween(v, "fade", 1, 1000);
  };

  // 5. The great fish swallows Jonah
  S.swallow = async (G, v) => {
    v.fx = 1.2; v.m = 0; v.fade = 0; v.gone = 0;
    G.scene((ctx, t) => {
      sky(ctx, ["#030a1c", "#020614", "#010308"]);
      for (let i = 0; i < 12; i++) { ctx.fillStyle = "rgba(160,200,255,.3)"; ctx.fillRect((i * 53) % W, ((i * 41 - t * 10) % H + H) % H, 1, 1); }
      if (!v.gone) ch(ctx, "jonah", 90, 110 + Math.sin(t) * 3, "jump", 0, 1, 1, 1.4);
      fish(ctx, 160 + v.fx * 200, 100, 1.4, v.m, t);
    });
    G.music("fish");
    await G.narr("Out of the dark, something huge was coming...", { top: true });
    await G.tween(v, "fx", 0.05, 3500, "out");
    G.sfx("rumble");
    await G.tween(v, "m", 1, 700);
    G.sfx("gulp"); v.gone = 1; v.shake = 10;
    await G.tween(v, "m", 0, 300);
    await G.narr("Jehovah now sent a huge fish to swallow Jonah. (Jonah 1:17)", { top: true });
    await G.tween(v, "fade", 1, 800);
  };

  // 6. Spat out onto dry land, and Jehovah speaks a second time
  S.spatOut = async (G, v) => {
    v.ph = 0; v.fx = 0; v.m = 0; v.jx = 0; v.fade = 1; v.lightX = 150;
    G.scene((ctx, t) => {
      sky(ctx, ["#7cc4f2", "#c8eaff", "#fff0d0"]); ART.sun(ctx, 260, 34, 14, "#fff3a8");
      R(ctx, 0, 120, W, 80, "#3d8ec2"); for (let x = 0; x < W; x += 12) R(ctx, (x + t * 8) % W, 124 + (x % 3) * 8, 6, 1, "#9fd8ff");
      ctx.fillStyle = "#ecd8a0"; ctx.beginPath(); ctx.moveTo(0, 150); ctx.lineTo(170, 132); ctx.lineTo(170, 200); ctx.lineTo(0, 200); ctx.fill();
      R(ctx, 0, 150, 170, 50, "#ecd8a0");
      ART.decor(ctx, "palm", 30, 150, t);
      if (v.ph < 2) fish(ctx, 250 + v.fx * 160, 140, 0.8, v.m, t);
      if (v.ph >= 1) ch(ctx, v.ph === 1 ? "jonah" : "jonah", 150 - v.jx * 40, 150, v.ph === 1 ? "jump" : "sit", 0, -1, 1, v.ph === 1 ? (1 - v.jx) * 2 : 0);
    });
    await G.tween(v, "fade", 0, 900);
    G.music("prayer");
    await G.narr("Three days and three nights later...", { top: true });
    await G.tween(v, "m", 1, 600); G.sfx("splash");
    v.ph = 1; await G.tween(v, "jx", 1, 900, "out");
    G.sfx("crack");
    await G.narr("In time Jehovah commanded the fish, and it vomited Jonah out onto the dry land. (Jonah 2:10)", { top: true });
    v.ph = 2; await G.tween(v, "fx", 1, 1600);
    await G.think("Dry land! I'm alive! Thank you, Jehovah!", { mood: "happy", top: true });
    await G.narr("Then the word of Jehovah came to Jonah a second time, saying: (Jonah 3:1)", { top: true });
    await G.jehovah("Get up, go to Nineveh the great city, and proclaim to her the message that I tell you.", "Jonah 3:2", { top: true });
    await G.think("This time I will go, Jehovah. I will obey.", { top: true });
    await G.tween(v, "fade", 1, 900);
  };

  // 7. Nineveh repents
  S.repent = async (G, v) => {
    v.ph = 0; v.rise = 0; v.fade = 1; v.ash = 0;
    G.scene((ctx, t) => {
      sky(ctx, ["#3a2418", "#5a3a22", "#2a1a10"]);
      for (let x = 0; x < W; x += 40) { R(ctx, x + 6, 20, 14, 150, "#7a5230"); R(ctx, x + 4, 20, 18, 6, "#9a7040"); }
      R(ctx, 0, 160, W, 40, "#8a6a42"); R(ctx, 110, 150, 100, 10, "#b0303a");
      ART.decor(ctx, "throne", 148, 156, t);
      if (v.ph === 0) ch(ctx, "king", 160, 150 - v.rise * 6, v.rise > 0.5 ? "idle" : "sit", 0, -1, 1);
      else {
        // the king sits in the ashes, wearing sackcloth
        ctx.fillStyle = "#8a8478"; ctx.fillRect(130, 168, 60, 6);
        for (let i = 0; i < 20; i++) { ctx.fillStyle = "rgba(160,150,140,.7)"; ctx.fillRect(130 + (i * 13) % 60, 160 - ((i * 7 + t * 8) % 20), 1, 1); }
        ch(ctx, "kingSack", 160, 172, "sit", 0, -1, 1);
        if (v.robe) { R(ctx, 196, 160, 24, 8, "#6a3a8a"); R(ctx, 194, 160, 4, 8, "#e8b53a"); }
      }
      if (v.city) { ctx.fillStyle = `rgba(0,0,0,${0.3 * v.city})`; ctx.fillRect(0, 0, W, H); }
    });
    G.music("question");
    await G.tween(v, "fade", 0, 900);
    await G.narr("When the message reached the king of Nineveh...", { top: true });
    await G.tween(v, "rise", 1, 1200);
    v.ph = 1; v.robe = 1; G.sfx("rumble");
    await G.narr("he rose up from his throne and took off his royal garment and covered himself with sackcloth and sat down in the ashes. (Jonah 3:6)", { top: true });
    await G.narr("He sent a message through all of Nineveh: no man or animal should eat or drink anything. Everyone, even the animals, should be covered with sackcloth. (Jonah 3:7, 8)", { top: true });
    await G.say("king", "Let them call out earnestly to God and turn from their evil ways and from the violence they practice.", { ref: "Jonah 3:8", top: true });
    await G.say("king", "Who knows whether the true God may reconsider what he intends to do and turn from his burning anger, so that we may not perish?", { ref: "Jonah 3:9", top: true });
    await G.tween(v, "city", 1, 1500);
    await G.narr("The whole great city went quiet.", { top: true });
    await G.tween(v, "fade", 1, 900);
  };

  // 8. Years later: old Jonah writes his book, and smiles
  S.older = async (G, v) => {
    v.ph = 0; v.fade = 1; v.white = 0; v.glow = 0;
    G.scene((ctx, t) => {
      if (v.ph === 0) {
        sky(ctx, ["#2a1a2a", "#4a2a2a", "#2a1a1a"]);
        R(ctx, 0, 150, W, 50, "#4a3020"); for (let x = 0; x < W; x += 30) R(ctx, x, 0, 2, 150, "#3a2418");
        R(ctx, 236, 40, 30, 26, "#2a3a6a"); stars(ctx, t, 6);
        ART.decor(ctx, "table", 150, 150, t);
        R(ctx, 152, 135, 22, 3, "#f2e3bd"); R(ctx, 150, 134, 3, 5, "#b8834a"); R(ctx, 173, 134, 3, 5, "#b8834a");
        ctx.drawImage(ART.spr("lamp", 1), 178, 129);
        ctx.fillStyle = "rgba(255,200,90,.15)"; ctx.beginPath(); ctx.arc(186, 132, 60 + Math.sin(t * 3) * 3, 0, 7); ctx.fill();
        ch(ctx, "jonahOld", 140, 152, "write", 0, 1, 1);
      } else {
        sky(ctx, ["#3a2418", "#6a3a22", "#3a2418"]);
        ctx.fillStyle = `rgba(255,210,120,${0.25 + 0.1 * Math.sin(t * 2)})`; ctx.beginPath(); ctx.arc(160, 96, 90, 0, 7); ctx.fill();
        face(ctx, "jonahOld", v.ph === 2 ? "smile" : "calm", 96, 32, 128);
      }
    });
    G.music("prayer");
    await G.tween(v, "fade", 0, 1500);
    await G.narr("Many years later, Jonah was back home in Israel. He was an old man now.", { top: true });
    await G.narr("Jonah wrote down everything that happened. He didn't hide his mistakes. He wrote about running away, and about being angry.", { top: true });
    await G.narr("And he finished his book with Jehovah's question, the question Jehovah had asked him under the plant.", { top: true });
    v.ph = 1;
    await G.wait(700);
    await G.narr("Jonah did not write down an answer. But by telling his story so honestly, Jonah showed that he had learned Jehovah's lesson.", { top: true });
    v.ph = 2; G.sfx("light");
    await G.say("jonahOld", "Jehovah cares about people. All kinds of people. And he cared about me, too.", { mood: "smile", top: true });
    await G.narr("Jonah understood. Jehovah is merciful, and he wants us to be merciful too.", { top: true });
    await G.tween(v, "white", 1, 2000);
  };

  // 9. The white thinking room
  S.whiteRoom = async (G, v) => {
    v.white = 0;
    G.scene((ctx, t) => {
      R(ctx, 0, 0, W, H, "#fffdf6");
      for (let i = 0; i < 30; i++) { ctx.fillStyle = `rgba(242,193,78,${0.25 + 0.25 * Math.sin(t + i)})`; ctx.fillRect((i * 71 + Math.sin(t * 0.3 + i) * 20) % W, ((i * 43 - t * 6) % H + H) % H, 2, 2); }
    });
    G.music("white"); G.ambient(null);
    await G.wait(1200);
    await G.reflect("What have you learned about Jehovah?", "jehovah", { title: "💭 Deep in thought" });
    await G.reflect("What have you learned about Jonah?", "bible", { title: "💭 Deep in thought" });
    await G.reflect("What have you learned about yourself?", "myself", { title: "💭 Deep in thought" });
    await G.reflect("Who can you show mercy and kindness to this week?", "helping", { title: "💭 Deep in thought" });
  };

  // 10. The closing song and credits
  const LYRICS = [
    "Jonah ran away, far across the sea,",
    "but Jehovah saw him, wherever he'd be.",
    "From deep in the dark he called Jehovah's name,",
    "and Jehovah heard him, and his answer came.",
    "Jehovah is patient, Jehovah is kind,",
    "he gives second chances, time after time.",
    "He cares for the great, he cares for the small,",
    "Jehovah shows mercy, mercy to all.",
  ];
  S.finale = async (G, v) => {
    v.white = 1;
    G.scene((ctx, t) => {
      sky(ctx, ["#f2a070", "#f8d0a0", "#fff0d0"]); ART.sun(ctx, 60, 120, 20, "#fff0b0");
      nineveh(ctx, 150, "#c99a68", false, t);
      hills(ctx, 160, 14, "#d8b47a", 12);
      R(ctx, 0, 165, W, 30, "#d8b47a");
      ART.decor(ctx, "shelter", 210, 166, t); ART.decor(ctx, "gourd", 210, 166, t, { g: 1 });
      ch(ctx, "jonah", 236, 166, "sit", 0, -1, 1);
      ctx.drawImage(ART.spr("sheep", Math.floor(t * 2)), 120 + Math.sin(t * 0.3) * 20, 154);
      ctx.drawImage(ART.spr("sheep", Math.floor(t * 2) + 1), 160 + Math.sin(t * 0.4 + 1) * 16, 156);
      ctx.drawImage(ART.spr("cow"), 280, 152);
    });
    G.tween(v, "white", 0, 1500);
    const box = document.createElement("div"); box.className = "ending";
    box.innerHTML = `<div class="lyric"></div><div class="credits" hidden></div>`;
    document.getElementById("screen").appendChild(box);
    const lyric = box.querySelector(".lyric"), credits = box.querySelector(".credits");
    const stepsPerSec = 76 / 60 * 2;
    async function sing() {
      G.music("ending", { restart: true });
      const t0 = performance.now();
      let shown = -1;
      await new Promise(res => {
        const iv = setInterval(() => {
          const line = Math.floor(((performance.now() - t0) / 1000) * stepsPerSec / 16);
          if (line !== shown) { shown = line; lyric.style.opacity = 0; setTimeout(() => { lyric.textContent = LYRICS[line] || ""; lyric.style.opacity = 1; }, 200); }
          if (line >= LYRICS.length) { clearInterval(iv); res(); }
        }, 100);
      });
    }
    await sing();
    lyric.textContent = "The End";
    const S0 = window.JONAH.S, stars = Object.values(S0.best).reduce((a, b) => a + b, 0), g = S0.gems;
    credits.hidden = false;
    credits.innerHTML = `Jonah's Journey · played by Davian and Levi · made with love by Sergio<br>
      ★ ${stars} of 18 stars · Faith Gems: 💛 ${g.jehovah} 📘 ${g.bible} 💚 ${g.myself} ❤️ ${g.helping}<br>
      Bible text: New World Translation (wol.jw.org). Story help: “Imitate Their Faith” and “Lessons You Can Learn From the Bible” (jw.org).<br><br>`;
    const row = document.createElement("div"); row.style.cssText = "display:flex;gap:12px;justify-content:center;pointer-events:auto";
    const again = document.createElement("button"); again.className = "bigbtn alt"; again.textContent = "🎵 Sing again";
    const done = document.createElement("button"); done.className = "bigbtn"; done.textContent = "▶ Finish";
    row.append(again, done); credits.appendChild(row);
    await new Promise(res => {
      done.onclick = res;
      again.onclick = async () => { row.style.visibility = "hidden"; credits.hidden = true; await sing(); lyric.textContent = "The End"; credits.hidden = false; row.style.visibility = "visible"; };
    });
    box.remove(); G.stopMusic(true);
  };

  window.SCENES = S;
})();
