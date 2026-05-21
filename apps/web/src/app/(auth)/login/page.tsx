import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { Music2, Headphones } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, isAuthenticated, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/practice')
    }
  }, [isAuthenticated, isLoading, navigate])

  const onSubmit = async (data: LoginForm) => {
    try {
      setError(null)
      await signIn(data.email, data.password)
      navigate('/practice')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 text-accent/5">
          <Music2 size={100} />
        </div>
        <div className="absolute bottom-40 left-10 text-accent/5">
          <Headphones size={80} />
        </div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <header className="relative z-10 p-6">
        <a href="/" className="flex items-center gap-3">
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
          <span className="text-text-primary font-semibold tracking-tight">
            <span className="text-gradient-green">Worship</span> Piano
          </span>
        </a>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-gradient-green mb-2">Iniciar Sesión</h1>
          <p className="text-text-secondary mb-8">
            Accede a tu cuenta para continuar practicando
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-text-primary text-sm mb-2">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className="w-full px-4 py-3 bg-bg-card border border-border rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors"
                placeholder="tu@email.com"
              />
              {errors.email && (
                <p className="text-danger text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-text-primary text-sm mb-2">
                Contraseña
              </label>
              <input
                {...register('password')}
                type="password"
                id="password"
                className="w-full px-4 py-3 bg-bg-card border border-border rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-danger text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full py-3 px-6 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover glow-green transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p className="text-text-secondary text-center mt-6">
            ¿No tienes cuenta?{' '}
            <a href="/register" className="text-accent hover:underline font-medium">
              Regístrate
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}