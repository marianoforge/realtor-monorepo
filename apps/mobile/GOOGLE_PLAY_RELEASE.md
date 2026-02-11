# Subir release a Google Play (testing)

## Requisitos previos

- Cuenta en [Expo](https://expo.dev) (gratuita)
- Cuenta en [Google Play Console](https://play.google.com/console) (pago único para publicar)
- EAS CLI instalado (o usar `npx eas`)

## 1. Configurar EAS (solo la primera vez)

Desde la **raíz del monorepo**:

```bash
cd apps/mobile
npx eas login
npx eas build:configure
```

Si te pregunta por el proyecto, elegí "Create a new project" para vincular la app con tu cuenta de Expo. EAS puede modificar `app.json` para agregar `extra.eas.projectId`.

## 2. Generar el App Bundle (AAB) para Android

El perfil `production` en `eas.json` ya está configurado para generar un **app bundle** (formato requerido por Google Play).

Desde la **raíz del monorepo**:

```bash
yarn mobile:build:android
```

O desde `apps/mobile`:

```bash
npx eas build --platform android --profile production
```

- La build se ejecuta en la nube (Expo).
- Al terminar, podés descargar el `.aab` desde el [dashboard de Expo](https://expo.dev) → tu proyecto → Builds.

## 3. Subir a Google Play (Internal testing)

### Opción A: Con EAS Submit (recomendado)

Después de que la build termine:

```bash
cd apps/mobile
npx eas submit --platform android --profile production --latest --track internal
```

La primera vez EAS te pedirá:

- **Service account**: crear una cuenta de servicio en Google Play Console y descargar el JSON para que EAS suba por vos. [Guía de Expo](https://docs.expo.dev/submit/android/#using-a-service-account).

O podés subir el AAB a mano (Opción B) y más adelante configurar EAS Submit.

### Opción B: Subida manual en Play Console

1. Entrá a [Google Play Console](https://play.google.com/console).
2. Creá la aplicación si todavía no existe (nombre, idioma, tipo de app, etc.).
3. En el menú: **Testing** → **Internal testing** → **Create new release**.
4. Subí el archivo `.aab` que descargaste de Expo (o del enlace que te da EAS al finalizar la build).
5. Completá las notas de la release y guardá.
6. En **Testers**, agregá la lista de correos que podrán instalar la app en internal testing.
7. Guardá y enviá la release a revisión (si aplica). En internal testing la revisión suele ser muy rápida.

## 4. Versión y nombre de la app

- **Versión**: en `apps/mobile/app.json` está `version: "1.0.0"`. Para cada nueva subida a Play Console tenés que incrementar `versionCode` en Android (Expo lo deriva del `version` o de `android.versionCode` si lo definís).
- Para evitar conflictos en futuras subidas, podés fijar en `app.json`:

```json
"android": {
  "versionCode": 1,
  ...
}
```

Y en cada release incrementar `versionCode` (2, 3, …) y, si querés, también `version` (ej. "1.0.1").

## Resumen de comandos

| Acción                    | Comando                                                                                              |
| ------------------------- | ---------------------------------------------------------------------------------------------------- |
| Login EAS                 | `cd apps/mobile && npx eas login`                                                                    |
| Build Android (AAB)       | `yarn mobile:build:android` desde la raíz                                                            |
| Submit a Internal testing | `cd apps/mobile && npx eas submit --platform android --profile production --latest --track internal` |

Si querés usar otro track (por ejemplo `alpha` o `beta`), reemplazá `internal` por el nombre del track en el comando de submit.
