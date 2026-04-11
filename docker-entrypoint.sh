#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# docker-entrypoint.sh
#
# Runs once at container startup (before nginx). It does two things:
#
# 1. Generates /etc/nginx/conf.d/default.conf from the template, substituting
#    the PORT variable injected by Cloud Run (default 8080). This is required
#    because Cloud Run expects the container to listen on $PORT, not 80.
#
# 2. Generates /usr/share/nginx/html/env-config.js from Cloud Run env vars so
#    the React app can read them at runtime via window.__ENV__.
# ─────────────────────────────────────────────────────────────────────────────

set -e

# ── 1. Generate nginx config with the correct PORT ───────────────────────────
# Cloud Run injects PORT (usually 8080). Locally PORT defaults to 80.
export PORT="${PORT:-80}"

echo "Configuring nginx to listen on port ${PORT}..."
envsubst '${PORT}' < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

# ── 2. Generate runtime env config for the React app ─────────────────────────
ENV_FILE="/usr/share/nginx/html/env-config.js"

echo "Generating ${ENV_FILE} from runtime environment..."

cat > "${ENV_FILE}" << EOF
// Auto-generated at container start — do not edit manually.
window.__ENV__ = {
  VITE_AUTH_BASE_URL:   "${VITE_AUTH_BASE_URL:-}",
  VITE_SEARCH_BASE_URL: "${VITE_SEARCH_BASE_URL:-}",
  VITE_ENV_NAME:        "${VITE_ENV_NAME:-production}"
};
EOF

echo "env-config.js written:"
cat "${ENV_FILE}"

# ── 3. Hand off to nginx ──────────────────────────────────────────────────────
exec "$@"
