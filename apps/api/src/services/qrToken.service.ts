/**
 * Servicio de tokens QR efímeros.
 *
 * Permite a un host generar un QR con un token de un solo uso (o de
 * uso limitado) que un participante puede escanear para unirse a una
 * sesión SIN necesidad de tener cuenta / login.
 *
 * El token:
 * - Tiene expiración corta (5 minutos por defecto)
 * - Está ligado a un sessionId específico
 * - Tiene un nonce aleatorio para evitar colisiones
 * - Se almacena en memoria con TTL
 *
 * El participante que escanea el QR:
 * - Llega a /join?qr=<token>
 * - El backend valida el token y emite un JWT "temporal" (5 min)
 *   con el sessionId inyectado en `liveSessionId`
 * - El cliente usa ese JWT para conectar al socket y hacer join
 *
 * Esto evita tener que re-implementar auth para el caso "venir de QR".
 */

import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const QR_TTL_MS = 5 * 60 * 1000; // 5 minutos
export const QR_TOKEN_TTL = '5m'; // JWT temporal tras canjear

type QrEntry = {
  token: string; // nonce aleatorio
  sessionId: string;
  hostId: string;
  createdAt: number;
  expiresAt: number;
  redeemed: boolean;
};

class QrTokenRegistry {
  private readonly entries = new Map<string, QrEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Limpiar tokens expirados cada minuto
    this.cleanupInterval = setInterval(() => this.purgeExpired(), 60_000);
    // No mantener el proceso vivo por esto
    this.cleanupInterval.unref?.();
  }

  /**
   * Genera un nuevo token QR para una sesión.
   * Devuelve el token y la URL completa que el cliente puede codificar.
   */
  create(sessionId: string, hostId: string): { token: string; url: string; expiresAtMs: number } {
    const token = crypto.randomBytes(24).toString('base64url');
    const now = Date.now();
    const entry: QrEntry = {
      token,
      sessionId,
      hostId,
      createdAt: now,
      expiresAt: now + QR_TTL_MS,
      redeemed: false,
    };
    this.entries.set(token, entry);
    return {
      token,
      url: this.buildJoinUrl(token),
      expiresAtMs: entry.expiresAt,
    };
  }

  /**
   * Canjea un token QR. Devuelve el sessionId si es válido, o un error.
   * Marca el token como redeemed para evitar reuso.
   */
  redeem(token: string): { ok: true; sessionId: string; hostId: string } | { ok: false; error: string } {
    const entry = this.entries.get(token);
    if (!entry) return { ok: false, error: 'Token QR no encontrado' };
    if (Date.now() > entry.expiresAt) {
      this.entries.delete(token);
      return { ok: false, error: 'Token QR expirado' };
    }
    if (entry.redeemed) {
      return { ok: false, error: 'Token QR ya utilizado' };
    }
    entry.redeemed = true;
    // Lo mantenemos hasta su expiración natural (no se puede reusar
    // pero sí puede ser re-intentado si el canje falla downstream)
    return { ok: true, sessionId: entry.sessionId, hostId: entry.hostId };
  }

  /**
   * Genera un JWT temporal que el cliente usa para conectar al socket.
   * Incluye el `liveSessionId` en el payload para que el handler de
   * socket pueda auto-join a la sesión correcta.
   */
  issueGuestToken(sessionId: string, hostId: string): string {
    return jwt.sign(
      {
        // guest:true indica al socket que es un usuario anónimo
        guest: true,
        liveSessionId: sessionId,
        // El "userId" para auditoría es el host (no el invitado real)
        // Alternativa: generar un uuid por guest. Vamos con el host
        // para mantener consistencia con la lógica de participantes.
        userId: hostId,
        email: `guest-${crypto.randomBytes(4).toString('hex')}@qr.local`,
      },
      env.JWT_SECRET,
      { expiresIn: QR_TOKEN_TTL },
    );
  }

  /**
   * Verifica un JWT de guest. Devuelve el payload o lanza.
   */
  verifyGuestToken(token: string): { userId: string; liveSessionId: string; email: string } {
    const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload & {
      guest?: boolean;
      liveSessionId?: string;
    };
    if (!payload.guest || !payload.liveSessionId || !payload.userId) {
      throw new Error('Token no es un guest token válido');
    }
    return {
      userId: payload.userId,
      liveSessionId: payload.liveSessionId,
      email: payload.email as string,
    };
  }

  private buildJoinUrl(token: string): string {
    const frontend = env.CORS_ORIGIN.split(',')[0]?.trim() ?? 'http://localhost:5173';
    return `${frontend}/join?qr=${token}`;
  }

  private purgeExpired(): void {
    const now = Date.now();
    for (const [token, entry] of this.entries) {
      if (now > entry.expiresAt) this.entries.delete(token);
    }
  }

  /** Sólo para tests. */
  __resetForTests(): void {
    this.entries.clear();
  }
  /** Sólo para tests. */
  __sizeForTests(): number {
    return this.entries.size;
  }
}

export const qrTokenRegistry = new QrTokenRegistry();
