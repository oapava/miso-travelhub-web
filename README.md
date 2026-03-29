# MISO Travel Hub Web

Aplicación frontend (React 19 + Vite + TypeScript) para el portal de reservas **MISO Travel Hub**, con vistas B2C y B2B, ruteo con React Router 7, i18n con i18next y estilos en Sass. Incluye pipeline de CI, pruebas unitarias con Jest/Testing Library y artefacto Docker listo para servir con Nginx.

## 🧭 Características principales
- **B2C**: Home, resultados, detalle, cuenta, reservas, notificaciones.
- **B2B**: Login, dashboard, gestor de reservas, reportes financieros, gestor de precios.
- **Autenticación**: Login y registro de usuarios integrados con `uniandes-pf-user-services` (JWT). Sesión persistida en `localStorage` con expiración automática.
- **Rutas protegidas**: `/account`, `/account/bookings` y `/account/notifications` requieren sesión activa; redirigen a home si no hay sesión.
- **Internacionalización**: i18next + react-i18next.
- **Ruteo**: `react-router-dom@7` con enrutador central en `src/routes/AppRouter.tsx` y enums de rutas en `src/types/routes.types.ts`.
- **Estilos**: Sass global en `src/styles/main.scss` y componentes modulares.
- **Calidad**: TypeScript estricto, ESLint + Prettier, Jest + Testing Library con cobertura en CI.
- **Docker**: Multi-stage (Node 18 para build, Nginx para servir `/dist`).

## 📂 Estructura rápida
```
.
├─ src/
│  ├─ context/         # AuthContext: estado de sesión global (useAuth hook)
│  ├─ services/        # auth.service.ts: llamadas al backend de autenticación
│  ├─ pages/           # Vistas B2C y B2B
│  ├─ components/      # UI y layout (Header, Footer, SearchBar, modales de auth, etc.)
│  ├─ routes/          # AppRouter, ProtectedRoute y constantes de rutas
│  ├─ i18n/            # Configuración de internacionalización
│  ├─ styles/          # Sass global y variables
│  └─ types/           # Tipos compartidos y rutas
├─ public/             # Assets estáticos
├─ .env.local          # Variables de entorno locales (no versionado)
├─ .env.example        # Plantilla de variables de entorno
├─ jest.config.ts      # Config de Jest/ts-jest + aliases
├─ src/setupTests.ts   # Setup de pruebas + polyfills
├─ Dockerfile          # Build Vite + runtime Nginx
└─ nginx.conf          # Config de Nginx para SPA
```

## 🛠️ Requisitos previos
- Node.js **18.x** (alineado con CI y Dockerfile).
- npm (incluido con Node).

## ⚙️ Instalación
```bash
npm ci
```

## 🔑 Variables de entorno
Vite solo expone variables que empiezan con `VITE_`.

1) Para desarrollo local usa `.env.local` (ya incluido, ignorado por git):
```
VITE_AUTH_BASE_URL=http://localhost:8000
VITE_ENV_NAME=local
```
2) Para otros entornos duplica `.env.example`:
```bash
cp .env.example .env.staging
```
3) Variables disponibles:

| Variable | Descripción | Ejemplo local |
|---|---|---|
| `VITE_AUTH_BASE_URL` | URL base del servicio de autenticación | `http://localhost:8000` |
| `VITE_ENV_NAME` | Nombre del entorno | `local` |

4) Selecciona el modo al correr Vite (`--mode`) o con los scripts ya definidos.

## 📜 Scripts disponibles
```bash
npm run dev           # Dev server (modo por defecto: development)
npm run dev:stg       # Dev server con modo staging
npm run dev:prod      # Dev server con modo production

npm run build         # Compila TypeScript (tsc -b) + build Vite
npm run build:dev     # Build con modo development
npm run build:stg     # Build con modo staging
npm run preview       # Sirve el build localmente

npm run lint          # ESLint con reglas estrictas
npm run lint:fix      # ESLint con autofix
npm run format        # Prettier write en src
npm run format:check  # Prettier check en src

npm test              # Jest
npm run test:watch    # Jest en watch
npm run test:coverage # Jest con cobertura

npm run docker:build  # docker build -t miso-travel-hub-web .
npm run docker:run    # docker run --rm -p 4173:80 miso-travel-hub-web
```

## 🧪 Pruebas
- Framework: **Jest** + **@testing-library/react**.
- Entorno: **jsdom** (configurado en `jest.config.ts`).
- Alias de paths replicados de Vite (ver `moduleNameMapper`).
- Cobertura disponible con `npm run test:coverage` y publicada en CI como resumen en `GITHUB_STEP_SUMMARY`.

## 🧹 Lint y formato
- **ESLint** con `@typescript-eslint` y reglas para React Hooks y accesibilidad (jsx-a11y).
- **Prettier** para formato consistente.

## 🐳 Docker
Imagen multi-stage: build con Node 18, runtime Nginx.

Build (puedes inyectar vars de build para Vite):
```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://api.example.com \
  --build-arg VITE_ENV_NAME=production \
  -t miso-travel-hub-web .
```

Run:
```bash
docker run --rm -p 4173:80 miso-travel-hub-web
```
La app quedará disponible en http://localhost:4173.

## 🔄 CI/CD
Workflow en `.github/workflows/ci.yml`:
- Ejecuta `npm ci`.
- Corre Jest con cobertura.
- Publica resumen de cobertura en la sección de Summary del job.
- Adjunta el reporte completo como artefacto.

## 🧭 Convenciones y notas
- Alias de paths (`@/`, `@components/`, `@pages/`, etc.) definidos en `tsconfig.json` y replicados en Jest.
- `src/setupTests.ts` incluye polyfill de `TextEncoder/TextDecoder` para jsdom.
- `baseUrl` y `paths` permiten imports absolutos dentro de `src`.
- Los archivos `.env*` están ignorados en Git (`.gitignore`).

## 🚀 Flujo de desarrollo sugerido
1. Instalar dependencias: `npm ci`.
2. Crear `.env.development` a partir de `.env.example`.
3. Levantar el dev server: `npm run dev` (Vite en http://localhost:5173 por defecto).
4. Añadir/ajustar pruebas y ejecutar `npm test`.
5. Antes de subir cambios: `npm run lint` y `npm run test:coverage`.
6. Para validar el artefacto: `npm run build` o construir la imagen Docker.

## 🔐 Autenticación

El frontend consume el microservicio `uniandes-pf-user-services` (FastAPI).

**Endpoints utilizados:**
| Método | Ruta | Uso |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Inicio de sesión |
| `POST` | `/api/v1/auth/register` | Registro de usuario |
| `GET` | `/api/v1/auth/me` | Obtener perfil del usuario autenticado |

**Flujo de sesión:**
1. Login → obtiene `access_token` (15 min) + `refresh_token`
2. Llama `/auth/me` para obtener datos del perfil
3. Guarda sesión en `localStorage` (clave `travelhub_session`) con expiración
4. Al recargar la app se restaura la sesión si no ha expirado
5. Logout elimina la sesión del `localStorage`

**Archivos clave:**
- `src/services/auth.service.ts` — llamadas HTTP al backend
- `src/context/AuthContext.tsx` — estado global de autenticación (`useAuth` hook)
- `src/routes/ProtectedRoute.tsx` — guarda rutas privadas

## 📌 Próximos pasos (ideas)
- Implementar refresh automático de token antes de que expire.
- Añadir flujo de recuperación de contraseña.
- Incorporar pruebas de integración de rutas y componentes críticos.
- Automatizar despliegue de la imagen a un registry.
