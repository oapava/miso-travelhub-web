# MISO Travel Hub Web

Aplicación frontend (React 19 + Vite + TypeScript) para el portal de reservas **MISO Travel Hub**, con vistas B2C y B2B, ruteo con React Router 7, i18n con i18next y estilos en Sass. Incluye pipeline de CI, pruebas unitarias con Jest/Testing Library y artefacto Docker listo para servir con Nginx.

## 🧭 Características principales
- **B2C**: Home, resultados, detalle, cuenta, reservas, notificaciones (maquetado con datos mock).
- **B2B**: Login, dashboard, gestor de reservas, reportes financieros, gestor de precios.
- **Internacionalización**: i18next + react-i18next.
- **Ruteo**: `react-router-dom@7` con enrutador central en `src/routes/AppRouter.tsx` y enums de rutas en `src/types/routes.types.ts`.
- **Estilos**: Sass global en `src/styles/main.scss` y componentes modulares.
- **Calidad**: TypeScript estricto, ESLint + Prettier, Jest + Testing Library con cobertura en CI.
- **Docker**: Multi-stage (Node 18 para build, Nginx para servir `/dist`).

## 📂 Estructura rápida
```
.
├─ src/
│  ├─ pages/           # Vistas B2C y B2B
│  ├─ components/      # UI y layout (Header, Footer, SearchBar, etc.)
│  ├─ routes/          # Enrutador y constantes de rutas
│  ├─ i18n/            # Configuración de internacionalización
│  ├─ styles/          # Sass global y variables
│  └─ types/           # Tipos compartidos y rutas
├─ public/             # Assets estáticos
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

1) Duplica `.env.example` al modo que necesites, por ejemplo:
```bash
cp .env.example .env.development
```
2) Ajusta los valores (no guardes secretos en el repositorio). Ejemplos:
```
VITE_API_BASE_URL=https://api.example.com
VITE_ENV_NAME=local|staging|production
```
3) Selecciona el modo al correr Vite (`--mode`) o con los scripts ya definidos.

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

## 📌 Próximos pasos (ideas)
- Conectar servicios reales usando `VITE_API_BASE_URL`.
- Añadir manejo de estado (p. ej. Zustand/Redux) si crece la complejidad.
- Incorporar pruebas de integración de rutas y componentes críticos.
- Automatizar despliegue de la imagen a un registry.
