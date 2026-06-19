---
name: ci-cd
description: MUST be loaded before modifying GitHub Actions workflows, CI/CD pipelines, or deployment automation.
---

# CI/CD Skill — Worship Piano App

## Objetivo
Mantener la integridad de los workflows de CI/CD, asegurando calidad consistente en cada commit y despliegues controlados.

---

## 1. Workflows disponibles

### ci.yml
**Trigger**: push/PR a `main` o `develop`

| Job | Runs | Depends |
|-----|------|---------|
| `lint-and-typecheck` | web only (typecheck → lint) | install |
| `test` | web + audio (NO api) | install |
| `build` | web only | lint-and-typecheck + test |

### deploy.yml
**Trigger**: push a `main`
- Despliega a Vercel

### docker-publish.yml
**Trigger**: push/main, PR, tag `v4*`
- Build y push a `ghcr.io/<owner>/chordshift-api`

### release.yml
**Trigger**: tag `v*` o manual
- Electron: Win/Mac/Linux
- Android: APK

### deploy-api.yml
**Trigger**: manual
- SSH deploy a servidor propio

---

## 2. Orden de validación CI

```
install
  ├── lint-and-typecheck (parallel)
  └── test (parallel)
        └── build (depends on both)
```

### Job: lint-and-typecheck
1. `cd apps/web && pnpm typecheck`
2. `cd apps/web && pnpm lint`

### Job: test
1. `cd packages/audio && pnpm test:run`
2. `cd apps/web && pnpm test:run`

### Job: build
1. `cd apps/web && pnpm build`

---

## 3. Docker build

### Imagen
`ghcr.io/<owner>/chordshift-api`

### Tags
- `latest` en main
- `v<version>` en tags
- `sha-<commit>` en todos

### Build args
- `NODE_ENV=production`
- Credenciales si es necesario

---

## 4. Electron release

### Artefactos
- Windows: `.exe` installer
- macOS: `.dmg`
- Linux: `.AppImage` / `.deb`

### Code signing
- Opcional
- `CSC_IDENTITY_AUTO_DISCOVERY=false` lo desactiva

### Android
- `versionCode`: `$(date +%s)` en CI
- `versionName`: del tag git

---

## 5. Secrets necesarios

### CI
- `VERCEL_TOKEN`
- `GHCR_TOKEN` (si usa container registry)
- `CSC_*` (si code signing)

### Deployment
- `SSH_*` (para deploy-api.yml)
- Credenciales de cloud (AWS, etc.)

### Nota
- No exponer secrets en logs
- Usar secretos de GitHub Actions

---

## 6. Triggers comunes

```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  push:
    tags: ['v*']
```

---

## 7. Android build (release.yml)

### Requisitos
- Java 21
- Android SDK

### Comandos
```bash
cd apps/web
pnpm android:assemble    # assembleDebug
pnpm android:bundle      # bundleRelease
```

---

## 8. Verificación post-deploy

### Web (Vercel)
- Health check de la URL
- Verificar que assets cargan

### API (Docker)
- Health endpoint `/health`
- Verificar logs del contenedor

### Desktop (Electron)
- Descargar installer
- Verificar firma (si está configurada)

---

## 9. Rollback

### Vercel
- Usar dashboard o CLI
- `vercel rollback`

### Docker
- `docker pull` de imagen anterior
- Redploy del container

### SSH
- Git pull del commit anterior
- Restart del servicio

---

## 10. Checklist CI/CD

- [ ] lint-and-typecheck pasa
- [ ] Tests pasan (web + audio)
- [ ] Build genera artefactos
- [ ] Docker image se build correctamente
- [ ] Release crea installers Electron
- [ ] Android APK se genera
- [ ] Secrets configurados en GitHub
- [ ] Rollback funciona