# Workout Tracker — Design Document

**Data:** 2026-07-03
**Stato:** Approvato

## Overview

App monolítica HTML/CSS/JS per tracciare allenamenti in palestra. Sincronizzazione via Supabase, animazioni con AnimeJS. Design minimal svizzero, responsive, mobile-first.

## Schermate

### 1. OGGI (Home)
- Mostra il giorno corrente della scheda (es. "Upper A")
- Se nessun allenamento oggi: bottone "Inizia allenamento"
- Se allenamento in corso: riepilogo e bottone "Continua"
- Se allenamento completato: segno di completato, bottone "Vedi riepilogo"
- Header con data e settimana corrente

### 2. ALLENAMENTO (Flusso attivo)
- **Header**: Nome esercizio corrente + timer recupero (3:00) con barra di progresso
- **Tabella serie**: 3 colonne (REP, PESO, RIR) + check ✔ per completamento
  - Serie completate: testo grigio, check attivo
  - Serie corrente: valori pre-caricati dall'ultimo allenamento in opacità ridotta
  - Click su ✔ → parte timer recupero, serie si segna come completata
- **Lista esercizi**: scroll verticale, corrente in primo piano, prossimi in anteprima
- Timer recupero con notifica/vibrazione al termine
- Al completamento ultima serie, passa automaticamente al prossimo esercizio
- Alla fine di tutti gli esercizi: schermata riepilogo

### 3. STORICO
- **Calendario settimanale**: navigazione orizzontale tra settimane, giorni con pallino pieno/vuoto
- **Volume settimanale**: bar chart con animejs, confronto tra ultime settimane
- **Cronologico esercizi**: per ogni esercizio, elenco ultimi allenamenti con carichi/reps
- **Progressi per esercizio**: grafico carico massimo/reps totali nel tempo

### 4. IMPOSTAZIONI
- **Gestione scheda**: tab per ogni giorno (Upper A, Lower A, Upper B, Lower B, Specializzazione)
- **Vista esercizi**: elenco trascinabile, tap per modificare parametri (serie, reps, recupero, RPE target)
- **Aggiunta/rimozione esercizi**
- **Backup**: export JSON di tutti i dati allenamento
- **Restore**: import da file JSON
- **Reset dati**

## Flusso di navigazione

```
[OGGI] → "Inizia" → [ALLENAMENTO] → fine → [RIEPILOGO] → [OGGI]
                                       ↕ tab bar
                              [STORICO]  [IMPOSTAZIONI]
```

- Tab bar visibile solo su OGGI, STORICO, IMPOSTAZIONI
- Durante ALLENAMENTO e RIEPILOGO: tab bar nascosta, navigazione lineare
- Header con back button su OGGI se in flusso attivo

## Architettura dati

### Supabase Schema

**Tabella `workouts`**
- `id`: uuid
- `nome_giorno`: string (es. "Upper A")
- `data`: date
- `durata_secondi`: number
- `creato_il`: timestamp

**Tabella `exercises`**
- `id`: uuid
- `workout_id`: uuid FK
- `nome_esercizio`: string
- `ordine`: number

**Tabella `sets`**
- `id`: uuid
- `exercise_id`: uuid FK
- `serie_numero`: number
- `ripetizioni`: number
- `peso_kg`: number
- `rir`: number (1-10)
- `completato`: boolean

**Tabella `workout_template`**
- `id`: uuid
- `giorno`: string
- `esercizi`: jsonb (array ordinato con parametri)
- `attivo`: boolean (per avere template multipli futuri)

### LocalStorage cache
- Template scheda cached locally
- Ultimi carichi per esercizio (per pre-caricare input)
- Auth token Supabase

## Stack tecnico

- **Frontend**: HTML monolítico, CSS custom (design svizzero)
- **Animated**: AnimeJS
- **Backend/Database**: Supabase (PostgreSQL + REST API)
- **Sync**: Supabase JS client, offline-first con localStorage fallback
- **Icone**: caratteri unicode o SVG inline (nessuna dipendenza)

## Design System

### Swiss Minimal
- **Font**: Helvetica/Inter/System sans-serif
- **Colori**: Bianco sfondo, nero testo, grigio #999 per secondario, rosso #E53935 per accent/timer
- **Griglia**: 8px base, padding multipli di 8
- **Tipografia**: Solo peso regular e bold, nessun italico
- **Linee**: orizzontali sottili come separatori
- **Bottoni**: rettangolari, bordo 1px, nessuna ombra
- **Checkbox**: quadrati, non arrotondati

### Responsive
- Mobile-first (min-width 320px)
- Tablet: layout più arioso, colonne extra
- Desktop: centrato con max-width 480px per contenuto

## Offline-first

- Se non c'è connessione, i dati vengono salvati in localStorage
- Alla prossima connessione, sync automatico con Supabase
- Il template della scheda è sempre cached localmente
- I workout non syncati vengono marcati e inviati in coda

## Setup Supabase

- L'utente deve creare un progetto Supabase gratuito
- Le credenziali (URL + anon key) vanno inserite nel file HTML
- Le tabelle vengono create via migration SQL

## Implementazione note

- Singolo file HTML autocontenuto (CSS e JS inline)
- Servito su GitHub Pages
- Supabase URL + anon key inline (protetto da row-level security)
- Timer recupero usa Web Audio API per beep + Notification API
- Grafici volume con canvas + AnimeJS
- Double progression logica di suggerimento peso (se reps target raggiunte, suggerisci aumento 2.5-5%)
