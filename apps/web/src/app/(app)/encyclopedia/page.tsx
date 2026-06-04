import { useState } from 'react'
import { motion } from 'framer-motion'
import { StyleCard } from '@/components/encyclopedia/StyleCard'
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">{t('encyclopedia.title')}</h1>
        <p className="text-text-secondary">
          {t('encyclopedia.subtitle', { count: styles?.length || 0 })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {styles?.map((style, index) => (
          <motion.div
            key={style.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StyleCard style={style} onClick={() => setSelectedStyle(style)} />
          </motion.div>
        ))}
      </div>

      {selectedStyle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedStyle(null)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="w-full max-w-lg bg-bg-secondary rounded-2xl p-6 border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-text-primary mb-4">
              {selectedStyle.name}
            </h2>
            <p className="text-text-secondary mb-6">{selectedStyle.description}</p>

            <div className="mb-4">
              <h3 className="text-text-primary font-medium mb-2">{t('encyclopedia.techniques')}</h3>
              <div className="flex flex-wrap gap-2">
                {selectedStyle.techniques?.map((tech, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-text-primary font-medium mb-2">{t('encyclopedia.theory')}</h3>
              <div className="flex flex-wrap gap-2">
                {selectedStyle.theory_required?.map((theory, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-border text-text-secondary text-sm"
                  >
                    {theory}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-text-secondary text-sm">{t('encyclopedia.difficulty')}</span>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < selectedStyle.difficulty ? 'bg-accent' : 'bg-border'
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedStyle(null)}
              className="mt-6 w-full py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 transition-colors"
            >
              {t('encyclopedia.close')}
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}