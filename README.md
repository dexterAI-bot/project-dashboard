# Project HQ Dashboard

Central hub for every project you run or plan, with futuristic cards, status filters, detail panes, external links, and a one-tap Telegram ping so you can instantly tell the bot which project you’re working on.

## GitHub Pages deployment (mobile-ready)

1. Push this `project-dashboard/` folder into `https://github.com/dexterai-bot/project-dashboard` (the repo has already been created and the initial commit pushed).
2. GitHub Pages is configured to serve from `main`/`root`, so the site is live at **https://dexterai-bot.github.io/project-dashboard/**.
3. Access that URL from any phone or tablet (VPN/Tailscale not required). The Telegram "Ping" button in the detail panel now points to the Pages URL, so tapping it launches Telegram with the message pre-filled.
4. Future updates mean editing `projects.json`, committing, and pushing—the Pages site auto-rebuilds within a minute.

## Updating the project data

- `projects.json` is the single source of truth (status, summary, owners, tags, links, external URLs, next steps, etc.).
- Instead of hand-editing the JSON, run the helper script inside this repo:
  ```bash
  cd project-dashboard
  node scripts/add-project.js --json '{"id":"new-project","name":"Super Bot","status":"planning","summary":"..."}'
  ```
  or point `--file` at a JSON document containing the new entry.
- When you want to add + push in one shot, run:
  ```bash
  node scripts/add-project-and-push.js --json '{"name":"Field Ops","status":"running"...}'
  ```
  That script appends the entry, commits with `Add project <id>`, and pushes to `origin/main` so Pages rebuilds automatically.

## Automation + skill integration

- Today this repo is updated via the helper scripts in `scripts/` (see above).
- If/when you want a dedicated OpenClaw skill (e.g. `/projecthq update project-1-english`), we can add a `skills/` folder in this repo or publish a separate skill repo that wraps `scripts/add-project-and-push.js`.
- The README here doubles as documentation for whoever maintains the repo—keep `projects.json` and the scripts in sync.

If you want, I can add:
- a GitHub Action that validates `projects.json` schema on every push
- a script to update an existing entry by `id` (not just add)
- a proper OpenClaw skill wrapper so updates can be done by chat command