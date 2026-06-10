import * as Tone from 'tone'
import type { InstrumentName } from '@/types/music'
import type { InstrumentFactory } from './index'

export const trumpetConfig: InstrumentFactory = {
  name: 'trumpet' as InstrumentName,
  label: 'Trompeta',
  icon: '🎺',
  isPolyphonic: false,

  createSynth(destination: Tone.ToneAudioNode) {
    const filter = new Tone.Filter({ type: 'lowpass', frequency: 3000, Q: 0.8 })
    const reverb = new Tone.Reverb({ wet: 0.2, decay: 1.0 })
    const vibrato = new Tone.Vibrato({ frequency: 5, depth: 3, wet: 0.3 })
    const compressor = new Tone.Compressor({
      threshold: -18,
      ratio: 6,
      attack: 0.002,
      release: 0.1,
    })

    vibrato.connect(filter)
    filter.connect(compressor)
    compressor.connect(reverb)
    reverb.connect(destination)

    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: {
        attack: 0.02,
        decay: 0.15,
        sustain: 0.7,
        release: 0.5,
      },
    }).connect(vibrato)

    return { synth, effects: [vibrato, filter, compressor, reverb], mainOutput: reverb }
  },
}