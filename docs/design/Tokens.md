# Design Tokens — ChordShift / Worship Piano

Sistema de diseño para la aplicación. Verde, negro y gris con acentos anime.

---

## Paleta de Colores

### Colores Principales

| Token | Hex | Uso |
|-------|-----|-----|
| `bg-primary` | `#0a0a0a` | Fondo principal |
| `bg-secondary` | `#141414` | Fondo secundario (cards) |
| `bg-card` | `#132013` | Cards con borde verde sutil |
| `border` | `rgba(34,197,94,0.15)` | Bordes por defecto |
| `text-primary` | `#f0f0f0` | Texto principal |
| `text-secondary` | `#8aa88a` | Texto secundario (verde muted) |
| `accent` | `#22c55e` | Verde principal — botones, highlights |
| `accent-hover` | `#16a34a` | Verde hover |
| `accent-light` | `rgba(34,197,94,0.12)` | Fondo hover/active sutil |
| `success` | `#22c55e` | Éxito (igual que accent) |
| `danger` | `#ef4444` | Error, peligro |

### Acentos Anime (efectos decorativos)

| Token | Hex |
|-------|-----|
| `anime-pink` | `#ff6ec7` |
| `anime-blue` | `#00d4ff` |
| `anime-purple` | `#a855f7` |
| `anime-glow` | `#ff1493` |
| `neon-cyan` | `#00f5d4` |
| `neon-pink` | `#ff0050` |

---

## Tipografía

| Token | Valor |
|-------|-------|
| `font-sans` | Inter, system-ui, sans-serif |
| `font-display` | Inter, system-ui, sans-serif |

### Escala (Tailwind por defecto)

| Clase | size |
|-------|------|
| `text-xs` | 12px |
| `text-sm` | 14px |
| `text-base` | 16px |
| `text-lg` | 18px |
| `text-xl` | 20px |
| `text-2xl` | 24px |
| `text-3xl` | 30px |
| `text-4xl` | 36px |
| `text-5xl` | 48px |

---

## Espaciado

Usa escala Tailwind: `1`=4px, `2`=8px, `3`=12px, `4`=16px, `6`=24px, `8`=32px, `12`=48px, `16`=64px

---

## Sombras y Glows

### Utilities en CSS

```css
.glow-green {
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.15), 0 0 60px rgba(34, 197, 94, 0.05);
}

.glow-pink {
  box-shadow: 0 0 20px rgba(255, 110, 199, 0.25), 0 0 60px rgba(255, 110, 199, 0.1);
}

.glow-blue {
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.25), 0 0 60px rgba(0, 212, 255, 0.1);
}
```

### Gradientes de Texto

```css
.text-gradient-anime {
  background: linear-gradient(135deg, #ff6ec7, #00d4ff, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.text-gradient-green {
  background: linear-gradient(135deg, #22c55e, #4ade80);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

## Border Radius

| Clase | value |
|-------|-------|
| `rounded` | 4px |
| `rounded-lg` | 8px |
| `rounded-xl` | 12px |
| `rounded-2xl` | 16px |
| `rounded-full` | 9999px |

---

## Componentes Base

### Botón Primario (accent)
```css
background: #22c55e;
color: white;
border-radius: 12px;
padding: 12px 24px;
font-weight: 600;
hover: #16a34a;
glow-green en hover
```

### Botón Secundario (outline)
```css
background: transparent;
border: 1px solid rgba(34, 197, 94, 0.15);
color: #f0f0f0;
border-radius: 12px;
padding: 12px 24px;
hover: border-accent/50, bg-accent-light
```

### Input
```css
background: #132013;
border: 1px solid rgba(34, 197, 94, 0.15);
color: #f0f0f0;
border-radius: 12px;
padding: 12px 16px;
placeholder: #8aa88a;
focus: border-accent
```

### Card
```css
background: #132013;
border: 1px solid rgba(34, 197, 94, 0.15);
border-radius: 16px;
padding: 24px;
```

---

## Background Pattern

Fondo con patrón musical sutil:

```css
body {
  background-color: #0a0a0a;
  background-image:
    radial-gradient(ellipse at 20% 50%, rgba(34, 197, 94, 0.04) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(34, 197, 94, 0.03) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, rgba(34, 197, 94, 0.02) 0%, transparent 50%);
  background-attachment: fixed;
}
```

---

## Estructura de Pantallas

### Landing / Homepage
- Hero con gradiente verde, logo, tagline
- 3 features principales en cards
- Sección de descarga desktop
- Footer mínimo

### Login
- Centrado en pantalla
- Logo + título
- PIN input grande (6 dígitos)
- Opciones: crear perfil, olvidé PIN
- **Galería de fondo**: `LoginBackgroundGallery` con 5 músicos anime (piano, guitarra, trompeta, batería, violín) moviéndose en 3 carriles parallax. Tinte verde integrado con `filter: grayscale + hue-rotate(70deg)`. Respeta `prefers-reduced-motion`.
- Decorativo: notas musicales/audífonos en corners

### Register
- Similar a login
- Display name + PIN
- Mensaje de error si aplica

### Practice (lista canciones)
- Header con stats (racha, XP)
- Filtros por estilo/dificultad
- Grid de canciones
- Tap para entrar a player

### Practice Player
- Acordes grandes centrados
- Controles: play/pause, stop, metronomo
- Selector instrumento (piano/guitar/trumpet)
- Progreso de canción

### Ear Training
- Instrucciones del ejercicio
- Respuesta de intervalos/triadas/acordes
- Feedback visual inmediato
- Stats al completar

### Encyclopedia
- Grid de StyleCards
- Cada card: nombre, dificultad, técnicas
- Tap para expandir detalles

### Settings
- Secciones: General, Notificaciones, Sonido, Seguridad, Datos, Descarga Desktop
- Toggle switches para booleanos
- Input fields para texto/números
- Botones de acción (guardar, resetear)

---

## Iconografía

Usa `lucide-react` como librería de iconos principal. Ver `apps/web/src/components/ui/` para componentes custom.

---

## Animaciones

Ver `apps/web/src/components/animations/` y `apps/web/src/components/effects/`.

Patrón de 4 archivos por animación:
- `Component.tsx` — implementación
- `types.ts` — props
- `animation.ts` — variants Framer Motion
- `index.ts` — re-export

Ver también `apps/web/src/components/transitions/` para PageTransition y AnimeSceneTransition.

---

## Assets
- `apps/web/public/` — PWA assets, íconos
- `apps/web/resources/` — íconos Electron (icon.png)
- `apps/web/src/components/illustrations/musicians/` — SVGs originales de músicos anime (PianistSVG, GuitaristSVG, TrumpetSVG, DrummerSVG, ViolinistSVG). Estilo silueta + acentos verdes. Sin dependencia externa.