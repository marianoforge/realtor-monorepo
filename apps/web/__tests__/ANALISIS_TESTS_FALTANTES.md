# Análisis de Tests Unitarios Faltantes - GDS SI

## 📊 Resumen Ejecutivo

Este documento identifica funciones críticas del sistema que **NO tienen tests unitarios** y que deberían tenerlos por su importancia en el negocio.

---

## 🔴 **CRÍTICOS - Prioridad Alta**

### 1. **Filtrado de Operaciones** (`filteredOperations.ts`)

**Archivo:** `common/utils/filteredOperations.ts`

**Por qué es crítico:**

- Lógica compleja de filtrado por estado, año y mes
- Maneja casos especiales para operaciones "En Curso"
- Usado en toda la aplicación para mostrar operaciones

**Tests necesarios:**

- ✅ Filtrar por estado (Cerrada, En Curso, Caída, Todas)
- ✅ Filtrar por año específico
- ✅ Filtrar por mes específico
- ✅ Filtrar por año y mes combinados
- ✅ Operaciones "En Curso" siempre usan año/mes actual
- ✅ Operaciones sin fecha (solo cerradas/caídas se excluyen)
- ✅ Casos edge: "all" en año y mes

**Impacto:** 🔴 **ALTO** - Si falla, los usuarios no ven las operaciones correctas

---

### 2. **Búsqueda de Operaciones** (`filterOperationsBySearch.ts`)

**Archivo:** `common/utils/filterOperationsBySearch.ts`

**Por qué es crítico:**

- Búsqueda con normalización de acentos
- Busca en múltiples campos (dirección, realizador, número)
- Usado en la tabla principal de operaciones

**Tests necesarios:**

- ✅ Búsqueda por dirección (con y sin acentos)
- ✅ Búsqueda por realizador_venta
- ✅ Búsqueda por numero_casa
- ✅ Búsqueda case-insensitive
- ✅ Normalización de acentos (á → a)
- ✅ Búsqueda vacía retorna todas las operaciones
- ✅ Búsqueda parcial (substring)

**Impacto:** 🔴 **ALTO** - Si falla, los usuarios no pueden encontrar operaciones

---

### 3. **Cálculo de Honorarios Netos** (`calculateNetFees.ts`)

**Archivo:** `common/utils/calculateNetFees.ts`

**Por qué es crítico:**

- Calcula honorarios netos considerando múltiples factores
- Usado en cálculos financieros críticos
- Afecta reportes y dashboard

**Tests necesarios:**

- ✅ Cálculo básico de honorarios netos
- ✅ Aplicación de descuentos (compartido, referido)
- ✅ Casos con franquicia/broker
- ✅ Casos con captacion_no_es_mia
- ✅ Casos con múltiples asesores
- ✅ Edge cases: valores 0, negativos, null

**Impacto:** 🔴 **ALTO** - Errores aquí = errores en dinero real

---

### 4. **Store de Cálculos** (`calculationsStore.ts`)

**Archivo:** `stores/calculationsStore.ts`

**Por qué es crítico:**

- Estado global de todos los cálculos
- Usado en múltiples componentes
- Maneja lógica compleja de filtros dinámicos

**Tests necesarios:**

- ✅ `calculateResults()` - cálculo básico
- ✅ `calculateResultsByFilters()` - con filtros
- ✅ Separación de operaciones cerradas vs en curso
- ✅ Cálculo de honorarios brutos en curso (año actual + anterior)
- ✅ Reset del store
- ✅ Manejo de cambios de usuario
- ✅ Persistencia del estado

**Impacto:** 🔴 **ALTO** - Estado central del sistema

---

### 5. **Schemas de Validación API** (`lib/schemas/`)

**Archivos:**

- `operation.schema.ts`
- `expense.schema.ts`
- `event.schema.ts`
- `prospection.schema.ts`
- `teamMember.schema.ts`
- `user.schema.ts`

**Por qué es crítico:**

