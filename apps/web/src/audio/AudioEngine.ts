import * as Tone from 'tone'

class AudioEngineClass {
  private static instance: AudioEngineClass | null = null
  private synth: Tone.PolySynth | null = null
  private reverb: Tone.Reverb | null = null
  private splitter: Tone.Gain | null = null
  private recorder: Tone.Recorder | null = null
  private isReady = false
  private isInitialized = false
  private _initializing = false
  private _isRecording = false

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

      this.splitter = new Tone.Gain()
      this.splitter.toDestination()

      this.recorder = new Tone.Recorder()
      this.splitter.connect(this.recorder)

      this.reverb = new Tone.Reverb({
        wet: 0.3,
        decay: 1.5,
      }).connect(this.splitter)

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
    } finally {
      this._initializing = false
    }
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

  async startRecording(): Promise<void> {
    if (!this.recorder || this._isRecording) return
    await this.ensureReady()
    this.recorder.start()
    this._isRecording = true
  }

  async stopRecording(): Promise<Blob | null> {
    if (!this.recorder || !this._isRecording) return null
    this._isRecording = false
    const blob = await this.recorder.stop()
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
    if (this.synth) {
      this.synth.dispose()
      this.synth = null
    }
    if (this.reverb) {
      this.reverb.dispose()
      this.reverb = null
    }
    if (this.splitter) {
      this.splitter.dispose()
      this.splitter = null
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