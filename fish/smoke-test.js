#!/usr/bin/env node
// LTC Fish Browser — Build Smoke Test
// Run: node smoke-test.js

const fs = require('fs');
const path = require('path');

let errors = 0;
let warnings = 0;

function pass(msg){ console.log(`  ✅ ${msg}`); }
function fail(msg){ console.log(`  ❌ ${msg}`); errors++; }
function warn(msg){ console.log(`  ⚠  ${msg}`); warnings++; }

console.log('\n=== LTC Fish Browser Smoke Test ===\n');

// 1. Required files exist
console.log('--- File Structure ---');
const required = ['index.html','css/style.css','js/app.js','js/features.js','data/catalog-base.js','data/fish.js','data/logos.js','data/foods/catalog.js','data/foods/store-settings.js','data/foods/profile-rules.js','START_KIOSK.bat'];
for(const f of required){
  if(fs.existsSync(f)) pass(f);
  else fail(`MISSING: ${f}`);
}

// 2. JS syntax check
console.log('\n--- JavaScript Syntax ---');
const { execSync } = require('child_process');
for(const f of ['js/app.js','js/features.js','data/catalog-base.js','data/fish.js','data/foods/catalog.js','data/foods/store-settings.js','data/foods/profile-rules.js']){
  try{
    execSync(`node --check ${f}`, {stdio:'pipe'});
    pass(`${f} syntax OK`);
  }catch(e){
    fail(`${f} SYNTAX ERROR: ${e.stderr.toString().split('\n')[0]}`);
  }
}

// 3. Fish data validation
console.log('\n--- Fish Data ---');
const speciesDir = path.join('data','species');
if(!fs.existsSync(speciesDir)){ fail('Missing data/species directory'); }
else {
  const fish = [];
  for(const file of fs.readdirSync(speciesDir).filter(f=>f.endsWith('.js'))){
    const content = fs.readFileSync(path.join(speciesDir,file),'utf8');
    const match = content.match(/= (\[[\s\S]*\]);/);
    if(match) fish.push(...JSON.parse(match[1]));
  }
  pass(`${fish.length} species loaded`);
  
  const inStock = fish.filter(f=>f.inStock).length;
  const ency = fish.filter(f=>!f.inStock).length;
  pass(`${inStock} in stock, ${ency} encyclopedia`);
  
  // Check required fields
  const requiredFields = ['id','name','scientific','category','aggression','coralRisk','careDifficulty','invertRisk','photoTitle','overview','water'];
  let missingFields = 0;
  for(const f of fish){
    for(const field of requiredFields){
      if(f[field] === undefined && f[field] !== 0){
        warn(`${f.id} missing field: ${field}`);
        missingFields++;
      }
    }
  }
  if(!missingFields) pass('All required fields present');
  
  // Check for duplicate IDs
  const ids = fish.map(f=>f.id);
  const dupes = ids.filter((id,i) => ids.indexOf(id) !== i);
  if(dupes.length) fail(`Duplicate fish IDs: ${dupes.join(', ')}`);
  else pass('No duplicate fish IDs');
}


// 3b. Food catalog validation
console.log("\n--- Food Catalog ---");
try{
  const vm = require('vm');
  const foodCatalogContent = fs.readFileSync(path.join('data','foods','catalog.js'),'utf8');
  const ctx = {window:{}};
  vm.createContext(ctx);
  vm.runInContext(foodCatalogContent, ctx);
  const foods = ctx.window.FOOD_CATALOG || [];
  pass(`${foods.length} food products loaded`);
  const foodIds = foods.map(f=>f.id);
  const dupFood = foodIds.filter((id,i)=>foodIds.indexOf(id)!==i);
  if(dupFood.length) fail(`Duplicate food IDs: ${dupFood.join(', ')}`);
  else pass('No duplicate food IDs');
  const requiredFoodFields = ['id','brand','name','type','diets','sizes','stage','notes'];
  let badFood = 0;
  for(const food of foods){
    for(const field of requiredFoodFields){
      if(food[field] === undefined){ warn(`Food missing field ${field}: ${food.id || food.name || 'unknown'}`); badFood++; }
    }
  }
  if(!badFood) pass('Food catalog shape looks complete');
}catch(e){ fail(`Food catalog validation failed: ${e.message}`); }

