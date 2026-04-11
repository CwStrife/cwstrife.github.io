import json, os, re
from collections import Counter

BASE = '/mnt/data/ltcbuild'
SPECIES_DIR = os.path.join(BASE, 'data', 'species')

CATEGORY_TEMPLATES = {
    'Anemones': {
        'behavior': lambda e: f"Mostly stays anchored once comfortable, but any anemone can shift if lighting, flow, or footing feels wrong. Give it a protected settling zone with room around it so normal expansion or a wandering episode does not turn into a coral-stinging chain reaction.",
        'feedingNotes': lambda e: f"Light quality and stability do most of the heavy lifting here. Occasional small meaty offerings can support recovery or growth, but overfeeding usually matters less than stable salinity, protected pumps, and a position the animal is actually willing to keep.",
        'buyingGuidance': lambda e: f"Best for aquarists with a mature reef, guarded pumps, and enough free space that movement will not immediately create a coral problem. The decision is less about color and more about whether the tank can handle a mobile stinging animal long term.",
        'recognitionNotes': lambda e: e.get('visualCue') or f"Use the tentacle shape, oral disc color, and preferred placement zone to separate it from other host and ornamental anemones."
    },
    'Clams': {
        'behavior': lambda e: f"This is more of a stationary light-driven display animal than a roaming invertebrate. A healthy specimen should open predictably, react to shadows, and hold a stable position once it finds footing.",
        'feedingNotes': lambda e: f"Strong light, stable alkalinity/calcium support, and clean but not nutrient-stripped water matter more than dumping in random foods. Smaller specimens can benefit from fine suspended foods, but poor placement and unstable chemistry usually cause more trouble than underfeeding.",
        'buyingGuidance': lambda e: f"Recommend only when the reef already has the light, chemistry, and predator compatibility for clams. Ask about angelfish, butterflyfish, pyramid snails, and whether the aquarist can actually keep calcium and alkalinity steady.",
        'recognitionNotes': lambda e: e.get('visualCue') or f"Mantle pattern, shell shape, and how far the mantle extends over the shell are the quickest clues."
    },
    'Crabs': {
        'behavior': lambda e: f"Expect a rockwork scavenger that spends the day picking through crevices and the underside of ledges rather than cruising the open water line. Most of the personality comes from constant picking, repositioning, and opportunistic feeding around the rockscape.",
        'feedingNotes': lambda e: f"Most reef crabs do well when leftover food, film algae, and occasional targeted meaty or algae-based offerings are available. Problems usually show up when a hungry crab runs out of natural work and starts testing corals, snails, or loose food competition.",
        'buyingGuidance': lambda e: f"Best treated as a utility animal with a real compatibility conversation, not as a decorative throw-in. The right choice depends on nuisance target, tank size, and whether the aquarist is comfortable with a crab that may become more opportunistic as it grows.",
        'recognitionNotes': lambda e: e.get('visualCue') or f"Body color, claw shape, and whether the crab is built more for algae scraping or general scavenging are the easiest visual tells."
    },
    'Shrimp': {
        'behavior': lambda e: f"Most of the appeal comes from visible behavior rather than speed: antennae always working, cleaning or scavenging passes, and a tendency to claim a cave, overhang, or host area. They are usually bold once established, but still depend on stable salinity and sensible tankmate choices.",
        'feedingNotes': lambda e: f"These shrimp usually thrive on a mix of leftover food, fine meaty offerings, and whatever they can pick from the rockwork. The biggest feeding issue is not variety so much as making sure aggressive fish do not turn every feeding into a starvation contest.",
        'buyingGuidance': lambda e: f"A strong pick when the aquarist wants visible reef activity and understands shrimp-predator compatibility. Ask about hawkfish, larger wrasses, puffers, and whether the system is stable enough that molting will not become a constant risk point.",
        'recognitionNotes': lambda e: e.get('visualCue') or f"Body striping, claw shape, and whether it spends more time cleaning, perching, or burrow-associated are the easiest field marks."
    },
    'Snails': {
        'behavior': lambda e: f"A steady maintenance grazer or scavenger rather than a showpiece. Most of the value is in what the snail does over time—working film algae, leftovers, or sand—rather than in fast dramatic movement.",
        'feedingNotes': lambda e: f"Snails do best when the tank actually has the food niche they are meant to work, whether that is film algae, detritus, or uneaten food. Overbuying them for a spotless tank usually creates starvation problems once the first cleanup burst is over.",
        'buyingGuidance': lambda e: f"Recommend based on task and stocking density, not just on shell appearance. The important question is whether the tank needs algae help, sandbed cleanup, or scavenging support, and whether the aquarist is matching numbers to available food.",
        'recognitionNotes': lambda e: e.get('visualCue') or f"Shell shape and whether it prefers rock, glass, or sand are the quickest ways to tell this cleanup crew role apart."
    },
    'Starfish': {
        'behavior': lambda e: f"Movement is usually slow and deliberate, with the animal spending much of its time working rock, glass, or sand rather than putting on a display. Most stars look calm until you notice how much ground they quietly cover over a day or two.",
        'feedingNotes': lambda e: f"Success depends on matching the species to the tank's natural food supply. Many starfish fail not because they are delicate in the first week, but because the system cannot keep feeding them once the obvious film or sand fauna is exhausted.",
        'buyingGuidance': lambda e: f"Only recommend after checking what the species actually eats and whether the aquarium can support that diet long term. Starfish can look hardy on day one and still decline later if the tank is too new, too small, or too clean.",
        'recognitionNotes': lambda e: e.get('visualCue') or f"Arm thickness, surface texture, and whether the star spends more time on rock or in sand help separate decorative species from the harder-working sand processors."
    },
    'Urchins': {
        'behavior': lambda e: f"Expect constant grazing and more pushing strength than the size suggests. Urchins turn rockwork, glass, and hard surfaces into their route map, and many of them will move loose frags or rubble if nothing is secured.",
        'feedingNotes': lambda e: f"Natural algae and biofilm should be the foundation, with seaweed or other herbivore support added once the tank looks too clean for the animal to graze comfortably. A very clean reef can be just as problematic as a dirty one if the grazer runs out of work.",
        'buyingGuidance': lambda e: f"Good for aquarists who want real algae pressure and understand the trade-off: great grazing, but not a hands-off decorative ornament. Ask whether the aquascape is secure and whether there is enough natural food to keep an urchin from slowly starving.",
        'recognitionNotes': lambda e: e.get('visualCue') or f"Spine length, body color, and whether it tends to carry rubble or move openly over rockwork are the quickest distinctions."
    },
    'Inverts': {
        'behavior': lambda e: f"This entry is best understood as a specialist utility invertebrate rather than a generic cleanup add-on. Behavior is usually centered on one task or niche—sand processing, microfauna support, pest control, or filter feeding—so the surrounding system matters more than flashy movement.",
        'feedingNotes': lambda e: f"Match the care routine to the actual role of the animal. Many specialty inverts struggle not because they refuse food, but because the aquarium lacks the mature substrate, suspended food, microfauna, or safe placement their niche depends on.",
        'buyingGuidance': lambda e: f"Recommend only when the aquarist is intentionally solving the right problem or building the right habitat. These are usually poor impulse additions and much better when matched to a mature, clearly defined job in the system.",
        'recognitionNotes': lambda e: e.get('visualCue') or f"The easiest way to identify the right fit is to focus on the body form and the ecological job it is meant to perform in the aquarium."
    },
}

