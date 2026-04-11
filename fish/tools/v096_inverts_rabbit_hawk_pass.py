from pathlib import Path
import json,re,zipfile,shutil
ROOT=Path('/mnt/data/v096_work')
SPEC=ROOT/'data'/'species'

def load_js_array(path: Path):
    txt=path.read_text(encoding='utf-8')
    m=re.search(r'(window\.LTC_SPECIES_CHUNKS\[[^\n]+?\]\s*=\s*)(\[.*\])(\s*;\s*)$', txt, re.S)
    if not m:
        raise ValueError(f'Could not parse {path}')
    prefix, arr, suffix = m.groups()
    data = json.loads(arr)
    return txt, prefix, data, suffix

def write_js_array(path: Path, prefix: str, data, suffix: str=';\n'):
    path.write_text(prefix + json.dumps(data, indent=2, ensure_ascii=False) + suffix, encoding='utf-8')

def update_fields(item, **kwargs):
    for k,v in kwargs.items():
        item[k]=v
    return item

# ---------- Rabbitfish ----------
path=SPEC/'rabbitfish.js'
_,prefix,data,suffix=load_js_array(path)
for item in data:
    i=item['id']
    if i in {'foxface','foxface-lo','foxface-rabbitfish'}:
        update_fields(item,
            overview='A dependable rabbitfish for larger reef systems that mixes real algae utility with a calm, display-friendly presence. The main catches are venomous spines, adult size, and the need to keep it well fed if corals are in the system.',
            facts=[
                'Excellent browser on film algae, softer nuisance growth, and leftover vegetable foods.',
                'Usually peaceful with other community fish, but often quarrels with other rabbitfish or close look-alikes.',
                'Can darken or blotch dramatically when stressed or sleeping; that color shift is normal.'
            ],
            bestWith=['Larger mixed reefs with established rockwork and open swimming room','Community fish too large to treat it as prey','Aquarists who want algae help but still want a showy centerpiece herbivore'],
            cautionWith=['Other rabbitfish unless the system is very large','Tiny tanks that turn a calm grazer into a pacing fish','Underfed reef tanks where soft corals or fleshy LPS may get sampled'],
            headerSummary='Classic foxface rabbitfish with real algae utility, calm manners, and venomous spines that deserve respect. Best in larger systems where it can graze, cruise, and stay well fed.',
            behavior='Usually spends the day making deliberate grazing passes across rock, glass, and open surfaces instead of acting like a frantic speed swimmer. It is often one of the easier large herbivores to fit into a community, but it still needs open room and usually dislikes other rabbitfish.',
            feedingNotes='Keep seaweed sheets, herbivore pellets, and varied frozen foods in rotation so it is not relying only on whatever algae the tank happens to provide. Well-fed rabbitfish are typically better behaved around corals than underfed ones.',
            buyingGuidance='A strong recommendation for larger reef keepers who want a hardy algae grazer with more personality than a snail crew can offer. The important conversation is about adult size, safe handling because of the spines, and the possibility of coral nipping if feeding support is weak.',
            recognitionNotes='Look for the foxlike face pattern, bold yellow rear body, dark chest patch, and long tapering snout typical of the classic foxface forms.',
            visualCue='Foxlike face pattern with bright yellow body sections, a dark chest patch, and a long tapering snout.'
        )
    elif i=='one-spot-foxface':
        update_fields(item,
            overview='A smaller foxface-type rabbitfish that still brings algae-grazing value and venomous-spine caution, but fits more tanks than the biggest rabbitfish. It is often chosen when someone wants foxface behavior without moving all the way into huge-tank territory.',
            facts=['Often viewed as the most practical foxface for many home reefs because it stays more manageable than the largest rabbitfish.','Peaceful in most communities but still best kept away from other rabbitfish in modest systems.','Can sample soft corals or fleshy polyps if the tank is lean and it is not getting enough vegetable food.'],
            headerSummary='More manageable foxface-style rabbitfish with proven algae utility, calm behavior, and venomous spines. Still needs real room and regular herbivore feeding support.',
            behavior='Calm grazer that alternates between browsing rockwork and taking easy laps through the display. It usually settles well into semi-aggressive communities, but it still has the rabbitfish habit of becoming defensive toward similar-shaped grazers.',
            feedingNotes='Offer seaweed, herbivore formulas, and varied frozen foods instead of expecting the tank to feed it forever. Strong feeding support is especially important in reef tanks where coral sampling would be a problem.',
            buyingGuidance='Often the better foxface recommendation when the aquarist wants rabbitfish utility but does not have room for the biggest species. The sale should still include spine safety, long-term size, and coral-nipping caution if the fish is underfed.',
            recognitionNotes='Usually identified by the classic foxface mask with a distinct dark ocellus on the rear body near the dorsal area.',
            visualCue='Classic foxface mask pattern with a distinct single dark spot on the rear body.'
        )
    elif i=='magnificent-foxface':
        update_fields(item,
            overview='A larger, more dramatic rabbitfish that behaves like a roaming herbivore showpiece rather than just a utility grazer. It is impressive in big reefs, but it needs space, strong feeding support, and careful handling because of the spines.',
            facts=['Gets large enough that the display must be planned around it, not just around the juvenile size in a store.','Powerful herbivorous browsing makes it useful, but not a substitute for proper nutrient control.','Venomous dorsal and anal spines mean nets and containers should be handled deliberately.'],
            headerSummary='Large showpiece rabbitfish with heavy algae-grazing value and venomous spines. Best for aquarists already planning around a true adult-sized herbivore.',
            behavior='More of a visible open-water cruiser than the smaller rabbitfish, often making broad passes through the tank before returning to browse. In the wrong size tank it quickly stops feeling calm and starts feeling crowded.',
            feedingNotes='Treat it like a serious herbivore: nori, herbivore pellets, and mixed frozen foods should all be in the plan. Bigger rabbitfish often do best when there is both natural grazing and deliberate prepared feeding.',
            buyingGuidance='Recommend it only when the aquarium is being built around a large adult rabbitfish and the owner understands that venomous spines do not make the fish maintenance-free. This is a better big-display choice than a casual add-on.',
            recognitionNotes='More dramatic foxface/rabbitfish profile with ornate facial patterning and a grander overall presentation than the simpler one-spot forms.',
            visualCue='Large elegant rabbitfish profile with ornate face markings and extended finnage.'
        )
    elif i in {'blue-spotted-rabbitfish','masked-rabbitfish','scribbled-rabbitfish'}:
        variant={
            'blue-spotted-rabbitfish':('blue spotting across a pale body and the typical rabbitfish snout','A patterned rabbitfish for larger reefs that combines algae browsing with a more unusual look than the standard foxface forms.'),
            'masked-rabbitfish':('mask-like face pattern set against a cleaner body design','A sleek rabbitfish variant that still offers the same core benefits—algae browsing, generally calm behavior, and venomous-spine caution.'),
            'scribbled-rabbitfish':('maze-like scribbled patterning over the body and face','A patterned rabbitfish that reads more as a specialty display grazer than a plain utility fish.')
        }[i]
        cue, overview = variant
        update_fields(item,
            overview=overview + ' It still needs real swimming room, vegetable-heavy feeding support, and a keeper who understands that rabbitfish are not totally coral-blind.',
            facts=['Rabbitfish generally settle well into mixed communities if the tank gives them room and avoids other rabbitfish rivals.','Venomous spines make handling a logistics issue even when the fish is otherwise calm.','Most long-term problems come from cramped quarters or weak herbivore feeding rather than from raw aggression.'],
            headerSummary='Patterned rabbitfish with useful algae-browsing behavior, calm community potential, and venomous spines. Best treated as a true long-term herbivore, not a temporary cleanup tool.',
            behavior='Usually behaves like a measured cruising grazer that spends more time browsing than bullying. Similar-looking rabbitfish are the bigger compatibility issue; most unrelated tankmates are manageable if size and temperament make sense.',
            feedingNotes='Provide seaweed sheets, herbivore formulas, and a varied prepared-food routine so the fish does not have to scrape every calorie from the rockwork. Like many rabbitfish, this one is usually better around corals when it is well fed.',
            buyingGuidance='Best for larger reef or fish-only systems where the owner wants algae control plus a more distinctive body pattern than the standard foxface. The main reminders are spine safety, long-term space, and coral-sampling risk if the tank runs lean.',
            recognitionNotes=f'Look for {cue}.',
            visualCue=f'Look for {cue}.'
        )
write_js_array(path,prefix,data,suffix)

# ---------- Hawkfish ----------
path=SPEC/'hawkfish.js'
_,prefix,data,suffix=load_js_array(path)
for item in data:
    i=item['id']
    common='Perching ambush predator that spends much of the day sitting on rock, coral branches, or pump guards and then lunging at food or small crustaceans.'
    if i=='flame-hawkfish':
        update_fields(item,
            overview='One of the most personable hawkfish in the trade: bold, visible, and constantly perched out in the open. It works in many reefs, but not in shrimp-heavy reefs where ornamental shrimp are expected to stay safe.',
            facts=['Usually a confident perch-and-watch fish that becomes a favorite because it is always visible.','Often ignores similarly sized fish but can make a meal of small shrimp once it settles in.','Does not have a swim bladder, so the perched, hop-like movement is normal for hawkfish.'],
            headerSummary='Bright red, highly visible hawkfish with lots of personality and a real taste for small crustaceans. Great display fish when the tank is not built around shrimp.',
            behavior=common + ' Flame hawkfish are usually bolder than many small reef fish and quickly learn the whole room is watching them.',
            feedingNotes='Easy to keep on frozen meaty foods, pellets, and mixed prepared diets once established. The feeding challenge is usually not willingness to eat—it is deciding whether tiny crustacean tankmates are worth the risk.',
            buyingGuidance='Recommend it when the aquarist wants personality and visibility in a smaller predator-leaning reef fish. Make the shrimp warning clear, because that is the compatibility point most likely to matter later.',
            recognitionNotes='Solid red body with darker accents around the face and dorsal area, usually perched where it can survey the tank.',
            visualCue='Bright red body with darker facial markings and a classic hawkfish perched stance.'
        )
    elif i=='longnose-hawk':
        update_fields(item,
            overview='A classic branch-perching hawkfish known for its long snout, checkered red-and-white body pattern, and habit of picking food from narrow spaces. It is often more elegant and less blocky-looking than the chunkier hawkfish species.',
            facts=['Long snout helps it pick at small prey tucked into branches and crevices.','Usually spends a lot of time around branching rockwork or coral structure.','Still carries the usual hawkfish warning about tiny shrimp and very small ornamental crustaceans.'],
            headerSummary='Branch-perching hawkfish with a long snout and red-white lattice pattern. Excellent display fish for reef structures that do not rely on tiny shrimp surviving forever.',
            behavior=common + ' This species especially likes elevated perches and branching structure where the long snout can probe into gaps.',
            feedingNotes='Readily accepts frozen meaty foods and quality prepared diets. A varied meaty routine keeps it in good weight and helps reduce constant hunting pressure on tiny crustaceans.',
            buyingGuidance='A strong choice when the aquarist wants hawkfish personality but prefers a more refined, branch-associated species. Still not a free pass for sexy shrimp, tiny cleaners, or other snack-sized crustaceans.',
            recognitionNotes='Very long pointed snout, white body with red grid-like patterning, and a habit of perching high in branching structure.',
            visualCue='Very long pointed snout with red-and-white lattice patterning.'
        )
    elif i in {'arc-eye-hawkfish','falco-hawkfish','freckled-hawkfish','pixy-hawkfish'}:
        specific={
            'arc-eye-hawkfish':('larger, sturdier hawkfish with the dark arc behind the eye','A tougher, stockier hawkfish that feels more like a small ambush predator than a nano ornament.'),
            'falco-hawkfish':('compact body and mottled camouflage that helps it disappear on rock and rubble','A smaller camouflaged hawkfish that brings the same perch-and-pounce attitude in a more compact package.'),
            'freckled-hawkfish':('heavier freckling and a more robust body shape','A more rugged-looking hawkfish with the same classic habit of parking on rock and watching everything.'),
            'pixy-hawkfish':('small body, crisp patterning, and a compact reef-percher look','A compact hawkfish that works well when the goal is hawkfish personality without moving into one of the bigger, chunkier species.')
        }[i]
        cue, overview = specific
        update_fields(item,
            overview=overview + ' Like other hawkfish, it is usually fish-safe with sensible tankmates but remains risky around tiny shrimp and very small decorative crustaceans.',
            facts=['Perching posture and quick lunges are normal hawkfish behavior, not signs of distress.','Most compatibility trouble is directed at small crustaceans rather than similarly sized fish.','Rock shelves, overhangs, and observation perches help hawkfish settle in and show naturally.'],
            headerSummary='Perching hawkfish with strong personality and predictable small-crustacean risk. Best in reefs where the owner likes the behavior and is not counting on tiny shrimp lasting forever.',
            behavior=common + ' It usually claims a few favorite lookout posts and returns to them constantly through the day.',
            feedingNotes='Frozen mysis, chopped meaty foods, and prepared carnivore diets are usually accepted readily. A well-fed hawkfish is still a hawkfish, so feeding does not erase the shrimp risk entirely.',
            buyingGuidance='Best for aquarists who like visible ambush-predator behavior and understand that “reef safe with caution” usually means shrimp caution first. Pick this lane because you enjoy the fish, not because you forgot about the cleanup crew.',
            recognitionNotes=f'Look for {cue}.',
            visualCue=f'Look for {cue}.'
        )
