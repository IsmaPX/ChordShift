import * as Tone from 'tone'

export class AudioEngineClass {
  private static instance: AudioEngineClass | null = null
  private synth: Tone.PolySynth | null = null
  private reverb: Tone.Reverb | null = null
  private isReady = false
  private isInitialized = false

  private constructor() {}

  static getInstance(): AudioEngineClass {
    if (!AudioEngineClass.instance) {
      AudioEngineClass.instance = new AudioEngineClass()
    }
    return AudioEngineClass.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    await Tone.start()
    
    this.reverb = new Tone.Reverb({
      wet: 0.3,
      decay: 1.5,
    }).toDestination()

    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'triangle',
      },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 0.8,
      },
    }).connect(this.reverb)

    this.isInitialized = true
    this.isReady = true
  }

  async ensureReady(): Promise<void> {
    if (!this.isReady) {
      await this.initialize()
    }
  }

  playNote(note: string, duration: number = 0.5): void {
    if (!this.synth) return
    this.synth.triggerAttackRelease(note, duration)
  }

  playChord(notes: string[], duration: number = 0.5): void {
    if (!this.synth) return
    this.synth.triggerAttackRelease(notes, duration)
  }

  playChordSequence(chords: { notes: string[]; duration: number }[], bpm: number = 120): void {
    if (!this.synth) return

    const now = Tone.now()
    const beatDuration = 60 / bpm

    chords.forEach((chord, index) => {
      const time = now + index * beatDuration
      this.synth!.triggerAttackRelease(chord.notes, chord.duration * beatDuration, time)
    })
  }

  stop(): void {
    if (!this.synth) return
    this.synth.releaseAll()
  }

  getStatus(): { isReady: boolean; isInitialized: boolean } {
    return {
      isReady: this.isReady,
      isInitialized: this.isInitialized,
    }
  }

  dispose(): void {
    if (this.synth) {
      this.synth.dispose()
      this.synth = null
    }
    if (this.reverb) {
      this.reverb.dispose()
      this.reverb = null
    }
    this.isInitialized = false
    this.isReady = false
  }
}

export const AudioEngine = AudioEngineClass.getInstance()