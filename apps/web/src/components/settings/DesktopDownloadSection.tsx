import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, ChevronDown, Monitor } from 'lucide-react'
import { APP_VERSION } from '@/lib/version'

interface Props {
  t: (key: string, opts?: Record<string, unknown>) => string
}

export function DesktopDownloadSection({ t }: Props) {
  const [showAll, setShowAll] = useState(false)

  if (window.isElectron) return null

  const ua = navigator.userAgent
  const detected = ua.includes('Android') ? 'android' : ua.includes('Windows') ? 'win' : ua.includes('Mac') ? 'mac' : ua.includes('Linux') ? 'linux' : null
  const os = detected ?? 'win'
  const osName: Record<string, string> = { win: 'Windows', mac: 'macOS', linux: 'Linux', android: 'Android' }
  const ver = `v${APP_VERSION}`
  const base = `https://github.com/IsmaPX/ChordShift/releases/download/${ver}`
  const urls: Record<string, string> = {
    win: `${base}/Worship-Piano-Setup-${APP_VERSION}.exe`,
    mac: `${base}/Worship-Piano-${APP_VERSION}.dmg`,
    linux: `${base}/Worship-Piano-${APP_VERSION}.AppImage`,
    android: `${base}/ChordShift-${APP_VERSION}.apk`,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-accent/20">
          <Monitor className="text-accent" size={20} />
        </div>
        <div>
          <p className="text-text-primary font-medium">{t('desktop.title')}</p>
          <p className="text-text-secondary text-sm">{t('desktop.desc')}</p>
        </div>
      </div>

      <a
        href={urls[os]}
        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent/90 transition-colors text-sm"
      >
        <Download size={18} />
        {t('desktop.download', { os: osName[os] })}
      </a>

      <button
        onClick={() => setShowAll(!showAll)}
        className="flex items-center justify-center gap-1 w-full text-xs text-text-secondary hover:text-text-primary transition-colors"
      >
        {t('desktop.otherPlatforms')}
        <ChevronDown size={14} className={`transition-transform ${showAll ? 'rotate-180' : ''}`} />
      </button>

      {showAll && (
        <div className="flex flex-col sm:flex-row gap-3">
          {(['win', 'mac', 'linux'] as const).map((p) => (
            <a key={p} href={urls[p]}
              className="flex items-center justify-center gap-2 flex-1 px-4 py-2 rounded-xl bg-white/[0.03] text-text-primary border border-white/[0.08] hover:border-accent/50 hover:bg-accent-light transition-all text-sm">
              <Download size={14} /> {t('desktop.' + ({ win: 'windows', mac: 'mac', linux: 'linux' } as const)[p])}
            </a>
          ))}
          <a href={urls.android}
            className="flex items-center justify-center gap-2 flex-1 px-4 py-2 rounded-xl bg-white/[0.03] text-text-primary border border-white/[0.08] hover:border-accent/50 hover:bg-accent-light transition-all text-sm">
            <Download size={14} /> Android APK
          </a>
        </div>
      )}

      <p className="text-text-secondary text-xs text-center">{t('desktop.benefits')}</p>
    </motion.div>
  )
}
