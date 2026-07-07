    function escapeHtml(str) {
      if (typeof str !== 'string') return str;
      return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
    }

    const state = {
      currentView: 'oggi',
      activeWorkout: null,
      currentExercise: 0,
      currentSet: 0,
      editingDay: 0,
      programmaEditMode: false,
      templates: [],
      lastWeights: {},
      workoutHistory: [],
      timerInterval: null,
      timerSeconds: 0,
      workoutTimerInterval: null,
      workoutStartTime: null,
      restExerciseIndex: -1,
      restTimerStartTime: 0,
      restTimerTotal: 0,
      analisiLevel: 'intermediate',
      analisiMode: 'reale',
      analisiFilter: 'week',
      fase: 1, // 1, 2, 3, 'deload'
      darkMode: null, // null=system, true=dark, false=light
      progressoEsercizio: null,
      _notesOpen: null,
      silentAudio: null,
      dataVersion: 0,
      calendarYear: new Date().getFullYear(),
      calendarMonth: new Date().getMonth(),
      storicoView: 'calendar',
    };

    var MUSCLE_MAP = {
      "Panca inclinata manubri": "Chest",
      "Lat Machine presa neutra": "Back",
      "Chest Press macchina (convergente)": "Chest",
      "Chest press convergente": "Chest",
      "Rematore chest-supported": "Back",
      "Rematore macchina chest-supported": "Back",
      "Rematore macchina": "Back",
      "Rematore convergente macchina": "Back",
      "Alzate laterali ai cavi": "Deltoidi laterali",
      "Alzate laterali ai cavi (unilaterali)": "Deltoidi laterali",
      "Alzate laterali unilaterali ai cavi": "Deltoidi laterali",
      "Shrug manubri": "Upper traps",
      "Shrug manubri o macchina": "Upper traps",
      "Shrug macchina/manubri": "Upper traps",
      "Shrug pesanti (bilanciere/manubri)": "Upper traps",
      "Shrug pesanti (manubri o macchina)": "Upper traps",
      "Reverse Cable Fly": "Deltoidi posteriori",
      "Reverse cable fly": "Deltoidi posteriori",
      "Reverse fly cavi": "Deltoidi posteriori",
      "Rear Delt Row ai cavi": "Deltoidi posteriori",
      "Rear delt cable row": "Deltoidi posteriori",
      "Rear delt cable fly": "Deltoidi posteriori",
      "Pushdown cavo": "Triceps",
      "Pushdown cavi": "Triceps",
      "Curl ai cavi": "Biceps",
      "Curl inclinato al cavo": "Biceps",
      "Curl inclinato o cavo": "Biceps",
      "Romanian Deadlift": "Hamstrings",
      "Romanian Deadlift leggero": "Hamstrings",
      "Romanian deadlift leggero o good morning machine": "Hamstrings",
      "Leg Press": "Quads",
      "Leg press (ROM controllato)": "Quads",
      "Hack Squat oppure Leg Press": "Quads",
      "Hack Squat oppure Leg Press (quella meglio tollerata)": "Quads",
      "Hack squat / leg press avanzata": "Quads",
      "Leg Curl Seduto": "Hamstrings",
      "Leg curl seduto": "Hamstrings",
      "Leg Extension": "Quads",
      "Leg Extension (solo se indolore)": "Quads",
      "Leg extension (leggera, controllo)": "Quads",
      "Standing Calf Raise": "Calves",
      "Calf raise in piedi": "Calves",
      "Crunch ai cavi": "Abs",
      "Lat Machine presa larga": "Back",
      "Lat Machine presa neutra": "Back",
      "Lat machine / trazioni assistite": "Back",
      "Panca piana manubri": "Chest",
      "Croci ai cavi": "Chest",
      "Estensione tricipiti sopra testa cavo": "Triceps",
      "Estensioni tricipiti sopra testa cavo": "Triceps",
      "Hanging Leg Raise": "Abs",
      "Hanging leg raise": "Abs",
      "Alzate laterali Lean Away ai cavi": "Deltoidi laterali",
      "Alzate laterali lean o macchina": "Deltoidi laterali",
      "Alzate laterali manubri, seduto": "Deltoidi laterali",
      "Seated Calf Raise": "Calves",
      "Curl manubri su panca inclinata (o panca Scott)": "Biceps",
      "French Press manubri (o overhead extension)": "Triceps",
      "Farmer Walk": "Forearms",
      "Farmer walk": "Forearms",
    };

    var VOLUME_RANGES = {
      "Abs": { beginner: [3, 10], intermediate: [6, 10], advanced: [6, 15] },
      "Back": { beginner: [10, 10], intermediate: [10, 20], advanced: [10, 30] },
      "Biceps": { beginner: [3, 6], intermediate: [6, 10], advanced: [8, 20] },
      "Calves": { beginner: [3, 10], intermediate: [6, 10], advanced: [6, 15] },
      "Chest": { beginner: [8, 10], intermediate: [8, 15], advanced: [10, 20] },
      "Forearms": { beginner: [0, 6], intermediate: [3, 8], advanced: [3, 10] },
      "Glutes": { beginner: [10, 10], intermediate: [10, 20], advanced: [10, 30] },
      "Hamstrings": { beginner: [6, 10], intermediate: [8, 12], advanced: [8, 15] },
      "Neck": { beginner: [0, 6], intermediate: [3, 10], advanced: [3, 10] },
      "Quads": { beginner: [8, 10], intermediate: [10, 15], advanced: [10, 20] },
      "Deltoidi laterali": { beginner: [6, 10], intermediate: [10, 16], advanced: [10, 20] },
      "Deltoidi posteriori": { beginner: [3, 6], intermediate: [6, 10], advanced: [6, 12] },
      "Shoulders": { beginner: [10, 10], intermediate: [10, 20], advanced: [10, 25] },
      "Triceps": { beginner: [3, 6], intermediate: [6, 10], advanced: [8, 20] },
      "Upper traps": { beginner: [0, 6], intermediate: [3, 10], advanced: [3, 10] },
    };

    function getSerieAdjusted(ex) {
      var s = ex.serie;
      if (state.fase === 'deload') return Math.max(1, Math.ceil(s / 2));
      if (state.fase >= 2 && /^Alzate laterali.*cavi/.test(ex.nome)) s = Math.round(s * 1.2);
      if (state.fase >= 3 && /^Shrug/.test(ex.nome)) s = Math.round(s * 1.25);
      return s;
    }

    var EXERCISE_NOTES = {
      "Alzate laterali ai cavi": "Eccentrica 2-3s, massima contrazione in alto. Non usare slancio.",
      "Alzate laterali unilaterali ai cavi": "Un braccio alla volta, torso leggermente inclinato. Controllo in tutta la ROM.",
      "Alzate laterali Lean Away ai cavi": "Inclinati lontano dal cavo, il braccio lavora in un arco più ampio.",
      "Shrug manubri": "Scrollata completa su/giù, fermati in alto 1s. Non ruotare le spalle.",
      "Shrug macchina/manubri": "Stessa tecnica: su-giù controllato, senza rotazione.",
      "Reverse Cable Fly": "Braccia leggermente flesse, apertura controllata. Stringere le scapole.",
      "Rear Delt Row ai cavi": "Tirata verso il viso con gomiti alti, enfasi su retrazione scapolare.",
      "Romanian Deadlift": "Piega leggermente le ginocchia, spingi indietro i fianchi. Mantieni schiena neutra.",
      "Hack Squat oppure Leg Press (quella meglio tollerata)": "ROM completo ma controllato. Ginocchia allineate alle punte. Non bloccare in estensione.",
      "Standing Calf Raise": "1-2s di allungamento in basso, massima contrazione in alto. ROM completo.",
      "Seated Calf Raise": "Stessa filosofia: allungamento in basso, contrazione esplosiva in alto.",
      "Panca inclinata manubri": "Appoggia bene le scapole. Manubri controllati in discesa, spinta esplosiva in salita.",
      "Panca piana manubri": "Gomiti a 45°, non a 90. Non sbattere i manubri in alto.",
      "Lat Machine presa neutra": "Tira con i gomiti, non con le braccia. Petto in fuori.",
      "Lat Machine presa larga": "Presa larga supina. Tira la sbarra al petto, scapole indietro.",
      "Chest Press macchina (convergente)": "Movimento controllato, stringi il petto nella chiusura.",
      "Croci ai cavi": "Braccia leggermente flesse, incrocia davanti al petto. Contrazione massima.",
      "Rematore chest-supported": "Petto appoggiato, tira con i gomiti alti. Stringere le scapole.",
      "Rematore convergente macchina": "Stessa tecnica, controllo in allungamento.",
      "Leg Curl Seduto": "Controlla la discesa. Non usare slancio.",
      "Leg Extension": "Movimento controllato, non sbattere il peso. Se dolore al ginocchio, fermati.",
      "Crunch ai cavi": "Cavi dall'alto, arrotola il busto. Non tirare con le braccia.",
      "Hanging Leg Raise": "NON oscillare. Alza le gambe controllato, contrai gli addominali.",
      "Pushdown cavo": "Gomiti fissi ai fianchi. Spingi in giù, contrai il tricipite in fondo.",
      "Curl ai cavi": "Gomiti fissi. Non usare slancio. Contrai il bicipite in alto.",
      "Estensione tricipiti sopra testa cavo": "Gomiti in avanti, estensione completa sopra la testa.",
      "Curl inclinato al cavo": "Panca inclinata, braccia dietro il busto. Curl controllato.",
      "Curl manubri su panca inclinata (o panca Scott)": "Braccia dietro il busto, curl completo. Contrazione massima.",
      "French Press manubri (o overhead extension)": "Gomiti verso l'alto, abbassa dietro la testa. Non allargare i gomiti."
    };

    var WARMUP_COMPOUNDS = ["Panca inclinata manubri","Panca piana manubri","Romanian Deadlift","Hack Squat oppure Leg Press (quella meglio tollerata)","Leg Press","Lat Machine presa neutra","Lat Machine presa larga","Chest Press macchina (convergente)"];

    function loadCache() {
      try {
        const cached = localStorage.getItem('workout_cache');
        if (cached) {
          const data = JSON.parse(cached);
          if (data.fase) state.fase = data.fase;
          if (data.lastWeights) state.lastWeights = data.lastWeights;
          if (data.templates) state.templates = data.templates;
          if (data.activeWorkout) {
            var oggi = new Date().toISOString().split('T')[0];
            if (data.activeWorkout.data === oggi) {
              state.activeWorkout = data.activeWorkout;
              state.currentExercise = data.currentExercise || 0;
              state.currentSet = data.currentSet || 0;
              state.workoutStartTime = data.workoutStartTime || Date.now();
              state.restExerciseIndex = data.restExerciseIndex !== undefined ? data.restExerciseIndex : -1;
              state.restTimerStartTime = data.restTimerStartTime || 0;
              state.restTimerTotal = data.restTimerTotal || 0;
            }
          }
        }
        const history = localStorage.getItem('workout_history');
        if (history) state.workoutHistory = JSON.parse(history);
      } catch(e) { console.warn('Cache load error:', e); }
    }

    function saveCache() {
      var data = {
        fase: state.fase,
        lastWeights: state.lastWeights,
        templates: state.templates,
      };
      if (state.activeWorkout) {
        data.activeWorkout = state.activeWorkout;
        data.currentExercise = state.currentExercise;
        data.currentSet = state.currentSet;
        data.workoutStartTime = state.workoutStartTime;
        data.restExerciseIndex = state.restExerciseIndex;
        data.restTimerStartTime = state.restTimerStartTime;
        data.restTimerTotal = state.restTimerTotal;
      }
      localStorage.setItem('workout_cache', JSON.stringify(data));
      localStorage.setItem('workout_history', JSON.stringify(state.workoutHistory));
    }

    function renderEmptyState(icon, title, message, ctaText, ctaAction) {
      return '<div class="empty-state">' +
        '<span class="material-symbols-outlined empty-icon">' + icon + '</span>' +
        '<h3 class="empty-title">' + escapeHtml(title) + '</h3>' +
        '<p class="empty-message">' + escapeHtml(message) + '</p>' +
        (ctaText ? '<button class="btn btn-primary" onclick="' + ctaAction + '">' + escapeHtml(ctaText) + '</button>' : '') +
      '</div>';
    }

    function showToast(message, duration) {
      duration = duration || 3000;
      var existing = document.getElementById('toast');
      if (existing) existing.remove();
      var toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      toast.innerHTML = '<span class="toast-message">' + escapeHtml(message) + '</span>';
      document.body.appendChild(toast);
      requestAnimationFrame(function() { toast.classList.add('visible'); });
      setTimeout(function() {
        toast.classList.remove('visible');
        setTimeout(function() { toast.remove(); }, 300);
      }, duration);
    }

    function showUndoToast(message, undoAction) {
      var existing = document.getElementById('toast');
      if (existing) existing.remove();
      var toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      toast.innerHTML = '<span class="toast-message">' + escapeHtml(message) + '</span>' +
        '<button class="toast-undo" id="toast-undo-btn">Annulla</button>';
      document.body.appendChild(toast);
      requestAnimationFrame(function() { toast.classList.add('visible'); });
      document.getElementById('toast-undo-btn').onclick = function() {
        undoAction();
        toast.classList.remove('visible');
        setTimeout(function() { toast.remove(); }, 300);
      };
      setTimeout(function() {
        toast.classList.remove('visible');
        setTimeout(function() { toast.remove(); }, 300);
      }, 5000);
    }

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

    function renderCurrentView() {
      switch (state.currentView) {
        case 'oggi': renderAllenamenti(); break;
        case 'storico': renderStorico(); break;
        case 'impostazioni': renderImpostazioni(); break;
        case 'analisi': renderAnalisi(); break;
        case 'programma': renderProgramma(); break;
      }
    }

    function switchView(viewId) {
      document.querySelectorAll('.view.active, .view-full.active').forEach(v => v.classList.remove('active'));
      state.currentView = viewId;
      const view = document.getElementById(`view-${viewId}`);
      if (view) view.classList.add('active');
      renderTabBar();
      renderCurrentView();
    }

    document.getElementById('tab-bar').addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-btn');
      if (btn) switchView(btn.dataset.view);
    });

    document.addEventListener('click', function(e) {
      var el = e.target.closest('[data-workout]');
      if (el) {
        var action = el.dataset.action || 'startWorkout';
        if (action === 'startWorkout') startWorkout(el.dataset.workout);
        else if (action === 'riprendiAllenamento') riprendiAllenamento();
        return;
      }
    });

    const DEFAULT_TEMPLATE = [
      {
        giorno: "Upper A",
        esercizi: [
          { nome: "Panca inclinata manubri", serie: 3, reps: "6-8", recupero: 180, rpeTarget: "7.5-9" },
          { nome: "Lat Machine presa neutra", serie: 3, reps: "8-10", recupero: 150, rpeTarget: "7.5-9" },
          { nome: "Chest Press macchina (convergente)", serie: 3, reps: "8-10", recupero: 150, rpeTarget: "7.5-9" },
          { nome: "Rematore chest-supported", serie: 3, reps: "8-10", recupero: 150, rpeTarget: "7.5-9" },
          { nome: "Alzate laterali ai cavi", serie: 5, reps: "12-15", recupero: 90, rpeTarget: "8.5-10", alternative: ["Alzate laterali unilaterali ai cavi", "Alzate laterali Lean Away ai cavi", "Alzate laterali manubri, seduto"] },
          { nome: "Shrug manubri", serie: 4, reps: "10-12", recupero: 90, rpeTarget: "8.5-10" },
          { nome: "Reverse Cable Fly", serie: 3, reps: "12-15", recupero: 90, rpeTarget: "8.5-10" },
          { nome: "Pushdown cavo", serie: 4, reps: "10-12", recupero: 90, rpeTarget: "8.5-10" },
          { nome: "Curl ai cavi", serie: 4, reps: "10-12", recupero: 90, rpeTarget: "8.5-10" },
        ]
      },
      {
        giorno: "Lower A",
        esercizi: [
          { nome: "Romanian Deadlift", serie: 3, reps: "6-8", recupero: 210, rpeTarget: "7.5-9" },
          { nome: "Leg Press", serie: 3, reps: "10-12", recupero: 150, rpeTarget: "7.5-9" },
          { nome: "Leg Curl Seduto", serie: 3, reps: "10-12", recupero: 90, rpeTarget: "8.5-10" },
          { nome: "Leg Extension (solo se indolore)", serie: 2, reps: "12-15", recupero: 90, rpeTarget: "8.5-10" },
          { nome: "Standing Calf Raise", serie: 5, reps: "8-10", recupero: 90, rpeTarget: "8.5-10" },
          { nome: "Crunch ai cavi", serie: 3, reps: "12-15", recupero: 75, rpeTarget: "8.5-10" },
        ]
      },
      {
        giorno: "Upper B",
        esercizi: [
          { nome: "Lat Machine presa larga", serie: 3, reps: "6-8", recupero: 150, rpeTarget: "7.5-9" },
          { nome: "Panca piana manubri", serie: 3, reps: "8-10", recupero: 180, rpeTarget: "7.5-9" },
          { nome: "Rematore convergente macchina", serie: 3, reps: "8-10", recupero: 150, rpeTarget: "7.5-9" },
          { nome: "Croci ai cavi", serie: 3, reps: "12-15", recupero: 90, rpeTarget: "8.5-10" },
          { nome: "Alzate laterali unilaterali ai cavi", serie: 5, reps: "12-15", recupero: 90, rpeTarget: "8.5-10" },
          { nome: "Rear Delt Row ai cavi", serie: 3, reps: "10-12", recupero: 90, rpeTarget: "8.5-10" },
          { nome: "Shrug macchina/manubri", serie: 4, reps: "8-12", recupero: 90, rpeTarget: "8.5-10" },
          { nome: "Estensione tricipiti sopra testa cavo", serie: 4, reps: "10-12", recupero: 90, rpeTarget: "8.5-10" },
          { nome: "Curl inclinato al cavo", serie: 4, reps: "10-12", recupero: 90, rpeTarget: "8.5-10" },
        ]
      },
      {
        giorno: "Lower B",
        esercizi: [
          { nome: "Hack Squat oppure Leg Press (quella meglio tollerata)", serie: 3, reps: "8-10", recupero: 210, rpeTarget: "7.5-9" },
          { nome: "Romanian Deadlift leggero", serie: 2, reps: "8-10", recupero: 150, rpeTarget: "7.5-9" },
          { nome: "Leg Curl Seduto", serie: 2, reps: "10-12", recupero: 90, rpeTarget: "8.5-10" },
          { nome: "Leg Extension", serie: 2, reps: "12-15", recupero: 90, rpeTarget: "8.5-10" },
          { nome: "Standing Calf Raise", serie: 5, reps: "15-20", recupero: 90, rpeTarget: "8.5-10" },
          { nome: "Hanging Leg Raise", serie: 3, reps: "10-15", recupero: 75, rpeTarget: "8.5-10" },
        ]
      },
      {
        giorno: "Specializzazione",
        esercizi: [
          { nome: "Alzate laterali Lean Away ai cavi", serie: 3, reps: "10-12", recupero: 90, rpeTarget: "8.5-10" },
          { nome: "Alzate laterali manubri, seduto", serie: 3, reps: "12-15", recupero: 90, rpeTarget: "8.5-10" },
          { nome: "Seated Calf Raise", serie: 3, reps: "15-20", recupero: 90, rpeTarget: "8.5-10" },
          { nome: "Curl manubri su panca inclinata (o panca Scott)", serie: 3, reps: "10-12", recupero: 90, rpeTarget: "8.5-10" },
          { nome: "French Press manubri (o overhead extension)", serie: 3, reps: "10-12", recupero: 90, rpeTarget: "8.5-10" },
        ]
      }
    ];

    var DATA_VERSION = 2;

    loadCache();

    if (state.templates.length === 0 || !state.dataVersion || state.dataVersion < DATA_VERSION) {
      state.templates = DEFAULT_TEMPLATE;
      state.dataVersion = DATA_VERSION;
      saveCache();
    }

    // Dark mode init
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    function applyDarkMode() {
      if (state.darkMode === true) { document.documentElement.classList.add('dark'); }
      else if (state.darkMode === false) { document.documentElement.classList.remove('dark'); }
      else if (prefersDark.matches) { document.documentElement.classList.add('dark'); }
      else { document.documentElement.classList.remove('dark'); }
    }
    applyDarkMode();
    prefersDark.addEventListener('change', function() {
      if (state.darkMode === null) applyDarkMode();
    });

    function getItalianDayName(dayIndex) {
      var giorniNomi = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
      return giorniNomi[dayIndex] || '';
    }

    function getDayIndexForGiorno(giorno) {
      var giorniScheda = [null, 'Upper A', 'Lower A', 'Specializzazione', 'Upper B', 'Lower B', null];
      return giorniScheda.indexOf(giorno);
    }

    function getTodayWorkout() {
      var oggi = new Date();
      var giorniScheda = [null, 'Upper A', 'Lower A', 'Specializzazione', 'Upper B', 'Lower B', null];
      var giornoScheda = giorniScheda[oggi.getDay()];
      if (!giornoScheda) return null;
      return state.templates.find(function(t) { return t.giorno === giornoScheda; }) || null;
    }

    function formatDate(dateStr) {
      var d = new Date(dateStr);
      return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
    }

    function riprendiAllenamento() {
      resumeWorkout();
    }

    function renderAllenamenti() {
      var container = document.getElementById('view-oggi');
      var today = getTodayWorkout();
      var allTemplates = state.templates;
      var todayName = getItalianDayName(new Date().getDay());

      var html = '<div class="view-header">' +
        '<h1 class="view-title">Allenamenti</h1>' +
      '</div>';

      // Today's recommended workout — highlighted
      if (today) {
        var isActive = state.activeWorkout && !state.activeWorkout.completato;
        var oggiDataStr = new Date().toISOString().split('T')[0];
        var isCompleted = state.workoutHistory.some(function(w) {
          return w.data === oggiDataStr && w.giorno === today.giorno;
        });
        var statusClass = isCompleted ? 'completed' : isActive ? 'in-progress' : 'ready';
        var statusLabel = isCompleted ? 'Completato' : isActive ? 'In corso' : 'Da iniziare';

        html += '<div class="today-card card ' + statusClass + '">' +
          '<div class="today-header">' +
            '<span class="today-day">' + todayName + '</span>' +
            '<span class="today-status badge badge-' + statusClass + '">' + statusLabel + '</span>' +
          '</div>' +
          '<h2 class="today-workout-name">' + escapeHtml(today.nome || today.giorno) + '</h2>' +
          '<p class="today-exercises-count">' + today.esercizi.length + ' esercizi</p>';

        if (!isCompleted) {
          var btnAction = isActive ? 'riprendiAllenamento' : 'startWorkout';
          html += '<button class="btn btn-primary btn-block" data-action="' + btnAction + '" data-workout="' + escapeHtml(today.giorno) + '">' +
            '<span class="material-symbols-outlined">' + (isActive ? 'play_arrow' : 'fitness_center') + '</span> ' + (isActive ? 'Riprendi' : 'Inizia allenamento') +
          '</button>';
        }

        html += '</div>';
      }

      // All available workouts
      html += '<h3 class="section-title">Tutte le schede</h3>' +
        '<div class="workout-list">';

      allTemplates.forEach(function(t) {
        var dayIndex = getDayIndexForGiorno(t.giorno);
        var dayName = dayIndex >= 0 ? getItalianDayName(dayIndex) : t.giorno;
        var lastDone = state.workoutHistory.filter(function(w) { return w.giorno === t.giorno; });
        var lastDate = lastDone.length > 0 ? lastDone[lastDone.length - 1].data : null;

        html += '<div class="card workout-card" data-workout="' + escapeHtml(t.giorno) + '">' +
          '<div class="workout-card-header">' +
            '<span class="workout-card-name">' + escapeHtml(t.nome || t.giorno) + '</span>' +
            '<span class="badge">' + t.esercizi.length + ' es.</span>' +
          '</div>' +
          '<div class="workout-card-day">' +
            '<span class="material-symbols-outlined">calendar_today</span> ' + escapeHtml(dayName) +
          '</div>';

        if (lastDate) {
          html += '<div class="workout-card-last">Ultimo: ' + escapeHtml(formatDate(lastDate)) + '</div>';
        }

        html += '</div>';
      });

      html += '</div>';
      container.innerHTML = html;
    }

    function createSilentAudioURL() {
      var sampleRate = 44100;
      var channels = 1;
      var bitsPerSample = 16;
      var numSamples = sampleRate;
      var buffer = new ArrayBuffer(44 + numSamples * 2);
      var v = new DataView(buffer);
      var w = function(offset, str) { for (var i = 0; i < str.length; i++) v.setUint8(offset + i, str.charCodeAt(i)); };
      w(0, 'RIFF'); v.setUint32(4, 36 + numSamples * 2, true);
      w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true);
      v.setUint16(20, 1, true); v.setUint16(22, channels, true);
      v.setUint32(24, sampleRate, true); v.setUint32(28, sampleRate * channels * bitsPerSample / 8, true);
      v.setUint16(32, channels * bitsPerSample / 8, true); v.setUint16(34, bitsPerSample, true);
      w(36, 'data'); v.setUint32(40, numSamples * 2, true);
      return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
    }

    function setupMediaSession() {
      if (!('mediaSession' in navigator)) return;
      if (!state.silentAudio) {
        state.silentAudio = new Audio(createSilentAudioURL());
        state.silentAudio.loop = true;
        state.silentAudio.volume = 0;
      }
      state.silentAudio.play().catch(function() {});
      setupMediaSessionActions();
    }

    function teardownMediaSession() {
      if (state.silentAudio) {
        state.silentAudio.pause();
        state.silentAudio.currentTime = 0;
      }
      if ('mediaSession' in navigator) {
        try { navigator.mediaSession.setPositionState(null); } catch(e) {}
        navigator.mediaSession.metadata = null;
      }
      document.title = 'Workout Tracker';
    }

    function updateMediaSession() {
      if (!('mediaSession' in navigator) || !state.activeWorkout) return;
      var ex = state.activeWorkout.exercises[state.currentExercise];
      if (!ex) return;
      var restInfo = '';
      if (state.restExerciseIndex >= 0) {
        var remaining = Math.max(0, state.restTimerTotal - state.timerSeconds);
        restInfo = ' · Recupero ' + formatTime(remaining);
      }
      navigator.mediaSession.metadata = new MediaMetadata({
        title: ex.nome,
        artist: 'Serie ' + (state.currentSet + 1) + '/' + ex.sets.length + restInfo,
        album: 'Workout Tracker',
      });
      if (state.restExerciseIndex >= 0 && state.timerSeconds < state.restTimerTotal) {
        try {
          navigator.mediaSession.setPositionState({
            duration: state.restTimerTotal, playbackRate: 1, position: state.timerSeconds,
          });
        } catch(e) {}
      } else {
        try { navigator.mediaSession.setPositionState(null); } catch(e) {}
      }
    }

    function setupMediaSessionActions() {
      if (!('mediaSession' in navigator)) return;
      navigator.mediaSession.setActionHandler('play', function() {
        if (!state.activeWorkout) return;
        if (state.restExerciseIndex < 0) {
          completeSet();
        } else {
          skipRest();
          renderAllenamento();
          updateMediaSession();
        }
      });
      navigator.mediaSession.setActionHandler('pause', function() {
        if (state.restExerciseIndex >= 0) {
          skipRest();
          renderAllenamento();
          updateMediaSession();
        }
      });
      navigator.mediaSession.setActionHandler('nexttrack', function() {
        if (!state.activeWorkout) return;
        skipExercise(state.currentExercise);
      });
      navigator.mediaSession.setActionHandler('previoustrack', function() {
        if (!state.activeWorkout) return;
        navigateToExercise(Math.max(0, state.currentExercise - 1));
      });
      navigator.mediaSession.setActionHandler('stop', function() {
        if (!state.activeWorkout) return;
        finishWorkout();
      });
    }

    function startWorkout(giorno) {
      var oggi = new Date();
      var oggiDataStr = oggi.toISOString().split('T')[0];
      if (!giorno) {
        var giorniScheda = [null, 'Upper A', 'Lower A', 'Specializzazione', 'Upper B', 'Lower B', null];
        giorno = giorniScheda[oggi.getDay()];
        if (!giorno) return;
      }

      // If same workout already in progress today, resume
      if (state.activeWorkout && state.activeWorkout.giorno === giorno && state.activeWorkout.data === oggiDataStr) {
        // resume
      } else {
        var template = state.templates.find(function(t) { return t.giorno === giorno; });
        if (!template) return;
        var exercises = template.esercizi.map(function(ex) {
          var last = state.lastWeights[ex.nome];
          var adjSerie = getSerieAdjusted(ex);
          var sets = [];
          for (var s = 0; s < adjSerie; s++) {
            sets.push({
              serie_numero: s + 1,
              ripetizioni: null,
              peso_kg: last ? last.peso : null,
              rir: last ? last.rir : null,
              completato: false,
            });
          }
          return { nome: ex.nome, serieTarget: adjSerie, recupero: ex.recupero, sets: sets };
        });

        state.activeWorkout = {
          data: oggiDataStr,
          giorno: giorno,
          exercises: exercises,
          completato: false,
        };
        state.currentExercise = 0;
        state.currentSet = 0;
        state.workoutStartTime = Date.now();
        state.restExerciseIndex = -1;
      }

      saveCache();
      setupMediaSession();
      document.getElementById('tab-bar').classList.add('hidden');
      document.getElementById('workout-pill').classList.add('hidden');
      switchView('allenamento');
      renderAllenamento();
      startWorkoutTimer();
    }
    function startWorkoutTimer() {
      clearInterval(state.workoutTimerInterval);
      state.workoutTimerInterval = setInterval(function() {
        var display = document.getElementById('timer-display');
        if (display && state.workoutStartTime) {
          display.textContent = formatTime(Math.floor((Date.now() - state.workoutStartTime) / 1000));
        }
      }, 1000);
    }

    function navigateToExercise(exIdx) {
      if (exIdx < 0 || exIdx >= state.activeWorkout.exercises.length) return;
      state.currentExercise = exIdx;
      var ex = state.activeWorkout.exercises[exIdx];
      state.currentSet = 0;
      for (var i = 0; i < ex.sets.length; i++) {
        if (!ex.sets[i].completato) { state.currentSet = i; break; }
      }
      renderAllenamento();
      saveCache();
    }

    function renderAllenamento() {
      var view = document.getElementById('view-allenamento');
      if (!state.activeWorkout) return;
      var exercises = state.activeWorkout.exercises;
      var templateGiorno = state.templates.find(function(t) { return t.giorno === state.activeWorkout.giorno; });
      var totalSets = 0, completedSets = 0;
      exercises.forEach(function(ex) {
        ex.sets.forEach(function(s) { totalSets++; if (s.completato) completedSets++; });
      });
      var pct = totalSets > 0 ? Math.round(completedSets / totalSets * 100) : 0;
      var isFirstEx = state.currentExercise === 0;
      var isLastEx = state.currentExercise >= exercises.length - 1;
      var currentEx = exercises[state.currentExercise];
      var templateCurrentEx = templateGiorno ? templateGiorno.esercizi[state.currentExercise] : null;

      // Double progression check: if current exercise is all done, check if all reps hit max
      var allDoneAllMax = false;
      if (currentEx && templateCurrentEx) {
        var repsRange = templateCurrentEx.reps;
        var parts = repsRange.split('-');
        if (parts.length === 2) {
          var maxRep = parseInt(parts[1]);
          if (maxRep && currentEx.sets.every(function(s) { return s.completato && parseInt(s.ripetizioni) >= maxRep; })) {
            allDoneAllMax = true;
          }
        }
      }

      var html = '';
      html += '<div class="workout-sticky">';
      var faseLabel = state.fase === 'deload' ? 'Deload' : 'Fase ' + state.fase;
      html += '<div class="flex items-center justify-between mb-8"><button class="workout-header-btn" onclick="exitWorkout()"><span class="material-symbols-outlined">arrow_back</span> ' + escapeHtml(state.activeWorkout.giorno) + '</button><div class="flex items-center gap-8"><span class="fase-badge">' + escapeHtml(faseLabel) + '</span><div class="timer"><span class="material-symbols-outlined" style="font-size: 16px; color: var(--text-secondary);">schedule</span><span id="timer-display" class="workout-sticky-timer">' + formatTime(Math.floor((Date.now() - state.workoutStartTime) / 1000)) + '</span></div><button class="btn btn-ghost btn-sm" style="color: var(--accent);" onclick="if(confirm(\'Terminare l\\\'allenamento?\'))finishWorkout()">Fine</button></div></div>';

      // Navigation prev/next
      html += '<div class="flex items-center gap-8 mb-12">';
      html += '<button class="nav-btn" onclick="navigateToExercise(' + (state.currentExercise - 1) + ')"' + (isFirstEx ? ' disabled' : '') + '><span class="material-symbols-outlined" style="font-size: 14px;">chevron_left</span> Prec</button>';
      html += '<span class="muted" style="flex:1; text-align:center;">' + (state.currentExercise + 1) + ' / ' + exercises.length + '</span>';
      html += '<button class="nav-btn" onclick="navigateToExercise(' + (state.currentExercise + 1) + ')"' + (isLastEx ? ' disabled' : '') + '>Succ <span class="material-symbols-outlined" style="font-size: 14px;">chevron_right</span></button>';
      html += '</div>';

      // Progress bar
      html += '<div class="workout-progress mb-12"><div class="bar"><div class="bar-fill" style="width: ' + pct + '%;"></div></div><span class="muted">' + completedSets + '/' + totalSets + '</span></div>';

      // Rest timer (full-screen overlay)
      if (state.restExerciseIndex >= 0) {
        var restEx = exercises[state.restExerciseIndex];
        if (restEx) {
          var remaining = Math.max(0, restEx.recupero - state.timerSeconds);
          var fillPct = state.timerSeconds > 0 ? Math.min(100, (state.timerSeconds / restEx.recupero) * 100) : 0;
          html += '<div class="timer-overlay">' +
            '<div class="timer-card">' +
              '<div class="timer-label">Recupero</div>' +
              '<div class="timer-display">' + formatTime(remaining) + '</div>' +
              '<div class="timer-bar">' +
                '<div class="timer-bar-fill" style="width: ' + fillPct + '%"></div>' +
              '</div>' +
              '<button class="btn btn-ghost" onclick="skipRest()">' +
                '<span class="material-symbols-outlined">skip_next</span> Salta' +
              '</button>' +
            '</div>' +
          '</div>';
        }
      }

      // Double progression coach alert
      if (allDoneAllMax && templateCurrentEx) {
        var oldWeight = state.lastWeights[currentEx.nome];
        var suggestPeso = oldWeight ? Math.ceil((oldWeight.peso + 2.5) / 2.5) * 2.5 : '';
        html += '<div class="dprog-alert">Tutte le serie al massimo delle ripetizioni! ' + (suggestPeso ? 'Prova ad aumentare a ' + suggestPeso + ' kg.' : 'Aumenta il carico al prossimo allenamento.') + '</div>';
      }

      html += '</div>'; // .workout-sticky

      // Scrollable exercises
      html += '<div class="workout-scroll">';
      exercises.forEach(function(ex, exIdx) {
        var templateEx = templateGiorno ? templateGiorno.esercizi[exIdx] : null;
        var targetReps = templateEx ? templateEx.reps : '';
        var isCurrentEx = exIdx === state.currentExercise;
        var last = state.lastWeights[ex.nome];
        var allSetsDone = ex.sets.length > 0 && ex.sets.every(function(s) { return s.completato; });
        var noneSetDone = ex.sets.length > 0 && ex.sets.every(function(s) { return !s.completato; });
        var isSkipped = exIdx < state.currentExercise && noneSetDone && !allSetsDone;

        // Progression pill: all sets done, all at max reps, last weight exists
        var progressionPill = null;
        if (templateEx) {
          var repsParts = templateEx.reps ? templateEx.reps.split('-') : null;
          if (repsParts && repsParts.length === 2) {
            var maxRep = parseInt(repsParts[1]);
            if (maxRep && ex.sets.length > 0 && ex.sets.every(function(s) { return s.completato && parseInt(s.ripetizioni) >= maxRep; })) {
              if (last && last.peso) {
                var nextPeso = Math.ceil((last.peso + 2.5) / 2.5) * 2.5;
                progressionPill = last.peso + ' → ' + nextPeso + ' kg';
              }
            }
          }
        }

        // Warm-up guide before first compound exercise
        if (isCurrentEx && WARMUP_COMPOUNDS.indexOf(ex.nome) >= 0) {
          var warmWeight = last ? last.peso : null;
          // Ensure warmupSets array exists
          if (!ex.warmupSets) {
            var warmSetsDef = [];
            if (ex.sets.length <= 1) warmSetsDef.push({ pct: 50, reps: targetReps });
            else if (ex.sets.length === 2) warmSetsDef.push({ pct: 50, reps: targetReps }, { pct: 70, reps: targetReps });
            else if (ex.sets.length === 3) warmSetsDef.push({ pct: 45, reps: targetReps }, { pct: 65, reps: targetReps }, { pct: 85, reps: targetReps });
            else warmSetsDef.push({ pct: 45, reps: targetReps }, { pct: 60, reps: targetReps }, { pct: 75, reps: targetReps }, { pct: 85, reps: targetReps });
            ex.warmupSets = warmSetsDef.map(function(ws, i) { return { pct: ws.pct, reps: ws.reps, done: false }; });
          }
          var allWarmDone = ex.warmupSets.every(function(ws) { return ws.done; });
          html += '<div class="warmup-box">';
          html += '<div class="flex items-center gap-8 mb-8"><span class="material-symbols-outlined" style="font-size: 16px; color: var(--accent);">local_fire_department</span><span style="font-weight: 700; font-size: 13px;">Riscaldamento</span></div>';
          ex.warmupSets.forEach(function(ws, i) {
            var w = warmWeight ? Math.round(warmWeight * ws.pct / 100) + ' kg' : '—';
            html += '<div class="warmup-set" onclick="toggleWarmupSet(' + exIdx + ',' + i + ')" style="cursor: pointer;"><span class="material-symbols-outlined" style="font-size: 14px; color: ' + (ws.done ? 'var(--accent)' : 'var(--text-secondary)') + ';">' + (ws.done ? 'check_circle' : 'radio_button_unchecked') + '</span><span>' + ws.pct + '%</span><span>' + w + '</span><span>' + (ws.reps || '—') + ' reps</span></div>';
          });
          html += '<div class="muted mt-8" style="font-size: 11px;">' + (allWarmDone ? '✓ Riscaldamento completato' : 'Poi via con le ' + ex.sets.length + ' serie di lavoro') + '</div>';
          html += '</div>';
        }

        var exClasses = 'exercise-block';
        if (isCurrentEx) exClasses += ' current';
        if (isSkipped) exClasses += ' skipped';
        if (!isCurrentEx) exClasses += ' clickable';

        html += '<div class="' + exClasses + '"' + (!isCurrentEx ? ' onclick="navigateToExercise(' + exIdx + ')"' : '') + '>';
        html += '<div class="flex items-center justify-between mb-8"><div><div class="exercise-name">' + (isSkipped ? '<span class="muted">Saltato: </span>' : '') + escapeHtml(ex.nome) + (progressionPill ? ' <span class="progression-pill">📈 ' + progressionPill + '</span>' : '') + '</div><div class="exercise-meta">' + escapeHtml(ex.serieTarget) + ' serie · target ' + escapeHtml(targetReps) + ' reps · RPE ' + (templateEx ? escapeHtml(templateEx.rpeTarget) : '') + (allSetsDone ? ' <span class="material-symbols-outlined accent-text" style="font-size: 14px;">check_circle</span>' : '') + '</div></div><div style="display: flex; gap: 4px;">' + (EXERCISE_NOTES[ex.nome] ? '<button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();toggleNotes(' + exIdx + ')"><span class="material-symbols-outlined" style="font-size: 16px;">info</span></button>' : '') + (isCurrentEx ? '<button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();showSwapModal(' + exIdx + ')">Sost.</button>' : '') + (isCurrentEx ? '<button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();skipExercise(' + exIdx + ')">Salta</button>' : '') + '</div></div>';

        // Notes panel (expandable)
        if (EXERCISE_NOTES[ex.nome]) {
          var isOpen = state._notesOpen === exIdx;
          html += '<div class="ex-note" id="ex-note-' + exIdx + '"' + (isOpen ? '' : ' style="display: none;"') + '><span class="material-symbols-outlined" style="font-size: 14px; color: var(--accent);">info</span> ' + EXERCISE_NOTES[ex.nome] + '</div>';
        }

        html += '<div class="set-grid header"><div></div><div>Rep</div><div>Peso</div><div>RPE</div><div></div></div>';

        ex.sets.forEach(function(set, setIdx) {
          var isCurrentSet = isCurrentEx && setIdx === state.currentSet && !set.completato;
          var opacity = set.completato ? '' : (isCurrentSet ? '' : 'op-50');

          html += '<div class="set-grid ' + opacity + '"><div class="set-cell" style="font-weight: 700;">' + set.serie_numero + '</div>';

          var repsVal = set.ripetizioni || (isCurrentSet && last ? last.reps : '');
          var pesoVal = set.peso_kg || (isCurrentSet && last ? last.peso : '');
          var rirVal = set.rir || (isCurrentSet && last ? last.rir : '');

          html += '<div class="set-cell"><input type="number" id="input-reps-' + exIdx + '-' + setIdx + '" value="' + escapeHtml(repsVal) + '" min="1" max="30" style="width: 48px;" placeholder="' + (last && isCurrentSet ? escapeHtml(last.reps) : '') + '"' + (!isCurrentSet && !set.completato ? ' disabled' : '') + ' onblur="updateSet(' + exIdx + ',' + setIdx + ',\'ripetizioni\',this.value)"' + '></div>';
          html += '<div class="set-cell"><input type="number" id="input-peso-' + exIdx + '-' + setIdx + '" value="' + escapeHtml(pesoVal) + '" min="0" step="0.5" style="width: 64px;" placeholder="' + (last && isCurrentSet ? escapeHtml(last.peso) + 'kg' : '') + '"' + (!isCurrentSet && !set.completato ? ' disabled' : '') + ' onblur="updateSet(' + exIdx + ',' + setIdx + ',\'peso_kg\',this.value)"' + '></div>';
          html += '<div class="set-cell"><input type="number" id="input-rir-' + exIdx + '-' + setIdx + '" value="' + escapeHtml(rirVal) + '" min="6.5" max="10" step="0.5" style="width: 46px;" placeholder="' + (last && isCurrentSet ? escapeHtml(last.rir) : (templateEx ? escapeHtml(templateEx.rpeTarget) : '')) + '"' + (!isCurrentSet && !set.completato ? ' disabled' : '') + ' onblur="updateSet(' + exIdx + ',' + setIdx + ',\'rir\',this.value)"' + '></div>';

          html += '<div class="set-cell">';
          if (set.completato) {
            html += '<div class="set-check done set-check-animate" onclick="uncompleteSet(' + exIdx + ',' + setIdx + ')"><span class="material-symbols-outlined" style="font-size: 16px; color: var(--text-inverse);">check</span></div>';
          } else if (isCurrentSet) {
            html += '<div class="set-check" onclick="completeSet()"><span class="material-symbols-outlined" style="font-size: 16px;">check</span></div>';
          } else {
            html += '<div class="set-check" style="opacity: 0.2;"><span class="material-symbols-outlined" style="font-size: 16px;">check</span></div>';
          }
          html += '</div>';

          html += '</div>';
        });

        html += '</div>';
      });

      html += '</div>'; // .workout-scroll
      view.innerHTML = html;
      updateMediaSession();
    }

    function toggleNotes(exIdx) {
      state._notesOpen = state._notesOpen === exIdx ? null : exIdx;
      renderAllenamento();
    }

    function toggleWarmupSet(exIdx, setIdx) {
      if (!state.activeWorkout) return;
      var ex = state.activeWorkout.exercises[exIdx];
      if (!ex || !ex.warmupSets) return;
      ex.warmupSets[setIdx].done = !ex.warmupSets[setIdx].done;
      renderAllenamento();
    }

    function completeSet() {
      var exIdx = state.currentExercise;
      var currentEx = state.activeWorkout.exercises[exIdx];
      var set = currentEx.sets[state.currentSet];
      var repsInput = document.getElementById('input-reps-' + exIdx + '-' + state.currentSet);
      var pesoInput = document.getElementById('input-peso-' + exIdx + '-' + state.currentSet);
      var rirInput = document.getElementById('input-rir-' + exIdx + '-' + state.currentSet);
      var reps = repsInput && repsInput.value !== '' ? parseFloat(repsInput.value) : null;
      var peso = pesoInput && pesoInput.value !== '' ? parseFloat(pesoInput.value) : null;
      var rir = rirInput && rirInput.value !== '' ? parseFloat(rirInput.value) : null;

      var hasData = (reps !== null && reps > 0) || (peso !== null && peso > 0);
      if (!hasData) {
        if (repsInput) repsInput.classList.add('shake');
        if (pesoInput) pesoInput.classList.add('shake');
        setTimeout(function() {
          if (repsInput) repsInput.classList.remove('shake');
          if (pesoInput) pesoInput.classList.remove('shake');
        }, 300);
        return;
      }

      set.ripetizioni = reps;
      set.peso_kg = peso;
      set.rir = rir;
      set.completato = true;
      showUndoToast('Serie completata', function() {
        set.completato = false;
        saveCache();
        renderAllenamento();
      });
      state.lastWeights[currentEx.nome] = { reps: reps, peso: peso, rir: rir };
      saveCache();

      var isLastSet = state.currentSet + 1 >= currentEx.sets.length;
      if (isLastSet) {
        var hasMoreExercises = exIdx + 1 < state.activeWorkout.exercises.length;
        if (hasMoreExercises) {
          state.restExerciseIndex = exIdx;
          state.currentExercise++;
          state.currentSet = 0;
          state.restTimerStartTime = Date.now();
          state.restTimerTotal = currentEx.recupero;
          saveCache();
          renderAllenamento();
          startRestTimer(currentEx.recupero);
          if (state.currentExercise >= state.activeWorkout.exercises.length) {
            finishWorkout();
          }
        }
        return;
      }

      state.restExerciseIndex = exIdx;
      state.currentSet++;
      state.restTimerStartTime = Date.now();
      state.restTimerTotal = currentEx.recupero;
      saveCache();
      renderAllenamento();
      startRestTimer(currentEx.recupero);
    }

    function skipExercise(exIdx) {
      if (!confirm('Saltare ' + state.activeWorkout.exercises[exIdx].nome + '?')) return;
      clearInterval(state.timerInterval);
      state.currentExercise = exIdx + 1;
      state.currentSet = 0;
      state.restExerciseIndex = -1;
      if (state.currentExercise >= state.activeWorkout.exercises.length) {
        finishWorkout();
      } else {
        renderAllenamento();
      }
    }

    function updateSet(exIdx, setIdx, field, value) {
      var ex = state.activeWorkout.exercises[exIdx];
      if (!ex) return;
      var set = ex.sets[setIdx];
      if (!set) return;
      var v = value !== '' ? parseFloat(value) : null;
      if (field === 'ripetizioni') set.ripetizioni = v;
      else if (field === 'peso_kg') set.peso_kg = v;
      else if (field === 'rir') set.rir = v;
      if (v !== null && v > 0 && field !== 'rir') {
        state.lastWeights[ex.nome] = state.lastWeights[ex.nome] || {};
        if (field === 'ripetizioni') state.lastWeights[ex.nome].reps = v;
        if (field === 'peso_kg') state.lastWeights[ex.nome].peso = v;
      }
      saveCache();
    }

    function getAlternativesForExercise(exName) {
      var templateGiorno = state.templates.find(function(t) { return t.giorno === state.activeWorkout.giorno; });
      var templateEx = templateGiorno ? templateGiorno.esercizi[state.currentExercise] : null;
      var alternatives = [];
      if (templateEx && templateEx.alternative) {
        templateEx.alternative.forEach(function(a) {
          if (alternatives.indexOf(a) < 0) alternatives.push(a);
        });
      }
      var mg = MUSCLE_MAP[exName];
      if (mg) {
        Object.keys(MUSCLE_MAP).forEach(function(key) {
          if (MUSCLE_MAP[key] === mg && key !== exName && alternatives.indexOf(key) < 0) {
            alternatives.push(key);
          }
        });
      }
      return alternatives;
    }

    function swapExercise(exIdx, newName) {
      if (!state.activeWorkout) return;
      var ex = state.activeWorkout.exercises[exIdx];
      var oldName = ex.nome;
      ex.nome = newName;
      state.lastWeights[newName] = state.lastWeights[newName] || state.lastWeights[oldName] || null;
      clearInterval(state.timerInterval);
      state.restExerciseIndex = -1;
      state.restTimerStartTime = 0;
      state.restTimerTotal = 0;
      saveCache();
      renderAllenamento();
      document.querySelectorAll('.modal-overlay').forEach(function(m) { m.remove(); });
    }

    function showSwapModal(exIdx) {
      if (!state.activeWorkout) return;
      var ex = state.activeWorkout.exercises[exIdx];
      if (!ex) return;
      var alternatives = getAlternativesForExercise(ex.nome);
      if (alternatives.length === 0) {
        showToast('Nessun esercizio sostitutivo disponibile per ' + ex.nome + '.');
        return;
      }
      var html = '<div class="modal-box"><h2>Sostituisci esercizio</h2><p class="text-muted" style="margin-bottom:16px;">' + escapeHtml(ex.nome) + '</p>';
      alternatives.forEach(function(a) {
        var mg = MUSCLE_MAP[a] || '';
        html += '<div class="exercise-item" style="cursor:pointer;" onclick="swapExercise(' + exIdx + ',\'' + a.replace(/'/g,"\\'") + '\')"><div class="exercise-name" style="font-size:14px;">' + escapeHtml(a) + '</div>' + (mg ? '<div class="exercise-meta">' + escapeHtml(mg) + '</div>' : '') + '</div>';
      });
      html += '<div class="modal-actions" style="margin-top:16px;"><button class="btn btn-block" onclick="this.closest(\'.modal-overlay\').remove()">Annulla</button></div></div>';
      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = html;
      document.body.appendChild(overlay);
    }

    function uncompleteSet(exIdx, setIdx) {
      var ex = state.activeWorkout.exercises[exIdx];
      if (!ex) return;
      var set = ex.sets[setIdx];
      if (!set || !set.completato) return;
      set.completato = false;
      state.currentExercise = exIdx;
      state.currentSet = setIdx;
      state.restExerciseIndex = -1;
      clearInterval(state.timerInterval);
      renderAllenamento();
      saveCache();
    }

    function skipRest() {
      clearInterval(state.timerInterval);
      state.restExerciseIndex = -1;
      state.restTimerStartTime = 0;
      state.restTimerTotal = 0;
      saveCache();
      renderAllenamento();
    }

    function startRestTimer(seconds, elapsed) {
      clearInterval(state.timerInterval);
      state.timerSeconds = elapsed || 0;
      state.restTimerStartTime = Date.now() - ((elapsed || 0) * 1000);
      state.restTimerTotal = seconds;
      var totalSeconds = seconds;
      var restDisplay = document.querySelector('.timer-display');
      var restBarFill = document.querySelector('.timer-bar-fill');
      if (!restDisplay) return;

      state.timerInterval = setInterval(function() {
        state.timerSeconds++;
        var remaining = Math.max(0, totalSeconds - state.timerSeconds);
        if (restDisplay) restDisplay.textContent = formatTime(remaining);
        if (restBarFill) restBarFill.style.width = ((state.timerSeconds / totalSeconds) * 100) + '%';
        updateMediaSession();
        if (!('mediaSession' in navigator)) {
          document.title = 'Rec: ' + formatTime(remaining) + ' - Workout Tracker';
        }
        if (state.timerSeconds >= totalSeconds) {
          clearInterval(state.timerInterval);
          var timerCard = document.querySelector('.timer-card');
          if (timerCard) timerCard.classList.add('pulse');
          try {
            var ctx = new (window.AudioContext || window.webkitAudioContext)();
            if (ctx.state === 'suspended') ctx.resume();
            var osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = 800;
            osc.connect(ctx.destination);
            osc.start();
            setTimeout(function() { osc.stop(); }, 200);
          } catch(e) {}
          try { navigator.vibrate(200); } catch(e) {}
          if (Notification.permission === 'granted') {
            new Notification('Recupero finito!', { body: 'Tempo di iniziare la prossima serie.' });
          } else if (Notification.permission === 'default') {
            Notification.requestPermission();
          }
          state.restExerciseIndex = -1;
          state.restTimerStartTime = 0;
          state.restTimerTotal = 0;
          saveCache();
        }
      }, 1000);
    }

    function formatTime(seconds) {
      var m = Math.floor(seconds / 60);
      var s = seconds % 60;
      return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function exitWorkout() {
      teardownMediaSession();
      clearInterval(state.timerInterval);
      clearInterval(state.workoutTimerInterval);
      state.workoutTimerInterval = null;
      if (state.activeWorkout) {
        var ex = state.activeWorkout.exercises[state.currentExercise];
        if (ex) document.getElementById('pill-exercise-name').textContent = ex.nome;
        document.getElementById('workout-pill').classList.remove('hidden');
      }
      document.getElementById('tab-bar').classList.remove('hidden');
      saveCache();
      switchView('oggi');
    }

    function resumeWorkout() {
      document.getElementById('workout-pill').classList.add('hidden');
      document.getElementById('tab-bar').classList.add('hidden');
      switchView('allenamento');
      renderAllenamento();
      startWorkoutTimer();
      if (state.restExerciseIndex >= 0) {
        var elapsed = (Date.now() - state.restTimerStartTime) / 1000;
        var remaining = state.restTimerTotal - elapsed;
        if (remaining > 0) {
          startRestTimer(state.restTimerTotal, Math.min(elapsed, state.restTimerTotal - 1));
          renderAllenamento();
        } else {
          state.restExerciseIndex = -1;
          state.restTimerStartTime = 0;
          state.restTimerTotal = 0;
          saveCache();
        }
      }
    }

    function finishWorkout() {
      teardownMediaSession();
      clearInterval(state.timerInterval);
      clearInterval(state.workoutTimerInterval);
      state.workoutTimerInterval = null;
      state.restExerciseIndex = -1;
      document.getElementById('workout-pill').classList.add('hidden');
      var duration = Math.floor((Date.now() - state.workoutStartTime) / 1000);
      var workoutRecord = {
        id: crypto.randomUUID(),
        data: state.activeWorkout.data,
        giorno: state.activeWorkout.giorno,
        durata_secondi: duration,
        completato: true,
        exercises: state.activeWorkout.exercises.map(function(ex) {
          return {
            nome: ex.nome,
            sets: ex.sets.map(function(s) {
              return { serie_numero: s.serie_numero, ripetizioni: s.ripetizioni, peso_kg: s.peso_kg, rir: s.rir, completato: s.completato };
            }),
          };
        }),
      };
      state.workoutHistory.push(workoutRecord);
      state.activeWorkout = null;
      state.currentExercise = 0;
      state.currentSet = 0;
      saveCache();
      renderRiepilogo(workoutRecord);
      switchView('riepilogo');
    }

    function renderRiepilogo(workout) {
      var view = document.getElementById('view-riepilogo');
      var totalVolume = 0;
      var totalSets = 0;
      var html = '<div><h1>Allenamento completato</h1><p class="muted mb-16">' + escapeHtml(workout.giorno) + ' · ' + Math.floor(workout.durata_secondi / 60) + ' minuti</p><div class="divider"></div>';

      workout.exercises.forEach(function(ex) {
        var doneSets = ex.sets.filter(function(s) { return s.completato; });
        if (doneSets.length === 0) return;
        var volume = doneSets.reduce(function(sum, s) { return sum + (s.ripetizioni * s.peso_kg); }, 0);
        totalVolume += volume;
        totalSets += doneSets.length;
        html += '<div class="flex items-center justify-between" style="padding: 8px 0; border-bottom: 1px solid var(--border-light);"><div><div class="exercise-name" style="font-size: 14px;">' + escapeHtml(ex.nome) + '</div><div class="muted">' + doneSets.length + ' serie · ' + doneSets.map(function(s) { return escapeHtml(s.ripetizioni) + '×' + escapeHtml(s.peso_kg) + 'kg'; }).join(', ') + '</div></div><div class="accent-text" style="font-weight: 700;">' + volume + ' kg</div></div>';
      });

      html += '<div class="divider"></div><div class="flex justify-between" style="font-size: 18px;"><div><span style="font-weight: 700;">' + totalVolume + ' kg</span> <span class="muted">volume</span></div><div><span style="font-weight: 700;">' + totalSets + '</span> <span class="muted">serie</span></div><div><span style="font-weight: 700;">' + Math.floor(workout.durata_secondi / 60) + '\'</span> <span class="muted">durata</span></div></div><div class="divider"></div><button class="btn btn-block mt-16" onclick="afterRiepilogo()">Chiudi</button></div>';
      view.innerHTML = html;
    }

    function afterRiepilogo() {
      document.getElementById('tab-bar').classList.remove('hidden');
      switchView('oggi');
    }

    function getMuscleGroup(exName) {
      return MUSCLE_MAP[exName] || null;
    }

    function getExercisesForMuscle(mg) {
      var seen = {};
      state.templates.forEach(function(day) {
        day.esercizi.forEach(function(ex) {
          if (getMuscleGroup(ex.nome) === mg && !seen[ex.nome]) {
            seen[ex.nome] = true;
          }
        });
      });
      return Object.keys(seen);
    }

    function getExerciseDetailsForMuscle(mg) {
      var details = [];
      state.templates.forEach(function(day) {
        day.esercizi.forEach(function(ex) {
          if (getMuscleGroup(ex.nome) === mg) {
            details.push({ giorno: day.giorno, nome: ex.nome, serie: ex.serie, reps: ex.reps, rpe: ex.rpeTarget });
          }
        });
      });
      return details;
    }

    function parseRepsMidpoint(repsStr) {
      if (!repsStr || repsStr.indexOf('s') >= 0) return null;
      var parts = repsStr.split('-');
      if (parts.length === 2) return (parseFloat(parts[0]) + parseFloat(parts[1])) / 2;
      return parseFloat(repsStr) || null;
    }

    function calcIdealSetsByMuscle() {
      var sets = {};
      state.templates.forEach(function(day) {
        day.esercizi.forEach(function(ex) {
          var mg = getMuscleGroup(ex.nome);
          if (!mg) return;
          sets[mg] = (sets[mg] || 0) + ex.serie;
        });
      });
      return sets;
    }

    function calcRealSetsByMuscle(weeks) {
      var sets = {};
      var now = new Date();
      var cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - weeks * 7);
      var filtered = state.workoutHistory.filter(function(w) {
        return new Date(w.data) >= cutoff;
      });
      var weekCount = Math.max(1, Math.ceil((now - cutoff) / (7 * 86400000)));
      filtered.forEach(function(w) {
        w.exercises.forEach(function(ex) {
          var mg = getMuscleGroup(ex.nome);
          if (!mg) return;
          var done = ex.sets.filter(function(s) { return s.completato; }).length;
          sets[mg] = (sets[mg] || 0) + done;
        });
      });
      for (var mg in sets) {
        sets[mg] = Math.round(sets[mg] / weekCount);
      }
      return sets;
    }

    function setAnalisiLevel(level) {
      state.analisiLevel = level;
      renderAnalisi();
    }

    function setAnalisiMode(mode) {
      state.analisiMode = mode;
      renderAnalisi();
    }

    function setAnalisiFilter(filter) {
      state.analisiFilter = filter;
      renderAnalisi();
    }

    function calcMaxWeeklySetsByMuscle() {
      var setsByWeek = {};
      state.workoutHistory.forEach(function(w) {
        var d = new Date(w.data);
        var startOfWeek = new Date(d);
        startOfWeek.setDate(d.getDate() - d.getDay() + 1);
        var weekKey = startOfWeek.toISOString().split('T')[0];
        if (!setsByWeek[weekKey]) setsByWeek[weekKey] = {};
        w.exercises.forEach(function(ex) {
          var mg = getMuscleGroup(ex.nome);
          if (!mg) return;
          var done = ex.sets.filter(function(s) { return s.completato; }).length;
          setsByWeek[weekKey][mg] = (setsByWeek[weekKey][mg] || 0) + done;
        });
      });
      var maxSets = {};
      for (var week in setsByWeek) {
        for (var mg in setsByWeek[week]) {
          if (!maxSets[mg] || setsByWeek[week][mg] > maxSets[mg]) {
            maxSets[mg] = setsByWeek[week][mg];
          }
        }
      }
      return maxSets;
    }

    function getWeeklyVolumeHistory() {
      var weeks = {};
      state.workoutHistory.forEach(function(w) {
        var exercises = w.exercises || w.esercizi || [];
        var d = new Date(w.data);
        var weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay() + 1);
        var key = weekStart.toISOString().split('T')[0];
        if (!weeks[key]) weeks[key] = { settimana: key, volume: 0 };
        weeks[key].volume += exercises.reduce(function(sum, e) {
          var sets = e.sets || e.serie || [];
          return sum + sets.filter(function(s) { return s.completato; }).length;
        }, 0);
      });
      var result = [];
      for (var k in weeks) result.push(weeks[k]);
      return result.sort(function(a, b) { return a.settimana.localeCompare(b.settimana); });
    }

    function renderTendenze() {
      var data = getWeeklyVolumeHistory();
      var html = '<div class="divider"></div><h3>Tendenze volume settimanale</h3>';

      if (data.length < 2) {
        html += '<p class="muted" style="font-size:12px;">Dati insufficienti.</p>';
        return html;
      }

      var last = data[data.length - 1].volume;
      var first = data[0].volume;
      var trendDir = last > first ? 'in aumento' : (last < first ? 'in calo' : 'stabile');
      var trendIcon = last > first ? 'trending_up' : (last < first ? 'trending_down' : 'trending_flat');
      var trendColor = last > first ? 'var(--ok-color)' : last < first ? 'var(--accent-dark)' : 'var(--text-muted)';

      html += '<div class="card">';
      html += '<div class="flex items-center gap-8 mb-8">';
      html += '<span class="material-symbols-outlined" style="color:' + trendColor + ';">' + trendIcon + '</span>';
      html += '<span style="font-weight:700;font-size:13px;">Volume ' + trendDir + '</span>';
      html += '</div>';

      var W = 300, H = 150;
      var padL = 32, padR = 8, padT = 12, padB = 24;
      var chartW = W - padL - padR;
      var chartH = H - padT - padB;

      var volumes = data.map(function(d) { return d.volume; });
      var maxVal = Math.max.apply(null, volumes);
      var minVal = Math.max(0, Math.min.apply(null, volumes) - 2);
      if (minVal === maxVal) { minVal = maxVal - 5; if (minVal < 0) minVal = 0; }
      var range = maxVal - minVal || 1;

      var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:100%;font-size:9px;overflow:visible;">';

      for (var i = 0; i <= 4; i++) {
        var val = minVal + (range * i / 4);
        var y = padT + chartH - (chartH * i / 4);
        svg += '<text x="' + (padL - 4) + '" y="' + (y + 3) + '" text-anchor="end" fill="var(--text-secondary)">' + Math.round(val) + '</text>';
        svg += '<line x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '" stroke="var(--border)" stroke-width="0.5"/>';
      }

      // Trend line (linear regression)
      var n = data.length;
      var sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
      data.forEach(function(d, i) {
        sumX += i; sumY += d.volume; sumXY += i * d.volume; sumX2 += i * i;
      });
      var slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      var intercept = (sumY - slope * sumX) / n;
      var trendY1 = padT + chartH - (chartH * (intercept - minVal) / range);
      var trendY2 = padT + chartH - (chartH * (intercept + slope * (n - 1) - minVal) / range);
      svg += '<line x1="' + padL + '" y1="' + Math.max(padT, Math.min(padT + chartH, trendY1)) + '" x2="' + (padL + chartW) + '" y2="' + Math.max(padT, Math.min(padT + chartH, trendY2)) + '" stroke="' + trendColor + '" stroke-width="1.5" stroke-dasharray="4,3"/>';

      var linePoints = [];
      data.forEach(function(d, i) {
        var x = padL + (chartW * i / (data.length - 1));
        var y = padT + chartH - (chartH * (d.volume - minVal) / range);
        linePoints.push(x + ',' + y);
        svg += '<circle cx="' + x + '" cy="' + y + '" r="3" fill="var(--accent)" stroke="#fff" stroke-width="1.5"/>';
        var d2 = new Date(d.settimana);
        var label = ('0' + d2.getDate()).slice(-2) + '/' + ('0' + (d2.getMonth() + 1)).slice(-2);
        svg += '<text x="' + x + '" y="' + (padT + chartH + 14) + '" text-anchor="end" transform="rotate(-30,' + x + ',' + (padT + chartH + 14) + ')" fill="var(--text-secondary)">' + label + '</text>';
        svg += '<text x="' + x + '" y="' + (y - 6) + '" text-anchor="middle" font-weight="700" fill="var(--accent)">' + d.volume + '</text>';
      });
      svg += '<polyline points="' + linePoints.join(' ') + '" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round"/>';

      svg += '</svg>';
      html += '<div style="width:100%;height:180px;">' + svg + '</div>';
      html += '</div>';

      return html;
    }

    function renderAnalisi() {
      var view = document.getElementById('view-analisi');

      if (state.workoutHistory.length === 0) {
        view.innerHTML = '<div class="view-header"><h1 class="view-title">Analisi</h1></div>' +
          renderEmptyState('insights', 'Nessun dato da analizzare',
            'Completa alcuni allenamenti per vedere statistiche e analisi.',
            'Vai agli allenamenti', 'switchView(\'oggi\')');
        return;
      }

      var idealSets = calcIdealSetsByMuscle();
      var analisiWeeks = state.analisiFilter === 'week' ? 1 : state.analisiFilter === 'month' ? 4 : 6;
      var realSets = calcRealSetsByMuscle(analisiWeeks);
      var maxHistorical = calcMaxWeeklySetsByMuscle();
      var setsData = state.analisiMode === 'ideale' ? idealSets : realSets;
      var level = state.analisiLevel;
      var range = VOLUME_RANGES;
      var levelKeyMap = { beginner: 'beginner', intermediate: 'intermediate', advanced: 'advanced' };
      var lk = levelKeyMap[level] || 'intermediate';

      var muscleOrder = ["Quads","Hamstrings","Glutes","Chest","Back","Deltoidi laterali","Deltoidi posteriori","Biceps","Triceps","Abs","Calves","Upper traps","Forearms"];

      var html = '<div><h1>Analisi</h1>';

      // Level selector
      html += '<div class="toggle-group mb-12">';
      ['beginner','intermediate','advanced'].forEach(function(l) {
        html += '<button class="toggle-btn' + (l === level ? ' active' : '') + '" onclick="setAnalisiLevel(\'' + l + '\')">' + l.charAt(0).toUpperCase() + l.slice(1) + '</button>';
      });
      html += '</div>';

      // Mode toggle
      html += '<div class="toggle-group mb-12">';
      html += '<button class="toggle-btn' + (state.analisiMode === 'ideale' ? ' active' : '') + '" onclick="setAnalisiMode(\'ideale\')">Ideale</button>';
      html += '<button class="toggle-btn' + (state.analisiMode === 'reale' ? ' active' : '') + '" onclick="setAnalisiMode(\'reale\')">Reale</button>';
      html += '</div>';

      // Period filter
      html += '<div class="toggle-group mb-12">';
      html += '<button class="toggle-btn' + (state.analisiFilter === 'week' ? ' active' : '') + '" onclick="setAnalisiFilter(\'week\')">Settimana</button>';
      html += '<button class="toggle-btn' + (state.analisiFilter === 'month' ? ' active' : '') + '" onclick="setAnalisiFilter(\'month\')">Mese</button>';
      html += '<button class="toggle-btn' + (state.analisiFilter === 'phase' ? ' active' : '') + '" onclick="setAnalisiFilter(\'phase\')">Fase</button>';
      html += '</div>';

      // Chart
      var maxSets = 0;
      muscleOrder.forEach(function(mg) {
        var v = setsData[mg] || 0;
        if (v > maxSets) maxSets = v;
      });
      // Also consider range maxima so range bars don't overflow
      muscleOrder.forEach(function(mg) {
        var r = range[mg];
        if (r) {
          var maxR = r[lk][1];
          if (maxR > maxSets) maxSets = maxR;
        }
      });
      if (maxSets === 0) maxSets = 1;

      html += '<div class="mt-8">';
      muscleOrder.forEach(function(mg) {
        var v = setsData[mg] || 0;
        var r = range[mg];
        if (!r) return;
        var target = r[lk];
        var minW = target[0], maxW = target[1];
        var pct = Math.min(100, Math.round(v / maxSets * 100));
        var rangeStart = Math.round(minW / maxSets * 100);
        var rangeEnd = Math.round(maxW / maxSets * 100);

        var status, badgeClass, badgeLabel, statusColor;
        if (v < minW) { status = 'sotto'; badgeClass = 'badge-under'; badgeLabel = 'Sotto volume'; statusColor = 'var(--color-warning)'; }
        else if (v > maxW) { status = 'sopra'; badgeClass = 'badge-over'; badgeLabel = 'Sopra volume'; statusColor = 'var(--color-error)'; }
        else { status = 'ok'; badgeClass = 'badge-optimal'; badgeLabel = 'Ottimale'; statusColor = 'var(--color-success)'; }

        var maxRef = maxHistorical[mg] || 0;
        var refPct = Math.min(100, Math.round(maxRef / maxSets * 100));

        var exDetails = getExerciseDetailsForMuscle(mg);

        html += '<div class="muscle-row" data-mg="' + mg.replace(/"/g,'&quot;') + '"><div class="muscle-label">' + mg + '</div><div class="muscle-bar-wrap"><div class="muscle-bar-bg"><div class="muscle-bar-fill" style="width: ' + pct + '%; background: ' + statusColor + ';"></div>' + (maxRef > 0 ? '<div class="muscle-bar-max" style="left: ' + refPct + '%;"></div>' : '') + '</div><div class="muscle-bar-range" style="left: ' + rangeStart + '%; width: ' + Math.max(4, rangeEnd - rangeStart) + '%;"></div></div><div class="muscle-value" style="color: ' + statusColor + ';">' + v + '</div><div class="muscle-status"><span class="badge ' + badgeClass + '">' + badgeLabel + '</span></div></div>';
        html += '<div class="muscle-note">Range ' + level + ': ' + minW + '–' + maxW + ' set/sett' + (maxRef > 0 ? ' · Max storico: ' + maxRef : '') + '</div>';
        html += '<div class="muscle-detail" id="md-' + mg.replace(/[^a-zA-Z0-9]/g,'') + '">';
        if (exDetails.length > 0) {
          exDetails.forEach(function(ex) {
            html += '<div class="detail-ex"><span class="detail-day">' + escapeHtml(ex.giorno) + '</span> <strong>' + escapeHtml(ex.nome) + '</strong> <span class="detail-meta">' + escapeHtml(ex.serie) + '×' + escapeHtml(ex.reps) + ', RPE ' + escapeHtml(ex.rpe) + '</span></div>';
          });
        } else {
          html += '<div class="detail-ex muted">Nessun esercizio nei template</div>';
        }
        html += '</div>';
      });
      html += '</div>';

      // === Progress chart per exercise ===
      var progExercises = [];
      state.workoutHistory.forEach(function(w) {
        w.exercises.forEach(function(ex) {
          var hasWeight = ex.sets.some(function(s) { return s.completato && s.peso_kg > 0; });
          if (hasWeight && progExercises.indexOf(ex.nome) < 0) progExercises.push(ex.nome);
        });
      });
      progExercises.sort();

      if (progExercises.length > 0) {
        var selEx = state.progressoEsercizio || progExercises[0];
        if (progExercises.indexOf(selEx) < 0) selEx = progExercises[0];

        html += '<div class="divider"></div><h3>Progresso per esercizio</h3>';
        html += '<select id="progress-ex-select" style="font-size: 14px; padding: 8px; border: 1px solid var(--border); border-radius: var(--radius-sm); width: 100%; background: var(--bg); color: var(--text); margin-bottom: 12px;">';
        progExercises.forEach(function(name) {
          html += '<option value="' + escapeHtml(name) + '"' + (name === selEx ? ' selected' : '') + '>' + escapeHtml(name) + '</option>';
        });
        html += '</select>';
        html += '<div id="progress-chart" style="width:100%;height:180px;">' + buildProgressChartSVG(selEx) + '</div>';
      } else {
        html += '<div class="divider"></div><h3>Progresso per esercizio</h3><p class="muted" style="font-size: 12px;">Completa alcuni allenamenti per vedere i grafici di progressione.</p>';
      }

      html += renderTendenze();

      view.innerHTML = html;
      attachProgressTooltip();

      // Click to toggle muscle detail
      var chartEl = view.querySelector('.mt-8');
      if (chartEl) {
        chartEl.addEventListener('click', function(e) {
          var row = e.target.closest('.muscle-row');
          if (!row) return;
          var id = row.getAttribute('data-mg');
          if (!id) return;
          var detail = document.getElementById('md-' + id.replace(/[^a-zA-Z0-9]/g,''));
          if (detail) {
            var expanded = detail.style.display === 'block';
            document.querySelectorAll('.muscle-detail').forEach(function(d) { d.style.display = 'none'; });
            if (!expanded) detail.style.display = 'block';
          }
        });
      }

      // Progress chart selector
      var sel = document.getElementById('progress-ex-select');
      if (sel) {
        sel.addEventListener('change', function() {
          state.progressoEsercizio = this.value;
          var chartDiv = document.getElementById('progress-chart');
          if (chartDiv) chartDiv.innerHTML = buildProgressChartSVG(this.value);
          attachProgressTooltip();
        });
      }
    }

    function buildProgressChartSVG(exName) {
      if (!exName) return '<p class="muted" style="font-size:12px;">Seleziona un esercizio.</p>';

      var points = [];
      state.workoutHistory.forEach(function(w) {
        var ex = w.exercises.find(function(e) { return e.nome === exName; });
        if (!ex) return;
        var maxWeight = 0;
        ex.sets.forEach(function(s) {
          if (s.completato && s.peso_kg > 0 && s.peso_kg > maxWeight) maxWeight = s.peso_kg;
        });
        if (maxWeight > 0) {
          var d = new Date(w.data);
          var label = ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth()+1)).slice(-2);
          points.push({ date: w.data, weight: maxWeight, label: label });
        }
      });

      if (points.length < 2) {
        return '<p class="muted" style="font-size:12px;">Servono almeno 2 allenamenti con peso registrato per vedere un grafico.</p>';
      }

      var W = 300, H = 150;
      var padL = 32, padR = 8, padT = 12, padB = 24;
      var chartW = W - padL - padR;
      var chartH = H - padT - padB;

      var weights = points.map(function(p) { return p.weight; });
      var maxVal = Math.max.apply(null, weights);
      var minVal = Math.max(0, Math.min.apply(null, weights) - 5);
      if (minVal === maxVal) { minVal = maxVal - 5; if (minVal < 0) minVal = 0; }
      var range = maxVal - minVal || 1;

      var bestWeight = Math.max.apply(null, weights);
      var bestIdx = weights.indexOf(bestWeight);

      var compareHtml = '';
      if (points.length >= 2) {
        var last = points[points.length - 1].weight;
        var prev = points[points.length - 2].weight;
        var diff = last - prev;
        if (diff > 0) {
          compareHtml = '<div class="progress-compare success">▲ +' + diff + ' kg dall\'ultima sessione</div>';
        } else if (diff < 0) {
          compareHtml = '<div class="progress-compare error">▼ ' + diff + ' kg dall\'ultima sessione</div>';
        } else {
          compareHtml = '<div class="progress-compare">— invariato rispetto all\'ultima sessione</div>';
        }
      }

      var svg = '<svg class="progress-svg" viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:100%;font-size:9px;overflow:visible;">';

      for (var i = 0; i <= 4; i++) {
        var val = minVal + (range * i / 4);
        var y = padT + chartH - (chartH * i / 4);
        svg += '<text x="' + (padL - 4) + '" y="' + (y + 3) + '" text-anchor="end" fill="var(--text-secondary)">' + Math.round(val) + '</text>';
        svg += '<line x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '" stroke="var(--border)" stroke-width="0.5"/>';
      }

      var linePoints = [];
      points.forEach(function(p, i) {
        var x = padL + (chartW * i / (points.length - 1));
        var y = padT + chartH - (chartH * (p.weight - minVal) / range);
        linePoints.push(x + ',' + y);

        var isBest = i === bestIdx;
        var fill = isBest ? 'var(--color-success)' : 'var(--color-accent)';
        var classes = 'progress-point' + (isBest ? ' progress-point-best' : '');

        svg += '<circle class="' + classes + '" cx="' + x + '" cy="' + y + '" r="4" fill="' + fill + '" stroke="#fff" stroke-width="2" data-weight="' + p.weight + '" data-date="' + p.label + '"/>';

        if (isBest) {
          svg += '<text x="' + x + '" y="' + (y - 11) + '" text-anchor="middle" fill="var(--color-success)" font-weight="700" font-size="7">BEST</text>';
        }

        svg += '<text x="' + x + '" y="' + (padT + chartH + 14) + '" text-anchor="end" transform="rotate(-30,' + x + ',' + (padT + chartH + 14) + ')" fill="var(--text-secondary)">' + p.label + '</text>';
        svg += '<text x="' + x + '" y="' + (y - 6) + '" text-anchor="middle" font-weight="600" fill="var(--color-accent)" font-size="8">' + p.weight + '</text>';
      });
      svg += '<polyline points="' + linePoints.join(' ') + '" fill="none" stroke="var(--color-accent)" stroke-width="2" stroke-linejoin="round" opacity="0.6"/>';

      svg += '</svg>';

      var html = '<div class="progress-container">';
      html += svg;
      html += '<div class="progress-tooltip" id="progress-tt"></div>';
      html += '</div>';
      html += compareHtml;

      return html;
    }

    function attachProgressTooltip() {
      var chart = document.getElementById('progress-chart');
      if (!chart) return;
      var container = chart.querySelector('.progress-container');
      var tooltip = document.getElementById('progress-tt');
      if (!container || !tooltip) return;

      function showTooltip(circle) {
        var weight = circle.getAttribute('data-weight');
        var date = circle.getAttribute('data-date');
        var rect = circle.getBoundingClientRect();
        var containerRect = container.getBoundingClientRect();
        tooltip.textContent = weight + ' kg \u00b7 ' + date;
        tooltip.style.left = (rect.left - containerRect.left + rect.width / 2) + 'px';
        tooltip.style.top = (rect.top - containerRect.top) + 'px';
        tooltip.classList.add('visible');
      }

      function hideTooltip() {
        tooltip.classList.remove('visible');
      }

      container.addEventListener('mouseenter', function(e) {
        var circle = e.target.closest('.progress-point');
        if (circle) showTooltip(circle);
      }, true);

      container.addEventListener('mouseleave', function() {
        hideTooltip();
      });

      container.addEventListener('touchstart', function(e) {
        var circle = e.target.closest('.progress-point');
        if (!circle) { hideTooltip(); return; }
        if (tooltip.classList.contains('visible')) {
          hideTooltip();
        } else {
          showTooltip(circle);
        }
      }, { passive: true });
    }

    function renderProgramma() {
      var container = document.getElementById('view-programma');
      var templates = state.templates;
      var dayIndex = state.editingDay;
      var dayNames = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì'];
      var isEditing = state.programmaEditMode;

      var faseLabel = state.fase === 'deload' ? 'Deload' : 'Fase ' + state.fase;
      var html = '<div class="view-header flex items-center justify-between">' +
        '<h1 class="view-title" style="margin:0;">Programma</h1>' +
        '<div class="flex items-center gap-8">' +
          '<span class="fase-badge">' + escapeHtml(faseLabel) + '</span>' +
          '<button class="btn btn-ghost btn-sm" onclick="toggleProgrammaEdit()">' +
            '<span class="material-symbols-outlined">' + (isEditing ? 'done' : 'edit') + '</span>' +
          '</button>' +
        '</div>' +
      '</div>';

      if (isEditing) {
        // === EDIT MODE ===
        html += '<div class="flex gap-8 mb-12" style="flex-wrap: wrap;">';
        templates.forEach(function(t, i) {
          html += '<button class="btn btn-sm' + (i === dayIndex ? ' btn-primary' : '') + '" onclick="setEditingDay(' + i + ')">' + escapeHtml(t.giorno) + '</button>';
        });
        html += '</div>';

        var template = templates[dayIndex];
        if (template) {
          html += '<div class="programma-detail">';
          template.esercizi.forEach(function(ex, i) {
            var isFirst = i === 0;
            var isLast = i === template.esercizi.length - 1;
            html += '<div class="exercise-item">' +
              '<div class="flex justify-between items-center">' +
                '<div class="exercise-name">' + escapeHtml(ex.nome) + '</div>' +
                '<div class="flex gap-4">' +
                  '<button class="btn btn-ghost btn-sm" onclick="moveExercise(' + dayIndex + ', ' + i + ', -1)"' + (isFirst ? ' disabled' : '') + '><span class="material-symbols-outlined" style="font-size: 16px;">keyboard_arrow_up</span></button>' +
                  '<button class="btn btn-ghost btn-sm" onclick="moveExercise(' + dayIndex + ', ' + i + ', 1)"' + (isLast ? ' disabled' : '') + '><span class="material-symbols-outlined" style="font-size: 16px;">keyboard_arrow_down</span></button>' +
                  '<button class="btn btn-ghost btn-sm" onclick="removeExercise(' + dayIndex + ', ' + i + ')"><span class="material-symbols-outlined" style="font-size: 16px;">close</span></button>' +
                '</div>' +
              '</div>' +
              '<div class="flex gap-8 mt-8" style="font-size: 13px;">' +
                '<label>Serie <input type="number" name="serie-' + dayIndex + '-' + i + '" value="' + escapeHtml(ex.serie) + '" min="1" max="10" style="width: 40px;" onchange="updateExerciseParam(' + dayIndex + ', ' + i + ', \'serie\', this.value)"></label>' +
                '<label>Reps <input type="text" name="reps-' + dayIndex + '-' + i + '" value="' + escapeHtml(ex.reps) + '" style="width: 50px;" onchange="updateExerciseParam(' + dayIndex + ', ' + i + ', \'reps\', this.value)"></label>' +
                '<label>Recupero <input type="number" name="recupero-' + dayIndex + '-' + i + '" value="' + Math.floor(ex.recupero / 60) + '" min="1" max="5" style="width: 40px;" onchange="updateExerciseParam(' + dayIndex + ', ' + i + ', \'recupero\', this.value * 60)"> min</label>' +
              '</div>' +
              '<div class="mt-8" style="font-size: 12px;"><label>Alternative (separate da virgola): <input type="text" value="' + escapeHtml((ex.alternative || []).join(', ')) + '" placeholder="es. Alzate laterali manubri" style="width:100%;font-size:13px;text-align:left;" onchange="updateExerciseAlternatives(' + dayIndex + ', ' + i + ', this.value)"></label></div>' +
            '</div>';
          });
          html += '</div>';
          html += '<button class="btn btn-block mt-8" onclick="showAddExercise()">+ Aggiungi esercizio</button>';
        }

        html += '<div class="divider mt-24"></div><h3>Fase</h3><div class="toggle-group mb-12">';
        html += '<button class="toggle-btn' + (state.fase === 1 ? ' active' : '') + '" onclick="setFase(1)">Fase 1</button>';
        html += '<button class="toggle-btn' + (state.fase === 2 ? ' active' : '') + '" onclick="setFase(2)">Fase 2</button>';
        html += '<button class="toggle-btn' + (state.fase === 3 ? ' active' : '') + '" onclick="setFase(3)">Fase 3</button>';
        html += '<button class="toggle-btn' + (state.fase === 'deload' ? ' active' : '') + '" onclick="setFase(\'deload\')">Deload</button>';
        html += '</div><p class="muted" style="font-size: 11px;">Fase 2: alzate laterali +1 serie | Fase 3: anche shrug +1 serie | Deload: -50% serie</p>';

      } else {
        // === VIEW MODE ===
        html += '<div class="programma-tabs">';
        templates.forEach(function(t, i) {
          var isActive = i === dayIndex;
          var oggi = new Date().toISOString().split('T')[0];
          var isDone = state.workoutHistory.some(function(w) {
            return w.giorno === t.giorno && w.data === oggi;
          });
          html += '<button class="programma-tab' + (isActive ? ' active' : '') + '" onclick="setEditingDay(' + i + ')">' +
            '<span class="programma-tab-day">' + dayNames[i] + '</span>' +
            '<span class="programma-tab-name">' + escapeHtml(t.nome || t.giorno) + '</span>' +
            (isDone ? '<span class="material-symbols-outlined text-success" style="font-size:16px">check_circle</span>' : '') +
          '</button>';
        });
        html += '</div>';

        var template = templates[dayIndex];
        if (template) {
          html += '<div class="programma-detail">';
          template.esercizi.forEach(function(ex) {
            var recuperoMin = Math.round(ex.recupero / 60);
            html += '<div class="programma-exercise">' +
              '<div class="programma-exercise-name">' + escapeHtml(ex.nome) + '</div>' +
              '<div class="programma-exercise-details">' +
                '<span class="badge badge-sets">' + escapeHtml(ex.serie) + '×' + escapeHtml(ex.reps) + '</span>' +
                '<span class="badge badge-rest">Rec ' + recuperoMin + '\'</span>' +
                (ex.rpeTarget ? '<span class="badge badge-rpe">RPE ' + escapeHtml(ex.rpeTarget) + '</span>' : '') +
              '</div>' +
            '</div>';
          });
          html += '</div>';
        }

        html += '<h3 class="section-title" style="margin-top:24px;">Schema settimanale</h3>' +
          '<div class="programma-week-grid">';
        dayNames.forEach(function(name, i) {
          var t = templates[i];
          var oggi = new Date().toISOString().split('T')[0];
          var isDone = t ? state.workoutHistory.some(function(w) {
            return w.giorno === t.giorno && w.data === oggi;
          }) : false;
          html += '<div class="programma-week-cell' + (i === dayIndex ? ' active' : '') + '" onclick="setEditingDay(' + i + ')">' +
            '<div class="week-cell-day">' + name.substring(0, 3) + '</div>' +
            '<div class="week-cell-name">' + (t ? escapeHtml(t.nome || t.giorno) : '—') + '</div>' +
            (isDone ? '<div class="week-cell-check"><span class="material-symbols-outlined" style="font-size:14px;">check_circle</span></div>' : '') +
          '</div>';
        });
        html += '</div>';
      }

      container.innerHTML = html;
    }

    function toggleProgrammaEdit() {
      state.programmaEditMode = !state.programmaEditMode;
      renderProgramma();
    }

    function renderCalendarMonth(year, month) {
      var firstDay = new Date(year, month, 1).getDay();
      var daysInMonth = new Date(year, month + 1, 0).getDate();
      var today = new Date();

      var dayVolumes = {};
      state.workoutHistory.forEach(function(w) {
        var d = new Date(w.data);
        if (d.getFullYear() === year && d.getMonth() === month) {
          var vol = w.exercises.reduce(function(sum, e) {
            return sum + e.sets.filter(function(s) { return s.completato; }).length;
          }, 0);
          dayVolumes[d.getDate()] = vol;
        }
      });

      var totalSessions = Object.keys(dayVolumes).length;
      var totalVolume = Object.values(dayVolumes).reduce(function(a, b) { return a + b; }, 0);
      var avgVolume = totalSessions > 0 ? Math.round(totalVolume / totalSessions) : 0;

      var monthNames = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
        'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];

      var html = '<div class="calendar-header">' +
        '<button class="btn btn-ghost btn-sm" onclick="changeMonth(-1)">‹</button>' +
        '<span class="calendar-month-title">' + monthNames[month] + ' ' + year + '</span>' +
        '<button class="btn btn-ghost btn-sm" onclick="changeMonth(1)">›</button>' +
      '</div>' +
      '<div class="calendar-stats">' +
        '<div class="stat"><span class="stat-value">' + totalSessions + '</span> sessioni</div>' +
        '<div class="stat"><span class="stat-value">' + totalVolume + '</span> set totali</div>' +
        '<div class="stat"><span class="stat-value">' + avgVolume + '</span> media/sess</div>' +
      '</div>' +
      '<div class="calendar-grid">' +
        '<div class="calendar-day-header">Dom</div>' +
        '<div class="calendar-day-header">Lun</div>' +
        '<div class="calendar-day-header">Mar</div>' +
        '<div class="calendar-day-header">Mer</div>' +
        '<div class="calendar-day-header">Gio</div>' +
        '<div class="calendar-day-header">Ven</div>' +
        '<div class="calendar-day-header">Sab</div>';

      for (var i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day empty"></div>';
      }

      for (var day = 1; day <= daysInMonth; day++) {
        var vol = dayVolumes[day];
        var isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        var volumeClass = vol > 20 ? 'high' : vol > 10 ? 'medium' : vol > 0 ? 'low' : '';
        var hasWorkout = vol !== undefined;

        html += '<div class="calendar-day ' + volumeClass + (isToday ? ' today' : '') + (hasWorkout ? ' has-workout' : '') + '"' +
          (hasWorkout ? ' onclick="showDayWorkouts(' + year + ', ' + (month + 1) + ', ' + day + ')"' : '') + '>' +
          '<span class="calendar-day-num">' + day + '</span>' +
          (vol !== undefined ? '<span class="calendar-day-vol">' + vol + '</span>' : '') +
        '</div>';
      }

      html += '</div>';
      return html;
    }

    function changeMonth(delta) {
      state.calendarMonth += delta;
      if (state.calendarMonth < 0) { state.calendarMonth = 11; state.calendarYear--; }
      if (state.calendarMonth > 11) { state.calendarMonth = 0; state.calendarYear++; }
      renderStorico();
    }

    function showDayWorkouts(year, month, day) {
      var dateStr = year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
      var dayWorkouts = state.workoutHistory.filter(function(w) { return w.data === dateStr; });
      if (dayWorkouts.length === 0) return;

      var totalVolume = 0;
      var totalSets = 0;
      var html = '<div class="modal-box" style="max-height: 80vh; overflow-y: auto;"><h2>' + day + '/' + month + '/' + year + '</h2>';
      dayWorkouts.forEach(function(w) {
        html += '<div class="card card-clickable" onclick="viewWorkoutDetail(\'' + w.id + '\')"><div class="flex justify-between"><span style="font-weight: 700;">' + w.giorno + '</span><span class="muted">' + w.data + '</span></div><div class="exercise-meta">' + Math.floor(w.durata_secondi / 60) + ' min</div>';
        w.exercises.forEach(function(ex) {
          var doneSets = ex.sets.filter(function(s) { return s.completato; });
          if (doneSets.length === 0) return;
          var volume = doneSets.reduce(function(sum, s) { return sum + (s.ripetizioni * s.peso_kg); }, 0);
          totalVolume += volume;
          totalSets += doneSets.length;
          html += '<div style="padding: 4px 0; font-size: 12px;"><span style="font-weight: 600;">' + escapeHtml(ex.nome) + '</span> ' + doneSets.length + 's ' + volume + 'kg</div>';
        });
        html += '</div>';
      });
      html += '<div class="modal-actions"><button class="btn btn-block" onclick="this.closest(\'.modal-overlay\').remove()">Chiudi</button></div></div>';
      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = html;
      document.body.appendChild(overlay);
      requestAnimationFrame(function() { overlay.classList.add('active'); });
    }

    function setStoricoView(mode) {
      state.storicoView = mode;
      renderStorico();
    }

    function renderStorico() {
      var view = document.getElementById('view-storico');

      if (state.workoutHistory.length === 0) {
        view.innerHTML = '<div class="view-header"><h1 class="view-title">Storico</h1></div>' +
          renderEmptyState('fitness_center', 'Nessun allenamento ancora',
            'Completa il tuo primo allenamento per vedere lo storico qui.',
            'Vai agli allenamenti', 'switchView(\'oggi\')');
        return;
      }

      var html = '<div><h1>Storico</h1>';

      html += '<div class="toggle-group mb-12">';
      html += '<button class="toggle-btn' + (state.storicoView === 'calendar' ? ' active' : '') + '" onclick="setStoricoView(\'calendar\')">Calendario</button>';
      html += '<button class="toggle-btn' + (state.storicoView === 'list' ? ' active' : '') + '" onclick="setStoricoView(\'list\')">Settimane</button>';
      html += '</div>';

      if (state.storicoView === 'calendar') {
        html += renderCalendarMonth(state.calendarYear, state.calendarMonth);
      } else {
        var weeks = groupByWeek(state.workoutHistory);
        var weekKeys = Object.keys(weeks).sort().reverse();

      if (weekKeys.length === 0) {
        html += '<p class="muted">Nessun allenamento registrato.</p>';
      } else {
        html += '<h3>Volume settimanale</h3><div id="volume-chart" class="mt-8 mb-16">';
        var maxVolume = 0;
        weekKeys.slice(0, 6).forEach(function(k) { if (weeks[k].volume > maxVolume) maxVolume = weeks[k].volume; });

        weekKeys.slice(0, 6).forEach(function(weekKey) {
          var week = weeks[weekKey];
          var pct = maxVolume > 0 ? (week.volume / maxVolume) * 100 : 0;
          html += '<div class="flex items-center gap-8 mb-8"><div style="width: 60px; font-size: 11px; color: var(--text-secondary); text-align: right;">' + week.label + '</div><div class="chart-bar" style="width: ' + pct + '%;"></div><div style="font-size: 12px; font-weight: 700; min-width: 60px;">' + (week.volume / 1000).toFixed(1) + 'k kg</div></div>';
        });
        html += '</div>';

        setTimeout(function() {
          try {
            anime({ targets: '.chart-bar', width: function(el) { return el.style.width; }, easing: 'easeOutCubic', duration: 800, delay: anime.stagger(100) });
          } catch(e) {}
        }, 100);

        html += '<h3 class="mt-16">Settimane</h3>';
        weekKeys.slice(0, 4).forEach(function(weekKey) {
          var week = weeks[weekKey];
          html += '<div class="card card-clickable" onclick="showWeekDetails(\'' + weekKey + '\')"><div class="flex justify-between items-center mb-8"><span style="font-weight: 700;">' + week.label + '</span><span style="font-size: 13px; color: var(--ok-color);">' + week.completed + '/' + week.total + ' allenamenti</span></div><div class="flex gap-8">';
          week.days.forEach(function(d) {
            html += '<div style="text-align: center;"><div style="font-size: 10px; color: var(--text-secondary); text-transform: uppercase;">' + d.name + '</div><div style="width: 32px; height: 32px; border-radius: 50%; background: ' + (d.done ? 'var(--color-text-primary)' : 'var(--color-border)') + '; display: flex; align-items: center; justify-content: center; margin: 4px auto 0; color: ' + (d.done ? 'var(--color-bg)' : 'var(--color-text-muted)') + ';">' + (d.done ? '<span class="material-symbols-outlined" style="font-size: 16px; color: var(--color-bg);">check</span>' : '<span class="material-symbols-outlined" style="font-size: 14px;">radio_button_unchecked</span>') + '</div></div>';
          });
          html += '</div></div>';
        });

        html += '<h3 class="mt-16">Progressi esercizi</h3>';
        var allExercises = [];
        state.workoutHistory.forEach(function(w) {
          w.exercises.forEach(function(e) {
            if (allExercises.indexOf(e.nome) === -1) allExercises.push(e.nome);
          });
        });

        allExercises.slice(0, 5).forEach(function(exName) {
          var entries = [];
          state.workoutHistory.forEach(function(w) {
            w.exercises.filter(function(e) { return e.nome === exName; }).forEach(function(e) {
              e.sets.filter(function(s) { return s.completato; }).forEach(function(s) {
                entries.push({ data: w.data, peso_kg: s.peso_kg, ripetizioni: s.ripetizioni });
              });
            });
          });
          entries.sort(function(a, b) { return new Date(b.data) - new Date(a.data); });
          entries = entries.slice(0, 3);
          if (entries.length === 0) return;
          html += '<div class="exercise-item"><div class="exercise-name">' + exName + '</div><div class="exercise-meta">' + entries.map(function(e) { return e.data + ': ' + e.peso_kg + 'kg × ' + e.ripetizioni; }).join('<br>') + '</div></div>';
        });
      }
      }
      
      html += '</div>';
      view.innerHTML = html;
    }

    function showWeekDetails(weekKey) {
      var workouts = groupByWeek(state.workoutHistory)[weekKey];
      if (!workouts || !workouts.workouts || workouts.workouts.length === 0) return;
      var html = '<div class="modal-box" style="max-height: 80vh; overflow-y: auto;"><h2>' + workouts.label + '</h2>';
      workouts.workouts.forEach(function(w) {
        var vol = 0;
        w.exercises.forEach(function(ex) {
          ex.sets.filter(function(s) { return s.completato; }).forEach(function(s) {
            vol += s.ripetizioni * s.peso_kg;
          });
        });
        html += '<div class="card card-clickable" onclick="viewWorkoutDetail(\'' + w.id + '\')"><div class="flex justify-between"><span style="font-weight: 700;">' + w.giorno + '</span><span class="muted">' + w.data + '</span></div><div class="exercise-meta">' + Math.floor(w.durata_secondi / 60) + ' min · ' + vol + ' kg volume</div><button class="btn-delete-workout" data-id="' + w.id + '" onclick="event.stopPropagation();deleteWorkout(this.dataset.id)"><span class="material-symbols-outlined" style="font-size: 18px;">delete</span></button></div>';
      });
      html += '<div class="modal-actions"><button class="btn btn-block" onclick="this.closest(\'.modal-overlay\').remove()">Chiudi</button></div></div>';
      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = html;
      document.body.appendChild(overlay);
      requestAnimationFrame(function() { overlay.classList.add('active'); });
    }

    function viewWorkoutDetail(id) {
      var workout = state.workoutHistory.find(function(w) { return w.id === id; });
      if (!workout) return;
      var totalVolume = 0;
      var totalSets = 0;
      var html = '<div class="modal-box" style="max-height: 80vh; overflow-y: auto;"><h2>' + escapeHtml(workout.giorno) + '</h2><p class="muted mb-16">' + escapeHtml(workout.data) + ' · ' + Math.floor(workout.durata_secondi / 60) + ' minuti</p><div class="divider"></div>';
      workout.exercises.forEach(function(ex) {
        var doneSets = ex.sets.filter(function(s) { return s.completato; });
        if (doneSets.length === 0) return;
        var volume = doneSets.reduce(function(sum, s) { return sum + (s.ripetizioni * s.peso_kg); }, 0);
        totalVolume += volume;
        totalSets += doneSets.length;
        html += '<div class="flex items-center justify-between" style="padding: 8px 0; border-bottom: 1px solid var(--border-light);"><div><div class="exercise-name" style="font-size: 14px;">' + escapeHtml(ex.nome) + '</div><div class="muted">' + doneSets.length + ' serie · ' + doneSets.map(function(s) { return escapeHtml(s.ripetizioni) + '×' + escapeHtml(s.peso_kg) + 'kg'; }).join(', ') + '</div></div><div class="accent-text" style="font-weight: 700;">' + volume + ' kg</div></div>';
      });
      html += '<div class="divider"></div><div class="flex justify-between" style="font-size: 18px;"><div><span style="font-weight: 700;">' + totalVolume + ' kg</span> <span class="muted">volume</span></div><div><span style="font-weight: 700;">' + totalSets + '</span> <span class="muted">serie</span></div><div><span style="font-weight: 700;">' + Math.floor(workout.durata_secondi / 60) + '\'</span> <span class="muted">durata</span></div></div>';
      html += '<div class="divider"></div><div class="modal-actions"><button class="btn btn-ghost" style="color: var(--accent-dark);" onclick="deleteWorkout(\'' + id + '\'); this.closest(\'.modal-overlay\').remove()">Elimina allenamento</button><button class="btn btn-block" onclick="this.closest(\'.modal-overlay\').remove()">Chiudi</button></div></div>';
      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = html;
      document.body.appendChild(overlay);
      requestAnimationFrame(function() { overlay.classList.add('active'); });
    }

    function deleteWorkout(id) {
      var idx = state.workoutHistory.findIndex(function(w) { return w.id === id; });
      if (idx === -1) return;
      state.workoutHistory.splice(idx, 1);
      saveCache();
      document.querySelectorAll('.modal-overlay').forEach(function(m) { m.remove(); });
      renderStorico();
    }

    function groupByWeek(workouts) {
      var weeks = {};
      workouts.forEach(function(w) {
        var d = new Date(w.data);
        var startOfWeek = new Date(d);
        startOfWeek.setDate(d.getDate() - d.getDay() + 1);
        var weekKey = startOfWeek.toISOString().split('T')[0];

        if (!weeks[weekKey]) {
          weeks[weekKey] = { volume: 0, total: 0, completed: 0, days: [], label: '', workouts: [] };
          var weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
          for (var i = 0; i < 7; i++) {
            var day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            weeks[weekKey].days.push({ name: weekDays[i], date: day.toISOString().split('T')[0], done: false });
          }
          var month = startOfWeek.toLocaleDateString('it-IT', { month: 'short' });
          weeks[weekKey].label = startOfWeek.getDate() + ' ' + month;
        }

        var dayData = weeks[weekKey].days.find(function(d) { return d.date === w.data; });
        if (dayData) dayData.done = true;
        weeks[weekKey].completed++;
        weeks[weekKey].total = Math.min(5, 7);
        weeks[weekKey].workouts.push(w);
        var vol = 0;
        w.exercises.forEach(function(ex) {
          ex.sets.filter(function(s) { return s.completato; }).forEach(function(s) {
            vol += s.ripetizioni * s.peso_kg;
          });
        });
        weeks[weekKey].volume += vol;
      });
      return weeks;
    }

    function renderImpostazioni() {
      var view = document.getElementById('view-impostazioni');
      var html = '<div><h1>Impostazioni</h1>';
      html += '<h3>Dark mode</h3><div class="toggle-group mb-12">';
      html += '<button class="toggle-btn' + (state.darkMode === null ? ' active' : '') + '" onclick="setDarkMode(null)">Auto</button>';
      html += '<button class="toggle-btn' + (state.darkMode === true ? ' active' : '') + '" onclick="setDarkMode(true)">Scuro</button>';
      html += '<button class="toggle-btn' + (state.darkMode === false ? ' active' : '') + '" onclick="setDarkMode(false)">Chiaro</button>';
      html += '</div>';
      html += '<div class="divider mt-24"></div><h3>Dati</h3><button class="btn btn-block mt-8" onclick="exportData()">Esporta tutto (.json)</button><div class="mt-8"><input type="file" id="import-file" accept=".json" style="display: none;" onchange="importData(event)"><button class="btn btn-block" onclick="document.getElementById(\'import-file\').click()">Importa da file...</button></div><button class="btn btn-block mt-8 btn-danger" onclick="resetData()">Reset dati allenamenti</button></div>';
      view.innerHTML = html;
    }

    function setFase(fase) {
      state.fase = fase;
      saveCache();
      renderProgramma();
    }

    function setDarkMode(mode) {
      state.darkMode = mode;
      saveCache();
      applyDarkMode();
      renderImpostazioni();
    }

    function setEditingDay(index) {
      state.editingDay = index;
      renderProgramma();
    }

    function updateExerciseParam(dayIndex, exIndex, param, value) {
      state.templates[dayIndex].esercizi[exIndex][param] = value;
      saveCache();
      renderProgramma();
    }

    function updateExerciseAlternatives(dayIndex, exIndex, value) {
      var alternatives = value.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s; });
      state.templates[dayIndex].esercizi[exIndex].alternative = alternatives;
      saveCache();
    }

    function removeExercise(dayIndex, exIndex) {
      state.templates[dayIndex].esercizi.splice(exIndex, 1);
      saveCache();
      renderProgramma();
    }

    function moveExercise(dayIndex, exIndex, dir) {
      var arr = state.templates[dayIndex].esercizi;
      var target = exIndex + dir;
      if (target < 0 || target >= arr.length) return;
      var tmp = arr[exIndex];
      arr[exIndex] = arr[target];
      arr[target] = tmp;
      saveCache();
      renderProgramma();
    }

    function showAddExercise() {
      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.id = 'add-ex-modal';
      overlay.innerHTML = '<div class="modal-box"><h2>Nuovo esercizio</h2><label for="add-ex-name">Nome</label><input type="text" id="add-ex-name" placeholder="es. Panca piana" autofocus><label for="add-ex-sets">Serie</label><input type="number" id="add-ex-sets" value="3" min="1" max="10"><label for="add-ex-reps">Reps target</label><input type="text" id="add-ex-reps" value="8-12" placeholder="8-12"><label for="add-ex-rest">Recupero (min)</label><input type="number" id="add-ex-rest" value="1.5" min="0.5" max="5" step="0.5"><div class="modal-actions"><button class="btn btn-ghost" onclick="document.getElementById(\'add-ex-modal\').remove()">Annulla</button><button class="btn btn-primary" onclick="confirmAddExercise()">Aggiungi</button></div></div>';
      document.body.appendChild(overlay);
      requestAnimationFrame(function() { overlay.classList.add('active'); });
      setTimeout(function() { document.getElementById('add-ex-name').focus(); }, 150);
    }

    function confirmAddExercise() {
      var name = document.getElementById('add-ex-name').value.trim();
      if (!name) return;
      var sets = parseInt(document.getElementById('add-ex-sets').value) || 3;
      var reps = document.getElementById('add-ex-reps').value.trim() || '8-12';
      var rest = Math.round((parseFloat(document.getElementById('add-ex-rest').value) || 1.5) * 60);
      var dayIndex = state.editingDay || 0;
      state.templates[dayIndex].esercizi.push({ nome: name, serie: sets, reps: reps, recupero: rest, rpeTarget: '7.5-9' });
      saveCache();
      document.getElementById('add-ex-modal').remove();
      renderProgramma();
    }

    function exportData() {
      var data = {
        templates: state.templates,
        workoutHistory: state.workoutHistory,
        lastWeights: state.lastWeights,
        exportedAt: new Date().toISOString(),
      };
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'workout-backup-' + new Date().toISOString().split('T')[0] + '.json';
      a.click();
    }

    function importData(event) {
      var file = event.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(e) {
        try {
          var data = JSON.parse(e.target.result);
          if (!data || typeof data !== 'object') throw new Error('Invalid data');
          if (data.templates) {
            if (!Array.isArray(data.templates)) throw new Error('templates must be array');
            data.templates.forEach(function(t) {
              if (!t.giorno || typeof t.giorno !== 'string') throw new Error('Invalid template');
              if (!Array.isArray(t.esercizi)) throw new Error('Invalid exercises');
            });
            state.templates = data.templates;
          }
          if (data.workoutHistory) {
            if (!Array.isArray(data.workoutHistory)) throw new Error('workoutHistory must be array');
            data.workoutHistory.forEach(function(w) {
              if (!w.id || !w.data || !w.giorno) throw new Error('Invalid workout entry');
              if (!Array.isArray(w.exercises)) throw new Error('Invalid workout exercises');
            });
            state.workoutHistory = data.workoutHistory;
          }
          if (data.lastWeights) {
            if (typeof data.lastWeights !== 'object') throw new Error('lastWeights must be object');
            state.lastWeights = data.lastWeights;
          }
          saveCache();
          renderImpostazioni();
    switchView('oggi');
        } catch(err) {
          alert('Errore importazione file: ' + err.message);
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
    switchView('oggi');
        renderImpostazioni();
      }
    }



    switchView('oggi');