RETAIL_REPLACEMENTS = [
    (re.compile(r'\bImpulse beginner purchases\b', re.I), 'New keepers who have not planned for the long-term care'),
    (re.compile(r'\bImpulse purchases\b', re.I), 'unplanned additions'),
    (re.compile(r'\bImpulse decorative purchases\b', re.I), 'purely decorative add-ons without a husbandry plan'),
    (re.compile(r'\bImpulse sales based on appearance alone\b', re.I), 'appearance-only choices without a compatibility check'),
    (re.compile(r'\bBulk purchases\b', re.I), 'large cleanup-crew groupings'),
    (re.compile(r'\bBulk cleanup crew purchases\b', re.I), 'oversized cleanup-crew orders'),
    (re.compile(r'\bSell in bulk\.?\b', re.I), 'These are usually stocked in groups matched to the tank size.'),
    (re.compile(r'\bCheap and readily available\.?\b', re.I), 'Commonly available and usually approachable in cost.'),
    (re.compile(r'\bA utility purchase more than a display purchase\b', re.I), 'More of a utility addition than a pure display animal'),
    (re.compile(r'\bdisplay purchase\b', re.I), 'display addition'),
    (re.compile(r'\bpurchase\b', re.I), 'choice'),
    (re.compile(r'\bsales note\b', re.I), 'staff note'),
    (re.compile(r'\bSell only to aquarists\b', re.I), 'Recommend only to aquarists'),
    (re.compile(r'\bSell the color honestly, but sell the temperament honestly too\.?', re.I), 'The color is easy to love, but temperament should be discussed just as clearly.'),
    (re.compile(r'\bSell the shrimp pairing\.?', re.I), 'Lead with the shrimp pairing and explain why it is so compelling to watch.'),
    (re.compile(r'\bBubble algae\? Sell them an Emerald Crab\. Simple\.?', re.I), 'When bubble algae is the main nuisance, this is one of the clearest first-line cleanup animals to discuss.'),
]


