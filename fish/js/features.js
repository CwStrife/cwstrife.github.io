// LTC Fish Browser — Additional Features (V23+)

// === LOGO INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
  const hl = document.getElementById('headerLogo');
  if(hl && typeof HEADER_LOGO !== 'undefined') hl.src = HEADER_LOGO;
  const il = document.getElementById('idleLogo');
  if(il && typeof IDLE_LOGO !== 'undefined') il.src = IDLE_LOGO;
});

// === WATER PARAMETERS UI — V0.105 canvas water + 8 params ===
// Each parameter card holds a canvas. After the modal renders,
// initWaterParamsCanvas() sets up an animation loop that draws
// flowing water filling the ideal zone of each bar.
//
// Phosphate and Nitrate are shown with reef-standard defaults so the
// data shape is in place for future coral-side population.

var WP_PARAM_DEFS = [
  {key:'temp', n:'Temperature', u:'°F',  min:72,    max:86,    defLo:76,   defHi:80,   tint:'cyan',   forFish:true},
  {key:'sal',  n:'Salinity',    u:'',    min:1.020, max:1.030, defLo:1.024,defHi:1.026,tint:'teal',   forFish:true},
  {key:'ph',   n:'pH',          u:'',    min:7.8,   max:8.6,   defLo:8.1,  defHi:8.4,  tint:'aqua',   forFish:true},
  // The five params below are kept in the schema (with reef-standard
  // defaults) so the data shape exists for future coral-side rendering.
  // They are NOT shown on fish detail popups — only Temperature,
  // Salinity, and pH are clinically relevant for keeping fish alive.
  // dKH / Ca / Mg / PO4 / NO3 matter for coral growth and chemistry,
  // not for fish survival, so they're filtered out by waterParamsSection.
  {key:'dkh',  n:'dKH',         u:'',    min:6,     max:14,    defLo:8,    defHi:11,   tint:'lime',   forFish:false, forCoral:true},
  {key:'ca',   n:'Calcium',     u:'ppm', min:350,   max:500,   defLo:400,  defHi:450,  tint:'gold',   forFish:false, forCoral:true},
  {key:'mg',   n:'Magnesium',   u:'ppm', min:1200,  max:1550,  defLo:1300, defHi:1450, tint:'violet', forFish:false, forCoral:true},
  {key:'po4',  n:'Phosphate',   u:'ppm', min:0,     max:0.10,  defLo:0,    defHi:0.03, tint:'rose',   forFish:false, forCoral:true},
  {key:'no3',  n:'Nitrate',     u:'ppm', min:0,     max:25,    defLo:0,    defHi:10,   tint:'amber',  forFish:false, forCoral:true}
];

var WP_TINTS = {
  cyan:   {fill:'rgba(60,180,255,.55)',  deep:'rgba(20,80,160,.5)',  foam:'rgba(190,235,255,.55)', glow:'rgba(140,220,255,.55)', text:'#5ee0ff'},
  teal:   {fill:'rgba(50,210,200,.55)',  deep:'rgba(15,90,100,.55)', foam:'rgba(170,255,240,.55)', glow:'rgba(120,240,220,.55)', text:'#5eebc8'},
  aqua:   {fill:'rgba(80,200,220,.55)',  deep:'rgba(20,90,120,.55)', foam:'rgba(190,240,250,.55)', glow:'rgba(150,230,250,.55)', text:'#7be0e8'},
  lime:   {fill:'rgba(140,220,80,.55)',  deep:'rgba(60,110,30,.55)', foam:'rgba(220,255,180,.6)',  glow:'rgba(180,240,120,.55)', text:'#caf66e'},
  gold:   {fill:'rgba(245,200,70,.55)',  deep:'rgba(120,80,20,.55)', foam:'rgba(255,235,180,.6)',  glow:'rgba(255,215,120,.55)', text:'#ffe275'},
  violet: {fill:'rgba(170,130,240,.55)', deep:'rgba(70,40,130,.55)', foam:'rgba(225,205,255,.6)',  glow:'rgba(190,160,255,.55)', text:'#c8b2ff'},
  rose:   {fill:'rgba(255,130,170,.55)', deep:'rgba(120,30,60,.55)', foam:'rgba(255,205,225,.6)',  glow:'rgba(255,160,190,.55)', text:'#ff9bb6'},
  amber:  {fill:'rgba(255,160,80,.55)',  deep:'rgba(120,60,15,.55)', foam:'rgba(255,220,180,.6)',  glow:'rgba(255,180,110,.55)', text:'#ffba60'}
};

function wpFmt(v){
  if(v==null) return '—';
  if(v>=100) return Math.round(v).toString();
  if(v>=10) return v.toFixed(1).replace(/\.0$/,'');
  // v0.140 — salinity (1.01–1.05 range) always needs 3 decimal places
  // because the precision is clinically meaningful: 1.024 vs 1.026 is the
  // difference between low-end and natural sea water. The previous toFixed(2)
  // was rounding 1.024 → "1.02" and 1.026 → "1.03" which made every card
  // look like it was reading near-freshwater.
  if(v>=1.01 && v<1.05) return v.toFixed(3);
  if(v>=1) return v.toFixed(2).replace(/0$/,'').replace(/\.$/,'');
  return v.toFixed(3).replace(/0+$/,'').replace(/\.$/,'');
}
function wpPct(val,min,max){return Math.max(0,Math.min(100,((val-min)/(max-min))*100))}

function wpResolveValue(item, def){
  // Pull lo/hi from species water object using legacy keys.
  if(!item.water) return {lo:def.defLo,hi:def.defHi,fromSpecies:false};
  var w = item.water;
  var loKey, hiKey;
  if(def.key === 'temp'){loKey='temp_low';hiKey='temp_high'}
  else if(def.key === 'sal'){loKey='sal_low';hiKey='sal_high'}
  else if(def.key === 'ph'){loKey='ph_low';hiKey='ph_high'}
  else {loKey=def.key+'_low';hiKey=def.key+'_high'}
  var lo = w[loKey], hi = w[hiKey];
  if(lo == null || hi == null || isNaN(lo) || isNaN(hi)){
    return {lo:def.defLo,hi:def.defHi,fromSpecies:false};
  }
  return {lo:lo,hi:hi,fromSpecies:true};
}

