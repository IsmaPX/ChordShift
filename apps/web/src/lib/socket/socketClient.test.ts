/**
 * Tests del cliente socket (frontend).
 *
 * Estrategia: mockear socket.io-client para no requerir servidor real.
 * Validamos la lógica de reconexión, queue de comandos offline, y
 * emisión de eventos.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mockear socket.io-client
const mockSocket = {
  connected: false,
  disconnected: true,
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
  removeAllListeners: vi.fn(),
  io: { opts: {} },
};

const mockIoFn = vi.fn(() => mockSocket);

vi.mock('socket.io-client', () => ({
  io: (...args: unknown[]) => mockIoFn(...args),
}));

// Mockear el token store
const mockToken = vi.hoisted(() => {
  let token: string | null = 'test-token';
  return {
    getToken: vi.fn(() => token),
    setToken: (t: string | null) => {
      token = t;
    },
  };
});

vi.mock('../api/tokenStore', () => ({
  tokenStore: mockToken,
}));

vi.mock('../api/client', () => ({
  API_BASE_URL: 'http://localhost:3001',
}));

import { __resetSocketClientForTests, getSocketClient } from './socketClient';

describe('SocketClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket.connected = false;
    mockSocket.disconnected = true;
    mockSocket.on.mockReset();
    mockSocket.emit.mockReset();
    mockSocket.disconnect.mockReset();
    mockSocket.removeAllListeners.mockReset();
    mockIoFn.mockClear();
    mockToken.setToken('test-token');
    __resetSocketClientForTests();
  });

  it('no conecta si no hay token', () => {
    mockToken.setToken(null);
    const client = getSocketClient();
    client.connect();
    expect(mockIoFn).not.toHaveBeenCalled();
    expect(client.getStatus()).toBe('idle');
  });

  it('crea socket al conectar con token', () => {
    const client = getSocketClient();
    client.connect();
    expect(mockIoFn).toHaveBeenCalledWith(
      'http://localhost:3001',
      expect.objectContaining({
        auth: { token: 'test-token' },
      }),
    );
  });

  it('marca como connected al recibir evento connect', () => {
    const client = getSocketClient();
    client.connect();

    // Simular callback de connect
    const onConnect = mockSocket.on.mock.calls.find(c => c[0] === 'connect')?.[1];
    expect(onConnect).toBeDefined();
    onConnect();

    expect(client.isConnected()).toBe(true);
    expect(client.getStatus()).toBe('connected');
  });

  it('encola comandos si no está conectado y los flush al conectar', () => {
    const client = getSocketClient();
    client.connect();

    // Hacer join ANTES de conectar
    mockSocket.connected = false;
    const joinPromise = client.joinSession('sess-1');

    // El comando debe estar encolado
    expect(mockSocket.emit).not.toHaveBeenCalled();

    // Simular conexión
    mockSocket.connected = true;
    const onConnect = mockSocket.on.mock.calls.find(c => c[0] === 'connect')?.[1];
    onConnect();

    // Ahora debe haberse emitido
    expect(mockSocket.emit).toHaveBeenCalledWith(
      'session:join',
      'sess-1',
      expect.any(Function),
    );
  });

  it('desconecta y limpia el socket', () => {
    const client = getSocketClient();
    client.connect();

    // Simular connect
    const onConnect = mockSocket.on.mock.calls.find(c => c[0] === 'connect')?.[1];
    onConnect();

    client.disconnect();
    expect(mockSocket.removeAllListeners).toHaveBeenCalled();
    expect(mockSocket.disconnect).toHaveBeenCalled();
    expect(client.getStatus()).toBe('idle');
  });

  it('subscribe a leaderboard emite el evento correcto', () => {
    const client = getSocketClient();
    client.connect();
    mockSocket.connected = true;

    client.subscribeLeaderboard('total_minutes', 'weekly');
    expect(mockSocket.emit).toHaveBeenCalledWith('leaderboard:subscribe', {
      category: 'total_minutes',
      period: 'weekly',
    });
  });

  it('reportBeat emite el payload correcto', () => {
    const client = getSocketClient();
    client.connect();
    mockSocket.connected = true;

    client.reportBeat('sess-1', 42);
    expect(mockSocket.emit).toHaveBeenCalledWith('session:beat-report', {
      sessionId: 'sess-1',
      beat: 42,
    });
  });

  it('suscribe a cambios de estado', async () => {
    const client = getSocketClient();
    client.connect();

    const handler = vi.fn();
    const unsubscribe = client.onStatusChange(handler);

    // Esperar al microtask que invoca el handler con el estado actual
    await new Promise(r => queueMicrotask(r));
    expect(handler).toHaveBeenCalledWith('connecting');

    // Simular connect
    const onConnect = mockSocket.on.mock.calls.find(c => c[0] === 'connect')?.[1];
    onConnect();
    expect(handler).toHaveBeenCalledWith('connected');

    unsubscribe();
  });
});
