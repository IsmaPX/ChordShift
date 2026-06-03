import { Link, useLocation } from 'react-router'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Music2, Brain, BookOpen, Settings, Piano } from 'lucide-react'

export function PremiumSidebar() {
  const location = useLocation()
  const { t } = useTranslation()
  const path = location.pathname

  const navItems = [
    { to: '/practice', icon: Music2, label: t('nav.practice') },
    { to: '/ear-training', icon: Brain, label: t('nav.earTraining') },
    { to: '/encyclopedia', icon: BookOpen, label: t('nav.encyclopedia') },
    { to: '/settings', icon: Settings, label: t('nav.settings') },
  ]

  return (
    <aside className="w-64 h-screen sticky top-0 flex flex-col border-r border-white/[0.06] bg-[#06060a]/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="p-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center border border-accent/20">
            <Piano className="text-accent" size={20} />
          </div>
          <div>
            <h1 className="text-white font-semibold text-sm tracking-tight">Worship</h1>
            <p className="text-white/40 text-xs">Piano</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = path.startsWith(item.to)
          const Icon = item.icon
          return (
            <Link key={item.to} to={item.to} className="relative group block">
              <div className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                ${isActive ? 'text-white bg-white/[0.08]' : 'text-white/50 hover:text-white hover:bg-white/[0.04]'}
              `}>
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-accent rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon size={18} className={isActive ? 'text-accent' : ''} />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.03]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center text-sm">
            <span className="text-xs">WP</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">Usuario</p>
            <p className="text-white/40 text-xs">Online</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
