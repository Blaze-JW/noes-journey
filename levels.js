// levels.js — Jonah's Journey content: people, verses, questions and the six levels.
// Bible text: New World Translation (wol.jw.org / jw.org). Background facts: "Imitate Their Faith"
// chapters 13 and 14, and "Lessons You Can Learn From the Bible" lesson 54 (jw.org).
(function () {
  "use strict";

  // ---------- How people look ----------
  const LOOKS = {
    jonah: { skin: "#c98d5a", hair: "#3b2414", beard: "#3b2414", robe: "#d9b77e", robe2: "#b08d55", sash: "#2f6f9f" },
    jonahOld: { skin: "#c48a5a", hair: "#d8d4cc", beard: "#ece8e0", longBeard: true, robe: "#c9b08a", robe2: "#a8906a", sash: "#2f6f9f", old: true },
    trader: { skin: "#b07a4a", wrap: "#c8433a", beard: "#2b1a10", robe: "#3a6ea5", robe2: "#2a5080", sash: "#e8b53a" },
    oldman: { skin: "#c48a5a", hair: "#cfcac0", beard: "#e0dcd4", longBeard: true, robe: "#8a6a4a", staff: true, old: true },
    woman: { skin: "#d09a6a", veil: "#6a8ac0", robe: "#6a8ac0", robe2: "#4a6aa0" },
    traveller: { skin: "#a8703e", wrap: "#e8e0c8", beard: "#3a2414", robe: "#7a9a5a", staff: true },
    fishseller: { skin: "#9a6438", wrap: "#3a6ea5", beard: "#1a1a1a", robe: "#c8a060", short: true },
    shipmaster: { skin: "#9a6438", cap: "#3a3a5a", beard: "#2b1a10", robe: "#5a4a7a", short: true, sash: "#e8b53a" },
    captain: { skin: "#a86c3c", cap: "#a8332a", beard: "#9a9590", robe: "#3a3a5a", short: true, sash: "#e8b53a" },
    sailor1: { skin: "#b07a4a", band: "#c8433a", hair: "#2b1a10", beard: "#2b1a10", robe: "#e8e0c8", short: true },
    sailor2: { skin: "#8d5a36", band: "#3a6ea5", hair: "#1a1a1a", robe: "#c8a060", short: true },
    sailor3: { skin: "#d09a6a", band: "#6fbf4a", hair: "#7a4a22", beard: "#7a4a22", robe: "#a8c0d8", short: true },
    sailor4: { skin: "#a86c3c", band: "#e8b53a", hair: "#2b1a10", robe: "#d8b0a0", short: true },
    sailor5: { skin: "#c48a5a", band: "#8a3a8a", hair: "#3b2414", beard: "#3b2414", robe: "#e0d0a0", short: true },
    soldier: { skin: "#b07a4a", helmet: "#a8a8b0", beard: "#1a1a1a", robe: "#8a3a2a", robe2: "#6a2a1a", short: true, spear: true, shield: "#b8902a" },
    ninevite: { skin: "#b07a4a", hair: "#1a1a1a", beard: "#1a1a1a", longBeard: true, robe: "#a83a3a", robe2: "#802a2a", sash: "#e8b53a" },
    ninevite2: { skin: "#c48a5a", veil: "#c8a060", robe: "#4a8a7a", robe2: "#3a6a5a" },
    sack: { skin: "#b07a4a", hair: "#1a1a1a", beard: "#1a1a1a", longBeard: true, robe: "#7a6040", robe2: "#5e4a30" },
    sack2: { skin: "#c48a5a", veil: "#6e5838", robe: "#7a6040", robe2: "#5e4a30" },
    sack3: { skin: "#a8703e", hair: "#2b1a10", robe: "#7a6040", robe2: "#5e4a30", short: true },
    king: { skin: "#b07a4a", crown: "#e8b53a", beard: "#1a1a1a", longBeard: true, robe: "#6a3a8a", robe2: "#4a2a6a", sash: "#e8b53a" },
    kingSack: { skin: "#b07a4a", hair: "#1a1a1a", beard: "#1a1a1a", longBeard: true, robe: "#7a6040", robe2: "#5e4a30" },
  };
  Object.keys(LOOKS).forEach(k => (LOOKS[k].id = k));
  // Jonah's moods for some scenes
  ["angry", "sad"].forEach(m => { LOOKS["jonah_" + m] = Object.assign({}, LOOKS.jonah, { id: "jonah_" + m, mood: m }); });

  const SPEAKERS = {
    jonah: { name: "Jonah", look: "jonah" },
    jonahOld: { name: "Jonah, years later", look: "jonahOld" },
    jehovah: { name: "Jehovah" },
    narrator: { name: "" },
    trader: { name: "Trader", look: "trader" },
    oldman: { name: "Old man at the well", look: "oldman" },
    woman: { name: "Neighbour", look: "woman" },
    traveller: { name: "Traveller", look: "traveller" },
    fishseller: { name: "Fish seller", look: "fishseller" },
    shipmaster: { name: "Ship master", look: "shipmaster" },
    captain: { name: "Ship captain", look: "captain" },
    sailor1: { name: "Sailor", look: "sailor1" }, sailor2: { name: "Sailor", look: "sailor2" }, sailor3: { name: "Sailor", look: "sailor3" },
    sailor4: { name: "Sailor", look: "sailor4" }, sailor5: { name: "Sailor", look: "sailor5" },
    sailors: { name: "The sailors", look: "sailor1" },
    guard: { name: "Guard", look: "soldier" },
    ninevite: { name: "Man of Nineveh", look: "ninevite" },
    ninevite2: { name: "Woman of Nineveh", look: "ninevite2" },
    sack: { name: "Man of Nineveh", look: "sack" },
    sack2: { name: "Woman of Nineveh", look: "sack2" },
    sack3: { name: "Boy of Nineveh", look: "sack3" },
    king: { name: "The king of Nineveh", look: "king" },
  };

  // ---------- Talk helpers ----------
  // Say a list of lines: [who, text, opts?] or plain strings (said by the npc).
  function lines(list) {
    return async (g, e) => {
      for (const l of list) {
        if (typeof l === "string") await g.say(e.who, l);
        else if (typeof l === "function") await l(g, e);
        else await g.say(l[0], l[1], l[2] || {});
      }
    };
  }
  function npc(b, tx, row, who, list, o = {}) {
    const e = b.npc(tx, row, Object.assign({ look: LOOKS[SPEAKERS[who].look], who, mark: o.goal ? "!" : "?" }, o));
    const talk = lines(list);
    e.act = async (g, ent) => {
      await talk(g, ent);
      if (ent.goal && !ent.talked) { ent.talked = true; g.goal.add(ent.goal); }
      ent.mark = ".";
      if (ent.after) await ent.after(g, ent);
    };
    return e;
  }
  function sign(b, tx, row, list, dir = 1) {
    return b.ent("prop", tx * 16, row * 16 - 22, { w: 16, h: 22, act: lines(list.map(t => ["narrator", t])), draw: (ctx, e, t) => ART.decor(ctx, "sign", e.x, e.y + 22, t, { dir }) });
  }
  const once = (g, key) => { if (g.LV.vars[key]) return false; g.LV.vars[key] = 1; return true; };

  // ---------- Verses (NWT) ----------
  const V = {
    k1425: ["…according to the word that Jehovah the God of Israel spoke through his servant Jonah the son of Amittai, the prophet from Gath-hepher.", "2 Kings 14:25"],
    j11: ["The word of Jehovah came to Jonah the son of Amittai, saying:", "Jonah 1:1"],
    j12: ["Get up, go to Nineveh the great city, and proclaim judgment against her, for their wickedness has come to my attention.", "Jonah 1:2"],
    j13a: ["But Jonah got up to run away from Jehovah to Tarshish;", "Jonah 1:3"],
    j13b: ["He went down to Joppa and found a ship going to Tarshish.", "Jonah 1:3"],
    j13c: ["So he paid the fare and went aboard to go with them to Tarshish, away from Jehovah.", "Jonah 1:3"],
    p1397: ["Where can I escape from your spirit, and where can I run away from your face?", "Psalm 139:7"],
    j14: ["Then Jehovah hurled a strong wind at the sea, and there was such a violent storm on the sea that the ship was about to be wrecked.", "Jonah 1:4"],
    j15: ["And they began throwing the articles of the ship into the sea, to make it lighter.", "Jonah 1:5"],
    j15b: ["But Jonah had gone down into the inner part of the ship, where he lay down and fell fast asleep.", "Jonah 1:5"],
    j16: ["Why are you sleeping? Get up, call out to your god! Perhaps the true God will show his concern for us.", "Jonah 1:6"],
    j19: ["I am a Hebrew, and I fear Jehovah the God of the heavens, the One who made the sea and the dry land.", "Jonah 1:9"],
    j112: ["Lift me up and throw me into the sea, and the sea will calm down for you, for I know that it is because of me that this violent storm has come upon you.", "Jonah 1:12"],
    j23: ["When you threw me to the depths, into the heart of the open sea…", "Jonah 2:3"],
    j25: ["The watery deep closed in on me. Weeds were wrapped around my head.", "Jonah 2:5"],
    j26: ["To the bottoms of the mountains I sank down.", "Jonah 2:6"],
    j33: ["So Jonah got up and went to Nineveh in obedience to the word of Jehovah.", "Jonah 3:3"],
    j35: ["And the men of Nineveh put faith in God, and they proclaimed a fast and put on sackcloth, from the greatest to the least of them.", "Jonah 3:5"],
    m1241: ["Men of Nineveh will rise up in the judgment with this generation and will condemn it, because they repented at what Jonah preached.", "Matthew 12:41"],
    j42: ["…for I knew that you are a compassionate and merciful God, slow to anger and abundant in loyal love, one who feels grieved over calamity.", "Jonah 4:2"],
    p39: ["Jehovah is not slow concerning his promise, as some people consider slowness, but he is patient with you because he does not desire anyone to be destroyed but desires all to attain to repentance.", "2 Peter 3:9"],
    j310: ["When the true God saw what they did, how they had turned back from their evil ways, he reconsidered the calamity that he said he would bring on them, and he did not bring it.", "Jonah 3:10"],
    j22: ["Out of my distress I called out to Jehovah, and he answered me.", "Jonah 2:2"],
    j411: ["Should I not also feel sorry for Nineveh the great city, in which there are more than 120,000 men who do not even know right from wrong, as well as their many animals?", "Jonah 4:11"],
  };
  const sc = (k, note) => ({ text: V[k][0], ref: V[k][1], note });

  // ---------- Scroll Keeper questions (d = Davian, l = Levi) ----------
  const Q = {
    l1g1: { d: { ref: "2 Kings 14:25", q: "Read 2 Kings 14:25. Who was Jonah's father?", o: ["Amittai", "Noé", "Abraham"] }, l: { ref: "2 Kings 14:25", q: "Read 2 Kings 14:25. What was Jonah's job?", o: ["A prophet of Jehovah", "A fisherman", "A king"] } },
    l1g2: { d: { ref: "Jonah 1:2", q: "Read Jonah 1:2. Why did Jehovah want Jonah to proclaim judgment against Nineveh?", o: ["Their wickedness had come to his attention", "They forgot to build a temple", "They had too many animals"] }, l: { ref: "Jonah 1:2", q: "Read Jonah 1:2. Which city did Jehovah send Jonah to?", o: ["Nineveh", "Jerusalem", "Bethlehem"] } },
    l2g1: { d: { ref: "Jonah 1:3", q: "Read Jonah 1:3. Which town by the sea did Jonah go down to?", o: ["Joppa", "Nineveh", "Gath-hepher"] }, l: { ref: "Jonah 1:3", q: "Read Jonah 1:3. What did Jonah find at Joppa?", o: ["A ship", "A camel", "A big fish"] } },
    l2g2: { d: { ref: "Jonah 1:3", q: "Read Jonah 1:3. Who was Jonah trying to run away from?", o: ["Jehovah", "The sailors", "The king of Israel"] }, l: { ref: "Jonah 1:3", q: "Read Jonah 1:3. Where was the ship going?", o: ["Tarshish", "Nineveh", "Egypt"] } },
    s1: { d: { ref: "2 Kings 14:25", q: "The sailor asks: “Where do you come from?” Read 2 Kings 14:25. Which town was Jonah from?", o: ["Gath-hepher", "Joppa", "Tarshish"] }, l: { ref: "2 Kings 14:25", q: "The sailor asks: “What is your work?” Read 2 Kings 14:25. What was Jonah's work?", o: ["A prophet of Jehovah", "A sailor", "A farmer"] } },
    s2: { d: { ref: "Jonah 1:9", q: "The sailor asks: “From what people are you?” Read Jonah 1:9. What did Jonah say he was?", o: ["A Hebrew", "A Philistine", "An Assyrian"] }, l: { ref: "Jonah 1:9", q: "The sailor asks: “From what people are you?” Read Jonah 1:9. Jonah said: “I am a …”", o: ["Hebrew", "Egyptian", "Sailor"] } },
    s3: { d: { ref: "Jonah 1:9", q: "The sailor asks: “Who is your God?” Read Jonah 1:9. How did Jonah describe Jehovah?", o: ["The God of the heavens, who made the sea and the dry land", "The god of this ship", "A god who only lives in Israel"] }, l: { ref: "Jonah 1:9", q: "The sailor asks: “Who is your God?” Read Jonah 1:9. What did Jehovah make?", o: ["The sea and the dry land", "Only this ship", "Nothing"] } },
    s4: { d: { ref: "Genesis 7:23", q: "Remember Noé! Read Genesis 7:23. Who survived the Flood?", o: ["Only Noé (Noah) and those with him in the ark", "Everyone who could swim", "Nobody at all"] }, l: { ref: "Genesis 7:16", q: "Remember Noé! Read Genesis 7:16. Who shut the door of the ark?", o: ["Jehovah", "Noé", "An elephant"] } },
    s5: { d: { ref: "Psalm 65:2", q: "Read Psalm 65:2. Who can come to Jehovah, the Hearer of prayer?", o: ["People of all sorts", "Only kings", "Only people from Israel"] }, l: { ref: "Psalm 65:2", q: "Read Psalm 65:2. What does it call Jehovah?", o: ["Hearer of prayer", "King of the waves", "God of the ship"] } },
    p1: { d: { ref: "Jonah 2:2", q: "Build Jonah's prayer: “Out of my ___ I called out to Jehovah, and he answered me.”", o: ["distress", "house", "boat"] }, l: { ref: "Jonah 2:1", q: "Read Jonah 2:1. Who did Jonah pray to?", o: ["Jehovah his God", "The fish", "The sailors"] } },
    p2: { d: { ref: "Jonah 2:7", q: "Build Jonah's prayer: “When my life was ebbing away, Jehovah was the One whom I ___.”", o: ["remembered", "forgot", "ran away from"] }, l: { ref: "Jonah 2:2", q: "Read Jonah 2:2. Did Jehovah answer Jonah?", o: ["Yes, he answered him", "No, he didn't listen"] } },
    p3: { d: { ref: "Jonah 2:9", q: "How did Jonah end his prayer? “Salvation is from ___.”", o: ["Jehovah", "the sailors", "the big fish"] }, l: { ref: "Jonah 2:9", q: "Read Jonah 2:9. “Salvation is from …”", o: ["Jehovah", "the sailors", "the big fish"] } },
    l5g1: { d: { ref: "Jonah 3:1", q: "Read Jonah 3:1. How many times did Jehovah's word come to Jonah?", o: ["A second time", "Only once", "Ten times"] }, l: { ref: "Jonah 3:3", q: "Read Jonah 3:3. Did Jonah obey Jehovah this time?", o: ["Yes, he went to Nineveh", "No, he ran away again"] } },
    l5g2: { d: { ref: "Jonah 3:3", q: "Read Jonah 3:3. How big was Nineveh?", o: ["A very large city, a walking distance of three days", "A small village", "Just one street"] }, l: { ref: "Jonah 3:3", q: "Read Jonah 3:3. How many days did it take to walk through Nineveh?", o: ["Three", "Forty", "One"] } },
    l5g3: { d: { ref: "Jonah 3:4", q: "Read Jonah 3:4. What did Jonah say would happen in 40 days?", o: ["Nineveh would be overthrown", "It would rain for 40 days", "There would be a big party"] }, l: { ref: "Jonah 3:4", q: "Read Jonah 3:4. How many days did Jonah say were left?", o: ["40", "3", "100"] } },
    l5g4: { d: { ref: "Jonah 3:5", q: "Read Jonah 3:5. What did the people put on?", o: ["Sackcloth", "Crowns", "Armour"] }, l: { ref: "Jonah 3:5", q: "Read Jonah 3:5. Did the people of Nineveh believe God?", o: ["Yes, they put faith in God", "No, they laughed"] } },
    l5g5: { d: { ref: "Matthew 12:41", q: "Jesus talked about Nineveh! Read Matthew 12:41. What did the people do when Jonah preached?", o: ["They repented", "They ran away", "They built a ship"] }, l: { ref: "Matthew 12:41", q: "Read Matthew 12:41. When Jonah preached, the people of Nineveh…", o: ["Repented (were sorry and changed)", "Ran away", "Built a ship"] } },
    l6g1: { d: { ref: "Jonah 4:5", q: "Read Jonah 4:5. Why did Jonah sit down east of the city?", o: ["To see what would happen to the city", "To take a nap", "To catch fish"] }, l: { ref: "Jonah 4:5", q: "Read Jonah 4:5. What did Jonah make for himself?", o: ["A shelter", "A boat", "A tower"] } },
    l6g2: { d: { ref: "Jonah 4:6", q: "Read Jonah 4:6. Why did Jehovah make the plant grow?", o: ["To give Jonah shade and relieve his misery", "To give him fruit to sell", "To hide him from Nineveh"] }, l: { ref: "Jonah 4:6", q: "Read Jonah 4:6. How did Jonah feel about the plant?", o: ["Very pleased", "Angry", "Scared"] } },
    l6g3: { d: { ref: "Jonah 4:11", q: "Read Jonah 4:11. Besides the people, what else in Nineveh did Jehovah care about?", o: ["Their many animals", "Their gold", "Their walls"] }, l: { ref: "Jonah 4:11", q: "Read Jonah 4:11. How many people lived in Nineveh?", o: ["More than 120,000", "Ten", "Forty"] } },
  };

  // =====================================================================
  // LEVEL 1 — Gath-hepher: the message
  // =====================================================================
  const L1 = {
    title: "Gath-hepher: the message", short: "Gath-hepher", ref: "Jonah 1:1-3; 2 Kings 14:25", map: [44, 34],
    intro: "Jonah is a prophet of Jehovah in Israel. Today Jehovah will give him a very hard job.",
    scrolls: [sc("k1425", "Jonah had brought Jehovah's messages before."), sc("j11"), sc("j12")],
    lesson: { title: "Even a prophet felt afraid", goal: "myself", text: "Jonah was afraid of the hard job Jehovah gave him. Everyone feels afraid sometimes, even grown-ups. We can always tell Jehovah how we feel.", verse: V.j12[0], ref: V.j12[1] },
    rooms: [{
      w: 112, theme: "hills", bg: "hills", music: "home", start: [2, 9],
      build(b) {
        b.ground(0, 111);
        sign(b, 5, 9, ["◀ ▶ (or A and D) walk. ⤒ (Space or W) jumps.", "Press 💬 (or E) to talk to people and read signs.", "Find the 3 hidden verse scrolls 📜 for a star!"]);
        b.block(9, 8);
        b.dec("house", 11, 9, { w: 56, h: 44 });
        npc(b, 16, 9, "woman", [
          "Shalom, Jonah! Everyone still talks about the message Jehovah spoke through you.",
          "You said King Jeroboam would win back Israel's land, and it happened!",
          ["narrator", "This is true: Jehovah spoke through Jonah about Israel's land (2 Kings 14:25)."],
        ]);
        b.dec("olive", 18, 9);
        b.gate(21, 9, { q: Q.l1g1 });
        b.trig(17, 18, async g => g.bubble(`A gate! Jonah and the bag: stand beside it together and wait. Then ${g.keeperName()}, press ${g.talkKey(g.LV.keeper)} to open it.`, 5000));
        b.dec("house", 23, 9, { w: 64, h: 48 }); b.roof(23, 26, 6);
        b.scroll(25, 3, 0);
        b.dec("stall", 28, 9);
        npc(b, 30, 9, "trader", [
          "Shalom, Jonah! I just came back from a long trip east, to Assyria.",
          "Their great city is called Nineveh. It's huge! It takes three days to walk all the way through it.",
          "And it's far. About 800 kilometres from here. Walking there takes about a month!",
        ], { goal: "talk" });
        b.dec("house", 32, 9, { w: 48, h: 40 });
        b.cp(35, 9);
        b.clear(37, 9, 39, 11);
        b.fill(41, 8, 45, 8); b.fill(46, 7, 49, 8); b.fill(50, 8, 53, 8);
        b.spikes(48, 48, 6);
        b.dec("olive", 42, 8); b.dec("olive", 51, 8);
        b.cp(55, 9);
        b.dec("well", 57, 9);
        npc(b, 59, 9, "oldman", [
          "Nineveh? Hmm. That is where the Assyrians live.",
          "The Assyrians are known for being very violent and cruel. Their armies attack towns and hurt people.",
          "Everyone is afraid of them, Jonah.",
        ], { goal: "talk" });
        b.dec("house", 61, 9, { w: 48, h: 40 });
        b.clear(65, 9, 71, 11); b.plat(66, 67, 7); b.plat(69, 70, 7);
        b.scroll(68, 4, 1);
        b.dec("house", 74, 9, { w: 64, h: 48, ladder: true, lamp: true });
        b.trig(75, 77, async g => {
          if (!g.goal.done("talk")) { g.p.x -= 24; await g.think("I'll go home after I've talked to my 2 neighbours."); return; }
          if (once(g, "homeDone")) await homeAtNight(g);
        }, { repeat: true });
        b.gate(81, 9, { q: Q.l1g2 });
        b.fill(84, 8, 87, 8); b.fill(88, 6, 90, 8);
        b.block(93, 5, 94, 5); b.clear(94, 9, 96, 11);
        b.scroll(93, 3, 2);
        b.cp(99, 9);
        b.spikes(102, 102, 8);
        b.dec("sign", 107, 9, { dir: 1, dir2: -1 });
        b.trig(106, 107, crossroads);
      },
    }],
    async onStart(g) {
      g.goal.set([{ id: "talk", label: "Talk to 2 neighbours about Nineveh", n: 2 }, { id: "home", label: "Go home to your house", n: 1 }]);
      await g.narr("Gath-hepher, a small town in the hills of Israel. Jonah lives here. He is a prophet of Jehovah.");
      await g.narr(`${g.jonahName()} is playing Jonah. ${g.keeperName()} is Jonah's bag! The bag carries the Bible scrolls, so ${g.keeperName()} is the Scroll Keeper too.`);
      await g.narr("Gates only open when Jonah and the bag wait at the gate together. Then the Scroll Keeper answers a Bible question to open it.");
      await g.think("What a lovely day in Gath-hepher! I'll say shalom to my neighbours.", { mood: "happy" });
    },
  };
  async function homeAtNight(g) {
    g.goal.add("home");
    await g.walkTo(76);
    g.p.hidden = true;
    await g.tween(g.v, "fade", 1, 900);
    await g.cut("message");
    await g.cut("vision");
    g.LV.vars.night = 1; g.LV.vars.theme = "night"; g.music("night");
    g.p.hidden = false; g.p.face = 1;
    await g.tween(g.v, "fade", 0, 900);
    await g.think("Nineveh is about 800 kilometres away. And the Assyrians are so violent...", { mood: "scared" });
    await g.think("I'd be all alone there, a servant of Jehovah among people like that. What if they hurt me?", { mood: "scared" });
    await g.narr("The Bible doesn't tell us everything Jonah thought. But we know he did not want to go.");
    g.goal.set([{ id: "cross", label: "Walk to the crossroads", n: 1 }]);
  }
  async function crossroads(g) {
    g.goal.add("cross");
    await g.narr("The crossroads. East is the long road to Nineveh. West is the road down to the sea.");
    await g.decision({
      prompt: "Jehovah told Jonah to go to Nineveh. What should Jonah do?",
      options: ["Go east to Nineveh, like Jehovah said", "Run west to the sea", "Stay home and hide"],
      truth: V.j13a[0], ref: V.j13a[1],
      find: { q: "Where did Jonah go? Did he go to Nineveh?", hint: "Look for the name of a far-away place in Jonah 1:3.", hint2: "Where did Jonah want to sail to?",
        keys: ["tarshish", "ran", "run", "runs", "running", "runned", "runed", "flee", "fled", "fleeing", "away", "escape", "hide", "hid", "ship", "boat", "joppa", "opposite", "sea", "sail", "sailed"] },
      note: "Jonah ran the opposite way. He was afraid, and he tried to get away from the job Jehovah gave him.",
      talk: "Why do you think Jonah ran? Have you ever been scared to do something Jehovah asks, like telling a friend about him?",
      gem: "myself",
    });
    await g.think("Maybe if I go far enough away...", { mood: "sad" });
    await g.tween(g.v, "fade", 1, 900);
    g.endLevel();
  }

  // =====================================================================
  // LEVEL 2 — The road to Joppa
  // =====================================================================
  const L2 = {
    title: "The road to Joppa", short: "Joppa", ref: "Jonah 1:3", map: [30, 54], coins: 10,
    intro: "Jonah runs west, down to the port of Joppa, to find a ship going far away to Tarshish.",
    scrolls: [sc("j13a"), sc("p1397", "Nobody can run away from Jehovah."), sc("j13b")],
    lesson: { title: "Nobody can hide from Jehovah", goal: "jehovah", text: "Jonah tried to run away, but nobody can hide from Jehovah. That's good news! Wherever we are, Jehovah sees us and cares about us.", verse: V.p1397[0], ref: V.p1397[1] },
    onCoin(g) { g.goal.add("coins"); },
    rooms: [{
      w: 130, theme: "road", bg: "road", music: "road", start: [2, 9],
      themeAt: tx => (tx >= 92 ? "port" : null),
      build(b) {
        b.ground(0, 129);
        npc(b, 8, 9, "traveller", ["Going west, friend? This road goes down to Joppa, by the sea.", "Ships sail from Joppa to faraway places."]);
        b.fill(12, 8, 16, 8); b.fill(17, 7, 20, 8);
        b.coins(13, 15, 6);
        b.spikes(19, 19, 6);
        b.clear(23, 9, 25, 11); b.plat(24, 24, 7); b.coin(24, 5);
        b.cp(27, 9);
        b.block(31, 6, 32, 6); b.coins(31, 32, 5);
        b.block(35, 4, 36, 4); b.coins(35, 36, 3);
        b.scroll(38, 1, 0);
        b.gate(44, 9, { q: Q.l2g1 });
        b.spikes(50, 50, 8); b.spikes(56, 56, 8);
        b.coins(52, 54, 7);
        b.cp(58, 9);
        b.clear(63, 9, 65, 11); b.plat(64, 64, 7); b.coin(64, 5);
        b.clear(68, 9, 70, 11); b.block(69, 7); b.coin(69, 5);
        b.dec("palm", 74, 9); b.dec("palm", 86, 9);
        b.block(78, 6, 79, 6); b.block(82, 3, 83, 3);
        b.scroll(82, 1, 1);
        b.coin(84, 8);
        b.cp(88, 9);
        b.dec("boat", 104, 9); b.dec("boat", 118, 9);
        b.dec("stall", 93, 9, { c1: "#3a6ea5", goods: ["#9fd8ff", "#c8d8e8", "#9fd8ff"] });
        npc(b, 98, 9, "fishseller", ["Fresh fish! Fresh fish!", "Ships leave Joppa for everywhere. There's one going all the way to Tarshish, at the far end of the sea!", ["narrator", "Tarshish may have been in Spain, about 3,500 km from Nineveh. The trip could take a year!"]]);
        b.dec("crates", 101, 9);
        b.block(104, 6, 105, 6); b.scroll(105, 4, 2);
        b.haz("crab", 106 * 16, 9 * 16 - 9, { w: 14, h: 9, x0: 102 * 16, x1: 110 * 16, sp: 0.5 });
        b.haz("crab", 108 * 16, 9 * 16 - 9, { w: 14, h: 9, x0: 103 * 16, x1: 111 * 16, sp: 0.7, dir: -1 });
        b.gate(113, 9, { q: Q.l2g2, col: "#6a4a7a" });
        npc(b, 120, 9, "shipmaster", [], { id: "master", mark: "!" }).act = shipMaster;
        b.clear(125, 9, 129, 9); b.water(125, 129, 9);
        b.dec("rail", 124, 9, { w: 90 });
      },
    }],
    async onStart(g) {
      g.goal.set([{ id: "coins", label: "Collect coins for the ship fare", n: 10 }, { id: "fare", label: "Pay the fare at the port", n: 1 }]);
      await g.narr(`Now ${g.jonahName()} plays Jonah and ${g.keeperName()} is Jonah's bag and the Scroll Keeper.`);
      await g.think("Tarshish is far, far to the west, across the sea. Maybe if I go far enough away...", { mood: "sad" });
    },
  };
  async function shipMaster(g, e) {
    if (g.goal.done("fare")) return;
    await g.say("shipmaster", "Going to Tarshish? It's a long, long voyage. The fare is 10 coins.");
    if (!g.goal.done("coins")) { await g.think(`I only have ${g.LV.coins} coins. I need to find more on the road.`); return; }
    g.LV.coins -= 10; g.goal.add("fare"); g.sfx("coin"); e.mark = ".";
    await g.narr(`“${V.j13c[0]}” (${V.j13c[1]})`);
    await g.say("shipmaster", "Welcome aboard! We sail at once.");
    await g.walkTo(123);
    await g.reflect("Can Jonah really run away from Jehovah? Why not? (Psalm 139:7 can help.)", "jehovah");
    await g.tween(g.v, "fade", 1, 900);
    g.endLevel();
  }

  // =====================================================================
  // LEVEL 3 — The storm at sea
  // =====================================================================
  const SAILORS = [
    { who: "sailor1", tx: 5, row: 7, q: Q.s1, ask: "What is your work, and where do you come from?", calm: "A prophet... from Israel. All right. I'll hold on tight." },
    { who: "sailor2", tx: 16, row: 9, q: Q.s2, ask: "What is your country, and from what people are you?", calm: "A Hebrew. I've heard of your people." },
    { who: "sailor3", tx: 20, row: 6, q: Q.s3, ask: "Who is your God? Our gods aren't helping us!", calm: "Your God made the sea itself? Then he is far greater than our gods!" },
    { who: "sailor4", tx: 24, row: 3, q: Q.s4, ask: "So much water! Has your God ever saved anyone from a flood?", calm: "Jehovah saved Noé from the whole world's flood! Then he is truly powerful." },
    { who: "sailor5", tx: 38, row: 8, q: Q.s5, ask: "If we call to your God, will he even hear us?", calm: "Then we will call out to Jehovah too!" },
  ];
  function deck(b, g) {
    const v = g.LV.vars, storm = v.phase === 1;
    b.ground(2, 41); b.fill(2, 7, 9, 8); b.fill(35, 8, 41, 8);
    b.water(0, 1, 10); b.water(42, 43, 10); b.fill(0, 11, 1, 11, "~"); b.fill(42, 11, 43, 11, "~");
    b.plat(19, 25, 6); b.plat(20, 24, 3);
    b.dec("mast", 22, 9, { furled: storm });
    b.dec("rail", 2, 7, { w: 128 }); b.dec("rail", 10, 9, { w: 400 }); b.dec("rail", 35, 8, { w: 112 });
    b.dec("crates", 4, 7); b.dec("hatch", 12, 9);
    b.scroll(23, 1, 1); b.scroll(11, 6, 2);
    if (!storm) {
      npc(b, 6, 7, "captain", ["We sail for Tarshish! A long voyage, but a good wind."]);
      npc(b, 16, 9, "sailor2", ["Ropes tied, sails up. Off we go!"]);
      npc(b, 30, 9, "sailor3", ["The sea is calm today. Tarshish, here we come!"]);
      npc(b, 37, 8, "sailor5", ["You look tired, friend. Have a rest below deck."]);
      b.ent("prop", 12 * 16, 9 * 16 - 6, { w: 24, h: 6, act: goBelow, draw: () => {} });
    } else {
      SAILORS.forEach((s, i) => {
        const e = npc(b, s.tx, s.row, s.who, [], { goal: "sailors", id: "s" + i });
        e.act = async (g2, ent) => {
          if (!g2.LV.vars.lots) return;
          if (ent.calmed) { await g2.say(s.who, "Thank you... but the sea is still so wild!"); return; }
          await g2.say(s.who, s.ask);
          await g2.ask(s.q);
          ent.calmed = true; ent.mark = "."; g2.goal.add("sailors");
          await g2.say(s.who, s.calm);
          if (g2.goal.done("sailors")) await allCalm(g2);
        };
        e.mark = "!";
      });
      npc(b, 10, 9, "captain", ["Hold on! Answer the men, Jonah. They are terrified!"]);
      [[10, 33, 0], [12, 30, 2], [26, 34, 4]].forEach(([a, z, ph]) => b.ent("barrel", ((a + z) / 2) * 16, 9 * 16 - 14, { w: 14, h: 14, x0: a * 16, x1: z * 16, ph }));
    }
  }
  async function goBelow(g) {
    g.goal.add("below");
    await g.think("I'm so tired... and sad. I'll go down below and lie down.", { mood: "sad" });
    await g.narr(`“${V.j15b[0]}” (${V.j15b[1]})`);
    await g.tween(g.v, "fade", 1, 700);
    g.room(1, 3, 9);
    g.p.pose = "sleep";
    await g.cut("storm");
    await wakeUp(g);
  }
  async function wakeUp(g) {
    const v = g.LV.vars;
    v.phase = 1; v.storm = 1; v.rain = 110; v.drift = 0; g.music("storm"); g.ambient("storm", 0.4);
    await g.tween(v, "fade", 0, 600);
    const cap = g.find("capHold");
    await g.npcWalk(cap, 5, 1.2);
    await g.say("captain", "Why are you sleeping? Get up, call out to your god! Perhaps the true God will show his concern for us.", { ref: "Jonah 1:6" });
    g.p.pose = null;
    await g.think("A storm! A terrible storm... Is this because of me?", { mood: "scared" });
    g.goal.set([{ id: "up", label: "Climb up to the deck", n: 1 }]);
    v.ship = 1; g.meter("🚢 The ship is holding together", 1, "#6fbf4a");
  }
  // Every sailor has his answer. Jonah walks to the edge himself, so nobody misses a scroll on the way.
  async function allCalm(g) {
    const v = g.LV.vars; v.shipDone = 1; g.meter(null);
    await g.think("The sailors are listening now... but the storm keeps getting worse. I know why this is happening.", { mood: "sad" });
    g.goal.set([{ id: "edge", label: "Go to the edge of the ship", n: 1 }]);
    g.spawn("spot", 40 * 16 + 2, 8 * 16 - 18, { w: 12, h: 12, act: async (g2, ent) => { ent.done = true; ent.act = null; g2.goal.add("edge"); await stormEnd(g2); } });
    if (!g.LV.scrolls.every(Boolean)) g.bubble("Any verse scrolls left on the ship? Grab them first!", 3500);
  }
  async function stormEnd(g) {
    const v = g.LV.vars; v.shipDone = 1; g.meter(null);
    await g.say("jonah", V.j19[0], { ref: V.j19[1] });
    await g.narr("At this the men became even more afraid. They learned that he was running away from Jehovah, because he had told them. (Jonah 1:10)");
    await g.say("captain", "What should we do to you to make the sea calm down for us?", { ref: "Jonah 1:11" });
    await g.narr("For the sea was growing more and more stormy.");
    await g.decision({
      prompt: "The sailors ask Jonah what to do. What should Jonah say?",
      options: ["Hide below deck again", "Tell them to throw him into the sea", "Tell them to row harder"],
      truth: V.j112[0], ref: V.j112[1],
      find: { q: "What did Jonah tell the sailors to do with him?", hint: "Look at the first words Jonah says in Jonah 1:12.", hint2: "Where did Jonah say they should throw him?",
        keys: ["throw", "threw", "thrown", "throwing", "sea", "overboard", "water", "lift", "toss", "tossed", "ocean"] },
      note: "Jonah told the truth. He was ready to give his own life so that the sailors would be saved.",
    });
    await g.narr("However, the men rowed hard to bring the ship back to dry land, but they could not, because the sea grew more and more stormy around them. (Jonah 1:13)");
    await g.say("sailors", "Ah, now, O Jehovah, please, may we not perish because of this man!", { ref: "Jonah 1:14" });
    await g.cut("overboard");
    await g.reflect("Jonah was ready to give his life to save the sailors. What does that teach you about him?", "helping");
    g.endLevel();
  }
  const L3 = {
    title: "The storm at sea", short: "The storm", ref: "Jonah 1:4-16", map: [17, 42],
    intro: "Jonah is on a ship sailing away from Nineveh. Then Jehovah sends a terrible storm.",
    scrolls: [sc("j14"), sc("j15"), sc("j16")],
    lesson: { title: "Be honest, and put others first", goal: "helping", text: "Jonah told the truth about his mistake. Then he was ready to give his own life so the sailors would be safe. When we make a mistake, we can be honest about it and think of others.", verse: V.j112[0], ref: V.j112[1] },
    rooms: [
      { w: 44, theme: "ship", bg: "ship", music: "sail", ambient: "sea", ambVol: 0.15, start: [17, 9], tilt: 0.03, build: deck,
        onEnter: async g => {
          const v = g.LV.vars;
          if (v.phase === 1 && !v.lots) {
            v.lots = 1; v.rain = 110; v.storm = 1; g.music("storm"); g.ambient("storm", 0.4);
            g.goal.add("up");
            await g.say("captain", "Come, let us cast lots to find out who is to blame for this calamity.", { ref: "Jonah 1:7" });
            g.sfx("crack");
            await g.narr("So they cast lots, and the lot fell to Jonah.");
            await g.say("sailors", "Please tell us, who is to blame? What is your work, and where do you come from? What is your country, and from what people are you?", { ref: "Jonah 1:8" });
            await g.narr(`Help Jonah answer the sailors and calm them down! ${g.keeperName()}, you find the answers in the Bible. Hurry, before the ship breaks apart!`);
            g.goal.set([{ id: "sailors", label: "Answer each sailor's question", n: 5 }]);
            v.ship = 1;
          }
        },
        update(g, LV) {
          const v = LV.vars;
          if (v.phase === 1 && v.lots && LV.t % 240 === 0) { v.flash = 0.8; g.sfx("thunder"); v.shake = 4; }
          if (v.phase === 1 && v.lots && !v.shipDone) {
            v.ship -= 1 / (60 * 100);
            g.meter("🚢 The ship is holding together", v.ship, v.ship > 0.5 ? "#6fbf4a" : v.ship > 0.25 ? "#f2c14e" : "#e0533a");
            if (v.ship <= 0 && !v.wave) { v.wave = 1; (async () => {
              g.lock(true); v.flash = 1; v.shake = 12; g.sfx("wave"); g.sfx("thunder");
              await g.narr("A huge wave crashes over the deck! Hold on tight and try again.");
              v.ship = 1; v.wave = 0; g.p.x = 13 * 16; g.p.y = 9 * 16 - 22; g.regroup(); g.lock(false);
            })(); }
          }
          if (v.phase === 1) v.drift = Math.sin(LV.t * 0.02) * 0.25;
        },
      },
      { w: 30, theme: "hold", bg: "hold", music: null, start: [3, 9], dark: 0.72, darkR: 80, name: "below deck", indoor: true,
        build(b, g) {
          b.ground(0, 29); b.fill(0, 0, 29, 1, "B");
          b.block(8, 8); b.block(12, 7, 13, 7); b.block(15, 5, 17, 5); b.block(20, 7, 21, 8);
          b.scroll(16, 3, 0);
          b.dec("lantern", 10, 2, { h: 0 }); b.dec("crates", 24, 9);
          b.dec("ladder", 27, 9, { h: 112 });
          b.ent("npc", 18 * 16, 9 * 16 - 24, { w: 16, h: 24, look: LOOKS.captain, who: "captain", id: "capHold", quiet: true });
          [[6, 19, 1], [22, 26, 3]].forEach(([a, z, ph]) => b.ent("barrel", a * 16 + 8, 9 * 16 - 14, { w: 14, h: 14, x0: a * 16, x1: z * 16, ph }));
          b.trig(27, 28, async g2 => {
            if (g2.LV.vars.phase !== 1) return;
            g2.sfx("crack"); g2.room(0, 13, 9);
          }, { repeat: true });
        },
      },
    ],
    async onStart(g) {
      await g.narr(`On board the ship to Tarshish. ${g.jonahName()} is Jonah, ${g.keeperName()} is Jonah's bag and the Scroll Keeper.`);
      g.goal.set([{ id: "below", label: "Go below deck to rest", n: 1 }]);
      await g.think("We've set sail. Nineveh is behind me now... far behind.", { mood: "sad" });
    },
  };

  // =====================================================================
  // LEVEL 4 — Inside the great fish
  // =====================================================================
  const FEEL = [
    { tx: 6, row: 9, t: "Everything in here is wet and slimy. Yuck!", q: "How would you feel in here?", o: ["😨 Scared", "🤢 Grossed out", "😮 Amazed to still be alive"], n: "Jonah was alive inside a huge fish! Only Jehovah could keep him alive in here (Jonah 1:17)." },
    { tx: 15, row: 7, t: "Phew... it smells awful in here!", q: "What do you think it smells like?", o: ["🐟 Old fish", "🌊 Seaweed", "🤢 Everything yucky"], n: "Jonah was inside the fish for three days and three nights (Jonah 1:17)." },
    { tx: 24, row: 9, t: "It's so dark. I can't tell if it's day or night.", q: "What would you do in the dark?", o: ["🙏 Pray to Jehovah", "😢 Cry", "🎵 Sing"], n: "In the dark, Jonah prayed to Jehovah his God (Jonah 2:1)." },
    { tx: 33, row: 7, t: "I ran away from Jehovah... and still he saved me from drowning.", q: "How do you think Jonah felt now?", o: ["😔 Sorry", "🙏 Thankful", "💛 Both"], n: "Jonah said in his prayer: “But out of the pit you brought up my life, O Jehovah my God.” (Jonah 2:6)" },
    { tx: 41, row: 9, t: "Will I ever see Jehovah's holy temple again?", q: "What did Jonah miss most?", o: ["Worshipping Jehovah at his temple", "His home and family", "His favourite food"], n: "Jonah said: “How will I gaze again upon your holy temple?” (Jonah 2:4). Being close to Jehovah mattered most to him." },
  ];
  const L4 = {
    title: "Inside the great fish", short: "The great fish", ref: "Jonah 1:17 to 2:10", map: [11, 66],
    intro: "Jonah sinks deep into the sea. Then Jehovah sends a huge fish.",
    scrolls: [sc("j23"), sc("j25"), sc("j26")],
    lesson: { title: "Jehovah hears our prayers", goal: "jehovah", text: "Even inside a fish, Jonah prayed, and Jehovah heard him. We can pray to Jehovah anytime and anywhere, even after we've made a mistake.", verse: V.j22[0], ref: V.j22[1] },
    rooms: [
      { w: 100, theme: "deep", bg: "deep", music: "deep", ambient: "deep", ambVol: 0.3, start: [2, 4], swim: true, name: "the deep sea", spikeMsg: "Ouch! Sharp rocks!",
        build(b) {
          b.ground(0, 99, 10);
          b.fill(15, 5, 16, 9); b.spikes(22, 26, 9);
          b.haz("jelly", 20 * 16, 70, { w: 12, h: 14, amp: 34, sp: 0.03 });
          b.haz("jelly", 28 * 16, 90, { w: 12, h: 14, amp: 40, sp: 0.025, ph: 2 });
          b.haz("jelly", 34 * 16, 60, { w: 12, h: 14, amp: 30, sp: 0.035, ph: 4 });
          b.cp(31, 10);
          b.fill(40, 0, 42, 3); b.fill(40, 7, 42, 9);
          b.scroll(41, 5, 1);
          for (let x = 46; x <= 52; x += 2) b.ent("weed", x * 16, 4 * 16, { w: 16, h: 96 });
          b.haz("jelly", 56 * 16, 80, { w: 12, h: 14, amp: 40, sp: 0.03, dx: 20 });
          b.haz("jelly", 61 * 16, 50, { w: 12, h: 14, amp: 30, sp: 0.04, ph: 1 });
          b.cp(64, 10);
          b.fill(68, 0, 75, 2); b.fill(68, 8, 75, 9); b.spikes(70, 70, 7); b.spikes(73, 73, 7);
          b.haz("jelly", 79 * 16, 70, { w: 12, h: 14, amp: 36, sp: 0.03 });
          b.cp(82, 10);
          b.scroll(18, 2, 0); b.scroll(86, 8, 2);
          for (let x = 4; x < 98; x += 9) b.dec("seaweed", x, 10, { h: 26 + (x % 4) * 8 });
          b.dec("coral", 30, 10); b.dec("coral", 58, 10);
          b.trig(6, 7, async g => g.bubble("Waters engulfed me and threatened my life... (Jonah 2:5)", 4500));
          b.trig(45, 45, async g => g.bubble("Weeds were wrapped around my head! (Jonah 2:5) Swim hard!", 4500));
          b.trig(66, 66, async g => g.bubble("So deep... down to the bottoms of the mountains. (Jonah 2:6)", 4500));
          b.trig(93, 94, async g => { g.goal.add("swim"); await g.cut("swallow"); g.room(1); });
        },
      },
      { w: 72, theme: "fish", bg: "fish", music: "fish", ambient: "fish", ambVol: 0.35, start: [2, 9], dark: 0.86, darkR: 74, name: "inside the fish",
        build(b) {
          b.ground(0, 71); b.fill(0, 0, 71, 1, "#");
          b.fill(13, 8, 17, 8);
          b.fill(30, 8, 35, 8);
          b.fill(18, 2, 19, 3); b.fill(36, 2, 38, 2);
          for (let x = 3; x < 70; x += 7) b.dec("drip", x, 2, { h: 100 });
          for (let x = 8; x < 70; x += 14) b.dec("rib", x, 9, { h: 110 });
          FEEL.forEach((f, i) => b.spot(f.tx, f.row, { id: "feel" + i, act: feelSpot(f) }));
          b.gate(46, 9, { style: "teeth", needs: ["explore"], needMsg: "Huge teeth block the way! I should explore the fish first.", q: null, h: 112, after: async g => { await g.narr("The great teeth lift a little... The way is open, but watch out: they still chomp!"); } });
          b.cp(48, 9);
          [51, 55, 59].forEach((x, i) => b.ent("teeth", x * 16, 2 * 16, { w: 16, h: 7 * 16, per: 140, ph: i * 46 }));
          b.cp(62, 9);
          b.spot(66, 9, { id: "altar", glow: 60, act: prayer });
        },
        onEnter: async g => {
          await g.narr(`“${"Jehovah now sent a huge fish to swallow Jonah, so that Jonah came to be in the belly of the fish for three days and three nights."}” (Jonah 1:17)`);
          await g.think("I'm... alive? Inside a fish?!", { mood: "scared" });
          g.goal.set([{ id: "explore", label: "Explore the fish (glowing spots)", n: 5 }, { id: "pray", label: "Find a quiet place to pray", n: 1 }]);
        },
      },
    ],
    async onStart(g) {
      await g.narr(`${g.jonahName()} is Jonah. ${g.keeperName()} is Jonah's bag and the Scroll Keeper.`);
      await g.narr("Jonah is sinking into the deep sea. Swim! Press ⤒ (Space) again and again to swim up. Avoid the jellyfish and sharp rocks.");
      g.goal.set([{ id: "swim", label: "Swim through the deep", n: 1 }]);
    },
  };
  function feelSpot(f) {
    return async (g, e) => {
      if (e.done) { await g.think(f.t); return; }
      await g.think(f.t, { mood: "sad" });
      await g.choose("💭 How does it feel?", f.q, f.o);
      await g.narr(f.n);
      e.done = true; g.goal.add("explore");
      if (g.goal.done("explore")) g.bubble("I've explored everything. Is there a way past those big teeth?", 4000);
    };
  }
  async function prayer(g, e) {
    if (e.done) return;
    e.done = true;
    g.music("prayer"); g.p.pose = "kneel"; g.p.face = 1;
    await g.narr("Then Jonah prayed to Jehovah his God from the belly of the fish. (Jonah 2:1)");
    await g.tween(g.v, "light", 0.6, 1200);
    await g.narr(`${g.keeperName()}, help Jonah find the words of his prayer in Jonah chapter 2.`);
    await g.ask(Q.p1);
    await g.say("jonah", V.j22[0], { ref: V.j22[1] });
    await g.ask(Q.p2);
    await g.say("jonah", "When my life was ebbing away, Jehovah was the One whom I remembered.", { ref: "Jonah 2:7" });
    await g.ask(Q.p3);
    await g.say("jonah", "What I have vowed, I will pay. Salvation is from Jehovah.", { ref: "Jonah 2:9" });
    g.goal.add("pray");
    await g.tween(g.v, "light", 0, 800);
    await g.cut("spatOut");
    await g.reflect("What did Jonah learn inside the fish?", "jehovah", { title: "💭 Jonah's thoughts" });
    await g.reflect("How was Jonah's friendship with Jehovah now, compared to when he ran away?", "myself", { title: "💭 Jonah's thoughts" });
    g.endLevel();
  }

  // =====================================================================
  // LEVEL 5 — Nineveh, the great city
  // =====================================================================
  const MAZE = {
    // Streets (rows 3 and 5) have marching guards; the side streets and the squares are safe spots.
    grid: [
      "#################",
      "##3#####1#####2##",
      "##.#####.#####.##",
      "#...............#",
      "####.#######.####",
      "#...............#",
      "#.######.######.#",
      "#.......S.......#",
      "#################",
    ],
    guards: [
      { path: [[1, 5], [15, 5]], sp: 0.045, wait: 30, ph: 0 },
      { path: [[1, 3], [7, 3]], sp: 0.04, wait: 40, ph: 0 },
      { path: [[15, 3], [9, 3]], sp: 0.04, wait: 40, ph: 70 },
    ],
    goalLabel: "Day 1: preach in the city squares",
    async onMark(g, mk, n) {
      await g.say("jonah", "In just 40 days more, Nineveh will be overthrown.", { ref: "Jonah 3:4" });
      await g.narr(["People stop and stare. Who is this stranger from Israel?", "More and more people gather to listen.", "The message is spreading through the city!"][n - 1]);
    },
  };
  const L5 = {
    title: "Nineveh, the great city", short: "Nineveh", ref: "Jonah 3", map: [80, 30],
    intro: "Jehovah gives Jonah the job a second time. This time, Jonah goes.",
    scrolls: [sc("j33"), sc("j35"), sc("m1241", "Jesus himself talked about Jonah and Nineveh.")],
    lesson: { title: "Jesus said it really happened", goal: "bible", text: "Many years later, Jesus talked about Jonah and the people of Nineveh. The account of Jonah really happened! And it shows that Jehovah gives second chances, to Jonah and to Nineveh.", verse: V.m1241[0], ref: V.m1241[1] },
    rooms: [
      { w: 112, theme: "trek", bg: "trek", music: "trek", start: [2, 9], name: "the long walk",
        build(b) {
          b.ground(0, 111);
          npc(b, 9, 9, "traveller", ["Off to Nineveh? That's a long walk, friend. More than a month!", "Over mountains, past the desert, and across the great river Euphrates."]);
          b.fill(15, 7, 22, 8); b.fill(18, 5, 20, 6);
          b.scroll(19, 2, 0);
          b.cp(28, 9);
          b.fill(32, 8, 34, 8); b.spikes(36, 37, 8); b.fill(39, 7, 41, 8);
          b.gate(44, 9, { q: Q.l5g1 });
          b.cp(47, 9);
          b.clear(50, 9, 58, 11); b.water(50, 58, 9); b.fill(50, 10, 58, 11, "~");
          b.block(51, 8); b.block(54, 8); b.block(57, 8);
          b.trig(49, 49, async g => g.bubble("The great river Euphrates! Hop across the stepping stones.", 3500));
          b.cp(61, 9);
          b.fill(64, 8, 68, 8); b.spikes(70, 70, 8); b.fill(72, 7, 76, 8); b.fill(77, 5, 78, 8); b.spikes(81, 81, 8);
          b.cp(84, 9);
          b.dec("rock", 90, 9); b.dec("bush", 94, 9);
          b.dec("fire", 101, 9);
          b.trig(100, 101, campfire);
          b.trig(4, 5, async g => g.bubble("This time I'll go where Jehovah sent me.", 3500));
          b.trig(62, 63, async g => g.bubble("Nineveh is still so far... but I won't run away again.", 3500));
        },
        update(g, LV) { LV.vars.dusk = Math.max(0, Math.min(1, (LV.p.x - 60 * 16) / (40 * 16))); },
      },
      { w: 32, theme: "city", bg: "city", music: "city", start: [2, 9], name: "the city gate",
        build(b) {
          b.ground(0, 31);
          b.dec("wall", 8, 9, { w: 96, h: 110 }); b.dec("wall", 24, 9, { w: 128, h: 110 }); b.dec("gatehouse", 14, 9);
          npc(b, 11, 9, "guard", ["This is Nineveh, the great city! Who are you, stranger?"]);
          npc(b, 22, 9, "guard", ["Hmph. A prophet from Israel? Go on, then."]);
          b.gate(17, 9, { q: Q.l5g2, col: "#5a3a22", post: "#a8844a", after: cityDays });
        },
        onEnter: async g => {
          g.goal.set([{ id: "gate", label: "Enter the city gate", n: 1 }]);
          await g.think("There it is. Nineveh. It's even bigger than I imagined.", { mood: "scared" });
        },
      },
      { w: 92, theme: "city", bg: "city", music: "city", ambient: "crowd", ambVol: 0.12, start: [2, 9], name: "day 3",
        build(b) {
          b.ground(0, 91);
          b.dec("ziggurat", 6, 9, { c: "#c9a56b" });
          b.dec("house", 12, 9, { w: 48, h: 48, wall: "#d8b47a" }); b.roof(12, 14, 6);
          npc(b, 17, 9, "sack", ["We are fasting and wearing sackcloth. We want to stop doing bad things."], { pose: "sit" });
          b.ent("animal", 20 * 16, 9 * 16 - 11, { w: 14, h: 11, spr: "sheepSack", act: async g => g.narr("A sheep in sackcloth! The king said that even the animals should be covered with sackcloth. (Jonah 3:8)") });
          b.gate(24, 9, { q: Q.l5g3, col: "#7a4a2a", post: "#b8925a" });
          b.dec("stall", 27, 9, { c1: "#7a6040", c2: "#9a8060", goods: [] });
          npc(b, 31, 9, "sack2", ["Who knows whether the true God may reconsider what he intends to do and turn from his burning anger, so that we may not perish?"], { pose: "kneel" });
          b.block(34, 6, 36, 6); b.scroll(35, 4, 1);
          npc(b, 39, 9, "sack3", ["My whole family is wearing sackcloth. Even the king is!"]);
          b.ent("animal", 42 * 16, 9 * 16 - 13, { w: 20, h: 13, spr: "cow", range: 16 });
          b.gate(46, 9, { q: Q.l5g4, col: "#7a4a2a", post: "#b8925a" });
          b.dec("house", 49, 9, { w: 64, h: 48, wall: "#d8b47a" }); b.roof(49, 52, 6);
          npc(b, 55, 9, "sack", ["We heard your message, prophet. Our violence must stop."], { pose: "sit" });
          b.ent("animal", 58 * 16, 9 * 16 - 11, { w: 14, h: 11, spr: "sheepSack" });
          b.block(62, 6); b.block(64, 4, 65, 4); b.scroll(65, 2, 2);
          b.gate(68, 9, { q: Q.l5g5, col: "#7a4a2a", post: "#b8925a" });
          b.dec("palace", 74, 9);
          b.trig(79, 80, palace);
        },
        onEnter: async g => {
          g.goal.set([{ id: "palace", label: "Day 3: walk to the king's palace", n: 1 }]);
          await g.narr("Day 3. Something has changed in Nineveh...");
          await g.think("Everyone is wearing sackcloth! Even the animals!", { mood: "happy" });
        },
      },
    ],
    async onStart(g) {
      await g.narr(`${g.jonahName()} is Jonah. ${g.keeperName()} is Jonah's bag and the Scroll Keeper.`);
      await g.narr("Jonah is back on dry land. Jehovah has told him a second time: “Get up, go to Nineveh the great city, and proclaim to her the message that I tell you.” (Jonah 3:2)");
      g.goal.set([{ id: "walk", label: "Walk the long road to Nineveh", n: 1 }]);
    },
  };
  async function campfire(g) {
    g.goal.add("walk");
    g.p.pose = "sit"; g.music("night");
    await g.narr("Night falls. Jonah rests by the fire. The walk to Nineveh took about a month: lots of time to think.");
    await g.reflect("What might Jonah have been thinking about on the long walk?", "myself", { title: "🔥 Campfire thoughts" });
    await g.reflect("Why do you think Jehovah gave Jonah a second chance?", "jehovah", { title: "🔥 Campfire thoughts" });
    await g.reflect("If you were Jonah, what would you say to Jehovah tonight?", "bible", { title: "🔥 Campfire thoughts" });
    await g.tween(g.v, "fade", 1, 900);
    g.p.pose = null;
    await g.narr("After many days of walking, Jonah finally reached Nineveh.");
    g.room(1);
    await g.tween(g.v, "fade", 0, 700);
  }
  async function cityDays(g) {
    g.goal.add("gate");
    await g.narr("Then Jonah entered the city, and walking a day's journey, he was proclaiming... (Jonah 3:4)");
    await g.narr("Guards march up and down the big streets. Wait in a side street, watch them, and go when a guard walks away from you! If a guard stops Jonah, he goes back to the last square.");
    await g.maze(MAZE);
    await g.narr("End of Day 1. Day 2: the crowds are bigger!");
    await g.mash({ title: "Day 2: Shout the message!", sub: `Davian presses D, Levi presses L (or tap your button). Make Jonah's voice loud enough for the whole crowd!`, need: 30 });
    g.music("city");
    await g.narr(`“${V.j35[0]}” (${V.j35[1]})`);
    await g.tween(g.v, "fade", 1, 700);
    g.room(2);
    await g.tween(g.v, "fade", 0, 700);
  }
  async function palace(g) {
    g.goal.add("palace");
    await g.cut("repent");
    await g.narr(`“${V.j310[0]}” (${V.j310[1]})`);
    await g.reflect("The people of Nineveh changed, and Jehovah forgave them. What does that teach you about Jehovah?", "jehovah");
    await g.reflect("Jehovah didn't destroy the city. How do you think Jonah felt about that?", "myself");
    g.endLevel();
  }

  // =====================================================================
  // LEVEL 6 — The bottle-gourd plant
  // =====================================================================
  const L6 = {
    title: "The bottle-gourd plant", short: "The plant", ref: "Jonah 4", map: [91, 46], final: true,
    intro: "Nineveh was saved. But Jonah is not happy. Jehovah has one more lesson for him.",
    scrolls: [sc("j42"), sc("p39"), sc("j310")],
    lesson: { title: "Jehovah cares about everyone", goal: "helping", text: "Jonah cared more about a plant than about people. Jehovah taught him to care about people, all kinds of people, just like Jehovah does. Who can you be kind to, even if they're hard to like?", verse: V.p39[0], ref: V.p39[1] },
    rooms: [{
      w: 92, theme: "east", bg: "east", music: "gourd", ambient: "heat", ambVol: 0.06, start: [3, 9], name: "east of the city",
      build(b) {
        b.ground(0, 91);
        const shade = (x0, x1) => b.ent("shade", x0 * 16, 0, { w: (x1 - x0 + 1) * 16, h: 200 });
        b.dec("palm", 5, 9); shade(4, 7);
        b.fill(10, 7, 13, 8);
        b.ent("pickup", 12 * 16, 6 * 16 + 6, { w: 14, h: 6, goal: "branches" });
        b.block(16, 5, 18, 5); shade(16, 18);
        b.scroll(20, 3, 0);
        b.ent("pickup", 17 * 16, 4 * 16 + 6, { w: 14, h: 6, goal: "branches" });
        b.dec("rock", 23, 9, { c: "#c8a878" });
        b.clear(26, 9, 28, 11); b.plat(27, 27, 7);
        b.dec("palm", 31, 9); shade(30, 33);
        b.ent("pickup", 34 * 16, 8 * 16 + 6, { w: 14, h: 6, goal: "branches" });
        b.fill(37, 7, 41, 8); b.block(43, 4, 46, 4); shade(43, 46);
        b.ent("pickup", 45 * 16, 3 * 16 + 6, { w: 14, h: 6, goal: "branches" });
        b.scroll(45, 1, 1);
        b.spikes(49, 49, 8);
        b.dec("palm", 52, 9); shade(51, 54);
        b.fill(55, 7, 57, 8); b.scroll(56, 4, 2);
        b.ent("pickup", 58 * 16, 8 * 16 + 6, { w: 14, h: 6, goal: "branches" });
        b.gate(62, 9, { q: Q.l6g1, col: "#a8743c", post: "#c8a878", goal: "gate" });
        b.dec("rock", 66, 9, { c: "#c8a878" });
        b.trig(73, 75, buildShelter, { when: g => g.goal.done("branches") && g.goal.done("gate") });
        b.trig(70, 70, async g => { if (!g.goal.done("branches")) g.bubble("I need 5 branches to build my shelter here.", 3000); }, { repeat: true });
        b.ent("prop", 74 * 16, 9 * 16, { w: 1, h: 1, id: "site", draw: drawShelter });
      },
      update(g, LV) {
        const v = LV.vars, p = LV.p;
        if (v.stage) return;
        const inShade = LV.ents.some(e => e.type === "shade" && p.x + p.w / 2 > e.x && p.x + p.w / 2 < e.x + e.w);
        v.heat = Math.max(0, Math.min(1, (v.heat || 0) + (inShade ? -0.012 : 0.0011)));
        g.meter(inShade ? "🌴 Cool shade" : "☀️ So hot! Find shade", v.heat, v.heat > 0.7 ? "#e0533a" : "#f2c14e");
        if (v.heat >= 1) { v.heat = 0.35; g.hurt("Too hot! Jonah needs the shade of palm trees."); }
      },
      onRespawn(g) { g.LV.vars.heat = 0.3; },
    }],
    async onStart(g) {
      await g.narr(`${g.jonahName()} is Jonah. ${g.keeperName()} is Jonah's bag and the Scroll Keeper.`);
      await g.decision({
        prompt: "Jehovah did not destroy Nineveh. The people were saved! How should Jonah feel?",
        options: ["Happy that the people were saved", "Angry"],
        truth: "But this was highly displeasing to Jonah, and he became hot with anger.", ref: "Jonah 4:1",
        find: { q: "How did Jonah feel when Jehovah saved Nineveh?", hint: "Look for a feeling word in Jonah 4:1.", hint2: "Was Jonah happy, or something else?",
          keys: ["angry", "anger", "mad", "upset", "displeased", "displeasing", "cross", "furious", "hot", "grumpy", "annoyed", "cranky", "furious"] },
        note: "Jonah was angry because Jehovah showed mercy to Nineveh.",
        talk: "Why do you think Jonah was angry? Have you ever felt upset when someone else was forgiven?", gem: "myself",
      });
      await g.say("jonah", "Ah, now, Jehovah, was this not my concern when I was in my own land? That is why I tried to flee to Tarshish in the first place;", { ref: "Jonah 4:2", mood: "angry" });
      await g.say("jonah", "for I knew that you are a compassionate and merciful God, slow to anger and abundant in loyal love, one who feels grieved over calamity.", { ref: "Jonah 4:2", mood: "angry" });
      await g.narr("Jonah was so upset that he said he would rather die than live. (Jonah 4:3)");
      await g.jehovah("Is it right for you to be so angry?", "Jonah 4:4");
      await g.narr("Jonah went out of the city and sat down east of the city. (Jonah 4:5) Help him make a shelter. Stay in the shade, it's very hot!");
      g.goal.set([{ id: "branches", label: "Find branches for a shelter", n: 5 }, { id: "gate", label: "Climb to the hill east of the city", n: 1 }, { id: "build", label: "Build the shelter", n: 1 }]);
    },
  };
  function drawShelter(ctx, e, t) {
    const v = window.JONAH.LV.vars;
    if (!v.shelter) return;
    ART.decor(ctx, "shelter", e.x - 18, e.y, t);
    if (v.plant > 0) ART.decor(ctx, "gourd", e.x - 18, e.y, t, { g: v.plant, dead: v.dead || 0 });
    if (v.worm) { ctx.drawImage(ART.spr("worm", Math.floor(t * 4)), e.x + 16 - v.worm * 10, e.y - 5); }
  }
  async function buildShelter(g) {
    const v = g.LV.vars;
    v.stage = 1; g.meter(null); g.goal.add("build");
    await g.walkTo(74);
    g.sfx("gate"); v.shelter = 1; g.p.pose = "sit"; g.p.face = -1;
    await g.narr("He made a shelter for himself there and sat in its shade to see what would happen to the city. (Jonah 4:5)");
    // night: the plant grows
    g.music("night");
    await g.tween(v, "night", 1, 1500);
    await g.tween(v, "plant", 1, 3500);
    g.sfx("scroll");
    await g.tween(v, "night", 0, 1500);
    await g.narr("Jehovah God then provided a bottle-gourd plant to grow up over Jonah, to give him shade for his head and to relieve his misery. And Jonah was very pleased with the bottle-gourd plant. (Jonah 4:6)");
    await g.think("Ahh, lovely shade! What a wonderful plant!", { mood: "happy" });
    await g.ask(Q.l6g2);
    // dawn: the worm
    v.dawn = 1; g.music("gourd");
    await g.narr("But the true God sent a worm at the break of dawn on the next day, and it attacked the bottle-gourd plant, and it withered. (Jonah 4:7)");
    await g.tween(v, "worm", 1, 2000);
    await g.tween(v, "dead", 1, 2000);
    v.dawn = 0; v.worm = 0;
    // the scorching east wind
    g.ambient("wind", 0.35);
    await g.tween(v, "heat", 1, 1800);
    v.shake = 4;
    await g.narr("God also sent a scorching east wind, and the sun beat down on Jonah's head, and he grew faint. (Jonah 4:8)");
    await g.think("It's so hot... My plant is gone!", { mood: "sad" });
    await finalTalk(g);
  }
  async function finalTalk(g) {
    const v = g.LV.vars;
    g.music("question");
    await g.jehovah("Is it right for you to be so angry over the bottle-gourd plant?", "Jonah 4:9", { keep: true });
    await g.say("jonah", "I have a right to be angry, so angry that I want to die.", { ref: "Jonah 4:9", mood: "angry" });
    await g.say("jehovah", "You felt sorry for the bottle-gourd plant, which you did not work for, nor did you make it grow; it grew in one night and perished in one night.", { ref: "Jonah 4:10" });
    await g.narr("In other words: Jonah felt sad about a little plant that he didn't plant, water or grow.");
    await g.say("jehovah", V.j411[0], { ref: V.j411[1] });
    await g.narr("In other words: if Jonah could care about one little plant, shouldn't Jehovah care about all the people of Nineveh, and even their animals? Jehovah made every one of them!");
    await g.ask(Q.l6g3);
    await g.tween(v, "light", 0, 900);
    await g.narr("That is how the book of Jonah ends: with Jehovah's question.");
    await g.wait(1200);
    await g.cut("older");
    g.endLevel();
  }

  window.JONAH_DATA = { LOOKS, SPEAKERS, LEVELS: [L1, L2, L3, L4, L5, L6], V, Q };
})();
