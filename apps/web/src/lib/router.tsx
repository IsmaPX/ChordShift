import { lazy, Suspense } from 'react'
import { createBrowserRouter, createHashRouter } from 'react-router'
import { AppLayout } from '../app/layout'
import { RootLayout } from '../layouts/RootLayout'
import { LandingPage } from '../app/page'

// Lazy-load para páginas no críticas (reduces bundle inicial ~30-40%)
const LoginPage = lazy(() => import('../app/(auth)/login/page').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('../app/(auth)/register/page').then(m => ({ default: m.RegisterPage })))
const PracticePage = lazy(() => import('../app/(app)/practice/page').then(m => ({ default: m.PracticePage })))
const PracticePlayerPage = lazy(() => import('../app/(app)/practice/[songId]/page').then(m => ({ default: m.PracticePlayerPage })))
const EarTrainingPage = lazy(() => import('../app/(app)/ear-training/page').then(m => ({ default: m.EarTrainingPage })))
const EncyclopediaPage = lazy(() => import('../app/(app)/encyclopedia/page').then(m => ({ default: m.EncyclopediaPage })))
const SettingsPage = lazy(() => import('../app/(app)/settings/page').then(m => ({ default: m.SettingsPage })))
const LeaderboardPage = lazy(() => import('../app/(app)/leaderboard/page').then(m => ({ default: m.LeaderboardPage })))
const SharedPage = lazy(() => import('../app/(app)/shared/page').then(m => ({ default: m.SharedPage })))
const SyncPage = lazy(() => import('../app/(app)/sync/page').then(m => ({ default: m.SyncPage })))
const LiveSessionPage = lazy(() => import('../app/(app)/live/[songId]/page').then(m => ({ default: m.LiveSessionPage })))
const JoinPage = lazy(() => import('../app/join/page').then(m => ({ default: m.JoinPage })))
const EffectsDemoPage = lazy(() => import('../app/(demo)/effects/page').then(m => ({ default: m.EffectsDemoPage })))

const isElectron = import.meta.env.VITE_ELECTRON_BUILD === 'true'
const createRouter = isElectron ? createHashRouter : createBrowserRouter

/** Fallback de carga para Suspense. */
function PageLoadingFallback() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-bg-primary">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-2 border-accent/20" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-t-accent border-transparent" />
      </div>
    </div>
  )
}

export const router = createRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <LandingPage />,
      },
      {
        path: '/login',
        element: (
          <Suspense fallback={<PageLoadingFallback />}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: '/register',
        element: (
          <Suspense fallback={<PageLoadingFallback />}>
            <RegisterPage />
          </Suspense>
        ),
      },
      {
        path: '/join',
        element: (
          <Suspense fallback={<PageLoadingFallback />}>
            <JoinPage />
          </Suspense>
        ),
      },
      {
        element: <AppLayout />,
        children: [
          {
            path: '/practice',
            element: (
              <Suspense fallback={<PageLoadingFallback />}>
                <PracticePage />
              </Suspense>
            ),
          },
          {
            path: '/practice/:songId',
            element: (
              <Suspense fallback={<PageLoadingFallback />}>
                <PracticePlayerPage />
              </Suspense>
            ),
          },
          {
            path: '/ear-training',
            element: (
              <Suspense fallback={<PageLoadingFallback />}>
                <EarTrainingPage />
              </Suspense>
            ),
          },
          {
            path: '/encyclopedia',
            element: (
              <Suspense fallback={<PageLoadingFallback />}>
                <EncyclopediaPage />
              </Suspense>
            ),
          },
          {
            path: '/settings',
            element: (
              <Suspense fallback={<PageLoadingFallback />}>
                <SettingsPage />
              </Suspense>
            ),
          },
          {
            path: '/leaderboard',
            element: (
              <Suspense fallback={<PageLoadingFallback />}>
                <LeaderboardPage />
              </Suspense>
            ),
          },
          {
            path: '/shared',
            element: (
              <Suspense fallback={<PageLoadingFallback />}>
                <SharedPage />
              </Suspense>
            ),
          },
          {
            path: '/sync',
            element: (
              <Suspense fallback={<PageLoadingFallback />}>
                <SyncPage />
              </Suspense>
            ),
          },
          {
            path: '/live/:songId',
            element: (
              <Suspense fallback={<PageLoadingFallback />}>
                <LiveSessionPage />
              </Suspense>
            ),
          },
          {
            path: '/demo/effects',
            element: (
              <Suspense fallback={<PageLoadingFallback />}>
                <EffectsDemoPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
])