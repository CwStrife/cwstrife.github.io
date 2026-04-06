import os, re, json, math
from pathlib import Path

species_dir = Path('data/species')

BAD_PHRASES = [
    'Needs enrichment',
    'Roster seed',
    'catalog expansion seed',
    'not fully enriched',
    'Look for look for',
    'Image mapping should be reviewed',
    'before final rollout',
    'Scientific name, exact max size, and species-specific tank recommendation still need verification',
]

BAD_REGEXES = [
    re.compile(r'catalog expansion seed', re.I),
    re.compile(r'roster seed', re.I),
    re.compile(r'not fully enriched', re.I),
    re.compile(r'needs enrichment', re.I),
    re.compile(r'look for look for', re.I),
    re.compile(r'image mapping should be reviewed', re.I),
    re.compile(r'final rollout', re.I),
    re.compile(r'Plan around at least Needs enrichment', re.I),
    re.compile(r'Diet is [—-]', re.I),
    re.compile(r'best kept as', re.I),
]

TEXT_FIELDS = [
    'role','visualCue','overview','staffNote','headerSummary','behavior','feedingNotes','buyingGuidance','recognitionNotes',
    'role_es','overview_es', 'diet_es', 'origin_es', 'name_es'
]
LIST_TEXT_FIELDS = ['facts','bestWith','cautionWith','aliases','badges']


def load_js_array(file_path):
    raw = file_path.read_text(encoding='utf8')
    match = re.search(r'=\s*(\[[\s\S]*\])\s*;\s*$', raw)
    if not match:
        raise ValueError(f'Could not parse {file_path}')
    arr = json.loads(match.group(1))
    prefix = raw[:match.start(1)]
    suffix = raw[match.end(1):]
    return arr, prefix, suffix


def is_bad_text(s):
    if not isinstance(s, str):
        return False
    t = s.strip()
    if not t:
        return False
    for p in BAD_REGEXES:
        if p.search(t):
            return True
    return False


def has_value(v):
    return isinstance(v, str) and v.strip() and v.strip() not in {'—','Unknown','Needs enrichment'}


def num_inches(s):
    if not has_value(s):
        return None
    m = re.search(r'(\d+(?:\.\d+)?)', s)
    return float(m.group(1)) if m else None


def clean_string(s):
    if not isinstance(s, str):
        return s
    if s.strip() in {'Needs enrichment', '—'}:
        return 'Unknown'
    s = s.replace('Look for look for', 'Look for')
    s = s.replace('Look for use the', 'Use the')
    s = s.replace('look for look for', 'look for')
    s = s.replace('..', '.')
    s = re.sub(r'\s+', ' ', s)
    s = re.sub(r'\s+([.,;:])', r'\1', s)
    s = re.sub(r'\.\.+', '.', s)
    return s.strip()


def reef_phrase(entry):
    coral = entry.get('coralRisk', 0)
    invert = entry.get('invertRisk', 0)
    if coral >= 35:
        return 'Reef safety is not guaranteed, especially with corals or clam mantles.'
    if coral >= 15:
        return 'Mixed reefs should be watched closely for nipping or contact issues.'
    if invert >= 35:
        return 'Smaller ornamental invertebrates are the first compatibility concern.'
    return 'Compatibility is usually driven more by tankmates and setup than by outright reef risk.'


def difficulty_phrase(entry):
    d = entry.get('careDifficulty', 0)
    if d >= 60:
        return 'This profile fits experienced keepers with a stable, well-established system.'
    if d >= 40:
        return 'Best results come from a stable system and a buyer who already has a routine.'
    return 'Usually manageable once acclimated into a stable marine system.'


def aggression_phrase(entry):
    a = entry.get('aggression', 0)
    if a >= 70:
        return 'Temperament and stocking order matter because this is not a passive community fish.'
    if a >= 40:
        return 'It can be assertive once settled, especially with similar fish or cramped layouts.'
    return 'Temperament is usually workable in a well-planned community with sensible tankmates.'


def tank_phrase(entry, fallback='adequate long-term space'):
    tank = entry.get('minTank')
    if has_value(tank):
        return f'Plan around roughly {tank} or larger for long-term care.'
    return f'Plan around {fallback} for long-term care.'


def size_phrase(entry):
    size = entry.get('maxSize')
    if has_value(size):
        return f'Adult size in this catalog is listed around {size}.'
    return ''


def diet_phrase(entry):
    diet = entry.get('diet')
    if has_value(diet):
        return f'Diet in this catalog: {diet}.'
    return 'Feeding should match the species, not just the category label.'