- Validación de entrada de datos
- Prevención de datos inválidos en la base de datos
- Seguridad y integridad de datos

**Tests necesarios (por schema):**

- ✅ Validación de campos requeridos
- ✅ Validación de tipos de datos
- ✅ Validación de rangos (porcentajes 0-100, etc.)
- ✅ Validación de formatos (email, fecha, etc.)
- ✅ Campos opcionales/nullables
- ✅ Transformaciones de datos
- ✅ Casos edge: valores límite

**Impacto:** 🔴 **ALTO** - Prevención de bugs y seguridad

---

## 🟡 **IMPORTANTES - Prioridad Media**

### 6. **Utilidades de Formato** (`formatNumber.ts`, `formatValue.ts`, etc.)

**Archivos:**

- `common/utils/formatNumber.ts`
- `common/utils/formatValue.ts`
- `common/utils/formatDate.ts`
- `common/utils/formatCompactNumber.ts`

**Por qué es importante:**

- Formato consistente en toda la UI
- Manejo de diferentes monedas
- Formato de números grandes (K, M)

**Tests necesarios:**

- ✅ Formato de números con separadores de miles
- ✅ Formato de porcentajes
- ✅ Formato de monedas (diferentes símbolos)
- ✅ Formato compacto (1.5K, 2.3M)
- ✅ Formato de fechas (diferentes formatos)
- ✅ Manejo de valores null/undefined/0

**Impacto:** 🟡 **MEDIO** - UX y consistencia visual

---

### 7. **Cálculos de Agentes** (`calculationsAgents.ts`)

**Archivo:** `common/utils/calculationsAgents.ts`

**Por qué es importante:**

- Cálculos específicos para agentes
- Diferentes lógicas según rol

**Tests necesarios:**

- ✅ Cálculos para diferentes roles
- ✅ Repartición entre múltiples agentes
- ✅ Casos con agentes adicionales
- ✅ Edge cases

**Impacto:** 🟡 **MEDIO** - Afecta cálculos de comisiones

---

### 8. **Cálculos por Mes** (`calculationsGrossByMonth.ts`)

**Archivo:** `common/utils/calculationsGrossByMonth.ts`

**Por qué es importante:**

- Usado en gráficos mensuales
- Agrupación de operaciones por mes

**Tests necesarios:**

- ✅ Agrupación correcta por mes
- ✅ Cálculo de totales mensuales
- ✅ Manejo de meses sin operaciones
- ✅ Operaciones que cruzan años

**Impacto:** 🟡 **MEDIO** - Afecta visualizaciones

---

### 9. **Utilidades de Fechas** (`getOperationYear.ts`, `formatDate.ts`)

**Archivos:**

- `common/utils/getOperationYear.ts`
- `common/utils/formatDate.ts`
- `common/utils/formatDateForUser.ts`

**Por qué es importante:**

- Lógica compleja para determinar año de operación
- Formato consistente de fechas

**Tests necesarios:**

- ✅ Extracción de año de diferentes campos de fecha
- ✅ Prioridad de campos (fecha_operacion > fecha_reserva > fecha_captacion)
- ✅ Operaciones "En Curso" usan año actual
- ✅ Formato de fechas en diferentes locales
- ✅ Manejo de fechas inválidas/null

**Impacto:** 🟡 **MEDIO** - Afecta filtros y visualizaciones

---

### 10. **Utilidades de Moneda** (`currencyUtils.ts`)

**Archivo:** `common/utils/currencyUtils.ts`

**Por qué es importante:**

- Conversión y formato de monedas
- Símbolos correctos por moneda

**Tests necesarios:**

- ✅ Obtención de símbolo por código de moneda
- ✅ Formato de valores según moneda
- ✅ Manejo de monedas desconocidas
- ✅ Valores por defecto

**Impacto:** 🟡 **MEDIO** - Afecta visualización de montos

---

## 🟢 **ÚTILES - Prioridad Baja**

