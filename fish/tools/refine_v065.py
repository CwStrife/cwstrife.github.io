import re, json
from pathlib import Path

species_dir = Path('data/species')

def load_js_array(file_path):
    raw = file_path.read_text(encoding='utf8')
    match = re.search(r'=\s*(\[[\s\S]*\])\s*;\s*$', raw)
    arr = json.loads(match.group(1))
    return arr, raw[:match.start(1)], raw[match.end(1):]

def save_js_array(file_path, arr, prefix, suffix):
    file_path.write_text(prefix + json.dumps(arr, ensure_ascii=False, indent=2) + suffix, encoding='utf8')

def num_inches(s):
    if not isinstance(s, str): return None
    m = re.search(r'(\d+(?:\.\d+)?)', s)
    return float(m.group(1)) if m else None

def group(entry, filename):
    name = entry.get('name','').lower(); cat = entry.get('category','').lower(); sci=entry.get('scientific','').lower(); mx=num_inches(entry.get('maxSize',''))
    if 'angelfish' in cat:
        if (mx is not None and mx <= 6) or 'centropyge' in sci or 'dwarf' in name: return 'dwarf_angel'
        return 'large_angel'
    if 'anthias' in cat: return 'anthias'
    if 'basslet' in cat or 'dottyback' in cat: return 'basslet_dottyback'
    if 'butterfly' in cat: return 'butterfly'
    if 'cardinal' in cat: return 'cardinal'
    if 'clownfish' in cat: return 'clownfish'
    if 'damsel' in cat or 'chromis' in name: return 'damsel'
    if 'eel' in cat or 'moray' in name: return 'eel'
    if 'goby' in name or 'jawfish' in name or 'dragonet' in name or 'mandarin' in name or 'blenny' in name:
        if 'jawfish' in name: return 'jawfish'
        if 'dragonet' in name or 'mandarin' in name or 'scooter' in name: return 'dragonet'
        if 'fang blenny' in name: return 'fang_blenny'
        if 'blenny' in name: return 'blenny'
        if 'watchman' in name or 'prawn goby' in name: return 'watchman_goby'
        if 'clown goby' in name: return 'clown_goby'
        return 'goby'
    if 'hawkfish' in cat: return 'hawkfish'
    if 'lionfish' in cat: return 'lionfish'
    if 'puffer' in cat or 'boxfish' in cat or 'cowfish' in cat: return 'puffer'
    if 'rabbitfish' in cat or 'foxface' in name: return 'rabbitfish'
    if 'tang' in cat or 'surgeonfish' in name: return 'tang'
    if 'triggerfish' in cat or 'trigger' in name: return 'trigger'
    if 'wrasse' in cat:
        if 'fairy' in name or 'flasher' in name: return 'fairy_flasher_wrasse'
        if 'leopard' in name: return 'leopard_wrasse'
        if 'cleaner' in name: return 'cleaner_wrasse'
        if 'tusk' in name: return 'tusk'
        if any(k in name for k in ['coris','lunare','banana','bird','dragon']): return 'large_wrasse'
        if 'possum' in name or 'pygmy' in name: return 'small_wrasse'
        return 'wrasse'
    if 'filefish' in name: return 'filefish'
    if 'angler' in name: return 'angler'
    if 'waspfish' in name or 'leaf fish' in name: return 'waspfish'
    if 'comet' in name or 'marine betta' in name: return 'comet_betta'
    if 'grouper' in name: return 'grouper'
    if 'hogfish' in name: return 'hogfish'
    return 'marine_fish'

