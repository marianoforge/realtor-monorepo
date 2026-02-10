import { useState } from "react";
import WelcomeTrialModal from "@/components/PrivateComponente/WelcomeTrialModal";

const TestModal = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test del Modal de Bienvenida</h1>
      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Mostrar Modal
      </button>

      <WelcomeTrialModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default TestModal;
