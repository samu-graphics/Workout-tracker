# UI/UX Restyling & Miglioramenti — Design Spec

## Obiettivo
Trasformare l'app Workout Tracker da funzionale a piacevole e presentabile (portfolio), unendo restyling visivo e miglioramenti di usabilità.

## 1. Architettura file

Split del monolite `index.html` in 3 file:

```
Workout-tracker/
├── index.html      # Solo struttura HTML (skeleton)
├── style.css       # CSS organizzato per sezioni
└── app.js          # JS organizzato in moduli con comment blocks
```

### style.css — Organizzazione
1. **Design tokens**: variabili CSS (colori, font, spacing, radii, shadows, breakpoints)
2. **Base / reset**: selettori di base, tipografia scale, box-sizing
3. **Layout**: grid/flex utilities, contenitori, max-width mobile-first
4. **Components**: `.card`, `.btn` (primary/secondary/ghost/danger), `.input`, `.modal`, `.tab-bar`, `.badge`, `.timer-bar`, `.set-grid`, `.exercise-block`, `.workout-pill`, `.muscle-row`, `.warmup-box`, `.skeleton`
5. **States**: loading, empty, error — classi dedicate
6. **Animazioni**: keyframes, transition defaults

### app.js — Organizzazione
1. Stato globale e costanti
2. Cache/persistenza (localStorage)
3. Template e schede (dati)
4. Render functions (una per view)
5. Event handlers
6. Timer management (recupero e totale)
7. Animazioni (AnimeJS + CSS)
8. Sync Supabase

Zero dipendenze, zero build step. Deploy su GitHub Pages invariato.

## 2. Design System

### Palette colori
- **Accento**: `#e65100` (arancione) — mantenuto
- **Base**: scala di grigi caldi (non bianco puro)
- **Semantica**:
  - Success: verde muted `#2e7d32`
  - Warning: giallo `#f9a825`
  - Error: rosso `#c62828`
  - Info: blu `#1565c0`
- **Dark mode**: palette dedicata (grigi più caldi, non inversione grezza)

### Tipografia
- IBM Plex Serif per titoli (h1-h3)
- System font per corpo
- Scale tipografica: 12 / 14 / 16 / 20 / 24 / 32 / 40 px
- line-height corpo: 1.6

### Spacing (tokens)
4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 px

### Componenti base
| Componente | Stile |
|---|---|
| Card | Border 1px, ombra leggera, hover state |
| Button | Primary (filled), Secondary (outline), Ghost, Danger |
| Input | Border-bottom, focus state con accento |
| Modal | Overlay con blur, animazione entrata, padding generoso |
| Tab bar | Icona + label, indicatore attivo animato |
| Badge / Tag | Pill arrotondati, colori per stato |
| Skeleton | Placeholder loading shimmer |

## 3. Navigazione

### Tab bar revisionata
```
ALLENAMENTI | ANALISI | PROGRAMMA | STORICO | ⚙️
```

### Vista ALLENAMENTI (ex OGGI)
- **In evidenza**: allenamento raccomandato per oggi
  - Nome scheda, esercizi totali, stato (completato/in corso/da iniziare)
  - Bottone "Inizia" / "Riprendi" primario
- **Elenco schede**: tutte le schede disponibili (Upper A, Lower A, Upper B, Lower B, Specializzazione)
  - Card con nome, giorno assegnato, ultimo completamento
  - Badge fase attiva
- Flusso allenamento attivo parte da qui come overlay fullscreen

### Transizioni
- Cambio tab: slide orizzontale fluida
- Flusso allenamento: slideUp dall'alto
- Modali: fadeIn + scale

## 4. Flusso Allenamento

### Header sticky
- Nome scheda + progresso "3/7 esercizi"
- Barra progresso lineare colorata in alto
- Timer totale allenamento
- Bottone "Termina" sempre visibile

### Exercise block
- Esercizio corrente: card con bordo accento + sfondo leggero
- Nome esercizio grande, note tecniche expandibili
- **Double progression**: pillola "60kg → 62.5kg" sotto il nome
- Set grid: check animato, peso editabile inline, RIR badge
- Riscaldamento: collassabile

### Timer recupero
- Barra progresso + secondi grandi
- Bottone "Salta" più evidente
- Persistente navigando fuori (già implementato)
- Fine timer: pulse sull'esercizio

### Micro-interazioni
- Check serie: animazione checkmark + leggero scale
- Transizione esercizi: slide
- Scroll automatico all'esercizio corrente
- Haptic feedback mirato

## 5. Analisi

### Volume per muscolo
- Barre orizzontali, ogni muscolo con nome e volume
- Max storico: linea di riferimento sottile
- Badge: "sotto volume" / "ottimale" / "sopra volume"
- Filtro per: settimana, mese, fase

### Progresso esercizi
- Grafico SVG inline più grande
- Tooltip sui punti (peso, data)
- Trend line: media mobile 3 sessioni
- Confronto: ultima vs miglior sessione
- Click su esercizio → grafico dedicato (non dropdown)

## 6. Storico

### Vista calendario mensile
- Griglia mensile: giorni con allenamento evidenziati (colore scala volume)
- Click sul giorno → dettaglio workout
- Statistiche mese in header: volume totale, sessioni, durata media
- Swipe orizzontale per cambio mese
- Freccette nav per mobile

### Vista settimanale esistente
- Mantenuta come alternativa (toggle settimana/mese)
- Grafico volume settimanale con AnimeJS

## 7. Tendenze (nuova)

Piccola sezione in ANALISI:
- Grafico volume totale per settimana (line chart)
- Linea di tendenza
- Vedi se volume cresce o cala nel tempo

## 8. Vista Programma

- Tab/giorni cliccabili: selezioni giorno → vedi solo quel workout
- Riassunto esercizio: nome, serie x reps, recupero, RPE
- Schema settimanale: griglia 5 colonne
- Fase attuale: badge nell'header
- Stato completamento: spunta/silhouette per giorni già fatti

## 9. Impostazioni

- Modifica schede: card visive, drag per riordinare
- Edit esercizio: modal pulito, autocomplete su lista esercizi
- Gestione fasi: chiara quali esercizi cambiano
- Preview scheda durante modifica (side panel)

## 10. Stati zero, loading, errori

- **Prima sessione**: messaggio con CTA "Inizia il tuo primo allenamento"
- **Loading**: skeleton cards (non spinner)
- **Errore sync**: toast feedback "Salvataggio fallito — dati al sicuro in locale"
- **Undo**: completamento set accidentale — toast "Annulla" per 5s
- **Empty states**: messaggi chiari per ogni vista senza dati

## 11. Animazioni e transizioni — riepilogo

| Elemento | Animazione |
|---|---|
| Tab switch | Slide orizzontale |
| Allenamento start | SlideUp |
| Modali | FadeIn + scale |
| Check set | Checkmark + scale |
| Timer fine | Pulse subtle |
| Skeleton loading | Shimmer |
| Badge stato | Pulse su cambiamento |
| Card hover | Leggero translateY + ombra |

## Non in scope (per ora)
- Drag & drop reordering esercizi in scheda
- Swipe gesture per completare set
- Multi-utente / autenticazione
- Export PDF
