const fs = require('fs');
const path = require('path');
const vm = require('vm');

const base = '/mnt/data/v099_work';
const speciesDir = path.join(base, 'data', 'species');
const ctx = { window: { LTC_SPECIES_CHUNKS: {} }, console };
vm.createContext(ctx);

const fileCategory = {};
for (const fn of fs.readdirSync(speciesDir).filter(f => f.endsWith('.js')).sort()) {
  const full = path.join(speciesDir, fn);
  vm.runInContext(fs.readFileSync(full, 'utf8'), ctx);
  const keys = Object.keys(ctx.window.LTC_SPECIES_CHUNKS);
  const newest = keys[keys.length - 1];
  fileCategory[fn] = newest;
}

function clownRecognition(item) {
  const name = item.name.toLowerCase();
  const sci = (item.scientific || '').toLowerCase();
  if (name.includes('black storm')) return 'Designer ocellaris with a high-contrast black-and-white storm pattern that often reads almost panda-like as it matures.';
  if (name.includes('black photon')) return 'Designer ocellaris with heavier black coverage, irregular white barring, and a darker overall look than standard photon-style clownfish.';
  if (name.includes('black ice')) return 'Designer clown with irregular white barring, black edging, and enough orange left in the pattern to create the classic black-ice contrast.';
  if (name.includes('frostbite')) return 'Designer clown with thick icy-white barring, dark edging, and a cool-toned face pattern that looks more marbled than a standard ocellaris.';
  if (name.includes('snow onyx')) return 'Designer clown with heavy snow-style white patterning layered over a dark onyx-style body, giving it a bold black-and-white look.';
  if (name.includes('snowflake')) return 'Designer clown with exaggerated irregular white barring that breaks the neat three-bar clownfish pattern.';
  if (name.includes('davinci')) return 'Designer clown with stretched, curved white barring that looks hand-drawn compared with a standard straight-bar ocellaris.';
  if (name.includes('gladiator')) return 'Designer clown with dramatically broken white bars that often open up into jagged shield-like markings along the body.';
  if (name.includes('picasso')) return 'Designer percula with wildly distorted white bars and black edging, giving it the classic Picasso look collectors recognize immediately.';
  if (name.includes('misbar')) return 'Clownfish with one or more incomplete white bars, so the usual three-band clown pattern looks intentionally broken up.';
  if (name.includes('platinum')) return 'Mostly white designer percula with just enough dark edging and orange in the face or fins to show its clownfish shape.';
  if (name.includes('wyoming white')) return 'Almost all-white designer ocellaris with clean dark edging around the fins and very little orange left in the body.';
  if (name.includes('phantom')) return 'Dark designer clown with smoky black coverage and reduced orange, giving the fish a shadowed or ghosted appearance.';
  if (name.includes('midnight')) return 'Nearly solid black clownfish with only the body shape and fins giving away its ocellaris roots at a glance.';
  if (name.includes('domino')) return 'Dark designer clown with oversized white patching that stands out sharply against the black body.';
  if (name.includes('mocha')) return 'Designer clown with a warmer brown-orange base color and softer contrast than bright standard orange ocellaris forms.';
  if (name.includes('lightning maroon')) return 'Heavy-bodied maroon clown with jagged lightning-like barring instead of the usual clean vertical bands.';
  if (name.includes('gold stripe maroon')) return 'Deep maroon clown with thick metallic-gold bars and the bulky build typical of maroon clownfish.';
  if (sci.includes('premnas')) return 'Heavy-bodied clownfish with a deeper maroon base color and a much stronger, thicker look than the smaller Amphiprion species.';
  if (name.includes('orange skunk')) return 'Slender orange clownfish with a clean white dorsal stripe instead of the usual full vertical clown bars.';
  if (name.includes('pink skunk')) return 'Pale peach-pink clownfish with a narrow white dorsal stripe and a gentler, slimmer skunk-clown profile.';
  if (name === 'skunk clownfish' || sci.includes('akallopisos')) return 'Slim skunk clown with a long white stripe running from face to tail and a cleaner, less blocky look than ocellaris types.';
  if (name.includes('cinnamon')) return 'Rusty orange clown with a darker rear half and a stronger-bodied profile than the classic beginner clownfish species.';
  if (name.includes('saddleback')) return 'Clownfish with a broad white saddle-shaped mid-body band and a longer snout than the rounder ocellaris-type clowns.';
  if (name.includes('clarkii') || name.includes('yellowtail') || sci.includes('clarkii')) return 'Bold clownfish with a yellow tail and variable white bars, usually looking larger and more assertive than ocellaris-types.';
  if (name.includes('two-band') || sci.includes('bicinctus')) return 'Warm orange-brown clownfish with two crisp body bars and a stronger yellow cast in the fins and tail.';
  if (name.includes('percula')) return 'Bright orange clownfish with crisp white bars edged in black and a slightly neater, higher-contrast look than common ocellaris.';
  return 'Compact clownfish with variable barring and a host-focused body language that makes the fish easy to recognize once settled.';
}

