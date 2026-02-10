import React from "react";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { Tooltip } from "react-tooltip";

import { OPERATIONS_LIST_COLORS } from "@/lib/constants";

interface OperationsTableHeaderProps {
  isReservaDateAscending: boolean | null;
  isClosingDateAscending: boolean | null;
  isValueAscending: boolean | null;
  toggleReservaDateSortOrder: () => void;
  toggleClosingDateSortOrder: () => void;
  toggleValueSortOrder: () => void;
}

const OperationsTableHeader: React.FC<OperationsTableHeaderProps> = ({
  isReservaDateAscending,
  isClosingDateAscending,
  isValueAscending,
  toggleReservaDateSortOrder,
  toggleClosingDateSortOrder,
  toggleValueSortOrder,
}) => {
  return (
    <thead>
      <tr className="bg-lightBlue/10 hidden md:table-row text-center text-sm">
        <th
          className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold w-[120px]`}
        >
          Captación / Publicación
        </th>
        <th
          className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold w-[130px] cursor-pointer`}
          onClick={toggleReservaDateSortOrder}
        >
          <div className="flex items-center justify-center">
            Reserva / Promesa
            <span className="ml-1 text-xs text-mediumBlue">
              {isReservaDateAscending !== null &&
                (isReservaDateAscending ? (
                  <ArrowUpIcon
                    className="h-4 w-4 text-mediumBlue"
                    strokeWidth={3}
                  />
                ) : (
                  <ArrowDownIcon
                    className="h-4 w-4 text-mediumBlue"
                    strokeWidth={3}
                  />
                ))}
            </span>
          </div>
        </th>
        <th
          className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold w-[120px] cursor-pointer`}
          onClick={toggleClosingDateSortOrder}
        >
          <div className="flex items-center justify-center">
            Cierre
            <span className="ml-1 text-xs text-mediumBlue">
              {isClosingDateAscending !== null &&
                (isClosingDateAscending ? (
                  <ArrowUpIcon
                    className="h-4 w-4 text-mediumBlue"
                    strokeWidth={3}
                  />
                ) : (
                  <ArrowDownIcon
                    className="h-4 w-4 text-mediumBlue"
                    strokeWidth={3}
                  />
                ))}
            </span>
          </div>
        </th>

        <th
          className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold w-[120px]`}
        >
          Dirección
        </th>
        <th
          className={`py-3 ${OPERATIONS_LIST_COLORS.headerText} font-semibold w-[188px] cursor-pointer flex items-center justify-center `}
        >
          Operación
        </th>
        <th
          className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold w-[180px] cursor-pointer`}
          onClick={toggleValueSortOrder}
        >
          <div className="flex items-center justify-center">
            Valor Operación
            <span className="ml-1 text-xs text-mediumBlue">
              {isValueAscending !== null &&
                (isValueAscending ? (
                  <ArrowUpIcon
                    className="h-4 w-4 text-mediumBlue"
                    strokeWidth={3}
                  />
                ) : (
                  <ArrowDownIcon
                    className="h-4 w-4 text-mediumBlue"
                    strokeWidth={3}
                  />
                ))}
            </span>
          </div>
        </th>
        <th
          className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
        >
          Punta Vendedora
        </th>
        <th
          className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
        >
          Punta Compradora
        </th>
        <th
          className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold `}
        >
          % Puntas
        </th>
        <th
          className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
        >
          Puntas
        </th>
        <th
          className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
        >
          Honorarios Brutos
        </th>
        <th
          className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
        >
          Honorarios Netos
        </th>
        <th
          className={`flex items-center gap-1 py-8 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold w-[110px]`}
        >
          Estado
          <InformationCircleIcon
            className="inline-block ml-1 text-lightBlue h-4 w-4 cursor-pointer"
            data-tooltip-id="tooltip-estado"
            data-tooltip-content="Estado de la operacion C=Cerrada, A=Abierta / En Curso. Una vez cerrada la operación edita la fecha de la operacion."
          />
          <Tooltip id="tooltip-estado" place="top" />
        </th>
        <th
          className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
          colSpan={3}
        >
          Acciones
        </th>
      </tr>
    </thead>
  );
};

export default OperationsTableHeader;
