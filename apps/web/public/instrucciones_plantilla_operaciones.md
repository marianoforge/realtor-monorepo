# Instrucciones para la Plantilla de Operaciones

## Campos Obligatorios (marcados con \*)

| Campo                          | Descripción                                                       | Formato/Valores Válidos        |
| ------------------------------ | ----------------------------------------------------------------- | ------------------------------ |
| `fecha_reserva*`               | Fecha de la reserva                                               | YYYY-MM-DD (ej: 2025-01-15)    |
| `direccion_reserva*`           | Dirección del inmueble                                            | Texto libre                    |
| `tipo_operacion*`              | Tipo de operación                                                 | Ver lista abajo                |
| `valor_reserva*`               | Valor de la reserva/operación                                     | Número positivo (ej: 150000)   |
| `estado*`                      | Estado de la operación                                            | `En Curso`, `Cerrada`, `Caída` |
| `porcentaje_punta_compradora*` | Porcentaje punta compradora                                       | Número >= 0 (ej: 3)            |
| `porcentaje_punta_vendedora`   | Porcentaje punta vendedora (\* obligatorio excepto para "Compra") | Número >= 0 (ej: 3)            |
| `punta_compradora*`            | ¿Es punta compradora?                                             | `TRUE` o `FALSE`               |
| `punta_vendedora*`             | ¿Es punta vendedora?                                              | `TRUE` o `FALSE`               |

## Campos Opcionales

| Campo                                    | Descripción                               | Formato/Valores Válidos     |
| ---------------------------------------- | ----------------------------------------- | --------------------------- |
| `tipo_inmueble`                          | Tipo de inmueble (solo para Venta/Compra) | Ver lista abajo             |
| `fecha_operacion`                        | Fecha de cierre                           | YYYY-MM-DD                  |
| `fecha_captacion`                        | Fecha de captación                        | YYYY-MM-DD                  |
| `numero_casa`                            | Número/piso/depto                         | Texto libre                 |
| `localidad_reserva`                      | Localidad                                 | Texto libre                 |
| `provincia_reserva`                      | Provincia                                 | Ver lista abajo             |
| `porcentaje_honorarios_broker`           | % honorarios broker                       | Número >= 0                 |
| `exclusiva`                              | ¿Es exclusiva?                            | `TRUE` o `FALSE`            |
| `no_exclusiva`                           | ¿Es no exclusiva?                         | `TRUE` o `FALSE`            |
| `numero_sobre_reserva`                   | Número sobre reserva                      | Texto libre                 |
| `numero_sobre_refuerzo`                  | Número sobre refuerzo                     | Texto libre                 |
| `monto_sobre_reserva`                    | Monto sobre reserva                       | Número >= 0                 |
| `monto_sobre_refuerzo`                   | Monto sobre refuerzo                      | Número >= 0                 |
| `referido`                               | Nombre del referido                       | Texto libre                 |
| `compartido`                             | Nombre de quien se comparte               | Texto libre                 |
| `porcentaje_compartido`                  | % compartido                              | Número >= 0                 |
| `porcentaje_referido`                    | % referido                                | Número >= 0                 |
| `realizador_venta`                       | Email del asesor principal                | Email válido                |
| `porcentaje_honorarios_asesor`           | % honorarios asesor principal             | Número >= 0                 |
| `realizador_venta_adicional`             | Email del asesor adicional                | Email válido                |
| `porcentaje_honorarios_asesor_adicional` | % honorarios asesor adicional             | Número >= 0                 |
| `observaciones`                          | Observaciones                             | Texto libre                 |
| `pais`                                   | País                                      | Texto libre (ej: Argentina) |
| `gastos_operacion`                       | Gastos de la operación                    | Número >= 0                 |
| `captacion_no_es_mia`                    | ¿Captación no es mía?                     | `TRUE` o `FALSE`            |

---

## Valores Válidos por Campo

### Tipo de Operación (`tipo_operacion`)

- `Venta`
- `Compra`
- `Alquiler Temporal`
- `Alquiler Tradicional`
- `Alquiler Comercial`
- `Fondo de Comercio`
- `Desarrollo Inmobiliario`
- `Cochera`
- `Loteamiento`
- `Lotes Para Desarrollos`

### Estado (`estado`)

- `En Curso`
- `Cerrada`
- `Caída`

### Tipo de Inmueble (`tipo_inmueble`) - Solo para Venta/Compra

- `Casa`
- `PH`
- `Departamentos`
- `Locales Comerciales`
- `Oficinas`
- `Naves Industriales`
- `Terrenos`
- `Chacras`
- `Otro`

### Provincias Argentinas (`provincia_reserva`)

- `Buenos Aires`
- `CABA`
- `Catamarca`
- `Chaco`
- `Chubut`
- `Córdoba`
- `Corrientes`
- `Entre Ríos`
- `Formosa`
- `Jujuy`
- `La Pampa`
- `La Rioja`
- `Mendoza`
- `Misiones`
- `Neuquén`
- `Río Negro`
- `Salta`
- `San Juan`
- `San Luis`
- `Santa Cruz`
- `Santa Fe`
- `Santiago del Estero`
- `Tierra del Fuego`
- `Tucumán`

---

## Notas Importantes

1. **Fechas**: Usar formato `YYYY-MM-DD` (año-mes-día). Ejemplo: `2025-01-15`
2. **Booleanos**: Usar `TRUE` o `FALSE` (en mayúsculas)
3. **Números**: Sin símbolos de moneda ni separadores de miles. Ejemplo: `150000` (no `$150.000`)
4. **Porcentajes**: Solo el número, sin símbolo %. Ejemplo: `3` (no `3%`)
5. **Campos vacíos**: Dejar la celda vacía si no aplica
6. **Compra**: Para operaciones de tipo "Compra", el campo `porcentaje_punta_vendedora` es opcional y se guardará como 0 si está vacío
7. **Alquileres**: Para alquileres, `punta_compradora` = Punta Inquilino, `punta_vendedora` = Punta Propietario

---

## Ejemplo de Uso

1. Abrir el archivo `plantilla_operaciones.csv` en Excel
2. La primera fila contiene los nombres de las columnas
3. Las siguientes filas son ejemplos que puedes eliminar
4. Agregar tus operaciones una por fila
5. Guardar como CSV (separado por comas)
6. Subir el archivo en la aplicación
