import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Using demo mode.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Type definitions for Supabase auth
export type AuthUser = {
  id: string
  email: string
  display_name: string | null
  settings: {
    tempo_bpm: number
    language: string
    notifications_enabled: boolean
    feedback_concept: 'pulse' | 'bar' | 'rings'
    xp: number
  }
}