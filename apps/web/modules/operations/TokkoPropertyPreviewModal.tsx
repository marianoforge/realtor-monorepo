import React from "react";
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { TokkoProperty } from "@/common/hooks/useTokkoProperties";

interface TokkoPropertyPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  property: TokkoProperty | null;
  availableAdvisors: string[];
}

const TokkoPropertyPreviewModal: React.FC<TokkoPropertyPreviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  property,
  availableAdvisors,
}) => {
  if (!isOpen || !property) return null;

  // ============================================
  // EXACTAMENTE EL MISMO MAPEO QUE USA EL FORMULARIO
  // ============================================

  // 1. Dirección
  const rawAddress = property.real_address;
  const mappedAddress = property.real_address || "";

  // 2. Localidad
  const rawLocality = property.location?.name;
  const mappedLocality = property.location?.name || null;

  // 3. Tipo de Operación
  const rawOperationType = property.operations?.[0]?.operation_type;
  let mappedOperationType = "";
  if (rawOperationType === "Sale") mappedOperationType = "Venta";
  else if (rawOperationType === "Rental") mappedOperationType = "Alquiler";

  // 4. Valor de la Propiedad
  const rawPrice = property.operations?.[0]?.prices?.[0]?.price;
  const mappedPrice = rawPrice || null;

  // 5. Comisión (internal_data.commission)
  const rawCommission = property.internal_data?.commission;
  let mappedCommission = null;
  if (
    rawCommission &&
    rawCommission.trim() !== "" &&
    parseFloat(rawCommission) > 0
  ) {
    mappedCommission = parseFloat(rawCommission);
  }

  // 6. Asesor
  const rawAdvisorName = property.producer?.name;
  const advisorExists = rawAdvisorName
    ? availableAdvisors.some((name) => name.trim() === rawAdvisorName.trim())
    : false;
  const mappedAdvisor = advisorExists ? rawAdvisorName : null;

  // 7. Tipo de Inmueble
  const rawPropertyType = property.type?.name;
  const rawTypeCode = property.type?.code;

  // Mapear por CODE (los códigos de Tokko como "AP", "CA", etc.)
  const typeMappingByCode: { [key: string]: string } = {
    AP: "Departamentos", // Apartment
    CA: "Casa", // Casa/House
    PH: "PH", // PH
    TE: "Terreno", // Terreno/Land
    OF: "Oficina", // Office
    LC: "Local Comercial", // Store/Local
    DE: "Depósito", // Warehouse/Deposito
    GA: "Cochera", // Garage
    BO: "Bodega",
    LO: "Loft",
    QU: "Quinta",
    CH: "Chacra",
    ED: "Edificio",
  };

  // Mapear por NAME como fallback
  const typeMappingByName: { [key: string]: string } = {
    Apartment: "Departamentos",
    House: "Casa",
    PH: "PH",
    Land: "Terreno",
    Office: "Oficina",
    Store: "Local Comercial",
    Warehouse: "Depósito",
    Garage: "Cochera",
  };

  // Primero intentar por código, luego por nombre
  const mappedPropertyType =
    typeMappingByCode[rawTypeCode || ""] ||
    typeMappingByName[rawPropertyType || ""] ||
    rawPropertyType ||
    "";

  // 8. Observaciones
  let mappedObservations = "";

  // Título de la publicación
  if (property.publication_title) {
    mappedObservations += `📋 ${property.publication_title}\n\n`;
  }

  // Descripción (usar rich_description si description está vacío)
  const description = property.rich_description || property.description;
  if (description && description.trim() !== "") {
    mappedObservations += `Descripción:\n${description}\n\n`;
  }

  // Características de la propiedad
  mappedObservations += `Características:\n`;
  if (property.room_amount > 0) {
    mappedObservations += `• Ambientes: ${property.room_amount}\n`;
  }
  if (property.bathroom_amount > 0) {
    mappedObservations += `• Baños: ${property.bathroom_amount}\n`;
  }
  if (property.surface) {
    mappedObservations += `• Superficie: ${property.surface} m²\n`;
  }
  if (property.total_surface && property.total_surface !== property.surface) {
    mappedObservations += `• Superficie Total: ${property.total_surface} m²\n`;
  }
  if (property.parking_lot_amount > 0) {
    mappedObservations += `• Cocheras: ${property.parking_lot_amount}\n`;
  }
  if (property.expenses > 0) {
    mappedObservations += `• Expensas: $${property.expenses}\n`;
  }

  // Información de Tokko
  mappedObservations += `\n📎 Información de Tokko:\n`;
  mappedObservations += `• Código de Referencia: ${property.reference_code}\n`;
  if (property.public_url) {
    mappedObservations += `• URL Pública: ${property.public_url}\n`;
  }
  mappedObservations += `• Asesor Responsable: ${property.producer?.name || "N/A"}\n`;
  mappedObservations += `• Email: ${property.producer?.email || "N/A"}\n`;
  if (property.producer?.cellphone) {
    mappedObservations += `• Teléfono: ${property.producer.cellphone}\n`;
  }

  // Agregar información de comisión si está disponible
  if (property.internal_data?.commission) {
    mappedObservations += `• Comisión en Tokko: ${property.internal_data.commission}%\n`;
  }

  const FormFieldRow = ({
    fieldName,
    rawValue,
    mappedValue,
    apiPath,
    willFill,
  }: {
    fieldName: string;
    rawValue: any;
    mappedValue: any;
    apiPath: string;
    willFill: boolean;
  }) => (
    <div className="py-3 border-b border-gray-100">
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-gray-800 text-sm">
          Campo:{" "}
          <code className="bg-blue-50 px-2 py-0.5 rounded text-blue-700">
            {fieldName}
          </code>
        </span>
        {willFill ? (
          <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
            <CheckCircleIcon className="w-4 h-4" />
            Se rellenará
          </span>
        ) : (
          <span className="flex items-center gap-1 text-red-600 text-xs font-medium">
            <ExclamationTriangleIcon className="w-4 h-4" />
            NO se rellenará
          </span>
        )}
      </div>
      <div className="text-xs space-y-1 ml-2">
        <div className="flex gap-2">
          <span className="text-gray-500 min-w-[100px]">API Path:</span>
          <code className="text-gray-700 font-mono bg-gray-100 px-1 rounded">
            {apiPath}
          </code>
        </div>
        <div className="flex gap-2">
          <span className="text-gray-500 min-w-[100px]">Valor Raw:</span>
          <code className="text-purple-700 font-mono bg-purple-50 px-1 rounded">
            {typeof rawValue === "object"
              ? JSON.stringify(rawValue)
              : String(rawValue ?? "null")}
          </code>
        </div>
        <div className="flex gap-2">
          <span className="text-gray-500 min-w-[100px]">Valor Mapeado:</span>
          <code
            className={`font-mono px-1 rounded ${willFill ? "text-green-700 bg-green-50" : "text-gray-500 bg-gray-100"}`}
          >
            {typeof mappedValue === "object"
              ? JSON.stringify(mappedValue)
              : String(mappedValue ?? "null")}
          </code>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0077b6] to-[#023e8a] px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Vista Previa de Datos
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  Revisa los datos antes de autocompletar el formulario
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

          {/* Content */}
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            {/* Info Banner */}
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>📊 Vista de Depuración:</strong> Esta ventana muestra
                exactamente qué datos se extraerán de la API de Tokko y cómo se
                mapearán a cada campo del formulario.
              </p>
            </div>

            {/* Campos del Formulario */}
            <div className="space-y-6">
              {/* Dirección */}
              <div>
                <h3 className="text-md font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    1
                  </span>
                  Dirección de la Propiedad
                </h3>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-2">
                  <FormFieldRow
                    fieldName="direccion_reserva"
                    rawValue={rawAddress}
                    mappedValue={mappedAddress}
                    apiPath="property.real_address"
                    willFill={!!mappedAddress}
                  />
                  <FormFieldRow
                    fieldName="localidad_reserva"
                    rawValue={rawLocality}
                    mappedValue={mappedLocality}
                    apiPath="property.location.name"
                    willFill={!!mappedLocality}
                  />
                </div>
              </div>

              {/* Tipo de Operación y Valor */}
              <div>
                <h3 className="text-md font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    2
                  </span>
                  Operación y Precio
                </h3>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-2">
                  <FormFieldRow
                    fieldName="tipo_operacion"
                    rawValue={rawOperationType}
                    mappedValue={mappedOperationType}
                    apiPath="property.operations[0].operation_type"
                    willFill={!!mappedOperationType}
                  />
                  <FormFieldRow
                    fieldName="valor_reserva"
                    rawValue={rawPrice}
                    mappedValue={mappedPrice}
                    apiPath="property.operations[0].prices[0].price"
                    willFill={mappedPrice !== null}
                  />
                </div>
              </div>

              {/* Comisión y Puntas */}
              <div>
                <h3 className="text-md font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    3
                  </span>
                  Comisión y Puntas
                </h3>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-2">
                  <FormFieldRow
                    fieldName="porcentaje_punta_vendedora"
                    rawValue={rawCommission}
                    mappedValue={mappedCommission}
                    apiPath="property.internal_data.commission"
                    willFill={mappedCommission !== null}
                  />
                  {!mappedCommission && rawCommission && (
                    <div className="mt-2 text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
                      ⚠️ La comisión existe pero es vacía o = 0: "
                      {rawCommission}"
                    </div>
                  )}

                  {/* Checkbox Punta Vendedora */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <FormFieldRow
                      fieldName="punta_vendedora (checkbox)"
                      rawValue="N/A"
                      mappedValue="true (marcado)"
                      apiPath="Automático al importar de Tokko"
                      willFill={true}
                    />
                    <div className="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded">
                      ✅ El checkbox "Punta Vendedora" se marcará
                      automáticamente
                    </div>
                  </div>
                </div>
              </div>

              {/* Asesor */}
              <div>
                <h3 className="text-md font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    4
                  </span>
                  Asesor que realizó la venta
                </h3>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <FormFieldRow
                    fieldName="realizador_venta"
                    rawValue={rawAdvisorName}
                    mappedValue={mappedAdvisor}
                    apiPath="property.producer.name"
                    willFill={!!mappedAdvisor}
                  />
                  {rawAdvisorName && !advisorExists && (
                    <div className="mt-3 text-xs text-red-700 bg-red-50 p-3 rounded">
                      <p className="font-semibold mb-2">
                        ❌ El asesor "{rawAdvisorName}" NO existe en tu sistema
                      </p>
                      <details>
                        <summary className="cursor-pointer font-medium mb-2">
                          Ver asesores disponibles ({availableAdvisors.length})
                        </summary>
                        <ul className="ml-4 list-disc space-y-1 max-h-32 overflow-y-auto">
                          {availableAdvisors.map((name, idx) => (
                            <li key={idx}>{name}</li>
                          ))}
                        </ul>
                      </details>
                    </div>
                  )}
                  {rawAdvisorName && advisorExists && (
                    <div className="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded">
                      ✅ El asesor será seleccionado automáticamente
                    </div>
                  )}
                </div>
              </div>

              {/* Tipo de Inmueble */}
              <div>
                <h3 className="text-md font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    5
                  </span>
                  Tipo de Inmueble
                </h3>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <FormFieldRow
                    fieldName="tipo_inmueble"
                    rawValue={`CODE: "${rawTypeCode}" | NAME: "${rawPropertyType}"`}
                    mappedValue={mappedPropertyType}
                    apiPath="property.type.code + property.type.name"
                    willFill={!!mappedPropertyType}
                  />
                  <div className="mt-2 text-xs text-gray-600 bg-white p-2 rounded border">
                    <p>
                      <strong>Mapeo:</strong> {rawTypeCode} ({rawPropertyType})
                      →{" "}
                      <strong className="text-green-700">
                        {mappedPropertyType || "Sin mapear"}
                      </strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <h3 className="text-md font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    6
                  </span>
                  Observaciones
                </h3>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-xs">
                    <span className="text-gray-600">
                      Se generará automáticamente con:
                    </span>
                    <ul className="mt-2 ml-4 list-disc space-y-1 text-gray-700 text-xs">
                      <li>
                        📋 Título: {property.publication_title ? "✅" : "❌"}
                      </li>
                      <li>
                        📝 Descripción:{" "}
                        {property.rich_description || property.description
                          ? "✅"
                          : "❌"}
                        {property.rich_description &&
                          " (usando rich_description)"}
                      </li>
                      <li>• Ambientes: {property.room_amount || "N/A"}</li>
                      <li>• Baños: {property.bathroom_amount || "N/A"}</li>
                      <li>• Superficie: {property.surface || "N/A"} m²</li>
                      <li>
                        • Cocheras: {property.parking_lot_amount || "N/A"}
                      </li>
                      <li>• Expensas: ${property.expenses || "N/A"}</li>
                      <li>📎 Código Tokko: {property.reference_code}</li>
                      <li>
                        📎 URL Pública: {property.public_url ? "✅" : "❌"}
                      </li>
                      <li>📎 Asesor: {property.producer?.name || "N/A"}</li>
                      <li>📎 Email: {property.producer?.email || "N/A"}</li>
                      <li>
                        📎 Teléfono: {property.producer?.cellphone || "N/A"}
                      </li>
                      {property.internal_data?.commission && (
                        <li>
                          📎 Comisión: {property.internal_data.commission}%
                        </li>
                      )}
                    </ul>
                    <details className="mt-3">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                        Ver texto completo que se escribirá
                      </summary>
                      <pre className="mt-2 bg-white p-2 rounded text-xs border overflow-auto max-h-40">
                        {mappedObservations}
                      </pre>
                    </details>
                  </div>
                </div>
              </div>
            </div>

            {/* Debug completo */}
            <details className="mt-6">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 font-medium">
                🔍 Ver objeto JSON completo de la propiedad
              </summary>
              <pre className="mt-2 bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-xs max-h-64">
                {JSON.stringify(property, null, 2)}
              </pre>
            </details>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2 bg-gradient-to-r from-[#0077b6] to-[#023e8a] text-white rounded-lg hover:from-[#005a8a] hover:to-[#001d3b] transition-all duration-200 font-medium shadow-sm"
            >
              ✅ Confirmar y Rellenar Formulario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokkoPropertyPreviewModal;
