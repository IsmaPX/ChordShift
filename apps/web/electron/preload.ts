import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('isElectron', true)

contextBridge.exposeInMainWorld('electronAPI', {
  sendOTP: (phone: string, code: string) =>
    ipcRenderer.invoke('send-otp', phone, code),

  sendWhatsApp: (phone: string, message: string) =>
    ipcRenderer.invoke('send-whatsapp', phone, message),

  onUpdateAvailable: (callback: (info: { version: string; releaseNotes?: string }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, info: { version: string; releaseNotes?: string }) => callback(info)
    ipcRenderer.on('update-available', handler)
    return () => ipcRenderer.removeListener('update-available', handler)
  },

  onUpdateProgress: (callback: (percent: number) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, percent: number) => callback(percent)
    ipcRenderer.on('update-progress', handler)
    return () => ipcRenderer.removeListener('update-progress', handler)
  },

  onUpdateDownloaded: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('update-downloaded', handler)
    return () => ipcRenderer.removeListener('update-downloaded', handler)
  },

  installUpdate: () => ipcRenderer.send('install-update'),

  checkForUpdates: () => ipcRenderer.send('check-for-updates'),

  onDeepLink: (callback: (pathname: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, pathname: string) => callback(pathname)
    ipcRenderer.on('deep-link', handler)
    return () => ipcRenderer.removeListener('deep-link', handler)
  },

  onNavigate: (callback: (pathname: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, pathname: string) => callback(pathname)
    ipcRenderer.on('navigate', handler)
    return () => ipcRenderer.removeListener('navigate', handler)
  },

  showNotification: (title: string, body: string) =>
    ipcRenderer.invoke('show-notification', title, body),

  openFileDialog: (filters?: { name: string; extensions: string[] }[]) =>
    ipcRenderer.invoke('dialog:openFile', filters),

  saveFileDialog: (defaultName: string, filters?: { name: string; extensions: string[] }[]) =>
    ipcRenderer.invoke('dialog:saveFile', defaultName, filters),
})
