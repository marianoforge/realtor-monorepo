# Escenarios de Cálculo del Neto - Formulario de Operaciones

Esta documentación detalla todos los escenarios posibles al cargar una operación en Realtor Trackpro y cómo se calcula el neto (honorarios que recibe cada uno) en cada caso.

**Importante para Argentina:** En Argentina la franquicia se cobra únicamente al broker, no a los asesores. En el resto de los países se deduce del bruto y luego se reparte entre los participantes.

---

## Categorización de escenarios

Los escenarios se organizan según:

1. **Cantidad de asesores** (0, 1 o 2)
2. **Si el Team Leader participa** como asesor en la operación
3. **Descuentos aplicados:** compartido, referido, franquicia, repartición

---

## Orden de aplicación de descuentos

Siempre se aplican en este orden:

1. **Compartido** – Se descuenta del valor de la operación sobre el bruto inicial
2. **Referido** – Se descuenta sobre el resultado después del compartido
3. **Franquicia** – Se descuenta sobre el resultado (en Argentina solo al broker)
4. **Distribución** entre asesores
5. **Repartición** – Si aplica (se calcula sobre el bruto original)

---

## Variables del formulario

### Variables obligatorias

- **valor_reserva:** Valor de la operación (ej. precio de venta)
- **porcentaje_punta_vendedora:** % comisión punta vendedora (ej. 3%)
- **porcentaje_punta_compradora:** % comisión punta compradora (ej. 3%). El bruto suele ser la suma de ambas (ej. 6%)

### Variables opcionales de descuentos

- **porcentaje_compartido:** 0% a 5% típicamente (operación compartida con otro agente)
- **porcentaje_referido:** 0% a 30% típicamente (alguien refirió el negocio)
- **isFranchiseOrBroker (franquicia):** 0% a 20% típicamente
- **reparticion_honorarios_asesor:** 0% a 10% típicamente (repartición con oficina o otro concepto)

### Variables de distribución

- **realizador_venta / user_uid:** Asesor principal (puede ser null)
- **porcentaje_honorarios_asesor:** 0% a 100%
- **realizador_venta_adicional / user_uid_adicional:** Asesor adicional (puede ser null)
- **porcentaje_honorarios_asesor_adicional:** 0% a 100%

---

## Grupo 1: Sin asesores (solo Team Leader)

El broker hace la operación solo, sin asignar asesores.

### Escenario 1.1: Operación simple

- Sin asesores, sin compartido, sin referido, sin franquicia, sin repartición
- **Cálculo:** Team Leader recibe 100% de los honorarios brutos

### Escenario 1.2: Con compartido

- Sin asesores, con compartido (ej. 2%)
- **Cálculo:** Se descuenta el compartido del valor de la operación; el bruto se reduce. Team Leader recibe el resto

### Escenario 1.3: Con referido

- Sin asesores, con referido (ej. 15%)
- **Cálculo:** Se descuenta el referido sobre los honorarios brutos. Team Leader recibe el resto

### Escenario 1.4: Con compartido y referido

- Sin asesores, con compartido y referido
- **Cálculo:** Primero se aplica compartido, luego referido sobre lo que quedó. Team Leader recibe el resto

### Escenario 1.5: Con franquicia

- Sin asesores, con franquicia (ej. 11%)
- **Cálculo:** Team Leader recibe honorarios brutos menos el % de franquicia

### Escenario 1.6: Completo (todos los descuentos)

- Sin asesores, con compartido, referido, franquicia y repartición
- **Cálculo:** Se aplican todos los descuentos en orden. Team Leader recibe el neto final

---

## Grupo 2: Un asesor (no es Team Leader)

Hay un asesor asignado y el Team Leader no es ese asesor.

### Escenario 2.1: Operación simple

- 1 asesor con su % (ej. 45%), sin descuentos
- **Cálculo:** Asesor recibe su % del bruto, Team Leader recibe el resto

### Escenario 2.2: Con compartido

- 1 asesor, con compartido
- **Cálculo:** Se descuenta compartido del bruto, luego se reparte entre asesor (su %) y Team Leader

### Escenario 2.3: Con referido

- 1 asesor, con referido
- **Cálculo:** Se descuenta referido, luego se reparte entre asesor y Team Leader

### Escenario 2.4: Con compartido y referido

- 1 asesor, con compartido y referido
- **Cálculo:** Compartido → Referido → Distribución asesor/TL. Franquicia y repartición al final si aplican

### Escenario 2.5: Con franquicia

- 1 asesor, con franquicia
- **Cálculo:** Se reparte entre asesor y TL; la franquicia se descuenta del TL (en Argentina)

### Escenario 2.6: Completo

- 1 asesor, con todos los descuentos
- **Cálculo:** Todos los descuentos en orden; al final asesor recibe su % y TL el resto menos repartición si aplica

---

## Grupo 3: Un asesor (el Team Leader es el asesor)

El broker es a la vez el asesor de la operación (se asigna a sí mismo).

### Escenario 3.1: Operación simple

- Team Leader es el asesor, sin descuentos
- **Cálculo:** Team Leader recibe 100% (como si no hubiera asesor)

### Escenario 3.2: Con compartido

- Team Leader es el asesor, con compartido
- **Cálculo:** Se descuenta compartido, TL recibe el resto

### Escenario 3.3: Con referido

- Team Leader es el asesor, con referido
- **Cálculo:** Se descuenta referido, TL recibe el resto

### Escenario 3.4: Con franquicia