function waterParamsSection(item){
  var label = (typeof T === 'function' ? T('waterParams') : 'Water parameters');
  // Fish detail popups only show params clinically relevant for keeping
  // fish alive: Temperature, Salinity, pH. The other params (dKH, Ca,
  // Mg, PO4, NO3) are kept in WP_PARAM_DEFS for future coral rendering
  // but are filtered out here.
  var defs = WP_PARAM_DEFS.filter(function(d){return d.forFish});
  var cards = defs.map(function(def){
    var v = wpResolveValue(item, def);
    var tint = WP_TINTS[def.tint];
    var loPct = wpPct(v.lo, def.min, def.max);
    var hiPct = wpPct(v.hi, def.min, def.max);
    var unitDisplay = def.u ? ' '+def.u : '';
    var sourceTag = v.fromSpecies ? '' : '<span class="wp-default" title="Reef standard default">·</span>';
    return ''+
      '<div class="wp-card" data-tint="'+def.tint+'">'+
        '<div class="wp-head">'+
          '<span class="wp-name">'+def.n+sourceTag+'</span>'+
          '<span class="wp-ideal" style="color:'+tint.text+'">'+wpFmt(v.lo)+' – '+wpFmt(v.hi)+unitDisplay+'</span>'+
        '</div>'+
        '<div class="wp-bar">'+
          '<canvas data-wp-canvas data-lo="'+loPct+'" data-hi="'+hiPct+'" data-tint="'+def.tint+'"></canvas>'+
          '<span class="wp-zlbl wp-zlbl-start" style="left:calc('+loPct+'% + 4px)">'+wpFmt(v.lo)+'</span>'+
          '<span class="wp-zlbl wp-zlbl-end" style="left:calc('+hiPct+'% - 4px)">'+wpFmt(v.hi)+'</span>'+
        '</div>'+
        '<div class="wp-scale"><span>'+wpFmt(def.min)+unitDisplay+'</span><span>'+wpFmt(def.max)+unitDisplay+'</span></div>'+
      '</div>';
  }).join('');
  return ''+
    '<div class="modal-section modal-water">'+
      '<div class="section-title"><h3>'+label+'</h3></div>'+
      '<div class="wp-grid">'+cards+'</div>'+
    '</div>';
}

// Animation loop — kicked off by initWaterParamsCanvas() after modal renders.
var WP_RAF = null;
var WP_DRAW_FNS = [];