function clownGuidance(item) {
  const name = item.name.toLowerCase();
  const sci = (item.scientific || '').toLowerCase();
  if (sci.includes('premnas') || name.includes('maroon')) return 'Best for aquarists who specifically want a more forceful clownfish and understand female size, territory, and pair management. The pattern can be beautiful, but the real recommendation depends on whether the tank can handle maroon-clown attitude long term.';
  if (name.includes('clarkii') || name.includes('yellowtail') || name.includes('two-band') || name.includes('cinnamon') || name.includes('saddleback')) return 'A good recommendation when the aquarist wants a natural clownfish species with more presence than ocellaris, but the conversation should include stronger territory, adult size, and pair compatibility rather than treating it like a generic beginner clown.';
  if (name.includes('skunk')) return 'Excellent for calmer reef keepers who want a natural clownfish with a different silhouette from the usual three-bar species. The best fit is a peaceful covered tank, not a rough community where the more delicate skunk types get pushed around.';
  if (name.includes('designer') || sci.includes('designer') || sci.includes('variant') || ['black-ice-clownfish','black-photon-clownfish','black-storm-clownfish','davinci-clownfish','domino-clownfish','frostbite-clownfish','gladiator-clownfish','midnight-clownfish','misbar-clownfish','mocha-clownfish','phantom-clownfish','picasso-clownfish','platinum-clownfish','snowflake-clownfish','snow-onyx-clownfish','wyoming-white-clownfish'].includes(item.id)) {
    return 'A strong captive-bred clownfish option when the aquarist wants unusual patterning without changing the basic clownfish care story. The key is still pair planning and territory, because the fancy pattern does not magically make clownfish social rules disappear.';
  }
  if (name.includes('percula')) return 'Excellent when the aquarist wants the classic high-contrast clown look and is willing to pay for that cleaner pattern. The main decision is still pair compatibility and territory, not whether percula acts radically different from ocellaris in a peaceful reef.';
  return item.buyingGuidance;
}

