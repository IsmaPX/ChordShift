import { useAuth } from '@/hooks/useAuth'
import { Navigate, useLocation } from 'react-router'

interface RequireAuthProps {
  children: React.ReactNode
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}