function makeWpZoneWater(canvas, idealStartPct, idealEndPct, tintName, staggerMs){
  var tint = WP_TINTS[tintName] || WP_TINTS.cyan;
  var ctx = canvas.getContext('2d');
  var W=0,H=0,dpr=1;
  var fillProgress=0,startTime=-1,fillDur=1400;
  var t = Math.random()*200;

  function sizeCanvas(){
    var r=canvas.parentElement.getBoundingClientRect();
    if(r.width<1) return false;
    dpr=window.devicePixelRatio||1;
    W=r.width;H=r.height;
    canvas.width=Math.round(W*dpr);
    canvas.height=Math.round(H*dpr);
    return true;
  }
  function ease(x){return 1-Math.pow(1-x,3)}
  function surfaceY(x,zoneStart,zoneWidth,amplitude){
    var a=amplitude;
    return Math.sin(x/45+t*1.5)*a + Math.sin(x/26+t*2.7)*a*.55 + Math.sin(x/72+t*.8)*a*.75;
  }
  return function draw(now){
    if(W<1){if(!sizeCanvas())return}
    if(startTime<0) startTime=now;
    var el=now-startTime-staggerMs;
    if(el<0) fillProgress=0;
    else if(el<fillDur) fillProgress=ease(el/fillDur);
    else fillProgress=1;
    t+=.025;
    ctx.save();ctx.scale(dpr,dpr);ctx.clearRect(0,0,W,H);
    var zoneStart = (idealStartPct/100)*W;
    var zoneEnd = (idealEndPct/100)*W;
    var zoneWidth = zoneEnd - zoneStart;
    var fillW = zoneWidth * fillProgress;
    var fillStart = zoneStart + (zoneWidth - fillW)/2;
    var fillEnd = fillStart + fillW;
    if(fillW<3){ctx.restore();return}
    var mY = H*.42;
    var amp = 4.4;
    ctx.beginPath();ctx.rect(fillStart, 0, fillW, H);ctx.clip();
    // deep
    ctx.beginPath();ctx.moveTo(fillStart,H);ctx.lineTo(fillEnd,H);
    for(var x=fillEnd;x>=fillStart;x-=2) ctx.lineTo(x,mY+3+surfaceY(x,zoneStart,zoneWidth,amp*.7)+2);
    ctx.closePath();ctx.fillStyle=tint.deep;ctx.fill();
    // main
    ctx.beginPath();ctx.moveTo(fillStart,H);ctx.lineTo(fillEnd,H);
    for(var x=fillEnd;x>=fillStart;x-=2) ctx.lineTo(x,mY+surfaceY(x,zoneStart,zoneWidth,amp));
    ctx.closePath();ctx.fillStyle=tint.fill;ctx.fill();
    // foam
    ctx.beginPath();var s2=false;
    for(var x=fillStart;x<=fillEnd;x+=2){var wy=mY+surfaceY(x,zoneStart,zoneWidth,amp);if(!s2){ctx.moveTo(x,wy);s2=true}else ctx.lineTo(x,wy)}
    ctx.strokeStyle=tint.foam;ctx.lineWidth=2;ctx.stroke();
    ctx.beginPath();s2=false;
    for(var x=fillStart;x<=fillEnd;x+=2){var wy=mY+surfaceY(x,zoneStart,zoneWidth,amp)-.5;if(!s2){ctx.moveTo(x,wy);s2=true}else ctx.lineTo(x,wy)}
    ctx.strokeStyle='rgba(255,255,255,.16)';ctx.lineWidth=5;ctx.stroke();
    // subsurface
    ctx.beginPath();
    for(var x=fillStart;x<=fillEnd;x+=2){var wy=mY+surfaceY(x,zoneStart,zoneWidth,amp);if(x===fillStart)ctx.moveTo(x,wy+1);else ctx.lineTo(x,wy+1)}
    for(var x=fillEnd;x>=fillStart;x-=2) ctx.lineTo(x,mY+surfaceY(x,zoneStart,zoneWidth,amp)+6);
    ctx.closePath();ctx.fillStyle='rgba(255,255,255,.13)';ctx.fill();
    // edge glows
    if(fillW>10){
      var g1=ctx.createRadialGradient(fillStart,mY,0,fillStart,mY,18);
      g1.addColorStop(0,tint.glow);g1.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=g1;ctx.beginPath();ctx.arc(fillStart,mY,16,0,Math.PI*2);ctx.fill();
      var g2=ctx.createRadialGradient(fillEnd,mY,0,fillEnd,mY,18);
      g2.addColorStop(0,tint.glow);g2.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=g2;ctx.beginPath();ctx.arc(fillEnd,mY,16,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  };
}

function initWaterParamsCanvas(){
  // Cancel old loop if any
  if(WP_RAF){cancelAnimationFrame(WP_RAF);WP_RAF=null}
  WP_DRAW_FNS = [];
  var canvases = document.querySelectorAll('canvas[data-wp-canvas]');
  if(!canvases.length) return;
  canvases.forEach(function(c, idx){
    var lo = parseFloat(c.dataset.lo);
    var hi = parseFloat(c.dataset.hi);
    var tint = c.dataset.tint;
    if(isNaN(lo) || isNaN(hi)) return;
    WP_DRAW_FNS.push(makeWpZoneWater(c, lo, hi, tint, idx*100));
  });
  function loop(now){
    for(var i=0;i<WP_DRAW_FNS.length;i++) WP_DRAW_FNS[i](now);
    WP_RAF = requestAnimationFrame(loop);
  }
  WP_RAF = requestAnimationFrame(loop);
}
window.initWaterParamsCanvas = initWaterParamsCanvas;

// === FISH OF THE WEEK ===
function getFishOfTheWeek(){
  const inStock = FISH.filter(f=>f.inStock);
  if(!inStock.length) return null;
  // Deterministic based on week number so it changes weekly
  const weekNum = Math.floor(Date.now() / (7*24*60*60*1000));
  return inStock[weekNum % inStock.length];
}

function renderFishOfTheWeek(){
  const container = document.getElementById('fishOfTheWeek');
  if(!container) return;
  if(state.mode !== 'stock'){container.innerHTML='';return;}
  const f = getFishOfTheWeek();
  if(!f) return;
  container.innerHTML = `
    <div style="padding:14px;border-radius:16px;background:linear-gradient(135deg,rgba(255,200,60,.08),rgba(255,140,40,.06));border:1px solid rgba(255,200,60,.15);display:flex;align-items:center;gap:16px;cursor:pointer;margin-bottom:14px" onclick="openFishModal('${f.id}')">
      <div style="flex:0 0 80px;height:60px;border-radius:10px;overflow:hidden;background:#1a2233" data-photo="${f.id}">
        <div class="image-placeholder" style="font-size:18px">LTC</div>
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#ffcc44">${T("fotw")}</div>
        <div style="font-size:18px;font-weight:800;margin-top:2px">${typeof L==="function"?L(f,"name"):f.name}</div>
        <div style="font-size:12px;color:rgba(255,255,255,.4);margin-top:2px">${(typeof L==="function"?L(f,"overview"):f.overview).substring(0,80)}...</div>
      </div>
      <div style="text-align:right">
        ${f.onSale ? `<div style="font-size:11px;text-decoration:line-through;color:rgba(255,255,255,.3)">${formatMoney(f.price)}</div><div style="font-size:20px;font-weight:900;color:#ff8888">${formatMoney(f.salePrice)}</div>` : `<div style="font-size:20px;font-weight:900;color:#5eebc8">${formatMoney(f.price)}</div>`}
      </div>
    </div>`;
  requestAnimationFrame(applyImagesToDOM);
}

// === EDITABLE BUNDLES (Staff Mode) ===
function staffCreateBundle(){
  // Build a list of in-stock fish IDs for the dropdown-style hint
  const stockFish = FISH.filter(f=>f.inStock).map(f=>`${f.id} (${f.name})`).join(', ');
  showInputModal(T('newBundle'), '', [
    {label: 'Bundle Name', type:'text', value:'', placeholder:'e.g. Beginner Reef Pack'},
    {label: 'Description', type:'text', value:'', placeholder:'Short description...'},
    {label: 'Fish IDs (comma-separated)', type:'text', value:'', placeholder:'ocellaris-clown,cleaner-shrimp'},
    {label: 'Discount %', type:'number', value:'10', placeholder:'10'},
  ], ([name, desc, fishIds, discount]) => {
    if(!name || !fishIds) return;
    const ids = fishIds.split(',').map(s=>s.trim()).filter(Boolean);
    const valid = ids.filter(id=>FISH.find(f=>f.id===id));
    if(valid.length < 2){showToast('Need at least 2 valid fish IDs');return;}
    BUNDLES.push({name, fish:valid, discount:parseInt(discount)||10, desc:desc||''});
    showToast(`${name} ✓`);
    playOpen();
    render();
  });
}

function staffRemoveBundle(idx){
  if(idx >= 0 && idx < BUNDLES.length){
    const name = BUNDLES[idx].name;
    BUNDLES.splice(idx, 1);
    showToast(`${name} removed`);
    render();
  }
}

function staffEditBundle(idx){
  const b = BUNDLES[idx];
  if(!b) return;
  showInputModal(T('edit') + ': ' + b.name, '', [
    {label: 'Description', type:'text', value:b.desc, placeholder:'Short description...'},
    {label: 'Discount %', type:'number', value:String(b.discount), placeholder:'10'},
  ], ([desc, discount]) => {
    if(desc !== null) b.desc = desc;
    if(discount) b.discount = parseInt(discount) || b.discount;
    showToast(`${b.name} updated`);
    render();
  });
}

// === FULL TRANSLATION SYSTEM ===
const TRANSLATIONS = {
  en: {
    // Header & controls
    search: "Search by fish name, nickname, role, or scientific name...",
    reef: "Reef safe only", beginner: "Beginner friendly", clear: "Clear filters",
    sortLabel: "Sort:", sortHint: "Pick a sort mode below.",
    stock: "In Stock", ency: "Fish Encyclopedia",
    hero: "Tap any fish to see care details, compatibility, and pricing",
    tank: "My tank:", gal: "gal", headerPill: "Touch-friendly kiosk mockup", brandSub: "Interactive in-store fish browser",
    
    // Sort options
    featured: "Featured", featuredSub: "Our picks",
    nameAZ: "Name A→Z", nameAZSub: "Alphabetical",
    priceLow: "Lower price first", priceLowSub: "Budget friendly",
    reefFirst: "Reef safer first", reefFirstSub: "Lowest coral risk",
    
    // Card text
    tap: "Tap for full profile", compare: "+ Compare", comparing: "✓ Comparing",
    tankLabel: "Tank", sold: "SOLD", sale: "SALE",
    notify: "Notify when in stock",
    
    // Card meta labels
    minTank: "Min Tank", diet: "Diet", stockSize: "In stock size", origin: "Origin",
    
    // Status pills
    reefSafe: "Reef Safe", mostlySafe: "Mostly Safe", useCaution: "Use Caution", riskyReef: "Risky in Reef",
    beginnerFriendly: "Beginner Friendly", moderateCare: "Moderate Care", intermediateCare: "Intermediate Care", specialistAdv: "Specialist / Advanced",
    veryCalm: "Very Calm", calmMod: "Calm to Moderate", moderate: "Moderate", aggCaution: "Aggression Caution",
    invertLow: "Invert Risk Low", invertCaution: "Invert Caution", invertHigh: "Invert Risk High",
    
    // Difficulty scale
    easy: "Easy", modDiff: "Moderate", intermediate: "Intermediate", advanced: "Advanced", specialist: "Specialist",
    // Generic scale
    veryLow: "Very low", low: "Low", modScale: "Moderate", high: "High", veryHigh: "Very high", extreme: "Extreme",
    
    // Compare
    compareBar: "Compare:", compareGo: "Compare Now", compareClear: "Clear",
    compareTitle: "Fish Comparison", compareClose: "Close",
    scoreComparison: "Score Comparison", details: "Details",
    reefSafety: "Reef Safety", aggression: "Aggression", careDifficulty: "Care Difficulty", invertRisk: "Invert Risk",
    lowerSafer: "Lower is safer", lowerCalmer: "Lower is calmer", lowerEasier: "Lower is easier",
    price: "Price", category: "Category", careLevel: "Care Level",
    maxSize: "Max Size", compatibility: "Compatibility Analysis",
    goodMatch: "Good Match", possibleCaution: "Possible With Caution", notRecommended: "Not Recommended",
    coexistWell: "These fish should coexist well in an appropriately sized tank",
    notInStock: "Not in stock",
    selectTwo: "Select at least 2 fish", maxThree: "Max 3 fish to compare",
    
    // Modal sections
    quickOverview: "Quick overview", whatNotice: "What customers should notice",
    compatGauges: "Compatibility Gauges",
    tempAggression: "Temperament / aggression", coralRisk: "Coral safety risk",
    invertSafetyRisk: "Invert safety risk", careDiffLabel: "Care difficulty",
    veryCalm2: "Very calm", veryDangerous: "Very dangerous / rough",
    reefSafe2: "Reef safe", coralNipper: "Coral nipper / high risk",
    lowInvertRisk: "Low invert risk", likelyHarass: "Likely to harass or eat",
    easyLabel: "Easy", expertSpec: "Expert / specialist",
    atAGlance: "At a glance", displayPrice: "Display Price",
    minimumTank: "Minimum Tank", maxSizeLabel: "Max Size",
    priceRefNote: "For in-store reference only — no cart, no checkout, no ordering flow.",
    tankFitNote: "Fast read for whether the customer\u2019s setup is even in range.",
    careLevelNote: "Separates beginner livestock from animals that need more experience.",
    maxSizeNote: 'Useful for avoiding \u201ccute now, problem later\u201d purchases.',
    similarFish: "Similar fish you might also like", staffNote: "Staff note",
    aliases: "Also known as", noneListedAliases: "None listed",
    seasonalAvail: "Seasonal Availability",
    
    // Results
    showing: n => `Showing ${n} profile${n===1?"":"s"}`,
    noMatch: "No profiles match the current filters.",
    hint: "Tap any card to open a larger pop-up profile with more reading",
    noMatchLong: "No profiles matched those filters. Clear the filters or try a broader search term.",
    
    // Staff
    staffBtn: "Staff", staffMode: "Staff Mode", enterPin: "Enter the 4-digit PIN to access staff controls",
    enter: "Enter", cancel: "Cancel", exitStaff: "Exit Staff", incorrectPin: "Incorrect PIN",
    editPrice: "Edit Price", editTank: "Edit Tank", uploadPhoto: "Upload Photo",
    editStockSize: "Edit Size", editStaffNote: "Edit Staff Note",
    markSold: "Mark Sold", removeLoss: "Remove (Loss)", quarantine: "Quarantine",
    addToStock: "+ Add to Stock", uploadStorePhoto: "+ Upload store photo",
    inventoryBtn: "Inventory", inventoryTitle: "Inventory Manager", inventorySearch: "Search fish, category, tank…",
    allStatuses: "All statuses", statusInStock: "In stock", statusOutOfStock: "Out of stock", statusQuarantine: "Quarantine",
    exportStaff: "Export Staff Data", importStaff: "Import Staff Data", resetStaff: "Reset Staff Data",
    staffActivated: "Staff mode activated — you can now edit prices, tank codes, and mark fish as sold",
    staffDeactivated: "Staff mode deactivated",
    analytics: "Analytics", fishAnalytics: "Fish Browser Analytics",
    mostViewed: "Most Viewed Fish", views: "views", noViews: "No profile views recorded yet.",
    
    // Bundles
    save: "SAVE", newBundle: "+ New Bundle", edit: "Edit", remove: "Remove",
    
    // Fish of the week
    fotw: "⭐ Fish of the Week",
    
    // Water params
    waterParams: "💧 Water Parameters", ph: "pH", salinity: "Salinity (SG)", temperature: "Temperature",
    
    // Status bar (card)
    reefShort: "Reef", careShort: "Care", temperShort: "Temper",
    safe: "Safe", mostlySafeShort: "Mostly", cautionShort: "Caution", riskyShort: "Risky",
    beginnerShort: "Beginner", modShort: "Moderate", interShort: "Inter.", specialistShort: "Specialist",
    calmShort: "Calm", mildShort: "Mild",

    // Categories
    catAll: "All", catTangs: "Tangs", catAngelfish: "Angelfish", catWrasse: "Wrasses",
    catClownfish: "Clownfish", catGobies: "Gobies & Blennies", catDamsels: "Damsels",
    catBasslets: "Basslets", catCardinals: "Cardinals", catAnthias: "Anthias",
    catButterfly: "Butterflies", catHawks: "Hawkfish", catRabbits: "Rabbitfish",
    catTriggers: "Triggers", catPuffers: "Puffers", catEels: "Eels", catLionfish: "Lionfish",
    catOther: "Other Fish", catShrimp: "Shrimp", catCrabs: "Crabs", catSnails: "Snails",
    catUrchins: "Urchins", catStarfish: "Starfish", catClams: "Clams",
    catInverts: "Inverts",
    catSmallReef: "Small Reef Fish", catButterflies: "Butterflies & Rabbits", catPredators: "Predators & Oddballs",
    
    // Badges
    badgeStaffPick: "Staff Pick", badgeNewArrival: "New Arrival", badgeRareFind: "Rare Find", badgeBegFav: "Beginner Favorite",
    
    // Bundles
    bundleBeginner: "Beginner Reef Starter", bundleBeginnerDesc: "Perfect first reef trio — hardy, colorful, and peaceful",
    bundleNano: "Nano Tank Pack", bundleNanoDesc: "Small tank essentials — color, algae control, and cleanup",
    bundleGoby: "Goby & Shrimp Pair", bundleGobyDesc: "Sand-sifting utility with a cleaning station companion",
    
    // Idle
    idleTouch: "Touch anywhere to start browsing",
    idleSub: "Explore our saltwater fish & invertebrate profiles",
    
    // Quarantine
    quarantineDays: d => `Quarantine: ${d} days left`,
    quarantineOngoing: "Quarantine: ongoing",
    clearQ: "Clear",
    soldAgo: (h,r) => `Sold ${h}h ago — auto-removes in ${r}h`,
    removedAgo: h => `Removed ${h}h ago`,
    limited: "📅 Limited",
  },
  es: {
    search: "Buscar por nombre, apodo o nombre científico...",
    reef: "Solo reef safe", beginner: "Para principiantes", clear: "Borrar filtros",
    sortLabel: "Ordenar:", sortHint: "Elige un modo de orden.",
    stock: "En Stock", ency: "Enciclopedia",
    hero: "Toca cualquier pez para ver detalles, compatibilidad y precios",
    tank: "Mi tanque:", gal: "gal", headerPill: "Quiosco táctil", brandSub: "Buscador interactivo de peces en tienda",
    
    featured: "Destacados", featuredSub: "Selecciones",
    nameAZ: "Nombre A→Z", nameAZSub: "Alfabético",
    priceLow: "Menor precio", priceLowSub: "Económico",
    reefFirst: "Más reef safe", reefFirstSub: "Menor riesgo coral",
    
    tap: "Toca para ver perfil", compare: "+ Comparar", comparing: "✓ Comparando",
    tankLabel: "Tanque", sold: "VENDIDO", sale: "OFERTA",
    notify: "Avisar cuando esté disponible",
    
    minTank: "Tanque mín.", diet: "Dieta", stockSize: "Tamaño en stock", origin: "Origen",
    
    reefSafe: "Reef Safe", mostlySafe: "Mayormente Seguro", useCaution: "Precaución", riskyReef: "Riesgo en Reef",
    beginnerFriendly: "Para Principiantes", moderateCare: "Cuidado Moderado", intermediateCare: "Cuidado Intermedio", specialistAdv: "Especialista / Avanzado",
    veryCalm: "Muy Tranquilo", calmMod: "Tranquilo a Moderado", moderate: "Moderado", aggCaution: "Precaución Agresión",
    invertLow: "Riesgo Invert. Bajo", invertCaution: "Precaución Invert.", invertHigh: "Riesgo Invert. Alto",
    
    easy: "Fácil", modDiff: "Moderado", intermediate: "Intermedio", advanced: "Avanzado", specialist: "Especialista",
    veryLow: "Muy bajo", low: "Bajo", modScale: "Moderado", high: "Alto", veryHigh: "Muy alto", extreme: "Extremo",
    
    compareBar: "Comparar:", compareGo: "Comparar ahora", compareClear: "Borrar",
    Sort: "Ordenar", Compare: "Comparar", Quarantine: "Cuarentena",
    compareTitle: "Comparación de Peces", compareClose: "Cerrar",
    scoreComparison: "Puntuaciones", details: "Detalles",
    reefSafety: "Seguridad Reef", aggression: "Agresión", careDifficulty: "Dificultad de Cuidado", invertRisk: "Riesgo Invertebrados",
    lowerSafer: "Menor es más seguro", lowerCalmer: "Menor es más tranquilo", lowerEasier: "Menor es más fácil",
    price: "Precio", category: "Categoría", careLevel: "Nivel de Cuidado",
    maxSize: "Tamaño Máx.", compatibility: "Análisis de Compatibilidad",
    goodMatch: "Buena Combinación", possibleCaution: "Posible con Precaución", notRecommended: "No Recomendado",
    coexistWell: "Estos peces deberían coexistir bien en un tanque de tamaño adecuado",
    notInStock: "No disponible",
    selectTwo: "Selecciona al menos 2 peces", maxThree: "Máximo 3 peces para comparar",
    
    quickOverview: "Resumen rápido", whatNotice: "Lo que los clientes deben saber",
    compatGauges: "Indicadores de Compatibilidad",
    tempAggression: "Temperamento / agresión", coralRisk: "Riesgo para corales",
    invertSafetyRisk: "Riesgo para invertebrados", careDiffLabel: "Dificultad de cuidado",
    veryCalm2: "Muy tranquilo", veryDangerous: "Muy peligroso / agresivo",
    reefSafe2: "Reef safe", coralNipper: "Mordedor de coral / alto riesgo",
    lowInvertRisk: "Bajo riesgo invert.", likelyHarass: "Probable acoso o depredación",
    easyLabel: "Fácil", expertSpec: "Experto / especialista",
    atAGlance: "De un vistazo", displayPrice: "Precio Exhibido",
    minimumTank: "Tanque Mínimo", maxSizeLabel: "Tamaño Máx.",
    priceRefNote: "Solo referencia en tienda — sin carrito ni pedidos.",
    tankFitNote: "Para verificar si el tanque del cliente es adecuado.",
    careLevelNote: "Distingue animales para principiantes de los que necesitan experiencia.",
    maxSizeNote: "Útil para evitar compras impulsivas de peces que crecen mucho.",
    similarFish: "Peces similares que podrían interesarte", staffNote: "Nota del personal",
    aliases: "También conocido como", noneListedAliases: "Sin alias",
    seasonalAvail: "Disponibilidad Estacional",
    
    showing: n => `Mostrando ${n} perfil${n===1?"":"es"}`,
    noMatch: "Ningún perfil coincide con los filtros.",
    hint: "Toca cualquier tarjeta para ver el perfil completo",
    noMatchLong: "No se encontraron perfiles. Borra los filtros o intenta una búsqueda más amplia.",
    
    staffBtn: "Personal", staffMode: "Modo Personal", enterPin: "Ingresa el PIN de 4 dígitos para acceder",
    enter: "Entrar", cancel: "Cancelar", exitStaff: "Salir", incorrectPin: "PIN incorrecto",
    editPrice: "Editar Precio", editTank: "Editar Tanque", uploadPhoto: "Subir Foto",
    editStockSize: "Editar Tamaño", editStaffNote: "Editar Nota",
    markSold: "Marcar Vendido", removeLoss: "Retirar (Pérdida)", quarantine: "Cuarentena",
    addToStock: "+ Agregar a Stock", uploadStorePhoto: "+ Subir foto de tienda",
    inventoryBtn: "Inventario", inventoryTitle: "Gestor de Inventario", inventorySearch: "Buscar pez, categoría, tanque…",
    allStatuses: "Todos", statusInStock: "En stock", statusOutOfStock: "Sin stock", statusQuarantine: "Cuarentena",
    exportStaff: "Exportar Datos", importStaff: "Importar Datos", resetStaff: "Restablecer Datos",
    staffActivated: "Modo personal activado — puedes editar precios, tanques y marcar vendidos",
    staffDeactivated: "Modo personal desactivado",
    analytics: "Analíticas", fishAnalytics: "Analíticas del Buscador",
    mostViewed: "Peces Más Vistos", views: "vistas", noViews: "Sin vistas registradas aún.",
    
    save: "AHORRO", newBundle: "+ Nuevo Combo", edit: "Editar", remove: "Eliminar",
    
    fotw: "⭐ Pez de la Semana",
    
    waterParams: "💧 Parámetros del Agua", ph: "pH", salinity: "Salinidad (GE)", temperature: "Temperatura",
    
    // Status bar (card)
    reefShort: "Reef", careShort: "Cuidado", temperShort: "Temper.",
    safe: "Seguro", mostlySafeShort: "Casi", cautionShort: "Precaución", riskyShort: "Riesgo",
    beginnerShort: "Principi.", modShort: "Moderado", interShort: "Inter.", specialistShort: "Especial.",
    calmShort: "Tranquilo", mildShort: "Suave",

    // Categories
    catAll: "Todos", catTangs: "Tangs", catAngelfish: "Ángeles", catWrasse: "Lábridos",
    catClownfish: "Payasos", catGobies: "Gobios", catDamsels: "Damiselas",
    catBasslets: "Basslets", catCardinals: "Cardenales", catAnthias: "Anthias",
    catButterfly: "Mariposas", catHawks: "Halcones", catRabbits: "Conejos",
    catTriggers: "Ballestas", catPuffers: "Puffers", catEels: "Morenas", catLionfish: "Pez León",
    catOther: "Otros", catShrimp: "Camarones", catCrabs: "Cangrejos", catSnails: "Caracoles",
    catUrchins: "Erizos", catStarfish: "Estrellas", catClams: "Almejas",
    catInverts: "Invertebrados",
    catSmallReef: "Peces Pequeños", catButterflies: "Mariposas y Conejos", catPredators: "Depredadores",
    
    // Badges
    badgeStaffPick: "Selección del Personal", badgeNewArrival: "Recién Llegado", badgeRareFind: "Hallazgo Raro", badgeBegFav: "Favorito Principiante",
    
    // Bundles
    bundleBeginner: "Pack Principiante", bundleBeginnerDesc: "Trío perfecto para primer arrecife — resistente, colorido y pacífico",
    bundleNano: "Pack Nano", bundleNanoDesc: "Esenciales para tanque pequeño — color, control de algas y limpieza",
    bundleGoby: "Par Gobio y Camarón", bundleGobyDesc: "Utilidad de tamizado de arena con compañero de estación de limpieza",
    
    idleTouch: "Toca en cualquier lugar para comenzar",
    idleSub: "Explora nuestros perfiles de peces e invertebrados marinos",
    
    quarantineDays: d => `Cuarentena: ${d} días restantes`,
    quarantineOngoing: "Cuarentena: en curso",
    clearQ: "Liberar",
    soldAgo: (h,r) => `Vendido hace ${h}h — se retira en ${r}h`,
    removedAgo: h => `Retirado hace ${h}h`,
    limited: "📅 Limitado",
  }
};

function T(key){
  const val = TRANSLATIONS[state.lang]?.[key];
  if(val !== undefined) return val;
  return TRANSLATIONS.en?.[key] || key;
}

function applyLanguage(){
  const L = TRANSLATIONS[state.lang];
  if(!L) return;
  
  // All elements with IDs
  const idMap = {
    reefLabel: L.reef, easyLabel: L.beginner, clearLabel: L.clear,
    sortLabel: L.sortLabel, sortHint: L.sortHint,
    compareLabel: L.compareBar, compareGoBtn: L.compareGo, compareClearBtn: L.compareClear,
    compareTitle: L.compareTitle, staffBadge: L.staffBtn,
  };
  for(const [id, text] of Object.entries(idMap)){
    const el = document.getElementById(id);
    if(el) el.textContent = text;
  }
  
  // Placeholder
  const si = document.getElementById('searchInput');
  if(si){
    const isMobile = window.innerWidth <= 600;
    si.placeholder = isMobile ? (state.lang==='es'?'Buscar peces...':'Search fish...') : L.search;
  }
  
  // Mode buttons
  document.querySelectorAll('.mode-btn').forEach(b => {
    if(b.dataset.mode === 'stock') b.textContent = L.stock;
    if(b.dataset.mode === 'ency') b.textContent = L.ency;
  });
  
  // Hero, tank, header pill
  const hero = document.querySelector('.hero-mini');
  if(hero) hero.textContent = L.hero;
  const tl = document.querySelector('.tank-label');
  if(tl) tl.textContent = L.tank;
  

  // Brand subtitle
  const bs = document.getElementById('brandSub');
  if(bs) bs.textContent = L.brandSub;
  
  // Header pill
  const hp = document.getElementById('headerPillText');
  if(hp) hp.textContent = L.headerPill;
  
  // Idle screen
  const idleT = document.getElementById('idleText');
  if(idleT) idleT.textContent = L.idleTouch;
  const idleS = document.getElementById('idleSub');
  if(idleS) idleS.textContent = L.idleSub;

  // Staff PIN overlay
  const pinTitle = document.querySelector('#staffOverlay .pin-box h2');
  if(pinTitle) pinTitle.textContent = L.staffMode;
  const pinDesc = document.querySelector('#staffOverlay .pin-box p');
  if(pinDesc) pinDesc.textContent = L.enterPin;
  const pinEnter = document.getElementById('pinEnterBtn');
  if(pinEnter) pinEnter.textContent = L.enter;
  const pinCancel = document.getElementById('pinCancelBtn');
  if(pinCancel) pinCancel.textContent = L.cancel;
  const exitBtn = document.getElementById('exitStaffBtn');
  if(exitBtn) exitBtn.textContent = L.exitStaff;
  const analyticsBtn2 = document.getElementById('analyticsBtn');
  if(analyticsBtn2) analyticsBtn2.textContent = L.analytics;
  const inventoryBtn = document.getElementById('inventoryBtn');
  if(inventoryBtn) inventoryBtn.textContent = L.inventoryBtn || 'Inventory';
  
  // Compare close button
  const ccb = document.querySelector('#compareOverlay button[onclick*="closeCompare"]');
  if(ccb) ccb.textContent = L.compareClose;
  
  // Analytics title
  const at = document.querySelector('#analyticsOverlay h2');
  if(at) at.textContent = L.fishAnalytics;
  const acb = document.querySelector('#analyticsOverlay button[onclick*="closeAnalytics"]');
  if(acb) acb.textContent = L.compareClose;
}

// === CATEGORY BACKGROUND TINT ===
const CATEGORY_TINTS = {
  "All": null,
  "Tangs":              {tint:"rgba(40,85,168,.25)",  border:"rgba(40,85,168,.4)",  glow:"rgba(40,85,168,.18)"},
  "Angelfish":          {tint:"rgba(204,102,34,.22)", border:"rgba(204,102,34,.4)", glow:"rgba(204,102,34,.15)"},
  "Wrasses":            {tint:"rgba(136,51,187,.22)", border:"rgba(136,51,187,.4)", glow:"rgba(136,51,187,.15)"},
  "Clownfish":          {tint:"rgba(221,119,34,.22)", border:"rgba(221,119,34,.4)", glow:"rgba(221,119,34,.15)"},
  "Small Reef Fish":    {tint:"rgba(46,136,68,.22)",  border:"rgba(46,136,68,.4)",  glow:"rgba(46,136,68,.15)"},
  "Butterflies & Rabbits":{tint:"rgba(238,187,51,.20)",border:"rgba(238,187,51,.4)",glow:"rgba(238,187,51,.12)"},
  "Predators & Oddballs":{tint:"rgba(187,51,68,.22)", border:"rgba(187,51,68,.4)",  glow:"rgba(187,51,68,.15)"},
  "Inverts":            {tint:"rgba(58,154,138,.22)", border:"rgba(58,154,138,.4)", glow:"rgba(58,154,138,.15)"}
};

function updateCategoryTint(){
  const folder = document.querySelector('.folder-content');
  const shell = document.querySelector('.category-shell');
  if(!folder && !shell) return;
  const applyTint = (el, data) => {
    if(!el) return;
    if(data){
      el.style.setProperty('--folder-tint', data.tint);
      el.style.setProperty('--folder-border', data.border);
      el.style.setProperty('--folder-glow', data.glow);
    } else {
      el.style.setProperty('--folder-tint', 'transparent');
      el.style.setProperty('--folder-border', 'rgba(160,210,255,.14)');
      el.style.setProperty('--folder-glow', 'transparent');
    }
  };
  const tintData = CATEGORY_TINTS[state.category];
  applyTint(folder, tintData);
  applyTint(shell, tintData);
}

// Called directly from render cycle in app.js

// === STYLED INPUT MODAL (replaces native prompt()) ===
let _inputModalCallback = null;
let _inputModalFields = [];

// v0.128 — rainbow palette for input modal pills + field accents. Breaks
// up the wall-of-aqua look and makes pill rows read as a colorful band.
// v0.178pre — Reordered to lead with warm/neutral colors. Was
// ['#7bcfff','#5eebc8',...] which made fields 0 and 1 of any modal
// (typically the most prominent fields like "Display name" and
// "Category") read as blue → teal, which Chris flagged as "blue/aqua
// pillboxes" repeatedly. Now leads with amber, then rotates through
// warm tones before hitting blue/teal at the end of the cycle.
const INPUT_MODAL_PALETTE = ['#ffcb5e','#ff9bb6','#c8b2ff','#ffa850','#b8e860','#5eebc8','#7bcfff'];

function showInputModal(title, desc, fields, callback, options){
  options = options || {};
  const overlay = document.getElementById('inputModalOverlay');
  const titleEl = document.getElementById('inputModalTitle');
  const descEl = document.getElementById('inputModalDesc');
  const fieldsEl = document.getElementById('inputModalFields');
  if(!overlay||!titleEl||!descEl||!fieldsEl) return;

  // v0.148 — theme + icon support. Each staff edit action passes a theme
  // ('green'/'blue'/'purple'/'amber'/'rose'/'red'/'cyan') and an SVG icon
  // so the modal has visual identity per action. Falls back to a neutral
  // teal default if no options are passed.
  const modal = overlay.querySelector('.input-modal');
  if(modal){
    // Reset themed classes
    modal.classList.remove(
      'input-modal-themed',
      'input-modal-theme-green','input-modal-theme-blue','input-modal-theme-purple',
      'input-modal-theme-amber','input-modal-theme-rose','input-modal-theme-red',
      'input-modal-theme-cyan','input-modal-destructive','input-modal-grid-2col'
    );
    if(options.theme){
      modal.classList.add('input-modal-themed');
      modal.classList.add('input-modal-theme-' + options.theme);
    }
    if(options.destructive) modal.classList.add('input-modal-destructive');
    if(fields && fields.length >= 5) modal.classList.add('input-modal-grid-2col');
  }

  // v0.148 — title with optional icon glyph in a colored circle
  if(options.icon){
    titleEl.innerHTML = '<span class="input-modal-icon-wrap">' + options.icon + '</span><span class="input-modal-title-text">' + title + '</span>';
  } else {
    titleEl.textContent = title;
  }
  descEl.textContent = desc || '';
  _inputModalCallback = callback;
  _inputModalFields = fields;
  const cancelBtn = document.getElementById('inputModalCancel');
  const confirmBtn = document.getElementById('inputModalConfirm');
  if(cancelBtn) cancelBtn.textContent = options.cancelText || 'Cancel';
  if(confirmBtn){
    confirmBtn.style.display = '';
    confirmBtn.textContent = options.confirmText || 'Save';
    // v0.148 — gradient sweep + bubble particles on confirm tap. Replaces
    // the boring "click and hope" feel with visible feedback that the
    // action fired. Applied via class toggle so the animation can replay.
    confirmBtn.classList.remove('btn-confirm-sweeping');
  }

  fieldsEl.innerHTML = fields.map((f, i) => {
    const fieldAccent = INPUT_MODAL_PALETTE[i % INPUT_MODAL_PALETTE.length];
    if(f.type === 'select'){
      const options = (f.options || []);
      const optionsHtml = options.map(o => `<option value="${o}" ${String(o)===String(f.value)?'selected':''}>${o}</option>`).join('');
      if(f.compact){
        return `
          <div class="input-modal-field input-modal-field-select input-modal-field-compact" style="--field-accent:${fieldAccent}">
            <label>${f.label}</label>
            <div class="input-compact-select-wrap">
              <select id="inputField${i}" data-field-index="${i}" class="input-compact-select">${optionsHtml}</select>
              <span class="input-compact-chev">▾</span>
            </div>
          </div>
        `;
      }
      const choiceHtml = options.map((o, oi) => {
        const pillColor = INPUT_MODAL_PALETTE[oi % INPUT_MODAL_PALETTE.length];
        return `<button type="button" class="input-choice-btn ${String(o)===String(f.value)?'is-active':''}" style="--pill-c:${pillColor}" data-choice-target="inputField${i}" data-choice-value="${o}">${o}</button>`;
      }).join('');
      return `
        <div class="input-modal-field input-modal-field-select" style="--field-accent:${fieldAccent}">
          <label>${f.label}</label>
          <select id="inputField${i}" data-field-index="${i}">${optionsHtml}</select>
          <div class="input-choice-grid" data-choice-grid-for="inputField${i}">${choiceHtml}</div>
        </div>
      `;
    }
    if(f.type === 'textarea'){
      return `
        <div class="input-modal-field input-modal-field-wide" style="--field-accent:${fieldAccent}">
          <label>${f.label}</label>
          <textarea id="inputField${i}" placeholder="${f.placeholder||''}" rows="${f.rows||4}">${f.value||''}</textarea>
        </div>
      `;
    }
    return `
      <div class="input-modal-field" style="--field-accent:${fieldAccent}">
        <label>${f.label}</label>
        <input id="inputField${i}" type="${f.type||'text'}" value="${f.value||''}" placeholder="${f.placeholder||''}">
      </div>
    `;
  }).join('');

  fieldsEl.querySelectorAll('select').forEach(selectEl => {
    const syncChoiceGrid = () => {
      const grid = fieldsEl.querySelector(`[data-choice-grid-for="${selectEl.id}"]`);
      if(!grid) return;
      grid.querySelectorAll('.input-choice-btn').forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.choiceValue === selectEl.value);
      });
    };
    selectEl.addEventListener('change', syncChoiceGrid);
    syncChoiceGrid();
  });
  fieldsEl.querySelectorAll('.input-choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // v0.128 — tactile feedback on pill tap
      if(typeof ltcFx !== 'undefined' && ltcFx.jelly) ltcFx.jelly(btn);
      const target = document.getElementById(btn.dataset.choiceTarget);
      if(!target) return;
      target.value = btn.dataset.choiceValue;
      target.dispatchEvent(new Event('change', {bubbles:true}));
      target.focus();
    });
  });

  overlay.classList.remove('wide');
  if(fields && fields.length >= 5) overlay.classList.add('wide');
  overlay.classList.add('show');
  const firstInput = fieldsEl.querySelector('input,select,textarea');
  if(firstInput) setTimeout(()=>firstInput.focus(), 100);

  fieldsEl.querySelectorAll('input,select').forEach(inp => {
    inp.addEventListener('keydown', e => { if(e.key==='Enter') confirmInputModal(); });
  });
}

