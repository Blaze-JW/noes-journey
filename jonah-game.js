// game.js — Jonah's Journey engine: platforming, talking, Scroll Keeper gates, mini games and screens.
(function () {
  "use strict";
  const W = 320, H = 192, TS = 16;
  const $ = s => document.querySelector(s);
  const cv = $("#cv"), ctx = cv.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  const layer = $("#layer"), screenEl = $("#screen"), hud = $("#hud"), bubbleEl = $("#bubble");
  const D = window.JONAH_DATA, SC = window.SCENES;

  // ---------- Save ----------
  const SAVE_KEY = "jonah.save.v1";
  const S = (() => {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(SAVE_KEY) || "null"); } catch (e) {}
    return Object.assign({ unlocked: 1, best: {}, gems: { jehovah: 0, bible: 0, myself: 0, helping: 0 }, seen: {}, swap: false, finished: false, players: 2 }, s || {});
  })();
  // 1 player = Davian on his own: he is Jonah and the Scroll Keeper, and the bag follows by itself.
  if (S.bagAuto != null) { S.players = S.bagAuto ? 1 : 2; delete S.bagAuto; }
  const solo = () => S.players === 1;
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }

  const NAMES = { d: "Davian", l: "Levi" };
  const GEMS = { jehovah: ["💛", "Jehovah"], bible: ["📘", "The Bible"], myself: ["💚", "Myself"], helping: ["❤️", "Helping others"] };

  // ---------- Input ----------
  // Two brothers share one keyboard: Davian on the left (A D W, E), Levi on the right (arrows, Enter).
  // Each brother keeps his own keys all game; what he steers (Jonah or the bag) swaps each level.
  const blank = () => ({ left: 0, right: 0, up: 0, down: 0, jump: 0, talk: 0 });
  const KB = { d: blank(), l: blank() }, K = blank();
  let PB = { d: {}, l: {} }, P = {};
  const KEYMAP = {
    KeyA: ["d", "left"], KeyD: ["d", "right"], KeyW: ["d", "up"], KeyS: ["d", "down"], Space: ["d", "jump"], KeyE: ["d", "talk"],
    ArrowLeft: ["l", "left"], ArrowRight: ["l", "right"], ArrowUp: ["l", "up"], ArrowDown: ["l", "down"], Enter: ["l", "talk"],
  };
  let adv = null, keyChoice = null, inputLock = 0, mode = "title", mashKey = null;
  function clearKeys() {
    KB.d = blank(); KB.l = blank(); PB = { d: {}, l: {} }; Object.assign(K, blank()); P = {};
    document.querySelectorAll("#touch button.on").forEach(b => b.classList.remove("on"));
  }
  function mergeKeys() { for (const k in K) K[k] = KB.d[k] || KB.l[k]; P = {}; for (const w in PB) for (const k in PB[w]) if (PB[w][k]) P[k] = 1; }
  // In one-player mode (the bag follows by itself) Jonah answers to both sides of the keyboard.
  function inputFor(w) { return solo() ? { k: K, p: P } : { k: KB[w], p: PB[w] }; }
  const typing = e => e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName);
  addEventListener("keydown", e => {
    if (typing(e)) return;
    SND.init();
    if (e.repeat && (e.code === "Space" || e.code === "Enter" || e.code === "KeyE")) { e.preventDefault(); return; }
    if (mashKey && (e.code === "KeyD" || e.code === "KeyL")) { mashKey(e.code === "KeyD" ? "d" : "l"); e.preventDefault(); return; }
    if (keyChoice && /^Digit[1-4]$/.test(e.code)) { keyChoice(+e.code.slice(5) - 1); e.preventDefault(); return; }
    if (adv && (e.code === "Space" || e.code === "Enter" || e.code === "KeyE")) { e.preventDefault(); if (performance.now() > inputLock) adv(); return; }
    const m = KEYMAP[e.code];
    if (m) { const [w, k] = m; if (!KB[w][k]) PB[w][k] = 1; KB[w][k] = 1; e.preventDefault(); }
  });
  addEventListener("keyup", e => { const m = KEYMAP[e.code]; if (m) KB[m[0]][m[1]] = 0; });
  addEventListener("blur", clearKeys);
  document.querySelectorAll("#touch [data-k]").forEach(b => {
    const k = b.dataset.k, w = b.closest("[data-who]").dataset.who;
    const on = e => { e.preventDefault(); SND.init(); if (adv && (k === "talk" || k === "jump")) { if (performance.now() > inputLock) adv(); return; } if (!KB[w][k]) PB[w][k] = 1; KB[w][k] = 1; b.classList.add("on"); };
    const off = e => { e.preventDefault(); KB[w][k] = 0; b.classList.remove("on"); };
    b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off); b.addEventListener("pointerleave", off); b.addEventListener("pointercancel", off);
  });
  let touchMode = matchMedia("(pointer: coarse)").matches;
  addEventListener("touchstart", () => { if (!touchMode) { touchMode = true; refreshTouch(); } }, { passive: true });
  function refreshTouch() {
    const show = touchMode && (mode === "play" || mode === "maze");
    $("#touch").hidden = !show;
    $("#touch .pu").hidden = mode !== "maze";
    $("#touch .pr").hidden = solo();
    if (!show) return;
    document.querySelectorAll("#touch .pad .tag").forEach(tag => {
      const w = tag.closest("[data-who]").dataset.who;
      const role = mode === "maze" ? "Jonah" : !LV ? "" : LV.jonah === w ? "Jonah" : solo() ? "" : "🎒 Bag";
      tag.textContent = NAMES[w] + (role ? " · " + role : "");
      tag.parentElement.classList.toggle("off", !role);
    });
  }
  function keyName(w, k) { return touchMode ? { talk: "💬", jump: "⤒" }[k] : w === "d" ? { talk: "E", jump: "W" }[k] : { talk: "Enter", jump: "↑" }[k]; }

  // ---------- Small helpers ----------
  const wait = ms => skipping ? Promise.resolve() : new Promise(r => setTimeout(r, ms));
  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function speak(text) {
    try {
      const ss = window.speechSynthesis; if (!ss) return;
      ss.cancel(); const u = new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g, "")); u.rate = 0.88; u.lang = "en-GB"; ss.speak(u);
    } catch (e) {}
  }
  function stopSpeak() { try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {} }

  // ---------- Tweens ----------
  const tweens = [];
  function tween(obj, key, to, ms, ease) {
    if (skipping || ms <= 0) { obj[key] = to; return Promise.resolve(); }
    return new Promise(res => tweens.push({ obj, key, from: obj[key] || 0, to, t0: performance.now(), ms, res, ease }));
  }
  function runTweens() {
    const now = performance.now();
    for (let i = tweens.length - 1; i >= 0; i--) {
      const tw = tweens[i]; let k = Math.min(1, (now - tw.t0) / tw.ms);
      const e = tw.ease === "in" ? k * k : tw.ease === "out" ? 1 - (1 - k) * (1 - k) : k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      tw.obj[tw.key] = tw.from + (tw.to - tw.from) * e;
      if (k >= 1) { tweens.splice(i, 1); tw.res(); }
    }
  }

  // ---------- UI: talk boxes ----------
  let uiOpen = 0, skipping = false;
  function uiIn() { uiOpen++; clearKeys(); inputLock = performance.now() + 220; }
  function uiOut() { uiOpen = Math.max(0, uiOpen - 1); clearKeys(); inputLock = performance.now() + 220; }
  function portrait(who, mood) {
    const c = document.createElement("canvas"); c.width = 32; c.height = 32;
    const x = c.getContext("2d"); x.imageSmoothingEnabled = false;
    const sp = D.SPEAKERS[who];
    if (who === "jehovah") x.drawImage(ART.lightFace(), 0, 0);
    else if (sp && sp.look) x.drawImage(ART.face(D.LOOKS[sp.look], mood || sp.mood || "calm"), 0, 0);
    return c;
  }
  function say(who, text, opt = {}) {
    if (skipping) return Promise.resolve();
    return new Promise(res => {
      uiIn();
      const sp = D.SPEAKERS[who] || { name: who };
      const kind = who === "jehovah" ? " jehovah" : who === "narrator" ? " narr" : opt.thought ? " thought" : "";
      const box = el("div", "talk" + kind + (opt.top ? " top" : ""));
      if (who !== "narrator") box.appendChild(portrait(who, opt.mood));
      const body = el("div", "txt");
      const name = opt.thought ? "💭 " + (opt.name || "Jonah thinks") : (opt.name || sp.name || "");
      if (name) body.appendChild(el("div", "who", esc(name)));
      const span = el("span"); body.appendChild(span);
      if (opt.ref) body.appendChild(el("span", "ref", esc(opt.ref)));
      box.appendChild(body);
      const ctl = el("div", "ctl");
      const rd = el("button", "", "🔊"); rd.title = "Read aloud"; rd.onclick = e => { e.stopPropagation(); speak(text); };
      ctl.appendChild(rd); ctl.appendChild(el("span", "next", "▶"));
      box.appendChild(ctl);
      layer.appendChild(box);
      let i = 0, full = false, timer;
      const chars = Array.from(text);
      function finish() { clearInterval(timer); span.textContent = text; full = true; }
      timer = setInterval(() => { i += 2; span.textContent = chars.slice(0, i).join(""); if (i % 8 === 0) SND.sfx("blip"); if (i >= chars.length) finish(); }, 22);
      const go = () => { if (!full) { finish(); return; } clearInterval(timer); stopSpeak(); box.remove(); adv = null; uiOut(); res(); };
      adv = go; box.onclick = () => { if (performance.now() > inputLock) go(); };
      if (who === "jehovah") SND.sfx("light"); else SND.sfx("talk");
    });
  }
  const think = (text, opt = {}) => say("jonah", text, Object.assign({ thought: true, mood: opt.mood || "calm" }, opt));
  const narr = (text, opt = {}) => say("narrator", text, opt);
  let bubbleT = 0;
  function bubble(text, ms = 3800) {
    bubbleEl.textContent = text; bubbleEl.hidden = false; clearTimeout(bubbleT);
    bubbleT = setTimeout(() => (bubbleEl.hidden = true), ms);
  }
  async function jehovah(text, ref, opt = {}) {
    const v = vars();
    await tween(v, "light", 1, 900);
    await say("jehovah", text, Object.assign({ ref }, opt));
    if (!opt.keep) await tween(v, "light", 0, 700);
  }

  // ---------- UI: cards ----------
  function card(html, opt = {}) {
    const veil = el("div", "veil"), c = el("div", "card" + (opt.cls ? " " + opt.cls : ""), html);
    veil.appendChild(c); layer.appendChild(veil);
    return { veil, c, close() { veil.remove(); } };
  }
  function keeper() { return LV ? LV.keeper : "l"; }

  // Scroll Keeper question. Resolves true when right on the first try.
  function ask(Q) {
    return new Promise(res => {
      uiIn();
      const k = keeper(), v = Q[k] || Q.d || Q, ref = v.ref || Q.ref;
      const opts = shuffle(v.o.map((t, i) => ({ t, ok: i === (v.a || 0) })));
      const help = k === "l" && LV ? LV.help : 0;
      const C = card(`<div class="role">📜 Scroll Keeper: ${NAMES[k]}</div>
        ${ref ? `<div class="open">Open your Bible to <b>${esc(ref)}</b></div>` : ""}
        <div class="q">${esc(v.q)}</div>
        <div class="opts">${opts.map((o, i) => `<button class="opt" data-i="${i}"><span class="k">${i + 1}</span> ${esc(o.t)}</button>`).join("")}</div>
        <div class="fb" hidden></div>
        <div class="row"><button class="btn alt small rd">🔊 Read aloud</button>${k === "l" && LV ? `<button class="btn alt small mum" ${help ? "" : "disabled"}>👩 Mum helps (${help} left)</button>` : ""}</div>`);
      SND.sfx("scroll");
      let first = true, done = false;
      const fb = C.c.querySelector(".fb");
      const pick = i => {
        if (done) return;
        const b = C.c.querySelector(`.opt[data-i="${i}"]`); if (!b || b.disabled) return;
        if (opts[i].ok) {
          done = true; b.classList.add("right"); SND.sfx("ok");
          fb.hidden = false; fb.className = "fb ok"; fb.textContent = first ? "✓ Well done! The way is open." : "✓ That's it! Good job looking it up.";
          const cont = el("button", "btn", "Continue ▶"); C.c.querySelector(".row").prepend(cont);
          keyChoice = null;
          const fin = () => { C.close(); adv = null; uiOut(); if (LV) { LV.stats.q++; if (first) LV.stats.first++; } res(first); };
          cont.onclick = fin; adv = fin; cont.focus();
        } else {
          first = false; b.classList.add("wrong"); b.disabled = true; SND.sfx("no");
          fb.hidden = false; fb.className = "fb no"; fb.textContent = ref ? `Not quite. Read ${ref} again, slowly.` : "Not quite. Try again!";
        }
      };
      C.c.querySelectorAll(".opt").forEach(b => (b.onclick = () => pick(+b.dataset.i)));
      keyChoice = pick;
      C.c.querySelector(".rd").onclick = () => speak(v.q + ". " + opts.map(o => o.t).join(". "));
      const mum = C.c.querySelector(".mum");
      if (mum) mum.onclick = () => {
        if (!LV.help) return; LV.help--;
        const wrong = opts.map((o, i) => i).filter(i => !opts[i].ok && !C.c.querySelector(`.opt[data-i="${i}"]`).disabled);
        if (wrong.length) { const b = C.c.querySelector(`.opt[data-i="${wrong[0]}"]`); b.disabled = true; b.style.opacity = ".35"; }
        mum.textContent = `👩 Mum helps (${LV.help} left)`; if (!LV.help) mum.disabled = true;
      };
    });
  }

  // A choice with no wrong answer. Resolves with the index picked.
  function choose(title, prompt, options, opt = {}) {
    return new Promise(res => {
      uiIn();
      const C = card(`${title ? `<h2>${esc(title)}</h2>` : ""}<div class="q">${esc(prompt)}</div>
        <div class="opts">${options.map((o, i) => `<button class="opt" data-i="${i}"><span class="k">${i + 1}</span> ${esc(o)}</button>`).join("")}</div>
        <div class="row"><button class="btn alt small rd">🔊 Read aloud</button></div>`);
      const pick = i => { if (i >= options.length) return; keyChoice = null; adv = null; C.close(); uiOut(); SND.sfx("talk"); res(i); };
      C.c.querySelectorAll(".opt").forEach(b => (b.onclick = () => pick(+b.dataset.i)));
      C.c.querySelector(".rd").onclick = () => speak(prompt + ". " + options.join(". "));
      keyChoice = pick;
    });
  }

  function giveGem(g) { S.gems[g] = (S.gems[g] || 0) + 1; save(); SND.sfx("gem"); if (LV) LV.gems++; }

  // "Think about it": no wrong answers; a grown-up taps to award a Faith Gem.
  function reflect(q, gem, opt = {}) {
    if (skipping) return Promise.resolve();
    return new Promise(res => {
      uiIn();
      const [icon, gname] = GEMS[gem] || GEMS.myself;
      const C = card(`<h2>${esc(opt.title || "💭 Think about it")}</h2>
        <div class="think">${esc(q)}</div>
        <div class="small">There are no wrong answers. Talk about it together, then a grown-up taps ✓ for a ${icon} ${esc(gname)} gem.</div>
        <div class="row"><button class="btn yes">✓ We talked about it</button><button class="btn alt small rd">🔊 Read aloud</button><button class="btn alt small no">Skip</button></div>`);
      const end = got => { if (got) giveGem(gem); adv = null; C.close(); uiOut(); res(got); };
      C.c.querySelector(".yes").onclick = () => end(true);
      C.c.querySelector(".no").onclick = () => end(false);
      C.c.querySelector(".rd").onclick = () => speak(q);
    });
  }

  // Decision moment: the boys say what they think, then open the Bible and type what Jonah really did.
  async function decision(dm) {
    await choose("⚖️ What should Jonah do?", dm.prompt, dm.options);
    if (dm.find) await bibleFind(dm);
    else await verseCard("📖 What did Jonah really do?", dm.truth, dm.ref, dm.note);
    if (dm.talk) await reflect(dm.talk, dm.gem || "myself", { title: "💬 Talk about your choice" });
  }
  // Loose answer check for young spellers: any key word, or a word one or two letters off it.
  function wordsMatch(text, keys) {
    const words = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z\s]/g, " ").split(/\s+/).filter(Boolean);
    const lev = (a, b) => {
      const d = Array.from({ length: b.length + 1 }, (_, i) => i);
      for (let i = 1; i <= a.length; i++) { let prev = d[0]; d[0] = i; for (let j = 1; j <= b.length; j++) { const t = d[j]; d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = t; } }
      return d[b.length];
    };
    return keys.some(k => words.some(w => w === k || (k.length >= 4 && w.length >= 3 && (w.startsWith(k) || lev(w, k) <= (k.length >= 8 ? 2 : 1)))));
  }
  function bibleFind(dm) {
    const f = dm.find;
    return new Promise(res => {
      uiIn();
      const C = card(`<h2>📖 What did Jonah really do?</h2>
        <div class="open">Open your Bible to <b>${esc(dm.ref)}</b> and read it together.</div>
        <div class="q">${esc(f.q)}</div>
        <div class="nudge">💡 ${esc(f.hint)}</div>
        <div class="typebox"><input class="ans" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="90" placeholder="Type what Jonah did" aria-label="Your answer"><button class="btn chk">Check ✓</button></div>
        <div class="fb" hidden></div>
        <div class="row"><button class="btn alt small rd">🔊 Read aloud</button><button class="btn alt small grown" hidden>👩 A grown-up says it's right</button><button class="btn alt small show" hidden>📖 Show me the verse</button></div>`);
      SND.sfx("scroll");
      const inp = C.c.querySelector(".ans"), fb = C.c.querySelector(".fb"), grown = C.c.querySelector(".grown"), show = C.c.querySelector(".show");
      let tries = 0, done = false;
      const finish = async found => {
        if (done) return; done = true; C.close(); uiOut();
        if (found) giveGem("bible");
        await verseCard(found ? "✓ You found it in the Bible! +1 📘 gem" : "📖 Here is what Jonah did", dm.truth, dm.ref, dm.note);
        res(found);
      };
      const check = () => {
        const v = inp.value.trim(); if (!v || done) return;
        if (wordsMatch(v, f.keys)) { SND.sfx("ok"); fb.hidden = false; fb.className = "fb ok"; fb.textContent = "✓ Yes! That's what the Bible says."; inp.disabled = true; setTimeout(() => finish(true), 1000); return; }
        tries++; SND.sfx("no"); fb.hidden = false; fb.className = "fb no";
        fb.textContent = tries === 1 ? `Not quite. Read ${dm.ref} again, slowly. ${f.hint2 || ""}` : `Keep looking in ${dm.ref}. A grown-up can check your answer too.`;
        grown.hidden = false; if (tries >= 2) show.hidden = false;
        inp.select();
      };
      C.c.querySelector(".chk").onclick = check;
      inp.addEventListener("keydown", e => { e.stopPropagation(); if (e.key === "Enter") { e.preventDefault(); check(); } });
      grown.onclick = () => finish(true);
      show.onclick = () => finish(false);
      C.c.querySelector(".rd").onclick = () => speak(`Open your Bible to ${dm.ref}. ${f.q} ${f.hint}`);
      setTimeout(() => { try { inp.focus(); } catch (e) {} }, 350);
    });
  }

  function verseCard(title, text, ref, extra) {
    if (skipping) return Promise.resolve();
    return new Promise(res => {
      uiIn();
      const C = card(`<h2>${esc(title)}</h2><div class="verse">“${esc(text)}”<cite>${esc(ref)}</cite></div>${extra ? `<div class="small">${esc(extra)}</div>` : ""}
        <div class="row"><button class="btn">Got it ▶</button><button class="btn alt small rd">🔊 Read aloud</button></div>`);
      const fin = () => { adv = null; C.close(); uiOut(); res(); };
      C.c.querySelector(".btn").onclick = fin; adv = fin;
      C.c.querySelector(".rd").onclick = () => speak(text);
    });
  }

  // ---------- Level runtime ----------
  let LV = null;
  const vars = () => (mode === "cut" || !LV ? SCN.v : LV.vars);

  function builder(w, h = 12) {
    const g = [...Array(h)].map(() => Array(w).fill("."));
    const ents = [], decor = [];
    const b = {
      w, h, g, ents, decor,
      set(x, y, c) { if (x >= 0 && y >= 0 && x < w && y < h) g[y][x] = c; },
      fill(x0, y0, x1, y1, c = "#") { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) b.set(x, y, c); },
      ground(x0, x1, top = 9) { b.fill(x0, top, x1, h - 1, "#"); },
      clear(x0, y0, x1, y1) { b.fill(x0, y0, x1, y1, "."); },
      plat(x0, x1, y) { for (let x = x0; x <= x1; x++) b.set(x, y, "-"); },
      roof(x0, x1, y) { for (let x = x0; x <= x1; x++) b.set(x, y, ","); },
      block(x0, y0, x1 = x0, y1 = y0) { b.fill(x0, y0, x1, y1, "B"); },
      spikes(x0, x1, y) { for (let x = x0; x <= x1; x++) b.set(x, y, "^"); },
      water(x0, x1, y) { for (let x = x0; x <= x1; x++) b.set(x, y, "~"); },
      ent(type, x, y, o = {}) { const e = Object.assign({ type, x, y, w: 16, h: 16 }, o); ents.push(e); return e; },
      npc(tx, row, o) { return b.ent("npc", tx * 16, row * 16 - 24, Object.assign({ w: 16, h: 24 }, o)); },
      coin(tx, ty) { return b.ent("coin", tx * 16 + 4, ty * 16 + 4, { w: 8, h: 8 }); },
      coins(tx0, tx1, ty) { for (let x = tx0; x <= tx1; x++) b.coin(x, ty); },
      scroll(tx, ty, i) { return b.ent("scroll", tx * 16 + 2, ty * 16 + 3, { w: 12, h: 10, i }); },
      gate(tx, row, o) { const h = (o && o.h) || 48; return b.ent("gate", tx * 16, row * 16 - h, Object.assign({ w: 16, h, solid: true, oy: 0 }, o)); },
      cp(tx, row) { return b.ent("cp", tx * 16 + 3, row * 16 - 10, { w: 10, h: 10 }); },
      trig(tx0, tx1, fn, o) { return b.ent("trig", tx0 * 16, -200, Object.assign({ w: (tx1 - tx0 + 1) * 16, h: h * 16 + 400, fn }, o)); },
      spot(tx, row, o) { return b.ent("spot", tx * 16 + 2, row * 16 - 18, Object.assign({ w: 12, h: 12 }, o)); },
      haz(type, x, y, o) { return b.ent(type, x, y, Object.assign({ haz: true }, o)); },
      dec(type, tx, row, o) { decor.push({ type, x: tx * 16, y: row * 16, o: o || {} }); },
    };
    return b;
  }

  function newLevel(i) {
    const def = D.LEVELS[i];
    const jp = ((i % 2 === 0) !== !!S.swap) ? "d" : "l";
    LV = {
      i, def, rIdx: -1, room: null, map: null, mw: 0, mh: 0, ents: [], decor: [], t: 0,
      p: { x: 0, y: 0, w: 10, h: 22, vx: 0, vy: 0, face: 1, onGround: false, coyote: 0, jbuf: 0, swimCd: 0, dead: 0, anim: 0, pose: null, look: "jonah", inv: 0 },
      b: { x: 0, y: 0, w: 12, h: 12, vx: 0, vy: 0, face: 1, onGround: false, coyote: 0, jbuf: 0, swimCd: 0, dead: 0, anim: 0, inv: 0, bag: true },
      tug: 0, tagUntil: 0,
      cam: { x: 0, y: 0 }, cp: null, goals: [], vars: { light: 0, fade: 0, white: 0, flash: 0, storm: 0, shake: 0 },
      stats: { q: 0, first: 0 }, scrolls: [false, false, false], coins: 0, help: 2, gems: 0, lock: 0, auto: null,
      jonah: jp, keeper: jp === "d" ? "l" : "d", meter: null, ended: false,
    };
    assignRoles();
    return LV;
  }
  // Two players: Jonah and the bag swap brothers each level. One player: Davian is both.
  function assignRoles() {
    const jp = ((LV.i % 2 === 0) !== !!S.swap) ? "d" : "l";
    LV.jonah = solo() ? "d" : jp; LV.keeper = solo() ? "d" : jp === "d" ? "l" : "d";
  }
  function setPlayers(n) {
    S.players = n; save();
    if (LV) {
      assignRoles(); LV.tagUntil = LV.t + 360;
      bubble(solo() ? "1 player: Davian is Jonah, and the bag follows by itself." : `2 players: ${NAMES[LV.jonah]} is Jonah, ${NAMES[LV.keeper]} steers the bag.`, 4000);
    }
    refreshTouch();
  }
  function rolesLine() {
    const J = LV ? NAMES[LV.jonah] : "Davian", K = LV ? NAMES[LV.keeper] : "Levi";
    return solo() ? `${J} is Jonah and the Scroll Keeper. Jonah's bag follows him by itself.` : `${J} is Jonah. ${K} is Jonah's bag and the Scroll Keeper.`;
  }

  function enterRoom(r, sx, sy) {
    const def = LV.def.rooms[r];
    const b = builder(def.w, def.h || 12);
    def.build(b, G);
    LV.rIdx = r; LV.room = def; LV.map = b.g; LV.mw = b.w; LV.mh = b.h; LV.ents = b.ents.filter(e => !(e.type === "scroll" && LV.scrolls[e.i])); LV.decor = b.decor;
    const p = LV.p;
    p.x = (sx != null ? sx : def.start[0]) * 16 + 3; p.y = (sy != null ? sy : def.start[1]) * 16 - p.h; p.vx = p.vy = 0; p.dead = 0; p.pose = null;
    LV.cp = { x: p.x, y: p.y };
    bagToJonah(false); LV.tagUntil = LV.t + 360;
    LV.cam.x = Math.max(0, Math.min(LV.mw * 16 - W, p.x - W / 2)); LV.cam.y = Math.max(0, Math.min(LV.mh * 16 - H, p.y - H / 2));
    Object.assign(LV.vars, def.vars || {});
    if (def.music) SND.music(def.music);
    SND.ambient(def.ambient || null, def.ambVol || 0.25);
    $("#lvname").textContent = (LV.def.short || LV.def.title) + (def.name ? " · " + def.name : "");
    if (def.onEnter) runScript(def.onEnter);
  }

  // ---------- Goals and meter ----------
  const goal = {
    set(list) { LV.goals = list.map(g => Object.assign({ have: 0, n: 1 }, g)); drawGoals(); },
    add(id, k = 1) { const g = LV.goals.find(g => g.id === id); if (!g) return 0; const was = g.have >= g.n; g.have = Math.min(g.n, g.have + k); drawGoals(); if (!was && g.have >= g.n) SND.sfx("ok"); return g.have; },
    done(id) { const g = LV.goals.find(g => g.id === id); return !!g && g.have >= g.n; },
    allDone() { return LV.goals.every(g => g.have >= g.n); },
    get(id) { const g = LV.goals.find(g => g.id === id); return g ? g.have : 0; },
  };
  function drawGoals() {
    const box = $("#goals");
    if (!LV || !LV.goals.length) { box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = `<div class="head">GOALS</div>` + LV.goals.map(g => `<div class="g ${g.have >= g.n ? "done" : ""}"><span>${g.have >= g.n ? "✅" : "⬜"}</span><span class="lbl">${esc(g.label)}${g.n > 1 ? ` (${g.have}/${g.n})` : ""}</span></div>`).join("");
  }
  function meter(label, val, col) {
    const m = $("#meter");
    if (label == null) { m.hidden = true; return; }
    m.hidden = false; $("#meterLabel").textContent = label;
    const f = $("#meterFill"); f.style.width = Math.round(Math.max(0, Math.min(1, val)) * 100) + "%"; f.style.background = col || "var(--leaf)";
  }
  function drawHud() {
    $("#hudScrolls").textContent = "📜 " + LV.scrolls.filter(Boolean).length + "/3";
    const c = $("#hudCoins"); c.hidden = !LV.def.coins; c.textContent = "🪙 " + LV.coins + (LV.def.coins ? "/" + LV.def.coins : "");
  }

  // ---------- Scripts ----------
  async function runScript(fn, ...args) {
    LV && LV.lock++;
    try { await fn(G, ...args); } catch (e) { console.error(e); }
    finally { if (LV) LV.lock = Math.max(0, LV.lock - 1); }
  }
  function walkTo(x, speed) { return new Promise(res => { LV.auto = { x: x * 16 + 3, res, speed }; }); }
  function respawn() {
    const p = LV.p; p.x = LV.cp.x; p.y = LV.cp.y; p.vx = p.vy = 0; p.dead = 0; p.inv = 60;
    bagToJonah(false);
    if (LV.room.onRespawn) LV.room.onRespawn(G);
  }
  function hurt(msg) {
    const p = LV.p; if (p.dead || p.inv > 0) return;
    p.dead = 45; p.vy = -3; SND.sfx("hurt"); LV.vars.shake = 8;
    if (msg) bubble(msg, 2600);
  }

  // ---------- Physics ----------
  function tileAt(tx, ty) { if (ty < 0 || ty >= LV.mh) return "."; if (tx < 0 || tx >= LV.mw) return "#"; return LV.map[ty][tx]; }
  const SOLID = c => c === "#" || c === "B";
  function collides(x, y, w, h) {
    const x0 = Math.floor(x / TS), x1 = Math.floor((x + w - 0.001) / TS), y0 = Math.floor(y / TS), y1 = Math.floor((y + h - 0.001) / TS);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (SOLID(tileAt(tx, ty))) return true;
    for (const e of LV.ents) {
      if (e.gone) continue;
      if (e.solid && x < e.x + e.w && x + w > e.x && y < e.y + e.h - (e.oy || 0) && y + h > e.y) return true;
      // the stone wall above every gate reaches the sky, so nobody can jump over
      if (e.type === "gate" && x < e.x + e.w + 3 && x + w > e.x - 3 && y < e.y - 2 && y + h > e.y - 600) return true;
    }
    return false;
  }
  function oneWay(p, st) {
    const feet = p.y + p.h, ty = Math.floor((feet + st) / TS);
    if (!(feet <= ty * TS + 0.001 && feet + st > ty * TS)) return false;
    const x0 = Math.floor(p.x / TS), x1 = Math.floor((p.x + p.w - 0.001) / TS);
    for (let tx = x0; tx <= x1; tx++) { const c = tileAt(tx, ty); if (c === "-" || c === ",") return true; }
    return false;
  }
  function moveX(p, dx) {
    const s = Math.sign(dx); let rem = Math.abs(dx);
    while (rem > 0) { const st = Math.min(1, rem); if (collides(p.x + s * st, p.y, p.w, p.h)) { p.vx = 0; p.pushing = s; return; } p.x += s * st; rem -= st; }
  }
  function moveY(p, dy) {
    p.onGround = false;
    const s = Math.sign(dy); let rem = Math.abs(dy);
    while (rem > 0) {
      const st = Math.min(1, rem);
      if (collides(p.x, p.y + s * st, p.w, p.h) || (s > 0 && oneWay(p, st))) { if (s > 0) p.onGround = true; p.vy = 0; return; }
      p.y += s * st; rem -= st;
    }
  }
  function overlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

  // Moves one body (Jonah or the bag) by its controls. Returns a hurt message when it lands in danger.
  function updateBody(p, ctl) {
    const R = LV.room;
    const swim = R.swim, maxV = ctl.speed || (swim ? 1.35 : 1.9) * (p.slow ? 0.55 : 1), acc = p.onGround ? 0.35 : 0.25;
    if (ctl.left && !ctl.right) { p.vx = Math.max(p.vx - acc, -maxV); p.face = -1; }
    else if (ctl.right && !ctl.left) { p.vx = Math.min(p.vx + acc, maxV); p.face = 1; }
    else { p.vx *= p.onGround || swim ? 0.7 : 0.92; if (Math.abs(p.vx) < 0.05) p.vx = 0; }
    if (p.vx > maxV) p.vx = maxV; if (p.vx < -maxV) p.vx = -maxV;
    const drift = LV.vars.drift || 0;
    if (swim) {
      p.vy += 0.06; if (p.vy > 1.1) p.vy = 1.1;
      if (p.swimCd > 0) p.swimCd--;
      if (ctl.jumpPress && p.swimCd <= 0) { p.vy = -2.1; p.swimCd = 10; SND.sfx("swim"); fx.push({ k: "bub", x: p.x + 5, y: p.y, t: 0 }); }
    } else {
      if (ctl.jumpPress) p.jbuf = 7; else if (p.jbuf > 0) p.jbuf--;
      if (p.onGround) p.coyote = 6; else if (p.coyote > 0) p.coyote--;
      if (p.jbuf > 0 && p.coyote > 0) { p.vy = -6.8; p.jbuf = 0; p.coyote = 0; SND.sfx("jump"); }
      if (!ctl.jumpHeld && p.vy < -2.4) p.vy = -2.4;
      p.vy += 0.36; if (p.vy > 6.5) p.vy = 6.5;
    }
    p.pushing = 0;
    const wasGround = p.onGround;
    moveX(p, p.vx + (p.onGround ? drift : drift * 0.5));
    moveY(p, p.vy);
    if (p.onGround && !wasGround) p.land = 6;
    if (p.land > 0) p.land--;
    if (swim && p.y < (R.surface || 0)) { p.y = R.surface || 0; if (p.vy < 0) p.vy = 0; }
    p.anim += Math.abs(p.vx) * 0.11;
    if (p.y > LV.mh * TS + 24) return true;
    // thorns, sharp rocks, deep water
    const fx0 = Math.floor((p.x + 2) / TS), fx1 = Math.floor((p.x + p.w - 3) / TS), fy0 = Math.floor((p.y + Math.min(8, p.h / 2)) / TS), fy1 = Math.floor((p.y + p.h - 1) / TS);
    for (let ty = fy0; ty <= fy1; ty++) for (let tx = fx0; tx <= fx1; tx++) {
      const c = tileAt(tx, ty);
      if (c === "^" && p.y + p.h > ty * TS + 6) return R.spikeMsg || "Ouch! Careful!";
      if (c === "~" && p.y + p.h > ty * TS + 4) { SND.sfx("splash"); return "Splash! Try again."; }
    }
    return null;
  }
  function updatePlayer() {
    const p = LV.p;
    if (p.inv > 0) p.inv--;
    if (p.dead > 0) { p.dead--; p.vy += 0.3; p.y += p.vy; if (p.dead === 0) respawn(); return; }
    const inp = inputFor(LV.jonah);
    let ctl = { left: inp.k.left, right: inp.k.right, jumpHeld: inp.k.jump || inp.k.up, jumpPress: inp.p.jump || inp.p.up };
    if (LV.auto) {
      const dx = LV.auto.x - p.x;
      ctl = { left: dx < -1.5, right: dx > 1.5, speed: LV.auto.speed };
      if (!ctl.left && !ctl.right) { const r = LV.auto.res; LV.auto = null; p.vx = 0; r(); }
    } else if (LV.lock || p.pose) ctl = {};
    const bad = updateBody(p, ctl);
    if (bad) hurt(bad === true ? null : bad);
  }

  // ---------- Jonah's bag: the Scroll Keeper's own character ----------
  const LEASH = 250;
  const bagOn = () => LV && LV.b && !LV.p.hidden;
  function bagToJonah(poof) {
    const p = LV.p, b = LV.b;
    b.x = p.x + p.w / 2 - b.w / 2 - p.face * 14; b.y = p.y + p.h - b.h; b.vx = b.vy = 0; b.dead = 0; b.face = p.face;
    if (collides(b.x, b.y, b.w, b.h)) b.x = p.x + (p.w - b.w) / 2;
    if (poof) { b.inv = 40; SND.sfx("bubble"); for (let i = 0; i < 6; i++) fx.push({ k: "poof", x: b.x + 5, y: b.y + 5, a: i, t: 0 }); }
    LV.tug = 0;
  }
  function hurtBag(msg) {
    const b = LV.b; if (b.dead || b.inv > 0) return;
    b.dead = 36; b.vy = -2.6; SND.sfx("hurt");
    if (msg) bubble("🎒 " + msg, 2400);
  }
  // The bag follows Jonah on its own in one-player mode and while a story script walks Jonah somewhere.
  function followCtl(b, p) {
    const tx = p.x + p.w / 2 - p.face * 16, dx = tx - (b.x + b.w / 2);
    const ctl = { left: dx < -6, right: dx > 6, jumpHeld: b.vy < 0, jumpPress: false };
    if (LV.room.swim) { if (b.y > p.y + 6) ctl.jumpPress = true; }
    else if (b.onGround && ((b.pushing && Math.abs(dx) > 6) || (p.y + p.h < b.y + b.h - 14 && Math.abs(dx) < 48))) ctl.jumpPress = ctl.jumpHeld = true;
    b.stuck = Math.abs(dx) > 40 ? (b.stuck || 0) + 1 : 0;
    if (b.stuck > 120 || Math.abs(dx) > 170) { bagToJonah(true); b.stuck = 0; return {}; }
    return ctl;
  }
  function updateBag() {
    const b = LV.b, p = LV.p;
    if (!bagOn()) return;
    if (b.inv > 0) b.inv--;
    if (b.dead > 0) { b.dead--; b.vy += 0.3; b.y += b.vy; if (b.dead === 0) bagToJonah(true); return; }
    let ctl;
    if (solo() || LV.auto) ctl = followCtl(b, p);
    else if (LV.lock) ctl = {};
    else { const inp = inputFor(LV.keeper); ctl = { left: inp.k.left, right: inp.k.right, jumpHeld: inp.k.jump || inp.k.up, jumpPress: inp.p.jump || inp.p.up }; }
    const bad = updateBody(b, ctl);
    if (bad) hurtBag(bad === true ? "The bag fell! It hops back to Jonah." : bad);
  }
  // Jonah and the bag must stay on the same screen. Whoever walks away is held back;
  // if Jonah keeps pulling, the bag gets tugged along on its strap.
  function leash() {
    const p = LV.p, b = LV.b;
    if (!bagOn() || p.dead || b.dead) return;
    const d = (p.x + p.w / 2) - (b.x + b.w / 2), s = Math.sign(d);
    if (Math.abs(d) <= LEASH) { LV.tug = 0; return; }
    if (Math.abs(d) > LEASH + 80 || LV.auto) { bagToJonah(true); return; }
    if (p.vx * s > 0) { p.x = b.x + b.w / 2 + s * LEASH - p.w / 2; p.vx = 0; }
    if (b.vx * -s > 0) { b.x = p.x + p.w / 2 - s * LEASH - b.w / 2; b.vx = 0; }
    LV.tug++;
    if (LV.tug === 20) bubble(`Stay together! Jonah and the bag can't leave each other behind.`, 2600);
    if (LV.tug > 150) { bagToJonah(true); bubble("🎒 Whoosh! Jonah pulls the bag along by its strap.", 2400); }
  }
  const bodies = () => (bagOn() && !LV.b.dead ? [LV.p, LV.b] : [LV.p]);
  function hit(q, msg) { if (q === LV.p) hurt(msg); else hurtBag(msg); }

  // ---------- Entities ----------
  const fx = [];
  function nearestInteract() {
    const p = LV.p; let best = null, bd = 1e9;
    for (const e of LV.ents) {
      if (e.gone || !e.act || e.type === "trig" || e.type === "gate") continue;
      if (e.type === "npc" && e.quiet) continue;
      const cx = e.x + e.w / 2, cy = e.y + e.h / 2, px = p.x + p.w / 2, py = p.y + p.h / 2;
      const dx = Math.abs(cx - px), dy = Math.max(0, Math.abs(cy - py) - e.h / 2);
      if (dx < 24 + e.w / 2 && dy < 30 && dx < bd) { bd = dx; best = e; }
    }
    return best;
  }
  // A gate opens only when Jonah AND the bag wait beside it together for 3 seconds.
  const GATE_WAIT = 180;
  function nearGate(e, q) {
    const dx = Math.abs((q.x + q.w / 2) - (e.x + e.w / 2));
    return dx < 44 && q.y + q.h > e.y - 8 && q.y < e.y + e.h + 8 && !q.dead;
  }
  function updateGate(e) {
    if (!e.solid) { e.ready = false; return; }
    e.nj = nearGate(e, LV.p); e.nb = !bagOn() || nearGate(e, LV.b);
    if (e.nj && e.nb && !LV.lock) e.wait = Math.min(GATE_WAIT, (e.wait || 0) + 1);
    else e.wait = Math.max(0, (e.wait || 0) - 4);
    e.alone = e.nj && !e.nb ? (e.alone || 0) + 1 : 0;
    if (e.alone === 480) bubble("Is the bag stuck? Open the ☰ menu and choose “Bring the bag to Jonah”.", 5000);
    const was = e.ready; e.ready = e.wait >= GATE_WAIT;
    if (e.ready && !was) {
      SND.sfx("scroll");
      if (!LV.readyHint) { LV.readyHint = 1; bubble(`${NAMES[LV.keeper]}, you're the Scroll Keeper: press ${keyName(LV.keeper, "talk")} to open the gate!`, 3800); }
    }
  }
  function updateEnts() {
    const p = LV.p, t = LV.t, all = bodies();
    for (const e of LV.ents) {
      if (e.gone) continue;
      switch (e.type) {
        case "coin": if (all.some(q => overlap(q, e))) { e.gone = true; LV.coins++; SND.sfx("coin"); if (LV.def.onCoin) LV.def.onCoin(G); } break;
        case "scroll": { const q = all.find(q => overlap(q, e)); if (q) { e.gone = true; LV.scrolls[e.i] = true; SND.sfx("scroll"); const s = LV.def.scrolls[e.i]; runScript(async g => g.verseCard(`📜 Verse scroll ${LV.scrolls.filter(Boolean).length} of 3${q.bag ? " (the bag found it!)" : ""}`, s.text, s.ref, s.note)); } break; }
        case "cp": if (!e.on && overlap(p, { x: e.x - 6, y: e.y - 20, w: e.w + 12, h: e.h + 30 })) { LV.ents.forEach(o => { if (o.type === "cp") o.on = false; }); e.on = true; LV.cp = { x: e.x - 3, y: e.y + e.h - p.h }; SND.sfx("blip"); } break;
        case "trig": { const ins = overlap(p, e); if (ins && !e.inside && !e.done && (!e.when || e.when(G))) { e.inside = true; e.done = !e.repeat; runScript(e.fn); } else if (!ins) e.inside = false; break; }
        case "jelly": { e.bx = e.bx ?? e.x; e.by = e.by ?? e.y; e.y = e.by + Math.sin(t * (e.sp || 0.03) + (e.ph || 0)) * (e.amp || 24); if (e.dx) e.x = e.bx + Math.sin(t * 0.01 + (e.ph || 0)) * e.dx; all.forEach(q => { if (overlap(q, shrink(e, 2))) hit(q, "Ouch! A jellyfish!"); }); break; }
        case "crab": { e.x0 = e.x0 ?? e.x - 30; e.x1 = e.x1 ?? e.x + 30; e.dir = e.dir || 1; e.x += e.dir * (e.sp || 0.5); if (e.x < e.x0 || e.x > e.x1) e.dir *= -1; all.forEach(q => { if (overlap(q, shrink(e, 2))) hit(q, "Ouch! A crab pinched you!"); }); break; }
        case "barrel": {
          const tilt = Math.sin(t * 0.02 + (e.ph || 0));
          e.vx = (e.vx || 0) * 0.98 + tilt * 0.06; e.x += e.vx;
          if (e.x < e.x0) { e.x = e.x0; e.vx = Math.abs(e.vx) * 0.5; } if (e.x > e.x1) { e.x = e.x1; e.vx = -Math.abs(e.vx) * 0.5; }
          e.rot = (e.rot || 0) + e.vx * 0.25;
          if (Math.abs(e.vx) > 0.25) all.forEach(q => { if (overlap(q, shrink(e, 3))) hit(q, "Watch out for the barrels!"); });
          break;
        }
        case "teeth": {
          const per = e.per || 150, k = ((t + (e.ph || 0)) % per) / per;
          // 0..0.45 open, 0.45..0.55 closing, 0.55..0.75 shut, 0.75..1 opening
          e.c = k < 0.45 ? 0 : k < 0.55 ? (k - 0.45) / 0.1 : k < 0.75 ? 1 : 1 - (k - 0.75) / 0.25;
          if (e.c > 0.3) all.forEach(q => { if (overlap(q, { x: e.x + 3, y: e.y, w: e.w - 6, h: 14 + (e.h - 14) * e.c })) hit(q, "Chomp! Wait for the tooth to go up."); });
          if (e.c > 0.9 && !e.snd && Math.abs(p.x - e.x) < 160) { e.snd = 1; SND.sfx("chomp"); } if (e.c < 0.5) e.snd = 0;
          break;
        }
        case "weed": all.forEach(q => { if (overlap(q, e)) q.slow = 30; }); break;
        case "pickup": if (all.some(q => overlap(q, e))) { e.gone = true; SND.sfx("coin"); if (e.goal) goal.add(e.goal); if (e.fn) runScript(e.fn, e); } break;
        case "gate": updateGate(e); break;
        case "shade": break;
        case "animal": { e.bx = e.bx ?? e.x; e.dir = e.dir || 1; if (t % 3 === 0) e.x += e.dir * 0.3; if (Math.abs(e.x - e.bx) > (e.range || 20)) e.dir *= -1; break; }
        case "npc": if (e.walk) { const dx = e.walk.x - e.x; if (Math.abs(dx) < 1) { const r = e.walk.res; e.walk = null; r(); } else { e.x += Math.sign(dx) * Math.min(Math.abs(dx), e.walk.sp || 0.8); e.face = Math.sign(dx); e.anim = (e.anim || 0) + 0.12; } } break;
      }
      if (e.update) e.update(e, G, t);
    }
    all.forEach(q => { if (q.slow > 0) q.slow--; });
    const it = nearestInteract(), gate = LV.ents.find(e => e.type === "gate" && e.solid && e.ready);
    const jt = document.querySelector(`#touch [data-who="${LV.jonah}"] [data-k="talk"]`), kt = document.querySelector(`#touch [data-who="${LV.keeper}"] [data-k="talk"]`);
    if (jt) jt.classList.toggle("hint", !!it); if (kt) kt.classList.toggle("hint", !!gate || (solo() && !!it));
    LV.near = it;
    if (!p.dead && !LV.lock) {
      if (gate && P.talk) { P.talk = 0; runScript(gateAct, gate); }
      else if (it && inputFor(LV.jonah).p.talk) runScript(it.act, it);
    }
    // walking into a closed gate: explain what is needed
    const shut = LV.ents.find(e => e.type === "gate" && e.solid && !e.ready && (e.nj || e.nb));
    if (shut && p.pushing && !shut.hinted) {
      shut.hinted = true;
      bubble(shut.nb ? "Wait together at the gate... the Scroll Keeper's key is coming!" : `The gate is shut. Wait for ${solo() ? "" : NAMES[LV.keeper] + " and "}the bag: Jonah and the bag must stand at the gate together.`, 4000);
    }
  }
  const shrink = (e, k) => ({ x: e.x + k, y: e.y + k, w: e.w - 2 * k, h: e.h - 2 * k });

  async function gateAct(g, e) {
    if (e.needs && !e.needs.every(id => goal.done(id))) { await think(e.needMsg || "The way is shut. I should finish my goals first."); return; }
    if (e.before) await e.before(g, e);
    if (e.q) await ask(e.q);
    e.solid = false; SND.sfx("gate");
    await tween(e, "oy", e.h - 4, 900);
    if (e.goal) goal.add(e.goal);
    if (e.after) await e.after(g, e);
  }

  function updateCamera() {
    const p = LV.p, c = LV.cam, wpx = LV.mw * TS, hpx = LV.mh * TS;
    const b = LV.b, mid = bagOn() && !b.dead ? (p.x + p.w / 2 + b.x + b.w / 2) / 2 : p.x + p.w / 2 + p.face * 18;
    const tx = Math.max(0, Math.min(wpx - W, mid - W / 2));
    c.x += (tx - c.x) * 0.12;
    if (LV.camLock != null) c.x += (LV.camLock - c.x) * 0.08;
    const ty = Math.max(0, Math.min(hpx - H, p.y + p.h / 2 - H / 2));
    c.y += (ty - c.y) * 0.12;
    c.x = Math.max(0, Math.min(wpx - W, c.x)); c.y = Math.max(0, Math.min(Math.max(0, hpx - H), c.y));
  }

  // ---------- Drawing ----------
  const GLYPH = {
    "!": ["010", "010", "010", "000", "010"],
    "E": ["111", "100", "110", "100", "111"],
    "?": ["111", "001", "011", "000", "010"],
    ".": ["000", "000", "000", "000", "101"],
    "D": ["110", "101", "101", "101", "110"],
    "L": ["100", "100", "100", "100", "111"],
  };
  function markBubble(x, y, ch, bg = "#fff", fg = "#1c1426") {
    x = Math.round(x); y = Math.round(y);
    ctx.fillStyle = ART.OL; ctx.fillRect(x - 1, y - 1, 9, 9); ctx.fillStyle = bg; ctx.fillRect(x, y, 7, 7);
    ctx.fillStyle = bg; ctx.fillRect(x + 2, y + 7, 3, 2);
    const g = GLYPH[ch] || GLYPH["!"]; ctx.fillStyle = fg;
    g.forEach((row, j) => [...row].forEach((v, i) => { if (v === "1") ctx.fillRect(x + 2 + i, y + 1 + j, 1, 1); }));
  }
  // Above a shut gate: who has arrived (Jonah, bag) and how long until the Scroll Keeper can open it.
  function drawGateWait(e, t) {
    if (!e.solid) return;
    // drawn on the door itself, low enough that hint bubbles at the top never cover it
    const cx = Math.round(e.x + e.w / 2), y = Math.round(e.y + e.h - 45);
    if (e.ready) { markBubble(cx - 4, y + 2 + Math.sin(t * 0.1) * 1.5, "E", "#ffe58a"); return; }
    if (!e.nj && !e.nb && Math.abs(LV.p.x - e.x) > 90) return;
    const icon = (x, on, bag) => {
      ctx.globalAlpha = on ? 1 : 0.45;
      ctx.fillStyle = ART.OL; ctx.fillRect(x - 1, y - 1, 10, 10);
      ctx.fillStyle = on ? "#7ad35a" : "#e8e0d0"; ctx.fillRect(x, y, 8, 8);
      if (bag) { ctx.fillStyle = "#a0703c"; ctx.fillRect(x + 1, y + 3, 6, 4); ctx.fillStyle = "#7a5028"; ctx.fillRect(x + 1, y + 3, 6, 1); ctx.fillRect(x + 2, y + 1, 4, 1); ctx.fillRect(x + 2, y + 1, 1, 2); ctx.fillRect(x + 5, y + 1, 1, 2); }
      else { ctx.fillStyle = "#c98f5f"; ctx.fillRect(x + 2, y + 2, 4, 5); ctx.fillStyle = "#3b2616"; ctx.fillRect(x + 2, y + 1, 4, 2); ctx.fillRect(x + 2, y + 6, 4, 1); }
      ctx.globalAlpha = 1;
    };
    icon(cx - 10, e.nj, false); icon(cx + 2, e.nb, true);
    ctx.fillStyle = ART.OL; ctx.fillRect(cx - 11, y + 11, 22, 4);
    ctx.fillStyle = "#f2c14e"; ctx.fillRect(cx - 10, y + 12, Math.round(20 * (e.wait || 0) / GATE_WAIT), 2);
  }
  // Jonah's bag: a leather satchel with a scroll poking out and two eyes. Faces right; flipped for left.
  const BAG_ART = [
    ".....OOOOOO.....",
    "....O.OSSO.O....",
    "...O..OSSO..O...",
    "...O..OsSO..O...",
    ".OOOOOOOOOOOOOO.",
    "ODDDDDDDDDDDDDDO",
    "OLDDDDDDDDDDDDDO",
    "OLDDDDDYYDDDDDDO",
    "OLBBBBBDDBBBBBBO",
    "OLBWWBBBBBBWWBBO",
    "OLBWOBBBBBBWOBBO",
    "OLBBBBBBBBBBBBBO",
    ".OBBBBBBBBBBBBO.",
    "..OOOOOOOOOOOO..",
  ];
  const BAG_PAL = { O: ART.OL, D: "#7a5028", L: "#c99a5c", B: "#a8743e", Y: "#f2c14e", S: "#f2e3bd", s: "#b8834a", W: "#ffffff" };
  const bagImg = [0, 1].map(blink => {
    const c = ART.mk(16, 14), x = c.getContext("2d");
    BAG_ART.forEach((row, j) => [...row].forEach((ch, i) => {
      let k = ch;
      if (blink && j === 9 && (k === "W" || k === "O")) k = "B";
      if (blink && j === 10 && (k === "W" || k === "O")) k = "O";
      if (BAG_PAL[k]) { x.fillStyle = BAG_PAL[k]; x.fillRect(i, j, 1, 1); }
    }));
    return c;
  });
  function drawBag(b, t) {
    if (b.inv > 0 && Math.floor(b.inv / 4) % 2) return;
    const moving = Math.abs(b.vx) > 0.2 && b.onGround;
    const hop = moving ? Math.abs(Math.sin(b.anim * 2.2)) * 2 : 0, sq = b.land > 0 ? 0.85 : 1;
    ctx.save();
    ctx.translate(Math.round(b.x + b.w / 2), Math.round(b.y + b.h - hop));
    if (b.dead) ctx.rotate(b.face * 0.6);
    else if (LV.room.swim) ctx.rotate(Math.sin(t * 3) * 0.12);
    ctx.scale((b.face < 0 ? -1 : 1) * (2 - sq), sq);
    ctx.drawImage(bagImg[(Math.floor(t * 60) % 200) < 7 ? 1 : 0], -8, -14);
    ctx.restore();
  }
  // Each brother's initial floats above his character for a few seconds when a room starts.
  function drawTags(t) {
    if (LV.t > LV.tagUntil || solo()) return;
    const p = LV.p, b = LV.b, bob = Math.sin(t * 6) * 1.5;
    markBubble(p.x + 1, p.y - 16 + bob, LV.jonah.toUpperCase(), "#ffe58a");
    if (bagOn()) markBubble(b.x + 1, b.y - 22 + bob, LV.keeper.toUpperCase(), "#bfe8ff");
  }
  function drawChar(look, x, y, pose, frame, face, extra = {}) {
    const L = typeof look === "string" ? D.LOOKS[look] : look;
    const img = ART.char(L, pose, frame);
    ctx.save();
    ctx.translate(Math.round(x + 8), Math.round(y + 12));
    if (extra.rot) ctx.rotate(extra.rot);
    if (face < 0) ctx.scale(-1, 1);
    if (extra.alpha != null) ctx.globalAlpha = extra.alpha;
    ctx.drawImage(img, -9, -13);
    ctx.restore();
  }
  function drawTiles() {
    const cam = LV.cam, R = LV.room;
    const x0 = Math.floor(cam.x / TS), x1 = Math.ceil((cam.x + W) / TS), y0 = Math.floor(cam.y / TS), y1 = Math.ceil((cam.y + H) / TS);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      const c = tileAt(tx, ty); if (c === "." || c === "," || tx < 0 || tx >= LV.mw) continue;
      const th = (R.themeAt && R.themeAt(tx)) || LV.vars.theme || R.theme;
      let img;
      if (c === "#") img = ART.tile(th, tileAt(tx, ty - 1) === "#" ? "fill" : "top", (tx * 7 + ty * 3) % 4);
      else if (c === "-") img = ART.tile(th, "plat");
      else if (c === "B") img = ART.tile(th, "block");
      else if (c === "^") img = ART.tile(th, "spike");
      else if (c === "~") img = ART.tile(th, "water", LV.t >> 3);
      if (img) ctx.drawImage(img, tx * TS, ty * TS);
    }
  }
  function drawEnt(e) {
    const t = LV.t;
    switch (e.type) {
      case "npc": {
        const p = LV.p, face = e.face || (p.x > e.x ? 1 : -1);
        const fr = e.walk ? 1 + (Math.floor(e.anim || 0) % 2) : 0;
        drawChar(e.look, e.x, e.y, e.pose || "idle", fr, e.walk ? e.face : face);
        if (e.mark && !e.quiet) markBubble(e.x + 4, e.y - 14 + Math.sin(t * 0.1) * 1.5, e.mark, e.mark === "!" ? "#ffe58a" : "#fff");
        break;
      }
      case "coin": ctx.drawImage(ART.spr("coin", Math.floor(t / 7)), e.x - 1, e.y - 1 + Math.sin(t * 0.08 + e.x) * 1.5); break;
      case "scroll": {
        const y = e.y + Math.sin(t * 0.06 + e.x) * 2;
        ctx.fillStyle = "rgba(255,230,140,.25)"; ctx.beginPath(); ctx.arc(e.x + 6, y + 5, 10 + Math.sin(t * 0.1) * 2, 0, 7); ctx.fill();
        ctx.drawImage(ART.spr("scroll", Math.floor(t / 20)), e.x - 1, y - 1);
        break;
      }
      case "gate": {
        const x = e.x, y = e.y, h = e.h, oy = e.oy || 0;
        if (e.style === "teeth") {
          if (oy < h - 1) { const gy = y - oy; ctx.save(); ctx.beginPath(); ctx.rect(x - 4, y - 4, e.w + 8, h + 8); ctx.clip(); ctx.fillStyle = "#f2e6d0"; for (let i = 0; i < 2; i++) { ctx.fillRect(x - 2 + i * 10, gy, 8, h - 6); ctx.fillRect(x + i * 10, gy + h - 6, 4, 6); } ctx.restore(); }
          drawGateWait(e, t);
          break;
        }
        // the stone tower above the door: it goes all the way up, so the gate can't be jumped
        const post = e.post || "#9a9080", top = Math.max(LV.cam.y - 8, y - 600);
        ctx.fillStyle = ART.shade(post, -0.12); ctx.fillRect(x - 4, top, e.w + 8, y - 8 - top);
        ctx.fillStyle = ART.shade(post, -0.32);
        for (let yy = y - 13, r = 0; yy > top; yy -= 6, r++) { ctx.fillRect(x - 4, yy, e.w + 8, 1); for (let xx = x - 4 + (r % 2 ? 6 : 0); xx < x + e.w + 4; xx += 12) ctx.fillRect(xx, yy + 1, 1, 5); }
        ctx.fillStyle = ART.shade(post, 0.15); ctx.fillRect(x - 4, top, 1, y - 8 - top);
        if (oy < h - 1) {
          ctx.save(); ctx.beginPath(); ctx.rect(x - 2, y - 8, e.w + 4, h + 8); ctx.clip();
          const gy = y - oy;
          ctx.fillStyle = e.col || "#8a5a2b"; ctx.fillRect(x + 1, gy, 14, h);
          ctx.fillStyle = ART.shade(e.col || "#8a5a2b", -0.3);
          for (let i = 4; i < 14; i += 4) ctx.fillRect(x + i, gy, 1, h);
          ctx.fillRect(x + 1, gy + 8, 14, 2); ctx.fillRect(x + 1, gy + h - 10, 14, 2);
          // Scroll Keeper seal
          ctx.fillStyle = "#f2e3bd"; ctx.fillRect(x + 4, gy + h / 2 - 5, 8, 10); ctx.fillStyle = "#b8834a"; ctx.fillRect(x + 3, gy + h / 2 - 6, 10, 2); ctx.fillRect(x + 3, gy + h / 2 + 4, 10, 2);
          ctx.fillStyle = "#8a6a3a"; ctx.fillRect(x + 6, gy + h / 2 - 2, 4, 1); ctx.fillRect(x + 6, gy + h / 2 + 1, 4, 1);
          ctx.restore();
        }
        ctx.fillStyle = post; ctx.fillRect(x - 3, y - 6, 4, h + 6); ctx.fillRect(x + e.w - 1, y - 6, 4, h + 6); ctx.fillRect(x - 4, y - 8, e.w + 8, 4);
        ctx.fillStyle = ART.shade(post, 0.25); ctx.fillRect(x - 4, y - 8, e.w + 8, 1);
        drawGateWait(e, t);
        break;
      }
      case "cp": ctx.drawImage(ART.spr("lamp", e.on ? 1 : 0), e.x - 1, e.y - 1); if (e.on) { ctx.fillStyle = "rgba(255,210,90,.15)"; ctx.beginPath(); ctx.arc(e.x + 9, e.y + 1, 12, 0, 7); ctx.fill(); } break;
      case "jelly": ctx.drawImage(ART.spr("jelly", Math.floor(t / 15)), e.x - 1, e.y - 1); break;
      case "crab": { ctx.save(); ctx.translate(Math.round(e.x + 7), Math.round(e.y)); ctx.drawImage(ART.spr("crab", Math.floor(t / 10)), -8, -1); ctx.restore(); break; }
      case "barrel": { ctx.save(); ctx.translate(Math.round(e.x + 7), Math.round(e.y + 7)); ctx.drawImage(ART.spr("barrel", Math.floor(Math.abs(e.rot || 0)) % 4), -8, -8); ctx.restore(); break; }
      case "teeth": {
        // a big fang that slams down from the roof of the fish's mouth
        const len = 14 + (e.h - 14) * (e.c || 0), x = e.x, y = e.y;
        for (let r = 0; r < len; r += 2) {
          const k = r / len, w = Math.max(2, Math.round(14 * (1 - k * k * 0.85)));
          ctx.fillStyle = "#f2e6d0"; ctx.fillRect(x + 8 - w / 2, y + r, w, 2);
          ctx.fillStyle = "#c9b8a0"; ctx.fillRect(x + 8 - w / 2, y + r, 1, 2);
          ctx.fillStyle = "#fffaf0"; if (w > 6) ctx.fillRect(x + 8 + w / 2 - 3, y + r, 1, 2);
        }
        ctx.fillStyle = "#b04a60"; ctx.fillRect(x - 1, y - 4, 18, 6);
        if ((e.c || 0) > 0.9) { ctx.fillStyle = "rgba(255,255,255,.6)"; ctx.fillRect(x - 2, y + len - 1, 20, 2); }
        break;
      }
      case "weed": { for (let i = 0; i < e.w; i += 4) ART.decor(ctx, "seaweed", e.x + i, e.y + e.h, t / 60, { h: e.h - 4, c: "#3f8a4a" }); break; }
      case "spot": {
        if (e.done) { ctx.globalAlpha = 0.35; ctx.drawImage(ART.spr("spot", 0), e.x - 1, e.y - 1); ctx.globalAlpha = 1; }
        else { ctx.fillStyle = "rgba(255,230,140,.25)"; ctx.beginPath(); ctx.arc(e.x + 6, e.y + 6, 12 + Math.sin(t * 0.08) * 3, 0, 7); ctx.fill(); ctx.drawImage(ART.spr("spot", Math.floor(t / 8)), e.x - 1, e.y - 1); if (LV.near === e) markBubble(e.x + 3, e.y - 14, "E", "#ffe58a"); }
        break;
      }
      case "pickup": ctx.drawImage(ART.spr(e.spr || "branch"), e.x - 1, e.y - 1 + Math.sin(t * 0.07 + e.x) * 1.5); break;
      case "animal": { ctx.save(); ctx.translate(Math.round(e.x + 7), Math.round(e.y)); if (e.dir < 0) ctx.scale(-1, 1); ctx.drawImage(ART.spr(e.spr || "sheep", Math.floor(t / 20)), -8, -1); ctx.restore(); break; }
      case "prop": if (e.draw) e.draw(ctx, e, t); break;
      case "exit": if (e.draw) e.draw(ctx, e, t); else { ctx.fillStyle = "rgba(255,240,160,.25)"; ctx.fillRect(e.x, e.y, e.w, e.h); } break;
    }
    if (e.type !== "npc" && e.type !== "gate" && e.type !== "spot" && e.act && LV.near === e) markBubble(e.x + e.w / 2 - 4, e.y - 14, "E", "#ffe58a");
  }
  function drawPlayer() {
    const p = LV.p; if (p.hidden) return;
    if (p.inv > 0 && Math.floor(p.inv / 4) % 2) return;
    let pose = p.pose || "idle", frame = 0, rot = 0;
    if (!p.pose) {
      if (LV.room.swim) { pose = "jump"; rot = p.face * (0.9 + Math.sin(LV.t * 0.1) * 0.1); }
      else if (!p.onGround) pose = "jump";
      else if (Math.abs(p.vx) > 0.2) frame = 1 + (Math.floor(p.anim) % 2);
    }
    if (p.dead) rot = p.face * 0.5;
    if (pose === "sleep") { drawChar(LV.p.look, p.x - 6, p.y + 6, "idle", 0, p.face, { rot: -Math.PI / 2 * p.face }); return; }
    drawChar(p.look, p.x - 3, p.y - 2, pose, frame, p.face, { rot });
  }
  function drawFx() {
    for (let i = fx.length - 1; i >= 0; i--) {
      const f = fx[i]; f.t++;
      if (f.k === "bub") { f.y -= 0.6; f.x += Math.sin(f.t * 0.2) * 0.3; ctx.drawImage(ART.spr("bubble"), f.x, f.y); if (f.t > 90) fx.splice(i, 1); }
      else if (f.k === "poof") { const a = f.a * 1.05, r = f.t * 0.7; ctx.fillStyle = `rgba(255,255,255,${1 - f.t / 24})`; ctx.fillRect(Math.round(f.x + Math.cos(a) * r) - 1, Math.round(f.y + Math.sin(a) * r) - 1, 3, 3); if (f.t > 24) fx.splice(i, 1); }
    }
  }
  function drawRain(n, t) {
    ctx.strokeStyle = "rgba(180,200,255,.55)"; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 0; i < n; i++) { const x = (i * 53 + t * 7) % 340 - 10, y = (i * 97 + t * 11) % 210 - 10; ctx.moveTo(x, y); ctx.lineTo(x - 4, y + 9); }
    ctx.stroke();
  }
  const dark = ART.mk(W, H), dctx = dark.getContext("2d");
  function drawDark(amount, lights) {
    dctx.globalCompositeOperation = "source-over"; dctx.clearRect(0, 0, W, H);
    dctx.fillStyle = `rgba(10,0,6,${amount})`; dctx.fillRect(0, 0, W, H);
    dctx.globalCompositeOperation = "destination-out";
    lights.forEach(([x, y, r]) => { const g = dctx.createRadialGradient(x, y, 4, x, y, r); g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(1, "rgba(0,0,0,0)"); dctx.fillStyle = g; dctx.beginPath(); dctx.arc(x, y, r, 0, 7); dctx.fill(); });
    ctx.drawImage(dark, 0, 0);
  }
  function drawLight(v, t) {
    if (!(v.light > 0)) return;
    ctx.fillStyle = `rgba(10,8,20,${0.45 * v.light})`; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalAlpha = v.light;
    const cx = v.lightX != null ? v.lightX : W / 2;
    for (let i = 0; i < 7; i++) {
      const a = (i - 3) * 0.16 + Math.sin(t * 0.6 + i) * 0.02;
      ctx.fillStyle = i % 2 ? "rgba(255,236,160,.22)" : "rgba(255,250,210,.16)";
      ctx.beginPath(); ctx.moveTo(cx - 6, -10); ctx.lineTo(cx + 6, -10); ctx.lineTo(cx + Math.sin(a) * 260 + 22, H + 10); ctx.lineTo(cx + Math.sin(a) * 260 - 22, H + 10); ctx.fill();
    }
    const g = ctx.createRadialGradient(cx, 0, 2, cx, 0, 90); g.addColorStop(0, "rgba(255,250,220,.9)"); g.addColorStop(1, "rgba(255,230,140,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, 100);
    for (let i = 0; i < 18; i++) { ctx.fillStyle = "rgba(255,248,200,.8)"; ctx.fillRect(cx + Math.sin(i * 7.3 + t) * 80, (i * 23 + t * 15) % H, 1, 1); }
    ctx.restore();
  }
  function drawOverlays(v, t) {
    if (v.rain && !(mode === "play" && LV && LV.room.indoor)) drawRain(v.rain, t * 60);
    if (v.flash > 0) { ctx.fillStyle = `rgba(255,255,255,${v.flash})`; ctx.fillRect(0, 0, W, H); v.flash = Math.max(0, v.flash - 0.06); }
    if (v.heat > 0.2) { ctx.fillStyle = `rgba(255,200,80,${(v.heat - 0.2) * 0.25})`; ctx.fillRect(0, 0, W, H); }
    drawLight(v, t);
    if (v.fade > 0) { ctx.fillStyle = `rgba(0,0,0,${v.fade})`; ctx.fillRect(0, 0, W, H); }
    if (v.white > 0) { ctx.fillStyle = `rgba(255,253,246,${v.white})`; ctx.fillRect(0, 0, W, H); }
  }

  function renderLevel() {
    const R = LV.room, cam = LV.cam, v = LV.vars, t = LV.t / 60;
    ctx.save();
    if (v.shake > 0) { ctx.translate((Math.random() - 0.5) * v.shake, (Math.random() - 0.5) * v.shake); v.shake *= 0.9; if (v.shake < 0.3) v.shake = 0; }
    if (R.tilt) { const a = Math.sin(LV.t * 0.02) * R.tilt * (0.3 + (v.storm || 0)); ctx.translate(W / 2, H / 2); ctx.rotate(a); ctx.translate(-W / 2, -H / 2); }
    ART.bg(ctx, v.bg || R.bg, cam.x, cam.y, t, v);
    ctx.translate(-Math.round(cam.x), -Math.round(cam.y));
    for (const d of LV.decor) if (d.x > cam.x - 200 && d.x < cam.x + W + 100) ART.decor(ctx, d.type, d.x, d.y, t, d.o);
    drawTiles();
    for (const e of LV.ents) if (!e.gone && !e.front && e.type !== "trig") drawEnt(e);
    if (bagOn()) drawBag(LV.b, t);
    drawPlayer();
    for (const e of LV.ents) if (!e.gone && e.front) drawEnt(e);
    drawTags(t);
    drawFx();
    if (R.front) R.front(ctx, LV, t);
    ctx.restore();
    if (R.dark) {
      const p = LV.p, lights = [[p.x + 5 - cam.x, p.y + 10 - cam.y, R.darkR || 70]];
      if (bagOn()) lights.push([LV.b.x + 5 - cam.x, LV.b.y + 5 - cam.y, 34]);
      LV.ents.forEach(e => { if ((e.type === "spot" && !e.done) || e.glow) lights.push([e.x + 6 - cam.x, e.y + 6 - cam.y, e.glow || 34]); });
      drawDark(v.darkness != null ? v.darkness : R.dark, lights);
    }
    drawOverlays(v, t);
  }

  // ---------- Cutscene mode ----------
  const SCN = { draw: null, v: {}, t: 0 };
  async function cut(name, opt = {}) {
    const fn = SC[name]; if (!fn) return;
    const prevMode = mode;
    const seen = !!S.seen[name];
    mode = "cut"; refreshTouch(); hud.hidden = true; bubbleEl.hidden = true;
    SCN.v = Object.assign({ light: 0, fade: 0, white: 0, flash: 0, shake: 0 }, opt.v || {}); SCN.t = 0; SCN.draw = null;
    let skipBtn = null;
    if (seen) { skipBtn = el("button", "skip", "Skip ⏭"); skipBtn.onclick = () => { skipping = true; skipBtn.remove(); }; screenEl.appendChild(skipBtn); }
    try { await fn(G, SCN.v); } catch (e) { console.error(e); }
    skipping = false; if (skipBtn) skipBtn.remove();
    S.seen[name] = 1; save();
    // tidy any talk box left open by a skip
    mode = prevMode === "cut" ? (LV && !LV.ended ? "play" : "cut") : prevMode;
    if (mode === "play") { hud.hidden = false; }
    refreshTouch();
  }
  function scene(draw) { SCN.draw = draw; SCN.t = 0; }
  function renderCut() {
    const v = SCN.v, t = SCN.t / 60;
    ctx.save();
    if (v.shake > 0) { ctx.translate((Math.random() - 0.5) * v.shake, (Math.random() - 0.5) * v.shake); v.shake *= 0.92; if (v.shake < 0.3) v.shake = 0; }
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
    if (SCN.draw) SCN.draw(ctx, t, v, SCN);
    ctx.restore();
    drawOverlays(v, t);
  }

  // ---------- Mini game: the Nineveh maze (top-down) ----------
  let MZ = null;
  function maze(def) {
    return new Promise(res => {
      const grid = def.grid.map(r => r.split(""));
      const rows = grid.length, cols = grid[0].length, cs = 14;
      const ox = Math.floor((W - cols * cs) / 2), oy = Math.floor((H - rows * cs) / 2) + 8;
      let sx = 0, sy = 0; const marks = [];
      grid.forEach((r, y) => r.forEach((c, x) => { if (c === "S") { sx = x; sy = y; } if (/[1-9]/.test(c)) marks.push({ x, y, n: +c, done: false }); }));
      MZ = { grid, rows, cols, cs, ox, oy, p: { x: sx, y: sy, fx: sx, fy: sy, mv: 0 }, start: { x: sx, y: sy }, marks, guards: (def.guards || []).map(g => Object.assign({ fx: g.path[0][0], fy: g.path[0][1] }, g)), res, def, busy: 0, t: 0, caught: 0 };
      mode = "maze"; refreshTouch(); hud.hidden = false; bubbleEl.hidden = true;
      goal.set([{ id: "squares", label: def.goalLabel || "Reach the city squares", n: marks.length }]);
    });
  }
  function mazeOpen(x, y) { const c = MZ.grid[y] && MZ.grid[y][x]; return c && c !== "#"; }
  // Guards march along their street, stop at each end to look around, then march back.
  // Same timing every time, so the boys can watch, wait in a side street, and pick their moment.
  function guardAt(g, t) {
    const P = g.path, n = P.length, w = g.wait || 0; let total = 0;
    const segs = P.map((a, i) => { const b = P[(i + 1) % n], mv = (Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1])) / g.sp; total += w + mv; return { a, b, mv }; });
    let k = (((t + (g.ph || 0)) % total) + total) % total;
    for (const sg of segs) {
      if (k < w) return [sg.a[0], sg.a[1], 0];
      k -= w;
      if (k < sg.mv) { const f = k / sg.mv; return [sg.a[0] + (sg.b[0] - sg.a[0]) * f, sg.a[1] + (sg.b[1] - sg.a[1]) * f, Math.sign(sg.b[0] - sg.a[0]) || 1]; }
      k -= sg.mv;
    }
    return [P[0][0], P[0][1], 0];
  }
  function updateMaze() {
    const m = MZ, p = m.p; m.t++;
    if (m.busy) return;
    if (p.mv > 0) {
      p.mv--; const k = 1 - p.mv / 8; p.fx = p.ox + (p.x - p.ox) * k; p.fy = p.oy + (p.y - p.oy) * k;
      if (p.mv === 0) {
        p.fx = p.x; p.fy = p.y; SND.sfx("step");
        const mk = m.marks.find(q => q.x === p.x && q.y === p.y && !q.done);
        if (mk) { mk.done = true; m.busy = 1; goal.add("squares"); m.start = { x: p.x, y: p.y }; (async () => { await m.def.onMark(G, mk, m.marks.filter(q => q.done).length); m.busy = 0; if (m.marks.every(q => q.done)) { mode = "play"; const r = m.res; MZ = null; refreshTouch(); r(); } })(); }
      }
    } else {
      let dx = 0, dy = 0;
      if (K.left) dx = -1; else if (K.right) dx = 1; else if (K.up || K.jump) dy = -1; else if (K.down) dy = 1;
      if ((dx || dy) && mazeOpen(p.x + dx, p.y + dy)) { p.ox = p.x; p.oy = p.y; p.x += dx; p.y += dy; p.mv = 8; p.face = dx || p.face || 1; }
    }
    m.guards.forEach(g => {
      const [gx, gy, dir] = guardAt(g, m.t);
      g.fx = gx; g.fy = gy; if (dir) g.face = dir;
      if (Math.abs(g.fx - p.fx) < 0.6 && Math.abs(g.fy - p.fy) < 0.6 && !m.busy) {
        m.busy = 1; SND.sfx("hurt"); m.caught++;
        (async () => {
          await say("guard", "Halt! Who are you? Off you go, back the way you came!", {});
          p.x = p.fx = m.start.x; p.y = p.fy = m.start.y; p.mv = 0; m.busy = 0;
          if (m.caught === 2) bubble("Tip: wait in a side street. When the guard walks away from you, go!", 4500);
        })();
      }
    });
  }
  function renderMaze() {
    const m = MZ, t = m.t / 60;
    ctx.fillStyle = "#e2c48e"; ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < m.rows; y++) for (let x = 0; x < m.cols; x++) {
      const X = m.ox + x * m.cs, Y = m.oy + y * m.cs;
      if (m.grid[y][x] === "#") {
        ctx.fillStyle = "#b88a52"; ctx.fillRect(X, Y, m.cs, m.cs); ctx.fillStyle = "#d8b47a"; ctx.fillRect(X + 1, Y + 1, m.cs - 2, m.cs - 4);
        ctx.fillStyle = "#9a7040"; ctx.fillRect(X + 3, Y + 4, 3, 3);
      } else { ctx.fillStyle = (x + y) % 2 ? "#ecd6a8" : "#e6cf9e"; ctx.fillRect(X, Y, m.cs, m.cs); }
    }
    // the streets the guards march along
    ctx.fillStyle = "rgba(200,80,50,.18)";
    m.guards.forEach(g => g.path.forEach((a, i) => {
      const b = g.path[(i + 1) % g.path.length], x0 = Math.min(a[0], b[0]), x1 = Math.max(a[0], b[0]), y0 = Math.min(a[1], b[1]), y1 = Math.max(a[1], b[1]);
      ctx.fillRect(m.ox + x0 * m.cs + 2, m.oy + y0 * m.cs + 2, (x1 - x0 + 1) * m.cs - 4, (y1 - y0 + 1) * m.cs - 4);
    }));
    m.marks.forEach(q => {
      const X = m.ox + q.x * m.cs, Y = m.oy + q.y * m.cs;
      ctx.fillStyle = q.done ? "#7aa65a" : "#e0533a"; ctx.fillRect(X + 2, Y + 2, m.cs - 4, m.cs - 4);
      ctx.fillStyle = "#fff"; ctx.fillRect(X + 5, Y + 4, 4, 6);
      if (!q.done) { ctx.fillStyle = "rgba(255,230,120,.35)"; ctx.beginPath(); ctx.arc(X + 7, Y + 7, 9 + Math.sin(t * 4) * 2, 0, 7); ctx.fill(); }
    });
    m.guards.forEach(g => {
      const near = Math.abs(g.fx - m.p.fx) + Math.abs(g.fy - m.p.fy) < 2.5;
      drawMini(D.LOOKS.soldier, m.ox + g.fx * m.cs, m.oy + g.fy * m.cs, t, g.face || 1);
      if (near) markBubble(m.ox + g.fx * m.cs + 3, m.oy + g.fy * m.cs - 13, "!", "#ffb3a0");
    });
    drawMini(D.LOOKS.jonah, m.ox + m.p.fx * m.cs, m.oy + m.p.fy * m.cs, t, m.p.face || 1);
  }
  function drawMini(L, x, y, t, face) {
    const img = ART.char(L, "idle", 0);
    ctx.save(); ctx.translate(Math.round(x + 7), Math.round(y + 7)); if (face < 0) ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0, 18, 14, -7, -9, 14, 11); ctx.restore();
  }

  // ---------- Mini game: mash (both brothers press their key) ----------
  function mash(def) {
    return new Promise(res => {
      const prev = mode; mode = "mash"; refreshTouch(); hud.hidden = true;
      const one = solo(), need = def.need || 30, st = { d: 0, l: one ? need : 0 }, box = el("div", "mash");
      box.innerHTML = `<h2>${esc(def.title)}</h2><div class="sub">${esc(one && def.sub1 || def.sub)}</div>
        <div class="bars${one ? " one" : ""}">
          <div class="pl"><div class="meterv"><i class="fd"></i></div><button class="press pd">Davian: press D</button></div>
          <div class="pl"${one ? " hidden" : ""}><div class="meterv"><i class="fl"></i></div><button class="press pl2">Levi: press L</button></div>
        </div>`;
      screenEl.appendChild(box);
      SND.music(def.music || "mash");
      const fd = box.querySelector(".fd"), fl = box.querySelector(".fl"), bd = box.querySelector(".pd"), bl = box.querySelector(".pl2");
      MS = { v: 0, def };
      let done = false;
      const upd = () => { fd.style.width = (st.d / need * 100) + "%"; fl.style.width = (st.l / need * 100) + "%"; MS.v = one ? st.d / need : (st.d + st.l) / (2 * need); };
      const hit = who => {
        if (done || (one && who === "l")) return;
        st[who] = Math.min(need, st[who] + 1); SND.sfx(who === "d" ? "shout" : "blip");
        const b = who === "d" ? bd : bl; b.classList.add("hit"); setTimeout(() => b.classList.remove("hit"), 70);
        upd();
        if (st.d >= need && st.l >= need) {
          done = true; mashKey = null; clearInterval(decay);
          setTimeout(() => { box.remove(); mode = prev; MS = null; hud.hidden = false; refreshTouch(); res(); }, 600);
        }
      };
      mashKey = hit;
      bd.addEventListener("pointerdown", e => { e.preventDefault(); hit("d"); });
      bl.addEventListener("pointerdown", e => { e.preventDefault(); hit("l"); });
      const decay = setInterval(() => { if (st.d < need) st.d = Math.max(0, st.d - 1); if (st.l < need) st.l = Math.max(0, st.l - 1); upd(); }, 450);
    });
  }
  let MS = null;

  // ---------- Screens ----------
  function clearScreen() { screenEl.innerHTML = ""; layer.innerHTML = ""; adv = null; keyChoice = null; uiOpen = 0; }
  let titleT = 0;
  function showTitle() {
    clearScreen(); LV = null; mode = "title"; hud.hidden = true; refreshTouch();
    const s = el("div", "title");
    s.innerHTML = `<h1>Jonah's<br>Journey</h1><p>A Bible adventure for Davian and Levi</p>
      <div class="pick"><button class="bigbtn${solo() ? "" : " alt"}" data-n="1">▶ 1 player<small>Davian</small></button><button class="bigbtn${solo() ? " alt" : ""}" data-n="2">▶ 2 players<small>Davian and Levi</small></button></div>
      <small class="src">Bible content from <a href="https://www.jw.org" target="_blank" rel="noopener">jw.org</a> and <a href="https://wol.jw.org" target="_blank" rel="noopener">wol.jw.org</a></small>`;
    s.querySelectorAll(".pick button").forEach(b => (b.onclick = () => { setPlayers(+b.dataset.n); SND.init(); SND.music("title"); showMap(); }));
    // On the family website this game is jonah.html, right next to Noé's Journey (index.html).
    if (/\/jonah(\.html|\/(index\.html)?)?$/.test(location.pathname)) {
      const noe = el("a", "bigbtn alt back", "◀ Noé's Journey"); noe.href = /\/jonah\//.test(location.pathname) ? "../" : "./"; s.appendChild(noe);
    }
    screenEl.appendChild(s);
  }
  function showMap() {
    clearScreen(); LV = null; mode = "map"; hud.hidden = true; refreshTouch(); SND.music("title"); SND.ambient(null);
    const s = el("div", "mapscreen");
    const g = S.gems;
    s.innerHTML = `<div class="hdr">Jonah's Journey</div>
      <div class="gembar">${Object.keys(GEMS).map(k => `<span title="${GEMS[k][1]}">${GEMS[k][0]} ${g[k] || 0}</span>`).join("")}</div>`;
    D.LEVELS.forEach((L, i) => {
      const locked = i + 1 > S.unlocked;
      const best = S.best[i] || 0;
      const b = el("button", "node" + (locked ? " locked" : ""), `<span class="dot">${locked ? "🔒" : i + 1}</span><span class="nm">${esc(L.short)}</span><span class="st">${"★".repeat(best)}${"☆".repeat(3 - best)}</span>`);
      b.style.left = L.map[0] + "%"; b.style.top = L.map[1] + "%";
      if (!locked) b.onclick = () => showRoles(i);
      s.appendChild(b);
    });
    const back = el("button", "bigbtn alt back", "◀ Title"); back.onclick = showTitle; s.appendChild(back);
    if (S.finished) { const end = el("button", "bigbtn alt", "🎵 Ending"); end.style.cssText = "position:absolute;right:2cqw;bottom:2cqw"; end.onclick = () => playEnding(true); s.appendChild(end); }
    screenEl.appendChild(s);
  }
  function controls(w, bag) {
    if (touchMode) return w === "d" ? "Use the buttons on the left." : "Use the buttons on the right.";
    if (solo()) return "Keys: A and D (or ← →) to walk, W (or ↑) to jump, E (or Enter) to talk and open gates.";
    const act = bag ? "to open gates" : "to talk";
    return w === "d" ? `Keys: A and D to walk, W to jump, E ${act}.` : `Keys: ← and → to walk, ↑ to jump, Enter ${act}.`;
  }
  function showRoles(i) {
    clearScreen(); mode = "map";
    const L = D.LEVELS[i];
    const draw = () => {
      const jp = ((i % 2 === 0) !== !!S.swap) ? "d" : "l", kp = jp === "d" ? "l" : "d";
      const C = card(`<h2>Level ${i + 1}: ${esc(L.title)}</h2>
        <div class="small">${esc(L.ref)}</div>
        <p>${esc(L.intro)}</p>
        <div class="opts">
          ${solo() ? `<div class="opt">🎮 <b>Jonah: Davian</b>. You lead the way, talk to people, and you are the Scroll Keeper: you open every gate with the Bible. ${controls("d")}</div>
          <div class="opt">🎒 <b>Jonah's bag</b> follows you by itself.</div>` : `<div class="opt">🎮 <b>Jonah: ${NAMES[jp]}</b>. You talk to people and lead the way. ${controls(jp)}</div>
          <div class="opt">🎒 <b>Jonah's bag: ${NAMES[kp]}</b>. You hop along with Jonah. ${controls(kp, true)} You are the Scroll Keeper too: you open every gate with the Bible.${kp === "l" ? " Mum can help 2 times." : ""}</div>`}
        </div>
        <div class="row"><button class="btn go">▶ Start</button>${solo() ? "" : `<button class="btn alt small sw">⇄ Swap roles</button>`}<button class="btn alt small one">${solo() ? "👦 1 player ⇄" : "👦👦 2 players ⇄"}</button><button class="btn alt small bk">◀ Map</button></div>`);
      C.c.querySelector(".go").onclick = () => { C.close(); startLevel(i); };
      if (!solo()) C.c.querySelector(".sw").onclick = () => { S.swap = !S.swap; save(); C.close(); draw(); };
      C.c.querySelector(".one").onclick = () => { setPlayers(solo() ? 2 : 1); C.close(); draw(); };
      C.c.querySelector(".bk").onclick = () => { C.close(); showMap(); };
    };
    draw();
  }
  function startLevel(i) {
    clearScreen(); fx.length = 0;
    newLevel(i);
    mode = "play"; hud.hidden = false; refreshTouch(); meter(null); goal.set([]);
    enterRoom(0);
    drawHud();
    if (LV.def.onStart) runScript(LV.def.onStart);
  }
  async function endLevel() {
    if (LV.ended) return; LV.ended = true;
    const i = LV.i, st = LV.stats;
    const stars = 1 + (st.q > 0 && st.first === st.q ? 1 : 0) + (LV.scrolls.every(Boolean) ? 1 : 0);
    const best = Math.max(S.best[i] || 0, stars); S.best[i] = best; S.unlocked = Math.max(S.unlocked, i + 2); save();
    meter(null);
    const Lc = LV.def.lesson;
    if (LV.def.final) { const keep = LV; await playEnding(false); LV = keep; mode = "map"; hud.hidden = true; }
    await new Promise(res => {
      uiIn();
      const C = card(`<div class="lesson"><span class="lessonicon">${GEMS[Lc.goal][0]}</span><h2>Lesson card: ${esc(Lc.title)}</h2>
        <p>${esc(Lc.text)}</p>
        <div class="verse">“${esc(Lc.verse)}”<cite>${esc(Lc.ref)}</cite></div>
        <div class="stars">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</div>
        <div class="small">★ Finished the level &nbsp; ★ Every Scroll Keeper answer right first time (${st.first}/${st.q}) &nbsp; ★ Found all 3 verse scrolls (${LV.scrolls.filter(Boolean).length}/3)${best > stars ? `<br>Best so far: ${"★".repeat(best)}` : ""}</div>
        <div class="row"><button class="btn">${LV.def.final ? "▶ Continue" : "▶ Back to the map"}</button><button class="btn alt small rd">🔊 Read aloud</button></div></div>`);
      SND.sfx("gem");
      const fin = () => { adv = null; C.close(); uiOut(); res(); };
      C.c.querySelector(".btn").onclick = fin; adv = fin;
      C.c.querySelector(".rd").onclick = () => speak(Lc.title + ". " + Lc.text + " " + Lc.verse);
    });
    showMap();
  }

  // ---------- Ending: the white thinking room and the closing song ----------
  async function playEnding(replay) {
    clearScreen(); hud.hidden = true; mode = "cut"; refreshTouch();
    if (!replay) { S.finished = true; save(); }
    await cut("whiteRoom");
    await cut("finale");
    if (replay) showMap();
  }

  // ---------- Pause menu and mute ----------
  function syncMute() { $("#btnMute").textContent = SND.isMuted() ? "🔇" : "🔊"; }
  $("#btnMute").onclick = () => { SND.init(); SND.setMuted(!SND.isMuted()); syncMute(); };
  syncMute();
  $("#btnMenu").onclick = () => {
    if (!LV || uiOpen) return;
    uiIn();
    const C = card(`<h2>Paused</h2><div class="opts">
      <button class="opt r1">▶ Keep playing</button>
      <button class="opt r4">🎒 Bring the bag to Jonah</button>
      <button class="opt r5">${solo() ? "👦👦 Switch to 2 players (Levi joins)" : "👦 Switch to 1 player (the bag follows by itself)"}</button>
      <button class="opt r2">↺ Restart this level</button><button class="opt r3">🗺️ Back to the map</button></div>`);
    const close = () => { C.close(); adv = null; uiOut(); };
    C.c.querySelector(".r4").onclick = () => { close(); if (bagOn()) bagToJonah(true); };
    C.c.querySelector(".r5").onclick = () => { close(); setPlayers(solo() ? 2 : 1); };
    C.c.querySelector(".r1").onclick = close; adv = close;
    C.c.querySelector(".r2").onclick = () => { const i = LV.i; close(); startLevel(i); };
    C.c.querySelector(".r3").onclick = () => { close(); showMap(); };
  };

  // ---------- Main loop ----------
  let last = performance.now(), acc = 0;
  function step() {
    runTweens();
    mergeKeys();
    if (mode === "play" && LV) {
      if (!uiOpen) {
        if (!LV.lock || LV.auto) { updatePlayer(); updateBag(); leash(); }
        updateEnts();
        if (LV.room.update) LV.room.update(G, LV);
      }
      LV.t++;
      updateCamera();
      if (LV.t % 10 === 0) drawHud();
    } else if (mode === "cut") SCN.t++;
    else if (mode === "maze" && MZ && !uiOpen) updateMaze();
    else if (mode === "title" || mode === "map") titleT++;
    P = {}; PB = { d: {}, l: {} };
  }
  function render() {
    if (mode === "play" && LV) renderLevel();
    else if (mode === "cut") renderCut();
    else if (mode === "maze" && MZ) renderMaze();
    else if (mode === "mash") { if (SC.mashDraw) SC.mashDraw(ctx, titleT / 60, MS ? MS.v : 1, MS && MS.def); titleT++; }
    else if (SC.titleDraw) SC.titleDraw(ctx, titleT / 60, mode);
  }
  function frame(now) {
    requestAnimationFrame(frame);
    acc += Math.min(100, now - last); last = now;
    while (acc >= 1000 / 60) { step(); acc -= 1000 / 60; }
    render();
  }

  // ---------- The API that level scripts and cutscenes use ----------
  const G = {
    say, think, narr, bubble, jehovah, ask, choose, reflect, decision, verseCard, wait, tween, cut, scene, maze, mash, goal, meter,
    sfx: n => SND.sfx(n), music: (n, o) => SND.music(n, o), ambient: (n, v) => SND.ambient(n, v), stopMusic: f => SND.stop(f),
    get LV() { return LV; }, get p() { return LV.p; }, get v() { return vars(); }, get skipping() { return skipping; },
    names: NAMES, keeperName: () => NAMES[keeper()], jonahName: () => (LV ? NAMES[LV.jonah] : "Davian"),
    walkTo, hurt, giveGem, endLevel, playEnding, drawChar, markBubble,
    regroup: () => bagToJonah(true), solo, roles: rolesLine, get b() { return LV.b; }, talkKey: w => keyName(w, "talk"),
    room(i, sx, sy) { enterRoom(i, sx, sy); },
    find: id => LV.ents.find(e => e.id === id),
    spawn(type, x, y, o) { const e = Object.assign({ type, x, y, w: 16, h: 16 }, o); LV.ents.push(e); return e; },
    npcWalk(e, tx, sp) { return new Promise(res => { e.walk = { x: tx * 16, res, sp }; }); },
    lock(on) { LV.lock = Math.max(0, LV.lock + (on ? 1 : -1)); },
    setCheckpoint(tx, row) { LV.cp = { x: tx * 16 + 3, y: row * 16 - LV.p.h }; },
    camTo(x) { LV.camLock = x == null ? null : x; },
    show: s => (s ? (hud.hidden = false) : (hud.hidden = true)),
  };
  window.JONAH = { G, S, get LV() { return LV; }, get MZ() { return MZ; }, startLevel, showMap, showTitle, playEnding, get mode() { return mode; } };

  showTitle();
  requestAnimationFrame(frame);
})();