- Team Leader es el asesor, con franquicia
- **Cálculo:** TL recibe brutos menos franquicia

### Escenario 3.5: Completo

- Team Leader es el asesor, con todos los descuentos
- **Cálculo:** Todos los descuentos aplicados; TL recibe el neto final

---

## Grupo 4: Dos asesores (ninguno es Team Leader)

Hay dos asesores asignados y ninguno es el Team Leader.

### Escenario 4.1: Operación simple

- 2 asesores con sus % (ej. 45% y 40%), sin descuentos
- **Cálculo:** Los asesores se reparten el 50% del bruto entre ellos (según sus porcentajes). Team Leader recibe el otro 50%

### Escenario 4.2 a 4.6

- Misma lógica: primero compartido y/o referido sobre el bruto, luego franquicia si aplica, después se reparte 50% para asesores (entre ellos por sus %) y 50% para TL. La repartición se descuenta del TL y se calcula sobre el bruto original

---

## Grupo 5: Dos asesores (Team Leader es asesor principal)

Hay dos asesores y el Team Leader es el asesor principal (primera punta).

### Escenario 5.1: Operación simple

- Team Leader es asesor principal, 1 asesor adicional (ej. 40%)
- **Cálculo:** Se divide el bruto en dos mitades. TL recibe 100% de una mitad más lo que sobra de la otra mitad después de pagar al asesor adicional (según su %)

### Escenarios 5.2 a 5.5

- Mismo criterio: primero descuentos (compartido, referido, franquicia), luego la “división especial”: dos mitades, TL recibe 100% de su mitad + (su mitad − lo del asesor adicional). Repartición al final sobre el TL si aplica

---

## Grupo 6: Dos asesores (Team Leader es asesor adicional)

Hay dos asesores y el Team Leader es el asesor adicional (segunda punta).

### Escenario 6.1: Operación simple

- Asesor principal (ej. 45%), Team Leader es asesor adicional
- **Cálculo:** Igual que Grupo 5 pero invertido: se dividen dos mitades, el asesor principal recibe su % de su mitad, TL recibe 100% de la otra mitad más lo que sobra de la mitad del asesor principal

### Escenarios 6.2 a 6.5

- Misma lógica que Grupo 5: descuentos primero, después división en mitades con TL recibiendo 100% de su mitad + resto de la otra mitad. Repartición al final si aplica

---

## Ejemplos numéricos (datos base)

Para todos los ejemplos:

- Valor propiedad: $100,000
- % bruto (comisión total): 6%
- Compartido (cuando aplique): 2%
- Referido (cuando aplique): 15%
- Franquicia (cuando aplique): 10%
- Repartición (cuando aplique): 3%

### Grupo 1 – Ejemplos

**1.1 Simple:** Bruto = $100,000 × 6% = $6,000. TL = $6,000

**1.2 Compartido:** Bruto $6,000. Compartido $100,000 × 2% = $2,000. TL = $6,000 − $2,000 = $4,000

**1.3 Referido:** Bruto $6,000. Referido $6,000 × 15% = $900. TL = $6,000 − $900 = $5,100

**1.4 Compartido + Referido:** Tras compartido quedan $4,000. Referido $4,000 × 15% = $600. TL = $4,000 − $600 = $3,400

**1.5 Franquicia:** Bruto $6,000. Franquicia $6,000 × 10% = $600. TL = $5,400

**1.6 Completo:** Compartido → $4,000. Referido → $3,400. Franquicia → $3,060. Repartición $6,000 × 3% = $180. TL = $3,060 − $180 = $2,880

### Grupo 2 – Ejemplo 2.1 (1 asesor 50%)

Bruto $6,000. Asesor 50% = $3,000. TL = $3,000

### Grupo 2 – Ejemplo 2.6 (completo, 1 asesor 50%)

Compartido → $4,000. Referido → $3,400. Franquicia → $3,060. Asesor 50% = $1,530. TL antes repartición = $1,530. Repartición $180. TL = $1,350. Resultado: Asesor $1,530, TL $1,350

### Grupo 4 – Ejemplo 4.1 (2 asesores 50% y 50%, sin descuentos)

Bruto $6,000. 50% para asesores = $3,000. Asesor 1: $1,500, Asesor 2: $1,500, TL: $3,000

### Grupo 5 y 6 – División en mitades

Cuando hay 2 asesores y el TL es uno de ellos: el bruto (después de compartido/referido/franquicia) se divide en dos mitades. El TL recibe el 100% de una mitad más (mitad del otro asesor − lo que se paga a ese asesor). Ejemplo 5.1: Bruto $6,000. Mitad = $3,000. Asesor adicional 50% de su mitad = $1,500. TL = $3,000 + ($3,000 − $1,500) = $4,500

---

## Total de escenarios

- Grupo 1 (sin asesores): 6 escenarios
- Grupo 2 (1 asesor, no TL): 6 escenarios
- Grupo 3 (1 asesor, es TL): 5 escenarios
- Grupo 4 (2 asesores, ninguno TL): 6 escenarios
- Grupo 5 (2 asesores, TL principal): 5 escenarios
- Grupo 6 (2 asesores, TL adicional): 5 escenarios

**Total: 33 escenarios base.** Las variaciones dependen de los porcentajes, pero la lógica de cálculo es la descrita.

Para ver todos los ejemplos numéricos detallados y la documentación completa, el usuario puede ir a **Nueva Operación** y hacer clic en el enlace "Escenarios de cálculo" o visitar la ruta **/escenarios-calculo** en la aplicación.
