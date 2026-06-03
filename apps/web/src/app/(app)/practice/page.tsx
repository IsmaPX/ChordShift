import { useState, useCallback } from 'react'
import { Link } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Music2, ChevronRight, Loader2, Search, Upload, Plus, Filter, X } from 'lucide-react'
import { useSongs, useCreateSong, useUploadSongAudio } from '@/hooks/useSongs'
import { useStyles } from '@/hooks/useStyles'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

type Tab = 'all' | 'preset' | 'mine'

const tabValues: Tab[] = ['all', 'preset', 'mine']

const tabLabels: Record<Tab, string> = {
  all: 'Todas',
  preset: 'Precargadas',
  mine: 'Mis Canciones',
}

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
  }, [importAudioFile, createSong, uploadAudio, styleFilter, styles, t])

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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('practice.title')}</h1>
          <p className="text-white/50">{t('practice.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/70 hover:text-white hover:border-[#22c55e]/30 transition-all"
          >
            <Upload size={18} />
            {t('practice.import')}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(34,197,94,0.3)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-semibold rounded-xl transition-all"
          >
            <Plus size={18} />
            {t('practice.create')}
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
        className="flex flex-col gap-3"
      >
        <div className="flex items-center gap-2">
          {tabValues.map((value) => (
            <motion.button
              key={value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTab(value)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                tab === value
                  ? 'bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                  : 'bg-white/[0.03] text-white/50 hover:text-white hover:bg-white/[0.06]'
              )}
            >
              {tabLabels[value]}
            </motion.button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#22c55e]/50 transition-all"
              placeholder="Buscar canciones..."
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                <X size={18} />
              </button>
            )}
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" size={18} />
            <select
              value={styleFilter}
              onChange={e => setStyleFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#22c55e]/50 transition-all appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#1a1a2e]">Todos los estilos</option>
              {styles?.map(s => (
                <option key={s.id} value={s.id} className="bg-[#1a1a2e]">{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-[#22c55e]" size={32} />
        </div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger"
        >
          {t('practice.error')}
        </motion.div>
      )}

      {songs && songs.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Music2 className="mx-auto text-white/20 mb-4" size={48} />
          <p className="text-white/50 mb-2">
            {tab === 'mine' ? t('practice.emptyMine') : 'No hay canciones disponibles'}
          </p>
          <p className="text-white/30 text-sm mb-6">
            {tab === 'mine' ? t('practice.emptyMineDesc') : 'Prueba con otros filtros'}
          </p>
          {tab === 'mine' && (
            <div className="flex justify-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowImport(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/70 hover:text-white hover:border-[#22c55e]/30 transition-all"
              >
                <Upload size={18} /> {t('practice.import')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-semibold rounded-xl transition-all"
              >
                <Plus size={18} /> {t('practice.create')}
              </motion.button>
            </div>
          )}
        </motion.div>
      )}

      {songs && songs.length > 0 && (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.2 } }}
        >
          {songs.map((song, index) => {
            const style = styles?.find(s => s.id === song.style_id)
            return (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Link
                  to={`/practice/${song.id}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] hover:border-[#22c55e]/20 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#22c55e]/20 to-[#16a34a]/10 flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all">
                      <Music2 className="text-[#22c55e]" size={24} />
                    </div>
                    <div>
                      <h3 className="text-white font-medium group-hover:text-[#22c55e] transition-colors">{song.title}</h3>
                      <p className="text-white/40 text-sm">
                        {song.artist || t('practice.unknownArtist')}
                        {style ? ` · ${style.name}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-white/30 text-xs uppercase tracking-wider">Tono</p>
                      <p className="text-white/70 font-medium">{song.key_signature || '—'}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-white/30 text-xs uppercase tracking-wider">BPM</p>
                      <p className="text-white/70 font-medium">{song.bpm || '—'}</p>
                    </div>
                    <ChevronRight className="text-white/20 group-hover:text-[#22c55e] transition-colors" size={20} />
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      <AnimatePresence>
        {showImport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => { setShowImport(false); setImportError(null); setImportAudioFile(null) }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg bg-[#0a0a1a]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 space-y-4"
            >
              <h2 className="text-xl font-bold text-white">{t('practice.importTitle')}</h2>

              <div className="border-2 border-dashed border-white/[0.08] rounded-xl p-4 hover:border-[#22c55e]/30 transition-colors">
                {importAudioFile ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-[#22c55e]/20 flex items-center justify-center shrink-0">
                        <Music2 className="text-[#22c55e]" size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{importAudioFile.name}</p>
                        <p className="text-white/40 text-xs">
                          {(importAudioFile.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setImportAudioFile(null)}
                      className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-danger transition-colors shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-2 cursor-pointer py-2">
                    <Upload size={24} className="text-white/30" />
                    <span className="text-white/40 text-sm">{t('practice.importUploadLabel')}</span>
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
                <button
                  onClick={() => { setShowImport(false); setImportError(null); setImportAudioFile(null) }}
                  className="px-4 py-2 text-white/50 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all"
                >
                  {t('practice.cancel')}
                </button>
                <button
                  onClick={handleImport}
                  disabled={!importAudioFile || createSong.isPending || uploadAudio.isPending}
                  className="px-4 py-2 bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all disabled:opacity-50"
                >
                  {createSong.isPending || uploadAudio.isPending ? t('practice.importing') : t('practice.import')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setShowCreateForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-[#0a0a1a]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 space-y-4"
            >
              <h2 className="text-xl font-bold text-white">{t('practice.createTitle')}</h2>
              <div className="space-y-3">
                <input
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#22c55e]/50 transition-all"
                  placeholder={t('practice.createTitlePlaceholder')}
                  autoFocus
                />
                <input
                  value={newArtist}
                  onChange={e => setNewArtist(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#22c55e]/50 transition-all"
                  placeholder={t('practice.createArtistPlaceholder')}
                />
                <div className="flex gap-2">
                  <input
                    value={newKey}
                    onChange={e => setNewKey(e.target.value)}
                    className="flex-1 px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#22c55e]/50 transition-all"
                    placeholder="Tono"
                  />
                  <input
                    type="number"
                    value={newBpm}
                    onChange={e => setNewBpm(Number(e.target.value))}
                    className="w-24 px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#22c55e]/50 transition-all"
                    placeholder="BPM"
                  />
                </div>
              </div>
              <p className="text-white/30 text-sm">{t('practice.createDesc')}</p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-white/50 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all"
                >
                  {t('practice.cancel')}
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newTitle.trim() || createSong.isPending}
                  className="px-4 py-2 bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all disabled:opacity-50"
                >
                  {createSong.isPending ? t('practice.creating') : t('practice.create')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}