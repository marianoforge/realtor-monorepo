# Instrucciones para el Bot - Consulta de Operaciones

## 📋 Descripción General

Este documento contiene instrucciones críticas para configurar un bot que responda preguntas sobre operaciones inmobiliarias usando el JSON exportado de Firestore.

## 🔐 SEGURIDAD - MUY IMPORTANTE

### Regla Principal de Filtrado

**ANTES DE RESPONDER CUALQUIER PREGUNTA, EL BOT DEBE:**

1. **Identificar el uid del usuario que hace la pregunta**
2. **Filtrar las operaciones para mostrar SOLO las que pertenecen a ese usuario**

### Lógica de Filtrado

```javascript
// Pseudocódigo para filtrar operaciones
const userOperations = allOperations.filter((operation) => {
  return operation.teamId === currentUserUid;
});
```

**Campo de Filtrado:**

- `teamId`: Contiene el uid del usuario que creó/posee la operación

**Otros campos de usuario (NO usar para filtrado principal):**

- `user_uid`: UID del asesor principal asignado a la operación
- `user_uid_adicional`: UID del asesor adicional (operaciones compartidas)

## 📊 Estructura del JSON Exportado

```json
{
  "exportDate": "2025-10-03T...",
  "totalOperations": 150,
  "operations": [
    {
      "id": "abc123",
      "teamId": "uid_usuario_creador",
      "user_uid": "uid_asesor_principal",
      "user_uid_adicional": "uid_asesor_adicional",
      "fecha_operacion": "2024-05-15",
      "direccion_reserva": "Calle Ejemplo 123",
      "tipo_operacion": "Venta",
      "valor_reserva": 250000,
      "estado": "RESERVA"
      // ... más campos
    }
  ],
  "metadata": {
    "version": "1.0",
    "description": "Exportación completa de operaciones inmobiliarias",
    "filterInstructions": "IMPORTANTE: Filtrar por teamId..."
  }
}
```

## 🔑 Campos Importantes de las Operaciones

### Identificación y Pertenencia

- `id`: ID único de la operación
- `teamId`: **UID del usuario que creó la operación (FILTRAR POR ESTE CAMPO)**
- `user_uid`: UID del asesor principal asignado
- `user_uid_adicional`: UID del asesor adicional (si existe)

### Fechas

- `fecha_operacion`: Fecha de cierre de la operación
- `fecha_reserva`: Fecha de reserva
- `fecha_captacion`: Fecha de captación del cliente

### Ubicación

- `direccion_reserva`: Dirección de la propiedad
- `localidad_reserva`: Ciudad/Localidad
- `provincia_reserva`: Provincia/Estado
- `pais`: País
- `numero_casa`: Número de casa/departamento

### Tipo y Características

- `tipo_operacion`: Tipo (Venta, Alquiler, Desarrollo)
- `tipo_inmueble`: Tipo de inmueble (Apartamento, Casa, Local, etc.)
- `exclusiva`: Si tiene contrato de exclusividad (boolean)
- `no_exclusiva`: Si NO tiene exclusividad (boolean)

### Valores Económicos

- `valor_reserva`: Valor total de la operación
- `honorarios_asesor`: Honorarios del asesor
- `honorarios_broker`: Honorarios del broker
- `porcentaje_honorarios_asesor`: Porcentaje de comisión del asesor
- `porcentaje_punta_compradora`: Porcentaje punta compradora
- `porcentaje_punta_vendedora`: Porcentaje punta vendedora
- `gastos_operacion`: Gastos de la operación
- `beneficio_despues_gastos`: Beneficio neto
- `rentabilidad`: Rentabilidad porcentual

### Estado y Participantes

- `estado`: Estado de la operación (RESERVA, EN_CURSO, CAIDA, ESCRITURADA)
- `realizador_venta`: Nombre del realizador
- `realizador_venta_adicional`: Realizador adicional
- `referido`: Nombre de quien refirió
- `compartido`: Con quién se comparte

### Puntas

- `punta_compradora`: boolean - ¿Tiene punta compradora?
- `punta_vendedora`: boolean - ¿Tiene punta vendedora?

## 🤖 Ejemplos de Preguntas y Respuestas

### Ejemplo 1: Consulta General

**Usuario pregunta:** "¿Cuántas operaciones tengo?"

**Bot debe:**

1. Identificar `uid` del usuario actual
2. Filtrar: `operations.filter(op => op.teamId === userUid)`
3. Responder: "Tienes X operaciones registradas"

### Ejemplo 2: Consulta por Tipo

**Usuario pregunta:** "¿Cuántas ventas tengo cerradas?"

**Bot debe:**

1. Filtrar por `teamId === userUid`
2. Filtrar por `tipo_operacion === "Venta"`
3. Filtrar por `estado === "ESCRITURADA"` (o estados que consideres "cerradas")
4. Contar y responder

### Ejemplo 3: Consulta Financiera

