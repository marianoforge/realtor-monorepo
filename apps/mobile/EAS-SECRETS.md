# EAS Secrets (mobile build)

Las credenciales de Firebase y la API ya no van en `eas.json`. Hay que configurarlas como **EAS Secrets** para que el build de producción tenga las variables.

## Configurar secrets en EAS

Desde la raíz del monorepo:

```bash
cd apps/mobile
npx eas secret:create --name EXPO_PUBLIC_FIREBASE_API_KEY --value "tu-api-key" --type string
npx eas secret:create --name EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN --value "gds-si.firebaseapp.com" --type string
npx eas secret:create --name EXPO_PUBLIC_FIREBASE_PROJECT_ID --value "gds-si" --type string
npx eas secret:create --name EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET --value "gds-si.appspot.com" --type string
npx eas secret:create --name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --value "342233680729" --type string
npx eas secret:create --name EXPO_PUBLIC_FIREBASE_APP_ID --value "1:342233680729:web:61230ada1e5b7737621a48" --type string
npx eas secret:create --name EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID --value "G-1917CJGN9D" --type string
npx eas secret:create --name EXPO_PUBLIC_FIREBASE_VAPID_KEY --value "tu-vapid-key" --type string
```

O desde el dashboard: [expo.dev](https://expo.dev) → tu proyecto → Secrets.

## Si Google avisó que la API key estaba expuesta

1. **Regenerar la key en Google Cloud Console**
   - [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials.
   - Buscar la API key que estaba en el repo.
   - Edit → Regenerate Key. Copiar la nueva key.

2. **Restringir la nueva key**
   - En la key: Application restrictions (por ejemplo Android app con tu package name, o HTTP referrers para web).
   - API restrictions: solo las APIs que uses (Firebase, etc.).

3. **Actualizar la key en todos lados**
   - EAS Secrets: `EXPO_PUBLIC_FIREBASE_API_KEY` con la nueva key.
   - Web: en Vercel (o donde hostees) las env `NEXT_PUBLIC_FIREBASE_API_KEY` y las que use el build.
   - Local: `.env.local` (no se commitea) con la nueva key.

4. **No volver a commitear keys**
   - `eas.json` ya no tiene credenciales; solo `EXPO_PUBLIC_API_URL`.
   - El service worker de web usa placeholders que se reemplazan en el build desde env.
