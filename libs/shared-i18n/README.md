# shared-i18n

Traducciones por país (es-AR, es-CL, es-UY, es-PY) para términos del dominio Real Estate. Pensado para tropicalización: mismos conceptos, palabras distintas según el país.

## Cómo elegir el locale

En el registro no se pide país; en muchos mercados (ej. Argentina) se usa **USD**, no la moneda local, así que la moneda **no** es fiable para inferir país. Lo recomendable es **preguntar país en el registro** o tener un **selector en configuración** y guardar `country` o `locale` en el perfil. La función `getLocaleFromCurrency(currency)` sirve como fallback cuando la moneda sí indica país (CLP, UYU, PYG; ARS si en tu producto implica Argentina). Para USD no se puede inferir — usar país/preferencia explícita. Ver [docs/GLOSARIO_REAL_ESTATE_I18N.md](../../docs/GLOSARIO_REAL_ESTATE_I18N.md).

## Uso

```ts
import {
  getLocaleFromCurrency,
  getMessages,
  type SupportedLocale,
} from "@gds-si/shared-i18n";

const currency = userData?.currency ?? "";
const locale = getLocaleFromCurrency(currency);
const t = getMessages(locale);

t.operation.rent; // "Arriendo" en es-CL, "Alquiler" en es-AR
t.property.department; // "Departamentos" / "Apartamentos" según país
t.party.tenant; // "Arrendatario" en es-CL, "Inquilino" en es-AR
t.expenses.expensas; // "Gastos comunes" en es-CL, "Expensas" en es-AR
```

## Estructura

- `locales/es-AR.json`, `es-CL.json`, `es-UY.json`, `es-PY.json`: mensajes por país.
- Glosario completo y criterios: [docs/GLOSARIO_REAL_ESTATE_I18N.md](../../docs/GLOSARIO_REAL_ESTATE_I18N.md).

## Próximos pasos

- Definir locale por usuario/tenant (config o backend).
- En web/mobile: usar claves de estos JSON en lugar de strings fijos (enums y formularios).
- Añadir más claves según pantallas (UI común, errores, etc.).
