/**
 * Página de canciones compartidas conmigo.
 */

import { Link } from 'react-router';
import { Users, Music2, Loader2 } from 'lucide-react';
import { useSharedWithMe } from '@/hooks/useApiFeatures';
import { useBackendMode } from '@/hooks/useBackendMode';

export function SharedPage() {
  const { isApi } = useBackendMode();
  const { data, isLoading } = useSharedWithMe();

  if (!isApi) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <Users className="mx-auto mb-4 text-text-secondary" size={48} />
        <h2 className="text-2xl font-semibold mb-2">Canciones compartidas</h2>
        <p className="text-text-secondary">Requiere modo API</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-4">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users className="text-anime-blue" /> Compartidas conmigo
        </h1>
        <p className="text-text-secondary mt-1">
          Canciones que otros músicos de adoración han compartido contigo
        </p>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-accent" size={32} />
        </div>
      ) : data?.shares.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-2xl p-8 text-center">
          <p className="text-text-secondary">
            Nadie ha compartido canciones contigo todavía.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {data?.shares.map((share) => (
            <li
              key={share.id}
              className="bg-bg-card border border-border rounded-xl p-4 flex items-center gap-4"
            >
              <Music2 className="text-accent flex-shrink-0" size={24} />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{share.song?.title}</p>
                <p className="text-sm text-text-secondary truncate">
                  {share.song?.artist ?? 'Sin artista'} · por {share.sharedBy?.displayName ?? share.sharedBy?.email}
                </p>
              </div>
              <Link
                to={`/practice/${share.song?.id}`}
                className="px-3 py-1.5 text-sm bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors"
              >
                Practicar
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
