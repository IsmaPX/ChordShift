-- ============================================
-- ChordShift / Worship Piano App
-- Supabase Schema Migration v1.0.0
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLE: users
-- ============================================
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade not null,
  email text unique not null,
  display_name text,
  settings jsonb default '{"tempo_bpm":120,"language":"es","notifications_enabled":true,"feedback_concept":"rings","xp":0}'::jsonb,
  created_at timestamptz default now()
);

alter table public.users enable row level security;

create policy "Users can view own data" on public.users for select using (auth.uid() = id);
create policy "Users can update own data" on public.users for update using (auth.uid() = id);
create policy "Users can insert own data" on public.users for insert with check (auth.uid() = id);

-- ============================================
-- TABLE: styles (Public read)
-- ============================================
create table public.styles (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  difficulty smallint check (difficulty >= 1 and difficulty <= 5),
  theory_required jsonb default '[]'::jsonb,
  techniques jsonb default '[]'::jsonb,
  description text,
  created_at timestamptz default now()
);

alter table public.styles enable row level security;
create policy "Anyone can view styles" on public.styles for select using (true);
create policy "Service role can manage styles" on public.styles for all using (auth.role() = 'service_role');

-- ============================================
-- TABLE: songs (Published songs public)
-- ============================================
create table public.songs (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  artist text,
  style_id uuid references public.styles(id) on delete set null,
  difficulty smallint check (difficulty >= 1 and difficulty <= 5),
  key_signature text,
  bpm smallint,
  chord_data jsonb not null default '{"sections":[]}'::jsonb,
  is_published boolean default false,
  created_at timestamptz default now()
);

alter table public.songs enable row level security;
create policy "Anyone can view published songs" on public.songs for select using (is_published = true);
create policy "Service role can manage songs" on public.songs for all using (auth.role() = 'service_role');

-- ============================================
-- TABLE: practice_sessions
-- ============================================
create table public.practice_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  song_id uuid references public.songs(id) on delete cascade not null,
  started_at timestamptz default now(),
  duration_s integer,
  completed boolean default false,
  created_at timestamptz default now()
);

alter table public.practice_sessions enable row level security;
create policy "Users can manage own sessions" on public.practice_sessions for all using (auth.uid() = user_id);
create policy "Users can insert own sessions" on public.practice_sessions for insert with check (auth.uid() = user_id);

-- ============================================
-- TABLE: ear_training_results
-- ============================================
create table public.ear_training_results (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  exercise_type text not null check (exercise_type in ('interval', 'triad', 'seventh_chord')),
  question jsonb not null default '{"notes":[],"root":""}'::jsonb,
  answer_given text,
  correct_answer text not null,
  is_correct boolean,
  response_ms integer,
  created_at timestamptz default now()
);

alter table public.ear_training_results enable row level security;
create policy "Users can manage own results" on public.ear_training_results for all using (auth.uid() = user_id);
create policy "Users can insert own results" on public.ear_training_results for insert with check (auth.uid() = user_id);

-- ============================================
-- TABLE: tips (Public read)
-- ============================================
create table public.tips (
  id uuid primary key default uuid_generate_v4(),
  content text not null,
  category text not null check (category in ('teoría', 'técnica', 'mentalidad', 'worship')),
  style_id uuid references public.styles(id) on delete set null,
  difficulty_min smallint default 1,
  created_at timestamptz default now()
);

alter table public.tips enable row level security;
create policy "Anyone can view tips" on public.tips for select using (true);
create policy "Service role can manage tips" on public.tips for all using (auth.role() = 'service_role');

-- ============================================
-- TABLE: notifications
-- ============================================
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  type text not null check (type in ('email', 'push')),
  message text,
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;
create policy "Users can view own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users can insert own notifications" on public.notifications for insert with check (auth.uid() = user_id);
create policy "Service role can update notifications" on public.notifications for update using (auth.role() = 'service_role');