write_js_array(path,prefix,data,suffix)

# ---------- Shrimp ----------
path=SPEC/'shrimp.js'
_,prefix,data,suffix=load_js_array(path)
for item in data:
    i=item['id']
    if i in {'cleaner-shrimp','skunk-cleaner-shrimp','pederson-cleaner-shrimp'}:
        cue={'cleaner-shrimp':'bold cleaner-shrimp striping and very long white antennae','skunk-cleaner-shrimp':'the classic skunk-cleaner stripe with bright white antennae','pederson-cleaner-shrimp':'a finer, more delicate cleaner-shrimp build with long waving antennae'}[i]
        size_note={'cleaner-shrimp':'hardy and highly visible','skunk-cleaner-shrimp':'one of the most dependable ornamental shrimp in the hobby','pederson-cleaner-shrimp':'smaller and more delicate than the chunky classic cleaners'}[i]
        update_fields(item,
            overview=f'{size_note.capitalize()} that adds movement, visible cleaning-station behavior, and real personality to reef tanks. The biggest compatibility concern is not feeding difficulty but keeping it away from hawkfish, larger wrasses, puffers, triggers, and other shrimp predators.',
            facts=['Cleaner shrimps often advertise with antennae and body movement, then groom receptive fish at a cleaning station.','Most do well singly, in pairs, or in peaceful reef communities if predators are absent.','Molting periods are when even hardy shrimp are most vulnerable to predation.'],
            headerSummary='Visible cleaner shrimp that brings motion, utility, and classic reef behavior. Best in predator-light reef systems where it can molt safely and stay out in the open.',
            behavior='Usually spends the day waving antennae, scavenging, and setting up obvious cleaning-station behavior near rock ledges or caves. Once comfortable, these shrimp often become one of the most visible animals in the tank.',
            feedingNotes='Most accept leftover frozen foods, pellets, and fine meaty foods readily, even though they also clean fish. They should still be fed like real invertebrates, not expected to survive only on what they pull off tankmates.',
            buyingGuidance='A very strong recommendation for peaceful reef systems that want visible movement and classic reef interaction. Always ask about hawkfish, large wrasses, dottybacks, triggers, puffers, or other shrimp-eating tankmates before calling it safe.',
            recognitionNotes=f'Look for {cue}.',
            visualCue=f'Look for {cue}.'
        )
    elif i in {'fire-shrimp','blood-red-fire-shrimp'}:
        update_fields(item,
            overview='Spectacular deep-red cleaner shrimp that is usually shyer than the skunk cleaners but extremely striking once it claims a cave or ledge. It adds premium color and some cleaning behavior, but is still vulnerable to the same shrimp predators and molt-time losses.',
            facts=['Often spends more time under ledges or in caves than skunk cleaners, especially in bright tanks.','Usually safe in peaceful reefs but still at risk from hawkfish, larger wrasses, and many predator fish.','Benefits from stable salinity and careful acclimation like most ornamental shrimp.'],
            headerSummary='Deep-red cleaner shrimp with premium color, cave-dwelling habits, and the usual shrimp compatibility cautions. Gorgeous in peaceful reefs, risky in predator-heavy tanks.',
            behavior='Usually keeps close to caves, overhangs, or shaded ledges and ventures out more confidently once settled. It may clean fish, but many keepers value it just as much for the contrast color and deliberate movement.',
            feedingNotes='Accepts meaty frozen foods, pellets, and leftovers readily, especially once it knows the feeding routine. Because it may stay tucked in more than a skunk cleaner, target feeding near the cave can help during the adjustment period.',
            buyingGuidance='Recommend it when the aquarist wants a premium ornamental shrimp and understands that “reef safe” does not mean “predator proof.” The right reef setting is calm, stable, and not stocked with fish that view shrimp as moving snacks.',
            recognitionNotes='Look for the deep blood-red body, bright white spotting or antennae, and a preference for shaded ledges or caves.',
            visualCue='Deep blood-red body with white spotting or bright white antennae.'
        )
    elif i=='peppermint-shrimp':
        update_fields(item,
            overview='A practical little reef shrimp best known for scavenging and, in the right species mix, helping with small Aiptasia outbreaks. It is useful, but it should not be sold as guaranteed one-step pest control because different peppermint shrimp species behave differently.',
            facts=['Often more active at dusk and after lights out than during peak daytime hours.','Some peppermint shrimp are helpful with Aiptasia, but results are inconsistent across species and individual animals.','Can steal food from corals or pick at weak tissue when crowded or underfed.'],
            headerSummary='Useful small reef shrimp with scavenging value and sometimes Aiptasia-help potential, but not a miracle cure. Best in peaceful systems where expectations stay realistic.',
            behavior='Usually stays around rockwork and caves by day, then becomes more visible when feeding starts or the lights dim. In groups it may be bolder, but it is still more of a practical utility shrimp than a showpiece cleaner.',
            feedingNotes='Will scavenge aggressively and accepts fine meaty foods, pellets, and leftovers easily. Do not rely on hunger games to make it useful; starving shrimp are more likely to bother corals or each other.',
            buyingGuidance='Sell it as a small scavenger with possible Aiptasia value, not as guaranteed pest annihilation. The right conversation includes species uncertainty, shrimp-predator compatibility, and the chance that a healthy well-fed shrimp may ignore problem anemones entirely.',
            recognitionNotes='Semi-transparent body with red striping and a more understated look than the flashier cleaner shrimp.',
            visualCue='Semi-transparent body with thin red striping.'
        )
    elif i in {'coral-banded-shrimp','banded-coral-shrimp','gold-coral-banded-shrimp'}:
        color={'coral-banded-shrimp':'bold red-and-white banding with oversized boxing claws','banded-coral-shrimp':'banded body and oversized boxer-style claws','gold-coral-banded-shrimp':'gold-toned banded body with oversized boxer-style claws'}[i]
        update_fields(item,
            overview='A dramatic boxer shrimp known for giant claws, long antennae, and a cave-based territory. Very interesting to watch, but more aggressive toward other shrimp than the cleaner-shrimp crowd and not always the best choice for mixed shrimp collections.',
            facts=['Often forms a favorite cave or ledge territory and defends that space against rival shrimp.','May clean fish occasionally, but most people buy it for the look and behavior rather than dependable cleaning utility.','Safer kept singly unless a known pair is obtained.'],
            headerSummary='Showy boxer shrimp with huge claws, cave territory, and more attitude than the common cleaner shrimp. Best when the tank is not trying to mix lots of different ornamental shrimp together.',
            behavior='Typically hangs in or under a cave, extending long antennae and standing off with the claws when other shrimp intrude. It is more territorial than a skunk cleaner and often behaves like a cave-owning crustacean first and a community helper second.',
            feedingNotes='Easy to feed with meaty frozen foods, pellets, and leftovers delivered near the den. Because it is assertive, it rarely loses out in feeding unless the tankmates are much faster or larger.',
            buyingGuidance='Recommend it for people who specifically want the boxer-shrimp look and understand that not all ornamental shrimp mix well. Ask whether the reef is meant to be a multi-shrimp display, because that answer changes whether this is a fit.',
            recognitionNotes=f'Look for {color}.',
            visualCue=f'Look for {color}.'
        )
    elif i in {'sexy-shrimp','anemone-shrimp'}:
        host={'sexy-shrimp':'tiny group-living shrimp that often dances over anemones or corals','anemone-shrimp':'small host-associated shrimp that does best when it has an anemone or similar refuge'}[i]
        update_fields(item,
            overview=f'{host.capitalize()}. These shrimp are charming in nano reefs, but they are delicate, easy to lose in predator tanks, and should be chosen for the right peaceful display rather than as generic cleanup crew.',
            facts=['Often do best in very peaceful tanks where they are not outcompeted or hunted.','Host animals such as anemones or large-polyp corals often make them bolder and more visible.','Best appreciated in small groups or species-focused nano setups.'],
            headerSummary='Delicate host-associated ornamental shrimp best for peaceful nano reefs and anemone-style displays. Great character, poor fit for rough community tanks.',
            behavior='Usually stays close to a host or favored perch and becomes more confident when it has that shelter relationship. In larger rougher reefs it may survive invisibly or disappear outright.',
            feedingNotes='Needs small meaty foods delivered consistently, because tiny shrimp lose out easily in mixed-tank feeding frenzies. A calm nano setup makes targeted feeding much easier.',
            buyingGuidance='Recommend only when the aquarist is deliberately building a gentle nano reef or host-animal display. These are poor “throw it in the community tank and hope” choices.',
            recognitionNotes='Look for a very small ornamental shrimp that stays close to a host and is often seen bobbing or dancing in place.',
            visualCue='Tiny ornamental shrimp often seen hovering or bobbing around a host coral or anemone.'
        )
    elif i=='bumblebee-shrimp':
        update_fields(item,
            overview='A tiny specialty shrimp with striking yellow-and-dark striping that is more interesting than practical. It is often kept in small peaceful systems where its unusual behavior can actually be observed, rather than in busy display tanks where it disappears.',
            facts=['Much less of a general-purpose reef shrimp than cleaner or peppermint species.','Often hides through much of the day and is best appreciated in smaller, calmer displays.','May pick at echinoderm tube feet in the wild but usually accepts meaty foods in captivity.'],
            headerSummary='Tiny specialty shrimp with bold striping and niche appeal. Best for calm nano-style displays where the keeper actually wants to watch an oddball shrimp, not a high-utility worker.',
            behavior='Usually secretive and deliberate, spending much of its time tucked under rock or moving carefully around the substrate. It is not the sort of shrimp that instantly becomes the star of a busy community reef.',
            feedingNotes='Offer very small meaty foods regularly and do not expect it to thrive on leftovers alone. Small tanks make it much easier to ensure the food reaches the shrimp instead of the fish.',
            buyingGuidance='Recommend it only when the owner specifically wants a niche ornamental shrimp and has a predator-free setup to support that choice. It is a specialty add, not a cleanup crew workhorse.',
            recognitionNotes='Tiny shrimp with strong yellow-and-dark banding that stands out sharply when it is actually visible.',
            visualCue='Tiny shrimp with strong yellow and dark banding.'
        )
    elif i in {'camel-shrimp','durban-dancing-shrimp','candy-cane-shrimp'}:
        specific={
            'camel-shrimp':'arched back and white striping over a red body',
            'durban-dancing-shrimp':'hinged beak profile and red-striped nocturnal shrimp look',
            'candy-cane-shrimp':'red-and-white striping with a more decorative cave-shrimp presentation'
        }[i]
        update_fields(item,
            overview='Decorative cave- and crevice-oriented shrimp that are often more nocturnal and less reef-safe than people expect from “just another shrimp.” They can be very attractive, but they are not interchangeable with cleaner shrimp.',
            facts=['Often come out more boldly after lights dim than in peak daytime lighting.','Some of these shrimp will pick at soft coral or fleshy polyp tissue in reef tanks.','Usually do best in groups or pairs only when the system and species support it.'],
            headerSummary='Attractive ornamental shrimp with a more nocturnal, cave-oriented personality than classic cleaner shrimp. Best for aquarists who understand the coral-risk caveat.',
            behavior='Most spend the day under ledges and become more active in dimmer conditions, moving with a more secretive scavenger style than open-display cleaners. They are interesting shrimp, but usually not the right recommendation for reef keepers who want visible all-day utility.',
            feedingNotes='Accept meaty frozen foods, pellets, and leftovers well when they can get to them. Because they often hide, targeted evening feeding may give better results than relying on daytime broadcast feeding.',
            buyingGuidance='Recommend them when the aquarist likes the look and understands they are decorative scavengers, not guaranteed reef-safe cleaners. If prized fleshy corals are central to the tank, there are usually safer shrimp choices.',
            recognitionNotes=f'Look for {specific}.',
            visualCue=f'Look for {specific}.'
        )
    elif i in {'pistol-shrimp','randall-s-pistol-shrimp','tiger-pistol-shrimp','candy-cane-pistol-shrimp'}:
        specific={
            'pistol-shrimp':'classic burrowing pistol-shrimp form with oversized snapping claw','randall-s-pistol-shrimp':'more decorative pistol shrimp with crisp red-and-white patterning','tiger-pistol-shrimp':'striped heavier-bodied pistol shrimp often paired with watchman gobies','candy-cane-pistol-shrimp':'red-and-white patterned pistol shrimp suited to goby-pair displays'
        }[i]
        update_fields(item,
            overview='Burrowing pistol shrimp that is best appreciated in a proper goby-pair or rubble-rich substrate setup, not as a random loose invertebrate. The snapping behavior is normal, and the right aquascape lets the animal build and maintain a visible tunnel system.',
            facts=['Many pistol shrimp form symbiotic partnerships with shrimp gobies, sharing a burrow and warning network.','Snapping sounds are normal and not a sign of equipment trouble.','Deep enough substrate and stable rubble around the burrow matter more than flashy color alone.'],
            headerSummary='Burrowing pistol shrimp best for goby-pair displays and sand-rubble structures. Great behavior animal when the tank is built to let it dig, pair, and stay visible.',
            behavior='Usually spends much of its life engineering a burrow, shoveling sand, repositioning rubble, and staying near the entrance. With the right goby partner, the behavior becomes much more visible and far more rewarding to watch.',
            feedingNotes='Will scavenge effectively but still benefits from meaty foods reaching the burrow area. Tanks with heavy competition may need target feeding so the shrimp is not trying to live entirely on scraps.',
            buyingGuidance='Recommend it when the aquarist specifically wants burrow behavior or a goby partnership, not merely because “shrimp are cool.” Ask about substrate depth, rock stability, and whether a suitable goby is already present or planned.',
            recognitionNotes=f'Look for {specific}.',
            visualCue=f'Look for {specific}.'
        )
    elif i=='harlequin-shrimp':
        update_fields(item,
            overview='A spectacular specialty shrimp whose beauty is matched by a very narrow diet: it feeds on starfish and similar echinoderms, not on generic reef leftovers. That makes it fascinating but also a serious commitment rather than a casual ornamental.',
            facts=['Famously feeds on sea stars and is often used for Asterina control only when a long-term feeding plan exists.','Best kept as a deliberate specialty animal or pair, not as a generic mixed-reef shrimp.','Stable water and successful molting matter, but food planning is the make-or-break issue.'],
            headerSummary='Beautiful specialty shrimp with a starfish-only feeding problem that must be solved before purchase. Stunning animal, terrible impulse buy.',
            behavior='Usually moves deliberately and methodically, especially once it has located food. In a suitable setup it becomes a fascinating long-term project, but in a casual community reef it often becomes a starvation risk disguised as a premium ornament.',
            feedingNotes='Plan starfish feeding before the shrimp is purchased. This is not a species that should be expected to switch to pellets, leftover fish food, or standard mixed invertebrate diets.',
            buyingGuidance='Only recommend when the aquarist already understands and accepts the starfish-feeding commitment. Harlequin shrimp are amazing display animals, but they are not cleanup crew and they are not a “maybe it will figure something out” purchase.',
            recognitionNotes='White to cream body with large colored blotches and ornate flattened appendages that make the shrimp look almost floral.',
            visualCue='White body with large colored blotches and ornate flattened front appendages.'
        )
    elif i=='mysid-shrimp-culture':
        update_fields(item,
            overview='Live food culture entry rather than a display invertebrate. Mysids are valuable because they add moving prey for finicky fish, small predators, and systems that benefit from active live feeding support.',
            facts=['Useful for finicky feeders, pipefish-type feeding routines, and predator conditioning.','Best treated like a live-food project with harvest and replenishment planning.','Water quality and predation pressure determine how long a culture lasts in a display.'],
            headerSummary='Live mysid culture for feeding support, not a display shrimp. Best used by keepers intentionally supporting finicky or predatory feeders.',
            behavior='As a culture, the value is in constant motion and nutritional availability rather than in ornamental display behavior. In display tanks they may persist briefly or become immediate prey depending on the stocking list.',
            feedingNotes='Use as part of an intentional feeding program for fish that respond better to moving prey. Expect to replenish or culture more if the display contains efficient hunters.',
            buyingGuidance='Recommend only when the aquarist actually has a feeding use case for live mysids. They are excellent support animals, but they are not decorative shrimp for people who just want something pretty on the rock.',
            recognitionNotes='Small free-swimming shrimp culture meant to be used as active live food rather than ornamental stock.',
            visualCue='Tiny free-swimming shrimp intended as live food.'
        )
