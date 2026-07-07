# UI/UX Restyling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Workout Tracker from a functional single-file app to a polished, portfolio-quality experience through file split, design system refinement, and UI/UX improvements across all views.

**Architecture:** Split the monolith `index.html` into `index.html` (skeleton), `style.css` (all styles), and `app.js` (all logic). Zero dependencies, zero build step — deploy identical to before. Each task builds on the previous, refining one area at a time.

**Tech Stack:** Vanilla JS, vanilla CSS, AnimeJS (existing), Google Material Symbols (existing), localStorage (existing), Supabase (existing).

---

## File Structure

After split, the workspace will be:

```
Workout-tracker/
├── index.html          # HTML skeleton — view containers, script/style links
├── style.css           # All styles organized by section
├── app.js              # All JS organized by section
├── supabase-setup.sql  # Unchanged
├── docs/superpowers/
│   ├── specs/
│   │   └── 2026-07-06-uiux-restyling-design.md
│   └── plans/
│       └── 2026-07-06-uiux-restyling-plan.md
```

### index.html structure (after split)
```
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Workout Tracker</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@500;600&family=Material+Symbols+Outlined" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.2/anime.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
</head>
<body>
  <div id="app">
    <main id="view-oggi" class="view active">...</main>
    <main id="view-allenamento" class="view">...</main>
    <main id="view-riepilogo" class="view">...</main>
    <main id="view-analisi" class="view">...</main>
    <main id="view-programma" class="view">...</main>
    <main id="view-storico" class="view">...</main>
    <main id="view-impostazioni" class="view">...</main>
    <nav id="tab-bar">...</nav>
    <!-- workout pill, timer bar, modals -->
  </div>
  <script src="app.js"></script>
</body>
</html>
```

### style.css sections (in order)
1. /* === DESIGN TOKENS === */
2. /* === RESET & BASE === */
3. /* === LAYOUT === */
4. /* === COMPONENTS === */
5. /* === UTILITIES === */
6. /* === ANIMATIONS === */

### app.js sections (in order)
1. // === SUPABASE CONFIG ===
2. // === STATE ===
3. // === DATA (templates, muscle map, volume ranges, exercise notes) ===
4. // === CACHE ===
5. // === UTILITY FUNCTIONS ===
6. // === RENDER FUNCTIONS ===
7. // === EVENT HANDLERS ===
8. // === TIMER ===
9. // === NAVIGATION ===
10. // === SYNC ===
11. // === INIT ===

---

### Task 1: Split monolith into separate files

**Files:**
- Create: `index.html`
- Create: `style.css`
- Create: `app.js`

- [ ] **Step 1: Create style.css with all CSS from index.html**

Copy all content from `<style>` tags (lines 12-270) into `style.css`. Keep everything as-is — no cleanup yet.

- [ ] **Step 2: Create app.js with all JS from index.html**

Copy all content from `<script>` tags (lines ~290-2029) into `app.js`. Keep everything as-is.

- [ ] **Step 3: Rewrite index.html as skeleton**

Replace the current index.html with a clean skeleton that links `style.css` and `app.js`. Include all CDN links (AnimeJS, Supabase, Google Fonts). Keep all HTML containers (`#view-*`, `#tab-bar`, modals, timer elements, workout pill) — move them from JS `innerHTML` into the HTML where possible. Verify all view containers exist in the HTML.

```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Workout Tracker</title>
  <link rel="stylesheet" href="style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@500;600&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.2/anime.min.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" defer></script>
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; connect-src 'self' https://ujmirnqigvgyncthbqx.supabase.co; img-src 'self' data:;">
</head>
<body>
  <div id="app">
    <main id="view-oggi" class="view active"></main>
    <main id="view-allenamento" class="view"></main>
    <main id="view-riepilogo" class="view"></main>
    <main id="view-analisi" class="view"></main>
    <main id="view-programma" class="view"></main>
    <main id="view-storico" class="view"></main>
    <main id="view-impostazioni" class="view"></main>
    <nav id="tab-bar"></nav>
    <div id="workout-pill"></div>
    <div id="modal-overlay" class="modal-overlay hidden">
      <div class="modal-box" id="modal-content"></div>
    </div>
    <div id="timer-container"></div>
  </div>
  <script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 4: Update CSP in index.html to match new resource origins**

Verify the CSP meta tag allows all CDNs used. Test that all external resources load.

- [ ] **Step 5: Test the split**

Open `index.html` in a browser. Verify:
- All views render correctly
- All features work (workout flow, timer, analysis, history, settings)
- No console errors
- Dark mode works

- [ ] **Step 6: Remove inline `innerHTML` view containers from JS render functions**

Since view containers now exist in HTML, remove `container.innerHTML = \`...\`` patterns from `app.js` render functions and replace with `container.innerHTML = \`...\`` only for the content inside each view. Keep the outer container creation in HTML.

```javascript
// BEFORE:
function renderOggi() {
  const container = document.getElementById('view-oggi');
  container.innerHTML = `...`; // includes outer structure
}

// AFTER:
function renderOggi() {
  const container = document.getElementById('view-oggi');
  // container already exists in HTML, just set content
  container.innerHTML = `...`; // just the inner content
}
```

- [ ] **Step 7: Commit**

```bash
git add index.html style.css app.js
git commit -m "refactor: split monolith into index.html, style.css, app.js"
```

---

### Task 2: Design System - CSS variables and palette

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Define design token section at top of style.css**

```css
/* === DESIGN TOKENS === */
:root {
  /* Colors - Light */
  --color-bg: #f8f8f8;
  --color-surface: #ffffff;
  --color-surface-hover: #f5f5f5;
  --color-border: #e0e0e0;
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #666666;
  --color-text-muted: #999999;
  --color-accent: #e65100;
  --color-accent-hover: #d84b00;
  --color-accent-light: #fff3e0;
  --color-success: #2e7d32;
  --color-success-light: #e8f5e9;
  --color-warning: #f9a825;
  --color-warning-light: #fff8e1;
  --color-error: #c62828;
  --color-error-light: #ffebee;
  --color-info: #1565c0;
  --color-info-light: #e3f2fd;

  /* Typography */
  --font-heading: 'IBM Plex Serif', Georgia, serif;
  --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 20px;
  --text-xl: 24px;
  --text-2xl: 32px;
  --text-3xl: 40px;
  --lh-tight: 1.25;
  --lh-normal: 1.5;
  --lh-relaxed: 1.6;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* Borders */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 2px 8px rgba(0,0,0,0.08);
  --shadow-lg: 0 4px 16px rgba(0,0,0,0.12);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 400ms ease;
}

/* Dark mode tokens */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #121212;
    --color-surface: #1e1e1e;
    --color-surface-hover: #2a2a2a;
    --color-border: #333333;
    --color-text-primary: #e0e0e0;
    --color-text-secondary: #999999;
    --color-text-muted: #666666;
    --color-accent: #ff6d00;
    --color-accent-hover: #ff8126;
    --color-accent-light: #3a1a00;
    --color-success-light: #1b3a1b;
    --color-warning-light: #3a2e00;
    --color-error-light: #3a1a1a;
    --color-info-light: #0d2137;
  }
}
```

