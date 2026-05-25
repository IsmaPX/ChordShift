import { useState, useCallback, useEffect, useRef } from 'react'

export type UpdateState = 'idle' | 'checking' | 'available' | 'downloading' | 'downloaded'

export function useAutoUpdate() {
  const [updateState, setUpdateState] = useState<UpdateState>('idle')
  const [updateProgress, setUpdateProgress] = useState(0)
  const [updateVersion, setUpdateVersion] = useState('')
  const cleanupsRef = useRef<(() => void)[]>([])

  useEffect(() => {
    return () => {
      cleanupsRef.current.forEach(fn => fn())
      cleanupsRef.current = []
    }
  }, [])

  const handleCheckForUpdates = useCallback(() => {
    if (window.isElectron && window.electronAPI) {
      setUpdateState('checking')
      setUpdateProgress(0)
      setUpdateVersion('')
      window.electronAPI.checkForUpdates()

      const cleanup1 = window.electronAPI.onUpdateAvailable((info) => {
        setUpdateVersion(info.version)
        setUpdateState('available')
      })
      const cleanup2 = window.electronAPI.onUpdateProgress((percent) => {
        setUpdateProgress(percent)
        setUpdateState('downloading')
      })
      const cleanup3 = window.electronAPI.onUpdateDownloaded(() => {
        setUpdateState('downloaded')
      })

      cleanupsRef.current = [cleanup1, cleanup2, cleanup3]
    }
  }, [])

  const handleInstallUpdate = useCallback(() => {
    if (window.isElectron && window.electronAPI) {
      window.electronAPI.installUpdate()
    }
  }, [])

  const resetUpdate = useCallback(() => {
    cleanupsRef.current.forEach(fn => fn())
    cleanupsRef.current = []
    setUpdateState('idle')
    setUpdateProgress(0)
    setUpdateVersion('')
  }, [])

  return {
    updateState,
    updateProgress,
    updateVersion,
    handleCheckForUpdates,
    handleInstallUpdate,
    resetUpdate,
  }
}
