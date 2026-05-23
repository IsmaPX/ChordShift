import * as Tone from 'tone'
import type { InstrumentName } from '@/types/music'
import { getInstrumentFactory, type InstrumentFactory } from './instruments'

interface ActiveInstrument {
  name: InstrumentName
  factory: InstrumentFactory
  synth: Tone.PolySynth
  effects: Tone.ToneAudioNode[]
  mainOutput: Tone.ToneAudioNode
}

class AudioEngineClass {
  private static instance: AudioEngineClass | null = null
  private destination: Tone.Gain | null = null
  private recorder: Tone.Recorder | null = null
  private current: ActiveInstrument | null = null
  private isReady = false
  private isInitialized = false
  private _initializing = false
  private _isRecording = false
  private _currentInstrument: InstrumentName = 'piano'

  private constructor() {}

  static getInstance(): AudioEngineClass {
    if (!AudioEngineClass.instance) {
      AudioEngineClass.instance = new AudioEngineClass()
    }
    return AudioEngineClass.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized || this._initializing) return
    this._initializing = true

    try {
      await Tone.start()

      this.destination = new Tone.Gain(1).toDestination()
      await this._createInstrument(this._currentInstrument)

      this.isInitialized = true
      this.isReady = true
    } finally {
      this._initializing = false
    }
  }

  private async _createInstrument(name: InstrumentName): Promise<void> {
    this._disposeCurrent()
    if (!this.destination) return

    const factory = getInstrumentFactory(name)
    const { synth, effects, mainOutput } = factory.createSynth(this.destination)

    this.current = { name, factory, synth, effects, mainOutput }
    this._currentInstrument = name
  }

  private _disposeCurrent(): void {
    if (!this.current) return
    this.current.synth.dispose()
    for (const fx of this.current.effects) {
      fx.dispose()
    }
    this.current = null
  }

  async setInstrument(name: InstrumentName): Promise<void> {
    if (name === this._currentInstrument && this.current) return
    this._currentInstrument = name
    if (!this.isInitialized) return
    await this._createInstrument(name)
  }

  get currentInstrument(): InstrumentName {
    return this._currentInstrument
  }

  get currentInstrumentFactory(): InstrumentFactory | null {
    return this.current?.factory || null
  }

  get isPolyphonic(): boolean {
    return this.current?.factory.isPolyphonic ?? true
  }

  async ensureReady(): Promise<void> {
    if (!this.isReady) {
      await this.initialize()
    }
  }

  playNote(note: string, duration: number = 0.5): void {
    if (!this.current?.synth) return
    this.current.synth.triggerAttackRelease(note, duration)
  }

  playChord(notes: string[], duration: number = 0.5): void {
    if (!this.current?.synth) return
    this.current.synth.triggerAttackRelease(notes, duration)
  }

  playChordSequence(chords: { notes: string[]; duration: number }[], bpm: number = 120): void {
    if (!this.current?.synth) return

    const now = Tone.now()
    const beatDuration = 60 / bpm

    chords.forEach((chord, index) => {
      const time = now + index * beatDuration
      this.current!.synth.triggerAttackRelease(chord.notes, chord.duration * beatDuration, time)
    })
  }

  stop(): void {
    if (!this.current?.synth) return
    this.current.synth.releaseAll()
  }

  async startRecording(): Promise<void> {
    if (this._isRecording) return
    await this.ensureReady()
    if (!this.recorder) {
      try {
        this.recorder = new Tone.Recorder()
        if (this.current?.mainOutput) {
          this.current.mainOutput.connect(this.recorder)
        } else if (this.destination) {
          this.destination.connect(this.recorder)
        }
      } catch (e) {
        console.warn('AudioEngine: recorder not available in this browser', e)
        return
      }
    }
    this.recorder.start()
    this._isRecording = true
  }

  async stopRecording(): Promise<Blob | null> {
    if (!this.recorder || !this._isRecording) return null
    this._isRecording = false
    const blob = await this.recorder.stop()
    this.recorder.disconnect()
    this.recorder = null
    return blob
  }

  get isRecording(): boolean {
    return this._isRecording
  }

  getStatus(): { isReady: boolean; isInitialized: boolean } {
    return {
      isReady: this.isReady,
      isInitialized: this.isInitialized,
    }
  }

  dispose(): void {
    this._disposeCurrent()
    if (this.destination) {
      this.destination.dispose()
      this.destination = null
    }
    if (this.recorder) {
      this.recorder.dispose()
      this.recorder = null
    }
    this.isInitialized = false
    this.isReady = false
    this._initializing = false
    this._isRecording = false
  }
}

export const AudioEngine = AudioEngineClass.getInstance()
export type AudioEngineInstance = AudioEngineClass
