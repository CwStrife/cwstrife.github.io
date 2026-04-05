// LTC Fish Browser — Main Application

// T() polyfill — features.js defines the real version with translations.
// This fallback ensures app.js functions work even before features.js loads.
if(typeof T !== 'function'){ var T = function(k){ return k; }; }

// FISH data loaded from data/fish.js
const state = {
  viewMode: 'detailed', category:"All", search:"", sort:"featured", reefOnly:false, easyOnly:false, selectedId:null, mode:"stock", favorites:[], compareList:[], tankFilter:0, idleActive:false };
const wikiImages = new Map();
const fishImages = new Map();

// Localized content helper — returns Spanish field if available and lang is 'es'

// Category name translation
const CAT_KEYS = {
  "All":"catAll","Tangs":"catTangs","Angelfish":"catAngelfish","Wrasses":"catWrasse",
  "Clownfish":"catClownfish","Gobies & Blennies":"catGobies","Damsels":"catDamsels",
  "Basslets & Dottybacks":"catBasslets","Cardinalfish":"catCardinals","Anthias":"catAnthias",
  "Butterflyfish":"catButterfly","Hawkfish":"catHawks","Rabbitfish":"catRabbits",
  "Triggerfish":"catTriggers","Puffers":"catPuffers","Eels":"catEels","Lionfish":"catLionfish",
  "Other Fish":"catOther","Shrimp":"catShrimp","Crabs":"catCrabs","Snails":"catSnails",
  "Urchins":"catUrchins","Starfish":"catStarfish","Anemones":"catAnemones","Clams":"catClams",
  "Inverts":"catInverts",
  "Small Reef Fish":"catSmallReef","Butterflies & Rabbits":"catButterflies",
  "Predators & Oddballs":"catPredators","Anemones & Clams":"catAnemones"
};
function TC(cat){ return T(CAT_KEYS[cat] || 'catAll'); }

// Badge translation  
const BADGE_KEYS = {"Staff Pick":"badgeStaffPick","New Arrival":"badgeNewArrival","Rare Find":"badgeRareFind","Beginner Favorite":"badgeBegFav"};
function TB(badge){ return T(BADGE_KEYS[badge] || badge); }

function L(item, field){
  if(state.lang === 'es' && item[field+'_es']) return item[field+'_es'];
  return item[field] || '';
}

function formatMoney(num){
  return new Intl.NumberFormat('en-US', { style:'currency', currency:'USD' }).format(num);
}
function isPhonePortrait(){
  return window.matchMedia('(max-width: 600px) and (pointer: coarse)').matches && window.innerHeight >= window.innerWidth;
}
function getImageCandidates(item){
  const out=[];
  const push=(val)=>{
    if(!val || typeof val !== 'string') return;
    const v = val.trim();
    if(v && !out.includes(v)) out.push(v);
  };
  push(item.photoTitle);
  push(item.scientific);
  push(item.name);
  (item.aliases||[]).forEach(push);
  for(const raw of [...out]){
    push(raw.replace(/_/g,' '));
    push(raw.replace(/\s+/g,'_'));
  }
  return out;
}
function getGallerySources(item){
  const seen = new Set();
  const out = [];
  const primary = fishImages.get(item.id) || wikiImages.get(item.photoTitle);
  if(primary && !seen.has(primary)){
    seen.add(primary);
    out.push({src: primary, kind: 'wiki'});
  }
  (item.staffPhotos || []).forEach(src => {
    if(src && !seen.has(src)){
      seen.add(src);
      out.push({src, kind: 'staff'});
    }
  });
  return out;
}
function galleryTemplate(item){
  const sources = getGallerySources(item);
  if(sources.length < 2 && !state.staffMode) return '';
  return `
    <div class="photo-gallery">
      ${sources.map((entry, idx) => `
        <button type="button" class="photo-gallery-thumb${idx === 0 ? ' active' : ''}" onclick="swapModalPhotoFromThumb(this,'${item.id}')">
          <img src="${entry.src}" alt="${L(item,'name')} photo ${idx + 1}">
        </button>
      `).join('')}
      ${state.staffMode ? `<button type="button" class="photo-gallery-upload" onclick="event.stopPropagation();staffUploadPhoto('${item.id}')">+</button>` : ''}
    </div>
  `;
}
function updateViewToggleUI(){
  const btn = document.getElementById('viewToggle');
  if(!btn) return;
  const compact = state.viewMode === 'compact';
  btn.dataset.mode = state.viewMode;
  btn.classList.toggle('active', compact);
  btn.setAttribute('aria-pressed', String(compact));
  const icon = btn.querySelector('.view-toggle-icon');
  const text = btn.querySelector('.view-toggle-text');
  if(icon) icon.textContent = compact ? '☰' : '▦';
  if(text) text.textContent = compact ? 'Detail' : 'Grid';
  const nextLabel = compact ? 'Switch to detailed view' : 'Switch to grid view';
  btn.setAttribute('aria-label', nextLabel);
  btn.title = nextLabel;
}
function updateCategoryRailUI(){
  const shell = document.getElementById('categoryShell');
  const bar = document.getElementById('categoryBar');
  if(!shell || !bar) return;
  const canScroll = bar.scrollWidth > bar.clientWidth + 8;
  const maxScroll = Math.max(0, bar.scrollWidth - bar.clientWidth);
  shell.classList.toggle('is-scrollable', canScroll);
  shell.classList.toggle('can-scroll-left', canScroll && bar.scrollLeft > 8);
  shell.classList.toggle('can-scroll-right', canScroll && bar.scrollLeft < maxScroll - 8);
}
function scrollCategoryRail(dir){
  const bar = document.getElementById('categoryBar');
  if(!bar) return;
  const amount = Math.max(120, Math.round(bar.clientWidth * 0.65)) * dir;
  bar.scrollBy({left: amount, behavior: 'smooth'});
  setTimeout(updateCategoryRailUI, 260);
}
function updateBundleRailUI(){
  const shell = document.getElementById('bundleShell');
  const row = document.getElementById('bundleRow');
  if(!shell || !row) return;
  const canScroll = row.scrollWidth > row.clientWidth + 8;
  const maxScroll = Math.max(0, row.scrollWidth - row.clientWidth);
  shell.classList.toggle('is-scrollable', canScroll);
  shell.classList.toggle('can-scroll-left', canScroll && row.scrollLeft > 8);
  shell.classList.toggle('can-scroll-right', canScroll && row.scrollLeft < maxScroll - 8);
}
function scrollBundleRail(dir){
  const row = document.getElementById('bundleRow');
  if(!row) return;
  const amount = Math.max(120, Math.round(row.clientWidth * 0.72)) * dir;
  row.scrollBy({left: amount, behavior: 'smooth'});
  setTimeout(updateBundleRailUI, 260);
}