def base_group(entry, filename):
    name = entry.get('name','').lower()
    sci = entry.get('scientific','').lower()
    cat = entry.get('category','').lower()
    max_in = num_inches(entry.get('maxSize'))
    role = entry.get('role','').lower() if isinstance(entry.get('role'), str) else ''
    file = filename.lower()

    if 'angelfish' in cat or 'angel' in file:
        if max_in is not None and max_in <= 6 or 'centropyge' in sci or 'dwarf' in name or 'dwarf' in role:
            return 'dwarf_angel'
        return 'large_angel'
    if 'anthias' in cat:
        return 'anthias'
    if 'basslet' in cat or 'dottyback' in cat:
        return 'basslet_dottyback'
    if 'butterfly' in cat:
        return 'butterfly'
    if 'cardinal' in cat:
        return 'cardinal'
    if 'clownfish' in cat:
        return 'clownfish'
    if 'damsel' in cat or 'chromis' in name:
        return 'damsel'
    if 'eel' in cat or 'moray' in name or 'ribbon eel' in name:
        return 'eel'
    if 'hawkfish' in cat:
        return 'hawkfish'
    if 'lionfish' in cat:
        return 'lionfish'
    if 'puffer' in cat or 'boxfish' in cat or 'cowfish' in cat:
        return 'puffer'
    if 'rabbitfish' in cat or 'foxface' in name:
        return 'rabbitfish'
    if 'tang' in cat or 'surgeonfish' in name:
        return 'tang'
    if 'triggerfish' in cat or 'trigger' in name:
        return 'trigger'
    if 'wrasse' in cat:
        if 'fairy' in name or 'flasher' in name:
            return 'fairy_flasher_wrasse'
        if 'leopard' in name:
            return 'leopard_wrasse'
        if 'cleaner' in name:
            return 'cleaner_wrasse'
        if 'tusk' in name:
            return 'tusk'
        if any(k in name for k in ['coris','lunare','banana','bird','dragon']):
            return 'large_wrasse'
        if 'possum' in name or 'pygmy' in name:
            return 'small_wrasse'
        return 'wrasse'
    if 'goby' in name or 'jawfish' in name or 'dragonet' in name or 'mandarin' in name or 'blenny' in name:
        if 'jawfish' in name:
            return 'jawfish'
        if 'dragonet' in name or 'mandarin' in name or 'scooter' in name:
            return 'dragonet'
        if 'fang blenny' in name:
            return 'fang_blenny'
        if 'blenny' in name:
            return 'blenny'
        if 'watchman' in name or 'prawn goby' in name or 'shrimp goby' in name:
            return 'watchman_goby'
        if 'clown goby' in name:
            return 'clown_goby'
        return 'goby'
    if any(k in name for k in ['filefish']):
        return 'filefish'
    if any(k in name for k in ['angler']):
        return 'angler'
    if any(k in name for k in ['waspfish','leaf fish']):
        return 'waspfish'
    if 'comet' in name or 'marine betta' in name:
        return 'comet_betta'
    if 'grouper' in name:
        return 'grouper'
    if 'hogfish' in name:
        return 'hogfish'
    return 'marine_fish'



FORCE_TEXT_REWRITE_GROUPS = {'dragonet','jawfish','watchman_goby','clown_goby','fang_blenny','filefish','angler','waspfish','comet_betta','grouper','hogfish','tusk','large_wrasse','cleaner_wrasse','leopard_wrasse','fairy_flasher_wrasse','small_wrasse'}
FORCE_VISUAL_REWRITE_GROUPS = {'filefish','angler','waspfish','comet_betta','grouper','hogfish','tusk','large_wrasse','dragonet'}

