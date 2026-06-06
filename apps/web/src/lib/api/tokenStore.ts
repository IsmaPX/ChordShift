/**
 * Almacenamiento del token JWT.
 *
 * - Persiste en localStorage entre sesiones.
 * - Mantiene un caché en memoria para evitar lecturas síncronas repetidas.
 * - Permite suscribirse a cambios (útil para react-query y la UI).
 *
 * Nota: la persistencia en localStorage es XSS-vulnerable por diseño — para
 * apps con datos sensibles, considerar cookies HttpOnly en el backend.
 */

const TOKEN_KEY = 'worship_piano_jwt_token';
const USER_KEY = 'worship_piano_auth_user';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
}

type Listener = () => void;

class TokenStore {
  private cachedToken: string | null = null;
  private cachedUser: AuthUser | null = null;
  private listeners = new Set<Listener>();

  constructor() {
    // Lectura lazy al primer acceso
  }

  getToken(): string | null {
    if (this.cachedToken === null && typeof window !== 'undefined') {
      this.cachedToken = localStorage.getItem(TOKEN_KEY);
    }
    return this.cachedToken;
  }

  getUser(): AuthUser | null {
    if (this.cachedUser === null && typeof window !== 'undefined') {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) {
        try {
          this.cachedUser = JSON.parse(raw) as AuthUser;
        } catch {
          this.cachedUser = null;
        }
      }
    }
    return this.cachedUser;
  }

  setAuth(token: string, user: AuthUser): void {
    this.cachedToken = token;
    this.cachedUser = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    this.notify();
  }

  /**
   * Sobrescribe sólo el token (sin tocar el user). Útil para tokens
   * temporales (guest via QR) o refresh de token.
   */
  setToken(token: string): void {
    this.cachedToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
    this.notify();
  }

  clear(): void {
    this.cachedToken = null;
    this.cachedUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    this.notify();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch {
        // Ignore listener errors
      }
    }
  }
}

export const tokenStore = new TokenStore();
