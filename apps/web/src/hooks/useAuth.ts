import { useState, useEffect, useCallback } from 'react'
import { db, DEFAULT_SETTINGS } from '@/lib/db'
import type { LocalProfile } from '@/types/profile'

const ACTIVE_PROFILE_KEY = 'worship_piano_active_profile'

export function useAuth() {
  const [user, setUser] = useState<LocalProfile | null>(null)
  const [profiles, setProfiles] = useState<LocalProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshProfiles = useCallback(async () => {
    const all = await db.users.orderBy('created_at').toArray()
    setProfiles(all)
  }, [])

  useEffect(() => {
    const init = async () => {
      await db.seedIfEmpty()
      const activeId = localStorage.getItem(ACTIVE_PROFILE_KEY)
      if (activeId) {
        const profile = await db.users.get(activeId)
        if (profile) {
          setUser(profile)
          await db.users.update(activeId, { last_active: new Date().toISOString() })
        } else {
          localStorage.removeItem(ACTIVE_PROFILE_KEY)
        }
      }
      await refreshProfiles()
      setIsLoading(false)
    }
    init()
  }, [refreshProfiles])

  const createProfile = useCallback(async (display_name: string, pin?: string) => {
    const id = crypto.randomUUID()
    const pin_hash = pin ? await hashPin(pin) : null
    const profile: LocalProfile = {
      id,
      display_name,
      pin_hash,
      settings: { ...DEFAULT_SETTINGS },
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString(),
    }
    await db.users.add(profile)
    localStorage.setItem(ACTIVE_PROFILE_KEY, id)
    setUser(profile)
    await refreshProfiles()
    return profile
  }, [refreshProfiles])

  const login = useCallback(async (profileId: string, pin?: string) => {
    const profile = await db.users.get(profileId)
    if (!profile) throw new Error('Perfil no encontrado')

    if (profile.pin_hash) {
      if (!pin) throw new Error('PIN requerido')
      const hash = await hashPin(pin)
      if (hash !== profile.pin_hash) throw new Error('PIN incorrecto')
    }

    await db.users.update(profileId, { last_active: new Date().toISOString() })
    localStorage.setItem(ACTIVE_PROFILE_KEY, profileId)
    setUser(profile)
  }, [])

  const logout = useCallback(async () => {
    localStorage.removeItem(ACTIVE_PROFILE_KEY)
    setUser(null)
  }, [])

  const deleteProfile = useCallback(async (profileId: string) => {
    await db.practice_sessions.where('user_id').equals(profileId).delete()
    await db.ear_training_results.where('user_id').equals(profileId).delete()
    await db.users.delete(profileId)
    if (user?.id === profileId) {
      localStorage.removeItem(ACTIVE_PROFILE_KEY)
      setUser(null)
    }
    await refreshProfiles()
  }, [user, refreshProfiles])

  const updateProfileName = useCallback(async (name: string) => {
    if (!user) return
    await db.users.update(user.id, { display_name: name })
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

async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin + 'worship-piano-salt')
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}
