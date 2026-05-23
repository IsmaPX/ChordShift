import * as Tone from 'tone'
import type { InstrumentName } from '@/types/music'

export interface InstrumentFactory {
  name: InstrumentName
  label: string
  icon: string
  isPolyphonic: boolean
  createSynth: (destination: Tone.ToneAudioNode) => {
    synth: Tone.PolySynth
    effects: Tone.ToneAudioNode[]
    mainOutput: Tone.ToneAudioNode
  }
}

import { pianoConfig } from './piano'
import { guitarConfig } from './guitar'
import { trumpetConfig } from './trumpet'

export const INSTRUMENT_FACTORIES: Record<InstrumentName, InstrumentFactory> = {
  piano: pianoConfig,
  guitar: guitarConfig,
  trumpet: trumpetConfig,
}

export function getInstrumentFactory(name: InstrumentName): InstrumentFactory {
  return INSTRUMENT_FACTORIES[name]
}

export { pianoConfig, guitarConfig, trumpetConfig }
