# Dashboard Principal: Cálculos, Números y Gráficas

Este documento explica qué significa cada número y gráfica del Dashboard de Realtor Trackpro y cómo se calculan.

---

## 1. Métricas Principales (Burbujas)

Las burbujas superiores muestran un resumen del año seleccionado (por defecto el año actual). Todas usan solo **operaciones cerradas** del año, salvo las que indican "en curso".

### Honorarios Netos

- **Qué es:** Monto total de honorarios que te quedan a vos (después de franquicia, repartición con asesores, etc.) por las operaciones **cerradas** del año.
- **Cálculo:** Se suma el resultado de cada operación cerrada aplicando tu rol (asesor o broker): si sos asesor, tu porcentaje de honorarios menos franquicia si aplica; si sos broker, lo que queda después de pagar a asesores, franquicia y repartición.
- **No incluye:** Operaciones abiertas, en reserva o caídas.

### Honorarios Brutos

- **Qué es:** Monto total de honorarios de la oficina/broker **antes** de descontar lo que va a asesores, franquicia o repartición, solo de operaciones cerradas del año.
- **Cálculo:** Suma de `honorarios_broker` de cada operación cerrada. En operaciones con "captación no es mía" no se suma al bruto.
- **Fórmula por operación:** `valor_reserva × (porcentaje_honorarios_broker/100)` menos descuentos por compartido y referido.

### Monto Ops. Cerradas

- **Qué es:** Suma del valor de todas las operaciones cerradas del año (valor de reserva/venta).
- **Cálculo:** Suma de `valor_reserva` de operaciones con estado "cerrada" y fecha del año seleccionado.

### Cantidad Total de Puntas

- **Qué es:** Cuántas puntas (compradora + vendedora) tenés en operaciones cerradas del año.
- **Cálculo:** Para cada operación cerrada se cuenta 1 si tiene punta compradora y 1 si tiene punta vendedora. Total = suma de ambas.

### Promedio Valor Operación

- **Qué es:** Valor promedio de las operaciones de venta, compra y desarrollo (se excluyen alquileres).
- **Cálculo:** Suma de `valor_reserva` de operaciones cerradas de tipo Venta, Compra y Desarrollo Inmobiliario, dividido por la cantidad de esas operaciones.

### Operaciones Cerradas

- **Qué es:** Número de operaciones con estado "cerrada" en el año.
- **Cálculo:** Conteo de operaciones donde `estado === "cerrada"` y la fecha de operación o reserva corresponde al año.

### Promedio Mensual Honorarios Netos

- **Qué es:** Promedio de honorarios netos por mes en los meses ya transcurridos del año.
- **Cálculo:** Se toman solo los meses ya pasados (ej. si estamos en junio, de enero a mayo). Por cada mes se suman los honorarios netos de las operaciones cerradas en ese mes. Luego se divide esa suma total por la cantidad de meses con datos.

### Honorarios Netos en Curso

- **Qué es:** Honorarios netos que corresponderían si se cerraran hoy todas las operaciones en curso (reserva/abiertas).
- **Cálculo:** Misma lógica que "Honorarios Netos" pero aplicada solo a operaciones con estado "en curso".

### Honorarios Brutos en Curso

- **Qué es:** Honorarios brutos de las operaciones que aún están en curso.
- **Cálculo:** Suma de honorarios broker de todas las operaciones en curso del año.

---

## 2. Objetivo Anual de Ventas

- **Qué es:** Un semáforo en forma de media dona que muestra cuánto del objetivo anual de honorarios brutos llevás cumplido.
- **Cálculo:** `(Honorarios brutos del año / Objetivo anual) × 100`.
- **Objetivo anual:** Es un valor que configurás en **Configuración (Settings)**. Si no lo cargaste, el gráfico te invita a agregarlo.
- **Colores:** 0–25% rojo, 25–50% amarillo, 50–75% verde claro, 75–100% verde fuerte. Si pasás 100% se muestra lleno.

---

## 3. Rentabilidad

Hay una o dos tarjetas según si sos asesor o broker.

### Rentabilidad Propia (todos)

- **Qué es:** Porcentaje de los honorarios netos que te quedan después de restar tus gastos.
- **Fórmula:** `((Honorarios netos del año − Gastos del año) / Honorarios netos) × 100`.
- **Gastos:** Suma de tus gastos registrados en "Lista de Gastos" del año (egresos). Si tu moneda no es USD se usa el monto en moneda local.

### Rentabilidad Total (solo Broker)

- **Qué es:** Porcentaje de los honorarios brutos del equipo que queda después de restar todos los gastos (propios + del equipo).
- **Fórmula:** `((Honorarios brutos + ingresos por movimientos del equipo − Gastos totales) / Honorarios brutos) × 100`.
- **Gastos totales:** Tus gastos + gastos de todos los asesores del equipo del año.

---

## 4. Días para Vender

- **Qué es:** Promedio de días entre la fecha de captación y la fecha de reserva/promesa en operaciones ya cerradas.
- **Cálculo:** Solo se consideran operaciones **cerradas** que tengan `fecha_captacion` y `fecha_reserva`. Se excluyen Alquiler Tradicional, Temporal, Comercial y Desarrollo Inmobiliario. Para cada una se calculan los días entre ambas fechas y se promedia.
- **Interpretación:** "X días" significa que en promedio tus operaciones de venta/compra tardan X días desde la captación hasta la reserva.

---

## 5. Exclusividad

