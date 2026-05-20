import { Outlet, Link, useLocation } from 'react-router'
import { AudioGate } from '@/components/ui/AudioGate'
import { 
  Music2, 
  Brain, 
  BookOpen, 
  Settings,
} from 'lucide-react'

const navItems = [
  { path: '/practice', icon: Music2, label: 'Práctica' },
  { path: '/ear-training', icon: Brain, label: 'Ear Training' },
  { path: '/encyclopedia', icon: BookOpen, label: 'Estilos' },
  { path: '/settings', icon: Settings, label: 'Ajustes' },
]

export function AppLayout() {
  const location = useLocation()

  return (
    <AudioGate>
      <div className="min-h-screen bg-bg-primary flex flex-col">
        <header className="sticky top-0 z-40 bg-bg-primary/80 backdrop-blur-lg border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <svg
                  width="28"
                  height="28"
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
                <span className="text-text-primary font-medium hidden sm:block">Worship Piano</span>
              </Link>

              <nav className="flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.path)
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`p-2 rounded-lg transition-colors ${
                        isActive
                          ? 'text-accent'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                      aria-label={item.label}
                    >
                      <Icon size={22} />
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-6">
          <Outlet />
        </main>

        <nav className="sticky bottom-0 z-40 bg-bg-primary/80 backdrop-blur-lg border-t border-border sm:hidden">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path)
              const Icon = item.icon

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'text-accent'
                      : 'text-text-secondary'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </AudioGate>
  )
}