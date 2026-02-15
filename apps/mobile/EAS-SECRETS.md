# EAS Secrets (mobile build)

Las credenciales de Firebase ya no van en `eas.json`. Se usan **dos API keys** (una restringida a Android, otra a iOS) y el resto de variables en EAS. El build elige la key según la plataforma.

## Variables por plataforma

- **Android:** `EXPO_PUBLIC_FIREBASE_API_KEY_ANDROID` → key de Google Cloud con restricción "Android apps".
- **iOS:** `EXPO_PUBLIC_FIREBASE_API_KEY_IOS` → key de Google Cloud con restricción "iOS apps".
- **Web:** key propia con restricción "Websites" en Vercel y `.env.local` (no EAS).

## Configurar en EAS

En [expo.dev](https://expo.dev) → tu proyecto → **Environment variables**, agregar:

| Nombre                                     | Uso           | Valor                                       |
| ------------------------------------------ | ------------- | ------------------------------------------- |
| `EXPO_PUBLIC_FIREBASE_API_KEY_ANDROID`     | Build Android | Key restringida a Android (package + SHA-1) |
| `EXPO_PUBLIC_FIREBASE_API_KEY_IOS`         | Build iOS     | Key restringida a iOS (Bundle ID)           |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Ambas         | `gds-si.firebaseapp.com`                    |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID`          | Ambas         | `gds-si`                                    |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`      | Ambas         | `gds-si.appspot.com`                        |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Ambas         | `342233680729`                              |
| `EXPO_PUBLIC_FIREBASE_APP_ID`              | Ambas         | `1:342233680729:web:61230ada1e5b7737621a48` |
| `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID`      | Ambas         | `G-1917CJGN9D`                              |
| `EXPO_PUBLIC_FIREBASE_VAPID_KEY`           | Ambas         | Tu VAPID key                                |

El código en `src/lib/firebase.ts` usa `EXPO_PUBLIC_FIREBASE_API_KEY_ANDROID` en builds Android y `EXPO_PUBLIC_FIREBASE_API_KEY_IOS` en builds iOS.

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
