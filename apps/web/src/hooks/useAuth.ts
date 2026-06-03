import { useState, useEffect, useCallback } from 'react'
import { authService } from '@/services/AuthService'
import { db } from '@/lib/db'
import { practiceSessionRepository } from '@/lib/repositories/SessionRepository'
import { earTrainingRepository } from '@/lib/repositories/EarTrainingRepository'
import type { LocalProfile } from '@/types/profile'

export function useAuth() {
  const [user, setUser] = useState<LocalProfile | null>(null)
  const [profiles, setProfiles] = useState<LocalProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshProfiles = useCallback(async () => {
    const all = await authService.getAllProfiles()
    setProfiles(all)
  }, [])

  useEffect(() => {
    const init = async () => {
      const [activeUser] = await Promise.all([
        authService.getActiveUser(),
        refreshProfiles(),
      ])
      setUser(activeUser)
      setIsLoading(false)
      void db.seedIfEmpty()
    }
    init()
  }, [refreshProfiles])

  const createProfile = useCallback(async (display_name: string, pin?: string) => {
    const profile = await authService.createProfile(display_name, pin)
    setUser(profile)
    await refreshProfiles()
    return profile
  }, [refreshProfiles])

  const login = useCallback(async (profileId: string, pin?: string) => {
    const profile = await authService.login(profileId, pin)
    setUser(profile)
  }, [])

  const logout = useCallback(async () => {
    authService.logout()
    setUser(null)
  }, [])

  const deleteProfile = useCallback(async (profileId: string) => {
    await practiceSessionRepository.deleteByUserId(profileId)
    await earTrainingRepository.deleteByUserId(profileId)
    await authService.deleteProfile(profileId)
    if (user?.id === profileId) {
      setUser(null)
    }
    await refreshProfiles()
  }, [user, refreshProfiles])

  const updateProfileName = useCallback(async (name: string) => {
    if (!user) return
    await authService.updateProfileName(user.id, name)
    setUser(prev => prev ? { ...prev, display_name: name } : null)
  }, [user])

  return {
    user,
    profiles,
    isLoading,
    isAuthenticated: !!user,
    createProfile,
    login,
    logout,
    deleteProfile,
    updateProfileName,
    refreshProfiles,
  }
}