function gobyRecognition(item) {
  const id = item.id;
  const sci = (item.scientific || '').toLowerCase();
  const name = item.name.toLowerCase();
  const map = {
    'black-clown-goby': 'Tiny perch-and-peek goby with a compact chunky head and deep black body that stands out against branches and polyps.',
    'blue-dot-jawfish': 'Upright burrow fish with a large mouth, pale body, and vivid blue spotting across the head and upper body.',
    'catalina-goby': 'Small cool-colored goby with bright neon striping and a delicate perch-and-dart style around rock and ledges.',
    'citrinis-clown-goby': 'Tiny yellow clown goby with a blunt face and perch-heavy body shape built for sitting on branches and coral heads.',
    'diamond-watchman-goby': 'Long-faced sand goby with a pale body covered in orange spots and the deliberate sand-sifting posture watchman gobies are known for.',
    'dracula-goby': 'Very small shrimp goby with a pale body, dark facial mask, and an alert upright stance over the burrow entrance.',
    'flaming-prawn-goby': 'Miniature goby with intense red-and-white striping and oversized eyes that make it look more ornamental than fast-moving.',
    'green-clown-goby': 'Tiny branch-perching goby with a rounded head, stocky body, and solid green coloration that blends into coral tissue and algae.',
    'hi-fin-red-banded-goby': 'Shrimp-goby with a tall first dorsal fin and crisp red banding that makes it easy to spot when it hovers above a burrow.',
    'orange-spotted-goby': 'Pale burrow goby covered in orange spots with a long low body built for sand beds and shrimp partnerships.',
    'orange-stripe-prawn-goby': 'Slender shrimp goby with orange striping, a watchful stance, and the classic pause-and-hover posture above a shared burrow.',
    'pink-spotted-watchman-goby': 'Heavy-headed watchman goby with pink spotting and a thick-bodied sand-perching look compared with slimmer shrimp gobies.',
    'rainford-s-goby': 'Slender algae-picking goby with greenish tones, orange facial striping, and a neat combed pattern along the body.',
    'sleeper-banded-goby': 'Sand-sifting goby with a pale body crossed by darker bands and a long low profile made for cruising the substrate.',
    'sleeper-gold-head-goby': 'Elegant sand goby with a bright yellow face, pale body, and blue line detail across the head.',
    'tiger-watchman-goby': 'Chunky watchman goby with bold orange-brown barring and a broad head that reads more sturdy than delicate.',
    'trimma-goby': 'Tiny hover-and-perch goby with oversized eyes, a delicate translucent look, and a habit of hanging under ledges.',
    'twin-spot-goby': 'Small signal goby with twin false eye spots near the dorsal area and a neat sand-sifting body shape.',
    'wheeler-s-shrimp-goby': 'White shrimp goby with orange-red banding and black spotting, often standing upright like a sentry above its burrow.',
    'yellow-clown-goby': 'Tiny bright-yellow perch goby with a blunt face and a coral-branch sitting posture rather than open-water swimming.',
    'yellow-line-goby': 'Small cleaner-style goby with a dark body crossed by a bright yellow line from nose to tail.',
    'yellowhead-jawfish': 'Burrow fish with an oversized mouth, bright yellow head, and upright head-out-of-the-hole posture that is instantly distinctive.',
    'ember-blenny': 'Small orange-red blenny with an expressive face and the short perching profile typical of Ecsenius blennies.',
    'linear-blenny': 'Perching blenny with a slim body crossed by fine horizontal lines and a watchful, head-up resting posture.',
    'molly-miller-blenny': 'Mottled blenny with a rougher algae-grazer look, cirri over the eyes, and a body built more for perching than cruising.',
    'starry-blenny': 'Dark blenny covered in white speckling, with obvious cirri and a chunky perch-and-graze profile.',
    'two-spot-goby': 'Small sand goby with two striking false eye spots and a careful hover-and-sift posture over the substrate.',
    'wheeler-goby': 'White shrimp goby with orange-red banding and black spotting, usually hovering just above the burrow mouth.',
    'orange-line-goby': 'Slender cleaner goby with a bright orange-yellow dorsal stripe and a dark line running through the eye.'
  };
  if (map[id]) return map[id];
  if (sci.startsWith('gobiodon')) return 'Tiny branch-perching goby with a blunt head, compact body, and a habit of sitting on coral or rock rather than roaming open water.';
  if (sci.startsWith('opistognathus')) return 'Upright burrow fish with oversized jaws, alert eyes, and a head-out-of-the-burrow posture that stands apart from ordinary gobies.';
  if (/stonogobiops|amblyeleotris|cryptocentrus/.test(sci)) return 'Shrimp-goby profile with a slender bottom-hugging body, prominent first dorsal fin, and an upright sentry posture above the burrow.';
  if (/valenciennea|amblygobius|signigobius/.test(sci)) return 'Sand-oriented goby with a longer face and a cruising substrate profile built more for sifting than perching.';
  if (/meiacanthus|ecsenius|salarias|scartella/.test(sci)) return 'Perching blenny with an expressive face, elongated body, and a head-up resting posture on rock or glass.';
  return item.recognitionNotes;
}

