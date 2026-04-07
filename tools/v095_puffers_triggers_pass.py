from __future__ import annotations
import json, re
from pathlib import Path

ROOT = Path('/mnt/data/v095_work')
SPECIES = ROOT / 'data' / 'species'

PUFFER_UPDATES = {
    'valentini-puffer': {
        'role': 'Sharpnose toby with constant curiosity and real reef-tradeoff baggage',
        'visualCue': 'Cream to tan sharpnose puffer with dark saddle patches, thin blue accents, and the compact pointed face typical of Canthigaster species.',
        'overview': 'A classic sharpnose toby: active, observant, and full of attitude in a small package. Valentini Puffers are easier to place than large Arothron puffers, but they are still not dependable reef fish because corals, tube worms, tiny crustaceans, and clams can all become targets.',
        'facts': [
            'One of the most interactive small puffers in the trade.',
            'Often mixed into reef systems only with full acceptance that nipping can happen.',
            'Needs a varied diet that helps keep the beak from overgrowing.'
        ],
        'bestWith': ['FOWLR or mixed systems with realistic compatibility expectations', 'keepers who want puffer personality without giant-tank size', 'rockwork-heavy tanks with room to inspect and patrol'],
        'cautionWith': ['ornamental shrimp and small mobile invertebrates', 'clam-focused or coral-prized reef displays', 'customers expecting a truly reef-safe nano show fish'],
        'staffNote': 'Great personality fish, but sell it honestly as a toby puffer with reef and invert trade-offs.',
        'headerSummary': 'Sharpnose toby with constant curiosity and real reef-tradeoff baggage. Look for cream to tan color, dark saddle patches, and the pointed Canthigaster face. Plan on at least 30+ gal.',
        'recognitionNotes': 'The dark saddle patches, blue-lined facial detail, and compact pointed toby profile separate it from larger rounder puffers.',
        'behavior': 'Usually busy from lights-on to lights-out, weaving through rockwork and checking every surface for food or novelty. Fish this size can still be surprisingly assertive with other timid nano livestock, and mature males can be territorial.',
        'feedingNotes': 'Use a varied omnivore routine with marine meaty foods, quality pellets, and harder items often enough to keep the beak naturally worn. Do not treat it like a fish that can live on only soft frozen foods long term.',
        'buyingGuidance': 'Best for keepers who want a small high-personality oddball and fully understand that “small puffer” does not mean “reef safe.” The right match is someone who values behavior and interaction more than perfect invert compatibility.'
    },
    'blue-spot-puffer': {
        'role': 'Blue-spotted toby that stays smaller than big Arothron puffers but still bites like a puffer',
        'visualCue': 'Compact Canthigaster profile with blue spotting over a pale body, quick turns, and the alert pointed face of a sharpnose puffer.',
        'overview': 'A lively sharpnose puffer with the same small-body, big-attitude appeal that makes tobys so popular. It is more practical than a giant puffer for modest systems, but the usual puffer caveats still apply: shrimp, snails, clams, and coral tissue are never guaranteed safe.',
        'facts': [
            'Small-bodied but still equipped with a true fused beak.',
            'Often bolder than its size suggests.',
            'Better approached as a specialty community fish than a casual reef add-on.'
        ],
        'bestWith': ['mature smaller predator or specialty community systems', 'keepers comfortable feeding for beak health', 'semi-aggressive fish that will not bully a small puffer'],
        'cautionWith': ['tiny ornamental inverts', 'delicate passive nano fish', 'reef buyers who only want algae-grazing cleanup crews left untouched'],
        'staffNote': 'Sell as a toby with real nipping potential, not as a mini reef puffer miracle.',
        'headerSummary': 'Blue-spotted toby that stays smaller than big Arothron puffers but still bites like a puffer. Look for blue spotting, a pointed face, and quick inquisitive movement. Plan on at least 30+ gal.',
        'recognitionNotes': 'Blue spotting and the sharpnose puffer silhouette make it read more like a toby than a chunky dogface-style puffer.',
        'behavior': 'Inquisitive and fast-moving, usually spending the day sampling rockwork, following movement outside the glass, and testing the tank for weak compatibility choices. Confidence tends to rise quickly once established.',
        'feedingNotes': 'Feed a varied meaty omnivore diet with enough hard-textured foods to keep the beak in check. These smaller puffers still need dietary variety and dental wear, not just soft convenience foods.',
        'buyingGuidance': 'A strong choice for someone who wants puffer behavior in a more manageable footprint, provided they are already comfortable with puffer rules about inverts, nipping, and beak care.'
    },
    'camel-cowfish': {
        'role': 'Oddball humpback boxfish that needs calm tankmates and careful stress management',
        'visualCue': 'Boxy body with a raised camel-like back, slow deliberate movement, and the unmistakable armored look of an ostraciid rather than a true puffer.',
        'overview': 'A strange and memorable show fish, but not a casual novelty purchase. Camel Cowfish are boxfish oddballs that do best in calm mature systems where they are not harassed, rushed, or forced to compete with rough boisterous tankmates.',
        'facts': [
            'Not a true puffer even though customers often group it with them.',
            'Stress sensitivity matters as much as diet and size.',
            'Poison concerns are why stable calm husbandry matters with boxfish and cowfish.'
        ],
        'bestWith': ['large peaceful fish-only systems', 'experienced keepers who understand boxfish stress', 'tanks with stable water and low chaos'],
        'cautionWith': ['trigger-heavy or hyper-aggressive displays', 'rough handling or rushed acclimation', 'buyers looking only at the novelty shape and not the long-term care'],
        'staffNote': 'Boxfish/cowfish rules apply here: calm tankmates, low stress, and no rough handling.',
        'headerSummary': 'Oddball humpback boxfish that needs calm tankmates and careful stress management. Look for the arched back and armored boxfish shape. Plan on at least 125+ gal.',
        'recognitionNotes': 'The humpback profile and armored body make it stand apart from horned cowfish and round puffers immediately.',
        'behavior': 'Usually deliberate, almost hovering through the tank instead of charging around it. The fish can look sturdy because of its armor, but behaviorally it is closer to a stress-sensitive oddball than a bruiser.',
        'feedingNotes': 'Feed a varied omnivore menu with marine meaty foods and some vegetable content while protecting water quality. Calm feeding conditions matter because these fish do poorly when they are constantly outcompeted.',
        'buyingGuidance': 'Best for advanced oddball keepers who already understand that boxfish success is about environment and stress control as much as it is about food or tank volume. It should never be sold as a goofy beginner centerpiece.'
    },
    'dogface-puffer': {
        'role': 'Large personable puffer that becomes a pet-like centerpiece in fish-only systems',
        'visualCue': 'Rounded face, expressive eyes, and thick-bodied Arothron build with dog-like facial proportions rather than the pointed toby look.',
        'overview': 'One of the classic large marine puffers for people who want a true personality fish. Dogface Puffers often become interactive centerpiece animals, but that charm comes with the usual puffer costs: invertebrates are food, reef safety is poor, and long-term care revolves around diet, space, and beak management.',
        'facts': [
            'Often shy at first but becomes extremely interactive once settled.',
            'Better moved in a specimen container than a net when possible.',
            'Will usually eat snails, crabs, shrimp, and other crunchy tankmates.'
        ],
        'bestWith': ['large fish-only displays', 'keepers who want a true wet-pet style fish', 'robust tankmates that are not fin-nippers'],
        'cautionWith': ['reef tanks full of inverts', 'rough net handling', 'customers underestimating adult waste load and feeding demands'],
        'staffNote': 'Great centerpiece puffer, but be blunt about inverts, waste, and beak care.',
        'headerSummary': 'Large personable puffer that becomes a pet-like centerpiece in fish-only systems. Look for the rounded dog-like face and expressive eyes. Plan on at least 125+ gal.',
        'recognitionNotes': 'The blunt rounded face and expressive “dogface” look are what separate it from porcupinefish and the sharper Arothron forms.',
        'behavior': 'Often cautious during acclimation, then transforms into a front-glass beggar that watches the room and tracks feeding routines closely. It is usually less about constant aggression and more about persistent opportunism around anything edible.',
        'feedingNotes': 'Feed a varied carnivore routine with shell-on marine foods in rotation so the fused beak stays worn. These fish are enthusiastic eaters, so feed for long-term health and dentition rather than letting “cute begging” turn into overfeeding.',
        'buyingGuidance': 'A strong fit for keepers who knowingly want a large fish-only personality animal and have filtration, space, and diet planning ready. It is a poor fit for customers hoping to “try a puffer” in a casual mixed reef.'
    },
    'longhorn-cowfish': {
        'role': 'Expert-only horned cowfish with huge personality and serious stress-sensitivity',
        'visualCue': 'Horned head, angular armored body, and floating gliding movement unlike almost anything else offered for marine aquariums.',
        'overview': 'A famous oddball for a reason, but not a forgiving one. Longhorn Cowfish combine amazing presence with real husbandry liabilities: they stress easily, need calm tankmates, grow large, and can release toxins when severely stressed.',
        'facts': [
            'One of the most recognizable marine oddballs in the hobby.',
            'Often called yellow boxfish incorrectly, which causes confusion with Ostracion cubicus.',
            'Stress and harassment are more dangerous here than customers usually realize.'
        ],
        'bestWith': ['very large calm systems', 'experienced oddball keepers', 'peaceful large fish that will not ram, chase, or harass slow boxfish'],
        'cautionWith': ['aggressive triggers or tang packs', 'cramped or chaotic aquascapes', 'buyers who just want the meme fish without the responsibility'],
        'staffNote': 'Treat as expert-only and keep the toxin/stress conversation honest.',
        'headerSummary': 'Expert-only horned cowfish with huge personality and serious stress-sensitivity. Look for the forward horns and floating armored shape. Plan on at least 180+ gal.',
        'recognitionNotes': 'The horned head, spotted tan-yellow body, and boxy drifting posture are unmistakable.',
        'behavior': 'Usually more curious than combative, moving in a hovering glide and learning routines quickly. That calm demeanor should not be mistaken for toughness—these fish do worst in rough social setups.',
        'feedingNotes': 'Feed a varied omnivore menu with mixed marine meaty foods and vegetable content while avoiding frantic feeding situations. Stable conditions and calm mealtimes matter as much as what is on the menu.',
        'buyingGuidance': 'The right home is an experienced large-tank oddball keeper who already understands cowfish stress, adult size, and the consequences of mixing one into a chaotic predator tank. It should not be sold as a cute conversation piece alone.'
    },
    'porcupine-puffer': {
        'role': 'Large long-spined porcupinefish with huge charm, huge waste output, and real crustacean appetite',
        'visualCue': 'Rounder body than a dogface puffer, obvious long spines when inflated, and a broad cartoonish face that makes it one of the hobby’s classic personality fish.',
        'overview': 'A beloved large predator with tremendous personality, but it belongs in a real big-fish plan. Porcupine Puffers become messy interactive centerpieces that need room, strong filtration, meaty foods, and tankmates that can coexist with a fish that views crabs, snails, and similar invertebrates as dinner.',
        'facts': [
            'Naturally hunts hard-shelled prey and needs that reflected in diet.',
            'Juveniles may associate with floating sargassum in the wild.',
            'Gets far larger and messier than many impulse buyers expect.'
        ],
        'bestWith': ['large fish-only predator systems', 'keepers who want a classic interactive puffer', 'robust tankmates that are not easily bullied or bitten'],
        'cautionWith': ['cleanup crews and ornamental crustaceans', 'undersized filtration', 'customers treating a juvenile as if it will stay manageable forever'],
        'staffNote': 'Fun fish, but make sure the customer is actually buying the adult lifestyle, not the baby face.',
        'headerSummary': 'Large long-spined porcupinefish with huge charm, huge waste output, and real crustacean appetite. Look for the rounded face and obvious porcupine spines. Plan on at least 180+ gal.',
        'recognitionNotes': 'The long inflatable spines and rounded porcupinefish face separate it from smoother-skinned dogface and stars-and-stripes puffers.',
        'behavior': 'Usually bold, aware of people, and food-driven, though not especially graceful. They can look clownish and slow, but they are efficient night-oriented crunchers when given suitable prey items.',
        'feedingNotes': 'Feed a varied carnivore diet built around marine meaty foods and regular shell-on items to keep the beak worn. Heavy feeding means heavy filtration, so nutrition and system design need to be considered together.',
        'buyingGuidance': 'Excellent for customers who truly want a large wet-pet predator and already have the system for it. Poor fit for reef keepers, cleanup-crew lovers, or anyone trying to squeeze a show puffer into a medium tank.'
    },
    'saddle-valentini-puffer': {
        'role': 'Small saddle-pattern toby with puffer attitude and no promise of reef safety',
        'visualCue': 'Compact sharpnose puffer with saddle markings, pointed face, and quick stop-and-go movement through rockwork.',
        'overview': 'This smaller toby type is all about interaction and curiosity, not peaceful cleanup-crew coexistence. It fits where giant puffers cannot, but it still brings the same core puffer rules about beak care, coral nipping, and invertebrate risk.',
        'facts': [
            'A small puffer with real oddball appeal.',
            'Much easier to house than a giant puffer, but not automatically easier to mix.',
            'Needs the same honesty about shrimp, snails, and clam risk as other tobys.'
        ],
        'bestWith': ['specialty smaller FOWLR setups', 'keepers who want personality in a moderate-size tank', 'semi-aggressive community fish that will not terrorize a small puffer'],
        'cautionWith': ['ornamental shrimp and tiny snails', 'high-value coral collections', 'customers assuming “small” means “safe”'],
        'staffNote': 'Sell like a true toby puffer, not like a quirky reef nano fish.',
        'headerSummary': 'Small saddle-pattern toby with puffer attitude and no promise of reef safety. Look for compact size, pointed face, and saddle markings. Plan on at least 30+ gal.',
        'recognitionNotes': 'Saddle markings and a pointed Canthigaster profile identify it as a toby rather than a large round-bodied puffer.',
        'behavior': 'Confident for its size and usually in motion, checking crevices and watching the room. These fish can seem charmingly busy right up until they decide a decorative invert or coral edge needs to be tested.',
        'feedingNotes': 'Offer a varied omnivore routine that includes enough hard-textured foods to keep the beak trimmed naturally. Routine variety matters more than one favorite frozen food used over and over.',
        'buyingGuidance': 'A good specialty choice for someone who wants a smaller personality fish and already understands toby trade-offs. It is not the right answer for a customer who needs guaranteed reef safety.'
    },
    'spiny-box-puffer': {
        'role': 'Nocturnal box puffer oddball that needs room, crustacean-heavy feeding, and realistic expectations',
        'visualCue': 'Rounded body with short stout spines, slower hovering movement, and a boxy armored look that reads more oddball than sleek predator.',
        'overview': 'A distinctive oddball often bought for its look before its care is understood. Spiny box puffers need roomy systems, meaty foods, and tankmates chosen around their slower, more deliberate pace and their tendency to eat crustaceans and other vulnerable invertebrates.',
        'facts': [
            'An oddball feeder better suited to specialty systems than mixed reefs.',
            'More about deliberate crunching than flashy speed.',
            'Adult size and feeding style make it a serious long-term commitment.'
        ],
        'bestWith': ['large specialty or fish-only systems', 'keepers who enjoy unusual morphology fish', 'calmer robust tankmates that will not harass a slower oddball'],
        'cautionWith': ['ornamental shrimp and crabs', 'small crowded rock mazes', 'customers wanting a set-and-forget beginner puffer'],
        'staffNote': 'Good conversation fish, but do not undersell the size and oddball care needs.',
        'headerSummary': 'Nocturnal box puffer oddball that needs room, crustacean-heavy feeding, and realistic expectations. Look for the short spines and armored oddball shape. Plan on at least 125+ gal.',
        'recognitionNotes': 'The squat boxy form with short projecting spines gives it a rougher, stranger look than smooth boxfish or long-spined porcupinefish.',
        'behavior': 'Usually deliberate and more interested in methodical foraging than racing around the tank. It tends to work the bottom and structure with a slow, heavy oddball presence.',
        'feedingNotes': 'Feed a varied carnivore routine with crustacean-rich marine foods and enough hard texture to support proper beak wear. Stable water and controlled feeding competition matter because these fish are not elegant swimmers.',
        'buyingGuidance': 'Best for customers who want a genuine oddball predator and have a large stable system ready. Poor fit for reef customers or anyone expecting the convenience of a small community puffer.'
    },
    'stars-and-stripes-puffer': {
        'role': 'Huge stars-and-stripes show puffer that belongs in a serious big-predator plan',
        'visualCue': 'White spots across the upper body, striped lower body, and a thick massive Arothron build that reads like a heavyweight version of the dogface group.',
        'overview': 'A dramatic large puffer that becomes a true showpiece only when the tank is built around it. This species combines size, appetite, waste output, and beak-management needs at a level that pushes it firmly into large-system territory.',
        'facts': [
            'Named for the split pattern of spots above and stripes below.',
            'Can outgrow casual “big tank” assumptions quickly.',
            'Demands the same hard-food beak maintenance as other large puffers.'
        ],
        'bestWith': ['very large fish-only systems', 'experienced keepers comfortable with giant puffers', 'robust companions that will not nip at a slow thick-bodied puffer'],
        'cautionWith': ['reef invertebrates and cleanup crews', 'weak filtration', 'buyers who love the pattern but are not ready for a true heavyweight puffer'],
        'staffNote': 'Treat as a serious adult project fish, not just a prettier dogface.',
        'headerSummary': 'Huge stars-and-stripes show puffer that belongs in a serious big-predator plan. Look for white spotting above, striping below, and a thick heavyweight body. Plan on at least 180+ gal.',
        'recognitionNotes': 'The split pattern is the giveaway: star-like white spotting on top and horizontal striping below.',
        'behavior': 'Usually bold and food-oriented, though not especially agile. Its size and confidence often make it the tank’s center of gravity, even when it is not the most overtly aggressive fish present.',
        'feedingNotes': 'Feed a varied carnivore routine with frequent shell-on marine foods to keep the beak worn. Because these fish are large, messy, and enthusiastic eaters, every feeding choice shows up in filtration demand.',
        'buyingGuidance': 'Appropriate for customers building a large dedicated predator or fish-only display who actually want a giant puffer as the centerpiece. It is a bad recommendation for “maybe we can make it work” reef plans.'
    },
    'yellow-boxfish': {
        'role': 'Juvenile-yellow boxfish oddball that needs peaceful tankmates and low-stress care',
        'visualCue': 'Box-shaped body with bright yellow juvenile coloration and darker spotting, changing substantially as it matures.',
        'overview': 'One of the most charming juvenile oddballs in the trade, but also one of the easiest to underestimate. Yellow Boxfish need peaceful surroundings, careful long-term planning, and the same stress awareness that makes all boxfish a more specialized recommendation than their cute appearance suggests.',
        'facts': [
            'Juveniles are bright yellow and can look very different from adults.',
            'Customers often confuse this fish with longhorn cowfish naming.',
            'Peaceful tankmate selection matters a lot more than people expect.'
        ],
        'bestWith': ['peaceful larger systems', 'experienced hobbyists comfortable with oddballs', 'mature tanks with stable water and gentle community structure'],
        'cautionWith': ['hyper-aggressive or fast predator mixes', 'buyers purchasing for juvenile color alone', 'systems where stress and chasing are likely'],
        'staffNote': 'Great oddball when placed correctly; bad fit when sold only on the cute yellow juvenile stage.',
        'headerSummary': 'Juvenile-yellow boxfish oddball that needs peaceful tankmates and low-stress care. Look for the box shape and spotted yellow juvenile pattern. Plan on at least 125+ gal.',
        'recognitionNotes': 'The juvenile stage is the familiar bright yellow spotted cube, while adults darken and lose much of the toy-like look customers expect.',
        'behavior': 'Usually peaceful and deliberate, with a hovering style that makes it look easygoing rather than competitive. That calm behavior is exactly why rough communities can overwhelm it.',
        'feedingNotes': 'Use a varied omnivore routine with marine meaty foods and naturalistic variety while making sure the fish is not bullied away from food. Boxfish do best when the whole system is built to keep stress low.',
        'buyingGuidance': 'Best for keepers who understand oddball fish and want a peaceful specialty display, not a rough predator tank. The sale should focus on the adult animal and its stress sensitivity, not just the adorable juvenile color.'
    }
}