VISUALS = {
    'tusk': 'Look for a thick-bodied wrasse with oversized teeth and bold striping or patchwork color.',
    'large_wrasse': 'Look for a long active wrasse body with strong cruising speed and broader jaws.',
    'small_wrasse': 'Look for a petite wrasse with quick dashes around rockwork and tight turns near cover.',
    'fairy_flasher_wrasse': 'Look for a slim wrasse body, strong iridescence, and flowing dorsal or tail accents.',
    'leopard_wrasse': 'Look for a fine-spotted wrasse pattern and constant foraging close to sand and rock.',
    'cleaner_wrasse': 'Look for a slim wrasse profile and a purposeful swimming style around larger fish.',
    'dragonet': 'Look for a low-slung fish that glides over rock and sand while pecking for tiny prey items.',
    'filefish': 'Look for a laterally compressed body, pointed snout, and deliberate stop-start swimming.',
    'angler': 'Look for a chunky ambush body with a huge mouth and a tendency to sit still between lunges.',
    'waspfish': 'Look for a cryptic outline, perching posture, and camouflage that breaks up the body shape.',
    'comet_betta': 'Look for a dark cave fish with long finnage and bold ocellus-style markings.',
    'grouper': 'Look for a heavier-bodied predator with a broad mouth and steady, confident cruising.',
    'hogfish': 'Look for a longer wrasse-like body with a thicker head and more robust build.'
}
RECOGNITION = {
    'tusk': 'Look for the heavy jaws, visible teeth, and broader body that separate it from the slimmer reef wrasses.',
    'large_wrasse': 'Look for the longer body, stronger jaws, and faster open-water laps that mark the bigger wrasse types.',
    'small_wrasse': 'Look for the smaller frame and tight rockwork turns rather than the heavier body of the larger wrasses.',
    'fairy_flasher_wrasse': 'Look for the slimmer profile and ornamental finnage that stand out most when the fish is displaying.',
    'leopard_wrasse': 'Look for the fine patterning and sand-focused foraging style that set leopard wrasses apart.',
    'cleaner_wrasse': 'Look for the streamlined profile and purposeful interest in larger fish.',
    'dragonet': 'Look for a low-slung body and a slow pecking glide across rock and sand rather than fast midwater swimming.',
    'filefish': 'Look for the pointed snout and stop-start body posture that give filefish a distinctive silhouette.',
    'angler': 'Look for the oversized mouth, perch-and-wait posture, and ambush body shape.',
    'waspfish': 'Look for the broken outline and camouflage that make the fish look more like scenery than open-water livestock.',
    'comet_betta': 'Look for the long dark fins and false eyespot pattern that make the fish look larger and harder to approach.',
    'grouper': 'Look for the broad head, thick body, and confident predator posture.',
    'hogfish': 'Look for the longer snout and more robust build than the average small reef wrasse.'
}
FACT_FALLBACK = {
    'anthias': 'Frequent small feedings are usually part of long-term success with anthias.',
    'basslet_dottyback': 'Rockwork and secure retreats matter as much as open swimming space here.',
    'butterfly': 'Prepared-food acceptance and browsing behavior should both be checked before the sale.',
    'cardinal': 'Peaceful tankmates usually suit this group better than rough community mixes.',
    'dwarf_angel': 'Coral nipping can vary by individual, so reef plans should be discussed honestly.',
    'large_angel': 'Coral and clam compatibility should not be assumed just because the fish looks settled in the store.',
    'damsel': 'Small size does not prevent territorial behavior once the fish has claimed a corner.',
    'goby': 'Cover and low feeding competition usually matter more than flashy open-water behavior.',
    'clown_goby': 'Tiny size makes branchy cover and peaceful tankmates especially important.',
    'watchman_goby': 'A stable sand zone and reliable cover improve long-term comfort and feeding response.',
    'jawfish': 'A secure lid and suitable burrow substrate are part of the basic care plan, not optional extras.',
    'dragonet': 'Mature pod support or proven prepared-food response should be treated as a requirement, not a bonus.',
    'blenny': 'Perches, grazing opportunities, and personal space all matter to blenny behavior.',
    'fang_blenny': 'This is a blenny with more speed and attitude than the average perch fish.',
    'hawkfish': 'Small shrimp remain the big compatibility question with hawkfish.',
    'lionfish': 'Venomous-spine handling and predator feeding routines both matter here.',
    'filefish': 'Feeding history should be confirmed species by species rather than guessed from the category name.',
    'angler': 'Tankmate flexibility is minimal once mouth size and ambush behavior are taken seriously.',
    'waspfish': 'Cryptic behavior is normal; this is not meant to behave like a nonstop open-water swimmer.',
    'comet_betta': 'A calm cave-rich layout usually brings out more natural behavior than a bright hectic display.',
    'grouper': 'Juveniles sell small, but long-term growth and appetite should be part of the conversation.',
    'hogfish': 'Expect more appetite and more cleanup-crew risk than with most peaceful reef wrasses.',
    'puffer': 'Invertebrate compatibility and beak care are both part of the core sale conversation.',
    'rabbitfish': 'Venomous dorsal spines and long-term swimming room both deserve mention before the sale.',
    'tang': 'Swimming length and steady algae support matter more than impulse color with surgeonfish.',
    'trigger': 'Shrimp, crabs, and passive small fish are the first compatibility questions to answer.',
    'fairy_flasher_wrasse': 'A tight lid is basic equipment with active display wrasses like these.',
    'leopard_wrasse': 'A mature reef and patient acclimation routine matter more here than with many common wrasses.',
    'cleaner_wrasse': 'Long-term feeding response is the key question with cleaner wrasses.',
    'tusk': 'Cleanup-crew safety is not part of the package with tusk-type wrasses.',
    'large_wrasse': 'These larger wrasses carry more appetite and more attitude than the smaller reef varieties.',
    'small_wrasse': 'A covered tank and calmer tankmates usually suit the smaller wrasses best.',
    'wrasse': 'A covered tank is part of the normal wrasse plan, not a nice extra.'
}
HEADER_FALLBACK = {
    'anthias': 'Best in stable systems that support frequent small feedings.',
    'basslet_dottyback': 'Best matched to rockwork-heavy layouts with sensible territory planning.',
    'butterfly': 'Feeding response and reef plans should both be confirmed before the sale.',
    'cardinal': 'Usually best with peaceful tankmates and a calm routine.',
    'dwarf_angel': 'Coral nipping risk should be discussed along with color and hardiness.',
    'large_angel': 'Room, maturity, and reef compatibility should all be settled before the sale.',
    'damsel': 'Hardy does not mean harmless once territory gets established.',
    'goby': 'Best matched to calm layouts with cover near the bottom of the tank.',
    'clown_goby': 'Best in peaceful reefs where tiny perch fish are not constantly outcompeted.',
    'watchman_goby': 'Best with sand, cover, and a layout that supports burrow-oriented behavior.',
    'jawfish': 'Requires substrate depth and a secure lid from day one.',
    'dragonet': 'Best matched to mature systems with natural grazing support.',
    'blenny': 'Works best when the tank offers perches, cover, and a steady routine.',
    'fang_blenny': 'Best in setups that can handle a faster, bolder blenny personality.',
    'hawkfish': 'Shrimp compatibility should be part of the conversation before the sale.',
    'lionfish': 'Venomous-spine handling and predator compatibility both matter here.',
    'filefish': 'Feeding history and compatibility should both be confirmed first.',
    'angler': 'A specialist sale, not a generic community-fish recommendation.',
    'waspfish': 'A specialist oddball for buyers who appreciate cryptic ambush behavior.',
    'comet_betta': 'Best for patient hobbyists who appreciate shy cave fish.',
    'grouper': 'Long-term growth and predation should be discussed before the fish goes home.',
    'hogfish': 'Best for buyers who want activity and can accept cleanup-crew risk.',
    'puffer': 'Invertebrate trade-offs and feeding needs both deserve mention up front.',
    'rabbitfish': 'Room and spine safety both matter as much as algae utility.',
    'tang': 'Swimming room and tank maturity matter more than impulse color.',
    'trigger': 'Best matched to roomy systems with compatible tankmates.',
    'fairy_flasher_wrasse': 'A covered reef is usually the right long-term home.',
    'leopard_wrasse': 'Maturity and patient acclimation matter more than speed.',
    'cleaner_wrasse': 'Long-term feeding success matters more than first impressions.',
    'tusk': 'Best for buyers who understand the cleanup-crew trade-off.',
    'large_wrasse': 'Best for roomy covered systems that can handle a stronger appetite.',
    'small_wrasse': 'A covered tank and calmer tankmates usually fit best.',
    'wrasse': 'A covered tank and steady feeding routine are the normal plan.'
}

