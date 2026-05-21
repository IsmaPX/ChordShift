import { useState, useCallback } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { Music2, ChevronRight, Loader2, Search, Upload, Plus, Filter, X } from 'lucide-react'
import { useSongs, useCreateSong } from '@/hooks/useSongs'
import { useStyles } from '@/hooks/useStyles'
import { importSong } from '@/lib/songImporter'
import { cn } from '@/lib/utils'

type Tab = 'all' | 'preset' | 'mine'

const tabs: { value: Tab; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'preset', label: 'Precargadas' },
  { value: 'mine', label: 'Mis Canciones' },
]

export function PracticePage() {
  const [tab, setTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')
  const [styleFilter, setStyleFilter] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newArtist, setNewArtist] = useState('')
  const [newKey, setNewKey] = useState('C')
  const [newBpm, setNewBpm] = useState(120)

  const { data: songs, isLoading, error } = useSongs({ search, styleId: styleFilter || undefined, tab })
  const { data: styles } = useStyles()
  const createSong = useCreateSong()

  const handleImport = useCallback(async () => {
    if (!importText.trim()) return
    setImportError(null)
    const parsed = importSong(importText)
    if (!parsed) {
      setImportError('No se pudo interpretar el formato. Usa ChordPro o formato simple.')
      return
    }
    try {
      await createSong.mutateAsync({
        title: parsed.title,
        artist: parsed.artist,
        key_signature: parsed.key_signature,
        bpm: parsed.bpm,
        chord_data: parsed.chord_data,
        style_id: styleFilter || styles?.[0]?.id || crypto.randomUUID(),
        difficulty: 1,
        is_published: false,
        created_at: new Date().toISOString(),
      })
      setShowImport(false)
      setImportText('')
      setTab('mine')
    } catch {
      setImportError('Error al guardar la canción')
    }
  }, [importText, createSong, styleFilter, styles])

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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Práctica</h1>
          <p className="text-text-secondary">Selecciona una canción para practicar</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-secondary border border-border text-text-secondary hover:text-text-primary hover:border-accent/50 transition-all"
          >
            <Upload size={18} />
            Importar
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white hover:bg-accent-hover transition-all"
          >
            <Plus size={18} />
            Crear
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                tab === t.value
                  ? 'bg-accent text-white'
                  : 'bg-bg-secondary text-text-secondary hover:text-text-primary'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-bg-secondary border border-border rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors"
              placeholder="Buscar canciones..."
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary">
                <X size={18} />
              </button>
            )}
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" size={18} />
            <select
              value={styleFilter}
              onChange={e => setStyleFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-bg-secondary border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent transition-colors appearance-none"
            >
              <option value="">Todos los estilos</option>
              {styles?.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-accent" size={32} />
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger">
          Error al cargar canciones. Intenta de nuevo.
        </div>
      )}

      {songs && songs.length === 0 && (
        <div className="text-center py-12">
          <Music2 className="mx-auto text-text-secondary mb-4" size={48} />
          <p className="text-text-secondary mb-2">
            {tab === 'mine' ? 'No has creado canciones aún' : 'No hay canciones disponibles'}
          </p>
          <p className="text-text-secondary text-sm mb-6">
            {tab === 'mine' ? 'Importa o crea tu primera canción' : 'Prueba con otros filtros'}
          </p>
          {tab === 'mine' && (
            <div className="flex justify-center gap-2">
              <button onClick={() => setShowImport(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-secondary border border-border text-text-secondary hover:text-text-primary transition-all">
                <Upload size={18} /> Importar
              </button>
              <button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white hover:bg-accent-hover transition-all">
                <Plus size={18} /> Crear
              </button>
            </div>
          )}
        </div>
      )}

      {songs && songs.length > 0 && (
        <div className="space-y-3">
          {songs.map((song, index) => {
            const style = styles?.find(s => s.id === song.style_id)
            return (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/practice/${song.id}`}
                  className="flex items-center justify-between p-4 bg-bg-secondary rounded-xl border border-border hover:border-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                      <Music2 className="text-accent" size={24} />
                    </div>
                    <div>
                      <h3 className="text-text-primary font-medium">{song.title}</h3>
                      <p className="text-text-secondary text-sm">{song.artist || 'Artista desconocido'}{style ? ` · ${style.name}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-text-secondary text-sm">Tonalidad</p>
                      <p className="text-text-primary font-medium">{song.key_signature || '—'}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-text-secondary text-sm">BPM</p>
                      <p className="text-text-primary font-medium">{song.bpm || '—'}</p>
                    </div>
                    <ChevronRight className="text-text-secondary" size={20} />
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
            <h2 className="text-xl font-bold text-text-primary">Importar Canción</h2>
            <textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              className="w-full h-48 px-4 py-3 bg-bg-card border border-border rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors font-mono text-sm"
              placeholder={`ChordPro:\n{title: Mi Canción}\n{artist: Autor}\n{key: C}\n\n[Am]Let it [C]be, [G]let it [F]be\n\nO formato simple:\nMi Canción\nAutor\nC\n120\n| Am | C | G | F |`}
            />
            {importError && <p className="text-danger text-sm">{importError}</p>}
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowImport(false); setImportError(null); setImportText('') }} className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors">
                Cancelar
              </button>
              <button onClick={handleImport} disabled={!importText.trim() || createSong.isPending} className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-50">
                {createSong.isPending ? 'Importando...' : 'Importar'}
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
            <h2 className="text-xl font-bold text-text-primary">Crear Canción</h2>
            <div className="space-y-3">
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full px-4 py-3 bg-bg-card border border-border rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors" placeholder="Título" autoFocus />
              <input value={newArtist} onChange={e => setNewArtist(e.target.value)} className="w-full px-4 py-3 bg-bg-card border border-border rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors" placeholder="Artista (opcional)" />
              <div className="flex gap-2">
                <input value={newKey} onChange={e => setNewKey(e.target.value)} className="flex-1 px-4 py-3 bg-bg-card border border-border rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors" placeholder="Tonalidad (C, G, Dm...)" />
                <input type="number" value={newBpm} onChange={e => setNewBpm(Number(e.target.value))} className="w-24 px-4 py-3 bg-bg-card border border-border rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors" placeholder="BPM" />
              </div>
            </div>
            <p className="text-text-secondary text-sm">Después de crear la canción, podrás añadir las progresiones desde el editor.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowCreateForm(false)} className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors">
                Cancelar
              </button>
              <button onClick={handleCreate} disabled={!newTitle.trim() || createSong.isPending} className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-50">
                {createSong.isPending ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
