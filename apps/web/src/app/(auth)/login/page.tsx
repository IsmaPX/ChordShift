import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { Music2, Headphones, User, Lock, Loader2, LogIn } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { variants, interactiveVariants } from '@/lib/animations/variants'
import { LoginBackgroundGallery } from '@/components/auth/LoginBackgroundGallery'

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
      setError(err instanceof Error ? err.message : 'Error al seleccionar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handlePinSubmit = async () => {
    if (!selectedProfile) return
    setLoading(true)
    setError(null)
    try {
      await login(selectedProfile, pin)
      navigate('/practice')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PIN incorrecto')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col overflow-hidden relative">
      {/* Galería de fondo con músicos anime y tinte verde */}
      <LoginBackgroundGallery duration={75} tinted />

      <div className="fixed inset-0 pointer-events-none z-1">
        <div className="absolute top-20 right-10 text-accent/5">
          <Music2 size={100} />
        </div>
        <div className="absolute bottom-40 left-10 text-accent/5">
          <Headphones size={80} />
        </div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <header className="relative z-10 p-6">
        <Link to="/" className="flex items-center gap-3">
          <span className="text-text-primary font-semibold tracking-tight">
            <span className="text-gradient-green">Worship</span> Piano
          </span>
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {selectedProfile ? (
              <motion.div
                key="pin-form"
                variants={variants.scaleIn}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-4"
              >
                <motion.h1 
                  variants={variants.fadeInUp}
                  initial="initial"
                  animate="animate"
                  className="text-3xl font-bold text-gradient-green mb-2 text-center"
                >
                  Ingresar PIN
                </motion.h1>
                <motion.p 
                  variants={variants.fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.1 }}
                  className="text-text-secondary mb-8 text-center"
                >
                  Ingresa tu PIN para acceder al perfil
                </motion.p>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm text-center"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="space-y-4">
                  <motion.input
                    whileFocus={{ scale: 1.01, borderColor: 'rgb(var(--accent))' }}
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    className="w-full px-4 py-3 bg-bg-card border border-border rounded-xl text-text-primary placeholder-text-secondary focus:outline-none transition-colors text-center text-2xl tracking-widest"
                    placeholder="• • • • • •"
                    autoFocus
                  />
                  <motion.button
                    variants={interactiveVariants.button}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={handlePinSubmit}
                    disabled={loading || pin.length < 4}
                    className="w-full py-3 px-6 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover glow-green transition-all disabled:opacity-50"
                  >
                    {loading ? 'Verificando...' : 'Acceder'}
                  </motion.button>
                  <button
                    onClick={() => setSelectedProfile(null)}
                    className="w-full py-2 text-text-secondary hover:text-text-primary transition-colors text-sm"
                  >
                    Volver a perfiles
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="profile-selector"
                variants={variants.scaleIn}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-4"
              >
                <motion.h1 
                  variants={variants.fadeInUp}
                  initial="initial"
                  animate="animate"
                  className="text-3xl font-bold text-gradient-green mb-2 text-center"
                >
                  Seleccionar Perfil
                </motion.h1>
                <motion.p 
                  variants={variants.fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.1 }}
                  className="text-text-secondary mb-8 text-center"
                >
                  Elige un perfil para continuar
                </motion.p>

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
                  <div className="text-center py-12">
                    <p className="text-text-secondary mb-6">No hay perfiles creados</p>
                    <Link
                      to="/register"
                      className="inline-block w-full py-3 px-6 bg-accent text-white font-semibold rounded-xl text-center hover:bg-accent-hover glow-green transition-all"
                    >
                      Crear Perfil
                    </Link>
                  </div>
                ) : (
                  <motion.div 
                    variants={variants.staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="space-y-3"
                  >
                    {profiles.map((profile) => (
                      <motion.button
                        key={profile.id}
                        variants={variants.fadeInUp}
                        whileHover="hover"
                        whileTap="tap"
                        layoutId={profile.id}
                        onClick={() => handleSelectProfile(profile.id)}
                        disabled={loading}
                        className="w-full flex items-center gap-4 p-4 bg-bg-card border border-border rounded-xl hover:border-accent/50 transition-all text-left disabled:opacity-50"
                      >

                        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                          {profile.pin_hash ? (
                            <Lock className="text-accent" size={20} />
                          ) : (
                            <User className="text-accent" size={20} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-text-primary font-medium truncate">{profile.display_name}</p>
                          <p className="text-text-secondary text-sm">
                            {profile.settings?.xp || 0} XP
                          </p>
                        </div>
                        <LogIn className="text-text-secondary shrink-0" size={20} />
                      </motion.button>
                    ))}
                  </motion.div>
                )}

                <div className="mt-6 text-center">
                  <Link to="/register" className="text-accent hover:underline font-medium">
                    Crear nuevo perfil
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