def make_role(entry, group):
    custom = entry.get('role')
    if has_value(custom) and not is_bad_text(custom):
        return clean_string(custom)
    roles = {
        'dwarf_angel': 'Compact dwarf angelfish with strong color and rockwork-focused activity',
        'large_angel': 'Large angelfish with centerpiece presence and bigger-system requirements',
        'anthias': 'Open-water planktivore built for movement, color, and frequent feeding',
        'basslet_dottyback': 'Rockwork-oriented cave fish with strong color and a territorial streak',
        'butterfly': 'Display butterflyfish whose feeding response and reef plans matter before the sale',
        'cardinal': 'Calm hovering fish that adds motion without dominating the tank',
        'clownfish': 'Hardy clownfish profile with strong territory and host-oriented behavior',
        'damsel': 'Small, bright damsel profile with more attitude than its size suggests',
        'eel': 'Predatory eel profile built around caves, escape prevention, and feeding response',
        'goby': 'Small bottom-oriented fish that adds movement without taking over the tank',
        'clown_goby': 'Tiny perch-and-pivot goby suited to peaceful reef layouts',
        'watchman_goby': 'Bottom-dwelling goby that appreciates sand, cover, and a calm layout',
        'jawfish': 'Burrow-building fish that needs a secure substrate and a covered tank',
        'dragonet': 'Pod-focused dragonet profile that rewards mature systems and careful feeding plans',
        'blenny': 'Personality-heavy blenny that spends the day perching, grazing, and inspecting rockwork',
        'fang_blenny': 'Slim blenny with attitude, speed, and stronger compatibility questions than most perchers',
        'hawkfish': 'Perching ambush fish with character and real shrimp-compatibility questions',
        'lionfish': 'Venomous predator with dramatic finnage and deliberate feeding behavior',
        'waspfish': 'Cryptic ambush fish kept for oddball appeal rather than nonstop swimming',
        'filefish': 'Unusual display fish whose feeding behavior and compatibility need to be discussed first',
        'angler': 'Ambush predator with specialist feeding and strong tankmate limitations',
        'comet_betta': 'Shy cave-oriented oddball with elegant finnage and slow, deliberate movement',
        'grouper': 'Juvenile display predator that needs honest discussion about long-term size',
        'hogfish': 'Active, assertive fish that blends wrasse-like motion with a more robust build',
        'puffer': 'Interactive puffer profile with beak care and invertebrate compatibility trade-offs',
        'rabbitfish': 'Roomy algae grazer with calm behavior and venomous dorsal spines',
        'tang': 'Active surgeonfish built for swimming room, grazing, and long-term space',
        'trigger': 'Alert triggerfish with strong display presence and bigger-system needs',
        'fairy_flasher_wrasse': 'Colorful open-water wrasse that shines in covered, peaceful reef systems',
        'leopard_wrasse': 'Sand-sleeping wrasse that does best in mature, settled reef systems',
        'cleaner_wrasse': 'Specialist wrasse whose long-term success depends on careful husbandry and feeding response',
        'tusk': 'Bold, heavy-bodied wrasse with strong color and real invertebrate risk',
        'large_wrasse': 'Fast, visible wrasse with more size and attitude than the smaller reef-safe types',
        'small_wrasse': 'Small rockwork-oriented wrasse that adds motion without becoming the tank bully',
        'wrasse': 'Active wrasse profile with strong movement and a need for a covered tank',
        'marine_fish': 'Marine fish profile that should be matched to tank size, diet, and temperament'
    }
    return roles.get(group, roles['marine_fish'])


def make_visual(entry, group):
    current = entry.get('visualCue')
    if has_value(current) and not is_bad_text(current) and group not in FORCE_VISUAL_REWRITE_GROUPS and 'overall body shape' not in current.lower() and 'common to wrasses' not in current.lower():
        return clean_string(current)
    visuals = {
        'dwarf_angel': 'Look for a deep-bodied fish with bold facial patterning, blue edging, and constant rockwork picking.',
        'large_angel': 'Look for a tall-bodied angel with broad finnage, strong facial patterning, and slow deliberate cruising.',
        'anthias': 'Look for a slim midwater swimmer with bright color, forked tail lines, and constant open-water movement.',
        'basslet_dottyback': 'Look for a compact cave fish with sharp color contrast and confident darting around rockwork.',
        'butterfly': 'Look for a thin round-bodied fish with a pointed snout and steady browsing behavior.',
        'cardinal': 'Look for a hovering fish with large eyes, upright posture, and calm station-keeping near cover.',
        'clownfish': 'Look for the compact clownfish body, bold barring or patterning, and territory-focused hovering.',
        'damsel': 'Look for a small, fast fish with crisp color blocks and alert stop-start movement.',
        'eel': 'Look for an elongated body, cave-focused posture, and a head-first feeding response.',
        'goby': 'Look for a small bottom-oriented fish that perches, hops, or hovers close to cover.',
        'clown_goby': 'Look for a tiny perch-happy goby with a short body and a habit of sitting in branching cover.',
        'watchman_goby': 'Look for a heavier-bodied goby that watches from the sand and makes short dashes back to cover.',
        'jawfish': 'Look for a tall-headed fish that hovers vertically over a burrow and retreats in a flash.',
        'dragonet': 'Look for a low-slung fish that glides over rock and sand while pecking for tiny prey items.',
        'blenny': 'Look for a perch-and-hop body shape with expressive head movement and constant rock inspection.',
        'fang_blenny': 'Look for a slim blenny with a more torpedo-like body and quick darting movement.',
        'hawkfish': 'Look for a sturdy perching fish that watches the tank from rock ledges and coral branches.',
        'lionfish': 'Look for broad pectoral fins, extended spines, and slow stalking movement.',
        'waspfish': 'Look for a cryptic outline, perching posture, and camouflage that breaks up the body shape.',
        'filefish': 'Look for a laterally compressed body, pointed snout, and deliberate stop-start swimming.',
        'angler': 'Look for a chunky ambush body with a huge mouth and a tendency to sit still between lunges.',
        'comet_betta': 'Look for a dark cave fish with long finnage and bold ocellus-style markings.',
        'grouper': 'Look for a heavier-bodied predator with a broad mouth and steady, confident cruising.',
        'hogfish': 'Look for a longer wrasse-like body with a thicker head and more robust build.',
        'puffer': 'Look for a rounded body, expressive eyes, and a beak-like mouth that gives the fish a curious look.',
        'rabbitfish': 'Look for the foxface/rabbitfish body shape, steady grazing passes, and upright dorsal profile.',
        'tang': 'Look for a disk-shaped swimmer with constant grazing passes and the surgeonfish body profile.',
        'trigger': 'Look for a deeper-bodied fish with a strong jawline, alert posture, and deliberate movement.',
        'fairy_flasher_wrasse': 'Look for a slim wrasse body, strong iridescence, and flowing dorsal or tail accents.',
        'leopard_wrasse': 'Look for a fine-spotted wrasse pattern and constant foraging close to sand and rock.',
        'cleaner_wrasse': 'Look for a slim wrasse profile and a purposeful swimming style around larger fish.',
        'tusk': 'Look for a thick-bodied wrasse with oversized teeth and bold striping or patchwork color.',
        'large_wrasse': 'Look for a long active wrasse body with strong cruising speed and broader jaws.',
        'small_wrasse': 'Look for a petite wrasse with quick dashes around rockwork and tight turns near cover.',
        'wrasse': 'Look for a slim active swimmer with quick turns and constant movement around rock and open water.',
        'marine_fish': 'Look for the overall body shape, color pattern, and swimming style together rather than any one feature.'
    }
    return visuals[group]