### 11. **Hooks Personalizados**

**Archivos en:** `common/hooks/`

**Hooks críticos que deberían tener tests:**

- `useOperationsData.ts` - Fetch y manejo de operaciones
- `useAnnualReportData.ts` - Datos para reporte anual
- `useEventCountsByWeek.ts` - Conteos semanales
- `useProjectionData.tsx` - Datos de proyecciones

**Tests necesarios:**

- ✅ Fetch de datos
- ✅ Manejo de estados (loading, error)
- ✅ Caché y refetch
- ✅ Transformación de datos

**Impacto:** 🟢 **BAJO** - Más para integración que unitarios

---

### 12. **Utilidades de Ordenamiento** (`sortUtils.ts`)

**Archivo:** `common/utils/sortUtils.ts`

**Tests necesarios:**

- ✅ Ordenamiento por valor
- ✅ Ordenamiento por fecha
- ✅ Ordenamiento ascendente/descendente
- ✅ Manejo de valores null

**Impacto:** 🟢 **BAJO** - Funcionalidad auxiliar

---

### 13. **Utilidades de Teléfono** (`phoneUtils.ts`)

**Archivo:** `common/utils/phoneUtils.ts`

**Tests necesarios:**

- ✅ Formato de números de teléfono
- ✅ Validación de teléfonos
- ✅ Normalización de formatos

**Impacto:** 🟢 **BAJO** - Validación de entrada

---

## 📋 **Recomendaciones de Implementación**

### Orden Sugerido:

1. **Semana 1:** Tests de filtrado y búsqueda (items 1-2)
2. **Semana 2:** Tests de cálculos críticos (items 3-4)
3. **Semana 3:** Tests de schemas de validación (item 5)
4. **Semana 4:** Tests de utilidades de formato (item 6)
5. **Semanas siguientes:** Items de prioridad media y baja

### Cobertura Objetivo:

- **Funciones críticas:** 90%+ cobertura
- **Funciones importantes:** 80%+ cobertura
- **Funciones útiles:** 70%+ cobertura

### Mejores Prácticas:

1. ✅ Usar el mismo patrón de `createMockOperation` y `createMockUserData`
2. ✅ Probar casos edge (null, undefined, 0, valores límite)
3. ✅ Probar casos de negocio reales (como el caso del usuario qaab6bRZHpZiRuq6981thD3mYm03)
4. ✅ Agrupar tests por funcionalidad
5. ✅ Documentar casos de negocio complejos

---

## ✅ **Tests Ya Existentes (No duplicar)**

- ✅ `calculations.test.ts` - Cálculos básicos
- ✅ `calculateNetFees.test.ts` - Honorarios netos (parcial)
- ✅ `calculateOperationProfit.test.ts` - Rentabilidad
- ✅ `calculationsAgents.test.ts` - Cálculos de agentes
- ✅ `calculationsGrossByMonth.test.ts` - Cálculos mensuales
- ✅ `calculationsPrincipal.test.ts` - Cálculos principales
- ✅ `operacionesCompartidas.test.ts` - Operaciones compartidas
- ✅ `operationsFormSchema.test.ts` - Schema de operaciones
- ✅ `loginFormSchema.test.ts` - Schema de login
- ✅ `registerFormSchema.test.ts` - Schema de registro
- ✅ `phoneUtils.test.ts` - Utilidades de teléfono
- ✅ `firestoreUtils.test.ts` - Utilidades de Firestore
- ✅ `userDataStore.test.ts` - Store de datos de usuario

---

## 🎯 **Conclusión**

**Total de funciones críticas sin tests:** ~10-15

**Impacto estimado de implementar estos tests:**

- 🔴 Reducción de bugs críticos: 60-80%
- 🟡 Mejora en confiabilidad: 40-60%
- 🟢 Facilita refactoring: 70-90%

**Prioridad:** Empezar con items 1-5 (críticos) antes de continuar con el resto.
