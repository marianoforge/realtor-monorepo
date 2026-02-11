import { useState, useMemo, useEffect } from "react";
import Head from "next/head";
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import PrivateLayout from "@/components/PrivateComponente/PrivateLayout";
import PrivateRoute from "@/components/PrivateComponente/PrivateRoute";
import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import { useUserDataStore } from "@/stores/userDataStore";
import {
  useTokkoProperties,
  TokkoApiResponse,
  TokkoProperty,
} from "@/common/hooks/useTokkoProperties";

const LIMIT = 100;
const OFFSET = 0;
const ITEMS_PER_PAGE = 10;

type SortByOption = "days" | "price" | "costPerSqm";

const SORT_OPTIONS: { value: SortByOption; label: string }[] = [
  { value: "days", label: "Días desde la creación" },
  { value: "price", label: "Precio" },
  { value: "costPerSqm", label: "Costo por m²" },
];

function formatOperationType(raw: string): string {
  if (raw === "Rental") return "Alquiler";
  if (raw === "Sale") return "Venta";
  return raw || "N/A";
}

function removeAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function filterPropertiesBySearch(
  properties: TokkoProperty[],
  searchQuery: string
): TokkoProperty[] {
  if (!searchQuery.trim()) return properties;
  const q = removeAccents(searchQuery.trim().toLowerCase());
  return properties.filter((p) => {
    const address = removeAccents(
      (p.real_address || p.address || "").toLowerCase()
    );
    const ref = removeAccents((p.reference_code || "").toLowerCase());
    const loc = removeAccents((p.location?.name || "").toLowerCase());
    const dev = removeAccents(
      String(
        (p as unknown as Record<string, unknown>).development_address || ""
      ).toLowerCase()
    );
    return (
      address.includes(q) ||
      ref.includes(q) ||
      loc.includes(q) ||
      dev.includes(q)
    );
  });
}

function sortProperties(
  properties: TokkoProperty[],
  sortBy: SortByOption,
  ascending: boolean
): TokkoProperty[] {
  const dir = ascending ? 1 : -1;
  const arr = [...properties];
  if (sortBy === "days") {
    arr.sort((a, b) => {
      const daysA = daysSinceCreated(
        (a as unknown as Record<string, unknown>).created_at
      );
      const daysB = daysSinceCreated(
        (b as unknown as Record<string, unknown>).created_at
      );
      if (daysA === null && daysB === null) return 0;
      if (daysA === null) return 1;
      if (daysB === null) return -1;
      return (daysA - daysB) * dir;
    });
  } else if (sortBy === "price") {
    arr.sort((a, b) => {
      const priceA = a.operations?.[0]?.prices?.[0]?.price ?? null;
      const priceB = b.operations?.[0]?.prices?.[0]?.price ?? null;
      if (priceA == null && priceB == null) return 0;
      if (priceA == null) return 1;
      if (priceB == null) return -1;
      return (priceA - priceB) * dir;
    });
  } else {
    arr.sort((a, b) => {
      const costA =
        costPerSqm(a as unknown as Record<string, unknown>)?.value ?? null;
      const costB =
        costPerSqm(b as unknown as Record<string, unknown>)?.value ?? null;
      if (costA === null && costB === null) return 0;
      if (costA === null) return 1;
      if (costB === null) return -1;
      return (costA - costB) * dir;
    });
  }
  return arr;
}

function hasValue(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (v === "") return false;
  if (typeof v === "number" && v === 0) return false;
  return true;
}

function get(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const p of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[p];
  }
  return current;
}

function formatDisplayValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function formatDate(v: unknown): string {
  if (v == null) return "—";
  const d = typeof v === "string" ? new Date(v) : (v as Date);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function daysSinceCreated(createdAt: unknown): number | null {
  if (createdAt == null) return null;
  const d =
    typeof createdAt === "string" ? new Date(createdAt) : (createdAt as Date);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const created = new Date(d);
  created.setHours(0, 0, 0, 0);
  const diffMs = today.getTime() - created.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function costPerSqm(
  raw: Record<string, unknown>
): { value: number; currency: string } | null {
  const op = raw?.operations as
    | Array<{ prices?: Array<{ price: number; currency: string }> }>
    | undefined;
  const priceData = op?.[0]?.prices?.[0];
  if (!priceData || priceData.price <= 0) return null;
  const roofed = parseFloat(String(raw?.roofed_surface ?? 0)) || 0;
  const semiroofed = parseFloat(String(raw?.semiroofed_surface ?? 0)) || 0;
  const effectiveSurface = roofed + semiroofed * 0.5;
  if (effectiveSurface <= 0) return null;
  return {
    value: priceData.price / effectiveSurface,
    currency: priceData.currency || "USD",
  };
}

type FieldFormatter = (v: unknown, obj?: Record<string, unknown>) => string;

const DETAIL_FIELDS: Array<{
  label: string;
  path: string;
  format?: FieldFormatter;
}> = [
  { label: "Dirección", path: "real_address" },
  { label: "Dirección del emprendimiento", path: "development_address" },
  { label: "Localidad", path: "location.name" },
  { label: "Código de referencia", path: "reference_code" },
  {
    label: "Tipo de operación",
    path: "operations.0.operation_type",
    format: (v) => formatOperationType(String(v ?? "")),
  },
  {
    label: "Precio",
    path: "_price",
    format: (_, obj) => {
      const op = (obj as Record<string, unknown>)?.operations as
        | Array<{ prices?: Array<{ price: number; currency: string }> }>
        | undefined;
      const price = op?.[0]?.prices?.[0];
      if (!price || price.price === 0) return "—";
      return `${price.currency} ${price.price.toLocaleString()}`;
    },
  },
  { label: "Ambientes", path: "room_amount" },
  { label: "Baños", path: "bathroom_amount" },
  { label: "Superficie (m²)", path: "surface" },
  { label: "Superficie cubierta (m²)", path: "roofed_surface" },
  { label: "Superficie semi cubierta (m²)", path: "semiroofed_surface" },
  { label: "Situación", path: "situation" },
  {
    label: "Fecha de creación (propiedad)",
    path: "created_at",
    format: (v) => formatDate(v),
  },
  {
    label: "Fecha de creación (sucursal)",
    path: "branch.created",
    format: (v) => formatDate(v),
  },
  { label: "Asesor", path: "producer.name" },
];

interface PropertyOwner {
  id?: number;
  name?: string;
  email?: string;
  work_email?: string;
  other_email?: string;
  cellphone?: string;
  phone?: string;
  other_phone?: string;
  document_number?: string;
  birthdate?: string | null;
  created_at?: string;
  updated_at?: string;
}

function parsePropertyOwners(v: unknown): PropertyOwner[] {
  if (!Array.isArray(v)) return [];
  return v.filter(
    (item): item is PropertyOwner => item !== null && typeof item === "object"
  ) as PropertyOwner[];
}

interface PropertyDetailModalProps {
  property: TokkoProperty | null;
  onClose: () => void;
}

function PropertyDetailModal({ property, onClose }: PropertyDetailModalProps) {
  if (!property) return null;

  const raw = property as unknown as Record<string, unknown>;
  const frontPhoto = property.photos?.find((p) => p.is_front_cover);
  const firstPhoto = property.photos?.[0];
  const photoUrl = frontPhoto?.image || firstPhoto?.image;

  const rows = DETAIL_FIELDS.map(({ label, path, format }) => {
    const value = path === "_price" ? undefined : get(raw, path);
    const displayValue =
      path === "_price" && format
        ? format(value, raw)
        : format
          ? format(value)
          : formatDisplayValue(value);
    const hasVal =
      path === "_price"
        ? !!displayValue && displayValue !== "—"
        : hasValue(value);
    return { label, displayValue, hasValue: hasVal };
  }).filter((r) => r.hasValue);

  const daysSince = daysSinceCreated(get(raw, "created_at"));
  const costSqm = costPerSqm(raw);

  const desc = (property.rich_description || property.description || "").trim();
  const hasDesc = desc.length > 0;
  const photos = property.photos?.length ? property.photos : [];
  const propertyOwners = parsePropertyOwners(
    get(raw, "internal_data.property_owners")
  );

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/50"
          onClick={onClose}
          aria-hidden
        />
        <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl">
          <div className="bg-gradient-to-r from-[#0077b6] to-[#023e8a] px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {property.reference_code} –{" "}
                  {property.real_address || property.address || "Sin dirección"}
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  Datos de la propiedad
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-lg p-2"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            {daysSince !== null && (
              <div className="mb-4 rounded-xl bg-[#0077b6]/15 border border-[#0077b6]/30 px-4 py-3">
                <p className="text-sm font-medium text-[#023e8a]">
                  Días desde la creación
                </p>
                <p className="text-2xl font-bold text-[#0077b6]">
                  {daysSince} días
                </p>
              </div>
            )}
            {costSqm !== null && (
              <div className="mb-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-4 py-3">
                <p className="text-sm font-medium text-emerald-800">
                  Costo por m²
                </p>
                <p className="text-xs text-emerald-700/90 mt-0.5">
                  Valor total ÷ (superficie cubierta + semi cubierta × 50%)
                </p>
                <p className="text-2xl font-bold text-emerald-700">
                  {costSqm.currency}{" "}
                  {costSqm.value.toLocaleString("es-AR", {
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
            )}
            {photos.length > 0 && (
              <section className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Fotos
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {photos.map((p, i) => (
                    <img
                      key={i}
                      src={p.image}
                      alt=""
                      className="h-32 w-auto rounded-lg object-cover shrink-0"
                    />
                  ))}
                </div>
              </section>
            )}

            <dl className="space-y-2">
              {rows.map(({ label, displayValue }) => (
                <div
                  key={label}
                  className="flex gap-3 py-2 border-b border-gray-100 text-sm"
                >
                  <dt className="text-gray-600 shrink-0 min-w-[200px] font-medium">
                    {label}
                  </dt>
                  <dd className="text-gray-900 break-words">{displayValue}</dd>
                </div>
              ))}
            </dl>

            {propertyOwners.length > 0 && (
              <section className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Propietarios (datos internos)
                </h3>
                <ul className="space-y-4">
                  {propertyOwners.map((owner, index) => (
                    <li
                      key={owner.id ?? index}
                      className="border border-gray-200 rounded-lg p-3 bg-gray-50 text-sm"
                    >
                      <dl className="grid gap-1.5">
                        {owner.name && (
                          <>
                            <dt className="text-gray-500 font-medium">
                              Nombre
                            </dt>
                            <dd className="text-gray-900">{owner.name}</dd>
                          </>
                        )}
                        {(owner.email || owner.work_email) && (
                          <>
                            <dt className="text-gray-500 font-medium">Email</dt>
                            <dd className="text-gray-900">
                              {owner.email || owner.work_email}
                            </dd>
                          </>
                        )}
                        {owner.other_email && (
                          <>
                            <dt className="text-gray-500 font-medium">
                              Otro email
                            </dt>
                            <dd className="text-gray-900">
                              {owner.other_email}
                            </dd>
                          </>
                        )}
                        {(owner.cellphone || owner.phone) && (
                          <>
                            <dt className="text-gray-500 font-medium">
                              Teléfono
                            </dt>
                            <dd className="text-gray-900">
                              {owner.cellphone || owner.phone}
                            </dd>
                          </>
                        )}
                        {owner.other_phone && (
                          <>
                            <dt className="text-gray-500 font-medium">
                              Otro teléfono
                            </dt>
                            <dd className="text-gray-900">
                              {owner.other_phone}
                            </dd>
                          </>
                        )}
                        {owner.document_number && (
                          <>
                            <dt className="text-gray-500 font-medium">
                              DNI / Documento
                            </dt>
                            <dd className="text-gray-900">
                              {owner.document_number}
                            </dd>
                          </>
                        )}
                        {owner.birthdate && (
                          <>
                            <dt className="text-gray-500 font-medium">
                              Fecha de nacimiento
                            </dt>
                            <dd className="text-gray-900">
                              {formatDate(owner.birthdate)}
                            </dd>
                          </>
                        )}
                        {owner.created_at && (
                          <>
                            <dt className="text-gray-500 font-medium">
                              Fecha de alta
                            </dt>
                            <dd className="text-gray-900">
                              {formatDate(owner.created_at)}
                            </dd>
                          </>
                        )}
                        {owner.updated_at && (
                          <>
                            <dt className="text-gray-500 font-medium">
                              Última actualización
                            </dt>
                            <dd className="text-gray-900">
                              {formatDate(owner.updated_at)}
                            </dd>
                          </>
                        )}
                      </dl>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {hasDesc && (
              <section className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Descripción
                </h3>
                <div
                  className="text-sm text-gray-800 whitespace-pre-wrap border border-gray-100 rounded-lg p-3 bg-gray-50"
                  dangerouslySetInnerHTML={{ __html: desc }}
                />
              </section>
            )}

            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 font-medium">
                Ver JSON completo de la propiedad
              </summary>
              <pre className="mt-2 bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-xs max-h-64">
                {JSON.stringify(property, null, 2)}
              </pre>
            </details>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const TokkoTestPage = () => {
  const { userData } = useUserDataStore();
  const apiKey =
    userData?.tokkoApiKey?.trim() ||
    (typeof window !== "undefined"
      ? (process.env.NEXT_PUBLIC_TOKKO_API_KEY as string)?.trim()
      : "");

  const { data, isLoading, error } = useTokkoProperties(
    apiKey || null,
    OFFSET,
    LIMIT
  );

  const [selectedProperty, setSelectedProperty] =
    useState<TokkoProperty | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortByOption>("days");
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const objects = (data as TokkoApiResponse | undefined)?.objects ?? [];
  const filteredObjects = useMemo(
    () => filterPropertiesBySearch(objects, searchQuery),
    [objects, searchQuery]
  );
  const sortedObjects = useMemo(
    () => sortProperties(filteredObjects, sortBy, sortAsc),
    [filteredObjects, sortBy, sortAsc]
  );
  const totalPages = Math.max(
    1,
    Math.ceil(sortedObjects.length / ITEMS_PER_PAGE)
  );
  const paginatedObjects = useMemo(
    () =>
      sortedObjects.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      ),
    [sortedObjects, currentPage]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, sortAsc]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const top10ByPrice = useMemo(() => {
    return [...filteredObjects]
      .filter((p) => (p.operations?.[0]?.prices?.[0]?.price ?? 0) > 0)
      .sort(
        (a, b) =>
          (b.operations?.[0]?.prices?.[0]?.price ?? 0) -
          (a.operations?.[0]?.prices?.[0]?.price ?? 0)
      )
      .slice(0, 10);
  }, [filteredObjects]);

  const top10ByCostSqm = useMemo(() => {
    return [...filteredObjects]
      .map((p) => ({
        property: p,
        cost:
          costPerSqm(p as unknown as Record<string, unknown>)?.value ?? null,
      }))
      .filter((x) => x.cost !== null)
      .sort((a, b) => (b.cost ?? 0) - (a.cost ?? 0))
      .slice(0, 10)
      .map((x) => x.property);
  }, [filteredObjects]);

  const top10ByDays = useMemo(() => {
    return [...filteredObjects]
      .map((p) => ({
        property: p,
        days: daysSinceCreated(
          (p as unknown as Record<string, unknown>).created_at
        ),
      }))
      .filter((x) => x.days !== null)
      .sort((a, b) => (b.days ?? 0) - (a.days ?? 0))
      .slice(0, 10)
      .map((x) => x.property);
  }, [filteredObjects]);

  if (!apiKey) {
    return (
      <PrivateRoute>
        <PrivateLayout>
          <div className="px-4 sm:px-6 lg:px-8 py-6 w-full">
            <div className="max-w-2xl mx-auto">
              <div className="mb-6 border-l-4 border-blue-500 pl-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg">
                    <BuildingOffice2Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Cartera</h1>
                    <p className="text-sm text-gray-600">
                      Propiedades desde Tokko Broker
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
                <p className="font-medium">
                  Para ver tu cartera tienes que poner el API Key de Tokko en
                  Perfil y Configuración.
                </p>
              </div>
            </div>
          </div>
        </PrivateLayout>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute>
      <Head>
        <title>Cartera | Realtor Trackpro</title>
        <meta
          name="description"
          content="Cartera de propiedades desde Tokko Broker. Listado y detalle con filtros y paginación."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <PrivateLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
          <div className="mb-6 border-l-4 border-blue-500 pl-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <BuildingOffice2Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Propiedades Tokko
                </h1>
                <p className="text-sm text-blue-600 font-medium">
                  Misma API que Nueva operación → Importar desde Tokko. Clic en
                  una propiedad para ver los datos.
                </p>
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="mt-4">
              <SkeletonLoader height={64} count={11} />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-1">{error.message}</p>
            </div>
          )}

          {!isLoading && !error && objects.length > 0 && (
            <>
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg">
                    <AdjustmentsHorizontalIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-blue-600">
                      Filtros de búsqueda
                    </h3>
                    <p className="text-sm text-gray-600">
                      Buscar por dirección, código o localidad
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-end flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <MagnifyingGlassIcon className="w-4 h-4 inline mr-2" />
                      Palabras clave
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar por dirección, código o localidad..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-11 pl-4 pr-10 border-2 border-gray-300 rounded-lg font-medium placeholder-gray-400 text-gray-700 bg-white shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div className="min-w-[220px]">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ordenar por
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(e.target.value as SortByOption)
                      }
                      className="w-full h-11 pl-4 pr-10 border-2 border-gray-300 rounded-lg font-medium text-gray-700 bg-white shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="min-w-[140px]">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Orden
                    </label>
                    <select
                      value={sortAsc ? "asc" : "desc"}
                      onChange={(e) => setSortAsc(e.target.value === "asc")}
                      className="w-full h-11 pl-4 pr-10 border-2 border-gray-300 rounded-lg font-medium text-gray-700 bg-white shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
                    >
                      <option value="asc">Ascendente</option>
                      <option value="desc">Descendente</option>
                    </select>
                  </div>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="h-11 px-4 rounded-lg border-2 border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <p className="text-sm text-gray-500 mt-2">
                    {filteredObjects.length === 1
                      ? "1 propiedad encontrada"
                      : `${filteredObjects.length} propiedades encontradas`}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {paginatedObjects.map((property) => {
                  const frontPhoto = property.photos?.find(
                    (p) => p.is_front_cover
                  );
                  const firstPhoto = property.photos?.[0];
                  const photoUrl = frontPhoto?.image || firstPhoto?.image;
                  const operationType = formatOperationType(
                    property.operations?.[0]?.operation_type || ""
                  );
                  const price = property.operations?.[0]?.prices?.[0]?.price;
                  const currency =
                    property.operations?.[0]?.prices?.[0]?.currency || "USD";

                  return (
                    <button
                      key={property.id}
                      type="button"
                      onClick={() => setSelectedProperty(property)}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow text-left group"
                    >
                      {photoUrl && (
                        <div className="relative h-48 bg-gray-200 overflow-hidden">
                          <img
                            src={photoUrl}
                            alt={property.real_address || property.address}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 right-2 bg-[#0077b6] text-white px-2 py-1 rounded text-xs font-semibold">
                            {operationType === "N/A" ? "—" : operationType}
                          </div>
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                          {property.real_address || property.address}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">
                          {property.location?.name || "Sin ubicación"}
                        </p>
                        <p className="text-xs font-medium text-gray-600 mb-2">
                          Código: {property.reference_code}
                        </p>
                        {price != null && price > 0 && (
                          <p className="text-lg font-bold text-[#0077b6]">
                            {currency} {price.toLocaleString()}
                          </p>
                        )}
                        <div className="flex gap-3 text-xs text-gray-600 mt-2">
                          {property.room_amount > 0 && (
                            <span>{property.room_amount} amb.</span>
                          )}
                          {property.bathroom_amount > 0 && (
                            <span>{property.bathroom_amount} baños</span>
                          )}
                          {property.surface && (
                            <span>{property.surface} m²</span>
                          )}
                        </div>
                        {property.producer?.name && (
                          <p className="text-xs text-gray-500 mt-2 truncate">
                            {property.producer.name}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {filteredObjects.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 py-4">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                    Anterior
                  </button>
                  <span className="text-sm text-gray-600">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage >= totalPages}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Siguiente
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </div>
              )}

              {filteredObjects.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 pb-20 mb-8 border-t border-gray-200">
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-800">
                        Propiedades Más Caras
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="text-left py-2 px-3 font-medium text-gray-600 w-8">
                              #
                            </th>
                            <th className="text-left py-2 px-3 font-medium text-gray-600">
                              Dirección
                            </th>
                            <th className="text-right py-2 px-3 font-medium text-gray-600">
                              Precio
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {top10ByPrice.map((p, i) => {
                            const price = p.operations?.[0]?.prices?.[0];
                            return (
                              <tr
                                key={p.id}
                                className={`border-b border-gray-100 hover:bg-gray-50 ${i === 0 ? "bg-greenAccent/15" : ""}`}
                              >
                                <td className="py-2 px-3 text-gray-500">
                                  {i + 1}
                                </td>
                                <td className="py-2 px-3 text-gray-900 line-clamp-2">
                                  {p.real_address || p.address || "—"}
                                </td>
                                <td className="py-2 px-3 text-right font-medium text-gray-700 whitespace-nowrap">
                                  {price
                                    ? `${price.currency} ${price.price.toLocaleString()}`
                                    : "—"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-800">
                        m² más caro
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="text-left py-2 px-3 font-medium text-gray-600 w-8">
                              #
                            </th>
                            <th className="text-left py-2 px-3 font-medium text-gray-600">
                              Dirección
                            </th>
                            <th className="text-right py-2 px-3 font-medium text-gray-600">
                              Costo/m²
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {top10ByCostSqm.map((p, i) => {
                            const c = costPerSqm(
                              p as unknown as Record<string, unknown>
                            );
                            return (
                              <tr
                                key={p.id}
                                className={`border-b border-gray-100 hover:bg-gray-50 ${i === 0 ? "bg-greenAccent/15" : ""}`}
                              >
                                <td className="py-2 px-3 text-gray-500">
                                  {i + 1}
                                </td>
                                <td className="py-2 px-3 text-gray-900 line-clamp-2">
                                  {p.real_address || p.address || "—"}
                                </td>
                                <td className="py-2 px-3 text-right font-medium text-gray-700 whitespace-nowrap">
                                  {c
                                    ? `${c.currency} ${c.value.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`
                                    : "—"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-800">
                        Mas días en actividad
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="text-left py-2 px-3 font-medium text-gray-600 w-8">
                              #
                            </th>
                            <th className="text-left py-2 px-3 font-medium text-gray-600">
                              Dirección
                            </th>
                            <th className="text-right py-2 px-3 font-medium text-gray-600">
                              Días
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {top10ByDays.map((p, i) => {
                            const days = daysSinceCreated(
                              (p as unknown as Record<string, unknown>)
                                .created_at
                            );
                            return (
                              <tr
                                key={p.id}
                                className={`border-b border-gray-100 hover:bg-gray-50 ${i === 0 ? "bg-redAccent/15" : ""}`}
                              >
                                <td className="py-2 px-3 text-gray-500">
                                  {i + 1}
                                </td>
                                <td className="py-2 px-3 text-gray-900 line-clamp-2">
                                  {p.real_address || p.address || "—"}
                                </td>
                                <td className="py-2 px-3 text-right font-medium text-gray-700 whitespace-nowrap">
                                  {days !== null ? `${days} días` : "—"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {filteredObjects.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No se encontraron propiedades con los filtros aplicados.
                </p>
              )}
            </>
          )}

          {!isLoading && !error && data && objects.length === 0 && (
            <p className="text-gray-500">No hay propiedades en esta página.</p>
          )}

          {selectedProperty && (
            <PropertyDetailModal
              property={selectedProperty}
              onClose={() => setSelectedProperty(null)}
            />
          )}
        </div>
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default TokkoTestPage;
