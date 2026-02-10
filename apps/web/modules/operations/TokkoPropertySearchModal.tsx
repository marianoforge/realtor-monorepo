import React, { useState, useMemo } from "react";
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  useTokkoPropertiesAll,
  TokkoProperty,
} from "@/common/hooks/useTokkoProperties";

interface TokkoPropertySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProperty: (property: TokkoProperty) => void;
  tokkoApiKey: string | null | undefined;
}

const TokkoPropertySearchModal: React.FC<TokkoPropertySearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProperty,
  tokkoApiKey,
}) => {
  const {
    data: properties,
    isLoading,
    error,
    progress,
  } = useTokkoPropertiesAll(tokkoApiKey);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducerEmail, setSelectedProducerEmail] = useState("");
  const [selectedProducerName, setSelectedProducerName] = useState("");

  // Obtener lista única de asesores
  const producers = useMemo(() => {
    if (!properties) return { emails: [], names: [] };

    const emailsSet = new Set<string>();
    const namesSet = new Set<string>();

    properties.forEach((prop) => {
      if (prop.producer?.email) emailsSet.add(prop.producer.email);
      if (prop.producer?.name) namesSet.add(prop.producer.name);
    });

    return {
      emails: Array.from(emailsSet).sort(),
      names: Array.from(namesSet).sort(),
    };
  }, [properties]);

  // Filtrar propiedades
  const filteredProperties = useMemo(() => {
    if (!properties) return [];

    return properties.filter((property) => {
      const matchesSearch =
        !searchTerm ||
        property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.real_address
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        property.reference_code
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesProducerEmail =
        !selectedProducerEmail ||
        property.producer?.email === selectedProducerEmail;

      const matchesProducerName =
        !selectedProducerName ||
        property.producer?.name === selectedProducerName;

      return matchesSearch && matchesProducerEmail && matchesProducerName;
    });
  }, [properties, searchTerm, selectedProducerEmail, selectedProducerName]);

  const handleSelectProperty = (property: TokkoProperty) => {
    onSelectProperty(property);
    onClose();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedProducerEmail("");
    setSelectedProducerName("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0077b6] to-[#023e8a] px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Buscar Propiedad en Tokko
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  Selecciona una propiedad para autocompletar el formulario
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search by address or reference code */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar por dirección o código
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ej: Lima 141 o GGA4496979"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077b6] focus:border-[#0077b6]"
                  />
                </div>
              </div>

              {/* Filter by producer email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrar por email del asesor
                </label>
                <select
                  value={selectedProducerEmail}
                  onChange={(e) => setSelectedProducerEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077b6] focus:border-[#0077b6]"
                >
                  <option value="">Todos los asesores</option>
                  {producers.emails.map((email) => (
                    <option key={email} value={email}>
                      {email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by producer name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrar por nombre del asesor
                </label>
                <select
                  value={selectedProducerName}
                  onChange={(e) => setSelectedProducerName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077b6] focus:border-[#0077b6]"
                >
                  <option value="">Todos los asesores</option>
                  {producers.names.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear filters button */}
            {(searchTerm || selectedProducerEmail || selectedProducerName) && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-[#0077b6] hover:text-[#005a8a] font-medium"
                >
                  Limpiar filtros
                </button>
              </div>
            )}

            {/* Results count */}
            <div className="mt-2 text-sm text-gray-600">
              {isLoading
                ? "Cargando propiedades..."
                : `${filteredProperties.length} propiedad${filteredProperties.length !== 1 ? "es" : ""} encontrada${filteredProperties.length !== 1 ? "s" : ""}`}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <p className="font-semibold">Error al cargar propiedades</p>
                <p className="text-sm mt-1">{error.message}</p>
                <p className="text-sm mt-2">
                  Asegúrate de que la variable de entorno{" "}
                  <code className="bg-red-100 px-1 rounded">
                    NEXT_PUBLIC_TOKKO_API_KEY
                  </code>{" "}
                  esté configurada correctamente.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      key={`property-skeleton-${index}`}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="h-48 bg-gray-200 animate-pulse"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {!isLoading && !error && filteredProperties.length === 0 && (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">
                  No se encontraron propiedades
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Intenta con otros filtros de búsqueda
                </p>
              </div>
            )}

            {!isLoading && !error && filteredProperties.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProperties.map((property) => {
                  const frontPhoto = property.photos?.find(
                    (p) => p.is_front_cover
                  );
                  const firstPhoto = property.photos?.[0];
                  const photoUrl = frontPhoto?.image || firstPhoto?.image;
                  const operationType =
                    property.operations?.[0]?.operation_type || "N/A";
                  const price = property.operations?.[0]?.prices?.[0]?.price;
                  const currency =
                    property.operations?.[0]?.prices?.[0]?.currency || "USD";

                  return (
                    <div
                      key={property.id}
                      onClick={() => handleSelectProperty(property)}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                    >
                      {/* Image */}
                      {photoUrl && (
                        <div className="relative h-48 bg-gray-200 overflow-hidden">
                          <img
                            src={photoUrl}
                            alt={property.real_address || property.address}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute top-2 right-2 bg-[#0077b6] text-white px-2 py-1 rounded text-xs font-semibold">
                            {operationType}
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                          {property.real_address || property.address}
                        </h3>

                        <p className="text-xs text-gray-500 mb-2">
                          {property.location?.name || "Sin ubicación"}
                        </p>

                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600">
                            Código: {property.reference_code}
                          </span>
                        </div>

                        {price && (
                          <div className="text-lg font-bold text-[#0077b6] mb-2">
                            {currency} {price.toLocaleString()}
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
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

                        <div className="border-t border-gray-200 pt-2">
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Asesor:</span>{" "}
                            {property.producer?.name || "Sin asesor"}
                          </p>
                          {property.producer?.email && (
                            <p className="text-xs text-gray-500 truncate">
                              {property.producer.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokkoPropertySearchModal;
