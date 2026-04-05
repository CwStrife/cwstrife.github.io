const fs = require('fs');
const path = require('path');

const speciesDir = path.join(__dirname, 'data', 'species');

function loadChunks() {
  const out = {};
  for (const file of fs.readdirSync(speciesDir).filter(f => f.endsWith('.js')).sort()) {
    const full = path.join(speciesDir, file);
    const raw = fs.readFileSync(full, 'utf8');
    const match = raw.match(/window\.LTC_SPECIES_CHUNKS\["([^"]+)"\]\s*=\s*(\[[\s\S]*\])\s*;\s*$/);
    if (!match) throw new Error(`Could not parse ${file}`);
    out[match[1]] = { file, entries: JSON.parse(match[2]) };
  }
  return out;
}

function saveChunks(chunks) {
  for (const [category, { file, entries }] of Object.entries(chunks)) {
    const full = path.join(speciesDir, file);
    const content = `window.LTC_SPECIES_CHUNKS = window.LTC_SPECIES_CHUNKS || {};\nwindow.LTC_SPECIES_CHUNKS[${JSON.stringify(category)}] = ${JSON.stringify(entries, null, 2)};\n`;
    fs.writeFileSync(full, content);
  }
}

const chunks = loadChunks();
const all = Object.values(chunks).flatMap(x => x.entries);
const byId = Object.fromEntries(all.map(x => [x.id, x]));

function applyFields(id, fields) {
  const item = byId[id];
  if (!item) throw new Error(`Missing id: ${id}`);
  Object.assign(item, fields);
}

function copyFields(id, sourceId, fields = ['scientific', 'maxSize', 'minTank', 'diet']) {
  const item = byId[id];
  const source = byId[sourceId];
  if (!item || !source) throw new Error(`Missing copy pair: ${id} <- ${sourceId}`);
  for (const field of fields) item[field] = source[field];
}

// Straight copies from duplicate / synonym entries already present in the catalog.
copyFields('french-angel', 'french-angelfish');
copyFields('keyhole-angel', 'keyhole-angelfish');
copyFields('potter-s-angel', 'potters-angel');
copyFields('queen-angel', 'queen-angelfish');
copyFields('regal-angel', 'regal-angelfish');
copyFields('bartlett-s-anthias', 'bartletts-anthias');
copyFields('banggai-cardinal', 'banggai-cardinalfish');
copyFields('threadfin-cardinal', 'threadfin-cardinalfish');
copyFields('wheeler-s-shrimp-goby', 'wheeler-goby');
copyFields('filamented-flasher-wrasse', 'flasher-wrasse-filamented');
copyFields('scott-s-fairy-wrasse', 'scott-fairy-wrasse');
copyFields('blue-dot-jawfish', 'blue-spot-jawfish');
copyFields('diamond-watchman-goby', 'diamond-goby');
copyFields('rainford-s-goby', 'court-jester-goby');
copyFields('orange-stripe-prawn-goby', 'randalls-goby');
copyFields('target-mandarin', 'spotted-mandarin');
copyFields('canary-wrasse', 'yellow-coris-wrasse');
copyFields('hoeven-s-wrasse', 'melanurus-wrasse');
copyFields('foxface-lo', 'foxface');

