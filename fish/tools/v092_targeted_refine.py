import json, os, re
BASE='/mnt/data/ltcbuild'
SPECIES_DIR=os.path.join(BASE,'data','species')

MORE_REPL=[
 (re.compile(r'\bshoppers\b',re.I),'reef keepers'),
 (re.compile(r'\bcustomer\b',re.I),'aquarist'),
 (re.compile(r'\bcustomers\b',re.I),'aquarists'),
 (re.compile(r'\bcheap\b',re.I),'budget-friendly'),
 (re.compile(r'\bvery cheap\b',re.I),'very budget-friendly'),
 (re.compile(r'\bEasy sell\.?',re.I),'Very easy fish to explain.'),
 (re.compile(r'\bSell the dancing behavior\.?',re.I),'Lead with the dancing behavior and group display.'),
 (re.compile(r'\bSell the color and reef-safe nature, but warn that it may hide more than a cleaner shrimp\.?',re.I),'Lead with the color and reef-safe profile, but note that it may stay more tucked away than a cleaner shrimp.'),
 (re.compile(r'\bSell the look and the oddball factor, not a made-up cleanup role\.?',re.I),'Lead with the unusual look and behavior rather than inventing a cleanup role it does not really fill.'),
 (re.compile(r'\bSell the function clearly\.?',re.I),'Explain the functional role clearly so expectations stay grounded.'),
 (re.compile(r'\bSell the adult size, not the cute juvenile size\.?',re.I),'Discuss the adult size honestly rather than letting the juvenile size set the expectation.'),
 (re.compile(r'\bSell the adult fish, not the juvenile look\.?',re.I),'Discuss the adult fish honestly rather than letting the juvenile look drive the whole decision.'),
 (re.compile(r'\bSell the bristleworm-eating ability\.?',re.I),'Mention the bristleworm-control angle, but keep the overall temperament conversation honest.'),
 (re.compile(r'\bAlways, always warn about the venom\.?',re.I),'Always warn clearly about the venom and safe handling.'),
 (re.compile(r'\bThe beginner reef fish\. Cheap, pretty, easy, and always available\.?',re.I),'A classic beginner-friendly reef fish: visible, hardy, and usually easy to source.'),
 (re.compile(r'\bExtremely hardy, very budget-friendly\. The beginner safety net fish\.?',re.I),'Extremely hardy and approachable, with a reputation for tolerating ordinary beginner mistakes better than many similarly sized fish.'),
 (re.compile(r'\bCheap enough to buy in bulk\.?',re.I),'Usually affordable enough to stock in practical cleanup-crew numbers.'),
 (re.compile(r'\bBuy them in bulk for best results\.?',re.I),'They usually work best when stocked in realistic cleanup-crew numbers rather than as a single token crab.'),
 (re.compile(r'\bVery affordable — great entry-level choice\.?',re.I),'Usually one of the more approachable entry-level choices in the reef trade.'),
 (re.compile(r'\bVery affordable — great for filling out a community\.?',re.I),'Usually a budget-friendly way to add movement and structure to a peaceful community.'),
 (re.compile(r'\bMore expensive than the common Red Firefish but worth it\.?',re.I),'Usually priced above the common red firefish, but the added color and elegance often justify it for calm display reefs.'),
]

def load(path):
    txt=open(path,encoding='utf-8').read()
    cat=json.loads(re.search(r'window\.LTC_SPECIES_CHUNKS\[(.+?)\]\s*=\s*',txt).group(1))
    arr=json.loads(re.search(r'=\s*(\[[\s\S]*\])\s*;\s*$',txt).group(1))
    return cat,arr

def save(cat,arr,path):
    txt='window.LTC_SPECIES_CHUNKS = window.LTC_SPECIES_CHUNKS || {};\n'
    txt+=f'window.LTC_SPECIES_CHUNKS[{json.dumps(cat)}] = '+json.dumps(arr,ensure_ascii=False,indent=2)+';\n'
    open(path,'w',encoding='utf-8').write(txt)