def extract_array(text):
    m = re.search(r'=\s*(\[[\s\S]*\])\s*;\s*$', text)
    if not m:
        raise ValueError('Could not parse JSON array')
    return json.loads(m.group(1))


def dump_file(category, arr, path):
    out = 'window.LTC_SPECIES_CHUNKS = window.LTC_SPECIES_CHUNKS || {};\n'
    out += f'window.LTC_SPECIES_CHUNKS[{json.dumps(category)}] = '
    out += json.dumps(arr, ensure_ascii=False, indent=2)
    out += ';\n'
    with open(path, 'w', encoding='utf-8') as f:
        f.write(out)


def first_words(text, n=16):
    return ' '.join((text or '').split()[:n])


def num_from_size(s):
    if not s:
        return None
    m = re.search(r'(\d+(?:\.\d+)?)', str(s))
    return float(m.group(1)) if m else None


def tank_num(s):
    if not s:
        return None
    m = re.search(r'(\d+)', str(s))
    return int(m.group(1)) if m else None


def clean_text(val):
    if isinstance(val, str):
        val = val.replace('aquarist who', 'aquarist who').replace('aquarists who', 'aquarists who')
        val = val.replace(' aquarist ', ' aquarist ').replace(' aquarists ', ' aquarists ')
        val = val.replace('  ', ' ').strip()
        val = re.sub(r'\baquarists\b', 'aquarists', val)
        val = re.sub(r'\baquarist\b', 'aquarist', val)
        for rx, repl in RETAIL_REPLACEMENTS:
            val = rx.sub(repl, val)
        val = val.replace('A utility addition more than a display addition', 'More of a utility addition than a pure display animal')
        val = val.replace('The pairing is the ultimate aquarist experience.', 'The pairing is one of the most memorable symbiotic behaviors most reef keepers ever get to watch.')
        return val
    if isinstance(val, list):
        return [clean_text(x) for x in val]
    return val


def tang_behavior(e):
    genus = (e.get('scientific') or '').split(' ')[0]
    tank = e.get('minTank','')
    if genus == 'Zebrasoma':
        return f"Active daytime browser that makes repeated laps through rockwork and open water, then turns sharply back to favored grazing lanes. Expect more territorial pushback toward similar body-shaped tangs once it feels established, especially if the swimming room is only around the minimum {tank}."
    if genus == 'Ctenochaetus':
        return f"Busy bristletooth grazer that spends the day combing film algae and detritus from rock, glass, and hard surfaces rather than simply cruising laps. It is usually one of the more methodical tangs, but it still wants open room and can defend its lane in tighter setups around the minimum {tank}."
    if genus == 'Naso':
        return f"Open-water cruiser built for long uninterrupted passes rather than tight rockwork browsing. Juveniles often look easy to place, but adults become large, powerful swimmers that read much better in genuinely roomy systems than in tanks hovering near the minimum {tank}."
    if genus == 'Paracanthurus':
        return f"Fast-moving open-water tang that may hide more than expected at first, then becomes a constant visible swimmer once it settles. It uses the full tank length, startles easily during acclimation, and benefits from strong flow and unobstructed cruising space beyond the minimum {tank}."
    if genus == 'Acanthurus':
        return f"High-energy surgeonfish with more speed and edge than the gentler browsing tangs. Once comfortable it becomes a very visible swimmer, but it also demands strong oxygenation, open length, and careful tang mixing because many Acanthurus species become assertive in tanks near the minimum {tank}."
    return f"Active cruising grazer that works both rockwork and open water throughout the day. Even the calmer tang profiles still need real swimming length, a mature graze-oriented routine, and room beyond the minimum {tank} to look settled long term."


