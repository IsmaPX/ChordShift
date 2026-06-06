/**
 * Re-exports de la capa de API.
 */

export { apiClient, ApiError, API_BASE_URL } from './client';
export { tokenStore, type AuthUser } from './tokenStore';
export type {
  ApiUser,
  AuthResponse,
  MeResponse,
  SongsListResponse,
  SongResponse,
  SessionsListResponse,
  SessionResponse,
  UserStatsResponse,
  CatalogStylesResponse,
  CatalogTipsResponse,
} from './types';

export { ApiAuthService } from './ApiAuthService';
export { ApiSongRepository } from './ApiSongRepository';
export { ApiPracticeSessionRepository } from './ApiPracticeSessionRepository';
export { ApiSettingsRepository } from './ApiSettingsRepository';
export { ApiStyleRepository } from './ApiStyleRepository';
export { ApiTipRepository } from './ApiTipRepository';
export { ApiEarTrainingRepository } from './ApiEarTrainingRepository';
