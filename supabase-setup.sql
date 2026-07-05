-- Per usare Supabase con autenticazione:
-- 1. Abilita Email Auth in Supabase Dashboard → Authentication → Providers
-- 2. Crea un utente con email e password
-- 3. Esegui questo SQL nell'SQL Editor

-- Workout sessions
CREATE TABLE workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID DEFAULT auth.uid() NOT NULL REFERENCES auth.users(id),
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
  user_id UUID DEFAULT auth.uid() NOT NULL REFERENCES auth.users(id),
  giorno TEXT NOT NULL,
  esercizi JSONB NOT NULL,
  ordine INT NOT NULL
);

-- RLS: require authentication + user ownership
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_template ENABLE ROW LEVEL SECURITY;

-- Workouts: only your own
CREATE POLICY "user workouts" ON workouts
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Exercises: only through your workouts
CREATE POLICY "user exercises" ON exercises
  FOR ALL USING (
    EXISTS (SELECT 1 FROM workouts WHERE workouts.id = exercises.workout_id AND workouts.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM workouts WHERE workouts.id = exercises.workout_id AND workouts.user_id = auth.uid())
  );

-- Sets: only through your exercises
CREATE POLICY "user sets" ON sets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM exercises JOIN workouts ON workouts.id = exercises.workout_id WHERE exercises.id = sets.exercise_id AND workouts.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM exercises JOIN workouts ON workouts.id = exercises.workout_id WHERE exercises.id = sets.exercise_id AND workouts.user_id = auth.uid())
  );

-- Templates: only your own
CREATE POLICY "user templates" ON workout_template
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
