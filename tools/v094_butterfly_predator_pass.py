import json, os, re
from pathlib import Path

BASE = Path('/mnt/data/v093_work')

WRAPPERS = {
    'butterflyfish': 'Butterflyfish',
    'eels': 'Eels',
    'lionfish': 'Lionfish',
}

updates = {
    'butterflyfish': {
        'copperband-butterfly': {
            'role': 'Elegant specialist butterflyfish best sold on feeding success and mature-rock foraging, not on aiptasia promises.',
            'overview': 'One of the most elegant butterflyfish in the trade and one of the easiest to oversimplify. Copperbands are prized for their long snout, deliberate picking behavior, and occasional appetite for aiptasia, but the real husbandry test is whether the fish is already feeding well on prepared foods in a mature aquarium.',
            'headerSummary': 'Elegant specialist butterflyfish best sold on feeding success and mature-rock foraging, not on aiptasia promises. Look for the slim silver body crossed by orange-copper bars and a long forceps-like snout. Plan on at least 75+ gal.',
            'behavior': 'Usually a calm, deliberate browser that spends the day probing rock, crevices, and tube-rich surfaces for tiny prey. Many settle best in peaceful systems where they are not rushed by aggressive feeders or crowded by similar long-snouted butterflyfish.',
            'feedingNotes': 'Ask the important question up front: is this exact fish taking frozen or prepared foods reliably? Mature rockwork helps, and many do better when offered small meaty foods repeatedly rather than one dramatic dump of large pieces. Aiptasia consumption is a bonus when it happens, not the entire feeding plan.',
            'buyingGuidance': 'Recommend this species when the aquarist already has a stable tank, calm tankmates, and realistic expectations. The right sale is about verified feeding response, reef goals, and patience with a species that often looks easier than it really is.',
            'recognitionNotes': 'Slim silver body with bold orange-copper bars, a dark eye stripe, and a long narrow snout built for picking prey from tight crevices.',
            'facts': [
                'Some individuals will eat aiptasia, but it should never be sold as a guaranteed fix.',
                'Feeding response on frozen or prepared food matters more than how pretty the fish looks in the bag.',
                'Peaceful, established systems usually work better than aggressive mixed tanks.'
            ],
            'bestWith': ['Established reef or FOWLR systems with mature rockwork', 'Peaceful tankmates that will not outcompete it at meals', 'Aquarists willing to verify feeding before purchase'],
            'cautionWith': ['Boisterous feeders and aggressive butterflyfish', 'Impulse buyers expecting an instant aiptasia cure', 'Tanks full of delicate worms, fan dusters, or similar ornamental pick targets'],
            'staffNote': 'Always ask whether it is already eating frozen or prepared food. Never sell the fish on aiptasia alone.'
        },
        'auriga-butterflyfish': {
            'role': 'Hardier large butterflyfish that fits best in roomy fish-only or live-rock systems rather than delicate reefs.',
            'overview': 'Auriga Butterflyfish are often one of the more forgiving large butterfly options, but they are still not a casual reef-community pick. They need space, hiding structure, and a plan for coral and sessile invertebrate risk before they become a display fish instead of a problem fish.',
            'headerSummary': 'Hardier large butterflyfish that fits best in roomy fish-only or live-rock systems rather than delicate reefs. Look for the bold eye band, trailing dorsal streamer, and active browsing posture. Plan on at least 125+ gal.',
            'behavior': 'Usually shy for the first stretch, then increasingly bold once it learns the layout of the tank. Adults stay busy, cruising between open swimming lanes and rock structure, and they do best when they are not trapped in a cramped coral-heavy layout.',
            'feedingNotes': 'This species usually does better when meals are based on a varied meaty rotation with enough frequency to keep the fish browsing productively instead of nipping out of hunger. A mature tank with hiding spots helps new arrivals settle and start feeding with less stress.',
            'buyingGuidance': 'A good recommendation for aquarists who want a large butterfly in a fish-only or mixed live-rock display and understand that reef safety is not the selling point. The sale should center on tank size, rockwork, and whether coral plans have already been ruled out.',
            'recognitionNotes': 'Round-bodied butterflyfish with a dark eye mask, bright yellow highlights, and a trailing dorsal streamer that gives the species its threadfin look.',
            'facts': [
                'Usually considered one of the more adaptable large butterflyfish in captivity.',
                'Needs room to swim and multiple hiding places while settling in.',
                'Not a dependable reef-safe choice around corals and sessile inverts.'
            ],
            'bestWith': ['Large fish-only or live-rock systems', 'Peaceful to semi-aggressive tankmates sized appropriately', 'Aquarists wanting a more robust butterfly display fish'],
            'cautionWith': ['Coral-focused reef plans', 'Tiny tanks that force constant pacing', 'Overly aggressive tankmates during acclimation'],
            'staffNote': 'Sell it as a display butterfly for space and behavior, not as a reef fish.'
        },
        'heniochus-butterfly': {
            'role': 'Banner-style butterflyfish that brings Moorish-idol drama with far more realistic aquarium prospects.',
            'overview': 'Heniochus Butterflyfish are popular because they scratch the same visual itch as a Moorish Idol without demanding the same impossible sales pitch. They still need swimming room, steady feeding, and realistic reef expectations, but many are better display candidates than their dramatic shape suggests.',
            'headerSummary': 'Banner-style butterflyfish that brings Moorish-idol drama with far more realistic aquarium prospects. Look for the black-and-white body, yellow highlights, and long pennant-like dorsal filament. Plan on at least 125+ gal.',
            'behavior': 'More open-water and visible than many round-bodied butterflyfish, often cruising the water column once settled instead of staying glued to the rock. Groups can work when introduced together in large systems, but cramped tanks turn that grace into stress fast.',
            'feedingNotes': 'Most do best on repeated small feedings of meaty marine foods with some plant matter or prepared omnivore support mixed in. As with other butterflyfish, the first question is whether the fish is eating confidently before it leaves the store.',
            'buyingGuidance': 'A strong option for aquarists who want a tall, graphic show fish and have the room for one. The right buyer is after a bold community centerpiece, not a delicate coral-safe specialty animal.',
            'recognitionNotes': 'Black-and-white body crossed by strong diagonal bars, yellow tail and back, and an elongated dorsal filament that waves like a banner.',
            'facts': [
                'Often chosen as the practical alternative to a Moorish Idol look.',
                'Needs more open swimming room than many people expect from a butterflyfish.',
                'Reef compatibility should be treated cautiously, not assumed.'
            ],
            'bestWith': ['Large community or fish-only marine systems', 'Tankmates that will not relentlessly harass slower feeders', 'Aquarists who want a visible midwater display fish'],
            'cautionWith': ['Small tanks that remove open swim lanes', 'Delicate coral plans', 'Last-minute purchases where feeding has not been observed'],
            'staffNote': 'Good banner display fish, but do not let the Moorish Idol resemblance oversell the species.'
        },
        'klein-s-butterflyfish': {
            'role': 'One of the better starter butterflyfish for fish-only systems, but still a real coral nipper.',
            'overview': "Klein's Butterflyfish has a reputation as one of the tougher, more aquarium-adaptable butterflyfish, which makes it easier to recommend than many of its relatives. That said, 'hardier' does not mean reef-safe, and soft coral or polyp grazing should be part of the conversation before it is sold as a community fish.",
            'headerSummary': "One of the better starter butterflyfish for fish-only systems, but still a real coral nipper. Look for the tan-gold body, darker facial shading, and active all-day browsing. Plan on at least 75+ gal.",
            'behavior': 'Active, visible, and often less timid than delicate specialist butterflyfish. It spends much of the day cruising rock and open water, and established fish commonly adapt to prepared feeding routines more readily than fussier species.',
            'feedingNotes': 'This is one of the butterflies that often transitions onto prepared diets more easily, but it still benefits from variety and multiple chances to feed. Omnivore-style support with meaty foods and some algae component fits the species better than treating it like a strict grazer or strict predator.',
            'buyingGuidance': 'A very reasonable first butterflyfish for the aquarist who already understands that coral nipping is part of the trade-off. Recommend it when the goal is a hardy, active butterfly in a fish-only or low-risk mixed display rather than a pristine reef showcase.',
            'recognitionNotes': 'Warm yellow-brown butterflyfish with a rounded profile, soft facial banding, and a busy, confident browsing style.',
            'facts': [
                'Often considered one of the more aquarium-friendly butterflyfish species.',
                'May sample soft corals and other fleshy reef livestock.',
                'Usually easier to feed than specialist species such as Copperbands.'
            ],
            'bestWith': ['Fish-only or lightly mixed marine systems', 'Aquarists wanting a hardier butterfly starting point', 'Tanks with enough room for constant daytime cruising'],
            'cautionWith': ['Reef tanks built around prized soft corals', 'Shoppers assuming “easy butterfly” means “reef safe”', 'Tiny or overly aggressive community setups'],
            'staffNote': 'Good first butterfly for the right buyer, but make the coral risk explicit.'
        },
        'longnose-butterflyfish': {
            'role': 'Graceful long-snouted butterflyfish that does best with calm competition and small meaty foods.',
            'overview': 'Longnose Butterflyfish are admired for their slender profile and precision feeding style. They are often more manageable than Copperbands, but their narrow snout and smaller mouth still make food size, feeding pace, and tankmate pressure important parts of long-term success.',
            'headerSummary': 'Graceful long-snouted butterflyfish that does best with calm competition and small meaty foods. Look for the bright yellow body, black face mask, and narrow forceps-like snout. Plan on at least 75+ gal.',
            'behavior': 'Usually a deliberate picker rather than a frantic swimmer, moving from crevice to crevice and pausing often to inspect holes and rock faces. Settled fish are visible and elegant, but they can lose meals to faster, rougher tankmates if the community is built poorly.',
            'feedingNotes': 'Small meaty items offered more than once per day suit the species better than oversized chunks. Many individuals adapt well once settled, but they still benefit from a calm feeding environment where faster fish do not steal everything first.',
            'buyingGuidance': 'A strong recommendation for aquarists who want a graceful display butterfly and can keep feeding competition reasonable. The sale should focus on food size, tankmate pace, and whether the buyer wants a with-caution reef fish rather than a bulletproof community species.',
            'recognitionNotes': 'Bright yellow butterflyfish with a long narrow snout, black facial mask, and a crisp white chest and belly.',
            'facts': [
                'Uses its long snout to pick worms and tiny invertebrates from narrow crevices.',
                'Often adapts better than ultra-delicate butterflyfish, but still needs feeding thoughtfulness.',
                'Best fed small meaty foods that match its mouth shape.'
            ],
            'bestWith': ['Calm community tanks with room to browse', 'Aquarists who can feed smaller foods more than once daily', 'Displays where elegance matters more than brute aggression'],
            'cautionWith': ['Aggressive feeders that outcompete delicate pickers', 'Very small tanks with no browsing structure', 'Coral plans that cannot tolerate occasional experimentation'],
            'staffNote': 'Stress food size and feeding pace; the snout is the clue to how this fish wants to eat.'
        },
        'pearlscale-butterflyfish': {
            'role': 'Beautiful rounded butterflyfish that often needs a gentler acclimation period than its looks suggest.',
            'overview': 'Pearlscale Butterflyfish are attractive, personable display fish, but many need a calmer start than the hardier beginner butterflies. They reward stable water, peaceful tankmates, and patient acclimation rather than being rushed into a high-energy reef community.',
            'headerSummary': 'Beautiful rounded butterflyfish that often needs a gentler acclimation period than its looks suggest. Look for the pale body outlined in dark netting with a warm yellow wash and eye spot near the rear. Plan on at least 75+ gal.',
            'behavior': 'Usually peaceful and watchful at first, then more confidently visible once the tank feels predictable. Like many butterflyfish, it wants a mix of open water and rock structure, not a bare box or an aggressive feeding scrum.',
            'feedingNotes': 'This is a species where acclimation and early feeding confidence matter. Offer a varied prepared diet with frozen and finely sized foods, and give new arrivals enough calm to settle before expecting nonstop show-fish behavior.',
            'buyingGuidance': 'Recommend Pearlscales when the aquarist wants a classic round-bodied butterfly and can provide a stable, lower-stress start. The right conversation is about acclimation and coral risk, not just whether the fish is pretty.',
            'recognitionNotes': 'Rounded body with dark-edged scale patterning that creates a pearl-net look, yellow highlights, and an eye spot toward the rear of the body.',
            'facts': [
                'Often needs more patience during acclimation than the tougher starter butterflyfish.',
                'Best in mature, stable tanks with peaceful companions.',
                'Not considered a dependable reef-safe choice.'
            ],
            'bestWith': ['Mature tanks with predictable feeding routines', 'Peaceful companions that will not chase it constantly', 'Aquarists comfortable giving a new fish extra settling time'],
            'cautionWith': ['High-pressure community tanks', 'Coral collections that cannot tolerate nipping', 'Buyers who expect instant bold behavior on day one'],
            'staffNote': 'Emphasize patience and acclimation. This species can be good, but it often wants a softer landing.'
        },
        'pyramid-butterflyfish': {
            'role': 'One of the better reef-oriented butterflyfish thanks to its plankton-feeding lifestyle and open-water habits.',
            'overview': 'Pyramid Butterflyfish stand apart from many butterfly relatives because they are primarily plankton feeders and are often the species people choose when they want butterflyfish looks with lower coral risk. They are still not a “set and forget” fish, but they are among the smartest butterfly choices for larger reef-minded displays.',
            'headerSummary': 'One of the better reef-oriented butterflyfish thanks to its plankton-feeding lifestyle and open-water habits. Look for the white triangular body, black head patch, and bright yellow fins. Plan on at least 125+ gal.',
            'behavior': 'More midwater and group-oriented than the constant rock-picking species. They can do well singly, in pairs, or in small groups in larger tanks, and they usually appreciate open swimming room plus caves to retreat to when startled.',
            'feedingNotes': 'Because they are planktivores by nature, several smaller feedings each day usually suit them better than one large meal. Underfed fish may become more experimental around soft coral tissue, so consistency matters even for one of the more reef-compatible butterflyfish.',
            'buyingGuidance': 'A standout recommendation for the aquarist who wants butterflyfish movement and color in a larger reef or reef-adjacent system. The right home has room, repeated feeding, and realistic expectations that “reef safe” still means “watch the individual.”',
            'recognitionNotes': 'White wedge-shaped body with a dark head patch and bright yellow dorsal, tail, and anal fins that create the pyramid look.',
            'facts': [
                'Feeds on plankton in the wild rather than specializing in coral picking.',
                'Often one of the best butterflyfish options for larger reef systems.',
                'Usually benefits from multiple smaller daily feedings.'
            ],
            'bestWith': ['Large reefs or mixed displays with open water', 'Aquarists willing to feed several times daily', 'Pairs or groups introduced thoughtfully in spacious systems'],
            'cautionWith': ['Tiny tanks with no swimming lane', 'Infrequent feeding schedules', 'Shoppers who hear “reef safe” and stop paying attention'],
            'staffNote': 'One of the best butterflyfish for reef-minded buyers, but keep the “watch the individual” language in the conversation.'
        },
        'raccoon-butterflyfish': {
            'role': 'Bold, adaptable butterflyfish for large fish-only systems, not for delicate reef livestock.',
            'overview': 'Raccoon Butterflyfish are often sold because they are hardy, visible, and quick to command attention. Those strengths are real, but so is the downside: this is one of the butterflyfish that should be treated as a fish-only or live-rock display fish, not as a polite reef ornament.',
            'headerSummary': 'Bold, adaptable butterflyfish for large fish-only systems, not for delicate reef livestock. Look for the black raccoon-like eye mask, warm yellow body, and white band behind the face. Plan on at least 125+ gal.',
            'behavior': 'Usually confident once settled and often less shy than delicate butterflies. It is an active, assertive browser that can hold its own in a community, which is part of why it works so well in larger fish-only systems.',
            'feedingNotes': 'Most do well on a broad meaty marine diet once established, but like other butterflyfish they still benefit from repeated feeding opportunities and rockwork that gives them something natural to investigate. New arrivals should still be observed eating before the sale is treated as easy.',
            'buyingGuidance': 'A very workable large butterflyfish for the aquarist building a fish-only show tank. The right buyer wants visibility and durability, and already accepts that ornamental shrimp, corals, and many sessile inverts are poor matches.',
            'recognitionNotes': 'Yellow-orange body with a black facial mask, white band behind the eye area, and darker shading across the upper body.',
            'facts': [
                'Often considered one of the hardier large butterflyfish in captivity.',
                'Poor choice for coral-heavy reef systems.',
                'Works best when sold as a display fish rather than as a problem-solving utility fish.'
            ],
            'bestWith': ['Large fish-only or live-rock systems', 'Semi-aggressive community fish of suitable size', 'Aquarists who want a hardy show butterfly'],
            'cautionWith': ['Coral-dominant reefs', 'Delicate ornamental shrimp and similar inverts', 'Under-sized tanks that limit movement'],
            'staffNote': 'Good fish-only butterfly. Be very direct that reef safety is not the point here.'
        },
        'saddleback-butterflyfish': {
            'role': 'Large, dramatic butterflyfish for spacious fish-only systems with room for an adult show fish.',
            'overview': 'Saddleback Butterflyfish grow into serious display fish, and the adult footprint matters much more than the juvenile sales size. They are best thought of as large fish-only or live-rock butterflies that need space, strong water quality, and a buyer already comfortable with coral and invertebrate risk.',
            'headerSummary': 'Large, dramatic butterflyfish for spacious fish-only systems with room for an adult show fish. Look for the bold dark saddle patch, yellow fins, and inquisitive broad-bodied profile. Plan on at least 180+ gal.',
            'behavior': 'Confident, inquisitive, and increasingly imposing as size comes on. Adults use a lot of visual space and need open lanes to turn comfortably, so this is not a fish that ages gracefully in a squeezed community layout.',
            'feedingNotes': 'A varied meaty diet with frequent smaller offerings works better than treating the species like a once-a-day grazer. Healthy adults are active browsers, and they appreciate both open cruising room and rock structure to inspect between feedings.',
            'buyingGuidance': 'Recommend this fish only when the buyer is planning around the adult animal rather than the juvenile in the bag. The right home is large, stable, and already headed toward a fish-only or very low-risk mixed display.',
            'recognitionNotes': 'Large-bodied butterflyfish with a strong dark saddle patch high on the back, yellow fins, and a broad, confident profile.',
            'facts': [
                'Gets substantially larger and more imposing than many common butterflyfish.',
                'Needs more swimming room and stronger long-term planning than mid-size species.',
                'Not suitable for coral-focused reef expectations.'
            ],
            'bestWith': ['Large FOWLR displays with open swimming space', 'Experienced marine keepers planning for adult size', 'Robust tankmates that match its eventual scale'],
            'cautionWith': ['Reef-centered builds', 'Buyers focusing only on current juvenile size', 'Small tanks with limited turning room'],
            'staffNote': 'Talk about the adult footprint first. This is not a “we will upgrade later” fish.'
        },
        'teardrop-butterflyfish': {
            'role': 'Graceful larger butterflyfish that appreciates mature rock, steady feeding, and a calmer social mix.',
            'overview': 'Teardrop Butterflyfish are striking, elegant fish that often do best when sold into mature systems with good rockwork and predictable feeding. They are not usually the roughest butterfly in the store, and they should not be treated like one just because they reach a respectable adult size.',
            'headerSummary': 'Graceful larger butterflyfish that appreciates mature rock, steady feeding, and a calmer social mix. Look for the bright yellow body, dark eye band, and distinct dark teardrop spot high on the rear flank. Plan on at least 125+ gal.',
            'behavior': 'Active during the day but usually more refined than bulldozing. They browse rock and open water alike, and they tend to fare better when housed with fish that will not constantly beat them to every meal.',
            'feedingNotes': 'Frequent varied offerings and a mature tank help this species settle into a dependable rhythm. Natural grazing opportunities on rockwork are useful, especially while a new fish is still building confidence with prepared foods.',
            'buyingGuidance': 'A very good choice for a larger fish-only or mixed live-rock display when the aquarist wants color and movement without jumping straight to the most delicate specialists. The sale should still cover coral risk and the need for a mature, well-fed system.',
            'recognitionNotes': 'Bright yellow butterflyfish with a dark eye band and a single large dark “tear” spot set high on the back half of the body.',
            'facts': [
                'Usually benefits from mature rockwork and multiple feedings while settling in.',
                'Can be a strong display species in larger established tanks.',
                'Still not a dependable no-risk reef choice.'
            ],
            'bestWith': ['Established large displays with live rock', 'Tankmates that are active but not relentlessly aggressive', 'Aquarists wanting a bold but not hyper-belligerent butterfly'],
            'cautionWith': ['Immature tanks with little natural forage', 'Fast competitive feeders during acclimation', 'Coral collections that cannot absorb experimentation'],
            'staffNote': 'A mature tank helps this species a lot. Sell it into stability, not into a brand-new system.'
        },
        'vagabond-butterflyfish': {
            'role': 'Robust larger butterflyfish that handles itself well in spacious fish-only displays.',
            'overview': 'Vagabond Butterflyfish are attractive, active, and often more durable than the delicate specialist species. They still need a large tank and realistic coral expectations, but they make sense when the buyer wants a big-patterned butterfly that can live in a stronger community than some of the shyer alternatives.',
            'headerSummary': 'Robust larger butterflyfish that handles itself well in spacious fish-only displays. Look for the white body crossed by dark chevrons, black eye band, and yellow fins. Plan on at least 125+ gal.',
            'behavior': 'Busy and visible once settled, with enough confidence to coexist with somewhat stronger tankmates than the gentle butterflies prefer. It still appreciates rock structure and breathing room, but it is not as easily overwhelmed as the more delicate feeder-first species.',
            'feedingNotes': 'A varied omnivore-leaning marine diet with repeated daily offerings usually works well. Like many larger butterflyfish, it responds well to mature systems where rockwork provides structure and supplemental browsing.',
            'buyingGuidance': 'Recommend this species when the buyer wants a sturdy show butterfly for a fish-only or mixed live-rock display. The right sale is about space, tankmate selection, and realistic acceptance that reefs and butterflyfish are still a risky combination.',
            'recognitionNotes': 'White body marked with diagonal dark chevrons, bold eye banding, and yellow dorsal, anal, and caudal fins.',
            'facts': [
                'Often considered one of the tougher larger butterflyfish choices.',
                'Can hold its own better than many shy butterfly species.',
                'Needs adult-size planning and is not a reef-safe default.'
            ],
            'bestWith': ['Large fish-only or live-rock systems', 'Semi-aggressive companions that are not outright bullies', 'Buyers seeking a durable patterned butterfly display fish'],
            'cautionWith': ['Small or crowded tanks', 'Coral-dominant reef plans', 'Shoppers assuming “hardier” means “careless”'],
            'staffNote': 'Good sturdy butterfly, but still a large adult with real coral risk.'
        },
    },
    'eels': {
        'snowflake-eel': {
            'headerSummary': 'Crustacean-focused moray that is easier than many eels, but still needs a sealed top and realistic invert expectations. Look for the cream-and-brown snowflake pattern and blunt-jawed head peeking from caves. Plan on at least 55+ gal.',
            'overview': 'The classic “starter moray” because it is usually hardier and less fish-focused than the monster predators. That reputation is fair, but it still behaves like an eel: it needs escape-proof covers, solid rockwork, and a buyer who accepts that shrimp and many crabs are always on borrowed time.',
            'role': 'Hardier crustacean-oriented moray for aquarists who want eel behavior without jumping straight to giant predator territory.',
            'recognitionNotes': 'Cream, white, and brown chain-like pattern with a chunky head and blunt teeth built more for crustaceans than fast fish.',
            'facts': ['Often one of the better morays for aquarists new to eels.', 'Still requires a tightly sealed lid and cave-heavy aquascape.', 'Decorative shrimp and crabs should be considered likely prey.'],
            'bestWith': ['Secure covered tanks with stable rockwork', 'Medium to larger fish too large to be swallowed', 'Aquarists who want interesting eel behavior with manageable size'],
            'cautionWith': ['Loose lids or plumbing gaps', 'Decorative shrimp and small crabs', 'Tiny sleeping fish that could be sampled over time'],
            'staffNote': 'Sell the lid and crustacean risk every time, even though this is the “easier” eel.'
        },
        'blue-ribbon-eel': {
            'role': 'Expert-only ribbon eel whose beauty is real, but whose feeding difficulty and escape risk are even more real.',
            'overview': 'Blue Ribbon Eels are one of the most striking marine fish in the hobby and one of the easiest rare animals to sell badly. The hard part is not admiring them; it is getting a newly imported individual to settle, stay contained, and feed consistently without starving or launching itself out of the system.',
            'headerSummary': 'Expert-only ribbon eel whose beauty is real, but whose feeding difficulty and escape risk are even more real. Look for the electric blue body, yellow dorsal highlights, and ribbon-like head posture emerging from a burrow. Plan on at least 125+ gal.',
            'behavior': 'Usually lives with most of the body hidden, showing only the head and upper body from a fixed burrow or pipe opening. It is secretive, easily stressed, and much more about specialized setup and patience than open-water activity.',
            'feedingNotes': 'This is a species where verified feeding matters enormously. They often need quiet target feeding, minimal competition, and a patient transition onto acceptable meaty foods. Systems with deep sand, buried pipes, and tight lids give them a better shot at settling instead of panicking.',
            'buyingGuidance': 'Recommend only to aquarists who already understand ribbon eel difficulty and are actively building around it. The right buyer is not chasing rarity for its own sake; they are prepared for escape prevention, food training, and a genuinely expert-level acclimation project.',
            'recognitionNotes': 'Long ribbon-like eel with vivid cobalt body color, yellow dorsal ridge, narrow head, and wide gaping mouth used for water flow over the gills.',
            'facts': ['Needs a tight lid, deep sand, and a secure den or buried pipe system.', 'Feeding success should be verified before sale whenever possible.', 'Not a good choice for competitive community feeding situations.'],
            'bestWith': ['Expert aquarists building a dedicated or carefully planned specialty system', 'Quiet tankmates that will not steal food aggressively', 'Burrow-rich layouts with pipes or stable caves and sealed tops'],
            'cautionWith': ['Beginner or impulse buyers', 'Open-topped tanks or loose lids', 'Busy predator communities where it will not get enough food'],
            'staffNote': 'Treat feeding verification as mandatory conversation, not optional trivia.'
        },
        'chainlink-eel': {
            'role': 'Manageable patterned moray that still needs classic eel security and realistic prey expectations.',
            'overview': 'Chainlink Eels appeal to buyers who want moray personality without immediately jumping to monster size. They are still true eels with escape talent, strong feeding response, and a likely appetite for ornamental crustaceans, so the sale should feel like predator planning, not novelty shopping.',
            'headerSummary': 'Manageable patterned moray that still needs classic eel security and realistic prey expectations. Look for the yellow-gold body covered in dark chainlike markings and a cave-loving head-out posture. Plan on at least 75+ gal.',
            'behavior': 'Usually stays cave-oriented and becomes most visible at feeding time, after lights shift, or once it learns the aquarium routine. Like many morays, it values secure crevices more than open swimming lanes.',
            'feedingNotes': 'Targeted meaty marine foods on tongs work well, and consistent feeding helps keep the fish predictable. Decorative shrimp and similar crustaceans should be treated as prey risk, and very small fish should not be assumed safe just because the eel looks calm by day.',
            'buyingGuidance': 'A solid recommendation for aquarists who want eel behavior in a medium-size predator setup and understand lids, gaps, and prey size. The best buyer is realistic about crustacean losses and builds the aquascape around caves instead of aesthetics alone.',
            'recognitionNotes': 'Golden to yellow-brown body traced with dark reticulated chainlike markings, giving the eel a linked-net appearance.',
            'facts': ['More manageable than giant morays, but still fully capable of escape and predation.', 'Best kept with secure cover and stable cave structure.', 'Ornamental shrimp are poor long-term tankmates.'],
            'bestWith': ['Covered tanks with dependable rock caves', 'Medium to larger compatible fish', 'Aquarists wanting an eel without a monster adult size'],
            'cautionWith': ['Open overflows and cable gaps', 'Tiny resting fish and ornamental crustaceans', 'Shoppers treating it like a decorative oddity instead of a predator'],
            'staffNote': 'Stress lid security and crustacean loss. Those are the two conversations that save headaches.'
        },
        'dragon-moray': {
            'role': 'Ultra-premium predator moray for serious large-system keepers, not casual rare-fish collectors.',
            'overview': 'Dragon Morays are spectacular, unmistakable, and completely unsuited to casual ownership. Their rarity and appearance draw people in, but the real match is a seasoned predator-keeper with a large secure system, confident feeding control, and no illusions that this is a forgiving showpiece.',
            'headerSummary': 'Ultra-premium predator moray for serious large-system keepers, not casual rare-fish collectors. Look for the hornlike nostrils, leopard patterning, and curved predatory jaws. Plan on at least 180+ gal.',
            'behavior': 'A cave-based ambush predator with a commanding presence whenever it emerges. Even when still, it reads like a serious animal, and the entire system should be planned around that level of predator intent and strength.',
            'feedingNotes': 'Feed a substantial marine meaty diet under controlled conditions with tools and routines that respect the fish’s power. Tankmates must be chosen by size and toughness, and every feeding plan should assume a serious predator rather than an ornamental eel.',
            'buyingGuidance': 'Recommend only to aquarists already comfortable with large predatory fishes and premium rare-animal responsibility. The correct buyer values containment, husbandry discipline, and adult planning over simply owning something dramatic.',
            'recognitionNotes': 'Thick-bodied moray with ornate leopard spotting, exaggerated nostril horns, and strongly arched jaws that give it a dragonlike face.',
            'facts': ['A true centerpiece predator rather than a mixed-community eel.', 'Needs a heavily secured large system and deliberate feeding control.', 'Rare status should never overshadow the practical care demands.'],
            'bestWith': ['Large predator systems with secure tops and robust aquascape', 'Experienced keepers comfortable with tong-feeding and serious predators', 'Tankmates too large and sturdy to be viewed as prey'],
            'cautionWith': ['Impulse rare-fish purchases', 'Decorative community layouts', 'Anyone underestimating adult power and prey risk'],
            'staffNote': 'Talk about system readiness first, price and rarity second.'
        },
        'golden-dwarf-moray': {
            'role': 'Small moray with big eel behavior—great for a smaller predator concept, not for lax lid discipline.',
            'overview': 'Golden Dwarf Morays are popular because they deliver authentic moray behavior in a much smaller package. That does not make them a casual nano ornament: they still need sealed tops, cave structure, and realistic expectations about shrimp and other edible invertebrates.',
            'headerSummary': 'Small moray with big eel behavior—great for a smaller predator concept, not for lax lid discipline. Look for the bright golden body and slender miniature-moray proportions around rock crevices. Plan on at least 30+ gal.',
            'behavior': 'Secretive but often bold at feeding time once established. It spends much of its day weaving through narrow crevices and peering from holes, which is exactly why even a small specimen can find a surprising escape route.',
            'feedingNotes': 'Small meaty marine foods offered by tongs work well, and a predictable feeding schedule helps the fish stay settled. Because the eel is compact, some buyers underestimate its prey drive; tiny shrimp and similarly sized edible inverts still need to be considered expendable.',
            'buyingGuidance': 'A smart recommendation for the aquarist who wants genuine moray character in a smaller specialty system. The right setup is secure, cave-rich, and built around eel behavior rather than around keeping every ornamental invert safe.',
            'recognitionNotes': 'Slender dwarf moray with a rich golden-yellow body and classic head-out-of-the-rock behavior.',
            'facts': ['Offers true moray behavior without the footprint of giant species.', 'Still requires a tightly covered system and eel-proof gaps.', 'Small ornamental shrimp are poor matches despite the eel’s modest size.'],
            'bestWith': ['Secure smaller specialty predator tanks', 'Aquarists who want eel behavior without a 4–6 foot adult', 'Medium fish and inverts too large to tempt it'],
            'cautionWith': ['Open-top nano systems', 'Tiny shrimp and micro ornamental crustaceans', 'Buyers assuming “dwarf” means “community safe”'],
            'staffNote': 'This sells well on size—make sure the buyer also hears “still an eel.”'
        },
        'jewel-moray': {
            'role': 'Striking patterned moray for experienced keepers who want a predatory centerpiece without going to giant-eel extremes.',
            'overview': 'Jewel Morays combine showy patterning with true predator behavior. They are easier to justify than the giant monsters for some systems, but they are still best sold to keepers who understand secure covers, prey-size planning, and the difference between an eel display and a community reef.',
            'headerSummary': 'Striking patterned moray for experienced keepers who want a predatory centerpiece without going to giant-eel extremes. Look for the ornate high-contrast spotting and cave-dwelling, food-driven posture. Plan on at least 125+ gal.',
            'behavior': 'Usually cave-oriented, with activity rising sharply around feeding time and lower-light periods. It reads more like a deliberate ambush predator than a constantly cruising fish, so shelter quality matters more than empty open water.',
            'feedingNotes': 'Varied meaty marine foods on tongs fit the species well, and tankmates should be sized so they are never tempting after dark. Decorative crustaceans and undersized fish should be discussed honestly before the eel is sold into a mixed system.',
            'buyingGuidance': 'Recommend Jewel Morays when the buyer wants a visually special eel and already understands the normal moray rules. The ideal home is a secure established predator or semi-predator display, not a decorative reef that just happens to have extra room.',
            'recognitionNotes': 'Pattern-rich moray with bold contrasting spots and mottling that create a jeweled, ornamental look across the body.',
            'facts': ['Showy patterning makes it a premium display eel.', 'Still needs classic moray basics: caves, cover, and prey-size planning.', 'Better suited to experienced aquarists than to first-time eel buyers.'],
            'bestWith': ['Secure covered systems with mature rockwork', 'Experienced marine keepers wanting a standout eel', 'Tankmates too large to be treated as food'],
            'cautionWith': ['Reef tanks full of prized crustaceans', 'Open-top systems', 'Shoppers treating it as a decorative oddity instead of a predator'],
            'staffNote': 'A beautiful eel, but beauty does not change the normal moray rules.'
        },
        'tessalata-eel': {
            'role': 'Massive predator moray for very large dedicated systems and very few buyers.',
            'overview': 'Tessalata Eels quickly leave the realm of “interesting eel” and enter the realm of true large predator planning. Adults are powerful, imposing, and completely unsuited to compromise systems. This is a fish for aquarists building the tank around the eel, not squeezing the eel into an existing wish list.',
            'headerSummary': 'Massive predator moray for very large dedicated systems and very few buyers. Look for the heavy-bodied form, mosaic patterning, and unmistakably serious adult scale. Plan on at least 240+ gal.',
            'behavior': 'Predatory, forceful, and increasingly dominant as size comes on. Even when resting in caves, the fish has to be viewed as a major system animal, not as a passive oddball lurking in the aquascape.',
            'feedingNotes': 'Large meaty marine foods and serious predator protocols are required. Everything from tankmate selection to aquascape security should be planned around the adult animal, because juvenile convenience disappears fast as growth and confidence increase.',
            'buyingGuidance': 'Recommend only to advanced keepers already committed to a true large predator system. This is not a “we will upgrade later” eel, and it should not be sold on novelty to someone whose tank and budget are still theoretical.',
            'recognitionNotes': 'Very large, thick-bodied moray with maze-like tessellated patterning and a deeply predatory head shape.',
            'facts': ['One of the most demanding morays simply because the adult scale is immense.', 'Needs a large, secure, predator-style system from the start.', 'Tankmate plans should assume a fish that can eventually dominate a display.'],
            'bestWith': ['Very large covered predator aquariums', 'Advanced keepers with serious long-term system plans', 'Robust tankmates chosen around massive adult size'],
            'cautionWith': ['Upgrade-later thinking', 'Mixed community or reef layouts', 'Anyone underestimating how quickly juvenile convenience disappears'],
            'staffNote': 'This is a system-defining animal. Sell it only into a system already built for one.'
        },
        'white-ribbon-eel': {
            'role': 'White phase ribbon eel with the same expert-level challenges as the blue form.',
            'overview': 'White Ribbon Eels carry all the same caveats as Blue Ribbon Eels: extreme escape risk, specialized burrow needs, and notoriously difficult feeding transitions. The color is different, but the husbandry caution is identical.',
            'headerSummary': 'White phase ribbon eel with the same expert-level challenges as the blue form. Look for the pale ribbonlike body and narrow head projecting from a deep burrow or pipe. Plan on at least 125+ gal.',
            'behavior': 'Usually spends most of its time anchored in a chosen den, extending the head and upper body into the water column. Stress, poor cover, and feeding competition can all unravel progress quickly, which is why quiet specialized systems matter so much.',
            'feedingNotes': 'Verified feeding remains the central sales question. Target feeding, deep sand, sealed tops, and low-competition layouts all improve the odds, but this is still a species that should be approached as a project, not a guaranteed success story.',
            'buyingGuidance': 'Recommend only when the buyer fully understands ribbon eel difficulty and is deliberately asking for it. The conversation should sound almost identical to Blue Ribbon Eel guidance, because the practical challenge level is essentially the same.',
            'recognitionNotes': 'Ribbonlike pale or white body with a long narrow head and habitual burrow posture, often showing only part of the animal at a time.',
            'facts': ['Same expert-level care conversation as the blue ribbon form.', 'Needs deep sand, a secure den, and a tightly sealed lid.', 'Feeding verification is one of the most important pre-sale questions.'],
            'bestWith': ['Expert aquarists building around ribbon eel needs', 'Quiet specialty systems with protected feeding opportunities', 'Layouts with sand, pipe dens, and no easy escape routes'],
            'cautionWith': ['Beginner curiosity purchases', 'Open-topped tanks', 'Fast predator communities where food competition is intense'],
            'staffNote': 'Do not let the color variation make the species sound easier than it is.'
        },
        'zebra-moray': {
            'role': 'Large, calmer moray that specializes more on crustaceans than on chasing fish, but still needs major tank planning.',
            'overview': 'Zebra Morays are often the eel people choose when they want a big, impressive specimen without the same fish-hunting profile as many other morays. That makes them appealing, but not casual: adults get very large, still need a sealed system, and still pose a major threat to crustaceans.',
            'headerSummary': 'Large, calmer moray that specializes more on crustaceans than on chasing fish, but still needs major tank planning. Look for the broad alternating dark-and-light banding and blunt head built for crushing prey. Plan on at least 125+ gal.',
            'behavior': 'Usually calmer and less frantic than many morays, spending much of the day tucked into caves and emerging more fully around feeding time. The mellow pace can fool buyers into underestimating the eventual size and strength of the fish.',
            'feedingNotes': 'Crustacean-heavy meaty foods fit the species well, and the blunt crushing teeth are the giveaway. Larger fish tankmates are often safer than with fish-eating morays, but shrimp, crabs, and similar hard-shelled prey should be considered menu items, not décor.',
            'buyingGuidance': 'A very good recommendation for the aquarist who wants a large display moray and accepts that the system has to be built around the eel. The sale should stress adult size, lid security, and the fact that “safer with fish” does not mean “easy.”',
            'recognitionNotes': 'Heavy-bodied moray with broad zebra-like dark bands and blunt jaws suited to crushing shelled prey.',
            'facts': ['Blunt teeth and jaw shape reflect a crustacean-crushing feeding style.', 'Often calmer with fish tankmates than many predatory morays.', 'Still grows into a large, powerful eel that demands planning.'],
            'bestWith': ['Large covered systems with stable rock caves', 'Bigger fish that are too large to be sampled', 'Aquarists wanting an eel with less fish-focused predation'],
            'cautionWith': ['Decorative shrimp and crabs', 'Tanks that ignore adult size', 'Anyone thinking “calmer” means “small or simple”'],
            'staffNote': 'Great big-eel option for the right buyer, but always tie the calm temperament back to adult size and crustacean risk.'
        },
    },
    'lionfish': {
        'dwarf-lionfish': {
            'headerSummary': 'Compact lionfish with big predator personality and manageable adult size. Look for the fuzzy facial tassels, broad fanlike pectorals, and perched ambush posture. Plan on at least 30+ gal.',
            'recognitionNotes': 'Short-bodied dwarf lion with shaggy facial tassels, broad pectoral fins, and a fluffy “fuzzy” look compared with sleeker lionfish species.',
            'facts': ['One of the best lionfish choices when a buyer wants the look without volitan scale.', 'Still venomous and still fully capable of eating small fish or shrimp.', 'Often spends long periods perched before exploding into feeding mode.'],
            'bestWith': ['Predator or semi-predator tanks with swallow-safe tankmates', 'Aquarists ready for venomous-spine precautions', 'Keepers wanting lionfish appeal in a medium-size footprint'],
            'cautionWith': ['Tiny ornamental fish and shrimp', 'Rough tankmates that will harass a perched predator', 'Anyone treating it like a decorative reef fish'],
            'staffNote': 'Great smaller lionfish, but keep the venom and prey-size talk front and center.'
        },
        'antennata-lionfish': {
            'role': 'Ornate medium lionfish with dramatic finnage and classic hover-and-ambush behavior.',
            'overview': 'Antennata Lionfish bring the full lionfish aesthetic—long fins, venomous spines, and poised predator body language—without the enormous bulk of a volitan. They still need room, thoughtful tankmates, and a buyer who is ready for predator feeding routines rather than passive community care.',
            'headerSummary': 'Ornate medium lionfish with dramatic finnage and classic hover-and-ambush behavior. Look for the long striped fins, elevated dorsal spines, and graceful suspended posture. Plan on at least 75+ gal.',
            'behavior': 'Usually hovers or perches in a measured, deliberate way, then turns intensely focused when food appears. It appreciates shaded rockwork and caves, but a settled fish is often very visible and theatrical in open water too.',
            'feedingNotes': 'A varied meaty marine diet and patient transition onto dependable non-live foods set the species up well. Because it is not the fastest fish in the tank, calmer feeding competition and target placement often help more than simply adding more food.',
            'buyingGuidance': 'A strong recommendation when the buyer wants a true lionfish display without committing to the scale of a volitan. The right home is predator-aware, swallow-size conscious, and comfortable with venomous-spine handling rules.',
            'recognitionNotes': 'Elegant medium lionfish with long banded fins, ornate striping, and tall venomous dorsal spines that create a very airy profile.',
            'facts': ['Offers a classic ornate lionfish look without full volitan mass.', 'Needs cave structure, calm feeding, and tankmates too large to swallow.', 'Venomous spines require careful handling during all maintenance.'],
            'bestWith': ['Predator displays with medium to larger tankmates', 'Aquarists wanting a show lionfish without a monster adult', 'Rocky layouts with shade, perches, and open water'],
            'cautionWith': ['Fast aggressive feeders', 'Small fish and ornamental shrimp', 'Casual maintenance routines that ignore venom risk'],
            'staffNote': 'Beautiful medium lionfish—sell the feeding style and venom precautions, not just the fins.'
        },
        'fu-manchu-lionfish': {
            'role': 'Cryptic specialty dwarf lionfish for calm systems and patient feeders.',
            'overview': 'Fu Manchu Lionfish are loved for their facial tassels and moody perching behavior, but they are not the easy dwarf-lion default. They tend to reward quieter systems, patient acclimation, and buyers who understand that a shy ambush predator may need time before it behaves like a show fish.',
            'headerSummary': 'Cryptic specialty dwarf lionfish for calm systems and patient feeders. Look for the pronounced moustache-like tassels, compact body, and secretive perch-under-ledges behavior. Plan on at least 55+ gal.',
            'behavior': 'Usually more secretive than the bold dwarf fuzzy types, favoring shaded ledges, caves, and low-pressure territory. Once settled it becomes a compelling perch hunter, but it is still a fish that often shows best for the keeper who waits rather than forces activity.',
            'feedingNotes': 'This species often rewards careful target feeding and patience during the transition to prepared meaty foods. Peaceful tankmates and lower competition help a lot, because it is easy for a timid Fu Manchu to lose out in a crowded feeding lane.',
            'buyingGuidance': 'Recommend to aquarists who specifically want a specialty dwarf lionfish and are willing to build a calmer, more intentional setup around it. It is not the best beginner lionfish, but it is an excellent connoisseur’s dwarf predator when matched correctly.',
            'recognitionNotes': 'Compact lionfish with elaborate moustache-like tassels around the mouth, striped fins, and a cryptic perch-ready body shape.',
            'facts': ['More secretive and specialty-oriented than easy dwarf fuzzy lionfish.', 'Often benefits from quieter tankmates and patient target feeding.', 'Still venomous and still fully capable of eating very small fish or shrimp.'],
            'bestWith': ['Calm predator or semi-predator systems', 'Aquarists happy to target feed and wait for confidence to build', 'Rocky aquascapes with shaded ledges and caves'],
            'cautionWith': ['Fast boisterous community feeders', 'Tiny fish and ornamental shrimp', 'Buyers expecting instant boldness or easy frozen-food transition'],
            'staffNote': 'Sell it as a specialty dwarf lion, not as the easiest dwarf lion.'
        },
        'radiata-lionfish': {
            'role': 'Graceful medium lionfish with elegant striping and a more refined look than the bulky giants.',
            'overview': 'Radiata Lionfish offer beautiful long-fin lionfish form in a size that stays more manageable than a volitan. They still need predator-compatible tankmates and venom respect, but they appeal strongly to buyers who want elegance and pattern rather than sheer bulk.',
            'headerSummary': 'Graceful medium lionfish with elegant striping and a more refined look than the bulky giants. Look for the crisp banding, long rays, and poised hover under ledges or in open water. Plan on at least 75+ gal.',
            'behavior': 'Often perches beneath overhangs or hovers near structure, becoming much more focused and assertive when food is introduced. It is a patient ambush hunter, not a nonstop cruiser, so it values caves and perches as much as open display space.',
            'feedingNotes': 'Varied meaty foods and calm target feeding work well, especially in mixed predator tanks where quicker fish may otherwise steal the meal. Like other lionfish, long-term success improves when the fish is on stable non-live foods rather than constantly relying on live feeders.',
            'buyingGuidance': 'A great choice for aquarists who want a lionfish with strong pattern and presence but not the footprint of a volitan. The right sale still covers venom, swallow-size limits, and the need for a more intentional feeding style.',
            'recognitionNotes': 'Elegant lionfish with strong radial striping, elongated rays, and a refined mid-size profile that looks lighter than the heavier-bodied volitans.',
            'facts': ['Smaller and more refined in appearance than a full volitan.', 'Still requires predator planning and venom awareness.', 'Benefits from caves, ledges, and feeding routines that prevent outcompetition.'],
            'bestWith': ['Medium to large predator displays', 'Aquarists who want ornate lionfish form without giant size', 'Tankmates too large to swallow and not overly aggressive at feeding time'],
            'cautionWith': ['Aggressive feeders that outcompete slower predators', 'Shrimp and miniature fish', 'Maintenance routines that ignore venomous spines'],
            'staffNote': 'Excellent mid-size lionfish when the buyer wants elegance more than maximum bulk.'
        },
        'volitan-lionfish': {
            'role': 'Large iconic lionfish centerpiece that turns a tank into a real predator display.',
            'overview': 'Volitan Lionfish are the classic full-scale lionfish: huge fins, commanding presence, and an adult size that changes the entire feel of the aquarium. They are spectacular centerpieces, but they demand a buyer who is ready for large predator consequences rather than just admiring a juvenile with flowing fins.',
            'headerSummary': 'Large iconic lionfish centerpiece that turns a tank into a real predator display. Look for the broad striped body, enormous fanlike fins, and bold open-water presence. Plan on at least 125+ gal.',
            'behavior': 'Often hides while acclimating, then becomes a dramatic open-water or mid-structure presence once comfortable. Feeding time brings a focused predatory response, and the adult fish uses a lot more visual and physical space than many buyers imagine from juvenile specimens.',
            'feedingNotes': 'A varied marine meaty diet and disciplined predator feeding routine are essential. This is also where compatibility plans live or die: if it fits in the lion’s mouth, it is eventually at risk, and that list is longer than many community buyers first assume.',
            'buyingGuidance': 'Recommend only when the aquarist is intentionally building a predator or large semi-predator display. The right conversation is about adult footprint, prey-size math, venomous-spine respect, and whether the system is truly being planned around a 15-inch centerpiece.',
            'recognitionNotes': 'Large striped lionfish with massive fanlike pectoral fins, long dorsal venom spines, and unmistakable classic lionfish proportions.',
            'facts': ['Can reach roughly 15 inches and dominate the visual scale of a display.', 'Will eat many fish and crustaceans that fit its mouth.', 'Needs more adult-planning discipline than the juvenile sales size suggests.'],
            'bestWith': ['Large predator systems with robust tankmates', 'Aquarists seeking a true centerpiece fish', 'Layouts that combine open swimming room with caves or shaded structure'],
            'cautionWith': ['Small reef fish, shrimp, and other easy prey', 'Under-sized tanks or upgrade-later thinking', 'Buyers attracted to the juvenile look without adult planning'],
            'staffNote': 'Always bring the conversation back to adult size and prey risk.'
        },
        'zebra-lionfish': {
            'role': 'Medium lionfish with crisp banding and classic perch-and-ambush behavior.',
            'overview': 'Zebra Lionfish strike a nice balance between manageability and dramatic predator style. They stay smaller than the giant volitans but still need a buyer who understands venomous spines, predator feeding, and the fact that shrimp and bite-size fish will never be safe tankmates.',
            'headerSummary': 'Medium lionfish with crisp banding and classic perch-and-ambush behavior. Look for the striped fins, leaner body, and poised perched posture. Plan on at least 55+ gal.',
            'behavior': 'Usually perches or hovers in a calculated way rather than cruising constantly. It uses structure well, often claiming favored ledges or cave mouths and then shifting into a focused hunting posture as soon as food movement appears.',
            'feedingNotes': 'A stable routine built around meaty marine foods works well, and target feeding is helpful when housed with faster or more assertive predators. Like other lionfish, success is better when the fish is confidently eating non-live foods before long-term community plans are made.',
            'buyingGuidance': 'A very good option for the aquarist who wants a true lionfish without going full volitan. The sale should still cover venom, prey-size compatibility, and the need for an intentionally predator-oriented setup.',
            'recognitionNotes': 'Striped medium lionfish with a slimmer frame than a volitan, long banded rays, and a very poised hover-or-perch stance.',
            'facts': ['Good middle-ground lionfish between tiny dwarfs and giant volitans.', 'Still fully venomous and still a threat to small fish and shrimp.', 'Does best with caves, perches, and swallow-safe tankmates.'],
            'bestWith': ['Predator or semi-predator systems with moderate-size tankmates', 'Aquarists wanting lionfish form in a more manageable adult size', 'Rockwork that provides both caves and ambush perches'],
            'cautionWith': ['Tiny fish and ornamental shrimp', 'Fast aggressive tankmates during meals', 'Anyone downplaying venomous-spine handling'],
            'staffNote': 'A nice middle-weight lionfish, but the normal lionfish rules still fully apply.'
        },
    }
}


