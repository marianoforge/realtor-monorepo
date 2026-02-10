import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/stores/authStore";
import { useUserDataStore } from "@/stores/userDataStore";

const BackofficeAccess = () => {
  const router = useRouter();
  const { userID } = useAuthStore();
  const { userData } = useUserDataStore();

  useEffect(() => {
    if (!userID) {
      router.push("/login");
      return;
    }

    if (
      userData?.email === "mariano@bigbangla.biz" ||
      userData?.uid === "qaab6bRZHpZiRuq6981thD3mYm03"
    ) {
      router.push("/backoffice");
    } else {
      router.push("/dashboard");
    }
  }, [userID, userData, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            🛠️ Verificando Acceso al Backoffice
          </h2>
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    </div>
  );
};

export default BackofficeAccess;