let railObserverBound = false;
function bindRailObservers(){
  if(railObserverBound) return;
  railObserverBound = true;
  const refresh = ()=>{ updateCategoryRailUI(); updateBundleRailUI(); };
  window.addEventListener('load', refresh, {passive:true});
  window.addEventListener('orientationchange', ()=>setTimeout(refresh, 180), {passive:true});
  setTimeout(refresh, 120);
  setTimeout(refresh, 500);
  if(typeof ResizeObserver !== 'undefined'){
    const ro = new ResizeObserver(()=>refresh());
    const catShell = document.getElementById('categoryShell');
    const catBar = document.getElementById('categoryBar');
    const bundleShell = document.getElementById('bundleShell');
    const bundleRow = document.getElementById('bundleRow');
    if(catShell) ro.observe(catShell);
    if(catBar) ro.observe(catBar);
    if(bundleShell) ro.observe(bundleShell);
    if(bundleRow) ro.observe(bundleRow);
  }
}
function categoryCounts(){
  const pool = state.mode === 'stock' ? FISH.filter(f=>f.inStock) : FISH;
  return pool.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});
}
function cardSearchText(item){
  return [
    item.name, item.scientific, item.category, item.role, item.diet, item.origin, item.habitat,
    item.tankCode, item.visualCue, item.staffNote, ...(item.aliases || []), ...(item.bestWith || []), ...(item.cautionWith || [])
  ].join(' ').toLowerCase();
}
function riskText(score, mode='risk'){
  if(mode === 'difficulty'){
    if(score <= 18) return T('easyLabel');
    if(score <= 38) return 'Moderate';
    if(score <= 60) return 'Intermediate';
    if(score <= 78) return 'Advanced';
    return 'Specialist';
  }
  if(score <= 10) return 'Very low';
  if(score <= 28) return 'Low';
  if(score <= 48) return 'Moderate';
  if(score <= 70) return 'High';
  if(score <= 88) return 'Very high';
  return 'Extreme';
}
function catColorClass(cat){
  const map = {'Tangs':'cat-tangs','Angelfish':'cat-angelfish','Wrasses':'cat-wrasses',
    'Gobies & Blennies':'cat-gobies','Clownfish':'cat-clownfish','Damsels':'cat-damsels',
    'Basslets & Dottybacks':'cat-basslets','Cardinalfish':'cat-cardinals','Anthias':'cat-anthias',
    'Butterflyfish':'cat-butterfly','Hawkfish':'cat-hawks','Rabbitfish':'cat-rabbits',
    'Triggerfish':'cat-triggers','Puffers':'cat-puffers','Eels':'cat-eels','Lionfish':'cat-lionfish',
    'Other Fish':'cat-other','Shrimp':'cat-shrimp','Crabs':'cat-crabs','Snails':'cat-snails',
    'Urchins':'cat-urchins','Starfish':'cat-starfish','Anemones':'cat-anemones','Clams':'cat-clams',
    'Inverts':'cat-inverts'};
  return map[cat] || '';
}
function reefChip(score){
  if(score <= 8) return [T('reefSafe'),'reef-safe'];
  if(score <= 20) return [T('mostlySafe'),'reef-ok'];
  if(score <= 40) return [T('useCaution'),'reef-warn'];
  return [T('riskyReef'),'reef-risk'];
}
function careChip(score){
  if(score <= 22) return [T('beginnerFriendly'),'care-easy'];
  if(score <= 42) return [T('moderateCare'),'care-mod'];
  if(score <= 64) return [T('intermediateCare'),'care-inter'];
  return [T('specialistAdv'),'care-expert'];
}
function aggressionChip(score){
  if(score <= 14) return [T('veryCalm'),'agg-calm'];
  if(score <= 34) return [T('calmMod'),'agg-mild'];
  if(score <= 54) return [T('moderate'),'agg-mod'];
  return [T('aggCaution'),'agg-hot'];
}
function invertChip(score){
  if(score <= 8) return [T('invertLow'),'safe'];
  if(score <= 24) return [T('invertCaution'),'warn'];
  return [T('invertHigh'),'risk'];
}
function getFilteredFish(){
  let list = [...FISH];
  // Mode filter
  // Mode filter — stock shows in-stock + recently sold (24h retention)
  if(state.mode === 'stock') list = list.filter(item => {
    if(item.inStock) return true;
    if(item.soldAt && (Date.now() - item.soldAt) < 86400000) return true; // 24h retention
    return false;
  });
  if(state.category !== 'All'){
    const tabMap = typeof STOREFRONT_MAP !== 'undefined' ? STOREFRONT_MAP : null;
    if(tabMap && tabMap[state.category]){
      const subCats = tabMap[state.category];
      list = list.filter(item => subCats.includes(item.category));
    } else {
      list = list.filter(item => item.category === state.category);
    }
  }
  if(state.search.trim()){
    const q = state.search.trim().toLowerCase();
    list = list.filter(item => cardSearchText(item).includes(q) || item.overview.toLowerCase().includes(q));
  }
  if(state.reefOnly) list = list.filter(item => item.coralRisk <= 12);
  if(state.easyOnly) list = list.filter(item => item.careDifficulty <= 28);
  // Tank size filter
  if(state.tankFilter > 0){
    list = list.filter(item => {
      const match = item.minTank.match(/(\d+)/);
      return match ? parseInt(match[1]) <= state.tankFilter : true;
    });
  }

  switch(state.sort){
    case 'name':
      list.sort((a,b) => a.name.localeCompare(b.name));
      break;
    case 'priceLow':
      list.sort((a,b) => a.price - b.price);
      break;
    case 'reefSafe':
      list.sort((a,b) => a.coralRisk - b.coralRisk);
      break;
    default:
      break;
  }
  return list;
}
function renderSortOptions(){
  const grid = document.getElementById('sortGrid');
  if(!grid) return;
  const sortLabels = typeof T === 'function' ? {
    featured: {label:T('featured'),sub:T('featuredSub')},
    name: {label:T('nameAZ'),sub:T('nameAZSub')},
    priceLow: {label:T('priceLow'),sub:T('priceLowSub')},
    reefSafe: {label:T('reefFirst'),sub:T('reefFirstSub')},
  } : null;
  grid.innerHTML = Object.entries(SORT_OPTIONS).map(([key, val]) => {
    const lbl = sortLabels?.[key] || val;
    return `<button class="sort-choice ${state.sort === key ? 'active' : ''}" data-sort="${key}" type="button">
      <small>${lbl.sub}</small>
      <strong>${lbl.label}</strong>
    </button>`;
  }).join('');
  [...grid.querySelectorAll('.sort-choice')].forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.sort = btn.dataset.sort;
      playSort();
      addRipple(btn,e);
      btn.classList.add('shimmer-click');
      btn.addEventListener('animationend',()=>btn.classList.remove('shimmer-click'),{once:true});
      render();
    });
  });
}
function renderCategories(){
  const bar = document.getElementById('categoryBar');
  if(!bar) return;
  // Use STOREFRONT tabs if available, fall back to raw categories
  const tabOrder = typeof STOREFRONT_ORDER !== 'undefined' ? STOREFRONT_ORDER : CATEGORY_ORDER;
  const tabStyles = typeof STOREFRONT_STYLES !== 'undefined' ? STOREFRONT_STYLES : CATEGORY_STYLES;
  const tabMap = typeof STOREFRONT_MAP !== 'undefined' ? STOREFRONT_MAP : null;
  
  bar.innerHTML = tabOrder.map(tab => {
    // Count fish matching this tab
    let count;
    if(tab === 'All'){
      count = state.mode === 'stock' ? FISH.filter(f=>f.inStock).length : FISH.length;
    } else if(tabMap && tabMap[tab]){
      const subCats = tabMap[tab];
      count = FISH.filter(f => {
        if(state.mode === 'stock' && !f.inStock) return false;
        return subCats.includes(f.category);
      }).length;
    } else {
      count = FISH.filter(f => {
        if(state.mode === 'stock' && !f.inStock) return false;
        return f.category === tab;
      }).length;
    }
    const [top, bottom, glow] = tabStyles[tab] || tabStyles["All"] || ["#888","#444","rgba(128,128,128,.4)"];
    return `<button class="folder-tab ${state.category === tab ? 'active' : ''}" data-category="${tab}" style="--tab-top:${top};--tab-bottom:${bottom};--tab-border:rgba(255,255,255,.18);--tab-glow:${glow};">${TC(tab)} <span>(${count})</span></button>`;
  }).join('');
  [...bar.querySelectorAll('.folder-tab')].forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.category = btn.dataset.category;
      playTab();
      addRipple(btn,e);
      btn.classList.add('tab-glow');
      btn.addEventListener('animationend',()=>btn.classList.remove('tab-glow'),{once:true});
      render();
    });
  });
  if(!bar.dataset.boundScroll){
    bar.addEventListener('scroll', updateCategoryRailUI, {passive:true});
    bar.dataset.boundScroll = 'true';
  }
  requestAnimationFrame(()=>{ updateCategoryRailUI(); updateBundleRailUI(); bindRailObservers(); });
}
function updateTopControls(){
  renderSortOptions();
  const reefBtn = document.getElementById('reefOnlyBtn');
  const easyBtn = document.getElementById('easyOnlyBtn');
  if(!reefBtn||!easyBtn) return;
  reefBtn.classList.toggle('active', state.reefOnly);
  easyBtn.classList.toggle('active', state.easyOnly);
  const rd = reefBtn.querySelector('.toggle-dot');
  const ed = easyBtn.querySelector('.toggle-dot');
  if(rd) rd.classList.toggle('on', state.reefOnly);
  if(ed) ed.classList.toggle('on', state.easyOnly);
  reefBtn.setAttribute('aria-pressed', String(state.reefOnly));
  easyBtn.setAttribute('aria-pressed', String(state.easyOnly));
}
function cardTemplate(item){
  const [reefText, reefClass] = reefChip(item.coralRisk);
  const [careText, careClass] = careChip(item.careDifficulty);
  const [aggText, aggClass] = aggressionChip(item.aggression);
  const isEncy = state.mode === 'ency';
  const isFav = state.favorites.includes(item.id);
  const isComp = state.compareList.includes(item.id);
  const badgeHtml = item.badges && item.badges.length ? `<div class="card-badges">${item.badges.map(b=>{
    const cls = b==='Staff Pick'?'badge-staff':b==='New Arrival'?'badge-new':b==='Rare Find'?'badge-rare':'badge-beginner';
    return `<span class="badge ${cls}">${TB(b)}</span>`;
  }).join('')}${item.seasonal ? `<span class="badge" style="background:rgba(255,200,60,.15);border:1px solid rgba(255,200,60,.25);color:#eebb44">${typeof T==='function'?T('limited'):'📅 Limited'}</span>` : ''}</div>` : (item.seasonal ? `<div class="card-badges"><span class="badge" style="background:rgba(255,200,60,.15);border:1px solid rgba(255,200,60,.25);color:#eebb44">${typeof T==='function'?T('limited'):'📅 Limited'}</span></div>` : '');
  const onCardSale = !!item.onSale && !!item.salePrice && !isEncy && !!item.price;
  const oldCompactPriceHtml = onCardSale ? `<span class="card-old-price-inline">${formatMoney(item.price)}</span><span class="card-sale-inline">${typeof T==="function"?T("sale"):"SALE"}</span>` : '';
  const priceHtml = isEncy || !item.price ? '' : onCardSale
    ? `<div class="price-badge sale-main-badge"><span class="price-value sale-price">${formatMoney(item.salePrice)}</span></div>`
    : `<div class="price-badge"><span class="price-value">${formatMoney(item.price)}</span></div>`;
  const tankHtml = isEncy || !item.tankCode ? '' : `<div class="tank-pill">${typeof T==='function'?T('tankLabel'):'Tank'} ${item.tankCode}</div>`;
  const sizeInches = (typeof SIZE_SCALE!=='undefined' && item.stockSize && SIZE_SCALE[item.stockSize]) ? ' ('+SIZE_SCALE[item.stockSize]+')' : '';
  const stockMeta = isEncy ? '' : `<div class="meta-box"><div class="meta-label">${typeof T==="function"?T("stockSize"):"In stock size"}</div><div class="meta-value">${item.stockSize||'—'}${sizeInches}</div></div>`;
  const isSold = !item.inStock && item.soldAt;
  const soldOverlay = isSold ? `<div style="position:absolute;inset:0;z-index:4;display:grid;place-items:center;background:rgba(0,0,0,.6)"><span style="font-size:32px;font-weight:900;color:#ff6666;letter-spacing:.1em;text-shadow:0 2px 8px rgba(0,0,0,.5)">${typeof T==="function"?T("sold"):"SOLD"}</span></div>` : '';
  return `
    <article class="fish-card${isSold?' sold':''}" data-id="${item.id}" tabindex="0" role="button" aria-label="Open details for ${L(item,"name")}" style="${isSold?'opacity:.7':''}">
      <div class="card-photo" data-photo="${item.id}">
        <div class="image-placeholder">LTC</div><div class="skeleton-img"></div>
        ${soldOverlay}
        <button class="fav-btn ${isFav?'liked':''}" onclick="event.stopPropagation();toggleFav('${item.id}')" title="Add to favorites">${isFav?'♥':'♡'}</button>
      </div>
      <div class="card-body">
        ${badgeHtml}
        <div class="card-title-row"><h2 class="card-title">${L(item,"name")}</h2>${oldCompactPriceHtml}</div>
        <div class="card-sci">${item.scientific}</div>
        <div class="card-info-strip${isEncy?' ency':''}">
          ${priceHtml}
          ${tankHtml}
          <div class="card-category ${catColorClass(item.category)}">${typeof CARD_LABELS!=="undefined"&&CARD_LABELS[item.category]?CARD_LABELS[item.category]:TC(item.category)}</div>
        </div>
        <div class="status-bar quick-traits-strip">
          <div class="status-cell s-reef${item.coralRisk>40?' risk':item.coralRisk>20?' warn':''}"><div class="s-label">${typeof T==='function'?T('reefShort'):'Reef'}</div><div class="s-val">${item.coralRisk<=8?(typeof T==='function'?T('safe'):'Safe'):item.coralRisk<=20?(typeof T==='function'?T('mostlySafeShort'):'Mostly'):item.coralRisk<=40?(typeof T==='function'?T('cautionShort'):'Caution'):(typeof T==='function'?T('riskyShort'):'Risky')}</div></div>
          <div class="status-cell s-care${item.careDifficulty>64?' hard':''}"><div class="s-label">${typeof T==='function'?T('careShort'):'Care'}</div><div class="s-val">${item.careDifficulty<=22?(typeof T==='function'?T('beginnerShort'):'Beginner'):item.careDifficulty<=42?(typeof T==='function'?T('modShort'):'Moderate'):item.careDifficulty<=64?(typeof T==='function'?T('interShort'):'Intermed.'):(typeof T==='function'?T('specialistShort'):'Specialist')}</div></div>
          <div class="status-cell s-agg${item.aggression>54?' hot':''}"><div class="s-label">${typeof T==='function'?T('temperShort'):'Temper'}</div><div class="s-val">${item.aggression<=14?(typeof T==='function'?T('calmShort'):'Calm'):item.aggression<=34?(typeof T==='function'?T('mildShort'):'Mild'):item.aggression<=54?(typeof T==='function'?T('modShort'):'Moderate'):(typeof T==='function'?T('cautionShort'):'Caution')}</div></div>
        </div>
        <div class="compact-traits-row">
          <span class="compact-trait compact-trait-reef ${reefClass}">${reefText}</span>
          <span class="compact-trait compact-trait-care ${careClass}">${careText}</span>
        </div>
        <div class="mobile-facts-grid">
          <div class="mobile-fact"><span>${typeof T==='function'?T('minTank'):'Min Tank'}</span><strong>${item.minTank}</strong></div>
          <div class="mobile-fact"><span>${typeof T==='function'?T('diet'):'Diet'}</span><strong>${L(item,'diet')}</strong></div>
          <div class="mobile-fact"><span>${typeof T==='function'?T('origin'):'Origin'}</span><strong>${L(item,'origin')}</strong></div>
          <div class="mobile-fact"><span>${typeof T==='function'?T('stockSize'):'In stock size'}</span><strong>${item.stockSize||'—'}${sizeInches}</strong></div>
        </div>
        <div class="meta-grid">
          <div class="meta-box"><div class="meta-label">${typeof T==="function"?T("minTank"):"Min Tank"}</div><div class="meta-value">${item.minTank}</div></div>
          <div class="meta-box"><div class="meta-label">${typeof T==="function"?T("diet"):"Diet"}</div><div class="meta-value">${L(item,"diet")}</div></div>
          ${stockMeta}
          <div class="meta-box"><div class="meta-label">${typeof T==="function"?T("origin"):"Origin"}</div><div class="meta-value">${L(item,"origin")}</div></div>
        </div>
        <div class="card-copy">${L(item,"overview")}</div>
        ${state.staffMode && item.inStock ? `<div class="staff-actions">
          <button class="staff-action-btn edit" onclick="event.stopPropagation();staffEditPrice('${item.id}')">${typeof T==='function'?T('editPrice'):'Edit Price'}</button>
          <button class="staff-action-btn edit" onclick="event.stopPropagation();staffEditTank('${item.id}')">${typeof T==='function'?T('editTank'):'Edit Tank'}</button>
          <button class="staff-action-btn edit" onclick="event.stopPropagation();staffUploadPhoto('${item.id}')" style="background:rgba(180,130,255,.15);border-color:rgba(180,130,255,.3);color:#b888ff">${typeof T==='function'?T('uploadPhoto'):'Upload Photo'}</button>
          <button class="staff-action-btn sold" onclick="event.stopPropagation();staffMarkSold('${item.id}')">${typeof T==='function'?T('markSold'):'Mark Sold'}</button>
          <button class="staff-action-btn dead" onclick="event.stopPropagation();staffMarkDead('${item.id}')">${typeof T==='function'?T('removeLoss'):'Remove (Loss)'}</button>
          <button class="staff-action-btn edit" onclick="event.stopPropagation();staffQuarantine('${item.id}')" style="background:rgba(220,180,50,.15);border-color:rgba(220,180,50,.3);color:#ddbb44">${typeof T==='function'?T('quarantine'):'Quarantine'}</button>
        </div>
        ${item.quarantine ? `<div style="margin-top:4px;padding:4px 8px;border-radius:6px;background:rgba(220,180,50,.15);border:1px solid rgba(220,180,50,.25);font-size:11px;font-weight:700;color:#ddbb44">⏱ ${typeof T==='function'?(item.quarantineUntil?T('quarantineDays')(Math.max(0,Math.ceil((item.quarantineUntil-Date.now())/86400000))):T('quarantineOngoing')):'Quarantine'} <button onclick="event.stopPropagation();staffEndQuarantine('${item.id}')" style="margin-left:6px;padding:2px 6px;border-radius:4px;background:rgba(90,220,200,.2);border:1px solid rgba(90,220,200,.3);color:#5eebc8;font-size:10px;cursor:pointer">${typeof T==='function'?T('clearQ'):'Clear'}</button></div>` : ''}` : ''}
        ${state.staffMode && !item.inStock ? `<div class="staff-actions">
          <button class="staff-action-btn edit" onclick="event.stopPropagation();staffRestockFish('${item.id}')" style="background:rgba(90,220,200,.15);border-color:rgba(90,220,200,.3);color:#5eebc8">${typeof T==='function'?T('addToStock'):'+ Add to Stock'}</button>
          <button class="staff-action-btn edit" onclick="event.stopPropagation();staffUploadPhoto('${item.id}')" style="background:rgba(180,130,255,.15);border-color:rgba(180,130,255,.3);color:#b888ff">${typeof T==='function'?T('uploadPhoto'):'Upload Photo'}</button>
        </div>
        ${item.soldAt && state.staffMode ? `<div style="margin-top:4px;font-size:10px;color:rgba(255,255,255,.3)">${typeof T==='function'?T('soldAgo')(Math.round((Date.now()-item.soldAt)/3600000),Math.max(0,24-Math.round((Date.now()-item.soldAt)/3600000))):'Sold recently'}</div>` : ''}
        ${item.lossAt && state.staffMode ? `<div style="margin-top:4px;font-size:10px;color:rgba(255,100,100,.4)">${typeof T==='function'?T('removedAgo')(Math.round((Date.now()-item.lossAt)/3600000)):'Removed recently'}</div>` : ''}` : ''}
        ${!item.inStock && !state.staffMode && state.mode==='ency' ? `<button class="notify-btn" onclick="event.stopPropagation();notifyWhenInStock('${L(item,"name")}')">Notify when in stock</button>` : ''}
        <div class="card-actions-row">
          <div class="tap-row card-action-text"><span>${typeof T==='function'?T('tap'):'Tap for full profile'}</span><span>›</span></div>
          <button class="tank-pill card-compare-btn${isComp?' is-active':''}" onclick="event.stopPropagation();toggleCompare('${item.id}')">${isComp?(typeof T==='function'?T('comparing'):'✓ Comparing'):(typeof T==='function'?T('compare'):'+ Compare')}</button>
        </div>
      </div>
    </article>
  `;
}
function gaugeCard(title, score, lowLabel, highLabel, mode='risk'){
  return `
    <div class="gauge-card">
      <div class="gauge-head">
        <strong>${title}</strong>
        <span>${riskText(score, mode)}</span>
      </div>
      <div class="gauge-track">
        <div class="gauge-marker" style="left: calc(${Math.max(4, Math.min(96, score))}%);"></div>
      </div>
      <div class="gauge-scale">
        <span>${lowLabel}</span>
        <span>${highLabel}</span>
      </div>
    </div>
  `;
}
function hasInfoText(val){
  if(Array.isArray(val)) return val.some(hasInfoText);
  return typeof val === 'string' && val.trim() && !['undefined','null','none','unknown'].includes(val.trim().toLowerCase());
}
function cleanInfoText(val){
  if(typeof val !== 'string') return '';
  const out = val.replace(/\s+/g,' ').trim();
  if(!out || ['undefined','null','none'].includes(out.toLowerCase())) return '';
  return out;
}
function cleanInfoList(list){
  return Array.isArray(list) ? list.map(cleanInfoText).filter(Boolean) : [];
}
function safeText(val, fallback='Unknown'){
  return cleanInfoText(val) || fallback;
}
function truncateText(text, max=170){
  const t = cleanInfoText(text);
  if(!t || t.length <= max) return t;
  const cut = t.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(' ')) + '…';
}
function summaryText(item){
  const direct = cleanInfoText(item.headerSummary || item.summary || '');
  if(direct) return truncateText(direct, 180);
  const overview = cleanInfoText(L(item,'overview'));
  const role = cleanInfoText(L(item,'role'));
  const visual = cleanInfoText(item.visualCue);
  if(overview) return truncateText(overview, 170);
  if(role && visual) return truncateText(`${role}. Look for ${visual.toLowerCase()}`, 170);
  if(role) return truncateText(role, 150);
  if(visual) return truncateText(`Look for ${visual.toLowerCase()}`, 150);
  return '';
}
function buildBehaviorParagraph(item){
  const custom = cleanInfoText(item.behavior || item.behaviorNotes || '');
  if(custom) return custom;
  const parts = [];
  const role = cleanInfoText(L(item,'role'));
  const minTank = cleanInfoText(item.minTank);
  const care = cleanInfoText(item.careLabel);
  if(role) parts.push(role + '.');
  parts.push(`Temperament usually reads ${riskText(item.aggression).toLowerCase()}.`);
  if(minTank) parts.push(`Plan around at least ${minTank}.`);
  if(care) parts.push(`Best suited to ${care.toLowerCase()} keepers or buyers who already understand the species' needs.`);
  return parts.join(' ').trim();
}
function buildFeedingParagraph(item){
  const custom = cleanInfoText(item.feedingNotes || item.feedingGuidance || '');
  if(custom) return custom;
  const parts = [];
  const diet = cleanInfoText(L(item,'diet'));
  const habitat = cleanInfoText(item.habitat);
  const origin = cleanInfoText(L(item,'origin'));
  if(diet) parts.push(`Diet: ${diet}.`);
  if(origin) parts.push(`Natural range: ${origin}.`);
  if(habitat) parts.push(`Typical habitat: ${habitat}.`);
  return parts.join(' ').trim();
}
function buildBuyingParagraph(item){
  const custom = cleanInfoText(item.buyingGuidance || item.buyerGuidance || '');
  if(custom) return custom;
  const pieces = [];
  const coral = riskText(item.coralRisk).toLowerCase();
  const invert = riskText(item.invertRisk).toLowerCase();
  const minTank = cleanInfoText(item.minTank);
  const care = cleanInfoText(item.careLabel) || riskText(item.careDifficulty, 'difficulty');
  if(minTank) pieces.push(`Best sold only when the buyer can realistically support at least ${minTank}.`);
  pieces.push(`Coral compatibility reads ${coral}, and ornamental invertebrate risk reads ${invert}.`);
  pieces.push(`Overall, this is best matched to ${care.toLowerCase()} buyers and a stocking plan that fits its long-term needs.`);
  return pieces.join(' ').trim();
}
function buildRecognitionParagraph(item){
  const custom = cleanInfoText(item.recognitionNotes || '');
  if(custom) return custom;
  return cleanInfoText(item.visualCue);
}
function renderPillList(list){
  const vals = cleanInfoList(list);
  return vals.length ? vals.map(v => `<span class="list-pill">${v}</span>`).join('') : '';
}
function renderFactStack(item){
  const facts = cleanInfoList(item.facts);
  return facts.length ? facts.map(f => `<div class="fact-card">${f}</div>`).join('') : '';
}
function renderNoticeBlocks(item, aliasText){
  const blocks = [
    ['Visual ID cues', cleanInfoText(item.visualCue)],
    ['Common names / aliases', cleanInfoText(aliasText)],
    ['Role in the tank', cleanInfoText(L(item,'role'))]
  ].filter(([,body]) => body);
  return blocks.length ? blocks.map(([title, body]) => `<div class="reading-block"><strong>${title}</strong><p>${body}</p></div>`).join('') : '';
}

