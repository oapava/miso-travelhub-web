# syntax=docker/dockerfile:1.4
# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — Builder
#
#   Compiles the Vite/React app into static files.
#
#   VITE_* variables are NOT baked in at build time.
#   The app reads them at runtime from window.__ENV__, which is populated by
#   docker-entrypoint.sh using the Cloud Run (or Docker -e) env vars.
#
#   This means a single Docker image can be deployed to any environment
#   (dev, staging, prod) just by changing Cloud Run env vars — no rebuild needed.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Install ALL dependencies including devDependencies (TypeScript, @types/*, etc.)
# NOTE: NODE_ENV is intentionally NOT set here — setting it before npm ci would
# cause npm to skip devDependencies and break TypeScript compilation.
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline

COPY . .

# NODE_ENV=production is set inline so Vite optimises the output without
# affecting the npm install step above.
RUN NODE_ENV=production npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — Runtime
#
#   Minimal nginx image serving the compiled static files.
#   No Node, no source code, no build tools, no secrets.
#
#   docker-entrypoint.sh runs at startup and:
#     1. Generates /etc/nginx/conf.d/default.conf from the template, replacing
#        ${PORT} with the value injected by Cloud Run (usually 8080).
#     2. Generates /usr/share/nginx/html/env-config.js from Cloud Run env vars
#        so the React app can read them via window.__ENV__.
# ─────────────────────────────────────────────────────────────────────────────
FROM nginx:1.25-alpine AS runtime

# nginx reads templates from this directory on startup — we use our own
# entrypoint instead of the built-in template mechanism, but keep the
# template here so the path is consistent and self-documenting.
RUN mkdir -p /etc/nginx/templates
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Copy compiled static assets
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Copy the entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Ensure nginx can write to its required runtime directories
RUN chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && chown -R nginx:nginx /etc/nginx/conf.d \
    && chown nginx:nginx /usr/share/nginx/html \
    && touch /var/run/nginx.pid \
    && chown nginx:nginx /var/run/nginx.pid

# Cloud Run injects PORT=8080; document that here.
# EXPOSE is informational only — the actual port comes from the template.
EXPOSE 8080

# Liveness probe using the dynamic port
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:${PORT:-8080}/ || exit 1

# The entrypoint configures nginx port + env-config.js, then starts nginx
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