def tang_feeding(e):
    genus = (e.get('scientific') or '').split(' ')[0]
    if genus == 'Ctenochaetus':
        return "Build the routine around constant access to plant matter and biofilm support: seaweed sheets, herbivore pellets, and a tank mature enough to keep film algae available between feedings. Bristletooth tangs usually look best when they can keep picking all day instead of waiting for one dramatic feeding."
    if genus == 'Paracanthurus':
        return "Offer a varied herbivore-leaning omnivore routine with daily algae, quality pellets, and rotating frozen foods. These fish often settle faster and hold weight better when feedings are consistent and not limited to occasional seaweed clips."
    if genus == 'Naso':
        return "Large tangs need a generous herbivore routine, not occasional token seaweed. Daily macroalgae or nori, a solid herbivore pellet, and enough overall food volume to support a powerful swimmer matter much more than flashy treat feeding."
    if genus == 'Acanthurus':
        return "Keep algae support constant and use prepared foods with enough variety to maintain condition during acclimation. Many Acanthurus tangs are less forgiving when fed inconsistently, so steady seaweed access plus a dependable herbivore staple is the safer path."
    return "Base the routine around algae-rich feeding: daily seaweed or algae sheets plus a quality herbivore staple and occasional frozen support. Tangs usually look and act better when plant matter is available consistently instead of as an occasional treat."


def tang_buying(e):
    genus = (e.get('scientific') or '').split(' ')[0]
    tank = e.get('minTank','')
    if genus == 'Zebrasoma':
        return f"Best for aquarists who can provide real side-to-side swimming length, mature algae support, and a stocking plan that respects tang-on-tang shape aggression. The decision should center on territory and long-term space, not just on how striking the fish looks in a sales tank; {tank} is the floor, not the luxury tier."
    if genus == 'Ctenochaetus':
        return f"A very good tang choice when the aquarist wants active algae help without jumping straight to the largest surgeonfish, but it still deserves a mature system and real swimming room. Focus the conversation on film-grazing behavior, constant feeding support, and whether {tank} truly reflects the long-term plan instead of the temporary setup."
    if genus == 'Naso':
        return f"This is a long-term big-tank commitment, not a small-juvenile loophole. The right home is the aquarist already planning around adult swimming length, open water, and larger-system husbandry, because a listed minimum like {tank} is only meaningful when the overall layout is truly spacious."
    if genus == 'Paracanthurus':
        return f"A strong display choice when the aquarist understands that the cute juvenile grows into a fast, nervous, open-water swimmer. Emphasize long-term swimming room, acclimation stress, and steady feeding rather than nostalgia or name recognition; {tank} should be treated as a starting point, not a target to crowd."
    if genus == 'Acanthurus':
        return f"Recommend when the aquarist already has strong flow, oxygenation, and the confidence to manage a more assertive surgeonfish. These species reward roomy mature systems, but they are rarely the best tang for a lightly planned tank that only just meets the stated {tank} minimum."
    return f"Best for aquarists who already have the swimming length, algae support, and tank maturity a tang needs long term. Discuss adult size, stocking order, and long-term room before treating it as a color-driven choice."


def wrasse_subtype(e):
    name = (e.get('name') or '').lower()
    sci = (e.get('scientific') or '').lower()
    if 'cleaner wrasse' in name or 'labroides' in sci:
        return 'cleaner'
    if 'leopard' in name or 'macropharyngodon' in sci:
        return 'leopard'
    if 'flasher' in name or 'paracheilinus' in sci:
        return 'flasher'
    if 'fairy' in name or 'cirrhilabrus' in sci:
        return 'fairy'
    if 'possum' in name or 'wetmorella' in sci:
        return 'possum'
    if 'six-line' in name or 'mystery' in name or 'eight-line' in name or 'four-line' in name or 'pseudocheilinus' in sci:
        return 'lined'
    if 'red coris' in name or 'coris' in sci or 'dragon wrasse' in name or 'novaculichthys' in sci or 'lunare' in name or 'banana wrasse' in name or 'bird wrasse' in name or 'gomphosus' in sci:
        return 'large-active'
    if 'anampses' in sci or 'tamarin' in name:
        return 'tamarin'
    if 'halichoeres' in sci or 'yellow coris' in name or 'melanurus' in name or 'radiant' in name or 'canary wrasse' in name or 'christmas wrasse' in name:
        return 'halichoeres'
    return 'reef-general'