function showConfirmModal(title, desc, onConfirm, options={}){
  const overlay = document.getElementById('inputModalOverlay');
  const titleEl = document.getElementById('inputModalTitle');
  const descEl = document.getElementById('inputModalDesc');
  const fieldsEl = document.getElementById('inputModalFields');
  const cancelBtn = document.getElementById('inputModalCancel');
  const confirmBtn = document.getElementById('inputModalConfirm');
  if(!overlay||!titleEl||!descEl||!fieldsEl||!cancelBtn||!confirmBtn) return;
  titleEl.textContent = title;
  descEl.textContent = desc || '';
  fieldsEl.innerHTML = options.html || '';
  _inputModalCallback = () => { if(typeof onConfirm === 'function') onConfirm(); };
  _inputModalFields = [];
  cancelBtn.textContent = options.cancelText || 'Cancel';
  confirmBtn.textContent = options.confirmText || 'Confirm';
  confirmBtn.style.display = '';
  overlay.classList.remove('wide');
  overlay.classList.add('show');
  triggerGaugeFx(overlay);
}

function confirmInputModal(){
  // v0.148 — gradient sweep + bubble particles before firing the callback.
  // Gives staff visible confirmation that their tap registered. The actual
  // state change still fires after a short delay so the animation reads.
  const confirmBtn = document.getElementById('inputModalConfirm');
  if(confirmBtn){
    confirmBtn.classList.remove('btn-confirm-sweeping');
    void confirmBtn.offsetWidth;
    confirmBtn.classList.add('btn-confirm-sweeping');
    if(typeof ltcFx !== 'undefined' && ltcFx.bubbles){
      try { ltcFx.bubbles(confirmBtn, {count:14}); } catch(_){}
    }
  }
  const values = _inputModalFields.map((f,i) => {
    const el = document.getElementById('inputField'+i);
    return el ? el.value : '';
  });
  // Small delay so the sweep animation is visible before the modal closes
  setTimeout(function(){
    closeInputModal();
    if(_inputModalCallback) _inputModalCallback(values);
  }, 240);
}