write_js_array(path,prefix,data,suffix)

# ---------- Crabs ----------
path=SPEC/'crabs.js'
_,prefix,data,suffix=load_js_array(path)
for item in data:
    i=item['id']
    if i in {'emerald-crab','mithrax-crab','red-mithrax-crab','ruby-mithrax-crab'}:
        cue={'emerald-crab':'deep green body and spooned algae-picking claws','mithrax-crab':'mithrax body plan with algae-grazing claws','red-mithrax-crab':'reddish mithrax coloration and algae-picking claws','ruby-mithrax-crab':'ruby-toned mithrax body and compact algae-picking claws'}[i]
        update_fields(item,
            overview='Useful algae-picking crab that can help with bubble algae and leftover food when chosen for the right reef. It is still a crab, so the best long-term results come from a well-fed animal in a sensibly stocked tank—not from treating it as a magical algae robot.',
            facts=['Often recommended for bubble algae control, though results vary by individual and tank conditions.','Usually safer than many crabs in reefs, but opportunistic picking is still possible if food is short.','Best behavior comes from keeping the crab fed and not forcing it to compete for every scrap.'],
            headerSummary='Helpful algae-picking mithrax crab with real utility and the usual crab caveat: useful does not mean perfectly predictable.',
            behavior='Spends much of its time picking over rock surfaces, crevices, and patches of algae rather than roaming constantly in the open. Well-fed mithrax crabs usually behave better than hungry ones.',
            feedingNotes='Will pick algae and detritus, but it still benefits from occasional meaty or herbivore supplemental foods. Tanks with no real food support are more likely to push a crab into opportunistic coral or invertebrate picking.',
            buyingGuidance='Recommend when the owner wants a crab with genuine algae utility and understands that no crab is a zero-risk machine. This is a better fit for practical reef keepers than for people expecting a guaranteed one-animal fix.',
            recognitionNotes=f'Look for {cue}.', visualCue=f'Look for {cue}.')
    elif 'hermit' in i:
        color={
            'halloween-hermit':'bold orange-black-white banding and very large shell-bearing build',
            'scarlet-hermit':'rich red legs with yellow facial details',
            'blue-leg-hermit':'blue legs with smaller, busier cleanup-crew energy',
            'electric-blue-hermit':'intense electric-blue legs with high-contrast striping',
            'electric-orange-hermit':'orange-toned legs and strong ornamental shell-crew look',
            'scarlet-reef-hermit':'scarlet coloration with a classic reef-hermit build',
            'thin-stripe-hermit':'finer striped leg pattern and smaller hermit profile',
            'white-spot-hermit':'white-spotted legs and compact cleanup-crew body',
            'zebra-hermit':'bold zebra striping on the legs'
        }.get(i,'distinctive hermit-crab striping and shell-carrying body')
        update_fields(item,
            overview='Active cleanup hermit that adds movement and scavenging value, but still needs empty spare shells and realistic expectations. Hermits are excellent utility animals when stocked appropriately; they become trouble when they are crowded, starving, or forced to fight over housing.',
            facts=['Hermits benefit from spare empty shells so they are less likely to harass snails for housing.','Different hermit species vary in size and attitude, but all are opportunistic scavengers.','Best used as part of a mixed crew, not as the only answer to algae or detritus.'],
            headerSummary='Useful scavenging hermit crab that needs spare shells and sensible stocking density. Great worker when managed well, annoying when treated like a disposable cleanup plug-in.',
            behavior='Usually spends the day roaming over rock and substrate picking through leftovers, films, and loose debris. Shell disputes and snail harassment are far more likely in tanks that offer no extra shells or run too many hermits per gallon.',
            feedingNotes='Hermits scavenge aggressively but should still get enough food support that they are not competing desperately with snails and each other. Occasional pellets, fine frozen foods, and algae support keep crews calmer.',
            buyingGuidance='Recommend based on cleanup-crew balance and shell availability, not because “crabs are cool.” The smartest hermit sale is usually paired with spare shell advice and a reminder that huge hermit armies create their own problems.',
            recognitionNotes=f'Look for {color}.', visualCue=f'Look for {color}.')
    elif i in {'anemone-porcelain-crab','porcelain-crab'}:
        host={'anemone-porcelain-crab':'host-association with anemones and feathery filter-feeding fans','porcelain-crab':'flat-bodied porcelain-crab shape with fan-feeding appendages'}[i]
        update_fields(item,
            overview='Delicate filter-feeding crab that is best appreciated in calmer reef setups where it can perch, fan-feed, and ideally associate with a host. It is not a bulldozer cleanup crab and should be sold as a specialty ornamental, not as a generic detritus worker.',
            facts=['Uses fan-like appendages to collect suspended food from the water column.','Usually does best in calmer, more stable reef systems than rough-and-tumble crab mixes.','Host anemones or suitable perches often make it much bolder and easier to observe.'],
            headerSummary='Filter-feeding ornamental crab best for peaceful reefs and host displays. Great personality when the setup supports it, poor fit for rough mixed-crab tanks.',
            behavior='Often stays perched in one preferred spot and filters suspended foods rather than constantly roaming the tank. That calmer style makes it charming in the right reef and invisible or vulnerable in the wrong one.',
            feedingNotes='Broadcast fine planktonic foods or other small suspended foods so the crab can actually use its filter-feeding fans. It is not designed to live purely on leftover chunks like a hermit.',
            buyingGuidance='Recommend when the aquarist wants a host-style or specialty ornamental crab and understands the feeding difference. This is a better sale for a thoughtful reef display than for a “cleanup crew bundle.”',
            recognitionNotes=f'Look for {host}.', visualCue=f'Look for {host}.')
    elif i=='arrow-crab':
        update_fields(item,
            overview='An unmistakable long-legged crab that can be useful against some bristle worms, but should always be treated as an opportunistic predator rather than a gentle cleanup mascot. Fascinating animal, not a universally safe reef crab.',
            facts=['May prey on bristle worms and other small benthic animals.','Can bother tiny shrimp, feather dusters, or weak tankmates once established.','Long legs and spider-like body make it one of the easiest crabs to identify instantly.'],
            headerSummary='Distinctive long-legged reef crab with real oddball appeal and real predatory caveats. Best as a deliberate specialty choice, not a default cleanup add-on.',
            behavior='Usually prowls rockwork and crevices with a slow spider-like gait, investigating anything edible it can reach. It is more predatory and less predictably reef-safe than emerald-type algae crabs.',
            feedingNotes='Accepts meaty foods and scavenges readily, which is useful but also part of why it can become a problem in delicate reef communities. Do not let it become a half-starved opportunist in a tank full of tempting worms and tiny inverts.',
            buyingGuidance='Recommend only when the owner understands the trade-off: unusual look and possible worm control in exchange for more risk to small inverts. Not the right choice for tanks built around tiny ornamental crustaceans or feather duster collections.',
            recognitionNotes='Very long thin legs and a spider-like body profile that stands out instantly from more compact reef crabs.',
            visualCue='Very long thin spider-like legs and a narrow pointed body.'
        )
    elif i=='decorator-crab':
        update_fields(item,
            overview='Specialty crab famous for attaching bits of sponge, algae, or debris to itself for camouflage. Entertaining and unusual, but not a no-risk reef crab because the decorating habit can involve taking material from the display.',
            facts=['Uses attached bits of algae, sponge, or other material as camouflage.','May disturb frags or ornamental growth while gathering decoration material.','Better sold as an oddball display crab than as practical cleanup crew.'],
            headerSummary='Oddball camouflage crab that decorates itself with tank material. Great conversation piece, not a tidy hands-off worker.',
            behavior='Moves more deliberately than busy hermits and spends time collecting and wearing camouflage from the environment. That behavior is exactly why people love it—and exactly why tidy aquascapes may not.',
            feedingNotes='Scavenges and accepts meaty foods, but a stable feeding routine matters if you want less opportunistic picking around the display. A hungry decorator is even less respectful of ornamental material.',
            buyingGuidance='Recommend when the owner wants a genuinely quirky display crab and is okay with the possibility of it stealing bits of macro, sponge, or other decoration. This is a personality sale, not a precision cleanup sale.',
            recognitionNotes='Rounder body and long legs, often carrying attached bits of algae or rubble for camouflage.',
            visualCue='Crab often carrying bits of algae, sponge, or rubble on its body.'
        )
    elif i=='pom-pom-crab':
        update_fields(item,
            overview='Tiny showpiece crab that carries small anemones in its claws like pom-poms. Charming and unusual, but best appreciated in peaceful reef setups where it is not outcompeted, hunted, or simply lost in a giant rockscape.',
            facts=['Famous for carrying tiny anemones in the claws for defense and feeding help.','Often hides much of the day and shows best in calmer reef or nano environments.','More of a collectible ornamental than a meaningful cleanup worker.'],
            headerSummary='Tiny novelty crab that carries anemone pom-poms and excels in peaceful reef displays. Wonderful oddball, negligible cleanup muscle.',
            behavior='Usually keeps to caves and lower-light areas, emerging in short, memorable appearances that are more about personality than utility. In the right nano reef it becomes a treasure; in a large aggressive tank it becomes folklore.',
            feedingNotes='Eats fine meaty foods and leftovers when they reach it, but tiny size means targeted or calm feeding conditions help. It should not be expected to fend for itself in a fast, crowded feeding rush.',
            buyingGuidance='Recommend only when the aquarist specifically wants a collectible oddball crab and has the right predator-free setting. This is not the crab to recommend when someone asks for brute-force cleanup.',
            recognitionNotes='Very small crab carrying tiny anemones in the claws like white or translucent pom-poms.',
            visualCue='Tiny crab carrying tiny anemones in its claws.'
        )
    elif i=='sally-lightfoot-crab':
        update_fields(item,
            overview='Fast, athletic crab that starts small and useful but can become bold, quick, and opportunistic as it grows. It is often best treated as a “with caution” reef crab rather than a default cleanup crew recommendation.',
            facts=['Quick movement and climbing ability make it much more active than most cleanup crabs.','Juveniles are often easier reef citizens than larger established adults.','Can become opportunistic with fish, inverts, or food competition in cramped systems.'],
            headerSummary='Fast, agile reef crab with useful scavenging ability and a well-earned caution label as it matures. Better for keepers who understand the trade-off.',
            behavior='Spends much of its time sprinting over rock and glass in a way that makes slower crabs look parked. That activity is entertaining, but it also signals a crab that can become pushy as it gains size and confidence.',
            feedingNotes='Scavenges aggressively and benefits from steady food support so it is not turning every feeding event into a competitive sprint. Like many opportunists, it behaves best when the system is not forcing it to improvise food sources.',
            buyingGuidance='Recommend with restraint. It can be useful and attractive, but it is not the same low-risk sale as a snail or a modest hermit crew. Best for aquarists comfortable removing it later if the personality changes.',
            recognitionNotes='Flat agile body with long legs built for speed and climbing rather than slow deliberate grazing.',
            visualCue='Flat body and long agile legs built for speed.'
        )
    elif i=='strawberry-crab':
        update_fields(item,
            overview='Beautiful red specialty crab that is usually sold for looks rather than for heavy cleanup value. Like many attractive reef crabs, it should be treated as a with-caution ornamental, not assumed harmless because it is small and colorful.',
            facts=['Valued more for color and novelty than for major algae or detritus utility.','Can be cryptic at first and may spend much of its time tucked away.','Better viewed as a specialty reef crab than as a cleanup-crew foundation animal.'],
            headerSummary='Bright red ornamental crab with specialty appeal and the usual crab caution. Better chosen for color and novelty than for raw utility.',
            behavior='Often behaves more like a shy ornamental crab than a tireless visible worker, spending time under ledges and emerging selectively. In mixed crab communities it may be overshadowed by tougher scavengers.',
            feedingNotes='Accepts meaty foods and scavenges lightly, but should not be expected to solve major algae or detritus issues. Supplementary feeding helps keep it from turning opportunistic in a lightly fed reef.',
            buyingGuidance='Recommend when the owner wants an unusual ornamental crab and understands the limits of its utility. This is a style-and-personality animal, not a cleanup crew anchor.',
            recognitionNotes='Bright strawberry-red body and claws that make it stand out sharply against reef rock.',
            visualCue='Bright strawberry-red body and claws.'
        )