def make_overview(entry, group):
    current = entry.get('overview')
    if has_value(current) and not is_bad_text(current) and group not in FORCE_TEXT_REWRITE_GROUPS and 'look for use the' not in current.lower():
        return clean_string(current)
    name = entry.get('name','This fish')
    role = make_role(entry, group).lower()
    tank = entry.get('minTank')
    size = entry.get('maxSize')
    diet = entry.get('diet')
    pieces = []
    intros = {
        'dwarf_angel': f'{name} is a compact angelfish choice with strong color and constant rockwork activity.',
        'large_angel': f'{name} is a large display angelfish that needs room, stable water, and careful compatibility planning.',
        'anthias': f'{name} is an open-water planktivore that shows best in a stable system with regular feeding.',
        'basslet_dottyback': f'{name} is a small cave-oriented fish that brings color and attitude to rockwork-heavy systems.',
        'butterfly': f'{name} is a high-visibility display fish where feeding response and reef plans should be confirmed before the sale.',
        'cardinal': f'{name} is a calm hovering fish that fits best with peaceful tankmates and steady routine husbandry.',
        'clownfish': f'{name} is a clownfish profile that combines durability with strong territory and host-focused behavior.',
        'damsel': f'{name} is a small, hardy damsel that adds bright color but still deserves respect for temperament.',
        'eel': f'{name} is an eel profile built around caves, secure covers, and reliable feeding response.',
        'goby': f'{name} is a small bottom-oriented fish that depends on cover, calm tankmates, and a settled layout.',
        'clown_goby': f'{name} is a tiny reef fish that spends much of its time perched in or around branching cover.',
        'watchman_goby': f'{name} is a sand-associated goby that appreciates cover, stable footing, and a calm neighborhood.',
        'jawfish': f'{name} is a burrower that needs suitable substrate depth and a secure covered tank.',
        'dragonet': f'{name} is a specialist feeder that generally belongs in mature systems with natural grazing opportunities.',
        'blenny': f'{name} is a personality-heavy percher that adds movement and character to rockwork-rich systems.',
        'fang_blenny': f'{name} is a faster, more assertive blenny profile than the usual perching algae pickers.',
        'hawkfish': f'{name} is a perching ambush fish with great personality and real shrimp-compatibility questions.',
        'lionfish': f'{name} is a venomous predator that rewards calm feeding routines and careful tankmate choices.',
        'waspfish': f'{name} is a cryptic oddball kept more for subtle ambush behavior than nonstop swimming.',
        'filefish': f'{name} is an unusual display fish whose feeding habits and compatibility should be discussed honestly.',
        'angler': f'{name} is a specialist ambush predator with serious tankmate and feeding limitations.',
        'comet_betta': f'{name} is a shy cave-oriented display fish that usually becomes more visible once it feels secure.',
        'grouper': f'{name} is a juvenile-friendly predator sale that still needs honest discussion about long-term size and appetite.',
        'hogfish': f'{name} is an active robust fish that brings motion and personality but needs compatible tankmates.',
        'puffer': f'{name} is an interactive puffer sale where personality, beak care, and invert safety all matter.',
        'rabbitfish': f'{name} is a roomy algae grazer with useful browsing behavior and venomous dorsal spines.',
        'tang': f'{name} is a surgeonfish built for swimming length, steady grazing, and long-term space.',
        'trigger': f'{name} is a larger display fish that needs room, feeding structure, and sensible tankmate choices.',
        'fairy_flasher_wrasse': f'{name} is a color-forward wrasse that shows best in a covered, peaceful reef setup.',
        'leopard_wrasse': f'{name} is a sand-oriented wrasse that usually rewards patient keepers with a mature reef.',
        'cleaner_wrasse': f'{name} is a specialist wrasse that should only be sold when feeding response and long-term care are well understood.',
        'tusk': f'{name} is a bold heavy-bodied wrasse with strong display appeal and notable invertebrate risk.',
        'large_wrasse': f'{name} is a bigger, more forceful wrasse profile than the typical small reef wrasse.',
        'small_wrasse': f'{name} is a smaller active wrasse that adds motion without the footprint of the larger species.',
        'wrasse': f'{name} is an active wrasse that benefits from swimming room, secure cover, and a tight lid.',
        'marine_fish': f'{name} should be matched to the buyer based on space, diet, and compatibility rather than impulse color alone.'
    }
    pieces.append(intros.get(group, intros['marine_fish']))
    if has_value(tank):
        pieces.append(f'The catalog lists a minimum tank around {tank}.')
    if has_value(size):
        pieces.append(f'Adult size is listed around {size}.')
    if has_value(diet):
        pieces.append(f'Diet here is listed as {diet}.')
    return ' '.join(pieces)


