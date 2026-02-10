import { signOut } from "firebase/auth";
import {
  ArrowLeftStartOnRectangleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";

import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/stores/authStore";
import { useUserDataStore } from "@/stores/userDataStore";
import { useCalculationsStore } from "@/stores/calculationsStore";

export const UserActions = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const resetAuthStore = useAuthStore((state) => state.reset);
  const clearUserData = useUserDataStore((state) => state.clearUserData);
  const resetCalculationsStore = useCalculationsStore(
    (state) => state.resetStore
  );

  const handleSignOut = async () => {
    try {
      // 1. Limpiar todos los stores primero
      clearUserData();
      resetCalculationsStore();

      // 2. Limpiar cache de React Query
      queryClient.clear();

      // 3. Cerrar sesión en Firebase
      await signOut(auth);

      // 4. Reset auth store después del signOut
      resetAuthStore();

      // 5. Redirigir al login con await y fallback
      const redirected = await router.push("/login");

      // 6. Si router.push retorna false o hay problemas, usar fallback
      if (!redirected) {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
      // Fallback: forzar redirección incluso si hay error
      window.location.href = "/login";
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Botón de Configuración */}
      <Link
        href={"/settings"}
        className="flex items-center space-x-3 w-full px-4 py-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
      >
        <Cog6ToothIcon className="h-5 w-5 text-gray-600" />
        <span className="font-bold">Configuración y Perfil</span>
      </Link>

      {/* Botón de Cerrar Sesión */}
      <button
        onClick={handleSignOut}
        className="flex items-center space-x-3 w-full px-4 py-3 bg-red-50/30 rounded-lg border border-red-200/50 hover:border-red-300/70 hover:bg-red-50/50 hover:shadow-sm transition-all duration-200 text-left"
      >
        <ArrowLeftStartOnRectangleIcon className="h-5 w-5 text-red-500" />
        <span className="font-bold text-red-600">Cerrar Sesión</span>
      </button>
    </div>
  );
};