write_js_array(path,prefix,data,suffix)

# ---------- Snails ----------
path=SPEC/'snails.js'
_,prefix,data,suffix=load_js_array(path)
for item in data:
    i=item['id']
    if i in {'nassarius-snail','super-tongan-nassarius'}:
        update_fields(item,
            overview='Sand-dwelling scavenger snail that excels at finding meaty leftovers rather than scraping algae from glass. It is valuable in reef cleanup crews because it keeps the substrate lively and helps remove waste before it rots.',
            facts=['Often stays buried until it smells food, then erupts from the sand quickly.','Excellent at consuming leftovers and carrion but not a primary algae grazer.','Works best in sand-bottom systems with enough feeding activity to justify a scavenger crew.'],
            headerSummary='Substrate-burrowing scavenger snail with excellent leftover cleanup value. Great utility animal when the tank actually needs a meat-and-detritus scavenger.',
            behavior='Usually lives buried in the sand until food scent hits the water, then rises and moves quickly for a snail. That ambush-scavenger style is exactly what makes it useful in well-fed reef systems.',
            feedingNotes='Needs meaty leftovers or targeted foods to justify its place long term; it is not a replacement for algae snails. Tanks that run extremely lean may not support large nassarius populations well.',
            buyingGuidance='Recommend for sand-bottom reef tanks that need scavenging help, not for bare-bottom systems looking for glass cleaners. The right sale is based on function: leftover cleanup and sand stirring, not shell appearance.',
            recognitionNotes='Small sand-burrowing snail with an obvious siphon used to sniff out food from below the substrate.',
            visualCue='Sand-burrowing snail with a long feeding siphon.'
        )
    elif i in {'trochus-snail','astrea-snail','astraea-snail'}:
        can_right='can usually right itself if flipped' if i=='trochus-snail' else 'often struggles more than trochus when flipped and may need occasional help'
        update_fields(item,
            overview='Reliable algae-grazing reef snail valued for film algae, glass work, and rock browsing. It is one of the most practical cleanup animals because the job description is simple and it usually sticks to it.',
            facts=['Excellent on film algae and lighter grazing jobs rather than heavy meaty cleanup.','Peaceful and broadly reef-safe with very little downside in sensible numbers.',f'{can_right.capitalize()}.'],
            headerSummary='Practical algae-grazing snail for rock and glass maintenance. A cornerstone cleanup animal when the tank actually has algae for it to work on.',
            behavior='Spends most of its time cruising hard surfaces and grazing continuously in a very low-drama way. This is exactly the kind of invisible long-term worker most reef tanks benefit from.',
            feedingNotes='Needs real algae or supplemental feeding support if the system becomes too sterile. Cleanup snails do best when the crew size matches the amount of actual work available.',
            buyingGuidance='A very easy recommendation for reef tanks that need dependable algae support. Trochus is often the safer premium pick when the owner wants a snail that can usually recover from being knocked over.',
            recognitionNotes='Conical shell and classic rock-and-glass grazing behavior associated with reef cleanup snails.',
            visualCue='Conical shell and constant rock-and-glass grazing behavior.'
        )
    elif i=='tectus-snail':
        update_fields(item,
            overview='Strong algae-grazing top-shell snail that behaves a lot like a trochus-type grazer but is less forgiving when overturned. Very useful on hard surfaces, but worth monitoring in busy tanks where snails get flipped often.',
            facts=['Good algae grazer on rock and glass.','Often less able to right itself than true banded trochus snails.','Works best in reefs that want a hard-surface herbivore, not a meaty scavenger.'],
            headerSummary='Top-shell algae grazer with good utility and a known downside when overturned. Best for keepers willing to check snails occasionally instead of assuming every one can self-rescue.',
            behavior='Spends the day grazing hard surfaces steadily, doing the same kind of quiet maintenance work as other top-shell snails. The only real caution is that a flipped animal may need intervention.',
            feedingNotes='Needs rock and film algae support or supplemental herbivore foods if the tank is too polished. Like other grazers, it should be stocked to the real algae load, not to a generic rule of thumb.',
            buyingGuidance='Recommend when a reef needs more hard-surface algae control and the keeper understands the self-righting limitation. It is a function-first snail, not an ornamental centerpiece.',
            recognitionNotes='Top-shell cone shape with a grazing pattern similar to trochus-type snails.',
            visualCue='Conical top-shell snail that cruises hard surfaces for algae.'
        )
    elif i=='turbo-snail':
        update_fields(item,
            overview='Powerful algae-eating snail famous for bulldozing through nuisance growth with more brute force than finesse. Great worker when real algae exists, but large turbo snails can shift frags and loose decor as they plow through the tank.',
            facts=['Very effective against heavier algae films and some nuisance growth.','Size and strength make it more likely than small snails to knock things over.','Best in tanks that genuinely need a big grazer, not just “more cleanup crew.”'],
            headerSummary='Heavy-duty algae snail with real bulldozer energy. Fantastic worker in the right tank, overkill in delicate displays with little algae.',
            behavior='Moves with more force and less subtlety than tiny grazer snails, often pushing through algae patches that smaller cleanup animals ignore. That same strength is why unsecured frags and ornaments may get rearranged.',
            feedingNotes='Needs significant algae or deliberate herbivore supplementation long term; a pristine tank can starve a turbo crew surprisingly fast. Size the crew to the actual algae job.',
            buyingGuidance='Recommend when the reef genuinely needs heavier algae pressure and the aquarist accepts the bulldozer trade-off. It is a utility snail first, not a delicate ornamental.',
            recognitionNotes='Large rounder shell and noticeably stronger, more forceful grazing movement than tiny cleanup snails.',
            visualCue='Large heavy-bodied algae snail that can bulldoze loose frags while grazing.'
        )
    elif i in {'cerith-snail','dwarf-cerith-snail','florida-cerith-snail'}:
        size='smaller' if i=='dwarf-cerith-snail' else 'general-purpose'
        update_fields(item,
            overview='Versatile cleanup snail that works rock, glass, and especially the substrate line better than many specialist grazers. Ceriths are popular because they handle multiple small jobs well without becoming disruptive.',
            facts=['Useful on film algae, detritus, and the upper sand surface.','Often active after lights out, where much of their cleanup work goes unnoticed.','Smaller forms are especially good for tighter areas and nano reefs.'],
            headerSummary='Versatile day-and-night cleanup snail that works both hard surfaces and sand edges. One of the easiest mixed-crew recommendations in reef keeping.',
            behavior='Usually cruises rock, glass, and substrate margins in a quieter, finer-scale way than turbo or top-shell snails. That flexibility is what makes ceriths such dependable mixed-cleanup animals.',
            feedingNotes='Benefits from a tank with light films, detritus, and biofilm rather than only one narrow food source. Like all cleanup snails, they should be stocked to the available work, not to a fixed formula.',
            buyingGuidance=f'A very safe recommendation for mixed cleanup crews, especially when the aquarist wants a {size} snail that can work multiple surfaces. Ceriths are usually an easy yes unless the tank is simply too sterile to feed them.',
            recognitionNotes='Slim elongated shell and a habit of working both substrate edges and hard surfaces.',
            visualCue='Slim elongated shell with frequent activity along sand lines and rock surfaces.'
        )
    elif i in {'fighting-conch','queen-conch','strawberry-conch','tiger-conch'}:
        strength={'fighting-conch':'excellent sand-sifting and scavenging utility in ordinary reef sand beds','queen-conch':'larger conch profile that needs real room and feeding support','strawberry-conch':'ornamental conch with the same useful sand-stirring habits in a more colorful package','tiger-conch':'patterned conch with active substrate-cleaning behavior'}[i]
        update_fields(item,
            overview=f'Useful sand-bed snail known for roaming the substrate, turning the top layer, and picking at films and leftovers. {strength.capitalize()}.',
            facts=['Best in tanks with open sand areas instead of wall-to-wall rockwork.','Excellent for stirring and aerating the substrate while also scavenging.','Conchs are peaceful with most tankmates but should not be overstocked in sand beds that cannot feed them.'],
            headerSummary='Sand-working conch that helps keep the substrate active, cleaner, and better aerated. Great specialist for tanks with enough open sand to justify it.',
            behavior='Spends much of the day roaming sand surfaces with a purposeful, almost mechanical gait, lifting and pushing across the substrate. That visible work style is exactly why conchs are so valued in sand-focused systems.',
            feedingNotes='Needs a mature sand bed with films, detritus, and occasional supplemental feeding if the tank runs very clean. A beautiful conch in a tiny spotless sand patch is a bad long-term plan.',
            buyingGuidance='Recommend when the aquarium has open sand and a real need for substrate work, not simply because the shell looks cool. One well-placed conch usually helps more than a pile of random substrate snails.',
            recognitionNotes='Heavier shell with a long probing snout and an active roaming style across open sand.',
            visualCue='Heavy shell, long probing snout, and obvious movement across open sand.'
        )
    elif i=='bumblebee-snail':
        update_fields(item,
            overview='A striking little snail with yellow-and-dark striping that is often sold as cleanup crew even though it behaves more like a tiny carnivorous scavenger than a broad algae grazer. Interesting animal, but not a substitute for ceriths, trochus, or conchs.',
            facts=['Often feeds on meaty leftovers and small benthic foods more than on nuisance algae.','Useful in certain small scavenger roles but easy to misunderstand in cleanup crews.','Best kept because the owner actually knows what it does, not because it looks cool on a list.'],
            headerSummary='Striped specialty snail with carnivorous/scavenging tendencies rather than major algae-grazing value. Better as a niche oddball than as a cleanup-crew default.',
            behavior='Usually moves with a deliberate scavenger style and may spend time around crevices, meaty foods, and benthic microfauna instead of mowing visible algae fields. It fills a narrower role than most beginner cleanup lists suggest.',
            feedingNotes='Expect it to respond better to meaty leftovers than to film algae. If the tank needs herbivorous cleanup, other snail groups usually make more sense.',
            buyingGuidance='Recommend only when the aquarist understands it is a niche scavenger, not a broad algae solution. A cool shell pattern should not be the whole logic for adding it.',
            recognitionNotes='Small snail with bold yellow-and-dark banding that stands out sharply against rock and sand.',
            visualCue='Small shell with bold yellow and dark striping.'
        )
    elif i=='money-cowrie':
        update_fields(item,
            overview='A beautifully polished ornamental snail that can graze and scavenge, but is usually chosen as much for the shell as for pure cleanup efficiency. Better treated as a display invertebrate with some utility than as a dedicated algae specialist.',
            facts=['Smooth glossy shell gives it a more ornamental look than most cleanup snails.','Can grow large enough to become a noticeable moving ornament in the display.','May bulldoze more than the smallest snails simply because of body size and shell weight.'],
            headerSummary='Glossy ornamental cowrie with some grazing value and much higher display appeal than an average cleanup snail. Chosen for beauty first, utility second.',
            behavior='Usually roams rock and substrate methodically, but the shell and mantle make it feel more like a display invertebrate than a background maintenance worker. It is the kind of snail people notice instead of forgetting exists.',
            feedingNotes='Will graze and scavenge, but should not be expected to solve major algae issues alone. Match the purchase to a real tank role rather than assuming every large snail is a cleanup powerhouse.',
            buyingGuidance='Recommend when the owner wants an ornamental snail with some utility and has a tank that can support a larger roaming grazer/scavenger. Not the first-choice answer to serious algae control.',
            recognitionNotes='Smooth polished cowrie shell, often partly covered by a living mantle when the animal is active.',
            visualCue='Smooth polished cowrie shell often partially covered by a fleshy mantle.'
        )
    elif i=='nerite-snail':
        update_fields(item,
            overview='Small active grazer valued for film algae and glass work, especially in smaller reef systems. Useful, attractive, and generally low drama, though some species are famous for exploring high and sometimes finding their way out of open tops.',
            facts=['Excellent on glass and lighter film algae.','Small size makes them easy to use in nanos and mixed cleanup crews.','Some nerites are escape-prone around open top edges and waterline exploration.'],
            headerSummary='Small active algae grazer especially handy for glass and nano systems. Great worker when lids and waterline habits are taken into account.',
            behavior='Usually keeps moving and spends a lot of time around glass, waterline zones, and hard surfaces where film algae grows. That active pattern is exactly why some keepers notice them near tank edges more than other snails.',
            feedingNotes='Needs light films and biofilm support, not meaty leftovers. In very polished systems they may need supplementary feeding or simply fewer snail competitors.',
            buyingGuidance='Recommend for smaller reefs or mixed crews that need more glass-focused grazing. Just mention the escape habit if the system is open and the owner is the type who will care when a snail wanders.',
            recognitionNotes='Small rounded grazing snail often found working glass and upper hard surfaces.',
            visualCue='Small rounded snail often found grazing glass near the waterline.'
        )
    elif i=='stomatella-snail':
        update_fields(item,
            overview='One of the most underrated algae grazers in reef tanks: fast, slug-like, reef-safe, and surprisingly effective for film algae. Most keepers end up loving them once they realize they are helpers, not pests.',
            facts=['Often reproduces in healthy systems and becomes a self-sustaining micro-cleanup crew.','Slug-like body with a reduced shell confuses many new hobbyists at first.','Excellent on films and biofilm with almost no downside in reef tanks.'],
            headerSummary='Underrated reef grazer with slug-like body and excellent film-algae utility. One of the best “bonus cleanup crew” animals a healthy reef can have.',
            behavior='Moves faster than most snails and works rock and glass without the heavy bulldozing of big-shell species. In mature reefs it often becomes an appreciated background grazer that quietly multiplies.',
            feedingNotes='Thrives where there is ongoing biofilm and light algae to graze. It is less about direct feeding and more about maintaining a reef mature enough to support a living micro-cleanup community.',
            buyingGuidance='An easy recommendation for reef keepers who appreciate subtle utility animals. If someone sees them as “weird pest snails,” they usually just have not yet learned how valuable stomatellas can be.',
            recognitionNotes='Slug-like body with a very reduced shell plate and movement faster than a typical snail.',
            visualCue='Slug-like body with only a tiny reduced shell plate.'
        )
    elif i=='berghia-nudibranch':
        update_fields(item,
            overview='A true specialty biological-control animal for Aiptasia, not a generic cleanup slug. Berghia can be extremely effective over time, but they are tiny, nocturnal, vulnerable to predation, and only make sense when the tank actually has an Aiptasia problem to feed them.',
            facts=['Feeds specifically on Aiptasia and can starve once the pest is gone if not moved or shared.','Small size and nocturnal habits mean results often take time and are not dramatic overnight.','Best used in systems without wrasses, peppermint shrimp, or other animals likely to eat them.'],
            headerSummary='Specialty Aiptasia-control nudibranch with real utility and real limitations. Great biological tool, terrible impulse cleanup purchase.',
            behavior='Usually works at night and out of sight, which makes impatient keepers think nothing is happening until the pest population finally declines. Success comes from patience, protection, and enough nudibranchs for the scale of the outbreak.',
            feedingNotes='Requires Aiptasia. There is no generic backup diet that makes sense once the target pest is gone.',
            buyingGuidance='Recommend only when the aquarist actually has an Aiptasia problem, understands the slow-burn nature of Berghia control, and can protect the animals from predators. This is not a decorative slug or a broad cleanup crew addition.',
            recognitionNotes='Tiny pale nudibranch usually seen only up close, working directly on Aiptasia rather than roaming openly like a display snail.',
            visualCue='Tiny pale nudibranch used specifically for Aiptasia control.'
        )
    elif i in {'lettuce-nudibranch','lettuce-sea-slug'}:
        update_fields(item,
            overview='A delicate algae-grazing sea slug most often chosen for bryopsis-leaning nuisance algae situations or as a specialty nano oddball. Beautiful and interesting, but easily overestimated as a general-purpose cleanup animal.',
            facts=['Better treated as a niche algae helper than as universal cleanup crew.','Delicate body makes it vulnerable to pumps, overflows, and rough tankmates.','Works best in calmer systems where the target algae is actually present.'],
            headerSummary='Delicate algae-focused sea slug with niche utility and high vulnerability to equipment and predators. Best as a deliberate specialty choice.',
            behavior='Usually grazes softly over rock and algae patches rather than roaming like a hard-shelled cleanup snail. In the wrong tank it vanishes into pumps, overflows, or predator mouths long before it solves anything.',
            feedingNotes='Needs the right algae to browse and should not be treated like a creature that will simply switch to prepared foods. Many failures come from buying the animal before confirming the food source.',
            buyingGuidance='Recommend only when the algae problem and the tank design actually suit a delicate sea slug. It is a specialist helper, not a durable all-purpose cleanup crew member.',
            recognitionNotes='Leafy ruffled body with a slug-like shape rather than a hard shell.',
            visualCue='Leafy ruffled slug body with no protective shell.'
        )
