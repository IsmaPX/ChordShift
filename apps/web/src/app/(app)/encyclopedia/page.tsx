import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStyles } from '@/hooks/useStyles'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Style } from '@/types/music'

export function EncyclopediaPage() {
  const { t } = useTranslation()
  const { data: styles, isLoading, error } = useStyles()
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger">
        {t('encyclopedia.error')}
      </div>
    )
  }

  return (
    <div className="encyclopedia-bg -m-4 sm:-m-6 p-4 sm:p-6 min-h-[calc(100vh-80px)]">
      <div className="relative space-y-6">
        {/* Header estilo "enciclopedia abierta" */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="encyclopedia-page-num">VOL. I</span>
              <div className="h-px flex-1 bg-gradient-to-r from-accent/40 to-transparent" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-1 font-serif">
              {t('encyclopedia.title')}
            </h1>
            <p className="text-text-secondary text-sm italic">
              {t('encyclopedia.subtitle', { count: styles?.length || 0 })}
            </p>
          </div>
        </div>

        {/* Grid de tomos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {styles?.map((style, index) => (
            <motion.div
              key={style.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <div
                onClick={() => setSelectedStyle(style)}
                className="encyclopedia-tome cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <span className="encyclopedia-page-num shrink-0">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-text-primary font-bold text-lg mb-2 font-serif">
                      {style.name}
                    </h3>
                    <p className="text-text-secondary text-sm line-clamp-2 leading-relaxed">
                      {style.description}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${
                              i < style.difficulty ? 'bg-accent' : 'bg-accent/20'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-accent text-xs font-mono">
                        {style.techniques?.length || 0} técnicas
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {selectedStyle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedStyle(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-lg encyclopedia-tome cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="encyclopedia-page-num shrink-0">
                  {String((styles?.findIndex(s => s.id === selectedStyle.id) ?? 0) + 1).padStart(2, '0')}
                </span>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-text-primary font-serif">
                    {selectedStyle.name}
                  </h2>
                </div>
              </div>
              <p className="text-text-secondary mb-6 leading-relaxed">{selectedStyle.description}</p>

              <div className="mb-5">
                <h3 className="text-accent font-mono text-xs uppercase tracking-widest mb-3">
                  {t('encyclopedia.techniques')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedStyle.techniques?.map((tech, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-sm bg-accent/15 text-accent text-sm border-l-2 border-accent"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <h3 className="text-accent font-mono text-xs uppercase tracking-widest mb-3">
                  {t('encyclopedia.theory')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedStyle.theory_required?.map((theory, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-sm bg-bg-primary/50 text-text-secondary text-sm border-l-2 border-accent/40 italic"
                    >
                      {theory}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-accent/15">
                <span className="text-text-secondary text-xs uppercase tracking-widest font-mono">
                  {t('encyclopedia.difficulty')}
                </span>
                <div className="flex gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2.5 h-2.5 rounded-sm ${
                        i < selectedStyle.difficulty ? 'bg-accent glow-green' : 'bg-accent/15'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedStyle(null)}
                className="w-full py-3 rounded-sm bg-accent text-white font-medium hover:bg-accent-hover glow-green transition-colors"
              >
                {t('encyclopedia.close')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}