function gobyGuidance(item) {
  const sci = (item.scientific || '').toLowerCase();
  const id = item.id;
  if (/gobiodon/.test(sci)) return 'Excellent for smaller peaceful reefs when the aquarist enjoys close-up behavior and understands how tiny these fish really are. The right home values branch work, calmer tankmates, and detail in the rockwork rather than expecting the fish to dominate the whole tank visually.';
  if (/opistognathus/.test(sci)) return 'Recommend when the aquarist has a secure lid, real substrate depth, and the patience to let a burrow specialist settle in properly. Jawfish are all personality once established, but the system has to support digging behavior first.';
  if (/stonogobiops|amblyeleotris|cryptocentrus/.test(sci) || ['wheeler-goby','two-spot-goby'].includes(id)) return 'A strong fit for reef keepers who want bottom-zone behavior and, ideally, a shrimp partnership done correctly. The better recommendation focuses on lid security, substrate, and burrow habitat rather than just the color pattern.';
  if (/valenciennea|amblygobius|signigobius/.test(sci)) return 'Best when the aquarist genuinely wants a sand-working fish and can support its constant substrate use without stripping a tiny tank clean. Ask about sand depth, lid security, and whether the system is mature enough to keep the fish fed.';
  if (/meiacanthus/.test(sci)) return 'Great when the aquarist wants personality from a blenny that spends more time in view and less time glued to one patch of algae. The conversation should include temperament and tankmate fit, not just size.';
  if (/ecsenius|salarias|scartella/.test(sci)) return 'Recommend after matching the blenny to the actual tank job: some are true grazers, some are more general pickers, and all do better when the aquarist appreciates perch-and-browse behavior.';
  return item.buyingGuidance;
}

const tangRecognitionMap = {
  'achilles-tang': 'Velvety dark tang with a vivid orange teardrop at the tail base, white tail edging, and a very sleek high-speed profile.',
  'atlantic-blue-tang': 'Sleek surgeonfish that shifts from bright juvenile yellow to a richer blue adult body with yellow still lingering in the tail and accents.',
  'blonde-naso-tang': 'Long-faced naso tang with a pale grey body, yellow dorsal accents, and streamers that develop from the tail in larger adults.',
  'blue-eye-kole-tang': 'Bristletooth tang with fine body striping, a glowing blue eye ring, and a subtler combing profile than the bolder Zebrasoma tangs.',
  'chevron-tang': 'Juveniles show warm orange tones with sharp chevron markings, while adults darken into a finer lined bristletooth look.',
  'chocolate-tang': 'Brown-bodied tang that changes significantly with age, often showing yellow or angel-like mimic tones when young.',
  'clown-tang': 'Very bold surgeonfish with alternating yellow, blue, and white striping that makes it one of the easiest tangs to recognize at a glance.',
  'dussumieri-tang': 'Large open-water tang with a pale silver-brown body, face scribbling, and a broad powerful build that hints at its eventual size.',
  'goldrim-tang': 'Dark tang with a crisp white lower face and a golden-yellow edge tracing the dorsal region and tail area.',
  'lavender-tang': 'Smooth grey-lavender surgeonfish with a cleaner, softer color palette than the more aggressively contrasted tang species.',
  'lieutenant-tang': 'Silver-grey tang with lined facial detail and a marked shoulder area that gives the fish a dressed-uniform look up close.',
  'mimic-tang': 'Tang that often resembles a dwarf angel as a juvenile, then grows into a more classic surgeonfish shape with subtler adult patterning.',
  'orange-shoulder-tang': 'Adult shows a broad orange shoulder patch on a pale body, while juveniles can look much yellower before the color shift.',
  'powder-brown-tang': 'Dark brown tang with bright white facial contrast and warm orange highlights near the dorsal region and tail base.',
  'white-tail-bristletooth-tang': 'Dark bristletooth tang with fine pale markings and a distinctly pale white tail that stands out when the fish turns.',
  'desjardini-tang': 'Tall sailfin tang with bold vertical barring, spotted fins, and an exaggerated disc-and-sail silhouette as it matures.',
  'white-tail-tang': 'Slender open-water surgeonfish with a noticeably pale tail and a cleaner, more streamlined look than a chunky bristletooth tang.'
};

