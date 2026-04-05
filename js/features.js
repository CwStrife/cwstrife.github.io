// LTC Fish Browser — Additional Features (V23+)

// === LOGO INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
  const hl = document.getElementById('headerLogo');
  if(hl && typeof HEADER_LOGO !== 'undefined') hl.src = HEADER_LOGO;
  const il = document.getElementById('idleLogo');
  if(il && typeof IDLE_LOGO !== 'undefined') il.src = IDLE_LOGO;
});

// === WATER PARAMETERS UI ===
function waterParamGauge(low, high, absMin, absMax, unit, color){
  const range = absMax - absMin;
  const pctLow = ((low - absMin) / range) * 100;
  const pctHigh = ((high - absMin) / range) * 100;
  return `<div class="wp-gauge">
    <div class="wp-track">
      <div class="wp-fill" style="left:${pctLow}%;width:${pctHigh-pctLow}%;background:${color};box-shadow:0 0 8px ${color}66"></div>
    </div>
    <div class="wp-labels">
      <span class="wp-min">${absMin}${unit}</span>
      <span class="wp-value" style="color:${color}">${low}${unit} — ${high}${unit}</span>
      <span class="wp-max">${absMax}${unit}</span>
    </div>
  </div>`;
}

function waterParamsSection(item){
  if(!item.water) return '';
  const w = item.water;
  return `
    <div class="modal-section modal-water">
      <div class="section-title"><h3>${T("waterParams")}</h3></div>
      <div class="water-param-grid">
        <div class="water-param-card ph">
          <div class="water-param-label">${T("ph")}</div>
          ${waterParamGauge(w.ph_low, w.ph_high, 7.5, 9.0, '', '#4eddbb')}
        </div>
        <div class="water-param-card sal">
          <div class="water-param-label">${T("salinity")}</div>
          ${waterParamGauge(w.sal_low, w.sal_high, 1.018, 1.030, '', '#60b0ff')}
        </div>
        <div class="water-param-card temp">
          <div class="water-param-label">${T("temperature")}</div>
          ${waterParamGauge(w.temp_low, w.temp_high, 65, 85, '°F', '#e89838')}
        </div>
      </div>
    </div>`;
}

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
    copyInfo: "Copy fish + tank info",
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
    markSold: "Mark Sold", removeLoss: "Remove (Loss)", quarantine: "Quarantine",
    addToStock: "+ Add to Stock", uploadStorePhoto: "+ Upload store photo",
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
    catUrchins: "Urchins", catStarfish: "Starfish", catAnemones: "Anemones", catClams: "Clams",
    catInverts: "Inverts",
    catSmallReef: "Small Reef Fish", catButterflies: "Butterflies & Rabbits", catPredators: "Predators & Oddballs", catAnemones: "Anemones & Clams",
    
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
    copyInfo: "Copiar info del pez + tanque",
    seasonalAvail: "Disponibilidad Estacional",
    
    showing: n => `Mostrando ${n} perfil${n===1?"":"es"}`,
    noMatch: "Ningún perfil coincide con los filtros.",
    hint: "Toca cualquier tarjeta para ver el perfil completo",
    noMatchLong: "No se encontraron perfiles. Borra los filtros o intenta una búsqueda más amplia.",
    
    staffBtn: "Personal", staffMode: "Modo Personal", enterPin: "Ingresa el PIN de 4 dígitos para acceder",
    enter: "Entrar", cancel: "Cancelar", exitStaff: "Salir", incorrectPin: "PIN incorrecto",
    editPrice: "Editar Precio", editTank: "Editar Tanque", uploadPhoto: "Subir Foto",
    markSold: "Marcar Vendido", removeLoss: "Retirar (Pérdida)", quarantine: "Cuarentena",
    addToStock: "+ Agregar a Stock", uploadStorePhoto: "+ Subir foto de tienda",
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
    catUrchins: "Erizos", catStarfish: "Estrellas", catAnemones: "Anémonas", catClams: "Almejas",
    catInverts: "Invertebrados",
    catSmallReef: "Peces Pequeños", catButterflies: "Mariposas y Conejos", catPredators: "Depredadores", catAnemones: "Anémonas y Almejas",
    
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
  "Inverts":            {tint:"rgba(58,154,138,.22)", border:"rgba(58,154,138,.4)", glow:"rgba(58,154,138,.15)"},
  "Anemones & Clams":   {tint:"rgba(85,170,204,.22)",border:"rgba(85,170,204,.4)", glow:"rgba(85,170,204,.15)"}
};

function updateCategoryTint(){
  const folder = document.querySelector('.folder-content');
  if(!folder) return;
  const tintData = CATEGORY_TINTS[state.category];
  if(tintData){
    folder.style.setProperty('--folder-tint', tintData.tint);
    folder.style.setProperty('--folder-border', tintData.border);
    folder.style.setProperty('--folder-glow', tintData.glow);
  } else {
    folder.style.setProperty('--folder-tint', 'transparent');
    folder.style.setProperty('--folder-border', 'rgba(160,210,255,.14)');
    folder.style.setProperty('--folder-glow', 'transparent');
  }
}

// Called directly from render cycle in app.js

// === STYLED INPUT MODAL (replaces native prompt()) ===
let _inputModalCallback = null;
let _inputModalFields = [];

function showInputModal(title, desc, fields, callback){
  const overlay = document.getElementById('inputModalOverlay');
  const titleEl = document.getElementById('inputModalTitle');
  const descEl = document.getElementById('inputModalDesc');
  const fieldsEl = document.getElementById('inputModalFields');
  if(!overlay||!titleEl||!descEl||!fieldsEl) return;
  
  titleEl.textContent = title;
  descEl.textContent = desc || '';
  _inputModalCallback = callback;
  _inputModalFields = fields;
  
  fieldsEl.innerHTML = fields.map((f, i) => `
    <div class="input-modal-field">
      <label>${f.label}</label>
      ${f.type === 'select' ? `<select id="inputField${i}">${f.options.map(o=>`<option value="${o}" ${o===f.value?'selected':''}>${o}</option>`).join('')}</select>`
        : `<input id="inputField${i}" type="${f.type||'text'}" value="${f.value||''}" placeholder="${f.placeholder||''}">`}
    </div>
  `).join('');
  
  overlay.classList.add('show');
  const firstInput = fieldsEl.querySelector('input,select');
  if(firstInput) setTimeout(()=>firstInput.focus(), 100);
  
  // Enter key submits
  fieldsEl.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('keydown', e => { if(e.key==='Enter') confirmInputModal(); });
  });
}

function confirmInputModal(){
  const values = _inputModalFields.map((f,i) => {
    const el = document.getElementById('inputField'+i);
    return el ? el.value : '';
  });
  closeInputModal();
  if(_inputModalCallback) _inputModalCallback(values);
}

function closeInputModal(){
  const overlay = document.getElementById('inputModalOverlay');
  if(overlay) overlay.classList.remove('show');
  _inputModalCallback = null;
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
    }
  }
  // Also try loading from thumbs/ folder for each in-stock fish
  FISH.filter(f => f.inStock).forEach(f => {
    const img = new Image();
    const thumbUrl = `thumbs/${f.id}.jpg`;
    img.onload = () => {
      wikiImages.set(f.photoTitle, thumbUrl);
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
render();
updateFavCounter();
updateCompareBar();
loadAllImages();
applyLanguage();

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