function getFoodDefaults(){
  return window.STORE_FOOD_SETTINGS || {enabledBrands:{},disabledProducts:{},featuredProducts:{},preferredBrands:[],hiddenTypes:{},showAdviceCards:true,showOnlyCarriedFoods:true};
}
function normalizeFoodSettings(raw={}){
  const defaults = getFoodDefaults();
  return {
    enabledBrands: {...defaults.enabledBrands, ...(raw.enabledBrands || {})},
    disabledProducts: {...defaults.disabledProducts, ...(raw.disabledProducts || {})},
    featuredProducts: {...(defaults.featuredProducts || {}), ...(raw.featuredProducts || {})},
    preferredBrands: Array.isArray(raw.preferredBrands) && raw.preferredBrands.length ? raw.preferredBrands : (defaults.preferredBrands || []),
    hiddenTypes: {...(defaults.hiddenTypes || {}), ...(raw.hiddenTypes || {})},
    showAdviceCards: raw.showAdviceCards !== false,
    showOnlyCarriedFoods: raw.showOnlyCarriedFoods !== false
  };
}
function getStoreFoodSettings(){
  if(state._foodSettings) return state._foodSettings;
  try{
    const saved = JSON.parse(localStorage.getItem('ltcFoodSettings.v2') || localStorage.getItem('ltcFoodSettings') || 'null');
    state._foodSettings = normalizeFoodSettings(saved || {});
  }catch(_e){
    state._foodSettings = normalizeFoodSettings({});
  }
  return state._foodSettings;
}
function saveStoreFoodSettings(){
  try{ localStorage.setItem('ltcFoodSettings.v2', JSON.stringify(getStoreFoodSettings())); }catch(_e){}
}
function resetStoreFoodSettings(){
  state._foodSettings = normalizeFoodSettings({});
  saveStoreFoodSettings();
  renderFoodSettings();
  render();
  showToast('Food settings reset');
}
function exportStoreFoodSettings(){
  const payload = JSON.stringify(getStoreFoodSettings(), null, 2);
  try{
    const blob = new Blob([payload], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ltc-food-settings.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href), 1500);
  }catch(_e){}
  if(navigator.clipboard?.writeText){ navigator.clipboard.writeText(payload).catch(()=>{}); }
  showToast('Food settings exported');
}
function importStoreFoodSettingsFromText(text){
  try{
    const parsed = JSON.parse(text);
    state._foodSettings = normalizeFoodSettings(parsed || {});
    saveStoreFoodSettings();
    renderFoodSettings();
    render();
    showToast('Food settings imported');
  }catch(_e){
    showToast('Could not import food settings');
  }
}
function importStoreFoodSettingsFile(file){
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => importStoreFoodSettingsFromText(String(reader.result || ''));
  reader.readAsText(file);
}
function audienceTagsForItem(item){
  const raw = `${cleanInfoText(item.category)} ${cleanInfoText(L(item,'diet'))} ${cleanInfoText(L(item,'role'))}`.toLowerCase();
  if(/shrimp|snail|crab|urchin|starfish|clam|anemone|invert|worm|cucumber/.test(raw)) return ['invert'];
  return ['fish'];
}
function dietTagsForItem(item){
  const raw = `${cleanInfoText(L(item,'diet'))} ${cleanInfoText(L(item,'role'))} ${cleanInfoText(item.category)} ${cleanInfoText(item.name)} ${cleanInfoText(item.behavior || item.behaviorNotes || '')}`.toLowerCase();
  const tags = new Set();
  if(/herb|algae|graze|nori|seaweed|macroalgae/.test(raw)) tags.add('herbivore');
  if(/omniv|mixed/.test(raw)) tags.add('omnivore');
  if(/carniv|meaty|predat|pisciv|shrimp|crustacean/.test(raw)) tags.add('carnivore');
  if(/plankt|anthias|chromis|zooplankton/.test(raw)) tags.add('planktivore');
  if(/copepod|microfauna|mandarin|dragonet|scooter/.test(raw)) { tags.add('planktivore'); tags.add('microfauna'); tags.add('nano'); }
  if(/filter|phytoplankton|suspended|feather duster|clam|oyster/.test(raw)) { tags.add('filter-feeder'); tags.add('invert'); }
  if(/detritus|film algae|cleanup|scavenger/.test(raw)) { tags.add('detritivore'); tags.add('invert'); }
  const audience = audienceTagsForItem(item);
  audience.forEach(a => tags.add(a));
  const size = `${item.stockSize||''} ${item.maxSize||''}`.toLowerCase();
  if(/tiny|small|nano|1|2|3|4/.test(size)) tags.add('nano');
  if(!tags.has('herbivore') && !tags.has('carnivore') && !tags.has('planktivore') && !tags.has('filter-feeder') && !tags.has('detritivore')) tags.add('omnivore');
  return [...tags];
}
function sizeTagsForItem(item){
  const value = `${item.stockSize||''} ${item.maxSize||''}`.toLowerCase();
  if(/tiny|small|nano|1|2/.test(value)) return ['tiny','small'];
  if(/medium|3|4|5|6/.test(value)) return ['small','medium'];
  return ['medium','large'];
}
function foodRuleMatches(item, rule){
  const hay = {
    id: `${item.id || ''}`,
    name: `${L(item,'name') || item.name || ''}`,
    category: `${item.category || ''}`,
    diet: `${cleanInfoText(L(item,'diet'))}`,
    role: `${cleanInfoText(L(item,'role'))}`
  };
  if(rule.idRegex && !rule.idRegex.test(hay.id)) return false;
  if(rule.nameRegex && !rule.nameRegex.test(hay.name)) return false;
  if(rule.categoryRegex && !rule.categoryRegex.test(hay.category)) return false;
  if(rule.dietRegex && !rule.dietRegex.test(hay.diet)) return false;
  if(rule.roleRegex && !rule.roleRegex.test(hay.role)) return false;
  return Boolean(rule.idRegex || rule.nameRegex || rule.categoryRegex || rule.dietRegex || rule.roleRegex);
}
function deriveFoodProfile(item){
  const rules = window.FOOD_PROFILE_RULES || {specialCases:{},groupRules:[]};
  const profile = {
    tags: dietTagsForItem(item),
    sizes: sizeTagsForItem(item),
    audience: audienceTagsForItem(item),
    preferredProducts: [],
    avoidProducts: [],
    avoidTypes: [],
    allowCatalog: true,
    family: profileFamilyFromItem(item),
    strategy: '',
    feedingSchedule: '',
    carriesOnly: getStoreFoodSettings().showOnlyCarriedFoods !== false
  };
  for(const rule of (rules.groupRules || [])){
    if(foodRuleMatches(item, rule)){
      if(rule.preferredProducts) profile.preferredProducts.push(...rule.preferredProducts);
      if(rule.avoidProducts) profile.avoidProducts.push(...rule.avoidProducts);
      if(rule.avoidTypes) profile.avoidTypes.push(...rule.avoidTypes);
      if(rule.family) profile.family = rule.family;
      if(!profile.strategy && rule.strategy) profile.strategy = rule.strategy;
      if(!profile.feedingSchedule && rule.feedingSchedule) profile.feedingSchedule = rule.feedingSchedule;
      if(rule.allowCatalog === false) profile.allowCatalog = false;
    }
  }
  const special = rules.specialCases?.[item.id];
  if(special){
    if(special.preferredProducts) profile.preferredProducts.unshift(...special.preferredProducts);
    if(special.avoidProducts) profile.avoidProducts.push(...special.avoidProducts);
    if(special.avoidTypes) profile.avoidTypes.push(...special.avoidTypes);
    if(special.forceFamily) profile.family = special.forceFamily;
    if(special.strategy) profile.strategy = special.strategy;
    if(special.feedingSchedule) profile.feedingSchedule = special.feedingSchedule;
    if(special.allowCatalog === false) profile.allowCatalog = false;
  }
  profile.preferredProducts = [...new Set(profile.preferredProducts)];
  profile.avoidProducts = [...new Set(profile.avoidProducts)];
  profile.avoidTypes = [...new Set(profile.avoidTypes)];
  if(!profile.strategy) profile.strategy = defaultFoodStrategy(profile, item);
  if(!profile.feedingSchedule) profile.feedingSchedule = defaultFeedingSchedule(profile, item);
  return profile;
}
function profileFamilyFromItem(item){
  const raw = `${item.category || ''} ${cleanInfoText(L(item,'diet'))} ${cleanInfoText(item.name)}`.toLowerCase();
  if(/mandarin|dragonet|scooter|copepod/.test(raw)) return 'pod-picker';
  if(/tang|rabbit|foxface|algae|seaweed|herb/.test(raw)) return 'herbivore';
  if(/puffer|trigger|lion|eel|predat|carniv/.test(raw)) return 'predator';
  if(/anemone|clam|feather duster|worm|filter|phytoplankton/.test(raw)) return 'filter-feeder';
  if(/shrimp|snail|crab|urchin|starfish|cleanup|detritus/.test(raw)) return 'cleanup';
  if(/anthias|chromis|dartfish|firefish|cardinal/.test(raw)) return 'planktivore';
  return 'community';
}
function defaultFoodStrategy(profile, item){
  const name = L(item,'name') || item.name || 'This animal';
  switch(profile.family){
    case 'pod-picker': return `${name} should be treated as a natural microfauna grazer first. Use packaged foods as support while keeping pod availability high.`;
    case 'herbivore': return `${name} should have steady access to algae-forward foods instead of relying only on meaty community blends.`;
    case 'predator': return `${name} does best with meaty foods sized to the mouth and a cleaner, more deliberate feeding plan than a general community fish.`;
    case 'filter-feeder': return `${name} benefits more from right-sized suspended or target-fed foods than from generic fish pellets or flakes.`;
    case 'cleanup': return `${name} often relies on natural algae, films, detritus, or leftover feeding pressure more than on a long packaged-food list.`;
    case 'planktivore': return `${name} usually does best with smaller particle foods offered more often than a single heavy feeding.`;
    default: return `${name} usually does best when a dependable staple is paired with a few frozen or specialty rotations instead of one food alone.`;
  }
}
function defaultFeedingSchedule(profile, item){
  switch(profile.family){
    case 'pod-picker': return 'Keep food particle size tiny and allow the animal to graze between feedings.';
    case 'herbivore': return 'Rotate a daily staple with sheet seaweed or algae-rich frozen foods and avoid long fasting gaps.';
    case 'predator': return 'Feed measured portions and avoid oversized meals that foul the tank or encourage begging.';
    case 'filter-feeder': return 'Target feed lightly when appropriate and lean on tank maturity and suspended nutrition.';
    case 'cleanup': return 'Do not overfeed just to feed the cleanup crew; many do best when the system naturally produces films and leftovers.';
    case 'planktivore': return 'Smaller meals offered more often usually outperform one large dump feeding.';
    default: return 'Use a simple routine: staple most days, frozen rotation a few times per week, and specialty foods only when they genuinely help.';
  }
}
function dietMatchesFood(profile, food){
  const tags = profile.tags;
  return food.diets.some(d => tags.includes(d) || (d === 'omnivore' && (tags.includes('carnivore') || tags.includes('herbivore'))) || (d === 'invert' && tags.includes('invert')) || (d === 'nano' && tags.includes('nano')));
}
function audienceMatchesFood(profile, food){
  const aud = food.audience || ['fish'];
  return aud.some(a => profile.audience.includes(a) || a === 'fish' && profile.audience.includes('fish') || a === 'invert' && profile.audience.includes('invert'));
}
function sizeMatchesFood(profile, food){
  return (food.sizes || []).some(s => profile.sizes.includes(s));
}
function scoreFoodForProfile(food, profile, settings){
  let score = 0;
  if(profile.preferredProducts.includes(food.id)) score += 80;
  if((settings.featuredProducts || {})[food.id]) score += 40;
  const brandRank = (settings.preferredBrands || []).indexOf(food.brand);
  score += brandRank === -1 ? 0 : Math.max(0, 15 - brandRank);
  if(food.stage === 'staple') score += 18;
  if(food.stage === 'rotate') score += 12;
  if(food.stage === 'support') score += 8;
  if(food.stage === 'specialty') score += 6;
  if(profile.family && (food.families || []).includes(profile.family)) score += 20;
  if(profile.tags.some(t => (food.diets || []).includes(t))) score += 10;
  if(profile.sizes.some(s => (food.sizes || []).includes(s))) score += 8;
  return score;
}
function getRecommendedFoods(item){
  const settings = getStoreFoodSettings();
  const catalog = Array.isArray(window.FOOD_CATALOG) ? window.FOOD_CATALOG : [];
  const profile = deriveFoodProfile(item);
  let eligible = [];
  if(profile.allowCatalog !== false){
    eligible = catalog.filter(food => {
      if(settings.enabledBrands[food.brand] === false) return false;
      if((settings.hiddenTypes || {})[food.type]) return false;
      if(settings.disabledProducts[food.id]) return false;
      if(profile.avoidProducts.includes(food.id)) return false;
      if(profile.avoidTypes.includes(food.type)) return false;
      if(!audienceMatchesFood(profile, food)) return false;
      if(!dietMatchesFood(profile, food)) return false;
      if(!sizeMatchesFood(profile, food) && !profile.preferredProducts.includes(food.id)) return false;
      return true;
    }).map(food => ({...food, _score: scoreFoodForProfile(food, profile, settings)})).sort((a,b)=>b._score-a._score);
  }
  const buckets = [];
  const makeBucket = (key, title, stages, limit) => {
    const items = eligible.filter(f => stages.includes(f.stage)).slice(0, limit);
    if(items.length) buckets.push({key,title,items});
  };
  makeBucket('staple','Best staple foods',['staple'],2);
  makeBucket('rotate','Good rotations / frozen choices',['rotate'],2);
  makeBucket('support','Specialty / support foods',['support','specialty'],2);
  if(!buckets.length && eligible.length){ buckets.push({key:'match','title':'Good carried matches',['items']:eligible.slice(0,4)}); }
  const allItems = buckets.flatMap(b => b.items);
  return {
    profile,
    buckets,
    items: allItems,
    showAdvice: settings.showAdviceCards !== false
  };
}
function foodFamilyLabel(profile){
  switch(profile.family){
    case 'pod-picker': return 'Pod picker';
    case 'herbivore': return 'Herbivore grazer';
    case 'predator': return 'Meaty feeder';
    case 'filter-feeder': return 'Filter feeder';
    case 'cleanup': return 'Cleanup / natural grazer';
    case 'planktivore': return 'Planktivore';
    default: return 'Community omnivore';
  }
}
function foodTypeIcon(food){
  const n = `${food.name||""} ${food.type||""}`.toLowerCase();
  if(n.includes("shrimp") || n.includes("mysis") || n.includes("brine")) return "🍤";
  if(n.includes("nori") || n.includes("algae") || n.includes("seaweed")) return "🌿";
  if(n.includes("pod") || n.includes("copepod")) return "🦠";
  if(n.includes("egg") || n.includes("roe")) return "🥚";
  if((food.type||"") === 'pellet') return "◉";
  if((food.type||"") === 'flake') return "◫";
  if((food.type||"") === 'sheet') return "▤";
  if((food.type||"") === 'liquid') return "💧";
  if((food.type||"") === 'live') return "✦";
  if((food.type||"") === 'frozen') return "❄";
  return "•";
}
function foodTypeClass(food){
  return `type-${String(food.type||'other').toLowerCase().replace(/[^a-z0-9]+/g,'-')}`;
}
function foodStageClass(food){
  return `stage-${String(food.stage||'other').toLowerCase().replace(/[^a-z0-9]+/g,'-')}`;
}

