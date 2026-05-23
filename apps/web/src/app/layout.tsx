import { Outlet, Link, useLocation } from 'react-router'
import { AudioGate } from '@/components/ui/AudioGate'
import { useWhatsAppReminder } from '@/hooks/useWhatsAppReminder'
import { 
  Music2, 
  Brain, 
  BookOpen, 
  Settings,
  Piano,
} from 'lucide-react'

const navItems = [
  { path: '/practice', icon: Music2, label: 'Práctica' },
  { path: '/ear-training', icon: Brain, label: 'Ear Training' },
  { path: '/encyclopedia', icon: BookOpen, label: 'Estilos' },
  { path: '/settings', icon: Settings, label: 'Ajustes' },
]

export function AppLayout() {
  const location = useLocation()

  useWhatsAppReminder()

  return (
    <AudioGate>
      <div className="min-h-screen bg-bg-primary flex flex-col">
        <div className="relative z-10 flex flex-col min-h-screen">
          <header className="sticky top-0 z-40 bg-bg-primary/80 backdrop-blur-lg border-b border-border">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 group">
                  <div className="relative">
                    <Piano className="text-accent group-hover:text-accent-hover transition-colors" size={26} />
                    <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent animate-pulse" />
                  </div>
                  <span className="text-text-primary font-semibold hidden sm:block tracking-tight">
                    <span className="text-gradient-green">Worship</span> Piano
                  </span>
                </Link>

                <nav className="flex items-center gap-1">
                  {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path)
                    const Icon = item.icon

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`p-2 rounded-lg transition-all ${
                          isActive
                            ? 'text-accent bg-accent-light'
                            : 'text-text-secondary hover:text-accent hover:bg-accent-light'
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
      </div>
    </AudioGate>
  )
}