write_js_array(path,prefix,data,suffix)

# ---------- Urchins ----------
path=SPEC/'urchins.js'
_,prefix,data,suffix=load_js_array(path)
for item in data:
    i=item['id']
    if i in {'tuxedo-urchin','blue-tuxedo-urchin'}:
        update_fields(item,
            overview='Compact grazer famous for both algae utility and the habit of carrying bits of shell, rubble, or macro on its body like decorations. One of the most reef-friendly urchin choices when the tank has enough grazing and the owner secures loose frags.',
            facts=['Excellent on film algae and coralline films, though heavy coralline grazing can be a downside in display reefs.','Often carries shells, frags, or rubble as camouflage, which is funny until it steals something small and unsecured.','Shorter spines make it more manageable than the huge long-spine urchin types.'],
            headerSummary='Popular compact urchin with real algae-grazing value and a comical habit of wearing rubble as a hat. Great reef urchin when the aquascape is secured.',
            behavior='Usually cruises rockwork methodically, grazing and periodically collecting bits of debris to carry on the spines. That carrying behavior is normal and one of the reasons tuxedo urchins are so entertaining in reef tanks.',
            feedingNotes='Needs real algal films or supplemental vegetable foods once the display gets too clean. Like many cleanup animals, it does best when there is ongoing work instead of one giant binge followed by starvation.',
            buyingGuidance='A strong recommendation for reef keepers who want a manageable urchin with genuine grazing value. Just mention the camouflage habit and the chance it relocates tiny frags or shell decorations.',
            recognitionNotes='Round compact urchin with short neat spines and a tendency to carry bits of rubble or shell on top.',
            visualCue='Compact round urchin with short spines and bits of rubble carried on top.'
        )
    elif i=='collector-urchin':
        update_fields(item,
            overview='A larger, more assertive urchin known for collecting and carrying loose tank items while it grazes. Useful and impressive, but more likely than a tuxedo to rearrange unsecured frags or decorations.',
            facts=['Strong collector behavior makes it notorious for wearing shells, rubble, algae, and loose frags.','Can be a very effective grazer in tanks with enough mature rock.','Size and strength mean it deserves more respect than the neat little tuxedo forms.'],
            headerSummary='Large collecting urchin with solid grazing value and a very real talent for stealing unsecured tank decor. Best for mature reefs with stable rockwork and secured frags.',
            behavior='Moves steadily over rockwork grazing and grabbing loose material to carry, often turning itself into a slow-moving bouquet of tank debris. The grazing is useful; the redecorating is the trade-off.',
            feedingNotes='Needs ample grazing and may need supplemental algae foods in polished systems. Like larger turbo snails, it is best stocked because the tank has real work for it, not because a crew list said “add an urchin.”',
            buyingGuidance='Recommend only when the owner likes the idea of an active grazer and can tolerate the rearranging behavior. If the reef is built around delicate unsecured frags, this is a poor fit.',
            recognitionNotes='Larger urchin with obvious habit of carrying multiple bits of shell, rubble, and decor on the spines.',
            visualCue='Larger urchin often covered in carried shells, rubble, or frags.'
        )
    elif i=='halloween-urchin':
        update_fields(item,
            overview='Eye-catching urchin with orange-and-dark banded spines and solid grazing behavior, but more size and presence than the compact tuxedo group. It is a better fit for roomy mature reefs than for tiny fragile nano displays.',
            facts=['Known for striking orange-black coloration and longer decorative spines.','Can graze effectively but also push or lift loose items as it works.','Better viewed as a medium-to-large reef urchin than as a miniature cleanup accent.'],
            headerSummary='Striking orange-and-dark reef urchin with real grazing value and more size than the tuxedo types. Great look, but not a tiny tank toy.',
            behavior='Usually grazes openly and steadily, drawing more attention than plain cleanup crew because of the color and spine length. Like other active urchins, it works best in tanks where loose decor is secured.',
            feedingNotes='Needs ongoing algae support or supplemental foods once the display is too clean. An urchin this visible should be bought because the tank can feed it, not just because it photographs well.',
            buyingGuidance='Recommend when the keeper wants a colorful urchin and has enough mature rock and room to support one. Avoid pitching it into delicate nanos where every movement knocks something loose.',
            recognitionNotes='Orange-and-dark banded spines with a larger more dramatic overall reef-urchin look.',
            visualCue='Orange and dark banded spines on a larger showier urchin.'
        )
    elif i=='long-spine-urchin':
        update_fields(item,
            overview='Iconic black long-spine urchin with major algae-grazing ability and equally major spine length. Impressive and useful, but it needs room, careful handling, and a tank layout that can tolerate a much more dramatic urchin than the compact decorative species.',
            facts=['Very long sharp spines change how you clean and work inside the tank.','Can become a centerpiece grazer rather than a subtle cleanup animal.','Best in larger systems where its size and spine reach are not constant obstacles.'],
            headerSummary='Large long-spine urchin with strong grazing power and serious spine caution. Excellent worker in the right big reef, awkward in cramped displays.',
            behavior='Usually moves like a slow black satellite dish across rockwork, grazing while the spines define a huge personal bubble. That dramatic footprint is exactly why it needs more planning than small decorative urchins.',
            feedingNotes='Needs significant grazing opportunity or supplemental algae foods to stay healthy long term. A starving long-spine urchin in a polished reef is just a dangerous-looking underfed animal.',
            buyingGuidance='Recommend only when the aquarist specifically wants this classic urchin and has room to live with the spines. It is a deliberate large-tank choice, not a cleanup impulse add.',
            recognitionNotes='Round black urchin with extremely long needle-like spines extending far beyond the body.',
            visualCue='Round black body with extremely long needle-like spines.'
        )
    elif i=='pencil-urchin':
        update_fields(item,
            overview='A chunky thick-spined urchin with lots of personality, but much less of a tidy reef-safe grazer than the tuxedo-type species. Pencil urchins are often chosen for looks and oddball appeal, not because they are the safest cleanup urchin.',
            facts=['Thick blunt spines make it look very different from the fine-spined grazing urchins.','Can be more opportunistic around sessile life than the classic reef-safe urchin favorites.','Often better in fish-only or cautiously planned mixed systems than in delicate coral displays.'],
            headerSummary='Oddball thick-spined urchin with personality and a lower reef-safety score than tuxedo-style grazers. Great look, more caution.',
            behavior='More of a slow heavy rover than a neat precision grazer, with an obvious ability to shove around as it goes. The appeal is visual and behavioral character, not refined cleanup perfection.',
            feedingNotes='Will graze, but should not be oversold as a plug-and-play algae specialist for delicate coral reefs. Supplementary foods and realistic expectations matter.',
            buyingGuidance='Recommend when the owner wants a unique urchin and understands it is a rougher oddball than a tuxedo grazer. Usually not the first-choice urchin for coral-first displays.',
            recognitionNotes='Thick blunt pencil-like spines and a chunkier heavier look than most reef urchins.',
            visualCue='Chunky urchin with thick blunt pencil-like spines.'
        )
    elif i in {'pin-cushion-urchin','short-spine-urchin'}:
        update_fields(item,
            overview='Moderate-sized algae-grazing urchin that sits between the delicate decorative tuxedo types and the more extreme long-spine or pencil species. Useful when the reef wants real grazing help without the biggest spine drama.',
            facts=['Good general grazer on rockwork and algal films.','Still capable of moving loose objects or frags if the aquascape is not secure.','More practical than flashy, which often makes it a smart worker choice.'],
            headerSummary='Solid working urchin with real grazing value and manageable spine length. Best for mature reefs that want an urchin for utility first.',
            behavior='Usually roams rockwork steadily and behaves like a straightforward grazer rather than an ornamental oddity. It is exactly the kind of animal that becomes more appreciated over time as the tank stays cleaner.',
            feedingNotes='Needs algae and grazing support or supplemental feeding once the reef gets too polished. Like all urchins, it should be stocked because there is real work to do.',
            buyingGuidance='A good recommendation for mature reefs that want a practical urchin without stepping into the most extreme species. Still remind the owner that frags should be secure and algae should exist.',
            recognitionNotes='Round grazing urchin with moderate spine length and a more workmanlike appearance than showy tuxedo forms.',
            visualCue='Round urchin with moderate spine length and practical grazer look.'
        )
    elif i=='sand-dollar':
        update_fields(item,
            overview='A true sand-bed specialist that belongs in mature substrate-heavy systems, not as a random decorative star-shaped oddity. Fascinating animal, but it depends on the right bed structure and food availability to survive long term.',
            facts=['Lives within or on sand and depends on mature substrate conditions.','Much more specialized than most casual cleanup crews suggest.','Poor fit for bare-bottom tanks or very shallow decorative sand patches.'],
            headerSummary='Specialized sand-bed echinoderm that needs a mature substrate and should not be treated like a general cleanup ornament.',
            behavior='Usually stays in or on the substrate rather than becoming an obvious roaming display animal. Its survival is tied more to the quality of the sand bed than to whether the owner thinks it looks interesting in the store.',
            feedingNotes='Needs a mature sand bed with appropriate organic and microfood support. A sterile shallow display bed is a fast route to a bad outcome.',
            buyingGuidance='Recommend only when the aquarist already has a mature sand-focused system and understands this is not a decorative novelty. It is a habitat-driven purchase, not a visual impulse buy.',
            recognitionNotes='Flattened disk-like echinoderm adapted to living in and on sandy substrate rather than cruising open rockwork.',
            visualCue='Flattened disk-like echinoderm designed for sand, not rock.'
        )
