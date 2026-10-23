// Chapter 1: Noé's Journey. Story and questions.
// Bible content comes only from jw.org and wol.jw.org (New World Translation).
// kind: fact (3 gold), quick = Quick find (6 gold), dig = Dig deeper (10 gold), think = Think about it (gem piece)
// gem: jehovah | bible | myself | helping

window.CHAPTER = {
  title: "Noé's Journey",
  stages: [
    {
      id: "valley",
      name: "The Troubled Valley",
      refs: "Genesis 6:1-13",
      scene: "card1",
      hidden: { icon: "🪜", x: 78, y: 70, ref: "Genesis 6:9", text: "Noé walked with the true God." },
      story: [
        "Hello, Davian! Hello, Levi! My name is Noé. I'm so glad you came.",
        "Look around this valley. The earth has become full of violence. People are hurting each other.",
        "Some wicked angels came down from heaven and took human bodies. Their sons, the Nephilim, are huge violent bullies.",
        "Jehovah sees all of this, and it makes him sad. But he also sees the people who love him.",
        "I want to walk with the true God, even if everyone around me does bad things. Will you come with me on my journey?"
      ],
      questions: [
        { who: "levi", kind: "fact", gem: "bible", q: "Was Noé a good man or a bad man?", options: ["😊 A good man", "😠 A bad man"], answer: 0 },
        { who: "davian", kind: "quick", gem: "bible", ref: "Genesis 6:11", q: "What was the earth filled with?", options: ["Violence", "Food", "Gold", "Flowers"], answer: 0 },
        { who: "levi", kind: "quick", gem: "jehovah", ref: "Genesis 6:9", q: "Who did Noé walk with?", options: ["✨ The true God", "🐺 A wolf"], answer: 0 },
        { who: "davian", kind: "dig", gem: "myself", ref: "Genesis 6:9-11", q: "How was Noé different from the people around him?", options: ["He walked with the true God", "He was the strongest", "He was the richest", "He was a king"], answer: 0 },
        { who: "levi", kind: "think", gem: "jehovah", q: "Jehovah sees when people are sad or hurt. How does it make you feel to know Jehovah sees you?" },
        { who: "davian", kind: "think", gem: "myself", ref: "Genesis 6:9", q: "Noé walked with the true God even when everyone around him was bad. What does it mean to walk with Jehovah at school or with friends?" }
      ],
      card: { img: "card1", title: "Jehovah sees and cares", ref: "Genesis 6:8, 9", text: "Jehovah saw all the badness, but he also saw Noé, who walked with him. Jehovah notices everyone who tries to do right." }
    },
    {
      id: "forest",
      name: "The Resin Wood Forest",
      refs: "Genesis 6:14-22",
      scene: "card2",
      hidden: { icon: "🔨", x: 14, y: 76, ref: "Genesis 6:22", text: "Noé did according to all that God had commanded him. He did just so." },
      story: [
        "Jehovah told me something amazing. He will bring a great flood to clean the earth of badness.",
        "But he gave us hope. He told me to build an ark, a giant wooden box that floats, to save my family and the animals.",
        "I have never built anything like it! But I trust Jehovah's promises, so let's get to work.",
        "Jehovah gave very exact instructions: the wood, the size, the door and the three floors. My family and I will follow every one.",
        "It's a big job. It may take us about 50 years! Grab some planks and let's go!"
      ],
      questions: [
        { who: "levi", kind: "fact", gem: "bible", q: "What did Noé build?", options: ["🚢 An ark", "🏰 A castle"], answer: 0 },
        { who: "davian", kind: "quick", gem: "bible", ref: "Genesis 6:14", q: "What did Jehovah tell Noé to make the ark out of?", options: ["Resinous wood", "Stone", "Gold", "Iron"], answer: 0 },
        { who: "davian", kind: "dig", gem: "jehovah", ref: "Genesis 6:11-13", q: "Why did Jehovah decide to bring the Flood?", options: ["The earth was ruined and full of violence", "It was too hot", "The plants needed water", "The animals were thirsty"], answer: 0 },
        { who: "levi", kind: "quick", gem: "myself", ref: "Genesis 6:22", q: "Did Noé do what God told him?", options: ["👍 Yes, all of it", "👎 No"], answer: 0 },
        { who: "davian", kind: "dig", gem: "bible", ref: "Genesis 6:14-16", q: "Where did Jehovah say to put the entrance of the ark?", options: ["In its side", "On the roof", "Underneath", "There was no door"], answer: 0 },
        { who: "davian", kind: "quick", gem: "bible", ref: "Genesis 6:15", q: "How long was the ark?", options: ["300 cubits", "30 cubits", "50 cubits", "1,000 cubits"], answer: 0 },
        { who: "levi", kind: "think", gem: "myself", q: "Mum asks you to tidy a big messy room. What would Noé do? What will you do?" },
        { who: "davian", kind: "think", gem: "myself", q: "Noé and his family worked about 50 years on the ark. Why do you think they never gave up?" }
      ],
      card: { img: "card2", title: "Noé did just so", ref: "Genesis 6:22", text: "Noé obeyed Jehovah in everything, even when the job was huge and took many years." }
    },
    {
      id: "village",
      name: "The Village of Scoffers",
      refs: "Genesis 6:4, 10; 2 Peter 2:5; Hebrews 11:7",
      scene: "card3",
      hidden: { icon: "🕸️", x: 86, y: 18, ref: "2 Peter 2:5", text: "Noé was a preacher of righteousness." },
      story: [
        "While we build, I also warn the people. I tell them a flood is coming and they can be saved.",
        "But nobody listens. They laugh at us and make fun of the ark.",
        "It's hard when people laugh. But I keep doing what's right, and I keep trying to help them.",
        "Watch out! A Nephilim giant is coming to bully us. Answer well, and together we'll stand up to him!"
      ],
      questions: [
        { who: "levi", kind: "fact", gem: "helping", q: "Did the people listen to Noé?", options: ["👂 Yes", "❌ No"], answer: 1 },
        { who: "davian", kind: "quick", gem: "bible", ref: "2 Peter 2:5", q: "What does 2 Peter 2:5 call Noé?", options: ["A preacher of righteousness", "A king", "A soldier", "A fisherman"], answer: 0 },
        { who: "levi", kind: "think", gem: "helping", q: "Have you ever been laughed at for doing the right thing? What did you do?" },
        { who: "davian", kind: "think", gem: "helping", q: "Why is it hard to keep doing right when others laugh? What helps you keep going?" }
      ],
      boss: {
        name: "Nephilim Giant", img: "nephilim", hearts: 10,
        verseMap: ["Genesis 6:4", "Genesis 6:10", "Hebrews 11:7"],
        intro: "The Nephilim giant stomps out of the village. \"Nobody listens to you, old man!\" Let's show him we trust Jehovah!",
        pool: [
          { who: "levi", kind: "quick", gem: "bible", ref: "Hebrews 11:7", q: "How did Noé build the ark?", options: ["💪 By faith", "💰 With lots of money"], answer: 0 },
          { who: "levi", kind: "fact", gem: "helping", q: "A friend is being laughed at. What do you do?", options: ["🤝 Help my friend", "😂 Laugh too"], answer: 0 },
          { who: "levi", kind: "quick", gem: "bible", ref: "Genesis 6:10", q: "How many sons did Noé have?", options: ["3️⃣ Three", "1️⃣ One"], answer: 0 },
          { who: "levi", kind: "fact", gem: "bible", q: "What were the big bullies called?", options: ["👹 Nephilim", "🐑 Sheep"], answer: 0 },
          { who: "davian", kind: "quick", gem: "bible", ref: "Genesis 6:4", q: "What were the violent giants called?", options: ["Nephilim", "Philistines", "Romans", "Egyptians"], answer: 0 },
          { who: "davian", kind: "dig", gem: "jehovah", ref: "Hebrews 11:7", q: "Why did Noé build the ark?", options: ["For the saving of his household", "To become famous", "To go fishing", "To sell it"], answer: 0 },
          { who: "davian", kind: "quick", gem: "bible", ref: "Genesis 6:10", q: "What were the names of Noé's three sons?", options: ["Shem, Ham and Japheth", "Cain, Abel and Seth", "Peter, James and John", "Moses, Aaron and Joshua"], answer: 0 },
          { who: "davian", kind: "fact", gem: "helping", q: "Why did Noé keep warning people even when they laughed?", options: ["He loved Jehovah and cared about people", "He liked to argue", "He wanted to be famous", "He didn't warn anyone"], answer: 0 }
        ]
      },
      card: { img: "card3", title: "Keep doing right, even when others laugh", ref: "2 Peter 2:5", text: "Noé kept preaching and kept helping people, even when they made fun of him." }
    },
    {
      id: "meadow",
      name: "The Animal Meadow",
      refs: "Genesis 7:1-16",
      scene: "card4",
      hidden: { icon: "🐾", x: 20, y: 30, ref: "Genesis 7:9", text: "The animals went into the ark by twos, male and female." },
      story: [
        "The ark is finished! Jehovah says: \"Go into the ark, you and all your household.\"",
        "Look! The animals are coming from everywhere, male and female, two by two.",
        "In seven days the rain will begin. We must get everyone inside!",
        "Oh no! The Dread Rex is blocking the path to the ark. Read the verses on your map, then we'll face it together!"
      ],
      questions: [
        { who: "levi", kind: "quick", gem: "bible", ref: "Genesis 7:9", q: "How did the animals come to the ark?", options: ["👫 Two by two", "🏃 All in a big rush"], answer: 0 },
        { who: "davian", kind: "quick", gem: "bible", ref: "Genesis 7:2", q: "How many of each clean animal went into the ark?", options: ["Seven", "Two", "One", "Ten"], answer: 0 },
        { who: "levi", kind: "think", gem: "jehovah", q: "Jehovah is going to keep Noé's family safe inside the ark. How does Jehovah take care of us today?" },
        { who: "davian", kind: "think", gem: "jehovah", ref: "Genesis 7:4", q: "Jehovah told Noé seven days before the rain began. Why do you think Jehovah warned him early?" }
      ],
      boss: {
        name: "Dread Rex", img: "rex", hearts: 16, final: true,
        verseMap: ["Genesis 7:1", "Genesis 7:4", "Genesis 7:5"],
        intro: "ROAAAR! The Dread Rex stomps in front of the ark door. Stand together, and trust Jehovah!",
        pool: [
          { who: "levi", kind: "quick", gem: "jehovah", ref: "Genesis 7:1", q: "Who did Jehovah tell to go into the ark?", options: ["👴 Noé and his family", "👹 The giants"], answer: 0 },
          { who: "levi", kind: "fact", gem: "helping", q: "Who goes into the ark with Noé?", options: ["👨‍👩‍👦 His family", "👑 A king"], answer: 0 },
          { who: "levi", kind: "fact", gem: "jehovah", q: "Will Jehovah keep Noé's family safe?", options: ["✅ Yes", "❌ No"], answer: 0 },
          { who: "levi", kind: "quick", gem: "myself", ref: "Genesis 7:5", q: "Did Noé do what Jehovah told him?", options: ["👍 Yes, everything", "👎 Only some things"], answer: 0 },
          { who: "levi", kind: "fact", gem: "bible", q: "What is Noé building to save his family?", options: ["🚢 An ark", "🏠 A house"], answer: 0 },
          { who: "davian", kind: "quick", gem: "bible", ref: "Genesis 7:6", q: "How old was Noé when the Flood came?", options: ["600 years old", "60 years old", "100 years old", "950 years old"], answer: 0 },
          { who: "davian", kind: "quick", gem: "jehovah", ref: "Genesis 7:4", q: "How many days before the rain did Jehovah warn Noé?", options: ["Seven days", "One day", "40 days", "A whole year"], answer: 0 },
          { who: "davian", kind: "quick", gem: "myself", ref: "Genesis 7:1", q: "Why did Jehovah save Noé?", options: ["He found Noé righteous", "Noé was rich", "Noé was the oldest", "Noé was the strongest"], answer: 0 },
          { who: "davian", kind: "quick", gem: "myself", ref: "Genesis 7:5", q: "What did Noé do with Jehovah's instructions?", options: ["Everything Jehovah commanded him", "Only the easy parts", "He forgot them", "He asked his sons to do it all"], answer: 0 },
          { who: "davian", kind: "dig", gem: "bible", ref: "Genesis 7:13", q: "Count the people in Genesis 7:13. How many went into the ark?", options: ["8", "4", "12", "2"], answer: 0 }
        ]
      },
      card: { img: "card4", title: "Jehovah protects those who listen", ref: "Genesis 7:16", text: "Noé's family listened to Jehovah and went into the ark. Jehovah shut the door and kept them safe." }
    },
    {
      id: "rainbow",
      name: "The Ark and the Rainbow",
      refs: "Genesis 7:17 to 9:17",
      scene: "card5",
      hidden: { icon: "🌱", x: 50, y: 86, ref: "Genesis 9:13", text: "Jehovah gave his rainbow in the cloud as a sign of his promise." },
      story: [
        "The rain is pouring! It rained for 40 days and 40 nights. The water covered even the mountains.",
        "But inside the ark we are safe. We feed the animals every day and wait.",
        "We stayed in the ark for more than a year! Then Jehovah told us it was safe to come out.",
        "The first thing we did was thank Jehovah with an offering.",
        "Then Jehovah made a promise: never again a flood like this. And look up in the sky..."
      ],
      questions: [
        { who: "levi", kind: "quick", gem: "jehovah", ref: "Genesis 7:16", q: "Who shut the door of the ark?", options: ["✨ Jehovah", "🐘 An elephant"], answer: 0 },
        { who: "davian", kind: "think", gem: "jehovah", ref: "Genesis 7:16", q: "Jehovah shut the door himself. What does that teach you about Jehovah?" },
        { who: "levi", kind: "quick", gem: "bible", ref: "Genesis 7:12", q: "How many days did it rain?", options: ["4️⃣0️⃣ 40 days", "1️⃣ 1 day"], answer: 0 },
        { who: "davian", kind: "quick", gem: "bible", ref: "Genesis 8:4", q: "Where did the ark come to rest?", options: ["On the mountains of Ararat", "In Egypt", "On a beach", "In a forest"], answer: 0 },
        { who: "levi", kind: "fact", gem: "jehovah", q: "What did Jehovah put in the sky as a promise?", options: ["🌈 A rainbow", "⭐ A big star"], answer: 0 },
        { who: "davian", kind: "dig", gem: "jehovah", ref: "Genesis 8:18-20", q: "What did Noé build after leaving the ark?", options: ["An altar to Jehovah", "A house", "A tower", "A new boat"], answer: 0 },
        { who: "davian", kind: "fact", gem: "bible", q: "How long did Noé's family stay in the ark?", options: ["More than a year", "One week", "40 days", "Ten years"], answer: 0 },
        { who: "davian", kind: "quick", gem: "myself", ref: "Ephesians 6:1", q: "To obey Jehovah, who else must children obey?", options: ["Their parents", "Nobody", "Only their friends", "Anyone they meet"], answer: 0 },
        { who: "levi", kind: "think", gem: "helping", q: "Noé helped his family. Who could you help this week?" },
        { who: "davian", kind: "think", gem: "jehovah", ref: "Genesis 9:15", q: "Jehovah kept his promise to Noé. Which promise of Jehovah are you looking forward to?" }
      ],
      card: { img: "card5", title: "Jehovah keeps his promises", ref: "Genesis 9:13", text: "Jehovah promised never to destroy the earth with a flood again. The rainbow reminds us that Jehovah always keeps his word." }
    }
  ],
  prayerCard: { img: null, title: "Keep on asking", ref: "Matthew 7:7", text: "We can ask Jehovah for help when things are hard. He hears us and answers at the right time." },
  gems: {
    // keys: [Davian's key, Levi's key] held together on a laptop
    jehovah: { name: "Jehovah gem", move: "Rainbow Promise", does: "Heals everyone to full hearts", color: "#e0a526", keys: ["q", "p"] },
    bible:   { name: "Bible gem", move: "Ark Shield", does: "The boss's next 2 attacks miss", color: "#3f7fb5", keys: ["w", "o"] },
    myself:  { name: "Myself gem", move: "Courage Strike", does: "3 damage to the boss", color: "#c2452d", keys: ["e", "i"] },
    helping: { name: "Helping gem", move: "Team Up", does: "4 damage to the boss", color: "#4f9a4a", keys: ["r", "u"] }
  },
  shop: [
    { id: "shield", name: "Shield", price: 3, does: "Blocks half the damage of 1 attack", icon: "🛡️" },
    { id: "sword", name: "Sword", price: 5, does: "Double damage on your next hit", icon: "🗡️" },
    { id: "armor", name: "Armor", price: 5, does: "Blocks half the damage of 2 attacks", icon: "🦺" },
    { id: "potion", name: "Potion", price: 10, does: "Heals everyone to full hearts", icon: "🧪" },
    { id: "iron", name: "Iron Sword", price: 12, does: "Double damage for a whole battle", icon: "⚔️" }
  ],
  sources: [
    ["He Condemned the World (Walk Courageously With God, ch. 2)", "https://www.jw.org/en/library/books/walk-courageously-with-god/patriarchs-to-time-of-judges/noah-condemned-the-world/"],
    ["Noah's Ark (Lessons You Can Learn From the Bible, lesson 5)", "https://www.jw.org/en/library/books/bible-stories-lessons/2/noah-and-the-ark/"],
    ["Eight Survive Into a New World (lesson 6)", "https://www.jw.org/en/library/books/bible-stories-lessons/2/noahs-family-survives/"],
    ["Are You Willing to Wait on Jehovah? (Watchtower, Aug 2021)", "https://www.jw.org/en/library/magazines/watchtower-study-august-2021/Are-You-Willing-to-Wait-on-Jehovah/"],
    ["Bible: New World Translation", "https://wol.jw.org"]
  ]
};
