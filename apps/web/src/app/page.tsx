import { Link } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Music2, Music3, Headphones, Download, Monitor, ChevronDown } from 'lucide-react'
import { Toast } from '../components/ui/Toast'
import { APP_VERSION } from '../lib/version'
import { variants, interactiveVariants } from '../lib/animations/variants'

const VERSION = `v${APP_VERSION}`
const DL_BASE = `https://github.com/IsmaPX/ChordShift/releases/download/${VERSION}`
const DL = {
  win: `${DL_BASE}/Worship-Piano-Setup-${APP_VERSION}.exe`,
  mac: `${DL_BASE}/Worship-Piano-${APP_VERSION}.dmg`,
  linux: `${DL_BASE}/Worship-Piano-${APP_VERSION}.AppImage`,
  android: `${DL_BASE}/ChordShift-${APP_VERSION}.apk`,
}

function getOS(): 'win' | 'mac' | 'linux' | 'android' | null {
  if (typeof window === 'undefined') return null
  const ua = navigator.userAgent
  if (ua.includes('Android')) return 'android'
  if (ua.includes('Windows')) return 'win'
  if (ua.includes('Mac')) return 'mac'
  if (ua.includes('Linux')) return 'linux'
  return null
}

const OS_NAME: Record<string, string> = { win: 'Windows', mac: 'macOS', linux: 'Linux', android: 'Android' }

export function LandingPage() {
  const { t } = useTranslation()
  const [showAll, setShowAll] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const detectedOS = getOS()
  const primaryOS = detectedOS ?? 'win'
  const primaryUrl = DL[primaryOS]

  return (
    <div className="min-h-screen landing-bg flex flex-col overflow-x-hidden">
      {/* ===== FONDO: Ecualizador animado en los costados ===== */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Ecualizador izquierdo */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 flex items-end gap-1.5 h-64 opacity-30">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={`l-${i}`}
              className="landing-eq-bar"
              style={{
                height: '100%',
                animationDelay: `${i * 0.08}s`,
                animationDuration: `${0.8 + (i % 4) * 0.2}s`,
              }}
            />
          ))}
        </div>
        {/* Ecualizador derecho */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-end gap-1.5 h-64 opacity-30">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={`r-${i}`}
              className="landing-eq-bar"
              style={{
                height: '100%',
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${0.9 + (i % 3) * 0.2}s`,
              }}
            />
          ))}
        </div>
        {/* Ondas radiales centrales */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-accent/8 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl" />
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
          variants={variants.fadeInUp}
          initial="initial"
          animate="animate"
          className="text-center max-w-md"
        >
          {/* Ecualizador central pequeño sobre el título */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="mb-8 flex items-end justify-center gap-1 h-12"
          >
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="landing-eq-bar"
                style={{
                  height: '100%',
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: `${0.6 + (i % 3) * 0.2}s`,
                }}
              />
            ))}
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
            <span className="text-gradient-green">Practica.</span>{' '}
            <span className="text-text-primary">Entrena.</span>{' '}
            <span className="text-gradient-green">Adora.</span>
          </h1>
          <p className="text-text-secondary text-lg mb-10 max-w-sm mx-auto">
            La herramienta definitiva para músicos de adoración.
            Practica canciones, entrena tu oído y domina los estilos.
          </p>

          <div className="flex flex-col gap-3">
            <motion.div variants={interactiveVariants.button} whileHover="hover" whileTap="tap">
              <Link
                to="/register"
                className="block w-full py-4 px-6 bg-gradient-to-r from-accent to-accent-hover text-white font-bold rounded-xl text-center glow-green transition-all text-lg"
              >
                Comenzar Gratis
              </Link>
            </motion.div>
            <motion.div variants={interactiveVariants.button} whileHover="hover" whileTap="tap">
              <Link
                to="/login"
                className="block w-full py-4 px-6 bg-bg-card/60 backdrop-blur border border-accent/20 text-text-primary font-medium rounded-xl text-center hover:border-accent/50 hover:bg-accent-light transition-all"
              >
                Ya tengo cuenta
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* ===== FEATURES: Tarjetas con identidad épica ===== */}
        <motion.div
          variants={variants.staggerContainer}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.5 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-2xl w-full"
        >
          {[
            { title: 'Práctica', desc: 'Visualiza acordes en tiempo real', icon: Music2 },
            { title: 'Ear Training', desc: 'Entrena intervalos y acordes', icon: Headphones },
            { title: 'Enciclopedia', desc: 'Domina 8 estilos de adoración', icon: Music3 },
          ].map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                variants={{ ...variants.fadeInUp, ...interactiveVariants.card }}
                whileHover="hover"
                className="landing-card"
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-accent/15 border border-accent/30">
                      <Icon className="text-accent" size={20} />
                    </div>
                    <h3 className="text-text-primary font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* ===== DOWNLOAD: Card de descarga con estilo propio ===== */}
        <motion.div
          variants={variants.fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.7 }}
          className="mt-20 mb-16 max-w-lg mx-auto w-full"
        >
          <div className="landing-card text-center">
            <div className="relative z-10">
              <div className="p-3 rounded-xl bg-accent/20 border border-accent/40 w-fit mx-auto mb-4 glow-green">
                <Monitor className="text-accent" size={28} />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">
                {t('desktop.title')}
              </h2>
              <p className="text-text-secondary text-sm mb-5">
                {t('desktop.desc')}
              </p>

              <motion.div variants={interactiveVariants.button} whileHover="hover" whileTap="tap">
                <a
                  href={primaryUrl}
                  onClick={() => setShowToast(true)}
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover glow-green transition-all text-sm mb-3"
                >
                  <Download size={18} />
                  {t('desktop.download', { os: OS_NAME[primaryOS] })}
                </a>
              </motion.div>

              <button
                onClick={() => setShowAll(!showAll)}
                className="flex items-center justify-center gap-1 w-full text-xs text-text-secondary hover:text-accent transition-colors"
              >
                {t('desktop.otherPlatforms')}
                <ChevronDown
                  size={14}
                  className={`transition-transform ${showAll ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {showAll && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex flex-col sm:flex-row gap-3 justify-center mt-3 overflow-hidden"
                  >
                    <a href={DL.win}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-bg-primary/60 text-text-primary font-medium rounded-xl border border-accent/15 hover:border-accent/50 hover:bg-accent-light transition-all text-sm flex-1">
                      <Download size={14} />
                      {t('desktop.windows')}
                    </a>
                    <a href={DL.mac}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-bg-primary/60 text-text-primary font-medium rounded-xl border border-accent/15 hover:border-accent/50 hover:bg-accent-light transition-all text-sm flex-1">
                      <Download size={14} />
                      {t('desktop.mac')}
                    </a>
                    <a href={DL.linux}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-bg-primary/60 text-text-primary font-medium rounded-xl border border-accent/15 hover:border-accent/50 hover:bg-accent-light transition-all text-sm flex-1">
                      <Download size={14} />
                      {t('desktop.linux')}
                    </a>
                    <a href={DL.android}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-bg-primary/60 text-text-primary font-medium rounded-xl border border-accent/15 hover:border-accent/50 hover:bg-accent-light transition-all text-sm flex-1">
                      <Download size={14} />
                      Android APK
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="text-text-secondary text-xs mt-4">
                {t('desktop.benefits')}
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      <Toast
        message={t('desktop.downloadStarted')}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  )
}
