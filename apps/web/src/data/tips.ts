export interface SeedTip {
  id: string
  content: string
  category: 'teoría' | 'técnica' | 'mentalidad' | 'worship'
  style_id: string | null
  difficulty_min: number
}

export const SEED_TIPS: SeedTip[] = [
  ...teoria(),
  ...tecnica(),
  ...mentalidad(),
  ...worship(),
]

function teoria(): SeedTip[] {
  return [
    { id: 'tip-t1', content: 'Los acordes de dominante (V7) crean tensión que resuelve naturalmente al I.', category: 'teoría', style_id: null, difficulty_min: 1 },
    { id: 'tip-t2', content: 'El modo dórico tiene un sonido más oscuro que el mayor, ideal para himnos tristes.', category: 'teoría', style_id: null, difficulty_min: 2 },
    { id: 'tip-t3', content: 'Las progresiones ii-V-I son la base armónica del jazz y gospel.', category: 'teoría', style_id: 'style-gs', difficulty_min: 3 },
    { id: 'tip-t4', content: 'El acorde sus4 crea tensión que resuelve al acorde natural.', category: 'teoría', style_id: null, difficulty_min: 1 },
    { id: 'tip-t5', content: 'Los modos gregorianos son la base del worship contemporáneo.', category: 'teoría', style_id: 'style-wc', difficulty_min: 3 },
    { id: 'tip-t6', content: 'La modulación al bemol es común en baladas para elevar la intensidad.', category: 'teoría', style_id: 'style-bp', difficulty_min: 2 },
    { id: 'tip-t7', content: 'Los voicings de bloque dan cuerpo y unidad al ensemble.', category: 'teoría', style_id: 'style-gc', difficulty_min: 4 },
    { id: 'tip-t8', content: 'La progresión I-IV-V-I es la base de la mayoría de canciones cristianas.', category: 'teoría', style_id: null, difficulty_min: 1 },
    { id: 'tip-t9', content: 'Los modos menores tienen colores específicos: dórico para esperanza, eólico para tristeza.', category: 'teoría', style_id: null, difficulty_min: 2 },
    { id: 'tip-t10', content: 'Las extensiones más allá del 7mo pueden sobrecargar armonías.', category: 'teoría', style_id: 'style-wc', difficulty_min: 3 },
    { id: 'tip-t11', content: 'Las secuencias en himnos crean momentum hacia la resolución final.', category: 'teoría', style_id: 'style-ht', difficulty_min: 3 },
  ]
}

function tecnica(): SeedTip[] {
  return [
    { id: 'tip-te1', content: 'Practica los voicings cerrados para lograr mayor claridad armónica.', category: 'técnica', style_id: null, difficulty_min: 2 },
    { id: 'tip-te2', content: 'El walking bass crea movimiento y dirección en los pasajes de gospel.', category: 'técnica', style_id: 'style-gs', difficulty_min: 3 },
    { id: 'tip-te3', content: 'Usa el pedal tone como ancla armónica en pasajes contemplativos.', category: 'técnica', style_id: 'style-sk', difficulty_min: 2 },
    { id: 'tip-te4', content: 'Los arpegios broken son ideales para fills entre secciones.', category: 'técnica', style_id: 'style-wc', difficulty_min: 2 },
    { id: 'tip-te5', content: 'Los cluster chords dan color latino a tus progresiones.', category: 'técnica', style_id: 'style-wl', difficulty_min: 3 },
    { id: 'tip-te6', content: 'El sustain prolongado es esencial para baladas emotivas.', category: 'técnica', style_id: 'style-bp', difficulty_min: 1 },
    { id: 'tip-te7', content: 'Practica los turnarounds como transición entre tonalidades.', category: 'técnica', style_id: 'style-gs', difficulty_min: 4 },
    { id: 'tip-te8', content: 'Los pads sostenidos requieren control de dinámica y pedal.', category: 'técnica', style_id: 'style-wc', difficulty_min: 2 },
    { id: 'tip-te9', content: 'El sustain natural del piano es tu mejor herramienta expresiva.', category: 'técnica', style_id: null, difficulty_min: 1 },
    { id: 'tip-te10', content: 'Los fill-in deben conectar emocionalmente con la letra.', category: 'técnica', style_id: null, difficulty_min: 3 },
    { id: 'tip-te11', content: 'El rubato en baladas expresa libertad emocional dentro de la estructura.', category: 'técnica', style_id: 'style-bp', difficulty_min: 2 },
    { id: 'tip-te12', content: 'Los trinos y apoyaturas son ornamentos comunes en himnos.', category: 'técnica', style_id: 'style-ht', difficulty_min: 3 },
    { id: 'tip-te13', content: 'La dinámica en soaking worship va de pp a fff en momentos clave.', category: 'técnica', style_id: 'style-sk', difficulty_min: 2 },
    { id: 'tip-te14', content: 'Los voicings spread en tercera posición son esenciales para worship moderno.', category: 'técnica', style_id: 'style-wc', difficulty_min: 3 },
  ]
}