def wrasse_behavior(e):
    st = wrasse_subtype(e); tank=e.get('minTank','')
    if st == 'flasher':
        return f"Open-water display wrasse that spends much of the day flashing through the upper half of the reef and reacting to movement around it. These fish are beautiful because they stay in view, but that same energy makes a secure lid mandatory and makes {tank} feel much better when the tank also has true horizontal swimming room."
    if st == 'fairy':
        return f"Constantly visible midwater wrasse that patrols above the rockwork and then darts back to cover when startled. Fairy wrasses are usually at their best in peaceful covered reefs where they can stay out front instead of being pinned into hiding by rougher tankmates."
    if st == 'leopard':
        return f"More deliberate and ground-oriented than the fairy and flasher types, with frequent hunting passes over rock, rubble, and sand. Leopard wrasses rely on a real sand bed for sleeping and stress relief, so a mature covered reef with soft substrate matters as much as the listed {tank} minimum."
    if st == 'halichoeres':
        return f"Active daytime hunter that works rock, sand, and crevices looking for small prey, then dives into sand to sleep or hide when the lights drop. A secure cover and a usable sand bed are part of the basic setup, not optional extras."
    if st == 'tamarin':
        return f"Elegant but more delicate wrasse that alternates between graceful open-water movement and close inspection of rock and sand. Tamarin wrasses depend on a calm mature environment and soft substrate to settle, so acclimation patience matters more here than with the hardier everyday wrasses."
    if st == 'possum':
        return f"Tiny rockwork-hovering wrasse that favors careful creeping movement through caves, ledges, and branching structure over dramatic open-water laps. It is easy to miss in a rough community, but wonderfully detailed in a calm tank where it feels safe enough to stay visible."
    if st == 'lined':
        return f"Quick, sharp-moving rockwork wrasse with more attitude packed into a small body than many aquarists expect. It spends the day threading through crevices and inspection routes, and once established it can become quite confident about its own patch of rockwork."
    if st == 'large-active':
        return f"Fast, visible wrasse profile with more size, speed, and habitat impact than the smaller reef-safe display species. Many of these wrasses use sand for sleeping or stress relief, stay in constant motion, and eventually demand a roomier tank with a well-secured aquascape."
    if st == 'cleaner':
        return f"Behavior is built around interaction with other fish rather than nonstop grazing or cruising. Cleaner wrasses can be fascinating to watch, but that same specialization is exactly why they need a thoughtful, species-specific husbandry conversation before being treated like an ordinary community wrasse."
    return f"These wrasses are built for constant movement and color display in open water above the rockwork. A covered reef with sensible tankmates usually makes the difference between a wrasse that stays visible and one that spends the day launching into the lid or hiding."


def wrasse_feeding(e):
    st = wrasse_subtype(e)
    if st in {'flasher','fairy'}:
        return "Use a protein-forward omnivore routine with quality small pellets and rotating frozen foods. These active display wrasses hold condition better when fed consistently, and flasher types in particular usually look best with smaller feedings spread through the day rather than one big evening meal."
    if st in {'leopard','tamarin'}:
        return "Prepared foods matter, but mature live hunting opportunities matter too. These wrasses settle far better when the tank provides pods and small natural prey between feedings, with frozen and pellet foods layered in only after the fish is clearly eating confidently."
    if st == 'halichoeres':
        return "A mixed meaty routine usually works well here: quality small pellets, mysis, brine, and other appropriately sized frozen foods. These wrasses are opportunistic hunters, so steady feeding plus natural foraging room around rock and sand keeps them looking fuller and more relaxed."
    if st == 'lined':
        return "Offer small meaty foods on a dependable routine and make sure timid tankmates still get access. These wrasses adapt well to prepared foods, but they can quickly outcompete slower fish if feeding strategy is left to chance."
    if st == 'large-active':
        return "Feed enough to support a genuinely active carnivorous hunter, not just enough to trigger a single flashy strike. Meaty frozen foods, quality pellets, and a consistent routine are more important than novelty feeding, especially as the larger species mature."
    if st == 'cleaner':
        return "Specialized feeding response is the whole conversation here. Confirm the individual is eating prepared foods convincingly before treating it as a normal community fish, because many cleaner wrasses fail when the tank cannot support their natural grazing role."
    return "Use a protein-forward omnivore routine with quality small pellets and rotating frozen foods. Many wrasses are enthusiastic feeders, but their best color and activity usually come from consistency more than from oversized single feedings."


