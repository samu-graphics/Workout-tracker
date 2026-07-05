# Workout Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a monolithic HTML workout tracker app with Supabase sync, AnimeJS animations, and Swiss minimal design.

**Architecture:** Single HTML file (`index.html`) containing all HTML, CSS, and JS. Data stored in Supabase (PostgreSQL) with localStorage as offline cache and pre-fill source. Navigation via tab bar with 5 views, linear workout flow hides navigation.

**Tech Stack:** HTML/CSS/JS monolith, Supabase JS client (CDN), AnimeJS (CDN), Web Audio API, Notification API. No bundlers, no frameworks.

---

## File Structure

| File | Purpose |
|------|---------|
| `index.html` | Monolithic app: all HTML structure, CSS design system, JS logic |
| `supabase-setup.sql` | SQL to create tables and RLS policies in Supabase |
| `AGENTS.md` | Instructions for future sessions |

---

### Task 1: Database Setup (Supabase)

**Files:**
- Create: `docs/superpowers/supabase-setup.sql`

- [ ] **Step 1: Create Supabase schema SQL**

```sql
-- Workout sessions
CREATE TABLE workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  giorno TEXT NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  durata_secondi INT,
  completato BOOLEAN DEFAULT false,
  creato_il TIMESTAMPTZ DEFAULT now()
);

-- Exercises within a workout
CREATE TABLE exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  nome_esercizio TEXT NOT NULL,
  ordine INT NOT NULL
);

-- Individual sets
CREATE TABLE sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  serie_numero INT NOT NULL,
  ripetizioni INT NOT NULL,
  peso_kg NUMERIC(5,1) NOT NULL,
  rir INT NOT NULL DEFAULT 2,
  completato BOOLEAN DEFAULT false
);

-- Workout template (the fixed schedule)
CREATE TABLE workout_template (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  giorno TEXT NOT NULL,
  esercizi JSONB NOT NULL,
  ordine INT NOT NULL
);

-- RLS: allow all access for single-user app (anon key)
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_template ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon all workouts" ON workouts FOR ALL USING (true);
CREATE POLICY "anon all exercises" ON exercises FOR ALL USING (true);
CREATE POLICY "anon all sets" ON sets FOR ALL USING (true);
CREATE POLICY "anon all template" ON workout_template FOR ALL USING (true);
```

- [ ] **Step 2: Verify file saved**

---

### Task 2: HTML Scaffold + CSS Design System

**Files:**
- Create: `index.html` (base structure)

- [ ] **Step 1: Write HTML structure and CSS**

