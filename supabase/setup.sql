-- ============================================
-- ChordShift - Supabase Setup SQL
-- Ejecutar en: SQL Editor de Supabase
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLE: users
-- ============================================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade not null,
  email text unique not null,
  display_name text,
  settings jsonb default '{"tempo_bpm":120,"language":"es","notifications_enabled":true,"feedback_concept":"rings","xp":0}'::jsonb,
  created_at timestamptz default now()
);

alter table public.users enable row level security;

drop policy if exists "Users can view own data" on public.users;
create policy "Users can view own data" on public.users for select using (auth.uid() = id);

drop policy if exists "Users can update own data" on public.users;
create policy "Users can update own data" on public.users for update using (auth.uid() = id);

drop policy if exists "Users can insert own data" on public.users;
create policy "Users can insert own data" on public.users for insert with check (auth.uid() = id);

-- ============================================
-- TABLE: styles
-- ============================================
create table if not exists public.styles (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  difficulty smallint check (difficulty >= 1 and difficulty <= 5),
  theory_required jsonb default '[]'::jsonb,
  techniques jsonb default '[]'::jsonb,
  description text,
  created_at timestamptz default now()
);

alter table public.styles enable row level security;

drop policy if exists "Anyone can view styles" on public.styles;
create policy "Anyone can view styles" on public.styles for select using (true);

-- ============================================
-- TABLE: songs
-- ============================================
create table if not exists public.songs (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  artist text,
  style_id uuid references public.styles(id) on delete set null,
  difficulty smallint,
  key_signature text,
  bpm smallint,
  chord_data jsonb not null default '{"sections":[]}'::jsonb,
  is_published boolean default false,
  created_at timestamptz default now()
);

alter table public.songs enable row level security;

drop policy if exists "Anyone can view published songs" on public.songs;
create policy "Anyone can view published songs" on public.songs for select using (is_published = true);

-- ============================================
-- TABLE: practice_sessions
-- ============================================
create table if not exists public.practice_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  song_id uuid references public.songs(id) on delete cascade not null,
  started_at timestamptz default now(),
  duration_s integer,
  completed boolean default false,
  created_at timestamptz default now()
);

alter table public.practice_sessions enable row level security;

drop policy if exists "Users can manage own sessions" on public.practice_sessions;
create policy "Users can manage own sessions" on public.practice_sessions for all using (auth.uid() = user_id);

-- ============================================
-- TABLE: ear_training_results
-- ============================================
create table if not exists public.ear_training_results (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  exercise_type text not null,
  question jsonb default '{"notes":[],"root":""}'::jsonb,
  answer_given text,
  correct_answer text not null,
  is_correct boolean,
  response_ms integer,
  created_at timestamptz default now()
);

alter table public.ear_training_results enable row level security;

drop policy if exists "Users can manage own results" on public.ear_training_results;
create policy "Users can manage own results" on public.ear_training_results for all using (auth.uid() = user_id);

-- ============================================
-- TABLE: tips
-- ============================================
create table if not exists public.tips (
  id uuid primary key default uuid_generate_v4(),
  content text not null,
  category text not null,
  style_id uuid references public.styles(id) on delete set null,
  difficulty_min smallint default 1,
  created_at timestamptz default now()
);

alter table public.tips enable row level security;

drop policy if exists "Anyone can view tips" on public.tips;
create policy "Anyone can view tips" on public.tips for select using (true);

-- ============================================
-- TRIGGER: auto-create user profile
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- INDEXES
-- ============================================
create index if not exists idx_practice_sessions_user_id on public.practice_sessions(user_id);
create index if not exists idx_ear_training_results_user_id on public.ear_training_results(user_id);
create index if not exists idx_tips_category on public.tips(category);
create index if not exists idx_songs_is_published on public.songs(is_published);

