// LTC Fish Browser — Main Application

// T() polyfill — features.js defines the real version with translations.
// This fallback ensures app.js functions work even before features.js loads.
if(typeof T !== 'function'){ var T = function(k){ return k; }; }

// FISH data loaded from data/fish.js
const APP_VERSION = 'v0.186';

// V0.123 — ltcFx: tactile click feedback helpers ported from LTC_Keepers.html.
// Two effects: jelly squish (subtle scale bounce, runs in ~300ms) and bubble
// cloud (particle burst rising from the button, used for celebratory actions
// like Mark Sold). Both are stateless and safe to call from inline onclick.
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
    var color = opts.color || 'rgba(94,235,200,.55)';
    // Ensure the host can position particles
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
    b.style.cssText = 'position:absolute;border-radius:50%;width:' + sz + 'px;height:' + sz + 'px;left:' + x + '%;top:' + y + '%;background:' + color + ';pointer-events:none;z-index:4;opacity:.7;border:1px solid rgba(255,255,255,.2)';
    host.appendChild(b);
    var start = null;
    function frame(ts){
      if(!start) start = ts;
      var t = Math.min((ts - start) / dur, 1);
      var e = 1 - Math.pow(1 - t, 2);
      b.style.transform = 'translate(' + dx * e + 'px,' + dy * e + 'px) scale(' + (1 - t * 0.4) + ')';
      b.style.opacity = String(0.7 * (1 - t * 0.9));
      if(t < 1) requestAnimationFrame(frame);
      else b.remove();
    }
    requestAnimationFrame(frame);
  }
  return { jelly: jelly, bubbles: bubbles };
})();

// ═══════════════════════════════════════════════════════════════════
// v0.185 — UNIVERSAL OVERLAY BACK-BUTTON HISTORY
// ═══════════════════════════════════════════════════════════════════
// The problem: hitting the browser/phone back button on the kiosk
// exited the entire app instead of closing the current overlay.
// Customers at the tablet would tap back expecting "close this popup"
// and instead get kicked out of the store entirely.
//
// The fix: a centralized overlay stack that pushes to history whenever
// any overlay opens (via MutationObserver watching the .show class on
// registered overlays). popstate event handler pops the topmost
// overlay when back is pressed. Nested overlays unnest in LIFO order.
//
// Why MutationObserver instead of patching every open/close function:
// there are 15+ open/close call sites scattered across app.js and
// features.js, many of which use different patterns (some call a
// function, some inline `.classList.add('show')`, some go through
// `receiveFlow.open()`). Patching each one would be invasive and easy
// to miss. MutationObserver intercepts at the lowest level — the
// moment the `.show` class toggles on the overlay DOM element — so
// it works regardless of which function triggered it.
//
// Design notes:
// - `isPopstateNav` guard prevents an infinite loop: when popstate
//   fires and triggers a close, the close's MutationObserver callback
//   would normally call `history.back()` again. The guard tells it
//   "no, this close was triggered BY the back button, don't push back
//   through history yet."
// - Each overlay's "close" is just removing the .show class via its
//   existing close function. The stack calls the registered closer
//   which does whatever that overlay needs (pause video, clear state,
//   etc) — we don't bypass existing cleanup logic.
// - Staff side overlays get this too per Chris's explicit direction
//   ("leave it all the way it is" = no visual/functional changes, but
//   the back button still works on them because he also said
//   "regardless ... if you hit the back button it should always bring
//   you to the previous window otherwise that shit's gonna end a
//   disaster.")
// - `receive-flow` has its own context-sensitive back via
//   receiveFlow.back() — from step 2 it goes to step 1, from step 1
//   it closes. Wiring the browser back button to call receiveFlow.back()
//   preserves that stepwise behavior.

(function setupOverlayBackStack(){
  if(window.ltcOverlayStack) return;

  // Registry: overlay DOM id → close handler. Mirrors the existing
  // backdrop-click registration so back-button and backdrop-click
  // behave identically.
  var OVERLAY_REGISTRY = [
    ['inventoryOverlay',        function(){ return window.inventoryTopbarBack && window.inventoryTopbarBack(); }],
    ['foodsOverlay',            function(){ return typeof closeFoodSettings === 'function' && closeFoodSettings(); }],
    ['analyticsOverlay',        function(){ return typeof closeAnalytics === 'function' && closeAnalytics(); }],
    ['compareOverlay',          function(){ return typeof closeCompare === 'function' && closeCompare(); }],
    ['staffOverlay',            function(){ return typeof closeStaffLogin === 'function' && closeStaffLogin(); }],
    ['inputModalOverlay',       function(){ return typeof closeInputModal === 'function' && closeInputModal(); }],
    ['inventoryHistoryOverlay', function(){ return typeof closeInventoryHistoryOverlay === 'function' && closeInventoryHistoryOverlay(); }],
    ['receiveFlowOverlay',      function(){ return window.receiveFlow && window.receiveFlow.back && window.receiveFlow.back(); }],
    ['fishOverlay',             function(){ return typeof closeFishModal === 'function' && closeFishModal(); }],
    ['tankMoverOverlay',        function(){ return typeof closeTankMover === 'function' && closeTankMover(); }]
  ];

  var stack = [];          // array of overlay ids, topmost = last
  var isPopstateNav = false; // guard: true while handling a popstate event
  var observers = [];      // MutationObservers so we can disconnect on teardown

  function topOverlay(){ return stack.length ? stack[stack.length - 1] : null; }

  function pushOverlay(id){
    // Only push if not already at top (guards against double-trigger
    // e.g. class added twice in rapid succession).
    if(topOverlay() === id) return;
    stack.push(id);
    // Push a new history entry tagged with this overlay id. We use a
    // state object — no URL change because the kiosk is a single-page
    // static app (file://) and changing URL could break asset paths.
    try {
      history.pushState({ ltcOverlay: id, depth: stack.length }, '');
    } catch(_){}
  }

  function popOverlayFromStack(id){
    // Remove id from the stack (and anything on top of it — shouldn't
    // happen normally but defensive). Returns the number of entries
    // removed so popstate handler knows how many history.back() calls
    // to make if there were stale ones.
    var idx = stack.lastIndexOf(id);
    if(idx === -1) return 0;
    var removed = stack.length - idx;
    stack.length = idx;
    return removed;
  }

  // MutationObserver callback: fires whenever .show is added/removed
  // on a registered overlay. Distinguishes open vs close by checking
  // whether the class is currently present.
  function onOverlayClassMutation(overlayEl){
    return function(mutations){
      for(var i = 0; i < mutations.length; i++){
        var m = mutations[i];
        if(m.attributeName !== 'class') continue;
        var id = overlayEl.id;
        var isShowing = overlayEl.classList.contains('show');
        var wasInStack = stack.indexOf(id) !== -1;

        if(isShowing && !wasInStack){
          // Overlay just opened. Push to history unless we're mid-popstate.
          if(!isPopstateNav){
            pushOverlay(id);
          } else {
            // Opened during popstate handling — shouldn't normally
            // happen, but if it does, just add to stack without
            // pushing new history (we're already navigating back).
            stack.push(id);
          }
        } else if(!isShowing && wasInStack){
          // Overlay just closed. Pop from stack. If the close was
          // user-initiated (NOT from popstate), also fire history.back()
          // so the URL/history state stays in sync with the visible UI.
          var removedCount = popOverlayFromStack(id);
          if(!isPopstateNav && removedCount > 0){
            // Only call history.back() once per close — we're moving
            // one layer down in the stack, so one history pop is right.
            try { history.back(); } catch(_){}
          }
        }
      }
    };
  }

  function attachObserver(overlayEl){
    if(!overlayEl || overlayEl.dataset.ltcStackObserver) return;
    var obs = new MutationObserver(onOverlayClassMutation(overlayEl));
    obs.observe(overlayEl, { attributes: true, attributeFilter: ['class'] });
    overlayEl.dataset.ltcStackObserver = '1';
    observers.push(obs);
    // If the overlay is already showing at registration time, seed
    // the stack so we don't miss it.
    if(overlayEl.classList.contains('show') && stack.indexOf(overlayEl.id) === -1){
      pushOverlay(overlayEl.id);
    }
  }

  // Register all known overlays and attach observers.
  function registerAll(){
    OVERLAY_REGISTRY.forEach(function(pair){
      var overlayEl = document.getElementById(pair[0]);
      if(overlayEl) attachObserver(overlayEl);
    });
  }

  // popstate handler: when user hits back, close the topmost overlay
  // via its registered close handler.
  window.addEventListener('popstate', function(ev){
    var topId = topOverlay();
    if(!topId){
      // Nothing on our stack — let the browser handle it normally.
      // This is the case where the user hits back with no overlay
      // open — they get whatever browser/tab-level back does.
      return;
    }
    // Find the close handler for this overlay
    var entry = null;
    for(var i = 0; i < OVERLAY_REGISTRY.length; i++){
      if(OVERLAY_REGISTRY[i][0] === topId){ entry = OVERLAY_REGISTRY[i]; break; }
    }
    if(!entry){
      // No handler registered — just pop from stack and move on.
      stack.pop();
      return;
    }
    // Set guard, call handler, unset guard. The guard prevents the
    // handler's class removal from re-triggering history.back().
    isPopstateNav = true;
    try {
      entry[1]();
    } catch(e){
      console.warn('Overlay close handler threw:', e);
    }
    // The close handler may or may not have actually removed .show
    // (e.g. inventoryTopbarBack navigates within the inventory without
    // closing it). MutationObserver will have already run by the
    // microtask after the class change, but we release the guard
    // synchronously here — if the observer fires after this point it
    // needs to know we're no longer in popstate nav.
    // Use setTimeout 0 to release after the current microtask queue.
    setTimeout(function(){ isPopstateNav = false; }, 0);
  });

  // Expose for debugging and for other code that might want to know
  // the current overlay depth (e.g. key handlers that should only
  // fire at depth 0).
  window.ltcOverlayStack = {
    push:    pushOverlay,
    pop:     popOverlayFromStack,
    top:     topOverlay,
    depth:   function(){ return stack.length; },
    list:    function(){ return stack.slice(); },
    register: registerAll,
    _stack:  stack
  };

  // Register on DOMContentLoaded so all overlay elements exist.
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', registerAll);
  } else {
    registerAll();
  }

  // Also re-register after a short delay in case any overlays are
  // injected dynamically after DOM ready (receive flow overlay, for
  // instance, is sometimes lazy-created).
  setTimeout(registerAll, 500);
  setTimeout(registerAll, 2000);
})();

// v0.162 — Stat card click reactions. Spawns a transient overlay
// element on top of the clicked stat card that plays a themed
// animation for a moment, then removes itself. Types:
//   dollar   — sold today: $ floats up and fades
//   pen      — avg sale today: pen scribbles across
//   fish     — in stock: a small fish wiggles past
//   box      — restocked today: box drops with water splash
//   warn     — need attention: caution sign pops
//   register — stock value: register click/chime overlay
// The overlay is absolutely positioned, doesn't shift layout, and
// auto-removes after the animation finishes. All animations are
// pure CSS driven by the .sr-* class on the overlay element.
window.statCardReact = function(el, type){
  if(!el || !type) return;
  // Throttle: ignore rapid re-clicks while a reaction is still playing
  if(el.querySelector('.sr-overlay')) return;
  var overlay = document.createElement('span');
  overlay.className = 'sr-overlay sr-' + type;
  overlay.setAttribute('aria-hidden', 'true');
  // Per-type glyph content
  var glyph = '';
  switch(type){
    case 'dollar':
      glyph = '<span class="sr-glyph sr-dollar-1">$</span>'
            + '<span class="sr-glyph sr-dollar-2">$</span>'
            + '<span class="sr-glyph sr-dollar-3">$</span>';
      break;
    case 'pen':
      glyph = '<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">'
            +   '<rect x="4" y="6" width="42" height="28" rx="2" fill="rgba(255,245,210,0.92)" stroke="rgba(180,140,60,0.8)" stroke-width="1"/>'
            +   '<line x1="10" y1="14" x2="40" y2="14" stroke="rgba(140,120,70,0.5)" stroke-width="1"/>'
            +   '<line x1="10" y1="20" x2="40" y2="20" stroke="rgba(140,120,70,0.5)" stroke-width="1"/>'
            +   '<line x1="10" y1="26" x2="40" y2="26" stroke="rgba(140,120,70,0.5)" stroke-width="1"/>'
            +   '<path class="sr-pen-scribble" d="M10 20 Q 16 12, 22 20 T 34 20 T 46 20" fill="none" stroke="#1a0e04" stroke-width="1.6" stroke-linecap="round"/>'
            +   '<path class="sr-pen-body" d="M48 4 L56 12 L20 36 L12 38 L14 30 Z" fill="rgba(120,160,255,0.9)" stroke="rgba(60,80,140,0.9)" stroke-width="1"/>'
            +   '<path d="M48 4 L56 12" stroke="rgba(255,220,100,1)" stroke-width="2"/>'
            + '</svg>';
      break;
    case 'fish':
      glyph = '<svg viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">'
            +   '<ellipse cx="30" cy="15" rx="14" ry="8" fill="rgba(123,207,255,0.85)" stroke="rgba(180,220,255,0.9)" stroke-width="1"/>'
            +   '<path d="M16 15 L4 8 L7 15 L4 22 Z" fill="rgba(123,207,255,0.85)" stroke="rgba(180,220,255,0.9)" stroke-width="1"/>'
            +   '<circle cx="38" cy="13" r="2" fill="#fff"/>'
            +   '<circle cx="38.6" cy="13" r=".9" fill="#000"/>'
            + '</svg>';
      break;
    case 'box':
      glyph = '<div class="sr-box-wrap">'
            +   '<div class="sr-box"><div class="sr-box-lid"></div><div class="sr-box-body"></div></div>'
            +   '<span class="sr-splash sr-splash-1"></span>'
            +   '<span class="sr-splash sr-splash-2"></span>'
            +   '<span class="sr-splash sr-splash-3"></span>'
            +   '<span class="sr-splash sr-splash-4"></span>'
            + '</div>';
      break;
    case 'warn':
      glyph = '<svg viewBox="0 0 50 44" xmlns="http://www.w3.org/2000/svg">'
            +   '<path d="M25 2 L48 42 L2 42 Z" fill="rgba(255,203,94,0.96)" stroke="rgba(120,80,20,0.95)" stroke-width="2" stroke-linejoin="round"/>'
            +   '<rect x="23" y="14" width="4" height="16" rx="1" fill="#1a0e02"/>'
            +   '<circle cx="25" cy="35" r="2.4" fill="#1a0e02"/>'
            + '</svg>';
      break;
    case 'register':
      glyph = '<div class="sr-register-digits">'
            +   '<span class="sr-digit">9</span>'
            +   '<span class="sr-digit">9</span>'
            +   '<span class="sr-digit">9</span>'
            +   '<span class="sr-digit">9</span>'
            + '</div>';
      break;
    // v0.183 — three new reaction types so each of the 8 stat tiles
    // has a unique graphic instead of two pairs duplicating.
    case 'treasure':
      // Stock value tile — Chris asked for "a bar of gold and silver
      // or some precious metal or a diamond". Three precious objects
      // tumble onto the tile in sequence: gold bar, silver bar, then
      // a diamond that pops in last with a sparkle.
      glyph = '<div class="sr-treasure-wrap">'
            +   '<svg class="sr-gold-bar" viewBox="0 0 60 28" xmlns="http://www.w3.org/2000/svg">'
            +     '<path d="M6 8 L54 8 L50 24 L10 24 Z" fill="url(#srGoldGrad)" stroke="#8a5a10" stroke-width="1.2" stroke-linejoin="round"/>'
            +     '<path d="M6 8 L54 8 L52 4 L8 4 Z" fill="#ffe46a" stroke="#8a5a10" stroke-width="1"/>'
            +     '<text x="30" y="19" text-anchor="middle" font-size="7" font-weight="900" fill="#5a3a08">999</text>'
            +     '<defs><linearGradient id="srGoldGrad" x1="0" y1="0" x2="0" y2="1">'
            +       '<stop offset="0%" stop-color="#ffd84a"/><stop offset="50%" stop-color="#e8a820"/><stop offset="100%" stop-color="#a86810"/>'
            +     '</linearGradient></defs>'
            +   '</svg>'
            +   '<svg class="sr-silver-bar" viewBox="0 0 60 28" xmlns="http://www.w3.org/2000/svg">'
            +     '<path d="M6 8 L54 8 L50 24 L10 24 Z" fill="url(#srSilverGrad)" stroke="#5a6068" stroke-width="1.2" stroke-linejoin="round"/>'
            +     '<path d="M6 8 L54 8 L52 4 L8 4 Z" fill="#e8ecf2" stroke="#5a6068" stroke-width="1"/>'
            +     '<text x="30" y="19" text-anchor="middle" font-size="7" font-weight="900" fill="#3a4048">925</text>'
            +     '<defs><linearGradient id="srSilverGrad" x1="0" y1="0" x2="0" y2="1">'
            +       '<stop offset="0%" stop-color="#f4f6fa"/><stop offset="50%" stop-color="#b8bec8"/><stop offset="100%" stop-color="#7a8088"/>'
            +     '</linearGradient></defs>'
            +   '</svg>'
            +   '<svg class="sr-diamond" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">'
            +     '<path d="M20 4 L34 16 L20 36 L6 16 Z" fill="url(#srDiaGrad)" stroke="#6090c0" stroke-width="1.2" stroke-linejoin="round"/>'
            +     '<path d="M6 16 L34 16" stroke="#6090c0" stroke-width="0.8"/>'
            +     '<path d="M20 4 L20 16" stroke="#9ed0ff" stroke-width="0.6" opacity="0.6"/>'
            +     '<path d="M14 16 L20 36" stroke="#9ed0ff" stroke-width="0.6" opacity="0.6"/>'
            +     '<path d="M26 16 L20 36" stroke="#9ed0ff" stroke-width="0.6" opacity="0.6"/>'
            +     '<defs><linearGradient id="srDiaGrad" x1="0" y1="0" x2="1" y2="1">'
            +       '<stop offset="0%" stop-color="#ffffff"/><stop offset="40%" stop-color="#c8e8ff"/><stop offset="100%" stop-color="#80b4f0"/>'
            +     '</linearGradient></defs>'
            +   '</svg>'
            +   '<span class="sr-sparkle sr-sparkle-1">✦</span>'
            +   '<span class="sr-sparkle sr-sparkle-2">✦</span>'
            +   '<span class="sr-sparkle sr-sparkle-3">✦</span>'
            + '</div>';
      break;
    case 'clock':
      // Oldest in stock tile — a clock face with hands that spin
      // backwards (rewinding through time). Suggests "this fish has
      // been here a while".
      glyph = '<svg class="sr-clock-svg" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">'
            +   '<circle cx="30" cy="30" r="24" fill="rgba(220,234,248,0.95)" stroke="rgba(120,140,180,0.95)" stroke-width="2"/>'
            +   '<circle cx="30" cy="30" r="20" fill="none" stroke="rgba(120,140,180,0.4)" stroke-width="0.6"/>'
            +   '<text x="30" y="14" text-anchor="middle" font-size="6" font-weight="900" fill="#3a4458">12</text>'
            +   '<text x="48" y="33" text-anchor="middle" font-size="6" font-weight="900" fill="#3a4458">3</text>'
            +   '<text x="30" y="52" text-anchor="middle" font-size="6" font-weight="900" fill="#3a4458">6</text>'
            +   '<text x="12" y="33" text-anchor="middle" font-size="6" font-weight="900" fill="#3a4458">9</text>'
            +   '<line class="sr-clock-hour" x1="30" y1="30" x2="30" y2="18" stroke="#1a2030" stroke-width="2.6" stroke-linecap="round"/>'
            +   '<line class="sr-clock-min" x1="30" y1="30" x2="30" y2="12" stroke="#1a2030" stroke-width="1.6" stroke-linecap="round"/>'
            +   '<circle cx="30" cy="30" r="2" fill="#1a2030"/>'
            + '</svg>';
      break;
    case 'heart':
      // Customer holds tile — a heart that beats. They're held FOR
      // someone. Three hearts pop and float upward.
      glyph = '<div class="sr-heart-wrap">'
            +   '<svg class="sr-heart-1" viewBox="0 0 40 36" xmlns="http://www.w3.org/2000/svg">'
            +     '<path d="M20 32 C 20 32, 4 22, 4 12 C 4 6, 9 2, 14 2 C 17 2, 20 4, 20 8 C 20 4, 23 2, 26 2 C 31 2, 36 6, 36 12 C 36 22, 20 32, 20 32 Z" fill="rgba(255,120,150,0.95)" stroke="rgba(180,40,80,0.9)" stroke-width="1.4"/>'
            +   '</svg>'
            +   '<svg class="sr-heart-2" viewBox="0 0 40 36" xmlns="http://www.w3.org/2000/svg">'
            +     '<path d="M20 32 C 20 32, 4 22, 4 12 C 4 6, 9 2, 14 2 C 17 2, 20 4, 20 8 C 20 4, 23 2, 26 2 C 31 2, 36 6, 36 12 C 36 22, 20 32, 20 32 Z" fill="rgba(255,140,170,0.92)" stroke="rgba(180,40,80,0.85)" stroke-width="1.4"/>'
            +   '</svg>'
            +   '<svg class="sr-heart-3" viewBox="0 0 40 36" xmlns="http://www.w3.org/2000/svg">'
            +     '<path d="M20 32 C 20 32, 4 22, 4 12 C 4 6, 9 2, 14 2 C 17 2, 20 4, 20 8 C 20 4, 23 2, 26 2 C 31 2, 36 6, 36 12 C 36 22, 20 32, 20 32 Z" fill="rgba(255,160,190,0.88)" stroke="rgba(180,40,80,0.8)" stroke-width="1.4"/>'
            +   '</svg>'
            + '</div>';
      break;
  }
  overlay.innerHTML = glyph;
  el.appendChild(overlay);
  // Auto-remove after 1.8s (longest animation in the set)
  setTimeout(function(){
    if(overlay && overlay.parentNode){
      overlay.parentNode.removeChild(overlay);
    }
  }, 1800);
};

// V0.141 — bouncePill: dedicated bouncy-ball animation for the four
// hero pills under the fish name. Decoupled from ltcFx.jelly because
// jelly sets inline `animation` which clobbered the entrance animation's
// `both` fill mode, making the reef-safe pill (which is also a flex
// status-pill) lose its opacity reference and disappear after click.
// This helper forces opacity:1 inline AND uses a class toggle so the
// CSS cascade stays clean.
window.bouncePill = function(el){
  if(!el) return;
  el.style.opacity = '1';
  el.classList.remove('bouncing');
  void el.offsetWidth;
  el.classList.add('bouncing');
  setTimeout(function(){ el.classList.remove('bouncing'); }, 760);
};

// V0.130 — universal tactile feedback delegate. Any tap on a chip, tile,
// or filter pill anywhere in the DOM gets a jelly squish without needing
// per-button wiring. Excludes .hold-undo (has its own animation) and
// elements that already opt out via data-no-jelly.
(function setupUniversalJelly(){
  const JELLY_SELECTOR = '.sh-tile,.sh-circle-btn,.inventory-chip-filter,.food-scope-chip,.food-toolbar-btn,.tank-pill,.filter-chip,.mode-btn';
  document.addEventListener('pointerdown', function(e){
    const el = e.target.closest && e.target.closest(JELLY_SELECTOR);
    if(!el) return;
    if(el.closest('.hold-undo')) return;
    if(el.dataset && el.dataset.noJelly) return;
    try { window.ltcFx && window.ltcFx.jelly && window.ltcFx.jelly(el); } catch(_){}
  }, true);
})();

// V0.127 — global hold-to-undo handler. v0.131 — shortened 2.5s → 1.25s.
(function setupHoldUndo(){
  const HOLD_DURATION = 1250;
  let activeBtn = null;
  let activeTimer = null;
  function cancelHold(){
    if(activeTimer){
      clearTimeout(activeTimer);
      activeTimer = null;
    }
    if(activeBtn){
      activeBtn.classList.remove('is-holding');
      activeBtn = null;
    }
  }
  document.addEventListener('pointerdown', function(e){
    const btn = e.target.closest && e.target.closest('.hold-undo');
    if(!btn) return;
    e.preventDefault();
    e.stopPropagation();
    cancelHold();
    activeBtn = btn;
    btn.classList.add('is-holding');
    try { btn.setPointerCapture && btn.setPointerCapture(e.pointerId); } catch(_){}
    activeTimer = setTimeout(function(){
      const fnName = btn.dataset.holdAction;
      const arg = btn.dataset.holdArg;
      btn.classList.remove('is-holding');
      btn.classList.add('is-completed');
      if(navigator.vibrate) try { navigator.vibrate([20, 30, 60]); } catch(_){}
      try { ltcFx.bubbles(btn); } catch(_){}
      const fn = window[fnName];
      if(typeof fn === 'function') fn(arg);
      // Reset visual after a moment
      setTimeout(function(){ btn.classList.remove('is-completed'); }, 600);
      activeBtn = null;
      activeTimer = null;
    }, HOLD_DURATION);
  }, true);
  ['pointerup','pointercancel','pointerleave','pointerout'].forEach(function(evt){
    document.addEventListener(evt, function(e){
      if(!activeBtn) return;
      // Allow pointerleave/pointerout on children of the button — only cancel
      // when actually leaving the button itself
      if((evt === 'pointerleave' || evt === 'pointerout') && e.target !== activeBtn) return;
      cancelHold();
    }, true);
  });
})();
const state = {
  viewMode: (window.matchMedia && window.matchMedia('(pointer: coarse) and (max-width: 900px)').matches) ? 'compact' : 'detailed', category:"All", search:"", sort:"featured", reefOnly:false, easyOnly:false, selectedId:null, mode:"stock", favorites:[], compareList:[], tankFilter:0, idleActive:false, inventoryManagerMode:'overview', inventoryGroupBy:'category', inventoryCollapsedGroups: new Set() };