- [ ] **Step 2: Replace hardcoded values in existing CSS with variables**

Replace all hardcoded colors, font names, spacing values, border-radius, and shadows in the existing CSS with the corresponding CSS variables. Example transformations:

```css
/* BEFORE */
body { background: #fff; color: #1a1a1a; font-family: -apple-system, ...; }
.card { background: #fff; border: 1px solid #eee; border-radius: 12px; padding: 16px; }

/* AFTER */
body { background: var(--color-bg); color: var(--color-text-primary); font-family: var(--font-body); }
.card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-4); }
```

Do a thorough pass over all CSS selectors and replace every hardcoded value with its variable equivalent.

- [ ] **Step 3: Add semantic color classes**

```css
/* === UTILITIES === */
.text-success { color: var(--color-success); }
.text-warning { color: var(--color-warning); }
.text-error { color: var(--color-error); }
.text-info { color: var(--color-info); }
.text-muted { color: var(--color-text-muted); }
.bg-success { background: var(--color-success-light); }
.bg-warning { background: var(--color-warning-light); }
.bg-error { background: var(--color-error-light); }
.bg-info { background: var(--color-info-light); }
```

- [ ] **Step 4: Test**

Open app, verify all views look correct in both light and dark mode. Check no styling regressions.

- [ ] **Step 5: Commit**

```bash
git add style.css
git commit -m "feat: implement design system with CSS variables"
```

---

### Task 3: Navigation — revised tab bar + view transitions

**Files:**
- Modify: `style.css`
- Modify: `app.js`
- Modify: `index.html`

- [ ] **Step 1: Update tab bar HTML in app.js navigation section**

Replace the current tab bar render with the revised version: `ALLENAMENTI | ANALISI | PROGRAMMA | STORICO | ⚙️`

```javascript
function renderTabBar() {
  const tabBar = document.getElementById('tab-bar');
  const tabs = [
    { id: 'oggi', label: 'Allenamenti', icon: 'fitness_center' },
    { id: 'analisi', label: 'Analisi', icon: 'insights' },
    { id: 'programma', label: 'Programma', icon: 'calendar_view_week' },
    { id: 'storico', label: 'Storico', icon: 'history' },
    { id: 'impostazioni', label: '', icon: 'settings' },
  ];
  tabBar.innerHTML = tabs.map(t => `
    <button class="tab-btn${state.currentView === t.id ? ' active' : ''}" data-view="${t.id}">
      <span class="material-symbols-outlined">${t.icon}</span>
      ${t.label ? `<span class="tab-label">${t.label}</span>` : ''}
    </button>
  `).join('');
}
```

Update `switchView()` to handle view transitions with CSS classes instead of direct show/hide.

- [ ] **Step 2: Add tab bar CSS with active indicator animation**

```css
/* === TAB BAR === */
#tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding-bottom: env(safe-area-inset-bottom, 0);
  z-index: 100;
}

.tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-1);
  border: none;
  background: none;
  color: var(--color-text-muted);
  font-family: var(--font-body);
  font-size: var(--text-xs);
  cursor: pointer;
  transition: color var(--transition-fast);
  -webkit-tap-highlight-color: transparent;
}

.tab-btn.active {
  color: var(--color-accent);
}

.tab-btn .material-symbols-outlined {
  font-size: 24px;
  transition: transform var(--transition-fast);
}

.tab-btn.active .material-symbols-outlined {
  transform: scale(1.1);
}

.tab-label {
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
```

- [ ] **Step 3: Add view transition styles**

```css
/* === VIEW TRANSITIONS === */
.view {
  display: none;
  opacity: 0;
  transition: opacity var(--transition-base), transform var(--transition-base);
}

.view.active {
  display: block;
  opacity: 1;
}

.view.slide-in {
  animation: slideIn var(--transition-base) ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 4: Update switchView in app.js**

```javascript
function switchView(viewId) {
  const prevView = document.querySelector('.view.active');
  if (prevView) {
    prevView.classList.remove('active');
    prevView.classList.remove('slide-in');
  }
  state.currentView = viewId;
  const view = document.getElementById(`view-${viewId}`);
  view.classList.add('active', 'slide-in');
  renderTabBar();
  renderCurrentView();
}
```

- [ ] **Step 5: Test**

Verify tab switching works smoothly, transitions animate, active tab is highlighted, all views render.

- [ ] **Step 6: Commit**

```bash
git add style.css app.js index.html
git commit -m "feat: redesign tab bar with slide transitions"
```

---

### Task 4: ALLENAMENTI view (ex OGGI)

**Files:**
- Modify: `app.js`
- Modify: `style.css`

- [ ] **Step 1: Rewrite renderOggi as renderAllenamenti with today highlight**

```javascript
function renderAllenamenti() {
  const container = document.getElementById('view-oggi');
  const today = getTodayWorkout();
  const allTemplates = state.templates;
  const todayName = getItalianDayName(new Date().getDay());

  let html = `<div class="view-header">
    <h1 class="view-title">Allenamenti</h1>
  </div>`;

  // Today's recommended workout — highlighted
  if (today) {
    const isActive = state.activeWorkout && !state.activeWorkout.completed;
    const isCompleted = state.workoutHistory.some(w =>
      w.data === new Date().toISOString().split('T')[0] &&
      w.giorno === today.giorno
    );
    const statusClass = isCompleted ? 'completed' : isActive ? 'in-progress' : 'ready';
    const statusLabel = isCompleted ? 'Completato' : isActive ? 'In corso' : 'Da iniziare';

    html += `<div class="today-card card ${statusClass}">
      <div class="today-header">
        <span class="today-day">${todayName}</span>
        <span class="today-status badge badge-${statusClass}">${statusLabel}</span>
      </div>
      <h2 class="today-workout-name">${today.nome}</h2>
      <p class="today-exercises-count">${today.esercizi.length} esercizi</p>
      ${!isCompleted ? `<button class="btn btn-primary full-width" onclick="${isActive ? 'riprendiAllenamento()' : 'startWorkout(\'' + today.giorno + '\')'}">
        <span class="material-symbols-outlined">${isActive ? 'play_arrow' : 'fitness_center'}</span>
        ${isActive ? 'Riprendi' : 'Inizia allenamento'}
      </button>` : ''}
    </div>`;
  }

  // All available workouts
  html += `<h3 class="section-title">Tutte le schede</h3>
    <div class="workout-list">`;

  allTemplates.forEach((t, i) => {
    const dayName = getItalianDayName(t.giorno);
    const lastDone = state.workoutHistory.filter(w => w.giorno === t.giorno);
    const lastDate = lastDone.length > 0 ? lastDone[lastDone.length - 1].data : null;
    html += `<div class="card workout-card" onclick="startWorkout('${t.giorno}')">
      <div class="workout-card-header">
        <span class="workout-card-name">${t.nome}</span>
        <span class="badge">${t.esercizi.length} es.</span>
      </div>
      <div class="workout-card-day">
        <span class="material-symbols-outlined">calendar_today</span>
        ${dayName}
      </div>
      ${lastDate ? `<div class="workout-card-last">Ultimo: ${formatDate(lastDate)}</div>` : ''}
    </div>`;
  });

  html += `</div>`;
  container.innerHTML = html;
}
```

- [ ] **Step 2: Add ALLENAMENTI view CSS**

```css
/* === ALLENAMENTI VIEW === */
.view-header {
  padding: var(--space-6) var(--space-4) var(--space-4);
}

