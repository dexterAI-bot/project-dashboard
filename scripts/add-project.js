#!/usr/bin/env node
/*
 * Simple helper to append a project entry to projects.json.
 * Usage:
 *   node scripts/add-project.js --json '{"id":"new","name":"..."}'
 *   node scripts/add-project.js --file ./new-project.json
 */
const fs = require('fs');
const path = require('path');
const args = process.argv.slice(2);
let input = '';
let inputFile = '';
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--json' && args[i + 1]) {
    input = args[i + 1];
    i++;
  } else if (arg === '--file' && args[i + 1]) {
    inputFile = args[i + 1];
    i++;
  }
}
if (!input && !inputFile) {
  console.error('Provide --json or --file source.');
  process.exit(1);
}
let entry = null;
try {
  const payload = inputFile ? fs.readFileSync(path.resolve(inputFile), 'utf8') : input;
  entry = JSON.parse(payload);
} catch (err) {
  console.error('Failed to parse entry JSON:', err.message);
  process.exit(1);
}
const filePath = path.resolve('projects.json');
const raw = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(raw);
if (!Array.isArray(data)) {
  console.error('projects.json is not an array');
  process.exit(1);
}
if (!entry.id) {
  entry.id = `project-${Date.now()}`;
}
data.push(entry);
fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
console.log(`Appended project ${entry.name || entry.id} to projects.json`);