def load_chunk(path, key):
    txt = path.read_text(encoding='utf-8')
    m = re.search(rf'window\.LTC_SPECIES_CHUNKS\["{re.escape(key)}"\]\s*=\s*(\[.*\]);\s*$', txt, re.S)
    if not m:
        raise RuntimeError(f'Could not parse {path}')
    arr = json.loads(m.group(1))
    return txt, arr

for fname, key in WRAPPERS.items():
    path = BASE / 'data' / 'species' / f'{fname}.js'
    txt, arr = load_chunk(path, key)
    idmap = {item['id']: item for item in arr}
    for item_id, patch in updates[fname].items():
        if item_id not in idmap:
            raise KeyError(f'{item_id} missing in {fname}')
        idmap[item_id].update(patch)
    new_json = json.dumps(arr, ensure_ascii=False, indent=2)
    new_txt = f'window.LTC_SPECIES_CHUNKS = window.LTC_SPECIES_CHUNKS || {{}};\nwindow.LTC_SPECIES_CHUNKS["{key}"] = {new_json};\n'
    path.write_text(new_txt, encoding='utf-8')

app = BASE / 'js' / 'app.js'
app_txt = app.read_text(encoding='utf-8').replace("const APP_VERSION = '0.093';", "const APP_VERSION = '0.094';")
app.write_text(app_txt, encoding='utf-8')