function renderFoodSection(item){
  const model = getRecommendedFoods(item);
  const {profile, buckets, items, showAdvice} = model;
  if(!profile.strategy && !items.length) return '';
  const adviceCards = showAdvice ? `<div class="food-advice-grid">
      <div class="food-advice-card"><span>Feeding style</span><strong>${foodFamilyLabel(profile)}</strong><p>${profile.strategy}</p></div>
      <div class="food-advice-card"><span>How to offer it</span><strong>Practical routine</strong><p>${profile.feedingSchedule}</p></div>
    </div>` : '';
  const bucketHtml = buckets.map(bucket => `<div class="food-bucket"><div class="food-bucket-head"><strong>${bucket.title}</strong><span>${bucket.items.length} shown</span></div><div class="food-bucket-grid">${bucket.items.map(food => `<div class="food-card ${foodTypeClass(food)} ${foodStageClass(food)}"><div class="food-card-top"><div class="food-brand">${food.brand}</div><div class="food-icon" aria-hidden="true">${foodTypeIcon(food)}</div></div><div class="food-name">${food.name}</div><div class="food-card-meta"><span class="food-badge food-type ${foodTypeClass(food)}">${foodTypeIcon(food)} ${food.type}</span><span class="food-badge food-stage ${foodStageClass(food)}">${food.stage}</span></div><div class="food-notes">${food.notes}</div><div class="food-usage">${food.feedHint || ''}</div></div>`).join('')}</div></div>`).join('');
  const emptyNote = !items.length ? `<div class="food-empty-note">No carried packaged foods are currently matched to this profile. Use the guidance above, or adjust the store food settings if the shop carries suitable items.</div>` : '';
  return `<div class="modal-section seafoam food-section"><div class="section-title"><h3>Foods sold here that fit this animal</h3><span class="section-note">Shown from locally enabled store foods only</span></div>${adviceCards}${bucketHtml}${state.staffMode ? emptyNote : ""}</div>`;
}
function buildStatValue(item, key){
  if(key === 'price'){
    if(item.onSale && item.salePrice){
      const oldPrice = item.price ? `<span class="meta-old-price">${formatMoney(item.price)}</span>` : '';
      return `<span class="meta-price-stack">${oldPrice}<span>${formatMoney(item.salePrice)}</span></span>`;
    }
    return item.price ? formatMoney(item.price) : 'Unknown';
  }
  if(key === 'minTank') return safeText(item.minTank, 'Unknown');
  if(key === 'care') return safeText(item.careLabel, 'Unknown');
  if(key === 'maxSize') return safeText(item.maxSize, 'Unknown');
  return 'Unknown';
}
function modalHeaderBar(item){
  const categoryLabel = (typeof CARD_LABELS!=='undefined' && CARD_LABELS[item.category]) ? CARD_LABELS[item.category] : TC(item.category);
  return `<div class="modal-headline-bar"><span class="modal-type">${categoryLabel}</span><div class="modal-headline-copy"><strong>${L(item,'name')}</strong><span class="latin-mini">${item.scientific}</span>${summaryText(item)?`<p>${summaryText(item)}</p>`:''}</div></div>`;
}
function renderSimilarCards(item, mobile=false){
  const similar = getSimilarFish(item);
  return similar.map(s=>`<div class="similar-card" onclick="closeFishModal();setTimeout(()=>openFishModal('${s.id}'),${mobile?220:300})"><div class="similar-photo" data-photo="${s.id}"><div class="image-placeholder">LTC</div></div><div class="similar-copy"><div class="name">${L(s,'name')}</div><div class="sub">${s.category}</div><div class="sub">${s.inStock?formatMoney(s.onSale&&s.salePrice?s.salePrice:s.price):(typeof T==='function'?T('ency'):'Encyclopedia')}</div></div></div>`).join('');
}
function modalTemplate(item){
  const [reefText, reefClass] = reefChip(item.coralRisk);
  const [careText, careClass] = careChip(item.careDifficulty);
  const [aggText, aggClass] = aggressionChip(item.aggression);
  const [invText, invClass] = invertChip(item.invertRisk);
  const aliasText = cleanInfoList(item.aliases).join(', ');
  const sizeText = item.stockSize || 'Unknown';
  const sizeInches = (typeof SIZE_SCALE!=='undefined' && item.stockSize && SIZE_SCALE[item.stockSize]) ? ` (${SIZE_SCALE[item.stockSize]})` : '';
  const originText = cleanInfoText(L(item,'origin'));
  const habitatText = cleanInfoText(item.habitat);
  const staffNote = cleanInfoText(item.staffNote);
  const overviewText = cleanInfoText(L(item,'overview'));
  const noticeBlocks = renderNoticeBlocks(item, aliasText);
  const factStack = renderFactStack(item);
  const behavior = buildBehaviorParagraph(item);
  const feeding = buildFeedingParagraph(item);
  const recognition = buildRecognitionParagraph(item);
  const buying = buildBuyingParagraph(item);
  const bestWith = renderPillList(item.bestWith);
  const cautionWith = renderPillList(item.cautionWith);
  const foodSection = renderFoodSection(item);
  return `
    <div class="modal-layout">
      <div class="modal-left">
        <div class="modal-photo-card">
          <div class="modal-photo" data-detail-photo="${item.id}">
            <div class="image-placeholder">LTC</div><div class="skeleton-img"></div>
            <div class="modal-photo-copy">
              <h2>${L(item,"name")}</h2>
              <span class="latin">${item.scientific}</span>
              <div class="modal-mini">
                <span class="mini-pill">${typeof T==='function'?T('tankLabel'):'Tank'} ${item.tankCode || '—'}</span>
                <span class="mini-pill">${item.type || 'Livestock'}</span>
                <span class="mini-pill">${sizeText}${sizeInches} in stock</span>
              </div>
            </div>
          </div>
        </div>
        ${galleryTemplate(item) || (state.staffMode ? `<div class="photo-upload-row"><button type="button" class="photo-gallery-upload photo-gallery-upload-wide" onclick="event.stopPropagation();staffUploadPhoto('${item.id}')">${typeof T==='function'?T('uploadStorePhoto'):'+ Upload store photo'}</button></div>` : '')}
        ${overviewText ? `<div class="modal-section ocean"><div class="section-title"><h3>Quick overview</h3></div><p class="overview">${overviewText}</p></div>` : ''}
        ${noticeBlocks ? `<div class="modal-section seafoam"><div class="section-title"><h3>What customers should notice</h3></div><div class="reading-stack">${noticeBlocks}</div></div>` : ''}
        ${factStack ? `<div class="modal-section plum"><div class="section-title"><h3>Quick facts</h3></div><div class="fact-stack">${factStack}</div></div>` : ''}
      </div>
      <div class="modal-right">
        ${modalHeaderBar(item)}
        <div class="price-band compact-stats">
          <div class="modal-stat"><div class="meta-label">Display price</div><div class="meta-value">${buildStatValue(item,'price')}</div></div>
          <div class="modal-stat"><div class="meta-label">Minimum tank</div><div class="meta-value">${buildStatValue(item,'minTank')}</div></div>
          <div class="modal-stat"><div class="meta-label">Care level</div><div class="meta-value">${buildStatValue(item,'care')}</div></div>
          <div class="modal-stat"><div class="meta-label">Max size</div><div class="meta-value">${buildStatValue(item,'maxSize')}</div></div>
        </div>
        <div class="modal-section ocean"><div class="section-title"><h3>Compatibility gauges</h3></div><div class="gauges">${gaugeCard(T('tempAggression'), item.aggression, T('veryCalm2'), T('veryDangerous'))}${gaugeCard(T('coralRisk'), item.coralRisk, T('reefSafe2'), T('coralNipper'))}${gaugeCard(T('invertSafetyRisk'), item.invertRisk, T('lowInvertRisk'), T('likelyHarass'))}${gaugeCard(T('careDiffLabel'), item.careDifficulty, T('easyLabel'), T('expertSpec'), 'difficulty')}</div></div>
        <div class="two-col"><div class="modal-section seafoam"><div class="section-title"><h3>At-a-glance fit</h3></div><div class="pill-list"><span class="list-pill status-pill ${reefClass}">${reefText}</span><span class="list-pill status-pill ${careClass}">${careText}</span><span class="list-pill status-pill ${aggClass}">${aggText}</span><span class="list-pill status-pill ${invClass}">${invText}</span></div></div><div class="modal-section gold"><div class="section-title"><h3>Core specs</h3></div><div class="pill-list"><span class="list-pill">${typeof T==='function'?T('diet'):'Diet'}: ${safeText(L(item,'diet'))}</span>${originText ? `<span class="list-pill">${typeof T==='function'?T('origin'):'Origin'}: ${originText}</span>` : ''}${habitatText ? `<span class="list-pill">Habitat: ${habitatText}</span>` : ''}<span class="list-pill">In-store size: ${sizeText}${sizeInches}</span></div></div></div>
        <div class="modal-section plum"><div class="section-title"><h3>Longer reading</h3></div><div class="reading-stack">${behavior ? `<div class="reading-block"><strong>Behavior &amp; tank fit</strong><p>${behavior}</p></div>` : ''}${feeding ? `<div class="reading-block"><strong>Feeding &amp; natural habitat</strong><p>${feeding}</p></div>` : ''}${recognition ? `<div class="reading-block"><strong>Recognition &amp; ID</strong><p>${recognition}</p></div>` : ''}${buying ? `<div class="reading-block"><strong>Buying guidance</strong><p>${buying}</p></div>` : ''}</div></div>
        ${(bestWith || cautionWith) ? `<div class="two-col">${bestWith ? `<div class="modal-section seafoam"><div class="section-title"><h3>Works well with</h3></div><div class="pill-list">${bestWith}</div></div>` : ''}${cautionWith ? `<div class="modal-section gold"><div class="section-title"><h3>Use caution with</h3></div><div class="pill-list">${cautionWith}</div></div>` : ''}</div>` : ''}
        ${(originText || habitatText) ? `<div class="origin-card"><strong>Origin &amp; natural range</strong><p>${originText || 'Unknown'}${habitatText ? `<br><span class="subtle">Natural habitat: ${habitatText}.</span>` : ''}</p></div>` : ''}
        ${foodSection}
        ${staffNote ? `<div class="staff-card"><strong>Staff note</strong><p>${staffNote}</p></div>` : ''}
        ${item.seasonal ? `<div class="seasonal-section"><span class="seasonal-icon">📅</span><div><div class="seasonal-label">Seasonal / Special Note</div><div class="seasonal-text">${item.seasonal}</div></div></div>` : ''}
        ${typeof waterParamsSection === 'function' ? waterParamsSection(item) : ''}
        <div class="similar-section"><h3>Similar Fish You Might Like</h3><div class="similar-row">${renderSimilarCards(item,false)}</div></div>
        <div class="action-row"><button class="cta primary" data-copy="${L(item,'name')} • Tank ${item.tankCode || '—'} • ${(item.onSale&&item.salePrice)?formatMoney(item.salePrice):(item.price ? formatMoney(item.price) : 'Unknown')}">${typeof T==='function'?T('copyInfo'):'Copy fish + tank info'}</button><button class="cta secondary" data-close-modal="true">Close profile</button></div>
      </div>
    </div>
  `;
}
function modalTemplateMobile(item){
  const [reefText, reefClass] = reefChip(item.coralRisk);
  const [careText, careClass] = careChip(item.careDifficulty);
  const [aggText, aggClass] = aggressionChip(item.aggression);
  const [invText, invClass] = invertChip(item.invertRisk);
  const aliasText = cleanInfoList(item.aliases).join(', ');
  const sizeText = item.stockSize || 'Unknown';
  const sizeInches = (typeof SIZE_SCALE!=='undefined'&&item.stockSize&&SIZE_SCALE[item.stockSize]) ? ` ${SIZE_SCALE[item.stockSize]}` : '';
  const staffNote = cleanInfoText(item.staffNote);
  const overviewText = cleanInfoText(L(item,'overview'));
  const noticeBlocks = renderNoticeBlocks(item, aliasText);
  const behavior = buildBehaviorParagraph(item);
  const feeding = buildFeedingParagraph(item);
  const recognition = buildRecognitionParagraph(item);
  const buying = buildBuyingParagraph(item);
  const bestWith = renderPillList(item.bestWith);
  const cautionWith = renderPillList(item.cautionWith);
  const originText = cleanInfoText(L(item,'origin'));
  const habitatText = cleanInfoText(item.habitat);
  const foodSection = renderFoodSection(item);
  return `
    <div class="modal-layout mobile-stack">
      <div class="modal-photo-card mobile-hero-card"><div class="modal-photo modal-photo-mobile" data-detail-photo="${item.id}"><div class="image-placeholder">LTC</div><div class="skeleton-img"></div><div class="modal-photo-copy mobile-photo-copy"><h2>${L(item,'name')}</h2><span class="latin">${item.scientific}</span><div class="modal-mini"><span class="mini-pill">${typeof T==='function'?T('tankLabel'):'Tank'} ${item.tankCode || '—'}</span><span class="mini-pill">${sizeText}${sizeInches}</span><span class="mini-pill">${(typeof CARD_LABELS!=="undefined"&&CARD_LABELS[item.category])?CARD_LABELS[item.category]:TC(item.category)}</span></div></div></div></div>
      ${galleryTemplate(item)}
      ${modalHeaderBar(item)}
      <div class="mobile-stat-grid compact-stats"><div class="modal-stat"><div class="meta-label">Display price</div><div class="meta-value">${buildStatValue(item,'price')}</div></div><div class="modal-stat"><div class="meta-label">Minimum tank</div><div class="meta-value">${buildStatValue(item,'minTank')}</div></div><div class="modal-stat"><div class="meta-label">Care level</div><div class="meta-value">${buildStatValue(item,'care')}</div></div><div class="modal-stat"><div class="meta-label">Max size</div><div class="meta-value">${buildStatValue(item,'maxSize')}</div></div></div>
      ${overviewText ? `<div class="modal-section ocean"><div class="section-title"><h3>Quick overview</h3></div><p class="overview">${overviewText}</p></div>` : ''}
      <div class="modal-section seafoam"><div class="section-title"><h3>Quick facts</h3></div><div class="mobile-traits-grid"><div class="mobile-trait ${reefClass}"><span>Reef</span><strong>${reefText}</strong></div><div class="mobile-trait ${careClass}"><span>Care</span><strong>${careText}</strong></div><div class="mobile-trait ${aggClass}"><span>Temper</span><strong>${aggText}</strong></div><div class="mobile-trait ${invClass}"><span>Invert</span><strong>${invText}</strong></div></div><div class="mobile-practical-grid"><div class="mobile-practical"><span>${typeof T==='function'?T('diet'):'Diet'}</span><strong>${safeText(L(item,'diet'))}</strong></div>${originText ? `<div class="mobile-practical"><span>${typeof T==='function'?T('origin'):'Origin'}</span><strong>${originText}</strong></div>` : ''}${habitatText ? `<div class="mobile-practical"><span>Habitat</span><strong>${habitatText}</strong></div>` : ''}${cleanInfoText(L(item,'role')) ? `<div class="mobile-practical"><span>Role</span><strong>${cleanInfoText(L(item,'role'))}</strong></div>` : ''}</div></div>
      <div class="modal-section plum"><div class="section-title"><h3>Compatibility gauges</h3></div><div class="gauges">${gaugeCard(T('tempAggression'), item.aggression, T('veryCalm2'), T('veryDangerous'))}${gaugeCard(T('coralRisk'), item.coralRisk, T('reefSafe2'), T('coralNipper'))}${gaugeCard(T('invertSafetyRisk'), item.invertRisk, T('lowInvertRisk'), T('likelyHarass'))}${gaugeCard(T('careDiffLabel'), item.careDifficulty, T('easyLabel'), T('expertSpec'), 'difficulty')}</div></div>
      ${typeof waterParamsSection === 'function' ? waterParamsSection(item) : ''}
      <div class="modal-section seafoam"><div class="section-title"><h3>Longer read</h3></div><div class="reading-stack">${behavior ? `<div class="reading-block"><strong>Behavior &amp; tank fit</strong><p>${behavior}</p></div>` : ''}${feeding ? `<div class="reading-block"><strong>Feeding &amp; natural habitat</strong><p>${feeding}</p></div>` : ''}${recognition ? `<div class="reading-block"><strong>Recognition &amp; ID</strong><p>${recognition}</p></div>` : ''}${buying ? `<div class="reading-block"><strong>Buying guidance</strong><p>${buying}</p></div>` : ''}</div></div>
      ${noticeBlocks ? `<div class="modal-section seafoam"><div class="section-title"><h3>What customers should notice</h3></div><div class="reading-stack">${noticeBlocks}</div></div>` : ''}
      ${foodSection}
      ${bestWith ? `<div class="modal-section gold"><div class="section-title"><h3>Works well with</h3></div><div class="pill-list">${bestWith}</div></div>` : ''}
      ${cautionWith ? `<div class="modal-section plum"><div class="section-title"><h3>Use caution with</h3></div><div class="pill-list">${cautionWith}</div></div>` : ''}
      ${(originText || habitatText) ? `<div class="origin-card"><strong>Origin &amp; natural range</strong><p>${originText || 'Unknown'}${habitatText ? `<br><span class="subtle">Natural habitat: ${habitatText}.</span>` : ''}</p></div>` : ''}
      ${staffNote ? `<div class="staff-card"><strong>Staff note</strong><p>${staffNote}</p></div>` : ''}
      ${item.seasonal ? `<div class="seasonal-section"><span class="seasonal-icon">📅</span><div><div class="seasonal-label">Seasonal / Special Note</div><div class="seasonal-text">${item.seasonal}</div></div></div>` : ''}
      <div class="similar-section"><h3>Similar Fish You Might Like</h3><div class="similar-row mobile-similar-grid">${renderSimilarCards(item,true)}</div></div>
      <div class="action-row"><button class="cta primary" data-copy="${L(item,'name')} • Tank ${item.tankCode || '—'} • ${(item.onSale&&item.salePrice)?formatMoney(item.salePrice):(item.price ? formatMoney(item.price) : 'Unknown')}">${typeof T==='function'?T('copyInfo'):'Copy fish + tank info'}</button><button class="cta secondary" data-close-modal="true">Close profile</button></div>
    </div>
  `;
}

