import React, { useState } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";

interface OperationsTourProps {
  run: boolean;
  onTourComplete: () => void;
}

const OperationsTour: React.FC<OperationsTourProps> = ({
  run,
  onTourComplete,
}) => {
  const [stepIndex, setStepIndex] = useState(0);

  const steps: Step[] = [
    {
      target: ".information-general-section",
      content: (
        <div className="p-0">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-gray-800">
              📋 Información General
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Paso 1 de 8
            </span>
          </div>
          <p className="text-gray-600 mb-3">
            Completa los datos temporales y tipo de la operación:
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              • <strong>Fecha de Captación/Publicación:</strong> Cuando listaste
              la propiedad (opcional)
            </li>
            <li>
              • <strong>Fecha de Reserva:</strong> Cuando el cliente firmó la
              reserva (OBLIGATORIO)
            </li>
            <li>
              • <strong>Fecha de Cierre:</strong> Escrituración o entrega final
              de llaves
            </li>
            <li>
              • <strong>Tipo de operación:</strong> Selecciona &quot;Venta&quot;
              o &quot;Alquiler&quot;
            </li>
            <li>
              • <strong>Tipo de Inmueble:</strong> Solo aparece si elegiste
              &quot;Venta&quot;
            </li>
            <li>
              • <strong>Exclusividad:</strong> Marca si tienes exclusividad o no
              de la propiedad
            </li>
          </ul>
        </div>
      ),
      placement: "right",
      disableBeacon: true,
    },
    {
      target: ".location-section",
      content: (
        <div className="p-0">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-gray-800">
              📍 Ubicación de la Propiedad
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Paso 2 de 8
            </span>
          </div>
          <p className="text-gray-600 mb-3">
            Ingresa la dirección exacta donde se encuentra la propiedad:
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              <strong>Dirección:</strong> Escribe la calle y usa el
              autocompletado de Google
            </li>
            <li>
              <strong>Número:</strong> Agrega el número de la propiedad en el
              campo separado
            </li>
            <li>
              <strong>Localidad y Provincia:</strong> Se completan
              automáticamente
            </li>
            <li>
              <strong>Tip:</strong> Una dirección precisa mejora el seguimiento
              de la operación
            </li>
          </ul>
        </div>
      ),
      placement: "left",
    },
    {
      target: ".values-commissions-section",
      content: (
        <div className="p-0">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-gray-800">
              💰 Valores y Comisiones
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Paso 3 de 8
            </span>
          </div>
          <p className="text-gray-600 mb-3">
            Sección crucial para el cálculo de honorarios. Completa con
            precisión:
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              <strong>Valor de oferta/operación:</strong> Precio final acordado
              (ej: $200,000)
            </li>
            <li>
              <strong>% Punta Vendedora:</strong> Comisión que paga el vendedor
              (ej: 3%)
            </li>
            <li>
              <strong>% Punta Compradora:</strong> Comisión que paga el
              comprador (ej: 4%)
            </li>

            <li>
              Cuando se actúa por la parte vendedora, se consignan los
              honorarios completos. Cuando se actúa por la parte compra- dora,
              solo se coloca lo que comparta la otra inmobiliaria. En este caso,
              el casillero de parte ven- dedora se indica 0 (cero). Si en la
              región se cobra solo a la parte vendedora, se consignan los
              honorarios completos, y en el casillero de la parte compradora se
              coloca 0. Tip Profesional: Si en una operación no se cobra
              comisión a una de las partes, se coloca 0.
            </li>
            <li>
              <strong>% Honorarios Totales:</strong> Se calcula automáticamente
              (suma de ambas puntas)
            </li>
            <li>
              <strong>Puntas:</strong> Marca qué puntas tienes (vendedora y/o
              compradora)
            </li>
            <li>
              <strong>Gastos de Operación:</strong> Gastos extras como
              escribanía, gestoría, etc. Estos se relacionara a la operacion
              para calcular la rentabilidad de la misma.
            </li>
          </ul>
        </div>
      ),
      placement: "right",
    },
    {
      target: ".reservations-section",
      content: (
        <div className="p-0">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-gray-800">
              📄 Reservas y Refuerzos
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Paso 4 de 8
            </span>
          </div>
          <p className="text-gray-600 mb-3">
            Registra los pagos que realizó el cliente para asegurar la
            operación:
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              <strong>Tipo de reserva:</strong> Cómo pagó (ej: &quot;Sobre N°
              123&quot;, &quot;Transferencia&quot;, &quot;Efectivo&quot;)
            </li>
            <li>
              <strong>Monto de Reserva:</strong> Cantidad inicial entregada (ej:
              $2,000)
            </li>
            <li>
              <strong>Tipo de refuerzo:</strong> Método del pago adicional si
              corresponde
            </li>
            <li>
              <strong>Monto de refuerzo:</strong> Dinero extra entregado antes
              del cierre
            </li>
            <li>
              <strong>Nota:</strong> Estos campos son opcionales pero ayudan al
              control financiero
            </li>
          </ul>
        </div>
      ),
      placement: "left",
    },
    {
      target: ".references-section",
      content: (
        <div className="p-0">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-gray-800">
              👥 Referencias y Compartidos
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Paso 5 de 8
            </span>
          </div>
          <p className="text-gray-600 mb-3">
            Registra si hay terceros que participan en la comisión:
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              <strong>Datos Referido:</strong> Si un colega te refirió la
              propiedad, anota su nombre.
            </li>
            <li>
              <strong>Porcentaje Referido:</strong> % de comisión para el
              referente (ej: 25%)
            </li>
            <li>
              <strong>Datos Compartido:</strong> Colega que trabajó en la
              operación contigo
            </li>
            <li>
              <strong>Porcentaje Compartido:</strong> % que le corresponde al
              colega (ej: 50%)
            </li>
            <li>
              <strong>Importante:</strong> Si te comparten la comisión a ti:
              Debes poner 0% en la parte que no te corresponde (ej. la
              vendedora) y tu porcentaje en la parte que sí te corresponde.
            </li>
          </ul>
        </div>
      ),
      placement: "right",
    },
    {
      target: ".fees-management-section",
      content: (
        <div className="p-0">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-gray-800">
              🏢 Gestión de Honorarios
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Paso 6 de 8
            </span>
          </div>
          <p className="text-gray-600 mb-3">
            La sección más compleja: define cómo se reparten los honorarios:
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              <strong>% Franquicia/Broker:</strong> Lo que se lleva la
              franquicia o el broker segun acuerdo previo (ej: 30%)
            </li>
            <li>
              <strong>Repartición honorarios:</strong> Para Team Leaders y
              Brokers, cargar los datos de los asesores o corredores según
              acuerdo previo (Nombre y porcentaje correspondiente). En la
              sección de honorarios podés agregar hasta dos asesores. Si tenés
              una licencia de Team Leader y sumás uno o dos asesores, los
              porcentajes restantes se asignan automáticamente al Team Leader /
              Broker.
            </li>
            <li>
              Si contás con un licencia de Asesor, únicamente podés registrar tu
              propio porcentaje.
            </li>
          </ul>
        </div>
      ),
      placement: "left",
    },
    {
      target: ".additional-info-section",
      content: (
        <div className="p-0">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-gray-800">
              📝 Información Adicional
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Paso 7 de 8
            </span>
          </div>
          <p className="text-gray-600 mb-3">
            Campo libre para documentar detalles importantes de la operación:
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              <strong>Observaciones:</strong> Cualquier detalle relevante sobre
              la operación
            </li>
            <li>
              <strong>Ejemplos:</strong> &quot;Cliente prefiere escriturar en
              enero&quot;, &quot;Propiedad necesita refacciones&quot;
            </li>
            <li>
              <strong>Acuerdos especiales:</strong> Condiciones particulares
              pactadas
            </li>
            <li>
              <strong>Recordatorios:</strong> Fechas importantes o tareas
              pendientes
            </li>
            <li>
              <strong>Tip:</strong> Esta información te ayudará en el
              seguimiento futuro
            </li>
          </ul>
        </div>
      ),
      placement: "top",
    },
    {
      target: ".form-actions",
      content: (
        <div className="p-0">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-gray-800">
              ✅ ¡Finalizar Operación!
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Paso 8 de 8
            </span>
          </div>
          <p className="text-gray-600 mb-3">
            Último paso: revisa y guarda tu operación en el sistema:
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              • <strong>Cancelar:</strong> Descarta todos los cambios y vuelve
              al dashboard
            </li>
            <li>
              • <strong>Guardar Operación:</strong> Registra la operación en el
              sistema
            </li>
            <li>
              • <strong>Validación:</strong> El sistema verificará que los
              campos obligatorios estén completos
            </li>
            <li>
              • <strong>Éxito:</strong> Te redirigirá automáticamente al
              dashboard
            </li>
          </ul>
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              <strong>🎯 ¡Importante!</strong> Una vez guardada, la operación
              aparecerá en tus reportes y cálculos de comisiones.
            </p>
          </div>
        </div>
      ),
      placement: "top",
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, index, action } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setStepIndex(0); // Reset step index for next tour
      onTourComplete();
    } else if (type === "step:after") {
      if (action === "next") {
        setStepIndex(index + 1);
      } else if (action === "prev") {
        setStepIndex(index - 1);
      }
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      callback={handleJoyrideCallback}
      continuous={true}
      showProgress={false}
      showSkipButton={true}
      disableOverlayClose={true}
      spotlightClicks={true}
      hideCloseButton={true}
      disableCloseOnEsc={true}
      styles={{
        options: {
          primaryColor: "#0077b6",
          textColor: "#374151",
          backgroundColor: "#ffffff",
          overlayColor: "rgba(0, 0, 0, 0.4)",
          arrowColor: "#ffffff",
          width: 400,
          zIndex: 1000,
        },
        spotlight: {
          borderRadius: "8px",
        },
        beacon: {
          backgroundColor: "#0077b6",
        },
        tooltip: {
          borderRadius: "12px",
          padding: "16px",
        },
        tooltipContainer: {
          textAlign: "left",
        },
        tooltipTitle: {
          color: "#1f2937",
          fontSize: "18px",
          fontWeight: "bold",
        },
        tooltipContent: {
          color: "#4b5563",
          fontSize: "14px",
          lineHeight: "1.5",
        },
        buttonNext: {
          backgroundColor: "#0077b6",
          color: "#ffffff",
          borderRadius: "8px",
          padding: "8px 16px",
          fontSize: "14px",
          fontWeight: "500",
        },
        buttonBack: {
          color: "#6b7280",
          marginRight: "8px",
          fontSize: "14px",
        },
        buttonSkip: {
          color: "#6b7280",
          fontSize: "14px",
        },
      }}
      locale={{
        back: "Anterior",
        close: "Cerrar",
        last: "Finalizar",
        next: "Siguiente",
        skip: "Omitir Tour",
      }}
    />
  );
};

export default OperationsTour;