-- ============================================
-- FUNCTION: Handle new user signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- INDEXES
-- ============================================
create index idx_practice_sessions_user_id on public.practice_sessions(user_id);
create index idx_practice_sessions_song_id on public.practice_sessions(song_id);
create index idx_ear_training_results_user_id on public.ear_training_results(user_id);
create index idx_tips_category on public.tips(category);
create index idx_songs_style_id on public.songs(style_id);
create index idx_songs_is_published on public.songs(is_published);

-- ============================================
-- SEED DATA: 8 Styles
-- ============================================
insert into public.styles (name, difficulty, theory_required, techniques, description) values
('Worship Contemporáneo', 3, '["acordes_7ma","modos","progresiones_ii_V_I"]', '["pad_sostenido","arpegio_broken","walking_bass"]', 'Estilo de Hillsong, Elevation y Bethel Music. Acordes enriquecidos con extensiones y voicings modernos.'),
('Gospel Sureño', 4, '["voicings_gospel","walk_bass","dominantes","turnarounds"]', '["walking_bass","voicings_spread","turnarounds","improvisacion"]', 'Progresiones características del gospel sureño con voicings de bloque y walking bass.'),
('Gospel Urbano / R&B Cristiano', 4, '["voicings_rnb","sus_chords","modulaciones"]', '["soul_piano","vamps","improvisation"]', 'Fusión de gospel moderno con influences de R&B y hip hop. Acordes suspensus y grooves urbanos.'),
('Balada Pop Cristiana', 2, '["acordes_pop","progresiones_I_V_vi_IV","arpegiadores"]', '["sustain","dynamics","fills","rubato"]', 'Baladas emotivas con armonías simples pero efectivas.'),
('Himno Tradicional Arreglado', 3, '["voicings_close","modulacion","dominantes_secundarias"]', '["close_voicings","anticipation","dramatic","ornaments"]', 'Himnos clásicos con arreglos pianos expresivos.'),
('Worship Latino / Iberoamericano', 3, '["acordes_latinos","sones","progresiones_caribe"]', '["rhythmic_patterns","cluster_chords","montunos"]', 'Ritmos latinos con progresiones características iberoamericanas.'),
('Gospel Coral (Mass Choir)', 5, '["voicings_bloque","canto_firme","dominantes_secundarias"]', '["block_voicings","call_response","ad-libs"]', 'Estilo grandioso con voicings de bloque estilo mass choir.'),
('Soaking Worship (Contemplativo)', 2, '["minimalismo","espacios","dinamicas_extremas"]', '["sustain_piano","texturas","silencio_activo","pedal_tone"]', 'Adoración contemplativa con mínima técnica y máximo espacio.');