function angelRecognition(item) {
  const id = item.id;
  const sci = (item.scientific || '').toLowerCase();
  const map = {
    'african-flameback-angel': 'Compact dwarf angel with an electric blue body and a blazing orange back that makes the species easy to pick out from across the tank.',
    'asfur-angel': 'Large show angel with a dark body, bright yellow tail, and sweeping yellow side patch that becomes more dramatic with age.',
    'bellus-angel': 'Slender open-water angel with forked tail and pale blue-black striping, giving it a cleaner, more streamlined look than rock-picking angels.',
    'blueface-angel': 'Tall-bodied angelfish with an intricate blue facial mask and a yellow-toned body pattern that sharpens as the fish matures.',
    'cherub-angel': 'Tiny but vivid dwarf angel with a cobalt-blue body and warm yellow-orange face and chest accents.',
    'eibli-dwarf-angel': 'Grey-to-brown dwarf angel with orange striping and a dark tail region, giving it a muted but very patterned look.',
    'false-personifer-angel': 'Broad-bodied angel with face markings and a refined black-white-yellow pattern that reads more elegant than flashy.',
    'fisher-s-angel': 'Small warm-orange dwarf angel with blue edging and a delicate, understated look compared with louder Centropyge species.',
    'flagfin-angel': 'Tall yellow angelfish with darker facial contrast and a very obvious flag-like dorsal profile.',
    'french-angel': 'Large Caribbean angel with a dark body outlined in gold-edged scales and a strong yellow facial highlight in adults.',
    'goldflake-angel': 'Creamy pale angel dusted with golden speckling and darker facial contrast, giving the fish a sprinkled metallic look.',
    'halfblack-angel': 'Small dwarf angel split between a pale front half and a darker rear half, exactly as the common name suggests.',
    'keyhole-angel': 'Dark-bodied dwarf angel with a crisp pale keyhole-like spot on the side and a neat compact profile.',
    'lamarck-s-angel': 'Open-water Genicanthus angel with silver-and-black striping, forked tail, and a noticeably slimmer body than a typical reef angel.',
    'majestic-angel': 'Deep blue and yellow angelfish with curved side patterning and an ornate face mask that looks especially rich in mature specimens.',
    'midnight-angel': 'Small dwarf angel with a near-solid black body and a simple silhouette that makes the color the whole statement.',
    'multicolor-angel': 'Compact dwarf angel with a pale center, orange rear, and blue line work that gives it a very layered pastel look.',
    'potter-s-angel': 'Hawaiian dwarf angel with bright orange body color crossed by fine blue striping and a very animated rock-grazing look.',
    'queen-angel': 'Large Caribbean angel with electric blue edging, bright yellow body tones, and the classic crown-like forehead mark.',
    'regal-angel': 'Striking reef angel with tight blue-and-yellow striping and a pale chest, giving it one of the cleanest high-end angelfish looks.',
    'rock-beauty-angel': 'Tall angel with a black rear half and bright yellow front, creating one of the starkest two-tone angelfish patterns.',
    'rusty-angel': 'Small dwarf angel washed in warm rust-orange with fine dark edging that gives it a softer, earthy look.',
    'scribbled-angel': 'Large angel with a pale base color covered in dark hand-drawn scribble-like lines and looping face detail.',
    'swallowtail-angel': 'Slim open-water angel with forked tail and elegant black-and-yellow patterning instead of the chunkier classic angel build.',
    'venustus-angel': 'Deep-bodied angel with a bright yellow front half and a darker blue rear, making the two-tone split easy to spot.',
    'watanabei-angel': 'Slender Genicanthus angel with long flowing profile, forked tail, and clean stripe patterning built for open-water display.',
    'zebra-angel': 'Open-water angel with a forked tail and clean horizontal zebra-like striping rather than a chunky rock-angel silhouette.',
    'french-angelfish': 'Large Caribbean angel with dark gold-edged scales and bright facial accents that give adults a rich, regal look.',
    'queen-angelfish': 'Large show angel with a glowing blue-and-yellow body and the unmistakable crown mark on the forehead.',
    'regal-angelfish': 'High-contrast angelfish with tight blue-yellow striping and a pale chest that makes it look almost painted.',
    'japanese-swallowtail-angel': 'Fork-tailed open-water angel with refined striping and a slimmer silhouette than the chunkier rock-oriented angelfish.',
    'keyhole-angelfish': 'Dark-bodied dwarf angel with the signature pale keyhole patch on the side and a compact, fast rockwork profile.',
    'watanabei-angelfish': 'Slender open-water angel with a forked tail and clean striping, built more like a planktivore than a grazer.',
    'peppermint-angelfish': 'Rare dwarf angel with a pale body crossed by red-orange peppermint striping and a very delicate collector look.'
  };
  if (map[id]) return map[id];
  if (sci.startsWith('genicanthus')) return 'Slim fork-tailed open-water angel with cleaner striping and a more streamlined body than the chunkier rock-oriented angelfish.';
  if (sci.startsWith('centropyge')) return 'Compact dwarf angel with a short deep body, bright contrast, and a constant rock-picking posture around ledges.';
  if (/pomacanthus|holacanthus|chaetodontoplus|apolemichthys|pygoplites/.test(sci)) return 'Tall-bodied show angel with bold facial detail, longer fins, and a slower cruising presence than the dwarf species.';
  return item.recognitionNotes;
}

