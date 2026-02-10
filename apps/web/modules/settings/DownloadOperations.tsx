import { useAuthStore } from "@/stores/authStore";

const DownloadOperations = () => {
  const { getAuthToken } = useAuthStore();

  const handleDownload = async () => {
    try {
      const token = await getAuthToken();
      if (!token) throw new Error("Usuario no autenticado");

      const res = await fetch("/api/operations/export", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error descargando el archivo");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "operaciones.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("❌ Error al descargar operaciones:", error);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
        />
      </svg>
      Descargar Operaciones en Excel
    </button>
  );
};

export default DownloadOperations;