.view-title {
  font-family: var(--font-heading);
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.today-card {
  margin: var(--space-4);
  padding: var(--space-5);
  border-left: 4px solid var(--color-accent);
}

.today-card.completed {
  border-left-color: var(--color-success);
  opacity: 0.8;
}

.today-card.in-progress {
  border-left-color: var(--color-info);
}

.today-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.today-day {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.today-workout-name {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  margin: 0 0 var(--space-1);
}

.today-exercises-count {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-4);
}

.badge-ready { background: var(--color-accent-light); color: var(--color-accent); }
.badge-in-progress { background: var(--color-info-light); color: var(--color-info); }
.badge-completed { background: var(--color-success-light); color: var(--color-success); }

.section-title {
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  margin: var(--space-6) var(--space-4) var(--space-3);
  color: var(--color-text-primary);
}

.workout-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: 0 var(--space-4) var(--space-24);
}

.workout-card {
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.workout-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.workout-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-1);
}

.workout-card-name {
  font-weight: 600;
  font-size: var(--text-base);
}

.workout-card-day {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.workout-card-day .material-symbols-outlined {
  font-size: 16px;
}

.workout-card-last {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}
```

- [ ] **Step 3: Update renderCurrentView to call renderAllenamenti**

```javascript
function renderCurrentView() {
  switch (state.currentView) {
    case 'oggi': renderAllenamenti(); break;
    // ... rest unchanged
  }
}
```

- [ ] **Step 4: Test**

Open app, verify today workout shows highlighted, all workouts listed, click starts workout.

- [ ] **Step 5: Commit**

```bash
git add app.js style.css
git commit -m "feat: redesign ALLENAMENTI view with today highlight"
```

---

### Task 5: Flusso allenamento — header sticky + exercise refinements

**Files:**
- Modify: `app.js`
- Modify: `style.css`

- [ ] **Step 1: Add sticky header with progress bar to workout view**

In `renderAllenamento()`, add a sticky header at the top:

```javascript
function renderAllenamento() {
  const container = document.getElementById('view-allenamento');
  const w = state.activeWorkout;
  if (!w) return;

  const totalExercises = w.esercizi.length;
  const completedExercises = w.esercizi.filter(e => e.serie.every(s => s.completato)).length;
  const progressPct = Math.round((completedExercises / totalExercises) * 100);

  let html = `<div class="workout-sticky">
    <div class="workout-sticky-top">
      <span class="workout-sticky-name">${w.nome}</span>
      <span class="workout-sticky-timer" id="workout-timer-display">${formatTimer(state.workoutStartTime)}</span>
      <button class="btn btn-ghost btn-sm" onclick="confirmEndWorkout()">Fine</button>
    </div>
    <div class="workout-progress-bar">
      <div class="workout-progress-fill" style="width: ${progressPct}%"></div>
    </div>
    <span class="workout-progress-label">${completedExercises}/${totalExercises} esercizi</span>
  </div>`;

  // ... rest of existing workout render (exercise blocks, set grids)
  container.innerHTML = html + existingWorkoutContent;
}
```

- [ ] **Step 2: Add sticky header CSS**

```css
/* === WORKOUT STICKY HEADER === */
.workout-sticky {
  position: sticky;
  top: 0;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: var(--space-3) var(--space-4);
  z-index: 50;
}

.workout-sticky-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.workout-sticky-name {
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  font-weight: 600;
}

.workout-sticky-timer {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.workout-progress-bar {
  height: 4px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--space-1);
}

.workout-progress-fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: var(--radius-full);
  transition: width var(--transition-base);
}

.workout-progress-label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
```

- [ ] **Step 3: Add double progression suggestion pill to exercise blocks**

In the exercise rendering within `renderAllenamento()`, add a suggestion pill when double progression criteria are met:

```javascript
function getProgressionSuggestion(exercise) {
  const lastWeight = state.lastWeights[exercise.nome];
  if (!lastWeight) return null;
  const allComplete = exercise.serie.length > 0 && exercise.serie.every(s => s.completato);
  const allAtMaxReps = exercise.serie.length > 0 && exercise.serie.every(s => s.ripetizioni >= (exercise.reps || s.ripetizioni));
  if (allComplete && allAtMaxReps && lastWeight) {
    const increment = lastWeight < 60 ? 2.5 : lastWeight < 100 ? 5 : 10;
    return { current: lastWeight, next: lastWeight + increment };
  }
  return null;
}
```

Add pill in exercise HTML:
```javascript
const suggestion = getProgressionSuggestion(ex);
if (suggestion) {
  html += `<div class="progression-pill">
    <span class="material-symbols-outlined">trending_up</span>
    ${suggestion.current}kg → ${suggestion.next}kg
  </div>`;
}
```

- [ ] **Step 4: Add progression pill CSS**

```css
.progression-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  background: var(--color-accent-light);
  color: var(--color-accent);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 500;
}

.progression-pill .material-symbols-outlined {
  font-size: 16px;
}
```

- [ ] **Step 5: Add check animation on set completion**

```javascript
// In the set click handler, after marking set as completed:
function handleSetClick(exIndex, setIndex) {
  const set = state.activeWorkout.esercizi[exIndex].serie[setIndex];
  set.completato = !set.completato;
  saveCache();
  renderAllenamento();
  if (set.completato) {
    // Animate the check
    const checkEl = document.querySelector(`[data-ex="${exIndex}"][data-set="${setIndex}"] .set-check`);
    if (checkEl) {
      checkEl.classList.add('set-check-animate');
      setTimeout(() => checkEl.classList.remove('set-check-animate'), 400);
    }
  }
}
```

- [ ] **Step 6: Add set check animation CSS**

```css
.set-check {
  transition: transform var(--transition-fast), color var(--transition-fast);
}