function rewriteFile(filename, category) {
  const arr = ctx.window.LTC_SPECIES_CHUNKS[category];
  const out = 'window.LTC_SPECIES_CHUNKS = window.LTC_SPECIES_CHUNKS || {};\n' +
    `window.LTC_SPECIES_CHUNKS[${JSON.stringify(category)}] = ${JSON.stringify(arr, null, 2)};\n`;
  fs.writeFileSync(path.join(speciesDir, filename), out);
}

for (const item of ctx.window.LTC_SPECIES_CHUNKS['Clownfish']) {
  if (item.recognitionNotes === 'Look for the compact clownfish body, bold band pattern, and host-focused behavior around rockwork or anemones.') {
    item.recognitionNotes = clownRecognition(item);
  }
  if (item.buyingGuidance === 'A strong beginner-to-intermediate choice when the aquarist understands pair behavior, territory, and how much personality even small clownfish can develop once they settle.' ) {
    item.buyingGuidance = clownGuidance(item);
  }
}

for (const item of ctx.window.LTC_SPECIES_CHUNKS['Gobies & Blennies']) {
  if (item.recognitionNotes === 'Look for a small bottom-oriented fish that perches on rock, sand, or burrows instead of cruising open water.') {
    item.recognitionNotes = gobyRecognition(item);
  }
  if (item.buyingGuidance === 'A strong fit for reef keepers who value behavior and bottom-zone personality over sheer speed. The best conversation is about substrate, lids, and whether the aquarist wants to support the shrimp partnership properly instead of just buying the goby for color alone.' ||
      item.buyingGuidance === 'Excellent for smaller peaceful reefs when the aquarist enjoys close-up behavior and understands how tiny the fish really is. The right buyer is looking for texture and personality in the branches, not for a fish that will dominate the whole tank visually.' ||
      item.buyingGuidance === 'Recommend when the aquarist has real substrate depth, rubble, a secure lid, and the right temperature range for the species. Jawfish win people over immediately, but the long-term home has to support the burrow first and the looks second.' ||
      item.buyingGuidance === 'Great when the aquarist wants personality from a fish that uses rockwork differently than a goby. The key is matching the blenny\'s actual feeding style and attitude to the tank, because not every blenny is the same kind of peaceful algae picker.'
      ) {
    item.buyingGuidance = gobyGuidance(item);
  }
}

for (const item of ctx.window.LTC_SPECIES_CHUNKS['Tangs']) {
  if (item.recognitionNotes === 'Look for the flat, disk-shaped tang body, constant grazing behavior, and the tail spine typical of surgeonfish.' && tangRecognitionMap[item.id]) {
    item.recognitionNotes = tangRecognitionMap[item.id];
  }
}

for (const item of ctx.window.LTC_SPECIES_CHUNKS['Angelfish']) {
  if (item.recognitionNotes === 'Look for the tall body shape, bold facial markings, and slow cruising pattern common to marine angels.') {
    item.recognitionNotes = angelRecognition(item);
  }
}

rewriteFile('clownfish.js', 'Clownfish');
rewriteFile('gobies-blennies.js', 'Gobies & Blennies');
rewriteFile('tangs.js', 'Tangs');
rewriteFile('angelfish.js', 'Angelfish');

const appPath = path.join(base, 'js', 'app.js');
let appTxt = fs.readFileSync(appPath, 'utf8');
appTxt = appTxt.replace("const APP_VERSION = 'v0.099';", "const APP_VERSION = 'v0.100';");
fs.writeFileSync(appPath, appTxt);
