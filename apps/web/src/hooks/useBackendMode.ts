/**
 * Hook de ejemplo: integrar la API en la UI.
 *
 * Antes (Dexie directo):
 *   const { data, isLoading } = useQuery({ queryKey: ['songs'], queryFn: () => songRepository.getAll() })
 *
 * Después (provider-aware, funciona con Dexie o API según config):
 *   import { useBackendMode } from '@/hooks/useBackendMode'
 *   const { data, isLoading } = useQuery({
 *     queryKey: ['songs', mode],
 *     queryFn: () => repositoryProvider.getSongRepository().getAll(),
 *   })
 *
 * Ventajas:
 * - La UI no cambia cuando cambias de Dexie a API
 * - Feature flag de modo persistido en localStorage
 * - Cache de TanStack Query sigue funcionando igual
 */

import { useSyncExternalStore } from 'react';
import { repositoryProvider, type BackendMode } from '@/lib/repositories/provider';

/**
 * Suscribe al modo actual del provider (dexie | api).
 * Re-renderiza cuando cambia vía switchToApi() / switchToDexie().
 */
export function useBackendMode(): { mode: BackendMode; isApi: boolean } {
  const mode = useSyncExternalStore(
    (callback) => repositoryProvider.subscribe(callback),
    () => repositoryProvider.getMode(),
    () => 'dexie' as const,
  );

  return { mode, isApi: mode === 'api' };
}