.set-check.completed {
  color: var(--color-success);
}

.set-check-animate {
  animation: checkPop 0.4s ease;
}

@keyframes checkPop {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
```

- [ ] **Step 7: Test**

Start a workout, verify sticky header with progress bar, verify progression pill appears when sets complete, verify check animation.

- [ ] **Step 8: Commit**

```bash
git add app.js style.css
git commit -m "feat: improve workout flow with sticky header and progression pill"
```

---

### Task 6: Timer recupero — visual polish

**Files:**
- Modify: `style.css`
- Modify: `app.js`

- [ ] **Step 1: Rewrite timer render with larger display and skip button**

```javascript
function renderTimer(exIndex) {
  const container = document.getElementById('timer-container');
  if (exIndex < 0 || !state.restTimerTotal) {
    container.innerHTML = '';
    return;
  }
  const seconds = state.timerSeconds;
  const total = state.restTimerTotal;
  const pct = total > 0 ? (seconds / total) * 100 : 0;

  container.innerHTML = `<div class="timer-overlay">
    <div class="timer-card">
      <div class="timer-label">Recupero</div>
      <div class="timer-display">${formatTimerSeconds(seconds)}</div>
      <div class="timer-bar">
        <div class="timer-bar-fill" style="width: ${pct}%"></div>
      </div>
      <button class="btn btn-ghost" onclick="skipRest()">
        <span class="material-symbols-outlined">skip_next</span>
        Salta
      </button>
    </div>
  </div>`;
}
```

- [ ] **Step 2: Polish timer CSS**

```css
/* === TIMER === */
.timer-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  z-index: 200;
}

.timer-card {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  text-align: center;
  min-width: 260px;
  box-shadow: var(--shadow-lg);
}

.timer-label {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: var(--space-3);
}

.timer-display {
  font-family: var(--font-mono);
  font-size: var(--text-3xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-5);
  font-variant-numeric: tabular-nums;
}

.timer-bar {
  height: 6px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--space-5);
}

.timer-bar-fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: var(--radius-full);
  transition: width 0.3s linear;
}

.timer-bar-fill.warning {
  background: var(--color-warning);
}
```

- [ ] **Step 3: Add pulse when timer finishes**

```css
@keyframes timerPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.timer-card.pulse {
  animation: timerPulse 1s ease infinite;
}
```

- [ ] **Step 4: Test**

Start workout, complete set, verify timer overlay appears with large display, skip button works, bar animates.

- [ ] **Step 5: Commit**

```bash
git add style.css app.js
git commit -m "feat: polish timer UI with overlay and animations"
```

---

### Task 7: Analisi volume — reference lines and badges

**Files:**
- Modify: `style.css`
- Modify: `app.js`

- [ ] **Step 1: Update renderAnalisi volume bars with max reference and status badges**

In the muscle volume rendering section of `renderAnalisi()`, for each muscle show:

```javascript
function renderMuscleVolumeRow(muscle, currentVolume, maxVolume, ranges, level) {
  const range = ranges[muscle];
  if (!range) return '';
  const pct = range.max > 0 ? Math.min((currentVolume / range.max) * 100, 100) : 0;
  const maxPct = range.max > 0 && maxVolume ? Math.min((maxVolume / range.max) * 100, 100) : 0;
  let status = 'under';
  let statusLabel = 'Sotto volume';
  if (currentVolume >= range.min && currentVolume <= range.max) {
    status = 'optimal';
    statusLabel = 'Ottimale';
  } else if (currentVolume > range.max) {
    status = 'over';
    statusLabel = 'Sopra volume';
  }

  return `<div class="muscle-row">
    <div class="muscle-row-header">
      <span class="muscle-name">${muscle}</span>
      <span class="muscle-volume">${currentVolume} set</span>
      <span class="badge badge-${status}">${statusLabel}</span>
    </div>
    <div class="muscle-bar-container">
      <div class="muscle-bar" style="width: ${pct}%"></div>
      ${maxVolume ? `<div class="muscle-bar-max" style="left: ${maxPct}%"></div>` : ''}
    </div>
    <div class="muscle-range">Range: ${range.min}-${range.max} set (${level})</div>
  </div>`;
}
```

- [ ] **Step 2: Add max reference line CSS**

```css
.muscle-bar-container {
  position: relative;
  height: 8px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  margin: var(--space-2) 0;
}

.muscle-bar {
  height: 100%;
  background: var(--color-accent);
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
}

.muscle-bar-max {
  position: absolute;
  top: -2px;
  bottom: -2px;
  width: 2px;
  background: var(--color-text-secondary);
  border-radius: 1px;
}