// Manual factual backfill for remaining entries.
const backfill = {
  'false-personifer-angel': { scientific: 'Chaetodontoplus meredithi', maxSize: '10 in', minTank: '120+ gal', diet: 'Omnivore / spongivore' },
  'fisher-s-angel': { scientific: 'Centropyge fisheri', maxSize: '3 in', minTank: '30+ gal', diet: 'Omnivore' },
  'flagfin-angel': { scientific: 'Apolemichthys trimaculatus', maxSize: '10 in', minTank: '125+ gal', diet: 'Omnivore / spongivore' },
  'goldflake-angel': { scientific: 'Apolemichthys xanthopunctatus', maxSize: '10 in', minTank: '125+ gal', diet: 'Omnivore / spongivore' },
  'halfblack-angel': { scientific: 'Centropyge vrolikii', maxSize: '4 in', minTank: '30+ gal', diet: 'Omnivore' },
  'lamarck-s-angel': { scientific: 'Genicanthus lamarck', maxSize: '10 in', minTank: '75+ gal', diet: 'Planktivore' },
  'scribbled-angel': { scientific: 'Chaetodontoplus duboulayi', maxSize: '11 in', minTank: '180+ gal', diet: 'Omnivore / spongivore' },
  'swallowtail-angel': { scientific: 'Genicanthus melanospilos', maxSize: '7 in', minTank: '75+ gal', diet: 'Planktivore' },
  'venustus-angel': { scientific: 'Paracentropyge venusta', maxSize: '5 in', minTank: '70+ gal', diet: 'Omnivore / spongivore' },
  'watanabei-angel': { scientific: 'Genicanthus watanabei', maxSize: '6 in', minTank: '75+ gal', diet: 'Planktivore' },
  'zebra-angel': { scientific: 'Genicanthus caudovittatus', maxSize: '8 in', minTank: '75+ gal', diet: 'Planktivore' },

  'bicolor-anthias': { scientific: 'Pseudanthias bicolor', maxSize: '5 in', minTank: '70+ gal', diet: 'Planktivore' },
  'bimaculatus-anthias': { scientific: 'Pseudanthias bimaculatus', maxSize: '5 in', minTank: '70+ gal', diet: 'Planktivore' },
  'carberryi-anthias': { scientific: 'Nemanthias carberryi', maxSize: '3.5 in', minTank: '55+ gal', diet: 'Planktivore' },
  'dispar-anthias': { scientific: 'Pseudanthias dispar', maxSize: '3.5 in', minTank: '55+ gal', diet: 'Planktivore' },
  'evansi-anthias': { scientific: 'Pseudanthias evansi', maxSize: '5 in', minTank: '70+ gal', diet: 'Planktivore' },
  'ignitus-anthias': { scientific: 'Pseudanthias ignitus', maxSize: '3.5 in', minTank: '55+ gal', diet: 'Planktivore' },
  'lori-s-anthias': { scientific: 'Pseudanthias lori', maxSize: '5 in', minTank: '70+ gal', diet: 'Planktivore' },
  'purple-queen-anthias': { scientific: 'Pseudanthias tuka', maxSize: '4.5 in', minTank: '70+ gal', diet: 'Planktivore' },
  'randall-s-anthias': { scientific: 'Pseudanthias randalli', maxSize: '3 in', minTank: '55+ gal', diet: 'Planktivore' },
  'resplendent-anthias': { scientific: 'Pseudanthias pulcherrimus', maxSize: '3 in', minTank: '55+ gal', diet: 'Planktivore' },

  'blackcap-basslet': { scientific: 'Gramma melacara', maxSize: '4 in', minTank: '30+ gal', diet: 'Carnivore' },
  'candy-basslet': { scientific: 'Liopropoma carmabi', maxSize: '3 in', minTank: '30+ gal', diet: 'Carnivore' },
  'fridmani-dottyback': { scientific: 'Pseudochromis fridmani', maxSize: '3 in', minTank: '30+ gal', diet: 'Carnivore' },
  'indigo-dottyback': { scientific: 'Pseudochromis fridmani x sankeyi', maxSize: '3 in', minTank: '30+ gal', diet: 'Carnivore' },
  'neon-dottyback': { scientific: 'Pseudochromis aldabraensis', maxSize: '3 in', minTank: '30+ gal', diet: 'Carnivore' },
  'randall-s-assessor': { scientific: 'Assessor randalli', maxSize: '2.5 in', minTank: '20+ gal', diet: 'Carnivore' },
  'sankeyi-dottyback': { scientific: 'Pseudochromis sankeyi', maxSize: '3 in', minTank: '30+ gal', diet: 'Carnivore' },
  'springeri-dottyback': { scientific: 'Pseudochromis springeri', maxSize: '2.5 in', minTank: '30+ gal', diet: 'Carnivore' },
  'strawberry-dottyback': { scientific: 'Pseudochromis porphyreus', maxSize: '3 in', minTank: '30+ gal', diet: 'Carnivore' },
  'sunrise-dottyback': { scientific: 'Pseudochromis flavivertex', maxSize: '3 in', minTank: '30+ gal', diet: 'Carnivore' },

  'auriga-butterflyfish': { scientific: 'Chaetodon auriga', maxSize: '9 in', minTank: '125+ gal', diet: 'Omnivore' },
  'heniochus-butterfly': { scientific: 'Heniochus acuminatus', maxSize: '8 in', minTank: '125+ gal', diet: 'Omnivore' },
  'klein-s-butterflyfish': { scientific: 'Chaetodon kleinii', maxSize: '5.5 in', minTank: '75+ gal', diet: 'Omnivore' },
  'pearlscale-butterflyfish': { scientific: 'Chaetodon xanthurus', maxSize: '6 in', minTank: '75+ gal', diet: 'Omnivore' },
  'pyramid-butterflyfish': { scientific: 'Hemitaurichthys polylepis', maxSize: '7 in', minTank: '125+ gal', diet: 'Planktivore' },
  'raccoon-butterflyfish': { scientific: 'Chaetodon lunula', maxSize: '8 in', minTank: '125+ gal', diet: 'Omnivore' },
  'saddleback-butterflyfish': { scientific: 'Chaetodon ephippium', maxSize: '12 in', minTank: '180+ gal', diet: 'Omnivore' },
  'teardrop-butterflyfish': { scientific: 'Chaetodon unimaculatus', maxSize: '8 in', minTank: '125+ gal', diet: 'Omnivore' },
  'vagabond-butterflyfish': { scientific: 'Chaetodon vagabundus', maxSize: '9 in', minTank: '125+ gal', diet: 'Omnivore' },

  'orbic-cardinal': { scientific: 'Sphaeramia orbicularis', maxSize: '4 in', minTank: '25+ gal', diet: 'Carnivore' },
  'red-spot-cardinal': { scientific: 'Ostorhinchus parvulus', maxSize: '1.5 in', minTank: '10+ gal', diet: 'Carnivore' },
  'yellow-stripe-cardinal': { scientific: 'Ostorhinchus cyanosoma', maxSize: '2.5 in', minTank: '20+ gal', diet: 'Carnivore' },

  'yellowtail-blue-damsel': { scientific: 'Chrysiptera parasema', maxSize: '3 in', minTank: '20+ gal', diet: 'Omnivore' },

  'black-clown-goby': { scientific: 'Gobiodon strangulatus', maxSize: '2 in', minTank: '10+ gal', diet: 'Carnivore' },
  'citrinis-clown-goby': { scientific: 'Gobiodon citrinus', maxSize: '1.5 in', minTank: '10+ gal', diet: 'Carnivore' },
  'dracula-goby': { scientific: 'Stonogobiops dracula', maxSize: '3 in', minTank: '10+ gal', diet: 'Carnivore' },
  'flaming-prawn-goby': { scientific: 'Discordipinna griessingeri', maxSize: '1.5 in', minTank: '10+ gal', diet: 'Carnivore' },
  'hi-fin-red-banded-goby': { scientific: 'Stonogobiops nematodes', maxSize: '2 in', minTank: '10+ gal', diet: 'Carnivore' },
  'orange-spotted-goby': { scientific: 'Amblyeleotris guttata', maxSize: '4 in', minTank: '30+ gal', diet: 'Carnivore' },
  'pink-spotted-watchman-goby': { scientific: 'Cryptocentrus leptocephalus', maxSize: '5 in', minTank: '30+ gal', diet: 'Carnivore' },
  'sleeper-banded-goby': { scientific: 'Amblygobius phalaena', maxSize: '6 in', minTank: '30+ gal', diet: 'Carnivore / sand sifter' },
  'sleeper-gold-head-goby': { scientific: 'Valenciennea strigata', maxSize: '6 in', minTank: '55+ gal', diet: 'Carnivore / sand microfauna' },
  'trimma-goby': { scientific: 'Trimma sp.', maxSize: '1.5 in', minTank: '10+ gal', diet: 'Carnivore / planktivore' },
  'twin-spot-goby': { scientific: 'Signigobius biocellatus', maxSize: '3 in', minTank: '20+ gal', diet: 'Carnivore / sand microfauna' },
  'yellow-line-goby': { scientific: 'Elacatinus figaro', maxSize: '2 in', minTank: '10+ gal', diet: 'Carnivore' },
  'canary-fang-blenny': { scientific: 'Meiacanthus oualanensis', maxSize: '4 in', minTank: '30+ gal', diet: 'Omnivore' },
  'molly-miller-blenny': { scientific: 'Scartella cristata', maxSize: '4 in', minTank: '10+ gal', diet: 'Omnivore / algae grazer' },
  'smith-s-blenny': { scientific: 'Meiacanthus smithi', maxSize: '3 in', minTank: '30+ gal', diet: 'Omnivore' },
  'striped-fang-blenny': { scientific: 'Meiacanthus grammistes', maxSize: '4 in', minTank: '30+ gal', diet: 'Omnivore' },
  'mandarin-dragonet': { scientific: 'Synchiropus splendidus', maxSize: '3 in', minTank: '30+ gal', diet: 'Copepods / live microfauna' },
  'red-scooter-dragonet': { scientific: 'Synchiropus stellatus', maxSize: '3 in', minTank: '30+ gal', diet: 'Copepods / microfauna' },

  'arc-eye-hawkfish': { scientific: 'Paracirrhites arcatus', maxSize: '5 in', minTank: '30+ gal', diet: 'Carnivore' },
  'falco-hawkfish': { scientific: 'Cirrhitichthys falco', maxSize: '3 in', minTank: '20+ gal', diet: 'Carnivore' },
  'freckled-hawkfish': { scientific: 'Paracirrhites forsteri', maxSize: '8 in', minTank: '75+ gal', diet: 'Carnivore' },
  'pixy-hawkfish': { scientific: 'Cirrhitichthys oxycephalus', maxSize: '5 in', minTank: '30+ gal', diet: 'Carnivore' },

  'blue-spotted-rabbitfish': { scientific: 'Siganus corallinus', maxSize: '8 in', minTank: '120+ gal', diet: 'Herbivore' },
  'masked-rabbitfish': { scientific: 'Siganus puellus', maxSize: '10 in', minTank: '125+ gal', diet: 'Herbivore' },
  'one-spot-foxface': { scientific: 'Siganus unimaculatus', maxSize: '8 in', minTank: '100+ gal', diet: 'Herbivore' },
  'scribbled-rabbitfish': { scientific: 'Siganus spinus', maxSize: '10 in', minTank: '125+ gal', diet: 'Herbivore' },

  'banana-wrasse': { scientific: 'Thalassoma lutescens', maxSize: '12 in', minTank: '125+ gal', diet: 'Carnivore' },
  'bird-wrasse': { scientific: 'Gomphosus varius', maxSize: '12 in', minTank: '125+ gal', diet: 'Carnivore' },
  'black-leopard-wrasse': { scientific: 'Macropharyngodon negrosensis', maxSize: '5 in', minTank: '55+ gal', diet: 'Carnivore' },
  'blue-flasher-wrasse': { scientific: 'Paracheilinus cyaneus', maxSize: '3 in', minTank: '30+ gal', diet: 'Carnivore' },
  'bluestreak-cleaner-wrasse': { scientific: 'Labroides dimidiatus', maxSize: '5 in', minTank: '75+ gal', diet: 'Ectoparasites' },
  'eight-line-wrasse': { scientific: 'Pseudocheilinus octotaenia', maxSize: '5 in', minTank: '55+ gal', diet: 'Carnivore' },
  'four-line-wrasse': { scientific: 'Pseudocheilinus tetrataenia', maxSize: '3 in', minTank: '30+ gal', diet: 'Carnivore' },
  'harlequin-tusk': { scientific: 'Choerodon fasciatus', maxSize: '10 in', minTank: '125+ gal', diet: 'Carnivore' },
  'hooded-fairy-wrasse': { scientific: 'Cirrhilabrus bathyphilus', maxSize: '3 in', minTank: '50+ gal', diet: 'Carnivore / planktivore' },
  'lubbock-s-fairy-wrasse': { scientific: 'Cirrhilabrus lubbocki', maxSize: '3.5 in', minTank: '40+ gal', diet: 'Carnivore / planktivore' },
  'lunare-wrasse': { scientific: 'Thalassoma lunare', maxSize: '10 in', minTank: '125+ gal', diet: 'Carnivore' },
  'naoko-s-fairy-wrasse': { scientific: 'Cirrhilabrus naokoae', maxSize: '4 in', minTank: '50+ gal', diet: 'Carnivore / planktivore' },
  'ornate-leopard-wrasse': { scientific: 'Macropharyngodon ornatus', maxSize: '5 in', minTank: '55+ gal', diet: 'Carnivore' },
  'pink-streaked-wrasse': { scientific: 'Pseudocheilinops ataenia', maxSize: '2 in', minTank: '20+ gal', diet: 'Carnivore' },
  'red-coris-wrasse': { scientific: 'Coris gaimard', maxSize: '10 in', minTank: '125+ gal', diet: 'Carnivore' },
  'red-margin-fairy-wrasse': { scientific: 'Cirrhilabrus rubrimarginatus', maxSize: '5 in', minTank: '55+ gal', diet: 'Carnivore / planktivore' },
  'rhomboid-wrasse': { scientific: 'Cirrhilabrus rhomboidalis', maxSize: '3.5 in', minTank: '55+ gal', diet: 'Carnivore / planktivore' },
  'ruby-head-fairy-wrasse': { scientific: 'Cirrhilabrus cyanopleura complex', maxSize: '5 in', minTank: '55+ gal', diet: 'Carnivore / planktivore' },
  'tanaka-s-pygmy-wrasse': { scientific: 'Wetmorella tanakai', maxSize: '3 in', minTank: '15+ gal', diet: 'Carnivore' },
  'timor-wrasse': { scientific: 'Halichoeres timorensis', maxSize: '5 in', minTank: '50+ gal', diet: 'Carnivore' },
  'yellow-banded-possum-wrasse': { scientific: 'Wetmorella nigropinnata', maxSize: '3 in', minTank: '15+ gal', diet: 'Carnivore' },
  'yellowfin-flasher-wrasse': { scientific: 'Paracheilinus flavianalis', maxSize: '3.25 in', minTank: '30+ gal', diet: 'Carnivore' }
};

