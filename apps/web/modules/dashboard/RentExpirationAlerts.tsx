import { useMemo } from "react";
import Link from "next/link";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { useOperationsData } from "@/common/hooks/useOperationsData";
import { Operation } from "@gds-si/shared-types";
import { formatDate } from "@gds-si/shared-utils";

interface RentAlert {
  operation: Operation;
  daysUntilExpiration: number;
  alertType: "45_days" | "30_days";
}

const ALQUILER_TYPES = [
  "Alquiler Tradicional",
  "Alquiler Temporal",
  "Alquiler Comercial",
];

const RentExpirationAlerts = () => {
  const { operations, isLoading } = useOperationsData();

  const alerts = useMemo(() => {
    if (!operations || operations.length === 0) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rentAlerts: RentAlert[] = [];

    operations.forEach((op: Operation) => {
      if (
        !ALQUILER_TYPES.includes(op.tipo_operacion) ||
        !op.fecha_vencimiento_alquiler ||
        op.estado === "Caída"
      ) {
        return;
      }

      const expirationDate = new Date(op.fecha_vencimiento_alquiler);
      expirationDate.setHours(0, 0, 0, 0);

      const diffTime = expirationDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 45 && diffDays > 30) {
        rentAlerts.push({
          operation: op,
          daysUntilExpiration: diffDays,
          alertType: "45_days",
        });
      } else if (diffDays <= 30 && diffDays >= 0) {
        rentAlerts.push({
          operation: op,
          daysUntilExpiration: diffDays,
          alertType: "30_days",
        });
      }
    });

    return rentAlerts.sort(
      (a, b) => a.daysUntilExpiration - b.daysUntilExpiration
    );
  }, [operations]);

  if (isLoading || alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.operation.id}
          className={`rounded-lg p-4 shadow-sm border ${
            alert.alertType === "30_days"
              ? "bg-red-50 border-red-200"
              : "bg-amber-50 border-amber-200"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex-shrink-0 p-2 rounded-full ${
                alert.alertType === "30_days" ? "bg-red-100" : "bg-amber-100"
              }`}
            >
              <ExclamationTriangleIcon
                className={`h-5 w-5 ${
                  alert.alertType === "30_days"
                    ? "text-red-600"
                    : "text-amber-600"
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4
                  className={`font-semibold text-sm ${
                    alert.alertType === "30_days"
                      ? "text-red-800"
                      : "text-amber-800"
                  }`}
                >
                  {alert.alertType === "30_days"
                    ? "Alquiler por vencer"
                    : "Alquiler próximo a vencer"}
                </h4>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    alert.alertType === "30_days"
                      ? "bg-red-200 text-red-800"
                      : "bg-amber-200 text-amber-800"
                  }`}
                >
                  {alert.daysUntilExpiration === 0
                    ? "Vence hoy"
                    : alert.daysUntilExpiration === 1
                      ? "Vence mañana"
                      : `${alert.daysUntilExpiration} días`}
                </span>
              </div>
              <p
                className={`mt-1 text-sm ${
                  alert.alertType === "30_days"
                    ? "text-red-700"
                    : "text-amber-700"
                }`}
              >
                <span className="font-medium">
                  {alert.operation.direccion_reserva}
                </span>
                {alert.operation.localidad_reserva && (
                  <span> - {alert.operation.localidad_reserva}</span>
                )}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <p
                  className={`text-xs ${
                    alert.alertType === "30_days"
                      ? "text-red-600"
                      : "text-amber-600"
                  }`}
                >
                  Vence:{" "}
                  {alert.operation.fecha_vencimiento_alquiler
                    ? formatDate(alert.operation.fecha_vencimiento_alquiler)
                    : "N/A"}
                </p>
                <Link
                  href="/operationsList"
                  className={`text-xs font-medium hover:underline ${
                    alert.alertType === "30_days"
                      ? "text-red-700"
                      : "text-amber-700"
                  }`}
                >
                  Ver operación →
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RentExpirationAlerts;
