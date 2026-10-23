(() => {
  const C = window.CHAPTER;
  const A = n => n + ".jpg";
  const PLAYERS = { levi: { name: "Levi", img: "levi" }, davian: { name: "Davian", img: "davian" } };
  const GOLD = { fact: 3, quick: 6, dig: 10, think: 2 };
  const KIND = { fact: "Question", quick: "Quick find", dig: "Dig deeper", think: "Think about it" };
  const SHARE_COOLDOWN = 5 * 60 * 1000;
  const SAVE_KEY = "noe-journey-v1";

  const fresh = () => ({
    screen: "title", gold: 0,
    hearts: { levi: 5, davian: 5 },
    done: [false, false, false, false, false],
    cards: [], gems: { jehovah: 0, bible: 0, myself: 0, helping: 0 },
    letters: 0, bag: { shield: 0, sword: 0, armor: 0, potion: 0, iron: 0 },
    shareAt: { levi: 0, davian: 0 }, found: [], prayerCardSeen: false,
    best: [0, 0, 0, 0, 0], muted: false
  });

  let S = fresh();
  let run = null; // the stage currently being played (not saved)

  const load = () => { try { const raw = localStorage.getItem(SAVE_KEY); if (raw) S = Object.assign(fresh(), JSON.parse(raw)); } catch (e) {} };
  const save = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} };

  const $app = document.getElementById("app");
  const $layer = document.getElementById("layer");
  const h = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const heartStr = (n, max = 5) => { let s = ""; for (let i = 1; i <= max; i++) s += n >= i ? "❤️" : n >= i - 0.5 ? "💔" : "🤍"; return s; };
  const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

  // ---------- Sound (Web Audio, made on the fly) ----------
  let ctx = null;
  const audio = () => { try { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === "suspended") ctx.resume(); } catch (e) {} return ctx; };
  const tone = (f, d = .15, type = "sine", v = .2, when = 0) => {
    const a = audio(); if (!a || S.muted) return;
    const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + when;
    o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + d);
  };
  const noise = (d = .2, freq = 600, v = .5, when = 0) => {
    const a = audio(); if (!a || S.muted) return;
    const len = Math.floor(a.sampleRate * d), buf = a.createBuffer(1, len, a.sampleRate), ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    src.buffer = buf; f.type = "lowpass"; f.frequency.value = freq; g.gain.value = v;
    src.connect(f).connect(g).connect(a.destination); src.start(a.currentTime + when);
  };
  // Battle music: a simple drum and bass loop while a battle is on
  let music = null;
  const startMusic = (fast, intense) => {
    stopMusic(); let step = 0;
    const bass = fast ? [55, 55, 65, 55, 49, 49, 58, 49] : [65, 65, 73, 65, 58, 58, 62, 58];
    music = setInterval(() => {
      if (S.muted || document.hidden) return;
      const b = step % 8;
      if (b % 4 === 0) { tone(60, .18, "sine", .45); noise(.08, 150, .6); }
      if (b % 4 === 2) noise(.1, 2500, .25);
      tone(bass[b], .2, "sawtooth", .09);
      if (b === 7) tone(bass[b] * 4, .12, "square", .04);
      step++;
      if (intense) { tone(bass[b] * 2, .1, "square", .05); if (b % 2) noise(.06, 3000, .25); }
    }, intense ? 115 : fast ? 170 : 210);
  };
  const stopMusic = () => { if (music) clearInterval(music); music = null; };
  const sfx = {
    right: () => { tone(660, .12, "triangle"); tone(880, .2, "triangle", .2, .1); },
    wrong: () => tone(160, .3, "sawtooth", .12),
    coin: () => { tone(988, .08, "square", .08); tone(1319, .25, "square", .08, .07); },
    hit: () => { noise(.18, 900, .9); tone(140, .22, "square", .25); tone(70, .3, "sawtooth", .2, .04); tone(1200, .08, "square", .06, .02); },
    hurt: () => { tone(520, .12, "square", .14); tone(300, .3, "sawtooth", .16, .08); noise(.15, 500, .5, .02); },
    stomp: (when = 0) => { tone(55, .45, "sine", .7, when); tone(40, .5, "triangle", .5, when); noise(.25, 220, 1.2, when); },
    roar: (when = 0) => {
      const a = audio(); if (!a || S.muted) return;
      const t = a.currentTime + when, o = a.createOscillator(), o2 = a.createOscillator(), g = a.createGain(), f = a.createBiquadFilter();
      o.type = "sawtooth"; o2.type = "square"; o.frequency.setValueAtTime(140, t); o.frequency.linearRampToValueAtTime(95, t + .4); o.frequency.linearRampToValueAtTime(60, t + 1.5);
      o2.frequency.setValueAtTime(147, t); o2.frequency.linearRampToValueAtTime(58, t + 1.5);
      f.type = "lowpass"; f.frequency.setValueAtTime(1400, t); f.frequency.linearRampToValueAtTime(400, t + 1.5);
      g.gain.setValueAtTime(.001, t); g.gain.linearRampToValueAtTime(.35, t + .12); g.gain.exponentialRampToValueAtTime(.001, t + 1.6);
      o.connect(f); o2.connect(f); f.connect(g).connect(a.destination); o.start(t); o2.start(t); o.stop(t + 1.7); o2.stop(t + 1.7);
      noise(1.3, 700, .6, when);
    },
    grunt: (when = 0) => { tone(110, .25, "sawtooth", .3, when); tone(90, .3, "square", .2, when + .05); noise(.2, 400, .5, when); },
    win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .3, "triangle", .2, i * .14)),
    thunder: () => {
      const a = audio(); if (!a || S.muted) return;
      [0, .5, 1.1].forEach((when, k) => {
        const len = a.sampleRate * 2.4, buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
        const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
        src.buffer = buf; f.type = "lowpass"; f.frequency.value = 380 + k * 160; g.gain.value = 1.4;
        src.connect(f).connect(g).connect(a.destination); src.start(a.currentTime + when);
      });
      tone(45, 2.2, "sine", .5); tone(38, 2.6, "triangle", .4, .4);
    }
  };
  const speak = text => { if (S.muted) return; try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text.replace(/[^\p{L}\p{N}\s.,!?'":-]/gu, "")); u.rate = .9; speechSynthesis.speak(u); } catch (e) {} };

  const toast = msg => {
    const t = h(`<div class="toast" role="status">${esc(msg)}</div>`).firstChild;
    document.body.appendChild(t); setTimeout(() => t.remove(), 2600);
  };
  const addGold = (n, why) => { S.gold += n; save(); sfx.coin(); toast(`+${n} gold${why ? " · " + why : ""}`); renderHud(); };
  const addGem = (g) => {
    if (S.gems[g] >= 3) { toast(`${C.gems[g].name} is already full`); return; }
    S.gems[g]++; save(); renderHud();
    toast(S.gems[g] === 3 ? `${C.gems[g].name} is full! Secret move: ${C.gems[g].move}` : `${C.gems[g].name} +1 piece`);
  };

  // ---------- Stars ----------
  const starTotal = st => st.questions.filter(q => q.kind !== "think").length + (st.boss ? 1 : 0);
  const starStr = i => { const t = starTotal(C.stages[i]), b = Math.min(S.best[i] || 0, t); return "★".repeat(b) + "☆".repeat(t - b); };
  const allStars = () => C.stages.reduce((a, st, i) => [a[0] + Math.min(S.best[i] || 0, starTotal(st)), a[1] + starTotal(st)], [0, 0]);

  // ---------- HUD ----------
  let $hud = null;
  const renderHud = () => {
    if (!$hud) return;
    const gemHtml = Object.entries(C.gems).map(([k, g]) =>
      `<div class="gem" style="--c:${g.color}" title="${esc(g.name)}: ${S.gems[k]}/3"><div class="fill" style="height:${S.gems[k] / 3 * 100}%"></div><span>${S.gems[k]}/3</span></div>`).join("");
    $hud.innerHTML = `
      <div class="who"><img src="${A("davian")}" alt=""><div><div class="name">Davian</div><div class="hearts" aria-label="Davian hearts">${heartStr(S.hearts.davian)}</div></div></div>
      <div class="who"><img src="${A("levi")}" alt=""><div><div class="name">Levi</div><div class="hearts" aria-label="Levi hearts">${heartStr(S.hearts.levi)}</div></div></div>
      <div class="coin" aria-label="Gold">🪙 ${S.gold}</div>
      <div class="coin" aria-label="Stars" title="Stars from correct answers">⭐ ${allStars()[0]}/${allStars()[1]}</div>
      <div class="gemrow" aria-label="Faith gems">${gemHtml}</div>
      <div class="letters" title="Prayer Letters">✉️ ${S.letters}</div>
      <div class="spacer"></div>
      <button class="hudbtn" id="hud-mute" aria-label="Sound on or off">${S.muted ? "🔇" : "🔊"}</button>
      <button class="hudbtn" id="hud-share">Share a thought</button>
      <button class="hudbtn" id="hud-cards">Lesson Cards</button>`;
    $hud.querySelector("#hud-share").onclick = openShare;
    $hud.querySelector("#hud-mute").onclick = () => { S.muted = !S.muted; save(); try { speechSynthesis.cancel(); } catch (e) {} renderHud(); };
    $hud.querySelector("#hud-cards").onclick = openCards;
  };
  const frame = (inner) => {
    $app.innerHTML = "";
    $hud = document.createElement("div"); $hud.className = "hud"; $app.appendChild($hud); renderHud();
    const body = document.createElement("div"); body.style.display = "grid"; body.style.gap = "12px";
    body.appendChild(typeof inner === "string" ? h(inner) : inner); $app.appendChild(body);
    window.scrollTo(0, 0);
    return body;
  };

  // ---------- Title ----------
  const showTitle = () => {
    $hud = null;
    const started = S.done.some(Boolean) || S.gold > 0;
    $app.innerHTML = "";
    $app.appendChild(h(`
      <section class="title">
        <div class="sub">Bible Adventure · Chapter 1</div>
        <h1>Noé's Journey</h1>
        <div class="heroes"><img src="${A("davian")}" alt="Davian"><img src="${A("noe")}" alt="Noé"><img src="${A("levi")}" alt="Levi"></div>
        <p style="max-width:52ch;margin:0">Davian and Levi join Noé to build the ark, stand up to bullies and learn how Jehovah protects those who listen to him. Keep your Bibles open!</p>
        <div class="row" style="justify-content:center">
          <button class="btn" id="go">${started ? "Continue adventure" : "Start adventure"}</button>
          ${started ? '<button class="btn alt" id="reset">New game</button>' : ""}
        </div>
        <div id="confirm"></div>
      </section>
      <p class="foot">Bible content from <a href="https://www.jw.org" target="_blank" rel="noopener">jw.org</a> and <a href="https://wol.jw.org" target="_blank" rel="noopener">wol.jw.org</a></p>`));
    $app.querySelector("#go").onclick = () => { audio(); S.screen = "map"; save(); showMap(); };
    const r = $app.querySelector("#reset");
    if (r) r.onclick = () => {
      const box = $app.querySelector("#confirm");
      box.innerHTML = `<div class="panel row" style="justify-content:center"><span>Start over? All gold, gems and cards will be cleared.</span><button class="btn alt" id="yes">Yes, start over</button><button class="btn" id="no">Keep playing</button></div>`;
      box.querySelector("#yes").onclick = () => { S = fresh(); save(); showTitle(); };
      box.querySelector("#no").onclick = () => { box.innerHTML = ""; };
    };
  };

  // ---------- Map ----------
  const unlocked = i => i === 0 || S.done[i - 1];
  const showMap = () => {
    run = null; stopMusic();
    const spots = C.stages.map((st, i) => `<button class="spot ${unlocked(i) ? "" : "locked"}" style="left:${10 + i * 20}%" data-i="${i}" ${unlocked(i) ? "" : "disabled"} aria-label="${esc(st.name)}"><span class="tag">${unlocked(i) ? `<span class="stars">${starStr(i)}</span>` : "🔒 " + (i + 1)}</span></button>`).join("");
    const list = C.stages.map((st, i) => `<button class="stagebtn ${S.done[i] ? "done" : ""}" data-i="${i}" ${unlocked(i) ? "" : "disabled"}><b>${i + 1}. ${esc(st.name)}</b><small>${esc(st.refs)}${unlocked(i) ? "" : " · locked"}</small><span class="stars">${starStr(i)}</span></button>`).join("");
    const allDone = S.done.every(Boolean);
    const body = frame(`
      <div class="mapwrap"><img src="${A("map")}" alt="Map of Noé's journey">${spots}</div>
      <div class="row" style="justify-content:space-between">
        <h2 style="font-size:24px">${allDone ? "You finished Chapter 1! 🌈" : "Where to next?"}</h2>
        <div class="row"><button class="btn gold" id="shop">Visit Esaú's shop</button><button class="btn alt" id="home">Title</button></div>
      </div>
      <div class="stagelist">${list}</div>`);
    body.querySelectorAll("[data-i]").forEach(b => b.onclick = () => startStage(+b.dataset.i));
    body.querySelector("#shop").onclick = openShop;
    body.querySelector("#home").onclick = showTitle;
  };

  // ---------- Stage ----------
  const startStage = (i) => {
    audio();
    run = { i, st: C.stages[i], line: 0, q: 0, mumHelps: 3, letterGiven: false, correct: 0, bossWon: false };
    showStory();
  };
  const showStory = () => {
    const { st, line } = run;
    const hid = st.hidden, found = S.found.includes(st.id);
    const body = frame(`
      <div class="panel story">
        <div class="scene"><img src="${A(st.scene)}" alt="">${found ? "" : `<button class="hiddenitem" style="left:${hid.x}%;top:${hid.y}%" aria-label="Something hidden">${hid.icon}</button>`}</div>
        <div class="speech">
          <h2 style="font-size:28px">${esc(st.name)}</h2>
          <div class="speaker"><img src="${A("noe")}" alt=""><div><b class="display" style="font-size:20px">Noé</b><div style="color:var(--ink-soft);font-size:15px">Read along: ${esc(st.refs)}</div></div><button class="say" aria-label="Read aloud">🔊</button></div>
          <div class="bubble">${esc(st.story[line])}</div>
          <div class="row" style="justify-content:space-between">
            <div class="dots">${st.story.map((_, k) => `<i class="${k <= line ? "on" : ""}"></i>`).join("")}</div>
            <div class="row">${line > 0 ? '<button class="btn alt" id="back">Back</button>' : '<button class="btn alt" id="back">Map</button>'}<button class="btn" id="next">${line < st.story.length - 1 ? "Next" : "Let's go!"}</button></div>
          </div>
          ${found ? "" : '<small style="color:var(--ink-soft)">Side quest: something is hidden in the picture. Can you find it?</small>'}
        </div>
      </div>`);
    body.querySelector(".say").onclick = () => speak(st.story[line]);
    body.querySelector("#next").onclick = () => { if (line < st.story.length - 1) { run.line++; showStory(); } else { run.q = 0; showQuestion(); } };
    body.querySelector("#back").onclick = () => { if (line > 0) { run.line--; showStory(); } else showMap(); };
    const hb = body.querySelector(".hiddenitem");
    if (hb) hb.onclick = () => {
      S.found.push(st.id); save();
      openModal(`<h2>You found it! ${hid.icon}</h2><p>Open your Bible to <b>${esc(hid.ref)}</b>.</p><p class="scroll">${esc(hid.text)}</p><button class="btn" data-close>+5 gold</button>`, () => { addGold(5, "side quest"); showStory(); });
    };
  };

  // Question card (used in stage rounds)
  const qCardHtml = (q, opts = {}) => {
    const p = PLAYERS[q.who], big = q.who === "levi";
    return `
      <div class="qhead"><img src="${A(p.img)}" alt=""><div><h2>${opts.title || p.name + "'s turn"}</h2><span class="badge ${q.kind}">${KIND[q.kind]}${q.kind !== "think" ? " · " + GOLD[q.kind] + " gold" : ""}</span></div><button class="say" aria-label="Read aloud">🔊</button></div>
      ${q.ref ? `<div class="scroll">📖 <span>Open your Bible: <b>${esc(q.ref)}</b></span>${q.who === "levi" && opts.mum !== false && q.kind !== "fact" ? `<button class="mum" id="mum" ${run.mumHelps ? "" : "disabled"}>Mum helps (${run.mumHelps} left)</button>` : ""}</div>` : ""}
      <div class="qtext">${esc(q.q)}</div>
      ${q.kind === "think" ? "" : `<div class="opts ${big ? "big" : ""}">${q.order.map(k => `<button class="opt" data-k="${k}">${esc(q.options[k])}</button>`).join("")}</div>`}`;
  };
  const prep = q => Object.assign({}, q, { order: q.options ? shuffle(q.options.map((_, k) => k)) : [] });
  const wireCommon = (root, q) => {
    root.querySelector(".say").onclick = () => speak(q.q + (q.options ? ". " + q.options.join(". ") : ""));
    const m = root.querySelector("#mum");
    if (m) m.onclick = () => { if (!run.mumHelps) return; run.mumHelps--; m.textContent = `Mum helps (${run.mumHelps} left)`; m.disabled = true; toast(`Mum, please help Levi find ${q.ref} and read it together`); };
  };

  const showQuestion = () => {
    const { st } = run;
    if (run.q >= st.questions.length) return st.boss ? showVerseMap() : showLessonCard();
    const q = prep(st.questions[run.q]);
    const next = () => { run.q++; showQuestion(); };
    const body = frame(`<div class="panel qcard">${qCardHtml(q)}<div id="after"></div></div>`);
    wireCommon(body, q);
    const after = body.querySelector("#after");
    if (q.kind === "think") {
      after.innerHTML = `<p style="margin:0">Talk about it together. There's no wrong answer!</p>
        <div class="grownup"><small>For a grown-up: approve a thoughtful answer.</small><div class="row"><button class="btn" id="ok">Approve: +1 ${esc(C.gems[q.gem].name)} piece</button><button class="btn alt" id="skip">Skip</button></div></div>`;
      after.querySelector("#ok").onclick = () => {
        addGem(q.gem); S.gold += GOLD.think; save(); renderHud();
        if (!run.letterGiven && S.letters < 2) {
          run.letterGiven = true; S.letters++; save(); renderHud();
          openModal(`<h2>Noé gives you a Prayer Letter ✉️</h2><p>When a battle gets hard, send it to ask Jehovah for help. Jehovah always answers, but in his own time, so be patient and keep doing your part.</p><p class="scroll">📖 Micah 7:7: "I will show a waiting attitude."</p><button class="btn" data-close>Thank you, Noé!</button>`, next);
        } else next();
      };
      after.querySelector("#skip").onclick = next;
      return;
    }
    body.querySelectorAll(".opt").forEach(b => b.onclick = () => {
      const k = +b.dataset.k, ok = k === q.answer;
      body.querySelectorAll(".opt").forEach(x => { x.disabled = true; if (+x.dataset.k === q.answer) x.classList.add("right"); });
      if (!ok) b.classList.add("wrong");
      if (ok) { run.correct++; sfx.right(); S.gold += GOLD[q.kind]; save(); renderHud(); sfx.coin(); }
      else sfx.wrong();
      after.innerHTML = `<div class="feedback ${ok ? "good" : "bad"}">${ok ? `Well done, ${PLAYERS[q.who].name}! +${GOLD[q.kind]} gold` : `Not quite. The answer is "${esc(q.options[q.answer])}".${q.ref ? ` Let's read ${esc(q.ref)} together.` : ""}`}</div><div class="row" style="margin-top:10px"><button class="btn" id="nx">Next</button></div>`;
      after.querySelector("#nx").onclick = next;
    });
  };

  const showVerseMap = () => {
    const b = run.st.boss;
    const body = frame(`
      <div class="panel" style="display:grid;gap:14px">
        <div class="speaker"><img src="${A("noe")}" alt=""><div class="bubble" style="min-height:0">Before the battle, read these verses together. Every battle question comes from them!</div></div>
        <div class="row">${b.verseMap.map(v => `<div class="scroll">📖 <b>${esc(v)}</b></div>`).join("")}</div>
        <p style="margin:0">Need gear? Visit Esaú's shop before you fight. You have 🪙 ${S.gold}.</p>
        <div class="row"><button class="btn gold" id="shop">Esaú's shop</button><button class="btn" id="fight">We read them! Fight!</button></div>
      </div>`);
    body.querySelector("#shop").onclick = () => openShop();
    body.querySelector("#fight").onclick = bossIntro;
  };

  // ---------- Battle ----------
  let B = null;
  const bossIntro = () => {
    const b = run.st.boss;
    const o = h(`<div class="bossintro" role="dialog" aria-label="Boss battle"><div class="bi-inner"><div class="bi-label">${b.final ? "FINAL BOSS BATTLE" : "BOSS BATTLE"}</div><img src="${A(b.img)}" alt="${esc(b.name)}"><h2>${esc(b.name)}</h2><p>${esc(b.intro)}</p><button class="btn gold" id="bi-go" hidden>Fight!</button></div></div>`).firstChild;
    document.body.appendChild(o);
    audio();
    [0, .7, 1.4, 2.1].forEach((t, k) => { sfx.stomp(t); setTimeout(() => { o.classList.remove("thud"); void o.offsetWidth; o.classList.add("thud"); }, t * 1000); });
    sfx.grunt(1.0); sfx.roar(2.5); if (b.final) sfx.roar(3.6);
    setTimeout(() => { o.classList.add("show"); }, 300);
    setTimeout(() => { const g = o.querySelector("#bi-go"); g.hidden = false; g.focus(); }, b.final ? 4200 : 3200);
    o.querySelector("#bi-go").onclick = () => { o.remove(); startBattle(); };
  };
  const startBattle = () => {
    const boss = run.st.boss;
    B = {
      boss, hp: boss.hearts,
      decks: { levi: shuffle(boss.pool.filter(q => q.who === "levi")), davian: shuffle(boss.pool.filter(q => q.who === "davian")) },
      cur: {}, picks: {}, out: { levi: 0, davian: 0 },
      iron: false, misses: 0, prayer: 0, log: boss.intro
    };
    if (S.bag.iron > 0) { S.bag.iron--; B.iron = true; save(); }
    S.hearts.levi = Math.max(S.hearts.levi, 1); S.hearts.davian = Math.max(S.hearts.davian, 1);
    startMusic(boss.final);
    newRound();
  };
  const draw = who => { if (!B.decks[who].length) B.decks[who] = shuffle(B.boss.pool.filter(q => q.who === who)); return prep(B.decks[who].pop()); };
  const newRound = () => {
    B.picks = {};
    ["levi", "davian"].forEach(w => { B.cur[w] = B.out[w] ? null : draw(w); });
    renderBattle();
  };
  const renderBattle = () => {
    const boss = B.boss;
    const fighter = w => {
      const p = PLAYERS[w], q = B.cur[w];
      if (!q) return `<div class="panel fighter out"><div class="qhead"><img src="${A(p.img)}" alt=""><h2>${p.name}</h2></div><p>${p.name} is resting this turn and comes back next round with 2 hearts.</p></div>`;
      return `<div class="panel fighter" data-w="${w}">
        <div class="qhead"><img src="${A(p.img)}" alt=""><div><h2>${p.name}</h2><div class="hearts">${heartStr(S.hearts[w])}</div></div><button class="say" aria-label="Read aloud">🔊</button></div>
        ${q.ref ? `<div class="scroll">📖 <b>${esc(q.ref)}</b></div>` : ""}
        <div class="qtext">${esc(q.q)}</div>
        <div class="opts ${w === "levi" ? "big" : ""}">${q.order.map(k => `<button class="opt ${B.picks[w] === k ? "picked" : ""}" data-k="${k}" ${B.picks[w] !== undefined ? "disabled" : ""}>${esc(q.options[k])}</button>`).join("")}</div>
        ${B.picks[w] !== undefined ? `<small>Answer locked in. Waiting for your brother...</small>` : ""}
      </div>`;
    };
    const secrets = Object.entries(C.gems).filter(([k]) => S.gems[k] >= 3).map(([k, g]) =>
      `<button class="secret" style="--c:${g.color}" data-gem="${k}">${esc(g.move)}<br><small style="font-family:var(--body);font-size:13px">Both hold 3 seconds · keys ${g.keys[0].toUpperCase()} + ${g.keys[1].toUpperCase()}</small><span class="prog"></span></button>`).join("");
    const body = frame(`
      <div class="battle">
        <div class="panel bossbar"><img id="bossimg" src="${A(boss.img)}" alt="${esc(boss.name)}"><div style="display:grid;gap:4px"><h2 style="font-size:28px">${esc(boss.name)}</h2><div class="bosshearts" aria-label="Boss hearts">${heartStr(B.hp, boss.hearts)}</div>${B.hp < 4 ? `<div class="enraged">⚠️ Desperate! Every hit it lands heals it. Answer carefully!</div>` : ""}
          <small>${B.iron ? "⚔️ Iron Sword: double damage this battle · " : ""}${S.bag.sword ? `🗡️ Sword ready · ` : ""}${S.bag.shield ? `🛡️ x${S.bag.shield} · ` : ""}${S.bag.armor ? `🦺 x${S.bag.armor} · ` : ""}${B.misses ? `Next ${B.misses} attack(s) will miss` : ""}</small></div></div>
        <div class="log" aria-live="polite">${esc(B.log)}</div>
        ${B.prayer ? `<div class="waiting">✉️ Your Prayer Letter was sent. Jehovah's help is coming in ${B.prayer} round${B.prayer > 1 ? "s" : ""}. Keep doing your part! (Micah 7:7)</div>` : ""}
        <div class="duel">${fighter("davian")}${fighter("levi")}</div>
        <div class="actions">
          <button class="actbtn" id="potion" ${S.bag.potion ? "" : "disabled"}>🧪 Potion (${S.bag.potion})</button>
          <button class="actbtn" id="letter" ${S.letters && !B.prayer ? "" : "disabled"}>✉️ Send Prayer Letter (${S.letters})</button>
          ${secrets}
        </div>
      </div>`);
    body.querySelectorAll(".fighter[data-w]").forEach(f => {
      const w = f.dataset.w, q = B.cur[w];
      f.querySelector(".say").onclick = () => speak(q.q + ". " + q.options.join(". "));
      f.querySelectorAll(".opt").forEach(b => b.onclick = () => { B.picks[w] = +b.dataset.k; tone(520, .06, "triangle", .1); resolveIfReady(); });
    });
    body.querySelector("#potion").onclick = () => { S.bag.potion--; S.hearts.levi = 5; S.hearts.davian = 5; B.out = { levi: 0, davian: 0 }; save(); sfx.win(); B.log = "Potion! Everyone is healed."; renderHud(); newRound(); };
    body.querySelector("#letter").onclick = sendLetter;
    body.querySelectorAll(".secret").forEach(wireSecret);
  };
  const resolveIfReady = () => {
    const active = ["levi", "davian"].filter(w => B.cur[w]);
    if (active.some(w => B.picks[w] === undefined)) return renderBattle();
    const right = active.filter(w => B.picks[w] === B.cur[w].answer), wrong = active.filter(w => !right.includes(w));
    // reveal
    document.querySelectorAll(".fighter[data-w]").forEach(f => {
      const w = f.dataset.w, q = B.cur[w];
      f.querySelectorAll(".opt").forEach(x => { x.disabled = true; x.classList.remove("picked"); if (+x.dataset.k === q.answer) x.classList.add("right"); else if (+x.dataset.k === B.picks[w]) x.classList.add("wrong"); });
    });
    let msg = [];
    let dmg = right.length === 2 ? 2 : right.length;
    if (dmg) {
      if (right.length === 2) msg.push("CRITICAL HIT! Both right, double damage!");
      else msg.push(`${PLAYERS[right[0]].name} got it right and hits the ${B.boss.name}!`);
      if (B.iron) dmg *= 2;
      else if (S.bag.sword) { S.bag.sword--; dmg *= 2; msg.push("The Sword doubles the hit!"); }
      right.forEach(w => { S.gold += 3; });
      sfx.right(); setTimeout(sfx.hit, 200); if (dmg >= 2) setTimeout(sfx.hit, 380);
      damageBoss(dmg);
    } else msg.push("Both answers missed.");
    if (wrong.length && B.hp > 0) {
      const missed = B.misses > 0;
      if (missed) { B.misses--; msg.push(`The ${B.boss.name} attacks... and misses!`); }
      else wrong.forEach(w => {
        let d = 1;
        if (S.bag.shield) { S.bag.shield--; d = .5; msg.push(`The Shield protects ${PLAYERS[w].name}.`); }
        else if (S.bag.armor) { S.bag.armor--; d = .5; msg.push(`The Armor protects ${PLAYERS[w].name}.`); }
        S.hearts[w] = Math.max(0, S.hearts[w] - d);
        msg.push(`The ${B.boss.name} hits ${PLAYERS[w].name}!`);
        const delay = 700 + wrong.indexOf(w) * 450;
        setTimeout(() => { sfx.grunt(); setTimeout(sfx.hurt, 150); const f = document.querySelector(`.fighter[data-w="${w}"]`); if (f) { f.classList.remove("ouch"); void f.offsetWidth; f.classList.add("ouch"); } }, delay);
      });
      // Below 4 hearts the boss gets desperate: each hit it lands heals it (1 player hit = 1 heart, both = 3)
      if (!missed && B.hp < 4) {
        const heal = wrong.length >= 2 ? 3 : 1;
        B.hp = Math.min(B.boss.hearts, B.hp + heal);
        msg.push(`The ${B.boss.name} feeds on its attack and heals ${heal} heart${heal > 1 ? "s" : ""}!`);
        setTimeout(() => { tone(300, .4, "sine", .15); tone(450, .4, "sine", .12, .15); tone(600, .5, "sine", .1, .3); const bh = document.querySelector(".bosshearts"); if (bh) bh.textContent = heartStr(B.hp, B.boss.hearts); }, 1300);
      }
    }
    // returning and resting players
    ["levi", "davian"].forEach(w => {
      if (B.out[w]) { B.out[w] = 0; S.hearts[w] = 2; msg.push(`${PLAYERS[w].name} is back with 2 hearts!`); }
      else if (S.hearts[w] <= 0) { B.out[w] = 1; msg.push(`${PLAYERS[w].name} needs a rest for one turn.`); }
    });
    if (B.out.levi && B.out.davian) { B.out = { levi: 0, davian: 0 }; S.hearts.levi = 3; S.hearts.davian = 3; B.hp = Math.min(B.boss.hearts, B.hp + 2); msg.push("Noé helps you up: \"Don't give up! Try again.\""); }
    save(); renderHud();
    B.log = msg.join(" ");
    const log = document.querySelector(".log"); if (log) log.textContent = B.log;
    if (B.hp <= 0) return setTimeout(finalMove, 1400);
    setTimeout(() => {
      if (B.prayer) { B.prayer--; if (!B.prayer) return godsPower(); }
      newRound();
    }, 2200);
  };
  const damageBoss = n => {
    B.hp = Math.max(0, B.hp - n);
    const img = document.getElementById("bossimg");
    if (img) { img.classList.remove("hit"); void img.offsetWidth; img.classList.add("hit"); }
    const bh = document.querySelector(".bosshearts"); if (bh) bh.textContent = heartStr(B.hp, B.boss.hearts);
  };

  const sendLetter = () => {
    S.letters--; save(); renderHud();
    B.prayer = 2;
    const fly = h(`<div class="letterfly" aria-hidden="true">✉️</div>`).firstChild; document.body.appendChild(fly); setTimeout(() => fly.remove(), 1700);
    tone(880, .5, "sine", .12); tone(1175, .7, "sine", .1, .2);
    B.log = "Your request for help flies up to Jehovah. Now wait patiently, and keep answering!";
    if (!S.prayerCardSeen) { S.prayerCardSeen = true; S.cards.push("prayer"); save(); toast("New Lesson Card: Keep on asking (Matthew 7:7)"); }
    renderBattle();
  };
  const godsPower = () => {
    const p = h(`<div class="power" role="dialog" aria-label="Jehovah's power"><div class="bolt"></div><div class="power-inner"><h2>⚡ Jehovah heard you! ⚡</h2><p>Thunder shakes the ground and lightning strikes the ${esc(B.boss.name)}! It has only half a heart left. Everyone is healed.</p><p style="font-size:18px">📖 Hebrews 4:16: help at the right time.</p><button class="btn gold" id="pw" hidden>Continue</button></div></div>`).firstChild;
    document.body.appendChild(p);
    requestAnimationFrame(() => { p.classList.add("flash"); $app.classList.add("shake"); p.classList.add("shake"); sfx.thunder(); setTimeout(sfx.thunder, 1300); });
    setTimeout(() => { $app.classList.remove("shake"); p.classList.remove("shake"); p.querySelector("#pw").hidden = false; p.querySelector("#pw").focus(); }, 2600);
    p.querySelector("#pw").onclick = () => {
      p.remove();
      S.hearts.levi = 5; S.hearts.davian = 5; B.out = { levi: 0, davian: 0 }; save(); renderHud();
      B.hp = Math.min(B.hp, .5); damageBoss(0); sfx.hit(); B.log = "Jehovah's power! The boss has only half a heart left. Finish it together!";
      if (B.hp <= 0) return finalMove();
      newRound();
    };
  };

  // Secret move: both players hold the button together (two fingers) or A + L keys, for 3 seconds
  const wireSecret = btn => {
    const gem = btn.dataset.gem, prog = btn.querySelector(".prog");
    const touches = new Set(); const keys = new Set(); let start = 0, raf = 0;
    const [k1, k2] = C.gems[gem].keys;
    const active = () => touches.size >= 2 || (keys.has(k1) && keys.has(k2));
    const tick = () => {
      if (!active()) { start = 0; prog.style.width = "0"; raf = 0; return; }
      if (!start) start = performance.now();
      const t = (performance.now() - start) / 3000; prog.style.width = Math.min(100, t * 100) + "%";
      if (t >= 1) { cleanup(); fireSecret(gem); return; }
      raf = requestAnimationFrame(tick);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    btn.addEventListener("pointerdown", e => { touches.add(e.pointerId); try { btn.setPointerCapture(e.pointerId); } catch (x) {} if (touches.size === 1) toast("Both hold it together!"); kick(); });
    const up = e => { touches.delete(e.pointerId); };
    btn.addEventListener("pointerup", up); btn.addEventListener("pointercancel", up);
    const kd = e => { const k = e.key.toLowerCase(); if (k === k1 || k === k2) { keys.add(k); kick(); } };
    const ku = e => keys.delete(e.key.toLowerCase());
    window.addEventListener("keydown", kd); window.addEventListener("keyup", ku);
    const cleanup = () => { window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); };
    btn.addEventListener("contextmenu", e => e.preventDefault());
    const obs = new MutationObserver(() => { if (!document.body.contains(btn)) { cleanup(); obs.disconnect(); } });
    obs.observe(document.body, { childList: true, subtree: true });
  };
  const fireSecret = gem => {
    S.gems[gem] = 0; save(); renderHud(); sfx.win();
    const g = C.gems[gem];
    if (gem === "jehovah") { S.hearts.levi = 5; S.hearts.davian = 5; B.out = { levi: 0, davian: 0 }; }
    if (gem === "bible") B.misses += 2;
    if (gem === "myself") damageBoss(3);
    if (gem === "helping") damageBoss(4);
    B.log = `${g.move}! ${g.does}.`;
    save(); renderHud();
    if (B.hp <= 0) return finalMove();
    renderBattle();
  };

  // Final Move: when the boss runs out of hearts, both brothers mash their own key (D and L) or tap their own button
  const finalMove = () => {
    if (!B || B.finishing) return; B.finishing = true;
    const boss = B.boss, target = boss.final ? 45 : 30, n = { davian: 0, levi: 0 };
    startMusic(true, true);
    const o = h(`<div class="finalmove" role="dialog" aria-label="Final move">
      <div class="fm-label">FINAL MOVE!</div>
      <p class="fm-help">Work together! <b>Davian</b>, press <kbd>D</kbd> as fast as you can. <b>Levi</b>, press <kbd>L</kbd> as fast as you can. On a tablet, tap your own button.</p>
      <div class="fm-stage"><img class="fm-boss" src="${A(boss.img)}" alt="${esc(boss.name)}"></div>
      <div class="fm-row">
        <button class="fm-btn" data-w="davian"><img src="${A("davian")}" alt=""><span>Davian · D</span><span class="fm-bar"><i></i></span></button>
        <button class="fm-btn" data-w="levi"><img src="${A("levi")}" alt=""><span>Levi · L</span><span class="fm-bar"><i></i></span></button>
      </div></div>`).firstChild;
    document.body.appendChild(o);
    const img = o.querySelector(".fm-boss");
    let done = false;
    const draw = () => {
      ["davian", "levi"].forEach(w => { o.querySelector(`.fm-btn[data-w="${w}"] .fm-bar i`).style.width = (Math.min(n[w], target) / target * 100) + "%"; });
      const prog = (Math.min(n.davian, target) + Math.min(n.levi, target)) / (2 * target);
      img.style.transform = `scale(${1 - .8 * prog}) rotate(${(Math.random() - .5) * 10 * prog}deg)`;
    };
    const press = w => {
      if (done) return;
      n[w] = Math.min(target, n[w] + 1);
      tone(w === "davian" ? 180 + n[w] * 6 : 260 + n[w] * 6, .07, "square", .1); if (n[w] % 5 === 0) noise(.08, 900, .5);
      img.classList.remove("jolt"); void img.offsetWidth; img.classList.add("jolt");
      draw();
      if (n.davian >= target && n.levi >= target) finish();
    };
    // the boss fights back a little, so they have to keep going
    const decay = setInterval(() => { ["davian", "levi"].forEach(w => { if (n[w] > 0 && n[w] < target) n[w]--; }); draw(); }, 450);
    const kd = e => { if (e.repeat) return; const k = e.key.toLowerCase(); if (k === "d") press("davian"); if (k === "l") press("levi"); };
    window.addEventListener("keydown", kd);
    o.querySelectorAll(".fm-btn").forEach(b => b.addEventListener("pointerdown", e => { e.preventDefault(); press(b.dataset.w); }));
    const finish = () => {
      done = true; clearInterval(decay); window.removeEventListener("keydown", kd); stopMusic();
      sfx.roar(); setTimeout(sfx.hit, 300); setTimeout(sfx.hit, 600);
      img.classList.add("fm-gone"); o.querySelector(".fm-label").textContent = "YOU DID IT!";
      setTimeout(() => { o.remove(); victory(); }, 1800);
    };
    draw();
  };

  const victory = () => {
    sfx.win();
    S.gold += 10; S.hearts.levi = 5; S.hearts.davian = 5; save();
    const boss = B.boss; B = null; stopMusic(); run.bossWon = true;
    const body = frame(`<div class="panel" style="display:grid;gap:12px;justify-items:center;text-align:center">
      <h2 style="font-size:38px">Victory! 🎉</h2>
      <p style="margin:0;font-size:20px">You beat the ${esc(boss.name)} together! +10 gold, and everyone is healed.</p>
      <div class="speaker"><img src="${A("noe")}" alt=""><div class="bubble" style="min-height:0">Well done! You trusted Jehovah and worked as a team.</div></div>
      <button class="btn" id="nx">Get your Lesson Card</button></div>`);
    body.querySelector("#nx").onclick = showLessonCard;
  };

  const showLessonCard = () => {
    const { st, i } = run, c = st.card;
    if (!S.cards.includes(st.id)) S.cards.push(st.id);
    S.done[i] = true;
    const got = run.correct + (run.bossWon ? 1 : 0), tot = starTotal(st), prev = S.best[i] || 0;
    S.best[i] = Math.max(prev, got); save(); sfx.win();
    const last = i === C.stages.length - 1;
    const body = frame(`
      <div class="panel lesson">
        <img src="${A(c.img)}" alt="">
        <div style="display:grid;gap:10px">
          <div class="stars big" aria-label="${got} of ${tot} stars">${"★".repeat(got)}${"☆".repeat(tot - got)}</div>
          <small style="color:var(--ink-soft)">${got === tot ? "Perfect! Every star in this place." : `${got} of ${tot} stars${got > prev ? " · new best!" : ` · your best is ${prev}`}. Come back and answer everything correctly to fill every star!`}</small>
          <small class="display" style="color:var(--ink-soft)">New Lesson Card · ${i + 1} of ${C.stages.length}</small>
          <h2>${esc(c.title)}</h2>
          <div class="ref">📖 ${esc(c.ref)}</div>
          <p style="margin:0;font-size:20px">${esc(c.text)}</p>
          ${last ? `<p style="margin:0;font-size:20px"><b>You finished Noé's Journey!</b> Ask your family: what was your favourite part, and what did you learn about Jehovah?</p>` : ""}
          <div class="row"><button class="btn" id="nx">${last ? "Back to the map" : "Continue the journey"}</button></div>
        </div>
      </div>`);
    body.querySelector("#nx").onclick = showMap;
  };

  // ---------- Modals ----------
  const openModal = (html, onClose) => {
    $layer.innerHTML = "";
    const m = h(`<div class="modal" role="dialog" aria-modal="true"><div class="panel">${html}</div></div>`).firstChild;
    $layer.appendChild(m);
    const close = () => { m.remove(); onClose && onClose(); };
    m.querySelectorAll("[data-close]").forEach(b => b.onclick = close);
    m.addEventListener("click", e => { if (e.target === m && !onClose) close(); });
    const f = m.querySelector("button"); if (f) f.focus();
    return m;
  };
  const openShop = () => {
    const greet = "Welcome, travellers! Everything here costs gold. I once sold something precious for a bowl of stew... don't make my mistake! (Genesis 25:29-34)";
    const draw = () => {
      const m = openModal(`
        <div class="esau"><img src="${A("esau")}" alt="Esaú"><div><h2>Esaú's shop</h2><p style="margin:4px 0 0">${esc(greet)}</p></div></div>
        <div class="coin" style="color:var(--wood-dark)">You have 🪙 ${S.gold}</div>
        <div class="shopgrid">${C.shop.map(it => `<div class="item"><div class="ic">${it.icon}</div><div><b>${esc(it.name)}</b> <small>${esc(it.does)} · you have ${S.bag[it.id]}</small></div><button class="btn gold" data-buy="${it.id}" ${S.gold >= it.price ? "" : "disabled"}>${it.price} 🪙</button></div>`).join("")}</div>
        <p style="margin:0;font-size:15px;color:var(--ink-soft)">The Prayer Letter isn't for sale. Noé gives it to you when you think deeply about Jehovah.</p>
        <button class="btn alt" data-close>Leave the shop</button>`);
      m.querySelectorAll("[data-buy]").forEach(b => b.onclick = () => {
        const it = C.shop.find(x => x.id === b.dataset.buy);
        if (S.gold < it.price) return;
        S.gold -= it.price; S.bag[it.id]++; save(); sfx.coin(); renderHud(); toast(`Bought: ${it.name}`); draw();
      });
    };
    draw();
  };
  const openCards = () => {
    const all = C.stages.map(st => S.cards.includes(st.id)
      ? `<figure><img src="${A(st.card.img)}" alt=""><figcaption><b>${esc(st.card.title)}</b><br>${esc(st.card.ref)}</figcaption></figure>`
      : `<figure><div class="blank">?</div><figcaption>${esc(st.name)}</figcaption></figure>`).join("")
      + (S.cards.includes("prayer") ? `<figure><div class="textcard">✉️<br>${esc(C.prayerCard.title)}</div><figcaption><b>${esc(C.prayerCard.title)}</b><br>${esc(C.prayerCard.ref)}</figcaption></figure>` : "");
    openModal(`<h2>Lesson Cards</h2><p style="margin:0">Use these to talk about Noé's account with your family.</p><div class="cardsgrid">${all}</div><button class="btn alt" data-close>Close</button>`);
  };
  const openShare = () => {
    const now = Date.now();
    const wait = w => Math.max(0, Math.ceil((S.shareAt[w] + SHARE_COOLDOWN - now) / 60000));
    const m = openModal(`
      <h2>Share a thought</h2>
      <p style="margin:0">Tell your family something you learned or thought about from Noé's account. A grown-up chooses which gem it fills.</p>
      <div class="row">${["davian", "levi"].map(w => `<button class="btn ${wait(w) ? "alt" : ""}" data-who="${w}" ${wait(w) ? "disabled" : ""}>${PLAYERS[w].name}${wait(w) ? ` (wait ${wait(w)} min)` : ""}</button>`).join("")}</div>
      <div id="pick"></div>
      <button class="btn alt" data-close>Close</button>`);
    m.querySelectorAll("[data-who]").forEach(b => b.onclick = () => {
      const w = b.dataset.who;
      m.querySelector("#pick").innerHTML = `<div class="grownup"><small>Grown-up: after ${PLAYERS[w].name} shares, pick the gem that fits.</small><div class="row">${Object.entries(C.gems).map(([k, g]) => `<button class="btn" style="background:${g.color}" data-gem="${k}">${esc(g.name)}</button>`).join("")}</div></div>`;
      m.querySelectorAll("[data-gem]").forEach(g => g.onclick = () => { S.shareAt[w] = Date.now(); save(); addGem(g.dataset.gem); $layer.innerHTML = ""; });
    });
  };

  // ---------- Boot ----------
  const start = () => { load(); if (S.screen === "map") showMap(); else showTitle(); };
  if (window.claude && window.claude.hot && window.claude.hot.snapshot) window.claude.hot.snapshot(() => S);
  start();
})();