function closeInputModal(){
  const overlay = document.getElementById('inputModalOverlay');
  if(overlay){ overlay.classList.remove('show'); overlay.classList.remove('wide'); }
  const cancelBtn = document.getElementById('inputModalCancel');
  const confirmBtn = document.getElementById('inputModalConfirm');
  if(cancelBtn) cancelBtn.textContent = 'Cancel';
  if(confirmBtn){
    confirmBtn.style.display = '';
    confirmBtn.textContent = 'Confirm';
  }
  _inputModalCallback = null;
  // v0.188-exp-3 — fire a custom event so the experimental fish modal
  // can refresh itself after a staff edit popup closes. Without this,
  // edits made via the editable cards in the new modal don't appear
  // until the modal is closed and reopened (a pre-existing bug that's
  // much more visible in the new editable-card layout). Generic event
  // — any future code that needs to react to input modal close can
  // listen on this same event.
  try { document.dispatchEvent(new CustomEvent('ltc:input-modal-closed')); } catch(_e){}
}

// === IMAGE OVERRIDE SYSTEM ===
// Allows local images to override Wikipedia fetches
// Place images in a "thumbs/" subfolder, named by fish ID: thumbs/gem-tang.jpg
// Or define overrides in imageOverrides below
const imageOverrides = {};
// Example: imageOverrides['gem-tang'] = 'thumbs/gem-tang.jpg';

