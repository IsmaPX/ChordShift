import { createBrowserRouter } from 'react-router'
import { AppLayout } from '../app/layout'
import { LoginPage } from '../app/(auth)/login/page'
import { RegisterPage } from '../app/(auth)/register/page'
import { PracticePage } from '../app/(app)/practice/page'
import { PracticePlayerPage } from '../app/(app)/practice/[songId]/page'
import { EarTrainingPage } from '../app/(app)/ear-training/page'
import { EncyclopediaPage } from '../app/(app)/encyclopedia/page'
import { SettingsPage } from '../app/(app)/settings/page'
import { LandingPage } from '../app/page'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: '/practice',
        element: <PracticePage />,
      },
      {
        path: '/practice/:songId',
        element: <PracticePlayerPage />,
      },
      {
        path: '/ear-training',
        element: <EarTrainingPage />,
      },
      {
        path: '/encyclopedia',
        element: <EncyclopediaPage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
    ],
  },
])