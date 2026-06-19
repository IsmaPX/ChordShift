---
name: audio
description: MUST be loaded before modifying audio engine logic, Tone.js integration, or sound playback in the Worship Piano app.
---

# Audio Skill — Worship Piano App

## Objetivo
Mantener la integridad de la capa de audio, separando lógica testeable (packages/audio) del wrapper del navegador (apps/web/audio).

---

## 1. Arquitectura dual de audio

### packages/audio
- **Propósito**: lógica Tone.js compartida, testeable en Node
- **Ubicación**: `packages/audio/src/`
- **Tests**: Vitest Node, sin browser

### apps/web/src/audio
- **Propósito**: wrapper singleton de Tone.js para el navegador
- **Ubicación**: `apps/web/src/audio/AudioEngine.ts`
- **Tests**: mockeado con `@/audio/AudioEngine`

### Regla sagrada
**No importar clases de `packages/audio` dentro de `apps/web/src/`**

---

## 2. AudioEngine (web)

### Responsabilidades
- Inicializar Tone.js
- Cargar y reproducir samples
- Manejar transporte (play/pause/seek)
- Eventos de sincronización

### API pública
```typescript
interface AudioEngine {
  init(): Promise<void>
  loadSong(songId: string): Promise<void>
  play(): void
  pause(): void
  seek(timestamp: number): void
  getCurrentTime(): number
  onBeat(callback: (time: number) => void): void
}
```

---

## 3. Sincronización musical

### Principio
- Timestamps absolutos, NO delays relativos
- `requestAnimationFrame` para interpolación
- `classifyDrift()` para colores de latencia

### En live sessions
- Host transmite beat actual
- Guests interpolan locally
- Drift < 50ms = verde, 50-100ms = amarillo, > 100ms = rojo

---

## 4. Carga de samples

### Estrategia
- Pre-cargar samples antes de reproducción
- Lazy loading para samples menos usados
- Cache en memoria para samples frecuentes

### Formatos soportados
- WAV (preferido por calidad)
- MP3 (para assets grandes)
- OGG (alternativa)

---

## 5. Estados del motor

```typescript
type AudioEngineState =
  | 'uninitialized'
  | 'initializing'
  | 'ready'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'error'
```

### Transiciones válidas
```
uninitialized → initializing
initializing → ready | error
ready → loading
loading → ready | error
ready → playing
playing → paused | ready
paused → playing | ready
```

---

## 6. Errores comunes

| Error | Causa | Solución |
|-------|-------|----------|
| AudioContext bloqueado | Autoplay policy | Requiere gesture del usuario |
| Sample no encontrado | Path incorrecto | Verificar public/assets |
| Drift acumulado | Sync mal implementada | Usar timestamps absolutos |

---

## 7. Testing

### packages/audio
- Tests unitarios en Node
- Mock de Tone.js si necesario
- Testear lógica de sincronización

### apps/web
- Tests con AudioEngine mockeado
- No testar Tone.js directo ( integración)

---

## 8. Checklist Audio

- [ ] packages/audio testeable en Node
- [ ] Web no importa de packages/audio directamente
- [ ] AudioEngine tiene estados válidos
- [ ] Timestamps absolutos para sync
- [ ] Pre-carga de samples
- [ ] Manejo de AudioContext bloqueado
- [ ] Drift clasificado correctamente