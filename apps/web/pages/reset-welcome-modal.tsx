import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/stores/authStore";

const ResetWelcomeModal = () => {
  const { userID } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const resetWelcomeModal = async () => {
    if (!userID) {
      setMessage("No hay usuario logueado");
      return;
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, "usuarios", userID), {
        welcomeModalShown: false,
      });
      setMessage(
        "✅ welcomeModalShown reseteado a false. Ve al dashboard para ver el modal."
      );
    } catch (error) {
      console.error("Error:", error);
      setMessage("❌ Error al resetear el campo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Reset Welcome Modal</h1>
      <p className="mb-4">
        Esta página es para testing. Resetea el campo welcomeModalShown para que
        el modal aparezca de nuevo.
      </p>

      <button
        onClick={resetWelcomeModal}
        disabled={loading}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
      >
        {loading ? "Reseteando..." : "Reset Welcome Modal"}
      </button>

      {message && <div className="mt-4 p-4 border rounded">{message}</div>}
    </div>
  );
};

export default ResetWelcomeModal;
