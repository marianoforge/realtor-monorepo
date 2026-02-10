export const EXPENSE_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "ABAO", label: "ABAO" },
  { value: "Alquiler Oficina", label: "Alquiler Oficina" },
  { value: "Caja Chica", label: "Caja Chica" },
  { value: "Capacitación", label: "Capacitación" },
  { value: "Carteleria", label: "Carteleria" },
  { value: "Contador", label: "Contador" },
  { value: "CRM", label: "CRM" },
  { value: "Expensas", label: "Expensas" },
  { value: "Fee (Franquicia)", label: "Fee (Franquicia)" },
  { value: "Fianza", label: "Fianza" },
  { value: "Marketing", label: "Marketing" },
  { value: "Matrícula", label: "Matrícula" },
  { value: "Portales Inmobiliarios", label: "Portales Inmobiliarios" },
  { value: "Publicidad", label: "Publicidad" },
  { value: "Servicios de Oficina", label: "Servicios de Oficina" },
  { value: "Sueldos Empleados", label: "Sueldos Empleados" },
  { value: "Varios", label: "Varios" },
  { value: "Viáticos", label: "Viáticos" },
  { value: "Otros", label: "Otros" },
];

export const EXPENSE_TYPE_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Todos los Gastos" },
  ...EXPENSE_TYPE_OPTIONS,
];

const currentYear = () => new Date().getFullYear();

export function getExpenseYearsFilter(): { value: string; label: string }[] {
  const y = currentYear();
  return [
    { value: "all", label: "Todos los años" },
    { value: String(y), label: String(y) },
    { value: String(y - 1), label: String(y - 1) },
    { value: String(y - 2), label: String(y - 2) },
  ];
}

export const EXPENSE_MONTHS_FILTER: { value: string; label: string }[] = [
  { value: "all", label: "Mes" },
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];
