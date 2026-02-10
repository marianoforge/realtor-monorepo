# Push notifications (mobile)

## Qué hace la app

- Al iniciar sesión, la app pide permiso para notificaciones y obtiene un **Expo Push Token**.
- Ese token se envía a `POST /api/messaging/save-fcm-token` y se guarda en el usuario (Firestore `usuarios/{uid}.fcmToken`).

## Cómo recibir notificaciones push

Para que las “alertas” o eventos se conviertan en push, el **backend** debe enviar la notificación cuando ocurra el evento (no se reemplaza `Alert.alert` en pantalla; el push es aparte).

### 1. projectId de EAS (necesario para el token)

En `app.json` reemplazá `null` por tu projectId de EAS:

```json
"extra": {
  "eas": {
    "projectId": "TU_PROJECT_ID"
  }
}
```

El projectId lo ves en https://expo.dev → tu cuenta → proyecto → Overview.

Si usás EAS Build, también podés configurarlo con `eas build:configure` y que quede en `app.config.js`.

### 2. Enviar desde el backend

Si en el usuario guardaste un **Expo Push Token** (empieza con `ExponentPushToken[...]`), tenés que usar la **Expo Push API**:

```bash
curl -X POST https://exp.host/--/api/v2/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "ExponentPushToken[xxxxxx]",
    "title": "Título",
    "body": "Cuerpo de la notificación"
  }'
```

Si en cambio guardaste un **FCM token** (por ejemplo en web), seguís usando Firebase Admin como hoy para enviar a ese token.

Ejemplo en Node para Expo Push:

```js
const fetch = require("node-fetch");

async function sendExpoPush(token, title, body) {
  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: token,
      title,
      body,
    }),
  });
}
```

Cuando ocurra algo que hoy mostrás como “alerta” (ej. operación marcada como caída, nuevo mensaje, etc.), además de tu lógica actual llamá a `sendExpoPush(userFcmToken, 'Título', 'Mensaje')` (o tu equivalente con FCM si el token es de Firebase).

### 3. Permisos

- **iOS**: notificaciones remotas suelen necesitar un perfil de provisioning y capability en Apple Developer.
- **Android**: con el plugin `expo-notifications` en `app.json` ya se configura el canal por defecto.

Resumen: la app ya registra el token y lo guarda en tu API. Para que las alertas sean también push, en el backend tenés que enviar una notificación (Expo Push API o FCM) cuando ocurra el evento correspondiente.
