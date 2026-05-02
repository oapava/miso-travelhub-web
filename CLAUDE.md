# CLAUDE.md — miso-travel-hub-web

## Comandos rápidos

```bash
# Instalación  (también instala el pre-commit hook vía prepare → husky)
npm ci

# Dev server (http://localhost:5173)
npm run dev

# Tests unitarios
npm test                     # todos los tests
npm run test:watch           # modo watch
npm run test:coverage        # con reporte de cobertura

# E2E — abrir Cypress interactivo (requiere dev server corriendo)
npm run test:e2e

# E2E — cross-browser headless (requiere dev server corriendo)
npm run test:e2e:chrome       # solo Chrome
npm run test:e2e:firefox      # solo Firefox
npm run test:e2e:electron     # solo Electron (más rápido, sin descarga extra)
npm run test:e2e:cross-browser  # Chrome + Firefox en secuencia

# Lint y formato
npm run lint
npm run lint:fix
npm run format

# Build
npm run build
npm run preview              # sirve /dist localmente

# Docker
npm run docker:build
npm run docker:run           # disponible en http://localhost:4173
```

## Stack

React 19 · Vite 6 · TypeScript 5.7 · React Router 7 · i18next · Sass · Jest 29 · @testing-library/react

## Estructura relevante

```
src/
├── context/
│   └── AuthContext.tsx        # AuthProvider, useAuth hook, persistencia en localStorage
├── services/
│   └── auth.service.ts        # login, register, getCurrentUser → llama a user-services backend
├── routes/
│   ├── AppRouter.tsx          # Rutas B2C y B2B; rutas protegidas envueltas en ProtectedRoute
│   └── ProtectedRoute.tsx     # Redirige a / si !isAuthenticated
├── components/
│   ├── layout/Header/         # Lee useAuth(); muestra botones auth o info de usuario
│   └── shared/
│       ├── LoginModal/        # Llama authService.login + getCurrentUser; notifica al contexto
│       └── SignUpModal/       # Llama authService.register + auto-login; notifica al contexto
└── pages/b2c/
    └── AccountPage/           # Lee user de useAuth() para poblar el formulario
```

## Autenticación — flujo completo

```
Usuario llena form → authService.login(email, password)
                   → authService.getCurrentUser(access_token)
                   → AuthContext.login(token, user)
                   → Guarda en localStorage (travelhub_session)
                   → Header muestra nombre + Account | Logout
```

```
Usuario crea cuenta → authService.register(data)
                    → authService.login(email, password)      ← auto-login
                    → authService.getCurrentUser(access_token)
                    → AuthContext.login(token, user)
                    → Sesión activa inmediatamente
```

## Persistencia de sesión

- Clave localStorage: `travelhub_session`
- Estructura: `{ accessToken, refreshToken, expiresAt, user }`
- `expiresAt = Date.now() + expires_in * 1000` (token dura 15 min)
- Al cargar la app: se restaura si no ha expirado; si expiró se elimina
- Logout: elimina la clave y resetea el estado del contexto

## Pre-commit Hook — E2E Cross-Browser

El pre-commit (`./husky/pre-commit`) se ejecuta automáticamente antes de cada `git commit`. Hace lo siguiente:

1. Levanta `vite` en segundo plano (puerto 5173)
2. Espera hasta que el servidor esté listo con `wait-on` (máx. 30 s)
3. Corre `cypress run --browser chrome --headless`
4. Corre `cypress run --browser firefox --headless`
5. Apaga el dev-server
6. Aborta el commit si alguno de los dos browsers falla

> **Nota:** Chrome y Firefox deben estar instalados en la máquina del desarrollador.
> Cypress los detecta automáticamente. Para verificar los browsers disponibles:
> ```bash
> npx cypress info
> ```

Para **saltar** el pre-commit puntualmente (no recomendado):
```bash
git commit --no-verify -m "mensaje"
```

## Variables de entorno

```
VITE_AUTH_BASE_URL=http://localhost:8000   # URL base del backend de autenticación
VITE_ENV_NAME=local
```

Para desarrollo local usa `.env.local` (ya creado y en `.gitignore`).
Para otros entornos: `.env.staging`, `.env.production`.

## Rutas protegidas

Las rutas `/account`, `/account/bookings` y `/account/notifications` requieren autenticación.
Si el usuario no está autenticado se redirige a `/` (B2CRoutes.HOME).

## Convenciones

- Componentes: PascalCase, un componente por archivo
- Servicios: `*.service.ts` en `src/services/`
- Contextos: `*Context.tsx` en `src/context/`
- Tests: `src/__tests__/*.test.{ts,tsx}`; nombre `test_<qué>_<escenario>_<resultado>`
- Imports: usar alias `@/` (ej. `@/services/auth.service`)
- No usar `React.FC` sin necesidad; preferir tipos explícitos en props
- Los errores de API (4xx/5xx) se capturan en el service y se propagan como `Error` con el mensaje del campo `detail`

## Tests — patrones usados

```typescript
// Mockear authService en tests de componentes
jest.mock('@/services/auth.service', () => ({
  authService: { login: jest.fn(), register: jest.fn(), getCurrentUser: jest.fn() },
}));

// Mockear useAuth en tests de componentes que leen el contexto
jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
mockUseAuth.mockReturnValue({ isAuthenticated: false, user: null, ... });

// Envolver con MemoryRouter cuando el componente usa hooks de react-router
render(<MemoryRouter><ComponentUnderTest /></MemoryRouter>);

// Esperar llamadas async
await waitFor(() => expect(mockFn).toHaveBeenCalledWith(...));
```

## NUNCA

- Guardar secretos en variables de entorno versionadas
- Loguear tokens JWT en consola
- Hardcodear URLs de API (usar `VITE_AUTH_BASE_URL`)
- Hacer llamadas a servicios directamente desde páginas (pasar por contexto o servicio)
- Importar desde rutas relativas largas; siempre usar alias `@/`