def make_header(entry, group):
    role = make_role(entry, group)
    tank = entry.get('minTank')
    if has_value(tank):
        return f'{role}. Plan on roughly {tank} or larger long term.'
    return f'{role}. Match the sale to long-term space, diet, and compatibility.'


def make_behavior(entry, group):
    current = entry.get('behavior')
    if has_value(current) and not is_bad_text(current) and group not in FORCE_TEXT_REWRITE_GROUPS:
        return clean_string(current)
    phrases = {
        'dwarf_angel': 'Usually active around rockwork and always looking for something to pick at. Similar-shaped fish can bring out more territorial behavior in smaller systems.',
        'large_angel': 'Large angels stay visible and deliberate once settled, but they need room to move and can become dominant in cramped layouts.',
        'anthias': 'Most of the day is spent in open water or just above the rockwork, and they look best when the social group is stable.',
        'basslet_dottyback': 'Expect a fish that claims a crevice or cave and then makes quick confident dashes out into view.',
        'butterfly': 'Constant browsing is typical, so the fish should look interested in the environment rather than tucked away and fading.',
        'cardinal': 'These fish often hover calmly near cover and do not need to dominate the tank to look good.',
        'clownfish': 'Territory and pair behavior matter more than raw speed here; once settled, clownfish often adopt a specific corner or host area.',
        'damsel': 'Small size does not mean passive behavior. Expect quick territory checks and bolder behavior once established.',
        'eel': 'Most time is spent with the body hidden and the head visible from a chosen cave, especially once feeding routines are established.',
        'goby': 'This fish usually stays close to the bottom and depends on cover, burrows, or small retreats rather than nonstop open-water swimming.',
        'clown_goby': 'Usually perches in place more than it cruises, shifting only short distances between favored spots.',
        'watchman_goby': 'Expect short dashes from a chosen sand perch or burrow rather than constant open swimming.',
        'jawfish': 'A settled jawfish spends much of the day hovering over its burrow and retreating fast when startled.',
        'dragonet': 'The normal pattern is slow gliding over rock and sand while pecking continuously for tiny prey.',
        'blenny': 'Perch, inspect, hop, repeat — personality and body language are a big part of the appeal.',
        'fang_blenny': 'Faster and more darting than many blennies, with more attitude when crowded or mixed badly.',
        'hawkfish': 'It usually chooses lookout points and watches the tank from above rather than weaving constantly through the rockwork.',
        'lionfish': 'Slow stalking movement and patient hovering are normal. Calm deliberate feeding is part of the fish’s appeal.',
        'waspfish': 'Stillness is normal here. The fish is usually appreciated for camouflage and ambush posture more than motion.',
        'filefish': 'Many filefish move in short deliberate bursts and can seem thoughtful or cautious rather than busy.',
        'angler': 'Ambush species often sit motionless for long stretches, then lunge with surprising speed when food appears.',
        'comet_betta': 'Often shy at first and much more visible at dusk or after the tank has quieted down.',
        'grouper': 'Confident cruising and a strong feeding response are normal, especially as the fish settles in.',
        'hogfish': 'Expect active daytime swimming and a fish that uses both rockwork and open water.',
        'puffer': 'Puffers are usually curious and interactive, inspecting rock, equipment, and anyone approaching the tank.',
        'rabbitfish': 'Steady grazing passes and a calm overall presence are typical once the fish feels secure.',
        'tang': 'Most tangs stay on the move and use both rockwork and open lanes all day long.',
        'trigger': 'Alert, visible behavior is typical, and the fish should have enough room to cruise without turning every pass into a confrontation.',
        'fairy_flasher_wrasse': 'These wrasses are built for constant movement and color display in open water above the rockwork.',
        'leopard_wrasse': 'Active foraging over sand and rock is normal once the fish feels secure enough to settle into the daily rhythm.',
        'cleaner_wrasse': 'A healthy fish stays active and investigative, but the long-term question is always whether it will keep taking prepared foods.',
        'tusk': 'Confident open movement and a stronger bite-oriented presence set this fish apart from the gentler reef wrasses.',
        'large_wrasse': 'These larger wrasses combine nonstop motion with more attitude and more appetite than the smaller reef types.',
        'small_wrasse': 'Expect quick movement in and out of the rockwork rather than a heavy-bodied presence.',
        'wrasse': 'Fast stop-start swimming and regular laps around the rockwork are part of the normal wrasse pattern.',
        'marine_fish': aggression_phrase(entry)
    }
    return phrases.get(group, aggression_phrase(entry))


