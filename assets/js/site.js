/* ============================================================
   LOW TIDE CORALS — site.js v0.25
   Per-slide promo color cycling. Otherwise mostly v0.24.
   ============================================================ */
(function(){
  'use strict';

  var $  = function(s,r){return (r||document).querySelector(s)};
  var $$ = function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};

  /* ─── ltcFx (verbatim from kiosk v0.123) ─── */
  window.ltcFx = (function(){
    function jelly(el){
      if(!el) return;
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = 'ltcJellyLight .32s ease';
    }
    function bubbles(el, opts){
      if(!el) return;
      opts = opts || {};
      var count = opts.count || 18;
      var color = opts.color || 'rgba(214,193,154,.6)';
      var pos = window.getComputedStyle(el).position;
      if(pos === 'static') el.style.position = 'relative';
      if(window.getComputedStyle(el).overflow !== 'hidden') el.style.overflow = 'hidden';
      jelly(el);
      for(var i = 0; i < count; i++){
        var x = 15 + Math.random() * 70;
        var y = 60 + Math.random() * 30;
        var sz = 3 + Math.random() * 10;
        var dx = (Math.random() - 0.5) * 22;
        var dy = -(35 + Math.random() * 55);
        var dur = 600 + Math.random() * 500;
        spawnBubble(el, x, y, sz, dx, dy, dur, color);
      }
    }
    function spawnBubble(host, x, y, sz, dx, dy, dur, color){
      var b = document.createElement('div');
      b.style.cssText = 'position:absolute;border-radius:50%;width:'+sz+'px;height:'+sz+'px;left:'+x+'%;top:'+y+'%;background:'+color+';pointer-events:none;z-index:4;opacity:.7;border:1px solid rgba(255,255,255,.2)';
      host.appendChild(b);
      var start = null;
      function frame(ts){
        if(!start) start = ts;
        var t = Math.min((ts - start) / dur, 1);
        var e = 1 - Math.pow(1 - t, 2);
        b.style.transform = 'translate('+dx*e+'px,'+dy*e+'px) scale('+(1 - t * 0.4)+')';
        b.style.opacity = String(0.7 * (1 - t * 0.9));
        if(t < 1) requestAnimationFrame(frame);
        else b.remove();
      }
      requestAnimationFrame(frame);
    }
    return { jelly: jelly, bubbles: bubbles };
  })();

  document.addEventListener('pointerdown', function(e){
    var el = e.target.closest('.btn, .promo-arrow, .promo-dot, .modal-close, .dg-card, .dg-side-link, .coral-card, .dept-circle, .quick-tile, .callout-tile, .article-card, .primary-nav a, .mobile-menu a, .menu-toggle, .coral-tab, .coral-cat-pill, .dg-ess-card, .dg-beg-path');
    if(!el) return;
    ltcFx.jelly(el);
  }, {passive:true});

  /* ─── cardPopAndJostle ─── 
     When a big card is tapped: the card itself does a confident
     "press in" pop, neighbors get a propagating bump wave outward,
     and a small bubble burst escapes from the click point. */
  window.ltcFx.cardPopAndJostle = function(card, opts){
    if(!card) return;
    opts = opts || {};
    var bubbleColor = opts.color || 'rgba(214,193,154,.55)';

    // 1. Pop the clicked card
    card.classList.remove('is-popping');
    void card.offsetWidth;
    card.classList.add('is-popping');
    setTimeout(function(){ card.classList.remove('is-popping') }, 460);

    // 2. Propagate jostle to neighbors based on grid position distance
    var grid = card.parentElement;
    if(grid){
      var siblings = Array.prototype.slice.call(grid.children);
      var clickedIdx = siblings.indexOf(card);
      if(clickedIdx >= 0){
        var clickedRect = card.getBoundingClientRect();
        siblings.forEach(function(sib, i){
          if(sib === card || !sib.getBoundingClientRect) return;
          var dist = Math.abs(i - clickedIdx);
          if(dist > 4) return;
          var sibRect = sib.getBoundingClientRect();
          // direction: positive = right of clicked, negative = left
          var xDir = sibRect.left > clickedRect.left ? 1 : (sibRect.left < clickedRect.left ? -1 : 0);
          // Same row check (within ~60% of card height)
          var sameRow = Math.abs(sibRect.top - clickedRect.top) < clickedRect.height * 0.6;
          var intensity = (1 - dist / 5);
          var delay = dist * 35;
          sib.style.setProperty('--jostle-i', intensity.toFixed(3));
          sib.style.setProperty('--jostle-x', sameRow ? xDir : 0);
          sib.classList.remove('is-jostling');
          void sib.offsetWidth;
          // Trigger via animation-delay
          sib.style.animationDelay = delay + 'ms';
          sib.classList.add('is-jostling');
          setTimeout((function(s){ return function(){
            s.classList.remove('is-jostling');
            s.style.animationDelay = '';
            s.style.removeProperty('--jostle-i');
            s.style.removeProperty('--jostle-x');
          }})(sib), 600 + delay);
        });
      }
    }

    // 3. Small bubble burst escaping the card
    if(window.ltcFx && window.ltcFx.bubbles){
      window.ltcFx.bubbles(card, { count: 8, color: bubbleColor });
    }
  };

  document.addEventListener('click', function(e){
    var el = e.target.closest('.btn-primary, [data-celebrate]');
    if(!el) return;
    var col = window.getComputedStyle(el).backgroundColor || 'rgba(214,193,154,.55)';
    ltcFx.bubbles(el, {count:14, color:col.replace('rgb', 'rgba').replace(')', ',.55)')});
  });

  /* ─── MOBILE MENU ─── */
  $$('[data-menu-toggle]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var menu = $('[data-mobile-nav]');
      if(!menu) return;
      var open = menu.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* ─── SWIMMING FISH ─── */
  var FISH_SVGS = {
    classic:'<svg viewBox="0 0 60 40"><g class="tailwag"><path d="M16 20 L2 6 L6 20 L2 34 Z"/></g><ellipse cx="32" cy="20" rx="18" ry="11"/><path d="M28 10 L34 2 L40 10 Z"/><path d="M30 30 L36 38 L40 30 Z"/><circle class="eye" cx="42" cy="17" r="2.2"/><circle class="pupil" cx="42.5" cy="17" r="1"/></svg>',
    angel:'<svg viewBox="0 0 48 56"><path d="M24 12 Q20 2 18 -4 L26 -4 Q27 4 28 12 Z"/><path d="M24 44 Q20 52 18 60 L26 60 Q27 52 28 44 Z"/><path d="M24 8 L40 28 L24 48 L12 28 Z"/><g class="tailwag"><path d="M14 28 L2 18 L6 28 L2 38 Z"/></g><circle class="eye" cx="30" cy="25" r="2.2"/><circle class="pupil" cx="30.5" cy="25" r="1"/></svg>',
    arrow:'<svg viewBox="0 0 58 32"><g class="tailwag"><path d="M14 16 L2 4 L6 16 L2 28 Z"/></g><path d="M10 16 L30 4 L50 16 L30 28 Z"/><circle class="eye" cx="36" cy="14" r="1.8"/><circle class="pupil" cx="36.3" cy="14" r=".8"/></svg>',
    tang:'<svg viewBox="0 0 58 44"><g class="tailwag"><path d="M14 22 L2 8 L5 22 L2 36 Z"/></g><path d="M14 22 Q14 6 32 6 Q48 8 48 22 Q48 36 32 38 Q14 38 14 22 Z"/><path d="M28 6 Q30 -2 38 0 Q38 6 36 8 Z"/><path d="M28 38 Q30 46 38 44 Q38 38 36 36 Z"/><circle class="eye" cx="40" cy="19" r="2"/><circle class="pupil" cx="40.3" cy="19" r=".9"/></svg>',
    clown:'<svg viewBox="0 0 60 38"><g class="tailwag"><path d="M14 19 L2 6 L5 19 L2 32 Z"/></g><ellipse cx="32" cy="19" rx="18" ry="11"/><path d="M28 9 L34 2 L40 9 Z"/><circle class="eye" cx="43" cy="16" r="2.2"/><circle class="pupil" cx="43.5" cy="16" r="1"/></svg>'
  };
  var SWIM_COLORS = [
    {stroke:'rgba(214,193,154,.65)', glow:'rgba(214,193,154,.28)'},
    {stroke:'rgba(168,200,164,.62)', glow:'rgba(168,200,164,.26)'},
    {stroke:'rgba(255,203,94,.6)',   glow:'rgba(255,203,94,.26)'},
    {stroke:'rgba(148,212,216,.62)', glow:'rgba(148,212,216,.26)'},
    {stroke:'rgba(200,178,255,.62)', glow:'rgba(200,178,255,.26)'}
  ];
  function spawnFish(){
    var header = $('.site-header');
    if(!header) return;
    var layer = document.createElement('div');
    layer.className = 'fishlayer';
    header.insertBefore(layer, header.firstChild);
    var seeds = [
      {key:'classic', top:'18%', dur:32, delay:0,   flip:false, slow:false, bob:true,  size:42, c:0},
      {key:'angel',   top:'62%', dur:44, delay:6,   flip:true,  slow:true,  bob:true,  size:36, c:1},
      {key:'tang',    top:'78%', dur:38, delay:14,  flip:false, slow:false, bob:false, size:46, c:2},
      {key:'arrow',   top:'30%', dur:26, delay:9,   flip:true,  slow:false, bob:true,  size:38, c:3},
      {key:'clown',   top:'52%', dur:36, delay:20,  flip:false, slow:true,  bob:false, size:40, c:4}
    ];
    seeds.forEach(function(s){
      var col = SWIM_COLORS[s.c];
      var f = document.createElement('div');
      f.className = 'swimmer'+(s.flip?' flip':'')+(s.slow?' slow':'')+(s.bob?' bob':'');
      f.style.setProperty('--top', s.top);
      f.style.setProperty('--dur', s.dur+'s');
      f.style.setProperty('--delay', '-'+s.delay+'s');
      f.style.setProperty('--swc', col.stroke);
      f.style.setProperty('--swglow', col.glow);
      f.style.width = s.size+'px';
      f.style.height = (s.size*0.74)+'px';
      f.innerHTML = '<span class="bub"></span><span class="bub"></span><span class="bub"></span><span class="bub"></span>'+FISH_SVGS[s.key];
      layer.appendChild(f);
    });
  }
  spawnFish();

  /* ─────────────────────────────────────────────────────────
     PROMO HERO BANNER — per-slide color cycling
     ───────────────────────────────────────────────────────── */
  // Each slide pairs an eyebrow label, accent hex, and accent rgb
  var PROMO_THEMES = [
    {label:'Staff pick · this week',     c:'#d6c19a', rgb:'214,193,154'},  // champagne
    {label:'Rare find · limited stock',  c:'#a8c8a4', rgb:'168,200,164'},  // sage
    {label:'Fan favorite',               c:'#ffcb5e', rgb:'255,203,94'},   // amber
    {label:'New arrival',                c:'#ff8a78', rgb:'255,138,120'},  // coral
    {label:'Reef-safe starter pick',     c:'#94d4d8', rgb:'148,212,216'}   // cyan
  ];

  function initPromo(){
    var root = $('[data-promo]');
    if(!root) return;
    var data = window.LTC_FISH_SAMPLES || [];
    if(!data.length) return;

    var slide = $('[data-promo-slide]', root);
    var elImg = $('[data-promo-img]', root);
    var elFb = $('[data-promo-fb]', root);
    var elEyebrow = $('[data-promo-eyebrow]', root);
    var elName = $('[data-promo-name]', root);
    var elSci = $('[data-promo-sci]', root);
    var elSummary = $('[data-promo-summary]', root);
    var elPrice = $('[data-promo-price]', root);
    var elTank = $('[data-promo-tank]', root);
    var elSize = $('[data-promo-size]', root);
    var elCare = $('[data-promo-care]', root);
    var elDots = $('[data-promo-dots]', root);
    var btnPrev = $('[data-promo-prev]', root);
    var btnNext = $('[data-promo-next]', root);

    var idx = 0;
    var autoplayTimer = null;

    function render(animate){
      var f = data[idx];
      if(!f) return;
      var theme = PROMO_THEMES[idx % PROMO_THEMES.length];

      // apply theme to root via CSS vars
      root.style.setProperty('--slide-c', theme.c);
      root.style.setProperty('--slide-rgb', theme.rgb);

      if(animate && slide) slide.classList.add('swap');
      setTimeout(function(){
        if(f.image){
          elImg.src = f.image;
          elImg.alt = f.name;
          elFb.style.display = 'none';
          elImg.style.display = '';
          elImg.onerror = function(){
            elImg.style.display='none';
            elFb.style.display='';
            elFb.textContent = (f.name||'').replace(/ /g,'\n');
          };
        }else{
          elImg.removeAttribute('src');
          elImg.style.display = 'none';
          elFb.style.display = '';
          elFb.textContent = (f.name||'').replace(/ /g,'\n');
        }
        if(slide) slide.classList.remove('swap');
      }, animate ? 200 : 0);

      elEyebrow.textContent = theme.label;
      elName.textContent = f.name || '';
      elSci.textContent = f.scientific || '';
      elSummary.textContent = f.summary || '';
      elPrice.textContent = f.price || '';
      elTank.textContent = f.tank || '—';
      elSize.textContent = f.maxSize || '—';
      elCare.textContent = f.care || '—';

      $$('.promo-dot', elDots).forEach(function(d,i){ d.classList.toggle('is-active', i===idx) });
    }

    function next(){ idx = (idx+1) % data.length; render(true); resetAutoplay(); }
    function prev(){ idx = (idx-1+data.length) % data.length; render(true); resetAutoplay(); }
    function resetAutoplay(){
      if(autoplayTimer) clearInterval(autoplayTimer);
      autoplayTimer = setInterval(function(){ idx = (idx+1) % data.length; render(true); }, 7500);
    }

    elDots.innerHTML = '';
    data.forEach(function(_,i){
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'promo-dot';
      d.setAttribute('aria-label', 'Promo slide '+(i+1));
      d.addEventListener('click', function(){ idx = i; render(true); resetAutoplay(); });
      elDots.appendChild(d);
    });

    if(btnPrev) btnPrev.addEventListener('click', prev);
    if(btnNext) btnNext.addEventListener('click', next);

    var sx=0;
    if(slide){
      slide.addEventListener('touchstart', function(e){ sx=e.touches[0].clientX; }, {passive:true});
      slide.addEventListener('touchend', function(e){
        var dx = e.changedTouches[0].clientX - sx;
        if(Math.abs(dx)>40){ if(dx<0) next(); else prev(); }
      }, {passive:true});
    }

    root.addEventListener('mouseenter', function(){ if(autoplayTimer){ clearInterval(autoplayTimer); autoplayTimer=null; } });
    root.addEventListener('mouseleave', function(){ resetAutoplay(); });

    render(false);
    resetAutoplay();
  }
  initPromo();

  /* ─── NEWSLETTER (no-op submit just animates) ─── */
  var nlForm = $('[data-newsletter]');
  if(nlForm){
    nlForm.addEventListener('submit', function(e){
      e.preventDefault();
      var btn = nlForm.querySelector('.btn-primary');
      if(btn) ltcFx.bubbles(btn, {count:18, color:'rgba(214,193,154,.55)'});
      var input = nlForm.querySelector('input');
      if(input){ input.value=''; input.placeholder='Thanks — you\'re on the list.'; }
    });
  }

  /* ─────────────────────────────────────────────────────────
     DRY GOODS — sticky sidebar (kept from v0.24)
     ───────────────────────────────────────────────────────── */
  var CAT_LABELS = {
    'all':'All gear','lights':'Lighting','pumps':'Pumps & Flow','skimmers':'Skimmers',
    'rodi':'RO/DI','heaters':'Heaters','salt':'Salt & Mix','additives':'Chemistry',
    'testing':'Testing','food':'Foods & Frozen','accessories':'Accessories'
  };
  var CAT_ICONS = {
    'all':      '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18"/></svg>',
    'lights':   '<svg viewBox="0 0 24 24"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 4 12.7c-.8.7-1 1.3-1 2.3H9c0-1-.2-1.6-1-2.3A7 7 0 0 1 12 2z"/></svg>',
    'pumps':    '<svg viewBox="0 0 24 24"><path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0 4 3 6 0"/><path d="M2 18c2-3 4-3 6 0s4 3 6 0 4-3 6 0 4 3 6 0"/></svg>',
    'skimmers': '<svg viewBox="0 0 24 24"><path d="M5 4h14v6a7 7 0 0 1-14 0V4z"/><circle cx="9" cy="11" r="1"/><circle cx="14" cy="9" r="1"/><circle cx="13" cy="13" r="1"/><path d="M5 20h14"/></svg>',
    'rodi':     '<svg viewBox="0 0 24 24"><path d="M12 2v6M9 5l3-3 3 3"/><path d="M5 11h14v9H5z"/><path d="M5 15h14"/></svg>',
    'heaters':  '<svg viewBox="0 0 24 24"><path d="M9 2v8a3 3 0 1 0 6 0V2"/><circle cx="12" cy="18" r="3"/></svg>',
    'salt':     '<svg viewBox="0 0 24 24"><path d="M5 3h14l-2 18H7L5 3z"/><path d="M5 8h14"/></svg>',
    'additives':'<svg viewBox="0 0 24 24"><path d="M10 2v6L5 18a3 3 0 0 0 3 4h8a3 3 0 0 0 3-4l-5-10V2"/><path d="M8 2h8"/></svg>',
    'testing':  '<svg viewBox="0 0 24 24"><path d="M9 2h6v8l3 8a2 2 0 0 1-2 3H8a2 2 0 0 1-2-3l3-8V2z"/><path d="M9 2h6"/></svg>',
    'food':     '<svg viewBox="0 0 24 24"><path d="M3 11c0-5 4-9 9-9s9 4 9 9-4 9-9 9-9-4-9-9z"/><path d="M8 13c1.5 1 2.5 1 4 0s2.5-1 4 0"/></svg>',
    'accessories':'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>'
  };
  var CAT_COLOR = {
    'all':       {c:'#d6c19a', line:'rgba(214,193,154,.4)', glow:'rgba(214,193,154,.12)'},
    'lights':    {c:'#ffcb5e', line:'rgba(255,203,94,.4)',  glow:'rgba(255,203,94,.12)'},
    'pumps':     {c:'#a8c8a4', line:'rgba(168,200,164,.4)', glow:'rgba(168,200,164,.12)'},
    'skimmers':  {c:'#e6d8b8', line:'rgba(230,216,184,.4)', glow:'rgba(230,216,184,.12)'},
    'rodi':      {c:'#94d4d8', line:'rgba(148,212,216,.4)', glow:'rgba(148,212,216,.12)'},
    'heaters':   {c:'#ff8a78', line:'rgba(255,138,120,.4)', glow:'rgba(255,138,120,.12)'},
    'salt':      {c:'#d6c19a', line:'rgba(214,193,154,.4)', glow:'rgba(214,193,154,.12)'},
    'additives': {c:'#c8b2ff', line:'rgba(200,178,255,.4)', glow:'rgba(200,178,255,.12)'},
    'testing':   {c:'#b8e860', line:'rgba(184,232,96,.4)',  glow:'rgba(184,232,96,.12)'},
    'food':      {c:'#ffa850', line:'rgba(255,168,80,.4)',  glow:'rgba(255,168,80,.12)'},
    'accessories':{c:'#c4a060',line:'rgba(196,160,96,.4)',  glow:'rgba(196,160,96,.12)'}
  };
  var CAT_INTRO = {
    'all':"The full dry-goods catalog. Lighting, flow, skimming, RO/DI, salt, additives, testing, food, and the everyday accessories that keep tanks running. Pick a department on the left or search above to narrow it down.",
    'lights':"Lighting drives both coral growth and color, and most reef problems trace back to picking the wrong fixture for what you're keeping. We stock the lights we'd actually run on our own systems — Kessil for shimmer, AI Hydra and Blade for tunable control, plus a value lane for budget builds that still want app dimming.",
    'pumps':"Return pumps, powerheads, and wavemakers — the gear that keeps water moving and oxygen levels up. A failed return is a midnight phone call you don't want, so this is the part we'd never go cheap on. EcoTech, Sicce, and Jebao cover the range from premium to value-reliable.",
    'skimmers':"Protein skimmers strip dissolved organics out of the water before they break down into nitrate. For most reef builds the skimmer is the single most important piece of filtration, and a quiet, easy-to-tune one will save you a hundred small headaches. Reef Octopus is the workhorse line we point most customers at first.",
    'rodi':"Reverse-osmosis water is non-negotiable for reef. Tap water carries phosphates, silicates, and metals that fuel algae and stress corals — a 4 or 5-stage RO/DI unit makes that go away. We carry membranes, replacement cartridges, and the small stuff like TDS meters and float valves to round out a build.",
    'heaters':"Heaters and temperature controllers. Tank temp swings are a bigger killer than people think, especially in upstate winters. A reliable heater plus a dedicated controller (instead of trusting the heater's own thermostat) is the setup we recommend on every freshwater and saltwater build over 30 gallons.",
    'salt':"The mix you choose sets your alk, calcium, and magnesium baseline before you ever dose anything. We stock the brands the shop's own systems run on — Fritz RPM is the daily driver, Brightwell NeoMarine for the Brightwell-method folks, and Aquaforest for high-end SPS keepers who want the trace mix dialed in.",
    'additives':"Two-part calcium/alkalinity, trace elements, bacteria starters, and the stability dosers you actually need (not the dozen you don't). Brightwell Reef Code, Seachem Prime, Microbacter — the staples that move first and the niche stuff for keepers who know what they're doing.",
    'testing':"You can't dose what you can't measure. Salifert and Hanna are the kits we use in the shop, plus refills, calibration fluid, and the consumables that nobody tells you about until you run out at the wrong moment.",
    'food':"Frozen, pellet, flake, and coral food. The stuff in this department is what's in the shop's own freezer right now — Hikari mysis, LRS Reef Frenzy, NLS pellets, Reef-Roids for LPS, and Two Little Fishies nori sheets for grazing tangs. We feed what we sell.",
    'accessories':"The everyday stuff that doesn't fit anywhere else — algae scrapers, mag floats, frag racks, turkey basters, mesh nets, replacement tubing, and the small parts that always seem to be the thing you suddenly need at 9pm. Cheap to stock, expensive when you don't have it."
  };

  function initDryGoods(){
    var root = $('[data-drygoods]');
    if(!root) return;
    var data = window.LTC_DRYGOODS || [];
    if(!data.length) return;

    var grid = $('[data-dg-grid]', root);
    var rail = $('[data-dg-rail]', root);
    var meta = $('[data-dg-meta]', root);
    var search = $('[data-dg-search]', root);
    var sort = $('[data-dg-sort]', root);
    var crumbs = $('[data-dg-crumbs]', root);
    var catTitle = $('[data-dg-cat-title]', root);
    var catIntro = $('[data-dg-cat-intro]', root);
    var catIcon = $('[data-dg-cat-icon]', root);
    var catCnt = $('[data-dg-cat-cnt]', root);
    var catHead = $('[data-dg-cat-head]', root);
    var homeSection = $('[data-dg-home]', root);

    var ORDER = ['all','lights','pumps','skimmers','rodi','heaters','salt','additives','testing','food','accessories'];
    var state = { cat:'all', q:'', sort:'featured' };

    function buildSidebar(){
      var counts = {};
      data.forEach(function(p){ counts[p.category]=(counts[p.category]||0)+1 });
      counts.all = data.length;
      rail.innerHTML = '';
      ORDER.forEach(function(c){
        if(c!=='all' && !counts[c]) return;
        var col = CAT_COLOR[c] || CAT_COLOR.all;
        var b = document.createElement('button');
        b.type='button';
        b.className = 'dg-side-link'+(state.cat===c?' is-active':'');
        b.dataset.cat = c;
        b.style.setProperty('--dgc', col.c);
        b.style.setProperty('--dgc-line', col.line);
        b.innerHTML = (CAT_ICONS[c]||'')+'<span class="label">'+(CAT_LABELS[c]||c)+'</span><span class="cnt">'+(counts[c]||0)+'</span>';
        b.addEventListener('click', function(){
          state.cat = c;
          $$('.dg-side-link', rail).forEach(function(p){
            p.classList.toggle('is-active', p.dataset.cat===c);
          });
          render();
          if(window.innerWidth < 960 && catHead) catHead.scrollIntoView({behavior:'smooth', block:'start'});
        });
        rail.appendChild(b);
      });
    }

    function filtered(){
      var q = state.q.trim().toLowerCase();
      var out = data.filter(function(p){
        if(state.cat!=='all' && p.category!==state.cat) return false;
        if(!q) return true;
        var hay = (p.name+' '+p.brand+' '+(p.summary||'')+' '+(p.tags||[]).join(' ')).toLowerCase();
        return hay.indexOf(q)>=0;
      });
      if(state.sort==='name') out.sort(function(a,b){return (a.name||'').localeCompare(b.name||'')});
      else if(state.sort==='brand') out.sort(function(a,b){return (a.brand||'').localeCompare(b.brand||'')});
      else if(state.sort==='price-low') out.sort(function(a,b){return (a.price||0)-(b.price||0)});
      else if(state.sort==='price-high') out.sort(function(a,b){return (b.price||0)-(a.price||0)});
      return out;
    }

    function card(p){
      var col = CAT_COLOR[p.category] || CAT_COLOR.all;
      var btn = document.createElement('a');
      btn.href = 'dg-product.html?slug=' + encodeURIComponent(p.slug);
      btn.className='dg-card';
      btn.dataset.slug = p.slug;
      var artHtml;
      if(p.img){
        artHtml =
          '<div class="dg-card-art">'+
            (p.badge ? '<span class="dg-card-badge">'+p.badge+'</span>' : '')+
            '<img src="'+p.img+'" alt="'+(p.name||'').replace(/"/g,'&quot;')+'" loading="lazy">'+
          '</div>';
      }else{
        var bigIcon = (CAT_ICONS[p.category]||'').replace('<svg', '<svg class="dg-fba-bigicon"');
        artHtml =
          '<div class="dg-card-art has-fallback" style="--fba-c:'+col.c+';--fba-glow:'+col.glow+'">'+
            (p.badge ? '<span class="dg-card-badge">'+p.badge+'</span>' : '')+
            bigIcon+
            '<div class="dg-fba-brand">'+(p.brand||'')+'</div>'+
            '<div class="dg-fba-name">'+(p.name||'')+'</div>'+
            (p.tagline ? '<div class="dg-fba-tagline">'+p.tagline+'</div>' : '')+
          '</div>';
      }
      btn.innerHTML = artHtml+
        '<div class="dg-card-body">'+
          '<div class="dg-card-brand">'+(p.brand||'')+'</div>'+
          '<div class="dg-card-name">'+(p.name||'')+'</div>'+
          '<div class="dg-card-spec">'+(p.spec||'')+'</div>'+
          '<div class="dg-card-foot"><span class="dg-card-price">'+(p.priceLabel||p.price||'In stock')+'</span></div>'+
        '</div>'+
        '<button class="dg-quickview" type="button" aria-label="Quick view" data-quickview="'+p.slug+'">'+
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>'+
          '<span>Quick view</span>'+
        '</button>';
      btn.style.setProperty('--cc', col.c);
      btn.style.setProperty('--cc-line', col.line);
      // Quick view button → modal (escape hatch). Stop the click from following the anchor.
      btn.addEventListener('click', function(e){
        var qv = e.target.closest('[data-quickview]');
        if(qv){
          // Quick view button → always modal
          e.preventDefault();
          e.stopPropagation();
          if(window.ltcFx && window.ltcFx.cardPopAndJostle){
            window.ltcFx.cardPopAndJostle(btn, { color: col.glow || 'rgba(214,193,154,.55)' });
          }
          if(window.openDryGoodsModalViaMode) window.openDryGoodsModalViaMode(p, true);
          else openModal(p);
          return;
        }
        // Card body click → respects view mode
        if(window.LTC_VIEW_MODE === 'popup'){
          e.preventDefault();
          if(window.ltcFx && window.ltcFx.cardPopAndJostle){
            window.ltcFx.cardPopAndJostle(btn, { color: col.glow || 'rgba(214,193,154,.55)' });
          }
          if(window.openDryGoodsModalViaMode) window.openDryGoodsModalViaMode(p, false);
          else openModal(p);
        }
        // Otherwise the anchor follows naturally to dg-product.html
      });
      return btn;
    }

    function render(){
      var c = state.cat;
      var col = CAT_COLOR[c] || CAT_COLOR.all;
      var label = CAT_LABELS[c] || c;
      var intro = CAT_INTRO[c] || '';

      // Toggle between home mode (beginner hero + essentials) and category mode
      var isHome = (c === 'all' && !state.q);
      if(homeSection) homeSection.style.display = isHome ? '' : 'none';
      if(catHead) catHead.style.display = isHome ? 'none' : '';

      crumbs.innerHTML = '<a href="index.html">Home</a><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg><a href="dry-goods.html">Dry Goods</a>'+(c!=='all' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg><strong>'+label+'</strong>' : '');

      if(catHead){
        catHead.style.setProperty('--cat-color', col.c);
        catHead.style.setProperty('--cat-line', col.line);
        catHead.style.setProperty('--cat-glow', col.glow);
      }
      if(catIcon) catIcon.innerHTML = CAT_ICONS[c]||'';
      if(catTitle) catTitle.textContent = label;
      if(catIntro) catIntro.textContent = intro;

      var list = filtered();
      if(catCnt) catCnt.textContent = list.length+' '+(list.length===1?'item':'items')+(c!=='all'?' in this department':'');

      // Mark grid as re-render after first paint so subsequent renders use quick fade
      if(grid.dataset.painted === '1'){
        grid.classList.add('is-rerender');
      }
      grid.dataset.painted = '1';
      // Atomic swap — no empty intermediate state
      if(!list.length){
        var emptyEl = document.createElement('div');
        emptyEl.className = 'dg-empty';
        emptyEl.innerHTML = '<strong>Nothing matches that filter.</strong>Try clearing your search or pick another department on the left.';
        grid.replaceChildren(emptyEl);
      } else {
        var cardEls = list.map(card);
        grid.replaceChildren.apply(grid, cardEls);
      }
      meta.innerHTML = 'Showing <strong>'+list.length+'</strong> of '+data.length+' total';
    }

    if(search) search.addEventListener('input', function(){ state.q = search.value; render(); });
    if(sort) sort.addEventListener('change', function(){ state.sort = sort.value; render(); });

    buildSidebar();
    render();
  }

  /* ─── PRODUCT MODAL — enriched v0.26 ─── */
  var CAT_TONE = {
    lights:'tone-amber', pumps:'tone-sage', skimmers:'tone-cyan', rodi:'tone-cyan',
    heaters:'tone-coral', salt:'tone-champagne', additives:'tone-purple',
    testing:'tone-lime', food:'tone-amber', accessories:'tone-rose'
  };

  /* ============================================================
     v0.38 — VIEW MODE SYSTEM
     Architecture split:
     - detailContentDryGoods(p) returns inner body HTML only
     - detailContentCoral(c) same for coral
     - renderAsModal(html, opts) wraps in modal chrome + portal mount
     - renderAsPage(html, opts) sets innerHTML on a page shell
     - wireUpDetail(root, item, type) attaches shared event handlers
     - LTC_VIEW_MODE reads localStorage, forced to popup in kiosk
     - History pushState for modal open/close in popup mode
     ============================================================ */

  // View mode store
  window.LTC_VIEW_MODE = (function(){
    try {
      var params = new URLSearchParams(window.location.search);
      if(params.get('kiosk') === '1'){
        document.documentElement.classList.add('is-kiosk');
        return 'popup';
      }
      var stored = localStorage.getItem('ltc-view-mode');
      return stored === 'popup' ? 'popup' : 'page';
    } catch(e){ return 'page'; }
  })();

  function setViewMode(mode){
    if(mode !== 'popup' && mode !== 'page') return;
    if(document.documentElement.classList.contains('is-kiosk')) return; // kiosk locked
    window.LTC_VIEW_MODE = mode;
    try { localStorage.setItem('ltc-view-mode', mode); } catch(e){}
    // Repaint toggle pill
    var pill = document.querySelector('[data-view-mode-pill]');
    if(pill){
      pill.dataset.mode = mode;
      var label = pill.querySelector('[data-view-mode-label]');
      if(label) label.textContent = mode === 'popup' ? 'Quick view' : 'Detailed view';
    }
  }
  window.LTC_SET_VIEW_MODE = setViewMode;

  // Modal stack — for nested overlays + history management
  var modalStack = [];
  window.LTC_MODAL_STACK = modalStack;

  // Build the dry goods detail body (content only, no chrome)
  function detailContentDryGoods(p){
    var col = (typeof CAT_COLOR !== 'undefined' && CAT_COLOR[p.category]) || {c:'#d6c19a', line:'rgba(214,193,154,.4)', glow:'rgba(214,193,154,.15)'};
    var tone = CAT_TONE[p.category] || 'tone-champagne';
    var catLabel = (typeof CAT_LABELS !== 'undefined' && CAT_LABELS[p.category]) || p.category || '';

    var artHtml;
    if(p.img){
      artHtml = '<div class="modal-art"><img src="'+p.img+'" alt="'+(p.name||'').replace(/"/g,'&quot;')+'"></div>';
    }else{
      var bigIcon = (CAT_ICONS[p.category]||'').replace('<svg', '<svg class="mfa-bigicon"');
      artHtml =
        '<div class="modal-art has-fallback" style="--fba-c:'+col.c+';--fba-glow:'+col.glow+'">'+
          bigIcon+
          '<div class="mfa-brand">'+(p.brand||'')+'</div>'+
          '<div class="mfa-name">'+(p.name||'')+'</div>'+
          (p.tagline ? '<div class="mfa-tagline">'+p.tagline+'</div>' : '')+
        '</div>';
    }

    var specsHtml = '';
    if(p.specs && p.specs.length){
      specsHtml = '<div class="specs">'+
        p.specs.map(function(s){
          return '<div class="spec"><span>'+s.label+'</span><strong>'+s.value+'</strong></div>';
        }).join('')+
      '</div>';
    }else if(p.spec){
      specsHtml = '<div class="specs"><div class="spec"><span>Spec</span><strong>'+p.spec+'</strong></div></div>';
    }

    var diffHtml = '';
    if(p.difficulty){
      var SETUP_CATS = ['lights','pumps','skimmers','rodi','heaters'];
      var isSetup = SETUP_CATS.indexOf(p.category) >= 0;
      var meterLabel = isSetup ? 'Setup level' : 'Ease of use';
      var diffLabels = isSetup
        ? ['','Plug & play','Easy install','Standard','Plumbed','Pro install']
        : ['','Effortless','Simple','Routine','Involved','Two-part / advanced'];
      var lvl = Math.max(1, Math.min(5, p.difficulty));
      var dots = '';
      for(var i=1;i<=5;i++){
        dots += '<div class="modal-diff-dot'+(i<=lvl?' is-on':'')+'"></div>';
      }
      diffHtml =
        '<div class="modal-difficulty">'+
          '<span class="modal-diff-label">'+meterLabel+'</span>'+
          '<div class="modal-diff-bar">'+dots+'</div>'+
          '<span class="modal-diff-text">'+diffLabels[lvl]+'</span>'+
        '</div>';
    }

    var calcLink = (function(){
      var calcTarget = (window.LTC_PRODUCT_TO_CALC && window.LTC_PRODUCT_TO_CALC(p)) || null;
      if(!calcTarget) return '';
      return '<a class="modal-calc-link" href="tools.html'+calcTarget.anchor+'">'+
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M16 15h0"/></svg>'+
        '<div><strong>'+calcTarget.label+'</strong><span>'+calcTarget.sub+'</span></div>'+
        '<svg class="mcl-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>'+
      '</a>';
    })();

    return (
      '<div class="modal-body" data-detail-type="drygoods" data-detail-slug="'+p.slug+'">'+
        artHtml+
        '<div class="modal-info '+tone+'">'+
          '<div class="brand">'+(p.brand||'')+'</div>'+
          '<h2>'+(p.name||'')+'</h2>'+
          (p.tagline ? '<div class="modal-tagline">'+p.tagline+'</div>' : '')+
          (p.whatItIs ? '<div class="modal-what"><div class="modal-what-label">What it is</div><div class="modal-what-text">'+p.whatItIs+'</div></div>' : '')+
          (p.whyYouNeed ? '<div class="modal-why"><div class="modal-why-label">Why you need it</div><div class="modal-why-text">'+p.whyYouNeed+'</div></div>' : '')+
          specsHtml+
          diffHtml+
          '<div class="modal-price-row">'+
            '<div><span class="price">'+(p.priceLabel||p.price||'In stock')+'</span><span class="price-sub">Shop price</span></div>'+
            '<span class="stock"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>In stock</span>'+
          '</div>'+
          '<div class="qty-row">'+
            '<span class="qty-label">Qty</span>'+
            '<div class="qty-picker">'+
              '<button class="qty-btn minus" type="button" data-qty-minus disabled>−</button>'+
              '<span class="qty-num" data-qty-num>1</span>'+
              '<button class="qty-btn plus" type="button" data-qty-plus>+</button>'+
            '</div>'+
          '</div>'+
          '<div class="modal-actions">'+
            '<button class="btn btn-primary" type="button" data-celebrate data-qty-add>'+
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h2l2 13h12l2-9H6"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg>'+
              'Add to list'+
            '</button>'+
            '<button class="btn btn-secondary" type="button" data-modal-close>Keep browsing</button>'+
          '</div>'+
          calcLink+
        '</div>'+
      '</div>'
    );
  }
  window.detailContentDryGoods = detailContentDryGoods;

  // Wire shared event handlers (qty picker, add-to-list, close buttons)
  function wireUpDryGoodsDetail(root, p){
    var col = (typeof CAT_COLOR !== 'undefined' && CAT_COLOR[p.category]) || {c:'#d6c19a'};
    var qty = 1;
    var qtyNum = root.querySelector('[data-qty-num]');
    var qtyMinus = root.querySelector('[data-qty-minus]');
    var qtyPlus = root.querySelector('[data-qty-plus]');
    if(qtyNum && qtyMinus && qtyPlus){
      function updateQty(){
        qtyNum.textContent = String(qty);
        qtyMinus.disabled = qty <= 1;
      }
      qtyMinus.addEventListener('click', function(){ if(qty>1){ qty--; updateQty(); if(window.ltcFx) ltcFx.jelly(qtyNum); } });
      qtyPlus.addEventListener('click', function(){ qty++; updateQty(); if(window.ltcFx) ltcFx.jelly(qtyNum); });
    }
    var addBtn = root.querySelector('[data-qty-add]');
    if(addBtn){
      addBtn.addEventListener('click', function(){
        var cssCol = col.c || '#d6c19a';
        var rgb = cssCol.replace(/^#/,'').match(/.{2}/g).map(function(h){return parseInt(h,16)}).join(',');
        if(window.ltcFx && window.ltcFx.bubbles) ltcFx.bubbles(addBtn, {count:22, color:'rgba('+rgb+',.6)'});
        setTimeout(function(){
          addBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.6"><path d="M5 12l5 5L20 7"/></svg>Added ('+qty+')';
        }, 150);
      });
    }
  }
  window.wireUpDryGoodsDetail = wireUpDryGoodsDetail;

  // Render content as a modal — wraps in backdrop, mounts portal, pushes history
  function renderAsModal(content, opts){
    opts = opts || {};
    var bd = document.createElement('div');
    bd.className = 'modal-backdrop is-open';
    bd.id = opts.id || ('ltc-modal-' + Date.now());
    bd.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true">'+
        '<div class="modal-header">'+
          '<strong>'+(opts.title || 'Details')+'</strong>'+
          '<button class="modal-close" type="button" aria-label="Close">×</button>'+
        '</div>'+
        content+
      '</div>';
    document.body.appendChild(bd);
    document.body.style.overflow = 'hidden';

    // Push history so back button closes the modal
    if(opts.href && window.history && window.history.pushState){
      try {
        window.history.pushState({modal: bd.id, item: opts.item}, '', opts.href);
      } catch(e){}
    }

    // Push onto stack
    modalStack.push({el: bd, id: bd.id, href: opts.href, onClose: opts.onClose});

    function closeThis(fromPopstate){
      if(!bd.parentNode) return;
      bd.remove();
      // Pop from stack
      var idx = modalStack.findIndex(function(s){ return s.id === bd.id });
      if(idx >= 0) modalStack.splice(idx, 1);
      if(modalStack.length === 0) document.body.style.overflow = '';
      // If closing via UI (not popstate), pop history so URL returns to list
      if(!fromPopstate && opts.href && window.history){
        try { window.history.back(); } catch(e){}
      }
      if(typeof opts.onClose === 'function') opts.onClose();
    }

    bd.addEventListener('click', function(e){
      if(e.target === bd || e.target.closest('.modal-close') || e.target.closest('[data-modal-close]')){
        closeThis(false);
      }
    });
    function escHandler(e){
      if(e.key === 'Escape'){
        closeThis(false);
        document.removeEventListener('keydown', escHandler);
      }
    }
    document.addEventListener('keydown', escHandler);

    // Expose close on the element so popstate handler can find it
    bd._ltcClose = function(){ closeThis(true); };

    return bd;
  }
  window.renderAsModal = renderAsModal;

  // Render content as a full-page body — sets innerHTML on a container
  function renderAsPage(content, opts){
    opts = opts || {};
    var container = opts.container || document.querySelector('[data-product-page]');
    if(!container) return null;
    container.innerHTML = content;
    if(opts.title) document.title = opts.title;
    return container;
  }
  window.renderAsPage = renderAsPage;

  // Popstate: browser back closes topmost modal
  window.addEventListener('popstate', function(e){
    if(modalStack.length > 0){
      var top = modalStack[modalStack.length - 1];
      if(top && top.el && top.el._ltcClose){
        top.el._ltcClose();
      }
    }
  });

  function openModal(p){
    closeModal();
    var col = (typeof CAT_COLOR !== 'undefined' && CAT_COLOR[p.category]) || {c:'#d6c19a', line:'rgba(214,193,154,.4)', glow:'rgba(214,193,154,.15)'};
    var tone = CAT_TONE[p.category] || 'tone-champagne';
    var catLabel = (typeof CAT_LABELS !== 'undefined' && CAT_LABELS[p.category]) || p.category || '';

    var artHtml;
    if(p.img){
      artHtml = '<div class="modal-art"><img src="'+p.img+'" alt="'+(p.name||'').replace(/"/g,'&quot;')+'"></div>';
    }else{
      var bigIcon = (CAT_ICONS[p.category]||'').replace('<svg', '<svg class="mfa-bigicon"');
      artHtml =
        '<div class="modal-art has-fallback" style="--fba-c:'+col.c+';--fba-glow:'+col.glow+'">'+
          bigIcon+
          '<div class="mfa-brand">'+(p.brand||'')+'</div>'+
          '<div class="mfa-name">'+(p.name||'')+'</div>'+
          (p.tagline ? '<div class="mfa-tagline">'+p.tagline+'</div>' : '')+
        '</div>';
    }

    var specsHtml = '';
    if(p.specs && p.specs.length){
      specsHtml = '<div class="specs">'+
        p.specs.map(function(s){
          return '<div class="spec"><span>'+s.label+'</span><strong>'+s.value+'</strong></div>';
        }).join('')+
      '</div>';
    }else if(p.spec){
      specsHtml = '<div class="specs"><div class="spec"><span>Spec</span><strong>'+p.spec+'</strong></div></div>';
    }

    var diffHtml = '';
    if(p.difficulty){
      // Setup level for install gear, ease of use for consumables/scoop products
      var SETUP_CATS = ['lights','pumps','skimmers','rodi','heaters'];
      var isSetup = SETUP_CATS.indexOf(p.category) >= 0;
      var meterLabel = isSetup ? 'Setup level' : 'Ease of use';
      var diffLabels = isSetup
        ? ['','Plug & play','Easy install','Standard','Plumbed','Pro install']
        : ['','Effortless','Simple','Routine','Involved','Two-part / advanced'];
      var lvl = Math.max(1, Math.min(5, p.difficulty));
      var dots = '';
      for(var i=1;i<=5;i++){
        dots += '<div class="modal-diff-dot'+(i<=lvl?' is-on':'')+'"></div>';
      }
      diffHtml =
        '<div class="modal-difficulty">'+
          '<span class="modal-diff-label">'+meterLabel+'</span>'+
          '<div class="modal-diff-bar">'+dots+'</div>'+
          '<span class="modal-diff-text">'+diffLabels[lvl]+'</span>'+
        '</div>';
    }

    var bd = document.createElement('div');
    bd.className = 'modal-backdrop is-open';
    bd.id = 'ltc-modal';
    bd.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true">'+
        '<div class="modal-header">'+
          '<strong>'+(p.brand||'Product')+' &middot; '+catLabel+'</strong>'+
          '<button class="modal-close" type="button" aria-label="Close">×</button>'+
        '</div>'+
        '<div class="modal-body">'+
          artHtml+
          '<div class="modal-info '+tone+'">'+
            '<div class="brand">'+(p.brand||'')+'</div>'+
            '<h2>'+(p.name||'')+'</h2>'+
            (p.tagline ? '<div class="modal-tagline">'+p.tagline+'</div>' : '')+
            (p.whatItIs ? '<div class="modal-what"><div class="modal-what-label">What it is</div><div class="modal-what-text">'+p.whatItIs+'</div></div>' : '')+
            (p.whyYouNeed ? '<div class="modal-why"><div class="modal-why-label">Why you need it</div><div class="modal-why-text">'+p.whyYouNeed+'</div></div>' : '')+
            specsHtml+
            diffHtml+
            '<div class="modal-price-row">'+
              '<div><span class="price">'+(p.priceLabel||p.price||'In stock')+'</span><span class="price-sub">Shop price</span></div>'+
              '<span class="stock"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>In stock</span>'+
            '</div>'+
            '<div class="qty-row">'+
              '<span class="qty-label">Qty</span>'+
              '<div class="qty-picker">'+
                '<button class="qty-btn minus" type="button" data-qty-minus disabled>−</button>'+
                '<span class="qty-num" data-qty-num>1</span>'+
                '<button class="qty-btn plus" type="button" data-qty-plus>+</button>'+
              '</div>'+
            '</div>'+
            '<div class="modal-actions">'+
              '<button class="btn btn-primary" type="button" data-celebrate data-qty-add>'+
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h2l2 13h12l2-9H6"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg>'+
                'Add to list'+
              '</button>'+
              '<button class="btn btn-secondary" type="button" data-modal-close>Keep browsing</button>'+
            '</div>'+
            (function(){
              var calcTarget = (window.LTC_PRODUCT_TO_CALC && window.LTC_PRODUCT_TO_CALC(p)) || null;
              if(!calcTarget) return '';
              return '<a class="modal-calc-link" href="tools.html'+calcTarget.anchor+'">'+
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M16 15h0"/></svg>'+
                '<div><strong>'+calcTarget.label+'</strong><span>'+calcTarget.sub+'</span></div>'+
                '<svg class="mcl-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>'+
              '</a>';
            })()+
          '</div>'+
        '</div>'+
      '</div>';
    document.body.appendChild(bd);
    document.body.style.overflow = 'hidden';

    // qty picker
    var qty = 1;
    var qtyNum = bd.querySelector('[data-qty-num]');
    var qtyMinus = bd.querySelector('[data-qty-minus]');
    var qtyPlus = bd.querySelector('[data-qty-plus]');
    function updateQty(){
      qtyNum.textContent = String(qty);
      qtyMinus.disabled = qty <= 1;
    }
    qtyMinus.addEventListener('click', function(){ if(qty>1){ qty--; updateQty(); ltcFx.jelly(qtyNum); } });
    qtyPlus.addEventListener('click', function(){ qty++; updateQty(); ltcFx.jelly(qtyNum); });

    // add to list
    var addBtn = bd.querySelector('[data-qty-add]');
    if(addBtn){
      addBtn.addEventListener('click', function(){
        var cssCol = col.c;
        var rgb = cssCol.replace(/^#/,'').match(/.{2}/g).map(function(h){return parseInt(h,16)}).join(',');
        ltcFx.bubbles(addBtn, {count:22, color:'rgba('+rgb+',.6)'});
        var txt = addBtn.querySelector('svg') ? addBtn : null;
        setTimeout(function(){
          addBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.6"><path d="M5 12l5 5L20 7"/></svg>Added ('+qty+')';
        }, 150);
      });
    }

    bd.addEventListener('click', function(e){
      if(e.target===bd || e.target.closest('.modal-close') || e.target.closest('[data-modal-close]')){
        closeModal();
      }
    });
    document.addEventListener('keydown', escClose);
  }
  function closeModal(){
    var bd = $('#ltc-modal');
    if(bd){ bd.remove(); document.body.style.overflow=''; }
    document.removeEventListener('keydown', escClose);
  }
  function escClose(e){ if(e.key==='Escape') closeModal(); }
  /* ============================================================
     v0.31 — STORE HOURS ENGINE
     Single source of truth for shop hours, computes "Open now"
     vs "Closed", picks today's row in the visit grid, populates
     util-bar status pill across all pages.
     ============================================================ */
  window.LTC_HOURS = {
    monday:    { closed:true, note:"Maintenance day" },
    tuesday:   { open:11, close:19, note:"Quietest day" },
    wednesday: { open:11, close:19, note:"Quietest day" },
    thursday:  { open:11, close:19, note:"New stock lands" },
    friday:    { open:11, close:19, note:"Quarantine release day" },
    saturday:  { open:11, close:19, note:"Busiest — expect a wait" },
    sunday:    { open:12, close:17, note:"Short day" }
  };
  var DAY_KEYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  var DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var DAY_LABELS_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  function fmtHour(h){
    if(h === 12) return '12 PM';
    if(h === 0)  return '12 AM';
    if(h > 12)   return (h-12)+' PM';
    return h+' AM';
  }
  function fmtRange(o){
    if(!o || o.closed) return 'Closed';
    return fmtHour(o.open)+' – '+fmtHour(o.close);
  }
  function isOpenNow(now){
    var dayKey = DAY_KEYS[now.getDay()];
    var today = window.LTC_HOURS[dayKey];
    if(!today || today.closed) return false;
    var hr = now.getHours() + (now.getMinutes()/60);
    return hr >= today.open && hr < today.close;
  }
  function nextOpenLabel(now){
    // Find the next open day starting from tomorrow
    for(var i=1; i<=7; i++){
      var checkIdx = (now.getDay() + i) % 7;
      var checkKey = DAY_KEYS[checkIdx];
      var checkDay = window.LTC_HOURS[checkKey];
      if(checkDay && !checkDay.closed){
        var label = (i === 1) ? 'tomorrow' : DAY_LABELS_FULL[checkIdx];
        return 'Opens '+label+' '+fmtHour(checkDay.open);
      }
    }
    return 'See hours';
  }

  function paintStoreHours(){
    var now = new Date();
    var todayKey = DAY_KEYS[now.getDay()];
    var today = window.LTC_HOURS[todayKey];
    var open = isOpenNow(now);

    // Util-bar pill on every page
    var bar = document.querySelector('[data-open-status]');
    var barText = document.querySelector('[data-open-text]');
    if(bar && barText){
      if(open){
        bar.classList.add('is-open');
        bar.classList.remove('is-closed');
        barText.textContent = 'Open today · '+fmtRange(today).replace(' – ',' to ').replace(/AM|PM/g,'').trim().replace(/\s+to\s+/, '–');
      } else {
        bar.classList.remove('is-open');
        bar.classList.add('is-closed');
        barText.textContent = 'Closed · '+nextOpenLabel(now);
      }
    }

    // Visit hero card
    var vhcBig = document.querySelector('[data-vhc-big]');
    var vhcSub = document.querySelector('[data-vhc-sub]');
    if(vhcBig && vhcSub){
      if(open){
        vhcBig.textContent = fmtRange(today);
        vhcSub.textContent = DAY_LABELS_FULL[now.getDay()]+' · today';
      } else if(today.closed){
        vhcBig.textContent = 'Closed today';
        vhcSub.textContent = nextOpenLabel(now);
      } else {
        var hr = now.getHours();
        if(hr < today.open){
          vhcBig.textContent = 'Opens '+fmtHour(today.open);
          vhcSub.textContent = 'Today · '+DAY_LABELS_FULL[now.getDay()];
        } else {
          vhcBig.textContent = 'Closed · '+fmtHour(today.close);
          vhcSub.textContent = nextOpenLabel(now);
        }
      }
    }
    // Update vhc-label too
    var vhcLabel = document.querySelector('.vhc-label');
    if(vhcLabel){
      vhcLabel.textContent = open ? 'Open now' : 'Closed';
    }
    var vhcDot = document.querySelector('.vhc-dot');
    if(vhcDot){
      if(!open){
        vhcDot.style.background = 'var(--ink-3)';
        vhcDot.style.boxShadow = 'none';
        vhcDot.style.animation = 'none';
      }
    }

    // Visit hours grid — highlight today, mute closed
    var rows = document.querySelectorAll('.hours-row[data-day]');
    rows.forEach(function(row){
      var d = row.dataset.day;
      var dayDef = window.LTC_HOURS[d];
      row.classList.remove('is-today','is-closed');
      if(dayDef && dayDef.closed){
        row.classList.add('is-closed');
      }
      if(d === todayKey){
        row.classList.add('is-today');
        var note = row.querySelector('.hr-note');
        if(note){
          note.textContent = open ? 'Today · open now' : (today.closed ? 'Today · closed' : 'Today · '+nextOpenLabel(now).toLowerCase());
        }
      } else {
        var noteEl = row.querySelector('.hr-note');
        if(noteEl && noteEl.dataset.noteDefault){
          noteEl.textContent = noteEl.dataset.noteDefault;
        }
      }
    });
  }

  // Run on load + every minute (in case the page sits open across a transition)
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', paintStoreHours);
  } else {
    paintStoreHours();
  }
  setInterval(paintStoreHours, 60000);
  window.paintStoreHours = paintStoreHours;

  window.openModal = openModal;
  window.LTC_DG_CAT_LABELS = CAT_LABELS;
  window.LTC_DG_CAT_ICONS = CAT_ICONS;
  window.LTC_DG_CAT_COLOR = CAT_COLOR;
  window.LTC_DG_CAT_TONE = CAT_TONE;

  initDryGoods();

  /* ============================================================
     v0.27 — CORAL BROWSER (gauges, grid, modal, tabs)
     ============================================================ */

  // Gauge render loop — shared by tank strip + coral modal
  var gaugeDrawFns = [];
  var gaugeRAF = null;

  function startGaugeLoop(){
    if(gaugeRAF) return;
    function loop(now){
      for(var i=0;i<gaugeDrawFns.length;i++){
        if(gaugeDrawFns[i]) gaugeDrawFns[i](now);
      }
      if(gaugeDrawFns.length) gaugeRAF = requestAnimationFrame(loop);
      else gaugeRAF = null;
    }
    gaugeRAF = requestAnimationFrame(loop);
  }

  function clearModalGauges(){
    // Keep only gauges whose canvas is still in the DOM
    gaugeDrawFns = gaugeDrawFns.filter(function(fn){
      return fn.__canvas && document.body.contains(fn.__canvas);
    });
  }

  function createGaugeWaterDraw(canvas, targetPct, staggerMs){
    var ctx = canvas.getContext('2d');
    var W=0,H=0,dpr=1;
    var targetFill = targetPct/100;
    var fillProgress=0,startTime=-1,fillDur=1250;
    var t = Math.random()*200;

    function sizeCanvas(){
      var r = canvas.parentElement.getBoundingClientRect();
      if(r.width < 1) return false;
      dpr = window.devicePixelRatio || 1;
      W = r.width; H = r.height;
      canvas.width = Math.round(W*dpr);
      canvas.height = Math.round(H*dpr);
      return true;
    }
    function ease(x){ return 1-Math.pow(1-x,3) }
    function surfaceY(x, fillX, amplitude){
      var p = fillX>0 ? x/fillX : 0;
      var a = amplitude * (.35 + .65*p);
      return Math.sin(x/50 + t*1.4)*a + Math.sin(x/28 + t*2.6)*a*.6 + Math.sin(x/80 + t*.7)*a*.8;
    }

    function draw(now){
      if(W<1){ if(!sizeCanvas()) return }
      if(startTime<0) startTime = now;
      var el = now - startTime - staggerMs;
      if(el<0) fillProgress = 0;
      else if(el<fillDur) fillProgress = ease(el/fillDur) * targetFill;
      else fillProgress = targetFill;
      t += .025;
      ctx.save();
      ctx.scale(dpr,dpr);
      ctx.clearRect(0,0,W,H);
      var fX = fillProgress * W;
      if(fX<3){ ctx.restore(); return }
      var mY = H*.42, amp = 3.2;

      // deep layer
      ctx.beginPath(); ctx.moveTo(0,H); ctx.lineTo(fX+2,H);
      ctx.lineTo(fX+2, mY+4+Math.sin(t*1.8+2)*3);
      for(var x=fX; x>=0; x-=2) ctx.lineTo(x, mY+3+surfaceY(x,fX,amp*.7)+2);
      ctx.closePath(); ctx.fillStyle='rgba(32,38,45,.55)'; ctx.fill();

      // main water
      ctx.beginPath(); ctx.moveTo(0,H); ctx.lineTo(fX,H);
      var eY = mY + Math.sin(t*1.6)*3 + Math.sin(t*2.9+1)*2;
      ctx.lineTo(fX,eY);
      for(var x=fX; x>=0; x-=2) ctx.lineTo(x, mY+surfaceY(x,fX,amp));
      ctx.closePath(); ctx.fillStyle='rgba(70,78,88,.45)'; ctx.fill();

      // foam crest
      ctx.beginPath();
      var started = false;
      for(var x=0; x<=fX; x+=2){
        var wy = mY+surfaceY(x,fX,amp);
        if(!started){ ctx.moveTo(x,wy); started = true; }
        else ctx.lineTo(x,wy);
      }
      ctx.strokeStyle='rgba(214,193,154,.32)'; ctx.lineWidth=2; ctx.stroke();

      // leading edge glow
      if(fX>8){
        var g = ctx.createRadialGradient(fX,eY,0,fX,eY,16);
        g.addColorStop(0,'rgba(214,193,154,.38)');
        g.addColorStop(.5,'rgba(168,200,164,.18)');
        g.addColorStop(1,'rgba(168,200,164,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(fX,eY,14,0,Math.PI*2); ctx.fill();
      }
      ctx.restore();
    }
    draw.__canvas = canvas;
    return draw;
  }

  function makeGauge(container, paramKey, value, opts){
    opts = opts || {};
    var range = (window.LTC_GAUGE_RANGES || {})[paramKey];
    if(!range) return null;

    var pct = ((value - range.low) / (range.high - range.low)) * 100;
    pct = Math.max(3, Math.min(97, pct));
    var idealLo = ((range.idealLow - range.low) / (range.high - range.low)) * 100;
    var idealHi = ((range.idealHigh - range.low) / (range.high - range.low)) * 100;
    var inIdeal = value >= range.idealLow && value <= range.idealHigh;

    // ── Each gauge gets its own coral marker shape + color ──
    // Different SVG path per parameter so the strip isn't monochrome
    var CORAL_MARKERS = {
      alk:  { name:'torch',    color:'168,200,164', accent:'200,235,180' },  // sage
      cal:  { name:'acro',     color:'255,138,120', accent:'255,180,160' },  // coral
      mag:  { name:'zoa',      color:'200,178,255', accent:'220,200,255' },  // purple
      temp: { name:'chalice',  color:'255,203,94',  accent:'255,225,140' },  // amber
      sal:  { name:'mushroom', color:'148,212,216', accent:'180,230,235' }   // cyan
    };
    var marker = CORAL_MARKERS[paramKey] || CORAL_MARKERS.alk;
    var coralRgb = marker.color;
    var coralAccent = marker.accent;

    // Out-of-ideal: marker shifts to muted champagne warning
    if(!inIdeal){
      coralRgb = '214,193,154';
      coralAccent = '230,215,180';
    }

    var markerColor = 'rgba('+coralRgb+',.55)';
    var valueColor = inIdeal ? 'rgb('+coralRgb+')' : 'var(--acc-champagne)';

    var fmt = parseInt(range.fmt || '1', 10);
    var valueStr = parseFloat(value).toFixed(fmt);
    var lowLabel = parseFloat(range.low).toFixed(fmt);
    var highLabel = parseFloat(range.high).toFixed(fmt);
    var ideaLoStr = parseFloat(range.idealLow).toFixed(fmt);
    var ideaHiStr = parseFloat(range.idealHigh).toFixed(fmt);

    // Track gradient highlights ideal zone in the marker's color (toned)
    var trackStyle =
      '--zone-low:'+Math.max(0,idealLo-10)+'%;'+
      '--zone-low-fade:'+idealLo+'%;'+
      '--zone-ideal-lo:'+(idealLo+1)+'%;'+
      '--zone-ideal-hi:'+(idealHi-1)+'%;'+
      '--zone-high-fade:'+idealHi+'%;'+
      '--zone-high:'+Math.min(100,idealHi+10)+'%;'+
      '--mk-color:'+markerColor+';'+
      '--mk-rgb:'+coralRgb+';'+
      '--mk-accent:'+coralAccent;

    // Coral SVG paths — 5 different shapes for the 5 markers
    var CORAL_SVG = {
      torch:
        '<svg class="gauge-coral gauge-coral-torch" viewBox="0 0 40 44">'+
          '<defs><radialGradient id="tg-'+paramKey+'" cx="50%" cy="50%" r="60%">'+
            '<stop offset="0%" stop-color="rgba('+coralAccent+',.95)"/>'+
            '<stop offset="60%" stop-color="rgba('+coralRgb+',.7)"/>'+
            '<stop offset="100%" stop-color="rgba('+coralRgb+',.25)"/>'+
          '</radialGradient></defs>'+
          // Torch tentacles emanating from a center
          '<g class="gc-tentacles" fill="url(#tg-'+paramKey+')" stroke="rgba('+coralAccent+',.9)" stroke-width="1" stroke-linecap="round">'+
            '<ellipse cx="20" cy="14" rx="3" ry="9"/>'+
            '<ellipse cx="13" cy="17" rx="2.5" ry="8" transform="rotate(-22 13 17)"/>'+
            '<ellipse cx="27" cy="17" rx="2.5" ry="8" transform="rotate(22 27 17)"/>'+
            '<ellipse cx="9" cy="22" rx="2" ry="7" transform="rotate(-42 9 22)"/>'+
            '<ellipse cx="31" cy="22" rx="2" ry="7" transform="rotate(42 31 22)"/>'+
            '<ellipse cx="20" cy="20" rx="3.5" ry="10"/>'+
          '</g>'+
          // Base circle with glow
          '<circle cx="20" cy="32" r="6" fill="rgba('+coralRgb+',.4)" stroke="rgba('+coralAccent+',.8)" stroke-width="1.2"/>'+
          '<circle cx="20" cy="32" r="2.5" fill="rgba('+coralAccent+',.85)"/>'+
        '</svg>',

      acro:
        '<svg class="gauge-coral gauge-coral-acro" viewBox="0 0 40 44">'+
          '<defs><linearGradient id="ag-'+paramKey+'" x1="50%" y1="0%" x2="50%" y2="100%">'+
            '<stop offset="0%" stop-color="rgba('+coralAccent+',.95)"/>'+
            '<stop offset="100%" stop-color="rgba('+coralRgb+',.5)"/>'+
          '</linearGradient></defs>'+
          // Branching acropora silhouette
          '<g fill="url(#ag-'+paramKey+')" stroke="rgba('+coralAccent+',.9)" stroke-width="1" stroke-linejoin="round">'+
            '<path d="M20 38 L18 25 L13 18 L10 8 L13 14 L16 6 L18 13 L20 4 L22 13 L24 6 L27 14 L30 8 L27 18 L22 25 L20 38 Z"/>'+
          '</g>'+
          // Tip glow dots
          '<circle cx="13" cy="8" r="1.5" fill="rgba('+coralAccent+',.95)"/>'+
          '<circle cx="20" cy="4" r="1.8" fill="rgba('+coralAccent+',.95)"/>'+
          '<circle cx="27" cy="8" r="1.5" fill="rgba('+coralAccent+',.95)"/>'+
          '<circle cx="10" cy="10" r="1.2" fill="rgba('+coralAccent+',.85)"/>'+
          '<circle cx="30" cy="10" r="1.2" fill="rgba('+coralAccent+',.85)"/>'+
        '</svg>',

      zoa:
        '<svg class="gauge-coral gauge-coral-zoa" viewBox="0 0 40 44">'+
          '<defs><radialGradient id="zg-'+paramKey+'" cx="50%" cy="50%" r="60%">'+
            '<stop offset="0%" stop-color="rgba('+coralAccent+',.98)"/>'+
            '<stop offset="55%" stop-color="rgba('+coralRgb+',.7)"/>'+
            '<stop offset="100%" stop-color="rgba('+coralRgb+',.3)"/>'+
          '</radialGradient></defs>'+
          // Cluster of zoa polyps — 4 around 1 center
          '<g stroke="rgba('+coralAccent+',.9)" stroke-width="1.1">'+
            '<circle cx="10" cy="14" r="6" fill="url(#zg-'+paramKey+')"/>'+
            '<circle cx="30" cy="14" r="6" fill="url(#zg-'+paramKey+')"/>'+
            '<circle cx="10" cy="30" r="6" fill="url(#zg-'+paramKey+')"/>'+
            '<circle cx="30" cy="30" r="6" fill="url(#zg-'+paramKey+')"/>'+
            '<circle cx="20" cy="22" r="7.5" fill="url(#zg-'+paramKey+')"/>'+
          '</g>'+
          // Polyp centers
          '<circle cx="10" cy="14" r="1.8" fill="rgba('+coralAccent+',.95)"/>'+
          '<circle cx="30" cy="14" r="1.8" fill="rgba('+coralAccent+',.95)"/>'+
          '<circle cx="10" cy="30" r="1.8" fill="rgba('+coralAccent+',.95)"/>'+
          '<circle cx="30" cy="30" r="1.8" fill="rgba('+coralAccent+',.95)"/>'+
          '<circle cx="20" cy="22" r="2.2" fill="rgba('+coralAccent+',.95)"/>'+
        '</svg>',

      chalice:
        '<svg class="gauge-coral gauge-coral-chalice" viewBox="0 0 40 44">'+
          '<defs><radialGradient id="cg-'+paramKey+'" cx="50%" cy="40%" r="65%">'+
            '<stop offset="0%" stop-color="rgba('+coralAccent+',.98)"/>'+
            '<stop offset="50%" stop-color="rgba('+coralRgb+',.65)"/>'+
            '<stop offset="100%" stop-color="rgba('+coralRgb+',.25)"/>'+
          '</radialGradient></defs>'+
          // Chalice plate with raised eye in center
          '<ellipse cx="20" cy="24" rx="16" ry="11" fill="url(#cg-'+paramKey+')" stroke="rgba('+coralAccent+',.9)" stroke-width="1.2"/>'+
          '<ellipse cx="20" cy="22" rx="9" ry="6" fill="rgba('+coralRgb+',.5)" stroke="rgba('+coralAccent+',.85)" stroke-width="1"/>'+
          '<ellipse cx="20" cy="21" rx="4" ry="3" fill="rgba('+coralAccent+',.95)"/>'+
          '<circle cx="20" cy="20" r="1.5" fill="rgba('+coralRgb+',1)"/>'+
        '</svg>',

      mushroom:
        '<svg class="gauge-coral gauge-coral-mushroom" viewBox="0 0 40 44">'+
          '<defs><radialGradient id="mg-'+paramKey+'" cx="50%" cy="55%" r="60%">'+
            '<stop offset="0%" stop-color="rgba('+coralAccent+',.95)"/>'+
            '<stop offset="60%" stop-color="rgba('+coralRgb+',.65)"/>'+
            '<stop offset="100%" stop-color="rgba('+coralRgb+',.3)"/>'+
          '</radialGradient></defs>'+
          // Mushroom disc with bumpy surface
          '<ellipse cx="20" cy="24" rx="15" ry="12" fill="url(#mg-'+paramKey+')" stroke="rgba('+coralAccent+',.9)" stroke-width="1.2"/>'+
          // Bumps to suggest bouncing texture
          '<circle cx="14" cy="20" r="2" fill="rgba('+coralAccent+',.7)"/>'+
          '<circle cx="20" cy="17" r="2.2" fill="rgba('+coralAccent+',.75)"/>'+
          '<circle cx="26" cy="20" r="2" fill="rgba('+coralAccent+',.7)"/>'+
          '<circle cx="16" cy="26" r="1.8" fill="rgba('+coralAccent+',.65)"/>'+
          '<circle cx="22" cy="27" r="2.2" fill="rgba('+coralAccent+',.7)"/>'+
          '<circle cx="28" cy="25" r="1.6" fill="rgba('+coralAccent+',.65)"/>'+
          '<circle cx="20" cy="22" r="1.2" fill="rgba('+coralAccent+',.95)"/>'+
        '</svg>'
    };
    var coralSvg = CORAL_SVG[marker.name] || CORAL_SVG.torch;

    var gauge = document.createElement('div');
    gauge.className = 'gauge';
    gauge.innerHTML =
      '<div class="gauge-head">'+
        '<span class="gauge-label">'+range.label+'</span>'+
        '<span class="gauge-value" style="--gc:'+valueColor+'">'+valueStr+' <small>'+range.unit+'</small></span>'+
      '</div>'+
      '<div class="gauge-track" style="'+trackStyle+'">'+
        '<canvas></canvas>'+
        '<div class="gauge-marker" style="left:'+pct+'%;--mk-color:'+markerColor+';--mk-rgb:'+coralRgb+'">'+
          '<div class="gauge-ripple"></div>'+
          '<div class="gauge-ripple"></div>'+
          '<div class="gauge-glow"></div>'+
          coralSvg+
        '</div>'+
      '</div>'+
      '<div class="gauge-foot">'+
        '<span>'+lowLabel+'</span>'+
        '<span class="ideal-label">Ideal '+ideaLoStr+'–'+ideaHiStr+'</span>'+
        '<span>'+highLabel+'</span>'+
      '</div>';
    container.appendChild(gauge);

    var canvas = gauge.querySelector('canvas');
    var markerEl = gauge.querySelector('.gauge-marker');
    var stagger = opts.staggerMs || 0;

    setTimeout(function(){ markerEl.classList.add('show') }, stagger + 500);
    var draw = createGaugeWaterDraw(canvas, pct, stagger);
    gaugeDrawFns.push(draw);
    startGaugeLoop();

    // paramLock flash after fill completes
    setTimeout(function(){
      gauge.classList.add('is-locked');
      gauge.style.setProperty('--mk-color', markerColor.replace('.45','.6'));
      setTimeout(function(){ gauge.classList.remove('is-locked') }, 900);
    }, stagger + 1350);

    return gauge;
  }

  // "N hours ago" formatter
  function relativeTime(iso){
    var then = new Date(iso).getTime();
    var now = Date.now();
    var diff = Math.max(0, now - then) / 1000;
    if(diff < 60) return 'just now';
    if(diff < 3600) return Math.round(diff/60) + ' min ago';
    if(diff < 86400) return Math.round(diff/3600) + ' hours ago';
    var d = Math.round(diff/86400);
    return d + (d===1?' day ago':' days ago');
  }

  /* ─── CORAL TAB SWITCHING ─── */
  window.switchCoralMode = function(mode){
    var tabs = $$('.coral-tab');
    tabs.forEach(function(t){
      var isMatch = t.dataset.mode === mode;
      t.classList.toggle('is-active', isMatch);
      t.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });
    var stockPanel = $('[data-mode-stock]');
    var encycPanel = $('[data-mode-encyclopedia]');
    if(stockPanel) stockPanel.hidden = (mode !== 'stock');
    if(encycPanel) encycPanel.hidden = (mode !== 'encyclopedia');
  };

  function initCoralBrowser(){
    var root = $('[data-coral-root]');
    if(!root) return;
    var data = window.LTC_CORALS || [];

    // 1) Tank gauges
    var tankGrid = $('[data-tank-gauges]', root);
    var tankUpdated = $('[data-tank-updated-time]', root);
    var tanks = window.LTC_SHOP_TANKS || {};

    if(tankGrid && tanks.alk != null){
      ['alk','cal','mag','temp','sal'].forEach(function(k, i){
        makeGauge(tankGrid, k, tanks[k], { staggerMs: i * 160 });
      });
    }
    if(tankUpdated && tanks.lastUpdated){
      tankUpdated.textContent = relativeTime(tanks.lastUpdated);
    }

    // 2) Category pills
    var pillRail = $('[data-coral-cat-pills]', root);
    var CORAL_CATS = ['all','SPS','LPS','Soft','Zoa','Mushroom','Anemone','Special'];
    var CORAL_CAT_LABELS = { all:'All', SPS:'SPS', LPS:'LPS', Soft:'Softies', Zoa:'Zoanthids', Mushroom:'Mushrooms', Anemone:'Anemones', Special:'Special' };
    var coralState = { cat:'all', q:'', sort:'featured', care:'all', price:'all' };

    if(pillRail){
      var counts = {};
      data.forEach(function(c){ counts[c.category] = (counts[c.category]||0) + 1 });
      counts.all = data.length;
      CORAL_CATS.forEach(function(cat){
        if(cat !== 'all' && !counts[cat]) return;
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'coral-cat-pill' + (coralState.cat===cat ? ' is-active' : '');
        b.dataset.cat = cat;
        b.innerHTML = (CORAL_CAT_LABELS[cat]||cat) + ' <span class="cnt">'+(counts[cat]||0)+'</span>';
        b.addEventListener('click', function(){
          coralState.cat = cat;
          $$('.coral-cat-pill', pillRail).forEach(function(p){
            p.classList.toggle('is-active', p.dataset.cat === cat);
          });
          renderCoralGrid();
        });
        pillRail.appendChild(b);
      });
    }

    // 3) Search + sort
    var searchInput = $('[data-coral-search]', root);
    var sortSelect = $('[data-coral-sort]', root);
    if(searchInput) searchInput.addEventListener('input', function(){
      coralState.q = searchInput.value; renderCoralGrid();
    });
    if(sortSelect) sortSelect.addEventListener('change', function(){
      coralState.sort = sortSelect.value; renderCoralGrid();
    });
    var careSelect = $('[data-coral-care]', root);
    var priceSelect = $('[data-coral-price]', root);
    if(careSelect) careSelect.addEventListener('change', function(){
      coralState.care = careSelect.value; renderCoralGrid();
    });
    if(priceSelect) priceSelect.addEventListener('change', function(){
      coralState.price = priceSelect.value; renderCoralGrid();
    });

    // 4) Coral grid
    var grid = $('[data-coral-grid]', root);
    var meta = $('[data-coral-meta]', root);

    function filterCorals(){
      var q = coralState.q.trim().toLowerCase();
      var out = data.filter(function(c){
        if(coralState.cat !== 'all' && c.category !== coralState.cat) return false;
        // Care level filter
        if(coralState.care !== 'all'){
          var careLvl = c.care || 1;
          if(coralState.care === 'beginner' && careLvl > 2) return false;
          if(coralState.care === 'intermediate' && (careLvl < 2 || careLvl > 3)) return false;
          if(coralState.care === 'expert' && careLvl < 4) return false;
        }
        // Price range filter
        if(coralState.price !== 'all'){
          var p = c.price || 0;
          if(coralState.price === 'under50' && p >= 50) return false;
          if(coralState.price === '50to100' && (p < 50 || p > 100)) return false;
          if(coralState.price === '100to200' && (p < 100 || p > 200)) return false;
          if(coralState.price === 'over200' && p <= 200) return false;
        }
        if(!q) return true;
        var hay = (c.name+' '+(c.scientific||'')+' '+(c.tags||[]).join(' ')+' '+c.category).toLowerCase();
        return hay.indexOf(q) >= 0;
      });
      if(coralState.sort==='name') out.sort(function(a,b){ return (a.name||'').localeCompare(b.name||'') });
      else if(coralState.sort==='price-low') out.sort(function(a,b){ return (a.price||0)-(b.price||0) });
      else if(coralState.sort==='price-high') out.sort(function(a,b){ return (b.price||0)-(a.price||0) });
      return out;
    }

    function coralCard(c){
      var btn = document.createElement('a');
      btn.href = 'product.html?coral=' + encodeURIComponent(c.slug);
      btn.className = 'coral-card';
      btn.dataset.slug = c.slug;
      var artHtml;
      if(c.img){
        artHtml =
          '<div class="coral-card-art">'+
            (c.badge ? '<span class="coral-card-tag">'+c.badge+'</span>' : '')+
            '<span class="coral-card-wysiwyg">WYSIWYG</span>'+
            '<img src="'+c.img+'" alt="'+(c.name||'').replace(/"/g,'&quot;')+'" loading="lazy">'+
          '</div>';
      }else{
        var coralIcon = '<svg class="cfb-bigicon" viewBox="0 0 24 24"><path d="M12 2c2 2 3 5 3 8s-1 6-3 8c-2-2-3-5-3-8s1-6 3-8z"/><path d="M4 12c2 2 5 3 8 3s6-1 8-3c-2-2-5-3-8-3s-6 1-8 3z"/></svg>';
        artHtml =
          '<div class="coral-card-art has-fallback">'+
            (c.badge ? '<span class="coral-card-tag">'+c.badge+'</span>' : '')+
            '<span class="coral-card-wysiwyg">WYSIWYG</span>'+
            coralIcon+
            '<div class="cfb-text"><strong>'+c.category+'</strong><span>'+(c.name||'')+'</span></div>'+
          '</div>';
      }
      btn.innerHTML = artHtml +
        '<div class="coral-card-body">'+
          '<div class="coral-card-meta">'+c.category+' · '+(c.sourceType||'WYSIWYG')+'</div>'+
          '<div class="coral-card-name">'+(c.name||'')+'</div>'+
          '<div class="coral-card-sci">'+(c.scientific||'')+'</div>'+
          '<div class="coral-card-foot">'+
            '<span class="coral-card-price">'+(c.priceLabel||('$'+(c.price||0)))+'</span>'+
            '<span class="coral-card-heads">'+(c.heads||'')+'</span>'+
          '</div>'+
        '</div>'+
        '<button class="dg-quickview coral-quickview" type="button" aria-label="Quick view" data-coral-quickview="'+c.slug+'">'+
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>'+
          '<span>Quick view</span>'+
        '</button>';
      btn.addEventListener('click', function(e){
        var qv = e.target.closest('[data-coral-quickview]');
        var toneRgb = (function(){
          var t = CORAL_TONE_MAP[c.category] || 'tone-sage';
          return CORAL_RGB_MAP[t] || '168,200,164';
        })();
        if(qv){
          // Quick view button explicitly → always modal
          e.preventDefault();
          e.stopPropagation();
          if(window.ltcFx && window.ltcFx.cardPopAndJostle){
            window.ltcFx.cardPopAndJostle(btn, { color: 'rgba('+toneRgb+',.55)' });
          }
          openCoralModalViaMode(c, true);
          return;
        }
        // Card body click → respects view mode
        if(window.LTC_VIEW_MODE === 'popup'){
          e.preventDefault();
          if(window.ltcFx && window.ltcFx.cardPopAndJostle){
            window.ltcFx.cardPopAndJostle(btn, { color: 'rgba('+toneRgb+',.55)' });
          }
          openCoralModalViaMode(c, false);
        }
        // else: anchor follows naturally to product.html
      });
      return btn;
    }

    function renderCoralGrid(){
      var list = filterCorals();
      // Mark as re-render after first paint so subsequent renders use the quick fade
      if(grid.dataset.painted === '1'){
        grid.classList.add('is-rerender');
      }
      grid.dataset.painted = '1';
      // Atomic swap with replaceChildren — no empty intermediate state, no flicker
      if(!list.length){
        var empty = document.createElement('div');
        empty.className = 'dg-empty';
        empty.innerHTML = '<strong>No matching corals right now.</strong>Clear your search or pick a different category.';
        grid.replaceChildren(empty);
      } else {
        var cards = list.map(coralCard);
        grid.replaceChildren.apply(grid, cards);
      }
      if(meta) meta.innerHTML = 'Showing <strong>'+list.length+'</strong> of '+data.length+' live pieces';
    }

    // Tab click wiring
    $$('.coral-tab', root).forEach(function(tab){
      tab.addEventListener('click', function(){
        window.switchCoralMode(tab.dataset.mode);
      });
    });

    renderCoralGrid();
  }

  /* ─── CORAL MODAL ─── */
  var CORAL_TONE_MAP = {
    LPS:'tone-coral', SPS:'tone-amber', Soft:'tone-sage', Zoa:'tone-rose',
    Mushroom:'tone-purple', Anemone:'tone-rose', Special:'tone-cyan'
  };
  var CORAL_RGB_MAP = {
    'tone-champagne':'214,193,154','tone-sage':'168,200,164','tone-amber':'255,203,94',
    'tone-coral':'255,138,120','tone-rose':'255,155,182','tone-cyan':'148,212,216',
    'tone-purple':'200,178,255','tone-lime':'184,232,96'
  };

  function detailContentCoral(c){
    var tone = CORAL_TONE_MAP[c.category] || 'tone-sage';
    var rgb = CORAL_RGB_MAP[tone] || '168,200,164';

    var artHtml;
    if(c.img){
      artHtml = '<div class="modal-art"><img src="'+c.img+'" alt="'+(c.name||'').replace(/"/g,'&quot;')+'"></div>';
    }else{
      var coralIcon = '<svg class="cfb-bigicon" viewBox="0 0 24 24"><path d="M12 2c2 2 3 5 3 8s-1 6-3 8c-2-2-3-5-3-8s1-6 3-8z"/><path d="M4 12c2 2 5 3 8 3s6-1 8-3c-2-2-5-3-8-3s-6 1-8 3z"/></svg>';
      artHtml =
        '<div class="modal-art has-fallback">'+
          coralIcon+
          '<div class="cfb-brand">'+c.category+' · WYSIWYG</div>'+
          '<div class="cfb-name">'+c.name+'</div>'+
        '</div>';
    }

    var diffHtml = '';
    if(c.care){
      var diffLabels = ['','Beginner','Easy','Intermediate','Advanced','Expert'];
      var lvl = Math.max(1, Math.min(5, c.care));
      var dots = '';
      for(var i=1;i<=5;i++){
        dots += '<div class="modal-diff-dot'+(i<=lvl?' is-on':'')+'"></div>';
      }
      diffHtml =
        '<div class="modal-difficulty">'+
          '<span class="modal-diff-label">Care level</span>'+
          '<div class="modal-diff-bar">'+dots+'</div>'+
          '<span class="modal-diff-text">'+diffLabels[lvl]+'</span>'+
        '</div>';
    }

    return (
      '<div class="modal-body" data-detail-type="coral" data-detail-slug="'+c.slug+'">'+
        artHtml+
        '<div class="modal-info '+tone+'" style="--cm-rgb:'+rgb+'">'+
          '<div class="brand">'+c.category+' · WYSIWYG</div>'+
          '<h2>'+(c.name||'')+'</h2>'+
          '<div class="modal-sci">'+(c.scientific||'')+'</div>'+
          '<div class="modal-lineage"><span class="modal-lineage-label">Lineage</span>'+(c.lineage||'')+'</div>'+
          (c.description ? '<p class="modal-desc">'+c.description+'</p>' : '')+
          (c.careNotes ? '<div class="modal-care-notes"><span class="modal-care-label">Care notes</span>'+c.careNotes+'</div>' : '')+
          diffHtml+
          '<div class="modal-gauge-header"><strong>Our tanks run in the ideal range</strong><span>Last updated '+relativeTime((window.LTC_SHOP_TANKS||{}).lastUpdated||new Date().toISOString())+'</span></div>'+
          '<div class="modal-gauges" data-modal-gauges></div>'+
          '<div class="modal-price-row">'+
            '<div><span class="price">'+(c.priceLabel||('$'+c.price))+'</span><span class="price-sub">'+(c.heads||'')+'</span></div>'+
            '<div class="modal-stock-wrap">'+
              '<span class="stock"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>In stock · '+(c.sku||'')+'</span>'+
            '</div>'+
          '</div>'+
          '<div class="modal-actions">'+
            '<button class="btn btn-primary" type="button" data-coral-hold>'+
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>'+
              'Add to hold'+
            '</button>'+
            '<button class="btn btn-secondary" type="button" data-coral-checkout>'+
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h2l2 13h12l2-9H6"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg>'+
              'Checkout'+
            '</button>'+
          '</div>'+
        '</div>'+
      '</div>'
    );
  }
  window.detailContentCoral = detailContentCoral;

  function wireUpCoralDetail(root, c){
    var tone = CORAL_TONE_MAP[c.category] || 'tone-sage';
    var rgb = CORAL_RGB_MAP[tone] || '168,200,164';

    // Populate gauges
    var mGaugesEl = root.querySelector('[data-modal-gauges]');
    var tanks = window.LTC_SHOP_TANKS || {};
    if(mGaugesEl){
      ['alk','cal','mag','temp','sal'].forEach(function(k, i){
        makeGauge(mGaugesEl, k, tanks[k], { staggerMs: 200 + i * 140 });
      });
    }
    var holdBtn = root.querySelector('[data-coral-hold]');
    if(holdBtn){
      holdBtn.addEventListener('click', function(){
        if(window.ltcFx && window.ltcFx.bubbles) ltcFx.bubbles(holdBtn, { count: 24, color: 'rgba('+rgb+',.6)' });
        setTimeout(function(){
          holdBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.6"><path d="M5 12l5 5L20 7"/></svg>On hold for you';
        }, 200);
      });
    }
    var checkoutBtn = root.querySelector('[data-coral-checkout]');
    if(checkoutBtn){
      checkoutBtn.addEventListener('click', function(){
        if(window.ltcFx && window.ltcFx.bubbles) ltcFx.bubbles(checkoutBtn, { count: 18, color: 'rgba(214,193,154,.55)' });
        setTimeout(function(){
          checkoutBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.6"><path d="M5 12l5 5L20 7"/></svg>Sent to register';
        }, 200);
      });
    }
  }
  window.wireUpCoralDetail = wireUpCoralDetail;

  function openCoralModal(c){
    closeCoralModal();
    var tone = CORAL_TONE_MAP[c.category] || 'tone-sage';
    var rgb = CORAL_RGB_MAP[tone] || '168,200,164';

    var artHtml;
    if(c.img){
      artHtml = '<div class="modal-art"><img src="'+c.img+'" alt="'+(c.name||'').replace(/"/g,'&quot;')+'"></div>';
    }else{
      var coralIcon = '<svg class="cfb-bigicon" viewBox="0 0 24 24"><path d="M12 2c2 2 3 5 3 8s-1 6-3 8c-2-2-3-5-3-8s1-6 3-8z"/><path d="M4 12c2 2 5 3 8 3s6-1 8-3c-2-2-5-3-8-3s-6 1-8 3z"/></svg>';
      artHtml =
        '<div class="modal-art has-fallback">'+
          coralIcon+
          '<div class="cfb-brand">'+c.category+' · WYSIWYG</div>'+
          '<div class="cfb-name">'+c.name+'</div>'+
        '</div>';
    }

    // Difficulty dots
    var diffHtml = '';
    if(c.care){
      var diffLabels = ['','Beginner','Easy','Intermediate','Advanced','Expert'];
      var lvl = Math.max(1, Math.min(5, c.care));
      var dots = '';
      for(var i=1;i<=5;i++){
        dots += '<div class="modal-diff-dot'+(i<=lvl?' is-on':'')+'"></div>';
      }
      diffHtml =
        '<div class="modal-difficulty">'+
          '<span class="modal-diff-label">Care level</span>'+
          '<div class="modal-diff-bar">'+dots+'</div>'+
          '<span class="modal-diff-text">'+diffLabels[lvl]+'</span>'+
        '</div>';
    }

    var bd = document.createElement('div');
    bd.className = 'modal-backdrop is-open';
    bd.id = 'ltc-coral-modal';
    bd.innerHTML =
      '<div class="modal coral-modal" role="dialog" aria-modal="true">'+
        '<div class="modal-header">'+
          '<strong>'+c.category+' &middot; '+(c.sku||'WYSIWYG')+'</strong>'+
          '<div class="modal-header-actions">'+
            '<a class="modal-fullpage-link" href="product.html?coral='+encodeURIComponent(c.slug)+'">'+
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3h7v7M21 3l-9 9M10 21H3v-7M3 21l9-9"/></svg>'+
              '<span>Full page</span>'+
            '</a>'+
            '<button class="modal-close" type="button" aria-label="Close">×</button>'+
          '</div>'+
        '</div>'+
        '<div class="modal-body">'+
          artHtml+
          '<div class="modal-info '+tone+'" style="--cm-rgb:'+rgb+'">'+
            '<div class="brand">'+c.category+' · WYSIWYG</div>'+
            '<h2>'+(c.name||'')+'</h2>'+
            '<div class="modal-sci">'+(c.scientific||'')+'</div>'+
            '<div class="modal-lineage"><span class="modal-lineage-label">Lineage</span>'+(c.lineage||'')+'</div>'+
            (c.description ? '<p class="modal-desc">'+c.description+'</p>' : '')+
            (c.careNotes ? '<div class="modal-care-notes"><span class="modal-care-label">Care notes</span>'+c.careNotes+'</div>' : '')+
            diffHtml+
            '<div class="modal-gauge-header"><strong>Our tanks run in the ideal range</strong><span>Last updated '+relativeTime((window.LTC_SHOP_TANKS||{}).lastUpdated||new Date().toISOString())+'</span></div>'+
            '<div class="modal-gauges" data-modal-gauges></div>'+
            '<div class="modal-price-row">'+
              '<div><span class="price">'+(c.priceLabel||('$'+c.price))+'</span><span class="price-sub">'+(c.heads||'')+'</span></div>'+
              '<div class="modal-stock-wrap">'+
                '<span class="stock"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>In stock · '+(c.sku||'')+'</span>'+
              '</div>'+
            '</div>'+
            '<div class="modal-actions">'+
              '<button class="btn btn-primary" type="button" data-coral-hold>'+
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>'+
                'Add to hold'+
              '</button>'+
              '<button class="btn btn-secondary" type="button" data-coral-checkout>'+
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h2l2 13h12l2-9H6"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg>'+
                'Checkout'+
              '</button>'+
            '</div>'+
          '</div>'+
        '</div>'+
      '</div>';
    document.body.appendChild(bd);
    document.body.style.overflow = 'hidden';

    // Populate gauges in modal with the current tank readings
    var mGaugesEl = bd.querySelector('[data-modal-gauges]');
    var tanks = window.LTC_SHOP_TANKS || {};
    if(mGaugesEl){
      ['alk','cal','mag','temp','sal'].forEach(function(k, i){
        makeGauge(mGaugesEl, k, tanks[k], { staggerMs: 200 + i * 140 });
      });
    }

    // Add to hold → bubble burst
    var holdBtn = bd.querySelector('[data-coral-hold]');
    if(holdBtn){
      holdBtn.addEventListener('click', function(){
        ltcFx.bubbles(holdBtn, { count: 24, color: 'rgba('+rgb+',.6)' });
        setTimeout(function(){
          holdBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.6"><path d="M5 12l5 5L20 7"/></svg>On hold for you';
        }, 200);
      });
    }
    // Checkout → bubble + swap
    var checkoutBtn = bd.querySelector('[data-coral-checkout]');
    if(checkoutBtn){
      checkoutBtn.addEventListener('click', function(){
        ltcFx.bubbles(checkoutBtn, { count: 18, color: 'rgba(214,193,154,.55)' });
        setTimeout(function(){
          checkoutBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.6"><path d="M5 12l5 5L20 7"/></svg>Sent to register';
        }, 200);
      });
    }

    bd.addEventListener('click', function(e){
      if(e.target===bd || e.target.closest('.modal-close')){
        closeCoralModal();
      }
    });
    document.addEventListener('keydown', coralEscClose);
  }

  function closeCoralModal(){
    var bd = $('#ltc-coral-modal');
    if(bd){ bd.remove(); document.body.style.overflow=''; }
    document.removeEventListener('keydown', coralEscClose);
    setTimeout(clearModalGauges, 100);
  }
  function coralEscClose(e){ if(e.key==='Escape') closeCoralModal() }
  window.openCoralModal = openCoralModal;
  window.makeGaugePublic = makeGauge;
  window.relativeTimePublic = relativeTime;

  /* ============================================================
     v0.36 — PRODUCT → CALCULATOR DEEP LINK RESOLVER
     Looks at a dry goods product and returns the matching dosing
     calculator anchor + label, or null if no calc fits.
     ============================================================ */
  window.LTC_PRODUCT_TO_CALC = function(p){
    if(!p) return null;
    var brand = (p.brand||'').toLowerCase();
    var name  = (p.name||'').toLowerCase();
    var cat   = p.category;

    // Brightwell-specific products → exact calc cards
    if(brand.indexOf('brightwell') >= 0){
      if(name.indexOf('alkalin') >= 0){
        return { anchor:'#calc-alkalin83', label:'Open Alkalin8.3 calculator', sub:'Brightwell · alkalinity dosing' };
      }
      if(name.indexOf('calcion') >= 0){
        return { anchor:'#calc-calcionp', label:'Open Calcion-P calculator', sub:'Brightwell · calcium dosing' };
      }
      // Other Brightwell additives → jump to brand section
      return { anchor:'#brand-brightwell', label:'Open Brightwell calculators', sub:'Brand section · 2 calculators' };
    }
    // BRS-branded products → BRS section
    if(brand.indexOf('brs') >= 0 || brand.indexOf('bulk reef') >= 0){
      if(name.indexOf('soda ash') >= 0 || name.indexOf('calcium chloride') >= 0 || name.indexOf('2-part') >= 0 || name.indexOf('two-part') >= 0){
        return { anchor:'#calc-brs2part', label:'Open BRS 2-part calculator', sub:'BRS Pharma · daily dosing' };
      }
      return { anchor:'#brand-brs', label:'Open BRS calculators', sub:'Brand section' };
    }
    // Salt products → salt mix calc
    if(cat === 'salt'){
      return { anchor:'#calc-saltmix', label:'Open salt mix calculator', sub:'Works with all reef salts' };
    }
    // Other additives → brand-specific landing if known, else generic page
    if(cat === 'additives'){
      if(brand.indexOf('seachem') >= 0) return { anchor:'#brand-seachem', label:'Seachem dosing (coming soon)', sub:'Manufacturer link inside' };
      if(brand.indexOf('esv') >= 0)     return { anchor:'#brand-esv',     label:'ESV B-Ionic (coming soon)',    sub:'Brand section' };
      if(brand.indexOf('red sea') >= 0) return { anchor:'#brand-redsea',  label:'Red Sea (coming soon)',        sub:'Manufacturer link inside' };
      if(brand.indexOf('tropic') >= 0)  return { anchor:'#brand-tropic',  label:'Tropic Marin (coming soon)',   sub:'Brand section' };
      if(brand.indexOf('fritz') >= 0)   return { anchor:'#brand-fritz',   label:'Fritz (coming soon)',          sub:'Brand section' };
      // Generic additive — open the page top
      return { anchor:'', label:'Open dosing calculator', sub:'Pick a brand on the page' };
    }
    // Test kits don't dose anything but the page is still useful for understanding ranges
    if(cat === 'testing'){
      return { anchor:'', label:'Open dosing calculator', sub:'Reference dose ranges by brand' };
    }
    return null;
  };

  function gallonsOf(vol, unit){
    return unit === 'l' ? vol / 3.78541 : vol;
  }
  function fmtNum(n, dec){
    if(n === null || isNaN(n) || !isFinite(n)) return '—';
    return n.toFixed(dec || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  var CALCULATORS = {
    // Brightwell Alkalin8.3 — 1 mL per gallon raises alk 1.4 dKH
    // Vol passed is already converted to gallons by initCalculator
    alk: function(galVol, raise){
      var ml = (galVol * raise) / 1.4;
      return {
        primary: fmtNum(ml, 1) + ' ml',
        sub: ml > 80 ? 'split into 2 doses, 4 hrs apart' : 'over 4–6 hours'
      };
    },
    // Brightwell Calcion-P — 1 g per gallon raises calcium 18 ppm
    cal: function(galVol, raise){
      var g = (galVol * raise) / 18;
      return {
        primary: fmtNum(g, 1) + ' g',
        sub: 'predissolved in RO/DI'
      };
    },
    // BRS 2-part — Part 1: 1 mL per gallon raises alk 1.05 dKH
    twopart: function(galVol, raise){
      var mlAlk = (galVol * raise) / 1.05;
      var mlCal = mlAlk;
      return {
        primary: fmtNum(mlAlk, 1) + ' ml/day',
        sub: fmtNum(mlCal, 1) + ' ml/day'
      };
    },
    // Salt mix — 0.5 lb/gal at 1.025 sg, scaled by target
    salt: function(galVol, raise){
      var sgScale = (raise - 1) / 0.025;
      var lbs = galVol * 0.5 * sgScale;
      var cups = lbs * 1.85;
      return {
        primary: fmtNum(lbs, 1) + ' lb',
        sub: '≈ ' + fmtNum(cups, 1) + ' cups'
      };
    }
  };

  function initCalculator(card){
    var key = card.dataset.calc;
    var compute = CALCULATORS[key];
    if(!compute) return;

    var volInput = card.querySelector('[data-calc-field="vol"]');
    var volUnit  = card.querySelector('[data-calc-field="volUnit"]');
    var raiseEl  = card.querySelector('[data-calc-field="raise"]');
    var resultEl = card.querySelector('[data-calc-result]');
    var resultSubEl = card.querySelector('[data-calc-result-sub]');

    function update(){
      var vol = parseFloat(volInput.value) || 0;
      var unit = volUnit ? volUnit.value : 'gal';
      var raise = parseFloat(raiseEl.value) || 0;
      // Convert volume to gallons before passing to formula
      var galVol = gallonsOf(vol, unit);
      var out = compute(galVol, raise);
      resultEl.textContent = out.primary;
      if(resultSubEl && out.sub) resultSubEl.textContent = out.sub;

      card.classList.remove('is-changed');
      void card.offsetWidth;
      card.classList.add('is-changed');
      setTimeout(function(){ card.classList.remove('is-changed') }, 600);
    }

    [volInput, volUnit, raiseEl].forEach(function(el){
      if(!el) return;
      el.addEventListener('input', update);
      el.addEventListener('change', update);
    });
    update();
  }

  function initAllCalculators(){
    var cards = document.querySelectorAll('.calc-card[data-calc]');
    cards.forEach(initCalculator);
    // Deep-link highlight: if URL has #calc-XXX, find that card and pulse
    var hash = window.location.hash;
    if(hash && hash.indexOf('#calc-') === 0){
      var target = document.getElementById(hash.slice(1));
      if(target){
        setTimeout(function(){
          target.classList.add('is-target');
          target.scrollIntoView({behavior:'smooth', block:'start'});
          setTimeout(function(){ target.classList.remove('is-target') }, 2200);
        }, 350);
      }
    } else if(hash && hash.indexOf('#brand-') === 0){
      var section = document.getElementById(hash.slice(1));
      if(section) setTimeout(function(){ section.scrollIntoView({behavior:'smooth', block:'start'}) }, 200);
    }
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initAllCalculators);
  } else {
    initAllCalculators();
  }

  /* ============================================================
     v0.33 — IDLE FISH SWIMMER
     After 12s of no pointer/scroll/key activity, a small SVG fish
     swims across the top of the page. Easter egg, never blocks
     interaction, never repeats while one is already swimming.
     ============================================================ */
  (function(){
    if(document.documentElement.classList.contains('no-idle-swim')) return;
    var lastActivity = Date.now();
    var swimming = false;
    var SWIM_DELAY = 12000;
    var SWIM_DURATION = 14000;

    var SWIM_SVG =
      '<svg viewBox="0 0 60 36" xmlns="http://www.w3.org/2000/svg">'+
        '<defs><linearGradient id="swim-grad" x1="0%" y1="0%" x2="100%" y2="0%">'+
          '<stop offset="0%" stop-color="rgba(214,193,154,.85)"/>'+
          '<stop offset="60%" stop-color="rgba(168,200,164,.7)"/>'+
          '<stop offset="100%" stop-color="rgba(148,212,216,.65)"/>'+
        '</linearGradient></defs>'+
        // Tail (renders behind body)
        '<path class="tail" d="M8 18 L0 8 L4 18 L0 28 Z"/>'+
        // Body — teardrop shape, head right
        '<path class="body" d="M50 18 Q48 6 28 8 Q12 10 8 18 Q12 26 28 28 Q48 30 50 18 Z"/>'+
        // Top fin
        '<path class="tail" d="M22 8 Q26 0 32 8 Q28 12 22 8 Z"/>'+
        // Eye
        '<circle class="eye" cx="44" cy="16" r="2.2"/>'+
        '<circle class="eye-shine" cx="44.6" cy="15.4" r="0.7"/>'+
      '</svg>';

    function maybeSwim(){
      if(swimming) return;
      if(document.hidden) return;
      if(Date.now() - lastActivity < SWIM_DELAY) return;
      swimming = true;
      var fish = document.createElement('div');
      fish.className = 'idle-swimmer bubble-trail';
      fish.innerHTML = SWIM_SVG;
      document.body.appendChild(fish);
      setTimeout(function(){
        fish.remove();
        swimming = false;
        lastActivity = Date.now();
      }, SWIM_DURATION);
    }

    function bumpActivity(){
      lastActivity = Date.now();
    }
    ['pointerdown','pointermove','keydown','scroll','touchstart'].forEach(function(evt){
      window.addEventListener(evt, bumpActivity, {passive:true});
    });
    setInterval(maybeSwim, 2000);
  })();

  /* ============================================================
     v0.38 — View-mode routing helpers
     These decide modal vs page based on LTC_VIEW_MODE, handle
     pushState for popup mode, and call the shared wire-up fns.
     ============================================================ */
  window.openCoralModalViaMode = function(c, forceModal){
    if(!forceModal && window.LTC_VIEW_MODE === 'page'){
      window.location.href = 'product.html?coral=' + encodeURIComponent(c.slug);
      return;
    }
    var content = detailContentCoral(c);
    var bd = renderAsModal(content, {
      id: 'ltc-coral-modal-' + c.slug,
      title: c.category + ' · ' + (c.sku||'WYSIWYG'),
      href: 'coral-browser.html?coral=' + encodeURIComponent(c.slug),
      item: { type:'coral', slug:c.slug },
      onClose: function(){ setTimeout(clearModalGauges, 100); }
    });
    wireUpCoralDetail(bd, c);
  };

  window.openDryGoodsModalViaMode = function(p, forceModal){
    if(!forceModal && window.LTC_VIEW_MODE === 'page'){
      window.location.href = 'dg-product.html?slug=' + encodeURIComponent(p.slug);
      return;
    }
    var content = detailContentDryGoods(p);
    var catLabel = (window.LTC_DG_CAT_LABELS && window.LTC_DG_CAT_LABELS[p.category]) || p.category || '';
    var bd = renderAsModal(content, {
      id: 'ltc-dg-modal-' + p.slug,
      title: (p.brand||'Product') + ' · ' + catLabel,
      href: 'dry-goods.html?slug=' + encodeURIComponent(p.slug),
      item: { type:'drygoods', slug:p.slug }
    });
    wireUpDryGoodsDetail(bd, p);
  };

  /* ============================================================
     v0.38 — TOPBAR VIEW MODE TOGGLE PILL
     Inject into util-bar on every page. Hidden when ?kiosk=1.
     ============================================================ */
  function injectViewModeToggle(){
    if(document.documentElement.classList.contains('is-kiosk')) return;
    var utilRow = document.querySelector('.util-row');
    if(!utilRow) return;
    if(utilRow.querySelector('[data-view-mode-pill]')) return; // already injected
    var pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'util-item view-mode-pill';
    pill.dataset.viewModePill = '';
    pill.dataset.mode = window.LTC_VIEW_MODE;
    pill.setAttribute('aria-label', 'Toggle view mode');
    pill.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">'+
        '<rect x="3" y="5" width="18" height="14" rx="2"/>'+
        '<path d="M3 10h18"/>'+
      '</svg>'+
      '<span data-view-mode-label>'+(window.LTC_VIEW_MODE==='popup'?'Quick view':'Detailed view')+'</span>';
    pill.addEventListener('click', function(){
      var next = (window.LTC_VIEW_MODE === 'popup') ? 'page' : 'popup';
      setViewMode(next);
      // Small flash animation
      pill.classList.remove('is-flipped');
      void pill.offsetWidth;
      pill.classList.add('is-flipped');
      setTimeout(function(){ pill.classList.remove('is-flipped') }, 600);
    });
    // Insert before the util-spacer
    var spacer = utilRow.querySelector('.util-spacer');
    if(spacer) utilRow.insertBefore(pill, spacer);
    else utilRow.appendChild(pill);
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', injectViewModeToggle);
  } else {
    injectViewModeToggle();
  }

  /* ============================================================
     v0.39 — GUARANTEE MODAL
     Click the trust pill on the homepage → opens an explainer
     modal using the same renderAsModal infra.
     ============================================================ */
  function openGuaranteeModal(){
    var content =
      '<div class="modal-body guarantee-body">'+
        '<div class="guarantee-art">'+
          '<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">'+
            '<defs><radialGradient id="g-shield" cx="50%" cy="40%" r="60%">'+
              '<stop offset="0%" stop-color="rgba(168,200,164,.95)"/>'+
              '<stop offset="60%" stop-color="rgba(168,200,164,.5)"/>'+
              '<stop offset="100%" stop-color="rgba(168,200,164,.15)"/>'+
            '</radialGradient></defs>'+
            '<path d="M40 8 L12 18 v22 c0 16 12 28 28 32 16-4 28-16 28-32 V18 z" fill="url(#g-shield)" stroke="rgba(214,193,154,.85)" stroke-width="1.6"/>'+
            '<path d="M28 42 l8 8 16-16" fill="none" stroke="rgba(255,255,255,.95)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>'+
          '</svg>'+
        '</div>'+
        '<div class="guarantee-info">'+
          '<div class="brand">Our promise</div>'+
          '<h2>14-day livestock guarantee</h2>'+
          '<p class="modal-desc">If a fish, coral, or invert dies within 14 days of leaving the shop and the cause wasn\'t obvious neglect, bring it back. We\'ll either replace it or credit your account toward another piece. No drama, no forms — that\'s the deal.</p>'+

          '<div class="guarantee-section">'+
            '<div class="guarantee-section-label">What\'s covered</div>'+
            '<ul class="guarantee-list">'+
              '<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>Sudden death within 14 days of purchase</li>'+
              '<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>Disease that showed up after acclimation</li>'+
              '<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>Coral that didn\'t open after a proper drip</li>'+
            '</ul>'+
          '</div>'+

          '<div class="guarantee-section">'+
            '<div class="guarantee-section-label">What\'s NOT covered</div>'+
            '<ul class="guarantee-list is-not">'+
              '<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>Tank crashes from your own parameters</li>'+
              '<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>Predation by other tankmates</li>'+
              '<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>Improper acclimation (skipping the drip)</li>'+
              '<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>Anemones (stable parameters required, unpredictable)</li>'+
            '</ul>'+
          '</div>'+

          '<div class="guarantee-section">'+
            '<div class="guarantee-section-label">How to claim</div>'+
            '<p class="guarantee-claim-text">Bring a water sample from your tank along with the receipt. We\'ll test it on the spot and process the replacement or credit. If you can\'t make it in, text us at (315) 473-3389 with a photo.</p>'+
          '</div>'+

          '<div class="modal-actions">'+
            '<a class="btn btn-primary" href="visit.html">'+
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'+
              'Visit the shop'+
            '</a>'+
            '<button class="btn btn-secondary" type="button" data-modal-close>Got it</button>'+
          '</div>'+
        '</div>'+
      '</div>';

    if(!window.renderAsModal) return;
    renderAsModal(content, {
      id: 'ltc-guarantee-modal',
      title: 'Livestock guarantee'
    });
  }
  window.openGuaranteeModal = openGuaranteeModal;

  // Wire any guarantee triggers on the page
  function wireGuaranteeTriggers(){
    var triggers = document.querySelectorAll('[data-guarantee-open]');
    triggers.forEach(function(t){
      if(t.dataset.guaranteeWired === '1') return;
      t.dataset.guaranteeWired = '1';
      t.addEventListener('click', function(e){
        e.preventDefault();
        openGuaranteeModal();
      });
    });
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', wireGuaranteeTriggers);
  } else {
    wireGuaranteeTriggers();
  }

  initCoralBrowser();

})();