def wrasse_buying(e):
    st = wrasse_subtype(e); tank=e.get('minTank','')
    if st in {'flasher','fairy'}:
        return f"A strong choice when the aquarist wants visible motion and color in a covered peaceful reef. The key questions are lid security, tankmate pressure, and whether {tank} is being treated as a genuine long-term home instead of a temporary stop for a fish that will spend all day using the upper water column."
    if st in {'leopard','tamarin'}:
        return f"These are not just prettier versions of ordinary wrasses. Recommend them when the reef is mature, pod support is believable, and the aquarist already has the soft sand and patience needed for a wrasse that may bury itself and hide during acclimation."
    if st == 'halichoeres':
        return f"Excellent when the aquarist wants an active pest-picking wrasse and already has both a lid and a usable sand bed. The right match is the keeper who values daily movement and utility, not someone trying to force a sand-sleeping wrasse into a bare-bottom compromise."
    if st == 'lined':
        return f"Very appealing for personality and hunting behavior, but the small size fools people. Discuss temperament, pod pressure on the tank, and whether the aquarist is comfortable with a wrasse that can become bossy in tight rockwork despite the modest {tank} listing."
    if st == 'large-active':
        return f"Recommend after checking adult size, invertebrate plans, and whether the system is really built for a larger, faster, often rougher wrasse profile. These fish are easy to admire as juveniles and much harder to house well once the full adult behavior shows up."
    if st == 'cleaner':
        return "This is a specialized choice, not a default wrasse recommendation. Prepared-food success and long-term feeding realism should drive the decision far more than the novelty of watching cleaning behavior in the first week."
    if st == 'possum':
        return "A great fit for calm reef keepers who want a subtle, detail-rich wrasse instead of a speedster. The ideal home is peaceful and cover-heavy, because the fish is easy to lose visually when tankmates are too boisterous."
    return "Great display fish for movement and color, but the aquarist should be ready for an active swimmer and a covered tank. The lid matters as much as the fish: many wrasses read as easy until the first surprise jump."


def goby_subtype(e):
    name=(e.get('name') or '').lower(); sci=(e.get('scientific') or '').lower(); role=(e.get('role') or '').lower(); habitat=(e.get('habitat') or '').lower()
    if 'jawfish' in name or 'opistognathus' in sci:
        return 'jawfish'
    if 'mandarin' in name or 'dragonet' in name or 'synchiropus' in sci:
        return 'dragonet'
    if 'watchman' in name or 'prawn goby' in name or 'shrimp goby' in name or 'cryptocentrus' in sci or 'mblyeleotris' in sci or 'stonogobiops' in sci:
        return 'shrimp-goby'
    if 'diamond goby' in name or 'sleeper' in name or 'valenciennea' in sci or 'sand-sifting' in role:
        return 'sand-sifter'
    if 'clown goby' in name:
        return 'clown-goby'
    if 'blenny' in name and ('fang' in name or 'meiacanthus' in sci):
        return 'fang-blenny'
    if 'lawnmower' in name or 'starry' in name or 'salarias' in sci:
        return 'grazer-blenny'
    if 'midas' in name:
        return 'midas'
    if 'engineer goby' in name or 'pholidichthys' in sci:
        return 'engineer'
    if 'hector' in name or 'court jester' in name or 'rainford' in name:
        return 'micrograzer-goby'
    if 'trimma' in sci or 'neon goby' in name or 'firefish' in name:
        return 'small-hover'
    return 'bottom-general'


def goby_behavior(e):
    st=goby_subtype(e)
    if st=='dragonet':
        return "Low-slung, deliberate hunter that glides over rock, rubble, and sand while pecking at tiny prey almost nonstop. The beauty is obvious, but the real husbandry story is how constantly it forages and how poorly it competes against faster, rougher feeders."
    if st=='jawfish':
        return "Burrow-centered fish that spends the day peeking, hovering, and rebuilding around a chosen entrance instead of patrolling the full tank. Jawfish are at their most engaging when the substrate is deep enough to support natural burrow behavior and the lid is secure enough to survive startle jumps."
    if st=='shrimp-goby':
        return "Perching burrow fish that relies on the bottom third of the tank rather than open-water speed. Many of the best shrimp gobies look half-relaxed and half-alert all day, stationed at the burrow entrance and ready to back into cover the moment something feels wrong."
    if st=='sand-sifter':
        return "Constant sand worker that lifts mouthfuls of substrate, filters for edible material, and redeposits the rest elsewhere. It gives a tank obvious movement and utility, but it also throws sand, needs real substrate area, and usually stays busiest where the bed is mature enough to support it."
    if st=='clown-goby':
        return "Tiny perch-and-peek goby that spends much of the day settled onto branches, polyps, or small high points rather than cruising the tank. The charm comes from close-up behavior and color contrast, not from covering a lot of water."
    if st=='fang-blenny':
        return "Confident perch-and-dart blenny with more swagger than the size suggests. It usually claims a lookout point, makes quick feeding runs, and then returns to survey the tank with a very different energy than the algae-grazing blenny types."
    if st=='grazer-blenny':
        return "Perching grazer that hops from rock to rock, pausing often to watch the room before taking another bite of film algae or biofilm. Much of the personality comes from the face, posture, and the way it treats the reef like a personal network of lookout posts."
    if st=='midas':
        return "More midwater and eel-like in movement than most blennies, often hovering in the water column and darting into a chosen hole when startled. It brings far more visible motion than the average perch-oriented blenny."
    if st=='engineer':
        return "Tunnel-building fish that changes the tank physically as much as visually, with constant excavation and dramatic growth from juvenile to adult form. The behavior is fascinating, but it needs rockwork that is genuinely secured against long-term undermining."
    if st=='micrograzer-goby':
        return "Small, methodical grazer that spends more time inspecting sand and lower rock surfaces than chasing food in open water. These fish reward calm observation and mature surfaces more than flashy feeding response."
    if st=='small-hover':
        return "Small peaceful fish that hovers near a chosen cave, ledge, or bolt-hole and relies on quick retreats instead of aggression. The best displays happen in calmer tanks where the fish feels safe enough to stay out."
    return "This fish usually stays close to the bottom and depends on cover, burrows, or small retreats rather than nonstop open-water cruising. The personality comes from territory, perching, and day-to-day behavior around the rock and sand line."


