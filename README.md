# Study Thermal

A calm, local-first study timer that turns consistency into a GitHub-style activity heatmap.

Every visitor owns a separate subject list in their browser. Subjects, colors, daily goals, and
history can be edited without an account and are never shared with other visitors.

## Clone and run locally

```bash
npm --version # Node.js 20 or newer is required
git clone https://github.com/YOUR-NAME/study-thermal.git
cd study-thermal
npm install
npm run dev
```

Open <http://localhost:3000>. Replace `YOUR-NAME` with the repository owner's GitHub username.

## Publish with GitHub Pages

1. Create an empty GitHub repository named `study-thermal`.
2. From this folder, run:

   ```bash
   git init
   git add .
   git commit -m "feat: initial Study Thermal release"
   git branch -M main
   git remote add origin https://github.com/YOUR-NAME/study-thermal.git
   git push -u origin main
   ```

3. In the repository, open **Settings → Pages → Build and deployment** and select
   **GitHub Actions** as the source.
4. Open **Actions → Deploy to GitHub Pages**. After the workflow finishes, the app is available
   at `https://YOUR-NAME.github.io/study-thermal/`.

Every device can open and install that URL. Data still stays in each browser's IndexedDB and is
not synchronized between devices until Milestone 5. Use **Settings → Backup → Export/Import** to
move data safely. Export a backup before clearing browser data.

To verify the same static build locally:

```bash
npm run build
python3 -m http.server 3000 --directory out
```

## Milestones

- [x] **M1** — responsive dashboard, stopwatch/countdown, subjects, daily goals, IndexedDB
- [x] **M2** — completion heatmap, daily/weekly/monthly statistics, subject distribution
- [x] **M3** — gradient/image/video backgrounds, appearance controls, focus mode
- [x] **M4** — installable PWA, offline shell, notifications, keyboard shortcuts, JSON backup
- [ ] **M5** — Supabase authentication and opt-in encrypted sync
- [ ] **M6** — conflict-safe multi-device synchronization

Each checked milestone is independently deployable. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Data model

`subjects` define goals and colors. Immutable `sessions` contain elapsed study time. `settings`
contains device-local presentation preferences. Future sync should add server IDs and revision
timestamps without changing the timer UI.

## License

MIT
