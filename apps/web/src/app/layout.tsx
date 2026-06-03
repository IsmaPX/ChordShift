import { Outlet, Link, useLocation } from 'react-router'
import { useWhatsAppReminder } from '@/hooks/useWhatsAppReminder'
import { 
  Music2, 
  Brain, 
  BookOpen, 
  Settings,
  Piano,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { layoutTransitions, slideLeft, slideRight } from '@/lib/animations'
import { OnboardingTour } from '@/components/ui/OnboardingTour'
import { OnboardingWelcome } from '@/components/ui/OnboardingWelcome'

export function AppLayout() {
  const { t } = useTranslation()
  const location = useLocation()

  useWhatsAppReminder()

  const navItems = [
    { path: '/practice', icon: Music2, label: t('nav.practice'), id: 'nav-practice' },
    { path: '/ear-training', icon: Brain, label: t('nav.earTraining'), id: 'nav-ear-training' },
    { path: '/encyclopedia', icon: BookOpen, label: t('nav.encyclopedia'), id: 'nav-encyclopedia' },
    { path: '/settings', icon: Settings, label: t('nav.settings'), id: 'nav-settings' },
  ]

  const getTransition = () => {
    const path = location.pathname
    if (path.includes('/practice/')) return slideRight
    if (path === '/practice') return slideLeft
    return layoutTransitions
  }

  return (
    <div className="min-h-screen bg-[#06060a]/90 backdrop-blur-md flex flex-col">
      <div className="relative z-10 flex flex-col min-h-screen">
        <OnboardingTour />
        <OnboardingWelcome />
        <header className="sticky top-0 z-40 bg-[#0c0c14]/50 backdrop-blur-lg border-b border-white/[0.06]">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 group">
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Piano className="text-accent group-hover:text-accent-hover transition-colors" size={26} />
                    <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent animate-pulse" />
                  </motion.div>
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
                        id={item.id}
                        className={`p-2 rounded-lg transition-all ${
                          isActive
                            ? 'text-accent bg-accent-light'
                            : 'text-text-secondary hover:text-accent hover:bg-accent-light'
                        }`}
                        aria-label={item.label}
                      >
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Icon size={22} />
                        </motion.div>
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </div>
          </header>

          <main className="flex-1 container mx-auto px-4 py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={getTransition()}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>

          <nav className="sticky bottom-0 z-40 bg-[#0c0c14]/50 backdrop-blur-lg border-t border-white/[0.06] sm:hidden">
            <div className="flex items-center justify-around py-2">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path)
                const Icon = item.icon

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    id={item.id}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                      isActive
                        ? 'text-accent'
                        : 'text-text-secondary'
                    }`}
                  >
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                    >
                      <Icon size={20} />
                    </motion.div>
                    <span className="text-xs">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>
      </div>
  )
}