- **Qué es:** Gráfico de torta que muestra qué parte de tus operaciones del año fueron exclusivas y cuáles no exclusivas.
- **Cálculo:** Se cuentan operaciones del año con `exclusiva === true` (y no no_exclusiva) vs `no_exclusiva === true` (y no exclusiva). Los porcentajes son sobre el total de esas operaciones.
- **Exclusiva:** Solo vos manejás la propiedad. **No exclusiva:** Compartida con otros inmobiliarios.

---

## 6. Cuadro Tipos de Operaciones

Tabla que desglosa por **tipo de operación** (Venta, Compra, Alquiler Tradicional, etc.) solo operaciones **cerradas** del año.

- **Tipo de operación:** Venta, Compra, Alquiler Tradicional, Alquiler Comercial, Alquiler Temporal, Fondo de Comercio, Desarrollo Inmobiliario.
- **Cantidad de operaciones:** Cuántas operaciones cerradas hay de ese tipo en el año.
- **Porcentaje sobre el total:** `(Cantidad de ese tipo / Total operaciones cerradas del año) × 100`.
- **% Ganancias brutas:** `(Honorarios brutos de ese tipo / Total honorarios brutos de todas las operaciones cerradas del año) × 100`. Muestra qué parte de tus honorarios brutos vino de cada tipo.

---

## 7. Gráfico de Líneas – Puntas por Mes

- **Qué es:** Evolución mes a mes de la **cantidad de puntas** (compradora + vendedora) en operaciones cerradas.
- **Cálculo:** Por cada mes del año se suman las puntas de las operaciones cerradas en ese mes. Suele mostrarse año actual vs año anterior.
- **Uso:** Ver si estás cerrando más o menos puntas que el año pasado en cada mes.

---

## 8. Gráfico por Tipo de Inmueble

- **Qué es:** Gráfico de torta (o barras) con la distribución de operaciones cerradas del año por **tipo de inmueble** (departamento, casa, local, etc.).
- **Cálculo:** Conteo de operaciones cerradas agrupadas por el campo tipo de inmueble de cada operación.

---

## 9. Operaciones Compartidas / Referidas

- **Qué es:** Muestra cuántas operaciones del año fueron compartidas con otro agente o referidas por alguien.
- **Cálculo:** Conteo según los campos de la operación que indican si hubo porcentaje compartido o referido (y si son mayores a cero).

---

## 10. Gráfico de Tortas – Tipos de Operación (Cerradas)

- **Qué es:** Otra vista de la distribución de operaciones cerradas por tipo (Venta, Compra, Alquiler Tradicional, etc.).
- **Cálculo:** Mismo agrupamiento que el "Cuadro Tipos de Operaciones": cada porción es la cantidad de operaciones de ese tipo en el año.

---

## 11. Operaciones Caídas

- **Qué es:** Gráfico (torta o barras) de operaciones con estado **"caída"** en el año (promesa que no se concretó).
- **Cálculo:** Conteo de operaciones con `estado === "caída"` y fecha del año, agrupadas por tipo de operación.
- **Uso:** Ver en qué tipos se te caen más operaciones.

---

## 12. Proyecciones

- **Qué es:** Gráfico de líneas que muestra:
  - **Ventas acumuladas:** Honorarios brutos acumulados mes a mes de operaciones cerradas (hasta el mes actual).
  - **Proyección:** Una línea plana con el total esperado si se suman honorarios de cerradas + honorarios de operaciones en curso.
- **Cálculo:** Por cada mes hasta el actual se suman los honorarios broker de operaciones cerradas en ese mes y se va acumulando. La proyección = honorarios ya cerrados en el año + honorarios brutos de todas las operaciones en curso.
- **Uso:** Comparar cuánto llevás cerrado vs cuánto podrías llegar a cerrar.

---

## 13. Honorarios Netos Mensuales (Barras)

- **Qué es:** Barras por mes comparando **año actual vs año anterior**: honorarios netos por mes en cada año.
- **Cálculo:** Para cada mes se suman los honorarios netos (misma lógica que "Honorarios Netos" de las burbujas) de las operaciones cerradas en ese mes. Una barra por año (ej. 2024 vs 2023).
- **Uso:** Ver mes a mes si este año vas mejor o peor que el anterior en honorarios netos.

---

## 14. Honorarios Brutos Mensuales (Barras)

- **Qué es:** Igual que el anterior pero con **honorarios brutos** por mes, año actual vs año anterior.
- **Cálculo:** Suma de honorarios broker por mes de operaciones cerradas, por año.
- **Uso:** Comparar volumen bruto mensual entre los dos años.

---

## Resumen de conceptos clave

- **Honorarios brutos:** Lo que factura la oficina por la operación (antes de repartir con asesores o pagar franquicia).
- **Honorarios netos:** Lo que te queda a vos según tu rol (después de asesores, franquicia, repartición).
- **Operaciones cerradas:** Estado "cerrada" (transferencia o cierre hecho).
- **Operaciones en curso:** Estado "en curso" o en reserva/promesa aún no cerrada.
- **Punta compradora / vendedora:** Si vos tenés la punta del comprador o del vendedor en esa operación (se usan para contar "cantidad de puntas").
- **Año efectivo:** Por defecto es el año actual; en algunos entornos de demo puede usarse otro año (ej. 2025).

Si una métrica no aparece o da cero, suele ser porque no hay operaciones que cumplan el filtro (año, estado, tipo) o porque falta configurar algo (por ejemplo objetivo anual en Settings o moneda en tu perfil).