for (const [id, fields] of Object.entries(backfill)) applyFields(id, fields);

// Text cleanup / reality pass for a few entries that still read awkwardly or internally.
applyFields('zebra-hermit-crab', {
  visualCue: 'Look for zebra-striped black-and-white legs and a shell carried like a mobile little bulldozer.',
  headerSummary: 'Active hermit crab that scavenges film algae and leftover food while constantly shopping for shells. Look for zebra-striped black-and-white legs and a shell carried like a mobile little bulldozer. Plan on at least 15+ gal.'
});
applyFields('flame-angel', {
  staffNote: 'High-appeal dwarf angel where the reef-safety conversation matters as much as the color.'
});
applyFields('diamond-goby', {
  staffNote: 'Easy fish to explain once buyers understand the sand-sifting behavior, jumping risk, and need for a mature bed.'
});
applyFields('decorator-crab', {
  facts: [
    'More of a behavior animal than a precision cleanup tool.',
    'Will pick up bits of shell, rubble, and soft material to camouflage itself.',
    'Should not be sold as a harmless set-and-forget crab in delicate nano reefs.'
  ]
});
applyFields('green-brittle-star', {
  role: 'Large dramatic brittle star better treated as a semi-predatory oddball than a harmless cleanup helper',
  headerSummary: 'Large dramatic brittle star better treated as a semi-predatory oddball than a harmless cleanup helper. Look for thick greenish arms with a larger central disk and a much heavier look than common serpent stars. Plan on at least 75+ gal.'
});
applyFields('mysid-shrimp-culture', {
  overview: 'Live mysid culture used to seed food webs or feed picky predators rather than serve as a display animal.'
});
applyFields('pods-starter-culture', {
  overview: 'Live microfauna culture used to seed biodiversity, strengthen refugia, and support pod-eating fish.'
});
applyFields('amphipods', {
  overview: 'Live microfauna add-on that strengthens biodiversity and supports pod-eating fish, especially in refugia and mature reefs.'
});