**Usuario pregunta:** "¿Cuánto he ganado en comisiones este año?"

**Bot debe:**

1. Filtrar por `teamId === userUid`
2. Filtrar por `fecha_operacion` del año actual
3. Sumar `honorarios_asesor` de todas las operaciones
4. Responder con el total

### Ejemplo 4: Consulta por Ubicación

**Usuario pregunta:** "¿Qué operaciones tengo en Montevideo?"

**Bot debe:**

1. Filtrar por `teamId === userUid`
2. Filtrar por `localidad_reserva` o `provincia_reserva` que contenga "Montevideo"
3. Listar las operaciones encontradas

## 🚨 Casos de Error a Manejar

### Sin Operaciones

```
Si no hay operaciones para el usuario:
"No tienes operaciones registradas en el sistema."
```

### Pregunta Ambigua

```
Si la pregunta no es clara:
"¿Podrías ser más específico? Por ejemplo, ¿te refieres a operaciones de este mes/año? ¿De qué tipo?"
```

### Datos Faltantes

```
Si faltan datos en una operación:
"Encontré X operaciones, pero Y de ellas no tienen [campo] especificado."
```

## 🔄 Actualización del JSON

### ¿Cuándo actualizar?

- Ejecutar el script diariamente (recomendado)
- O ejecutar bajo demanda cuando se agreguen nuevas operaciones

### Script de Exportación

```bash
# Ejecutar el script
npx ts-node scripts/export-operations-to-json.ts

# Resultado: Se genera en /exports/operations-latest.json
```

### Automatización con Cron (Opcional)

Considera configurar un cron job que:

1. Ejecute el script de exportación
2. Suba automáticamente el JSON a Google Drive
3. Tu bot siempre tendrá datos actualizados

## 📤 Subir a Google Drive

### Pasos para subir el archivo

1. Ir a Google Drive
2. Subir el archivo `exports/operations-latest.json`
3. Configurar permisos:
   - Si es un bot de Google (Dialogflow, etc.): Dar acceso a la cuenta de servicio
   - Si es otro bot: Generar link compartido con permisos de lectura

### Configuración del Bot

El bot debe:

1. Descargar/leer el JSON desde Google Drive
2. Parsearlo a un objeto JavaScript/Python
3. Al recibir una pregunta:
   - Obtener el `uid` del usuario
   - Filtrar `operations` donde `operation.teamId === userUid`
   - Procesar la pregunta con los datos filtrados
   - Responder solo con información de esas operaciones

## 🔐 Consideraciones de Privacidad

### NUNCA el bot debe:

❌ Mostrar operaciones de otros usuarios
❌ Revelar `uid` o `teamId` en las respuestas
❌ Compartir información financiera de otros usuarios
❌ Permitir búsquedas sin filtrar por usuario

### SIEMPRE el bot debe:

✅ Filtrar por `teamId` antes de procesar cualquier pregunta
✅ Validar que el usuario está autenticado
✅ Solo mostrar datos del usuario que pregunta (donde operation.teamId === userUid)
✅ Registrar accesos para auditoría (opcional pero recomendado)

## 📝 Notas Adicionales

### Estados de Operaciones

- `RESERVA`: Operación reservada
- `EN_CURSO`: En proceso
- `ESCRITURADA`: Finalizada/Cerrada
- `CAIDA`: Cancelada/No concretada

### Tipos de Operación

- `Venta`: Venta de propiedad
- `Alquiler`: Alquiler de propiedad
- `Desarrollo`: Desarrollo inmobiliario

### Cálculos Útiles

```javascript
// Total de comisiones por estado
const totalEscrituradas = operations
  .filter((op) => op.estado === "ESCRITURADA")
  .reduce((sum, op) => sum + op.honorarios_asesor, 0);

// Operaciones del mes actual
const thisMonth = operations.filter((op) => {
  const opDate = new Date(op.fecha_operacion);
  const now = new Date();
  return (
    opDate.getMonth() === now.getMonth() &&
    opDate.getFullYear() === now.getFullYear()
  );
});

// Valor promedio de operaciones
const avgValue =
  operations.reduce((sum, op) => sum + op.valor_reserva, 0) / operations.length;
```

## ✅ Checklist de Implementación

Antes de poner el bot en producción, verificar:

- [ ] El bot identifica correctamente el `uid` del usuario
- [ ] Se filtra correctamente por `teamId === userUid`
- [ ] Se probaron preguntas sobre operaciones de diferentes usuarios
- [ ] El bot NO muestra datos de otros usuarios
- [ ] Se maneja el caso de usuarios sin operaciones
- [ ] Se actualiza el JSON periódicamente
- [ ] El JSON en Google Drive es accesible para el bot
- [ ] Se registran los accesos (logs) para auditoría

---

**Fecha de creación:** $(date)
**Versión:** 1.0
**Mantenedor:** Sistema de Exportación Automática
