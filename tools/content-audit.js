const fs = require('fs');
const path = require('path');

const speciesDir = path.join(__dirname, 'data', 'species');
const bannedPhrases = [
  'Needs enrichment',
  'Roster seed',
  'catalog expansion seed',
  'not fully enriched',
  'Look for look for',
  'Look for use the',
  'Image mapping should be reviewed',
  'before final rollout',
  'Scientific name, exact max size, and species-specific tank recommendation still need verification.',
  'This entry should sell as',
  'perfect kiosk fish',
  'for the kiosk'
];
const scalarFieldsToTrack = ['scientific', 'maxSize', 'minTank', 'diet'];
const placeholderValues = ['Unknown', ''];
const doubleWordRe = /\b(\w+)\s+\1\b/i;

function loadChunk(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const match = raw.match(/=\s*(\[[\s\S]*\])\s*;\s*$/);
  if (!match) throw new Error(`Could not parse species chunk: ${filePath}`);
  return JSON.parse(match[1]);
}

const files = fs.readdirSync(speciesDir).filter(f => f.endsWith('.js')).sort();
let totalEntries = 0;
let markerHits = 0;
const markerByFile = [];
const unknownByField = Object.fromEntries(scalarFieldsToTrack.map(f => [f, 0]));
const unknownExamples = [];
const doubleWordHits = [];

for (const file of files) {
  const entries = loadChunk(path.join(speciesDir, file));
  totalEntries += entries.length;
  const hits = [];
  for (const entry of entries) {
    const blob = JSON.stringify(entry);
    const matched = bannedPhrases.filter(p => blob.includes(p));
    if (matched.length) {
      markerHits += 1;
      hits.push({ id: entry.id, name: entry.name, matched });
    }
    for (const field of scalarFieldsToTrack) {
      const val = entry[field];
      if (typeof val !== 'string' || placeholderValues.includes(val.trim())) {
        unknownByField[field] += 1;
        if (unknownExamples.length < 20) {
          unknownExamples.push(`${entry.name} (${entry.id}) — ${field}`);
        }
      }
    }
    for (const [key, value] of Object.entries(entry)) {
      if (typeof value === 'string' && doubleWordRe.test(value)) {
      if (key === 'scientific' && value.trim().toLowerCase() === 'histrio histrio') continue;
      if ((key === 'name' || key === 'name_es') && value.trim().toLowerCase() === 'pom pom crab') continue;
        doubleWordHits.push(`${entry.id} — ${key}`);
        break;
      }
    }
  }
  if (hits.length) markerByFile.push({ file, count: hits.length, hits });
}

console.log('# LTC Fish Browser Content Audit — V0.066');
console.log('');
console.log(`- Species entries scanned: ${totalEntries}`);
console.log(`- Entries containing banned marker phrases: ${markerHits}`);
console.log(`- Banned phrases scanned: ${bannedPhrases.join(', ')}`);
console.log(`- Entries with accidental doubled words: ${doubleWordHits.length}`);
console.log('');
console.log('## Marker phrase results');
if (!markerByFile.length) {
  console.log('- No banned marker phrases found in species profiles.');
} else {
  for (const item of markerByFile) {
    console.log(`- ${item.file}: ${item.count}`);
  }
}
console.log('');
console.log('## Core factual field gaps');
for (const field of scalarFieldsToTrack) {
  console.log(`- ${field}: ${unknownByField[field]}`);
}
console.log('');
console.log('## Example entries still carrying empty / Unknown core fields');
if (!unknownExamples.length) {
  console.log('- None');
} else {
  for (const line of unknownExamples) {
    console.log(`- ${line}`);
  }
}
console.log('');
console.log('## Doubled-word scan');
if (!doubleWordHits.length) {
  console.log('- No doubled-word issues found in species text.');
} else {
  for (const line of doubleWordHits.slice(0, 20)) {
    console.log(`- ${line}`);
  }
}
