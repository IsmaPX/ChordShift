export type RepositoryType = 'dexie' | 'supabase'

export interface RepositoryConfig {
  userRepository: RepositoryType
}

const config: RepositoryConfig = {
  userRepository: 'dexie',
}

export function setRepositoryConfig(newConfig: Partial<RepositoryConfig>) {
  Object.assign(config, newConfig)
}

export function getRepositoryType(): RepositoryType {
  return config.userRepository
}