function mentalidad(): SeedTip[] {
  return [
    { id: 'tip-m1', content: 'El silencio es tan importante como las notas. Aprende a usar los espacios.', category: 'mentalidad', style_id: null, difficulty_min: 1 },
    { id: 'tip-m2', content: 'No toques por tocar. Cada nota debe tener propósito.', category: 'mentalidad', style_id: null, difficulty_min: 1 },
    { id: 'tip-m3', content: 'La práctica lenta mejora la precisión más que la velocidad.', category: 'mentalidad', style_id: null, difficulty_min: 1 },
    { id: 'tip-m4', content: 'Escucha al grupo, no solo a ti mismo. El ensemble es prioridad.', category: 'mentalidad', style_id: null, difficulty_min: 2 },
    { id: 'tip-m5', content: 'Los errores son oportunidades de aprendizaje, no fracasos.', category: 'mentalidad', style_id: null, difficulty_min: 1 },
    { id: 'tip-m6', content: 'Memoriza las progresiones, no los acordes individuales.', category: 'mentalidad', style_id: null, difficulty_min: 2 },
    { id: 'tip-m7', content: 'La creatividad nace de la restricción, no de la libertad infinita.', category: 'mentalidad', style_id: null, difficulty_min: 2 },
    { id: 'tip-m8', content: 'Practica con metrónomo antes de tocar sin él.', category: 'mentalidad', style_id: null, difficulty_min: 1 },
    { id: 'tip-m9', content: 'Graba tus sesiones y escucha críticamente.', category: 'mentalidad', style_id: null, difficulty_min: 2 },
    { id: 'tip-m10', content: 'La perfección técnica no sustituye la autenticidad.', category: 'mentalidad', style_id: null, difficulty_min: 1 },
    { id: 'tip-m11', content: 'La humildad te hace mejor músico de equipo.', category: 'mentalidad', style_id: null, difficulty_min: 2 },
  ]
}

function worship(): SeedTip[] {
  return [
    { id: 'tip-w1', content: 'El piano en adoración es un instrumento de servicio.', category: 'worship', style_id: null, difficulty_min: 1 },
    { id: 'tip-w2', content: 'Tu objetivo no es impresionar, sino guiar al pueblo a la presencia de Dios.', category: 'worship', style_id: null, difficulty_min: 1 },
    { id: 'tip-w3', content: 'Las transiciones suaves entre canciones mantienen la atmósfera de adoración.', category: 'worship', style_id: null, difficulty_min: 2 },
    { id: 'tip-w4', content: 'El volumen del piano debe servir al canto, nunca competir con él.', category: 'worship', style_id: null, difficulty_min: 1 },
    { id: 'tip-w5', content: 'Anticipa las necesidades del líder. Prepárate antes de que te lo pidan.', category: 'worship', style_id: null, difficulty_min: 2 },
    { id: 'tip-w6', content: 'Los descansos en la música permiten que la congregación responda.', category: 'worship', style_id: null, difficulty_min: 2 },
    { id: 'tip-w7', content: 'La autenticidad vale más que la perfección técnica.', category: 'worship', style_id: null, difficulty_min: 1 },
    { id: 'tip-w8', content: 'Los interludios instrumentales dan espacio al Espíritu Santo.', category: 'worship', style_id: null, difficulty_min: 2 },
    { id: 'tip-w9', content: 'La práctica diaria construye consistencia en el ministerio.', category: 'worship', style_id: null, difficulty_min: 2 },
    { id: 'tip-w10', content: 'El liderazgo musical requiere vulnerabilidad y servicio.', category: 'worship', style_id: null, difficulty_min: 3 },
    { id: 'tip-w11', content: 'Conoce las canciones antes de llegar al servicio.', category: 'worship', style_id: null, difficulty_min: 1 },
  ]
}
