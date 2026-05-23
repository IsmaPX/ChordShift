import * as Tone from 'tone'
import type { InstrumentName } from '@/types/music'
import type { InstrumentFactory } from './index'

export const pianoConfig: InstrumentFactory = {
  name: 'piano' as InstrumentName,
  label: 'Piano',
  icon: '🎹',
  isPolyphonic: true,

  createSynth(destination: Tone.ToneAudioNode) {
    const reverb = new Tone.Reverb({ wet: 0.3, decay: 1.5 })
    reverb.connect(destination)

    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.8 },
    }).connect(reverb)

    return { synth, effects: [reverb], mainOutput: reverb }
  },
}
