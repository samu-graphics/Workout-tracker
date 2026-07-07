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

-- Nota: Supabase è stato rimosso dall'app. Questo schema è solo di riferimento.
-- Se in futuro volessi ripristinarlo, usa policy restrittive:
--
-- ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE workout_template ENABLE ROW LEVEL SECURITY;
--
-- Solo INSERT e SELECT per l'anon key (UPDATE/DELETE non concessi):
-- CREATE POLICY "anon insert workouts" ON workouts FOR INSERT WITH CHECK (true);
-- CREATE POLICY "anon select workouts" ON workouts FOR SELECT USING (true);
-- CREATE POLICY "anon insert exercises" ON exercises FOR INSERT WITH CHECK (true);
-- CREATE POLICY "anon select exercises" ON exercises FOR SELECT USING (true);
-- CREATE POLICY "anon insert sets" ON sets FOR INSERT WITH CHECK (true);
-- CREATE POLICY "anon select sets" ON sets FOR SELECT USING (true);
-- CREATE POLICY "anon select template" ON workout_template FOR SELECT USING (true);
-- CREATE POLICY "anon insert template" ON workout_template FOR INSERT WITH CHECK (true);