.badge-under { background: var(--color-warning-light); color: var(--color-warning); }
.badge-optimal { background: var(--color-success-light); color: var(--color-success); }
.badge-over { background: var(--color-error-light); color: var(--color-error); }
```

- [ ] **Step 3: Add filter toggle for week/month/phase**

At top of Analisi view, add a toggle group:

```javascript
html += `<div class="toggle-group">
  <button class="toggle-btn${filter === 'week' ? ' active' : ''}" onclick="setAnalisiFilter('week')">Settimana</button>
  <button class="toggle-btn${filter === 'month' ? ' active' : ''}" onclick="setAnalisiFilter('month')">Mese</button>
  <button class="toggle-btn${filter === 'phase' ? ' active' : ''}" onclick="setAnalisiFilter('phase')">Fase</button>
</div>`;
```

- [ ] **Step 4: Add setAnalisiFilter handler**

```javascript
function setAnalisiFilter(filter) {
  state.analisiFilter = filter;
  renderAnalisi();
}
```

Add `state.analisiFilter = 'week';` in the state initialization section.

- [ ] **Step 5: Test**

Open Analisi view, verify muscle bars show with reference lines, badges appear correctly, filter toggle works.

- [ ] **Step 6: Commit**

```bash
git add app.js style.css
git commit -m "feat: enhance volume analysis with reference lines and badges"
```

---

### Task 8: Progresso esercizi — tooltip, trend line, comparison

**Files:**
- Modify: `app.js`
- Modify: `style.css`

- [ ] **Step 1: Update exercise progress graph with tooltip on points**

```javascript
function renderProgressGraph(container, exerciseName, history) {
  if (!history || history.length < 2) {
    container.innerHTML = `<p class="text-muted">Dati insufficienti per il grafico</p>`;
    return;
  }

  const maxWeight = Math.max(...history.map(h => h.peso));
  const minWeight = Math.min(...history.map(h => h.peso));
  const padding = 30;
  const width = container.clientWidth || 320;
  const height = 200;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  // Calculate points
  const points = history.map((h, i) => ({
    x: padding + (i / (history.length - 1)) * graphWidth,
    y: padding + graphHeight - ((h.peso - minWeight) / (maxWeight - minWeight || 1)) * graphHeight,
    peso: h.peso,
    date: h.data
  }));

  // Build SVG
  let svg = `<svg width="${width}" height="${height}" class="progress-svg" viewBox="0 0 ${width} ${height}">
    <!-- Grid lines -->
    ${[0.25, 0.5, 0.75].map(f => {
      const y = padding + graphHeight * (1 - f);
      const val = minWeight + (maxWeight - minWeight) * f;
      return `<line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="var(--color-border)" stroke-width="1"/>
        <text x="${padding - 4}" y="${y + 4}" text-anchor="end" fill="var(--color-text-muted)" font-size="10">${val.toFixed(1)}</text>`;
    }).join('')}

    <!-- Line -->
    <polyline points="${points.map(p => `${p.x},${p.y}`).join(' ')}" fill="none" stroke="var(--color-accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>

    <!-- Points -->
    ${points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--color-accent)" stroke="var(--color-surface)" stroke-width="2" class="progress-point" data-peso="${p.peso}" data-date="${p.date}"/>`).join('')}

    <!-- Best session highlight -->
    ${points.length > 1 ? (() => {
      const best = points.reduce((a, b) => a.peso > b.peso ? a : b);
      return `<circle cx="${best.x}" cy="${best.y}" r="6" fill="var(--color-success)" stroke="var(--color-surface)" stroke-width="2" opacity="0.6"/>
        <text x="${best.x}" y="${best.y - 10}" text-anchor="middle" fill="var(--color-success)" font-size="10" font-weight="600">BEST</text>`;
    })() : ''}
  </svg>`;

  // Tooltip
  svg += `<div id="progress-tooltip" class="progress-tooltip hidden"></div>`;

  // Comparison note
  if (points.length >= 2) {
    const last = points[points.length - 1];
    const prev = points[points.length - 2];
    const diff = last.peso - prev.peso;
    const diffClass = diff > 0 ? 'text-success' : diff < 0 ? 'text-error' : 'text-muted';
    svg += `<p class="progress-compare ${diffClass}">
      ${diff > 0 ? '▲' : diff < 0 ? '▼' : '—'} ${Math.abs(diff).toFixed(1)}kg dall'ultima sessione
    </p>`;
  }

  container.innerHTML = svg;

  // Tooltip event listeners
  container.querySelectorAll('.progress-point').forEach(el => {
    el.addEventListener('touchstart', (e) => showProgressTooltip(e, el));
    el.addEventListener('mouseenter', (e) => showProgressTooltip(e, el));
    el.addEventListener('mouseleave', () => hideProgressTooltip());
  });
}
```

- [ ] **Step 2: Add progress graph CSS**

```css
.progress-svg {
  width: 100%;
  height: auto;
}

.progress-point {
  cursor: pointer;
  transition: r var(--transition-fast);
}

.progress-point:hover {
  r: 6;
}

.progress-tooltip {
  position: absolute;
  background: var(--color-text-primary);
  color: var(--color-surface);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  pointer-events: none;
  z-index: 10;
  white-space: nowrap;
}

.progress-compare {
  font-size: var(--text-sm);
  margin-top: var(--space-2);
  text-align: center;
}
```

- [ ] **Step 3: Test**

Open Analisi, click on an exercise, verify graph renders with tooltip on hover/touch, best marker shows, comparison text shows.

- [ ] **Step 4: Commit**

```bash
git add app.js style.css
git commit -m "feat: enhance progress graph with tooltips and comparison"
```

---

### Task 9: New Tendenze section in Analisi

**Files:**
- Modify: `app.js`
- Modify: `style.css`

- [ ] **Step 1: Add getWeeklyVolumeHistory helper**

```javascript
function getWeeklyVolumeHistory() {
  const weeks = {};
  state.workoutHistory.forEach(w => {
    const d = new Date(w.data);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay() + 1);
    const key = weekStart.toISOString().split('T')[0];
    if (!weeks[key]) weeks[key] = { settimana: key, volume: 0 };
    weeks[key].volume += w.esercizi.reduce((sum, e) =>
      sum + e.serie.filter(s => s.completato).length, 0);
  });
  return Object.values(weeks).sort((a, b) => a.settimana.localeCompare(b.settimana));
}
```

- [ ] **Step 2: Add Tendenze section after muscle volume in Analisi view**

```javascript
function renderTendenze() {
  const weeklyVolume = getWeeklyVolumeHistory();
  if (weeklyVolume.length < 2) {
    return `<div class="card"><p class="text-muted">Dati insufficienti. Completa qualche allenamento per vedere le tendenze.</p></div>`;
  }

  const maxVol = Math.max(...weeklyVolume.map(w => w.volume));
  const padding = 40;
  const width = Math.max(320, document.getElementById('view-analisi').clientWidth - 32);
  const height = 180;
  const graphW = width - padding * 2;
  const graphH = height - padding * 2;

  const points = weeklyVolume.map((w, i) => ({
    x: padding + (i / (weeklyVolume.length - 1)) * graphW,
    y: padding + graphH - (w.volume / (maxVol || 1)) * graphH,
    vol: w.volume,
    week: w.settimana
  }));

  let svg = `<svg width="${width}" height="${height}" class="progress-svg">
    <polyline points="${points.map(p => `${p.x},${p.y}`).join(' ')}" fill="none" stroke="var(--color-info)" stroke-width="2" stroke-linejoin="round"/>
    ${points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="3" fill="var(--color-info)"/>`).join('')}
    <!-- Trend line (linear regression) -->
    ${renderTrendLine(points, padding, maxVol)}
  </svg>`;

  // Trend direction
  const first = weeklyVolume[0].volume;
  const last = weeklyVolume[weeklyVolume.length - 1].volume;
  const trend = last - first;
  const trendClass = trend > 0 ? 'text-success' : trend < 0 ? 'text-error' : 'text-muted';
  const trendIcon = trend > 0 ? '▲' : trend < 0 ? '▼' : '—';

  return `<div class="card">
    <h3 class="card-title">Tendenze volume settimanale</h3>
    ${svg}
    <p class="progress-compare ${trendClass}">
      ${trendIcon} ${Math.abs(trend)} set ${trend > 0 ? 'in aumento' : trend < 0 ? 'in calo' : 'stabile'} dalla prima settimana
    </p>
  </div>`;
}