applyFields('canary-fang-blenny', {
  role: 'Bright fang blenny with bold open-water hovering behavior and a defensive venomous bite',
  overview: 'Canary Fang Blenny is an active saber-toothed blenny that spends more time hovering in the open than grazing rock like a typical combtooth blenny.',
  visualCue: 'Look for a bright yellow fang blenny with a long body, forked tail, and a habit of hovering just off the rockwork.',
  facts: [
    'Usually a confident but manageable community fish when given cover and sensible tankmates.',
    'Venomous fangs are defensive and do not make it a bully fish by default.',
    'Adapts well to prepared meaty foods and generally ships better than many specialty nano fish.'
  ],
  headerSummary: 'Bright fang blenny with bold open-water hovering behavior and a defensive venomous bite. Best in covered community reefs that suit a faster, bolder small fish.',
  behavior: 'More hover-and-dart than perch-and-graze, with a confident mid-level presence for such a small fish.',
  feedingNotes: 'Offer small meaty frozen foods, pellets, and other quality prepared fare several times daily.',
  buyingGuidance: 'A strong choice for buyers who want an active blenny without expecting algae-grazer behavior.',
  recognitionNotes: 'Look for a bright yellow, fork-tailed fang blenny that hovers in the water column instead of parking on rock all day.'
});
applyFields('smith-s-blenny', {
  role: 'Slender fang blenny with bold hovering behavior and a defensive venomous bite',
  overview: 'Smith\'s Blenny is an active fang blenny that spends more time hovering above the rockwork than grazing like a typical combtooth blenny.',
  visualCue: 'Look for a slim white-to-silver fang blenny with dark striping and a hovering, midwater posture.',
  facts: [
    'Usually peaceful enough for reef communities, but it still appreciates cover and personal space.',
    'Venomous fangs are a defense feature, not a reason to mix it with aggressive bullies.',
    'Usually adapts readily to small meaty prepared foods.'
  ],
  headerSummary: 'Slender fang blenny with bold hovering behavior and a defensive venomous bite. Best for reef keepers who want a small active fish rather than a grazer.',
  behavior: 'Often hovers just off the rockwork and darts back to cover instead of sitting on surfaces all day.',
  feedingNotes: 'Feed small meaty frozen foods and quality prepared fare in portions it can take quickly.',
  buyingGuidance: 'A good sale for buyers who want a small, active blenny but are not shopping for an algae-picker.',
  recognitionNotes: 'Look for a slim, contrasting fang blenny that hovers in the water column more than it perches.'
});
applyFields('striped-fang-blenny', {
  role: 'Striped fang blenny with fast open-water movement and a defensive venomous bite',
  overview: 'Striped Fang Blenny is a confident saber-toothed blenny that brings more motion and attitude than a typical perch-and-graze blenny.',
  visualCue: 'Look for a slim fang blenny with strong horizontal striping and a hovering, darting swim style.',
  facts: [
    'Usually workable in community reefs when the tank is covered and tankmates are chosen sensibly.',
    'The defensive bite is for protection and does not automatically make it a tank bully.',
    'A better fit for buyers wanting motion and character than for buyers expecting algae control.'
  ],
  headerSummary: 'Striped fang blenny with fast open-water movement and a defensive venomous bite. Best in covered reefs that fit a bolder small fish.',
  behavior: 'Spends much of the day hovering or dashing between cover rather than staying glued to one perch.',
  feedingNotes: 'Offer small meaty frozen foods and prepared fare that suits an active micro-predator.',
  buyingGuidance: 'Sell it for personality and movement, not as a substitute for an algae-grazing blenny.',
  recognitionNotes: 'Look for a slim, horizontally striped fang blenny that hovers in the water column.'
});

// Save back to per-category files.
saveChunks(chunks);

// Quick stats for the report.
const updatedAll = Object.values(chunks).flatMap(x => x.entries);
const gaps = updatedAll.filter(e => !e.scientific || ['Unknown', ''].includes(e.maxSize) || ['Unknown', ''].includes(e.minTank) || ['Unknown', ''].includes(e.diet));
console.log(JSON.stringify({
  totalEntries: updatedAll.length,
  remainingCoreGaps: gaps.length,
  sampleGaps: gaps.slice(0, 10).map(x => x.id)
}, null, 2));