def goby_feeding(e):
    st=goby_subtype(e)
    if st=='dragonet':
        return "Feeding success is the whole purchase conversation here. Mature pod production or a clearly demonstrated prepared-food response matters more than any other sales-floor feature, because these fish spend the day hunting tiny prey rather than rushing to the surface for one large meal."
    if st in {'shrimp-goby','jawfish','small-hover'}:
        return "Offer small meaty foods and make sure the fish can eat without being bullied away from the bottom half of the tank. These fish usually settle best when food reaches their territory reliably instead of forcing them to sprint into open-water feeding chaos."
    if st=='sand-sifter':
        return "A mature sand bed should be treated as part of the feeding plan, not just as décor. Supplement with meaty prepared foods, but remember that true sand sifters lose condition quickly when the substrate is too new or too sterile to contribute anything between feedings."
    if st in {'clown-goby','micrograzer-goby'}:
        return "Use fine frozen foods, small pellets, and frequent gentle feedings that do not get dominated by larger fish. Tiny gobies often look hardy until you realize they are being outcompeted every single day."
    if st in {'fang-blenny','grazer-blenny','midas'}:
        return "Match the routine to the blenny type: algae and biofilm support for the true grazers, protein-forward offerings for the more darting carnivorous species, and enough distribution that a perched fish can feed without every bite being stolen midwater."
    if st=='engineer':
        return "Feed as a growing carnivore with a real appetite, not as a cute juvenile oddball. Meaty prepared and frozen foods usually work well, but long-term success also depends on giving the fish enough room and structure to behave naturally while it grows."
    return "Food should reach the sand zone or chosen perch reliably so the fish is not forced to compete in the open water every time. Small meaty foods and a calm feeding rhythm usually do more good than simply adding variety for its own sake."


def goby_buying(e):
    st=goby_subtype(e); tank=e.get('minTank','')
    if st=='dragonet':
        return "This needs careful planning. Mature pod support or proven prepared-food response matters more than how beautiful the fish looks under blue lights, and the safest recommendation is still the aquarist who already understands pod density, competition pressure, and patient feeding support."
    if st=='jawfish':
        return f"Recommend when the aquarist has real substrate depth, rubble, a secure lid, and the right temperature range for the species. Jawfish win people over immediately, but the long-term home has to support the burrow first and the looks second."
    if st=='shrimp-goby':
        return "A strong fit for reef keepers who value behavior and bottom-zone personality over sheer speed. The best conversation is about substrate, lids, and whether the customer wants to support the shrimp partnership properly instead of just buying the goby for color alone."
    if st=='sand-sifter':
        return f"Best when the tank genuinely has both the sand area and the maturity to feed a true sifting fish. The important question is not whether {tank} is written on paper, but whether there is enough established substrate for the fish to work without slowly thinning out."
    if st=='clown-goby':
        return "Excellent for smaller peaceful reefs when the aquarist enjoys close-up behavior and understands how tiny the fish really is. The right buyer is looking for texture and personality in the branches, not for a fish that will dominate the whole tank visually."
    if st in {'fang-blenny','grazer-blenny','midas'}:
        return "Great when the aquarist wants personality from a fish that uses rockwork differently than a goby. The key is matching the blenny's actual feeding style and attitude to the tank, because not every blenny is the same kind of peaceful algae picker."
    if st=='engineer':
        return "This is a long-term layout decision as much as a fish choice. Recommend it to aquarists who like excavation behavior and already understand that the cute juvenile becomes a much larger, more disruptive tunnel-builder over time."
    if st=='micrograzer-goby':
        return "Best in mature calm reefs where the fish can browse naturally and avoid food competition. These are easy to underappreciate in a sterile or overly aggressive system and very rewarding in a settled reef with real micro-life."
    return "A strong reef choice when the aquarist has a lid and wants personality near the sand or rockwork without stepping into a full predator profile. Cover, bottom habitat, and feeding access usually matter more than headline size."


