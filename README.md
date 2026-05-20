# ChordShift / Worship Piano App

Sistema de entrenamiento para músicos de adoración.

## Stack

- **Frontend**: React 19 + Vite + TypeScript
- **Styling**: Tailwind CSS 4
- **Audio**: Tone.js
- **Routing**: React Router
- **Server State**: TanStack Query
- **Backend**: Supabase (Auth + PostgreSQL)
- **Deploy**: Vercel

## Estructura

```
apps/web/                  # Aplicación web principal
├── src/
│   ├── app/              # Pages (routing)
│   ├── components/       # UI components
│   ├── hooks/           # TanStack Query hooks
│   ├── audio/           # Tone.js engine
│   └── lib/             # supabase client
├── supabase/            # Database migrations
└── public/              # PWA assets

packages/
├── ui/                  # Componentes compartidos
├── audio/               # Motor de audio
└── db/                  # Tipos de base de datos
```

## Scripts

```bash
# Instalación
npm install

# Desarrollo
npm run dev

# Build producción
npm run build

# Verificación
npm run lint
npm run typecheck
npm run test
```

## Variables de Entorno

Copiar `.env.example` a `.env` y configurar:

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_ENV=development
```

Para producción, configurar en Vercel Dashboard → Project → Settings → Environment Variables.

## Supabase Setup

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ejecutar migrations: `supabase/migrations/001_schema.sql`
3. Obtener URL y anon key de Settings → API
4. Configurar en Vercel

## CI/CD

GitHub Actions para:
- **PR**: Lint + Typecheck + Tests
- **Merge to main**: Deploy a Vercel production
- **workflow_dispatch**: Build Android APK

## Repositorio

https://github.com/IsmaPX/ChordShift