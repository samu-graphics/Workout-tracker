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