function checkImageOverrides(){
  for(const [fishId, url] of Object.entries(imageOverrides)){
    const fish = FISH.find(f => f.id === fishId);
    if(fish){
      wikiImages.set(fish.photoTitle, url);
      if(typeof fishImages!=='undefined') fishImages.set(fish.id, url);
    }
  }
  // Also try loading from thumbs/ folder for each in-stock fish
  FISH.filter(f => f.inStock).forEach(f => {
    const img = new Image();
    const thumbUrl = `thumbs/${f.id}.jpg`;
    img.onload = () => {
      wikiImages.set(f.photoTitle, thumbUrl);
      if(typeof fishImages!=='undefined') fishImages.set(f.id, thumbUrl);
      applyImagesToDOM();
    };
    img.onerror = () => {}; // silently fail, Wikipedia fallback handles it
    img.src = thumbUrl;
  });
}

// Run after page load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(checkImageOverrides, 500);
});

// === STARTUP (runs after T() is defined) ===
async function bootstrapFishBrowser(){
  if(typeof hydrateStaffEdits === 'function'){
    try{ await hydrateStaffEdits(); }catch(_e){}
  }
  render();
  updateFavCounter();
  updateCompareBar();
  applyLanguage();
  loadAllImages();
}
bootstrapFishBrowser();

// === STICKY CATEGORY POSITION ===
// Measures control-panel height and sets CSS variable so category tabs stick below it
function updatePanelHeight(){
  const panel = document.querySelector('.control-panel');
  if(panel){
    const h = panel.offsetHeight;
    document.documentElement.style.setProperty('--panel-h', h + 'px');
  }
}
window.addEventListener('load', updatePanelHeight);
window.addEventListener('resize', updatePanelHeight);
setTimeout(updatePanelHeight, 100);
