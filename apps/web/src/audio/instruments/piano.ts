import * as Tone from 'tone'
import type { InstrumentName } from '@/types/music'
import type { InstrumentFactory } from './index'

export const pianoConfig: InstrumentFactory = {
  name: 'piano' as InstrumentName,
  label: 'Piano',
  icon: '🎹',
  isPolyphonic: true,

  createSynth(destination: Tone.ToneAudioNode) {
    const reverb = new Tone.Reverb({ wet: 0.35, decay: 2.0 })
    const chorus = new Tone.Chorus({
      frequency: 1.5,
      delayTime: 2.5,
      depth: 0.6,
      wet: 0.25,
    }).start()
    const compressor = new Tone.Compressor({
      threshold: -20,
      ratio: 4,
      attack: 0.003,
      release: 0.25,
    })

    chorus.connect(compressor)
    compressor.connect(reverb)
    reverb.connect(destination)

    const synth = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 2.0,
      modulationIndex: 6,
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.005,
        decay: 0.8,
        sustain: 0.4,
        release: 1.5,
      },
      modulationEnvelope: {
        attack: 0.01,
        decay: 0.5,
        sustain: 0.2,
        release: 0.8,
      },
    }).connect(chorus)

    return { synth, effects: [chorus, compressor, reverb], mainOutput: reverb }
  },
}