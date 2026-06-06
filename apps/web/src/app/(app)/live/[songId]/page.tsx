/**
 * Página de práctica en vivo.
 *
 * Flow:
 * 1. El usuario abre /live/:songId
 * 2. Si no hay sesión activa, crea una (POST /api/live-sessions)
 * 3. Se une al canal de Socket.IO correspondiente
 * 4. Como host, reporta su beat usando un loop de rAF (60fps ideal)
 *    para máxima fluidez visual y latencia mínima
 * 5. Los participantes ven el beat con su propio cálculo de drift
 *    (diferencia entre el beat local y el del host)
 *
 * **Drift / Latencia**:
 * - El host envía el beat actual + `emittedAtMs` (timestamp del server)
 * - El cliente receptor compara `Date.now() - emittedAtMs` para estimar
 *   el retardo de transporte
 * - También proyectamos el beat futuro con `(bpm / 60) * elapsedMs / 1000`
 *   para mantener la posición sincronizada entre frames
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Music,
  Users,
  Wifi,
  WifiOff,
  Pause,
  Play,
  Square,
  RefreshCw,
  Activity,
  Clock,
  QrCode as QrIcon,
  X,
} from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import { useLiveSession, useSocketStatus } from '@/lib/socket/useSocket'
import { useAuth } from '@/hooks/useAuth'
import { useGenerateQr } from '@/hooks/useQrToken'
import { QrCode } from '@/components/ui/QrCode'
import { cn } from 'ui'

type LiveSessionCreateResponse = {
  state: {
    sessionId: string
    songId: string
    hostId: string
    bpm: number
    currentBeat: number
    status: 'active' | 'paused' | 'ended'
    startedAtMs: number
    participants: Array<{ id: string; email: string; displayName: string | null }>
  }
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Calcula el beat actual estimado en el cliente.
 *
 * Combina:
 * - El último `currentBeat` recibido del host
 * - El timestamp `emittedAtMs` del server
 * - El BPM y el tiempo transcurrido desde la emisión
 */
function estimateLocalBeat(
  lastBeat: number,
  emittedAtMs: number,
  bpm: number,
): { beat: number; ageMs: number } {
  const now = Date.now()
  const ageMs = now - emittedAtMs
  const beatsPerMs = bpm / 60_000
  const projectedBeat = lastBeat + ageMs * beatsPerMs
  return { beat: projectedBeat, ageMs }
}