changed=0
for fp in species_dir.glob('*.js'):
    arr,prefix,suffix=load_js_array(fp)
    for e in arr:
        g=group(e, fp.name)
        vis=e.get('visualCue','')
        rec=e.get('recognitionNotes','')
        if g in VISUALS and ('common to wrasses' in vis.lower() or 'overall body shape, swimming style, and color pattern together with the label' in vis.lower() or g in {'dragonet','tusk','large_wrasse','small_wrasse','fairy_flasher_wrasse','leopard_wrasse','cleaner_wrasse'}):
            if e.get('visualCue') != VISUALS[g]:
                e['visualCue']=VISUALS[g]; changed+=1
        if g in RECOGNITION and ('common to wrasses' in rec.lower() or 'overall body shape, swimming style, and color pattern together with the label' in rec.lower() or 'perches on rock, sand, or burrows' in rec.lower() or g in {'tusk','large_wrasse','small_wrasse','fairy_flasher_wrasse','leopard_wrasse','cleaner_wrasse'}):
            if e.get('recognitionNotes') != RECOGNITION[g]:
                e['recognitionNotes']=RECOGNITION[g]; changed+=1
        facts=e.get('facts',[])
        if isinstance(facts,list):
            facts=[f for f in facts if f and f != 'Feeding should match the species, not just the category label.']
            if len(facts)<3:
                extra=FACT_FALLBACK.get(g)
                if extra and extra not in facts:
                    facts.append(extra); changed+=1
            e['facts']=facts[:3]
        hs=e.get('headerSummary','')
        if isinstance(hs,str) and hs.endswith('Match the sale to long-term space, diet, and compatibility.'):
            extra=HEADER_FALLBACK.get(g)
            if extra:
                base=hs.replace(' Match the sale to long-term space, diet, and compatibility.','')
                e['headerSummary']=f'{base} {extra}'
                changed+=1
    save_js_array(fp,arr,prefix,suffix)
print('changed',changed)