function renderTrendLine(points, padding, maxVol) {
  if (points.length < 2) return '';
  const n = points.length;
  const vals = points.map(p => p.vol);
  const sumX = points.reduce((s, p, i) => s + i, 0);
  const sumY = vals.reduce((s, v) => s + v, 0);
  const sumXY = points.reduce((s, p, i) => s + i * p.vol, 0);
  const sumX2 = points.reduce((s, p, i) => s + i * i, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const graphH = Math.max(...points.map(p => p.y)) - Math.min(...points.map(p => p.y));
  const y0 = intercept;
  const y1 = slope * (n - 1) + intercept;
  const x0 = points[0].x;
  const x1 = points[points.length - 1].x;
  const trendY0 = padding + graphH - (y0 / maxVol) * graphH;
  const trendY1 = padding + graphH - (y1 / maxVol) * graphH;
  return `<line x1="${x0}" y1="${trendY0}" x2="${x1}" y2="${trendY1}" stroke="var(--color-text-muted)" stroke-width="1" stroke-dasharray="4" opacity="0.5"/>`;
}
```

- [ ] **Step 3: Integrate into renderAnalisi**

```javascript
function renderAnalisi() {
  let html = `...existing volume analysis...`;
  html += renderTendenze();
  container.innerHTML = html;
}
```

- [ ] **Step 4: Test**

Open Analisi with some history data, verify trends section shows with line chart, trend direction indicator.

- [ ] **Step 5: Commit**

```bash
git add app.js style.css
git commit -m "feat: add weekly volume trends section"
```

---

### Task 10: Storico — calendar view

**Files:**
- Modify: `app.js`
- Modify: `style.css`

- [ ] **Step 1: Add calendar month rendering to renderStorico**

```javascript
function renderCalendarMonth(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const weeks = getWeeklyVolumeHistory();
  const dayVolumes = {};

  // Map workout history to day volumes
  state.workoutHistory.forEach(w => {
    const d = new Date(w.data);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const vol = w.esercizi.reduce((sum, e) =>
        sum + e.serie.filter(s => s.completato).length, 0);
      dayVolumes[d.getDate()] = vol;
    }
  });

  // Calculate month stats
  const totalSessions = Object.keys(dayVolumes).length;
  const totalVolume = Object.values(dayVolumes).reduce((a, b) => a + b, 0);
  const avgVolume = totalSessions > 0 ? Math.round(totalVolume / totalSessions) : 0;

  const monthNames = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
    'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];

  let html = `<div class="calendar-header">
    <button class="btn btn-ghost btn-sm" onclick="changeMonth(-1)">‹</button>
    <span class="calendar-month-title">${monthNames[month]} ${year}</span>
    <button class="btn btn-ghost btn-sm" onclick="changeMonth(1)">›</button>
  </div>
  <div class="calendar-stats">
    <div class="stat"><span class="stat-value">${totalSessions}</span> sessioni</div>
    <div class="stat"><span class="stat-value">${totalVolume}</span> set totali</div>
    <div class="stat"><span class="stat-value">${avgVolume}</span> media/sess</div>
  </div>
  <div class="calendar-grid">
    <div class="calendar-day-header">Dom</div>
    <div class="calendar-day-header">Lun</div>
    <div class="calendar-day-header">Mar</div>
    <div class="calendar-day-header">Mer</div>
    <div class="calendar-day-header">Gio</div>
    <div class="calendar-day-header">Ven</div>
    <div class="calendar-day-header">Sab</div>`;

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    html += `<div class="calendar-day empty"></div>`;
  }

  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const vol = dayVolumes[day];
    const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    const volumeClass = vol > 20 ? 'high' : vol > 10 ? 'medium' : vol > 0 ? 'low' : '';
    const hasWorkout = vol !== undefined;

    html += `<div class="calendar-day ${volumeClass}${isToday ? ' today' : ''}${hasWorkout ? ' has-workout' : ''}"
      ${hasWorkout ? `onclick="showDayWorkouts(${year}, ${month + 1}, ${day})"` : ''}>
      <span class="calendar-day-num">${day}</span>
      ${vol ? `<span class="calendar-day-vol">${vol}</span>` : ''}
    </div>`;
  }

  html += `</div>`;
  return html;
}
```

- [ ] **Step 2: Add calendar CSS**

```css
/* === CALENDAR === */
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
}

.calendar-month-title {
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  font-weight: 600;
}

.calendar-stats {
  display: flex;
  justify-content: space-around;
  padding: 0 var(--space-4) var(--space-4);
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-accent);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--color-border);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  margin: 0 var(--space-4) var(--space-4);
}

.calendar-day-header {
  background: var(--color-surface);
  padding: var(--space-2);
  text-align: center;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-weight: 600;
  text-transform: uppercase;
}

.calendar-day {
  background: var(--color-surface);
  min-height: 48px;
  padding: var(--space-1);
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: default;
}

.calendar-day.empty {
  background: var(--color-bg);
}

.calendar-day.has-workout {
  cursor: pointer;
}

