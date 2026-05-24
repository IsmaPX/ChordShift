import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Music2, Music3, Headphones, Download, Monitor } from 'lucide-react'

const RELEASES_URL = 'https://github.com/IsmaPX/ChordShift/releases/latest'

export function LandingPage() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 text-accent/5">
          <Music3 size={120} />
        </div>
        <div className="absolute bottom-40 right-10 text-accent/5">
          <Music2 size={100} />
        </div>
        <div className="absolute top-1/3 right-1/4 text-accent/4">
          <Headphones size={80} />
        </div>
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute top-1/4 right-1/3 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <header className="relative z-10 p-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="relative">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-accent"
            >
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent animate-pulse" />
          </div>
          <span className="text-text-primary font-semibold tracking-tight">
            <span className="text-gradient-green">Worship</span> Piano
          </span>
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="mb-8"
          >
            <svg
              viewBox="0 0 400 120"
              className="w-full max-w-xs mx-auto text-accent"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <motion.path
                d="M50 90 Q80 30 110 60 Q140 90 170 50 Q200 10 230 40 Q260 70 290 30 Q320 -10 350 20"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.3 }}
                strokeLinecap="round"
              />
              <circle cx="50" cy="90" r="4" fill="currentColor" stroke="none" />
              <circle cx="170" cy="50" r="4" fill="currentColor" stroke="none" />
              <circle cx="290" cy="30" r="4" fill="currentColor" stroke="none" />
            </svg>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient-green">Practica.</span>{' '}
            <span className="text-text-primary">Entrena.</span>{' '}
            <span className="text-gradient-green">Adora.</span>
          </h1>
          <p className="text-text-secondary text-lg mb-8">
            La herramienta definitiva para músicos de adoración. 
            Practica canciones, entrena tu oído y domina los estilos.
          </p>

          <div className="flex flex-col gap-4">
            <Link
              to="/register"
              className="w-full py-3 px-6 bg-accent text-white font-semibold rounded-xl text-center hover:bg-accent-hover glow-green transition-all"
            >
              Comenzar Gratis
            </Link>
            <Link
              to="/login"
              className="w-full py-3 px-6 bg-bg-card border border-border text-text-primary font-medium rounded-xl text-center hover:border-accent/50 hover:bg-accent-light transition-all"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl"
        >
          {[
            { title: 'Práctica', desc: 'Visualiza acordes en tiempo real', icon: Music2 },
            { title: 'Ear Training', desc: 'Entrena intervalos y acordes', icon: Headphones },
            { title: 'Enciclopedia', desc: 'Domina 8 estilos de adoración', icon: Music3 },
          ].map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="p-4 bg-bg-card rounded-xl border border-border hover:border-accent/30 transition-all">
                <Icon className="text-accent mb-3" size={24} />
                <h3 className="text-text-primary font-medium mb-1">{feature.title}</h3>
                <p className="text-text-secondary text-sm">{feature.desc}</p>
              </div>
            )
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-16 mb-16 max-w-lg mx-auto w-full"
        >
          <div className="bg-bg-card rounded-2xl border border-border p-8 text-center">
            <div className="p-3 rounded-xl bg-accent/20 w-fit mx-auto mb-4">
              <Monitor className="text-accent" size={28} />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">
              {t('desktop.title')}
            </h2>
            <p className="text-text-secondary text-sm mb-4">
              {t('desktop.desc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
              <a
                href={RELEASES_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover glow-green transition-all text-sm"
              >
                <Download size={16} />
                {t('desktop.windows')}
              </a>
              <a
                href={RELEASES_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-bg-secondary text-text-primary font-medium rounded-xl border border-border hover:border-accent/50 hover:bg-accent-light transition-all text-sm"
              >
                <Download size={16} />
                {t('desktop.mac')}
              </a>
              <a
                href={RELEASES_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-bg-secondary text-text-primary font-medium rounded-xl border border-border hover:border-accent/50 hover:bg-accent-light transition-all text-sm"
              >
                <Download size={16} />
                {t('desktop.linux')}
              </a>
            </div>
            <p className="text-text-secondary text-xs">
              {t('desktop.benefits')}
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  )
}