def make_feeding(entry, group):
    current = entry.get('feedingNotes')
    if has_value(current) and not is_bad_text(current) and group not in FORCE_TEXT_REWRITE_GROUPS:
        return clean_string(current)
    diet = entry.get('diet')
    base = {
        'dwarf_angel': 'Use a varied omnivore routine with algae-inclusive foods and regular frozen rotation so the fish can browse and still take prepared foods well.',
        'large_angel': 'A varied omnivore routine matters here, especially when the fish needs both prepared foods and time to pick naturally around the aquascape.',
        'anthias': 'Smaller, more frequent offerings are usually better than a single heavy feeding. Fine frozen foods and quality small pellets are the usual base routine.',
        'basslet_dottyback': 'Offer small meaty foods and avoid making timid tankmates compete with a fish that is already confident around caves and feeding stations.',
        'butterfly': 'Prepared-food acceptance should be confirmed early. A fish that is already eating well is a much safer sale than one that still only browses.',
        'cardinal': 'Small meaty foods offered consistently are usually enough; the goal is steady condition, not drama at feeding time.',
        'clownfish': 'These fish usually adapt well to quality prepared foods, with frozen rotation used to maintain condition and interest.',
        'damsel': 'Most damsels take prepared foods readily, but routine and portion control still matter more than dumping in extra food.',
        'eel': 'Target-fed meaty foods are usually the cleanest route, and escape-proof covers matter just as much as the food itself once the fish smells feeding time.',
        'goby': 'Use appropriately sized foods and make sure this fish can eat without being outcompeted by faster midwater tankmates.',
        'clown_goby': 'Small foods and low feeding competition matter more than giant meals for a fish this size.',
        'watchman_goby': 'Food should reach the sand zone reliably so the fish is not forced to compete in the open water every time.',
        'jawfish': 'Deliver food in a way that lets the fish eat near the burrow instead of darting long distances into traffic.',
        'dragonet': 'This is where the sale is won or lost. Natural microfauna support and proven prepared-food response matter far more than generic community-fish feeding advice.',
        'blenny': 'A mix of prepared foods, film grazing, and appropriate frozen support usually keeps blennies in better long-term condition.',
        'fang_blenny': 'Use a protein-forward routine and watch that the fish is not bullied away from food by larger assertive tankmates.',
        'hawkfish': 'Meaty foods work well, but shrimp-shaped tankmates can still read like food to a fish built to ambush from a perch.',
        'lionfish': 'Offer meaty foods deliberately and keep venomous-spine handling in mind whenever maintenance and feeding happen together.',
        'waspfish': 'Slow target feeding is usually the safe play. This is not a fish that should have to race active tankmates to every bite.',
        'filefish': 'Confirm what the individual is actually eating before the sale and support that routine at home rather than assuming any filefish takes anything.',
        'angler': 'Feeding should stay deliberate and species-appropriate because overfeeding and bad tankmate choices both go wrong quickly here.',
        'comet_betta': 'Meaty foods offered in a calm low-competition setting are usually the easiest path to a reliable routine.',
        'grouper': 'Offer sturdy meaty foods and be honest that appetite will scale with growth and long-term size.',
        'hogfish': 'A varied carnivore routine suits the fish better than occasional novelty feedings.',
        'puffer': 'Use a varied meaty diet and include harder items when appropriate so the beak and feeding behavior stay in good shape.',
        'rabbitfish': 'Daily algae support belongs in the routine, backed by a herbivore staple and occasional frozen variety.',
        'tang': 'Make algae-rich feeding the baseline routine, not a side note. Regular plant matter usually shows up in both body condition and behavior.',
        'trigger': 'Use a varied carnivore routine with quality prepared foods and occasional harder foods for jaw exercise and enrichment.',
        'fairy_flasher_wrasse': 'Small frequent feedings and a clean protein-forward routine usually bring out the best color and response.',
        'leopard_wrasse': 'A mature system and patient feeding routine matter more than flashy food choices with this group.',
        'cleaner_wrasse': 'Prepared-food acceptance has to be watched honestly over time rather than assumed from category or appearance alone.',
        'tusk': 'A meaty routine fits the fish well, and small ornamental inverts should not be treated as compatible cleanup crew by default.',
        'large_wrasse': 'Protein-heavy feeding suits the group, but so does watching that appetite does not turn every smaller crustacean into a menu item.',
        'small_wrasse': 'Small meaty foods and a steady routine are usually enough once the fish settles in.',
        'wrasse': 'A protein-forward routine with quality prepared foods and frozen rotation usually works well for active wrasses.',
        'marine_fish': 'Match the food size and routine to the actual species instead of relying only on the category label.'
    }
    line = base.get(group, base['marine_fish'])
    if has_value(diet):
        return f'{line} Catalog diet listing: {diet}.'
    return line


