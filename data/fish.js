
// LTC Fish Browser — Catalog Loader (split by category)
window.LTC_SPECIES_CHUNKS = window.LTC_SPECIES_CHUNKS || {};
const FISH_ORDER = ["gem-tang", "blue-hippo-tang", "tomini-tang", "flame-angel", "green-mandarin", "diamond-goby", "blue-spot-jawfish", "ocellaris-clown", "pintail-fairy-wrasse", "royal-gramma", "lawnmower-blenny", "cleaner-shrimp", "yellow-tang", "coral-beauty", "six-line-wrasse", "foxface", "watchman-goby", "engineer-goby", "mccoskers-wrasse", "bangaii-cardinal", "fire-shrimp", "peppermint-shrimp", "powder-blue-tang", "kole-tang", "scopas-tang", "naso-tang", "emperor-angel", "lemonpeel-angel", "potters-angel", "melanurus-wrasse", "yellow-coris-wrasse", "mystery-wrasse", "carpenter-wrasse", "ruby-red-dragonet", "hectors-goby", "randalls-goby", "court-jester-goby", "maroon-clown", "clarkii-clown", "tomato-clown", "flame-hawkfish", "longnose-hawk", "midas-blenny", "bicolor-blenny", "spotted-mandarin", "tailspot-blenny", "purple-firefish", "red-firefish", "dottyback-orchid", "emerald-crab", "halloween-hermit", "tuxedo-urchin", "nassarius-snail", "trochus-snail", "turbo-snail", "scarlet-hermit", "purple-tang", "sailfin-tang", "convict-tang", "bicolor-angel", "leopard-wrasse", "possum-wrasse", "yasha-goby", "neon-goby", "percula-clown", "black-ocellaris", "green-chromis", "pajama-cardinal", "chalk-bass", "springeri-damsel", "valentini-puffer", "snowflake-eel", "lyretail-anthias", "copperband-butterfly", "coral-banded-shrimp", "sexy-shrimp", "blue-leg-hermit", "sand-sifting-star", "fighting-conch", "cerith-snail", "bubble-tip-anemone", "maxima-clam", "dwarf-lionfish", "achilles-tang", "atlantic-blue-tang", "blonde-naso-tang", "blue-eye-kole-tang", "chevron-tang", "chocolate-tang", "clown-tang", "dussumieri-tang", "goldrim-tang", "lavender-tang", "lieutenant-tang", "mimic-tang", "orange-shoulder-tang", "powder-brown-tang", "white-tail-bristletooth-tang", "african-flameback-angel", "asfur-angel", "bellus-angel", "blueface-angel", "cherub-angel", "eibli-dwarf-angel", "false-personifer-angel", "fisher-s-angel", "flagfin-angel", "french-angel", "goldflake-angel", "halfblack-angel", "keyhole-angel", "lamarck-s-angel", "majestic-angel", "midnight-angel", "multicolor-angel", "potter-s-angel", "queen-angel", "regal-angel", "rock-beauty-angel", "rusty-angel", "scribbled-angel", "swallowtail-angel", "venustus-angel", "watanabei-angel", "zebra-angel", "black-ice-clownfish", "black-photon-clownfish", "black-storm-clownfish", "cinnamon-clownfish", "clarkii-clownfish", "davinci-clownfish", "domino-clownfish", "frostbite-clownfish", "gladiator-clownfish", "gold-stripe-maroon-clownfish", "lightning-maroon-clownfish", "midnight-clownfish", "misbar-clownfish", "mocha-clownfish", "orange-skunk-clownfish", "percula-clownfish", "phantom-clownfish", "picasso-clownfish", "pink-skunk-clownfish", "platinum-clownfish", "saddleback-clownfish", "snowflake-clownfish", "snow-onyx-clownfish", "wyoming-white-clownfish", "azure-damselfish", "black-axil-chromis", "blue-sapphire-damsel", "blue-velvet-damsel", "domino-damsel", "fiji-blue-devil-damsel", "kupang-damsel", "rolland-s-damselfish", "starki-damsel", "talbot-s-damselfish", "three-stripe-damsel", "vanderbilt-chromis", "yellowtail-blue-damsel", "banana-wrasse", "bird-wrasse", "black-leopard-wrasse", "blue-flasher-wrasse", "bluestreak-cleaner-wrasse", "canary-wrasse", "christmas-wrasse", "dragon-wrasse", "eight-line-wrasse", "exquisite-fairy-wrasse", "filamented-flasher-wrasse", "flame-wrasse", "four-line-wrasse", "harlequin-tusk", "hoeven-s-wrasse", "hooded-fairy-wrasse", "lubbock-s-fairy-wrasse", "lunare-wrasse", "naoko-s-fairy-wrasse", "ornate-leopard-wrasse", "pink-streaked-wrasse", "radiant-wrasse", "red-coris-wrasse", "red-margin-fairy-wrasse", "rhomboid-wrasse", "ruby-head-fairy-wrasse", "scott-s-fairy-wrasse", "solar-fairy-wrasse", "tanaka-s-pygmy-wrasse", "timor-wrasse", "yellow-banded-possum-wrasse", "yellowfin-flasher-wrasse", "black-clown-goby", "blue-dot-jawfish", "catalina-goby", "citrinis-clown-goby", "diamond-watchman-goby", "dracula-goby", "flaming-prawn-goby", "green-clown-goby", "hi-fin-red-banded-goby", "orange-spotted-goby", "orange-stripe-prawn-goby", "pink-spotted-watchman-goby", "rainford-s-goby", "sleeper-banded-goby", "sleeper-gold-head-goby", "tiger-watchman-goby", "trimma-goby", "twin-spot-goby", "wheeler-s-shrimp-goby", "yellow-clown-goby", "yellow-line-goby", "yellowhead-jawfish", "canary-fang-blenny", "ember-blenny", "linear-blenny", "molly-miller-blenny", "smith-s-blenny", "starry-blenny", "striped-fang-blenny", "mandarin-dragonet", "red-scooter-dragonet", "scooter-blenny", "target-mandarin", "blackcap-basslet", "candy-basslet", "fridmani-dottyback", "indigo-dottyback", "neon-dottyback", "randall-s-assessor", "sankeyi-dottyback", "springeri-dottyback", "strawberry-dottyback", "sunrise-dottyback", "swissguard-basslet", "yellow-assessor", "bartlett-s-anthias", "bicolor-anthias", "bimaculatus-anthias", "carberryi-anthias", "dispar-anthias", "evansi-anthias", "ignitus-anthias", "lori-s-anthias", "purple-queen-anthias", "randall-s-anthias", "resplendent-anthias", "sunburst-anthias", "banggai-cardinal", "flame-cardinal", "orbic-cardinal", "red-spot-cardinal", "threadfin-cardinal", "yellow-stripe-cardinal", "arc-eye-hawkfish", "falco-hawkfish", "freckled-hawkfish", "pixy-hawkfish", "auriga-butterflyfish", "heniochus-butterfly", "klein-s-butterflyfish", "longnose-butterflyfish", "pearlscale-butterflyfish", "pyramid-butterflyfish", "raccoon-butterflyfish", "saddleback-butterflyfish", "teardrop-butterflyfish", "vagabond-butterflyfish", "blue-spotted-rabbitfish", "foxface-lo", "magnificent-foxface", "masked-rabbitfish", "one-spot-foxface", "scribbled-rabbitfish", "bluejaw-trigger", "bursa-trigger", "clown-trigger", "crosshatch-trigger", "niger-trigger", "picasso-trigger", "pinktail-trigger", "queen-trigger", "sargassum-trigger", "undulated-trigger", "blue-spot-puffer", "camel-cowfish", "dogface-puffer", "longhorn-cowfish", "porcupine-puffer", "saddle-valentini-puffer", "spiny-box-puffer", "stars-and-stripes-puffer", "yellow-boxfish", "antennata-lionfish", "cockatoo-waspfish", "fu-manchu-lionfish", "leaf-fish", "radiata-lionfish", "volitan-lionfish", "zebra-lionfish", "blue-ribbon-eel", "chainlink-eel", "dragon-moray", "golden-dwarf-moray", "jewel-moray", "tessalata-eel", "white-ribbon-eel", "zebra-moray", "aiptasia-eating-filefish", "comet", "marine-betta", "matted-filefish", "orange-spotted-filefish", "sargassum-angler", "tassled-filefish", "wartskin-angler", "cuban-hogfish", "miniatus-grouper", "panther-grouper", "porkfish", "anemone-shrimp", "banded-coral-shrimp", "blood-red-fire-shrimp", "bumblebee-shrimp", "camel-shrimp", "candy-cane-pistol-shrimp", "durban-dancing-shrimp", "gold-coral-banded-shrimp", "harlequin-shrimp", "pederson-cleaner-shrimp", "pistol-shrimp", "randall-s-pistol-shrimp", "skunk-cleaner-shrimp", "tiger-pistol-shrimp", "anemone-porcelain-crab", "arrow-crab", "decorator-crab", "electric-blue-hermit-crab", "electric-orange-hermit-crab", "mithrax-crab", "pom-pom-crab", "porcelain-crab", "red-mithrax-crab", "ruby-mithrax-crab", "sally-lightfoot-crab", "scarlet-reef-hermit-crab", "strawberry-crab", "thin-stripe-hermit-crab", "white-spot-hermit-crab", "zebra-hermit-crab", "astrea-snail", "bumblebee-snail", "dwarf-cerith-snail", "florida-cerith-snail", "money-cowrie", "nerite-snail", "queen-conch", "stomatella-snail", "strawberry-conch", "super-tongan-nassarius", "tectus-snail", "tiger-conch", "banded-serpent-star", "blue-linckia-starfish", "brittle-star", "chocolate-chip-starfish", "collector-urchin", "fromia-starfish", "green-brittle-star", "halloween-urchin", "long-spine-urchin", "orange-linckia-starfish", "pencil-urchin", "pin-cushion-urchin", "red-fromia-starfish", "red-linckia-starfish", "sand-sifting-sea-cucumber", "serpent-star", "short-spine-urchin", "tiger-tail-sea-cucumber", "coco-worm", "colorado-sunburst-anemone", "crocea-clam", "derasa-clam", "feather-duster-worm", "long-tentacle-anemone", "magnifica-anemone", "maxi-mini-carpet-anemone", "rainbow-bubble-tip-anemone", "rock-flower-anemone", "rose-bubble-tip-anemone", "sebae-anemone", "squamosa-clam", "tube-anemone", "amphipods", "berghia-nudibranch", "chaeto-refugium-pack", "copepods", "lettuce-nudibranch", "live-rock-cleanup-pack", "mysid-shrimp-culture", "pods-starter-culture", "refugium-microfauna-pack", "sea-hare", "desjardini-tang", "white-tail-tang", "french-angelfish", "queen-angelfish", "regal-angelfish", "japanese-swallowtail-angel", "keyhole-angelfish", "watanabei-angelfish", "cleaner-wrasse", "scott-fairy-wrasse", "flasher-wrasse-filamented", "halichoeres-wrasse", "two-spot-goby", "wheeler-goby", "orange-line-goby", "yellowtail-clownfish", "skunk-clownfish", "blue-reef-chromis", "threadfin-cardinalfish", "royal-dottyback", "mandarin-goby-target", "harlequin-tuskfish", "niger-triggerfish", "candy-cane-shrimp", "astraea-snail", "sand-dollar", "bartletts-anthias", "banggai-cardinalfish", "foxface-rabbitfish", "blue-damselfish", "yellowtail-damselfish", "orchid-dottyback", "coral-catshark", "blue-tuxedo-urchin", "flame-scallop", "lettuce-sea-slug", "randalls-assessor", "peppermint-angelfish", "clown-triggerfish", "bicinctus-clownfish", "green-bird-wrasse"];
const FISH_LOOKUP = Object.values(window.LTC_SPECIES_CHUNKS).flat().reduce((acc, item) => { acc[item.id] = item; return acc; }, {});
const FISH = FISH_ORDER.map(id => FISH_LOOKUP[id]).filter(Boolean);
function stripTemplateNoise(str){
  if(typeof str !== 'string') return str;
  return str
    .replace(/should read like a real[^.]*\./ig,'')
    .replace(/the kiosk[^.]*\./ig,'')
    .replace(/for in-?store reference only[^.]*\./ig,'')
    .replace(/no cart,? no checkout,? no ordering flow\.?/ig,'')
    .replace(/customers can learn something useful before they ask staff\.?/ig,'')
    .replace(/The catalog lists a minimum tank around\s*([^.]*)\./ig,'Expect a tank around $1 or larger long term.')
    .replace(/questions to answer before the sale/ig,'questions to answer before bringing one home')
    .replace(/before the sale/ig,'before bringing one home')
    .replace(/Best sold to buyers who/ig,'Best for aquarists who')
    .replace(/Best sold to buyers with/ig,'Best for aquarists with')
    .replace(/Best sold to buyers wanting/ig,'Best for aquarists wanting')
    .replace(/Best sold to buyers already/ig,'Best for aquarists already')
    .replace(/Best sold only when the buyer can realistically support at least/ig,'Best for aquarists who can realistically support at least')
    .replace(/This should be sold only to buyers who/ig,'This is best for aquarists who')
    .replace(/the buyer should be ready for/ig,'the aquarist should be ready for')
    .replace(/when the buyer wants/ig,'when the aquarist wants')
    .replace(/interactive puffer sale where/ig,'interactive puffer profile where')
    .replace(/The sale works best when/ig,'This species is a better fit when')
    .replace(/A strong beginner-to-intermediate sale when/ig,'A strong beginner-to-intermediate choice when')
    .replace(/A strong reef sale when/ig,'A strong reef choice when')
    .replace(/A strong show-fish sale for/ig,'A strong show-fish choice for')
    .replace(/A strong lionfish sale for/ig,'A strong lionfish choice for')
    .replace(/A reasonable eel sale for/ig,'A reasonable eel choice for')
    .replace(/A good sale for/ig,'A good fit for')
    .replace(/A better sale for/ig,'A better fit for')
    .replace(/Great personality sale/ig,'Great personality fit')
    .replace(/Usually an easy personality sale/ig,'Usually an easy personality fit')
    .replace(/This sale should start with/ig,'The conversation should start with')
    .replace(/This is a careful sale/ig,'This needs a careful approach')
    .replace(/This is an expert sale\./ig,'This is an expert-only species.')
    .replace(/Treat this exactly like an expert ribbon-eel sale\./ig,'Treat this exactly like an expert ribbon eel species.')
    .replace(/A strong specialty sale for/ig,'A strong specialty choice for')
    .replace(/A strong sale for/ig,'A strong choice for')
    .replace(/A solid hermit sale when/ig,'A solid hermit choice when')
    .replace(/juvenile-friendly predator sale/ig,'juvenile-friendly predator profile')
    .replace(/predator sale/ig,'predator profile')
    .replace(/The right sale here is less about novelty and more about/ig,'The right fit here is less about novelty and more about')
    .replace(/A classic expert-only sale\./ig,'A classic expert-only species.')
    .replace(/The real sale is/ig,'The right fit is')
    .replace(/The sale should be about/ig,'The conversation should be about')
    .replace(/Great sale for/ig,'Great fit for')
    .replace(/sales in the hobby/ig,'choices in the hobby')
    .replace(/star-type sales/ig,'star-type choices')
    .replace(/sales pitch/ig,'recommendation')
    .replace(/worm sale/ig,'worm choice')
    .replace(/anemone sales/ig,'anemone choices')
    .replace(/purpose-built sale/ig,'purpose-built specialist')
    .replace(/The honest sale is that/ig,'The honest point is that')
    .replace(/support-item sale/ig,'support-item choice')
    .replace(/tactical sale/ig,'tactical choice')
    .replace(/Match the sale to/ig,'Match the choice to')
    .replace(/Very saleable/ig,'Very appealing')
    .replace(/The right sale is/ig,'The right fit is')
    .replace(/the sale should stay honest about that/ig,'the recommendation should stay honest about that')
    .replace(/should only be sold into/ig,'belongs only in')
    .replace(/Best sold to advanced aquarists/ig,'Best for advanced aquarists')
    .replace(/best sold for peaceful/ig,'best for peaceful')
    .replace(/Best sold into mature systems/ig,'Best in mature systems')
    .replace(/should only be sold when/ig,'should only be chosen when')
    .replace(/It should only be sold to customers with/ig,'It belongs only in systems with')
    .replace(/mis-sold as tropical/ig,'mistaken for a tropical species')
    .replace(/This should be sold carefully\./ig,'This needs careful planning.')
    .replace(/This should be sold as/ig,'This is best approached as')
    .replace(/Best sold to advanced aquarists/ig,'Best for advanced aquarists')
    .replace(/It sells best when/ig,'It does best when')
    .replace(/good sale when/ig,'good fit when')
    .replace(/sale when the owner already keeps/ig,'good fit for owners who already keep')
    .replace(/buyers/ig,'aquarists')
    .replace(/buyer/ig,'aquarist')
    .replace(/\s+/g,' ')
    .trim();
}
function sanitizeFishProfile(item){
  ['headerSummary','summary','overview','overview_es','role','role_es','visualCue','habitat','origin','origin_es','staffNote','seasonal','behavior','behaviorNotes','feedingNotes','recognitionNotes','buyingGuidance','buyerGuidance'].forEach(key => {
    if(item[key]) item[key] = stripTemplateNoise(item[key]);
  });
  ['facts','bestWith','cautionWith','aliases'].forEach(key => {
    if(Array.isArray(item[key])) item[key] = item[key].map(stripTemplateNoise).filter(Boolean);
  });
  if(item.staffNote && /kiosk|placeholder|template/i.test(item.staffNote)) item.staffNote = '';
  if(item.headerSummary && item.headerSummary.length < 12) item.headerSummary = '';
  if(item.overview && item.overview.length < 12) item.overview = '';
  if(!item.water) item.water = {ph_low:null,ph_high:null,sal_low:null,sal_high:null,temp_low:null,temp_high:null};
  return item;
}
for(let i=0;i<FISH.length;i++) FISH[i] = sanitizeFishProfile(FISH[i]);
window.FISH = FISH;
(function(){
  const sales = {"gem-tang":699.99,"blue-hippo-tang":69.99,"flame-angel":89.99};
  FISH.forEach(f=>{ if(sales[f.id]){f.salePrice=sales[f.id];f.onSale=true;} });
})();
