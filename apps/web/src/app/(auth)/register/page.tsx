import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { Music2, Music3, Eye, EyeOff } from 'lucide-react'

export function RegisterPage() {
  const navigate = useNavigate()
  const { createProfile, isAuthenticated } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    navigate('/practice')
    return null
  }

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
    <div className="min-h-screen bg-bg-primary flex flex-col overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 text-accent/5">
          <Music2 size={100} />
        </div>
        <div className="absolute bottom-40 right-10 text-accent/5">
          <Music3 size={90} />
        </div>
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-accent/5 blur-3xl" />
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
          <h1 className="text-3xl font-bold text-gradient-green mb-2">Crear Perfil</h1>
          <p className="text-text-secondary mb-8">
            Crea tu perfil local para comenzar a practicar
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="display_name" className="block text-text-primary text-sm mb-2">
                Nombre
              </label>
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                type="text"
                id="display_name"
                className="w-full px-4 py-3 bg-bg-card border border-border rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors"
                placeholder="Tu nombre"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="pin" className="block text-text-primary text-sm mb-2">
                PIN opcional (4-6 dígitos)
              </label>
              <div className="relative">
                <input
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  id="pin"
                  className="w-full px-4 py-3 bg-bg-card border border-border rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors"
                  placeholder="Sin PIN"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover glow-green transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Creando...' : 'Crear Perfil'}
            </button>
          </form>

          <p className="text-text-secondary text-center mt-6">
            ¿Ya tienes perfil?{' '}
            <Link to="/login" className="text-accent hover:underline font-medium">
              Seleccionar perfil
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