def make_buying(entry, group):
    current = entry.get('buyingGuidance')
    if has_value(current) and not is_bad_text(current) and group not in FORCE_TEXT_REWRITE_GROUPS:
        return clean_string(current)
    base = {
        'dwarf_angel': 'The main conversation is color and activity versus coral risk. Sell it to buyers who understand that even small angels can become opinionated in reefs.',
        'large_angel': 'This is a long-term livestock decision, not a short-term color buy. Room, maturity, and reef plans should all be settled first.',
        'anthias': 'A good anthias sale depends on stable husbandry and a buyer prepared for frequent feeding instead of a once-a-day routine.',
        'basslet_dottyback': 'Great for buyers who want color in the rockwork, but not for people expecting every small fish to behave like a passive schooling fish.',
        'butterfly': 'Confirm feeding response and reef goals before the sale. This group should not be treated like a generic plug-and-play community fish.',
        'cardinal': 'Usually a safe recommendation for peaceful systems as long as the buyer is not mixing them with much rougher tankmates.',
        'clownfish': 'A strong beginner-to-intermediate sale when the buyer understands pair behavior, territory, and how much personality clownfish can bring to a small area.',
        'damsel': 'Sell the color honestly, but sell the temperament honestly too. Small size does not make these fish harmless.',
        'eel': 'Only sell when the buyer is prepared for caves, escape prevention, and a carnivore feeding routine from day one.',
        'goby': 'Best sold to buyers who already value cover, calmer layouts, and the bottom half of the tank instead of only chasing centerpiece fish.',
        'clown_goby': 'A better sale for peaceful reefs than for aggressive community mixes where a tiny perch fish gets lost.',
        'watchman_goby': 'A strong fit for buyers who want sandbed personality and are willing to support the fish near its chosen burrow area.',
        'jawfish': 'Only a good sale when the buyer already has the lid and substrate depth handled; otherwise the problems start immediately.',
        'dragonet': 'This should be sold carefully. Mature pod support or proven prepared-food response matters more than how beautiful the fish looks in the store.',
        'blenny': 'Usually an easy personality sale, as long as the buyer understands that blennies want territory, perches, and their own feeding rhythm.',
        'fang_blenny': 'A good sale for buyers who want motion and attitude, but not when the tank is already full of similar fast territorial fish.',
        'hawkfish': 'Sell it to buyers who accept the trade-off: strong personality and perching behavior on one side, shrimp risk on the other.',
        'lionfish': 'Best sold to buyers who already accept venomous-spine handling, predator feeding, and non-reef-generic tankmate choices.',
        'waspfish': 'A good sale for oddball lovers, not for someone expecting a fish that is always front and center in the water column.',
        'filefish': 'The right sale here is less about novelty and more about honest feeding history plus realistic compatibility expectations.',
        'angler': 'Only sell when the buyer truly wants a specialist ambush predator and understands that tankmate flexibility is minimal.',
        'comet_betta': 'A strong specialty sale for patient hobbyists who appreciate shy, elegant fish and are not expecting instant daytime center-stage behavior.',
        'grouper': 'The critical conversation is long-term size and predation, because juveniles sell small but do not stay small.',
        'hogfish': 'Match it to buyers who want an active, assertive fish and already know their cleanup crew may not be permanent.',
        'puffer': 'Great personality sale, but only when the buyer accepts the trade-offs with invertebrates, nipping risk, and long-term feeding needs.',
        'rabbitfish': 'A strong recommendation for larger systems that need a steady grazer, as long as spine caution and long-term room are part of the conversation.',
        'tang': 'The right tang sale is about swimming room, tank maturity, and long-term grazing support rather than impulse color.',
        'trigger': 'Sell it to buyers who want a larger intelligent display fish and already understand the trade-offs with shrimp, crabs, and smaller passive tankmates.',
        'fairy_flasher_wrasse': 'A strong reef sale when the buyer has a lid and wants motion and color without stepping into full predator territory.',
        'leopard_wrasse': 'Best sold to buyers with a mature reef and patience, not to someone trying to shortcut the system maturity part of the hobby.',
        'cleaner_wrasse': 'This is a careful sale even when the fish looks great. Long-term feeding success matters more than immediate display appeal.',
        'tusk': 'A strong show-fish sale for buyers who understand that clean-up-crew safety is not part of the package.',
        'large_wrasse': 'Best sold to buyers who want activity and personality but have already planned for the fish’s size and appetite.',
        'small_wrasse': 'A good sale for covered reefs that need motion without another oversized fish dominating the layout.',
        'wrasse': 'A good wrasse sale starts with confirming the tank is covered and that the buyer actually wants an active swimmer.',
        'marine_fish': 'Match the sale to long-term size, feeding pattern, and compatibility instead of impulse color.'
    }
    return base.get(group, base['marine_fish'])


