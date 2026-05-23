import * as Tone from 'tone'
import type { InstrumentName } from '@/types/music'
import type { InstrumentFactory } from './index'

export const trumpetConfig: InstrumentFactory = {
  name: 'trumpet' as InstrumentName,
  label: 'Trompeta',
  icon: '🎺',
  isPolyphonic: false,

  createSynth(destination: Tone.ToneAudioNode) {
    const filter = new Tone.Filter({ type: 'lowpass', frequency: 1200, Q: 1 })
    const reverb = new Tone.Reverb({ wet: 0.25, decay: 1.2 })

    filter.connect(reverb)
    reverb.connect(destination)

    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.08, decay: 0.2, sustain: 0.5, release: 0.3 },
    }).connect(filter)

    return { synth, effects: [filter, reverb], mainOutput: reverb }
  },
}
