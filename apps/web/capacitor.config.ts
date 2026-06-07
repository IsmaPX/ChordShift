import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chordshift.app',
  appName: 'ChordShift',
  webDir: 'dist',
  android: {
    // Directorio donde Capacitor genera el proyecto Android nativo.
    // Por defecto: android/
  },
  // Permite usar http://localhost:5173 en dev (vite dev server).
  // En producción sólo carga file:// del bundle.
  server: {
    androidScheme: 'https',
  },
};

export default config;
