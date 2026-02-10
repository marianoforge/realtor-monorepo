import React, { useState } from "react";
import { useRouter } from "next/router";

import {
  PRICE_ID_ENTERPRISE,
  PRICE_ID_GROWTH,
  PRICE_ID_STARTER,
  PRICE_ID_STARTER_ANNUAL,
  PRICE_ID_GROWTH_ANNUAL,
} from "@/lib/data";

import LicenseCard from "./LicensesCard";
import ContactForm from "./ContactForm";

interface LicensesSectionProps {
  id?: string;
  onClose?: () => void;
}

const LicensesSection: React.FC<LicensesSectionProps> = ({ id, onClose }) => {
  const router = useRouter();
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);

  const handleLicenseSelect = (priceId: string) => {
    if (priceId === PRICE_ID_ENTERPRISE) {
      setIsContactFormOpen(true);
    } else {
      if (typeof window !== "undefined") {
        localStorage.setItem("selectedPriceId", priceId);
      }

      if (router.pathname !== "/register") {
        router.push("/register");
      }

      if (onClose) {
        onClose();
      }
    }
  };

  const handleCloseContactForm = () => {
    setIsContactFormOpen(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      id={id}
      className="absolute text-[#2d3748] flex flex-col xl:flex-row justify-around items-center gap-20 pb-10 mt-20 top-full transform -translate-y-[48px] xl:-translate-y-1/4"
    >
      <LicenseCard
        title="ASESOR"
        description="Lo que necesitás para empezar."
        price="$9.99"
        annualPrice="$99.90"
        buttonText="Empieza Gratis"
        priceId={PRICE_ID_STARTER}
        annualPriceId={PRICE_ID_STARTER_ANNUAL}
        features={[
          "Acceso completo a funcionalidades esenciales de Realtor Trackpro.",
          "Dashboard de seguimiento de honorarios, operaciones y gastos.",
          "Análisis de rentabilitad.",
          "Cuadros de Operaciones dinámicos e interactivos.",
          "Programación de eventos y calendario de actividades.",
          "Ideal para la gestión de ingresos, análisis de inversiones y gastos.",
        ]}
        onSelect={handleLicenseSelect}
      />

      <LicenseCard
        title="TEAM LEADER - BROKER - DUEÑO"
        description="Todo lo que necesitas para liderar tu equipo."
        price="$12.99"
        annualPrice="$129.90"
        buttonText="Empieza Gratis"
        priceId={PRICE_ID_GROWTH}
        annualPriceId={PRICE_ID_GROWTH_ANNUAL}
        features={[
          "Incluye todas las características de la Licencia Asesor.",
          "Módulo adicional para análisis de rentabilidad e ingresos del equipo de asesores.",
          "Cuadros dinámicos e interactivos para el seguimiento de operaciones de miembros del equipo.",
          "Perfecta para líderes de equipo y gerentes de agencias inmobiliarias.",
        ]}
        onSelect={handleLicenseSelect}
      />

      <LicenseCard
        title="ENTERPRISE"
        description="Flexibilidad para operaciones a gran escala."
        price="Contáctanos"
        buttonText="Contáctanos"
        priceId={PRICE_ID_ENTERPRISE}
        features={[
          "Orientada a agencias con necesidades personalizadas.",
          "Opción de desarrollar add-ons únicos adaptados a procesos específicos.",
          "Expande las capacidades de las licencias Asesor y Team Leader.",
          "Cotización independiente según el proyecto.",
        ]}
        onSelect={handleLicenseSelect}
      />

      {isContactFormOpen && <ContactForm onClose={handleCloseContactForm} />}
    </div>
  );
};

export default LicensesSection;
