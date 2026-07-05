CREATE TABLE workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  giorno TEXT NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  durata_secondi INT,
  completato BOOLEAN DEFAULT false,
  creato_il TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  nome_esercizio TEXT NOT NULL,
  ordine INT NOT NULL
);

CREATE TABLE sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  serie_numero INT NOT NULL,
  ripetizioni INT,
  peso_kg NUMERIC(5,1),
  rir NUMERIC(3,1),
  completato BOOLEAN DEFAULT false
);