-- ============================================
-- SEED DATA: 8 Styles
-- ============================================
insert into public.styles (name, difficulty, theory_required, techniques, description) values
('Worship Contemporáneo', 3, '["acordes_7ma","modos","progresiones_ii_V_I"]', '["pad_sostenido","arpegio_broken","walking_bass"]', 'Estilo de Hillsong, Elevation y Bethel Music. Acordes enriquecidos con extensiones.'),
('Gospel Sureño', 4, '["voicings_gospel","walk_bass","dominantes"]', '["walking_bass","voicings_spread","turnarounds"]', 'Progresiones características del gospel sureño con voicings de bloque.'),
('Gospel Urbano / R&B Cristiano', 4, '["voicings_rnb","sus_chords","modulaciones"]', '["soul_piano","vamps","improvisation"]', 'Fusión de gospel moderno con influences de R&B y hip hop.'),
('Balada Pop Cristiana', 2, '["acordes_pop","progresiones_I_V_vi_IV"]', '["sustain","dynamics","fills"]', 'Baladas emotivas con armonías simples pero efectivas.'),
('Himno Tradicional Arreglado', 3, '["voicings_close","modulacion","dominantes"]', '["close_voicings","anticipation","ornaments"]', 'Himnos clásicos con arreglos pianos expresivos.'),
('Worship Latino / Iberoamericano', 3, '["acordes_latinos","sones"]', '["cluster_chords","montunos","rhythmic_patterns"]', 'Ritmos latinos con progresiones características iberoamericanas.'),
('Gospel Coral (Mass Choir)', 5, '["voicings_bloque","canto_firme"]', '["block_voicings","call_response","ad-libs"]', 'Estilo grandioso con voicings de bloque estilo mass choir.'),
('Soaking Worship (Contemplativo)', 2, '["minimalismo","espacios","dinamicas"]', '["sustain_piano","texturas","silencio_activo"]', 'Adoración contemplativa con mínima técnica y máximo espacio.')
on conflict do nothing;

-- ============================================
-- SEED DATA: 50 Tips
-- ============================================
insert into public.tips (content, category, difficulty_min) values
-- Teoría
('Los acordes de dominante (V7) crean tensión que resuelve naturalmente al I.', 'teoría', 1),
('El modo dórico tiene un sonido más oscuro que el mayor, ideal para himnos.', 'teoría', 2),
('Las progresiones ii-V-I son la base armónica del jazz y gospel.', 'teoría', 3),
('El acorde sus4 crea tensión que resuelve al acorde natural.', 'teoría', 1),
('Los modos gregorianos son la base del worship contemporáneo.', 'teoría', 3),
('La modulación al bemol es común en baladas para elevar la intensidad.', 'teoría', 2),
('La progresión I-IV-V-I es la base de la mayoría de songs cristianas.', 'teoría', 1),
('Los modos menores tienen colores específicos: dórico para esperanza.', 'teoría', 2),
('Las extensiones más allá del 7mo pueden sobrecargar harmonías.', 'teoría', 3),
('Las secuencias en himnos crean momentum hacia la resolución final.', 'teoría', 3),
-- Técnica
('Practica los voicings cerrados para mayor claridad armónica.', 'técnica', 2),
('El walking bass crea movimiento y dirección en gospel.', 'técnica', 3),
('Usa el pedal tone como ancla armónica en pasajes.', 'técnica', 2),
('Los arpegio broken son ideales para fills entre secciones.', 'técnica', 2),
('Los cluster chords dan color latino a tus progresiones.', 'técnica', 3),
('El sustain prolongado es esencial para baladas emotivas.', 'técnica', 1),
('Practica los turnarounds como transición entre tonalidades.', 'técnica', 4),
('Los pads sostenidos requieren control de dinámica y pedal.', 'técnica', 2),
('El sustain natural del piano es tu mejor herramienta expresiva.', 'técnica', 1),
('El rubato en baladas expresa libertad emocional.', 'técnica', 2),
-- Mentalidad
('El silencio es tan importante como las notas.', 'mentalidad', 1),
('No toques por tocar. Cada nota debe tener propósito.', 'mentalidad', 1),
('La práctica lenta mejora la precisión más que la velocidad.', 'mentalidad', 1),
('Escucha al grupo, no solo a ti mismo.', 'mentalidad', 2),
('Los errores son oportunidades de aprendizaje.', 'mentalidad', 1),
('Memoriza las progresiones, no los acordes individuales.', 'mentalidad', 2),
('La creatividad nace de la restricción.', 'mentalidad', 2),
('Practica con metrónomo antes de tocar sin él.', 'mentalidad', 1),
('Graba tus sesiones y escucha críticamente.', 'mentalidad', 2),
('La perfección técnica no sustituye la autenticidad.', 'mentalidad', 1),
-- Worship
('El piano en adoración es un instrumento de servicio.', 'worship', 1),
('Tu objetivo no es impresionar, guiar al pueblo.', 'worship', 1),
('Las transiciones suaves mantienen la atmósfera.', 'worship', 2),
('El volumen debe servir al canto, nunca competir.', 'worship', 1),
('Anticipa las necesidades del líder.', 'worship', 2),
('Los descansos permiten que la congregación responda.', 'worship', 2),
('La autenticidad vale más que la perfección técnica.', 'worship', 1),
('Los interludios dan espacio al Espíritu Santo.', 'worship', 2),
('La práctica diaria construye consistencia.', 'worship', 2),
('Conoce las canciones antes de llegar al servicio.', 'worship', 1)
on conflict do nothing;

-- ============================================
-- DONE
-- ============================================
-- Verificar con: SELECT * FROM public.styles;