.calendar-day.today .calendar-day-num {
  background: var(--color-accent);
  color: white;
  border-radius: var(--radius-full);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-day-num {
  font-size: var(--text-sm);
  font-weight: 500;
}

.calendar-day-vol {
  font-size: 10px;
  color: var(--color-text-muted);
}

.calendar-day.low { background: var(--color-info-light); }
.calendar-day.medium { background: var(--color-accent-light); }
.calendar-day.high { background: var(--color-success-light); }

/* Toggle between calendar and list view */
.storico-toggle {
  display: flex;
  gap: var(--space-2);
  padding: 0 var(--space-4);
  margin-bottom: var(--space-4);
}
```

- [ ] **Step 3: Update renderStorico to include calendar with toggle**

```javascript
function renderStorico() {
  const container = document.getElementById('view-storico');
  const year = state.calendarYear || new Date().getFullYear();
  const month = state.calendarMonth || new Date().getMonth();
  const viewMode = state.storicoView || 'calendar';

  let html = `<div class="view-header">
    <h1 class="view-title">Storico</h1>
  </div>
  <div class="storico-toggle">
    <button class="toggle-btn${viewMode === 'calendar' ? ' active' : ''}" onclick="setStoricoView('calendar')">Calendario</button>
    <button class="toggle-btn${viewMode === 'list' ? ' active' : ''}" onclick="setStoricoView('list')">Settimane</button>
  </div>`;

  if (viewMode === 'calendar') {
    html += renderCalendarMonth(year, month);
  } else {
    html += renderExistingWeeklyView();
  }

  container.innerHTML = html;
}
```

- [ ] **Step 4: Add helper functions for calendar state**

```javascript
// At top of app.js in state section, add:
state.calendarYear = new Date().getFullYear();
state.calendarMonth = new Date().getMonth();
state.storicoView = 'calendar'; // 'calendar' or 'list'

// Add event handler functions:
function changeMonth(delta) {
  state.calendarMonth += delta;
  if (state.calendarMonth < 0) { state.calendarMonth = 11; state.calendarYear--; }
  if (state.calendarMonth > 11) { state.calendarMonth = 0; state.calendarYear++; }
  renderStorico();
}

function showDayWorkouts(year, month, day) {
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const dayWorkouts = state.workoutHistory.filter(w => w.data === dateStr);
  if (dayWorkouts.length === 0) return;
  // Use existing workout detail modal logic
  let html = dayWorkouts.map(w => renderWorkoutDetail(w)).join('');
  showModal(html);
}

function setStoricoView(mode) {
  state.storicoView = mode;
  renderStorico();
}
```

- [ ] **Step 5: Test**

Open Storico view, verify calendar renders, toggle between calendar and list, click days with workouts.

- [ ] **Step 5: Commit**

```bash
git add app.js style.css
git commit -m "feat: add monthly calendar view to storico"
```

---

### Task 11: Programma — tab/giorni layout

**Files:**
- Modify: `app.js`
- Modify: `style.css`

- [ ] **Step 1: Rewrite renderProgramma with day tabs**

```javascript
function renderProgramma() {
  const container = document.getElementById('view-programma');
  const templates = state.templates;
  const currentDay = state.programmaDay || 0;

  let html = `<div class="view-header">
    <h1 class="view-title">Programma</h1>
    <span class="fase-badge">Fase ${state.fase}</span>
  </div>`;

  // Day tabs
  html += `<div class="programma-tabs">`;
  const dayNames = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì'];
  templates.forEach((t, i) => {
    const isActive = i === currentDay;
    const isDone = state.workoutHistory.some(w => w.giorno === t.giorno &&
      w.data === new Date().toISOString().split('T')[0]);
    html += `<button class="programma-tab ${isActive ? 'active' : ''}" onclick="setProgrammaDay(${i})">
      <span class="programma-tab-day">${dayNames[i]}</span>
      <span class="programma-tab-name">${t.nome}</span>
      ${isDone ? '<span class="material-symbols-outlined text-success">check_circle</span>' : ''}
    </button>`;
  });
  html += `</div>`;

  // Selected day detail
  const template = templates[currentDay];
  if (template) {
    html += `<div class="programma-detail">
      <h2 class="programma-detail-title">${template.nome}</h2>`;
    template.esercizi.forEach(ex => {
      const repsDisplay = ex.serie.length > 0
        ? `${ex.serie.length} × ${ex.serie[0].ripetizioni || ex.reps} reps`
        : `${ex.reps} reps`;
      html += `<div class="programma-exercise">
        <div class="programma-exercise-name">${ex.nome}</div>
        <div class="programma-exercise-details">
          <span class="badge">${repsDisplay}</span>
          <span class="badge">Rec ${ex.rest || 90}s</span>
          ${ex.rpe ? `<span class="badge">RPE ${ex.rpe}</span>` : ''}
        </div>
      </div>`;
    });
    html += `</div>`;
  }

  // Weekly overview
  html += `<div class="programma-weekly">
    <h3 class="section-title">Schema settimanale</h3>
    <div class="programma-week-grid">
      ${dayNames.map((name, i) => {
        const t = templates[i];
        return `<div class="programma-week-cell" onclick="setProgrammaDay(${i})">
          <div class="week-cell-day">${name.substring(0, 3)}</div>
          <div class="week-cell-name">${t ? t.nome : ''}</div>
        </div>`;
      }).join('')}
    </div>
  </div>`;

  container.innerHTML = html;
}
```

- [ ] **Step 2: Add Programma CSS**

```css
.programma-tabs {
  display: flex;
  overflow-x: auto;
  gap: var(--space-2);
  padding: 0 var(--space-4) var(--space-4);
  -webkit-overflow-scrolling: touch;
}

.programma-tab {
  flex: 1;
  min-width: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.programma-tab.active {
  border-color: var(--color-accent);
  background: var(--color-accent-light);
}

.programma-tab-day {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
}

.programma-tab-name {
  font-weight: 600;
  font-size: var(--text-sm);
}

.programma-detail {
  padding: 0 var(--space-4);
}

.programma-exercise {
  padding: var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.programma-exercise:last-child {
  border-bottom: none;
}

.programma-exercise-name {
  font-weight: 500;
  margin-bottom: var(--space-1);
}

.programma-exercise-details {
  display: flex;
  gap: var(--space-2);
}

.programma-week-grid {
  display: flex;
  gap: var(--space-2);
  padding: 0 var(--space-4) var(--space-24);
}

.programma-week-cell {
  flex: 1;
  text-align: center;
  padding: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.programma-week-cell:hover {
  border-color: var(--color-accent);
}

.week-cell-day {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.week-cell-name {
  font-size: var(--text-xs);
  font-weight: 600;
}
```

- [ ] **Step 3: Add setProgrammaDay handler**

```javascript
function setProgrammaDay(index) {
  state.programmaDay = index;
  renderProgramma();
}
```

Add `state.programmaDay = 0;` in the state initialization section.

- [ ] **Step 4: Test**

Open Programma, verify tabs work, clicking tab shows that day's workout, weekly grid is interactive.

- [ ] **Step 4: Commit**

```bash
git add app.js style.css
git commit -m "feat: redesign programma with day tabs"
```

---

### Task 12: Stati zero, loading, errori

**Files:**
- Modify: `app.js`
- Modify: `style.css`

- [ ] **Step 1: Add skeleton loading CSS**

```css
/* === SKELETON === */
.skeleton {
  background: linear-gradient(90deg,
    var(--color-surface) 25%,
    var(--color-surface-hover) 50%,
    var(--color-surface) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-md);
}

.skeleton-card {
  height: 80px;
  margin: var(--space-4);
}

.skeleton-line {
  height: 16px;
  margin-bottom: var(--space-2);
  width: 60%;
}

.skeleton-line.short { width: 40%; }
.skeleton-line.long { width: 80%; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

- [ ] **Step 2: Add empty state component**

```javascript
function renderEmptyState(icon, title, message, ctaText, ctaAction) {
  return `<div class="empty-state">
    <span class="material-symbols-outlined empty-icon">${icon}</span>
    <h3 class="empty-title">${title}</h3>
    <p class="empty-message">${message}</p>
    ${ctaText ? `<button class="btn btn-primary" onclick="${ctaAction}">${ctaText}</button>` : ''}
  </div>`;
}
```

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) var(--space-4);
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: var(--color-text-muted);
  margin-bottom: var(--space-4);
}

.empty-title {
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  margin-bottom: var(--space-2);
  color: var(--color-text-primary);
}

.empty-message {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-6);
  max-width: 280px;
}
```

- [ ] **Step 3: Add undo toast for accidental set completion**

```javascript
function handleSetClick(exIndex, setIndex) {
  const set = state.activeWorkout.esercizi[exIndex].serie[setIndex];
  const wasCompleted = set.completato;
  set.completato = !wasCompleted;
  saveCache();
  renderAllenamento();

  if (set.completato && !wasCompleted) {
    showUndoToast('Serie completata', () => {
      set.completato = false;
      saveCache();
      renderAllenamento();
    });
  }
}

function showUndoToast(message, undoAction) {
  const existing = document.getElementById('toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.className = 'toast';
  toast.innerHTML = `<span class="toast-message">${message}</span>
    <button class="toast-undo" id="toast-undo-btn">Annulla</button>`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('visible'));

  document.getElementById('toast-undo-btn').onclick = () => {
    undoAction();
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  };

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}
```

```css
.toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  background: var(--color-text-primary);
  color: var(--color-surface);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  box-shadow: var(--shadow-lg);
  z-index: 300;
  transition: transform var(--transition-base);
  white-space: nowrap;
}

.toast.visible {
  transform: translateX(-50%) translateY(0);
}

.toast-undo {
  background: none;
  border: none;
  color: var(--color-accent);
  font-weight: 600;
  font-size: var(--text-sm);
  cursor: pointer;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

.toast-undo:hover {
  background: rgba(255,255,255,0.1);
}
```

- [ ] **Step 4: Add sync feedback toast**

```javascript
async function syncWorkout(workout) {
  try {
    // Show syncing indicator
    showToast('Salvataggio...');
    // ... existing sync logic ...
    showToast('✅ Allenamento salvato');
  } catch (err) {
    console.error('Sync failed:', err);
    showToast('Dati al sicuro in locale (sync cloud fallito)');
  }
}

function showToast(message) {
  const existing = document.getElementById('toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.className = 'toast';
  toast.innerHTML = `<span class="toast-message">${message}</span>`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
```

- [ ] **Step 5: Use empty states in views**

In render functions, check for data and show empty state:

```javascript
function renderStorico() {
  if (state.workoutHistory.length === 0) {
    container.innerHTML = renderEmptyState(
      'fitness_center',
      'Nessun allenamento ancora',
      'Completa il tuo primo allenamento per vedere lo storico qui.',
      'Vai agli allenamenti',
      'switchView(\'oggi\')'
    );
    return;
  }
  // ... rest of render
}
```

- [ ] **Step 6: Test**

Open views with no data, verify empty states show. Complete a set, verify undo toast appears. Test sync toast.

- [ ] **Step 7: Commit**

```bash
git add app.js style.css
git commit -m "feat: add skeletons, empty states, undo toast, sync feedback"
```

---

### Task 13: Animazioni e micro-interazioni finali

**Files:**
- Modify: `style.css`
- Modify: `app.js`

- [ ] **Step 1: Add view entrance animations**

```css
.view.active {
  animation: fadeIn var(--transition-base) ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-slide-up {
  animation: slideUp var(--transition-base) ease-out both;
}

.animate-slide-up-stagger > * {
  animation: slideUp var(--transition-base) ease-out both;
}

.animate-slide-up-stagger > *:nth-child(1) { animation-delay: 0ms; }
.animate-slide-up-stagger > *:nth-child(2) { animation-delay: 50ms; }
.animate-slide-up-stagger > *:nth-child(3) { animation-delay: 100ms; }
.animate-slide-up-stagger > *:nth-child(4) { animation-delay: 150ms; }
.animate-slide-up-stagger > *:nth-child(5) { animation-delay: 200ms; }
```

- [ ] **Step 2: Add modal entrance animation**

```css
.modal-overlay {
  opacity: 0;
  transition: opacity var(--transition-base);
}

.modal-overlay.active {
  opacity: 1;
}

.modal-box {
  transform: scale(0.9);
  transition: transform var(--transition-base);
}

.modal-overlay.active .modal-box {
  transform: scale(1);
}
```

- [ ] **Step 3: Add hover/tap effects on cards and buttons**

```css
.btn {
  transition: all var(--transition-fast);
}

.btn:active {
  transform: scale(0.97);
}

.card {
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.card:active {
  transform: scale(0.99);
}
```

- [ ] **Step 4: Add workout pill entrance animation**

```css
#workout-pill {
  animation: slideUp var(--transition-base) ease-out;
}
```

- [ ] **Step 5: Test**

Navigate between views, open modals, tap buttons — all should have smooth transitions.

- [ ] **Step 6: Commit**

```bash
git add style.css app.js
git commit -m "feat: add view transitions and micro-interactions"
```

---

### Task 14: Sync across Workout-tracker/ subdirectory

**Files:**
- Copy: All files to `Workout-tracker/` subdirectory

- [ ] **Step 1: Copy updated files to Workout-tracker/ for GitHub Pages**

```bash
cp index.html style.css app.js docs/superpowers/specs/2026-07-06-uiux-restyling-design.md docs/superpowers/plans/2026-07-06-uiux-restyling-plan.md Workout-tracker/
```

- [ ] **Step 2: Verify GitHub Pages copy works**

Open `Workout-tracker/index.html`, verify all features work.

- [ ] **Step 3: Commit in Workout-tracker/ subdirectory**

```bash
cd Workout-tracker && git add . && git commit -m "sync: UI/UX restyling updates"
```

---

## Spec Coverage Check

| Spec Section | Task |
|---|---|
| 1. Architettura file (split) | Task 1 |
| 2. Design System | Task 2 |
| 3. Navigazione / Tab bar | Task 3 |
| ALLENAMENTI view | Task 4 |
| 4. Flusso allenamento | Task 5 |
| Timer recupero | Task 6 |
| 5. Analisi volume | Task 7 |
| Progresso esercizi | Task 8 |
| 6. Tendenze | Task 9 |
| 7. Storico calendario | Task 10 |
| 8. Programma tabs | Task 11 |
| 9. Impostazioni | (minor — deferred to separate plan) |
| 10. Stati zero/loading/errori | Task 12 |
| 11. Animazioni | Task 13 |
| Sync Workout-tracker/ | Task 14 |