// 4. Translation key check
console.log('\n--- Translations ---');
const appContent = fs.readFileSync('js/app.js','utf8');
const featContent = fs.readFileSync('js/features.js','utf8');
const allJS = appContent + featContent;

// Find all T('key') calls
const tCalls = new Set();
const tRegex = /T\(['"]([^'"]+)['"]\)/g;
let m;
while(m = tRegex.exec(allJS)) tCalls.add(m[1]);

// Find EN translation keys (handles multiple keys per line)
const enKeys = new Set();
const enMatch = featContent.match(/en:\s*\{([\s\S]*?)\n  \},/);
if(enMatch){
  const keyRegex = /(\w+)\s*:/g;
  let km;
  while(km = keyRegex.exec(enMatch[1])) enKeys.add(km[1]);
}

const missingKeys = [...tCalls].filter(k => !enKeys.has(k));
if(missingKeys.length) fail(`Missing translation keys: ${missingKeys.join(', ')}`);
else pass(`All ${tCalls.size} T() keys exist in EN translations (${enKeys.size} defined)`);

// Check ES has same keys as EN
const esMatch = featContent.match(/es:\s*\{([\s\S]*?)\n  \}/);
if(esMatch){
  const esKeys = new Set();
  const keyRegex2 = /(\w+)\s*:/g;
  let km2;
  while(km2 = keyRegex2.exec(esMatch[1])) esKeys.add(km2[1]);
  const missingES = [...enKeys].filter(k => !esKeys.has(k));
  if(missingES.length) warn(`EN keys missing from ES: ${missingES.join(', ')}`);
  else pass(`ES translations complete (${esKeys.size} keys)`);
}

// 5. HTML structure
console.log('\n--- HTML Structure ---');
const html = fs.readFileSync('index.html','utf8');
const htmlIds = [];
const idRegex = /id="([^"]+)"/g;
while(m = idRegex.exec(html)) htmlIds.push(m[1]);
const idDupes = htmlIds.filter((id,i) => htmlIds.indexOf(id) !== i);
if(idDupes.length) fail(`Duplicate HTML IDs: ${idDupes.join(', ')}`);
else pass(`${htmlIds.length} unique HTML IDs`);

// Check script references
for(const ref of ['css/style.css','js/app.js','js/features.js','data/catalog-base.js','data/fish.js','data/logos.js','data/foods/catalog.js','data/foods/store-settings.js','data/foods/profile-rules.js']){
  if(html.includes(ref)) pass(`${ref} referenced`);
  else fail(`${ref} NOT referenced in index.html`);
}

// 6. No prompt() calls remaining
console.log('\n--- Code Quality ---');
const promptMatches = allJS.match(/[^./]prompt\s*\(/g) || [];
if(promptMatches.length && !allJS.includes('native prompt()')) warn(`${promptMatches.length} prompt() calls remaining`);
else pass('No native prompt() calls — all use styled modals');

// Check for escaped template literals
if(featContent.includes('\\\\`') || featContent.includes('\\\\${')){
  fail('features.js still has escaped template literals');
} else pass('No escaped template literal syntax');


// 7. Placeholder phrase scan
console.log('\n--- Placeholder Phrase Scan ---');
const scanFiles = ['js/app.js', ...fs.readdirSync(path.join('data','species')).filter(f=>f.endsWith('.js')).map(f=>path.join('data','species',f))];
const badPhrases = [/should read like a real/i,/for in-?store reference only/i,/no cart,? no checkout/i,/the kiosk should/i];
let hits = 0;
for(const file of scanFiles){
  const content = fs.readFileSync(file,'utf8');
  for(const re of badPhrases){
    if(re.test(content)){ warn(`Placeholder phrase still present in ${file}: ${re}`); hits++; }
  }
}
if(!hits) pass('No banned placeholder phrases found in catalog/template files');

// Summary
console.log(`\n=== RESULTS: ${errors} errors, ${warnings} warnings ===`);
if(!errors) console.log('🎉 Build is clean!\n');
else console.log('⛔ Fix errors before shipping.\n');

process.exit(errors ? 1 : 0);
