import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const PULSE_ORBS = [
  { cn: 'top-1/3 right-1/4 w-[400px] h-[400px] bg-[#22c55e]/12 blur-[120px]', delay: '1s' },
  { cn: 'bottom-1/4 left-1/4 w-[350px] h-[350px] bg-[#a855f7]/10 blur-[100px]', delay: '3s' },
  { cn: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#00d4ff]/8 blur-[80px]', delay: '0s' },
]

const FLOAT_CONFIGS = [
  { y: [0, -10, 0, -6, 0], rotate: [0, 3, -3, 2, 0], duration: 7 },
  { y: [0, -8, 0, -4, 0], rotate: [0, -2, 2, -1, 0], duration: 9 },
]

const FLOAT_NOTE = (delay: number, i: number) => ({
  y: FLOAT_CONFIGS[i].y,
  rotate: FLOAT_CONFIGS[i].rotate,
  transition: { duration: FLOAT_CONFIGS[i].duration + delay, repeat: Infinity, ease: 'easeInOut' as const },
})

const NoteSVG1 = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
)

const NoteSVG2 = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 18V5l10-2v13" />
    <circle cx="7" cy="18" r="3" />
    <circle cx="20" cy="16" r="3" />
  </svg>
)

const StaffLines = () => (
  <svg width="100" height="50" viewBox="0 0 100 50" stroke="currentColor" strokeWidth="0.5">
    {[0, 1, 2, 3, 4].map(i => (
      <line key={i} x1="0" y1={8 + i * 8} x2="100" y2={8 + i * 8} />
    ))}
  </svg>
)

const NOTE_COMPONENTS = [
  { Component: NoteSVG1, pos: 'top-[15%] left-[12%]', color: 'text-[#22c55e]/12', delay: 0 },
  { Component: NoteSVG2, pos: 'bottom-[20%] right-[15%]', color: 'text-[#a855f7]/10', delay: 3 },
  { Component: StaffLines, pos: 'top-[30%] right-[8%]', color: 'text-white/[0.03]', delay: 1 },
]

export function RegisterPage() {
  const navigate = useNavigate()
  const { createProfile, isAuthenticated } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/practice')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (displayName.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres')
      return
    }
    if (pin && (pin.length < 4 || pin.length > 6)) {
      setError('El PIN debe tener entre 4 y 6 dígitos')
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await createProfile(displayName.trim(), pin || undefined)
      navigate('/practice')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear perfil')
    } finally {
      setIsSubmitting(false)
    }
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

      <main className="relative z-10 flex-1 flex items-center justify-center px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="rounded-2xl p-8 border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
              className="text-center mb-8"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center">
                <UserPlus className="text-[#22c55e]" size={24} />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Crear Perfil</h1>
              <p className="text-white/40 text-sm">Crea tu perfil para comenzar a practicar</p>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
              >
                <label className="block text-sm text-white/50 mb-2 ml-1">Nombre</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:border-[#22c55e]/50 transition-all"
                  placeholder="Tu nombre"
                  autoFocus
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
              >
                <label className="block text-sm text-white/50 mb-2 ml-1">PIN (opcional, 4-6 dígitos)</label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:border-[#22c55e]/50 transition-all pr-12"
                    placeholder="Sin PIN"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-white/25 text-xs mt-2 ml-1">Usa un PIN paraproteger tu perfil</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
              >
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(34,197,94,0.3)' }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting || displayName.trim().length < 2}
                  className="w-full py-3 bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Crear Perfil
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.5 } }}
              className="text-center mt-6"
            >
              <p className="text-white/40 text-sm">
                ¿Ya tienes perfil?{' '}
                <Link to="/login" className="text-[#22c55e] hover:text-[#4ade80] transition-colors font-medium">
                  Iniciar sesión
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}