#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const args = process.argv.slice(2);
let payload = '';
let payloadFile = '';
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--json' && args[i + 1]) {
    payload = args[i + 1];
    i++;
  } else if (arg === '--file' && args[i + 1]) {
    payloadFile = args[i + 1];
    i++;
  }
}
if (!payload && !payloadFile) {
  console.error('Provide --json or --file.');
  process.exit(1);
}
let entry;
try {
  const raw = payloadFile ? fs.readFileSync(path.resolve(payloadFile), 'utf8') : payload;
  entry = JSON.parse(raw);
} catch (err) {
  console.error('Failed to parse entry JSON:', err.message);
  process.exit(1);
}
const repoDir = path.resolve(__dirname, '..');
process.chdir(repoDir);
const dataPath = path.join(repoDir, 'projects.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
if (!entry.id) entry.id = `project-${Date.now()}`;
data.push(entry);
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n');
console.log(`Appended project ${entry.name || entry.id}.`);
try {
  execSync('git status --short', { stdio: 'inherit' });
  execSync('git add projects.json', { stdio: 'inherit' });
  execSync(`git commit -m "Add project ${entry.id}"`, { stdio: 'inherit' });
  execSync('git push', { stdio: 'inherit' });
  console.log('Committed and pushed change to the default remote.');
} catch (err) {
  console.error('Git command failed:', err.message);
  process.exit(1);
}
