import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { Music2, ChevronRight, Loader2 } from 'lucide-react'
import { useSongs } from '@/hooks/useSongs'

export function PracticePage() {
  const { data: songs, isLoading, error } = useSongs()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Práctica</h1>
        <p className="text-text-secondary">
          Selecciona una canción para practicar
        </p>
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
          <p className="text-text-secondary mb-4">No hay canciones disponibles</p>
          <p className="text-text-secondary text-sm">Pronto añadiremos canciones para practicar.</p>
        </div>
      )}

      {songs && songs.length > 0 && (
        <div className="space-y-3">
          {songs.map((song, index) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
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
                    <p className="text-text-secondary text-sm">{song.artist || 'Artista desconocido'}</p>
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
          ))}
        </div>
      )}
    </div>
  )
}