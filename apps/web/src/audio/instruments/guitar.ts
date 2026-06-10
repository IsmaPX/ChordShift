import * as Tone from 'tone'
import type { InstrumentName } from '@/types/music'
import type { InstrumentFactory } from './index'

export const guitarConfig: InstrumentFactory = {
  name: 'guitar' as InstrumentName,
  label: 'Guitarra',
  icon: '🎸',
  isPolyphonic: true,

  createSynth(destination: Tone.ToneAudioNode) {
    const reverb = new Tone.Reverb({ wet: 0.3, decay: 1.2 })
    const chorus = new Tone.Chorus({
      frequency: 2.0,
      delayTime: 3,
      depth: 0.4,
      wet: 0.2,
    }).start()
    const filter = new Tone.Filter({ type: 'lowpass', frequency: 4000, Q: 0.5 })

    chorus.connect(filter)
    filter.connect(reverb)
    reverb.connect(destination)

    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle8' },
      envelope: {
        attack: 0.003,
        decay: 0.2,
        sustain: 0.5,
        release: 0.8,
      },
    }).connect(chorus)

    return { synth, effects: [chorus, filter, reverb], mainOutput: reverb }
  },
}