write_js_array(path,prefix,data,suffix)

# ---------- Starfish ----------
path=SPEC/'starfish.js'
_,prefix,data,suffix=load_js_array(path)
for item in data:
    i=item['id']
    if i=='sand-sifting-star':
        update_fields(item,
            overview='A sand-bed specialist that constantly works through the substrate hunting microfauna. Useful in the right mature sand bed, but far too often added to tanks that simply cannot feed it long term.',
            facts=['Consumes life in the sand bed rather than just “cleaning” it in a harmless abstract way.','Needs a mature, sufficiently large substrate to avoid long-term starvation.','Poor fit for bare-bottom tanks or new reefs with thin decorative sand only.'],
            headerSummary='Sand-bed specialist that needs a truly mature substrate and often starves in undersized or overly clean tanks. Buy for the right habitat, not for the star shape.',
            behavior='Spends most of its life under or on the substrate methodically processing sand in search of edible organisms. It looks industrious, but that visible work also means it is consuming the very fauna the sand bed needs to stay rich.',
            feedingNotes='Long-term success depends on a mature sand bed with enough life to support it. Many tanks cannot replace that food base fast enough once the starfish is established.',
            buyingGuidance='Recommend only when the aquarium has a genuinely mature, roomy sand bed and the owner understands what the animal is actually eating. This is not a safe default cleanup star for every reef.',
            recognitionNotes='Usually seen partially buried or plowing just under the sand surface rather than climbing rockwork like decorative stars.',
            visualCue='Starfish usually seen working within or just under the sand bed.'
        )
    elif i in {'banded-serpent-star','brittle-star','serpent-star'}:
        update_fields(item,
            overview='Hardy scavenging echinoderm that hides in rock by day and reaches out for food at feeding time. One of the more forgiving star-shaped inverts in the hobby when kept away from outright predators.',
            facts=['Usually spends much of the day hidden, showing arms from caves or crevices.','Excellent scavenger of leftover meaty foods and detritus.','Much hardier and less specialized than the delicate reef stars like Linckia or Fromia.'],
            headerSummary='Hardy cave-dwelling scavenger star with long flexible arms and easy-care utility. Great oddball worker for stable reef or fish-only systems.',
            behavior='Typically hides the disk deep in rock and extends the arms to sense food, then becomes surprisingly quick when a feeding event begins. This secretive-to-suddenly-active pattern is exactly what makes serpent stars so fun to keep.',
            feedingNotes='Benefits from meaty leftovers, pellets, and occasional target feeding in cleaner systems. They scavenge well, but they are still living animals that do better when not expected to survive on magic detritus alone.',
            buyingGuidance='A very good recommendation when the aquarist wants an unusual but fairly durable scavenger. Just verify tankmates are not the sort that will chew on echinoderm arms.',
            recognitionNotes='Long flexible arms emerging from rock crevices, often with the central disk hidden from view.',
            visualCue='Very long flexible arms often protruding from caves with the body hidden.'
        )
    elif i=='green-brittle-star':
        update_fields(item,
            overview='A larger, more predatory brittle-star type that should be treated with more caution than the usual reef-safe serpent stars. Impressive scavenger, but not the best choice for tanks full of tiny fish or delicate nocturnal livestock.',
            facts=['Often grows larger and behaves more assertively than typical serpent stars.','Can act as an opportunistic predator rather than a harmless scavenger under the wrong conditions.','Best in systems where the stocking plan respects that size and feeding style.'],
            headerSummary='Big assertive brittle star with strong scavenging ability and a real predator warning. Better for experienced keepers than for beginner reef cleanup lists.',
            behavior='Usually hides like other brittle stars, but once large and confident it can become much more assertive at feeding time. That extra boldness is the whole reason it deserves its own caution label.',
            feedingNotes='Needs regular meaty feeding support so it is not improvising by testing weaker tankmates. A well-fed green brittle star is still not identical to a gentle little serpent star.',
            buyingGuidance='Recommend carefully and only when the tankmates and owner expectations truly fit. This is an impressive oddball scavenger/predator, not a universally safe reef helper.',
            recognitionNotes='Thicker green-toned arms and a more robust, imposing look than the gentler serpent-star types.',
            visualCue='Robust green-toned brittle star with thicker arms and larger presence.'
        )
    elif i=='chocolate-chip-starfish':
        update_fields(item,
            overview='A durable showy sea star for fish-only or carefully planned systems, but not a reef-safe decorative star for coral tanks. The big raised knobs make it iconic; the appetite for sessile invertebrates makes it risky.',
            facts=['Frequently sold because it is hardy and attractive, not because it is reef-safe.','May prey on soft corals, anemones, and other sessile invertebrates.','Better suited to fish-only or species-appropriate displays than to mixed coral reefs.'],
            headerSummary='Iconic knobby sea star with strong display value and poor reef compatibility. Great fish-only oddball, bad coral-tank assumption.',
            behavior='Usually moves slowly over rock and substrate in a very visible, display-oriented way. Its problem is not activity level—it is that the things it may decide to eat are often exactly the reason people built the reef in the first place.',
            feedingNotes='Needs meaty foods and a system appropriate for a predatory or opportunistic starfish. Do not treat it like a harmless detritus processor.',
            buyingGuidance='Recommend only when the owner is not expecting coral safety. This is one of those species that is easy to sell wrong if the conversation stops at “hardy and cool-looking.”',
            recognitionNotes='Thick body with prominent chocolate-chip-like knobs across the upper surface.',
            visualCue='Sea star with thick body and large raised dark knobs.'
        )
    elif i in {'fromia-starfish','red-fromia-starfish'}:
        update_fields(item,
            overview='Beautiful reef star best suited to mature stable systems where the rockwork can provide ongoing grazing opportunities. Fromia stars are far more delicate than hardy scavenging serpent stars, so they should be sold as advanced ornamental echinoderms, not cleanup crew.',
            facts=['Depend heavily on mature biofilm-rich rockwork and system stability.','Often fail in new or overly sterile tanks despite looking fine at purchase.','Much better chosen for established reefs than for “complete my cleanup crew” shopping lists.'],
            headerSummary='Beautiful but delicate reef star that needs a mature stable system and natural grazing support. Advanced ornamental, not beginner cleanup crew.',
            behavior='Usually roams rock and glass slowly, grazing unseen films rather than scavenging obvious chunks of food. The tank’s maturity matters more here than dramatic feeding response or visible activity.',
            feedingNotes='Success depends more on mature live rock and stable conditions than on target feeding alone. A beautiful Fromia in a new sterile tank is usually a countdown, not a win.',
            buyingGuidance='Recommend only for mature stable reefs where the owner understands that elegance and difficulty often come together in echinoderms. This is not a good “first starfish” for most hobbyists.',
            recognitionNotes='Smooth more refined sea-star form with vivid solid coloration rather than heavy knobs or hairy spines.',
            visualCue='Smooth colorful sea star with a refined clean body shape.'
        )
    elif i in {'blue-linckia-starfish','orange-linckia-starfish','red-linckia-starfish'}:
        update_fields(item,
            overview='Classic showpiece Linckia star prized for color and graceful movement, but notorious for needing a large mature stable reef to do well. Beautiful animal, poor choice for young tanks or impulse “reef centerpiece” buys.',
            facts=['Requires mature stable systems with substantial natural grazing surfaces.','Shipping and acclimation stress often make Linckia stars more difficult than they appear in a store.','Chosen for beauty, not because they are easy or broadly useful.'],
            headerSummary='Showpiece Linckia star with incredible color and equally real husbandry difficulty. Best reserved for established reefs and patient experienced keepers.',
            behavior='Usually glides slowly over rock and glass in a very elegant way, but apparent calm should not be mistaken for durability. Many problems are invisible until the animal has already been stressed for too long.',
            feedingNotes='Relies heavily on mature grazing surfaces and stable conditions more than on obvious hand-feeding success. A large old reef is a much better safety margin than a new polished display.',
            buyingGuidance='Recommend sparingly and only when the owner already understands what makes Linckias difficult. This is one of the easiest starfish to admire and one of the easiest to oversell.',
            recognitionNotes='Long smooth arms and vivid solid color with a graceful classic Linckia shape.',
            visualCue='Smooth long-armed starfish with striking solid coloration.'
        )
    elif i=='pods-starter-culture':
        update_fields(item,
            overview='Functional live-food starter culture meant to seed refugiums, support pod-dependent fish, and strengthen microfauna populations. This is a support product entry, not a decorative invert card.',
            facts=['Useful for mandarins, dragonets, and refugium-based food webs.','Often best added to lower-predation zones or refugiums so the population can establish.','Value comes from reproduction and food-web support, not from visibility.'],
            headerSummary='Starter pod culture for food-web support and pod-dependent fish. A utility purchase for system function, not display aesthetics.',
            behavior='As a live-food culture, the goal is establishment and reproduction rather than ornamental display behavior. In a predator-heavy display, many pods become food immediately unless there is refuge space.',
            feedingNotes='Best used in systems with refugium space, microhabitat, and a reason to support a continuing pod population. Dumping pods into a hungry tank with nowhere to hide is usually just a feeding event.',
            buyingGuidance='Recommend when the owner has a real need—mandarins, dragonets, refugium seeding, or biodiversity support. This is a system-function add, not a “maybe it helps” impulse purchase.',
            recognitionNotes='Microscopic to tiny live culture intended to seed microfauna populations rather than display as a visible ornamental animal.',
            visualCue='Live pod culture for seeding refugiums and supporting pod-dependent fish.'
        )