export function LiveSessionPage() {
  const { songId } = useParams<{ songId: string }>()
  const { user } = useAuth()
  const socketStatus = useSocketStatus()

  // Crear sesión
  const sessionQuery = useQuery({
    queryKey: ['live-session', songId],
    queryFn: async () => {
      if (!songId) throw new Error('songId requerido')
      const result = await apiClient.post<LiveSessionCreateResponse>('/api/live-sessions', {
        songId,
      })
      return result
    },
    enabled: !!songId && !!user,
    staleTime: Infinity,
    retry: 1,
  })

  const sessionId = sessionQuery.data?.state.sessionId ?? null
  const isHost = sessionQuery.data?.state.hostId === user?.id

  // Hook principal
  const { state, isJoining, error, pause, resume, end, reportBeat, reconnect } = useLiveSession({
    sessionId,
    isHost,
  });

  // Métricas en tiempo real: beat proyectado, drift, latencia
  const [metrics, setMetrics] = useState({ beat: 0, ageMs: 0, transportLatencyMs: 0 })

  // Refs para el rAF loop
  const rafRef = useRef<number | null>(null)
  const lastReportRef = useRef({ beat: 0, atMs: 0 })
  const lastBeatFromServerRef = useRef({ beat: 0, emittedAtMs: 0 })

  // Cuando llega un nuevo beat del server, lo guardamos para proyección
  useEffect(() => {
    if (state) {
      lastBeatFromServerRef.current = {
        beat: state.currentBeat,
        emittedAtMs: Date.now(),
      }
    }
  }, [state?.currentBeat])

  // ------------------------------------------------------------------
  // Host: loop de rAF que envía beats al server
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!isHost || !state || state.status !== 'active') {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      return
    }

    const bpm = state.bpm
    const msPerBeat = 60_000 / bpm

    let lastFrameTime = performance.now()
    let localBeat = state.currentBeat
    const startTime = lastFrameTime

    const tick = (now: number) => {
      const dt = now - lastFrameTime
      lastFrameTime = now

      // Avanza el beat según tiempo real
      localBeat += dt / msPerBeat

      // Reportar al server cada ~100ms (10fps es suficiente para
      // sincronización visual; 60fps sería overkill de tráfico)
      const timeSinceLastReport = now - lastReportRef.current.atMs
      if (timeSinceLastReport >= 100) {
        const beatToReport = Math.floor(localBeat)
        if (beatToReport !== lastReportRef.current.beat) {
          reportBeat(beatToReport)
          lastReportRef.current = { beat: beatToReport, atMs: now }
        }
      }

      // Actualizar UI (60fps)
      setMetrics({
        beat: localBeat,
        ageMs: 0,
        transportLatencyMs: 0,
      })

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [isHost, state, reportBeat])

  // ------------------------------------------------------------------
  // Participante: loop de rAF para estimar el beat local con drift
  // ------------------------------------------------------------------
  useEffect(() => {
    if (isHost || !state || state.status !== 'active') {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      return
    }

    const tick = () => {
      const { beat, emittedAtMs } = lastBeatFromServerRef.current
      if (emittedAtMs > 0) {
        const estimate = estimateLocalBeat(beat, emittedAtMs, state.bpm)
        setMetrics({
          beat: estimate.beat,
          ageMs: estimate.ageMs,
          transportLatencyMs: estimate.ageMs,
        })
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [isHost, state])

  // Tiempo total transcurrido
  const [elapsedMs, setElapsedMs] = useState(0)
  useEffect(() => {
    if (!state) return
    const tick = () => setElapsedMs(Date.now() - state.startedAtMs)
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [state])

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-text-secondary">Inicia sesión para crear una sesión en vivo</p>
      </div>
    )
  }

  if (sessionQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-text-secondary">Creando sesión en vivo...</p>
      </div>
    )
  }

  if (sessionQuery.error || !sessionQuery.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-danger">No se pudo crear la sesión</p>
        <button
          onClick={() => sessionQuery.refetch()}
          className="px-4 py-2 rounded-lg border border-border hover:border-accent"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gradient-anime">Sesión en vivo</h1>
          <p className="text-text-secondary text-sm mt-1">Song: {songId}</p>
        </div>
        <ConnectionBadge status={socketStatus} />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
          {error}
        </div>
      )}

      {/* Métricas en tiempo real */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="BPM" value={String(state?.bpm ?? '—')} />
        <StatCard
          label="Beat"
          value={metrics.beat.toFixed(1)}
          highlight={isHost ? 'host' : 'participant'}
        />
        <StatCard label="Tiempo" value={formatTime(elapsedMs)} />
        <StatCard
          label="Drift"
          value={
            isHost
              ? '—'
              : metrics.transportLatencyMs > 0
                ? `${Math.round(metrics.transportLatencyMs)}ms`
                : '—'
          }
          warn={metrics.transportLatencyMs > 200}
        />
      </div>

      {/* Participantes */}
      <div className="card p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-accent" />
          <span className="font-semibold">
            Participantes ({state?.participants.length ?? 0})
          </span>
        </div>
        <ul className="space-y-1">
          {state?.participants.map(p => (
            <li
              key={p.id}
              className="text-sm text-text-secondary flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-accent" />
              {p.displayName ?? p.email}
              {p.id === user.id && (
                <span className="text-xs text-accent">(tú)</span>
              )}
              {p.id === state?.hostId && (
                <span className="text-xs text-anime-pink">(host)</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Controles del host */}
      {isHost && (
        <div className="card p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Music className="w-4 h-4 text-anime-blue" />
            <span className="font-semibold">Controles de host</span>
            <span className="ml-auto text-xs text-text-secondary">
              Reportando a {lastReportRef.current.beat > 0 ? '10fps' : 'inactivo'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {state?.status === 'active' ? (
              <button
                onClick={() => void pause()}
                className="px-4 py-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/30 flex items-center gap-2"
              >
                <Pause className="w-4 h-4" /> Pausar
              </button>
            ) : (
              <button
                onClick={() => void resume()}
                className="px-4 py-2 rounded-lg bg-accent/20 border border-accent/30 text-accent hover:bg-accent/30 flex items-center gap-2"
              >
                <Play className="w-4 h-4" /> Reanudar
              </button>
            )}
            <button
              onClick={() => void end()}
              className="px-4 py-2 rounded-lg bg-danger/20 border border-danger/30 text-danger hover:bg-danger/30 flex items-center gap-2"
            >
              <Square className="w-4 h-4" /> Finalizar
            </button>
            <button
              onClick={() => void reconnect()}
              disabled={isJoining}
              className="px-4 py-2 rounded-lg border border-border hover:border-accent flex items-center gap-2"
            >
              <RefreshCw className={cn('w-4 h-4', isJoining && 'animate-spin')} /> Reconectar
            </button>
          </div>
        </div>
      )}

      {/* ID de sesión (compartir) */}
      <div className="card p-4">
        <p className="text-xs text-text-secondary mb-2">ID de sesión (compartir):</p>
        <code className="block bg-bg-primary p-2 rounded text-xs break-all">{sessionId}</code>
      </div>
    </div>
  )
}

function QrPanel({ sessionId }: { sessionId: string }) {
  const [open, setOpen] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const generateQr = useGenerateQr(sessionId)

  // Generar QR al abrir y countdown para refrescar cada 5 min
  useEffect(() => {
    if (!open) return
    if (countdown === 0) {
      generateQr.mutate(undefined, { onSuccess: () => setCountdown(300) })
    }
    const id = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 text-sm"
      >
        <QrIcon className="w-4 h-4" />
        Mostrar QR para invitados
      </button>
    )
  }

  const qr = generateQr.data
  const minutes = Math.floor(countdown / 60)
  const seconds = countdown % 60

  return (
    <div className="border-t border-border pt-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-text-secondary flex items-center gap-1">
          <QrIcon className="w-3 h-3" />
          Escanea para unirte sin login
        </p>
        <button
          onClick={() => {
            setOpen(false)
            setCountdown(0)
          }}
          className="text-text-secondary hover:text-text-primary"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-col items-center gap-2 p-4 bg-bg-primary rounded-lg">
        {qr ? (
          <>
            <QrCode value={qr.url} size={200} />
            <p className="text-xs text-text-secondary">
              Expira en {minutes}:{seconds.toString().padStart(2, '0')}
            </p>
          </>
        ) : (
          <p className="text-text-secondary text-sm">Generando QR...</p>
        )}
        {generateQr.isError && (
          <p className="text-danger text-xs">Error al generar QR</p>
        )}
        <button
          onClick={() => {
            setCountdown(0)
            generateQr.mutate(undefined, { onSuccess: () => setCountdown(300) })
          }}
          className="text-xs text-accent hover:underline"
        >
          Renovar QR
        </button>
      </div>
    </div>
  )
}

function ConnectionBadge({ status }: { status: ReturnType<typeof useSocketStatus> }) {
  const config = {
    connected: {
      color: 'text-accent',
      bg: 'bg-accent/10',
      border: 'border-accent/30',
      icon: Wifi,
      label: 'Conectado',
    },
    connecting: {
      color: 'text-yellow-300',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      icon: RefreshCw,
      label: 'Conectando',
    },
    disconnected: {
      color: 'text-text-secondary',
      bg: 'bg-bg-secondary',
      border: 'border-border',
      icon: WifiOff,
      label: 'Desconectado',
    },
    error: {
      color: 'text-danger',
      bg: 'bg-danger/10',
      border: 'border-danger/30',
      icon: WifiOff,
      label: 'Error',
    },
    idle: {
      color: 'text-text-secondary',
      bg: 'bg-bg-secondary',
      border: 'border-border',
      icon: WifiOff,
      label: 'Inactivo',
    },
  }[status]

  const Icon = config.icon
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs',
        config.color,
        config.bg,
        config.border,
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </div>
  )
}

function StatCard({
  label,
  value,
  highlight,
  warn,
}: {
  label: string
  value: string
  highlight?: 'host' | 'participant'
  warn?: boolean
}) {
  return (
    <div className="card p-4">
      <p className="text-xs text-text-secondary uppercase tracking-wide flex items-center gap-1">
        {label}
        {highlight === 'host' && <Activity className="w-3 h-3" />}
      </p>
      <p
        className={cn(
          'text-2xl font-bold mt-1',
          warn ? 'text-yellow-300' : 'text-accent',
          highlight === 'host' && 'text-gradient-green',
        )}
      >
        {value}
      </p>
    </div>
  )
}