// LTC Fish Database — Auto-generated
// Edit fish entries here. Each fish is a JSON object in the array.


const STOREFRONT_MAP = {
  "All": ["All"],
  "Tangs": ["Tangs"],
  "Angelfish": ["Angelfish"],
  "Wrasses": ["Wrasses"],
  "Clownfish": ["Clownfish"],
  "Small Reef Fish": ["Gobies & Blennies","Basslets & Dottybacks","Damsels","Cardinalfish","Anthias","Hawkfish","Firefish"],
  "Butterflies & Rabbits": ["Butterflyfish","Rabbitfish"],
  "Predators & Oddballs": ["Triggerfish","Puffers","Eels","Lionfish","Sharks","Groupers","Filefish","Other Fish"],
  "Inverts": ["Shrimp","Crabs","Snails","Urchins","Starfish","Inverts","Clams","Cucumbers","Worms"]
};
const STOREFRONT_ORDER = ["All","Tangs","Angelfish","Wrasses","Clownfish","Small Reef Fish","Butterflies & Rabbits","Predators & Oddballs","Inverts"];
const STOREFRONT_STYLES = {
  "All": ["#3a8a6a","#1a4a3a","rgba(60,180,140,.4)"],
  "Tangs": ["#2855a8","#142a54","rgba(40,85,168,.4)"],
  "Angelfish": ["#cc6600","#663300","rgba(204,102,0,.4)"],
  "Wrasses": ["#7b2d8e","#3d1647","rgba(123,45,142,.4)"],
  "Clownfish": ["#dd7722","#6e3b11","rgba(221,119,34,.4)"],
  "Small Reef Fish": ["#2e8844","#174422","rgba(46,136,68,.4)"],
  "Butterflies & Rabbits": ["#eebb33","#775d19","rgba(238,187,51,.4)"],
  "Predators & Oddballs": ["#bb3344","#5d1922","rgba(187,51,68,.4)"],
  "Inverts": ["#3a9a8a","#1d4d45","rgba(58,154,138,.4)"]
};

const CARD_LABELS = {"Gobies & Blennies": "Goby", "Basslets & Dottybacks": "Basslet", "Butterflyfish": "Butterfly", "Triggerfish": "Trigger", "Cardinalfish": "Cardinal", "Rabbitfish": "Rabbit", "Predators & Oddballs": "Oddball", "Small Reef Fish": "Reef Fish"};

const SIZE_SCALE = {
  "Tiny": "< 1\"",
  "Small": "1–2\"",
  "Small-Medium": "2–3\"",
  "Medium": "3–4\"",
  "Medium-Large": "4–6\"",
  "Large": "6–8\"",
  "X-Large": "8–12\"",
  "XX-Large": "12\"+",
  "Frag": "Frag/colony",
  "—": ""
};


const CATEGORY_ORDER = ["All", "Tangs", "Angelfish", "Wrasses", "Clownfish", "Gobies & Blennies", "Damsels", "Basslets & Dottybacks", "Cardinalfish", "Anthias", "Butterflyfish", "Hawkfish", "Rabbitfish", "Triggerfish", "Puffers", "Eels", "Lionfish", "Other Fish", "Shrimp", "Crabs", "Snails", "Urchins", "Starfish", "Clams", "Inverts"];

const CATEGORY_STYLES = {
  "All": ["#3a8a6a","#1a4a3a","rgba(60,180,140,.4)"],
  "Tangs": ["#2855a8","#142a54","rgba(40,85,168,.4)"],
  "Angelfish": ["#cc6600","#663300","rgba(204,102,0,.4)"],
  "Wrasses": ["#7b2d8e","#3d1647","rgba(123,45,142,.4)"],
  "Clownfish": ["#dd7722","#6e3b11","rgba(221,119,34,.4)"],
  "Gobies & Blennies": ["#2e8844","#174422","rgba(46,136,68,.4)"],
  "Damsels": ["#4488cc","#224466","rgba(68,136,204,.4)"],
  "Basslets & Dottybacks": ["#8844aa","#442255","rgba(136,68,170,.4)"],
  "Cardinalfish": ["#cc4455","#662233","rgba(204,68,85,.4)"],
  "Anthias": ["#ee6688","#773344","rgba(238,102,136,.4)"],
  "Butterflyfish": ["#eebb33","#775d19","rgba(238,187,51,.4)"],
  "Hawkfish": ["#cc3333","#661919","rgba(204,51,51,.4)"],
  "Rabbitfish": ["#aacc22","#556611","rgba(170,204,34,.4)"],
  "Triggerfish": ["#8899aa","#444d55","rgba(136,153,170,.4)"],
  "Puffers": ["#77bbaa","#3b5d55","rgba(119,187,170,.4)"],
  "Eels": ["#555577","#2a2a3b","rgba(85,85,119,.4)"],
  "Lionfish": ["#cc5533","#662a19","rgba(204,85,51,.4)"],
  "Other Fish": ["#bb3344","#5d1922","rgba(187,51,68,.4)"],
  "Shrimp": ["#ee5544","#772a22","rgba(238,85,68,.4)"],
  "Crabs": ["#cc8833","#664419","rgba(204,136,51,.4)"],
  "Snails": ["#669966","#334d33","rgba(102,153,102,.4)"],
  "Urchins": ["#884488","#442244","rgba(136,68,136,.4)"],
  "Starfish": ["#cc6688","#663344","rgba(204,102,136,.4)"],
  "Clams": ["#7799bb","#3b4d5d","rgba(119,153,187,.4)"],
  "Inverts": ["#3a9a8a","#1d4d45","rgba(58,154,138,.4)"],
};

const SORT_OPTIONS = {
  featured: { label: "Featured", sub: "Our picks" },
  name: { label: "Name A→Z", sub: "Alphabetical" },
  priceLow: { label: "Lower price first", sub: "Budget friendly" },
  reefSafe: { label: "Reef safer first", sub: "Lowest coral risk" }
};

// Default bundles — staff can edit these in staff mode
let BUNDLES = [
  {name:"Beginner Reef Starter",name_es:"Pack Principiante",fish:["ocellaris-clown","cleaner-shrimp","royal-gramma"],discount:10,desc:"Perfect first reef trio — hardy, colorful, and peaceful",desc_es:"Trío perfecto para primer arrecife — resistente, colorido y pacífico"},
  {name:"Nano Tank Pack",name_es:"Pack Nano",fish:["ocellaris-clown","lawnmower-blenny","cleaner-shrimp"],discount:10,desc:"Small tank essentials — color, algae control, and cleanup",desc_es:"Esenciales para tanque pequeño — color, control de algas y limpieza"},
  {name:"Goby & Shrimp Pair",name_es:"Par Gobio y Camarón",fish:["diamond-goby","cleaner-shrimp"],discount:8,desc:"Sand-sifting utility with a cleaning station companion",desc_es:"Utilidad de tamizado de arena con compañero limpiador"},
];