def generic_recognition(e):
    cue = e.get('visualCue')
    if cue:
        return cue[0].upper() + cue[1:] if cue else cue
    sci = e.get('scientific','')
    return f"Use overall body shape, color pattern, and the way {e.get('name','this animal')} uses rockwork, sand, or open water to separate it from similar-looking entries."


def fill_category_templates(entry):
    cat = entry.get('category')
    tmpl = CATEGORY_TEMPLATES.get(cat)
    if tmpl:
        for field, fn in tmpl.items():
            if not entry.get(field):
                entry[field] = fn(entry)


def apply_specializations(entry):
    cat = entry.get('category')
    if cat == 'Tangs':
        entry['behavior'] = tang_behavior(entry)
        entry['feedingNotes'] = tang_feeding(entry)
        entry['buyingGuidance'] = tang_buying(entry)
        entry['recognitionNotes'] = generic_recognition(entry)
    elif cat == 'Wrasses':
        entry['behavior'] = wrasse_behavior(entry)
        entry['feedingNotes'] = wrasse_feeding(entry)
        entry['buyingGuidance'] = wrasse_buying(entry)
        entry['recognitionNotes'] = generic_recognition(entry)
    elif cat == 'Gobies & Blennies':
        if not entry.get('behavior') or not entry.get('feedingNotes') or not entry.get('buyingGuidance') or goby_subtype(entry) in {'dragonet','jawfish','shrimp-goby','sand-sifter','clown-goby','fang-blenny','grazer-blenny','midas','engineer','micrograzer-goby','small-hover'}:
            entry['behavior'] = goby_behavior(entry)
            entry['feedingNotes'] = goby_feeding(entry)
            entry['buyingGuidance'] = goby_buying(entry)
            entry['recognitionNotes'] = generic_recognition(entry)
    else:
        fill_category_templates(entry)
        if not entry.get('recognitionNotes'):
            entry['recognitionNotes'] = generic_recognition(entry)


def global_clean(entry):
    for k, v in list(entry.items()):
        entry[k] = clean_text(v)
    if entry.get('staffNote'):
        entry['staffNote'] = clean_text(entry['staffNote'])
    facts = entry.get('facts') or []
    # light cleanup for generic or retail style facts
    cleaned=[]
    for fact in facts:
        fact = clean_text(fact)
        fact = fact.replace('Gets much larger than most aquarists expect from the juvenile they choice.', 'Gets much larger than most aquarists expect from the juvenile they first bring home.')
        cleaned.append(fact)
    entry['facts']=cleaned
    if entry.get('overview'):
        entry['overview']=entry['overview'].replace('The pairing is the ultimate aquarist experience.', 'The pairing is one of the most memorable behaviors most reef keepers get to watch.')
        entry['overview']=entry['overview'].replace('aquarists love the dynamic.', 'Most reef keepers love the dynamic once they see it in person.')
        entry['overview']=entry['overview'].replace('A utility purchase more than a display purchase', 'More of a utility addition than a pure display animal')
    return entry

files = sorted([f for f in os.listdir(SPECIES_DIR) if f.endswith('.js')])
stats = Counter()
for file in files:
    path = os.path.join(SPECIES_DIR, file)
    raw = open(path, encoding='utf-8').read()
    m = re.search(r'window\.LTC_SPECIES_CHUNKS\[(.+?)\]\s*=\s*', raw)
    cat = json.loads(m.group(1)) if m else os.path.splitext(file)[0]
    arr = extract_array(raw)
    for e in arr:
        before = {f: bool(e.get(f)) for f in ['behavior','feedingNotes','buyingGuidance','recognitionNotes']}
        global_clean(e)
        apply_specializations(e)
        global_clean(e)
        after = {f: bool(e.get(f)) for f in ['behavior','feedingNotes','buyingGuidance','recognitionNotes']}
        for f in before:
            if after[f] and not before[f]:
                stats[f'filled_{f}'] += 1
    dump_file(cat, arr, path)

# update version
app_path = os.path.join(BASE, 'js', 'app.js')
app = open(app_path, encoding='utf-8').read()
app = re.sub(r"const APP_VERSION = '([0-9.]+)';", "const APP_VERSION = '0.092';", app)
open(app_path, 'w', encoding='utf-8').write(app)

print(stats)
