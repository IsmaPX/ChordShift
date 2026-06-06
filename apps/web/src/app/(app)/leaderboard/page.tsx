/**
 * Página de Leaderboard: ranking global de práctica y ear training.
 *
 * Ejemplo de consumo de los hooks de TanStack Query sobre los endpoints API.
 * Solo funciona con backend en línea (modo `api` en repositoryProvider).
 */

import { useState } from 'react';
import { Trophy, Loader2, Music2, Brain, Clock } from 'lucide-react';
import {
  useLeaderboard,
  type LeaderboardCategory,
  type LeaderboardPeriod,
} from '@/hooks/useApiFeatures';
import { useUserStats } from '@/hooks/useApiFeatures';
import { useBackendMode } from '@/hooks/useBackendMode';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const CATEGORIES: Array<{ value: LeaderboardCategory; label: string; icon: typeof Music2 }> = [
  { value: 'total_minutes', label: 'Minutos practicados', icon: Clock },
  { value: 'sessions_completed', label: 'Sesiones completadas', icon: Music2 },
  { value: 'ear_training_accuracy', label: 'Precisión ear training', icon: Brain },
];

const PERIODS: Array<{ value: LeaderboardPeriod; label: string }> = [
  { value: 'daily', label: 'Hoy' },
  { value: 'weekly', label: 'Semana' },
  { value: 'monthly', label: 'Mes' },
  { value: 'all_time', label: 'Histórico' },
];

export function LeaderboardPage() {
  const { t } = useTranslation();
  const { isApi } = useBackendMode();
  const [category, setCategory] = useState<LeaderboardCategory>('total_minutes');
  const [period, setPeriod] = useState<LeaderboardPeriod>('all_time');

  const { data: leaderboard, isLoading } = useLeaderboard(category, period);
  const { data: myStats } = useUserStats();

  if (!isApi) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <Trophy className="mx-auto mb-4 text-text-secondary" size={48} />
        <h2 className="text-2xl font-semibold mb-2">Leaderboard</h2>
        <p className="text-text-secondary">
          Esta función requiere activar el modo API. Define <code className="text-accent">VITE_API_URL</code> y reinicia el dev server.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Trophy className="text-anime-glow" /> Leaderboard
        </h1>
        <p className="text-text-secondary mt-1">Compite con otros músicos de adoración</p>
      </header>

      {myStats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg-card border border-border rounded-2xl p-4"
        >
          <h3 className="text-sm font-medium text-text-secondary mb-2">Tu posición</h3>
          {leaderboard?.myRank ? (
            <p className="text-2xl font-bold text-accent">#{leaderboard.myRank}</p>
          ) : (
            <p className="text-text-secondary">Practica para entrar al ranking</p>
          )}
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold">{myStats.totalMinutes}</p>
              <p className="text-xs text-text-secondary">Minutos</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{myStats.completedSessions}</p>
              <p className="text-xs text-text-secondary">Sesiones</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{myStats.uniqueDays}</p>
              <p className="text-xs text-text-secondary">Días</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setCategory(value)}
            className={`px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${
              category === value
                ? 'bg-accent text-white border-accent'
                : 'border-border text-text-secondary hover:border-accent/50'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {PERIODS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setPeriod(value)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              period === value
                ? 'bg-accent-light text-accent'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-accent" size={32} />
        </div>
      ) : (
        <ol className="space-y-2">
          {leaderboard?.entries.map((entry) => (
            <motion.li
              key={entry.userId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: entry.rank * 0.02 }}
              className={`bg-bg-card border border-border rounded-xl p-4 flex items-center gap-4 ${
                entry.rank <= 3 ? 'border-accent/50' : ''
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  entry.rank === 1
                    ? 'bg-anime-glow text-white'
                    : entry.rank === 2
                      ? 'bg-anime-blue text-white'
                      : entry.rank === 3
                        ? 'bg-anime-purple text-white'
                        : 'bg-bg-secondary text-text-secondary'
                }`}
              >
                {entry.rank}
              </div>
              <div className="flex-1">
                <p className="font-medium">{entry.displayName ?? 'Anónimo'}</p>
              </div>
              <p className="text-xl font-bold text-accent">
                {category === 'ear_training_accuracy' ? `${entry.score}%` : entry.score}
              </p>
            </motion.li>
          ))}
        </ol>
      )}

      {leaderboard?.entries.length === 0 && (
        <p className="text-center text-text-secondary py-8">
          {t('common.noData') ?? 'Sin datos en este período'}
        </p>
      )}
    </div>
  );
}
