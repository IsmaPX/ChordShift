interface ParsedChord {
  chord: string
  beat: number
  duration: number
}

interface ParsedSection {
  name: string
  chords: ParsedChord[]
}

interface ParsedSongData {
  sections: ParsedSection[]
}

interface ParsedSong {
  title: string
  artist: string
  key_signature: string
  bpm: number
  chord_data: ParsedSongData
  lyrics?: string
}

function parseChordPro(text: string): ParsedSong | null {
  const lines = text.split('\n')
  const meta: Record<string, string> = {}
  const lyricLines: string[] = []

  for (const raw of lines) {
    const line = raw.trimEnd()
    if (line.startsWith('{')) {
      const match = line.match(/\{(\w+):\s*(.*?)\}/)
      if (match) meta[match[1].toLowerCase()] = match[2]
      continue
    }
    if (line.startsWith('#')) {
      const sep = line.indexOf(':')
      if (sep > 0) meta[line.substring(1, sep).trim().toLowerCase()] = line.substring(sep + 1).trim()
      continue
    }
    lyricLines.push(line)
  }

  const title = meta['title'] || 'Imported Song'
  const artist = meta['artist'] || meta['composer'] || 'Unknown'
  const key = meta['key'] || 'C'
  const tempo = parseInt(meta['tempo'] || meta['bpm'] || '120', 10)

  const chordRegex = /\[([^\]]+)\]/g
  const sections: ParsedSection[] = []
  let currentSection: ParsedSection = { name: 'Verse', chords: [] }
  let beat = 1

  for (const line of lyricLines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('[') && !trimmed.match(chordRegex)) {
      const sectionName = trimmed.replace(/[[\]]/g, '').trim()
      if (currentSection.chords.length > 0) sections.push(currentSection)
      currentSection = { name: sectionName || 'Section', chords: [] }
      beat = 1
      continue
    }

    const chords: string[] = []
    let match: RegExpExecArray | null
    const re = RegExp(chordRegex.source, 'g')
    while ((match = re.exec(line)) !== null) chords.push(match[1])

    if (chords.length > 0) {
      const dur = Math.floor(4 / chords.length)
      for (const c of chords) {
        currentSection.chords.push({ chord: c, beat, duration: Math.max(dur, 1) })
        beat += Math.max(dur, 1)
      }
    }
  }

  if (currentSection.chords.length > 0) sections.push(currentSection)

  if (sections.length === 0) return null

  return {
    title,
    artist,
    key_signature: key,
    bpm: tempo,
    chord_data: { sections },
    lyrics: lyricLines.join('\n'),
  }
}

function parseSimpleText(text: string): ParsedSong | null {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length < 3) return null

  const title = lines[0]
  const artist = lines[1] || 'Unknown'
  const key = lines[2] || 'C'
  const bpm = parseInt(lines[3], 10) || 120

  const chordLines = lines.slice(4)
  const sections: ParsedSection[] = []
  let currentSection: ParsedSection = { name: 'Intro', chords: [] }
  let beat = 1

  for (const line of chordLines) {
    if (line.startsWith('[') && line.endsWith(']')) {
      if (currentSection.chords.length > 0) sections.push(currentSection)
      currentSection = { name: line.slice(1, -1), chords: [] }
      beat = 1
      continue
    }

    const chords = line.split(/\s+/).filter(c => /^[A-G][b#]?(m|maj|dim|aug|7|sus|add)?[\d]?$/.test(c))
    if (chords.length === 0) continue

    const dur = Math.max(Math.floor(4 / chords.length), 1)
    for (const c of chords) {
      currentSection.chords.push({ chord: c, beat, duration: dur })
      beat += dur
    }
  }

  if (currentSection.chords.length > 0) sections.push(currentSection)
  if (sections.length === 0) return null

  return { title, artist, key_signature: key, bpm, chord_data: { sections } }
}

function validateSongData(data: unknown): data is ParsedSong {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  if (typeof d.title !== 'string' || !d.title) return false
  const cd = d.chord_data as { sections?: unknown[] } | undefined
  if (!cd?.sections?.length) return false
  for (const section of cd.sections) {
    const s = section as { name?: unknown; chords?: unknown[] }
    if (!s.name || !Array.isArray(s.chords) || s.chords.length === 0) return false
    for (const chord of s.chords) {
      const c = chord as { chord?: unknown; beat?: unknown; duration?: unknown }
      if (typeof c.chord !== 'string' || typeof c.beat !== 'number' || typeof c.duration !== 'number') return false
    }
  }
  return true
}

export function importSong(text: string): ParsedSong | null {
  const chordPro = parseChordPro(text)
  if (chordPro && validateSongData(chordPro)) return chordPro

  const simple = parseSimpleText(text)
  if (simple && validateSongData(simple)) return simple

  return null
}

export type { ParsedSong, ParsedSection, ParsedChord }