function renderCardsAndMeta(){
  renderCategories();
  updateTopControls();
  const list = getFilteredFish();
  const grid = document.getElementById('cardGrid');
  if(!grid) return;
  grid.className = state.viewMode === 'compact' ? 'cards compact-mode' : 'cards';
  updateViewToggleUI();
  // Render fish of the week
  if(typeof renderFishOfTheWeek === "function") renderFishOfTheWeek();
  if(typeof updateCategoryTint === "function") updateCategoryTint();
  // Render bundles above cards
  const bundleContainer = document.getElementById('bundleSection');
  if(bundleContainer){
    const bhtml = renderBundlesHTML();
    bundleContainer.innerHTML = bhtml ? `<div class="bundle-shell" id="bundleShell"><button class="bundle-scroll left" id="bundleScrollLeft" type="button" aria-label="Scroll bundles left" onclick="scrollBundleRail(-1)">‹</button><div class="bundle-row" id="bundleRow">${bhtml}</div><button class="bundle-scroll right" id="bundleScrollRight" type="button" aria-label="Scroll bundles right" onclick="scrollBundleRail(1)">›</button></div>` : '';
    const bundleRow = document.getElementById('bundleRow');
    if(bundleRow && !bundleRow.dataset.boundScroll){
      bundleRow.addEventListener('scroll', updateBundleRailUI, {passive:true});
      bundleRow.dataset.boundScroll = 'true';
    }
    requestAnimationFrame(updateBundleRailUI);
  }
  grid.innerHTML = list.length ? list.map(cardTemplate).join('') : `<div class="empty-state">${typeof T==='function'?T('noMatchLong'):'No profiles matched those filters.'}</div>`;
  const rc=document.getElementById('resultsCount');if(rc)rc.textContent=typeof T==='function'?T('showing')(list.length):`Showing ${list.length} profile${list.length===1?'':'s'}`;
  const ah=document.getElementById('activeHint');if(ah)ah.textContent=list.length?(typeof T==='function'?T('hint'):'Tap any card to open a larger pop-up profile with more reading'):(typeof T==='function'?T('noMatch'):'No profiles match the current filters.');
  [...grid.querySelectorAll('.fish-card')].forEach((card,i) => {
    card.style.animationDelay = (i*0.04)+'s';
    card.classList.add('card-enter');
    const open = () => { playOpen(); openFishModal(card.dataset.id); };
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => {
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        open();
      }
    });
  });
  requestAnimationFrame(()=>{
    applyImagesToDOM();
    // Hide gallery if only 1 or 0 thumbnails
    const gallery = document.querySelector('.overlay.show .photo-gallery');
    if(gallery){
      const thumbs = gallery.querySelectorAll('.photo-gallery-thumb, div[onclick*="swapModalPhoto"]');
      if(thumbs.length <= 1) gallery.style.display = 'none';
    }
  });
}
function openFishModal(id){
  const fish = FISH.find(item => item.id === id);
  if(!fish) return;
  state.selectedId = id;
  if(!state.analytics) state.analytics={};
  state.analytics[id] = (state.analytics[id]||0)+1;
  const body = document.getElementById('fishModalBody');
  if(!body) return;
  body.innerHTML = isPhonePortrait() ? modalTemplateMobile(fish) : modalTemplate(fish);
  // Scroll modal to top
  body.scrollTop = 0;
  const modal = body.closest('.fish-modal');
  if(modal){
    modal.scrollTop = 0;
    modal.classList.toggle('mobile-safe', isPhonePortrait());
  }
  const overlay = document.getElementById('fishOverlay');
  if(overlay) overlay.scrollTop = 0;
  const copyBtn = body.querySelector('[data-copy]');
  if(copyBtn){
    copyBtn.addEventListener('click', async () => {
      const text = copyBtn.dataset.copy;
      try{ await navigator.clipboard.writeText(text); showToast(`Copied: ${text}`); }
      catch(err){ showToast(text); }
    });
  }
  const closeBtn = body.querySelector('[data-close-modal]');
  if(closeBtn) closeBtn.addEventListener('click', closeFishModal);
  if(overlay){overlay.classList.add('show');overlay.setAttribute('aria-hidden', 'false');}
  const detailVideo = document.getElementById('detailBgVideo');
  if(detailVideo){ detailVideo.play().catch(()=>{}); }
  document.body.classList.add('modal-open');
  requestAnimationFrame(()=>{
    applyImagesToDOM();
    const activeModalBody = document.getElementById('fishModalBody');
    if(activeModalBody) activeModalBody.scrollTop = 0;
  });
}
function closeFishModal(){
  const overlay = document.getElementById('fishOverlay');
  if(overlay){overlay.classList.remove('show');overlay.setAttribute('aria-hidden', 'true');}
  const detailVideo = document.getElementById('detailBgVideo');
  if(detailVideo){ detailVideo.pause(); detailVideo.currentTime = 0; }
  const modal = document.querySelector('.fish-modal');
  if(modal) modal.classList.remove('mobile-safe');
  document.body.classList.remove('modal-open');
}
function swapModalPhotoFromThumb(btn, fishId){
  const img = btn ? btn.querySelector('img') : null;
  if(!img) return;
  swapModalPhoto(img.src, fishId, btn);
}
function swapModalPhoto(src, fishId, thumbEl=null){
  const photoEl = document.querySelector(`[data-detail-photo="${fishId}"]`);
  if(!photoEl) return;
  const existing = photoEl.querySelector('img');
  if(existing) existing.src = src;
  else {
    const img = document.createElement('img');
    img.src = src;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover';
    photoEl.prepend(img);
    const ph = photoEl.querySelector('.image-placeholder');
    if(ph) ph.remove();
  }
  if(thumbEl){
    document.querySelectorAll('.photo-gallery-thumb').forEach(el => el.classList.remove('active'));
    thumbEl.classList.add('active');
  }
  playClick();
}
function clearFilters(){
  state.search = '';
  state.sort = 'featured';
  state.reefOnly = false;
  state.easyOnly = false;
  state.category = 'All';
  const si = document.getElementById('searchInput');
  if(si) si.value = '';
  render();
}
async function fetchWikiImage(title){
  if(wikiImages.has(title)) return wikiImages.get(title);
  const fallbacks = {
    'Paracanthurus hepatus': ['Blue tang (fish)'],
    'Mandarinfish': ['Synchiropus splendidus'],
    'Opistognathus rosenblatti': ['Jawfish'],
    'Cirrhilabrus isosceles': ['Cirrhilabrus'],
    'Valenciennea puellaris': ['Goby'],
    'Ctenochaetus tominiensis': ['Ctenochaetus'],
  };
  const tryList = [title, ...(fallbacks[title] || [])];
  for(const t of tryList){
    try{
      const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(t)}&prop=pageimages&redirects=1&format=json&pithumbsize=1200&origin=*`);
      const data = await res.json();
      const page = Object.values(data.query.pages)[0];
      const src = page?.thumbnail?.source || null;
      if(src){
        wikiImages.set(title, src);
        return src;
      }
    }catch(err){}
  }
  wikiImages.set(title, null);
  return null;
}
async function fetchImageForFish(fish){
  if(fishImages.has(fish.id)) return fishImages.get(fish.id);
  const candidates = getImageCandidates(fish);
  for(const candidate of candidates){
    const src = await fetchWikiImage(candidate);
    if(src){
      fishImages.set(fish.id, src);
      if(fish.photoTitle && !wikiImages.get(fish.photoTitle)) wikiImages.set(fish.photoTitle, src);
      return src;
    }
  }
  fishImages.set(fish.id, null);
  return null;
}
async function loadAllImages(){
  await Promise.allSettled(FISH.map(fish => fetchImageForFish(fish)));
  applyImagesToDOM();
}
function applyImagesToDOM(){
  const targets = [...document.querySelectorAll('[data-photo]'), ...document.querySelectorAll('[data-detail-photo]')];
  for(const target of targets){
    const id = target.dataset.photo || target.dataset.detailPhoto;
    const fish = FISH.find(item => item.id === id);
    if(!fish) continue;
    const src = fishImages.get(fish.id) || wikiImages.get(fish.photoTitle);
    if(!src || target.querySelector('img')) continue;
    const img = document.createElement('img');
    img.src = src;
    img.alt = fish.name;
    img.loading = 'lazy';
    img.addEventListener('error', () => img.remove());
    target.prepend(img);
    const placeholder = target.querySelector('.image-placeholder');
    if(placeholder) placeholder.remove();
    const skeleton = target.querySelector('.skeleton-img');
    if(skeleton) skeleton.remove();
  }
}
function showToast(message){
  const toast = document.getElementById('toast');
  if(!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1900);
}
function render(){
  renderCardsAndMeta();
}
// Safe event binding helper
function on(id,evt,fn){const el=document.getElementById(id);if(el)el.addEventListener(evt,fn)}
on('searchInput','input', e => {
  state.search = e.target.value;
  playTone(1400,0.02,0.02,'sine',0.02);
  render();
});
on('reefOnlyBtn','click', (e) => {
  state.reefOnly = !state.reefOnly;
  const btn=e.currentTarget;
  playToggle();
  addRipple(btn,e);
  btn.classList.add('shimmer-reef');
  btn.addEventListener('animationend',()=>btn.classList.remove('shimmer-reef'),{once:true});
  render();
});
on('easyOnlyBtn','click', (e) => {
  state.easyOnly = !state.easyOnly;
  const btn=e.currentTarget;
  playToggle();
  addRipple(btn,e);
  btn.classList.add('shimmer-gold');
  btn.addEventListener('animationend',()=>btn.classList.remove('shimmer-gold'),{once:true});
  render();
});
on('clearFiltersBtn','click', (e) => {
  playClick();
  addRipple(e.currentTarget,e);
  e.currentTarget.classList.add('shimmer-purple');
  e.currentTarget.addEventListener('animationend',()=>e.currentTarget.classList.remove('shimmer-purple'),{once:true});
  clearFilters();
});
on('closeFishBtn','click', () => { playClose(); closeFishModal(); });
on('fishOverlay','click', e => {
  if(e.target.id === 'fishOverlay'){ playClose(); closeFishModal(); }
});
document.addEventListener('keydown', e => {
  if(e.key === 'Escape'){ playClose(); closeFishModal(); closeCompare(); }
});

// === SOUND SYSTEM (Web Audio API — no files needed) ===
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
state.soundVolume = 1.0;
state.soundMuted = false;
function ensureAudio(){if(audioCtx.state==='suspended')audioCtx.resume()}
function getVol(base){return state.soundMuted ? 0 : base * state.soundVolume}

function playTone(freq, dur, vol, type, decay, detune){
  ensureAudio();
  if(state.soundMuted) return;
  const o=audioCtx.createOscillator();
  const g=audioCtx.createGain();
  o.type=type||'sine';
  o.frequency.setValueAtTime(freq,audioCtx.currentTime);
  if(detune) o.detune.setValueAtTime(detune,audioCtx.currentTime);
  const v = getVol(vol||0.12);
  g.gain.setValueAtTime(v,audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+(decay||dur));
  o.connect(g);g.connect(audioCtx.destination);
  o.start();o.stop(audioCtx.currentTime+dur);
}

// Water drop — general clicks
function playClick(){
  playTone(1800,0.05,0.10,'sine',0.1);
  playTone(2400,0.04,0.06,'sine',0.08,10);
}
// Soft switch — filter toggles
function playToggle(){
  playTone(440,0.14,0.12,'triangle',0.18);
  setTimeout(()=>playTone(660,0.12,0.10,'triangle',0.15),80);
}
// Wave sweep — category tabs
function playTab(){
  playTone(330,0.18,0.10,'sine',0.22);
  setTimeout(()=>playTone(440,0.15,0.08,'sine',0.2),60);
  setTimeout(()=>playTone(550,0.12,0.07,'sine',0.18),120);
  setTimeout(()=>playTone(660,0.10,0.05,'sine',0.15),180);
}
// Warm rising chord — detail open
function playOpen(){
  playTone(262,0.3,0.10,'sine',0.4);
  setTimeout(()=>{playTone(330,0.25,0.08,'sine',0.35);playTone(330,0.25,0.04,'triangle',0.35);},70);
  setTimeout(()=>{playTone(392,0.22,0.07,'sine',0.3);playTone(523,0.18,0.04,'sine',0.28);},140);
}
// Gentle descending — modal close
function playClose(){
  playTone(523,0.10,0.08,'sine',0.14);
  setTimeout(()=>playTone(392,0.12,0.06,'sine',0.16),50);
  setTimeout(()=>playTone(330,0.14,0.05,'triangle',0.2),100);
}
// Confirmation — compare
function playCompare(){
  playTone(880,0.08,0.08,'sine',0.12);
  setTimeout(()=>playTone(1100,0.10,0.06,'sine',0.14),40);
  setTimeout(()=>playTone(1320,0.08,0.05,'sine',0.12),80);
}
// Heartbeat — favorite
function playFavorite(){
  playTone(440,0.10,0.10,'sine',0.14);
  setTimeout(()=>playTone(554,0.14,0.08,'sine',0.2),120);
}
// Subtle click — sort
function playSort(){
  playTone(1600,0.04,0.08,'sine',0.07);
  playTone(2400,0.03,0.04,'sine',0.06,5);
}
// Mute/volume controls
function toggleMute(){
  state.soundMuted = !state.soundMuted;
  const btn = document.getElementById('muteBtn');
  if(btn) btn.textContent = state.soundMuted ? '🔇' : '🔊';
  if(!state.soundMuted) playClick();
}
function addRipple(el,e){
  const rect=el.getBoundingClientRect();
  const r=document.createElement('span');
  r.className='ripple';
  const size=Math.max(rect.width,rect.height);
  r.style.width=r.style.height=size+'px';
  r.style.left=(e.clientX-rect.left-size/2)+'px';
  r.style.top=(e.clientY-rect.top-size/2)+'px';
  el.appendChild(r);
  r.addEventListener('animationend',()=>r.remove());
}
document.addEventListener('click',ensureAudio,{once:true});
document.addEventListener('touchstart',ensureAudio,{once:true});

// === MODE TOGGLE ===
function setMode(mode){
  state.mode = mode;
  playTab();
  document.querySelectorAll('.mode-btn').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
  render();
}

// === TANK FILTER ===
function setTankFilter(val){
  state.tankFilter = parseInt(val)||0;
  playClick();
  render();
}

// === FAVORITES ===
function toggleFav(id){
  const idx = state.favorites.indexOf(id);
  if(idx>=0) state.favorites.splice(idx,1); else state.favorites.push(id);
  playFavorite();
  updateFavCounter();
  render();
}
function updateFavCounter(){
  const el = document.getElementById('favCounter');
  const num = document.getElementById('favNum');
  if(!el||!num) return;
  if(state.favorites.length>0){el.style.display='inline-flex';num.textContent=state.favorites.length}
  else{el.style.display='none'}
}

// === COMPARE ===

function setViewMode(mode){
  const nextMode = mode === 'compact' ? 'compact' : 'detailed';
  if(state.viewMode === nextMode){
    updateViewToggleUI();
    return;
  }
  state.viewMode = nextMode;
  const grid = document.getElementById('cardGrid');
  if(grid) grid.className = state.viewMode === 'compact' ? 'cards compact-mode' : 'cards';
  updateViewToggleUI();
  render();
}
function toggleViewMode(){
  setViewMode(state.viewMode === 'detailed' ? 'compact' : 'detailed');
}
function toggleCompare(id){
  const idx = state.compareList.indexOf(id);
  if(idx>=0){state.compareList.splice(idx,1)}
  else if(state.compareList.length<3){state.compareList.push(id)}
  else{showToast(T('maxThree'));return}
  playCompare();
  updateCompareBar();
  render();
}
function updateCompareBar(){
  const bar = document.getElementById('compareBar');
  const chips = document.getElementById('compareChips');
  if(!bar||!chips) return;
  if(state.compareList.length>0){
    bar.classList.add('show');
    chips.innerHTML = state.compareList.map(id=>{
      const f=FISH.find(x=>x.id===id);
      return f?`<div class="compare-chip"><span class="chip-name">${L(f,'name')}</span><span class="remove" onclick="toggleCompare('${id}')">✕</span></div>`:'';
    }).join('');
  } else {bar.classList.remove('show')}
}
function clearCompare(){state.compareList=[];updateCompareBar();render()}
function openCompare(){
  if(state.compareList.length<2){showToast(T('selectTwo'));return}
  playOpen();
  const fish = state.compareList.map(id=>FISH.find(x=>x.id===id)).filter(Boolean);
  const cols = fish.length;
  
  function miniGauge(score,color){
    return `<div class="cmp-gauge"><div class="cmp-gauge-track"><div class="cmp-gauge-fill" style="width:${score}%;background:${color}"></div></div><span class="cmp-gauge-val">${score}</span></div>`;
  }
  
  const gaugeFields = [
    [T('reefSafety'),f=>miniGauge(100-f.coralRisk,'#4eddbb'),T('lowerSafer')],
    [T('aggression'),f=>miniGauge(f.aggression,'#e89838'),T('lowerCalmer')],
    [T('careDifficulty'),f=>miniGauge(f.careDifficulty,'#b878ee'),T('lowerEasier')],
    [T('invertRisk'),f=>miniGauge(f.invertRisk,'#ff8080'),T('lowerSafer')],
  ];
  const textFields = [
    [T('price'),f=>f.inStock?`<span style="color:#5eebc8;font-size:18px;font-weight:900">${formatMoney(f.price)}</span>`:'<span style="color:rgba(255,255,255,.3)">Not in stock</span>'],
    [T('category'),f=>f.category],
    [T('careLevel'),f=>{const[t,c]=careChip(f.careDifficulty);return `<span class="status-pill ${c}" style="font-size:11px;padding:3px 7px">${t}</span>`}],
    [T('reefSafety'),f=>{const[t,c]=reefChip(f.coralRisk);return `<span class="status-pill ${c}" style="font-size:11px;padding:3px 7px">${t}</span>`}],
    [T('aggression'),f=>{const[t,c]=aggressionChip(f.aggression);return `<span class="status-pill ${c}" style="font-size:11px;padding:3px 7px">${t}</span>`}],
    [T('minTank'),f=>f.minTank],
    [T('maxSizeLabel'),f=>f.maxSize],
    [T('diet'),f=>L(f,'diet')],
    [T('origin'),f=>L(f,'origin')],
  ];
  
  let compatHtml = '';
  const pairs = [];
  for(let i=0;i<cols;i++) for(let j=i+1;j<cols;j++) pairs.push([fish[i],fish[j]]);
  if(pairs.length){
    compatHtml='<div class="compat-section"><h3 class="cmp-compat-title">'+(typeof T==='function'?T('compatibility'):'Compatibility Analysis')+'</h3>';
    for(const [a,b] of pairs){
      const c=getCompatibility(a,b);
      compatHtml+=`<div class="cmp-compat-result ${c.level}"><div class="compat-icon">${c.icon}</div><div class="compat-text"><strong>${a.name} + ${b.name}: ${c.label}</strong><span>${c.reason}</span></div></div>`;
    }
    compatHtml+='</div>';
  }
  
  const cc = document.getElementById('compareContent');
  if(!cc) return;
  const colColors = ['rgba(90,220,200,.04)','rgba(180,130,255,.04)','rgba(255,180,60,.04)'];
  
  cc.innerHTML=`
    <div class="cmp-grid cmp-cols-${cols}">
      <div class="cmp-corner"></div>
      ${fish.map((f,i)=>`
        <div class="cmp-head cmp-col${i}">
          <div class="cmp-photo" data-photo="${f.id}"><div class="cmp-placeholder">LTC</div></div>
          <div class="cmp-name">${L(f,"name")}</div>
          <div class="cmp-sci">${f.scientific}</div>
        </div>`).join('')}

      <div class="cmp-section-label">${typeof T==='function'?T('scoreComparison'):'Score Comparison'}</div>

      ${gaugeFields.map(([label,fn,hint])=>`
        <div class="cmp-label">${label}<span class="cmp-hint">${hint}</span></div>
        ${fish.map((f,i)=>`<div class="cmp-cell cmp-col${i}" data-label="${label}">${fn(f)}</div>`).join('')}
      `).join('')}

      <div class="cmp-section-label">${typeof T==='function'?T('details'):'Details'}</div>

      ${textFields.map(([label,fn])=>`
        <div class="cmp-label">${label}</div>
        ${fish.map((f,i)=>`<div class="cmp-cell cmp-col${i}" data-label="${label}">${fn(f)}</div>`).join('')}
      `).join('')}
    </div>
    ${compatHtml}`;
  const overlay = document.getElementById('compareOverlay');
  if(overlay) overlay.classList.add('show');
  requestAnimationFrame(applyImagesToDOM);
}
function closeCompare(){playClose();const o=document.getElementById('compareOverlay');if(o)o.classList.remove('show')}

// === COMPATIBILITY SCORING ===
function getCompatibility(a,b){
  let score=100;let reasons=[];
  // Aggression mismatch
  const aggDiff=Math.abs(a.aggression-b.aggression);
  if(aggDiff>40){score-=35;reasons.push('very different aggression levels')}
  else if(aggDiff>25){score-=15;reasons.push('moderate aggression difference')}
  // Tank size — both need to fit
  const aTank=parseInt(a.minTank)||0,bTank=parseInt(b.minTank)||0;
  if(aTank+bTank>200){score-=10;reasons.push('combined tank needs are large')}
  // Same category conflict (tangs fighting tangs)
  if(a.category===b.category&&a.category==='Tangs'){score-=20;reasons.push('tangs can be territorial with each other')}
  // Invert risk vs inverts
  if(a.category==='Inverts'&&b.invertRisk>20){score-=25;reasons.push(`${b.name} may threaten invertebrates`)}
  if(b.category==='Inverts'&&a.invertRisk>20){score-=25;reasons.push(`${a.name} may threaten invertebrates`)}
  // Coral risk
  if(a.coralRisk>30&&b.coralRisk>30){score-=10;reasons.push('both have coral risk')}
  // Care difficulty spread
  const careDiff=Math.abs(a.careDifficulty-b.careDifficulty);
  if(careDiff>40){score-=10;reasons.push('very different care requirements')}

  if(score>=80) return {level:'good',icon:'✅',label:T('goodMatch'),reason:reasons.length?reasons[0]:T('coexistWell')};
  if(score>=55) return {level:'ok',icon:'⚠️',label:T('possibleCaution'),reason:reasons.join('; ')};
  return {level:'bad',icon:'❌',label:T('notRecommended'),reason:reasons.join('; ')};
}

// === SIMILAR FISH ===
function getSimilarFish(item,limit=4){
  return FISH.filter(f=>f.id!==item.id)
    .map(f=>{
      let score=0;
      if(f.category===item.category) score+=3;
      if(Math.abs(f.careDifficulty-item.careDifficulty)<20) score+=2;
      if(Math.abs(f.aggression-item.aggression)<20) score+=1;
      if(Math.abs(f.coralRisk-item.coralRisk)<15) score+=1;
      const priceDiff=Math.abs(f.price-item.price);
      if(priceDiff<50) score+=1;
      return {...f,simScore:score};
    })
    .sort((a,b)=>b.simScore-a.simScore)
    .slice(0,limit);
}

// === IDLE SCREEN ===
let idleTimeout;
function resetIdleTimer(){
  clearTimeout(idleTimeout);
  idleTimeout = setTimeout(goIdle, 120000); // 2 minutes
}
function goIdle(){
  state.idleActive = true;
  const idle = document.getElementById('idleScreen');
  if(idle) idle.classList.remove('hidden');
  state.search='';state.category='All';state.sort='featured';state.reefOnly=false;state.easyOnly=false;state.tankFilter=0;state.mode='stock';
  const si=document.getElementById('searchInput');if(si)si.value='';
  const ti=document.getElementById('tankInput');if(ti)ti.value='';
  document.querySelectorAll('.mode-btn').forEach(b=>b.classList.toggle('active',b.dataset.mode==='stock'));
  render();
}
function wakeFromIdle(){
  state.idleActive = false;
  const idle = document.getElementById('idleScreen');
  if(idle) idle.classList.add('hidden');
  resetIdleTimer();
}
// Start idle timer and reset on any interaction
document.addEventListener('click',resetIdleTimer);
document.addEventListener('touchstart',resetIdleTimer);
document.addEventListener('keydown',resetIdleTimer);
document.addEventListener('scroll',resetIdleTimer);
resetIdleTimer();

// === STAFF MODE ===
const STAFF_PIN = '1234'; // Default PIN — change for production
state.staffMode = false;
if(!state.analytics) state.analytics = {};

function openStaffLogin(){
  const overlay = document.getElementById('staffOverlay');
  if(overlay){overlay.classList.add('show');document.getElementById('pinInput').value='';document.getElementById('pinError').textContent='';}
  const pi = document.getElementById('pinInput');
  if(pi) setTimeout(()=>pi.focus(),100);
}
function closeStaffLogin(){
  const overlay = document.getElementById('staffOverlay');
  if(overlay) overlay.classList.remove('show');
}
function checkPin(){
  const input = document.getElementById('pinInput');
  if(!input) return;
  if(input.value === STAFF_PIN){
    state.staffMode = true;
    closeStaffLogin();
    const ab=document.getElementById('analyticsBtn');if(ab)ab.style.display='inline-flex';
    const eb=document.getElementById('exitStaffBtn');if(eb)eb.style.display='inline-flex';
    const fb=document.getElementById('foodsBtn');if(fb)fb.style.display='inline-flex';
    const sb=document.getElementById('staffBadge');if(sb)sb.style.display='none';
    showToast(T('staffActivated'));
    playOpen();
    render();
  } else {
    const err = document.getElementById('pinError');
    if(err) err.textContent = T('incorrectPin');
    input.value = '';
    playClose();
  }
}
function exitStaffMode(){
  state.staffMode = false;
  const ab=document.getElementById('analyticsBtn');if(ab)ab.style.display='none';
  const eb=document.getElementById('exitStaffBtn');if(eb)eb.style.display='none';
  const fb=document.getElementById('foodsBtn');if(fb)fb.style.display='none';
  const sb=document.getElementById('staffBadge');if(sb)sb.style.display='inline-flex';
  showToast(T('staffDeactivated'));
  playClose();
  render();
}

// Staff actions on fish
function staffMarkSold(id){
  const fish = FISH.find(f=>f.id===id);
  if(!fish) return;
  fish.inStock = false;
  fish.soldAt = Date.now();
  showToast(`${fish.name} marked as sold`);
  playClick();
  render();
}
function staffMarkDead(id){
  const fish = FISH.find(f=>f.id===id);
  if(!fish) return;
  fish.inStock = false;
  fish.lossAt = Date.now();
  showToast(`${fish.name} removed (loss)`);
  playClick();
  render();
}
function staffQuarantine(id){
  const fish = FISH.find(f=>f.id===id);
  if(!fish) return;
  showInputModal(T('quarantine'), fish.name, [
    {label: 'Days', type:'number', value:'7', placeholder:'7'}
  ], ([days]) => {
    fish.quarantine = true;
    fish.quarantineUntil = Date.now() + (parseInt(days)||7) * 86400000;
    showToast(`${fish.name} — ${T('quarantine')} ${days}d`);
    playClick();
    render();
  });
}
function staffEndQuarantine(id){
  const fish = FISH.find(f=>f.id===id);
  if(!fish) return;
  fish.quarantine = false;
  delete fish.quarantineUntil;
  showToast(`${fish.name} cleared from quarantine`);
  playOpen();
  render();
}
function staffEditPrice(id){
  const fish = FISH.find(f=>f.id===id);
  if(!fish) return;
  showInputModal(T('editPrice'), fish.name, [
    {label: T('price'), type:'number', value: fish.price, placeholder:'0.00'}
  ], ([val]) => {
    if(val && !isNaN(parseFloat(val))){
      fish.price = parseFloat(val);
      showToast(`${fish.name} → ${formatMoney(fish.price)}`);
      render();
    }
  });
}
function staffEditTank(id){
  const fish = FISH.find(f=>f.id===id);
  if(!fish) return;
  showInputModal(T('editTank'), fish.name, [
    {label: T('tankLabel'), type:'select', value: fish.tankCode, options:['A','B','C','D','E','F']}
  ], ([val]) => {
    fish.tankCode = val.toUpperCase();
    showToast(`${fish.name} → ${T('tankLabel')} ${fish.tankCode}`);
    render();
  });
}
function staffRestockFish(id){
  const fish = FISH.find(f=>f.id===id);
  if(!fish) return;
  showInputModal(T('addToStock'), fish.name, [
    {label: T('price'), type:'number', value: fish.price||'29.99', placeholder:'29.99'},
    {label: T('tankLabel'), type:'select', value: fish.tankCode||'A', options:['A','B','C','D','E','F']}
  ], ([price, tank]) => {
    fish.inStock = true;
    delete fish.soldAt;
    delete fish.deadAt;
    fish.price = parseFloat(price)||29.99;
    fish.tankCode = (tank||'A').toUpperCase();
    showToast(`${fish.name} ${T('addToStock')}`);
    playOpen();
    render();
  });
}

// === STAFF PHOTO UPLOAD ===
function staffUploadPhoto(id){
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const fish = FISH.find(f=>f.id===id);
      if(!fish) return;
      if(!fish.staffPhotos) fish.staffPhotos = [];
      fish.staffPhotos.push(ev.target.result);
      // Also set as primary image immediately
      wikiImages.set(fish.photoTitle, ev.target.result);
      showToast(`Photo uploaded for ${fish.name}`);
      playToggle();
      render();
      requestAnimationFrame(applyImagesToDOM);
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

// === ANALYTICS ===
function openAnalytics(){
  const overlay = document.getElementById('analyticsOverlay');
  if(!overlay) return;
  const content = document.getElementById('analyticsContent');
  if(!content) return;
  
  const viewed = Object.entries(state.analytics||{})
    .map(([id,count])=>{const f=FISH.find(x=>x.id===id);return f?{name:f.name,category:f.category,count}:null})
    .filter(Boolean)
    .sort((a,b)=>b.count-a.count);
  
  const maxViews = viewed.length ? viewed[0].count : 1;
  const totalViews = viewed.reduce((s,v)=>s+v.count,0);
  const topCategory = viewed.reduce((acc,v)=>{acc[v.category]=(acc[v.category]||0)+v.count;return acc},{});
  const topCatName = Object.entries(topCategory).sort((a,b)=>b[1]-a[1])[0];
  
  content.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px">
      <div style="padding:16px;border-radius:14px;background:rgba(90,220,200,.08);border:1px solid rgba(90,220,200,.15);text-align:center">
        <div style="font-size:32px;font-weight:900;color:#5eebc8">${totalViews}</div>
        <div style="font-size:12px;color:rgba(255,255,255,.4);margin-top:4px">Total Profile Views</div>
      </div>
      <div style="padding:16px;border-radius:14px;background:rgba(80,160,255,.08);border:1px solid rgba(80,160,255,.15);text-align:center">
        <div style="font-size:32px;font-weight:900;color:#60b0ff">${viewed.length}</div>
        <div style="font-size:12px;color:rgba(255,255,255,.4);margin-top:4px">Fish Profiles Viewed</div>
      </div>
      <div style="padding:16px;border-radius:14px;background:rgba(255,180,50,.08);border:1px solid rgba(255,180,50,.15);text-align:center">
        <div style="font-size:20px;font-weight:900;color:#ffcc60">${topCatName?topCatName[0]:'—'}</div>
        <div style="font-size:12px;color:rgba(255,255,255,.4);margin-top:4px">Most Browsed Category</div>
      </div>
    </div>
    <h3 style="font-size:14px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.35);margin:0 0 12px">Most Viewed Fish</h3>
    ${viewed.length ? viewed.map(v=>`
      <div class="analytics-row">
        <div>
          <div class="name">${v.name}</div>
          <div style="font-size:11px;color:rgba(255,255,255,.3)">${v.category}</div>
        </div>
        <div class="views">${v.count} view${v.count===1?'':'s'}</div>
      </div>
      <div class="analytics-bar" style="width:${(v.count/maxViews)*100}%"></div>
    `).join('') : '<div style="color:rgba(255,255,255,.3);text-align:center;padding:30px">No profile views recorded yet. Views are tracked when customers tap on fish cards.</div>'}
  `;
  overlay.classList.add('show');
}
function closeAnalytics(){
  const overlay = document.getElementById('analyticsOverlay');
  if(overlay) overlay.classList.remove('show');
}


function renderFoodSettingsToolbar(){
  const bar = document.getElementById('foodsSettingsToolbar');
  if(!bar) return;
  bar.innerHTML = `
    <button class="food-toolbar-btn" type="button" onclick="exportStoreFoodSettings()">Export JSON</button>
    <button class="food-toolbar-btn" type="button" onclick="document.getElementById('foodsSettingsImportFile').click()">Import JSON</button>
    <button class="food-toolbar-btn danger" type="button" onclick="resetStoreFoodSettings()">Restore Defaults</button>
  `;
}
function renderFoodSettings(){
  const root = document.getElementById('foodsSettingsContent');
  if(!root) return;
  renderFoodSettingsToolbar();
  const fileInput = document.getElementById('foodsSettingsImportFile');
  if(fileInput && !fileInput.dataset.boundFoodImport){
    fileInput.addEventListener('change', e => {
      importStoreFoodSettingsFile(e.target.files?.[0]);
      e.target.value = '';
    });
    fileInput.dataset.boundFoodImport = '1';
  }
  const settings = getStoreFoodSettings();
  const catalog = Array.isArray(window.FOOD_CATALOG) ? window.FOOD_CATALOG : [];
  const brands = [...new Set(catalog.map(f => f.brand))];
  const types = [...new Set(catalog.map(f => f.type))];
  root.innerHTML = `
    <div class="food-settings-copy">Everything here is local to this browser unless you export and import the JSON. Fish profiles only show foods that are enabled and carried.</div>
    <div class="food-settings-brands">${brands.map(brand => `<label class="food-toggle"><input type="checkbox" data-food-brand="${brand}" ${settings.enabledBrands[brand] !== false ? 'checked' : ''}> <span>${brand}</span></label>`).join('')}</div>
    <div class="food-settings-brands food-type-row">${types.map(type => `<label class="food-toggle"><input type="checkbox" data-food-type="${type}" ${settings.hiddenTypes[type] ? '' : 'checked'}> <span>${type}</span></label>`).join('')}</div>
    <div class="food-settings-grid">${catalog.map(food => {
      const carried = !settings.disabledProducts[food.id];
      const featured = !!settings.featuredProducts[food.id];
      const dim = settings.enabledBrands[food.brand] === false || !carried;
      return `<div class="food-card-toggle ${dim ? 'is-dim' : ''} ${featured ? 'is-featured' : ''}">
        <div class="food-card-actions">
          <label class="food-toggle compact"><input type="checkbox" data-food-product="${food.id}" ${carried ? 'checked' : ''}> <span>Carry</span></label>
          <button class="feature-star ${featured ? 'active' : ''}" type="button" data-food-feature="${food.id}" aria-label="Feature ${food.name}">★</button>
        </div>
        <div class="food-brand">${food.brand}</div>
        <div class="food-name">${food.name}</div>
        <div class="food-card-meta"><span class="food-badge">${food.type}</span><span class="food-badge">${food.stage}</span></div>
        <div class="food-notes">${food.notes}</div>
      </div>`;
    }).join('')}</div>
  `;
  root.querySelectorAll('[data-food-brand]').forEach(el => el.addEventListener('change', () => {
    settings.enabledBrands[el.dataset.foodBrand] = el.checked;
    saveStoreFoodSettings();
    renderFoodSettings();
    render();
  }));
  root.querySelectorAll('[data-food-type]').forEach(el => el.addEventListener('change', () => {
    settings.hiddenTypes[el.dataset.foodType] = !el.checked;
    saveStoreFoodSettings();
    render();
  }));
  root.querySelectorAll('[data-food-product]').forEach(el => el.addEventListener('change', () => {
    settings.disabledProducts[el.dataset.foodProduct] = !el.checked;
    saveStoreFoodSettings();
    renderFoodSettings();
    render();
  }));
  root.querySelectorAll('[data-food-feature]').forEach(el => el.addEventListener('click', () => {
    const id = el.dataset.foodFeature;
    settings.featuredProducts[id] = !settings.featuredProducts[id];
    saveStoreFoodSettings();
    renderFoodSettings();
    render();
  }));
}
function openFoodSettings(){
  const overlay = document.getElementById('foodsOverlay');
  if(!overlay) return;
  overlay.classList.add('show');
  renderFoodSettings();
}
function closeFoodSettings(){
  const overlay = document.getElementById('foodsOverlay');
  if(overlay) overlay.classList.remove('show');
}

// === NOTIFY (placeholder) ===
function notifyWhenInStock(fishName){
  showInputModal(T('notify'), fishName, [
    {label: 'Email', type:'email', value:'', placeholder:'your@email.com'}
  ], ([email]) => {
    if(email && email.includes('@')){
      showToast(`${email} → ${fishName} ✓`);
      playToggle();
    }
  });
}

// === THEME TOGGLE ===
function toggleTheme(){
  document.body.classList.toggle('light-mode');
  const btn = document.querySelector('.theme-toggle');
  if(btn) btn.textContent = document.body.classList.contains('light-mode') ? '☀️' : '🌙';
  playClick();
}

// === BUNDLES ===
// BUNDLES loaded from data/fish.js
function renderBundlesHTML(){
  if(state.mode!=='stock') return '';
  const valid = BUNDLES.filter(b=>b.fish.every(id=>FISH.find(f=>f.id===id&&f.inStock)));
  let html = valid.map((b,idx)=>{
    const fl=b.fish.map(id=>FISH.find(f=>f.id===id)).filter(Boolean);
    const total=fl.reduce((s,f)=>s+(f.salePrice||f.price),0);
    const disc=total*(1-b.discount/100);
    return `<div class="bundle-card" style="flex:0 0 260px;padding:12px;border-radius:14px;background:rgba(90,220,200,.06);border:1px solid rgba(90,220,200,.12)">
      <div style="font-size:14px;font-weight:800;color:#5eebc8">${b.name_es && state.lang==="es" ? b.name_es : b.name}</div>
      <div style="font-size:11px;color:rgba(255,255,255,.35);margin-top:3px">${b.desc_es && state.lang==="es" ? b.desc_es : b.desc}</div>
      <div style="margin-top:6px;display:flex;align-items:center;gap:6px">
        <span style="font-size:10px;color:rgba(255,255,255,.25);text-decoration:line-through">${formatMoney(total)}</span>
        <span style="font-size:15px;font-weight:900;color:#5eebc8">${formatMoney(disc)}</span>
        <span style="padding:2px 5px;border-radius:4px;background:rgba(255,80,80,.2);color:#ff8888;font-size:9px;font-weight:800">${typeof T==='function'?T('save'):'SAVE'} ${b.discount}%</span>
      </div>
      ${state.staffMode ? `<div style="margin-top:6px;display:flex;gap:4px">
        <button onclick="event.stopPropagation();staffEditBundle(${idx})" style="padding:2px 6px;border-radius:4px;background:rgba(80,180,255,.15);border:1px solid rgba(80,180,255,.2);color:#80c0ff;font-size:9px;cursor:pointer">Edit</button>
        <button onclick="event.stopPropagation();staffRemoveBundle(${idx})" style="padding:2px 6px;border-radius:4px;background:rgba(255,80,80,.15);border:1px solid rgba(255,80,80,.2);color:#ff8888;font-size:9px;cursor:pointer">Remove</button>
      </div>` : ''}
    </div>`;
  }).join('');
  if(state.staffMode) html += '<div class="bundle-card bundle-card-new" style="flex:0 0 120px;padding:12px;border-radius:14px;border:2px dashed rgba(90,220,200,.2);display:grid;place-items:center;cursor:pointer;color:rgba(90,220,200,.5);font-size:13px;font-weight:700" onclick="staffCreateBundle()">+ New Bundle</div>';
  return html;
}

// Sale pricing loaded from data/fish.js

// === LANGUAGE TOGGLE ===
state.lang = 'en';
function toggleLang(){
  state.lang = state.lang==='en'?'es':'en';
  playClick();
  if(typeof applyLanguage === 'function') applyLanguage();
  render();
  // Re-apply after render since render rebuilds some elements
  setTimeout(()=>{ if(typeof applyLanguage === 'function') applyLanguage(); }, 50);
}

// Startup calls moved to features.js (loads after T() is defined)
window.addEventListener('resize', ()=>{ updateCategoryRailUI(); updateBundleRailUI(); });
document.addEventListener('DOMContentLoaded', updateCategoryRailUI);
