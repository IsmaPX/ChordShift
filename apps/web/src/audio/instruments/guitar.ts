import * as Tone from 'tone'
import type { InstrumentName } from '@/types/music'
import type { InstrumentFactory } from './index'

export const guitarConfig: InstrumentFactory = {
  name: 'guitar' as InstrumentName,
  label: 'Guitarra',
  icon: '🎸',
  isPolyphonic: true,

  createSynth(destination: Tone.ToneAudioNode) {
    const reverb = new Tone.Reverb({ wet: 0.15, decay: 0.8 })
    const distortion = new Tone.Distortion({ distortion: 0.2 })

    reverb.connect(destination)
    distortion.connect(reverb)

    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'square' },
      envelope: { attack: 0.005, decay: 0.05, sustain: 0.1, release: 0.3 },
    }).connect(distortion)

    return { synth, effects: [distortion, reverb], mainOutput: reverb }
  },
}
