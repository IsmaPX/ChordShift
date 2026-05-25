import { autoUpdater } from 'electron-updater'
import { ipcMain } from 'electron'

export function setupAutoUpdater(mainWindow: BrowserWindow) {
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('update-available', (info) => {
    mainWindow.webContents.send('update-available', {
      version: info.version,
      releaseNotes: info.releaseNotes,
    })
    autoUpdater.downloadUpdate()
  })

  autoUpdater.on('download-progress', (progress) => {
    mainWindow.webContents.send('update-progress', progress.percent)
  })

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update-downloaded')
  })

  autoUpdater.on('error', (err) => {
    console.error('[AutoUpdater] error:', err)
  })

  ipcMainListeners()

  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      console.error('[AutoUpdater] check failed:', err)
    })
  }, 5000)
}

function ipcMainListeners() {
  ipcMain.on('install-update', () => {
    autoUpdater.quitAndInstall()
  })

  ipcMain.on('check-for-updates', () => {
    autoUpdater.checkForUpdates().catch((err: unknown) => {
      console.error('[AutoUpdater] manual check failed:', err)
    })
  })
}
