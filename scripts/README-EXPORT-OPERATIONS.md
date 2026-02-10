# Script de Exportación de Operaciones

## 📋 Descripción

Este script exporta todas las operaciones de Firestore a un archivo JSON para ser usado por un bot que responde preguntas sobre operaciones inmobiliarias.

## 🎯 Objetivo

Crear un archivo JSON que:

1. Contenga todas las operaciones de la base de datos
2. Incluya metadata y estadísticas
3. Pueda ser subido a Google Drive
4. Permita a un bot responder preguntas filtrando por `user_uid`

## 🚀 Uso

### Ejecución Directa

```bash
npx ts-node scripts/export-operations-to-json.ts
```

### Con NPM Script (recomendado)

```bash
npm run export-operations
```

## 📂 Archivos Generados

El script crea dos archivos en la carpeta `/exports`:

1. **operations-export-[timestamp].json**
   - Archivo con fecha y hora específica
   - Útil para mantener historial de exportaciones

2. **operations-latest.json**
   - Siempre contiene la última exportación
   - Usa este archivo para tu bot

## 📊 Estructura del JSON Exportado

```json
{
  "exportDate": "2025-10-03T12:00:00.000Z",
  "totalOperations": 150,
  "operations": [
    {
      "id": "operacion_id",
      "user_uid": "usuario_principal",
      "user_uid_adicional": "usuario_secundario",
      "teamId": "team_id",
      "fecha_operacion": "2024-05-15",
      "direccion_reserva": "Av. Principal 123",
      "tipo_operacion": "Venta",
      "valor_reserva": 250000,
      "estado": "ESCRITURADA"
      // ... todos los demás campos
    }
  ],
  "metadata": {
    "version": "1.0",
    "description": "Exportación completa de operaciones inmobiliarias",
    "filterInstructions": "IMPORTANTE: Filtrar por user_uid..."
  }
}
```

## 🔐 Seguridad y Filtrado

### ⚠️ MUY IMPORTANTE

Cuando el bot responda preguntas, **DEBE** filtrar las operaciones por `teamId`:

```javascript
// Filtrar operaciones para un usuario específico
const userOperations = exportedData.operations.filter((operation) => {
  return operation.teamId === currentUserId;
});
```

**Campo de filtrado:**

- `teamId`: Contiene el uid del usuario que creó/posee la operación

**Otros campos de usuario (NO usar para filtrado principal):**

- `user_uid`: UID del asesor principal asignado
- `user_uid_adicional`: UID del asesor adicional (opcional)

## 📈 Estadísticas que Muestra el Script

Al ejecutarse, el script muestra:

- ✅ Total de operaciones exportadas
- 📊 Operaciones por tipo (Venta, Alquiler, Desarrollo)
- 📊 Operaciones por estado (RESERVA, EN_CURSO, ESCRITURADA, CAIDA)
- 👥 Número de usuarios únicos

Ejemplo de salida:

```
✅ Operaciones exportadas exitosamente:
   📄 Archivo con timestamp: /exports/operations-export-2025-10-03T12-00-00.json
   📄 Archivo latest: /exports/operations-latest.json

📊 Estadísticas:
   Total de operaciones: 150
   Por tipo de operación:
     - Venta: 80
     - Alquiler: 50
     - Desarrollo: 20
   Por estado:
     - ESCRITURADA: 90
     - EN_CURSO: 40
     - RESERVA: 15
     - CAIDA: 5
   Usuarios únicos: 25
```

## 📤 Subir a Google Drive

### Opción 1: Manual

1. Ejecuta el script
2. Ve a la carpeta `/exports`
3. Sube `operations-latest.json` a Google Drive
4. Comparte el archivo con permisos de lectura
5. Configura tu bot para leer desde esa URL

### Opción 2: Automatizado (Recomendado)

Considera crear un script que:

1. Ejecute la exportación
2. Use Google Drive API para subir automáticamente
3. Se ejecute diariamente con un cron job

## 🔄 Actualización Periódica

### Actualización Manual

Ejecuta el script cuando:

- Se agreguen nuevas operaciones
- Se modifiquen operaciones existentes
- Tu bot necesite datos actualizados

### Actualización Automática

Puedes configurar un cron job (en el servidor o Vercel Cron):

```typescript
// pages/api/cron/export-operations.ts
export default async function handler(req, res) {
  // Validar cron secret
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Ejecutar exportación
  await exportOperations();

  // Opcional: Subir a Google Drive automáticamente
  await uploadToGoogleDrive();

  return res.status(200).json({ success: true });
}
```

Configurar en `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/export-operations",
      "schedule": "0 2 * * *"
    }
  ]
}
```

## 🤖 Configuración del Bot

### Paso 1: Leer el JSON

```javascript
// Ejemplo con fetch
const response = await fetch("URL_GOOGLE_DRIVE_JSON");
const data = await response.json();
```

### Paso 2: Filtrar por Usuario

```javascript
function getUserOperations(allData, userId) {
  return allData.operations.filter((op) => op.teamId === userId);
}
```

### Paso 3: Responder Preguntas

```javascript
// Ejemplo: "¿Cuántas operaciones tengo?"
const userOps = getUserOperations(data, currentUserId);
return `Tienes ${userOps.length} operaciones registradas.`;

// Ejemplo: "¿Cuánto he ganado en comisiones?"
const total = userOps.reduce((sum, op) => sum + op.honorarios_asesor, 0);
return `Has ganado $${total.toLocaleString()} en comisiones.`;
```

## 📝 Campos Disponibles para Consultas

El bot puede responder preguntas sobre:

### Información Básica

- Dirección, localidad, provincia, país
- Tipo de operación (Venta/Alquiler/Desarrollo)
- Tipo de inmueble (Casa/Apartamento/etc)
- Fechas (operación, reserva, captación)
- Estado (RESERVA/EN_CURSO/ESCRITURADA/CAIDA)

### Valores Económicos

- Valor de reserva
- Honorarios del asesor
- Honorarios del broker
- Porcentajes de comisión
- Gastos de operación
- Beneficio neto
- Rentabilidad

### Participantes

- Realizador de venta
- Realizador adicional
- Referidos
- Compartido con

### Características

- Punta compradora (sí/no)
- Punta vendedora (sí/no)
- Exclusiva (sí/no)
- No exclusiva (sí/no)

## 🐛 Troubleshooting

### Error: Firebase Admin no inicializado

```
Solución: Verifica que las variables de entorno estén configuradas:
- FIREBASE_PROJECT_ID
- FIREBASE_PRIVATE_KEY
- FIREBASE_CLIENT_EMAIL
```

### Error: No se encontraron operaciones

```
Solución: Verifica que:
1. La colección en Firestore se llama "operations"
2. Tienes operaciones en la base de datos
3. Tienes permisos de lectura
```

### Error: No se puede crear la carpeta /exports

```
Solución: El script crea la carpeta automáticamente,
pero verifica permisos de escritura en el directorio del proyecto.
```

## 📚 Documentación Adicional

- **BOT_INSTRUCTIONS.md**: Instrucciones detalladas para configurar el bot
- **common/types/index.ts**: Definición completa de la interfaz Operation

## ⚙️ Requisitos

- Node.js 14+
- TypeScript
- Firebase Admin SDK configurado
- Variables de entorno de Firebase configuradas

## 🔗 Enlaces Útiles

- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Google Drive API](https://developers.google.com/drive/api/v3/about-sdk)
- [Dialogflow](https://cloud.google.com/dialogflow/docs) (si usas para el bot)

---

**Última actualización:** Octubre 2025
**Versión del script:** 1.0