def make_recognition(entry, group):
    current = entry.get('recognitionNotes')
    if has_value(current) and not is_bad_text(current):
        return clean_string(current)
    vis = make_visual(entry, group)
    vis = vis.replace('Look for ', '').rstrip('.')
    return f'Look for {vis.lower()}.' if vis and vis[0].isupper() else f'Look for {vis}.'


def make_facts(entry, group):
    facts = []
    size = size_phrase(entry)
    tank = tank_phrase(entry)
    diet = diet_phrase(entry)
    if size:
        facts.append(size)
    if has_value(entry.get('minTank')):
        facts.append(tank)
    elif group in {'tang','trigger','large_angel','eel','grouper','puffer','rabbitfish','large_wrasse','lionfish'}:
        facts.append(tank_phrase(entry, 'a roomy, species-appropriate tank'))
    facts.append(diet)

    # category-aware compatibility/care note
    if group in {'dwarf_angel','large_angel','butterfly'}:
        facts.append(reef_phrase(entry))
    elif group in {'hawkfish','puffer','trigger','tusk','large_wrasse','grouper','lionfish','eel','angler','hogfish'}:
        facts.append('Small ornamental invertebrates or undersized tankmates should not be assumed safe here.')
    elif group in {'dragonet','cleaner_wrasse','leopard_wrasse'}:
        facts.append(difficulty_phrase(entry))
    else:
        facts.append(aggression_phrase(entry))

    # keep first 3 meaningful unique facts
    uniq = []
    facts.append(difficulty_phrase(entry))
    for f in facts:
        f = clean_string(f)
        if f and f not in uniq:
            uniq.append(f)
    return uniq[:3]


def entry_is_flagged(entry):
    blob = json.dumps(entry, ensure_ascii=False)
    if any(p in blob for p in BAD_PHRASES):
        return True
    return False


def cleanse_entry(entry, filename):
    flagged = entry_is_flagged(entry)
    # generic string cleanup everywhere
    for k, v in list(entry.items()):
        if isinstance(v, str):
            entry[k] = clean_string(v)
        elif isinstance(v, list):
            entry[k] = [clean_string(x) if isinstance(x, str) else x for x in v]
    if not flagged:
        return False

    group = base_group(entry, filename)
    entry['role'] = make_role(entry, group)
    entry['visualCue'] = make_visual(entry, group)
    entry['overview'] = make_overview(entry, group)
    entry['facts'] = make_facts(entry, group)
    entry['headerSummary'] = make_header(entry, group)
    entry['behavior'] = make_behavior(entry, group)
    entry['feedingNotes'] = make_feeding(entry, group)
    entry['buyingGuidance'] = make_buying(entry, group)
    entry['recognitionNotes'] = make_recognition(entry, group)

    # Trim any bad items that may remain in list fields
    for field in ['facts','bestWith','cautionWith']:
        val = entry.get(field)
        if isinstance(val, list):
            entry[field] = [clean_string(x) for x in val if isinstance(x, str) and x.strip() and not is_bad_text(x)]
    return True


def save_js_array(file_path, arr, prefix, suffix):
    json_text = json.dumps(arr, ensure_ascii=False, indent=2)
    file_path.write_text(prefix + json_text + suffix, encoding='utf8')


summary = []
total_fixed = 0
for file_path in sorted(species_dir.glob('*.js')):
    arr, prefix, suffix = load_js_array(file_path)
    fixed = 0
    for entry in arr:
        if cleanse_entry(entry, file_path.name):
            fixed += 1
    save_js_array(file_path, arr, prefix, suffix)
    if fixed:
        summary.append((file_path.name, fixed))
        total_fixed += fixed

print('fixed entries', total_fixed)
for name, count in summary:
    print(name, count)