TRIGGER_UPDATES = {
    'bluejaw-trigger': {
        'role': 'Open-water Xanthichthys trigger with color, movement, and a gentler reputation than bruiser triggers',
        'visualCue': 'Streamlined trigger profile with blue facial accents and yellow fin edging, moving more like a midwater cruiser than a rock-hopping brawler.',
        'overview': 'One of the better-known “safer” trigger options, though safer is not the same as harmless. Bluejaw Triggers are open-water planktivore-style triggers that usually show less rock-bashing aggression than clown, queen, or undulated triggers, but they still need a large stable system and realistic expectations around shrimps, crabs, and assertive tankmates.',
        'facts': [
            'Male blue facial color is the feature most customers notice first.',
            'Generally calmer than many classic trigger bruisers.',
            'Still needs size, diet structure, and room to behave like a trigger.'
        ],
        'bestWith': ['large mixed predator or big-fish community systems', 'customers wanting a trigger with more midwater behavior', 'robust fish that suit a large active display'],
        'cautionWith': ['small crustacean-heavy reef displays', 'undersized tanks that force constant territorial contact', 'customers interpreting “reef safer” as “reef safe with everything”'],
        'staffNote': 'Good trigger gateway fish, but keep the word “relatively” in every compatibility conversation.',
        'headerSummary': 'Open-water Xanthichthys trigger with color, movement, and a gentler reputation than bruiser triggers. Look for blue facial color and yellow-edged fins. Plan on at least 180+ gal.',
        'recognitionNotes': 'Slimmer than many triggers, with blue cheek/throat color on males and a more midwater cruising posture.',
        'behavior': 'Usually spends more time in open water than many substrate-working triggers. It tends to read as active and confident rather than destructive, but crowded setups can still turn that confidence into persistent pushiness.',
        'feedingNotes': 'Feed a varied carnivore/planktivore menu with frozen meaty foods, quality pellets, and occasional harder items. It should be fed like an active midwater trigger, not like a sedentary cave predator.',
        'buyingGuidance': 'A strong recommendation for customers who want triggerfish color and personality without jumping to the most aggressive species. It still belongs in a genuinely large system with realistic shrimp and crab expectations.'
    },
    'bursa-trigger': {
        'role': 'Stockier rock-working trigger with more classic territorial trigger behavior',
        'visualCue': 'Thick-bodied trigger with a sturdy head and deliberate stop-start movement through caves and rock structure.',
        'overview': 'A more traditional trigger personality than the open-water Xanthichthys group. Bursa Triggers settle into rockwork, claim space, and become bolder over time, making them better suited to fish-only or assertive mixed displays than to delicate community experiments.',
        'facts': [
            'Usually becomes more territorial as it settles in.',
            'Hard-shelled foods help support proper jaw wear.',
            'Not the first trigger to recommend when someone asks for “peaceful.”'
        ],
        'bestWith': ['fish-only systems with assertive larger tankmates', 'keepers already comfortable with trigger temperament', 'rockwork-rich tanks with secure caves'],
        'cautionWith': ['ornamental crustaceans', 'timid tankmates', 'reef buyers wanting a show trigger with low conflict risk'],
        'staffNote': 'Sell more like a classic territorial trigger than a gentle planktivore trigger.',
        'headerSummary': 'Stockier rock-working trigger with more classic territorial trigger behavior. Look for a thick body and deliberate cave-oriented movement. Plan on at least 125+ gal.',
        'recognitionNotes': 'Compared with the open-water triggers, this fish reads thicker, more bottom-aware, and more obviously built to work rock and structure.',
        'behavior': 'Often claims caves and patrol areas once comfortable. It is not always the tank tyrant, but it behaves like a trigger that knows where home base is and expects other fish to respect it.',
        'feedingNotes': 'Offer a varied meaty routine with quality frozen foods, pellets, and shell-on items often enough to support jaw wear. As with many triggers, diet and enrichment help channel chewing behavior productively.',
        'buyingGuidance': 'Better for customers already planning around trigger temperament than for those just shopping by color. A good fit in a robust fish-only display, a weak fit in delicate mixed communities.'
    },
    'clown-trigger': {
        'role': 'Showpiece trigger with spectacular juvenile color and very serious adult attitude',
        'visualCue': 'Black body with large white spots below, yellow patterning above, and a face that looks dramatic even from across the room.',
        'overview': 'One of the hobby’s most famous triggerfish and one of the easiest to underestimate when small. Clown Triggers often begin as manageable flashy juveniles and mature into extremely forceful adults that need very large quarters, equally robust companions, and a keeper willing to plan for the fish they become rather than the fish they are today.',
        'facts': [
            'Juveniles often sell on looks before adult temperament is discussed enough.',
            'Adults are solitary reef predators in nature.',
            'This is a long-term aggression and size planning fish, not a casual conversation piece.'
        ],
        'bestWith': ['very large predator displays', 'keepers already comfortable with highly assertive marine fish', 'tankmates chosen around a future dominant trigger'],
        'cautionWith': ['community reef expectations', 'ornamental invertebrates', 'customers buying a juvenile without a real adult plan'],
        'staffNote': 'Always sell the adult clown trigger, not the baby clown trigger.',
        'headerSummary': 'Showpiece trigger with spectacular juvenile color and very serious adult attitude. Look for the black, white-spotted, and yellow contrast pattern. Plan on at least 180+ gal.',
        'recognitionNotes': 'The black body, large white lower-body spots, yellow upper patterning, and bright face are unmistakable among marine triggers.',
        'behavior': 'Often escalates with size from bold to openly dominant. Adults usually behave like singular predator fish, claiming space and testing tankmates much more aggressively than their juvenile stage suggests.',
        'feedingNotes': 'Feed a varied carnivore routine with chunky marine meaty foods, shell-on items, and large-fish pellets. The point is not only growth but giving a hard-jawed predator the diet structure it is built for.',
        'buyingGuidance': 'Appropriate only for customers who genuinely want a dominant large trigger as part of a serious long-term predator plan. It should never be positioned as a “maybe it will stay nice” show fish.'
    },
    'crosshatch-trigger': {
        'role': 'High-end open-water trigger prized for color, movement, and comparatively refined behavior',
        'visualCue': 'Crosshatched scale pattern with vivid blue and yellow accents, especially striking on males, plus a slimmer open-water trigger profile.',
        'overview': 'A premium trigger choice that appeals to aquarists who want beauty and movement without jumping to the most destructive or belligerent species. Crosshatch Triggers are still large, expensive, and demanding fish, but they usually behave more like active open-water planktivores than classic bulldozer triggers.',
        'facts': [
            'Male and female coloration differs, with males especially vivid.',
            'One of the most sought-after Xanthichthys triggers.',
            'Still a very large-system fish despite its gentler reputation.'
        ],
        'bestWith': ['large premium fish displays', 'keepers who value open-water trigger behavior', 'well-oxygenated big systems with strong flow and room'],
        'cautionWith': ['small crowded rock piles', 'customers equating price with ease', 'reef tanks loaded with vulnerable decorative crustaceans'],
        'staffNote': 'Upscale fish, but keep the “still a giant trigger” warning in the conversation.',
        'headerSummary': 'High-end open-water trigger prized for color, movement, and comparatively refined behavior. Look for the crosshatched pattern and vivid blue-yellow accents. Plan on at least 240+ gal.',
        'recognitionNotes': 'The crosshatched scales and colored fins make it one of the most visually distinctive open-water triggers in the trade.',
        'behavior': 'Usually cruises rather than camps in one cave all day, reading more as a show swimmer than a rock rearranger. That said, it still has trigger confidence and should not be treated like a peaceful reef fish.',
        'feedingNotes': 'Feed a broad carnivore/planktivore menu with high-quality frozen foods, pellets, and varied meaty items. Good flow, good oxygenation, and disciplined feeding all help this fish look and act its best.',
        'buyingGuidance': 'Best for advanced customers building a premium large-fish display and specifically wanting a Xanthichthys trigger. Excellent when bought intentionally, poor when bought only because it looks “nicer” than other triggers.'
    },
    'niger-trigger': {
        'role': 'Large active trigger that behaves more like a current-water feeder than a cave-bound bruiser',
        'visualCue': 'Deep-bodied dark trigger with active open-water movement and a forked tail that hints at its stronger swimming style.',
        'overview': 'Niger Triggers are often sold simply as hardy aggressive triggers, but their real personality is more interesting than that. In the wild they form aggregations and feed in current-swept reef areas, so in aquaria they often come across as active water-column fish that still need real trigger-compatible tankmate planning.',
        'facts': [
            'Wild behavior includes schooling or aggregating to feed on zooplankton.',
            'Still fully capable of the usual trigger jaw work and invertebrate trouble.',
            'Can shift from manageable to rough if cramped or mixed badly.'
        ],
        'bestWith': ['large active fish-only systems', 'keepers wanting a more open-water trigger look', 'big tanks with both swimming room and secure shelter'],
        'cautionWith': ['small decorative crustaceans', 'tiny passive tankmates', 'buyers assuming a juvenile niger will stay community-friendly forever'],
        'staffNote': 'Frame it as a big active trigger with planktivore roots, not just a generic cave bruiser.',
        'headerSummary': 'Large active trigger that behaves more like a current-water feeder than a cave-bound bruiser. Look for the dark body, active swimming, and forked tail. Plan on at least 180+ gal.',
        'recognitionNotes': 'The darker body, streamlined tail, and active water-column posture separate it from chunkier reef-cave triggers.',
        'behavior': 'Frequently out in the water column and often less cave-bound than customers expect. It still becomes more forceful with size, especially where space, food competition, or tankmate choice are poor.',
        'feedingNotes': 'Use a varied carnivore menu with quality frozen marine foods, pellets, and regular harder items. Because it is an active feeder, steady structured feeding tends to work better than random oversized treats.',
        'buyingGuidance': 'A strong fit for customers who want a hardy large trigger and have the room to let it swim, not just hide. The right setup still plans around a triggerfish mouth, triggerfish attitude, and crustacean losses.'
    },
    'picasso-trigger': {
        'role': 'Iconic humu trigger with bold pattern, big personality, and classic trigger cave behavior',
        'visualCue': 'Angular head and unmistakable blue-yellow-black Picasso patterning over a sturdy compact trigger body.',
        'overview': 'A classic triggerfish for customers who want obvious personality and one of the hobby’s best-known patterns. Picasso Triggers are hardy and engaging, but they also move rock, claim caves, chew hard foods, and can become distinctly territorial once settled.',
        'facts': [
            'One of the hobby’s best-known triggers by pattern alone.',
            'Often rearranges rock and substrate while exploring.',
            'Needs hard meaty foods to help wear the teeth properly.'
        ],
        'bestWith': ['assertive fish-only systems', 'keepers who want a classic trigger centerpiece', 'secure rockwork with caves and room to patrol'],
        'cautionWith': ['shrimp, crabs, and similar inverts', 'delicate community fish', 'customers wanting a “reef trigger” because the pattern is pretty'],
        'staffNote': 'Very sellable fish, but do not let the pretty face hide the trigger behavior talk.',
        'headerSummary': 'Iconic humu trigger with bold pattern, big personality, and classic trigger cave behavior. Look for the angular body and Picasso-style blue-yellow markings. Plan on at least 125+ gal.',
        'recognitionNotes': 'The Picasso/humu face pattern is the immediate giveaway, with angular blue and yellow lines over a compact strong trigger body.',
        'behavior': 'Usually spends plenty of time working rockwork and using caves as home base, becoming bolder as it learns the layout. It can be highly entertaining, but it very much behaves like a trigger, not like a polite reef fish.',
        'feedingNotes': 'Offer a varied meaty menu with frozen marine foods, pellets, and hard-shelled items to keep the teeth worn. Chewing is part of normal maintenance for this species, not an optional extra.',
        'buyingGuidance': 'Best for customers who specifically want classic trigger behavior and have built the tank around it. It is a poor match for reef keepers looking for harmless pattern fish.'
    },
    'pinktail-trigger': {
        'role': 'Large handsome trigger that is often calmer than the worst triggers but still fully built like one',
        'visualCue': 'Emerald to darker body tones with a vivid pink tail, strong trigger head, and a heavier build than the open-water Xanthichthys species.',
        'overview': 'A very attractive large trigger that often behaves better than clown, queen, or undulated triggers, but should still be treated as a substantial predatory fish. Pinktails need big tanks, room to turn, and tankmates chosen around a powerful omnivorous trigger with real crustacean risk.',
        'facts': [
            'Known for the bright pink tail against a darker body.',
            'Often sold as a “nicer” trigger, which can cause underplanning.',
            'Will still eat crustaceans and can still become pushy in mixed systems.'
        ],
        'bestWith': ['large fish-only systems', 'keepers wanting a handsome large trigger without peak aggression', 'robust fish communities built around adult size'],
        'cautionWith': ['small fish or ornamental crustaceans', 'tankmates that cannot handle a large assertive feeder', 'buyers hearing “milder trigger” and thinking “easy reef fish”'],
        'staffNote': 'Better-mannered does not mean mild. Keep the adult size front and center.',
        'headerSummary': 'Large handsome trigger that is often calmer than the worst triggers but still fully built like one. Look for the strong body and bright pink tail. Plan on at least 180+ gal.',
        'recognitionNotes': 'The bright pink tail against an otherwise darker body is the clear field mark customers latch onto immediately.',
        'behavior': 'Often reads as steady and confident rather than frantic or hyper-territorial, especially when compared to harsher trigger species. It still becomes a dominant feeding presence and can pressure smaller or slower fish.',
        'feedingNotes': 'Use a varied carnivore/omnivore routine with marine meaty foods, pellets, and occasional hard-shelled items. Big active trigger metabolism and jaw wear both need to be accounted for.',
        'buyingGuidance': 'A strong candidate for customers building a large showy fish-only system who want size and color without choosing the most notoriously aggressive trigger species. It still requires serious system planning.'
    },
    'queen-trigger': {
        'role': 'Massive Caribbean trigger with brilliant color and escalating adult aggression',
        'visualCue': 'Yellow-green body, blue-purple fin accents, and striking facial lines around the eye on a large fork-tailed trigger body.',
        'overview': 'A spectacular fish that belongs squarely in the serious predator category. Queen Triggers combine size, speed, attitude, and crushing jaws in a package that can dominate a tank as it matures, making them beautiful but demanding long-term residents.',
        'facts': [
            'One of the hobby’s most vividly colored large triggers.',
            'Adult size and confidence both outgrow many early plans.',
            'Not a sensible compromise trigger for medium or mixed reef systems.'
        ],
        'bestWith': ['very large predator systems', 'experienced keepers with a taste for dominant show fish', 'tankmates chosen specifically for a future large trigger hierarchy'],
        'cautionWith': ['small tankmates and inverts', 'community-style stocking', 'customers drawn only by color and not by the adult behavior'],
        'staffNote': 'Sell as a large aggressive predator project, not as a colorful upgrade over a picasso trigger.',
        'headerSummary': 'Massive Caribbean trigger with brilliant color and escalating adult aggression. Look for the forked tail, facial lines, and vivid blue-yellow tones. Plan on at least 180+ gal.',
        'recognitionNotes': 'The eye-ring facial lines, forked tail, and bright color combination separate it from the more black-and-white clown trigger look.',
        'behavior': 'Confident, active, and increasingly territorial with size. This is the kind of fish that often ends up setting the tone for the whole tank rather than fitting politely into an existing mixed community.',
        'feedingNotes': 'Feed a varied carnivore routine with substantial marine meaty foods, pellets, and shell-on items for jaw maintenance. Strong filtration and big-system nutrient control are part of feeding a queen trigger correctly.',
        'buyingGuidance': 'Best for customers intentionally building a large predator or public-display style system around a dominant show trigger. It is not the right answer for someone “moving up” one step from community fish.'
    },
    'sargassum-trigger': {
        'role': 'Red-tail Xanthichthys trigger with open-water behavior and a comparatively reef-friendlier reputation',
        'visualCue': 'Purple-toned body with darker spotting and a reddish tail, carried on the slimmer open-water build typical of Xanthichthys triggers.',
        'overview': 'Another of the better-regarded open-water trigger options for large displays. Sargassum Triggers are not harmless, but they often behave more like active planktivore cruisers than rock-smashing territorial bruisers, which makes them appealing for customers wanting movement and trigger presence without jumping straight to the roughest species.',
        'facts': [
            'Also commonly sold as a red tail trigger.',
            'Part of the more open-water Xanthichthys trigger group.',
            'Still risky with decorative crustaceans despite the gentler reputation.'
        ],
        'bestWith': ['large mixed predator displays', 'keepers who want trigger color and midwater movement', 'big tanks with flow, swimming room, and sensible tankmate size'],
        'cautionWith': ['shrimp or crab-centered reef plans', 'small timid tankmates', 'customers mistaking relative compatibility for guaranteed reef safety'],
        'staffNote': 'Another “relative” trigger—good reputation, but only within triggerfish terms.',
        'headerSummary': 'Red-tail Xanthichthys trigger with open-water behavior and a comparatively reef-friendlier reputation. Look for the spotted purple body and reddish tail. Plan on at least 180+ gal.',
        'recognitionNotes': 'The red tail and slimmer Xanthichthys body shape make it read more like a water-column trigger than a compact cave trigger.',
        'behavior': 'Usually spends more time cruising than excavating, reading as active and display-friendly when given space. Like other open-water triggers, it still becomes a substantial fish that should not be cramped or mixed casually.',
        'feedingNotes': 'Feed a varied carnivore/planktivore routine with quality frozen marine foods, pellets, and occasional harder items. Strong current and generous swimming room help this species show its best behavior.',
        'buyingGuidance': 'A good recommendation for advanced customers wanting a showy trigger in a large mixed big-fish setup. It is one of the better-behaved trigger options, not an exception to triggerfish reality.'
    },
    'undulated-trigger': {
        'role': 'Highly territorial red-lined trigger that should be treated as a deliberate aggression project',
        'visualCue': 'Green-brown body with orange curved lines and a dark blotch at the tail base, carried on a compact muscular trigger frame.',
        'overview': 'A beautiful fish with one of the roughest reputations in the group. Undulated Triggers are territorial, intense, and often best thought of as single-show triggers or as carefully managed residents in extremely deliberate aggressive systems.',
        'facts': [
            'Often cited as one of the most aggressive common triggerfish in captivity.',
            'Hardy does not mean easy to mix.',
            'Its color and size often trick buyers into underestimating it.'
        ],
        'bestWith': ['very deliberate aggressive setups', 'experienced keepers who enjoy species with attitude', 'systems planned around one especially forceful trigger'],
        'cautionWith': ['mixed community experiments', 'small peaceful fish', 'customers wanting a “starter trigger” because it is not the largest species'],
        'staffNote': 'Treat as a problem child on purpose. Do not soften the aggression conversation.',
        'headerSummary': 'Highly territorial red-lined trigger that should be treated as a deliberate aggression project. Look for orange lines over a green-brown body and a dark tail-base blotch. Plan on at least 125+ gal.',
        'recognitionNotes': 'Curved orange body lines and the dark tail-base blotch make this one easy to pick out once you know the pattern.',
        'behavior': 'Territorial from an early age and often much more confrontational than similarly sized triggerfish. Adults in particular can become outright belligerent toward tankmates, especially where territory is limited.',
        'feedingNotes': 'Feed a varied meaty diet with shell-on foods included for jaw wear. Dietary structure matters, but no feeding strategy substitutes for choosing tankmates and tank size very carefully.',
        'buyingGuidance': 'Only for customers who knowingly want one of the rougher trigger personalities and have the setup to match. It should never be sold as a modest-size compromise trigger.'
    },
    'niger-triggerfish': {},
    'clown-triggerfish': {}
}
# duplicate aliases inherit primary text with slight summary updates for their own minTank where needed
TRIGGER_UPDATES['niger-triggerfish'] = dict(TRIGGER_UPDATES['niger-trigger'])
TRIGGER_UPDATES['clown-triggerfish'] = dict(TRIGGER_UPDATES['clown-trigger'])
TRIGGER_UPDATES['clown-triggerfish']['headerSummary'] = 'Showpiece trigger with spectacular juvenile color and very serious adult attitude. Look for the black, white-spotted, and yellow contrast pattern. Plan on at least 250+ gal.'
TRIGGER_UPDATES['clown-triggerfish']['buyingGuidance'] = 'Appropriate only for customers who genuinely want a dominant large trigger as part of a serious long-term predator plan and already have truly oversized quarters in mind. It should never be positioned as a “maybe it will stay nice” show fish.'