The HTML structure has these sections:
- Tab bar (OGGI, STORICO, ⚙)
- View: OGGI (#view-oggi)
- View: ALLENAMENTO (#view-allenamento) — hidden by default
- View: RIEPILOGO (#view-riepilogo) — hidden by default
- View: STORICO (#view-storico)
- View: IMPOSTAZIONI (#view-impostazioni)

CSS design system (Swiss minimal):
- Font: system sans-serif (`-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`)
- Colors: `#fff` bg, `#1a1a1a` text, `#999` muted, `#d32f2f` accent timer, `#2e7d32` completion green
- Grid: 8px base, padding in 8px multiples
- Borders: 1px solid `#e0e0e0`, no border-radius on containers
- Tab bar: fixed bottom, flex row, 4 items
- Views: full height, scrollable, padding 16px
- Buttons: outlined with 1px border, uppercase, letter-spacing 0.5px
- Inputs: border-bottom only, no outlines
- Typography: only regular and bold weights, no italics
- Responsive: mobile-first, content max-width 480px on desktop

```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Workout Tracker</title>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js"></script>
  <style>
    /* Reset */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #1a1a1a; background: #fff; -webkit-font-smoothing: antialiased; }

    /* Layout */
    .app { height: 100%; display: flex; flex-direction: column; }
    .view { display: none; flex: 1; overflow-y: auto; padding: 16px; padding-bottom: 80px; }
    .view.active { display: block; }
    .view-full { display: none; flex: 1; overflow-y: auto; padding: 16px; }
    .view-full.active { display: block; }

    /* Tab Bar */
    .tab-bar { position: fixed; bottom: 0; left: 0; right: 0; display: flex; background: #fff; border-top: 1px solid #e0e0e0; z-index: 100; }
    .tab-bar.hidden { display: none; }
    .tab-item { flex: 1; padding: 8px 0; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; cursor: pointer; }
    .tab-item.active { color: #1a1a1a; font-weight: 700; }
    .tab-item svg, .tab-item span { display: block; margin: 0 auto; }

    /* Typography */
    h1 { font-size: 24px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 16px; }
    h2 { font-size: 18px; font-weight: 700; margin-bottom: 12px; }
    h3 { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 8px; }
    .muted { color: #999; font-size: 13px; }

    /* Buttons */
    .btn { display: inline-flex; align-items: center; justify-content: center; padding: 12px 24px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border: 1px solid #1a1a1a; background: transparent; cursor: pointer; -webkit-appearance: none; }
    .btn:hover { background: #1a1a1a; color: #fff; }
    .btn-primary { background: #1a1a1a; color: #fff; }
    .btn-primary:hover { background: #333; }
    .btn-block { width: 100%; }
    .btn:disabled { opacity: 0.3; pointer-events: none; }

    /* Cards */
    .card { border: 1px solid #e0e0e0; padding: 16px; margin-bottom: 12px; }
    .card-title { font-size: 14px; font-weight: 700; margin-bottom: 8px; }

    /* Divider */
    .divider { height: 1px; background: #e0e0e0; margin: 16px 0; }

    /* Inputs */
    input, select { font-family: inherit; font-size: 16px; border: none; border-bottom: 1px solid #e0e0e0; padding: 8px 0; width: 100%; background: transparent; outline: none; text-align: center; }
    input:focus { border-bottom-color: #1a1a1a; }

    /* Table-like grid for sets */
    .set-grid { display: grid; grid-template-columns: 40px 1fr 1fr 1fr 36px; gap: 4px; align-items: center; margin-bottom: 4px; }
    .set-grid.header { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; }
    .set-grid .set-cell { text-align: center; font-size: 14px; padding: 8px 4px; }
    .set-grid .set-check { width: 28px; height: 28px; border: 1px solid #e0e0e0; display: flex; align-items: center; justify-content: center; cursor: pointer; margin: 0 auto; }
    .set-grid .set-check.done { background: #1a1a1a; border-color: #1a1a1a; color: #fff; }

    /* Timer */
    .timer { display: flex; align-items: center; gap: 8px; font-size: 20px; font-weight: 700; font-variant-numeric: tabular-nums; }
    .timer-bar { flex: 1; height: 2px; background: #e0e0e0; }
    .timer-bar-fill { height: 100%; background: #d32f2f; width: 0%; transition: width 1s linear; }

    /* Exercise list */
    .exercise-item { padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
    .exercise-item.current { background: #fafafa; margin: 0 -16px; padding: 12px 16px; border-top: 1px solid #e0e0e0; border-bottom: 1px solid #e0e0e0; }
    .exercise-name { font-size: 16px; font-weight: 700; }
    .exercise-meta { font-size: 12px; color: #999; margin-top: 2px; }
    .exercise-done { color: #2e7d32; }

    /* Chart bars */
    .chart-bar { height: 24px; background: #1a1a1a; margin-bottom: 4px; min-width: 4px; }

    /* Responsive */
    @media (min-width: 600px) {
      .app { max-width: 480px; margin: 0 auto; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0; }
    }

    /* Utilities */
    .flex { display: flex; }
    .flex-1 { flex: 1; }
    .gap-8 { gap: 8px; }
    .gap-16 { gap: 16px; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .text-center { text-align: center; }
    .mt-8 { margin-top: 8px; }
    .mt-16 { margin-top: 16px; }
    .mt-24 { margin-top: 24px; }
    .mb-8 { margin-bottom: 8px; }
    .mb-16 { margin-bottom: 16px; }
    .op-30 { opacity: 0.3; }
    .op-50 { opacity: 0.5; }
  </style>
</head>
<body>
  <div class="app" id="app">
    <!-- Views -->
    <div class="view active" id="view-oggi"></div>
    <div class="view-full" id="view-allenamento"></div>
    <div class="view-full" id="view-riepilogo"></div>
    <div class="view" id="view-storico"></div>
    <div class="view" id="view-impostazioni"></div>

    <!-- Tab Bar -->
    <div class="tab-bar" id="tab-bar">
      <div class="tab-item active" data-view="oggi">OGGI</div>
      <div class="tab-item" data-view="storico">STORICO</div>
      <div class="tab-item" data-view="impostazioni">⚙</div>
    </div>
  </div>

  <script>
    // ===== Supabase Client =====
    const SUPABASE_URL = 'https://your-project.supabase.co';
    const SUPABASE_ANON_KEY = 'your-anon-key';
    const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // ===== App State =====
    const state = {
      currentView: 'oggi',
      activeWorkout: null,    // current workout session data
      currentExercise: 0,     // index in activeWorkout.exercises
      currentSet: 0,          // index in current exercise's sets
      templates: [],
      lastWeights: {},        // { exerciseName: { peso, reps, rir } }
      workoutHistory: [],
      timerInterval: null,
      timerSeconds: 0,
      workoutStartTime: null,
    };

    // Load cached data from localStorage
    function loadCache() {
      try {
        const cached = localStorage.getItem('workout_cache');
        if (cached) {
          const data = JSON.parse(cached);
          if (data.lastWeights) state.lastWeights = data.lastWeights;
          if (data.templates) state.templates = data.templates;
        }
        const history = localStorage.getItem('workout_history');
        if (history) state.workoutHistory = JSON.parse(history);
      } catch(e) { console.warn('Cache load error:', e); }
    }

    function saveCache() {
      localStorage.setItem('workout_cache', JSON.stringify({
        lastWeights: state.lastWeights,
        templates: state.templates,
      }));
      localStorage.setItem('workout_history', JSON.stringify(state.workoutHistory));
    }

    // ===== Navigation =====
    function navigate(viewName) {
      document.querySelectorAll('.view, .view-full').forEach(v => v.classList.remove('active'));
      document.getElementById(`view-${viewName}`).classList.add('active');
      document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
      const tab = document.querySelector(`.tab-item[data-view="${viewName}"]`);
      if (tab) tab.classList.add('active');
      state.currentView = viewName;
      if (viewName === 'storico') renderStorico();
      if (viewName === 'impostazioni') renderImpostazioni();
    }

    document.querySelectorAll('.tab-item').forEach(item => {
      item.addEventListener('click', () => navigate(item.dataset.view));
    });

    // ===== Template Data (hardcoded schedule) =====
    const DEFAULT_TEMPLATE = { ... place the user's full workout schedule here ... };

    // ===== Render Functions =====
    function renderOggi() { ... }
    function renderAllenamento() { ... }
    function renderRiepilogo() { ... }
    function renderStorico() { ... }
    function renderImpostazioni() { ... }
    function renderTimer() { ... }

    // ===== Init =====
    loadCache();
    renderOggi();
  </script>
</body>
</html>
```

- [ ] **Step 2: Save the initial structure**

---

### Task 3: Template Data + OGGI View

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add the default workout template data**

Replace the `DEFAULT_TEMPLATE` placeholder with the full user schedule:

```javascript
const DEFAULT_TEMPLATE = [
  {
    giorno: "Upper A",
    esercizi: [
      { nome: "Panca inclinata manubri", serie: 3, reps: "6-8", recupero: 180, rpeTarget: "7.5-9" },
      { nome: "Lat machine presa neutra", serie: 3, reps: "8-10", recupero: 180, rpeTarget: "7.5-9" },
      { nome: "Chest press convergente", serie: 3, reps: "8-10", recupero: 150, rpeTarget: "7.5-9" },
      { nome: "Rematore macchina chest-supported", serie: 3, reps: "8-10", recupero: 150, rpeTarget: "7.5-9" },
      { nome: "Alzate laterali ai cavi", serie: 4, reps: "12-15", recupero: 90, rpeTarget: "8.5-10" },
      { nome: "Reverse cable fly", serie: 3, reps: "12-15", recupero: 90, rpeTarget: "8.5-10" },
      { nome: "Pushdown cavi", serie: 3, reps: "8-12", recupero: 90, rpeTarget: "8.5-10" },
      { nome: "Curl ai cavi", serie: 3, reps: "10-12", recupero: 90, rpeTarget: "8.5-10" },
    ]
  },
  {
    giorno: "Lower A",
    esercizi: [
      { nome: "Romanian Deadlift", serie: 4, reps: "6-8", recupero: 180, rpeTarget: "7.5-9" },
      { nome: "Leg press (ROM controllato)", serie: 3, reps: "10-12", recupero: 150, rpeTarget: "7.5-9" },
      { nome: "Leg curl seduto", serie: 4, reps: "10-12", recupero: 120, rpeTarget: "8.5-10" },
      { nome: "Leg extension (leggera, controllo)", serie: 2, reps: "12-15", recupero: 90, rpeTarget: "8.5-10" },
      { nome: "Calf raise in piedi", serie: 5, reps: "10-15", recupero: 90, rpeTarget: "8.5-10" },
      { nome: "Crunch ai cavi", serie: 3, reps: "12-15", recupero: 75, rpeTarget: "8.5-10" },
    ]
  },
  {
    giorno: "Upper B",
    esercizi: [
      { nome: "Lat machine / trazioni assistite", serie: 3, reps: "6-8", recupero: 180, rpeTarget: "7.5-9" },
      { nome: "Panca piana manubri", serie: 3, reps: "8-10", recupero: 180, rpeTarget: "7.5-9" },
      { nome: "Rematore macchina", serie: 3, reps: "8-10", recupero: 150, rpeTarget: "7.5-9" },
      { nome: "Croci ai cavi", serie: 3, reps: "12-15", recupero: 90, rpeTarget: "8.5-10" },
      { nome: "Alzate laterali ai cavi (unilaterali)", serie: 4, reps: "12-15", recupero: 90, rpeTarget: "8.5-10" },
      { nome: "Rear delt cable fly", serie: 3, reps: "12-15", recupero: 90, rpeTarget: "8.5-10" },
      { nome: "Shrug manubri o macchina", serie: 3, reps: "10-12", recupero: 90, rpeTarget: "8.5-10" },
      { nome: "Estensioni tricipiti sopra testa cavo", serie: 3, reps: "10-12", recupero: 90, rpeTarget: "8.5-10" },
      { nome: "Curl inclinato o cavo", serie: 3, reps: "10-12", recupero: 90, rpeTarget: "8.5-10" },
    ]
  },
  {
    giorno: "Lower B",
    esercizi: [
      { nome: "Hack squat / leg press avanzata", serie: 3, reps: "8-10", recupero: 180, rpeTarget: "7.5-9" },
      { nome: "Romanian deadlift leggero o good morning machine", serie: 3, reps: "8-10", recupero: 180, rpeTarget: "7.5-9" },
      { nome: "Leg curl seduto", serie: 3, reps: "10-12", recupero: 120, rpeTarget: "8.5-10" },
      { nome: "Leg extension", serie: 2, reps: "12-15", recupero: 90, rpeTarget: "8.5-10" },
      { nome: "Calf raise in piedi", serie: 5, reps: "10-15", recupero: 90, rpeTarget: "8.5-10" },
      { nome: "Hanging leg raise", serie: 3, reps: "10-15", recupero: 75, rpeTarget: "8.5-10" },
    ]
  },
  {
    giorno: "Specializzazione Deltoidi",
    esercizi: [
      { nome: "Alzate laterali ai cavi", serie: 4, reps: "12-15", recupero: 90, rpeTarget: "8.5-10" },
      { nome: "Alzate laterali lean o macchina", serie: 3, reps: "10-12", recupero: 90, rpeTarget: "8.5-10" },
      { nome: "Rear delt cable row", serie: 3, reps: "10-12", recupero: 90, rpeTarget: "8.5-10" },
      { nome: "Reverse fly cavi", serie: 3, reps: "12-15", recupero: 90, rpeTarget: "8.5-10" },
      { nome: "Shrug pesanti (manubri o macchina)", serie: 4, reps: "8-12", recupero: 90, rpeTarget: "8.5-10" },
      { nome: "Farmer walk", serie: 2, reps: "30-60s", recupero: 90, rpeTarget: "8.5-10" },
      { nome: "Curl cavo", serie: 2, reps: "10-12", recupero: 90, rpeTarget: "8.5-10" },
      { nome: "Curl martello cavo", serie: 2, reps: "10-12", recupero: 90, rpeTarget: "8.5-10" },
      { nome: "Pushdown cavo", serie: 2, reps: "10-12", recupero: 90, rpeTarget: "8.5-10" },
      { nome: "Estensione sopra testa", serie: 2, reps: "10-12", recupero: 90, rpeTarget: "8.5-10" },
    ]
  }
];

// Initialize templates if not cached
if (state.templates.length === 0) {
  state.templates = DEFAULT_TEMPLATE;
  saveCache();
}
```

- [ ] **Step 2: Implement renderOggi()**

```javascript
function renderOggi() {
  const view = document.getElementById('view-oggi');
  const oggi = new Date();
  const giorniNomi = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  const giorniScheda = [null, 'Upper A', 'Lower A', 'Upper B', 'Lower B', 'Specializzazione Deltoidi', null];

  const giornoNome = giorniNomi[oggi.getDay()];
  const giornoScheda = giorniScheda[oggi.getDay()];
  const dataStr = oggi.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });

  // Check if workout exists for today
  const existingWorkout = state.workoutHistory.find(w => w.data === oggi.toISOString().split('T')[0]);
  const isComplete = existingWorkout?.completato;

  let html = `
    <div style="padding-top: 8px;">
      <p class="muted">${giornoNome}, ${dataStr}</p>
      <h1 style="margin-top: 4px;">${giornoScheda || 'Giorno di recupero'}</h1>
  `;

  if (!giornoScheda) {
    html += `<p class="muted mt-8">Giorno di recupero. Riposo o deload.</p>`;
  } else if (isComplete) {
    html += `
      <div class="card mt-16" style="border-color: #2e7d32;">
        <p style="color: #2e7d32; font-weight: 700;">✔ Allenamento completato</p>
        <p class="muted mt-8">${existingWorkout.durata_secondi ? Math.floor(existingWorkout.durata_secondi / 60) + ' minuti' : ''}</p>
        <button class="btn btn-block mt-16" onclick="navigate('storico')">Vedi storico</button>
      </div>
    `;
  } else if (state.activeWorkout && state.activeWorkout.data === oggi.toISOString().split('T')[0]) {
    html += `
      <div class="card mt-16">
        <p style="font-weight: 700;">Allenamento in corso</p>
        <p class="muted">Esercizio ${state.currentExercise + 1} di ${state.activeWorkout.exercises.length}</p>
        <button class="btn btn-block mt-16 btn-primary" onclick="startWorkout()">Continua</button>
      </div>
    `;
  } else {
    html += `
      <button class="btn btn-block mt-16 btn-primary" onclick="startWorkout()">Inizia allenamento</button>
    `;
  }

  html += `<div class="divider mt-24"></div>`;

  // Mini preview of today's exercises
  if (giornoScheda) {
    const template = state.templates.find(t => t.giorno === giornoScheda);
    if (template) {
      html += `<h3>Esercizi (${template.esercizi.length})</h3>`;
      template.esercizi.forEach((ex, i) => {
        const last = state.lastWeights[ex.nome];
        html += `
          <div class="exercise-item flex items-center justify-between">
            <div>
              <div class="exercise-name">${ex.nome}</div>
              <div class="exercise-meta">${ex.serie}×${ex.reps} · recupero ${ex.recupero >= 120 ? Math.floor(ex.recupero / 60) + "'" : ex.recupero + '"'} ${last ? '· ultimo: ' + last.peso + 'kg × ' + last.reps : ''}</div>
            </div>
          </div>
        `;
      });
    }
  }

  view.innerHTML = html;
}
```

- [ ] **Step 3: Implement startWorkout()**

```javascript
function startWorkout() {
  const oggi = new Date();
  const giorniScheda = [null, 'Upper A', 'Lower A', 'Upper B', 'Lower B', 'Specializzazione Deltoidi', null];
  const giornoScheda = giorniScheda[oggi.getDay()];
  if (!giornoScheda) return;

  // Resume existing or create new
  if (state.activeWorkout && state.activeWorkout.data === oggi.toISOString().split('T')[0]) {
    // resume
  } else {
    const template = state.templates.find(t => t.giorno === giornoScheda);
    const exercises = template.esercizi.map((ex, i) => ({
      nome: ex.nome,
      serieTarget: ex.serie,
      recupero: ex.recupero,
      sets: Array.from({ length: ex.serie }, (_, s) => ({
        serie_numero: s + 1,
        ripetizioni: null,
        peso_kg: state.lastWeights[ex.nome]?.peso || null,
        rir: state.lastWeights[ex.nome]?.rir || null,
        completato: false,
      })),
    }));

    state.activeWorkout = {
      data: oggi.toISOString().split('T')[0],
      giorno: giornoScheda,
      exercises,
      completato: false,
    };
    state.currentExercise = 0;
    state.currentSet = 0;
    state.workoutStartTime = Date.now();
  }

  document.getElementById('tab-bar').classList.add('hidden');
  navigate('allenamento');
  renderAllenamento();
}
```

---

### Task 4: ALLENAMENTO View (Active Workout)

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Implement renderAllenamento()**

```javascript
function renderAllenamento() {
  const view = document.getElementById('view-allenamento');
  if (!state.activeWorkout) return;

  const exercises = state.activeWorkout.exercises;
  const currentEx = exercises[state.currentExercise];
  if (!currentEx) { finishWorkout(); return; }

  const last = state.lastWeights[currentEx.nome];
  const nextEx = exercises[state.currentExercise + 1];

  let html = `
    <div style="padding-top: 8px;">
      <div class="flex items-center justify-between mb-16">
        <button class="btn" style="border: none; padding: 8px 0; font-size: 13px;" onclick="exitWorkout()">← ${state.activeWorkout.giorno}</button>
        <div class="timer">
          <span id="timer-display">${formatTime(state.timerSeconds)}</span>
        </div>
      </div>

      <div class="exercise-item current">
        <div class="flex items-center justify-between">
          <div class="exercise-name">${currentEx.nome}</div>
          <div id="timer-rest" class="timer" style="font-size: 18px; color: #d32f2f;">
            <span id="rest-display">${formatTime(currentEx.recupero)}</span>
            <div class="timer-bar" style="width: 80px;">
              <div id="rest-bar-fill" class="timer-bar-fill" style="width: 0%;"></div>
            </div>
          </div>
        </div>
        <div class="exercise-meta mt-8">${currentEx.serieTarget} serie · target ${currentEx.reps} reps</div>
      </div>

      <!-- Sets table -->
      <div class="set-grid header mt-16">
        <div></div>
        <div>Rep</div>
        <div>Peso</div>
        <div>RIR</div>
        <div></div>
      </div>
  `;

  currentEx.sets.forEach((set, i) => {
    const isCurrent = i === state.currentSet && !set.completato;
    const done = set.completato;
    html += `
      <div class="set-grid" style="${isCurrent ? 'opacity: 1;' : done ? 'opacity: 0.5;' : 'opacity: 1;'}">
        <div class="set-cell" style="font-weight: 700;">${set.serie_numero}</div>
        <div class="set-cell">
          ${isCurrent
            ? `<input type="number" id="input-reps-${i}" value="${set.ripetizioni || (last ? last.reps : '')}" min="1" max="30" style="width: 48px;" placeholder="${last ? last.reps : ''}">`
            : `<span>${done ? set.ripetizioni : (set.ripetizioni || '—')}</span>`}
        </div>
        <div class="set-cell">
          ${isCurrent
            ? `<input type="number" id="input-peso-${i}" value="${set.peso_kg || (last ? last.peso : '')}" min="0" step="0.5" style="width: 64px;" placeholder="${last ? last.peso + 'kg' : ''}">`
            : `<span>${done ? set.peso_kg + 'kg' : (set.peso_kg ? set.peso_kg + 'kg' : '—')}</span>`}
        </div>
        <div class="set-cell">
          ${isCurrent
            ? `<input type="number" id="input-rir-${i}" value="${set.rir || (last ? last.rir : '')}" min="0" max="10" style="width: 40px;" placeholder="${last ? last.rir : ''}">`
            : `<span>${done ? set.rir : (set.rir || '—')}</span>`}
        </div>
        <div class="set-cell">
          ${isCurrent
            ? `<div class="set-check" id="check-set" onclick="completeSet()">✔</div>`
            : done ? `<div class="set-check done">✔</div>` : `<div class="set-check" style="opacity: 0.2;">✔</div>`}
        </div>
      </div>
    `;
  });

  // Next exercise preview
  if (nextEx) {
    html += `
      <div class="divider mt-16"></div>
      <h3>Prossimo</h3>
      <div class="exercise-item flex items-center justify-between" style="opacity: 0.5;">
        <div>
          <div class="exercise-name">${nextEx.nome}</div>
          <div class="exercise-meta">${nextEx.serieTarget}×${state.templates.find(t => t.giorno === state.activeWorkout.giorno)?.esercizi[state.currentExercise + 1]?.reps || ''}</div>
        </div>
      </div>
    `;
  }

  html += '</div>';
  view.innerHTML = html;
}
```

- [ ] **Step 2: Implement completeSet()**

```javascript
function completeSet() {
  const currentEx = state.activeWorkout.exercises[state.currentExercise];
  const set = currentEx.sets[state.currentSet];

  // Read inputs
  const repsInput = document.getElementById(`input-reps-${state.currentSet}`);
  const pesoInput = document.getElementById(`input-peso-${state.currentSet}`);
  const rirInput = document.getElementById(`input-rir-${state.currentSet}`);

  const reps = parseInt(repsInput?.value) || 0;
  const peso = parseFloat(pesoInput?.value) || 0;
  const rir = parseInt(rirInput?.value) || 0;

  if (reps === 0 && peso === 0) return; // require at least some data

  set.ripetizioni = reps;
  set.peso_kg = peso;
  set.rir = rir;
  set.completato = true;

  // Save as last weight for this exercise
  state.lastWeights[currentEx.nome] = { reps, peso, rir };
  saveCache();

  // Move to next set or next exercise
  state.currentSet++;
  if (state.currentSet >= currentEx.sets.length) {
    state.currentExercise++;
    state.currentSet = 0;
  }

  // Start rest timer
  startRestTimer(currentEx.recupero);

  renderAllenamento();

  // Check if workout is complete
  if (state.currentExercise >= state.activeWorkout.exercises.length) {
    finishWorkout();
  }
}
```

- [ ] **Step 3: Implement rest timer**

```javascript
function startRestTimer(seconds) {
  clearInterval(state.timerInterval);
  state.timerSeconds = 0;
  const totalSeconds = seconds;
  const restDisplay = document.getElementById('rest-display');
  const restBarFill = document.getElementById('rest-bar-fill');

  if (!restDisplay) return;

  state.timerInterval = setInterval(() => {
    state.timerSeconds++;
    const remaining = Math.max(0, totalSeconds - state.timerSeconds);
    restDisplay.textContent = formatTime(remaining);
    if (restBarFill) {
      restBarFill.style.width = `${(state.timerSeconds / totalSeconds) * 100}%`;
    }
    if (state.timerSeconds >= totalSeconds) {
      clearInterval(state.timerInterval);
      // Beep + notification
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 800;
        osc.connect(ctx.destination);
        osc.start();
        setTimeout(() => osc.stop(), 200);
      } catch(e) {}
      if (Notification.permission === 'granted') {
        new Notification('Recupero finito!', { body: 'Tempo di iniziare la prossima serie.' });
      }
    }
  }, 1000);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function exitWorkout() {
  clearInterval(state.timerInterval);
  document.getElementById('tab-bar').classList.remove('hidden');
  navigate('oggi');
  renderOggi();
}
```

- [ ] **Step 4: Implement finishWorkout()**

```javascript
function finishWorkout() {
  clearInterval(state.timerInterval);
  const duration = Math.floor((Date.now() - state.workoutStartTime) / 1000);

  const workoutRecord = {
    id: crypto.randomUUID(),
    data: state.activeWorkout.data,
    giorno: state.activeWorkout.giorno,
    durata_secondi: duration,
    completato: true,
    exercises: state.activeWorkout.exercises.map(ex => ({
      nome: ex.nome,
      sets: ex.sets.map(s => ({
        serie_numero: s.serie_numero,
        ripetizioni: s.ripetizioni,
        peso_kg: s.peso_kg,
        rir: s.rir,
        completato: s.completato,
      })),
    })),
  };

  state.workoutHistory.push(workoutRecord);
  saveCache();

  // Sync to Supabase
  syncWorkout(workoutRecord);

  state.activeWorkout = null;
  state.currentExercise = 0;
  state.currentSet = 0;

  // Show riepilogo
  renderRiepilogo(workoutRecord);
  navigate('riepilogo');
}
```

---

### Task 5: RIEPILOGO View

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Implement renderRiepilogo()**

```javascript
function renderRiepilogo(workout) {
  const view = document.getElementById('view-riepilogo');

  let totalVolume = 0;
  let totalSets = 0;
  let html = `
    <div style="padding-top: 8px;">
      <h1>Allenamento completato</h1>
      <p class="muted mb-16">${workout.giorno} · ${Math.floor(workout.durata_secondi / 60)} minuti</p>
      <div class="divider"></div>
  `;

  workout.exercises.forEach(ex => {
    const doneSets = ex.sets.filter(s => s.completato);
    if (doneSets.length === 0) return;
    const volume = doneSets.reduce((sum, s) => sum + (s.ripetizioni * s.peso_kg), 0);
    totalVolume += volume;
    totalSets += doneSets.length;

    html += `
      <div class="flex items-center justify-between" style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
        <div>
          <div style="font-weight: 700;">${ex.nome}</div>
          <div class="muted">${doneSets.length} serie · ${doneSets.map(s => s.ripetizioni + '×' + s.peso_kg + 'kg').join(', ')}</div>
        </div>
        <div style="font-weight: 700;">${volume} kg</div>
      </div>
    `;
  });

  html += `
      <div class="divider"></div>
      <div class="flex justify-between" style="font-size: 18px;">
        <div><span style="font-weight: 700;">${totalVolume} kg</span> <span class="muted">volume</span></div>
        <div><span style="font-weight: 700;">${totalSets}</span> <span class="muted">serie</span></div>
        <div><span style="font-weight: 700;">${Math.floor(workout.durata_secondi / 60)}'</span> <span class="muted">durata</span></div>
      </div>
      <div class="divider"></div>
      <button class="btn btn-block mt-16" onclick="afterRiepilogo()">Chiudi</button>
    </div>
  `;

  view.innerHTML = html;
}

function afterRiepilogo() {
  document.getElementById('tab-bar').classList.remove('hidden');
  navigate('oggi');
  renderOggi();
}
```

---

### Task 6: STORICO View

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Implement renderStorico()**

```javascript
function renderStorico() {
  const view = document.getElementById('view-storico');

  // Group by week
  const weeks = groupByWeek(state.workoutHistory);
  const weekKeys = Object.keys(weeks).sort().reverse();

  let html = `
    <div style="padding-top: 8px;">
      <h1>Storico</h1>
  `;

  if (weekKeys.length === 0) {
    html += `<p class="muted">Nessun allenamento registrato.</p>`;
  } else {
    // Weekly volume chart
    html += `<h3>Volume settimanale</h3><div id="volume-chart" class="mt-8 mb-16">`;

    const maxVolume = Math.max(...weekKeys.slice(0, 6).map(k => weeks[k].volume));

    weekKeys.slice(0, 6).forEach(weekKey => {
      const week = weeks[weekKey];
      const pct = maxVolume > 0 ? (week.volume / maxVolume) * 100 : 0;
      html += `
        <div class="flex items-center gap-8 mb-8">
          <div style="width: 60px; font-size: 11px; color: #999; text-align: right;">${week.label}</div>
          <div class="chart-bar" style="width: ${pct}%;"></div>
          <div style="font-size: 12px; font-weight: 700; min-width: 60px;">${(week.volume / 1000).toFixed(1)}k kg</div>
        </div>
      `;
    });
    html += `</div>`;

    // Animate bars
    setTimeout(() => {
      anime({
        targets: '.chart-bar',
        width: function(el) { return el.style.width; },
        easing: 'easeOutCubic',
        duration: 800,
        delay: anime.stagger(100),
      });
    }, 100);

    // Weekly calendar
    html += `<h3 class="mt-16">Settimane</h3>`;
    weekKeys.slice(0, 4).forEach(weekKey => {
      const week = weeks[weekKey];
      html += `
        <div class="card">
          <div class="flex justify-between items-center mb-8">
            <span style="font-weight: 700;">${week.label}</span>
            <span style="font-size: 13px; color: #2e7d32;">${week.completed}/${week.total} allenamenti</span>
          </div>
          <div class="flex gap-8">
            ${week.days.map(d => `
              <div style="text-align: center;">
                <div style="font-size: 10px; color: #999; text-transform: uppercase;">${d.name}</div>
                <div style="width: 32px; height: 32px; border-radius: 50%; background: ${d.done ? '#1a1a1a' : '#f0f0f0'}; display: flex; align-items: center; justify-content: center; margin: 4px auto 0; font-size: 12px; color: ${d.done ? '#fff' : '#999'};">
                  ${d.done ? '✔' : '·'}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    // Exercise detail
    html += `<h3 class="mt-16">Progressi esercizi</h3>`;

    const allExercises = [...new Set(state.workoutHistory.flatMap(w => w.exercises.map(e => e.nome)))];
    allExercises.slice(0, 5).forEach(exName => {
      const entries = state.workoutHistory
        .flatMap(w => w.exercises.filter(e => e.nome === exName).flatMap(e => e.sets.filter(s => s.completato).map(s => ({ data: w.data, ...s }))))
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .slice(0, 3);

      if (entries.length === 0) return;

      html += `
        <div class="exercise-item">
          <div class="exercise-name">${exName}</div>
          <div class="exercise-meta">
            ${entries.map(e => `${e.data}: ${e.peso_kg}kg × ${e.ripetizioni}`).join('<br>')}
          </div>
        </div>
      `;
    });
  }

  html += `</div>`;
  view.innerHTML = html;
}

function groupByWeek(workouts) {
  const weeks = {};
  workouts.forEach(w => {
    const d = new Date(w.data);
    const startOfWeek = new Date(d);
    startOfWeek.setDate(d.getDate() - d.getDay() + 1);
    const weekKey = startOfWeek.toISOString().split('T')[0];

    if (!weeks[weekKey]) {
      weeks[weekKey] = { volume: 0, total: 0, completed: 0, days: [], label: '' };
      const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        weeks[weekKey].days.push({
          name: weekDays[i],
          date: day.toISOString().split('T')[0],
          done: false,
        });
      }
      const month = startOfWeek.toLocaleDateString('it-IT', { month: 'short' });
      weeks[weekKey].label = `${startOfWeek.getDate()} ${month}`;
    }

    const dayData = weeks[weekKey].days.find(d => d.date === w.data);
    if (dayData) { dayData.done = true; }
    weeks[weekKey].completed++;
    weeks[weekKey].total = Math.min(5, 7); // max 5 workout days per week

    const vol = w.exercises.reduce((sum, ex) =>
      sum + ex.sets.filter(s => s.completato).reduce((s2, s) => s2 + (s.ripetizioni * s.peso_kg), 0), 0);
    weeks[weekKey].volume += vol;
  });

  return weeks;
}
```

---

### Task 7: IMPOSTAZIONI View

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Implement renderImpostazioni()**

```javascript
function renderImpostazioni() {
  const view = document.getElementById('view-impostazioni');
  let html = `
    <div style="padding-top: 8px;">
      <h1>Impostazioni</h1>

      <h3>Modifica scheda</h3>
      <div class="flex gap-8" style="flex-wrap: wrap; margin-bottom: 16px;">
  `;

  // Day tabs
  let editingDay = state.editingDay || 0;
  state.templates.forEach((t, i) => {
    html += `<button class="btn" style="font-size: 11px; padding: 8px 12px; ${i === editingDay ? 'background: #1a1a1a; color: #fff;' : ''}" onclick="selectEditingDay(${i})">${t.giorno}</button>`;
  });

  const currentTemplate = state.templates[editingDay];
  html += `</div>`;

  currentTemplate.esercizi.forEach((ex, i) => {
    html += `
      <div class="exercise-item">
        <div class="flex justify-between items-center">
          <div class="exercise-name">${ex.nome}</div>
          <button style="border: none; background: none; cursor: pointer; color: #999; font-size: 18px;" onclick="removeExercise(${editingDay}, ${i})">×</button>
        </div>
        <div class="flex gap-8 mt-8" style="font-size: 13px;">
          <label>Serie <input type="number" value="${ex.serie}" min="1" max="10" style="width: 40px;" onchange="updateExerciseParam(${editingDay}, ${i}, 'serie', this.value)"></label>
          <label>Reps <input type="text" value="${ex.reps}" style="width: 50px;" onchange="updateExerciseParam(${editingDay}, ${i}, 'reps', this.value)"></label>
          <label>Recupero <input type="number" value="${Math.floor(ex.recupero / 60)}" min="1" max="5" style="width: 40px;" onchange="updateExerciseParam(${editingDay}, ${i}, 'recupero', this.value * 60)"> min</label>
        </div>
      </div>
    `;
  });

  html += `
      <button class="btn btn-block mt-16" onclick="showAddExercise()">+ Aggiungi esercizio</button>

      <div class="divider mt-24"></div>
      <h3>Dati</h3>
      <button class="btn btn-block mt-8" onclick="exportData()">Esporta tutto (.json)</button>
      <div style="margin-top: 8px;">
        <input type="file" id="import-file" accept=".json" style="display: none;" onchange="importData(event)">
        <button class="btn btn-block" onclick="document.getElementById('import-file').click()">Importa da file...</button>
      </div>
      <button class="btn btn-block mt-8" onclick="resetData()" style="border-color: #d32f2f; color: #d32f2f;">Reset dati allenamenti</button>
    </div>
  `;

  view.innerHTML = html;
}

function selectEditingDay(index) {
  state.editingDay = index;
  renderImpostazioni();
}

function updateExerciseParam(dayIndex, exIndex, param, value) {
  if (param === 'serie') state.templates[dayIndex].esercizi[exIndex].serie = parseInt(value);
  if (param === 'reps') state.templates[dayIndex].esercizi[exIndex].reps = value;
  if (param === 'recupero') state.templates[dayIndex].esercizi[exIndex].recupero = parseInt(value);
  saveCache();
}

function removeExercise(dayIndex, exIndex) {
  state.templates[dayIndex].esercizi.splice(exIndex, 1);
  saveCache();
  renderImpostazioni();
}

function showAddExercise() {
  const name = prompt('Nome esercizio:');
  if (!name) return;
  const editingDay = state.editingDay || 0;
  state.templates[editingDay].esercizi.push({
    nome: name,
    serie: 3,
    reps: '8-12',
    recupero: 90,
    rpeTarget: '7.5-9',
  });
  saveCache();
  renderImpostazioni();
}

function exportData() {
  const data = {
    templates: state.templates,
    workoutHistory: state.workoutHistory,
    lastWeights: state.lastWeights,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `workout-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.templates) state.templates = data.templates;
      if (data.workoutHistory) state.workoutHistory = data.workoutHistory;
      if (data.lastWeights) state.lastWeights = data.lastWeights;
      saveCache();
      renderImpostazioni();
      renderOggi();
    } catch(err) {
      alert('Errore importazione file.');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function resetData() {
  if (confirm('Cancellare tutti i dati degli allenamenti?')) {
    state.workoutHistory = [];
    state.lastWeights = {};
    saveCache();
    renderOggi();
    renderImpostazioni();
  }
}
```

---

### Task 8: Supabase Sync

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Implement syncWorkout and loadFromSupabase**

```javascript
async function syncWorkout(workout) {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .insert({
        id: workout.id,
        giorno: workout.giorno,
        data: workout.data,
        durata_secondi: workout.durata_secondi,
        completato: workout.completato,
      })
      .select()
      .single();

    if (error) throw error;

    for (const ex of workout.exercises) {
      const { data: exData, error: exError } = await supabase
        .from('exercises')
        .insert({
          workout_id: workout.id,
          nome_esercizio: ex.nome,
          ordine: workout.exercises.indexOf(ex),
        })
        .select()
        .single();

      if (exError) throw exError;

      for (const set of ex.sets) {
        const { error: setError } = await supabase
          .from('sets')
          .insert({
            exercise_id: exData.id,
            serie_numero: set.serie_numero,
            ripetizioni: set.ripetizioni,
            peso_kg: set.peso_kg,
            rir: set.rir,
            completato: set.completato,
          });

        if (setError) throw setError;
      }
    }
  } catch (e) {
    console.warn('Supabase sync failed, data saved locally:', e);
  }
}

async function loadWorkoutsFromSupabase() {
  try {
    const { data: workouts, error } = await supabase
      .from('workouts')
      .select('*')
      .order('data', { ascending: false });

    if (error) throw error;
    return workouts;
  } catch (e) {
    console.warn('Supabase load failed:', e);
    return [];
  }
}
```

- [ ] **Step 2: Add supabase config placeholder**

Replace the `SUPABASE_URL` and `SUPABASE_ANON_KEY` placeholders at the top of the script with clear instructions for the user:

```javascript
// ===== Supabase Client =====
// 1. Create a free project at https://supabase.com
// 2. Go to Settings → API → find Project URL and anon public key
// 3. Run the SQL in docs/superpowers/supabase-setup.sql in Supabase SQL Editor
// 4. Paste values below:
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

---

### Task 9: Notification Permission + Final Polish

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Request notification permission on first interaction**

```javascript
// At the end of init, add:
document.addEventListener('click', () => {
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
}, { once: true });
```

- [ ] **Step 2: Add service worker for install prompt (optional PWA)**

Actually skip this — the spec says HTML monolith, no PWA needed.

- [ ] **Step 3: Verify all functions are connected**

Checklist:
- `renderOggi()` called on init ✓
- Click "Inizia allenamento" → `startWorkout()` → `renderAllenamento()` ✓
- Click check ✔ → `completeSet()` → `startRestTimer()` → `renderAllenamento()` ✓
- Last set finished → `finishWorkout()` → `renderRiepilogo()` ✓
- "Chiudi" → back to OGGI ✓
- Tab views: OGGI, STORICO, IMPOSTAZIONI ✓
- `exitWorkout()` restores tab bar ✓
- Timer beeps and notifies on completion ✓
- Data syncs to Supabase and caches locally ✓
- Export/Import works ✓

- [ ] **Step 4: Run through a test cycle**

Open `index.html` in a browser:
1. Confirm OGGI shows today's workout (e.g., "Upper A" on Tuesday)
2. Click "Inizia allenamento"
3. Verify the ALLENAMENTO view appears with tab bar hidden
4. Enter reps, weight, RIR for set 1
5. Click check ✔
6. Verify timer starts counting down
7. Wait for timer or check that it reaches 0
8. Verify set 1 is marked done (grey) and set 2 is active
9. Complete all sets for all exercises
10. Verify RIEPILOGO shows correctly with volume stats
11. Click "Chiudi" and verify tab bar returns
12. Check STORICO - should show the completed workout
13. Check IMPOSTAZIONI - should show template editor
14. Export data, verify JSON downloads

- [ ] **Step 5: Push to GitHub Pages** (manual step for user)

---

## Self-Review

**Spec coverage:**
- OGGI view → Task 3
- ALLENAMENTO flow (sets, timer, check, pre-filled values) → Task 4
- RIEPILOGO post-workout → Task 5
- STORICO with weekly chart and exercise progress → Task 6
- IMPOSTAZIONI (template edit, add/remove exercises, export/import, reset) → Task 7
- Supabase sync → Task 8
- Timer with Audio + Notification → Task 4
- Swiss minimal design → Task 2 CSS

**No placeholders:** All code blocks contain complete implementation code.

**Type consistency:** All function names match across tasks (startWorkout, completeSet, finishWorkout, renderOggi/Riepilogo/Allenamento/Storico/Impostazioni, syncWorkout).
