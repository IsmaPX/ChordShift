import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn } from 'lucide-react'

const WORD_VARIANTS = {
  hidden: { opacity: 0, y: 30, filter: 'blur(6px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring' as const,
      stiffness: 70,
      damping: 16,
      delay: 0.4 + i * 0.25,
    },
  }),
}

const PULSE_ORBS = [
  { cn: 'top-1/4 left-1/4 w-[500px] h-[500px] bg-[#a855f7]/15 blur-[150px]', delay: '0s' },
  { cn: 'bottom-1/3 right-1/4 w-[400px] h-[400px] bg-[#ff6ec7]/12 blur-[120px]', delay: '2s' },
  { cn: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#00d4ff]/10 blur-[100px]', delay: '4s' },
]

const FLOAT_CONFIGS = [
  { y: [0, -14, 0, -8, 0], rotate: [0, 4, -4, 2, 0], duration: 7 },
  { y: [0, -10, 0, -6, 0], rotate: [0, -3, 3, -1, 0], duration: 8.5 },
  { y: [0, -12, 0, -7, 0], rotate: [0, 5, -5, 3, 0], duration: 6.5 },
  { y: [0, -8, 0, -5, 0], rotate: [0, 2, -2, 1, 0], duration: 9 },
]

const FLOAT_NOTE = (delay: number, i: number) => ({
  y: FLOAT_CONFIGS[i].y,
  rotate: FLOAT_CONFIGS[i].rotate,
  transition: { duration: FLOAT_CONFIGS[i].duration + delay, repeat: Infinity, ease: 'easeInOut' as const },
})

const STAFF_LINES = [...Array(5)].map((_, i) => ({ y: 10 + i * 10 }))

const MusicNote1 = () => (
  <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
)

const MusicNote2 = () => (
  <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 18V5l10-2v13" />
    <circle cx="7" cy="18" r="3" />
    <circle cx="20" cy="16" r="3" />
  </svg>
)

const MusicNote3 = () => (
  <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5.5" cy="17.5" r="3.5" />
    <circle cx="17.5" cy="15.5" r="3.5" />
    <path d="M9 17V4l11-2v13" />
  </svg>
)

const MusicNote4 = () => (
  <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
    <path d="M9 5l12-2" />
  </svg>
)

const NOTE_COMPONENTS = [
  { Component: MusicNote1, pos: 'top-[15%] right-[20%]', color: 'text-[#ff6ec7]/20', delay: 0 },
  { Component: MusicNote2, pos: 'bottom-[20%] left-[15%]', color: 'text-[#a855f7]/20', delay: 1.5 },
  { Component: MusicNote3, pos: 'top-[35%] left-[8%]', color: 'text-[#00d4ff]/15', delay: 3 },
  { Component: MusicNote4, pos: 'bottom-[30%] right-[10%]', color: 'text-[#ff6ec7]/15', delay: 4.5 },
]

const TremoloClef = () => (
  <svg width={60} height={80} viewBox="0 0 24 32" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round">
    <path d="M12 28c-3.5 0-6-1.8-6-5s2.5-5 6-5 4.5 1.5 4.5 4-2 4-4.5 4z" />
    <path d="M12 4v18" />
    <path d="M12 22c-2 0-4-1-4-3s2-3 4-3 4 1 4 3-2 3-4 3z" />
  </svg>
)

export function LandingPage() {
  const navigate = useNavigate()
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const words = ['Practica.', 'Entrena.', 'Adora.']

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    navigate('/login')
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#06060a]">
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0015]/80 via-[#1a0030]/60 to-[#001525]/80" />
        {PULSE_ORBS.map((orb, i) => (
          <div
            key={i}
            className={`absolute rounded-full animate-pulse ${orb.cn}`}
            style={{ animationDelay: orb.delay }}
          />
        ))}
      </div>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {NOTE_COMPONENTS.map(({ Component, pos, color, delay }, i) => (
          <motion.div
            key={i}
            className={`absolute ${pos} ${color}`}
            animate={FLOAT_NOTE(delay, i)}
          >
            <Component />
          </motion.div>
        ))}

        <motion.div
          className="absolute top-[45%] right-[5%] text-white/[0.03]"
          animate={{ y: [0, -8, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="120" height="60" viewBox="0 0 120 60" stroke="currentColor" strokeWidth="0.5">
            {STAFF_LINES.map((line, i) => (
              <line key={i} x1="0" y1={line.y} x2="120" y2={line.y} />
            ))}
          </svg>
        </motion.div>

        <motion.div
          className="absolute top-[60%] left-[5%] text-white/[0.04]"
          animate={{ y: [0, -10, 0], rotate: [0, 4, -4, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        >
          <TremoloClef />
        </motion.div>
      </div>

      <header className="relative z-10 p-6">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="relative">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
          </div>
          <span className="text-white font-semibold tracking-tight text-lg">
            <span className="bg-gradient-to-r from-[#22c55e] to-[#4ade80] bg-clip-text text-transparent">Worship</span>
            <span className="text-white/70 ml-1">Piano</span>
          </span>
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-6 pb-24">
        <AnimatePresence mode="wait">
          {!showLogin ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -30, transition: { duration: 0.3 } }}
              className="text-center max-w-lg w-full"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 flex flex-wrap justify-center gap-x-5 gap-y-3">
                {words.map((word, i) => (
                  <motion.span
                    key={word}
                    custom={i}
                    variants={WORD_VARIANTS}
                    initial="hidden"
                    animate="visible"
                    className={i % 2 === 0
                      ? 'bg-gradient-to-r from-[#22c55e] via-[#4ade80] to-[#22c55e] bg-clip-text text-transparent'
                      : 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]'
                    }
                    style={{ textShadow: i % 2 === 0 ? '0 0 20px rgba(34,197,94,0.3)' : undefined }}
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 1, type: 'spring', stiffness: 60, damping: 16 } }}
                className="text-[#a0a0b0] text-lg md:text-xl mb-12 leading-relaxed max-w-md mx-auto"
              >
                La herramienta definitiva para músicos de adoración. Practica canciones, entrena tu oído y domina los estilos.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 1.3, type: 'spring', stiffness: 60, damping: 16 } }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <motion.div
                  whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(34,197,94,0.35)' }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] blur-2xl opacity-40" />
                  <Link
                    to="/register"
                    className="relative block px-10 py-4 bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-bold text-lg rounded-full border border-[#ffd700]/30 shadow-lg shadow-[#22c55e]/20 overflow-hidden"
                  >
                    <span className="relative z-10">Comenzar Gratis</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700" />
                  </Link>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(168,85,247,0.15)' }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  onClick={() => setShowLogin(true)}
                  className="px-10 py-4 bg-white/[0.03] border border-white/[0.12] text-white font-medium text-lg rounded-full backdrop-blur-sm hover:bg-white/[0.06] hover:border-white/[0.2] transition-colors"
                >
                  Ya tengo cuenta
                </motion.button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1, transition: { delay: 2, duration: 0.8 } }}
                className="mt-20 origin-center"
              >
                <div className="flex items-center justify-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 14 } }}
              exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
              className="w-full max-w-sm"
            >
              <div className="rounded-2xl p-8 border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl">
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
                  className="text-2xl font-bold text-white mb-2 text-center"
                >
                  Bienvenido de vuelta
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.2 } }}
                  className="text-[#a0a0b0] text-sm mb-8 text-center"
                >
                  Ingresa tus datos para continuar
                </motion.p>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Email</label>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
                    >
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#22c55e]/50 focus:bg-white/[0.05] transition-all"
                        required
                      />
                    </motion.div>
                  </div>

                  <div>
                    <label className="block text-sm text-white/70 mb-2">Contraseña</label>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
                    >
                      <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#22c55e]/50 focus:bg-white/[0.05] transition-all"
                        required
                      />
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(34,197,94,0.3)' }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <LogIn size={18} />
                      Iniciar Sesión
                    </motion.button>
                  </motion.div>
                </form>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.6 } }}
                  whileHover={{ x: -3 }}
                  onClick={() => setShowLogin(false)}
                  className="mt-6 text-white/40 hover:text-white/70 transition-colors text-sm flex items-center gap-1 mx-auto"
                >
                  ← Volver
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}