const wikiImages = new Map();
const fishImages = new Map();
const STAFF_STORAGE_KEY = 'ltcStaffCatalogEdits.v2';
const STAFF_STORAGE_LEGACY_KEY = 'ltcStaffCatalogEdits.v1';
const STAFF_DB_NAME = 'ltc-fish-browser';
const STAFF_DB_VERSION = 1;
const STAFF_DB_STORE = 'kv';
const STAFF_DB_RECORD_KEY = 'staffCatalogEdits';
const STAFF_CUSTOM_CATALOG_KEY = '__customCatalog';
const IMAGE_CACHE_STORAGE_KEY = 'ltcFishImageCache.v1';
// v0.164 — Persisted list of all known tank codes. Tanks live in this
// list so they survive being emptied (a tank with 0 fish should still
// show up in the tank mover) and so manually-added tanks via the
// "Add new tank" button stick around between sessions.
const KNOWN_TANKS_STORAGE_KEY = 'ltcKnownTanks.v1';
const STAFF_HISTORY_FIELD = 'changeHistory';
const STAFF_UNDO_SOLD_FIELD = 'undoSoldSnapshot';
const STAFF_UNDO_LOSS_FIELD = 'undoLossSnapshot';
const STAFF_UNDO_QUARANTINE_FIELD = 'undoQuarantineSnapshot';
const STAFF_UNDO_HOLD_FIELD = 'undoHoldSnapshot';
const STAFF_UNDO_SNAPSHOT_FIELDS = [STAFF_UNDO_SOLD_FIELD, STAFF_UNDO_LOSS_FIELD, STAFF_UNDO_QUARANTINE_FIELD, STAFF_UNDO_HOLD_FIELD];
const STAFF_MANAGED_FIELDS = ['price','tankCode','stockSize','stockNumber','staffNote','inStock','soldAt','lossAt','quarantine','quarantineUntil','staffPhotos','quantity','arrivalDate','vendor','reserved','reservedFor','updatedAt','lastAction','saleHistory',STAFF_HISTORY_FIELD,...STAFF_UNDO_SNAPSHOT_FIELDS];
const STOCK_SIZE_OPTIONS = ['—','Tiny','Small','Small-Medium','Medium','Medium-Large','Large','X-Large','XX-Large','Frag'];
const CATEGORY_SEARCH_ALIASES = {
  'Gobies & Blennies': ['goby','gobyfish','blenny','lawnmower','fang blenny'],
  'Basslets & Dottybacks': ['basslet','dottyback','orchid'],
  'Other Fish': ['oddball','odd ball','misc fish'],
  'Inverts': ['invert','invertebrate','cleanup crew','microfauna','cucumber','worm'],
  'Starfish': ['star','serpent star','brittle star'],
  'Snails': ['snail','conch','slug','nudibranch'],
  'Shrimp': ['cleaner shrimp','peppermint shrimp','pistol shrimp'],
  'Crabs': ['crab','hermit','emerald crab','pom pom crab'],
  'Urchins': ['urchin'],
  'Clams': ['clam','scallop'],
  'Puffers': ['puffer','boxfish','cowfish'],
  'Triggerfish': ['trigger'],
  'Lionfish': ['lion'],
  'Cardinalfish': ['cardinal'],
  'Butterflyfish': ['butterfly'],
  'Rabbitfish': ['foxface','rabbitfish'],
  'Wrasses': ['wrasse'],
  'Tangs': ['tang','surgeonfish'],
  'Angelfish': ['angel'],
  'Anthias': ['anthias'],
  'Clownfish': ['clown','anemonefish'],
  'Damsels': ['damselfish','damsel'],
  'Eels': ['eel'],
  'Hawkfish': ['hawk']
};
function slugifyCatalogValue(value=''){
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'item';
}
function catalogCategoryOptions(){
  return [...new Set(FISH.map(item => item.category).filter(Boolean))]
    .sort((a,b) => inventoryCategoryLabel(a).localeCompare(inventoryCategoryLabel(b)));
}
function isCustomCatalogItem(item){
  return !!(item && item.isCustomCatalog);
}
function createUncatalogedFishEntry({name='', category='Other Fish', quantity=1, size='Small', price='', arrivalDate='', tank='', aliases='', scientific='', vendor='', staffNote=''} = {}){
  const today = new Date().toISOString().slice(0,10);
  const cleanName = String(name || '').trim();
  const aliasList = String(aliases || '').split(',').map(v => v.trim()).filter(Boolean);
  const parsedPrice = parseCurrencyInput(price);
  const cleanCategory = String(category || 'Other Fish').trim() || 'Other Fish';
  const cleanScientific = String(scientific || '').trim() || 'Species review pending';
  const cleanVendor = String(vendor || '').trim();
  const cleanTank = String(tank || '').trim().toUpperCase();
  const cleanNote = String(staffNote || '').trim();
  const cleanArrival = String(arrivalDate || '').trim() || today;
  const cleanSize = normalizeStockSizeValue(size) || 'Small';
  const normalizedQty = Math.max(1, parseInt(quantity || '1', 10) || 1);
  const id = `custom-${slugifyCatalogValue(cleanName)}-${Date.now().toString(36)}`;
  return {
    id,
    name: cleanName,
    name_es: cleanName,
    scientific: cleanScientific,
    category: cleanCategory,
    aliases: aliasList,
    overview: 'Temporary staff-added entry. Full catalog details and care notes still need review.',
    overview_es: 'Entrada temporal agregada por el personal. Los detalles completos del catálogo y cuidado aún necesitan revisión.',
    diet: 'Ask staff',
    diet_es: 'Consulte al personal',
    origin: 'Store-added entry',
    origin_es: 'Entrada agregada por la tienda',
    minTank: 'Ask staff',
    maxSize: 'Unknown',
    behavior: 'Temporary entry pending full species review.',
    feedingNotes: 'Use staff guidance until the full care profile is added.',
    buyingGuidance: 'Listed so staff can sell it now and complete the catalog profile later.',
    recognitionNotes: 'Temporary uncataloged entry awaiting full species review.',
    aggression: 35,
    coralRisk: 20,
    invertRisk: 20,
    careDifficulty: 40,
    stockSize: cleanSize,
    inStock: true,
    quantity: normalizedQty,
    arrivalDate: cleanArrival,
    photoTitle: cleanName,
    badges: ['Catalog Review'],
    isCustomCatalog: true,
    catalogPending: true,
    water: {ph_low:null,ph_high:null,sal_low:null,sal_high:null,temp_low:null,temp_high:null},
    lastAction: 'staff-custom-add'
  , ...(parsedPrice !== null ? {price: parsedPrice} : {}), ...(cleanTank ? {tankCode: cleanTank} : {}), ...(cleanVendor ? {vendor: cleanVendor} : {}), ...(cleanNote ? {staffNote: cleanNote} : {})};
}
function exportCustomCatalogItem(item){
  return JSON.parse(JSON.stringify(item));
}
function removeCustomCatalogEntries(){
  for(let i = FISH.length - 1; i >= 0; i--){
    if(isCustomCatalogItem(FISH[i])) FISH.splice(i, 1);
  }
  if(typeof rebuildFishById === 'function') rebuildFishById();
}
function applyCustomCatalogPayload(entries){
  removeCustomCatalogEntries();
  if(!Array.isArray(entries)) return;
  entries.forEach(raw => {
    if(!raw || typeof raw !== 'object') return;
    const entry = JSON.parse(JSON.stringify(raw));
    entry.isCustomCatalog = true;
    entry.catalogPending = entry.catalogPending !== false;
    entry.aliases = Array.isArray(entry.aliases) ? entry.aliases.filter(Boolean) : [];
    if(!entry.id) entry.id = `custom-${slugifyCatalogValue(entry.name || entry.scientific || 'item')}-${Date.now().toString(36)}`;
    if(!entry.name) entry.name = 'Store-added item';
    if(!entry.name_es) entry.name_es = entry.name;
    if(!entry.category) entry.category = 'Other Fish';
    if(!entry.scientific) entry.scientific = 'Species review pending';
    if(!entry.overview) entry.overview = 'Temporary staff-added entry. Full catalog details and care notes still need review.';
    if(!entry.diet) entry.diet = 'Ask staff';
    if(!entry.origin) entry.origin = 'Store-added entry';
    if(!entry.minTank) entry.minTank = 'Ask staff';
    if(!entry.maxSize) entry.maxSize = 'Unknown';
    if(!Number.isFinite(Number(entry.aggression))) entry.aggression = 35;
    if(!Number.isFinite(Number(entry.coralRisk))) entry.coralRisk = 20;
    if(!Number.isFinite(Number(entry.invertRisk))) entry.invertRisk = 20;
    if(!Number.isFinite(Number(entry.careDifficulty))) entry.careDifficulty = 40;
    if(!entry.water) entry.water = {ph_low:null,ph_high:null,sal_low:null,sal_high:null,temp_low:null,temp_high:null};
    FISH.push(entry);
  });
  if(typeof rebuildFishById === 'function') rebuildFishById();
}
function getCustomCatalogEntries(){
  return FISH.filter(isCustomCatalogItem).map(exportCustomCatalogItem);
}
function normalizeCustomCatalogEntries(){
  FISH.forEach(item => {
    if(!isCustomCatalogItem(item)) return;
    item.name_es = item.name_es || item.name;
    item.aliases = Array.isArray(item.aliases) ? item.aliases.filter(Boolean) : [];
  });
}
function normalizeStockSizeValue(value){
  if(value === undefined || value === null) return '';
  const cleaned = String(value).trim();
  if(!cleaned || /^unknown$/i.test(cleaned) || cleaned === '--' || cleaned === '—') return '';
  return cleaned;
}
function displayStockSize(value){
  const cleaned = normalizeStockSizeValue(value);
  return cleaned || '—';
}
function normalizeQuantityValue(value){
  if(value === undefined || value === null || value === '') return '';
  const num = parseInt(value, 10);
  if(Number.isNaN(num) || num < 0) return '';
  return num;
}
function displayQuantityValue(value){
  const normalized = normalizeQuantityValue(value);
  return normalized === '' ? '—' : String(normalized);
}
function formatDateShort(value){
  if(!value) return '—';
  const d = new Date(value);
  if(Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {month:'short', day:'numeric'});
}
function formatDateTimeShort(value){
  if(!value) return '—';
  const d = new Date(value);
  if(Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'});
}
function touchStaffRecord(fish, action){
  fish.updatedAt = Date.now();
  fish.lastAction = action;
}
function pushStaffHistory(fish, action){
  if(!fish) return;
  const before = getStaffSnapshot(fish, {excludeHistory:true, excludePhotos:true, excludeUndoSnapshots:true});
  if(!fish[STAFF_HISTORY_FIELD] || !Array.isArray(fish[STAFF_HISTORY_FIELD])) fish[STAFF_HISTORY_FIELD] = [];
  fish[STAFF_HISTORY_FIELD].push({time: Date.now(), action, before});
  if(fish[STAFF_HISTORY_FIELD].length > 20) fish[STAFF_HISTORY_FIELD] = fish[STAFF_HISTORY_FIELD].slice(-20);
}
function setUndoSnapshot(fish, field, actionLabel){
  if(!fish || !field) return;
  fish[field] = {
    time: Date.now(),
    action: actionLabel || field,
    before: getStaffSnapshot(fish, {excludePhotos:true, excludeUndoSnapshots:true})
  };
}
function getUndoSnapshot(fish, field){
  if(!fish || !field) return null;
  const snapshot = fish[field];
  return snapshot && snapshot.before ? snapshot : null;
}
function clearUndoSnapshot(fish, field){
  if(!fish || !field) return;
  delete fish[field];
}
function restoreFishSnapshot(fish, snapshot){
  if(!fish) return;
  const baseline = STAFF_BASELINE.get(fish.id) || {};
  STAFF_MANAGED_FIELDS.forEach(field => {
    if(field === STAFF_HISTORY_FIELD) return;
    if(snapshot && Object.prototype.hasOwnProperty.call(snapshot, field)) fish[field] = cloneValue(snapshot[field]);
    else if(Object.prototype.hasOwnProperty.call(baseline, field)) fish[field] = cloneValue(baseline[field]);
    else delete fish[field];
  });
}
function staffUndoFishLastChange(id){
  const fish = FISH.find(f=>f.id===id);
  if(!fish || !Array.isArray(fish[STAFF_HISTORY_FIELD]) || !fish[STAFF_HISTORY_FIELD].length){
    showToast('No recent change to undo');
    return;
  }
  const entry = fish[STAFF_HISTORY_FIELD].pop();
  restoreFishSnapshot(fish, entry.before || {});
  touchStaffRecord(fish, `undo:${entry.action}`);
  persistStaffEdits();
  renderInventoryManager();
  renderInventoryHistoryOverlay();
  render();
  showToast(`${L(fish,'name')} change undone`);
}
function staffUndoLastChange(){
  let targetFish = null;
  let targetEntry = null;
  FISH.forEach(fish => {
    const history = Array.isArray(fish[STAFF_HISTORY_FIELD]) ? fish[STAFF_HISTORY_FIELD] : [];
    const latest = history[history.length - 1];
    if(latest && (!targetEntry || latest.time > targetEntry.time)){
      targetFish = fish;
      targetEntry = latest;
    }
  });
  if(!targetFish || !targetEntry){
    showToast('No recent change to undo');
    return;
  }
  staffUndoFishLastChange(targetFish.id);
}
function recentHistoryHtml(item, limit=3){
  const history = Array.isArray(item[STAFF_HISTORY_FIELD]) ? item[STAFF_HISTORY_FIELD].slice(-limit).reverse() : [];
  if(!history.length) return '<div class="inventory-history empty">No recent staff changes</div>';
  return `<div class="inventory-history">${history.map(entry => `<span class="inventory-history-chip">${entry.action} · ${formatDateTimeShort(entry.time)}</span>`).join('')}</div>`;
}

function saleHistoryFor(item){
  return Array.isArray(item?.saleHistory) ? item.saleHistory : [];
}
function recordSaleHistory(item, quantity=1){
  if(!item) return;
  if(!Array.isArray(item.saleHistory)) item.saleHistory = [];
  item.saleHistory.push({
    time: Date.now(),
    price: item.onSale && item.salePrice ? item.salePrice : item.price || null,
    quantity: quantity,
    tankCode: item.tankCode || '',
    stockSize: item.stockSize || '',
    stockNumber: item.stockNumber || ''
  });
  if(item.saleHistory.length > 30) item.saleHistory = item.saleHistory.slice(-30);
}
function latestSaleHistoryEntry(item){
  const history = saleHistoryFor(item);
  return history.length ? history[history.length - 1] : null;
}
function latestSaleHistoryLabel(item){
  const latest = latestSaleHistoryEntry(item);
  if(!latest) return '—';
  const price = latest.price ? formatMoney(latest.price) : 'Unknown';
  return `${price} · ${formatDateShort(latest.time)}`;
}

function recentSaleEntries(item, limit=6){
  return saleHistoryFor(item).slice(-limit).reverse();
}

function globalRecentSales(limit=8){
  const rows = [];
  FISH.forEach(item => {
    saleHistoryFor(item).forEach(entry => rows.push({item, entry}));
  });
  rows.sort((a,b) => Number(b.entry?.time || 0) - Number(a.entry?.time || 0));
  return rows.slice(0, limit);
}
function recentSalesMetrics(limit=30){
  const rows = globalRecentSales(limit);
  const totalRevenue = rows.reduce((sum, row) => sum + (Number(row.entry?.price || 0) * Number(row.entry?.quantity || 1)), 0);
  const uniqueFish = new Set(rows.map(row => row.item.id)).size;
  return {rows, totalRevenue, uniqueFish};
}
function allStockSizeOptions(){
  const fromScale = (typeof SIZE_SCALE !== 'undefined' && SIZE_SCALE) ? Object.keys(SIZE_SCALE).filter(key => key && key !== '—') : [];
  const extra = ['Tiny','Small','Small-Medium','Medium','Medium-Large','Large','X-Large','XX-Large'];
  return [...new Set([...fromScale, ...extra])];
}
function parseCurrencyInput(value){
  const raw = String(value ?? '').trim();
  if(!raw) return null;
  const normalized = raw.replace(/[$,\s]/g, '');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}
function hasNoAssignedTank(item){
  return !!(item && item.inStock && !String(item.tankCode || '').trim());
}
function aliasSummary(item, limit=2){
  const aliases = Array.isArray(item?.aliases) ? item.aliases.filter(Boolean) : [];
  return aliases.slice(0, limit).join(' · ');
}
function sortedFishOptions(){
  return FISH.slice().sort((a,b) => L(a,'name').localeCompare(L(b,'name'))).map(item => `${L(item,'name')} — ${item.scientific}`);
}
function fishPickerLabel(item){
  return item ? `${L(item,'name')} — ${item.scientific}` : '';
}
function findFishByPickerLabel(label=''){
  const target = String(label || '').trim().toLowerCase();
  if(!target) return null;
  return FISH.find(item => fishPickerLabel(item).toLowerCase() === target)
    || FISH.find(item => L(item,'name').toLowerCase() === target)
    || null;
}
function receiveFishMatches(query='', category='all', limit=18){
  const q = String(query || '').trim().toLowerCase();
  let items = FISH.slice();
  if(category && category !== 'all') items = items.filter(item => item.category === category);
  if(q){
    items = items.filter(item => inventorySearchText(item).includes(q));
  }
  items.sort((a,b) => {
    const aName = L(a,'name').toLowerCase();
    const bName = L(b,'name').toLowerCase();
    const aStarts = q && aName.startsWith(q) ? 0 : 1;
    const bStarts = q && bName.startsWith(q) ? 0 : 1;
    if(aStarts !== bStarts) return aStarts - bStarts;
    return aName.localeCompare(bName);
  });
  return items.slice(0, limit);
}
function bindReceiveFishSearchHelper(){
  const fishField = document.getElementById('inputField0');
  const fieldsEl = document.getElementById('inputModalFields');
  if(!fishField || !fieldsEl) return;
  let picker = fieldsEl.querySelector('.receive-picker-shell');
  if(!picker){
    picker = document.createElement('div');
    picker.className = 'receive-picker-shell';
    picker.innerHTML = `
      <div class="receive-picker-head">
        <strong>Quick pick a fish / invert</strong>
        <span>Search by name or tap a category, then choose the right animal.</span>
      </div>
      <div class="receive-picker-actions"><button type="button" class="input-helper-btn subtle" data-open-uncataloged="1">Not on the list? Add it anyway</button></div>
      <div class="receive-picker-chips" data-receive-cat-chips></div>
      <div class="receive-picker-results" data-receive-results></div>
    `;
    const firstField = fieldsEl.querySelector('.input-modal-field');
    if(firstField) firstField.after(picker); else fieldsEl.prepend(picker);
  }
  const chipRoot = picker.querySelector('[data-receive-cat-chips]');
  const resultRoot = picker.querySelector('[data-receive-results]');
  if(!chipRoot || !resultRoot) return;
  const uncatalogedBtn = picker.querySelector('[data-open-uncataloged]');
  if(uncatalogedBtn && !uncatalogedBtn.dataset.bound){
    uncatalogedBtn.addEventListener('click', () => openUncatalogedReceiveFlow({
      name: fishField.value || '',
      category: picker.dataset.category && picker.dataset.category !== 'all' ? picker.dataset.category : 'Other Fish'
    }));
    uncatalogedBtn.dataset.bound = '1';
  }
  if(!picker.dataset.category){
    picker.dataset.category = 'all';
    const catalogCats = [...new Set(FISH.map(f => f.category).filter(Boolean))]
      .sort((a, b) => inventoryCategoryLabel(a).localeCompare(inventoryCategoryLabel(b)));
    const quickCats = ['all', ...catalogCats];
    chipRoot.innerHTML = quickCats.map(cat => `<button type="button" class="receive-cat-chip ${cat==='all' ? 'is-active' : ''}" data-receive-category="${cat}">${cat==='all' ? 'All' : inventoryCategoryLabel(cat)}</button>`).join('');
    chipRoot.querySelectorAll('[data-receive-category]').forEach(btn => btn.addEventListener('click', () => {
      picker.dataset.category = btn.dataset.receiveCategory;
      chipRoot.querySelectorAll('[data-receive-category]').forEach(chip => chip.classList.toggle('is-active', chip === btn));
      renderMatches();
    }));
  }
  const renderMatches = () => {
    const category = picker.dataset.category || 'all';
    const matches = receiveFishMatches(fishField.value, category, 14);
    const selectedFish = findFishByPickerLabel(fishField.value);
    resultRoot.innerHTML = matches.length ? matches.map(item => {
      const selected = selectedFish && selectedFish.id === item.id;
      const aliases = aliasSummary(item, 2);
      return `<button type="button" class="receive-match ${selected ? 'is-selected' : ''}" data-receive-id="${item.id}"><strong>${L(item,'name')}</strong><span>${item.scientific}</span><small>${inventoryCategoryLabel(item.category)}${aliases ? ` · Also called: ${aliases}` : ''}</small></button>`;
    }).join('') : '<div class="receive-match-empty">No close matches. Try a simpler name or switch the category chip.</div>';
    resultRoot.querySelectorAll('[data-receive-id]').forEach(btn => btn.addEventListener('click', () => {
      const fish = FISH.find(item => item.id === btn.dataset.receiveId);
      if(!fish) return;
      fishField.value = fishPickerLabel(fish);
      fishField.dispatchEvent(new Event('change', {bubbles:true}));
      renderMatches();
      fishField.focus();
    }));
    const fish = findFishByPickerLabel(fishField.value);
    const oldHelper = fieldsEl.querySelector('.input-modal-fish-helper');
    if(oldHelper) oldHelper.remove();
    if(fish){
      mountModalFishHelper(fish, {
        fieldIds:{price:'inputField3', arrivalDate:'inputField4', tank:'inputField5', stockNumber:'inputField6', vendor:'inputField7', stockSize:'inputField2', quantity:'inputField1'},
        includeAllButton:true,
        limit:8
      });
    }
  };
  fishField.setAttribute('autocomplete','off');
  fishField.placeholder = 'Search fish or invert…';
  if(!fishField.dataset.receiveBound){
    fishField.addEventListener('input', renderMatches);
    fishField.addEventListener('change', renderMatches);
    fishField.dataset.receiveBound = '1';
  }
  renderMatches();
}
function wasRecentlySoldOut(fish){
  if(!fish || fish.inStock) return false;
  if(!fish.soldAt) return false;
  const soldTime = new Date(fish.soldAt).getTime();
  if(!Number.isFinite(soldTime)) return false;
  const ageMs = Date.now() - soldTime;
  return ageMs >= 0 && ageMs < (24 * 60 * 60 * 1000);
}
function _commitBulkReceive(fish, formValues={}){
  const today = new Date().toISOString().slice(0,10);
  const quantity = Math.max(1, parseInt(formValues.qty || '1', 10) || 1);
  const existingQty = Number.isFinite(Number(fish.quantity)) ? Number(fish.quantity) : (fish.inStock ? 1 : 0);
  const parsedPrice = parseCurrencyInput(formValues.price);
  const trimmedTank = String(formValues.tank || '').trim().toUpperCase();
  const trimmedStock = String(formValues.stockNumber || '').trim();
  const trimmedVendor = String(formValues.vendor || '').trim();
  const trimmedArrival = String(formValues.arrivalDate || '').trim() || today;
  const wasStockedBefore = !!fish.inStock;
  const wasAlreadyStocked = fish.inStock && Number.isFinite(Number(fish.quantity));
  const action = wasStockedBefore ? 'bulk-restock' : (quantity > 1 ? 'bulk-receive' : 'receive');
  pushStaffHistory(fish, action);
  fish.inStock = true;
  fish.quantity = wasAlreadyStocked ? existingQty + quantity : quantity;
  fish.stockSize = normalizeStockSizeValue(formValues.size) || fish.stockSize || 'Small';
  if(parsedPrice !== null) fish.price = parsedPrice;
  if(trimmedTank) fish.tankCode = trimmedTank;
  if(trimmedStock) fish.stockNumber = trimmedStock;
  if(trimmedVendor) fish.vendor = trimmedVendor;
  fish.arrivalDate = trimmedArrival;
  delete fish.soldAt;
  delete fish.lossAt;
  delete fish.quarantine;
  delete fish.quarantineUntil;
  clearHoldState(fish);
  touchStaffRecord(fish, action);
  persistStaffEdits();
  const displayName = L(fish, 'name');
  const search = document.getElementById('inventorySearch');
  const statusEl = document.getElementById('inventoryStatusFilter');
  const categoryEl = document.getElementById('inventoryCategoryFilter');
  // v0.155 — was setting search to the just-received fish name which
  // filtered the inventory to that one fish. Counterproductive: you
  // want to see your full in-stock inventory after a receive, not just
  // the entry you added. Now clears the search and shows all in-stock.
  if(search) search.value = '';
  if(statusEl) statusEl.value = 'instock';
  if(categoryEl) categoryEl.value = 'all';
  state.inventoryManagerMode = 'catalog';
  renderInventoryManager();
  render();
  showToast(wasStockedBefore
    ? `${displayName} restocked · qty ${fish.quantity}`
    : `${displayName} received (was out) · qty ${fish.quantity}`);
}
// v0.150 — Receive Flow custom 2-step modal. Replaces the old
// showInputModal-based wall-of-fields layout. Step 1 is a focused fish
// picker with prominent search + rainbow category chips + visual result
// cards. Step 2 is a themed form with essentials up top + collapsible
// "more details" expander. Reuses _commitBulkReceive() so the existing
// receive logic (history, persistence, toast, etc.) doesn't change.
window.receiveFlow = (function(){
  var state = {
    step: 1,
    selectedFish: null,
    search: '',
    category: 'all',
    size: 'Small',
    tank: '',
    moreOpen: false
  };
  var searchTimer = null;
  var categories = ['all','Tangs','Angelfish','Wrasses','Clownfish','Gobies & Blennies','Damsels','Basslets & Dottybacks','Cardinalfish','Anthias','Butterflyfish','Hawkfish','Rabbitfish','Triggerfish','Puffers','Eels','Lionfish','Other Fish','Shrimp','Crabs','Snails','Urchins','Starfish','Clams','Inverts'];

  function open(){
    var overlay = document.getElementById('receiveFlowOverlay');
    if(!overlay) return;
    state.step = 1;
    state.selectedFish = null;
    state.search = '';
    state.category = 'all';
    state.size = 'Small';
    state.tank = '';
    state.moreOpen = false;
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    renderCategoryChips();
    renderResults();
    updateStepUI();
    setTimeout(function(){
      var input = document.getElementById('rfSearchInput');
      if(input) input.focus();
    }, 200);
  }

  function close(){
    var overlay = document.getElementById('receiveFlowOverlay');
    if(!overlay) return;
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
    state.selectedFish = null;
    stopChipWaves();
  }

  function goToStep1(){
    state.step = 1;
    updateStepUI();
  }

  function goToStep2(){
    if(!state.selectedFish) return;
    state.step = 2;
    // Pre-fill from existing fish data if it has any
    var fish = state.selectedFish;
    state.size = fish.stockSize || 'Small';
    state.tank = fish.tankCode || '';
    var qtyInput = document.getElementById('rfQty');
    if(qtyInput) qtyInput.value = '1';
    var priceInput = document.getElementById('rfPrice');
    if(priceInput) priceInput.value = fish.price ? String(fish.price) : '';
    var stockNumInput = document.getElementById('rfStockNum');
    if(stockNumInput) stockNumInput.value = fish.stockNumber || '';
    var vendorInput = document.getElementById('rfVendor');
    if(vendorInput) vendorInput.value = fish.vendor || '';
    var arrivalInput = document.getElementById('rfArrival');
    if(arrivalInput) arrivalInput.value = new Date().toISOString().slice(0,10);
    // v0.151 — propagate the selected fish's category color to the step 2
    // body so the entire form picks up the accent (active size pill,
    // field icon glows, focus rings, submit button shadow, etc.)
    var step2 = document.getElementById('rfStep2Body');
    if(step2){
      var col = catColor(fish.category || 'Other Fish');
      step2.style.setProperty('--rfc', col[0]);
      step2.style.setProperty('--rfc-rgb', col[1]);
    }
    renderSelectedCard();
    renderSizePills();
    renderTankPills();
    updateStepUI();
    setTimeout(function(){
      if(priceInput) priceInput.focus();
    }, 200);
  }

  function selectFish(id){
    var fish = (typeof getFishById === 'function') ? getFishById(id) : FISH.find(function(f){return f.id === id});
    if(!fish) return;
    state.selectedFish = fish;
    goToStep2();
  }

  function setCategory(cat){
    state.category = cat;
    renderCategoryChips();
    renderResults();
  }

  function setSearchInput(val){
    state.search = val || '';
    var clearBtn = document.getElementById('rfSearchClear');
    if(clearBtn) clearBtn.hidden = !state.search;
    if(searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(function(){
      searchTimer = null;
      renderResults();
    }, 120);
  }

  function clearSearch(){
    state.search = '';
    var input = document.getElementById('rfSearchInput');
    if(input) input.value = '';
    var clearBtn = document.getElementById('rfSearchClear');
    if(clearBtn) clearBtn.hidden = true;
    renderResults();
    if(input) input.focus();
  }

  function setSize(size){
    state.size = size;
    // v0.154 — instead of calling renderSizePills() which rebuilds the
    // entire row HTML (looking like a broken reload), just toggle the
    // is-active class on the right pill. The row stays mounted, the
    // entrance animations don't replay, and the click feels instant.
    var host = document.getElementById('rfSizePills');
    if(!host) return;
    var pills = host.querySelectorAll('.rf-size-pill');
    pills.forEach(function(p){
      var label = p.querySelector('.rf-size-pill-label');
      var pillSize = label ? label.textContent : '';
      if(pillSize === size){
        p.classList.add('is-active');
      } else {
        p.classList.remove('is-active');
      }
    });
  }

  function setTank(code){
    state.tank = code;
    var host = document.getElementById('rfTankPills');
    if(!host) return;
    // v0.158 — label text changed from "No tank" to "NO" to fit the
    // round orb shape, so the old label-text comparison doesn't work.
    // Match on data-tank-i instead. Index 0 = no tank, 1=A, 2=B, etc.
    var tanks = ['','A','B','C','D','E','F'];
    var targetIdx = tanks.indexOf(code);
    var pills = host.querySelectorAll('.rf-tank-pill');
    pills.forEach(function(p){
      var pillIdx = parseInt(p.getAttribute('data-tank-i') || '-1', 10);
      if(pillIdx === targetIdx){
        p.classList.add('is-active');
      } else {
        p.classList.remove('is-active');
      }
    });
  }

  function toggleMore(){
    // v0.152 — no-op. The "More details" expander has been removed;
    // tank/stock#/arrival/vendor are always visible now. Function
    // kept as a no-op so any inline references don't error.
  }

  function openAddAnyway(){
    // Pre-fill the uncatalogued flow with the current search query
    var prefill = state.search ? {name: state.search} : {};
    close();
    setTimeout(function(){
      if(typeof openUncatalogedReceiveFlow === 'function') openUncatalogedReceiveFlow(prefill);
    }, 240);
  }

  function submit(){
    if(!state.selectedFish){ showToast('Pick a fish first'); return; }
    var qty = document.getElementById('rfQty')?.value || '1';
    var price = document.getElementById('rfPrice')?.value || '';
    var stockNumber = document.getElementById('rfStockNum')?.value || '';
    var vendor = document.getElementById('rfVendor')?.value || '';
    var arrivalDate = document.getElementById('rfArrival')?.value || '';
    var formValues = {
      qty: qty,
      size: state.size,
      price: price,
      arrivalDate: arrivalDate,
      tank: state.tank,
      stockNumber: stockNumber,
      vendor: vendor
    };
    var btn = document.getElementById('rfSubmitBtn');
    if(btn){
      btn.classList.remove('is-firing');
      void btn.offsetWidth;
      btn.classList.add('is-firing');
      if(typeof ltcFx !== 'undefined' && ltcFx.bubbles){
        try { ltcFx.bubbles(btn, {count:18}); } catch(_){}
      }
    }
    var fish = state.selectedFish;
    setTimeout(function(){
      if(typeof wasRecentlySoldOut === 'function' && wasRecentlySoldOut(fish)){
        if(typeof showConfirmModal === 'function'){
          showConfirmModal(
            'This fish sold earlier today',
            L(fish,'name') + ' was marked sold within the last 24 hours. Are you sure you want to mark it received again?',
            function(){ _commitBulkReceive(fish, formValues); afterReceiveCleanup(fish); },
            {confirmText:'Mark received'}
          );
          return;
        }
      }
      _commitBulkReceive(fish, formValues);
      afterReceiveCleanup(fish);
    }, 280);
  }

  // v0.154 — post-receive cleanup. The previous flow had two bugs:
  //   1. After commit, close() removed the receive flow overlay but did
  //      NOT explicitly re-open or refocus the inventory manager. If the
  //      receive flow was the only visible overlay, you'd land on a stale
  //      view underneath.
  //   2. The 2-minute idle timer (resetIdleTimer) wasn't being reset
  //      after the commit, so if Chris paused to look at the success
  //      state, the screensaver could fire and exit staff mode entirely.
  // This function fixes both: explicitly opens inventory if it's not
  // already open, and pings the idle timer so the user has the full
  // 2-minute window starting fresh from the receive completion.
  function afterReceiveCleanup(fish){
    close();
    // Reset idle timer so screensaver doesn't fire immediately
    if(typeof resetIdleTimer === 'function') resetIdleTimer();
    // Ensure inventory is visible. If it's not currently shown, open it.
    var invOverlay = document.getElementById('inventoryOverlay');
    if(invOverlay && !invOverlay.classList.contains('show')){
      if(typeof openInventoryManager === 'function') openInventoryManager();
    }
    // Show a clear success notification with the fish name and qty
    if(fish && typeof showToast === 'function'){
      var qtyMsg = fish.quantity ? ' · qty ' + fish.quantity : '';
      showToast('✓ ' + L(fish,'name') + ' added to stock' + qtyMsg);
    }
  }

  // ─── RENDERERS ─────────────────────────────────────────────────

  // Per-category accent colors. Pulled from the existing rainbow palette
  // used by catalog category rows + the new tank chips strip. Each chip
  // gets its own color so the picker doesn't read as a wall of green.
  var CAT_COLORS = {
    'all':                   ['#f4fbff', '244,251,255'],
    'Tangs':                 ['#6ca8ff', '108,168,255'],
    'Angelfish':             ['#ffa850', '255,168,80'],
    'Wrasses':               ['#c88aff', '200,138,255'],
    'Clownfish':             ['#ff9050', '255,144,80'],
    'Gobies & Blennies':     ['#6ed884', '110,216,132'],
    'Damsels':               ['#5ed4dc', '94,212,220'],
    'Basslets & Dottybacks': ['#e870c8', '232,112,200'],
    'Cardinalfish':          ['#f06060', '240,96,96'],
    'Anthias':               ['#ff7faa', '255,127,170'],
    'Butterflyfish':         ['#ffd84a', '255,216,74'],
    'Hawkfish':              ['#ffb84a', '255,184,74'],
    'Rabbitfish':            ['#b8e860', '184,232,96'],
    'Triggerfish':           ['#d04860', '208,72,96'],
    'Puffers':               ['#80c8ff', '128,200,255'],
    'Eels':                  ['#4cb898', '76,184,152'],
    'Lionfish':              ['#e85060', '232,80,96'],
    'Other Fish':            ['#9eb4c8', '158,180,200'],
    'Shrimp':                ['#ff8a78', '255,138,120'],
    'Crabs':                 ['#d88a4a', '216,138,74'],
    'Snails':                ['#c4a060', '196,160,96'],
    'Urchins':               ['#8c70c8', '140,112,200'],
    'Starfish':              ['#e8c450', '232,196,80'],
    'Clams':                 ['#80d8b8', '128,216,184'],
    'Inverts':               ['#5ed4c0', '94,212,192']
  };

  function catColor(cat){ return CAT_COLORS[cat] || ['#7bcfff','123,207,255']; }

  function renderCategoryChips(){
    var host = document.getElementById('rfCatChips');
    if(!host) return;
    var html = categories.map(function(cat){
      var col = catColor(cat);
      var label = cat === 'all' ? 'All' : cat;
      var active = state.category === cat ? ' is-active' : '';
      var safe = String(cat).replace(/'/g, "\\'");
      // v0.151 — chips are now water-wave canvas fills. Each chip has:
      //   1. A <canvas> sized to the chip that paints a sloshing wave
      //      in the chip's category accent color (driven by the shared
      //      chipWaveLoop below — single rAF loop, not 25 separate ones)
      //   2. The label text on top of the canvas with z-index
      // Active chips get a more saturated wave + glow ring; inactive
      // chips get a dimmer wave so the active one stands out.
      return '<button type="button" class="rf-cat-chip' + active + '"' +
        ' style="--rfc:' + col[0] + ';--rfc-rgb:' + col[1] + '"' +
        ' data-cat-key="' + safe + '"' +
        ' onclick="ltcFx.jelly(this);receiveFlow.setCategory(\'' + safe + '\')">' +
        '<canvas class="rf-cat-chip-canvas"></canvas>' +
        '<span class="rf-cat-chip-label">' + label + '</span>' +
        '</button>';
    }).join('');
    host.innerHTML = html;
    // After DOM insert, wire each canvas into the wave loop
    requestAnimationFrame(function(){
      mountChipWaves(host);
    });
  }

  // ─── Water wave engine (shared rAF loop for all chips) ──────────
  // Pulled from LTC_Water_Gauge_v8.html. One global loop iterates all
  // mounted chip canvases and paints them in lock-step. Loop pauses
  // automatically when the receive flow overlay is closed (no DOM
  // visible = no draw calls). 30fps cap to keep total cost minimal.
  var chipDrawFns = [];
  var chipRafId = null;
  var chipLastFrame = 0;
  var CHIP_FRAME_INTERVAL = 1000 / 30; // 30fps target

  function chipWaveLoop(now){
    if(!chipDrawFns.length){ chipRafId = null; return; }
    chipRafId = requestAnimationFrame(chipWaveLoop);
    if(now - chipLastFrame < CHIP_FRAME_INTERVAL) return;
    chipLastFrame = now;
    for(var i = 0; i < chipDrawFns.length; i++){
      var fn = chipDrawFns[i];
      if(fn) fn(now);
    }
  }

  function makeChipWave(canvas, colorRgb, isActive){
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, dpr = 1;
    var t = Math.random() * 200; // random phase so adjacent chips don't sync
    var fillLevel = isActive ? 0.78 : 0.62; // active chips fill higher
    var amp = isActive ? 2.2 : 1.4;          // active chips wave bigger
    var baseAlpha = isActive ? 0.55 : 0.20;  // active chips show wave stronger
    var foamAlpha = isActive ? 0.55 : 0.20;

    function sizeCanvas(){
      var r = canvas.parentElement.getBoundingClientRect();
      if(r.width < 1) return false;
      dpr = window.devicePixelRatio || 1;
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      return true;
    }

    function surfaceY(x, midY){
      return Math.sin(x / 14 + t * 1.3) * amp
           + Math.sin(x / 28 + t * 2.1) * amp * 0.55;
    }

    return function draw(now){
      if(W < 1){ if(!sizeCanvas()) return; }
      t += 0.05;
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, W, H);
      var midY = H * (1 - fillLevel);

      // Main fill body
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(W, H);
      ctx.lineTo(W, midY + surfaceY(W, midY));
      for(var x = W; x >= 0; x -= 2){
        ctx.lineTo(x, midY + surfaceY(x, midY));
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(' + colorRgb + ',' + baseAlpha + ')';
      ctx.fill();

      // Foam crest highlight on the wave surface
      ctx.beginPath();
      var first = true;
      for(var x2 = 0; x2 <= W; x2 += 2){
        var wy = midY + surfaceY(x2, midY);
        if(first){ ctx.moveTo(x2, wy); first = false; }
        else { ctx.lineTo(x2, wy); }
      }
      ctx.strokeStyle = 'rgba(255,255,255,' + foamAlpha + ')';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.restore();
    };
  }

  function mountChipWaves(host){
    // Tear down previous draw fns; we rebuild every render
    chipDrawFns = [];
    if(!host) return;
    var chips = host.querySelectorAll('.rf-cat-chip');
    chips.forEach(function(chip){
      var canvas = chip.querySelector('.rf-cat-chip-canvas');
      if(!canvas) return;
      var rgb = chip.style.getPropertyValue('--rfc-rgb').trim() || '123,207,255';
      var isActive = chip.classList.contains('is-active');
      chipDrawFns.push(makeChipWave(canvas, rgb, isActive));
    });
    if(!chipRafId && chipDrawFns.length){
      chipLastFrame = 0;
      chipRafId = requestAnimationFrame(chipWaveLoop);
    }
  }

  function stopChipWaves(){
    chipDrawFns = [];
    if(chipRafId){ cancelAnimationFrame(chipRafId); chipRafId = null; }
  }

  function renderResults(){
    var host = document.getElementById('rfResultsGrid');
    if(!host) return;
    // v0.151 — empty state. The wall-of-60-cards problem is solved by
    // showing NOTHING until the user types a query OR picks a category
    // other than "all". Initial step 1 is just search bar + chips +
    // a friendly empty prompt. Once they filter, results appear.
    var hasQuery = !!(state.search && state.search.trim());
    var hasCategory = state.category && state.category !== 'all';
    if(!hasQuery && !hasCategory){
      host.innerHTML =
        '<div class="rf-empty-prompt">' +
          '<div class="rf-empty-icon">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
              '<circle cx="11" cy="11" r="8"/>' +
              '<line x1="21" y1="21" x2="16.65" y2="16.65"/>' +
            '</svg>' +
          '</div>' +
          '<div class="rf-empty-title">Find a fish to receive</div>' +
          '<div class="rf-empty-hint">Type a name above, or pick a category to browse.</div>' +
        '</div>';
      return;
    }
    var pool = Array.isArray(window.FISH) ? FISH.slice() : [];
    pool = pool.filter(function(f){ return !f.isCustomCatalog; });
    if(state.category !== 'all'){
      pool = pool.filter(function(f){ return f.category === state.category; });
    }
    if(state.search && state.search.trim()){
      var q = (typeof fuzzyNormalize === 'function') ? fuzzyNormalize(state.search) : state.search.toLowerCase();
      pool = pool.filter(function(f){
        var idx = (typeof cardSearchText === 'function') ? cardSearchText(f) : (f.name || '').toLowerCase();
        return idx.indexOf(q) !== -1;
      });
    }
    pool.sort(function(a,b){ return (a.name || '').localeCompare(b.name || ''); });
    var limit = 60;
    var truncated = pool.length > limit;
    pool = pool.slice(0, limit);
    if(!pool.length){
      host.innerHTML = '<div class="rf-no-results">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
        '<p>No fish match that search</p>' +
        '<span>Try a different name, or use the small <strong>Add a custom entry</strong> link below the search bar.</span>' +
        '</div>';
      return;
    }
    var html = pool.map(function(f){
      var col = catColor(f.category || 'Other Fish');
      var inStock = f.inStock ? ' rf-result-instock' : '';
      var stockBadge = f.inStock
        ? '<span class="rf-result-badge rf-result-badge-stock">In stock</span>'
        : '';
      var price = f.price ? '$' + Number(f.price).toFixed(2).replace(/\.00$/,'') : '—';
      var sci = f.scientific || '';
      // v0.151 — bubble particles + jelly squish on tap. Push-down feel
      // is provided by CSS :active, but the bubbles are the satisfying
      // confirmation that the tap registered.
      return '<button type="button" class="rf-result-card' + inStock + '"' +
        ' style="--rfc:' + col[0] + ';--rfc-rgb:' + col[1] + '"' +
        ' onclick="ltcFx.bubbles(this,{count:10});setTimeout(function(){receiveFlow.selectFish(\'' + f.id + '\')},120)">' +
        '<div class="rf-result-thumb" data-photo="' + f.id + '"><div class="image-placeholder">LTC</div></div>' +
        '<div class="rf-result-body">' +
          '<div class="rf-result-name">' + f.name + '</div>' +
          (sci ? '<div class="rf-result-sci">' + sci + '</div>' : '') +
          '<div class="rf-result-meta">' +
            '<span class="rf-result-cat">' + (f.category || '') + '</span>' +
            '<span class="rf-result-price">' + price + '</span>' +
          '</div>' +
        '</div>' +
        stockBadge +
        '</button>';
    }).join('');
    if(truncated){
      html += '<div class="rf-truncated-note">Showing first ' + limit + ' results — type more to narrow.</div>';
    }
    host.innerHTML = html;
    if(typeof applyImagesToDOM === 'function') requestAnimationFrame(applyImagesToDOM);
  }

  function renderSelectedCard(){
    var host = document.getElementById('rfSelectedCard');
    if(!host || !state.selectedFish) return;
    var f = state.selectedFish;
    var col = catColor(f.category || 'Other Fish');
    var sci = f.scientific || '';
    host.style.setProperty('--rfc', col[0]);
    host.style.setProperty('--rfc-rgb', col[1]);
    host.innerHTML =
      '<div class="rf-sc-thumb" data-photo="' + f.id + '"><div class="image-placeholder">LTC</div></div>' +
      '<div class="rf-sc-body">' +
        '<div class="rf-sc-cat">' + (f.category || '') + '</div>' +
        '<div class="rf-sc-name">' + f.name + '</div>' +
        (sci ? '<div class="rf-sc-sci">' + sci + '</div>' : '') +
      '</div>' +
      '<button type="button" class="rf-sc-change" onclick="receiveFlow.goToStep1()">Change fish</button>';
    if(typeof applyImagesToDOM === 'function') requestAnimationFrame(applyImagesToDOM);
  }

  function renderSizePills(){
    var host = document.getElementById('rfSizePills');
    if(!host) return;
    var sizes = ['Tiny','Small','Small-Medium','Medium','Medium-Large','Large','X-Large','XX-Large','Frag'];
    var html = sizes.map(function(sz, i){
      var active = state.size === sz ? ' is-active' : '';
      var safe = String(sz).replace(/'/g, "\\'");
      // v0.151 — bubble + jelly squish on tap. Active state picks up the
      // selected fish's category accent (set on host via --rfc) so the
      // active pill matches the rest of the themed step 2 layout.
      // Pills also get rainbow cycling via CSS :nth-child for inactive
      // state visual variety.
      return '<button type="button" class="rf-size-pill' + active + '"' +
        ' onclick="ltcFx.bubbles(this,{count:8});ltcFx.jelly(this);receiveFlow.setSize(\'' + safe + '\')">' +
        '<span class="rf-size-pill-label">' + sz + '</span>' +
        '</button>';
    }).join('');
    host.innerHTML = html;
  }

  function renderTankPills(){
    var host = document.getElementById('rfTankPills');
    if(!host) return;
    var tanks = ['','A','B','C','D','E','F'];
    // v0.158 — big orb redesign. The pill is now a fully round orb
    // with the tank letter centered inside. Water sloshes in the tank's
    // accent color. A dim conic-rainbow layer sits behind the water so
    // the orb feels colorful/iridescent but the tank's dedicated color
    // still dominates. "No tank" shows "NO" so it fits inside the same
    // round shape as the letters.
    var labels = {'':'NO','A':'A','B':'B','C':'C','D':'D','E':'E','F':'F'};
    var html = tanks.map(function(t,i){
      var active = state.tank === t ? ' is-active' : '';
      var noClass = t === '' ? ' rf-tank-orb-no' : '';
      return '<button type="button" class="rf-tank-pill' + active + noClass + '" data-tank-i="' + i + '"' +
        ' onclick="ltcFx.bubbles(this,{count:10});ltcFx.jelly(this);receiveFlow.setTank(\'' + t + '\')">' +
        '<span class="rf-tank-orb-rainbow"></span>' +
        '<span class="rf-tank-orb-w1"></span>' +
        '<span class="rf-tank-orb-w2"></span>' +
        '<span class="rf-tank-orb-gloss"></span>' +
        '<span class="rf-tank-pill-label">' + labels[t] + '</span>' +
        '</button>';
    }).join('');
    host.innerHTML = html;
  }

  function updateStepUI(){
    var step1 = document.getElementById('rfStep1Body');
    var step2 = document.getElementById('rfStep2Body');
    var stepLabel = document.getElementById('rfStepLabel');
    var backBtn = document.getElementById('rfBackBtn');
    var step1Indicator = document.querySelector('#receiveFlowOverlay .rf-step-1');
    var step2Indicator = document.querySelector('#receiveFlowOverlay .rf-step-2');
    if(state.step === 1){
      if(step1) step1.hidden = false;
      if(step2) step2.hidden = true;
      if(stepLabel) stepLabel.textContent = 'Step 1 of 2 · Pick a fish';
      if(backBtn) backBtn.hidden = true;
      if(step1Indicator) step1Indicator.classList.add('is-active');
      if(step2Indicator) step2Indicator.classList.remove('is-active','is-done');
      if(step1Indicator) step1Indicator.classList.remove('is-done');
    } else {
      if(step1) step1.hidden = true;
      if(step2) step2.hidden = false;
      if(stepLabel) stepLabel.textContent = 'Step 2 of 2 · Add details';
      if(backBtn) backBtn.hidden = false;
      if(step1Indicator){ step1Indicator.classList.remove('is-active'); step1Indicator.classList.add('is-done'); }
      if(step2Indicator) step2Indicator.classList.add('is-active');
    }
  }

  // Wire search input on first ready
  function wireSearchInput(){
    var input = document.getElementById('rfSearchInput');
    if(!input || input.dataset.rfBound) return;
    input.dataset.rfBound = 'true';
    input.addEventListener('input', function(e){ setSearchInput(e.target.value); });
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', wireSearchInput);
  } else {
    wireSearchInput();
  }

  // v0.174 — context-sensitive back. From step 2 → step 1 (don't lose
  // selection). From step 1 → close. Used by both an explicit Back
  // button (if added) and the backdrop click handler so an outside
  // click never throws away in-progress data.
  function back(){
    if(state.step === 2){
      state.step = 1;
      updateStepUI();
    } else {
      close();
    }
  }

  return {
    open: open,
    close: close,
    back: back,
    goToStep1: goToStep1,
    goToStep2: goToStep2,
    selectFish: selectFish,
    setCategory: setCategory,
    setSearchInput: setSearchInput,
    clearSearch: clearSearch,
    setSize: setSize,
    setTank: setTank,
    toggleMore: toggleMore,
    openAddAnyway: openAddAnyway,
    submit: submit
  };
})();

function staffBulkReceiveFish(){
  // v0.150 — re-routes to the new 2-step receive flow. The old
  // showInputModal-based wall-of-fields flow has been retired.
  if(window.receiveFlow && typeof window.receiveFlow.open === 'function'){
    window.receiveFlow.open();
    return;
  }
  // Fallback (should never hit) — old flow inline below
  const today = new Date().toISOString().slice(0,10);
  showInputModal('Add Fish / Invert', 'Search first, tap the animal, then set only what staff actually need right now. Size and price come first; tank, stock #, and vendor are optional.', [
    {label:'Fish', type:'text', value:'', placeholder:'Search fish or invert…'},
    {label:'Quantity received', type:'number', value:'1', placeholder:'1'},
    {label:'Size / grade', type:'select', value:'Small', options:allStockSizeOptions()},
    {label:'Display price', type:'text', value:'', placeholder:'29.99'},
    {label:'Arrival date', type:'date', value:today},
    {label:'Tank (optional)', type:'select', value:'', options:['','A','B','C','D','E','F']},
    {label:'Stock # (optional)', type:'text', value:'', placeholder:'Optional'},
    {label:'Vendor / source (optional)', type:'text', value:'', placeholder:'ORA, Biota, local breeder, wholesaler…'}
  ], ([fishLabel, qty, size, price, arrivalDate, tank, stockNumber, vendor]) => {
    const fish = findFishByPickerLabel(fishLabel);
    if(!fish){ showToast('Pick a fish first'); return; }
    const formValues = {qty, size, price, arrivalDate, tank, stockNumber, vendor};
    if(wasRecentlySoldOut(fish)){
      showConfirmModal(
        'This fish sold earlier today',
        `${L(fish,'name')} was marked sold within the last 24 hours. Are you sure you want to mark it received again?`,
        () => _commitBulkReceive(fish, formValues),
        {confirmText:'Mark received'}
      );
      return;
    }
    _commitBulkReceive(fish, formValues);
  }, {
    theme: 'green',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1"/><polyline points="21 12 16 12 16 8"/><line x1="16" y1="12" x2="22" y2="12"/></svg>',
    confirmText: 'Receive fish'
  });
  const inputOverlay = document.getElementById('inputModalOverlay');
  if(inputOverlay) inputOverlay.classList.add('wide');
  requestAnimationFrame(bindReceiveFishSearchHelper);
}
function openUncatalogedReceiveFlow(prefill={}){
  const today = new Date().toISOString().slice(0,10);
  const categories = catalogCategoryOptions();
  // V0.122 — slimmed to 5 essentials so staff can ship a temp entry
  // in under 30 seconds. Tank, scientific name, vendor, aliases, and
  // staff note can all be added later through the regular fish edit
  // flow once the entry exists in the catalog.
  showInputModal('Add a fish that is not in the catalog', 'Just the basics so staff can sell it today. The rest can be filled in later.', [
    {label:'Display name', type:'text', value:prefill.name || '', placeholder:'Blue Spot Something'},
    {label:'Category', type:'select', compact:true, value:prefill.category || 'Other Fish', options:categories},
    {label:'Quantity received', type:'number', value:String(prefill.qty || 1), placeholder:'1'},
    {label:'Size / grade', type:'select', value:prefill.size || 'Small', options:allStockSizeOptions()},
    {label:'Display price', type:'text', value:prefill.price || '', placeholder:'29.99'}
  ], ([name, category, qty, size, price]) => {
    const trimmedName = String(name || '').trim();
    if(!trimmedName) return showToast('Enter a fish or invert name');
    const existing = FISH.find(item => L(item,'name').toLowerCase() === trimmedName.toLowerCase() || (Array.isArray(item.aliases) && item.aliases.some(alias => String(alias).toLowerCase() === trimmedName.toLowerCase())));
    if(existing){
      showConfirmModal('Already in the catalog', `${L(existing,'name')} already exists in the list. Do you want to receive that entry instead of creating a duplicate?`, () => {
        closeInputModal();
        requestAnimationFrame(() => {
          staffBulkReceiveFish();
          setTimeout(() => {
            const fishField = document.getElementById('inputField0');
            if(fishField){
              fishField.value = fishPickerLabel(existing);
              fishField.dispatchEvent(new Event('change', {bubbles:true}));
            }
            const qtyField = document.getElementById('inputField1'); if(qtyField) qtyField.value = String(qty || 1);
            const sizeField = document.getElementById('inputField2'); if(sizeField) sizeField.value = normalizeStockSizeValue(size) || 'Small';
            const priceField = document.getElementById('inputField3'); if(priceField) priceField.value = price || '';
          }, 120);
        });
      }, {confirmText:'Use existing fish'});
      return;
    }
    const entry = createUncatalogedFishEntry({name:trimmedName, category, quantity:qty, size, price, arrivalDate:today, tank:'', aliases:'', scientific:'', vendor:'', staffNote:''});
    FISH.push(entry);
    if(typeof rebuildFishById === 'function') rebuildFishById();
    normalizeCustomCatalogEntries();
    persistStaffEdits();
    const search = document.getElementById('inventorySearch');
    const statusEl = document.getElementById('inventoryStatusFilter');
    const categoryEl = document.getElementById('inventoryCategoryFilter');
    if(search) search.value = L(entry,'name');
    if(statusEl) statusEl.value = 'instock';
    if(categoryEl) categoryEl.value = entry.category || 'all';
    state.inventoryManagerMode = 'catalog';
    renderInventoryManager();
    renderCategories();
    render();
    showToast(`${L(entry,'name')} added — tap it to fill in tank, vendor, and other details`);
  }, {
    // v0.176 — was 'cyan' (#5ed4dc) which Chris flagged as "old shit
    // aqua/dark blue menu". Switched to 'amber' to match the warm
    // not-in-database tile color on the staff hub.
    theme: 'amber',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
    confirmText: 'Add to catalog'
  });
  const overlay = document.getElementById('inputModalOverlay');
  if(overlay) overlay.classList.add('wide');
}
function staffAddUncatalogedFish(){
  openUncatalogedReceiveFlow();
}
function recentSalesWorkbenchTemplate(limit=6){
  const {rows, totalRevenue, uniqueFish} = recentSalesMetrics(Math.max(limit, 10));
  const displayRows = rows.slice(0, limit);
  const avgTicket = displayRows.length ? totalRevenue / Math.max(1, rows.length) : 0;
  return `<div class="inventory-overview-block inventory-sales-block">
    <div class="inventory-overview-head"><strong>Recent sold fish</strong><span>Local sale history now, Shopify-connected sales feed later.</span></div>
    <div class="inventory-sales-shell">
      <div class="inventory-sales-metrics">
        <div class="inventory-sales-metric"><span>Recent sales</span><strong>${rows.length}</strong><small>saved sale records</small></div>
        <div class="inventory-sales-metric"><span>Fish moved</span><strong>${uniqueFish}</strong><small>different species in recent history</small></div>
        <div class="inventory-sales-metric"><span>Avg sale</span><strong>${rows.length ? formatMoney(avgTicket) : '—'}</strong><small>quick reference only</small></div>
      </div>
      <div class="inventory-sales-list">
        ${displayRows.length ? displayRows.map(({item, entry}) => `<div class="inventory-sales-row">
          <div class="inventory-sales-main">
            <strong>${L(item,'name')}</strong>
            <span>${formatDateTimeShort(entry.time)}${entry.stockSize ? ` · ${displayStockSize(entry.stockSize)}` : ''}${entry.tankCode ? ` · Tank ${entry.tankCode}` : ''}</span>
          </div>
          <div class="inventory-sales-side">
            <b>${entry.price ? formatMoney(entry.price) : 'Unknown'}</b>
            <div class="inventory-sales-actions"><button type="button" class="input-helper-btn subtle" onclick="staffRestockFish('${item.id}')">Use last setup</button><button type="button" class="input-helper-btn subtle" onclick="showSaleHistory('${item.id}')">History</button></div>
          </div>
        </div>`).join('') : '<div class="inventory-history-empty">No sold fish recorded yet. Once staff marks fish sold, the last price and size show up here for easy reuse.</div>'}
      </div>
    </div>
  </div>`;
}
function latestKnownFishData(item){
  const latest = latestSaleHistoryEntry(item) || {};
  const qty = normalizeQuantityValue(item?.quantity);
  return {
    price: latest.price || item?.price || '',
    tankCode: item?.tankCode || latest.tankCode || 'A',
    stockNumber: item?.stockNumber || latest.stockNumber || '',
    stockSize: normalizeStockSizeValue(item?.stockSize || latest.stockSize || ''),
    quantity: qty === '' ? (latest.quantity || 1) : qty,
    arrivalDate: item?.arrivalDate || '',
    vendor: item?.vendor || ''
  };
}
function setModalFieldValue(fieldId, value){
  const el = document.getElementById(fieldId);
  if(!el) return;
  el.value = value == null ? '' : String(value);
  el.dispatchEvent(new Event('change', {bubbles:true}));
}
function applyHistoricalSalePrice(id, time){
  const fish = FISH.find(f => f.id === id);
  if(!fish) return;
  const entry = saleHistoryFor(fish).find(row => Number(row.time) === Number(time));
  if(!entry || !entry.price) return showToast('No saved price on that sale entry');
  pushStaffHistory(fish, 'apply-sale-price');
  fish.price = Number(entry.price);
  touchStaffRecord(fish, 'apply-sale-price');
  persistStaffEdits();
  renderInventoryManager();
  renderInventoryHistoryOverlay();
  render();
  showToast(`${L(fish,'name')} price → ${formatMoney(fish.price)}`);
}
function mountModalFishHelper(item, config={}){
  const fieldsEl = document.getElementById('inputModalFields');
  if(!fieldsEl || !item) return;
  const lastKnown = latestKnownFishData(item);
  const sales = recentSaleEntries(item, config.limit || 6);
  const src = getPrimaryImageSource(item);
  const helper = document.createElement('div');
  helper.className = 'input-modal-fish-helper';
  helper.innerHTML = `
    <div class="input-helper-shell">
      <div class="input-helper-media">${src ? `<img src="${src}" alt="${L(item,'name')}">` : '<div class="input-helper-placeholder">LTC</div>'}</div>
      <div class="input-helper-main">
        <div class="input-helper-head"><strong>${L(item,'name')}</strong><span>${item.scientific || inventoryCategoryLabel(item.category)}</span></div>
        <div class="input-helper-copy">Use a recent sale price or apply the last known stock details so staff do not have to retype the same fish over and over.</div>
        ${config.includeAllButton ? `<div class="input-helper-apply-row"><button type="button" class="input-helper-btn" data-apply-last-known="1">Apply last known fish data</button></div>` : ''}
        <div class="input-helper-sales">
          <div class="input-helper-subtitle">Recent sale prices</div>
          ${sales.length ? sales.map(entry => `<div class="input-helper-sale-row"><div><strong>${entry.price ? formatMoney(entry.price) : 'Unknown'}</strong><span>${formatDateTimeShort(entry.time)}${entry.stockSize ? ` · ${displayStockSize(entry.stockSize)}` : ''}${entry.tankCode ? ` · Tank ${entry.tankCode}` : ''}</span></div><button type="button" class="input-helper-btn subtle" data-apply-price="${entry.price || ''}">Use price</button></div>`).join('') : '<div class="input-helper-empty">No recorded sale prices yet for this fish.</div>'}
        </div>
      </div>
    </div>`;
  fieldsEl.prepend(helper);
  helper.querySelectorAll('[data-apply-price]').forEach(btn => btn.addEventListener('click', () => {
    const priceField = config.fieldIds?.price;
    if(!priceField) return;
    setModalFieldValue(priceField, btn.dataset.applyPrice || '');
    showToast('Price copied from sale history');
  }));
  helper.querySelectorAll('[data-open-sale-history-inline]').forEach(btn => btn.addEventListener('click', () => showSaleHistory(item.id)));
  const applyAll = helper.querySelector('[data-apply-last-known]');
  if(applyAll){
    applyAll.addEventListener('click', () => {
      const ids = config.fieldIds || {};
      if(ids.price) setModalFieldValue(ids.price, lastKnown.price || '');
      if(ids.tank) setModalFieldValue(ids.tank, lastKnown.tankCode || 'A');
      if(ids.stockNumber) setModalFieldValue(ids.stockNumber, lastKnown.stockNumber || '');
      if(ids.stockSize) setModalFieldValue(ids.stockSize, displayStockSize(lastKnown.stockSize));
      if(ids.quantity) setModalFieldValue(ids.quantity, lastKnown.quantity || 1);
      if(ids.arrivalDate) setModalFieldValue(ids.arrivalDate, lastKnown.arrivalDate || '');
      if(ids.vendor) setModalFieldValue(ids.vendor, lastKnown.vendor || '');
      showToast('Last known fish data applied');
    });
  }
}
function showRestoreGuidanceModal(fish, reason='loss'){
  if(!fish) return;
  const title = reason === 'loss' ? 'Fish removed from inventory' : 'Fish marked unavailable';
  const copy = reason === 'loss'
    ? `${fish.name} was moved out of the live inventory. If that was a mistake, staff can restore it right away from Recent Changes or the Out of stock view.`
    : `${fish.name} is no longer showing as live inventory. Restore it from Recent Changes if needed.`;
  const src = getPrimaryImageSource(fish);
  showInfoModal(title, fish.name, `
    <div class="inventory-guidance-card with-media">
      <div class="inventory-guidance-media">${src ? `<img src="${src}" alt="${fish.name}">` : '<div class="input-helper-placeholder">LTC</div>'}</div>
      <div class="inventory-guidance-copy">
        <p>${copy}</p>
        <div class="inventory-guidance-actions">
          <button type="button" class="input-helper-btn" data-restore-open-history="1">Open Recent Changes</button>
          <button type="button" class="input-helper-btn subtle" data-restore-open-out="1">View Out of stock</button>
        </div>
      </div>
    </div>`);
  const fieldsEl = document.getElementById('inputModalFields');
  if(!fieldsEl) return;
  fieldsEl.querySelector('[data-restore-open-history]')?.addEventListener('click', () => {
    closeInputModal();
    openInventoryHistoryOverlay();
  });
  fieldsEl.querySelector('[data-restore-open-out]')?.addEventListener('click', () => {
    closeInputModal();
    openInventoryManager();
    const statusEl = document.getElementById('inventoryStatusFilter');
    if(statusEl) statusEl.value = 'out';
    renderInventoryManager();
  });
}
function showInfoModal(title, desc, html){
  const overlay = document.getElementById('inputModalOverlay');
  const titleEl = document.getElementById('inputModalTitle');
  const descEl = document.getElementById('inputModalDesc');
  const fieldsEl = document.getElementById('inputModalFields');
  const cancelBtn = document.getElementById('inputModalCancel');
  const confirmBtn = document.getElementById('inputModalConfirm');
  if(!overlay||!titleEl||!descEl||!fieldsEl||!cancelBtn||!confirmBtn) return;
  titleEl.textContent = title;
  descEl.textContent = desc || '';
  fieldsEl.innerHTML = html;
  cancelBtn.textContent = 'Close';
  confirmBtn.style.display = 'none';
  _inputModalCallback = null;
  _inputModalFields = [];
  overlay.classList.add('show');
  triggerGaugeFx(overlay);
}
function showSaleHistory(id){
  const fish = FISH.find(f => f.id === id);
  if(!fish) return;
  const history = saleHistoryFor(fish).slice().reverse();
  const body = history.length
    ? `<div class="sale-history-list">${history.map(entry => `<div class="sale-history-row"><div><strong>${entry.price ? formatMoney(entry.price) : 'Unknown'}</strong><div class="sale-history-meta">${formatDateTimeShort(entry.time)}${entry.stockNumber ? ` · Stock # ${entry.stockNumber}` : ''}${entry.stockSize ? ` · ${displayStockSize(entry.stockSize)}` : ''}${entry.tankCode ? ` · Tank ${entry.tankCode}` : ''}</div></div><div class="sale-history-row-tools"><span class="mini-pill">Qty ${entry.quantity || 1}</span>${state.staffMode && entry.price ? `<button type="button" class="input-helper-btn subtle" onclick="applyHistoricalSalePrice('${fish.id}', ${entry.time})">Use price</button>` : ''}</div></div>`).join('')}</div>`
    : '<div class="inventory-history-empty">No recorded sale prices for this fish yet.</div>';
  showInfoModal('Previous sale prices', fish.name, body);
}
function canRestoreAvailability(item){
  return !!(item && !item.inStock && (item.soldAt || item.lossAt || availableQuantity(item) === 0));
}
function restoreButtonLabel(item){
  if(item?.soldAt) return 'Undo Sold';
  if(item?.lossAt) return 'Undo Loss';
  return 'Restore Stock';
}
function clearHoldState(fish){
  if(!fish) return;
  delete fish.reserved;
  delete fish.reservedFor;
}
function undoSnapshotButton(item, field, label, action, style){
  if(!item || !getUndoSnapshot(item, field)) return '';
  return `<button class="staff-action-btn restore calming" onclick="event.stopPropagation();${action}('${item.id}')" style="${style}">${label}</button>`;
}
function staffUndoSold(id){
  const fish = FISH.find(f=>f.id===id);
  const snapshot = getUndoSnapshot(fish, STAFF_UNDO_SOLD_FIELD);
  if(!snapshot){ showToast('Nothing sold to undo'); return; }
  pushStaffHistory(fish, 'undo-sold');
  restoreFishSnapshot(fish, snapshot.before || {});
  clearUndoSnapshot(fish, STAFF_UNDO_SOLD_FIELD);
  touchStaffRecord(fish, 'undo-sold');
  showToast(`${L(fish,'name')} restored from sold`);
  playOpen();
  persistStaffEdits();
  renderInventoryManager();
  renderInventoryHistoryOverlay();
  refreshStaffEditorInModal(fish.id);
  render();
}
function staffUndoLoss(id){
  const fish = FISH.find(f=>f.id===id);
  const snapshot = getUndoSnapshot(fish, STAFF_UNDO_LOSS_FIELD);
  if(!snapshot){ showToast('Nothing removed to undo'); return; }
  pushStaffHistory(fish, 'undo-loss');
  restoreFishSnapshot(fish, snapshot.before || {});
  clearUndoSnapshot(fish, STAFF_UNDO_LOSS_FIELD);
  touchStaffRecord(fish, 'undo-loss');
  showToast(`${L(fish,'name')} restored from loss`);
  playOpen();
  persistStaffEdits();
  renderInventoryManager();
  renderInventoryHistoryOverlay();
  refreshStaffEditorInModal(fish.id);
  render();
}
function staffUndoQuarantine(id){
  const fish = FISH.find(f=>f.id===id);
  const snapshot = getUndoSnapshot(fish, STAFF_UNDO_QUARANTINE_FIELD);
  if(!snapshot){ showToast('No quarantine change to undo'); return; }
  pushStaffHistory(fish, 'undo-quarantine');
  restoreFishSnapshot(fish, snapshot.before || {});
  clearUndoSnapshot(fish, STAFF_UNDO_QUARANTINE_FIELD);
  touchStaffRecord(fish, 'undo-quarantine');
  showToast(`${L(fish,'name')} quarantine rolled back`);
  playOpen();
  persistStaffEdits();
  renderInventoryManager();
  renderInventoryHistoryOverlay();
  refreshStaffEditorInModal(fish.id);
  render();
}
function staffUndoHold(id){
  const fish = FISH.find(f=>f.id===id);
  const snapshot = getUndoSnapshot(fish, STAFF_UNDO_HOLD_FIELD);
  if(!snapshot){ showToast('No hold to undo'); return; }
  pushStaffHistory(fish, 'undo-hold');
  restoreFishSnapshot(fish, snapshot.before || {});
  clearUndoSnapshot(fish, STAFF_UNDO_HOLD_FIELD);
  touchStaffRecord(fish, 'undo-hold');
  showToast(`${L(fish,'name')} hold rolled back`);
  playOpen();
  persistStaffEdits();
  renderInventoryManager();
  renderInventoryHistoryOverlay();
  refreshStaffEditorInModal(fish.id);
  render();
}
function majorRollbackButtons(item){
  const parts = [];
  parts.push(undoSnapshotButton(item, STAFF_UNDO_SOLD_FIELD, 'Undo Sold', 'staffUndoSold', 'background:rgba(90,220,200,.18);border-color:rgba(90,220,200,.34);color:#84f5de'));
  parts.push(undoSnapshotButton(item, STAFF_UNDO_LOSS_FIELD, 'Undo Loss', 'staffUndoLoss', 'background:rgba(100,210,210,.18);border-color:rgba(100,210,210,.34);color:#8cf0f0'));
  parts.push(undoSnapshotButton(item, STAFF_UNDO_QUARANTINE_FIELD, 'Undo Quarantine', 'staffUndoQuarantine', 'background:rgba(120,190,255,.18);border-color:rgba(120,190,255,.34);color:#a8d5ff'));
  parts.push(undoSnapshotButton(item, STAFF_UNDO_HOLD_FIELD, 'Undo Hold', 'staffUndoHold', 'background:rgba(170,220,140,.18);border-color:rgba(170,220,140,.34);color:#c9f0ac'));
  return parts.filter(Boolean).join('');
}
// V0.127 — hold-to-undo button rendering. Used in the staff editor's
// rollback bar inside the fish modal. Each available undo gets its own
// big button that requires a 2.5 second hold to fire. Visual feedback:
// fill bar inside the button + halo ring outside the button perimeter
// (visible around a finger on a touchscreen).
function holdUndoButton(item, field, label, fnName, color){
  if(!item || !getUndoSnapshot(item, field)) return '';
  return `<button type="button" class="hold-undo" data-hold-action="${fnName}" data-hold-arg="${item.id}" style="--hu-accent:${color}">
    <span class="hold-ring"></span>
    <span class="hold-fill"></span>
    <span class="hold-label">
      <span class="hold-icon"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M3.51 13a9 9 0 1 0 2.13-9.36L3 7"/></svg></span>
      <span class="hold-text">Hold to ${label}</span>
    </span>
  </button>`;
}
function majorRollbackHoldButtons(item){
  const parts = [];
  parts.push(holdUndoButton(item, STAFF_UNDO_SOLD_FIELD, 'undo sold', 'staffUndoSold', '#5eebc8'));
  parts.push(holdUndoButton(item, STAFF_UNDO_LOSS_FIELD, 'undo loss', 'staffUndoLoss', '#5ed4dc'));
  parts.push(holdUndoButton(item, STAFF_UNDO_QUARANTINE_FIELD, 'undo quarantine', 'staffUndoQuarantine', '#7bcfff'));
  parts.push(holdUndoButton(item, STAFF_UNDO_HOLD_FIELD, 'undo hold', 'staffUndoHold', '#c8f08a'));
  return parts.filter(Boolean).join('');
}
function availableQuantity(item){
  const total = normalizeQuantityValue(item.quantity);
  if(total === '') return item.inStock ? 1 : 0;
  return total;
}
function reservedLabel(item){
  if(!item.reserved) return 'Open';
  const name = String(item.reservedFor || '').trim();
  return name ? `Held · ${name}` : 'Held';
}
function cloneValue(value){
  if(Array.isArray(value) || (value && typeof value === 'object')) return JSON.parse(JSON.stringify(value));
  return value;
}
function getStaffSnapshot(fish, options={}){
  const snapshot = {};
  const excludeHistory = !!options.excludeHistory;
  const excludePhotos = !!options.excludePhotos;
  const excludeUndoSnapshots = !!options.excludeUndoSnapshots;
  STAFF_MANAGED_FIELDS.forEach(key => {
    if(excludeHistory && key === STAFF_HISTORY_FIELD) return;
    if(excludePhotos && key === 'staffPhotos') return;
    if(excludeUndoSnapshots && STAFF_UNDO_SNAPSHOT_FIELDS.includes(key)) return;
    if(key === 'stockSize') snapshot[key] = normalizeStockSizeValue(fish[key]);
    else if(key === 'quantity') snapshot[key] = normalizeQuantityValue(fish[key]);
    else if(Array.isArray(fish[key]) || (fish[key] && typeof fish[key] === 'object')) snapshot[key] = cloneValue(fish[key]);
    else if(fish[key] !== undefined) snapshot[key] = fish[key];
  });
  return snapshot;
}
const STAFF_BASELINE = new Map((Array.isArray(window.FISH) ? window.FISH : []).map(f => [f.id, JSON.parse(JSON.stringify(getStaffSnapshot(f)))]));

// v0.143 — FISH_BY_ID Map for O(1) fish lookup. The previous pattern of
// FISH.find(f=>f.id===id) was being called inside hot loops in
// applyImagesToDOM (~200 elements × 678 fish = ~135k linear searches per
// render). This Map collapses that to O(1) per lookup. Map is rebuilt
// whenever FISH mutates (rebuildFishById is called from the 3 mutation
// points: receive flow + custom catalog cleanup).
var FISH_BY_ID = new Map();
function rebuildFishById(){
  FISH_BY_ID.clear();
  if(!Array.isArray(window.FISH)) return;
  for(var i = 0; i < FISH.length; i++){
    FISH_BY_ID.set(FISH[i].id, FISH[i]);
  }
}
function getFishById(id){
  if(!id) return null;
  var f = FISH_BY_ID.get(id);
  if(f) return f;
  // Lazy fallback if map is stale — fill in and return
  if(Array.isArray(window.FISH)){
    f = FISH.find(function(item){ return item.id === id; });
    if(f){ FISH_BY_ID.set(id, f); return f; }
  }
  return null;
}
rebuildFishById();

// v0.147 — EXTRA_ALIASES: trade-name augmentation map for the search index.
// Hobbyists call dragonets "blennies", chromis "damsels", basslets "grammas",
// and so on. Many of these confusions are family-level (dragonets are
// Callionymidae, not blennies) but customers don't know that. This map adds
// per-species trade-name aliases that get merged into cardSearchText so
// search finds the right fish regardless of which common name the customer
// types.
//
// MAINTENANCE NOTE FOR FUTURE CLAUDE CHATS:
// This map is a transitional surface. As bridge content gets rewritten in
// v0.148+, the entries here should migrate INTO the species data file's
// own `aliases` field and be removed from this map. The map should shrink
// over time. Don't add aliases here that are already in the species'
// `aliases` array — that's redundant and harder to maintain.
//
// When adding new species or rewriting bridge entries, ALWAYS research
// common trade names (LiveAquaria, ReefApp, FishBase, Reef2Reef, etc.)
// and either add them directly to the species `aliases` field OR add
// them here if you can't touch the data file in that build. Customers
// type whatever name they remember from the LFS or the magazine cover.
var EXTRA_ALIASES = {
  // — Dragonets / Mandarins / Scooter family —
  // These are all Synchiropus / Callionymidae and customers call them
  // blennies, gobies, dragonets, and mandarins interchangeably. They
  // are NONE of those things except dragonets, but the trade is what
  // it is.
  'ruby-red-dragonet':    ['Red Mandarin', 'Red Scooter Blenny', 'Ruby Mandarin', 'Red Dragonet'],
  'red-scooter-dragonet': ['Red Scooter Blenny', 'Starry Dragonet', 'Stellate Dragonet', 'Red Scooter'],
  'scooter-blenny':       ['Scooter Dragonet', 'Ocellated Dragonet', 'Ocellated Scooter'],
  'green-mandarin':       ['Mandarin Goby', 'Mandarin Fish', 'Mandarinfish', 'Striped Mandarin', 'Mandarin Dragonet'],
  'mandarin-dragonet':    ['Mandarin Goby', 'Mandarin Fish', 'Green Mandarin', 'Striped Mandarin'],
  'spotted-mandarin':     ['Picture Dragonet', 'Psychedelic Mandarin', 'Target Mandarin', 'Spotted Mandarin Goby'],
  'target-mandarin':      ['Spotted Mandarin', 'Picture Dragonet', 'Psychedelic Mandarin'],
  'mandarin-goby-target': ['Spotted Mandarin', 'Picture Dragonet', 'Psychedelic Mandarin', 'Target Mandarin Goby'],

  // — Royal Gramma / Dottyback confusion —
  // Royal Gramma is the real fish, Royal Dottyback (Pictichromis paccagnellae)
  // is a deceptive lookalike that gets called "False Royal Gramma" everywhere.
  'royal-gramma':         ['Royal Basslet', 'Fairy Basslet', 'Royal Gramma Basslet'],
  'royal-dottyback':      ['Bicolor Dottyback', 'False Royal Gramma', 'Strawberry Dottyback'],

  // — Anthias —
  'lyretail-anthias':     ['Sea Goldie', 'Lyretail Coralfish', 'Scalefin Anthias'],

  // — Tangs / Surgeonfish trade names —
  'naso-tang':            ['Lipstick Tang', 'Orangespine Tang', 'Orangespine Surgeonfish', 'Lipstick Naso', 'Lipstick Unicornfish'],
  'blue-hippo-tang':      ['Hippo Tang', 'Regal Tang', 'Blue Tang', 'Pacific Blue Tang', 'Palette Surgeonfish', 'Dory'],
  'yellow-tang':          ['Hawaiian Yellow Tang', 'Yellow Sailfin Tang'],
  'powder-blue-tang':     ['Powder Blue Surgeonfish', 'Powder Blue'],

  // — Eels —
  'snowflake-eel':        ['Snowflake Eel', 'Starry Moray', 'Floral Moray', 'Clouded Moray'],

  // — Clownfish trade names —
  'ocellaris-clown':      ['False Percula', 'False Clown', 'Common Clownfish', 'Nemo', 'Clown Anemonefish', 'Anemonefish'],
  'percula-clownfish':    ['True Percula', 'True Clown', 'Orange Clownfish', 'Percula Clown'],
  'maroon-clown':         ['Spinecheek Anemonefish', 'Maroon Anemonefish'],

  // — Triggers —
  'niger-trigger':        ['Black Triggerfish', 'Redtoothed Triggerfish', 'Blue Triggerfish'],
  'picasso-trigger':      ['Lagoon Triggerfish', 'Humu Trigger', 'Humuhumunukunukuapuaa', 'Whitebanded Triggerfish', 'Reef Triggerfish'],

  // — Rabbitfish —
  'foxface-rabbitfish':   ['Foxface Lo', 'Foxface', 'Vulpinus Rabbitfish'],
  'foxface-lo':           ['Foxface Rabbitfish', 'Vulpinus Rabbitfish']
};

// Helper: get the merged alias text for a fish (data-file aliases +
// any EXTRA_ALIASES entries). Used by cardSearchText and the suggestion
// engine so both surfaces benefit from the trade-name augmentation.
function getMergedAliases(item){
  var dataAliases = Array.isArray(item.aliases) ? item.aliases : [];
  var extras = EXTRA_ALIASES[item.id] || [];
  if(!extras.length) return dataAliases;
  return dataAliases.concat(extras);
}
function getStaffDeltaPayload(){
  const payload = {};
  FISH.forEach(fish => {
    if(isCustomCatalogItem(fish)) return;
    const current = getStaffSnapshot(fish);
    const baseline = STAFF_BASELINE.get(fish.id) || {};
    const delta = {};
    for(const [key, value] of Object.entries(current)){
      const base = baseline[key];
      if(JSON.stringify(value) !== JSON.stringify(base)) delta[key] = value;
    }
    if(Object.keys(delta).length) payload[fish.id] = delta;
  });
  const customEntries = getCustomCatalogEntries();
  if(customEntries.length) payload[STAFF_CUSTOM_CATALOG_KEY] = customEntries;
  return payload;
}
function openStaffDb(){
  return new Promise((resolve, reject) => {
    if(typeof indexedDB === 'undefined') { resolve(null); return; }
    const req = indexedDB.open(STAFF_DB_NAME, STAFF_DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if(!db.objectStoreNames.contains(STAFF_DB_STORE)) db.createObjectStore(STAFF_DB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function saveStaffPayload(payload){
  const leanPayload = JSON.parse(JSON.stringify(payload || {}));
  try{
    for(const delta of Object.values(leanPayload)){
      if(!delta || typeof delta !== 'object') continue;
      if(delta.staffPhotos) delete delta.staffPhotos;
      if(Array.isArray(delta.changeHistory)){
        delta.changeHistory = delta.changeHistory.map(entry => {
          if(entry && entry.before && entry.before.staffPhotos) delete entry.before.staffPhotos;
          return entry;
        });
      }
    }
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(leanPayload));
    localStorage.removeItem(STAFF_STORAGE_LEGACY_KEY);
  }catch(_e){}
  try{
    const db = await openStaffDb();
    if(!db) return;
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STAFF_DB_STORE, 'readwrite');
      tx.objectStore(STAFF_DB_STORE).put(payload, STAFF_DB_RECORD_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    db.close();
  }catch(_e){}
}
async function loadStaffPayload(){
  try{
    const db = await openStaffDb();
    if(db){
      const value = await new Promise((resolve, reject) => {
        const tx = db.transaction(STAFF_DB_STORE, 'readonly');
        const req = tx.objectStore(STAFF_DB_STORE).get(STAFF_DB_RECORD_KEY);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
      db.close();
      if(value && typeof value === 'object') return value;
    }
  }catch(_e){}
  try{
    const raw = localStorage.getItem(STAFF_STORAGE_KEY) || localStorage.getItem(STAFF_STORAGE_LEGACY_KEY);
    if(raw) return JSON.parse(raw);
  }catch(_e){}
  return null;
}
async function clearStaffEditsStorage(){
  try{
    localStorage.removeItem(STAFF_STORAGE_KEY);
    localStorage.removeItem(STAFF_STORAGE_LEGACY_KEY);
  }catch(_e){}
  try{
    const db = await openStaffDb();
    if(!db) return;
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STAFF_DB_STORE, 'readwrite');
      tx.objectStore(STAFF_DB_STORE).delete(STAFF_DB_RECORD_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    db.close();
  }catch(_e){}
}
function persistStaffEdits(){
  saveStaffPayload(getStaffDeltaPayload());
}
function applyStaffEditPayload(payload){
  if(!payload || typeof payload !== 'object') return;
  for(const [id, delta] of Object.entries(payload)){
    if(id === STAFF_CUSTOM_CATALOG_KEY) continue;
    const fish = FISH.find(f=>f.id===id);
    if(!fish || !delta || typeof delta !== 'object') continue;
    for(const field of STAFF_MANAGED_FIELDS){
      if(!(field in delta)) continue;
      if(field === 'stockSize') fish[field] = normalizeStockSizeValue(delta[field]);
      else if(field === 'quantity') fish[field] = normalizeQuantityValue(delta[field]);
      else if(Array.isArray(delta[field]) || (delta[field] && typeof delta[field] === 'object')) fish[field] = cloneValue(delta[field]);
      else fish[field] = delta[field];
    }
  }
}
async function loadStaffEdits(){
  const payload = await loadStaffPayload();
  if(payload){
    applyCustomCatalogPayload(payload[STAFF_CUSTOM_CATALOG_KEY]);
    normalizeCustomCatalogEntries();
    applyStaffEditPayload(payload);
  }
}
function exportStaffEdits(){
  try{
    const blob = new Blob([JSON.stringify(getStaffDeltaPayload(), null, 2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ltc-staff-edits-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 100);
    showToast('Staff data exported');
  }catch(_e){ showToast('Export failed'); }
}
function importStaffEditsFile(file){
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try{
      const payload = JSON.parse(ev.target.result);
      removeCustomCatalogEntries();
      FISH.forEach(fish => {
        const baseline = STAFF_BASELINE.get(fish.id) || {};
        for(const field of STAFF_MANAGED_FIELDS){
          if(field in baseline) fish[field] = cloneValue(baseline[field]);
          else delete fish[field];
        }
      });
      applyCustomCatalogPayload(payload[STAFF_CUSTOM_CATALOG_KEY]);
      normalizeCustomCatalogEntries();
      applyStaffEditPayload(payload);
      persistStaffEdits();
      renderInventoryManager();
      render();
      showToast('Staff data imported');
    }catch(_e){ showToast('Import failed'); }
  };
  reader.readAsText(file);
}
function resetStaffEdits(){
  if(!window.confirm('Reset all locally saved staff edits on this device?')) return;
  removeCustomCatalogEntries();
  FISH.forEach(fish => {
    const baseline = STAFF_BASELINE.get(fish.id) || {};
    for(const field of STAFF_MANAGED_FIELDS){
      if(field in baseline) fish[field] = cloneValue(baseline[field]);
      else delete fish[field];
    }
  });
  clearStaffEditsStorage();
  renderInventoryManager();
  renderInventoryHistoryOverlay();
  render();
  showToast('Local staff data reset');
}
async function hydrateStaffEdits(){
  await loadStaffEdits();
  renderInventoryManager();
  renderInventoryHistoryOverlay();
  render();
}


// Localized content helper — returns Spanish field if available and lang is 'es'

// Category name translation
const CAT_KEYS = {
  "All":"catAll","Tangs":"catTangs","Angelfish":"catAngelfish","Wrasses":"catWrasse",
  "Clownfish":"catClownfish","Gobies & Blennies":"catGobies","Damsels":"catDamsels",
  "Basslets & Dottybacks":"catBasslets","Cardinalfish":"catCardinals","Anthias":"catAnthias",
  "Butterflyfish":"catButterfly","Hawkfish":"catHawks","Rabbitfish":"catRabbits",
  "Triggerfish":"catTriggers","Puffers":"catPuffers","Eels":"catEels","Lionfish":"catLionfish",
  "Other Fish":"catOther","Shrimp":"catShrimp","Crabs":"catCrabs","Snails":"catSnails",
  "Urchins":"catUrchins","Starfish":"catStarfish","Clams":"catClams",
  "Inverts":"catInverts",
  "Small Reef Fish":"catSmallReef","Butterflies & Rabbits":"catButterflies",
  "Predators & Oddballs":"catPredators"
};
function TC(cat){ return T(CAT_KEYS[cat] || 'catAll'); }

// Badge translation  
const BADGE_KEYS = {"Staff Pick":"badgeStaffPick","New Arrival":"badgeNewArrival","Rare Find":"badgeRareFind","Beginner Favorite":"badgeBegFav"};
function TB(badge){ return T(BADGE_KEYS[badge] || badge); }

// v0.138 — Spanish fallback safeguard. Detects fake/broken Spanish fields
// (empty, identical to English, or containing English template phrases) and
// falls back to the English value silently. Protects the bilingual UI from
// the v0.137 Spanglish content until a proper translation pass lands.
const FAKE_ES_ENGLISH_TOKENS = /\b(the|of|for|with|and|that|this|more|look|used|trade|name|system|honestly|support|spot|brute|stands|easiest|than|when|buyer|specialty|invertebrate|belongs|right|every|reef)\b/gi;
function isFakeSpanish(es, en){
  if(!es) return true;
  if(en && es === en) return true;
  // Count English token hits — any Spanish field with 3+ obvious English
  // connector/template words is treated as broken Spanglish.
  const hits = (es.match(FAKE_ES_ENGLISH_TOKENS) || []).length;
  if(hits >= 3) return true;
  return false;
}
function L(item, field){
  if(state.lang === 'es'){
    const es = item[field+'_es'];
    const en = item[field];
    if(!isFakeSpanish(es, en)) return es;
  }
  return item[field] || '';
}

function formatMoney(num){
  return new Intl.NumberFormat('en-US', { style:'currency', currency:'USD' }).format(num);
}
function isPhonePortrait(){
  return window.matchMedia('(max-width: 600px) and (pointer: coarse)').matches && window.innerHeight >= window.innerWidth;
}
function isPhoneCoarse(){
  return window.matchMedia('(pointer: coarse) and (max-width: 900px)').matches;
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
function getPrimaryImageSource(item){
  return (Array.isArray(item.staffPhotos) && item.staffPhotos[0]) || fishImages.get(item.id) || wikiImages.get(item.photoTitle) || null;
}
function getGallerySources(item){
  const seen = new Set();
  const out = [];
  const primary = getPrimaryImageSource(item);
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
// v0.143 — debounced cache write. Previously every fetched image triggered
// a full serialize-and-write of the entire image cache, even when many
// fetches were in flight at the same time during initial catalog load.
// Coalesce writes into a single 800ms tail call.
var _persistImageCacheTimer = null;
function persistImageCache(){
  if(_persistImageCacheTimer) return;
  _persistImageCacheTimer = setTimeout(function(){
    _persistImageCacheTimer = null;
    try{
      const payload = {};
      fishImages.forEach((src, id) => { if(src) payload[id] = src; });
      localStorage.setItem(IMAGE_CACHE_STORAGE_KEY, JSON.stringify(payload));
    }catch(_e){}
  }, 800);
}
function loadImageCache(){
  try{
    const raw = localStorage.getItem(IMAGE_CACHE_STORAGE_KEY);
    if(!raw) return;
    const payload = JSON.parse(raw);
    if(!payload || typeof payload !== 'object') return;
    Object.entries(payload).forEach(([id, src]) => {
      if(src) fishImages.set(id, src);
    });
  }catch(_e){}
}
loadImageCache();
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
function bindCategoryRailGestures(){
  const bar = document.getElementById('categoryBar');
  if(!bar || bar.dataset.enhancedRail === '1') return;
  bar.dataset.enhancedRail = '1';
  bar.addEventListener('wheel', e => {
    if(Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    e.preventDefault();
    bar.scrollBy({left: e.deltaY, behavior:'auto'});
    updateCategoryRailUI();
  }, {passive:false});
  let pointerDown = false;
  let dragging = false;
  let startX = 0;
  let startScroll = 0;
  let activePointerId = null;
  bar.addEventListener('pointerdown', e => {
    if(e.pointerType === 'mouse' && e.button !== 0) return;
    if(e.target && e.target.closest && e.target.closest('.folder-tab, button, a, input, select, textarea, label')) return;
    pointerDown = true;
    dragging = false;
    activePointerId = e.pointerId;
    startX = e.clientX;
    startScroll = bar.scrollLeft;
  });
  const endDrag = e => {
    pointerDown = false;
    dragging = false;
    activePointerId = null;
    bar.classList.remove('is-dragging');
    try{ if(e && e.pointerId !== undefined) bar.releasePointerCapture(e.pointerId); }catch(_e){}
  };
  bar.addEventListener('pointermove', e => {
    if(!pointerDown) return;
    const dx = e.clientX - startX;
    if(!dragging && Math.abs(dx) < 8) return;
    if(!dragging){
      dragging = true;
      bar.classList.add('is-dragging');
      try{ if(activePointerId !== null) bar.setPointerCapture(activePointerId); }catch(_e){}
    }
    e.preventDefault();
    bar.scrollLeft = startScroll - dx;
    updateCategoryRailUI();
  });
  bar.addEventListener('pointerup', endDrag);
  bar.addEventListener('pointercancel', endDrag);
  bar.addEventListener('pointerleave', e => { if(dragging && e.pointerType === 'mouse') endDrag(e); });
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
// v0.144 — search normalization. Strips apostrophe variants (curly +
// straight), diacritics, and punctuation, lowercases, and collapses
// whitespace. Applied to BOTH the query and the searchable text so
// "coopers", "cooper's", "Cooper's", and even "Coopers" all match
// "Cooper's Fairy Anthias". Most non-tech-savvy customers won't
// guess the curly apostrophe on a tablet keyboard — this fix is
// for them.
function normalizeSearchText(s){
  if(!s) return '';
  return String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // strip combining diacritic marks
    .toLowerCase()
    .replace(/['']/g, '')              // curly + straight apostrophes
    .replace(/[`´]/g, '')              // backticks, accents used as apostrophes
    .replace(/[^a-z0-9\s]/g, ' ')      // other punctuation → space
    .replace(/\s+/g, ' ')              // collapse whitespace
    .trim();
}

// v0.146 — fuzzyNormalize: applies phonetic substitutions and doubled-
// letter collapse on top of normalizeSearchText. Used for SEARCH MATCHING
// only — never for display. Catches the most common spelling failures:
//
//   ph → f       "phylefish"  → "filefish"
//   ck → k       "rockfish"   → "rokfish"
//   k  → c       "klown"      → "clown",  "kole" → "cole"
//   doubled      "coppers"    → "copers", "coopers" → "copers"
//                "ocellaris"  → "ocelaris"
//
// Applied symmetrically to both the query AND the indexed text so
// matches happen via the standard substring path — no Levenshtein
// needed for these cases.
function fuzzyNormalize(s){
  var norm = normalizeSearchText(s);
  if(!norm) return '';
  return norm
    .replace(/ph/g, 'f')
    .replace(/ck/g, 'k')
    .replace(/k/g, 'c')
    .replace(/(.)\1+/g, '$1');  // collapse all doubled adjacent letters
}

// v0.144 — Levenshtein distance for "did you mean" suggestions when a
// search returns zero results. Capped at length 32 for perf. Returns
// the number of single-character edits (insert/delete/substitute)
// needed to turn one string into the other.
function ltcLevenshtein(a, b){
  if(a === b) return 0;
  if(!a.length) return b.length;
  if(!b.length) return a.length;
  if(a.length > 32) a = a.slice(0, 32);
  if(b.length > 32) b = b.slice(0, 32);
  var prev = new Array(b.length + 1);
  var curr = new Array(b.length + 1);
  for(var j = 0; j <= b.length; j++) prev[j] = j;
  for(var i = 1; i <= a.length; i++){
    curr[0] = i;
    for(var k = 1; k <= b.length; k++){
      var cost = a[i - 1] === b[k - 1] ? 0 : 1;
      curr[k] = Math.min(
        curr[k - 1] + 1,
        prev[k] + 1,
        prev[k - 1] + cost
      );
    }
    var tmp = prev; prev = curr; curr = tmp;
  }
  return prev[b.length];
}

// v0.144 — Build "did you mean" suggestions from a typed query.
// Strategy:
//   1. If query is short (<3 chars), bail — too many false matches.
//   2. Score every in-stock + featured fish by:
//      - Prefix match bonus (name starts with query's first 3+ chars)
//      - Token-overlap bonus (any query word appears as substring in name)
//      - Levenshtein distance (lower = better)
//   3. Sort descending by score, take top 5 unique names.
function getDidYouMeanSuggestions(rawQuery){
  // v0.146 — fuzzyNormalize both query and candidates so phonetic
  // substitutions and doubled-letter collapse apply on both sides.
  // "klown" → "clon" (after k→c and double collapse, but here it's
  // just k→c since no doubles), matches "clownfish" → "clonfish".
  var q = fuzzyNormalize(rawQuery);
  if(!q || q.length < 3) return [];
  var queryTokens = q.split(' ').filter(function(t){ return t.length >= 2 });
  if(!queryTokens.length) return [];
  var pool = Array.isArray(window.FISH) ? FISH : [];
  var scored = [];
  for(var i = 0; i < pool.length; i++){
    var fish = pool[i];
    // v0.145 — include scientific name and aliases in candidate text.
    // v0.146 — also include Spanish name so Spanish-mode users get
    // suggestions for misspelled Spanish queries.
    // v0.147 — getMergedAliases includes the EXTRA_ALIASES trade-name
    // augmentation so suggestions can recover from confusions like
    // "red scooter blenni" → Red Scooter Dragonet.
    var aliasText = getMergedAliases(fish).join(' ');
    var nameNorm = fuzzyNormalize(
      (fish.name || '') + ' ' +
      (fish.name_es || '') + ' ' +
      (fish.scientific || '') + ' ' +
      aliasText
    );
    if(!nameNorm) continue;
    var nameTokens = nameNorm.split(' ').filter(function(t){ return t.length >= 2 });
    if(!nameTokens.length) continue;
    var score = 0;
    // Prefix match — strongest signal. Did the query's first 3-4 chars
    // start any token in the name?
    var qPrefix = q.slice(0, Math.min(q.length, 4));
    for(var p = 0; p < nameTokens.length; p++){
      if(nameTokens[p].indexOf(qPrefix) === 0){ score += 50; break; }
    }
    // Token overlap — each query word found as substring of any name
    // token scores.
    for(var t = 0; t < queryTokens.length; t++){
      for(var n = 0; n < nameTokens.length; n++){
        if(nameTokens[n].indexOf(queryTokens[t]) !== -1){ score += 18; break; }
      }
    }
    // v0.145 — per-token Levenshtein.
    // v0.146 — also handle the case where the query token is a PREFIX of
    // a longer name token (like "clown" vs "clownfish"). The previous
    // version skipped these because the length-difference filter was set
    // to 3. Now: if the query token is a clean prefix of any name token
    // (and is at least 4 chars), score it as distance 0.
    var bestDist = 99;
    for(var qt = 0; qt < queryTokens.length; qt++){
      var qTok = queryTokens[qt];
      for(var nt = 0; nt < nameTokens.length; nt++){
        var nameTok = nameTokens[nt];
        // Prefix-of-token shortcut for short queries on long tokens
        if(qTok.length >= 4 && nameTok.indexOf(qTok) === 0){
          if(0 < bestDist) bestDist = 0;
          continue;
        }
        // Skip if length difference alone exceeds 3 — can't be a close match
        var lenDiff = Math.abs(qTok.length - nameTok.length);
        if(lenDiff > 3) continue;
        var d = ltcLevenshtein(qTok, nameTok);
        if(d < bestDist) bestDist = d;
      }
    }
    var distScore = Math.max(0, 24 - bestDist * 5);
    score += distScore;
    if(score >= 14){
      // v0.146 — display name uses L() so Spanish-mode users see Spanish
      // pills, English-mode users see English. The score is based on
      // matching against BOTH languages so the user finds the fish either
      // way; the pill text just respects their current language toggle.
      var displayName = (typeof L === 'function') ? L(fish, 'name') : fish.name;
      scored.push({fish:fish, name:displayName, score:score});
    }
  }
  scored.sort(function(a, b){ return b.score - a.score; });
  // Dedupe by display name and take top 5
  var seen = new Set();
  var out = [];
  for(var s = 0; s < scored.length && out.length < 5; s++){
    if(seen.has(scored[s].name)) continue;
    seen.add(scored[s].name);
    out.push(scored[s]);
  }
  return out;
}

function cardSearchText(item){
  // v0.145 — identity-only search index. The previous version included
  // overview, visualCue, staffNote, bestWith, and cautionWith — all prose
  // fields that caused false positives. Searching "copepod" was returning
  // Mandarin Goby because its overview said "feeds on copepods". Searching
  // "shrimp" was returning fish whose cautionWith said "do not house with
  // small shrimp". Customers expect search to find by NAME, not by mention
  // in description. Identity fields only now: name, scientific, aliases,
  // category, role, diet, origin, habitat (all broad-term identifiers),
  // and tankCode (so staff can search by tank).
  // v0.146 — also include Spanish equivalents so search works regardless
  // of which language toggle is active. Index is built with fuzzyNormalize
  // (phonetic + double-letter collapse) so "klown" matches "clownfish",
  // "coppers" matches "Cooper's", "rokfish" matches "Rockfish", etc.
  // v0.147 — getMergedAliases pulls in EXTRA_ALIASES so trade-name
  // confusions are searchable. Customer types "red scooter blenny" →
  // matches Red Scooter Dragonet via the EXTRA_ALIASES augmentation.
  return fuzzyNormalize([
    item.name,
    item.name_es,
    item.scientific,
    item.category,
    item.role,
    item.role_es,
    item.diet,
    item.diet_es,
    item.origin,
    item.origin_es,
    item.habitat,
    item.tankCode,
    ...getMergedAliases(item)
  ].filter(Boolean).join(' '));
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
    'Urchins':'cat-urchins','Starfish':'cat-starfish','Clams':'cat-clams',
    'Inverts':'cat-inverts'};
  return map[cat] || '';
}
// v0.131 — hex color per category for dynamic tinting of dropdowns/UI.
const CATEGORY_HEX = {
  'Tangs':'#6ca8ff','Angelfish':'#ffa850','Wrasses':'#c88aff','Gobies & Blennies':'#6ed884',
  'Clownfish':'#ff9050','Damsels':'#5ed4dc','Basslets & Dottybacks':'#e870c8','Cardinalfish':'#f06060',
  'Anthias':'#ff7faa','Butterflyfish':'#ffd84a','Hawkfish':'#ffb84a','Rabbitfish':'#b8e860',
  'Triggerfish':'#d04860','Puffers':'#80c8ff','Eels':'#4cb898','Lionfish':'#e85060','Other Fish':'#9eb4c8',
  'Shrimp':'#ff8a78','Crabs':'#d88a4a','Snails':'#c4a060','Urchins':'#8c70c8','Starfish':'#e8c450',
  'Clams':'#80d8b8','Inverts':'#5ed4c0'
};
function categoryHex(cat){ return CATEGORY_HEX[cat] || '#c8b2ff'; }
function syncInventoryCategoryDropdownColor(){
  const sel = document.getElementById('inventoryCategoryFilter');
  if(!sel) return;
  const val = sel.value;
  const hex = (val && val !== 'all') ? categoryHex(val) : '#c8b2ff';
  sel.style.setProperty('--ctrl-accent', hex, 'important');
  const wrap = sel.closest('.inventory-control');
  if(wrap) wrap.style.setProperty('--ctrl-accent', hex, 'important');
}
document.addEventListener('change', function(e){
  if(e.target && e.target.id === 'inventoryCategoryFilter'){
    syncInventoryCategoryDropdownColor();
  }
}, true);
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
    // v0.144 — normalized search: apostrophes/diacritics/punctuation
    // stripped on both sides so "coopers" matches "Cooper's Anthias".
    // v0.145 — overview prose dropped from search target.
    // v0.146 — fuzzyNormalize applied: phonetic substitutions (k→c, ph→f,
    // ck→k) and doubled-letter collapse on both sides, so "klown" matches
    // "clownfish", "rokfish" matches "Rockfish", "coppers" matches "Cooper's".
    const q = fuzzyNormalize(state.search);
    if(q){
      list = list.filter(item => cardSearchText(item).includes(q));
    }
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
      spawnBubbleBurst(btn,e,{count:4,spread:22});
      btn.classList.add('press-flash');
      btn.addEventListener('animationend',()=>btn.classList.remove('press-flash'),{once:true});
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
    return `<button type="button" class="folder-tab ${state.category === tab ? 'active' : ''}" data-category="${tab}" aria-pressed="${state.category === tab ? 'true' : 'false'}" style="--tab-top:${top};--tab-bottom:${bottom};--tab-border:rgba(255,255,255,.18);--tab-glow:${glow};">${TC(tab)} <span>(${count})</span></button>`;
  }).join('');
  [...bar.querySelectorAll('.folder-tab')].forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
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
  requestAnimationFrame(()=>{ updateCategoryRailUI(); updateBundleRailUI(); bindRailObservers(); bindCategoryRailGestures(); });
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
    ? `<div class="price-badge sale-main-badge"><span class="price-sale-tag">${typeof T==='function'?T('sale'):'SALE'}</span><span class="price-value sale-price">${formatMoney(item.salePrice)}</span></div>`
    : `<div class="price-badge"><span class="price-value">${formatMoney(item.price)}</span></div>`;
  const tankHtml = isEncy || !item.tankCode ? '' : `<div class="tank-pill">${typeof T==='function'?T('tankLabel'):'Tank'} ${item.tankCode}</div>`;
  const sizeInches = (typeof SIZE_SCALE!=='undefined' && item.stockSize && SIZE_SCALE[item.stockSize]) ? ' ('+SIZE_SCALE[item.stockSize]+')' : '';
  const stockMeta = isEncy ? '' : `<div class="meta-box"><div class="meta-label">${typeof T==="function"?T("stockSize"):"In stock size"}</div><div class="meta-value">${displayStockSize(item.stockSize)}${sizeInches}</div></div>`;
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
        <div class="card-title-row${onCardSale ? ' has-sale' : ''}"><h2 class="card-title">${L(item,"name")}</h2>${oldCompactPriceHtml}</div>
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
          <div class="mobile-fact"><span>${typeof T==='function'?T('diet'):'Diet'}</span><strong>${safeText(L(item,'diet'))}</strong></div>
          <div class="mobile-fact"><span>${typeof T==='function'?T('origin'):'Origin'}</span><strong>${safeText(L(item,'origin'))}</strong></div>
          <div class="mobile-fact"><span>${typeof T==='function'?T('stockSize'):'In stock size'}</span><strong>${displayStockSize(item.stockSize)}${sizeInches}</strong></div>
        </div>
        <div class="meta-grid">
          <div class="meta-box"><div class="meta-label">${typeof T==="function"?T("minTank"):"Min Tank"}</div><div class="meta-value">${item.minTank}</div></div>
          <div class="meta-box"><div class="meta-label">${typeof T==="function"?T("diet"):"Diet"}</div><div class="meta-value">${safeText(L(item,"diet"))}</div></div>
          ${stockMeta}
          <div class="meta-box"><div class="meta-label">${typeof T==="function"?T("origin"):"Origin"}</div><div class="meta-value">${safeText(L(item,"origin"))}</div></div>
        </div>
        <div class="card-copy">${safeText(L(item,"overview"), '')}</div>
        ${state.staffMode && item.inStock ? `<div class="staff-actions">
          <button class="staff-action-btn edit" onclick="event.stopPropagation();staffEditPrice('${item.id}')">${typeof T==='function'?T('editPrice'):'Edit Price'}</button>
          <button class="staff-action-btn edit" onclick="event.stopPropagation();staffEditTank('${item.id}')">${typeof T==='function'?T('editTank'):'Edit Tank'}</button>
          <button class="staff-action-btn edit" onclick="event.stopPropagation();staffEditStockNumber('${item.id}')" style="background:rgba(120,170,255,.14);border-color:rgba(120,170,255,.28);color:#9fc0ff">Stock #: ${item.stockNumber || '—'}</button>
          <button class="staff-action-btn edit" onclick="event.stopPropagation();staffEditStockSize('${item.id}')" style="background:rgba(255,210,120,.14);border-color:rgba(255,210,120,.28);color:#ffd27a">${typeof T==='function'?T('editStockSize'):'Edit Size'}</button>
          <button class="staff-action-btn edit" onclick="event.stopPropagation();staffEditStaffNote('${item.id}')" style="background:rgba(140,120,255,.14);border-color:rgba(140,120,255,.28);color:#c7beff">${typeof T==='function'?T('editStaffNote'):'Edit Staff Note'}</button>
          <button class="staff-action-btn edit" onclick="event.stopPropagation();staffUploadPhoto('${item.id}')" style="background:rgba(180,130,255,.15);border-color:rgba(180,130,255,.3);color:#b888ff">${typeof T==='function'?T('uploadPhoto'):'Upload Photo'}</button>
          <button class="staff-action-btn sold" onclick="event.stopPropagation();staffMarkSold('${item.id}')">${typeof T==='function'?T('markSold'):'Mark Sold'}</button>
          <button class="staff-action-btn dead" onclick="event.stopPropagation();staffMarkDead('${item.id}')">${typeof T==='function'?T('removeLoss'):'Remove (Loss)'}</button>
          <button class="staff-action-btn edit" onclick="event.stopPropagation();staffQuarantine('${item.id}')" style="background:rgba(220,180,50,.15);border-color:rgba(220,180,50,.3);color:#ddbb44">${typeof T==='function'?T('quarantine'):'Quarantine'}</button>
          ${majorRollbackButtons(item) || `<button class="staff-action-btn edit" onclick="event.stopPropagation();staffUndoFishLastChange('${item.id}')" style="background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.16);color:#fff">Undo Last Edit</button>`}
        </div>
        ${item.quarantine ? `<div style="margin-top:4px;padding:4px 8px;border-radius:6px;background:rgba(220,180,50,.15);border:1px solid rgba(220,180,50,.25);font-size:11px;font-weight:700;color:#ddbb44">⏱ ${typeof T==='function'?(item.quarantineUntil?T('quarantineDays')(Math.max(0,Math.ceil((item.quarantineUntil-Date.now())/86400000))):T('quarantineOngoing')):'Quarantine'} <button onclick="event.stopPropagation();staffEndQuarantine('${item.id}')" style="margin-left:6px;padding:2px 6px;border-radius:4px;background:rgba(90,220,200,.2);border:1px solid rgba(90,220,200,.3);color:#5eebc8;font-size:10px;cursor:pointer">${typeof T==='function'?T('clearQ'):'Clear'}</button></div>` : ''}` : ''}
        ${state.staffMode && !item.inStock ? `<div class="staff-actions">
          <button class="staff-action-btn edit" onclick="event.stopPropagation();staffRestockFish('${item.id}')" style="background:rgba(90,220,200,.15);border-color:rgba(90,220,200,.3);color:#5eebc8">${typeof T==='function'?T('addToStock'):'+ Add to Stock'}</button>
          <button class="staff-action-btn edit" onclick="event.stopPropagation();staffEditStockNumber('${item.id}')" style="background:rgba(120,170,255,.14);border-color:rgba(120,170,255,.28);color:#9fc0ff">Stock #: ${item.stockNumber || '—'}</button>
          <button class="staff-action-btn edit" onclick="event.stopPropagation();staffEditStockSize('${item.id}')" style="background:rgba(255,210,120,.14);border-color:rgba(255,210,120,.28);color:#ffd27a">${typeof T==='function'?T('editStockSize'):'Edit Size'}</button>
          <button class="staff-action-btn edit" onclick="event.stopPropagation();staffEditStaffNote('${item.id}')" style="background:rgba(140,120,255,.14);border-color:rgba(140,120,255,.28);color:#c7beff">${typeof T==='function'?T('editStaffNote'):'Edit Staff Note'}</button>
          <button class="staff-action-btn edit" onclick="event.stopPropagation();staffUploadPhoto('${item.id}')" style="background:rgba(180,130,255,.15);border-color:rgba(180,130,255,.3);color:#b888ff">${typeof T==='function'?T('uploadPhoto'):'Upload Photo'}</button>
          ${majorRollbackButtons(item) || `<button class="staff-action-btn edit" onclick="event.stopPropagation();staffUndoFishLastChange('${item.id}')" style="background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.16);color:#fff">Undo Last Edit</button>`}
        </div>
        ${item.soldAt && state.staffMode ? `<div style="margin-top:4px;font-size:10px;color:rgba(255,255,255,.3)">${typeof T==='function'?T('soldAgo')(Math.round((Date.now()-item.soldAt)/3600000),Math.max(0,24-Math.round((Date.now()-item.soldAt)/3600000))):'Sold recently'}</div>` : ''}
        ${item.lossAt && state.staffMode ? `<div style="margin-top:4px;font-size:10px;color:rgba(255,100,100,.4)">${typeof T==='function'?T('removedAgo')(Math.round((Date.now()-item.lossAt)/3600000)):'Removed recently'}</div>` : ''}` : ''}
        ${!item.inStock && !state.staffMode && state.mode==='ency' ? `<button class="notify-btn" onclick="event.stopPropagation();notifyWhenInStock('${L(item,"name")}')">Notify when in stock</button>` : ''}
        <div class="card-actions-row">
          <div class="tap-row card-action-text"><span>${typeof T==='function'?T('tap'):'Tap for full profile'}</span><span>›</span></div>
          ${state.staffMode ? `<button class="tank-pill" onclick="event.stopPropagation();staffUndoFishLastChange('${item.id}')">Undo Last Edit</button>` : `<button class="tank-pill card-compare-btn${isComp?' is-active':''}" onclick="event.stopPropagation();toggleCompare('${item.id}')">${isComp?(typeof T==='function'?T('comparing'):'✓ Comparing'):(typeof T==='function'?T('compare'):'+ Compare')}</button>`}
        </div>
      </div>
    </article>
  `;
}
function gaugeCard(title, score, lowLabel, highLabel, mode='risk'){
  const clamped = Math.max(4, Math.min(96, score));
  const verdictClass = score <= 15 ? 'v-cyan'
                     : score <= 30 ? 'v-green'
                     : score <= 45 ? 'v-lime'
                     : score <= 60 ? 'v-yellow'
                     : score <= 75 ? 'v-orange'
                                   : 'v-red';
  return `
    <div class="gauge-card gauge-card-fx" style="--gauge-score:${clamped}%">
      <div class="gauge-head">
        <strong>${title}</strong>
        <span class="gauge-verdict ${verdictClass}">${riskText(score, mode)}</span>
      </div>
      <div class="gauge-track" style="--gauge-score:${clamped}%">
        <div class="gauge-liquid"></div>
        <canvas data-gauge-canvas data-score="${clamped}"></canvas>
        <div class="gauge-marker" style="left: calc(${clamped}%);"></div>
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
  if(care) parts.push(`Best suited to ${care.toLowerCase()} keepers who already understand the species' needs.`);
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
  if(minTank) pieces.push(`Best in systems that can realistically support at least ${minTank}.`);
  pieces.push(`Coral compatibility reads ${coral}, and ornamental invertebrate risk reads ${invert}.`);
  pieces.push(`Overall, this species is best matched to ${care.toLowerCase()} keepers and a stocking plan that fits its long-term needs.`);
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
  // v0.139 — order longest fact first so the visual stack reads top-down
  // from the heaviest line to the lightest, which Chris asked for.
  const sorted = facts.slice().sort((a,b) => b.length - a.length);
  return sorted.length ? sorted.map(f => `<div class="fact-card">${f}</div>`).join('') : '';
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
    return item.price ? formatMoney(item.price) : '—';
  }
  if(key === 'minTank') return safeText(item.minTank, 'Unknown');
  if(key === 'care') return safeText(item.careLabel, 'Unknown');
  if(key === 'maxSize') return safeText(item.maxSize, 'Unknown');
  return 'Unknown';
}
function renderStaffEditor(item){
  if(!state.staffMode) return '';
  // V0.123 — in-modal staff editor rebuild. Was a wall of 8 quick-edit
  // tiles + 6 action buttons + redundant text info row, all crammed into
  // one block with inline styles. New layout: status header, 4 BIG primary
  // action tiles, secondary action pills, conditional rollback bar,
  // collapsed "More edits" section. Tactile feedback via ltcFx (jelly
  // squish on every tap, bubble cloud celebration on Mark Sold).
  const stockLabel = displayStockSize(item.stockSize);
  const status = item.quarantine ? 'Quarantine' : (item.reserved ? 'Held' : (item.inStock ? 'In stock' : (item.lossAt ? 'Removed' : 'Out of stock')));
  const statusTone = item.quarantine ? 'amber' : (item.reserved ? 'purple' : (item.inStock ? 'green' : 'red'));
  const qty = displayQuantityValue(item.quantity);
  const hold = reservedLabel(item);
  const arrival = formatDateShort(item.arrivalDate);
  const rollback = majorRollbackHoldButtons(item);
  const priceDisplay = item.price ? formatMoney(item.onSale && item.salePrice ? item.salePrice : item.price) : '—';
  const tankDisplay = item.tankCode || '—';
  const stockNumberDisplay = item.stockNumber || '—';

  // Primary actions — 4 BIG tiles for in-stock fish, 1 wide tile for out-of-stock
  const primaryActions = item.inStock ? `
    <button type="button" class="se-tile se-tone-green" onclick="event.stopPropagation();ltcFx.bubbles(this);staffMarkSold('${item.id}')">
      <svg class="se-tile-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      <div class="se-tile-title">Mark sold</div>
      <div class="se-tile-sub">${priceDisplay}</div>
    </button>
    <button type="button" class="se-tile se-tone-blue" onclick="event.stopPropagation();ltcFx.jelly(this);staffEditTank('${item.id}')">
      <svg class="se-tile-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 11h18"/><line x1="9" y1="17" x2="15" y2="17"/></svg>
      <div class="se-tile-title">Move tank</div>
      <div class="se-tile-sub">Tank ${tankDisplay}</div>
    </button>
    <button type="button" class="se-tile se-tone-purple" onclick="event.stopPropagation();ltcFx.jelly(this);staffEditPrice('${item.id}')">
      <svg class="se-tile-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
      <div class="se-tile-title">Edit price</div>
      <div class="se-tile-sub">${priceDisplay}</div>
    </button>
    <button type="button" class="se-tile se-tone-amber" onclick="event.stopPropagation();ltcFx.jelly(this);staffEditQuantity('${item.id}')">
      <svg class="se-tile-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
      <div class="se-tile-title">Edit qty</div>
      <div class="se-tile-sub">${qty} in stock</div>
    </button>
  ` : `
    <button type="button" class="se-tile se-tile-wide se-tone-green" onclick="event.stopPropagation();ltcFx.bubbles(this);staffRestockFish('${item.id}')">
      <svg class="se-tile-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
      <div class="se-tile-title">Add back to stock</div>
      <div class="se-tile-sub">Bring this fish back to live inventory</div>
    </button>
  `;

  // Secondary actions — smaller pills, fewer for out-of-stock
  const secondaryActions = item.inStock ? `
    <button type="button" class="se-pill se-pill-red" onclick="event.stopPropagation();ltcFx.jelly(this);staffMarkDead('${item.id}')">Mark loss</button>
    <button type="button" class="se-pill se-pill-amber" onclick="event.stopPropagation();ltcFx.jelly(this);staffQuarantine('${item.id}')">Quarantine</button>
    <button type="button" class="se-pill se-pill-rose" onclick="event.stopPropagation();ltcFx.jelly(this);staffEditHold('${item.id}')">${item.reserved ? 'Edit hold' : 'Hold / reserve'}</button>
    <button type="button" class="se-pill" onclick="event.stopPropagation();ltcFx.jelly(this);staffUploadPhoto('${item.id}')">+ Photo</button>
    <button type="button" class="se-pill" onclick="event.stopPropagation();ltcFx.jelly(this);staffEditStaffNote('${item.id}')">Edit note</button>
    <button type="button" class="se-pill" onclick="event.stopPropagation();ltcFx.jelly(this);showSaleHistory('${item.id}')">Sale history</button>
  ` : `
    <button type="button" class="se-pill" onclick="event.stopPropagation();ltcFx.jelly(this);staffUploadPhoto('${item.id}')">+ Photo</button>
    <button type="button" class="se-pill" onclick="event.stopPropagation();ltcFx.jelly(this);staffEditStaffNote('${item.id}')">Edit note</button>
    <button type="button" class="se-pill" onclick="event.stopPropagation();ltcFx.jelly(this);showSaleHistory('${item.id}')">Sale history</button>
  `;

  // Conditional rollback bar — only when something can be undone
  const rollbackBar = rollback ? `
    <div class="se-rollback-bar">
      <span class="se-rollback-label">UNDO RECENT</span>
      <div class="se-rollback-buttons">${rollback}</div>
    </div>` : '';

  return `<div class="staff-editor-v123">
    <div class="se-mode-banner">
      <span class="se-mode-banner-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
      </span>
      <div class="se-mode-banner-text">
        <strong>STAFF MODE</strong>
        <span>Edits sync across the kiosk and staff history</span>
      </div>
      <div class="se-mode-banner-sweep"></div>
    </div>

    <div class="se-header">
      <div class="se-status-row">
        <span class="se-status se-status-${statusTone}"><span class="se-status-dot"></span>${status}</span>
        ${hold && hold !== '—' ? `<span class="se-mini-pill">${hold}</span>` : ''}
      </div>
      <div class="se-info-row">Stock # <strong>${stockNumberDisplay}</strong> · Tank <strong>${tankDisplay}</strong> · Qty <strong>${qty}</strong> · ${priceDisplay !== '—' ? `<strong>${priceDisplay}</strong>` : 'No price'} ${stockLabel && stockLabel !== '—' ? `· <strong>${stockLabel}</strong>` : ''}</div>
    </div>

    <div class="se-primary-grid${item.inStock ? '' : ' se-primary-grid-single'}">
      ${primaryActions}
    </div>

    <div class="se-secondary-row">
      ${secondaryActions}
    </div>

    ${rollbackBar}

    <div class="se-more-wrap" data-se-more-wrap>
      <button type="button" class="se-more-toggle" data-se-more-toggle>
        <span class="se-more-label">More edits</span>
        <span class="se-more-chev">▾</span>
      </button>
      <div class="se-more-content">
        <div class="se-more-grid">
          <button type="button" class="se-mini-tile" onclick="event.stopPropagation();ltcFx.jelly(this);staffEditStockNumber('${item.id}')">
            <span class="se-mini-tile-label">Stock #</span>
            <span class="se-mini-tile-value">${stockNumberDisplay}</span>
          </button>
          <button type="button" class="se-mini-tile" onclick="event.stopPropagation();ltcFx.jelly(this);staffEditStockSize('${item.id}')">
            <span class="se-mini-tile-label">Size / grade</span>
            <span class="se-mini-tile-value">${stockLabel || '—'}</span>
          </button>
          <button type="button" class="se-mini-tile" onclick="event.stopPropagation();ltcFx.jelly(this);staffEditStockInfo('${item.id}')">
            <span class="se-mini-tile-label">Vendor</span>
            <span class="se-mini-tile-value">${item.vendor || '—'}</span>
          </button>
          <button type="button" class="se-mini-tile" onclick="event.stopPropagation();ltcFx.jelly(this);staffEditStockInfo('${item.id}')">
            <span class="se-mini-tile-label">Arrived</span>
            <span class="se-mini-tile-value">${arrival || '—'}</span>
          </button>
        </div>
      </div>
    </div>

    ${recentHistoryHtml(item)}
  </div>`;
}

// v0.186 — modalHeaderBar DELETED. Was only ever called from the
// pre-merge mobile template (modalTemplateMobile) which itself was
// killed in v0.186. The unique content modalHeaderBar surfaced was
// the headerSummary text via summaryText() — that content is now
// rendered directly in the merged template hero as `.hero-summary-line`
// so it appears for ALL viewports, not just phone-portrait. Without
// this audit fix, headerSummary content (real customer copy populated
// for many invert species) would have been completely invisible
// because the desktop template never displayed it either. The merge
// without the audit would have lost this silently.
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
  const sizeText = displayStockSize(item.stockSize);
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
  const waterParamsHtml = typeof waterParamsSection === 'function' ? waterParamsSection(item) : '';
  const moreSubParts = [];
  if(buying || behavior || feeding || recognition) moreSubParts.push('Reading');
  if(bestWith || cautionWith) moreSubParts.push('Compatibility');
  if(foodSection && foodSection.trim()) moreSubParts.push('Foods');
  if(waterParamsHtml && waterParamsHtml.trim()) moreSubParts.push('Water');
  const moreSub = moreSubParts.join(' · ');
  const showMore = moreSubParts.length > 0;
  const categoryLabel = (typeof CARD_LABELS!=='undefined' && CARD_LABELS[item.category]) ? CARD_LABELS[item.category] : (typeof TC==='function' ? TC(item.category) : item.category);
  const galleryHtml = (typeof galleryTemplate === 'function') ? galleryTemplate(item) : '';
  return `
    <div class="modal-magazine-flow modal-hero-magazine">

      <div class="modal-photo-card modal-hero-media modal-hero-wide">
        <div class="modal-photo modal-photo-magazine" data-detail-photo="${item.id}">
          <div class="image-placeholder">LTC</div><div class="skeleton-img"></div>
          ${item.price ? `<div class="hero-pricetag">${item.onSale && item.salePrice ? `<span class="hero-price-old">${formatMoney(item.price)}</span><strong>${formatMoney(item.salePrice)}</strong>` : `<strong>${formatMoney(item.price)}</strong>`}</div>` : ''}
          <div class="modal-photo-copy modal-photo-copy-magazine">
            <span class="hero-cat-pill">${categoryLabel}</span>
            <h2>${L(item,"name")}</h2>
            <span class="latin">${item.scientific}</span>
            ${aliasText ? `<div class="hero-aliases">also called ${aliasText}</div>` : ''}
            ${summaryText(item) ? `<p class="hero-summary-line">${summaryText(item)}</p>` : ''}
            <div class="hero-status-pills">
              <span class="hero-pill" onclick="event.stopPropagation();bouncePill(this)">${typeof T==='function'?T('tankLabel'):'Tank'} ${item.tankCode || '—'}</span>
              <span class="hero-pill" onclick="event.stopPropagation();bouncePill(this)">${sizeText}${sizeInches}</span>
              ${originText ? `<span class="hero-pill" onclick="event.stopPropagation();bouncePill(this)">${originText}</span>` : ''}
              <span class="hero-pill status-pill ${reefClass}" onclick="event.stopPropagation();bouncePill(this)">${reefText}</span>
            </div>
          </div>
        </div>
      </div>

      ${galleryHtml ? `<div class="mag-gallery-row">${galleryHtml}</div>` : (state.staffMode ? `<div class="photo-upload-row"><button type="button" class="photo-gallery-upload photo-gallery-upload-wide" onclick="event.stopPropagation();staffUploadPhoto('${item.id}')">${typeof T==='function'?T('uploadStorePhoto'):'+ Upload store photo'}</button></div>` : '')}

      ${state.staffMode ? renderStaffEditor(item) : ''}

      <p class="mag-section-header">Quick info</p>
      <div class="modal-hero-statstrip mag-statstrip">
        <div class="hero-stat-card hero-stat-tank">
          <span class="hero-stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 13c2 0 3-1.2 4.5-1.2S10 13 12 13s3-1.2 4.5-1.2S19 13 21 13"/><circle cx="8.5" cy="9" r="0.7" fill="currentColor"/></svg></span>
          <label>Min tank</label><strong>${buildStatValue(item,'minTank')}</strong>
        </div>
        <div class="hero-stat-card hero-stat-size">
          <span class="hero-stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="9" width="20" height="6" rx="1"/><path d="M6 9v3M10 9v3M14 9v3M18 9v3"/></svg></span>
          <label>Max size</label><strong>${buildStatValue(item,'maxSize')}</strong>
        </div>
        <div class="hero-stat-card hero-stat-diet">
          <span class="hero-stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13c0 4 3.5 7 8 7s8-3 8-7"/><path d="M3 13h18"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/><circle cx="13" cy="7" r="1.2" fill="currentColor"/><circle cx="16" cy="10" r="1.2" fill="currentColor"/></svg></span>
          <label>Diet</label><strong>${safeText(L(item,'diet'))}</strong>
        </div>
        <div class="hero-stat-card hero-stat-care">
          <span class="hero-stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.4l-5.3 2.7 1-5.8L3.5 9.2l5.9-.9z"/></svg></span>
          <label>Care level</label><strong>${buildStatValue(item,'care')}</strong>
        </div>
      </div>

      <p class="mag-section-header">Compatibility gauges</p>
      <div class="mag-gauges-wrap"><div class="gauges">${gaugeCard(T('tempAggression'), item.aggression, T('veryCalm2'), T('veryDangerous'))}${gaugeCard(T('coralRisk'), item.coralRisk, T('reefSafe2'), T('coralNipper'))}${gaugeCard(T('invertSafetyRisk'), item.invertRisk, T('lowInvertRisk'), T('likelyHarass'))}${gaugeCard(T('careDiffLabel'), item.careDifficulty, T('easyLabel'), T('expertSpec'), 'difficulty')}</div></div>

      ${factStack ? `<p class="mag-section-header">Quick facts</p><div class="mag-fact-stack">${factStack}</div>` : ''}

      ${overviewText ? `<p class="mag-section-header">About this fish</p><div class="mag-overview"><p>${overviewText}</p></div>` : ''}

      ${staffNote ? `<div class="mag-staff-note"><label>STAFF NOTE</label><p>${staffNote}</p></div>` : ''}

      ${item.seasonal ? `<div class="seasonal-section"><span class="seasonal-icon">📅</span><div><div class="seasonal-label">Seasonal / Special Note</div><div class="seasonal-text">${item.seasonal}</div></div></div>` : ''}

      ${noticeBlocks ? `<div class="mag-notice-block"><div class="mag-notice-label">What to notice</div><div class="reading-stack">${noticeBlocks}</div></div>` : ''}

      <p class="mag-section-header">Similar fish you might like</p>
      <div class="mag-similar-row">${renderSimilarCards(item,false)}</div>

      ${showMore ? `<div class="more-details-wrap" data-more-details><button type="button" class="more-details-toggle"><span class="mdt-label"><span class="mdt-title">More details</span><span class="mdt-sub">${moreSub}</span></span><span class="more-chev">▼</span></button><div class="more-details-content">${(buying || behavior || feeding || recognition) ? `<div class="reading-stack">${buying ? `<div class="reading-block rb-buying"><strong>Buying guidance</strong><p>${buying}</p></div>` : ''}${behavior ? `<div class="reading-block rb-behavior"><strong>Behavior &amp; tank fit</strong><p>${behavior}</p></div>` : ''}${feeding ? `<div class="reading-block rb-feeding"><strong>Feeding &amp; natural habitat</strong><p>${feeding}</p></div>` : ''}${recognition ? `<div class="reading-block rb-recognition"><strong>Recognition &amp; ID</strong><p>${recognition}</p></div>` : ''}</div>` : ''}${(bestWith || cautionWith) ? `<div class="two-col more-details-twocol">${bestWith ? `<div class="modal-section best-with-section"><div class="section-title"><h3>Works well with</h3></div><div class="pill-list">${bestWith}</div></div>` : ''}${cautionWith ? `<div class="modal-section caution-with-section"><div class="section-title"><h3>Use caution with</h3></div><div class="pill-list">${cautionWith}</div></div>` : ''}</div>` : ''}${foodSection}${waterParamsHtml}${(habitatText && !originText) ? `<div class="origin-card"><strong>Habitat</strong><p>${habitatText}</p></div>` : ''}</div></div>` : ''}

      <!-- v0.186 — bottom action row ported from the deleted mobile template.
           Copy CTA puts "Name • Tank • Price" into the clipboard for staff
           to paste into messages/sms. Close CTA is the secondary action. -->
      <div class="action-row mag-action-row">
        <button class="cta secondary" data-close-modal="true">Close profile</button>
      </div>

    </div>
  `;
}
// v0.186 — modalTemplateMobile DELETED. This was a parallel template
// for phones in portrait orientation that forked from modalTemplate
// before v0.123 and was never updated. As of v0.123 the in-modal staff
// editor was added to modalTemplate (the desktop one). Mobile never
// got it. ~62 builds of staff features only ever rendered on desktop.
// Approach 3 merge: kill the template, route everything through
// modalTemplate, let CSS @media queries handle layout differences.
// Approach 2 audit pass coming after this build to catch any remaining
// divergences. The Copy CTA from the old mobile bottom action row was
// ported into modalTemplate above before deletion.

function renderCardsAndMeta(){
  syncModeChrome();
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
  // v0.144 — empty-state "did you mean" suggestions when a search query
  // returns zero results. Helps non-tech-savvy customers who mis-type
  // (or can't guess the curly apostrophe in "Cooper's") get to the right
  // fish with one tap.
  let emptyHtml;
  if(list.length){
    emptyHtml = list.map(cardTemplate).join('');
  } else {
    const baseEmpty = typeof T==='function'?T('noMatchLong'):'No profiles matched those filters.';
    let didYouMeanHtml = '';
    if(state.search && state.search.trim()){
      const suggestions = getDidYouMeanSuggestions(state.search);
      if(suggestions.length){
        const escName = function(s){ return String(s).replace(/'/g, "\\'").replace(/"/g, '&quot;'); };
        const pills = suggestions.map(function(s){
          return `<button type="button" class="dym-pill" onclick="applyDidYouMean('${escName(s.name)}')">${s.name}</button>`;
        }).join('');
        didYouMeanHtml = `<div class="did-you-mean"><div class="dym-label">Did you mean</div><div class="dym-pills">${pills}</div></div>`;
      }
    }
    emptyHtml = `<div class="empty-state">${didYouMeanHtml}<div class="empty-state-text">${baseEmpty}</div></div>`;
  }
  grid.innerHTML = emptyHtml;
  const rc=document.getElementById('resultsCount');if(rc)rc.textContent=typeof T==='function'?T('showing')(list.length):`Showing ${list.length} profile${list.length===1?'':'s'}`;
  const ah=document.getElementById('activeHint');if(ah)ah.textContent=list.length?(typeof T==='function'?T('hint'):'Tap any card to open a larger pop-up profile with more reading'):(typeof T==='function'?T('noMatch'):'No profiles match the current filters.');
  // v0.143 — perf: delegated click+keydown handler bound ONCE to the grid
  // container, not per-card. Previously every render attached two listeners
  // to every card (~400 listener bindings on a 200-card render). The
  // delegated handler reads e.target.closest('.fish-card') and dispatches
  // from the card's data-id. Card-enter cascade is now CSS-only via
  // :nth-child rules (capped at 20 cards) so we don't loop in JS at all.
  if(!grid.dataset.boundCardEvents){
    grid.dataset.boundCardEvents = 'true';
    grid.addEventListener('click', function(e){
      const card = e.target.closest && e.target.closest('.fish-card');
      if(!card || !grid.contains(card)) return;
      const id = card.dataset.id;
      if(!id) return;
      playOpen();
      openFishModal(id);
    });
    grid.addEventListener('keydown', function(e){
      if(e.key !== 'Enter' && e.key !== ' ') return;
      const card = e.target.closest && e.target.closest('.fish-card');
      if(!card || !grid.contains(card)) return;
      const id = card.dataset.id;
      if(!id) return;
      e.preventDefault();
      playOpen();
      openFishModal(id);
    });
  }
  // Add the entrance class to all cards in one pass — animation delays
  // are picked up from the CSS :nth-child rules for the first 20 cards.
  const cards = grid.querySelectorAll('.fish-card');
  for(let i = 0; i < cards.length; i++){
    cards[i].classList.add('card-enter');
  }
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
function mountDetailVideoLayer(body){
  const detailVideo = document.getElementById('detailBgVideo');
  if(!detailVideo || !body) return null;
  if(detailVideo.parentElement !== body) body.prepend(detailVideo);
  body.classList.add('has-detail-video');
  return detailVideo;
}
function syncDetailVideoLayer(){
  const body = document.getElementById('fishModalBody');
  const detailVideo = document.getElementById('detailBgVideo');
  if(!body || !detailVideo || detailVideo.parentElement !== body) return;
  const h = Math.max(body.scrollHeight, body.clientHeight, body.offsetHeight);
  detailVideo.style.height = `${h}px`;
}
// v0.128 — close button now lives inside .fish-modal as position:absolute
// via CSS. Both sync functions became no-ops. The button parents itself
// back into .fish-modal on every open in case old code moved it elsewhere,
// then CSS pins it top-right of the card.
function syncModalCloseButtonPosition(){
  const closeBtn = document.getElementById('closeFishBtn');
  const overlay = document.getElementById('fishOverlay');
  if(!closeBtn) return;
  if(!overlay || !overlay.classList.contains('show')){
    closeBtn.style.display = 'none';
    return;
  }
  closeBtn.style.display = 'grid';
  // Clear every inline style prior builds set — let CSS own placement.
  ['position','top','right','left','bottom','transform','margin','z-index','inset-inline-start','inset-inline-end']
    .forEach(p => closeBtn.style.removeProperty(p));
}
function syncModalCloseButton(){
  const closeBtn = document.getElementById('closeFishBtn');
  const modal = document.querySelector('#fishOverlay .fish-modal');
  if(!closeBtn || !modal) return;
  // Make sure the button lives INSIDE the card, not the overlay.
  if(closeBtn.parentElement !== modal) modal.insertBefore(closeBtn, modal.firstChild);
  closeBtn.classList.add('floating-modal-close');
  requestAnimationFrame(syncModalCloseButtonPosition);
}

function openFishModal(id){
  const fish = FISH.find(item => item.id === id);
  if(!fish) return;
  state.selectedId = id;
  if(!state.analytics) state.analytics={};
  state.analytics[id] = (state.analytics[id]||0)+1;
  const body = document.getElementById('fishModalBody');
  if(!body) return;
  // v0.186 — TEMPLATE MERGE. Was previously branching:
  //   isPhonePortrait() ? modalTemplateMobile(fish) : modalTemplate(fish)
  // The mobile template was forked pre-v0.123 and never received any
  // staff editor work. Killed via Approach 3. Single template now,
  // CSS @media queries handle layout differences. The .mobile-safe
  // class on the modal element is still toggled below — that's a CSS
  // hook for phone-specific sizing rules in the @media block, not a
  // template-selection mechanism.
  body.innerHTML = modalTemplate(fish);
  if(typeof injectFishMarkers === 'function') injectFishMarkers(fish);
  if(typeof initGaugeWaterCanvas === 'function') requestAnimationFrame(initGaugeWaterCanvas);
  if(typeof initWaterParamsCanvas === 'function') requestAnimationFrame(initWaterParamsCanvas);
  const detailVideo = mountDetailVideoLayer(body);
  syncDetailVideoLayer();
  // Scroll modal to top
  body.scrollTop = 0;
  const modal = body.closest('.fish-modal');
  if(modal){
    modal.scrollTop = 0;
    modal.classList.toggle('mobile-safe', isPhonePortrait());
  }
  syncModalCloseButton();
  const overlay = document.getElementById('fishOverlay');
  if(overlay) overlay.scrollTop = 0;
  // v0.186 — Copy fish + tank info button removed per Chris ("eliminate
  // the Copy fish + tank info this serves no purpose"). Old click handler
  // for [data-copy] also removed since nothing in the modal renders that
  // attribute anymore. The clipboard helper survives for any other future
  // copy buttons elsewhere in the app.
  const closeBtn = body.querySelector('[data-close-modal]');
  if(closeBtn) closeBtn.addEventListener('click', closeFishModal);
  // V0.117 — More details collapse toggle. The HTML and CSS for the
  // collapse were carried over by GPT in v0.116, but this click handler
  // was dropped during integration. Without it, clicking the toggle
  // does nothing because no JS adds the .is-open class.
  body.querySelectorAll('.more-details-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const wrap = btn.closest('[data-more-details]');
      if(!wrap) return;
      const open = wrap.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      const lbl = btn.querySelector('.mdt-title');
      if(lbl) lbl.textContent = open ? 'Hide details' : 'More details';
    });
    btn.setAttribute('aria-expanded', 'false');
  });
  // V0.123 — staff editor "More edits" collapse toggle. Same pattern as
  // the more-details-toggle above. Toggles is-open on the parent wrap.
  body.querySelectorAll('[data-se-more-toggle]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const wrap = btn.closest('[data-se-more-wrap]');
      if(!wrap) return;
      const open = wrap.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      const lbl = btn.querySelector('.se-more-label');
      if(lbl) lbl.textContent = open ? 'Hide extra edits' : 'More edits';
    });
    btn.setAttribute('aria-expanded', 'false');
  });
  if(overlay){overlay.classList.add('show');overlay.setAttribute('aria-hidden', 'false'); triggerGaugeFx(overlay);}
  if(detailVideo){ detailVideo.currentTime = 0; detailVideo.play().catch(()=>{}); }
  document.body.classList.add('modal-open');
  requestAnimationFrame(()=>{
    syncDetailVideoLayer();
    syncModalCloseButtonPosition();
    applyImagesToDOM();
    const activeModalBody = document.getElementById('fishModalBody');
    if(activeModalBody) activeModalBody.scrollTop = 0;
    setTimeout(syncDetailVideoLayer, 180);
    setTimeout(syncDetailVideoLayer, 520);
    setTimeout(syncModalCloseButtonPosition, 60);
    setTimeout(syncModalCloseButtonPosition, 180);
  });
}
function closeFishModal(){
  const overlay = document.getElementById('fishOverlay');
  if(overlay){overlay.classList.remove('show');overlay.setAttribute('aria-hidden', 'true');}
  const detailVideo = document.getElementById('detailBgVideo');
  if(detailVideo){ detailVideo.pause(); detailVideo.currentTime = 0; }
  const modal = document.querySelector('.fish-modal');
  if(modal) modal.classList.remove('mobile-safe');
  const closeBtn = document.getElementById('closeFishBtn');
  if(closeBtn) closeBtn.style.display = 'none';
  document.body.classList.remove('modal-open');
  if(typeof WP_RAF !== 'undefined' && WP_RAF){cancelAnimationFrame(WP_RAF);WP_RAF=null}
  if(typeof cancelGaugeWaterCanvas === 'function') cancelGaugeWaterCanvas();
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
async function fetchWikiImage(title, force=false){
  if(!force && wikiImages.has(title)) return wikiImages.get(title);
  if(force) wikiImages.delete(title);
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
async function fetchImageForFish(fish, force=false){
  if(!force && fishImages.has(fish.id)) return fishImages.get(fish.id);
  if(force) fishImages.delete(fish.id);
  const candidates = getImageCandidates(fish);
  for(const candidate of candidates){
    const src = await fetchWikiImage(candidate, force);
    if(src){
      fishImages.set(fish.id, src);
      if(fish.photoTitle && !wikiImages.get(fish.photoTitle)) wikiImages.set(fish.photoTitle, src);
      persistImageCache();
      return src;
    }
  }
  fishImages.set(fish.id, null);
  persistImageCache();
  return null;
}
async function loadAllImages(){
  applyImagesToDOM();
  const queue = FISH.slice();
  const concurrency = 4;
  const workers = Array.from({length: concurrency}, async () => {
    while(queue.length){
      const fish = queue.shift();
      if(!fish) break;
      await fetchImageForFish(fish);
    }
  });
  await Promise.allSettled(workers);
  applyImagesToDOM();
}

function setInventoryCardPhotoState(card, fish){
  if(!card || !fish) return;
  const src = getPrimaryImageSource(fish);
  const hint = card.querySelector('.inventory-card-photo-hint');
  let img = card.querySelector('.inventory-card-fullbg-image');
  if(!img){
    img = document.createElement('img');
    img.className = 'inventory-card-fullbg-image';
    img.alt = fish.name || '';
    img.loading = 'lazy';
    img.decoding = 'async';
    const overlay = card.querySelector('.inventory-card-fullbg-overlay');
    if(overlay) card.insertBefore(img, overlay); else card.insertBefore(img, card.firstChild);
  }
  if(src){
    img.src = src;
    card.style.setProperty('--inventory-card-image', `url('${String(src).replace(/'/g, "\'")}')`);
    card.classList.add('has-photo');
    card.classList.remove('no-photo');
    if(hint) hint.textContent = '';
  } else {
    img.removeAttribute('src');
    card.style.removeProperty('--inventory-card-image');
    card.classList.remove('has-photo');
    card.classList.add('no-photo');
    if(hint) hint.textContent = 'Photo loading';
  }
}
function applyInventoryCardImages(){
  document.querySelectorAll('.inventory-card-fullbg[data-card-photo]').forEach(card => {
    const fish = getFishById(card.dataset.cardPhoto);
    if(fish) setInventoryCardPhotoState(card, fish);
  });
}

function applyImagesToDOM(){
  applyInventoryCardImages();
  // v0.143 — perf: use getFishById Map (O(1)) instead of FISH.find (O(n))
  // and skip elements that already have a properly-sourced <img> mounted.
  // The previous version did ~135k linear searches per render on a 200-card
  // catalog page.
  const targets = [...document.querySelectorAll('[data-photo]'), ...document.querySelectorAll('[data-detail-photo]')];
  for(const target of targets){
    const id = target.dataset.photo || target.dataset.detailPhoto;
    const fish = getFishById(id);
    if(!fish) continue;
    const src = getPrimaryImageSource(fish);
    const existing = target.querySelector('img');
    if(existing){
      // v0.143 — fast skip: image already mounted with same src, nothing to do
      if(src && existing.dataset.srcApplied === src) continue;
      if(src && existing.dataset.srcApplied !== src){
        existing.dataset.srcApplied = src;
        existing.src = src;
      }
      continue;
    }
    if(!src) continue;
    const img = document.createElement('img');
    img.alt = fish.name;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.referrerPolicy = 'no-referrer';
    img.dataset.srcApplied = src;
    img.addEventListener('error', async () => {
      const retries = Number(target.dataset.imageRetries || 0) + 1;
      target.dataset.imageRetries = String(retries);
      img.remove();
      fishImages.delete(fish.id);
      if(fish.photoTitle) wikiImages.delete(fish.photoTitle);
      persistImageCache();
      const refreshed = retries < 3 ? await fetchImageForFish(fish, true) : null;
      if(refreshed) requestAnimationFrame(applyImagesToDOM);
    }, {once:true});
    img.addEventListener('load', () => {
      target.dataset.imageRetries = '0';
      const placeholder = target.querySelector('.image-placeholder');
      if(placeholder) placeholder.remove();
      const skeleton = target.querySelector('.skeleton-img');
      if(skeleton) skeleton.remove();
    }, {once:true});
    img.src = src;
    target.prepend(img);
  }
  applyInventoryCardImages();
}
function showToast(message){
  const toast = document.getElementById('toast');
  if(!toast) return;
  toast.classList.remove('toast-action');
  toast.innerHTML = `<span>${message}</span>`;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1900);
}
function showActionToast(message, actions=[]){
  const toast = document.getElementById('toast');
  if(!toast) return;
  toast.classList.add('toast-action');
  toast.innerHTML = `<div class="toast-copy">${message}</div><div class="toast-actions">${actions.map((a,idx)=>`<button type="button" class="toast-action-btn ${a.variant || ''}" data-toast-action="${idx}">${a.label}</button>`).join('')}</div>`;
  toast.querySelectorAll('[data-toast-action]').forEach(btn => btn.addEventListener('click', () => {
    const action = actions[Number(btn.dataset.toastAction)];
    toast.classList.remove('show');
    if(action && typeof action.onClick === 'function') action.onClick();
  }));
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 5200);
}
function render(){
  renderCardsAndMeta();
}
// Safe event binding helper
function on(id,evt,fn){const el=document.getElementById(id);if(el)el.addEventListener(evt,fn)}
// v0.143 — search input debounce. Previously every keystroke triggered
// a full innerHTML rewrite of the catalog grid (~200 cards × full template
// + per-card listener attach + image apply). Debouncing to 150ms collapses
// rapid typing into a single render after the user stops.
var searchRenderTimer = null;
on('searchInput','input', e => {
  state.search = e.target.value;
  playTone(1400,0.02,0.02,'sine',0.02);
  if(searchRenderTimer) clearTimeout(searchRenderTimer);
  searchRenderTimer = setTimeout(function(){
    searchRenderTimer = null;
    render();
  }, 150);
});

// v0.143 — same debounce treatment for the inventory search input.
// Wired from the inline oninput in index.html so the inventory grid
// (which can be hundreds of staff cards) doesn't redraw per keystroke.
var inventoryRenderTimer = null;
window.debouncedInventoryRender = function(){
  if(inventoryRenderTimer) clearTimeout(inventoryRenderTimer);
  inventoryRenderTimer = setTimeout(function(){
    inventoryRenderTimer = null;
    if(typeof renderInventoryManager === 'function') renderInventoryManager();
  }, 150);
};

// v0.175 — Inventory search clear button helpers.
// syncInventorySearchState: keeps the .has-value class in sync with
//   whether the input has any text. This belt-and-suspenders backup
//   to the :has(input:not(:placeholder-shown)) CSS for browsers
//   that may not support :has() with placeholder-shown reliably.
// clearInventorySearch: clears the input, fires the input event so
//   downstream listeners know, refocuses the input, and re-renders.
window.syncInventorySearchState = function(){
  var input = document.getElementById('inventorySearch');
  if(!input) return;
  var wrap = input.closest('.inventory-search-wrap');
  if(!wrap) return;
  if(input.value && input.value.length > 0){
    wrap.classList.add('has-value');
  } else {
    wrap.classList.remove('has-value');
  }
};
window.clearInventorySearch = function(){
  var input = document.getElementById('inventorySearch');
  if(!input) return;
  input.value = '';
  syncInventorySearchState();
  if(typeof renderInventoryManager === 'function') renderInventoryManager();
  // Also recompute the breadcrumb title since the search filter is gone
  if(typeof updateInventoryToolbarState === 'function'){
    updateInventoryToolbarState(state.inventoryManagerMode === 'catalog');
  }
  input.focus();
};

// v0.144 — when a customer taps a "did you mean" suggestion pill, swap
// the search input value to the suggested name and re-render. Bypasses
// the search debounce so the swap is instant.
window.applyDidYouMean = function(name){
  if(!name) return;
  state.search = String(name);
  var input = document.getElementById('searchInput');
  if(input) input.value = state.search;
  if(searchRenderTimer){ clearTimeout(searchRenderTimer); searchRenderTimer = null; }
  render();
};
on('reefOnlyBtn','click', (e) => {
  state.reefOnly = !state.reefOnly;
  const btn=e.currentTarget;
  playToggle();
  addRipple(btn,e);
  spawnBubbleBurst(btn,e,{count:5,spread:24});
  btn.classList.add('press-flash');
  btn.addEventListener('animationend',()=>btn.classList.remove('press-flash'),{once:true});
  render();
});
on('easyOnlyBtn','click', (e) => {
  state.easyOnly = !state.easyOnly;
  const btn=e.currentTarget;
  playToggle();
  addRipple(btn,e);
  spawnBubbleBurst(btn,e,{count:5,spread:24});
  btn.classList.add('press-flash');
  btn.addEventListener('animationend',()=>btn.classList.remove('press-flash'),{once:true});
  render();
});
on('clearFiltersBtn','click', (e) => {
  playClick();
  addRipple(e.currentTarget,e);
  spawnBubbleBurst(e.currentTarget,e,{count:5,spread:24});
  e.currentTarget.classList.add('press-flash');
  e.currentTarget.addEventListener('animationend',()=>e.currentTarget.classList.remove('press-flash'),{once:true});
  clearFilters();
});
on('closeFishBtn','click', () => { playClose(); closeFishModal(); });
on('fishOverlay','click', e => {
  if(e.target.id === 'fishOverlay'){ playClose(); closeFishModal(); }
});

// v0.131 — Tank Mover backdrop click. If fish are picked up (unsaved
// in-progress selection), warn before closing. Otherwise close cleanly.
on('tankMoverOverlay','click', e => {
  if(e.target.id !== 'tankMoverOverlay') return;
  const picked = Array.isArray(state.tankMoverSelectedIds) ? state.tankMoverSelectedIds.length : 0;
  if(picked > 0){
    showConfirmModal(
      'Leave Tank Mover?',
      `You still have ${picked} fish picked up that haven't been dropped. Leave anyway?`,
      () => { state.tankMoverSelectedIds = []; closeTankMover(); },
      { confirmText: 'Yes, leave', cancelText: 'Stay' }
    );
  } else {
    closeTankMover();
  }
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
function spawnBubbleBurst(el,e,opts={}){
  if(!el) return;
  const rect=el.getBoundingClientRect();
  const count=opts.count || 4;
  const spread=opts.spread || 18;
  const originX=(typeof e.clientX==='number'?e.clientX:rect.left + rect.width/2)-rect.left;
  const originY=(typeof e.clientY==='number'?e.clientY:rect.top + rect.height/2)-rect.top;
  for(let i=0;i<count;i++){
    const bubble=document.createElement('span');
    bubble.className='bubble';
    const angle=(-95 + (Math.random()*70)) * (Math.PI/180);
    const distance=8 + Math.random()*spread;
    bubble.style.left=originX + 'px';
    bubble.style.top=originY + 'px';
    bubble.style.setProperty('--bubble-x', `${Math.cos(angle)*distance}px`);
    bubble.style.setProperty('--bubble-y', `${Math.sin(angle)*distance - (8 + Math.random()*10)}px`);
    bubble.style.setProperty('--bubble-scale', (0.7 + Math.random()*0.9).toFixed(2));
    bubble.style.animationDelay=`${i*22}ms`;
    el.appendChild(bubble);
    bubble.addEventListener('animationend',()=>bubble.remove(),{once:true});
  }
}
document.addEventListener('click',ensureAudio,{once:true});
document.addEventListener('touchstart',ensureAudio,{once:true});

const MICRO_RIPPLE_SELECTOR = '.cta,.staff-action-btn,.inventory-chip-filter,.modal-close,.input-helper-btn,.inventory-field-card,.inventory-chip,.food-toolbar-btn,.primary-btn,.ghost-btn,.chip,.tab,.mode-btn,.filter-chip,.folder-tab';
document.addEventListener('pointerdown', event => {
  const target = event.target && event.target.closest ? event.target.closest(MICRO_RIPPLE_SELECTOR) : null;
  if(!target || target.disabled) return;
  if(target.classList.contains('sort-choice') || target.classList.contains('filter-chip')) return;
  addRipple(target, event);
  spawnBubbleBurst(target,event,{count:3,spread:16});
}, {passive:true});

// === MODE TOGGLE ===
function syncModeChrome(){
  document.body.classList.toggle('mode-stock', state.mode === 'stock');
  document.body.classList.toggle('mode-ency', state.mode === 'ency');
}
function setMode(mode){
  if(state.mode === mode){
    syncModeChrome();
    document.querySelectorAll('.mode-btn').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
    return;
  }
  state.mode = mode;
  playTab();
  document.querySelectorAll('.mode-btn').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
  syncModeChrome();
  render();
  requestAnimationFrame(()=>{ updateCategoryRailUI(); updateBundleRailUI(); });
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
  if(state.staffMode) return;
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
  if(state.staffMode){ bar.classList.remove('show'); chips.innerHTML=''; return; }
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
  // v0.154 — was 2 minutes which is way too aggressive for retail use.
  // Staff are constantly helping customers and getting interrupted; 2
  // minutes meant the screensaver would fire mid-conversation and exit
  // staff mode. Bumped to 5 minutes which is still snappy but doesn't
  // punish normal sales-floor workflow.
  idleTimeout = setTimeout(goIdle, 300000); // 5 minutes
}
function goIdle(){
  // v0.154 — guard: don't fire the screensaver if any overlay is open.
  // Previously this would fire mid-receive, mid-edit, or mid-fish-modal
  // and exit staff mode entirely. Now we only idle if the kiosk is on
  // its base view with nothing the user might still be reading or working in.
  var anyOverlayOpen =
    document.querySelector('#inventoryOverlay.show') ||
    document.querySelector('#receiveFlowOverlay.show') ||
    document.querySelector('#fishModal.show') ||
    document.querySelector('#inputModalOverlay.show') ||
    document.querySelector('#inventoryHistoryOverlay.show') ||
    document.querySelector('#foodsOverlay.show') ||
    document.querySelector('#tankMoverOverlay.show') ||
    document.querySelector('#staffOverlay.show');
  if(anyOverlayOpen){
    // Reset the timer instead of going idle. The user may be reading
    // a modal even if they haven't tapped recently.
    resetIdleTimer();
    return;
  }
  state.idleActive = true;
  const idle = document.getElementById('idleScreen');
  if(idle) idle.classList.remove('hidden');
  state.search='';state.category='All';state.sort='featured';state.reefOnly=false;state.easyOnly=false;state.tankFilter=0;state.mode='stock';
  const si=document.getElementById('searchInput');if(si)si.value='';
  const ti=document.getElementById('tankInput');if(ti)ti.value='';
  document.querySelectorAll('.mode-btn').forEach(b=>b.classList.toggle('active',b.dataset.mode==='stock'));
  if(state.staffMode){
    exitStaffMode();
  }
  syncModeChrome();
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
const STAFF_PIN = (window.LTC_STAFF_CONFIG && window.LTC_STAFF_CONFIG.defaultPin) || '1234';
let _failedPinAttempts = 0;
let _pinLockUntil = 0;
state.staffMode = false;
if(!state.analytics) state.analytics = {};

function openStaffLogin(){
  const overlay = document.getElementById('staffOverlay');
  const input = document.getElementById('pinInput');
  const err = document.getElementById('pinError');
  if(overlay){
    overlay.classList.add('show');
    if(input) input.value='';
    if(err) err.textContent='';
  }
  const now = Date.now();
  if(err && now < _pinLockUntil){
    const secs = Math.ceil((_pinLockUntil - now) / 1000);
    err.textContent = `Locked. Try again in ${secs}s.`;
  }
  const pi = document.getElementById('pinInput');
  if(pi) setTimeout(()=>pi.focus(),100);
}
function closeStaffLogin(){
  const overlay = document.getElementById('staffOverlay');
  if(overlay) overlay.classList.remove('show');
}
function checkPin(){
  const input = document.getElementById('pinInput');
  const err = document.getElementById('pinError');
  if(!input) return;
  const now = Date.now();
  if(now < _pinLockUntil){
    const secs = Math.ceil((_pinLockUntil - now) / 1000);
    if(err) err.textContent = `Locked. Try again in ${secs}s.`;
    return;
  }
  if(input.value === STAFF_PIN){
    _failedPinAttempts = 0;
    _pinLockUntil = 0;
    state.staffMode = true;
    state.compareList = [];
    updateCompareBar();
    closeStaffLogin();
    const ab=document.getElementById('analyticsBtn');if(ab)ab.style.display='inline-flex';
    const eb=document.getElementById('exitStaffBtn');if(eb)eb.style.display='inline-flex';
    const ib=document.getElementById('inventoryBtn');if(ib)ib.style.display='inline-flex';
    const rb=document.getElementById('recentChangesBtn');if(rb)rb.style.display='inline-flex';
    const sb=document.getElementById('staffBadge');if(sb)sb.style.display='none';
    showToast(T('staffActivated'));
    playOpen();
    render();
  } else {
    _failedPinAttempts++;
    const maxAttempts = (window.LTC_STAFF_CONFIG && window.LTC_STAFF_CONFIG.maxFailedAttempts) || 5;
    const lockoutSeconds = (window.LTC_STAFF_CONFIG && window.LTC_STAFF_CONFIG.lockoutSeconds) || 60;
    if(_failedPinAttempts >= maxAttempts){
      _pinLockUntil = Date.now() + (lockoutSeconds * 1000);
      _failedPinAttempts = 0;
      if(err) err.textContent = `Locked. Try again in ${lockoutSeconds}s.`;
    } else if(err) {
      err.textContent = T('incorrectPin');
    }
    input.value = '';
    playClose();
  }
}
function exitStaffMode(){
  state.staffMode = false;
  updateCompareBar();
  const ab=document.getElementById('analyticsBtn');if(ab)ab.style.display='none';
  const eb=document.getElementById('exitStaffBtn');if(eb)eb.style.display='none';
  const ib=document.getElementById('inventoryBtn');if(ib)ib.style.display='none';
  const rb=document.getElementById('recentChangesBtn');if(rb)rb.style.display='none';
  const sb=document.getElementById('staffBadge');if(sb)sb.style.display='inline-flex';
  showToast(T('staffDeactivated'));
  playClose();
  render();
}

// Staff actions on fish
function refreshStaffEditorInModal(fishId){
  // V0.127 — after a staff action (sold, loss, quarantine, hold), the staff
  // editor inside the open fish modal needs to re-render so the rollback bar
  // appears and the primary tiles update. Find the existing .staff-editor-v123
  // node and replace it with a fresh render. Silently no-ops if no modal open.
  const existing = document.querySelector('#fishModalBody .staff-editor-v123');
  if(!existing) return;
  const fish = FISH.find(f => f.id === fishId);
  if(!fish) return;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = renderStaffEditor(fish);
  const fresh = wrapper.firstElementChild;
  if(fresh) existing.replaceWith(fresh);
}
function staffMarkSold(id){
  const fish = FISH.find(f=>f.id===id);
  if(!fish) return;
  const qty = availableQuantity(fish);
  pushStaffHistory(fish, 'sold');
  setUndoSnapshot(fish, STAFF_UNDO_SOLD_FIELD, 'sold');
  if(qty > 1){
    recordSaleHistory(fish, 1);
    fish.quantity = qty - 1;
    fish.inStock = true;
    delete fish.soldAt;
    touchStaffRecord(fish, 'sold-one');
    showActionToast(`${L(fish,'name')} sold — ${fish.quantity} left`, [
      {label:'Undo', variant:'ok', onClick:() => staffUndoSold(fish.id)}
    ]);
  }else{
    recordSaleHistory(fish, 1);
    fish.quantity = 0;
    fish.inStock = false;
    fish.soldAt = Date.now();
    delete fish.reserved;
    delete fish.reservedFor;
    touchStaffRecord(fish, 'sold-out');
    showActionToast(`${L(fish,'name')} marked as sold`, [
      {label:'Undo Sold', variant:'ok', onClick:() => staffUndoSold(fish.id)},
      {label:'Recent Changes', variant:'ghost', onClick:() => openInventoryHistoryOverlay()}
    ]);
  }
  playClick();
  persistStaffEdits();
  renderInventoryManager();
  renderInventoryHistoryOverlay();
  refreshStaffEditorInModal(fish.id);
  render();
}
function staffMarkDead(id){
  const fish = FISH.find(f=>f.id===id);
  if(!fish) return;
  const qty = availableQuantity(fish);
  pushStaffHistory(fish, 'loss');
  setUndoSnapshot(fish, STAFF_UNDO_LOSS_FIELD, 'loss');
  if(qty > 1){
    fish.quantity = qty - 1;
    fish.inStock = true;
    delete fish.lossAt;
    touchStaffRecord(fish, 'loss-one');
    showActionToast(`${L(fish,'name')} loss recorded — ${fish.quantity} left`, [
      {label:'Undo', variant:'ok', onClick:() => staffUndoLoss(fish.id)}
    ]);
  }else{
    fish.quantity = 0;
    fish.inStock = false;
    fish.lossAt = Date.now();
    delete fish.reserved;
    delete fish.reservedFor;
    touchStaffRecord(fish, 'loss-out');
    showActionToast(`${L(fish,'name')} removed from live inventory`, [
      {label:'Undo Loss', variant:'ok', onClick:() => staffUndoLoss(fish.id)},
      {label:'Recent Changes', variant:'ghost', onClick:() => openInventoryHistoryOverlay()}
    ]);
  }
  playClick();
  persistStaffEdits();
  renderInventoryManager();
  renderInventoryHistoryOverlay();
  refreshStaffEditorInModal(fish.id);
  render();
  if(qty <= 1) showRestoreGuidanceModal(fish, 'loss');
}
function staffRestoreAvailability(id){
  const fish = FISH.find(f=>f.id===id);
  if(!fish) return;
  pushStaffHistory(fish, 'restore-stock');
  const qty = availableQuantity(fish);
  fish.quantity = qty > 0 ? qty : 1;
  fish.inStock = true;
  delete fish.soldAt;
  delete fish.lossAt;
  touchStaffRecord(fish, 'restore-stock');
  showToast(`${L(fish,'name')} restored to available`);
  playOpen();
  persistStaffEdits();
  renderInventoryManager();
  renderInventoryHistoryOverlay();
  render();
}
function staffQuarantine(id){
  const fish = FISH.find(f=>f.id===id);
  if(!fish) return;
  showInputModal(T('quarantine'), fish.name, [
    {label: 'Days', type:'number', value:'7', placeholder:'7'}
  ], ([days]) => {
    pushStaffHistory(fish, 'quarantine');
    setUndoSnapshot(fish, STAFF_UNDO_QUARANTINE_FIELD, 'quarantine');
    fish.quarantine = true;
    fish.quarantineUntil = Date.now() + (parseInt(days)||7) * 86400000;
    touchStaffRecord(fish, 'quarantine');
    showToast(`${L(fish,'name')} — ${T('quarantine')} ${days}d`);
    playClick();
    persistStaffEdits();
    renderInventoryManager();
    render();
  }, {
    theme: 'amber',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    confirmText: 'Start quarantine'
  });
}
function staffEndQuarantine(id){
  const fish = FISH.find(f=>f.id===id);
  if(!fish) return;
  pushStaffHistory(fish, 'clear-quarantine');
  setUndoSnapshot(fish, STAFF_UNDO_QUARANTINE_FIELD, 'clear-quarantine');
  fish.quarantine = false;
  delete fish.quarantineUntil;
  touchStaffRecord(fish, 'clear-quarantine');
  showToast(`${L(fish,'name')} cleared from quarantine`);
  playOpen();
  persistStaffEdits();
  renderInventoryManager();
  renderInventoryHistoryOverlay();
  render();
}
function staffEditPrice(id){
  const fish = FISH.find(f=>f.id===id);
  if(!fish) return;
  showInputModal(T('editPrice'), fish.name, [
    {label: T('price'), type:'number', value: fish.price, placeholder:'0.00'}
  ], ([val]) => {
    if(val && !isNaN(parseFloat(val))){
      pushStaffHistory(fish, 'price');
      fish.price = parseFloat(val);
      touchStaffRecord(fish, 'price');
      showToast(`${L(fish,'name')} → ${formatMoney(fish.price)}`);
      persistStaffEdits();
      renderInventoryManager();
      renderInventoryHistoryOverlay();
      render();
    }
  }, {
    theme: 'purple',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    confirmText: 'Save price'
  });
  mountModalFishHelper(fish, {fieldIds:{price:'inputField0'}, limit:6});
}
function staffEditTank(id){
  const fish = FISH.find(f=>f.id===id);
  if(!fish) return;
  showInputModal(T('editTank'), fish.name, [
    {label: T('tankLabel'), type:'select', value: fish.tankCode || '', options:['','A','B','C','D','E','F']}
  ], ([val]) => {
    pushStaffHistory(fish, 'tank');
    const tankVal = String(val || '').trim().toUpperCase();
    if(tankVal){
      fish.tankCode = tankVal;
    } else {
      delete fish.tankCode;
    }
    touchStaffRecord(fish, 'tank');
    showToast(fish.tankCode ? `${L(fish,'name')} → ${T('tankLabel')} ${fish.tankCode}` : `${L(fish,'name')} → ${T('tankLabel')} —`);
    persistStaffEdits();
    renderInventoryManager();
    render();
  }, {
    theme: 'blue',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 11h18"/><line x1="9" y1="17" x2="15" y2="17"/></svg>',
    confirmText: 'Move tank'
  });
}
function staffEditStockSize(id){
  const fish = FISH.find(f=>f.id===id);
  if(!fish) return;
  showInputModal(T('editStockSize') || 'Edit Size', fish.name, [
    {label: T('stockSize'), type:'select', value: displayStockSize(fish.stockSize), options:STOCK_SIZE_OPTIONS}
  ], ([val]) => {
    pushStaffHistory(fish, 'size');
    fish.stockSize = normalizeStockSizeValue(val);
    touchStaffRecord(fish, 'size');
    showToast(`${L(fish,'name')} → ${displayStockSize(fish.stockSize)}`);
    persistStaffEdits();
    renderInventoryManager();
    render();
  }, {
    theme: 'cyan',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    confirmText: 'Save size'
  });
}
function staffEditStaffNote(id){
  const fish = FISH.find(f=>f.id===id);
  if(!fish) return;
  showInputModal(T('editStaffNote') || 'Edit Staff Note', fish.name, [
    {label: T('staffNote') || 'Staff note', type:'textarea', value: fish.staffNote || '', placeholder:'Optional note for staff only', rows:5}
  ], ([val]) => {
    pushStaffHistory(fish, 'staff-note');
    fish.staffNote = String(val || '').trim();
    touchStaffRecord(fish, 'staff-note');
    showToast(`${L(fish,'name')} note updated`);
    persistStaffEdits();
    renderInventoryManager();
    render();
  }, {
    theme: 'cyan',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>',
    confirmText: 'Save note'
  });
}

function staffEditQuantity(id){
  const fish = FISH.find(f=>f.id===id);
  if(!fish) return;
  showInputModal('Edit Quantity', fish.name, [
    {label:'Quantity on hand', type:'number', value: availableQuantity(fish), placeholder:'0'}
  ], ([val]) => {
    pushStaffHistory(fish, 'quantity');
    const qty = Math.max(0, parseInt(val, 10) || 0);
    fish.quantity = qty;
    fish.inStock = qty > 0;
    if(qty > 0){
      delete fish.soldAt;
      delete fish.lossAt;
    }else{
      delete fish.reserved;
      delete fish.reservedFor;
    }
    touchStaffRecord(fish, 'quantity');
    showToast(`${L(fish,'name')} quantity → ${qty}`);
    persistStaffEdits();
    renderInventoryManager();
    render();
  }, {
    theme: 'amber',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>',
    confirmText: 'Save quantity'
  });
}
function staffEditHold(id){
  const fish = FISH.find(f=>f.id===id);
  if(!fish) return;
  showInputModal('Hold / Reservation', fish.name, [
    {label:'Status', type:'select', value: fish.reserved ? 'Held' : 'Open', options:['Open','Held']},
    {label:'Reserved for', type:'text', value: fish.reservedFor || '', placeholder:'Customer name or note'}
  ], ([status, name]) => {
    pushStaffHistory(fish, 'hold');
    setUndoSnapshot(fish, STAFF_UNDO_HOLD_FIELD, 'hold');
    fish.reserved = status === 'Held';
    fish.reservedFor = String(name || '').trim();
    if(!fish.reserved){
      delete fish.reserved;
      delete fish.reservedFor;
    }
    touchStaffRecord(fish, 'hold');
    showToast(`${L(fish,'name')} → ${reservedLabel(fish)}`);
    persistStaffEdits();
    renderInventoryManager();
    render();
  }, {
    theme: 'rose',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    confirmText: 'Save hold'
  });
}
function staffEditStockNumber(id){
  const fish = FISH.find(f=>f.id===id);
  if(!fish) return;
  showInputModal('Edit Stock #', fish.name, [
    {label:'Stock #', type:'text', value: fish.stockNumber || '', placeholder:'32'}
  ], ([stockNumber]) => {
    pushStaffHistory(fish, 'stock-number');
    fish.stockNumber = String(stockNumber || '').trim();
    if(!fish.stockNumber) delete fish.stockNumber;
    touchStaffRecord(fish, 'stock-number');
    showToast(`${L(fish,'name')} stock # updated`);
    persistStaffEdits();
    renderInventoryManager();
    render();
  }, {
    theme: 'cyan',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>',
    confirmText: 'Save stock #'
  });
}
function staffEditStockInfo(id){
  const fish = FISH.find(f=>f.id===id);
  if(!fish) return;
  showInputModal('Stock Details', fish.name, [
    {label:'Stock #', type:'text', value: fish.stockNumber || '', placeholder:'32'},
    {label:'Arrival date', type:'date', value: fish.arrivalDate || ''},
    {label:'Vendor / source', type:'text', value: fish.vendor || '', placeholder:'Biota, ORA, local breeder, wholesaler...'}
  ], ([stockNumber, arrivalDate, vendor]) => {
    pushStaffHistory(fish, 'stock-details');
    fish.stockNumber = String(stockNumber || '').trim();
    fish.arrivalDate = String(arrivalDate || '').trim();
    fish.vendor = String(vendor || '').trim();
    if(!fish.stockNumber) delete fish.stockNumber;
    if(!fish.arrivalDate) delete fish.arrivalDate;
    if(!fish.vendor) delete fish.vendor;
    touchStaffRecord(fish, 'stock-details');
    showToast(`${L(fish,'name')} stock details updated`);
    persistStaffEdits();
    renderInventoryManager();
    render();
  }, {
    theme: 'cyan',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    confirmText: 'Save details'
  });
}

function staffRestockFish(id){
  const fish = FISH.find(f=>f.id===id);
  if(!fish) return;
  showInputModal(T('addToStock'), fish.name, [
    {label: T('price'), type:'number', value: fish.price||'29.99', placeholder:'29.99'},
    {label: T('tankLabel'), type:'select', value: fish.tankCode||'A', options:['A','B','C','D','E','F']},
    {label: 'Stock #', type:'text', value: fish.stockNumber || '', placeholder:'32'},
    {label: T('stockSize'), type:'select', value: displayStockSize(fish.stockSize), options:STOCK_SIZE_OPTIONS},
    {label: 'Quantity on hand', type:'number', value: availableQuantity(fish) || 1, placeholder:'1'},
    {label: 'Arrival date', type:'date', value: fish.arrivalDate || ''},
    {label: 'Vendor / source', type:'text', value: fish.vendor || '', placeholder:'Optional'}
  ], ([price, tank, stockNumber, size, quantity, arrivalDate, vendor]) => {
    pushStaffHistory(fish, 'restock');
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    fish.inStock = true;
    delete fish.soldAt;
    delete fish.lossAt;
    fish.price = parseFloat(price)||29.99;
    fish.tankCode = (tank||'A').toUpperCase();
    fish.stockNumber = String(stockNumber || '').trim();
    fish.stockSize = normalizeStockSizeValue(size);
    fish.quantity = qty;
    fish.arrivalDate = String(arrivalDate || '').trim();
    fish.vendor = String(vendor || '').trim();
    if(!fish.arrivalDate) delete fish.arrivalDate;
    if(!fish.vendor) delete fish.vendor;
    touchStaffRecord(fish, 'restock');
    showToast(`${L(fish,'name')} ${T('addToStock')} (${qty})`);
    playOpen();
    persistStaffEdits();
    renderInventoryManager();
    renderInventoryHistoryOverlay();
    render();
  }, {
    theme: 'green',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1"/><polyline points="21 12 16 12 16 8"/><line x1="16" y1="12" x2="22" y2="12"/></svg>',
    confirmText: 'Add to stock'
  });
  mountModalFishHelper(fish, {fieldIds:{price:'inputField0', tank:'inputField1', stockNumber:'inputField2', stockSize:'inputField3', quantity:'inputField4', arrivalDate:'inputField5', vendor:'inputField6'}, includeAllButton:true, limit:10});
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
      pushStaffHistory(fish, 'photo');
      if(!fish.staffPhotos) fish.staffPhotos = [];
      fish.staffPhotos.push(ev.target.result);
      touchStaffRecord(fish, 'photo');
      // Also set as primary image immediately
      wikiImages.set(fish.photoTitle, ev.target.result);
      showToast(`Photo uploaded for ${L(fish,'name')}`);
      playToggle();
      persistStaffEdits();
      renderInventoryManager();
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
function openFoodSettings(){
  const overlay = document.getElementById('foodsOverlay');
  if(!overlay) return;
  renderFoodSettings();
  overlay.classList.add('show');
}
function closeFoodSettings(){
  const overlay = document.getElementById('foodsOverlay');
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
// v0.132 — food visual identity. Each brand gets a hex color + monogram
// badge so groups read instantly. Each food TYPE gets an inline SVG icon
// so cards have a visual at-a-glance instead of a wall of text.
const FOOD_BRAND_HEX = {
  'Hikari':'#e63946',
  'LRS':'#1e88e5',
  'San Francisco Bay Brand':'#2eb39c',
  'Ocean Nutrition':'#1565c0',
  'New Life Spectrum':'#2e8b57',
  'Reef Nutrition':'#8a48d6',
  'Piscine Energetics':'#ff7043',
  'General':'#9eb4c8'
};
const FOOD_BRAND_MONOGRAM = {
  'Hikari':'H',
  'LRS':'LRS',
  'San Francisco Bay Brand':'SFB',
  'Ocean Nutrition':'ON',
  'New Life Spectrum':'NLS',
  'Reef Nutrition':'RN',
  'Piscine Energetics':'PE',
  'General':'GEN'
};
function foodBrandHex(brand){ return FOOD_BRAND_HEX[brand] || '#7bcfff'; }
function foodBrandMonogram(brand){ return FOOD_BRAND_MONOGRAM[brand] || (brand || '?').slice(0,2).toUpperCase(); }

// Inline SVGs scoped under .food-type-svg. Use currentColor so they
// inherit the brand color from CSS context.
const FOOD_TYPE_SVG = {
  frozen: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M24 5v38M5 14l38 20M5 34l38-20"/><circle cx="24" cy="24" r="3" fill="currentColor" stroke="none"/><path d="M24 5l-4 4M24 5l4 4M24 43l-4-4M24 43l4-4M5 14l5 1M5 14l1 5M43 14l-5 1M43 14l-1 5M5 34l5-1M5 34l1-5M43 34l-5-1M43 34l-1-5"/></svg>',
  pellet: '<svg viewBox="0 0 48 48" fill="currentColor" stroke="currentColor" stroke-width="1.4"><circle cx="14" cy="14" r="5"/><circle cx="30" cy="12" r="4"/><circle cx="22" cy="24" r="6"/><circle cx="36" cy="28" r="4.5"/><circle cx="12" cy="32" r="4"/><circle cx="28" cy="38" r="3.5"/></svg>',
  flake: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><polygon points="14,8 22,4 28,8 28,16 22,20 14,16" fill="currentColor" fill-opacity=".22"/><polygon points="30,18 38,14 44,18 44,26 38,30 30,26" fill="currentColor" fill-opacity=".18"/><polygon points="6,24 14,20 20,24 20,32 14,36 6,32" fill="currentColor" fill-opacity=".24"/><polygon points="22,30 30,26 36,30 36,38 30,42 22,38" fill="currentColor" fill-opacity=".2"/></svg>',
  sheet: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12c4-4 10-4 14 0s10 4 14 0 6-2 8 0v24c-2-2-4-2-8 0s-10 4-14 0-10-4-14 0z" fill="currentColor" fill-opacity=".22"/><path d="M10 22c3-2 6-2 9 0s6 2 9 0 5-1 6 0M10 30c3-2 6-2 9 0s6 2 9 0 5-1 6 0"/></svg>',
  liquid: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M24 6c-2 6-12 14-12 22a12 12 0 0 0 24 0c0-8-10-16-12-22z" fill="currentColor" fill-opacity=".22"/><path d="M18 30a6 6 0 0 0 4 5"/></svg>',
  live: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 24c4-6 8-6 12 0s8 6 12 0 8-6 12 0"/><path d="M6 32c4-6 8-6 12 0s8 6 12 0 8-6 12 0"/><circle cx="40" cy="18" r="2" fill="currentColor"/><circle cx="40" cy="26" r="2" fill="currentColor"/></svg>'
};
function foodTypeSvg(type){ return FOOD_TYPE_SVG[type] || FOOD_TYPE_SVG.pellet; }

// v0.133 — image resolution. Tries thumbs/foods/<id>.jpg first, then
// the FOOD_IMAGE_OVERRIDES URL map, then falls back to the SVG icon.
// The img element has an onerror chain that walks the fallback ladder.
function foodImageSource(food){
  if(!food || !food.id) return '';
  // Tier 2: explicit URL override map (Tier 1 is the local file path
  // we always try first, attempted by the img src directly).
  const overrides = window.FOOD_IMAGE_OVERRIDES || {};
  return overrides[food.id] || '';
}
function foodImageHtml(food, brandHex){
  const localPath = `thumbs/foods/${food.id}.jpg`;
  const fallbackUrl = foodImageSource(food);
  const svgIcon = foodTypeSvg(food.type);
  // The img tries the local file. If 404 it tries the URL map. If that
  // 404s too the parent .food-image-frame gets .no-photo applied which
  // CSS uses to reveal the SVG icon underneath.
  const onErr = fallbackUrl
    ? `this.onerror=function(){this.style.display='none';this.parentElement.classList.add('no-photo')};this.src='${fallbackUrl}'`
    : `this.style.display='none';this.parentElement.classList.add('no-photo')`;
  return `<div class="food-image-frame" style="--brand-c:${brandHex};color:${brandHex}">
    <img class="food-photo" loading="lazy" alt="" src="${localPath}" onerror="${onErr}">
    <div class="food-svg-fallback">${svgIcon}</div>
  </div>`;
}

const FOOD_SETTINGS_UI = {search:'', scope:'all', collapsed:{}};
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
  const search = String(FOOD_SETTINGS_UI.search || '').trim().toLowerCase();
  const scopes = [
    ['all','All foods'],
    ['staple','Staples'],
    ['frozen','Frozen'],
    ['dry','Dry'],
    ['specialty','Specialty'],
    ['invert','Invert support']
  ];
  const metrics = {
    total: catalog.length,
    carried: catalog.filter(food => !settings.disabledProducts[food.id]).length,
    featured: catalog.filter(food => !!settings.featuredProducts[food.id]).length,
    brands: new Set(catalog.map(food => food.brand)).size
  };
  const matchesScope = food => {
    const scope = FOOD_SETTINGS_UI.scope || 'all';
    if(scope === 'all') return true;
    if(scope === 'staple') return food.stage === 'staple';
    if(scope === 'frozen') return food.type === 'frozen' || food.type === 'live';
    if(scope === 'dry') return ['pellet','flake','sheet'].includes(food.type);
    if(scope === 'specialty') return ['specialty','support'].includes(food.stage) || ['liquid','live'].includes(food.type);
    if(scope === 'invert') return (food.audience || []).includes('invert') || (food.families || []).includes('filter-feeder');
    return true;
  };
  const matchesSearch = food => {
    if(!search) return true;
    return [food.brand, food.name, food.type, food.stage, food.notes, food.feedHint].join(' ').toLowerCase().includes(search);
  };
  const visible = catalog.filter(food => matchesScope(food) && matchesSearch(food));
  const brands = [...new Set(catalog.map(f => f.brand))];
  const grouped = brands.map(brand => ({
    brand,
    items: visible.filter(food => food.brand === brand)
  })).filter(group => group.items.length);
  root.innerHTML = `
    <div class="food-settings-copy">Keep the food catalog broad enough for staff to work quickly, but simple enough that they can find staples, frozen foods, and specialty feeds without digging through a wall of cards.</div>
    <div class="food-settings-hero">
      <div class="food-settings-metrics">
        <div class="food-settings-metric"><span>Total foods</span><strong>${metrics.total}</strong><small>base catalog entries</small></div>
        <div class="food-settings-metric"><span>Carried</span><strong>${metrics.carried}</strong><small>currently enabled for the store</small></div>
        <div class="food-settings-metric"><span>Featured</span><strong>${metrics.featured}</strong><small>highlighted for staff and matching fish</small></div>
        <div class="food-settings-metric"><span>Brands</span><strong>${metrics.brands}</strong><small>main food lines loaded</small></div>
      </div>
      <div class="food-settings-controls">
        <label class="food-search"><span>Search foods</span><input id="foodSettingsSearch" type="search" value="${FOOD_SETTINGS_UI.search || ''}" placeholder="Search brand, food, type, or note…"></label>
        <div class="food-scope-chips">${scopes.map(([value,label]) => `<button type="button" class="food-scope-chip ${FOOD_SETTINGS_UI.scope===value ? 'is-active' : ''}" data-food-scope="${value}">${label}</button>`).join('')}</div>
      </div>
    </div>
    <div class="food-settings-brands food-brand-toggle-row">${brands.map(brand => `<label class="food-toggle"><input type="checkbox" data-food-brand="${brand}" ${settings.enabledBrands[brand] !== false ? 'checked' : ''}> <span>${brand}</span></label>`).join('')}</div>
    <div class="food-settings-brands food-type-row">${['pellet','flake','frozen','sheet','liquid','live'].map(type => `<label class="food-toggle"><input type="checkbox" data-food-type="${type}" ${settings.hiddenTypes[type] ? '' : 'checked'}> <span>${type}</span></label>`).join('')}</div>
    <div class="food-brand-groups">${grouped.length ? grouped.map(group => {
      const brandHex = foodBrandHex(group.brand);
      const brandMono = foodBrandMonogram(group.brand);
      const isCollapsed = !!FOOD_SETTINGS_UI.collapsed[group.brand];
      return `
      <section class="food-brand-group ${isCollapsed ? 'is-collapsed' : ''}" style="--brand-c:${brandHex}">
        <button type="button" class="food-brand-group-head" data-food-collapse="${group.brand}">
          <span class="food-brand-badge" style="background:${brandHex};box-shadow:0 4px 14px ${brandHex}66, 0 0 0 2px rgba(255,255,255,0.12) inset">${brandMono}</span>
          <span class="food-brand-group-title">
            <strong>${group.brand}</strong>
            <em>${group.items.length} item${group.items.length===1?'':'s'}</em>
          </span>
          <span class="food-brand-chev" aria-hidden="true">▾</span>
        </button>
        <div class="food-settings-grid">${group.items.map(food => {
          const carried = !settings.disabledProducts[food.id];
          const featured = !!settings.featuredProducts[food.id];
          const dim = settings.enabledBrands[food.brand] === false || !carried;
          return `<div class="food-card-toggle ${dim ? 'is-dim' : ''} ${featured ? 'is-featured' : ''}">
            <div class="food-card-actions">
              <label class="food-toggle compact"><input type="checkbox" data-food-product="${food.id}" ${carried ? 'checked' : ''}> <span>Carry</span></label>
              <button class="feature-star ${featured ? 'active' : ''}" type="button" data-food-feature="${food.id}" aria-label="Feature ${food.name}">★</button>
            </div>
            <div class="food-card-body">
              ${foodImageHtml(food, brandHex)}
              <div class="food-card-text">
                <div class="food-name">${food.name}</div>
                <div class="food-card-meta">
                  <span class="food-badge food-badge-type" data-food-type-pill="${food.type}">${food.type}</span>
                  <span class="food-badge food-badge-stage" data-food-stage="${food.stage}">${food.stage}</span>
                </div>
                <div class="food-notes">${food.notes}</div>
              </div>
            </div>
          </div>`;
        }).join('')}</div>
      </section>`}).join('') : '<div class="food-empty-note">No foods match this filter yet. Try clearing the search or switching the food scope.</div>'}</div>
  `;
  const searchEl = document.getElementById('foodSettingsSearch');
  if(searchEl && !searchEl.dataset.boundFoodSearch){
    searchEl.addEventListener('input', () => { FOOD_SETTINGS_UI.search = searchEl.value; renderFoodSettings(); });
    searchEl.dataset.boundFoodSearch = '1';
  }
  // v0.132 — collapse toggle delegated to brand head
  root.querySelectorAll('[data-food-collapse]').forEach(btn => btn.addEventListener('click', (e) => {
    if(e.target.closest && e.target.closest('input,button.feature-star,label.food-toggle')) return;
    const brand = btn.dataset.foodCollapse;
    FOOD_SETTINGS_UI.collapsed[brand] = !FOOD_SETTINGS_UI.collapsed[brand];
    renderFoodSettings();
  }));
  root.querySelectorAll('[data-food-scope]').forEach(btn => btn.addEventListener('click', () => { FOOD_SETTINGS_UI.scope = btn.dataset.foodScope; renderFoodSettings(); }));
  root.querySelectorAll('[data-food-brand]').forEach(el => el.addEventListener('change', () => {
    settings.enabledBrands[el.dataset.foodBrand] = el.checked;
    saveStoreFoodSettings();
    renderFoodSettings();
    render();
  }));
  root.querySelectorAll('[data-food-type]').forEach(el => el.addEventListener('change', () => {
    settings.hiddenTypes[el.dataset.foodType] = !el.checked;
    saveStoreFoodSettings();
    renderFoodSettings();
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
function inventoryCategoryLabel(category){
  if(typeof CARD_LABELS !== 'undefined' && CARD_LABELS[category]) return CARD_LABELS[category];
  return TC(category);
}
function hasMissingSpeciesCoreData(item){
  if(!item) return true;
  if(item.catalogPending) return true;
  const required = ['scientific','overview','minTank','maxSize','diet'];
  if(required.some(key => !cleanInfoText(item[key]))) return true;
  const gauges = ['aggression','coralRisk','careDifficulty','invertRisk'];
  return gauges.some(key => !Number.isFinite(Number(item[key])));
}
function hasMissingStoreData(item){
  if(!item) return true;
  const qtyReady = Number.isFinite(Number(item.quantity)) && Number(item.quantity) >= 0;
  const hasPhoto = !!getPrimaryImageSource(item);
  return !Number.isFinite(Number(item.price)) || !item.tankCode || !item.stockSize || !item.stockNumber || !qtyReady || !hasPhoto;
}
function inventoryStatusLabel(item){
  if(item?.quarantine) return 'QUARANTINE';
  if(item?.reserved) return item.reservedFor ? `HELD · ${item.reservedFor}` : 'HELD';
  if(item?.inStock) return 'IN STOCK';
  if(item?.soldAt) return 'SOLD';
  if(item?.lossAt) return 'REMOVED';
  return 'OUT OF STOCK';
}
function inventoryStatusClass(item){
  if(item?.quarantine) return 'is-quarantine';
  if(item?.reserved) return 'is-held';
  if(item?.inStock) return 'is-instock';
  if(item?.soldAt) return 'is-sold';
  if(item?.lossAt) return 'is-loss';
  return 'is-out';
}
function inventorySummary(items=[]){
  return {
    entries: items.length,
    liveCount: items.reduce((sum, item) => sum + (Number.isFinite(Number(item.quantity)) && item.inStock ? Number(item.quantity) : (item.inStock ? 1 : 0)), 0),
    reserved: items.filter(item => item?.reserved).length,
    missingSpeciesCore: items.filter(hasMissingSpeciesCoreData).length,
    missingStoreSetup: items.filter(hasMissingStoreData).length
  };
}
function populateInventoryCategoryFilter(){
  const filter = document.getElementById('inventoryCategoryFilter');
  if(!filter) return;
  const current = filter.value || 'all';
  const categories = [...new Set(FISH.map(item => item.category).filter(Boolean))]
    .sort((a,b) => inventoryCategoryLabel(a).localeCompare(inventoryCategoryLabel(b)));
  filter.innerHTML = `<option value="all">All categories</option>${categories.map(category => `<option value="${category}">${inventoryCategoryLabel(category)}</option>`).join('')}`;
  filter.value = categories.includes(current) ? current : 'all';
}
function renderInventoryQuickFilters(items=[]){
  const root = document.getElementById('inventoryQuickFilters');
  const statusEl = document.getElementById('inventoryStatusFilter');
  if(!root || !statusEl) return;
  const current = statusEl.value || 'all';
  const rows = Array.isArray(items) ? items : [];
  const countFor = value => {
    if(value === 'all') return rows.length;
    if(value === 'instock') return rows.filter(item => item.inStock).length;
    if(value === 'out') return rows.filter(item => !item.inStock).length;
    if(value === 'quarantine') return rows.filter(item => item.quarantine).length;
    if(value === 'reserved') return rows.filter(item => item.reserved).length;
    if(value === 'notank') return rows.filter(item => hasNoAssignedTank(item)).length;
    if(value === 'missingspecies') return rows.filter(hasMissingSpeciesCoreData).length;
    if(value === 'missingstore') return rows.filter(hasMissingStoreData).length;
    if(value === 'recent') return rows.filter(item => Array.isArray(item[STAFF_HISTORY_FIELD]) && item[STAFF_HISTORY_FIELD].length).length;
    return 0;
  };
  // v0.165 — clearer labels: "Species Review" → "Missing Species Data",
  // "Store Setup" → "Missing Store Data". data-filter attribute lets
  // CSS apply per-filter semantic colors instead of one generic teal.
  const chips = [
    ['all','All'],
    ['instock','In Stock'],
    ['out','Out'],
    ['quarantine','Quarantine'],
    ['reserved','Held'],
    ['recent','Recent'],
    ['missingspecies','Missing Species Data'],
    ['missingstore','Missing Store Data']
  ];
  root.innerHTML = chips.map(([value, label]) => `<button class="inventory-chip-filter ${current === value ? 'is-active' : ''}" type="button" data-filter="${value}" onclick="const el=document.getElementById('inventoryStatusFilter'); if(el){ el.value='${value}'; renderInventoryManager(); }">${label}<span>${countFor(value)}</span></button>`).join('');
}
function inventorySearchText(item){
  const categoryAliases = CATEGORY_SEARCH_ALIASES[item.category] || [];
  return [
    item.name,
    item.category,
    inventoryCategoryLabel(item.category),
    item.tankCode || '',
    item.scientific || '',
    item.vendor || '',
    item.reservedFor || '',
    item.stockNumber || '',
    ...(item.aliases || []),
    ...categoryAliases
  ].join(' ').toLowerCase();
}
function inventoryFieldCard(item, label, value, buttonLabel, action, tone='default'){
  return `<div class="inventory-field-card tone-${tone}" role="button" tabindex="0" onclick="${action}" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();${action}}"><span>${label}</span><strong>${value}</strong><button type="button" class="inventory-field-btn" onclick="event.stopPropagation();${action}">${buttonLabel}</button></div>`;
}
function inventoryStatusActions(item){
  const rollback = majorRollbackButtons(item);
  if(item.inStock){
    return `<button class="staff-action-btn sold" onclick="staffMarkSold('${item.id}')">${typeof T==='function'?T('markSold'):'Mark Sold'}</button><button class="staff-action-btn dead" onclick="staffMarkDead('${item.id}')">${typeof T==='function'?T('removeLoss'):'Remove (Loss)'}</button><button class="staff-action-btn edit" onclick="staffQuarantine('${item.id}')" style="background:rgba(220,180,50,.15);border-color:rgba(220,180,50,.3);color:#ddbb44">${typeof T==='function'?T('quarantine'):'Quarantine'}</button>${rollback}`;
  }
  return `<button class="staff-action-btn edit" onclick="staffRestockFish('${item.id}')" style="background:rgba(90,220,200,.15);border-color:rgba(90,220,200,.3);color:#5eebc8">${typeof T==='function'?T('addToStock'):'+ Add to Stock'}</button>${rollback || ''}`;
}
function inventoryCardTemplate(item){
  // V0.125 — even slimmer row. Dropped the meta line (category + scientific)
  // since group headers handle category context, and staff can tap the row
  // to see scientific name in the modal. Now ~10 nodes per row, two visual
  // lines: name+status, then chips.
  const qty = Number.isFinite(item.quantity) ? item.quantity : null;
  const photoSrc = getPrimaryImageSource(item);
  const tone = item.quarantine ? 'amber' : (item.reserved ? 'purple' : (item.inStock ? 'green' : (item.lossAt ? 'red' : 'gray')));
  const status = inventoryStatusLabel(item);
  const priceDisplay = item.price ? formatMoney(item.onSale && item.salePrice ? item.salePrice : item.price) : '';
  const tankDisplay = item.tankCode || '';
  const noTank = hasNoAssignedTank(item);
  const chips = [];
  if(noTank) chips.push(`<span class="ir-chip ir-chip-warn">⚠ No tank</span>`);
  else if(tankDisplay) chips.push(`<span class="ir-chip">Tank ${tankDisplay}</span>`);
  if(qty !== null) chips.push(`<span class="ir-chip">Qty ${qty}</span>`);
  if(priceDisplay) chips.push(`<span class="ir-chip ir-chip-price">${priceDisplay}</span>`);
  if(item.stockNumber) chips.push(`<span class="ir-chip ir-chip-mute">#${item.stockNumber}</span>`);
  if(item.reserved && item.reservedFor) chips.push(`<span class="ir-chip ir-chip-rose">Held · ${item.reservedFor}</span>`);
  const catClass = catColorClass(item.category) || 'cat-default';
  return `<button type="button" class="inventory-row-v124 ${catClass}" data-card-photo="${item.id}" onclick="openFishModal('${item.id}')">
    <div class="ir-thumb">${photoSrc ? `<img src="${photoSrc}" alt="${L(item,'name')}" loading="lazy">` : '<div class="ir-thumb-placeholder">LTC</div>'}</div>
    <div class="ir-main">
      <div class="ir-name-row">
        <strong class="ir-name">${L(item,'name')}</strong>
        <span class="ir-status ir-status-${tone}">${status}</span>
      </div>
      <div class="ir-chips">${chips.join('')}</div>
    </div>
  </button>`;
}

function inventorySummaryTemplate(items){
  const summary = inventorySummary(items);
  const rollbackReady = items.filter(item => !!majorRollbackButtons(item)).length;
  const recentChanges = items.reduce((sum, item) => sum + ((Array.isArray(item[STAFF_HISTORY_FIELD]) ? item[STAFF_HISTORY_FIELD].length : 0)), 0);
  return `<div class="inventory-summary">
    <div class="inventory-summary-card"><span>Entries</span><strong>${summary.entries}</strong><small>catalog entries in this view</small></div>
    <div class="inventory-summary-card"><span>Live Count</span><strong>${summary.liveCount}</strong><small>estimated animals on hand</small></div>
    <div class="inventory-summary-card"><span>Held</span><strong>${summary.reserved}</strong><small>customer reservations</small></div>
    <div class="inventory-summary-card"><span>Rollback Ready</span><strong>${rollbackReady}</strong><small>fish with an undo action ready</small></div>
    <div class="inventory-summary-card"><span>Recent Changes</span><strong>${recentChanges}</strong><small>staff actions captured in history</small></div>
    <div class="inventory-summary-card"><span>Missing Species Core Data</span><strong>${summary.missingSpeciesCore}</strong><small>scientific, overview, tank, size, diet, or gauges need review</small></div>
    <div class="inventory-summary-card"><span>Missing Store Setup</span><strong>${summary.missingStoreSetup}</strong><small>price, tank, qty, stock #, or photo</small></div>
  </div>`;
}
function groupInventoryItems(items, groupBy){
  // V0.125 — group inventory rows so big lists become scannable.
  // Tank is the default since that matches how staff physically thinks
  // about the store. 'No tank assigned' / 'Other' get pushed to the
  // bottom via a 'zzz_' key prefix that sorts last.
  if(!groupBy || groupBy === 'none'){
    return [{ key: 'all', label: 'All fish', items: items.slice() }];
  }
  const groups = new Map();
  items.forEach(item => {
    let key, label;
    if(groupBy === 'tank'){
      const code = String(item.tankCode || '').trim().toUpperCase();
      key = code || 'zzz_notank';
      label = code ? `Tank ${code}` : 'No tank assigned';
    } else if(groupBy === 'category'){
      key = item.category || 'zzz_other';
      label = inventoryCategoryLabel(item.category) || 'Other';
    } else {
      key = 'all';
      label = 'All fish';
    }
    if(!groups.has(key)) groups.set(key, { key, label, items: [] });
    groups.get(key).items.push(item);
  });
  return Array.from(groups.values()).sort((a, b) => a.key.localeCompare(b.key));
}
function setInventoryGroupBy(mode){
  state.inventoryGroupBy = (mode === 'tank' || mode === 'none') ? mode : 'category';
  // Wipe collapsed state when switching grouping so the new groups all start expanded
  state.inventoryCollapsedGroups = new Set();
  renderInventoryManager();
}
function toggleInventoryGroupCollapse(key){
  if(!state.inventoryCollapsedGroups) state.inventoryCollapsedGroups = new Set();
  if(state.inventoryCollapsedGroups.has(key)) state.inventoryCollapsedGroups.delete(key);
  else state.inventoryCollapsedGroups.add(key);
  // Re-render only the affected group via DOM toggle (no full re-render)
  const groupEl = document.querySelector(`[data-inv-group="${CSS.escape(key)}"]`);
  if(groupEl) groupEl.classList.toggle('is-collapsed');
}
function inventoryCatalogSummaryTemplate(items, status='all', category='all', query=''){
  // V0.125 — slim banner with group-by selector. Was a stacked breadcrumb +
  // title + helper + 4 stat pills card. Now a one-line filter context strip
  // with back button on the left, title in the middle, and group-by pills
  // on the right.
  const labels = {
    instock:'In stock', out:'Out of stock', quarantine:'Quarantine', reserved:'Customer holds',
    notank:'Need a tank', missingspecies:'Species review', missingstore:'Store setup', recent:'Recent changes'
  };
  const tankFilter = state.inventoryTankFilter || '';
  const contextParts = [];
  if(tankFilter) contextParts.push(`Tank ${tankFilter}`);
  if(category !== 'all') contextParts.push(inventoryCategoryLabel(category));
  if(status !== 'all') contextParts.push(labels[status] || 'Filtered');
  if(query) contextParts.push(`"${query}"`);
  const title = contextParts.length ? contextParts.join(' · ') : 'All inventory';
  const countText = `${items.length} ${items.length === 1 ? 'fish' : 'fish'}`;
  const groupBy = state.inventoryGroupBy || 'category';
  const groupBtn = (mode, label) => `<button type="button" class="icb-group-btn ${groupBy === mode ? 'is-active' : ''}" onclick="setInventoryGroupBy('${mode}')">${label}</button>`;
  return `<div class="inventory-catalog-banner-v124">
    <button type="button" class="icb-back" onclick="setInventoryManagerMode('overview')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
      <span>Staff home</span>
    </button>
    <div class="icb-title">
      <strong>${title}</strong>
      <span>${countText}</span>
    </div>
    <div class="icb-group-row">
      <span class="icb-group-label">Group:</span>
      ${groupBtn('tank', 'Tank')}
      ${groupBtn('category', 'Category')}
      ${groupBtn('none', 'Flat')}
    </div>
  </div>`;
}
function updateInventoryToolbarState(isCatalog=false){
  const backBtn = document.getElementById('inventoryBackBtn');
  if(backBtn) backBtn.hidden = !isCatalog;
  // v0.149 — also swap the topbar back/close button between modes.
  // In overview: shows X icon + "Close" label, closes the inventory.
  // In catalog: shows ← icon + "Back" label, returns to overview.
  // Same button in same place, behavior changes based on context so a
  // staffer never accidentally closes the entire panel when they meant
  // to step back one level.
  const topBack = document.getElementById('inventoryTopbarBackBtn');
  if(topBack){
    topBack.classList.toggle('is-back-mode', !!isCatalog);
    const label = topBack.querySelector('.ipb-label');
    if(label) label.textContent = isCatalog ? 'Back' : 'Close';
    topBack.setAttribute('aria-label', isCatalog ? 'Back to staff home' : 'Close inventory');
  }
  const panel = document.querySelector('#inventoryOverlay .inventory-panel');
  if(panel) panel.classList.toggle('catalog-active', !!isCatalog);

  // v0.175 — Dynamic breadcrumb title. The h2 used to always say
  // "Inventory Manager" no matter how deep you were. Chris said all
  // the sub-menus look the same and asked for a clearer label up
  // top. Now the title shows context: "Inventory · Tank A",
  // "Inventory · Held", "Inventory · Tangs", etc.
  const titleEl = document.getElementById('inventoryPanelTitle');
  if(titleEl){
    if(!isCatalog){
      titleEl.textContent = (typeof T === 'function') ? T('inventoryTitle') : 'Inventory Manager';
    } else {
      const labels = {
        instock:'In stock', out:'Out of stock', quarantine:'Quarantine',
        reserved:'Customer holds', notank:'Need a tank',
        missingspecies:'Missing species data', missingstore:'Missing store data',
        recent:'Recent changes'
      };
      const tankFilter = state.inventoryTankFilter || '';
      const statusEl = document.getElementById('inventoryStatusFilter');
      const categoryEl = document.getElementById('inventoryCategoryFilter');
      const searchEl = document.getElementById('inventorySearch');
      const status = statusEl ? statusEl.value : 'all';
      const category = categoryEl ? categoryEl.value : 'all';
      const query = searchEl ? (searchEl.value || '').trim() : '';
      const parts = [];
      if(tankFilter) parts.push(`Tank ${tankFilter}`);
      if(category && category !== 'all'){
        const catLabel = (typeof inventoryCategoryLabel === 'function') ? inventoryCategoryLabel(category) : category;
        parts.push(catLabel);
      }
      if(status && status !== 'all') parts.push(labels[status] || 'Filtered');
      if(query) parts.push(`"${query}"`);
      const ctx = parts.length ? parts.join(' · ') : 'All inventory';
      titleEl.textContent = `Inventory · ${ctx}`;
    }
  }
}

// v0.149 — context-sensitive topbar button handler. In catalog mode this
// steps back to the staff home overview. In overview mode (the default
// landing screen) it closes the entire inventory overlay. Replaces the
// old hard-coded Close button that was always closing the entire panel
// even when the user clearly meant "go back one level."
window.inventoryTopbarBack = function(){
  if(state.inventoryManagerMode === 'catalog'){
    setInventoryManagerMode('overview');
  } else {
    closeInventoryManager();
  }
};

function setInventoryManagerMode(mode='overview'){
  state.inventoryManagerMode = mode === 'catalog' ? 'catalog' : 'overview';
  // v0.149 — bug fix. Going back to 'overview' mode also clears the filter
  // inputs (search/status/category/tank). Without this, renderInventoryManager
  // would see the still-active filters at line 5319 and immediately force
  // the mode back to 'catalog', making the "Staff home" back button look
  // broken. The button was doing exactly what it said, the renderer was
  // overriding it on the next pass.
  if(mode !== 'catalog'){
    state.inventoryTankFilter = '';
    const search = document.getElementById('inventorySearch');
    const status = document.getElementById('inventoryStatusFilter');
    const category = document.getElementById('inventoryCategoryFilter');
    if(search) search.value = '';
    if(status) status.value = 'all';
    if(category) category.value = 'all';
  }
  renderInventoryManager();
}
function resetInventoryFilters(mode='overview'){
  const search = document.getElementById('inventorySearch');
  const status = document.getElementById('inventoryStatusFilter');
  const category = document.getElementById('inventoryCategoryFilter');
  if(search) search.value = '';
  if(status) status.value = 'all';
  if(category) category.value = 'all';
  state.inventoryTankFilter = '';
  state.inventoryManagerMode = mode === 'catalog' ? 'catalog' : 'overview';
  renderInventoryManager();
}
function applyInventoryPreset(status='all', category='all', query=''){
  const search = document.getElementById('inventorySearch');
  const statusEl = document.getElementById('inventoryStatusFilter');
  const categoryEl = document.getElementById('inventoryCategoryFilter');
  if(search) search.value = query || '';
  if(statusEl) statusEl.value = status || 'all';
  if(categoryEl) categoryEl.value = category || 'all';
  state.inventoryTankFilter = '';
  state.inventoryManagerMode = 'catalog';
  renderInventoryManager();
}
function filterInventoryByTank(code){
  const search = document.getElementById('inventorySearch');
  const statusEl = document.getElementById('inventoryStatusFilter');
  const categoryEl = document.getElementById('inventoryCategoryFilter');
  if(search) search.value = '';
  if(statusEl) statusEl.value = 'all';
  if(categoryEl) categoryEl.value = 'all';
  state.inventoryTankFilter = String(code || '').toUpperCase();
  state.inventoryManagerMode = 'catalog';
  renderInventoryManager();
}
function inventoryCategoryOverviewTemplate(items){
  const categories = [...new Set(FISH.map(item => item.category).filter(Boolean))].sort((a,b)=> inventoryCategoryLabel(a).localeCompare(inventoryCategoryLabel(b)));
  const rows = categories.map(category => {
    const entries = items.filter(item => item.category === category);
    if(!entries.length) return '';
    const live = entries.filter(item => item.inStock).length;
    const quarantine = entries.filter(item => item.quarantine).length;
    const held = entries.filter(item => item.reserved).length;
    const safeCategory = String(category).replace(/'/g, "\'");
    return `<button type="button" class="inventory-category-card" onclick="applyInventoryPreset('all','${safeCategory}')">
      <div class="inventory-category-top"><span class="inventory-category-kicker">Category</span><span class="inventory-category-count">${entries.length} entries</span></div>
      <strong>${inventoryCategoryLabel(category)}</strong>
      <small>${live} live · ${quarantine} quarantine · ${held} held</small>
      <em>Open category →</em>
    </button>`;
  }).filter(Boolean).join('');
  return `<div class="inventory-category-overview">${rows}</div>`;
}
function inventoryOverviewTemplate(items){
  // V0.120 STAFF HOME — hybrid layout: stat cards + alert + verb tiles
  // + recent activity pillbox + categorized accordion sections.
  const live = items.filter(item => item.inStock).length;
  const quarantine = items.filter(item => item.quarantine).length;
  const held = items.filter(item => item.reserved).length;
  const recent = items.filter(item => Array.isArray(item[STAFF_HISTORY_FIELD]) && item[STAFF_HISTORY_FIELD].length).length;
  const noTankAssigned = items.filter(item => hasNoAssignedTank(item)).length;
  const speciesReview = items.filter(hasMissingSpeciesCoreData).length;
  const storeSetup = items.filter(hasMissingStoreData).length;
  const dayAgo = Date.now() - 86400000;
  let soldRevenue = 0;
  let soldCount = 0;
  items.forEach(item => {
    const sh = saleHistoryFor(item);
    sh.forEach(entry => {
      if(entry && entry.time && entry.time > dayAgo){
        const qty = entry.quantity || 1;
        soldRevenue += (entry.price || 0) * qty;
        soldCount += qty;
      }
    });
  });
  // v0.160 — Stock value calculation overhaul.
  // Previous version (v0.133+) summed i.price once per in-stock fish
  // entry, which ignored quantity entirely. A fish with qty:5 at $50
  // was counted as $50 not $250. Also: Chris asked for a fish-vs-invert
  // split so staff can see the breakdown at a glance.
  let stockValueFish = 0;
  let stockValueInvert = 0;
  items.forEach(i => {
    if(!i.inStock) return;
    const unit = (i.onSale && i.salePrice) ? Number(i.salePrice) : Number(i.price || 0);
    if(!unit) return;
    const qty = Number.isFinite(Number(i.quantity)) ? Number(i.quantity) : 1;
    const line = unit * (qty > 0 ? qty : 1);
    const isInvert = /invert/i.test(String(i.type || ''));
    if(isInvert) stockValueInvert += line;
    else stockValueFish += line;
  });
  const stockValue = stockValueFish + stockValueInvert;

  // v0.161 — Two new metrics for the staff hub stat row.
  // avgSale: average sale price across today's sales. Useful at-a-glance
  //   read on whether the store is moving cheap or premium fish today.
  // restockedToday: count of fish that received a "receive" or "restock"
  //   history entry within the last 24h. Tells staff what was added today.
  const avgSale = soldCount > 0 ? (soldRevenue / soldCount) : 0;
  let restockedToday = 0;
  items.forEach(item => {
    const h = item[STAFF_HISTORY_FIELD] || [];
    for(let i = h.length - 1; i >= 0; i--){
      const entry = h[i];
      if(!entry || !entry.time || entry.time < dayAgo) break;
      const action = String(entry.action || '').toLowerCase();
      if(action.includes('receive') || action.includes('restock')){
        restockedToday++;
        break; // count each fish only once
      }
    }
  });
  const needAttention = noTankAssigned + quarantine;
  const noTankSample = items.filter(item => hasNoAssignedTank(item)).slice(0, 3).map(i => L(i,'name'));
  const noTankPreview = noTankSample.join(', ') + (noTankAssigned > 3 ? ', +' + (noTankAssigned - 3) + ' more' : '');

  // v0.172 — Two new stat tiles: Customer holds and Oldest in stock.
  // Customer holds: fish currently reserved for a customer. Already
  //   computed as `held` above. New tile shows count + customer name
  //   preview if any are reserved with a name.
  // Oldest in stock: longest-running in-stock fish, by arrivalDate.
  //   Tells staff which fish has been sitting the longest, so they
  //   know what to discount or reposition. Falls back to "—" if no
  //   in-stock fish has an arrivalDate set.
  let oldestInStock = null;
  let oldestDays = 0;
  items.forEach(item => {
    if(!item.inStock) return;
    const arrival = item.arrivalDate ? new Date(item.arrivalDate).getTime() : null;
    if(!arrival || isNaN(arrival)) return;
    const days = Math.floor((Date.now() - arrival) / 86400000);
    if(days > oldestDays){
      oldestDays = days;
      oldestInStock = item;
    }
  });
  const heldSample = items.filter(item => item.reserved && item.reservedFor).slice(0, 1).map(i => i.reservedFor);
  const heldPreview = heldSample.length ? `for ${heldSample[0]}${held > 1 ? ' · +' + (held - 1) : ''}` : (held === 1 ? '1 fish' : `${held} fish`);

  const allHistory = [];
  items.forEach(item => {
    const h = item[STAFF_HISTORY_FIELD] || [];
    h.forEach(entry => allHistory.push({item, entry}));
  });
  allHistory.sort((a, b) => (b.entry?.time || 0) - (a.entry?.time || 0));
  // V0.122 — tank chip strip. Group in-stock fish by tankCode so staff
  // can see at a glance which tanks have what, and tap a chip to filter.
  const tankCounts = {};
  items.forEach(item => {
    if(!item.inStock) return;
    const code = String(item.tankCode || '').trim().toUpperCase();
    if(!code) return;
    tankCounts[code] = (tankCounts[code] || 0) + 1;
  });
  const tankCodes = Object.keys(tankCounts).sort();
  const actionTone = (a) => {
    const s = (a || '').toLowerCase();
    if(s.includes('sold') || s.includes('sale')) return 'sh-act-green';
    if(s.includes('loss') || s.includes('removed') || s.includes('dead')) return 'sh-act-red';
    if(s.includes('receive') || s.includes('restock') || s.includes('arriv') || s.includes('add')) return 'sh-act-blue';
    if(s.includes('tank') || s.includes('move')) return 'sh-act-purple';
    if(s.includes('quaran')) return 'sh-act-amber';
    if(s.includes('price') || s.includes('sale price')) return 'sh-act-cyan';
    if(s.includes('hold') || s.includes('reserv')) return 'sh-act-rose';
    return 'sh-act-gray';
  };
  const recentRows = allHistory.slice(0, 6).map(({item, entry}) => `
      <button type="button" class="sh-activity-row" onclick="closeInventoryManager();setTimeout(()=>openFishModal('${item.id}'),200)">
        <span class="sh-activity-dot ${actionTone(entry.action)}"></span>
        <span class="sh-activity-time">${formatDateTimeShort(entry.time)}</span>
        <span class="sh-activity-name">${L(item, 'name')}</span>
        <span class="sh-activity-action ${actionTone(entry.action)}">${entry.action || 'edit'}</span>
      </button>`).join('');
  const dateLabel = new Date().toLocaleDateString(undefined, {weekday:'long', month:'long', day:'numeric'});
  const fmt = (n) => formatMoney(Math.round(n));
  return `<div class="staff-home-v120">

    <div class="sh-kicker-row">
      <div class="sh-kicker-pill">STAFF MODE</div>
      <div class="sh-kicker-date">${dateLabel}</div>
    </div>

    <!-- v0.164 — pufferfish ambient (cuter, slower, randomized).
         Friendlier face: bigger eye, smile, pink cheek. Tail is now
         INSIDE the puff-body group so it scales with the body (no
         more oversized-tail-when-deflated). 38s cycle. JS picks new
         random vertical + stop positions on each iteration via
         bindPufferRandomizer() so the puffer doesn't follow the
         same path twice. -->
    <div class="sh-fish-lane" aria-hidden="true">
      <span class="sh-puff-swimmer">
        <svg viewBox="0 0 64 50" xmlns="http://www.w3.org/2000/svg">
          <g class="puff-body">
            <!-- 6 small spikes around the body — fewer + softer than v0.162 -->
            <path d="M32 8 L33 2 L31 2 Z"   fill="rgba(255,180,80,0.7)" stroke="rgba(255,210,140,0.8)" stroke-width="0.7"/>
            <path d="M48 14 L54 11 L50 17 Z" fill="rgba(255,180,80,0.7)" stroke="rgba(255,210,140,0.8)" stroke-width="0.7"/>
            <path d="M52 26 L58 26 L52 30 Z" fill="rgba(255,180,80,0.7)" stroke="rgba(255,210,140,0.8)" stroke-width="0.7"/>
            <path d="M48 38 L54 41 L50 35 Z" fill="rgba(255,180,80,0.7)" stroke="rgba(255,210,140,0.8)" stroke-width="0.7"/>
            <path d="M32 44 L33 50 L31 50 Z" fill="rgba(255,180,80,0.7)" stroke="rgba(255,210,140,0.8)" stroke-width="0.7"/>
            <path d="M16 38 L10 41 L14 35 Z" fill="rgba(255,180,80,0.7)" stroke="rgba(255,210,140,0.8)" stroke-width="0.7"/>
            <!-- chubby round body -->
            <ellipse cx="32" cy="26" rx="16" ry="14" fill="rgba(255,168,80,0.9)" stroke="rgba(255,200,130,0.95)" stroke-width="1.4"/>
            <!-- belly highlight -->
            <ellipse cx="31" cy="33" rx="10" ry="4" fill="rgba(255,225,170,0.5)"/>
            <!-- SMALL tail (was oversized) — inside body group so it scales with the body -->
            <path class="puff-tail" d="M17 26 L9 22 L11 26 L9 30 Z" fill="rgba(255,168,80,0.85)" stroke="rgba(255,200,130,0.95)" stroke-width="1.1"/>
            <!-- big cute eye -->
            <circle cx="42" cy="22" r="4.2" fill="#fff" stroke="rgba(160,80,20,0.4)" stroke-width="0.4"/>
            <circle cx="42.8" cy="22.4" r="2.1" fill="#1a0a02"/>
            <circle cx="43.4" cy="21.6" r="0.8" fill="#fff"/>
            <!-- tiny smile -->
            <path d="M44 28.5 Q46 30.5 48 28.5" fill="none" stroke="rgba(120,60,20,0.7)" stroke-width="0.9" stroke-linecap="round"/>
            <!-- pink cheek -->
            <circle cx="46" cy="27" r="1.7" fill="rgba(255,140,150,0.4)"/>
          </g>
        </svg>
        <!-- 6 bubbles INSIDE the swimmer so they inherit the fish's
             current position. Each bubble has its own animation that
             translates it AHEAD (right) and slightly up, away from
             the fish's mouth. Density is highest near the fish and
             falls off as they spread. -->
        <span class="sh-puff-bubble sh-puff-bubble-1"></span>
        <span class="sh-puff-bubble sh-puff-bubble-2"></span>
        <span class="sh-puff-bubble sh-puff-bubble-3"></span>
        <span class="sh-puff-bubble sh-puff-bubble-4"></span>
        <span class="sh-puff-bubble sh-puff-bubble-5"></span>
        <span class="sh-puff-bubble sh-puff-bubble-6"></span>
      </span>
    </div>

    <div class="sh-stat-row">
      <button type="button" class="sh-stat-card sh-stat-card-btn sh-tone-green" onclick="ltcFx.jelly(this);statCardReact(this,'dollar')">
        <div class="sh-stat-label">Sold today</div>
        <div class="sh-stat-value">${fmt(soldRevenue)}</div>
        <div class="sh-stat-sub">${soldCount} ${soldCount === 1 ? 'fish' : 'fish'}</div>
      </button>
      <button type="button" class="sh-stat-card sh-stat-card-btn sh-tone-cyan" onclick="ltcFx.jelly(this);statCardReact(this,'pen')">
        <div class="sh-stat-label">Avg sale today</div>
        <div class="sh-stat-value">${soldCount > 0 ? fmt(avgSale) : '—'}</div>
        <div class="sh-stat-sub">${soldCount > 0 ? 'per fish' : 'no sales yet'}</div>
      </button>
      <button type="button" class="sh-stat-card sh-stat-card-btn sh-tone-blue" onclick="ltcFx.jelly(this);statCardReact(this,'fish')">
        <div class="sh-stat-label">In stock</div>
        <div class="sh-stat-value">${live}</div>
        <div class="sh-stat-sub">${items.length} in catalog</div>
      </button>
      <button type="button" class="sh-stat-card sh-stat-card-btn sh-tone-rose" onclick="ltcFx.jelly(this);statCardReact(this,'box')">
        <div class="sh-stat-label">Restocked today</div>
        <div class="sh-stat-value">${restockedToday}</div>
        <div class="sh-stat-sub">${restockedToday === 0 ? 'nothing new' : 'received in 24h'}</div>
      </button>
      <button type="button" class="sh-stat-card sh-stat-card-btn sh-tone-amber" onclick="ltcFx.jelly(this);statCardReact(this,'warn')">
        <div class="sh-stat-label">Need attention</div>
        <div class="sh-stat-value">${needAttention}</div>
        <div class="sh-stat-sub">${noTankAssigned} no tank · ${quarantine} quarantine</div>
      </button>
      <button type="button" class="sh-stat-card sh-stat-card-btn sh-tone-purple" onclick="ltcFx.jelly(this);statCardReact(this,'treasure')">
        <div class="sh-stat-label">Stock value</div>
        <div class="sh-stat-value">${fmt(stockValue)}</div>
        <div class="sh-stat-sub">${fmt(stockValueFish)} fish · ${fmt(stockValueInvert)} invert</div>
      </button>
      <button type="button" class="sh-stat-card sh-stat-card-btn sh-tone-purple" onclick="ltcFx.jelly(this);statCardReact(this,'heart')">
        <div class="sh-stat-label">Customer holds</div>
        <div class="sh-stat-value">${held}</div>
        <div class="sh-stat-sub">${held > 0 ? heldPreview : 'none on hold'}</div>
      </button>
      <button type="button" class="sh-stat-card sh-stat-card-btn sh-tone-gray" onclick="ltcFx.jelly(this);statCardReact(this,'clock')">
        <div class="sh-stat-label">Oldest in stock</div>
        <div class="sh-stat-value">${oldestInStock ? oldestDays + 'd' : '—'}</div>
        <div class="sh-stat-sub">${oldestInStock ? L(oldestInStock,'name') : 'no arrival dates set'}</div>
      </button>
    </div>

    <div class="sh-pill-row">
      <button type="button" class="sh-recent-pill" data-sh-toggle="recent">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span class="sh-recent-pill-label">Recent activity</span>
        <span class="sh-recent-pill-count">${allHistory.length}</span>
        <span class="sh-recent-pill-chev">▼</span>
      </button>
      ${noTankAssigned > 0 ? `
      <div class="sh-alert-strip">
        <div class="sh-alert-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <div class="sh-alert-text">
          <strong>${noTankAssigned} fish need a tank</strong>
          <span>${noTankPreview}</span>
        </div>
        <button type="button" class="sh-alert-btn" onclick="applyInventoryPreset('notank')">FIX NOW</button>
      </div>` : ''}
    </div>

    <div class="sh-recent-panel" data-sh-panel="recent">
      ${recentRows || '<div class="sh-recent-empty">No staff activity yet — once you start editing fish, the latest changes will show up here.</div>'}
      <button type="button" class="sh-recent-more" onclick="openInventoryHistoryOverlay()">View all activity →</button>
    </div>

    ${tankCodes.length ? `
    <div class="sh-tank-strip">
      <div class="sh-tank-strip-label">TANKS WITH FISH</div>
      <div class="sh-tank-chips">
        ${tankCodes.map(code => `
          <button type="button" class="sh-tank-chip" onclick="filterInventoryByTank('${code}')" aria-label="Tank ${code} — ${tankCounts[code]} fish">
            <span class="sh-tank-water">
              <span class="sh-tank-water-bg"></span>
              <span class="sh-tank-slosh sh-tank-slosh-1"></span>
              <span class="sh-tank-slosh sh-tank-slosh-2"></span>
              <span class="sh-tank-surface"></span>
            </span>
            <span class="sh-tank-gloss"></span>
            <span class="sh-tank-letter">${code}</span>
            <span class="sh-tank-count">${tankCounts[code]}</span>
          </button>
        `).join('')}
      </div>
    </div>` : ''}

    <div class="sh-section-label">
      <span class="sh-section-dot"></span>
      WHAT NEEDS DOING
    </div>
    <div class="sh-tile-grid">
      <button type="button" class="sh-tile sh-tone-green" onclick="staffBulkReceiveFish()">
        <svg class="sh-tile-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
        <div class="sh-tile-title">Receive new fish</div>
        <div class="sh-tile-sub">Add to inventory</div>
      </button>
      <button type="button" class="sh-tile sh-tone-blue" onclick="applyInventoryPreset('instock')">
        <svg class="sh-tile-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6z"/><circle cx="15" cy="12" r="1"/><path d="M2 12c1-2 2-3 4-3"/><path d="M2 12c1 2 2 3 4 3"/></svg>
        <div class="sh-tile-title">In stock fish</div>
        <div class="sh-tile-sub">${live} ready to sell</div>
      </button>
      <button type="button" class="sh-tile sh-tone-cyan" onclick="openTankMover()">
        <svg class="sh-tile-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/><path d="M7 14l3 3 7-7"/></svg>
        <div class="sh-tile-title">Tank mover</div>
        <div class="sh-tile-sub">Shuffle between tanks</div>
      </button>
      <button type="button" class="sh-tile sh-tone-amber" onclick="applyInventoryPreset('quarantine')">
        <svg class="sh-tile-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div class="sh-tile-title">Quarantine</div>
        <div class="sh-tile-sub">${quarantine} under watch</div>
      </button>
      <button type="button" class="sh-tile sh-tone-purple" onclick="applyInventoryPreset('reserved')">
        <svg class="sh-tile-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v8"/><path d="M5 18h14"/><path d="M9 22v-4"/><path d="M15 22v-4"/><circle cx="12" cy="10" r="2"/></svg>
        <div class="sh-tile-title">Customer holds</div>
        <div class="sh-tile-sub">${held} reserved</div>
      </button>
      <button type="button" class="sh-tile sh-tone-red" onclick="applyInventoryPreset('notank')">
        <svg class="sh-tile-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18"/><line x1="9" y1="16" x2="15" y2="16"/></svg>
        <div class="sh-tile-title">Need a tank</div>
        <div class="sh-tile-sub">${noTankAssigned} to assign</div>
      </button>
      <button type="button" class="sh-tile sh-tone-gray" onclick="setInventoryManagerMode('catalog')">
        <svg class="sh-tile-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        <div class="sh-tile-title">Full catalog</div>
        <div class="sh-tile-sub">${items.length} species</div>
      </button>
    </div>

    <div class="sh-section-label sh-section-label-secondary">
      <span class="sh-section-dot sh-section-dot-blue"></span>
      MORE TOOLS
    </div>
    <div class="sh-more-row">
      <button type="button" class="sh-circle-btn sh-tone-purple" onclick="staffCreateBundle()">
        <span class="sh-circle">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
        </span>
        <span class="sh-circle-label">Build a<br>new bundle</span>
      </button>
      <button type="button" class="sh-circle-btn sh-tone-green" onclick="openFoodSettings()">
        <span class="sh-circle">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12c0-1 1-3 4-3s5 2 5 2 2-2 5-2 4 2 4 3-1 3-4 3-5-2-5-2-2 2-5 2-4-2-4-3z"/><circle cx="7" cy="12" r="0.5" fill="currentColor"/><circle cx="17" cy="12" r="0.5" fill="currentColor"/></svg>
        </span>
        <span class="sh-circle-label">Food the<br>store carries</span>
      </button>
      <button type="button" class="sh-circle-btn sh-tone-blue" onclick="openInventoryHistoryOverlay()">
        <span class="sh-circle">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </span>
        <span class="sh-circle-label">All staff<br>history</span>
      </button>
      <button type="button" class="sh-circle-btn sh-tone-amber" onclick="staffAddUncatalogedFish()" title="Add a fish that isn't in the species database">
        <span class="sh-circle">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-4"/><path d="M12 2v13"/><path d="M9 6l3-3 3 3"/></svg>
        </span>
        <span class="sh-circle-label">Not in<br>database</span>
      </button>
    </div>

    <!-- v0.174 → v0.175 — kelp forest at the bottom of the staff hub.
         Now denser with bubbles + drifting fish per Chris feedback. -->
    <div class="sh-kelp-forest" aria-hidden="true">
      <span class="sh-kelp-strand"></span>
      <span class="sh-kelp-strand"></span>
      <span class="sh-kelp-strand"></span>
      <span class="sh-kelp-strand"></span>
      <span class="sh-kelp-strand"></span>
      <span class="sh-kelp-strand"></span>
      <span class="sh-kelp-strand"></span>
      <span class="sh-kelp-strand"></span>
      <span class="sh-kelp-strand"></span>
      <span class="sh-kelp-strand"></span>
      <span class="sh-kelp-strand"></span>
      <span class="sh-kelp-strand"></span>
      <span class="sh-kelp-strand"></span>
      <span class="sh-kelp-strand"></span>
      <span class="sh-kelp-strand"></span>
      <span class="sh-kelp-strand"></span>
      <span class="sh-kelp-strand"></span>
      <span class="sh-kelp-strand"></span>
      <span class="sh-kelp-strand"></span>
      <span class="sh-kelp-strand"></span>
      <span class="sh-kelp-strand"></span>
      <span class="sh-kelp-bubble"></span>
      <span class="sh-kelp-bubble"></span>
      <span class="sh-kelp-bubble"></span>
      <span class="sh-kelp-bubble"></span>
      <span class="sh-kelp-bubble"></span>
      <span class="sh-kelp-bubble"></span>
      <span class="sh-kelp-fish"></span>
    </div>

  </div>`;
}
function bindStaffHomeToggles(root){
  if(!root) return;
  // Recent activity pill toggle
  const toggles = root.querySelectorAll('[data-sh-toggle]');
  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.shToggle;
      const panel = root.querySelector('[data-sh-panel="' + key + '"]');
      if(!panel) return;
      const open = panel.classList.toggle('sh-open');
      btn.classList.toggle('sh-is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    btn.setAttribute('aria-expanded', 'false');
  });
}
// v0.170 — Pufferfish lifecycle controller (rebuilt from scratch).
// Earlier versions (v0.162-v0.169) used an infinite CSS animation
// loop with various tricks to randomize the position between cycles
// (--puff-y, --puff-yshift, baked-in vertical curve). Every approach
// had a visible teleport because the animationiteration event timing
// is not reliably aligned with the invisible portion of the cycle.
//
// This version drives the entire lifecycle from JS:
//   1. Set the random vertical shift (--puff-yshift)
//   2. Add .is-swimming class → CSS animation runs ONCE → puffer
//      swims across the screen at one constant Y
//   3. animationend event fires → remove class → puffer is reset
//      to the off-screen left, opacity 0, ready for next pass
//   4. Wait 4-7 seconds (also random)
//   5. Repeat
// There is no infinite loop, no animationiteration event, no cycle
// boundary, and no chance of the position change being visible.
function bindPufferRandomizer(root){
  if(!root) return;
  const swimmer = root.querySelector('.sh-puff-swimmer');
  if(!swimmer || swimmer.dataset.puffBound === '1') return;
  swimmer.dataset.puffBound = '1';

  let scheduledTimer = null;

  function startNewPass(){
    // Pick a random vertical shift -28px to +28px so consecutive
    // passes are clearly at different heights across the lane.
    const shift = (Math.random() * 56 - 28).toFixed(1) + 'px';
    swimmer.style.setProperty('--puff-yshift', shift);
    // Force a reflow so the class removal/addition cycle triggers
    // a fresh animation (browsers otherwise coalesce them).
    swimmer.classList.remove('is-swimming');
    void swimmer.offsetWidth;
    swimmer.classList.add('is-swimming');
  }

  function scheduleNext(){
    if(scheduledTimer) clearTimeout(scheduledTimer);
    // Random pause between passes: 4-7 seconds. Adds rhythm so
    // passes don't feel mechanical.
    const wait = 4000 + Math.random() * 3000;
    scheduledTimer = setTimeout(startNewPass, wait);
  }

  // When the animation finishes, the puffer is back at left:110%,
  // opacity 0, ready to be reset and run again. The animation event
  // bubbles up from child puff-body which has the same duration —
  // we listen specifically for the swim animation by name.
  swimmer.addEventListener('animationend', (e) => {
    if(e.animationName === 'shPuffSwim'){
      swimmer.classList.remove('is-swimming');
      scheduleNext();
    }
  });

  // Kick off the first pass after a brief settle delay so the staff
  // hub has time to render before the puffer enters.
  setTimeout(startNewPass, 1500);
}
function staffHistoryActionButtons(item){
  if(!item) return '';
  const parts = [];
  if(getUndoSnapshot(item, STAFF_UNDO_SOLD_FIELD)) parts.push(`<button class="staff-action-btn restore calming" onclick="staffUndoSold('${item.id}')">Undo Sold</button>`);
  if(getUndoSnapshot(item, STAFF_UNDO_LOSS_FIELD)) parts.push(`<button class="staff-action-btn restore calming" onclick="staffUndoLoss('${item.id}')">Undo Loss</button>`);
  if(getUndoSnapshot(item, STAFF_UNDO_QUARANTINE_FIELD)) parts.push(`<button class="staff-action-btn restore calming" onclick="staffUndoQuarantine('${item.id}')">Undo Quarantine</button>`);
  if(getUndoSnapshot(item, STAFF_UNDO_HOLD_FIELD)) parts.push(`<button class="staff-action-btn restore calming" onclick="staffUndoHold('${item.id}')">Undo Hold</button>`);
  return parts.join('');
}
function inventoryHistoryPanelTemplate(items, limit=18, restrictToView=true){
  const ids = new Set((items || []).map(item => item.id));
  const rows = [];
  FISH.forEach(item => {
    if(restrictToView && ids.size && !ids.has(item.id)) return;
    const history = Array.isArray(item[STAFF_HISTORY_FIELD]) ? item[STAFF_HISTORY_FIELD] : [];
    history.forEach(entry => rows.push({item, entry}));
  });
  rows.sort((a,b) => (b.entry?.time || 0) - (a.entry?.time || 0));
  const sliced = rows.slice(0, limit);
  if(!sliced.length){
    return `<div class="inventory-history-panel"><div class="inventory-history-panel-head"><div><strong>Recent staff changes</strong><span>Major actions will show here once staff start editing inventory.</span></div></div><div class="inventory-history-empty">No recent staff changes in this view yet.</div></div>`;
  }
  return `<div class="inventory-history-panel"><div class="inventory-history-panel-head"><div><strong>Recent staff changes</strong><span>Use the rollback buttons here to quickly reverse a sold, loss, quarantine, or hold without hunting through the grid.</span></div></div><div class="inventory-history-list">${sliced.map(({item, entry}) => `<div class="inventory-history-row"><div class="inventory-history-main"><div class="inventory-history-thumb" data-photo="${item.id}"><div class="image-placeholder">LTC</div></div><div><div class="inventory-history-name">${L(item,'name')}</div><div class="inventory-history-meta">${inventoryCategoryLabel(item.category)} · ${entry.action} · ${formatDateTimeShort(entry.time)}</div></div></div><div class="inventory-history-row-actions">${staffHistoryActionButtons(item) || '<span class="inventory-history-muted">No rollback ready</span>'}${state.staffMode ? `<button class="staff-action-btn edit" onclick="showSaleHistory('${item.id}')" style="background:rgba(90,220,200,.12);border-color:rgba(90,220,200,.26);color:#95f2e0">Sale History</button>` : ''}</div></div>`).join('')}</div></div>`;
}
const INVENTORY_RENDER_BATCH = 24;
let inventoryRenderToken = 0;
let inventoryRenderFrame = null;

function cancelInventoryRenderQueue(){
  inventoryRenderToken += 1;
  if(inventoryRenderFrame){
    cancelAnimationFrame(inventoryRenderFrame);
    inventoryRenderFrame = null;
  }
}
function openInventoryManager(){
  const overlay = document.getElementById('inventoryOverlay');
  if(!overlay) return;
  // v0.128 — clean slate on every open so reopening never lands in a stale
  // submenu view. This fixes the "I left inventory filtered and coming back
  // drops me into the catalog view" bug Chris flagged.
  state.inventoryManagerMode = 'overview';
  state.inventoryTankFilter = '';
  const _resetSearch = document.getElementById('inventorySearch');
  if(_resetSearch) _resetSearch.value = '';
  const _resetStatus = document.getElementById('inventoryStatusFilter');
  if(_resetStatus) _resetStatus.value = 'all';
  const _resetCategory = document.getElementById('inventoryCategoryFilter');
  if(_resetCategory) _resetCategory.value = 'all';
  const fileInput = document.getElementById('staffImportFile');
  if(fileInput && !fileInput.dataset.boundStaffImport){
    fileInput.addEventListener('change', e => {
      importStaffEditsFile(e.target.files?.[0]);
      e.target.value = '';
    });
    fileInput.dataset.boundStaffImport = '1';
  }
  const title = document.getElementById('inventoryPanelTitle');
  if(title) title.textContent = typeof T==='function' ? T('inventoryTitle') : 'Inventory Manager';
  const search = document.getElementById('inventorySearch');
  if(search && typeof T==='function') search.placeholder = T('inventorySearch');
  const filter = document.getElementById('inventoryStatusFilter');
  if(filter && typeof T==='function'){
    const opts = filter.options;
    if(opts[0]) opts[0].textContent = T('allStatuses');
    if(opts[1]) opts[1].textContent = T('statusInStock');
    if(opts[2]) opts[2].textContent = T('statusOutOfStock');
    if(opts[3]) opts[3].textContent = T('statusQuarantine');
    if(opts[4]) opts[4].textContent = 'Held / reserved';
    if(opts[5]) opts[5].textContent = 'Missing species data';
    if(opts[6]) opts[6].textContent = 'Missing store data';
    if(opts[7]) opts[7].textContent = 'Recent changes';
  }
  populateInventoryCategoryFilter();
  syncInventoryCategoryDropdownColor();
  overlay.classList.add('show');
  const root = document.getElementById('inventoryContent');
  if(root){
    updateInventoryToolbarState(false);
    root.innerHTML = '<div class="inventory-loading-state"><strong>Loading inventory…</strong><span>Building cards in smaller batches so the panel opens faster.</span></div>';
  }
  requestAnimationFrame(() => renderInventoryManager());
}
function closeInventoryManager(){
  cancelInventoryRenderQueue();
  const overlay = document.getElementById('inventoryOverlay');
  if(overlay) overlay.classList.remove('show');
}

function hydrateInventoryPhotos(items=[]){
  requestAnimationFrame(() => applyImagesToDOM());
  const sample = (Array.isArray(items) ? items : []).slice(0, 24);
  sample.forEach(item => {
    if(!item) return;
    fetchImageForFish(item).then(() => requestAnimationFrame(() => applyImagesToDOM())).catch(() => {});
  });
}
function renderInventoryHistoryOverlay(){
  const root = document.getElementById('inventoryHistoryContent');
  if(!root) return;
  root.innerHTML = inventoryHistoryPanelTemplate(FISH, 50, false);
  hydrateInventoryPhotos(FISH);
}
function openInventoryHistoryOverlay(){
  const overlay = document.getElementById('inventoryHistoryOverlay');
  if(!overlay) return;
  renderInventoryHistoryOverlay();
  overlay.classList.add('show');
}
function closeInventoryHistoryOverlay(){
  const overlay = document.getElementById('inventoryHistoryOverlay');
  if(overlay) overlay.classList.remove('show');
}

// =====================================================================
// TANK MOVER (V0.127 — rough working version)
// Tap-to-select then tap-to-drop. Drag-and-drop deferred until we know
// staff likes the direction. Multi-level tanks supported via free-form
// tank codes (e.g. "A-Top", "A-Mid", "A-Bot").
// =====================================================================
// v0.164 — knownTanks helpers. Tanks survive being emptied of fish,
// new tanks added via the modal stick around between sessions, and
// any tank a fish is dropped into is auto-registered as known.
function loadKnownTanks(){
  try{
    const raw = localStorage.getItem(KNOWN_TANKS_STORAGE_KEY);
    if(!raw) return null;
    const arr = JSON.parse(raw);
    if(Array.isArray(arr)) return arr.filter(s => s && typeof s === 'string').map(s => s.toUpperCase());
  }catch(_){}
  return null;
}
function saveKnownTanks(){
  try{
    const arr = Array.isArray(state.knownTanks) ? state.knownTanks : [];
    localStorage.setItem(KNOWN_TANKS_STORAGE_KEY, JSON.stringify(arr));
  }catch(_){}
}
function ensureKnownTanksInitialized(){
  if(!Array.isArray(state.knownTanks)){
    const loaded = loadKnownTanks();
    if(loaded && loaded.length){
      state.knownTanks = loaded;
    } else {
      // First run / no saved list — seed from any tanks fish are
      // currently in, so existing setups don't lose their tanks.
      const seed = new Set();
      FISH.forEach(item => {
        const code = String(item.tankCode || '').trim();
        if(code) seed.add(code.toUpperCase());
      });
      state.knownTanks = Array.from(seed).sort();
      saveKnownTanks();
    }
  }
}
function registerKnownTank(code){
  if(!code) return;
  const clean = String(code).trim().toUpperCase();
  if(!clean) return;
  ensureKnownTanksInitialized();
  if(!state.knownTanks.includes(clean)){
    state.knownTanks.push(clean);
    state.knownTanks.sort();
    saveKnownTanks();
  }
}
function removeKnownTank(code){
  if(!code) return;
  const clean = String(code).trim().toUpperCase();
  ensureKnownTanksInitialized();
  const idx = state.knownTanks.indexOf(clean);
  if(idx >= 0){
    state.knownTanks.splice(idx, 1);
    saveKnownTanks();
  }
}

function openTankMover(){
  const overlay = document.getElementById('tankMoverOverlay');
  if(!overlay) return;
  // v0.128 — multi-select. state.tankMoverSelectedIds is an array of fish ids.
  if(!Array.isArray(state.tankMoverSelectedIds)) state.tankMoverSelectedIds = [];
  ensureKnownTanksInitialized();
  overlay.classList.add('show');
  renderTankMover();
}
function closeTankMover(){
  const overlay = document.getElementById('tankMoverOverlay');
  if(overlay) overlay.classList.remove('show');
  state.tankMoverSelectedIds = [];
}
function renderTankMover(){
  const root = document.getElementById('tankMoverContent');
  if(!root) return;
  ensureKnownTanksInitialized();
  // v0.164 — Tanks are sourced from the persisted knownTanks list, NOT
  // derived from the fish data alone. This means an empty tank stays
  // visible (Chris: "a tank shouldn't disappear when there are no fish
  // in it") and tanks added via the modal stick around.
  const tankSet = new Set();
  let noTankCount = 0;
  (state.knownTanks || []).forEach(code => {
    if(code) tankSet.add(String(code).toUpperCase());
  });
  // Safety net: also include any tank a fish is currently in, in case
  // knownTanks somehow gets out of sync (e.g. older save data).
  FISH.forEach(item => {
    const code = String(item.tankCode || '').trim();
    if(code){
      const upper = code.toUpperCase();
      if(!tankSet.has(upper)){
        tankSet.add(upper);
        registerKnownTank(upper); // self-heal
      }
    } else if(item.inStock) noTankCount++;
  });
  const tankCodes = Array.from(tankSet).sort();
  const selectedIds = Array.isArray(state.tankMoverSelectedIds) ? state.tankMoverSelectedIds : [];
  const selectedSet = new Set(selectedIds);
  const selectedFishList = selectedIds.map(id => FISH.find(f => f.id === id)).filter(Boolean);
  const statusBar = document.getElementById('tankMoverStatusBar');
  if(statusBar){
    if(selectedFishList.length){
      const thumbStack = selectedFishList.slice(0, 5).map((sf, i) => {
        const src = getPrimaryImageSource(sf);
        return `<div class="tm-stack-thumb" style="z-index:${10-i};transform:translateX(${i*-10}px) rotate(${(i-2)*2}deg)">${src ? `<img src="${src}" alt="">` : '<div class="tm-thumb-placeholder">LTC</div>'}</div>`;
      }).join('');
      const extra = selectedFishList.length > 5 ? `<div class="tm-stack-more">+${selectedFishList.length - 5}</div>` : '';
      const firstNames = selectedFishList.slice(0, 3).map(f => L(f, 'name')).join(', ');
      const nameTail = selectedFishList.length > 3 ? ` and ${selectedFishList.length - 3} more` : '';
      statusBar.innerHTML = `
        <div class="tm-status tm-status-active">
          <div class="tm-status-stack">${thumbStack}${extra}</div>
          <div class="tm-status-copy">
            <span>HOLDING ${selectedFishList.length} FISH</span>
            <strong>${firstNames}${nameTail}</strong>
            <em>Tap any tank below to drop them all — tap a fish again to unselect</em>
          </div>
          <button type="button" class="tm-status-cancel" onclick="ltcFx.jelly(this);tankMoverClearSelection()">Cancel all</button>
        </div>`;
    } else {
      statusBar.innerHTML = `<div class="tm-status tm-status-idle"><span class="tm-idle-dot"></span>Tap fish to pick them up. You can pick as many as you want. Then tap a tank column to drop them all at once.</div>`;
    }
  }
  const columnsHtml = [];
  let colorIdx = 0;
  if(noTankCount > 0){
    columnsHtml.push(buildTankColumn('zzz_notank', 'No tank assigned', FISH.filter(f => f.inStock && !String(f.tankCode || '').trim()), { warn: true, colorIdx: -1 }, selectedSet));
  }
  tankCodes.forEach(code => {
    const items = FISH.filter(f => String(f.tankCode || '').trim().toUpperCase() === code);
    columnsHtml.push(buildTankColumn(code, `Tank ${code}`, items, { colorIdx: colorIdx++ }, selectedSet));
  });
  columnsHtml.push(`
    <div class="tm-column tm-column-add">
      <button type="button" class="tm-add-tank" onclick="ltcFx.jelly(this);tankMoverAddTank()">
        <span class="tm-add-icon">+</span>
        <span>Add new tank</span>
        <small>Use codes like "A", "B-Top", "QT-1"</small>
      </button>
    </div>`);
  root.innerHTML = `<div class="tank-mover-grid">${columnsHtml.join('')}</div>`;
}
// v0.128 — rainbow palette for tank column accent stripes so the grid reads
// as a colorful catalog of tanks instead of a wall of aqua.
const TM_TANK_COLORS = [
  '#7bcfff','#5eebc8','#ffcb5e','#ff9bb6','#c8b2ff',
  '#ff9a8a','#b8e860','#ffa850','#5ed4dc','#e870c8',
  '#f06060','#ffd84a','#80c8ff','#8c70c8','#e8c450'
];

// v0.163 — Tank room visual helpers. Each tank mover column now has
// a sloshing-water tank visual on top with drifting fish silhouettes
// derived from the actual fish in that tank. Ported from the
// LTC_Tank_Room_Layout_v3.html prototype that Chris approved.
//
// IMPORTANT: the fish chip border + left accent stripe styling
// (.tm-fish-chip) uses --cat-accent (the species' category color)
// already in css/style.css around line 8771. That pattern is preserved
// — Chris reminded us to keep the chip border colored by category, and
// it always has been since v0.131.
function tmHexToRgb(hex){
  hex = String(hex || '').trim().replace('#','');
  if(hex.length === 3) hex = hex.split('').map(c => c+c).join('');
  if(hex.length !== 6) return '123,207,255';
  return parseInt(hex.substr(0,2),16) + ',' + parseInt(hex.substr(2,2),16) + ',' + parseInt(hex.substr(4,2),16);
}
function tmFishHash(id){
  let h = 0;
  const s = String(id || '');
  for(let i = 0; i < s.length; i++) h = ((h<<5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function tmFishSvg(rgbStr, variant){
  const fill = 'rgba('+rgbStr+',0.92)';
  const stroke = 'rgba(255,255,255,0.65)';
  if(variant === 1){
    return '<svg viewBox="0 0 30 18" xmlns="http://www.w3.org/2000/svg">'
      +'<circle cx="15" cy="9" r="6.5" fill="'+fill+'" stroke="'+stroke+'" stroke-width="0.7"/>'
      +'<path d="M8 9 L2 4 L4 9 L2 14 Z" fill="'+fill+'" stroke="'+stroke+'" stroke-width="0.7"/>'
      +'<path d="M15 2 L17 0 L17 3 Z" fill="'+fill+'"/>'
      +'<circle cx="19" cy="8" r="0.9" fill="#000"/>'
      +'</svg>';
  }
  if(variant === 2){
    return '<svg viewBox="0 0 30 18" xmlns="http://www.w3.org/2000/svg">'
      +'<ellipse cx="16" cy="9" rx="11" ry="3" fill="'+fill+'" stroke="'+stroke+'" stroke-width="0.7"/>'
      +'<path d="M5 9 L0 5 L2 9 L0 13 Z" fill="'+fill+'" stroke="'+stroke+'" stroke-width="0.7"/>'
      +'<circle cx="23" cy="8.5" r="0.8" fill="#000"/>'
      +'</svg>';
  }
  return '<svg viewBox="0 0 30 18" xmlns="http://www.w3.org/2000/svg">'
    +'<ellipse cx="16" cy="9" rx="9" ry="5" fill="'+fill+'" stroke="'+stroke+'" stroke-width="0.7"/>'
    +'<path d="M7 9 L1 3 L3 9 L1 15 Z" fill="'+fill+'" stroke="'+stroke+'" stroke-width="0.7"/>'
    +'<path d="M14 4 L17 0 L19 4 Z" fill="'+fill+'" stroke="'+stroke+'" stroke-width="0.6"/>'
    +'<circle cx="21" cy="8" r="0.9" fill="#000"/>'
    +'</svg>';
}
function tmBuildTankVis(key, label, items, accentRgb){
  // Show up to 6 fish silhouettes, derived from the actual fish in
  // this tank. Each fish gets its position, swim speed, and SVG variant
  // from a deterministic hash of its id, so they don't reshuffle between
  // renders. Each fish is colored by its CATEGORY color so a tank with
  // tangs has blue silhouettes, a tank with wrasses has purple, etc.
  const visibleFish = items.slice(0, 6);
  let fishLayer = '';
  visibleFish.forEach(item => {
    const hash = tmFishHash(item.id);
    const depth = 35 + (hash % 50);
    const dur = 9 + (hash % 9);
    const delay = -((hash >> 3) % 12);
    const fishHex = (typeof CATEGORY_HEX !== 'undefined' && CATEGORY_HEX[item.category]) || '#7bcfff';
    const fishRgb = tmHexToRgb(fishHex);
    const variant = hash % 3;
    fishLayer += '<div class="tm-tk-fish-swim" style="top:'+depth+'%;--dur:'+dur+'s;--delay:'+delay+'s">'+tmFishSvg(fishRgb, variant)+'</div>';
  });
  const isNoTank = key === 'zzz_notank';
  const cleanLabel = String(label || '').replace(/^Tank\s+/i, '');
  const letter = isNoTank ? '?' : (cleanLabel.length <= 3 ? cleanLabel : cleanLabel.charAt(0)).toUpperCase();
  const tankName = isNoTank ? 'No tank' : cleanLabel;
  return '<div class="tm-tank-vis" style="--tk-color:'+accentRgb+'">'
    +'<div class="tm-tk-water">'
      +'<div class="tm-tk-water-bg"></div>'
      +'<div class="tm-tk-caustics"></div>'
      +'<div class="tm-tk-slosh tm-tk-slosh-1"></div>'
      +'<div class="tm-tk-slosh tm-tk-slosh-2"></div>'
      +'<div class="tm-tk-surface"></div>'
    +'</div>'
    +'<div class="tm-tk-fish-layer">'+fishLayer+'</div>'
    +'<div class="tm-tk-bubble" style="left:18%;--bdur:6s;--bdelay:0s"></div>'
    +'<div class="tm-tk-bubble" style="left:38%;--bdur:7.5s;--bdelay:2.4s;width:5px;height:5px"></div>'
    +'<div class="tm-tk-bubble" style="left:58%;--bdur:6.5s;--bdelay:4.1s"></div>'
    +'<div class="tm-tk-bubble" style="left:78%;--bdur:8s;--bdelay:1.3s;width:3px;height:3px"></div>'
    +'<div class="tm-tk-bubble" style="left:28%;--bdur:7s;--bdelay:5.5s;width:3px;height:3px"></div>'
    +'<div class="tm-tk-gloss"></div>'
    +'<div class="tm-tk-gloss-vert"></div>'
    +'<div class="tm-tk-letter">'+letter+'</div>'
    +'<div class="tm-tk-count">'+items.length+' FISH</div>'
    +'<div class="tm-tk-name">'+tankName+'</div>'
  +'</div>';
}

function buildTankColumn(key, label, items, opts={}, selectedSet=new Set()){
  const hasSelection = selectedSet.size > 0;
  const isDropTarget = hasSelection;
  const tone = opts.warn ? 'tm-warn' : '';
  const accent = opts.warn ? '#ff9a8a' : TM_TANK_COLORS[((opts.colorIdx|0) % TM_TANK_COLORS.length + TM_TANK_COLORS.length) % TM_TANK_COLORS.length];
  const accentRgb = tmHexToRgb(accent);
  const dropAction = key === 'zzz_notank' ? 'tankMoverDropToNoTank()' : `tankMoverDropToTank('${String(key).replace(/'/g, "\\'")}')`;
  const fishHtml = items.length ? items.map(item => {
    const isSelected = selectedSet.has(item.id);
    const photoSrc = getPrimaryImageSource(item);
    const catClass = catColorClass(item.category) || 'cat-default';
    return `<button type="button" class="tm-fish-chip ${catClass} ${isSelected ? 'is-selected' : ''}" draggable="true" data-fish-id="${item.id}" onclick="event.stopPropagation();tankMoverPickFish('${item.id}')">
      <div class="tm-chip-thumb">${photoSrc ? `<img src="${photoSrc}" alt="" loading="lazy">` : '<div class="tm-thumb-placeholder">LTC</div>'}</div>
      <div class="tm-chip-name">${L(item, 'name')}</div>
      ${isSelected ? '<span class="tm-chip-check">✓</span>' : ''}
      ${item.quarantine ? '<span class="tm-chip-tag tm-chip-tag-amber">QT</span>' : ''}
      ${item.reserved ? '<span class="tm-chip-tag tm-chip-tag-purple">HELD</span>' : ''}
    </button>`;
  }).join('') : `<div class="tm-empty">No fish here yet</div>`;
  const clickAttr = isDropTarget ? ` onclick="event.stopPropagation();ltcFx.bubbles(this);${dropAction}"` : '';
  return `<div class="tm-column ${tone} ${isDropTarget ? 'is-drop-active' : ''}" data-tank-key="${key}" style="--tm-accent:${accent}"${clickAttr}>
    ${tmBuildTankVis(key, label, items, accentRgb)}
    <div class="tm-column-body">${fishHtml}</div>
    ${isDropTarget ? '<div class="tm-drop-hint">Tap to drop here</div>' : ''}
  </div>`;
}
function tankMoverPickFish(id){
  if(!Array.isArray(state.tankMoverSelectedIds)) state.tankMoverSelectedIds = [];
  const idx = state.tankMoverSelectedIds.indexOf(id);
  if(idx >= 0){
    state.tankMoverSelectedIds.splice(idx, 1);
  } else {
    state.tankMoverSelectedIds.push(id);
  }
  renderTankMover();
}
function tankMoverClearSelection(){
  state.tankMoverSelectedIds = [];
  renderTankMover();
}
function tankMoverDropToTank(code, explicitIds){
  let ids;
  if(Array.isArray(explicitIds) && explicitIds.length){
    ids = explicitIds.slice();
  } else {
    ids = Array.isArray(state.tankMoverSelectedIds) ? state.tankMoverSelectedIds.slice() : [];
  }
  if(!ids.length) return;
  const cleanCode = String(code).trim().toUpperCase();
  // v0.164 — make sure this tank is in the persisted list
  registerKnownTank(cleanCode);
  let moved = 0;
  ids.forEach(fishId => {
    const fish = FISH.find(f => f.id === fishId);
    if(!fish) return;
    if(fish.tankCode && fish.tankCode.toUpperCase() === cleanCode) return;
    pushStaffHistory(fish, `moved to Tank ${cleanCode}`);
    fish.tankCode = cleanCode;
    touchStaffRecord(fish, 'tank-move');
    moved++;
  });
  persistStaffEdits();
  if(moved === 0) showToast(`Already in Tank ${cleanCode}`);
  else if(moved === 1){
    const first = FISH.find(f => f.id === ids[0]);
    showToast(`${first ? L(first,'name') : 'Fish'} moved to Tank ${cleanCode}`);
  } else {
    showToast(`${moved} fish moved to Tank ${cleanCode}`);
  }
  playClick();
  state.tankMoverSelectedIds = [];
  renderTankMover();
  renderInventoryManager();
  render();
}
function tankMoverDropToNoTank(explicitIds){
  let ids;
  if(Array.isArray(explicitIds) && explicitIds.length){
    ids = explicitIds.slice();
  } else {
    ids = Array.isArray(state.tankMoverSelectedIds) ? state.tankMoverSelectedIds.slice() : [];
  }
  if(!ids.length) return;
  let moved = 0;
  ids.forEach(fishId => {
    const fish = FISH.find(f => f.id === fishId);
    if(!fish) return;
    pushStaffHistory(fish, 'unassigned tank');
    fish.tankCode = '';
    touchStaffRecord(fish, 'tank-clear');
    moved++;
  });
  persistStaffEdits();
  showToast(moved === 1 ? 'Fish unassigned from tank' : `${moved} fish unassigned`);
  playClick();
  state.tankMoverSelectedIds = [];
  renderTankMover();
  renderInventoryManager();
  render();
}

// v0.131 — Tank Mover drag-and-drop. Document-level delegation so it
// works even after every renderTankMover() rebuild. If the dragged fish
// is part of the current tap-selection, drop the entire selection;
// otherwise drop just the dragged fish.
(function setupTankMoverDnD(){
  let dragId = null;
  document.addEventListener('dragstart', function(e){
    const chip = e.target.closest && e.target.closest('.tm-fish-chip');
    if(!chip) return;
    dragId = chip.dataset.fishId;
    chip.classList.add('is-dragging');
    if(e.dataTransfer){
      try { e.dataTransfer.setData('text/plain', dragId); } catch(_){}
      e.dataTransfer.effectAllowed = 'move';
    }
  });
  document.addEventListener('dragend', function(e){
    const chip = e.target.closest && e.target.closest('.tm-fish-chip');
    if(chip) chip.classList.remove('is-dragging');
    document.querySelectorAll('.tm-column.is-drag-over').forEach(c => c.classList.remove('is-drag-over'));
    dragId = null;
  });
  document.addEventListener('dragover', function(e){
    const col = e.target.closest && e.target.closest('.tm-column');
    if(!col || !dragId) return;
    if(col.classList.contains('tm-column-add')) return;
    e.preventDefault();
    if(e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    if(!col.classList.contains('is-drag-over')) col.classList.add('is-drag-over');
  });
  document.addEventListener('dragleave', function(e){
    const col = e.target.closest && e.target.closest('.tm-column');
    if(col && !col.contains(e.relatedTarget)) col.classList.remove('is-drag-over');
  });
  document.addEventListener('drop', function(e){
    const col = e.target.closest && e.target.closest('.tm-column');
    if(!col || !dragId) return;
    if(col.classList.contains('tm-column-add')) return;
    e.preventDefault();
    col.classList.remove('is-drag-over');
    const key = col.dataset.tankKey;
    if(!key) return;
    const sel = Array.isArray(state.tankMoverSelectedIds) ? state.tankMoverSelectedIds : [];
    const ids = sel.includes(dragId) ? sel.slice() : [dragId];
    if(key === 'zzz_notank') tankMoverDropToNoTank(ids);
    else tankMoverDropToTank(key, ids);
    try { ltcFx.bubbles(col); } catch(_){}
    dragId = null;
  });
})();
function tankMoverAddTank(){
  showInputModal('Add new tank', 'Enter a short tank code or name. For multi-level tanks, use formats like "A-Top", "A-Mid", "A-Bot".', [
    {label:'Tank code', type:'text', value:'', placeholder:'e.g. A, B-Top, QT-1'}
  ], ([code]) => {
    const trimmed = String(code || '').trim().toUpperCase();
    if(!trimmed) return showToast('Enter a tank code');
    // v0.164 — register in persisted knownTanks list so it survives
    // page reloads and doesn't disappear when empty.
    ensureKnownTanksInitialized();
    if(state.knownTanks.includes(trimmed)){
      showToast(`Tank ${trimmed} already exists`);
      return;
    }
    registerKnownTank(trimmed);
    renderTankMover();
    showToast(`Tank ${trimmed} added`);
  });
}

function renderInventoryManager(){
  const root = document.getElementById('inventoryContent');
  if(!root) return;
  const overlay = document.getElementById('inventoryOverlay');
  if(overlay && !overlay.classList.contains('show')) return;
  cancelInventoryRenderQueue();
  const query = (document.getElementById('inventorySearch')?.value || '').trim().toLowerCase();
  const status = document.getElementById('inventoryStatusFilter')?.value || 'all';
  const category = document.getElementById('inventoryCategoryFilter')?.value || 'all';
  const tankFilter = state.inventoryTankFilter || '';
  const hasActiveFilters = !!query || status !== 'all' || category !== 'all' || !!tankFilter;
  if(hasActiveFilters) state.inventoryManagerMode = 'catalog';
  let items = FISH.slice();
  if(query){
    items = items.filter(item => inventorySearchText(item).includes(query));
  }
  if(tankFilter){
    items = items.filter(item => String(item.tankCode || '').trim().toUpperCase() === tankFilter.toUpperCase());
  }
  if(category !== 'all') items = items.filter(item => item.category === category);
  if(status === 'instock') items = items.filter(item => item.inStock);
  else if(status === 'out') items = items.filter(item => !item.inStock);
  else if(status === 'quarantine') items = items.filter(item => item.quarantine);
  else if(status === 'reserved') items = items.filter(item => item.reserved);
  else if(status === 'notank') items = items.filter(item => hasNoAssignedTank(item));
  else if(status === 'missingspecies') items = items.filter(item => hasMissingSpeciesCoreData(item));
  else if(status === 'missingstore') items = items.filter(item => hasMissingStoreData(item));
  else if(status === 'recent') items = items.filter(item => Array.isArray(item[STAFF_HISTORY_FIELD]) && item[STAFF_HISTORY_FIELD].length);
  renderInventoryQuickFilters(items);
  items.sort((a,b) => a.name.localeCompare(b.name));
  const token = inventoryRenderToken;
  if(state.inventoryManagerMode !== 'catalog' && !hasActiveFilters){
    updateInventoryToolbarState(false);
    root.innerHTML = inventoryOverviewTemplate(FISH);
    bindStaffHomeToggles(root);
    bindPufferRandomizer(root);
    return;
  }
  updateInventoryToolbarState(true);
  root.innerHTML = `${inventoryCatalogSummaryTemplate(items, status, category, query)}<div class="inventory-rows-v124" id="inventoryGrid"></div>`;
  const grid = document.getElementById('inventoryGrid');
  if(!grid) return;
  if(!items.length){
    grid.innerHTML = '<div class="inventory-empty-state">No inventory entries match this view.</div>';
    return;
  }
  // V0.125 — grouped render. Items are bucketed into tank/category/none
  // groups with collapsible headers. Synchronous render is fine because
  // the slim row markup is ~12 nodes per fish, so even 500 fish is under
  // 6k nodes total. Photo hydration happens once at the end.
  const groupBy = state.inventoryGroupBy || 'category';
  const groups = groupInventoryItems(items, groupBy);
  const collapsed = state.inventoryCollapsedGroups || new Set();
  grid.innerHTML = groups.map(g => {
    const isCollapsed = collapsed.has(g.key);
    const rowsHtml = g.items.map(item => inventoryCardTemplate(item)).join('');
    const escapedKey = String(g.key).replace(/'/g, "\\'");
    return `<section class="inv-group${isCollapsed ? ' is-collapsed' : ''}" data-inv-group="${g.key}">
      <button type="button" class="inv-group-head" onclick="toggleInventoryGroupCollapse('${escapedKey}')">
        <span class="inv-group-chev">▾</span>
        <strong class="inv-group-name">${g.label}</strong>
        <span class="inv-group-count">${g.items.length}</span>
      </button>
      <div class="inv-group-body">${rowsHtml}</div>
    </section>`;
  }).join('');
  hydrateInventoryPhotos(items);
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
  // v0.153 — light mode is broken (background goes to white which Chris
  // explicitly does NOT want, and several inherited rules look wrong).
  // Disabled until a proper light mode pass can be done. The toggle
  // button itself is hidden in index.html. This guard ensures any
  // accidental call (or stale persisted state) doesn't enable it.
  document.body.classList.remove('light-mode');
  return;
}
// Force dark on every load — wipes any previously persisted light mode
if(typeof document !== 'undefined' && document.body){
  document.body.classList.remove('light-mode');
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
window.addEventListener('resize', ()=>{ updateCategoryRailUI(); updateBundleRailUI(); syncDetailVideoLayer(); syncModalCloseButton(); syncModalCloseButtonPosition(); });
window.addEventListener('orientationchange', ()=>setTimeout(syncModalCloseButtonPosition, 120), {passive:true});
document.addEventListener('DOMContentLoaded', () => {
  document.title = `Low Tide Corals & Aquatics — Fish Browser ${APP_VERSION.toUpperCase()}`;
  syncModeChrome();
  updateCategoryRailUI();
  [
    // v0.171 — inventory backdrop click goes through inventoryTopbarBack
    // so it does the same context-sensitive thing as the topbar Back
    // button: in catalog mode (a submenu like "full catalog" or "in
    // stock fish") it goes back to the inventory home; only at the
    // home view does an outside click actually close the overlay.
    // Was previously calling closeInventoryManager directly, which
    // exited the entire inventory from inside any submenu — Chris
    // flagged this as broken navigation.
    ['inventoryOverlay', () => window.inventoryTopbarBack && window.inventoryTopbarBack()],
    ['foodsOverlay', closeFoodSettings],
    ['analyticsOverlay', closeAnalytics],
    ['compareOverlay', closeCompare],
    ['staffOverlay', closeStaffLogin],
    ['inputModalOverlay', closeInputModal],
    ['inventoryHistoryOverlay', closeInventoryHistoryOverlay],
    // v0.174 — backdrop audit. Three overlays were never registered
    // for backdrop click at all (clicking outside did literally
    // nothing). Receive flow now uses context-sensitive back: from
    // step 2 it goes back to step 1, from step 1 it closes. Fish
    // modal and tank mover get straight close.
    ['receiveFlowOverlay', () => window.receiveFlow && window.receiveFlow.back && window.receiveFlow.back()],
    ['fishOverlay', closeFishModal],
    ['tankMoverOverlay', closeTankMover]
  ].forEach(([id, handler]) => {
    const overlay = document.getElementById(id);
    if(!overlay || overlay.dataset.backdropCloseBound) return;
    overlay.addEventListener('click', e => {
      if(e.target.id === id){
        playClose();
        handler();
      }
    });
    overlay.dataset.backdropCloseBound = '1';
  });
});

// v0.174 — Crab easter egg.
// Approved by Chris from Animation Experiments 03 ("That crab is slick
// I like it... use that little guy sprinkled around all over please,
// but not too much just sprinkled"). Spawns a crab that scuttles in
// from one side of the screen, hangs out briefly, then scuttles off.
//
// Sprinkle rules per Chris:
//   - Only on a small set of in-place staff interactions (not on
//     anything that opens a new overlay/menu — the menu would obscure
//     the crab anyway)
//   - 25% spawn chance per qualifying click — sprinkled, not constant
//   - Staff mode only (this is an employee easter egg)
function spawnLtcCrab(){
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // Random Y in the bottom 60% of the viewport so the crab doesn't
  // overlap the topbar / hero area.
  const yPct = (35 + Math.random() * 50).toFixed(1) + 'vh';
  // Random direction — sometimes left-to-right, sometimes right-to-left.
  const ltr = Math.random() > 0.5;
  const crab = document.createElement('div');
  crab.className = 'ltc-crab-runner';
  if(ltr){
    crab.style.setProperty('--crab-start-x', '-60px');
    crab.style.setProperty('--crab-mid-x',   (15 + Math.random() * 60) + '%');
    crab.style.setProperty('--crab-end-x',   '110%');
  } else {
    crab.style.setProperty('--crab-start-x', 'calc(100% + 20px)');
    crab.style.setProperty('--crab-mid-x',   (25 + Math.random() * 60) + '%');
    crab.style.setProperty('--crab-end-x',   '-60px');
    crab.dataset.dir = 'rtl';
  }
  crab.style.setProperty('--crab-y', yPct);
  crab.innerHTML = '<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"' + (ltr ? '' : ' style="transform:scaleX(-1)"') + '>'
    + '<line class="crab-leg crab-leg-1" x1="14" y1="20" x2="2"  y2="10" stroke="#d04860" stroke-width="2.4" stroke-linecap="round"/>'
    + '<line class="crab-leg crab-leg-2" x1="16" y1="22" x2="4"  y2="22" stroke="#d04860" stroke-width="2.4" stroke-linecap="round"/>'
    + '<line class="crab-leg crab-leg-3" x1="18" y1="24" x2="6"  y2="32" stroke="#d04860" stroke-width="2.4" stroke-linecap="round"/>'
    + '<line class="crab-leg crab-leg-4" x1="22" y1="26" x2="14" y2="36" stroke="#d04860" stroke-width="2.4" stroke-linecap="round"/>'
    + '<line class="crab-leg crab-leg-5" x1="46" y1="20" x2="58" y2="10" stroke="#d04860" stroke-width="2.4" stroke-linecap="round"/>'
    + '<line class="crab-leg crab-leg-6" x1="44" y1="22" x2="56" y2="22" stroke="#d04860" stroke-width="2.4" stroke-linecap="round"/>'
    + '<line class="crab-leg crab-leg-7" x1="42" y1="24" x2="54" y2="32" stroke="#d04860" stroke-width="2.4" stroke-linecap="round"/>'
    + '<line class="crab-leg crab-leg-8" x1="38" y1="26" x2="46" y2="36" stroke="#d04860" stroke-width="2.4" stroke-linecap="round"/>'
    + '<circle cx="6"  cy="6" r="6" fill="#e85060" stroke="#7a1020" stroke-width="1.5"/>'
    + '<path d="M2 4 L10 4 M2 8 L10 8" stroke="#7a1020" stroke-width="1.4" stroke-linecap="round"/>'
    + '<circle cx="54" cy="6" r="6" fill="#e85060" stroke="#7a1020" stroke-width="1.5"/>'
    + '<path d="M50 4 L58 4 M50 8 L58 8" stroke="#7a1020" stroke-width="1.4" stroke-linecap="round"/>'
    + '<ellipse class="crab-body" cx="30" cy="22" rx="14" ry="9" fill="#e85060" stroke="#7a1020" stroke-width="1.8"/>'
    + '<ellipse cx="28" cy="20" rx="9" ry="4" fill="rgba(255,140,150,0.5)"/>'
    + '<circle cx="24" cy="16" r="2"   fill="#fff" stroke="#7a1020" stroke-width="0.8"/>'
    + '<circle cx="36" cy="16" r="2"   fill="#fff" stroke="#7a1020" stroke-width="0.8"/>'
    + '<circle cx="24" cy="16" r="0.9" fill="#000"/>'
    + '<circle cx="36" cy="16" r="0.9" fill="#000"/>'
    + '</svg>';
  document.body.appendChild(crab);
  // v0.175 — cleanup pushed from 3.6s to 7s to match the new 6.8s
  // animation duration (was 3.4s before slowdown).
  setTimeout(() => { if(crab.parentNode) crab.parentNode.removeChild(crab); }, 7000);
}
window.spawnLtcCrab = spawnLtcCrab;

// Throttle so the crab doesn't spawn twice in a row from a single
// click bubble + select-change combo.
var __ltcCrabLastSpawn = 0;
document.addEventListener('click', function(e){
  if(!state.staffMode) return; // employee easter egg only
  // Only fire on a curated set of in-place staff interactions —
  // these are things that re-render in place rather than opening a
  // modal/overlay. Per Chris: "where you wouldn't get a new menu
  // for clicking it. So maybe when you click a drop down menu or
  // something". 7 trigger types total as of v0.175.
  var t = e.target.closest(
    '.inventory-chip-filter,'      // 1. status pill row chips
    + '.sh-stat-card-btn,'         // 2. staff hub stat tiles
    + '.sh-recent-pill,'           // 3. recent activity toggle pill
    + '.sh-tank-chip,'             // 4. tanks-with-fish orbs
    + '[data-sh-toggle],'          // 5. any sh-toggle expand
    + '#inventoryStatusFilter,'    // 6a. inventory status dropdown
    + '#inventoryCategoryFilter,'  // 6b. inventory category dropdown
    + '#inventorySearch'           // 7. inventory search input click (v0.175)
  );
  if(!t) return;
  // For the search input, only spawn the crab if it's empty (Chris:
  // "easter egg for when you click search sometimes too BEFORE u type
  // something in"). Also avoid spawning while the user is mid-typing.
  if(t.id === 'inventorySearch' && t.value && t.value.length > 0) return;
  var now = Date.now();
  if(now - __ltcCrabLastSpawn < 1200) return;
  if(Math.random() < 0.25){
    __ltcCrabLastSpawn = now;
    spawnLtcCrab();
  }
});
