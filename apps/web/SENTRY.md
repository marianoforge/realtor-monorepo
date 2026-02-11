# Sentry en el nuevo repo (realtor-monorepo)

El código ya incluye Sentry; solo hay que configurar las variables en el deployment del nuevo repo.

## 1. Sentry (sentry.io)

- Entrá a [sentry.io](https://sentry.io) con la org **realtor-trackpro** (o la que uses).
- Opción A: usar el mismo proyecto **javascript-nextjs** (mismo DSN para ambos repos).
- Opción B: crear un proyecto nuevo para realtor-monorepo (Settings → Projects → Create Project → Next.js) y copiar el DSN.

## 2. Auth token (para subida de source maps)

- En Sentry: Settings → Auth Tokens → Create New Token.
- Permisos: `project:releases` y `org:read`.
- Copiá el token (solo se muestra una vez).

## 3. Vercel (realtor-monorepo)

En el proyecto de Vercel del nuevo repo:

- **Settings → Environment Variables** y agregar:

| Variable            | Descripción                  | Dónde se obtiene                                    |
| ------------------- | ---------------------------- | --------------------------------------------------- |
| `SENTRY_DSN`        | DSN del proyecto             | Sentry → Project Settings → Client Keys (DSN)       |
| `SENTRY_ORG`        | Slug de la organización      | Sentry → URL o Settings (ej. `realtor-trackpro`)    |
| `SENTRY_PROJECT`    | Slug del proyecto            | Sentry → Project Settings (ej. `javascript-nextjs`) |
| `SENTRY_AUTH_TOKEN` | Token para subir source maps | Sentry → Settings → Auth Tokens                     |

Aplicar a **Production**, **Preview** y **Development** según quieras recibir eventos en cada entorno.

## 4. Redeploy

Después de guardar las variables, hacer un nuevo deploy (o redeploy del último) para que el build use Sentry y suba los source maps.

Si no configurás `SENTRY_DSN`, Sentry no se inicializa y la app sigue funcionando sin reportar errores.
