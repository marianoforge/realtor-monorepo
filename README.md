# 🏠 TZR - Plataforma de Gestión Inmobiliaria

> SaaS para brokers y asesores inmobiliarios que automatiza el cálculo de comisiones, tracking de operaciones y gestión de equipos.

[![CI](https://github.com/tu-usuario/tzr/actions/workflows/ci.yml/badge.svg)](https://github.com/tu-usuario/tzr/actions/workflows/ci.yml)

## ✨ Features

- 📊 **Dashboard analítico** — Métricas de ventas, proyecciones y KPIs en tiempo real
- 💰 **Cálculo automático de comisiones** — Broker, asesor, compartido, referido
- 👥 **Gestión de equipos** — Asesores, distribución de operaciones
- 🏢 **Integración Tokko Broker** — Importación automática de propiedades
- 📅 **Calendario** — Sincronización con Google Calendar
- 💳 **Suscripciones** — Trial 15 días + Stripe billing
- 💬 **Mensajería interna** — Comunicación entre team members
- 🤖 **Chatbot AI** — Asistente integrado con n8n

## 🛠 Stack Tecnológico

| Categoría              | Tecnología                                                    |
| ---------------------- | ------------------------------------------------------------- |
| **Frontend**           | Next.js 14 (Pages Router), React 18, TypeScript, Tailwind CSS |
| **State Management**   | TanStack Query (server state), Zustand (client state)         |
| **Forms & Validation** | React Hook Form + Yup                                         |
| **Backend**            | Next.js API Routes                                            |
| **Database**           | Firebase Firestore                                            |
| **Auth**               | Firebase Auth                                                 |
| **Payments**           | Stripe (subscriptions + webhooks)                             |
| **Testing**            | Jest, React Testing Library                                   |
| **CI/CD**              | GitHub Actions                                                |
| **Deployment**         | Vercel                                                        |

### ¿Por qué Next.js API Routes?

- **Simplicidad**: Monorepo unificado (frontend + backend en un solo repositorio)
- **Deploy**: Vercel serverless sin configuración adicional
- **Type Safety**: Tipos compartidos entre cliente y servidor
- **Developer Experience**: Hot reload en frontend y backend simultáneamente

## 🚀 Quick Start

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/tzr.git
cd tzr

# 2. Instalar dependencias
yarn install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# 4. Ejecutar en desarrollo
yarn dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 🔑 Variables de Entorno

Copiar `.env.example` a `.env.local` y configurar:

| Variable                          | Descripción                      | Requerido   |
| --------------------------------- | -------------------------------- | ----------- |
| `NEXT_PUBLIC_FIREBASE_*`          | Configuración Firebase (cliente) | ✅          |
| `FIREBASE_*`                      | Firebase Admin SDK (servidor)    | ✅          |
| `STRIPE_SECRET_KEY`               | API key de Stripe                | ✅          |
| `STRIPE_WEBHOOK_SECRET`           | Secret para webhooks de Stripe   | ✅          |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Places API                | ✅          |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID`    | Google OAuth para Calendar       | ⚠️ Opcional |
| `N8N_WEBHOOK_URL`                 | URL webhook chatbot n8n          | ⚠️ Opcional |
| `PERPLEXITY_API_KEY`              | API key para market news         | ⚠️ Opcional |

Ver [.env.example](./.env.example) para la lista completa con descripciones.

## 🧪 Testing y Calidad

```bash
# Testing
yarn test              # Ejecutar tests
yarn test:watch        # Watch mode
yarn test:coverage     # Con coverage
yarn test:ci           # Tests en CI (con flags apropiados)

# Linting y Types
yarn lint              # Ejecutar ESLint
yarn lint:fix          # Autofix problemas de linting
yarn typecheck         # Verificar tipos de TypeScript

# Build
yarn build             # Build de producción
```

## 📁 Arquitectura del Proyecto

```
tzr/
├── pages/
│   ├── api/              # 🔧 API Routes (80+ endpoints)
│   │   ├── auth/         # Autenticación (login, register, reset)
│   │   ├── operations/   # CRUD operaciones inmobiliarias
│   │   ├── stripe/       # Webhooks y billing de Stripe
│   │   ├── messaging/    # Sistema de mensajería
│   │   ├── cron/         # Tareas programadas
│   │   └── ...
│   └── *.tsx             # 📄 Páginas públicas y privadas
│
├── modules/              # 📦 Features organizados por dominio
│   ├── dashboard/        # Dashboard y métricas
│   ├── operations/       # Gestión de operaciones
│   ├── expenses/         # Control de gastos
│   ├── messaging/        # Mensajería interna
│   ├── chatbot/          # Chatbot AI (n8n)
│   └── ...
│
├── components/           # 🧩 Componentes UI compartidos
│   ├── PrivateComponente/ # Componentes para rutas privadas
│   └── PublicComponents/  # Componentes públicos
│
├── common/               # 🔧 Utilidades y recursos compartidos
│   ├── hooks/            # Custom React hooks
│   ├── schemas/          # Esquemas de validación (Yup)
│   ├── types/            # Definiciones de TypeScript
│   ├── utils/            # Funciones helper
│   └── enums/            # Constantes y enums
│
├── lib/                  # ⚙️ Configuraciones y clientes
│   ├── firebase.ts       # Cliente Firebase (Firestore, Auth)
│   ├── firebaseAdmin.ts  # Firebase Admin SDK (server-only)
│   ├── api/              # API clients externos
│   ├── rateLimit.ts      # Rate limiting
│   ├── csrf.ts           # CSRF protection
│   └── ...
│
├── stores/               # 🗄️ Estado global (Zustand)
│   ├── authStore.ts      # Autenticación
│   ├── userDataStore.ts  # Datos de usuario
│   └── messagingStore.ts # Mensajería
│
├── __tests__/            # 🧪 Tests unitarios
└── docs/                 # 📚 Documentación técnica
```

## 📊 Endpoints Principales

### Autenticación

| Método | Endpoint                   | Descripción                |
| ------ | -------------------------- | -------------------------- |
| `POST` | `/api/auth/login`          | Login con email/password   |
| `POST` | `/api/auth/register`       | Registro + inicio de trial |
| `POST` | `/api/auth/reset-password` | Reset de contraseña        |

### Operaciones

| Método   | Endpoint                 | Descripción                        |
| -------- | ------------------------ | ---------------------------------- |
| `GET`    | `/api/operations`        | Listar operaciones del usuario     |
| `POST`   | `/api/operations`        | Crear nueva operación              |
| `PUT`    | `/api/operations/[id]`   | Actualizar operación               |
| `DELETE` | `/api/operations/[id]`   | Eliminar operación                 |
| `POST`   | `/api/operations/import` | Importar operaciones desde archivo |

### Stripe

| Método | Endpoint                          | Descripción                  |
| ------ | --------------------------------- | ---------------------------- |
| `POST` | `/api/stripe/webhook`             | Webhook de eventos de Stripe |
| `POST` | `/api/checkout/checkout_session`  | Crear sesión de checkout     |
| `GET`  | `/api/stripe/subscription_info`   | Info de suscripción          |
| `POST` | `/api/stripe/cancel_subscription` | Cancelar suscripción         |

## 🔄 Flujo de Registro con Trial

1. **Usuario se registra** → Cuenta creada inmediatamente en Firebase
2. **Redirección a Stripe** → Usuario ingresa método de pago (NO se cobra)
3. **Trial de 15 días** → Acceso completo a todas las funcionalidades
4. **Post-trial** → Stripe cobra automáticamente según el plan elegido

**Documentación completa:**

- [Flujo de registro detallado](./docs/REGISTRATION_FLOW_WITH_TRIAL.md)
- [Implementación en producción](./docs/NUEVO_FLUJO_REGISTRO_PRODUCCION.md)
- [Historial de cambios](./docs/CHANGELOG_REGISTRATION_FLOW.md)

## 📚 Documentación Adicional

- [🔗 Integración con Tokko Broker](./docs/TOKKO_INTEGRATION.md)
- [🧪 Estrategia de Testing](./docs/TESTING.md)
- [💰 Cálculos de Comisiones](./docs/CALCULOS_DE_COMISIONES.md)
- [🤖 Setup Chatbot N8N](./docs/SETUP_CHATBOT.md)

## ⚠️ Limitaciones Conocidas

- **Rate limiting** en memoria (no persiste entre redeploys serverless)
- **Sin soporte offline** (requiere conexión constante)
- **Integración Tokko** solo disponible para Argentina
- **Mensajería** no tiene persistencia en tiempo real (polling cada 30s)

## 🚧 Roadmap

- [ ] **Tests E2E** con Playwright
- [ ] **PWA** con soporte offline y service workers
- [ ] **Multi-idioma** (i18n) - Español/Inglés/Portugués
- [ ] **App móvil** (React Native o Expo)
- [ ] **Webhooks de Tokko** para sincronización automática
- [ ] **Notificaciones push** en tiempo real

## 🤝 Contribuir

```bash
# 1. Fork del repositorio
# 2. Crear branch de feature
git checkout -b feature/nueva-funcionalidad

# 3. Commit de cambios
git commit -m "feat: agregar nueva funcionalidad"

# 4. Push a tu fork
git push origin feature/nueva-funcionalidad

# 5. Abrir Pull Request
```

## 📝 License

MIT

---

**Desarrollado con ❤️ por el equipo de TZR**
