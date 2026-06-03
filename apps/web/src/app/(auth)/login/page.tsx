import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, User, Lock, Loader2, Music2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const PULSE_ORBS = [
  { cn: 'top-1/4 left-1/4 w-[400px] h-[400px] bg-[#a855f7]/15 blur-[120px]', delay: '0s' },
  { cn: 'bottom-1/3 right-1/4 w-[350px] h-[350px] bg-[#ff6ec7]/10 blur-[100px]', delay: '2.5s' },
  { cn: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#00d4ff]/8 blur-[80px]', delay: '5s' },
]

const FLOAT_CONFIGS = [
  { y: [0, -12, 0, -6, 0], rotate: [0, 3, -3, 2, 0], duration: 8 },
  { y: [0, -8, 0, -5, 0], rotate: [0, -2, 2, -1, 0], duration: 6 },
  { y: [0, -10, 0, -6, 0], rotate: [0, 4, -4, 2, 0], duration: 9 },
]

const FLOAT_NOTE = (delay: number, i: number) => ({
  y: FLOAT_CONFIGS[i].y,
  rotate: FLOAT_CONFIGS[i].rotate,
  transition: { duration: FLOAT_CONFIGS[i].duration + delay, repeat: Infinity, ease: 'easeInOut' as const },
})

const TremoloClef = () => (
  <svg width="48" height="64" viewBox="0 0 24 32" fill="none" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round">
    <path d="M12 28c-3.5 0-6-1.8-6-5s2.5-5 6-5 4.5 1.5 4.5 4-2 4-4.5 4z" />
    <path d="M12 4v18" />
    <path d="M12 22c-2 0-4-1-4-3s2-3 4-3 4 1 4 3-2 3-4 3z" />
  </svg>
)

const NoteSVG1 = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
)

const NoteSVG2 = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5.5" cy="17.5" r="3.5" />
    <circle cx="17.5" cy="15.5" r="3.5" />
    <path d="M9 17V4l11-2v13" />
  </svg>
)

const NOTE_COMPONENTS = [
  { Component: NoteSVG1, pos: 'top-[12%] right-[15%]', color: 'text-[#ff6ec7]/15', delay: 0 },
  { Component: NoteSVG2, pos: 'bottom-[15%] left-[10%]', color: 'text-[#a855f7]/12', delay: 2 },
  { Component: TremoloClef, pos: 'top-[25%] left-[8%]', color: 'text-white/[0.04]', delay: 4 },
]

export function LoginPage() {
  const navigate = useNavigate()
  const { profiles, login, isLoading: authLoading } = useAuth()
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSelectProfile = async (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId)
    if (profile?.pin_hash) {
      setSelectedProfile(profileId)
      return
    }
    setLoading(true)
    try {
      await login(profileId)
      navigate('/practice')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  const handlePinSubmit = async () => {
    if (!selectedProfile || pin.length < 4) return
    setLoading(true)
    setError(null)
    try {
      await login(selectedProfile, pin)
      navigate('/practice')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PIN incorrecto')
      setPin('')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setSelectedProfile(null)
    setPin('')
    setError(null)
  }

  if (authLoading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-[#06060a]">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    )
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
        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            {!selectedProfile ? (
              <motion.div
                key="profile-select"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-2xl p-8 border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
                  className="text-center mb-8"
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center">
                    <Music2 className="text-[#22c55e]" size={24} />
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">Seleccionar Perfil</h1>
                  <p className="text-white/40 text-sm">Elige un perfil para continuar</p>
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm text-center"
                  >
                    {error}
                  </motion.div>
                )}

                {profiles.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: 0.2 } }}
                    className="text-center py-6"
                  >
                    <p className="text-white/40 mb-6 text-sm">No hay perfiles creados</p>
                    <Link
                      to="/register"
                      className="block w-full py-3 bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-semibold rounded-xl text-center hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all"
                    >
                      Crear Perfil
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div
                    className="space-y-2 mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: 0.2 } }}
                  >
                    {profiles.map((profile, index) => (
                      <motion.button
                        key={profile.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0, transition: { delay: 0.3 + index * 0.08 } }}
                        whileHover={{ scale: 1.02, borderColor: 'rgba(34,197,94,0.3)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectProfile(profile.id)}
                        disabled={loading}
                        className="w-full flex items-center gap-4 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:bg-white/[0.06] transition-all text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-[#22c55e]/15 flex items-center justify-center shrink-0">
                          {profile.pin_hash ? (
                            <Lock className="text-[#22c55e]" size={18} />
                          ) : (
                            <User className="text-[#22c55e]" size={18} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{profile.display_name}</p>
                          <p className="text-white/40 text-sm">{profile.settings?.xp || 0} XP</p>
                        </div>
                        <LogIn className="text-white/30" size={18} />
                      </motion.button>
                    ))}
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.5 } }}
                  className="text-center"
                >
                  <Link to="/register" className="text-white/40 hover:text-[#22c55e] transition-colors text-sm font-medium">
                    Crear nuevo perfil
                  </Link>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="pin-entry"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-2xl p-8 border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
                  className="text-center mb-8"
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center">
                    <Lock className="text-[#a855f7]" size={24} />
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">Ingresar PIN</h1>
                  <p className="text-white/40 text-sm">Ingresa tu PIN para acceder</p>
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm text-center"
                  >
                    {error}
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
                  className="space-y-4"
                >
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={pin}
                    onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-[#22c55e]/50 transition-all placeholder:text-white/20"
                    placeholder="• • • •"
                    autoFocus
                  />
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(34,197,94,0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePinSubmit}
                    disabled={loading || pin.length < 4}
                    className="w-full py-3 bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        <LogIn size={18} />
                        Acceder
                      </>
                    )}
                  </motion.button>
                  <button
                    onClick={handleBack}
                    className="w-full py-2 text-white/40 hover:text-white/70 transition-colors text-sm"
                  >
                    ← Volver a perfiles
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}