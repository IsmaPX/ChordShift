import { useState, useCallback } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { Music2, ChevronRight, Loader2, Search, Upload, Plus, Filter, X } from 'lucide-react'
import { useSongs, useCreateSong, useUploadSongAudio } from '@/hooks/useSongs'
import { useStyles } from '@/hooks/useStyles'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'


type Tab = 'all' | 'preset' | 'mine'

const tabValues: Tab[] = ['all', 'preset', 'mine']

export function PracticePage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')
  const [styleFilter, setStyleFilter] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [importAudioFile, setImportAudioFile] = useState<File | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newArtist, setNewArtist] = useState('')
  const [newKey, setNewKey] = useState('C')
  const [newBpm, setNewBpm] = useState(120)

  const { data: songs, isLoading, error } = useSongs({ search, styleId: styleFilter || undefined, tab })
  const { data: styles } = useStyles()
  const createSong = useCreateSong()
  const uploadAudio = useUploadSongAudio()

  const handleImport = useCallback(async () => {
    if (!importAudioFile) return
    setImportError(null)

    const title = importAudioFile.name.replace(/\.[^/.]+$/, '')

    try {
      const song = await createSong.mutateAsync({
        title,
        artist: null,
        key_signature: 'C',
        bpm: 120,
        chord_data: { sections: [{ name: 'Intro', chords: [{ chord: 'C', beat: 1, duration: 4 }] }] },
        style_id: styleFilter || styles?.[0]?.id || crypto.randomUUID(),
        difficulty: 1,
        is_published: false,
        created_at: new Date().toISOString(),
      })

      await uploadAudio.mutateAsync({ song_id: song.id, file: importAudioFile })

      setShowImport(false)
      setImportAudioFile(null)
      setTab('mine')
    } catch {
      setImportError(t('practice.importError'))
    }
  }, [importAudioFile, createSong, uploadAudio, styleFilter, styles])

  const handleCreate = useCallback(async () => {
    if (!newTitle.trim()) return
    try {
      await createSong.mutateAsync({
        title: newTitle.trim(),
        artist: newArtist.trim() || 'Creada por mí',
        key_signature: newKey,
        bpm: newBpm,
        chord_data: { sections: [{ name: 'Intro', chords: [{ chord: 'C', beat: 1, duration: 4 }] }] },
        style_id: styleFilter || styles?.[0]?.id || crypto.randomUUID(),
        difficulty: 1,
        is_published: false,
        created_at: new Date().toISOString(),
      })
      setShowCreateForm(false)
      setNewTitle('')
      setNewArtist('')
      setNewKey('C')
      setNewBpm(120)
      setTab('mine')
    } catch {
      console.error('Error creating song')
    }
  }, [newTitle, newArtist, newKey, newBpm, createSong, styleFilter, styles])

  return (
    <div className="practice-list-bg -m-4 sm:-m-6 p-4 sm:p-6 min-h-[calc(100vh-80px)]">
      {/* Fondo decorativo: partitura sutil */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04]" aria-hidden="true" style={{ animation: 'scrolling-staff 15s linear infinite' }}>
        <svg width="100%" height="200%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="staff-lines" x="0" y="0" width="200" height="60" patternUnits="userSpaceOnUse">
              <line x1="0" y1="10" x2="200" y2="10" stroke="#22c55e" strokeWidth="1" />
              <line x1="0" y1="20" x2="200" y2="20" stroke="#22c55e" strokeWidth="1" />
              <line x1="0" y1="30" x2="200" y2="30" stroke="#22c55e" strokeWidth="1" />
              <line x1="0" y1="40" x2="200" y2="40" stroke="#22c55e" strokeWidth="1" />
              <line x1="0" y1="50" x2="200" y2="50" stroke="#22c55e" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#staff-lines)" />
        </svg>
      </div>

      <div className="relative space-y-6">
        {/* Header estilo "estante de vinilos" */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px w-8 bg-accent/60" />
              <span className="text-xs uppercase tracking-widest text-accent font-mono">Colección</span>
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-1">{t('practice.title')}</h1>
            <p className="text-text-secondary text-sm">{t('practice.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-primary/60 border border-accent/20 text-text-secondary hover:text-accent hover:border-accent/50 transition-all"
            >
              <Upload size={18} />
              <span className="hidden sm:inline">{t('practice.import')}</span>
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white hover:bg-accent-hover glow-green transition-all"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">{t('practice.create')}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            {tabValues.map((value) => (
              <button
                key={value}
                onClick={() => setTab(value)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  tab === value
                    ? 'bg-accent text-white glow-green'
                    : 'bg-bg-primary/40 text-text-secondary hover:text-accent border border-transparent hover:border-accent/30'
                )}
              >
                {t('practice.tab' + value.charAt(0).toUpperCase() + value.slice(1))}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-accent/60" size={18} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-bg-primary/60 backdrop-blur border border-accent/20 rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-all"
                placeholder={t('practice.search')}
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-accent">
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-accent/60 pointer-events-none" size={18} />
              <select
                value={styleFilter}
                onChange={e => setStyleFilter(e.target.value)}
                className="pl-10 pr-8 py-2 bg-bg-primary/60 backdrop-blur border border-accent/20 rounded-xl text-text-primary focus:outline-none focus:border-accent/60 transition-all appearance-none"
              >
                <option value="">{t('practice.filter')}</option>
                {styles?.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-accent" size={32} />
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger">
            {t('practice.error')}
          </div>
        )}

        {songs && songs.length === 0 && (
          <div className="text-center py-16 bg-bg-primary/40 rounded-2xl border border-dashed border-accent/20">
            <div className="practice-vinyl mx-auto mb-4 opacity-50" />
            <p className="text-text-secondary mb-2 font-medium">
              {tab === 'mine' ? t('practice.emptyMine') : t('practice.emptyOther')}
            </p>
            <p className="text-text-secondary text-sm mb-6 max-w-xs mx-auto">
              {tab === 'mine' ? t('practice.emptyMineDesc') : t('practice.emptyOtherDesc')}
            </p>
            {tab === 'mine' && (
              <div className="flex justify-center gap-2">
                <button onClick={() => setShowImport(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-primary border border-accent/20 text-text-secondary hover:text-accent transition-all">
                  <Upload size={18} /> {t('practice.import')}
                </button>
                <button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white hover:bg-accent-hover glow-green transition-all">
                  <Plus size={18} /> {t('practice.create')}
                </button>
              </div>
            )}
          </div>
        )}

        {songs && songs.length > 0 && (
          <div className="space-y-2.5">
            {songs.map((song, index) => {
              const style = styles?.find(s => s.id === song.style_id)
              return (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Link
                    to={`/practice/${song.id}`}
                    className="practice-song-card"
                  >
                    <div className="practice-vinyl">
                      <Music2 className="text-accent relative z-10" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-text-primary font-bold truncate text-lg">{song.title}</h3>
                        {style && (
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-accent/10 text-accent border border-accent/20">
                            {style.name}
                          </span>
                        )}
                      </div>
                      <p className="text-text-secondary text-sm truncate flex items-center gap-2">
                        <span>{song.artist || t('practice.unknownArtist')}</span>
                        <span className="w-1 h-1 rounded-full bg-accent/40" />
                        <span className="flex items-center gap-1 opacity-60">
                          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="0" y="4" width="2" height="4" rx="1" fill="currentColor" />
                            <rect x="3" y="2" width="2" height="8" rx="1" fill="currentColor" />
                            <rect x="6" y="0" width="2" height="12" rx="1" fill="currentColor" />
                            <rect x="9" y="3" width="2" height="6" rx="1" fill="currentColor" />
                            <rect x="12" y="5" width="2" height="2" rx="1" fill="currentColor" />
                          </svg>
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-text-secondary text-[10px] uppercase tracking-widest mb-0.5">{t('practice.key')}</p>
                        <p className="text-accent font-bold font-mono bg-accent/5 px-2 py-1 rounded border border-accent/10">{song.key_signature || '—'}</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-text-secondary text-[10px] uppercase tracking-widest mb-0.5">BPM</p>
                        <p className="text-text-primary font-bold font-mono">{song.bpm || '—'}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-bg-primary/50 flex items-center justify-center border border-accent/10 group-hover:bg-accent group-hover:border-accent transition-colors">
                        <ChevronRight className="text-accent group-hover:text-white" size={18} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}

        {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-bg-primary border border-border rounded-2xl p-6 space-y-4"
          >
            <h2 className="text-xl font-bold text-text-primary">{t('practice.importTitle')}</h2>

            <div className="border-2 border-dashed border-border rounded-xl p-4 hover:border-accent/50 transition-colors">
              {importAudioFile ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                      <Music2 className="text-accent" size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-text-primary text-sm font-medium truncate">{importAudioFile.name}</p>
                      <p className="text-text-secondary text-xs">
                        {(importAudioFile.size / (1024 * 1024)).toFixed(1)} MB
                        {importAudioFile.size > 10 * 1024 * 1024 && ` — ${t('practice.importLargeFile')}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setImportAudioFile(null)}
                    className="p-1.5 rounded-lg hover:bg-bg-secondary text-text-secondary hover:text-danger transition-colors shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-2 cursor-pointer py-2">
                  <Upload size={24} className="text-text-secondary" />
                  <span className="text-text-secondary text-sm">{t('practice.importUploadLabel')}</span>
                  <input
                    type="file"
                    accept="audio/*,video/mp4"
                    onChange={e => {
                      const file = e.target.files?.[0] || null
                      setImportAudioFile(file)
                      e.target.value = ''
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {importError && <p className="text-danger text-sm">{importError}</p>}
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowImport(false); setImportError(null); setImportAudioFile(null) }} className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors">
                {t('practice.cancel')}
              </button>
              <button onClick={handleImport} disabled={!importAudioFile || createSong.isPending || uploadAudio.isPending} className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-50">
                {createSong.isPending || uploadAudio.isPending ? t('practice.importing') : t('practice.import')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-bg-primary border border-border rounded-2xl p-6 space-y-4"
          >
            <h2 className="text-xl font-bold text-text-primary">{t('practice.createTitle')}</h2>
            <div className="space-y-3">
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full px-4 py-3 bg-bg-card border border-border rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors" placeholder={t('practice.createTitlePlaceholder')} autoFocus />
              <input value={newArtist} onChange={e => setNewArtist(e.target.value)} className="w-full px-4 py-3 bg-bg-card border border-border rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors" placeholder={t('practice.createArtistPlaceholder')} />
              <div className="flex gap-2">
                <input value={newKey} onChange={e => setNewKey(e.target.value)} className="flex-1 px-4 py-3 bg-bg-card border border-border rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors" placeholder={t('practice.createKeyPlaceholder')} />
                <input type="number" value={newBpm} onChange={e => setNewBpm(Number(e.target.value))} className="w-24 px-4 py-3 bg-bg-card border border-border rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors" placeholder={t('practice.createBpmPlaceholder')} />
              </div>
            </div>
            <p className="text-text-secondary text-sm">{t('practice.createDesc')}</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowCreateForm(false)} className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors">
                {t('practice.cancel')}
              </button>
              <button onClick={handleCreate} disabled={!newTitle.trim() || createSong.isPending} className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-50">
                {createSong.isPending ? t('practice.creating') : t('practice.create')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </div>
    </div>
  )
}