# docs
curr = BASE / 'docs' / 'summaries' / 'LTC_CURRENT_STATE.md'
curr.write_text('''# LTC Fish Browser — Current State (V0.094)\n\nUse **V0.094** as the latest working handoff build in this zip.\n\n## What changed in V0.094\n- Completed a **Butterflyfish + Eels + Lionfish** enrichment pass.\n- Replaced generic family-level text in those groups with more species-aware behavior, feeding, and buying guidance.\n- Kept the UI/staff lane untouched so this stays merge-friendly with outside work happening on staff/category issues.\n- Updated `APP_VERSION` to **0.094**.\n\n## Stable baseline reminders\n- Inventory-card photo issue was previously confirmed fixed in live use.\n- Staff-mode quarantine badge and inventory button bug were previously fixed in the V0.091 lane.\n- Fish content is being improved in parallel while UI/staff/category work can proceed separately.\n\n## Best next content lanes\n1. Pufferfish + Triggerfish specialty-predator pass\n2. Butterflyfish/lionfish spot review after human reading\n3. Premium polish pass on inverts / cleanup crew text\n4. Backend + Shopify/POS sync planning once access is available\n''', encoding='utf-8')

hist = BASE / 'docs' / 'summaries' / 'LTC_VERSION_HISTORY_COMPACT.md'
hist_txt = hist.read_text(encoding='utf-8')
if '## V0.094' not in hist_txt:
    hist_txt += '\n\n## V0.094\n- Completed a species-aware content pass for Butterflyfish, Eels, and Lionfish.\n- Replaced generic family boilerplate in those files with more individualized behavior, feeding, recognition, and buying guidance.\n- Left UI/staff/category files alone to stay parallel-work friendly.\n'
    hist.write_text(hist_txt, encoding='utf-8')