write_js_array(path,prefix,data,suffix)

# ---------- Inverts ----------
path=SPEC/'inverts.js'
_,prefix,data,suffix=load_js_array(path)
for item in data:
    i=item['id']
    if i in {'sand-sifting-sea-cucumber','tiger-tail-sea-cucumber'}:
        update_fields(item,
            overview='A true substrate-processing animal that ingests sand, strips out organics, and leaves cleaner-looking sediment behind. Extremely useful in the right mature sand bed, but too specialized for tanks that only have a decorative dusting of sand.',
            facts=['Needs a mature sand bed with enough ongoing organics and micro-life to process.','Much more specialized than a snail or hermit cleanup addition.','Best in peaceful systems where the animal is not harassed or trapped against pumps and overflows.'],
            headerSummary='Specialized sand-processing cucumber for mature substrate-heavy systems. Great worker when the habitat is right, poor fit when sand is shallow or sterile.',
            behavior='Usually moves slowly over or through the substrate, constantly processing sand rather than grazing visible algae. The work is impressive, but it depends on the tank having enough real sand-bed nutrition to support the animal.',
            feedingNotes='Long-term success depends on the substrate itself being mature and productive. You cannot replace an empty sterile sand bed with wishful thinking and a cucumber purchase.',
            buyingGuidance='Recommend only when the reef has a mature open sand bed and the owner wants a true substrate specialist. These are habitat-driven purchases, not generic cleanup extras.',
            recognitionNotes='Elongated soft-bodied sand specialist usually seen plowing slowly across the substrate while processing sand.',
            visualCue='Elongated soft-bodied invert slowly processing sand across the substrate.'
        )
    elif i in {'coco-worm','feather-duster-worm'}:
        update_fields(item,
            overview='Filter-feeding tube worm valued for the crown display as much as for any utility. Best in calmer mature systems with consistent fine suspended food and tankmates that will not pick at the delicate feeding crown.',
            facts=['Displays a fan or crown that retracts instantly when disturbed.','Requires suspended foods and stable conditions rather than rough-and-tumble cleanup-crew treatment.','Poor choice with known worm pickers, large hawkfish, many butterflies, or curious predators.'],
            headerSummary='Delicate filter-feeding tube worm best for peaceful mature systems with planktonic feeding support. Ornamental specialist, not cleanup crew.',
            behavior='Usually stays fixed in the tube and opens the crown to filter fine foods from the water. The whole appeal is that elegant display response, which disappears quickly in rough tanks where the animal never feels secure enough to open fully.',
            feedingNotes='Needs a steady supply of fine suspended foods and good water quality. A gorgeous worm in a nutrient-starved tank with no particulate feeding plan often declines quietly.',
            buyingGuidance='Recommend only when the aquarist is intentionally adding a filter-feeding ornamental and can support that. This is not a “throw it in with the cleanup crew” item.',
            recognitionNotes='Feathery crown that retracts into a protective tube at the slightest disturbance.',
            visualCue='Feathery filtering crown that retracts into a tube.'
        )
    elif i in {'amphipods','copepods'}:
        role='larger benthic live food and biodiversity support' if i=='amphipods' else 'micro-plankton live food and food-web support'
        update_fields(item,
            overview=f'Utility culture entry focused on {role}. Pods are valuable because they strengthen the food web, support pod-dependent fish, and make refugiums or mature reef systems more biologically productive.',
            facts=['Best results come when pods have hiding space or refugium habitat instead of being dumped into open predation instantly.','Especially useful for mandarins, dragonets, and systems that benefit from constant natural foraging opportunities.','Value is ecological and nutritional, not ornamental.'],
            headerSummary='Pod culture for food-web support, refugium seeding, and pod-dependent fish. A system-function purchase rather than a display-animal purchase.',
            behavior='As a culture, the goal is reproduction, settlement, and availability as forage rather than visible ornamental behavior. In well-structured systems pods become part of the background ecology that makes everything else work better.',
            feedingNotes='Use in tanks with macroalgae, rubble, refugium zones, or at least enough microhabitat for populations to establish. Otherwise the addition often becomes a very expensive one-time snack.',
            buyingGuidance='Recommend when the owner has a real use case: seeding a refugium, supporting pod-feeding fish, or boosting biodiversity. Pods are excellent system tools when the habitat plan exists.',
            recognitionNotes='Live food culture used to seed microfauna populations rather than to provide a visible ornamental display animal.',
            visualCue='Microfauna culture for refugiums and pod-dependent fish support.'
        )
    elif i in {'chaeto-refugium-pack','live-rock-cleanup-pack','refugium-microfauna-pack'}:
        purpose={
            'chaeto-refugium-pack':'macroalgae/refugium support with attached microfauna value',
            'live-rock-cleanup-pack':'mixed utility package for establishing cleanup diversity',
            'refugium-microfauna-pack':'biodiversity seeding for refugium and food-web support'
        }[i]
        update_fields(item,
            overview=f'Functional support package meant for {purpose}, not for ornamental display. These entries make sense when someone is building a healthier system ecology, not when they are shopping for visible showcase animals.',
            facts=['Value comes from biological function, biodiversity, and long-term system support.','Best used by aquarists who understand where the package will live and what problem it is meant to solve.','Often most effective when paired with refugium space, stable nutrients, and realistic stocking goals.'],
            headerSummary='System-support package built around ecology and function rather than showpiece display value. Best for purposeful reef planning.',
            behavior='The benefits are indirect: nutrient support, biodiversity, microfauna housing, and long-term stability rather than obvious day-one spectacle. These are background-improvement tools for people who appreciate system building.',
            feedingNotes='Think habitat and placement first. Packages like this work best when the receiving system has the right space, flow, and purpose—not when they are dropped in with no plan.',
            buyingGuidance='Recommend only after identifying the actual goal: nutrient export, biodiversity support, refugium seeding, or cleanup balancing. These are smart purchases when tied to a plan and wasted purchases when bought on vibes alone.',
            recognitionNotes='Package-style entry centered on refugium or cleanup-system support rather than one visible display animal.',
            visualCue='Functional package entry meant to support system ecology rather than display one showpiece invert.'
        )
    elif i=='sea-hare':
        update_fields(item,
            overview='A specialized algae-eating slug often used as a serious answer to heavy nuisance algae, not as a casual decorative invert. It can be extremely effective, but the keeper must plan for what happens after the algae is gone and understand the stress-ink risk.',
            facts=['Can be very effective on certain nuisance algae loads in a short time.','If badly startled, some sea hares can release purple ink that needs rapid filtration support.','Best viewed as an algae-management specialist rather than a permanent generic cleanup pet in every reef.'],
            headerSummary='Powerful algae specialist with real utility, real vulnerability, and a “what happens after the algae is gone?” problem. Great worker when used intentionally.',
            behavior='Usually grazes steadily and purposefully over algae patches rather than wandering like a decorative oddball. In the right algae-heavy system it can feel miraculous; in a clean or aggressive tank it quickly becomes the wrong animal.',
            feedingNotes='Buy only when there is a clear algae food source or a post-cleanup plan. A sea hare that solves the algae problem and is then left with nothing to eat is not a success story.',
            buyingGuidance='Recommend when the aquarist specifically needs heavy algae help and is prepared both for gentle handling and for the aftercare plan once the job is done. This is a specialist tool animal, not a random invert add.',
            recognitionNotes='Large soft-bodied algae slug with rabbit-like head tentacles and a broad grazing profile.',
            visualCue='Large soft-bodied algae slug with rabbit-like head tentacles.'
        )
