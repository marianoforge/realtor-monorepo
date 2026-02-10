import { useState, useRef } from "react";
import axios from "axios";
import {
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "@/stores/authStore";

interface UploadResult {
  success: boolean;
  message: string;
  created?: number;
  errors?: Array<{ row: number; error: string }>;
}

const UploadOperations = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { userID } = useAuthStore();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar extensión
      const validExtensions = [".csv", ".xlsx", ".xls"];
      const extension = file.name
        .toLowerCase()
        .slice(file.name.lastIndexOf("."));

      if (!validExtensions.includes(extension)) {
        setUploadResult({
          success: false,
          message:
            "Formato de archivo no válido. Solo se permiten archivos CSV o Excel (.csv, .xlsx, .xls)",
        });
        return;
      }

      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !userID) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      const token = await useAuthStore.getState().getAuthToken();
      if (!token) throw new Error("Usuario no autenticado");

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("userId", userID);
      // El teamId se obtiene automáticamente del usuario autenticado en el endpoint

      const response = await axios.post("/api/operations/import", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Content-Type se establece automáticamente por axios cuando detecta FormData
          // Incluye el boundary necesario: multipart/form-data; boundary=----WebKitFormBoundary...
        },
      });

      setUploadResult({
        success: true,
        message: response.data.message,
        created: response.data.created,
        errors: response.data.errors,
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Error uploading file:", error);
      setUploadResult({
        success: false,
        message:
          error.response?.data?.message || "Error al procesar el archivo",
        errors: error.response?.data?.errors,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Botón de descarga */}
      <div className="mb-4 text-left">
        <button
          onClick={() => window.open("/plantilla_operaciones.xlsx", "_blank")}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <DocumentArrowDownIcon className="w-5 h-5" />
          Descargar Plantilla Excel
        </button>
        <div className="flex items-center gap-2 mt-3 text-left">
          <span className="text-amber-500 text-lg">💡</span>
          <p className="text-sm font-medium text-gray-700">
            La plantilla incluye una hoja con{" "}
            <span className="text-blue-600 font-semibold">
              instrucciones detalladas
            </span>{" "}
            de uso
          </p>
        </div>
      </div>

      {/* Área de carga */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />

        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <ArrowUpTrayIcon className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-sm font-medium text-gray-700 mb-1">
            {selectedFile
              ? selectedFile.name
              : "Haz clic para seleccionar un archivo"}
          </p>
          <p className="text-xs text-gray-500">
            Formatos soportados: Excel (.xlsx, .xls) o CSV
          </p>
        </label>

        {selectedFile && (
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
                isUploading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Procesando...
                </>
              ) : (
                <>
                  <ArrowUpTrayIcon className="w-5 h-5" />
                  Subir Operaciones
                </>
              )}
            </button>
            <button
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* Resultado de la carga */}
      {uploadResult && (
        <div
          className={`p-4 rounded-lg ${
            uploadResult.success
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <div className="flex items-start gap-3">
            {uploadResult.success ? (
              <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
            ) : (
              <ExclamationCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p
                className={`font-medium ${
                  uploadResult.success ? "text-green-800" : "text-red-800"
                }`}
              >
                {uploadResult.message}
              </p>
              {uploadResult.created !== undefined && (
                <p className="text-sm text-green-700 mt-1">
                  {uploadResult.created} operaciones creadas exitosamente
                </p>
              )}
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="mt-2">
                  <button
                    onClick={() => setShowErrors(!showErrors)}
                    className="text-sm text-red-700 underline hover:no-underline"
                  >
                    {showErrors
                      ? "Ocultar errores"
                      : `Ver ${uploadResult.errors.length} errores`}
                  </button>
                  {showErrors && (
                    <div className="mt-2 max-h-40 overflow-y-auto">
                      {uploadResult.errors.map((err, idx) => (
                        <p
                          key={idx}
                          className="text-xs text-red-600 py-1 border-t border-red-200"
                        >
                          <span className="font-medium">Fila {err.row}:</span>{" "}
                          {err.error}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => setUploadResult(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Descarga la plantilla Excel y complétala con tus operaciones</p>
        <p>• La plantilla incluye dropdowns para facilitar la carga de datos</p>
        <p>
          • Revisa la hoja "Instrucciones" dentro del Excel para más información
        </p>
        <p>• Los campos obligatorios están marcados con * en la plantilla</p>
      </div>
    </div>
  );
};

export default UploadOperations;
