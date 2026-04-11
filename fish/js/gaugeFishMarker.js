/* ============================================================
   GAUGE FISH MARKER — V0.093
   24-variant SVG library with type matching for compatibility
   gauge markers. Replaces the round dot marker with a fish that
   matches the species' category, with a swim-in animation and
   bubble trail.

   Public API:
     injectFishMarkers(species)  — call after modal HTML is set
   ============================================================ */
(function(){
'use strict';

// 24 fish variants — 14 kept from the original 20-variant library
// (Betta, Tang, Swordfish, Jellyfish kept from overlapping archetypes;
// Pufferfish, Angelfish, Seahorse, Lionfish, Manta, Eel, Goldfish,
// Triggerfish, Pixel, Arrow as singletons) + 10 new archetypes drawn
// for V0.093 (Goby, Slender Schooler, Crab, Shrimp, Starfish, Urchin,
// Anemone, Clam, Snail, Boxfish).
var FISH_LIB = {
v2:{cls:'v2',svg:'<svg viewBox="0 0 54 44"><g class="body"><circle cx="27" cy="22" r="15"/><path d="M27 5 L29 11 L25 11 Z"/><path d="M42 11 L37 15 L39 19 Z"/><path d="M45 22 L38 22 L42 27 Z"/><path d="M40 34 L36 28 L33 32 Z"/><path d="M27 40 L25 33 L29 33 Z"/><path d="M14 35 L18 30 L20 34 Z"/><path d="M9 22 L16 22 L12 27 Z"/><path d="M12 11 L17 15 L15 19 Z"/><circle class="eye" cx="34" cy="18" r="2.2"/><circle class="pupil" cx="34.5" cy="18" r="1"/></g><g class="tail"><path d="M12 22 L2 14 L5 22 L2 30 Z"/></g></svg>'},
v3:{cls:'v3',svg:'<svg viewBox="0 0 48 56"><g class="topFin"><path d="M24 12 Q20 2 18 -4 L26 -4 Q27 4 28 12 Z"/></g><g class="botFin"><path d="M24 44 Q20 52 18 60 L26 60 Q27 52 28 44 Z"/></g><path class="body" d="M24 8 L40 28 L24 48 L12 28 Z"/><g class="tail"><path d="M14 28 L2 18 L6 28 L2 38 Z"/></g><circle class="eye" cx="30" cy="25" r="2.2"/><circle class="pupil" cx="30.5" cy="25" r="1"/></svg>'},
v4:{cls:'v4',svg:'<svg viewBox="0 0 64 46"><g class="veil"><path d="M18 23 Q2 6 -4 10 Q6 20 -2 34 Q4 42 18 23 Z"/></g><ellipse class="body" cx="36" cy="23" rx="16" ry="10"/><g class="ventral"><path d="M34 32 Q30 44 34 46 Q40 42 42 32 Z"/></g><path d="M30 13 Q26 2 32 4 Q36 8 38 13 Z"/><circle class="eye" cx="44" cy="20" r="2.2"/><circle class="pupil" cx="44.5" cy="20" r="1"/></svg>'},
v7:{cls:'v7',svg:'<svg viewBox="0 0 36 54"><path class="body" d="M20 6 Q28 4 28 12 Q28 18 22 18 Q14 20 16 28 Q20 34 14 38 Q8 44 12 50 Q18 52 20 48"/><path d="M20 6 Q26 8 28 12 L22 14 Q18 10 20 6 Z"/><path d="M22 16 L30 14 L28 20 Z"/><g class="curl"><path d="M12 46 Q6 50 8 54 Q14 54 14 50" fill="none" stroke-width="3"/></g><circle class="eye" cx="24" cy="11" r="1.6"/><circle class="pupil" cx="24" cy="11" r=".7"/></svg>'},
v8:{cls:'v8',svg:'<svg viewBox="0 0 62 48"><g class="spines"><path d="M32 24 L14 4 L20 8 L22 2 L26 10 L30 4 L32 12 Z"/><path d="M32 24 L14 44 L20 40 L22 46 L26 38 L30 44 L32 36 Z"/><path d="M34 24 L56 10 L50 14 L54 20 L46 18 L50 26 L42 22 Z"/><path d="M34 24 L56 38 L50 34 L54 28 L46 30 L50 22 L42 26 Z"/></g><ellipse class="body" cx="32" cy="24" rx="12" ry="8"/><g class="tail"><path d="M20 24 L10 14 L14 24 L10 34 Z"/></g><circle class="eye" cx="38" cy="22" r="1.8"/><circle class="pupil" cx="38.3" cy="22" r=".9"/></svg>'},
v9:{cls:'v9',svg:'<svg viewBox="0 0 66 36"><g class="wingL"><path d="M33 18 Q14 4 2 10 Q18 16 22 22 Q16 28 4 30 Q20 32 33 22 Z"/></g><g class="wingR"><path d="M33 18 Q52 4 64 10 Q48 16 44 22 Q50 28 62 30 Q46 32 33 22 Z"/></g><ellipse class="body" cx="33" cy="17" rx="6" ry="9"/><circle class="eye" cx="30" cy="13" r="1.4"/><circle class="eye" cx="36" cy="13" r="1.4"/></svg>'},
v10:{cls:'v10',svg:'<svg viewBox="0 0 74 30"><path class="body" d="M6 15 Q18 4 30 15 Q42 26 54 15 Q62 8 70 12 L70 18 Q62 22 54 18 Q42 10 30 18 Q18 26 6 22 Z"/><circle class="eye" cx="64" cy="13" r="1.6"/><circle class="pupil" cx="64.3" cy="13" r=".8"/></svg>'},
v11:{cls:'v11',svg:'<svg viewBox="0 0 74 32"><g class="tail"><path d="M14 16 L2 2 L6 16 L2 30 Z"/></g><path class="body" d="M10 16 Q22 6 46 12 Q52 16 46 20 Q22 26 10 16 Z"/><path d="M46 16 L72 14 L72 18 L46 17 Z"/><path d="M28 9 L34 2 L36 9 Z"/><path d="M28 23 L32 30 L36 23 Z"/><circle class="eye" cx="42" cy="14" r="1.6"/><circle class="pupil" cx="42.3" cy="14" r=".8"/></svg>'},
v12:{cls:'v12',svg:'<svg viewBox="0 0 52 54"><path class="dome" d="M6 22 Q6 4 26 4 Q46 4 46 22 Q46 28 42 28 L10 28 Q6 28 6 22 Z"/><path class="ten" d="M12 30 Q8 42 14 52" fill="none" stroke-width="2.2"/><path class="ten" d="M26 30 Q22 44 28 54" fill="none" stroke-width="2.2"/><path class="ten" d="M40 30 Q44 42 38 52" fill="none" stroke-width="2.2"/><path class="ten" d="M20 30 Q18 44 22 52" fill="none" stroke-width="2.2"/><path class="ten" d="M34 30 Q36 44 32 54" fill="none" stroke-width="2.2"/></svg>'},
v14:{cls:'v14',svg:'<svg viewBox="0 0 58 44"><g class="tail"><path d="M14 22 L2 8 L5 22 L2 36 Z"/></g><path class="body" d="M14 22 Q14 6 32 6 Q48 8 48 22 Q48 36 32 38 Q14 38 14 22 Z"/><path d="M28 6 Q30 -2 38 0 Q38 6 36 8 Z"/><path d="M28 38 Q30 46 38 44 Q38 38 36 36 Z"/><circle class="eye" cx="40" cy="19" r="2"/><circle class="pupil" cx="40.3" cy="19" r=".9"/></svg>'},
v15:{cls:'v15',svg:'<svg viewBox="0 0 60 44"><g class="tail1"><path d="M16 22 Q2 6 -2 12 Q6 18 2 22 Q6 26 -2 32 Q2 38 16 22 Z"/></g><g class="tail2"><path d="M16 22 Q4 12 0 18 Q8 22 0 26 Q4 32 16 22 Z" opacity=".7"/></g><ellipse class="body" cx="34" cy="22" rx="16" ry="13"/><circle class="eye" cx="42" cy="20" r="2.2"/><circle class="pupil" cx="42.5" cy="20" r="1"/></svg>'},
v16:{cls:'v16',svg:'<svg viewBox="0 0 58 42"><g class="topFin"><path d="M22 14 L18 2 L32 4 L32 14 Z"/></g><g class="botFin"><path d="M22 28 L18 40 L32 38 L32 28 Z"/></g><path class="body" d="M10 21 L22 8 L44 14 L48 21 L44 28 L22 34 Z"/><g class="tail"><path d="M12 21 L2 10 L6 21 L2 32 Z"/></g><circle class="eye" cx="38" cy="18" r="2"/><circle class="pupil" cx="38.3" cy="18" r=".9"/></svg>'},
v17:{cls:'v17',svg:'<svg viewBox="0 0 56 36" shape-rendering="crispEdges"><g class="tail"><path d="M14 10 L6 4 L6 16 L14 18 Z M14 18 L6 20 L6 32 L14 26 Z"/></g><path class="body" d="M14 8 L42 8 L46 12 L46 24 L42 28 L14 28 Z"/><rect x="34" y="12" width="4" height="4" fill="#fff" stroke="none"/><rect x="36" y="14" width="2" height="2" fill="#04080f" stroke="none"/></svg>'},
v20:{cls:'v20',svg:'<svg viewBox="0 0 58 32"><g class="tail"><path d="M14 16 L2 4 L6 16 L2 28 Z"/></g><path class="body" d="M10 16 L30 4 L50 16 L30 28 Z"/><circle class="eye" cx="36" cy="14" r="1.8"/><circle class="pupil" cx="36.3" cy="14" r=".8"/></svg>'},
v21:{cls:'v21',svg:'<svg viewBox="0 0 60 40"><g class="tail"><path d="M12 22 L2 10 L6 22 L2 34 Z"/></g><path class="body" d="M12 22 Q12 12 22 10 Q38 8 48 14 Q54 20 50 26 Q42 34 24 34 Q12 32 12 22 Z"/><g class="pec"><path d="M34 30 Q40 38 44 30 Q40 26 34 30 Z"/></g><path d="M22 12 L26 4 L30 12 Z"/><circle class="eye" cx="40" cy="16" r="2.6"/><circle class="pupil" cx="40.5" cy="16" r="1.2"/></svg>'},
v22:{cls:'v22',svg:'<svg viewBox="0 0 70 28"><g class="tail"><path d="M16 14 L2 2 L8 14 L2 26 Z"/></g><path class="body" d="M12 14 Q22 6 56 10 Q64 14 56 18 Q22 22 12 14 Z"/><path d="M30 7 L36 2 L38 8 Z"/><path d="M30 21 L34 26 L38 20 Z"/><circle class="eye" cx="54" cy="12" r="1.8"/><circle class="pupil" cx="54.3" cy="12" r=".8"/></svg>'},
v23:{cls:'v23',svg:'<svg viewBox="0 0 64 48"><g class="claws"><path d="M14 22 L2 14 L6 22 L2 30 Z"/><path d="M50 22 L62 14 L58 22 L62 30 Z"/></g><ellipse class="body" cx="32" cy="26" rx="18" ry="11"/><path d="M18 32 L8 44" fill="none"/><path d="M24 34 L18 46" fill="none"/><path d="M40 34 L46 46" fill="none"/><path d="M46 32 L56 44" fill="none"/><path d="M22 18 L16 8" fill="none"/><path d="M42 18 L48 8" fill="none"/><circle class="eye" cx="26" cy="22" r="2"/><circle class="eye" cx="38" cy="22" r="2"/><circle class="pupil" cx="26" cy="22" r=".9"/><circle class="pupil" cx="38" cy="22" r=".9"/></svg>'},
v24:{cls:'v24',svg:'<svg viewBox="0 0 68 40"><path class="bodyShape" d="M14 22 Q8 14 16 8 Q26 4 38 6 Q52 8 56 14 Q58 20 54 24 Q46 28 36 26 Q22 24 14 22 Z"/><path d="M22 10 L22 24" fill="none"/><path d="M30 8 L30 26" fill="none"/><path d="M38 8 L38 26" fill="none"/><path d="M46 10 L46 24" fill="none"/><path d="M14 22 L4 16 L6 26 Z"/><path d="M14 22 L2 24 L6 32 Z"/><g class="ant"><path d="M56 14 Q64 8 66 2" fill="none" stroke-width="1.8"/><path d="M56 16 Q64 14 68 10" fill="none" stroke-width="1.8"/></g><circle class="eye" cx="50" cy="12" r="1.6"/><circle class="pupil" cx="50.3" cy="12" r=".7"/></svg>'},
v25:{cls:'v25',svg:'<svg viewBox="0 0 56 56"><path class="body" d="M28 4 L34 20 L52 22 L38 33 L44 50 L28 40 L12 50 L18 33 L4 22 L22 20 Z"/><circle cx="28" cy="28" r="2.5" fill="#04080f" stroke="none"/><circle cx="28" cy="18" r="1" fill="#04080f" stroke="none"/><circle cx="20" cy="28" r="1" fill="#04080f" stroke="none"/><circle cx="36" cy="28" r="1" fill="#04080f" stroke="none"/></svg>'},
v26:{cls:'v26',svg:'<svg viewBox="0 0 56 56"><g class="spines"><line x1="28" y1="2" x2="28" y2="18"/><line x1="28" y1="38" x2="28" y2="54"/><line x1="2" y1="28" x2="18" y2="28"/><line x1="38" y1="28" x2="54" y2="28"/><line x1="9" y1="9" x2="19" y2="19"/><line x1="37" y1="19" x2="47" y2="9"/><line x1="9" y1="47" x2="19" y2="37"/><line x1="37" y1="37" x2="47" y2="47"/></g><circle class="body" cx="28" cy="28" r="12"/></svg>'},
v27:{cls:'v27',svg:'<svg viewBox="0 0 52 56"><path class="body" d="M14 54 Q10 38 16 32 Q22 28 36 32 Q42 38 38 54 Z"/><path class="ten" d="M16 32 Q12 18 14 8" fill="none" stroke-width="2.4"/><path class="ten" d="M20 30 Q18 14 22 4" fill="none" stroke-width="2.4"/><path class="ten" d="M26 28 Q26 12 28 2" fill="none" stroke-width="2.4"/><path class="ten" d="M32 30 Q34 14 32 4" fill="none" stroke-width="2.4"/><path class="ten" d="M36 32 Q40 18 38 8" fill="none" stroke-width="2.4"/></svg>'},
v28:{cls:'v28',svg:'<svg viewBox="0 0 64 40"><path class="top" d="M6 22 Q10 6 32 6 Q54 6 58 22 Q54 26 32 26 Q10 26 6 22 Z"/><path d="M6 22 Q10 36 32 36 Q54 36 58 22 Q54 20 32 20 Q10 20 6 22 Z"/><path d="M16 10 Q20 22 16 32" fill="none" stroke-width="1.4"/><path d="M24 8 Q28 22 24 34" fill="none" stroke-width="1.4"/><path d="M32 6 L32 36" fill="none" stroke-width="1.4"/><path d="M40 8 Q36 22 40 34" fill="none" stroke-width="1.4"/><path d="M48 10 Q44 22 48 32" fill="none" stroke-width="1.4"/></svg>'},
v29:{cls:'v29',svg:'<svg viewBox="0 0 64 42"><path class="body" d="M6 32 Q4 40 14 40 L50 40 Q58 40 56 32 Q52 24 30 24 Q14 24 6 32 Z"/><circle class="body" cx="34" cy="20" r="14"/><circle cx="34" cy="20" r="9" fill="none" stroke-width="1.6"/><circle cx="34" cy="20" r="5" fill="none" stroke-width="1.6"/><g class="stalk"><path d="M10 28 L6 18" fill="none" stroke-width="2"/><path d="M18 26 L22 14" fill="none" stroke-width="2"/></g><circle class="eye" cx="6" cy="16" r="1.6"/><circle class="eye" cx="22" cy="12" r="1.6"/><circle class="pupil" cx="6" cy="16" r=".7"/><circle class="pupil" cx="22" cy="12" r=".7"/></svg>'},
v30:{cls:'v30',svg:'<svg viewBox="0 0 60 46"><g class="tail"><path d="M12 23 L2 12 L6 23 L2 34 Z"/></g><path class="body" d="M12 14 Q12 8 18 8 L44 8 Q50 8 50 14 L50 32 Q50 38 44 38 L18 38 Q12 38 12 32 Z"/><path d="M28 8 L32 2 L36 8 Z"/><path d="M28 38 L32 44 L36 38 Z"/><circle class="eye" cx="42" cy="18" r="2.4"/><circle class="pupil" cx="42.5" cy="18" r="1.1"/><circle cx="26" cy="22" r="1.2" fill="#04080f" stroke="none"/></svg>'}
};

// Category → icon variant. Falls back to v20 (Minimal Arrow) for unknown.
var CATEGORY_ICON = {
'Tangs':'v14','Rabbitfish':'v14','Surgeonfish':'v14',
'Angelfish':'v3','Butterflyfish':'v3','Bannerfish':'v3',
'Basslets & Dottybacks':'v4','Cardinalfish':'v4','Clownfish':'v4','Damsels':'v4','Wrasses':'v4','Chromis':'v4',
'Anthias':'v22','Dartfish':'v22','Fairy Wrasses':'v22',
'Gobies & Blennies':'v21','Hawkfish':'v21',
'Triggerfish':'v16','Durgeons':'v16',
'Puffers':'v2','Porcupinefish':'v2',
'Predators & Oddballs':'v11',
'Eels':'v10','Morays':'v10',
'Lionfish':'v8','Scorpionfish':'v8','Waspfish':'v8',
'Seahorses':'v7','Pipefish':'v7',
'Crabs':'v23','Shrimp':'v24','Starfish':'v25','Urchins':'v26',
'Anemones':'v27','Clams':'v28','Snails':'v29',
'Boxfish':'v30','Cowfish':'v30','Trunkfish':'v30',
'Jellyfish':'v12',
'Inverts':'v20','Other Fish':'v20'
};

function iconFor(category){
  var key = CATEGORY_ICON[category] || 'v20';
  return FISH_LIB[key];
}

function glowFor(pct){
  if(pct <= 15) return 'rgba(78,206,255,.65)';
  if(pct <= 30) return 'rgba(50,226,150,.65)';
  if(pct <= 45) return 'rgba(183,237,78,.65)';
  if(pct <= 60) return 'rgba(255,216,91,.65)';
  if(pct <= 75) return 'rgba(255,172,71,.65)';
  return 'rgba(248,107,73,.7)';
}

// Public: replace gauge dot markers with type-matched fish in
// the currently-open modal.
function injectFishMarkers(species){
  if(!species || !species.category) return;
  var fishData = iconFor(species.category);
  if(!fishData) return;
  var markers = document.querySelectorAll('.fish-modal .gauges .gauge-marker, #fishOverlay .gauges .gauge-marker');
  markers.forEach(function(m, idx){
    var origLeft = m.style.left || '50%';
    // Parse percent from "calc(50%)" or "50%"
    var pct = parseFloat(origLeft.replace(/[^\d.]/g, '')) || 50;
    m.classList.add('has-fish', fishData.cls);
    m.innerHTML = '<div class="bub"></div><div class="bub"></div><div class="bub"></div><div class="bub"></div>' + fishData.svg;
    m.style.setProperty('--glow', glowFor(pct));
    // Swim-in: start at 0, swim to target after a beat (staggered per gauge)
    m.style.left = '0%';
    var delay = idx * 180;
    setTimeout(function(){ m.classList.add('show'); }, delay + 600);
    setTimeout(function(){ m.style.left = pct + '%'; }, delay + 1100);
  });
}

// Expose
window.injectFishMarkers = injectFishMarkers;

// Real implementation for triggerGaugeFx (was missing entirely in v0.090).
// Wires up the existing .gauge-card-fx CSS animation system: replays the
// liquid fill + marker pop on every modal open by removing/adding the
// .fx-play class. Staggered per gauge so they cascade.
window.triggerGaugeFx = function(overlay){
  if(!overlay) return;
  var cards = overlay.querySelectorAll('.gauge-card-fx');
  cards.forEach(function(card, i){
    card.classList.remove('fx-play');
    // Force reflow so the animation restart actually replays
    void card.offsetWidth;
    setTimeout(function(){
      card.classList.add('fx-play');
    }, i * 90);
  });
};

// ============================================================
// V0.106 — CANVAS WATER FILL behind the fish marker.
// Each .gauge-track now has a <canvas data-gauge-canvas data-score="X">
// inside it. After the modal renders, initGaugeWaterCanvas() finds
// every gauge canvas and starts a single rAF loop that draws flowing
// water with foam crests, subsurface light, and a leading-edge glow.
// Fill animates 0 -> score%. Sits at z-index 2 between the gauge
// gradient (background) and the fish marker (z-index 5).
// ============================================================
var GW_RAF = null;
var GW_DRAW_FNS = [];

function makeGaugeWater(canvas, targetPct, staggerMs){
  var ctx = canvas.getContext('2d');
  var W=0, H=0, dpr=1;
  var targetFill = targetPct/100;
  var fillProgress = 0, startTime = -1, fillDur = 1200;
  var t = Math.random()*200;

  function sizeCanvas(){
    var r = canvas.parentElement.getBoundingClientRect();
    if(r.width<1) return false;
    dpr = window.devicePixelRatio||1;
    W = r.width; H = r.height;
    canvas.width = Math.round(W*dpr);
    canvas.height = Math.round(H*dpr);
    return true;
  }
  function ease(x){return 1-Math.pow(1-x,3)}
  function surfaceY(x, fillX, amplitude){
    var p = fillX>0 ? x/fillX : 0;
    var a = amplitude*(.35 + .65*p);
    return Math.sin(x/50 + t*1.4)*a
      + Math.sin(x/28 + t*2.6)*a*.6
      + Math.sin(x/80 + t*.7)*a*.8;
  }
  return function draw(now){
    if(W<1){if(!sizeCanvas())return}
    if(startTime<0) startTime = now;
    var el = now - startTime - staggerMs;
    if(el<0) fillProgress = 0;
    else if(el<fillDur) fillProgress = ease(el/fillDur)*targetFill;
    else fillProgress = targetFill;
    t += .025;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);
    var fX = fillProgress*W;
    if(fX<3){ctx.restore();return}
    var mY = H*.42;
    var amp = 4.2;

    // deep water shadow
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(fX+2, H);
    ctx.lineTo(fX+2, mY+4 + Math.sin(t*1.8+2)*3);
    for(var x=fX; x>=0; x-=2) ctx.lineTo(x, mY+3 + surfaceY(x, fX, amp*.7) + 2);
    ctx.closePath();
    ctx.fillStyle = 'rgba(15,55,110,.45)';
    ctx.fill();

    // main water body
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(fX, H);
    var eY = mY + Math.sin(t*1.6)*3.5 + Math.sin(t*2.9+1)*2;
    ctx.lineTo(fX, eY);
    for(var x=fX; x>=0; x-=2) ctx.lineTo(x, mY + surfaceY(x, fX, amp));
    ctx.closePath();
    ctx.fillStyle = 'rgba(25,80,140,.42)';
    ctx.fill();

    // foam crest highlight
    ctx.beginPath();
    var s2 = false;
    for(var x=0; x<=fX; x+=2){
      var wy = mY + surfaceY(x, fX, amp);
      if(!s2){ctx.moveTo(x, wy); s2=true}
      else ctx.lineTo(x, wy);
    }
    ctx.strokeStyle = 'rgba(255,255,255,.34)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // softer wide foam
    ctx.beginPath();
    s2 = false;
    for(var x=0; x<=fX; x+=2){
      var wy = mY + surfaceY(x, fX, amp) - .5;
      if(!s2){ctx.moveTo(x, wy); s2=true}
      else ctx.lineTo(x, wy);
    }
    ctx.strokeStyle = 'rgba(255,255,255,.18)';
    ctx.lineWidth = 5;
    ctx.stroke();

    // subsurface light band
    ctx.beginPath();
    for(var x=0; x<=fX; x+=2){
      var wy = mY + surfaceY(x, fX, amp);
      if(x===0) ctx.moveTo(x, wy+1);
      else ctx.lineTo(x, wy+1);
    }
    for(var x=fX; x>=0; x-=2) ctx.lineTo(x, mY + surfaceY(x, fX, amp) + 6);
    ctx.closePath();
    ctx.fillStyle = 'rgba(140,210,255,.16)';
    ctx.fill();

    // leading edge glow
    if(fX>8){
      var g = ctx.createRadialGradient(fX, eY, 0, fX, eY, 18);
      g.addColorStop(0, 'rgba(140,220,255,.5)');
      g.addColorStop(.5, 'rgba(100,180,255,.22)');
      g.addColorStop(1, 'rgba(100,180,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(fX, eY, 16, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  };
}

function initGaugeWaterCanvas(){
  if(GW_RAF){cancelAnimationFrame(GW_RAF); GW_RAF=null}
  GW_DRAW_FNS = [];
  var canvases = document.querySelectorAll('canvas[data-gauge-canvas]');
  if(!canvases.length) return;
  canvases.forEach(function(c, idx){
    var score = parseFloat(c.dataset.score);
    if(isNaN(score)) return;
    GW_DRAW_FNS.push(makeGaugeWater(c, score, idx*150));
  });
  function loop(now){
    for(var i=0; i<GW_DRAW_FNS.length; i++) GW_DRAW_FNS[i](now);
    GW_RAF = requestAnimationFrame(loop);
  }
  GW_RAF = requestAnimationFrame(loop);
}
window.initGaugeWaterCanvas = initGaugeWaterCanvas;
window.cancelGaugeWaterCanvas = function(){
  if(GW_RAF){cancelAnimationFrame(GW_RAF); GW_RAF=null}
  GW_DRAW_FNS = [];
};
})();
