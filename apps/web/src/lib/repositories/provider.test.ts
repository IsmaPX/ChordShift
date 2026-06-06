/**
 * Tests del provider selector.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { repositoryProvider, useApi, switchToApi, switchToDexie } from '../provider';
import { ApiAuthService } from '@/lib/api/ApiAuthService';
import { ApiSongRepository } from '@/lib/api/ApiSongRepository';
import { AuthService } from '@/services/AuthService';
import { SongRepository } from '../SongRepository';

describe('repositoryProvider', () => {
  beforeEach(() => {
    localStorage.removeItem('worship_piano_backend_mode');
  });

  it('default mode es dexie', () => {
    expect(repositoryProvider.getMode()).toBe('dexie');
    expect(useApi()).toBe(false);
  });

  it('switchToApi cambia el modo a api', () => {
    switchToApi();
    expect(repositoryProvider.getMode()).toBe('api');
    expect(localStorage.getItem('worship_piano_backend_mode')).toBe('api');
  });

  it('switchToDexie cambia el modo a dexie', () => {
    switchToApi();
    switchToDexie();
    expect(repositoryProvider.getMode()).toBe('dexie');
  });

  it('getAuthService devuelve ApiAuthService en modo api', () => {
    switchToApi();
    expect(repositoryProvider.getAuthService()).toBeInstanceOf(ApiAuthService);
  });

  it('getAuthService devuelve AuthService en modo dexie', () => {
    expect(repositoryProvider.getAuthService()).toBeInstanceOf(AuthService);
  });

  it('getSongRepository devuelve ApiSongRepository en modo api', () => {
    switchToApi();
    expect(repositoryProvider.getSongRepository()).toBeInstanceOf(ApiSongRepository);
  });

  it('getSongRepository devuelve SongRepository en modo dexie', () => {
    expect(repositoryProvider.getSongRepository()).toBeInstanceOf(SongRepository);
  });
});
