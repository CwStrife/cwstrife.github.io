// LTC Fish Browser — Main Application

// T() polyfill — features.js defines the real version with translations.
// This fallback ensures app.js functions work even before features.js loads.
if(typeof T !== 'function'){ var T = function(k){ return k; }; }

// FISH data loaded from data/fish.js
const state = {
  viewMode: 'detailed', category:"All", search:"", sort:"featured", reefOnly:false, easyOnly:false, selectedId:null, mode:"stock", favorites:[], compareList:[], tankFilter:0, idleActive:false };
const wikiImages = new Map();

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
function getGallerySources(item){
  const seen = new Set();
  const out = [];
  const wiki = wikiImages.get(item.photoTitle);
  if(wiki && !seen.has(wiki)){
    seen.add(wiki);
    out.push({src: wiki, kind: 'wiki'});
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
function buildBehaviorParagraph(item){
  const aggressionLabel = riskText(item.aggression);
  const difficulty = riskText(item.careDifficulty, 'difficulty');
  return `${item.name} works best in systems that can actually support the adult size, attitude, and stability needs that come with it. Expect roughly ${item.maxSize} at maturity, and think of it as a ${difficulty.toLowerCase()} profile with ${aggressionLabel.toLowerCase()} aggression rather than judging it only by how it looks in the display.`;
}
function buildFeedingParagraph(item){
  return `This species comes from the ${L(item,"origin").toLowerCase()}, where it is usually associated with ${item.habitat.toLowerCase()}. That natural background explains a lot of the visible day-to-day behavior in captivity. Feeding should match that origin story too, because a ${L(item,"diet").toLowerCase()} profile often determines whether the customer is really prepared for long-term success.`;
}
function buildBuyingParagraph(item){
  const reefLabel = riskText(item.coralRisk);
  const invertLabel = riskText(item.invertRisk);
  return `For store-floor conversations, the fast compatibility summary is simple: coral risk is ${reefLabel.toLowerCase()}, invertebrate risk is ${invertLabel.toLowerCase()}, and the tank size should be matched to the customer’s real system rather than the size of the fish today. This is the kind of profile that can save a rushed purchase and make staff conversations easier.`;
}
function buildRecognitionParagraph(item){
  return `People tend to stop at this animal because of the way it looks first, then they want help translating that visual appeal into practical care information. The kiosk should bridge that gap by pairing the visual cue — ${item.visualCue.charAt(0).toLowerCase() + item.visualCue.slice(1)} — with clear husbandry notes, tank fit, and risk levels that are easy to understand in a few seconds.`;
}
function modalTemplate(item){
  const [reefText, reefClass] = reefChip(item.coralRisk);
  const [careText, careClass] = careChip(item.careDifficulty);
  const [aggText, aggClass] = aggressionChip(item.aggression);
  const [invText, invClass] = invertChip(item.invertRisk);
  const aliasText = item.aliases && item.aliases.length ? item.aliases.join(', ') : T('noneListedAliases');
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
                <span class="mini-pill">${typeof T==='function'?T('tankLabel'):'Tank'} ${item.tankCode}</span>
                <span class="mini-pill">${item.type}</span>
                <span class="mini-pill">${item.stockSize} in stock</span>
              </div>
            </div>
          </div>
        </div>
        ${galleryTemplate(item) || (state.staffMode ? `<div class="photo-upload-row"><button type="button" class="photo-gallery-upload photo-gallery-upload-wide" onclick="event.stopPropagation();staffUploadPhoto('${item.id}')">${typeof T==='function'?T('uploadStorePhoto'):'+ Upload store photo'}</button></div>` : '')}

        <div class="modal-section ocean">
          <div class="section-title"><h3>Quick overview</h3></div>
          <p class="overview">${L(item,"overview")}</p>
        </div>

        <div class="modal-section seafoam">
          <div class="section-title"><h3>What customers should notice</h3></div>
          <div class="reading-stack">
            <div class="reading-block">
              <strong>Visual ID cues</strong>
              <p>${item.visualCue}</p>
            </div>
            <div class="reading-block">
              <strong>Common names / aliases</strong>
              <p>${aliasText}</p>
            </div>
            <div class="reading-block">
              <strong>Role in the tank</strong>
              <p>${L(item,"role")}</p>
            </div>
          </div>
        </div>

        <div class="modal-section plum">
          <div class="section-title"><h3>Quick facts</h3></div>
          <div class="fact-stack">
            ${item.facts.map(f => `<div class="fact-card">${f}</div>`).join('')}
          </div>
        </div>
      </div>

      <div class="modal-right">
        <div class="modal-headline">
          <div>
            <div class="modal-type">${typeof CARD_LABELS!=="undefined"&&CARD_LABELS[item.category]?CARD_LABELS[item.category]:TC(item.category)}</div>
            <p><strong>${L(item,"name")}</strong> should read like a real in-store profile, not a tiny tank tag. The goal is to let shoppers identify it quickly, then actually sit there and learn something before they ask staff.</p>
          </div>
        </div>

        <div class="price-band">
          <div class="modal-stat">
            <div class="meta-label">Display price</div>
            <div class="meta-value">${formatMoney(item.price)}</div>
            <div class="meta-sub">For in-store reference only — no cart, no checkout, no ordering flow.</div>
          </div>
          <div class="modal-stat">
            <div class="meta-label">Minimum tank</div>
            <div class="meta-value">${item.minTank}</div>
            <div class="meta-sub">Fast read for whether the customer’s setup is even in range.</div>
          </div>
          <div class="modal-stat">
            <div class="meta-label">Care level</div>
            <div class="meta-value">${item.careLabel}</div>
            <div class="meta-sub">Separates beginner livestock from animals that need more experience.</div>
          </div>
          <div class="modal-stat">
            <div class="meta-label">Max size</div>
            <div class="meta-value">${item.maxSize}</div>
            <div class="meta-sub">Useful for avoiding “cute now, problem later” purchases.</div>
          </div>
        </div>

        <div class="modal-section ocean">
          <div class="section-title"><h3>Compatibility gauges</h3></div>
          <div class="gauges">
            ${gaugeCard(T('tempAggression'), item.aggression, T('veryCalm2'), T('veryDangerous'))}
            ${gaugeCard(T('coralRisk'), item.coralRisk, T('reefSafe2'), T('coralNipper'))}
            ${gaugeCard(T('invertSafetyRisk'), item.invertRisk, T('lowInvertRisk'), T('likelyHarass'))}
            ${gaugeCard(T('careDiffLabel'), item.careDifficulty, T('easyLabel'), T('expertSpec'), 'difficulty')}
          </div>
        </div>

        <div class="two-col">
          <div class="modal-section seafoam">
            <div class="section-title"><h3>At-a-glance fit</h3></div>
            <div class="pill-list">
              <span class="list-pill status-pill ${reefClass}">${reefText}</span>
              <span class="list-pill status-pill ${careClass}">${careText}</span>
              <span class="list-pill status-pill ${aggClass}">${aggText}</span>
              <span class="list-pill status-pill ${invClass}">${invText}</span>
            </div>
          </div>
          <div class="modal-section gold">
            <div class="section-title"><h3>Core specs</h3></div>
            <div class="pill-list">
              <span class="list-pill">${typeof T==='function'?T('diet'):'Diet'}: ${L(item,"diet")}</span>
              <span class="list-pill">${typeof T==='function'?T('origin'):'Origin'}: ${L(item,"origin")}</span>
              <span class="list-pill">Habitat: ${item.habitat}</span>
              <span class="list-pill">In-store size: ${item.stockSize}${(typeof SIZE_SCALE!=='undefined'&&SIZE_SCALE[item.stockSize])?' ('+SIZE_SCALE[item.stockSize]+')':''}</span>
            </div>
          </div>
        </div>

        <div class="modal-section plum">
          <div class="section-title"><h3>Longer reading</h3></div>
          <div class="reading-stack">
            <div class="reading-block">
              <strong>Behavior &amp; tank fit</strong>
              <p>${buildBehaviorParagraph(item)}</p>
            </div>
            <div class="reading-block">
              <strong>Feeding &amp; natural habitat</strong>
              <p>${buildFeedingParagraph(item)}</p>
            </div>
            <div class="reading-block">
              <strong>Recognition &amp; buyer questions</strong>
              <p>${buildRecognitionParagraph(item)}</p>
            </div>
            <div class="reading-block">
              <strong>Buying guidance</strong>
              <p>${buildBuyingParagraph(item)}</p>
            </div>
          </div>
        </div>

        <div class="two-col">
          <div class="modal-section seafoam">
            <div class="section-title"><h3>Works well with</h3></div>
            <div class="pill-list">
              ${item.bestWith.map(v => `<span class="list-pill">${v}</span>`).join('')}
            </div>
          </div>
          <div class="modal-section gold">
            <div class="section-title"><h3>Use caution with</h3></div>
            <div class="pill-list">
              ${item.cautionWith.map(v => `<span class="list-pill">${v}</span>`).join('')}
            </div>
          </div>
        </div>

        <div class="origin-card">
          <strong>Origin &amp; natural range</strong>
          <p>${L(item,"origin")}<br><span class="subtle">Natural habitat: ${item.habitat}. This gives the customer more context for behavior, feeding style, and why some animals want caves, open water, rockwork, or sand.</span></p>
        </div>

        <div class="staff-card">
          <strong>Staff note</strong>
          <p>${item.staffNote}</p>
        </div>
        ${item.seasonal ? `<div class="seasonal-section">
          <span class="seasonal-icon">📅</span>
          <div><div class="seasonal-label">Seasonal Availability</div>
          <div class="seasonal-text">${item.seasonal}</div></div>
        </div>` : ''}
        ${typeof waterParamsSection === 'function' ? waterParamsSection(item) : ''}

        <div class="similar-section">
          <h3>Similar Fish You Might Like</h3>
          <div class="similar-row">
            ${getSimilarFish(item).map(s=>`
              <div class="similar-card" onclick="closeFishModal();setTimeout(()=>openFishModal('${s.id}'),300)">
                <div class="name">${L(s,"name")}</div>
                <div class="sub">${s.category}</div>
                <div class="sub">${s.inStock?formatMoney(s.price):(typeof T==='function'?T('ency'):'Encyclopedia')}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="action-row">
          <button class="cta primary" data-copy="${L(item,'name')} • Tank ${item.tankCode} • ${formatMoney(item.price)}">${typeof T==='function'?T('copyInfo'):'Copy fish + tank info'}</button>
          <button class="cta secondary" data-close-modal="true">Close profile</button>
        </div>

        <div class="modal-footnote">This version keeps the front page focused on bold visual browsing while the details open larger, cleaner, and easier to read on top. That should work much better on a touch kiosk than squeezing everything into a permanent side rail.</div>
      </div>
    </div>
  `;
}

function modalTemplateMobile(item){
  const [reefText, reefClass] = reefChip(item.coralRisk);
  const [careText, careClass] = careChip(item.careDifficulty);
  const [aggText, aggClass] = aggressionChip(item.aggression);
  const [invText, invClass] = invertChip(item.invertRisk);
  const aliasText = item.aliases && item.aliases.length ? item.aliases.join(', ') : T('noneListedAliases');
  return `
    <div class="modal-layout mobile-stack">
      <div class="modal-photo-card mobile-hero-card">
        <div class="modal-photo modal-photo-mobile" data-detail-photo="${item.id}">
          <div class="image-placeholder">LTC</div><div class="skeleton-img"></div>
          <div class="modal-photo-copy mobile-photo-copy">
            <h2>${L(item,'name')}</h2>
            <span class="latin">${item.scientific}</span>
            <div class="modal-mini">
              <span class="mini-pill">${typeof T==='function'?T('tankLabel'):'Tank'} ${item.tankCode || '—'}</span>
              <span class="mini-pill">${item.stockSize || '—'}${(typeof SIZE_SCALE!=='undefined'&&item.stockSize&&SIZE_SCALE[item.stockSize])?' '+SIZE_SCALE[item.stockSize]:''}</span>
              <span class="mini-pill">${typeof CARD_LABELS!=="undefined"&&CARD_LABELS[item.category]?CARD_LABELS[item.category]:TC(item.category)}</span>
            </div>
          </div>
        </div>
      </div>
      ${galleryTemplate(item)}

      <div class="mobile-stat-grid">
        <div class="modal-stat"><div class="meta-label">Display price</div><div class="meta-value">${formatMoney(item.price)}</div><div class="meta-sub">Store reference</div></div>
        <div class="modal-stat"><div class="meta-label">Minimum tank</div><div class="meta-value">${item.minTank}</div><div class="meta-sub">Setup check</div></div>
        <div class="modal-stat"><div class="meta-label">Care level</div><div class="meta-value">${item.careLabel}</div><div class="meta-sub">Experience</div></div>
        <div class="modal-stat"><div class="meta-label">Max size</div><div class="meta-value">${item.maxSize}</div><div class="meta-sub">Adult size</div></div>
      </div>

      <div class="modal-section ocean">
        <div class="section-title"><h3>Quick overview</h3></div>
        <p class="overview">${L(item,'overview')}</p>
      </div>

      <div class="modal-section seafoam">
        <div class="section-title"><h3>Quick facts</h3></div>
        <div class="mobile-traits-grid">
          <div class="mobile-trait ${reefClass}"><span>Reef</span><strong>${reefText}</strong></div>
          <div class="mobile-trait ${careClass}"><span>Care</span><strong>${careText}</strong></div>
          <div class="mobile-trait ${aggClass}"><span>Temper</span><strong>${aggText}</strong></div>
          <div class="mobile-trait ${invClass}"><span>Invert</span><strong>${invText}</strong></div>
        </div>
        <div class="mobile-practical-grid">
          <div class="mobile-practical"><span>${typeof T==='function'?T('diet'):'Diet'}</span><strong>${L(item,'diet')}</strong></div>
          <div class="mobile-practical"><span>${typeof T==='function'?T('origin'):'Origin'}</span><strong>${L(item,'origin')}</strong></div>
          <div class="mobile-practical"><span>Habitat</span><strong>${item.habitat}</strong></div>
          <div class="mobile-practical"><span>Role</span><strong>${L(item,'role')}</strong></div>
        </div>
      </div>

      <div class="modal-section plum">
        <div class="section-title"><h3>Compatibility gauges</h3></div>
        <div class="gauges">
          ${gaugeCard(T('tempAggression'), item.aggression, T('veryCalm2'), T('veryDangerous'))}
          ${gaugeCard(T('coralRisk'), item.coralRisk, T('reefSafe2'), T('coralNipper'))}
          ${gaugeCard(T('invertSafetyRisk'), item.invertRisk, T('lowInvertRisk'), T('likelyHarass'))}
          ${gaugeCard(T('careDiffLabel'), item.careDifficulty, T('easyLabel'), T('expertSpec'), 'difficulty')}
        </div>
      </div>

      ${typeof waterParamsSection === 'function' ? waterParamsSection(item) : ''}

      <div class="modal-section seafoam">
        <div class="section-title"><h3>Longer read</h3></div>
        <div class="reading-stack">
          <div class="reading-block"><strong>Behavior & tank fit</strong><p>${buildBehaviorParagraph(item)}</p></div>
          <div class="reading-block"><strong>Feeding & natural habitat</strong><p>${buildFeedingParagraph(item)}</p></div>
          <div class="reading-block"><strong>Recognition & buyer questions</strong><p>${buildRecognitionParagraph(item)}</p></div>
          <div class="reading-block"><strong>Buying guidance</strong><p>${buildBuyingParagraph(item)}</p></div>
        </div>
      </div>

      <div class="two-col mobile-two-col">
        <div class="modal-section seafoam">
          <div class="section-title"><h3>Works well with</h3></div>
          <div class="pill-list">
            ${item.bestWith.map(v => `<span class="list-pill">${v}</span>`).join('')}
          </div>
        </div>
        <div class="modal-section gold">
          <div class="section-title"><h3>Use caution with</h3></div>
          <div class="pill-list">
            ${item.cautionWith.map(v => `<span class="list-pill">${v}</span>`).join('')}
          </div>
        </div>
      </div>

      <div class="origin-card"><strong>Origin & natural range</strong><p>${L(item,'origin')}<br><span class="subtle">Natural habitat: ${item.habitat}.</span></p></div>
      <div class="staff-card"><strong>Staff note</strong><p>${item.staffNote}</p></div>
      ${item.seasonal ? `<div class="seasonal-section"><span class="seasonal-icon">📅</span><div><div class="seasonal-label">Seasonal Availability</div><div class="seasonal-text">${item.seasonal}</div></div></div>` : ''}

      <div class="similar-section">
        <h3>Similar Fish You Might Like</h3>
        <div class="similar-row mobile-similar-grid">
          ${getSimilarFish(item).map(s=>`
            <div class="similar-card" onclick="closeFishModal();setTimeout(()=>openFishModal('${s.id}'),220)">
              <div class="name">${L(s,'name')}</div>
              <div class="sub">${s.category}</div>
              <div class="sub">${s.inStock?formatMoney(s.price):(typeof T==='function'?T('ency'):'Encyclopedia')}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="action-row">
        <button class="cta primary" data-copy="${L(item,'name')} • Tank ${item.tankCode} • ${formatMoney(item.price)}">${typeof T==='function'?T('copyInfo'):'Copy fish + tank info'}</button>
        <button class="cta secondary" data-close-modal="true">Close profile</button>
      </div>
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
async function loadAllImages(){
  // Fire ALL image fetches in parallel
  const titles = [...new Set(FISH.map(f => f.photoTitle))];
  await Promise.allSettled(titles.map(t => fetchWikiImage(t)));
  applyImagesToDOM();
}
function applyImagesToDOM(){
  const targets = [...document.querySelectorAll('[data-photo]'), ...document.querySelectorAll('[data-detail-photo]')];
  for(const target of targets){
    const id = target.dataset.photo || target.dataset.detailPhoto;
    const fish = FISH.find(item => item.id === id);
    if(!fish) continue;
    const src = wikiImages.get(fish.photoTitle);
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