def load_species(path: Path):
    txt = path.read_text(encoding='utf-8')
    m = re.search(r'(window\.LTC_SPECIES_CHUNKS\[[^\]]+\]\s*=\s*)(\[.*\])(\s*;\s*)$', txt, re.S)
    if not m:
        raise RuntimeError(f'Could not parse {path}')
    prefix, arr, suffix = m.groups()
    data = json.loads(arr)
    return prefix, data, suffix


def save_species(path: Path, prefix: str, data, suffix: str):
    arr = json.dumps(data, ensure_ascii=False, indent=2)
    path.write_text(prefix + arr + suffix, encoding='utf-8')


def apply_updates(path: Path, updates: dict[str, dict]):
    prefix, data, suffix = load_species(path)
    seen = set()
    for item in data:
        uid = item['id']
        if uid in updates:
            item.update(updates[uid])
            seen.add(uid)
    missing = set(updates) - seen
    if missing:
        raise RuntimeError(f'Missing ids in {path.name}: {sorted(missing)}')
    save_species(path, prefix, data, suffix)

apply_updates(SPECIES / 'puffers.js', PUFFER_UPDATES)
apply_updates(SPECIES / 'triggerfish.js', TRIGGER_UPDATES)

app = ROOT / 'js' / 'app.js'
app_txt = app.read_text(encoding='utf-8')
app_txt = re.sub(r"const APP_VERSION = '[0-9.]+';", "const APP_VERSION = '0.095';", app_txt)
app.write_text(app_txt, encoding='utf-8')