def clean_obj(obj):
    for k,v in obj.items():
        if isinstance(v,str):
            for rx,repl in MORE_REPL:
                v=rx.sub(repl,v)
            v=v.replace('aquarists fall in love', 'reef keepers often fall in love')
            obj[k]=v
        elif isinstance(v,list):
            nv=[]
            for item in v:
                if isinstance(item,str):
                    for rx,repl in MORE_REPL:
                        item=rx.sub(repl,item)
                nv.append(item)
            obj[k]=nv

# targeted enriched copy
updates={
 'royal-gramma': {
   'behavior': 'Cave-oriented basslet that spends the day hovering just outside a chosen crevice, then flipping back under ledges when startled. In the wild they are often seen working caves and even swimming belly-up beneath overhangs, so a rockscape with shaded retreats shows off the real behavior far better than a bare wall of rock.',
   'feedingNotes': 'Small meaty foods work best, especially foods that drift near the fish’s chosen ledge rather than only across the brightest open water. Royal grammas usually take prepared foods well, but they look most relaxed when they can feed from cover instead of being forced into constant competition.',
   'buyingGuidance': 'One of the best all-around reef fish when the aquarist wants real color without stepping into a hard fish. The important setup point is cover: give it caves and ledges, and it usually becomes a hardy visible community fish instead of a nervous fish in a too-open scape.',
   'recognitionNotes': 'Bright purple front half blending into a vivid yellow rear half, usually with the fish stationed around a cave, ledge, or overhang.'},
 'dottyback-orchid': {
   'behavior': 'Captive-bred orchid dottybacks spend much of the day weaving through caves and short rock corridors, then perching confidently at the entrance to their chosen shelter. They are calmer than many dottybacks, but still carry the quick territorial confidence typical of the group.',
   'feedingNotes': 'These fish usually adapt well to frozen and prepared meaty foods. The main feeding issue is not reluctance to eat, but making sure the tank is not so small and crowded that the dottyback turns every feeding into a territory argument.',
   'buyingGuidance': 'A strong choice when the aquarist wants dottyback color without the worst dottyback temperament. Captive-bred specimens are the safer recommendation, especially in smaller reefs where wild fish can be much more combative.',
   'recognitionNotes': 'Solid electric-purple body with a sleek cave-loving profile and none of the stripes or split colors seen in many other pseudochromis species.'},
 'bangaii-cardinal': {
   'behavior': 'Calm hovering cardinal that often chooses one low-stress station and barely seems to move until feeding time. Wild fish are closely associated with long-spined urchins and other protective structure, and that same preference for shelter carries over to captivity.',
   'feedingNotes': 'Offer small meaty foods that drift naturally through the water column, then build in pellets or other prepared foods once the fish is settled. Banggais are usually easy to feed, but they still look best when timid individuals are not being blasted by faster tankmates at every meal.',
   'buyingGuidance': 'Excellent for peaceful reef keepers who want a striking fish without a complicated care story. The main caution is social structure: singles and bonded pairs are straightforward, but random groups often sort themselves out harshly as they mature.',
   'recognitionNotes': 'Silver body with black bars, white spots on the fins, and a hovering posture that often keeps the fish close to urchins, branching cover, or a chosen corner.'},
 'pajama-cardinal': {
   'behavior': 'Slow, almost floating cardinalfish that hovers in loose formation rather than darting constantly around the tank. The charm is in the stillness: a settled group can look almost suspended in place until food hits the water.',
   'feedingNotes': 'Small meaty foods, fine frozen options, and quality prepared foods are usually taken readily. Their calm style means they do best when they are not forced to fight fast aggressive feeders for every bite.',
   'buyingGuidance': 'A very safe recommendation for peaceful community reefs, especially when the goal is gentle motion instead of nonstop speed. If keeping several, give the group enough space and structure that hierarchy can sort itself out without crowding.',
   'recognitionNotes': 'Greenish-yellow face, black mid-body bar, orange-speckled rear half, and red eyes make this one of the easiest cardinalfish to identify instantly.'},
 'ocellaris-clown': {
   'behavior': 'Once settled, ocellaris clownfish usually stay front-and-center and treat one corner, coral, or host as their home base. Pairs are rarely shy for long, but they do develop a real territory and may defend that patch with more persistence than their small size suggests.',
   'feedingNotes': 'Captive-bred ocellaris usually accept prepared foods quickly, from pellets to frozen meaty foods and algae-inclusive mixes. Consistency matters more than complexity here; they are often among the easiest marine fish to keep eating well.',
   'buyingGuidance': 'One of the safest marine recommendations for beginners when the aquarist understands pair territory and avoids mixing random clown species without a plan. Captive-bred fish are especially forgiving and are often the cleanest way to start a first reef.',
   'recognitionNotes': 'Bright orange body with three white bars outlined in black and the classic clownfish head-and-body shape most people recognize immediately.'},
 'maroon-clown': {
   'behavior': 'Large, bold clownfish that plants itself near a chosen host or cave and treats that zone as private property. Mature females in particular can become extremely assertive, which is why maroons feel very different from calmer ocellaris-type clownfish even when both are sold as “clowns.”',
   'feedingNotes': 'Usually easy to feed on prepared omnivore foods and frozen items, but feeding behavior often comes with attitude. Make sure tankmates can still get food around a fish that may charge first and ask questions later.',
   'buyingGuidance': 'Best for aquarists who specifically want the attitude and size of a maroon clown, not for someone expecting generic peaceful clownfish behavior. The color is fantastic, but the recommendation has to include territory, pair management, and the size of the adult female.',
   'recognitionNotes': 'Deep maroon-red body with bold bars and a much heavier, stronger-looking clownfish build than the smaller common clown species.'},
 'clarkii-clown': {
   'behavior': 'Hardy, outgoing clownfish that often adapts quickly and takes over a chosen corner early. Clarkii types are more boisterous and more willing to range around the tank than ocellaris, but they still center their confidence around a defended home zone.',
   'feedingNotes': 'These fish usually eat with very little coaching and handle mixed prepared diets well. Their vigor is a strength, but it also means slower tankmates may need help getting equal access to food.',
   'buyingGuidance': 'Great when the aquarist wants a tough adaptable clownfish and has planned for more attitude than the gentler beginner varieties. The right conversation is about territory and compatibility, not whether the fish is “easy” in a vacuum.',
   'recognitionNotes': 'Yellow to orange body tones with white bars and the sturdier more assertive look typical of Clarkii-group clownfish.'},
 'tomato-clown': {
   'behavior': 'Tomato clowns are territorial homebodies once settled, often staying close to a favored host, coral, or rock corner and defending it confidently. They read as charming from a distance and surprisingly forceful once they decide a patch belongs to them.',
   'feedingNotes': 'Prepared omnivore foods and frozen offerings are usually taken readily. The important part is not convincing them to eat, but planning around a fish that may become pushy at feeding time in smaller tanks.',
   'buyingGuidance': 'A good fit for reef keepers who like bolder clownfish and are not expecting every clown to behave like a peaceful community mascot. In smaller tanks, their territorial streak should be part of the decision from the beginning.',
   'recognitionNotes': 'Warm red-orange body with a darker overall tone than ocellaris and a deeper-bodied, more forceful clownfish shape.'},
 'percula-clown': {
   'behavior': 'Perculas are classic territory-based clownfish that usually stay close to a chosen host area and then fan outward from it with growing confidence. They often look slightly more refined and deliberate in movement than ocellaris, but the same pair-and-territory logic still applies.',
   'feedingNotes': 'Captive-bred fish generally take prepared foods very well. A varied omnivore routine with pellets, frozen foods, and dependable feeding timing is usually enough to keep them in excellent condition.',
   'buyingGuidance': 'Excellent for reef keepers who want the iconic clownfish look and can keep the social plan simple. Perculas are a strong choice for peaceful mixed reefs, but still deserve the normal clownfish conversation about pairs, territory, and not mixing species casually.',
   'recognitionNotes': 'Orange body with three white bars and typically heavier black edging than ocellaris, giving the fish a slightly richer and more graphic contrast.'},
 'black-ocellaris': {
   'behavior': 'Behavior matches ocellaris more than it differs: a confident pair will choose a home base, stay visible, and defend that area once settled. The darker color changes the look dramatically, but not the basic clownfish pattern of territory, pair structure, and front-of-tank confidence.',
   'feedingNotes': 'Captive-bred black ocellaris usually accept prepared foods eagerly and are maintained much like orange ocellaris. Stable routine matters more than trying to do anything exotic at feeding time.',
   'buyingGuidance': 'A strong pick for aquarists who want the familiar clownfish behavior in a more dramatic color form. Treat them like ocellaris from a husbandry standpoint, with the same normal caution about pairing and territory in smaller tanks.',
   'recognitionNotes': 'Dark chocolate-to-black body with the familiar ocellaris bar pattern, creating a much more dramatic high-contrast version of the classic clownfish look.'},
 'green-chromis': {
   'behavior': 'Loose-schooling chromis that spend the day in the open water column rather than hugging a cave or perch. They look best when allowed to move as a group with room above the rockwork, instead of being reduced to a single nervous fish in a cramped mixed community.',
   'feedingNotes': 'Small prepared foods and frozen fare usually work well, especially when offered in a way that lets the whole group feed. Their appetite is usually straightforward; the long-term challenge is keeping the social group stable and well-conditioned.',
   'buyingGuidance': 'Best when the aquarist actually wants a small visible group of open-water fish and can provide enough space and numbers for them to behave naturally. A lone chromis can work, but it misses the main reason this fish is popular in the first place.',
   'recognitionNotes': 'Metallic green-blue sheen, forked tail, and a habit of hanging in the open water column instead of parking on the bottom or inside caves.'},
 'springeri-damsel': {
   'behavior': 'Compact reef damsel that spends the day darting in and out of rockwork while keeping close track of its chosen territory. Compared with many damsels it is relatively workable, but it still has the fast reflexes and local confidence the group is known for.',
   'feedingNotes': 'Prepared foods are rarely the problem; this species usually eats with enthusiasm. The bigger consideration is keeping portions sensible and making sure the fish is not being used as a substitute for better overall compatibility planning.',
   'buyingGuidance': 'A useful option when the aquarist wants a tougher small fish and understands that “one of the better damsels” is not the same thing as “harmless.” Rockwork territory, tank size, and tankmate temperament still matter.',
   'recognitionNotes': 'Deep blue body with clean dark contrast and the quick stop-start swimming style typical of a confident reef damsel.'},
 'snowflake-eel': {
   'behavior': 'Mostly a cave-and-crevice moray that becomes more active around dusk and feeding time than during the brightest part of the day. A settled fish often rests with only the head exposed, then uses the full rockwork at night, which is why escape-proof covers and stable caves matter so much.',
   'feedingNotes': 'Meaty marine foods are the core routine, with consistency more important than drama. Snowflakes are crustacean-oriented feeders by nature, so ornamental shrimp and crabs should always be discussed before the eel is treated as community-safe.',
   'buyingGuidance': 'One of the better morays for aquarists who want eel behavior without jumping straight to a monster predator, but the tank still has to be sealed and shrimp expectations still have to be realistic. The right home is cave-heavy, secure, and planned around what the eel will eventually hunt.',
   'recognitionNotes': 'Cream to pale body covered in dark branching blotches, usually with the head protruding from a cave entrance while the rest of the body stays hidden.'},
 'dwarf-lionfish': {
   'behavior': 'Ambush predator that spends long stretches perched or hovering, then suddenly flares into motion when food appears. It is less about nonstop swimming and more about posture, stalking, and using those oversized pectoral fins to look even larger than it is.',
   'feedingNotes': 'Feed as a predator on a deliberate schedule with appropriately sized meaty marine foods. Long-term success comes from getting the fish onto dependable non-live offerings and making sure tankmates are not small enough to become “bonus feedings.”',
   'buyingGuidance': 'A strong predator-tank choice when the aquarist wants lionfish presence without the footprint of a full volitans. The trade-offs are still real: venom, swallow-size compatibility, and a routine built around predator feeding rather than community reef assumptions.',
   'recognitionNotes': 'Bushy pectoral fins, banded body, and the unmistakable lionfish silhouette, but in a more compact package than the larger Pterois species.'},
 'purple-firefish': {
   'behavior': 'Graceful hovering dartfish that hangs just above a chosen bolt-hole and snaps back to safety the instant it feels threatened. It is naturally more reserved than many beginner fish, so calm tankmates and multiple retreats make a bigger difference than the species’ small size suggests.',
   'feedingNotes': 'Small meaty foods, fine prepared foods, and a calm feeding window suit this fish well. The goal is not just that it eats, but that it can stay visible and feed without being intimidated into permanent hiding.',
   'buyingGuidance': 'A beautiful choice for peaceful reefs when the aquarist understands lids, bolt-holes, and shy-fish etiquette. The color is the headline, but the real success factors are cover, calm tankmates, and a tank that does not force the fish into survival mode.',
   'recognitionNotes': 'White front half shifting into purple and orange toward the rear, with a tall dorsal streamer that flicks above the body like a small flag.'},
 'red-firefish': {
   'behavior': 'Classic hovering dartfish that holds in the water column just above a chosen crevice and then disappears instantly when alarmed. It adds elegant motion without aggression, but only when the tank is calm enough that the fish does not feel hunted all day.',
   'feedingNotes': 'Fine frozen and prepared meaty foods are usually taken well once the fish feels secure. Keep the routine gentle and predictable so the firefish can feed without being pushed off the water column by faster, rougher tankmates.',
   'buyingGuidance': 'Excellent for beginners when the aquarist has a lid and understands that peaceful does not mean fearless. The best setups give it bolt-holes, moderate flow, and tankmates that do not turn every movement into a startle response.',
   'recognitionNotes': 'White front half fading into bright red-orange toward the tail, plus a tall dorsal fin that constantly flicks when the fish is settled.'},
 'chalk-bass': {
   'behavior': 'Small Caribbean serranid that balances cave use with surprisingly open hovering once it feels safe. A group introduced together can add gentle mid-level motion without the nonstop nervousness some small schooling fish show in captivity.',
   'feedingNotes': 'Small meaty foods and quality prepared options are usually accepted readily. The main husbandry point is group management rather than food refusal, since established individuals can be far less welcoming to late additions than they are to fish they grew in with.',
   'buyingGuidance': 'Very good for reef keepers who want a hardy small fish with a little more substance than a basic chromis. They are especially appealing when introduced together as a planned small group instead of added one by one to test the hierarchy later.',
   'recognitionNotes': 'Soft lavender-blue body with faint bars and a warm belly glow, giving it a subtler but very polished Caribbean basslet look.'},
 'valentini-puffer': {
   'behavior': 'Constantly curious toby puffer that inspects rockwork, glass, equipment, and even the room outside the tank with equal interest. Males are territorial in the wild, and even in aquaria the fish’s confidence is a big part of the appeal—and part of why corals and small invertebrates are never completely safe bets.',
   'feedingNotes': 'Use a varied omnivore routine with enough crunchy or hard-textured items to keep the beak worn, plus meaty marine foods and quality prepared options. Feed for long-term dental health and steady condition, not just for the instant entertainment of a puffer begging at the glass.',
   'buyingGuidance': 'Best for aquarists who specifically want a personality fish and are comfortable with trade-offs around coral nipping, clam risk, and small invertebrates. It is easier to love than to place perfectly, so the right recommendation starts with compatibility honesty.',
   'recognitionNotes': 'Cream body with distinct dark saddle patches, orange-tan upper tones, and the compact sharpnose puffer shape with a small beak-like mouth.'},
}

# specific file maps
for fname in sorted(os.listdir(SPECIES_DIR)):
    if not fname.endswith('.js'): continue
    path=os.path.join(SPECIES_DIR,fname)
    cat,arr=load(path)
    for e in arr:
        clean_obj(e)
        if e['id'] in updates:
            e.update(updates[e['id']])
        clean_obj(e)
    save(cat,arr,path)

# app version
app_path=os.path.join(BASE,'js','app.js')
app=open(app_path,encoding='utf-8').read().replace("const APP_VERSION = '0.092';","const APP_VERSION = '0.092';")
open(app_path,'w',encoding='utf-8').write(app)