handoff = BASE / 'docs' / 'handoffs' / 'LTC_V0094_ChatGPT_Handoff.md'
handoff.write_text('''# LTC Fish Browser — ChatGPT Handoff (V0.094)\n\n## What was done\n- Continued the fish-content lane only.\n- Completed a **Butterflyfish + Eels + Lionfish** enrichment pass.\n- Rewrote generic text in those groups so the cards better reflect species-specific behavior, feeding needs, reef/invert risk, and buying fit.\n- Updated APP_VERSION to **0.094**.\n\n## Important lane separation\n- This pass intentionally **did not touch** staff/category/popup UI work so it remains easier to merge with outside UI fixes.\n\n## Best next steps\n1. Pufferfish + Triggerfish content pass\n2. Inverts / cleanup crew premium polish pass\n3. Human spot-check of the newly enriched butterflyfish and predator cards\n''', encoding='utf-8')

report = BASE / 'LTC_V0094_Butterfly_Eels_Lionfish_Report.md'
report.write_text('''# LTC Fish Browser — V0.094 Butterflyfish + Eels + Lionfish Pass\n\n## What changed\n- Updated app version to **V0.094**.\n- Reworked all **11 butterflyfish** entries with more species-aware guidance.\n- Reworked all **9 eel** entries with stronger differentiation between starter, crustacean-focused, ribbon, rare, and giant predator types.\n- Reworked all **6 lionfish** entries so the medium and specialty lions no longer read like generic copies of each other.\n\n## Goal of this pass\nThis was a content-quality pass, not a UI pass. The work focused on replacing generic family boilerplate with text that better reflects what each fish actually means to a buyer: how it behaves, how it feeds, why it succeeds or fails, and what kind of system it really belongs in.\n\n## Merge safety\n- Staff/category/popup UI files were intentionally left alone in this pass.\n- Main fish-content edits were limited to:\n  - `data/species/butterflyfish.js`\n  - `data/species/eels.js`\n  - `data/species/lionfish.js`\n\n## Best next content lanes\n1. Pufferfish + Triggerfish\n2. Inverts / cleanup crew\n3. Human review pass on high-traffic cards\n''', encoding='utf-8')
