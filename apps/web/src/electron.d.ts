interface UpdateInfo {
  version: string
  releaseNotes?: string
}

interface ElectronAPI {
  sendOTP(phone: string, code: string): Promise<{ success: boolean; simulated?: boolean }>
  sendWhatsApp(phone: string, message: string): Promise<{ success: boolean; simulated?: boolean }>
  onUpdateAvailable(callback: (info: UpdateInfo) => void): () => void
  onUpdateProgress(callback: (percent: number) => void): () => void
  onUpdateDownloaded(callback: () => void): () => void
  installUpdate(): void
  checkForUpdates(): void
}

declare global {
  interface Window {
    isElectron?: boolean
    electronAPI?: ElectronAPI
  }
}

export {}