curr = ROOT / 'docs' / 'summaries' / 'LTC_CURRENT_STATE.md'
curr.write_text('''# LTC Fish Browser — Current State (V0.095)

Use **V0.095** as the latest working handoff build in this zip.

## What changed in V0.095
- Completed a **Puffers + Triggerfish** enrichment pass.
- Replaced generic same-family text in those files with more species-aware behavior, feeding, recognition, and buying guidance.
- Kept the UI/staff/category lane untouched so this remains merge-friendly with outside work happening there.
- Updated `APP_VERSION` to **0.095**.

## Stable baseline reminders
- Inventory-card photo issue was previously confirmed fixed in live use.
- Staff-mode quarantine badge and inventory button bug were previously fixed in the V0.091 lane.
- Fish content is being improved in parallel while UI/staff/category work can proceed separately.

## Best next content lanes
1. Inverts / cleanup crew premium polish pass
2. Human review on the newer puffers, triggers, and predators
3. Specialty fish spot pass on other-fish / rabbitfish / hawkfish duplicates
4. Backend + Shopify/POS sync planning once access is available
''', encoding='utf-8')

hist = ROOT / 'docs' / 'summaries' / 'LTC_VERSION_HISTORY_COMPACT.md'
hist_txt = hist.read_text(encoding='utf-8')
if '## V0.095' not in hist_txt:
    hist_txt += '\n\n## V0.095\n- Completed a species-aware content pass for Puffers and Triggerfish.\n- Replaced generic family boilerplate in those files with more individualized behavior, feeding, recognition, and buying guidance.\n- Left UI/staff/category files alone to stay parallel-work friendly.\n'
