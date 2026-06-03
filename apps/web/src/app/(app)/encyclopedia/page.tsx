import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StyleCard } from '@/components/encyclopedia/StyleCard'
import { useStyles } from '@/hooks/useStyles'
import { Loader2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Style } from '@/types/music'

export function EncyclopediaPage() {
  const { t } = useTranslation()
  const { data: styles, isLoading, error } = useStyles()
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-[#22c55e]" size={32} />
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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">{t('encyclopedia.title')}</h1>
        <p className="text-white/50">
          {t('encyclopedia.subtitle', { count: styles?.length || 0 })}
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
      >
        {styles?.map((style, index) => (
          <motion.div
            key={style.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
          >
            <StyleCard style={style} onClick={() => setSelectedStyle(style)} />
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {selectedStyle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedStyle(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg bg-[#0a0a1a]/95 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.08]"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedStyle.name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-white/30 text-xs uppercase tracking-wider">Dificultad</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`w-2 h-2 rounded-full ${
                            level <= selectedStyle.difficulty ? 'bg-[#22c55e]' : 'bg-white/[0.1]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStyle(null)}
                  className="p-2 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-white/60 mb-6 leading-relaxed">{selectedStyle.description}</p>

              {selectedStyle.techniques && selectedStyle.techniques.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-white font-medium mb-3 text-sm uppercase tracking-wider text-white/40">Técnicas</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedStyle.techniques.map((tech, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedStyle.theory_required && selectedStyle.theory_required.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-white font-medium mb-3 text-sm uppercase tracking-wider text-white/40">Teoría Requerida</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedStyle.theory_required.map((theory, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/60 text-sm"
                      >
                        {theory}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedStyle(null)}
                className="mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-semibold hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all"
              >
                Cerrar
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}