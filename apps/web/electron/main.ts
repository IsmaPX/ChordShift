import { app, BrowserWindow, Menu, session, Tray, nativeImage, globalShortcut, Notification, dialog, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'
import { registerIpcHandlers } from './ipc-handlers'
import { setupAutoUpdater } from './updater'

function logError(type: string, err: unknown) {
  try {
    const dir = (typeof app !== 'undefined' && app.isReady()) ? app.getPath('userData') : (process.env.TEMP || '.')
    const msg = err instanceof Error ? err.stack || err.message : String(err)
    fs.writeFileSync(path.join(dir, 'worship-piano-crash.log'), `[${type}] ${new Date().toISOString()}\n${msg}\n`, { flag: 'a' })
  } catch { /* ignore write errors */ }
}

function safeExit(code = 1) {
  try { app.quit() } catch { process.exit(code) }
}

process.on('uncaughtException', (err) => {
  logError('FATAL', err)
  safeExit()
})

process.on('unhandledRejection', (reason) => {
  logError('UNHANDLED', reason)
})

const isDev = !app.isPackaged
const PROTOCOL = 'worship-piano'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false

function toggleWindow() {
  if (!mainWindow) return
  if (mainWindow.isVisible()) {
    mainWindow.hide()
  } else {
    mainWindow.show()
    mainWindow.focus()
  }
}

function handleDeepLink(url: string) {
  if (!mainWindow) return
  mainWindow.show()
  mainWindow.focus()
  const parsed = new URL(url)
  const pathname = parsed.pathname.replace(/\/+$/, '') || '/practice'
  mainWindow.webContents.send('deep-link', pathname)
}

function createTray() {
  const iconPath = path.join(__dirname, '../resources/icon.png')
  let trayIcon: Electron.NativeImage
  if (fs.existsSync(iconPath)) {
    trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
  } else {
    trayIcon = nativeImage.createEmpty()
  }

  tray = new Tray(trayIcon)
  tray.setToolTip('Worship Piano')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show/Hide',
      click: toggleWindow,
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true
        app.quit()
      },
    },
  ])
  tray.setContextMenu(contextMenu)
  tray.on('click', toggleWindow)
}

function registerGlobalShortcuts() {
  globalShortcut.register('CommandOrControl+Shift+P', () => {
    mainWindow?.webContents.send('navigate', '/practice')
    mainWindow?.show()
    mainWindow?.focus()
  })
  globalShortcut.register('CommandOrControl+Shift+E', () => {
    mainWindow?.webContents.send('navigate', '/ear-training')
    mainWindow?.show()
    mainWindow?.focus()
  })
  globalShortcut.register('CommandOrControl+Shift+S', () => {
    mainWindow?.webContents.send('navigate', '/settings')
    mainWindow?.show()
    mainWindow?.focus()
  })
}

function registerNotificationHandler() {
  ipcMain.handle('show-notification', async (_event, title: string, body: string) => {
    if (mainWindow && !mainWindow.isFocused()) {
      const notif = new Notification({ title, body })
      notif.on('click', () => {
        mainWindow?.show()
        mainWindow?.focus()
      })
      notif.show()
    }
  })
}

function registerDialogHandlers() {
  ipcMain.handle('dialog:openFile', async (_event, filters?: { name: string; extensions: string[] }[]) => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters,
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle('dialog:saveFile', async (_event, defaultName: string, filters?: { name: string; extensions: string[] }[]) => {
    const result = await dialog.showSaveDialog({
      defaultPath: defaultName,
      filters,
    })
    return result.canceled ? null : result.filePath
  })
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Worship Piano',
    icon: path.join(__dirname, '../resources/icon.png'),
    frame: !isDev,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false,
    },
  })

  const viewSubmenu: Electron.MenuItemConstructorOptions[] = [
    { role: 'togglefullscreen' },
  ]
  if (isDev) {
    viewSubmenu.unshift({ role: 'toggleDevTools' })
  }

  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        { role: 'reload', label: 'Reload' },
        { role: 'forceReload', label: 'Force Reload' },
        { type: 'separator' },
        { role: 'quit', label: 'Exit' },
      ],
    },
    {
      label: 'View',
      submenu: viewSubmenu,
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Worship Piano',
          click: () => {
            dialog.showMessageBox({
              type: 'info',
              title: 'About Worship Piano',
              message: 'Worship Piano App',
              detail: 'Version: ' + app.getVersion() + '\nA tool for practicing worship music.',
            })
          },
        },
      ],
    },
  ])
  Menu.setApplicationMenu(menu)

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const url = details.url || ''
    if (!url.startsWith('http')) {
      callback({ responseHeaders: details.responseHeaders })
      return
    }
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.twilio.com; media-src 'self' blob:; img-src 'self' data:; font-src 'self' data:;",
        ],
      },
    })
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html')).catch((err) => logError('LOADFILE', err))
  }

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
}

app.on('second-instance', (_event, argv) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.show()
    mainWindow.focus()
    const deepLink = argv.find((a) => a.startsWith(`${PROTOCOL}://`))
    if (deepLink) handleDeepLink(deepLink)
  }
})

if (process.defaultApp && process.argv.length >= 2) {
  app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [path.resolve(process.argv[1])])
} else {
  app.setAsDefaultProtocolClient(PROTOCOL)
}

app.whenReady().then(() => {
  logError('STARTUP', new Error('app started'))

  try { registerIpcHandlers() } catch (err) { logError('IPC_HANDLERS', err) }
  try { registerNotificationHandler() } catch (err) { logError('NOTIFICATION', err) }
  try { registerDialogHandlers() } catch (err) { logError('DIALOG', err) }
  try { createWindow() } catch (err) { logError('CREATE_WINDOW', err); return }
  try { createTray() } catch (err) { logError('CREATE_TRAY', err) }
  try { registerGlobalShortcuts() } catch (err) { logError('SHORTCUTS', err) }

  if (!isDev && mainWindow) {
    setupAutoUpdater(mainWindow)
  }

  const deepLink = process.argv.find((a) => a.startsWith(`${PROTOCOL}://`))
  if (deepLink) handleDeepLink(deepLink)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
}).catch((err) => logError('WHEN_READY', err))

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('open-url', (_event, url) => {
  if (url.startsWith(`${PROTOCOL}://`)) {
    handleDeepLink(url)
  }
})