hist.write_text(hist_txt, encoding='utf-8')

handoff_text = '''# LTC Fish Browser — ChatGPT Handoff (V0.095)

## What was done
- Continued the fish-content lane only.
- Completed a **Puffers + Triggerfish** enrichment pass.
- Rewrote generic text in those groups so the cards better reflect species-specific behavior, feeding style, adult fit, and realistic compatibility.
- Updated APP_VERSION to **0.095**.

## Important lane separation
- This pass intentionally **did not touch** staff/category/popup UI work so it remains easier to merge with outside UI fixes.

## Best next steps
1. Inverts / cleanup crew premium polish pass
2. Human review pass on the newly enriched puffers, triggers, and recent predator cards
3. Specialty-fish polish on repeat-heavy entries in other small groups
'''
(ROOT / 'docs' / 'handoffs' / 'LTC_V0095_ChatGPT_Handoff.md').write_text(handoff_text, encoding='utf-8')
(ROOT / 'LTC_V0095_Puffers_Triggerfish_Report.md').write_text('''# LTC Fish Browser — V0.095 Puffers + Triggerfish Pass

## What changed
- Updated app version to **V0.095**.
- Reworked all **10 puffer/boxfish/cowfish** entries with stronger differentiation between tobys, large Arothron puffers, porcupinefish, and stress-sensitive boxfish/cowfish oddballs.
- Reworked all **12 triggerfish** entries so the open-water Xanthichthys group, classic rock-working triggers, and high-aggression show triggers no longer read like the same fish with different names.

## Goal of this pass
This was a content-quality pass, not a UI pass. The work focused on making the cards read more like useful husbandry notes: what kind of system the fish actually belongs in, what its behavior is really like, how it should be fed, and what mistakes customers most commonly make with it.

## Merge safety
- Staff/category/popup UI files were intentionally left alone in this pass.
- Main fish-content edits were limited to:
  - `data/species/puffers.js`
  - `data/species/triggerfish.js`

## Best next content lanes
1. Inverts / cleanup crew
2. Human review pass on high-traffic cards
3. Specialty fish spot cleanup in smaller groups
''', encoding='utf-8')
(ROOT / 'LTC_V0095_ChatGPT_Handoff.md').write_text(handoff_text, encoding='utf-8')