write_js_array(path,prefix,data,suffix)

# version/docs
app=ROOT/'js'/'app.js'
app_txt=app.read_text(encoding='utf-8')
app_txt=re.sub(r"const APP_VERSION = '[0-9.]+';", "const APP_VERSION = '0.096';", app_txt)
app.write_text(app_txt, encoding='utf-8')

curr=ROOT/'docs'/'summaries'/'LTC_CURRENT_STATE.md'
curr.write_text('''# LTC Fish Browser — Current State (V0.096)\n\nUse **V0.096** as the latest working handoff build in this zip.\n\n## What changed in V0.096\n- Completed a **Rabbitfish + Hawkfish + Inverts/Cleanup Crew** content pass.\n- Replaced a large block of still-generic support text in shrimp, crabs, snails, urchins, starfish, and utility-invert entries with more species-aware husbandry guidance.\n- Reworked Rabbitfish and Hawkfish so they read less like family boilerplate and more like real fit/compatibility guidance.\n- Updated `APP_VERSION` to **0.096**.\n\n## Stable baseline reminders\n- This pass intentionally stayed in the **fish/catalog content lane only** for safer merging with outside UI/staff/category work.\n- Inventory-card photo issue was previously confirmed fixed in live use.\n- Staff-mode quarantine badge and inventory button bug were previously fixed in the V0.091 lane.\n\n## Best next content lanes\n1. Other Fish specialty pass (filefish, anglers, groupers, catshark, oddballs)\n2. Smaller polish pass for any still-generic damsel/cardinal/basslet leftovers\n3. Human spot-check of the newly enriched invert entries\n4. Backend + Shopify/POS sync planning once access is available\n''', encoding='utf-8')

hist=ROOT/'docs'/'summaries'/'LTC_VERSION_HISTORY_COMPACT.md'
hist_txt=hist.read_text(encoding='utf-8')
if '## V0.096' not in hist_txt:
    hist_txt += '\n\n## V0.096\n- Completed a species-aware content pass for Rabbitfish, Hawkfish, and Inverts/Cleanup Crew.\n- Replaced generic support text in shrimp, crabs, snails, urchins, starfish, and utility-invert entries with more deliberate husbandry, feeding, and fit guidance.\n- Kept UI/staff/category files untouched to stay parallel-work friendly.\n'
hist.write_text(hist_txt, encoding='utf-8')

worklog=ROOT/'docs'/'worklogs'/'LTC_MASTER_WORKLOG.md'
if worklog.exists():
    w=worklog.read_text(encoding='utf-8')
    if 'V0.096' not in w:
        w += '\n\n## V0.096\n- Completed Rabbitfish + Hawkfish + Inverts/Cleanup Crew fish-content pass.\n- Updated shrimp, crab, snail, urchin, starfish, and utility-invert entries to remove remaining generic support copy.\n- Updated APP_VERSION to 0.096.\n'
        worklog.write_text(w, encoding='utf-8')

handoff_text='''# LTC Fish Browser — ChatGPT Handoff (V0.096)\n\n## What was done\n- Continued the **fish/catalog content lane only**.\n- Completed a **Rabbitfish + Hawkfish + Inverts/Cleanup Crew** enrichment pass.\n- Reworked Rabbitfish and Hawkfish to better reflect real compatibility, grazing/perching behavior, and buying fit.\n- Replaced a lot of still-generic cleanup-crew wording in Shrimp, Crabs, Snails, Urchins, Starfish, and Inverts with more species-aware husbandry guidance.\n- Updated APP_VERSION to **0.096**.\n\n## Important lane separation\n- This pass intentionally **did not touch** staff/category/popup UI work so it stays easier to merge with outside UI fixes.\n\n## Best next steps\n1. Other Fish specialty pass\n2. Small polish pass on any remaining generic damsel/cardinal/basslet text\n3. Human spot-check of newly enriched invert entries\n'''
(ROOT/'docs'/'handoffs'/'LTC_V0096_ChatGPT_Handoff.md').write_text(handoff_text, encoding='utf-8')
(ROOT/'LTC_V0096_ChatGPT_Handoff.md').write_text(handoff_text, encoding='utf-8')

report='''# LTC Fish Browser — V0.096 Rabbitfish + Inverts/Cleanup Crew Pass\n\n## What changed\n- Updated app version to **V0.096**.\n- Reworked **Rabbitfish** and **Hawkfish** so they read less like family boilerplate and more like real fit/compatibility recommendations.\n- Completed a broad species-aware pass for **Shrimp, Crabs, Snails, Urchins, Starfish, and utility Inverts**.\n- Replaced a large amount of still-generic cleanup-crew wording with more deliberate guidance around: \n  - actual job role (algae grazer vs scavenger vs sand specialist vs biological-control animal)\n  - real compatibility concerns\n  - feeding expectations once the tank becomes too clean\n  - why specialty animals like Berghia, Harlequin Shrimp, Sea Hares, Linckias, and Sand-Sifters are easy to oversell\n\n## Intentional limits\n- No UI, staff, category, popup, or animation code was touched in this pass.\n- This remains a **merge-safe catalog/content lane build**.\n\n## Best next pass\n1. Other Fish specialty pass\n2. Minor cleanup of any still-generic leftovers in small-fish groups\n3. Human spot-check of newly enriched invert entries\n'''
(ROOT/'LTC_V0096_Rabbitfish_Inverts_Report.md').write_text(report, encoding='utf-8')

