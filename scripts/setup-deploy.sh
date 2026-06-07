#!/usr/bin/env bash
# =============================================================================
# setup-deploy.sh — Configurar deploy del backend en un provider cloud
#
# Uso:
#   ./scripts/setup-deploy.sh railway
#   ./scripts/setup-deploy.sh render
#   ./scripts/setup-deploy.sh fly
#   ./scripts/setup-deploy.sh compose   # local con docker compose
#
# El script:
#   1. Genera un JWT_SECRET seguro (si no está definido)
#   2. Genera claves VAPID (si no están definidas)
#   3. Crea el archivo .env con valores placeholder
#   4. Imprime instrucciones específicas del provider
# =============================================================================

set -euo pipefail

PROVIDER="${1:-}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# --- Helpers ---
generate_jwt_secret() {
  openssl rand -base64 48
}

generate_vapid_keys() {
  npx --yes web-push generate-vAPIDKeys
}

# --- Validar provider ---
case "$PROVIDER" in
  railway|render|fly|compose) ;;
  *)
    echo "❌ Provider inválido: $PROVIDER"
    echo "   Uso: $0 {railway|render|fly|compose}"
    exit 1
    ;;
esac

echo "🚀 Setup de deploy para: $PROVIDER"
echo "=============================================="

# --- Generar secrets si no existen ---
if [[ ! -f apps/api/.env ]]; then
  cp apps/api/.env.example apps/api/.env
  echo "📝 Creado apps/api/.env desde .env.example"
fi

if ! grep -q "JWT_SECRET=.\{32,\}" apps/api/.env 2>/dev/null; then
  JWT_SECRET=$(generate_jwt_secret)
  # Reemplaza la línea de placeholder
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|^JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" apps/api/.env
  else
    sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" apps/api/.env
  fi
  echo "🔐 Generado JWT_SECRET (64 chars)"
fi

if ! grep -q "VAPID_PUBLIC_KEY=.\{20,\}" apps/api/.env 2>/dev/null; then
  echo "🔑 Generando claves VAPID..."
  VAPID_OUTPUT=$(generate_vapid_keys 2>/dev/null)
  VAPID_PUBLIC=$(echo "$VAPID_OUTPUT" | grep -i "public" | head -1 | awk '{print $NF}')
  VAPID_PRIVATE=$(echo "$VAPID_OUTPUT" | grep -i "private" | head -1 | awk '{print $NF}')

  if [[ -n "$VAPID_PUBLIC" && -n "$VAPID_PRIVATE" ]]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s|^VAPID_PUBLIC_KEY=.*|VAPID_PUBLIC_KEY=$VAPID_PUBLIC|" apps/api/.env
      sed -i '' "s|^VAPID_PRIVATE_KEY=.*|VAPID_PRIVATE_KEY=$VAPID_PRIVATE|" apps/api/.env
    else
      sed -i "s|^VAPID_PUBLIC_KEY=.*|VAPID_PUBLIC_KEY=$VAPID_PUBLIC|" apps/api/.env
      sed -i "s|^VAPID_PRIVATE_KEY=.*|VAPID_PRIVATE_KEY=$VAPID_PRIVATE|" apps/api/.env
    fi
    echo "   VAPID_PUBLIC_KEY=$VAPID_PUBLIC"
    echo "   VAPID_PRIVATE_KEY=$VAPID_PRIVATE"
  else
    echo "⚠️  No se pudieron generar claves VAPID automáticamente."
    echo "   Genera con: npx web-push generate-vAPIDKeys"
  fi
fi

# --- Instrucciones por provider ---
case "$PROVIDER" in
  compose)
    echo ""
    echo "✅ Setup completo. Para arrancar localmente:"
    echo ""
    echo "   docker compose up -d postgres"
    echo "   docker compose run --rm api pnpm prisma:deploy"
    echo "   docker compose run --rm api pnpm db:seed   # opcional"
    echo "   docker compose up -d api"
    echo ""
    echo "   curl http://localhost:3001/api/health"
    ;;

  railway)
    echo ""
    echo "✅ Setup completo. Para deployar en Railway:"
    echo ""
    echo "   1. Ve a https://railway.app/new"
    echo "   2. 'Deploy from GitHub repo' → IsmaPX/ChordShift"
    echo "   3. Railway detecta railway.toml automáticamente"
    echo "   4. Click en '+ New' → 'Database' → 'PostgreSQL'"
    echo "   5. En Variables del servicio API, añade:"
    echo ""
    cat apps/api/.env | grep -v "^#" | grep -v "^$" | sed 's/^/      /'
    echo ""
    echo "   6. Click en 'Deploy' → esperar ~3 min para build"
    echo "   7. En Settings → Networking → 'Generate Domain'"
    ;;

  render)
    echo ""
    echo "✅ Setup completo. Para deployar en Render:"
    echo ""
    echo "   1. Ve a https://dashboard.render.com/blueprints"
    echo "   2. 'New Blueprint Instance' → selecciona este repo"
    echo "   3. Render detecta render.yaml y crea servicios + DB"
    echo "   4. Ve al servicio API → Environment → añade:"
    echo ""
    cat apps/api/.env | grep -v "^#" | grep -v "^$" | sed 's/^/      /'
    echo ""
    echo "   5. (Importante) En Settings → 'Pre-Deploy Command':"
    echo "      cd apps/api && pnpm prisma:deploy"
    echo ""
    echo "   6. Manual Deploy → esperar ~5 min"
    ;;

  fly)
    echo ""
    echo "✅ Setup completo. Para deployar en Fly.io:"
    echo ""
    echo "   # Instalar flyctl: https://fly.io/docs/hands-on/install-flyctl/"
    echo "   fly auth signup"
    echo "   fly launch --copy-config --name chordshift-api"
    echo "   fly postgres create --name chordshift-pg --region iad"
    echo "   fly postgres attach chordshift-pg"
    echo ""
    echo "   # Setear secrets (no commiteadas al repo):"
    grep -E "^(JWT_SECRET|VAPID_PUBLIC_KEY|VAPID_PRIVATE_KEY|CORS_ORIGIN)=" apps/api/.env | sed 's/^/   fly secrets set /' | sed 's/=/=/' | awk -F'=' '{print $1"=\""$2"\""}' | sed 's/^/   fly secrets set /'
    echo ""
    echo "   fly deploy"
    echo "   fly open"
    ;;
esac

echo ""
echo "📋 Variables de entorno configuradas en apps/api/.env:"
grep -v "^#" apps/api/.env | grep -v "^$" | sed 's/^/   /'