-- ============================================
-- SEED DATA: 50 Tips
-- ============================================
insert into public.tips (content, category, style_id, difficulty_min) values
-- Teoría
('Los acordes de dominante (V7) crean tensión que resuelve naturalmente al I.', 'teoría', null, 1),
('El modo dórico tiene un sonido más oscuro que el mayor, ideal para himnos tristes.', 'teoría', null, 2),
('Las progresiones ii-V-I son la base armónica del jazz y gospel.', 'teoría', '2', 3),
('El acorde sus4 crea tensión que resuelve al acorde natural.', 'teoría', null, 1),
('Los modos gregorianos son la base del worship contemporáneo.', 'teoría', '1', 3),
('La modulación al bemol es común en baladas para elevar la intensidad.', 'teoría', '4', 2),
('Los voicings de bloque dan cuerpo y unidad al ensemble.', 'teoría', '7', 4),
('La progresión I-IV-V-I es la base de la mayoría de songs cristianas.', 'teoría', null, 1),
('Los modos menores tienen colores específicos: dórico para esperanza, eólico para tristeza.', 'teoría', null, 2),
('Las extensiones más allá del 7mo pueden sobrecargar harmonías.', 'teoría', '1', 3),
('Las secuencias en himnos crean momentum hacia la resolución final.', 'teoría', '5', 3),
-- Técnica
('Practica los voicings cerrados para lograr mayor claridad armónica.', 'técnica', null, 2),
('El walking bass crea movimiento y dirección en los pasajes de gospel.', 'técnica', '2', 3),
('Usa el pedal tone como ancla armónica en pasajes contemplativos.', 'técnica', '8', 2),
('Los arpegio broken son ideales para fills entre secciones.', 'técnica', '1', 2),
('Los cluster chords dan color latino a tus progresiones.', 'técnica', '6', 3),
('El sustain prolongado es esencial para baladas emotivas.', 'técnica', '4', 1),
('Practica los turnarounds como transición entre tonalidades.', 'técnica', '2', 4),
('Los pads sostenidos requieren control de dinámica y pedal.', 'técnica', '1', 2),
('El sustain natural del piano es tu mejor herramienta expresiva.', 'técnica', null, 1),
('Los fill-in deben conectar emocionalmente con la letra.', 'técnica', null, 3),
('El rubato en baladas expresa libertad emocional dentro de la estructura.', 'técnica', '4', 2),
('Los trinos y apoyaturas son ornamentos comunes en himnos.', 'técnica', '5', 3),
('La dinámica en soaking worship va de pp a fff en momentos clave.', 'técnica', '8', 2),
('Los voicings spread en tercera posición son esenciales para worship moderno.', 'técnica', '1', 3),
('El turnaround en estilo gospel típicamente usa II-V-I con cromatismo.', 'técnica', '2', 4),
('El patrón rítmico en worship latino sincroniza con el tambora y timbales.', 'técnica', '6', 3),
('Los cambios de tonalidad en vivo requieren práctica extra.', 'técnica', null, 3),
('Los acordes con bajo en octava dan profundidad sin cambiar la armonía.', 'técnica', null, 2),
('El bajo eléctrico en gospel requiere una mano izquierda fuerte y constante.', 'técnica', '2', 4),
-- Mentalidad
('El silencio es tan importante como las notas. Aprende a usar los espacios.', 'mentalidad', null, 1),
('No toques por tocar. Cada nota debe tener propósito.', 'mentalidad', null, 1),
('La práctica lenta mejora la precisión más que la velocidad.', 'mentalidad', null, 1),
('Escucha al grupo, no solo a ti mismo. El ensemble es prioridad.', 'mentalidad', null, 2),
('Los errores son oportunidades de aprendizaje, no fracasos.', 'mentalidad', null, 1),
('Memoriza las progresiones, no los acordes individuales.', 'mentalidad', null, 2),
('La creatividad nace de la restricción, no de la libertad infinita.', 'mentalidad', null, 2),
('Practica con metrónomo antes de tocar sin él.', 'mentalidad', null, 1),
('Graba tus sesiones y escucha críticamente.', 'mentalidad', null, 2),
('La perfección técnica no sustituye la autenticidad.', 'mentalidad', null, 1),
('La humildad te hace mejor músico de equipo.', 'mentalidad', null, 2),
-- Worship
('El piano en adoración es un instrumento de servicio.', 'worship', null, 1),
('Tu objetivo no es impresionar, sino guiar al pueblo a la presencia de Dios.', 'worship', null, 1),
('Las transiciones suaves entre canciones mantienen la atmósfera de adoración.', 'worship', null, 2),
('El volumen del piano debe servir al canto, nunca competir con él.', 'worship', null, 1),
('Anticipa las necesidades del líder. Prepárate antes de que te lo pidan.', 'worship', null, 2),
('Los descansos en la música permiten que la congregación responda.', 'worship', null, 2),
('La autenticidad vale más que la perfección técnica.', 'worship', null, 1),
('Los interludios instrumentales dan espacio al Espíritu Santo.', 'worship', null, 2),
('La práctica diaria construye consistencia en el ministry.', 'worship', null, 2),
('El liderazgo musical requiere vulnerabilidad y servicio.', 'worship', null, 3),
('Conoce las canciones antes de llegar al servicio.', 'worship', null, 1);

-- ============================================
-- END
-- ============================================