export interface SeedStyle {
  id: string
  name: string
  difficulty: number
  theory_required: string[]
  techniques: string[]
  description: string
}

export const SEED_STYLES: SeedStyle[] = [
  {
    id: 'style-wc',
    name: 'Worship Contemporáneo',
    difficulty: 3,
    theory_required: ['acordes_7ma', 'modos', 'progresiones_ii_V_I'],
    techniques: ['pad_sostenido', 'arpegio_broken', 'walking_bass'],
    description: 'Estilo de Hillsong, Elevation y Bethel Music. Acordes enriquecidos con extensiones y voicings modernos.',
  },
  {
    id: 'style-gs',
    name: 'Gospel Sureño',
    difficulty: 4,
    theory_required: ['voicings_gospel', 'walk_bass', 'dominantes', 'turnarounds'],
    techniques: ['walking_bass', 'voicings_spread', 'turnarounds', 'improvisacion'],
    description: 'Progresiones características del gospel sureño con voicings de bloque y walking bass.',
  },
  {
    id: 'style-gu',
    name: 'Gospel Urbano / R&B Cristiano',
    difficulty: 4,
    theory_required: ['voicings_rnb', 'sus_chords', 'modulaciones'],
    techniques: ['soul_piano', 'vamps', 'improvisation'],
    description: 'Fusión de gospel moderno con influences de R&B y hip hop. Acordes suspensus y grooves urbanos.',
  },
  {
    id: 'style-bp',
    name: 'Balada Pop Cristiana',
    difficulty: 2,
    theory_required: ['acordes_pop', 'progresiones_I_V_vi_IV', 'arpegiadores'],
    techniques: ['sustain', 'dynamics', 'fills', 'rubato'],
    description: 'Baladas emotivas con armonías simples pero efectivas.',
  },
  {
    id: 'style-ht',
    name: 'Himno Tradicional Arreglado',
    difficulty: 3,
    theory_required: ['voicings_close', 'modulacion', 'dominantes_secundarias'],
    techniques: ['close_voicings', 'anticipation', 'dramatic', 'ornaments'],
    description: 'Himnos clásicos con arreglos pianos expresivos.',
  },
  {
    id: 'style-wl',
    name: 'Worship Latino / Iberoamericano',
    difficulty: 3,
    theory_required: ['acordes_latinos', 'sones', 'progresiones_caribe'],
    techniques: ['rhythmic_patterns', 'cluster_chords', 'montunos'],
    description: 'Ritmos latinos con progresiones características iberoamericanas.',
  },
  {
    id: 'style-gc',
    name: 'Gospel Coral (Mass Choir)',
    difficulty: 5,
    theory_required: ['voicings_bloque', 'canto_firme', 'dominantes_secundarias'],
    techniques: ['block_voicings', 'call_response', 'ad-libs'],
    description: 'Estilo grandioso con voicings de bloque estilo mass choir.',
  },
  {
    id: 'style-sk',
    name: 'Soaking Worship (Contemplativo)',
    difficulty: 2,
    theory_required: ['minimalismo', 'espacios', 'dinamicas_extremas'],
    techniques: ['sustain_piano', 'texturas', 'silencio_activo', 'pedal_tone'],
    description: 'Adoración contemplativa con mínima técnica y máximo espacio.',
  },
]
