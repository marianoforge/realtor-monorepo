import React, { useState, Fragment } from "react";
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";

interface OperationsMobileFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  yearFilter: string;
  setYearFilter: (year: string) => void;
  monthFilter: string;
  setMonthFilter: (month: string) => void;
  operationTypeFilter: string;
  setOperationTypeFilter: (type: string) => void;
  statusOptions: { value: string; label: string }[];
  yearsFilter: { value: string; label: string }[];
  monthsFilter: { value: string; label: string }[];
  operationVentasTypeFilter: { value: string; label: string }[];
}

const OperationsMobileFilters: React.FC<OperationsMobileFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  yearFilter,
  setYearFilter,
  monthFilter,
  setMonthFilter,
  operationTypeFilter,
  setOperationTypeFilter,
  statusOptions,
  yearsFilter,
  monthsFilter,
  operationVentasTypeFilter,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (statusFilter !== "all") count++;
    if (yearFilter !== new Date().getFullYear().toString()) count++;
    if (monthFilter !== "all") count++;
    if (operationTypeFilter !== "all") count++;
    return count;
  };

  const clearAllFilters = () => {
    setStatusFilter("all");
    setYearFilter(new Date().getFullYear().toString());
    setMonthFilter("all");
    setOperationTypeFilter("all");
    setSearchQuery("");
  };

  const getFilterLabel = (
    value: string,
    options: { value: string; label: string }[]
  ) => {
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

  return (
    <div className="space-y-3 mb-4">
      {/* Barra de búsqueda */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar por dirección..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-mediumBlue focus:border-mediumBlue text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Botón de filtros y chips de filtros activos */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 bg-mediumBlue text-white rounded-lg text-sm font-medium"
        >
          <FunnelIcon className="h-4 w-4" />
          <span>Filtros</span>
          {getActiveFiltersCount() > 0 && (
            <span className="bg-white text-mediumBlue rounded-full px-2 py-1 text-xs font-bold">
              {getActiveFiltersCount()}
            </span>
          )}
        </button>

        {getActiveFiltersCount() > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-500 underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Chips de filtros activos */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {statusFilter !== "all" && (
            <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">
              <span>Estado: {getFilterLabel(statusFilter, statusOptions)}</span>
              <button onClick={() => setStatusFilter("all")} className="ml-2">
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          )}
          {yearFilter !== new Date().getFullYear().toString() && (
            <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs">
              <span>Año: {yearFilter}</span>
              <button
                onClick={() =>
                  setYearFilter(new Date().getFullYear().toString())
                }
                className="ml-2"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          )}
          {monthFilter !== "all" && (
            <div className="flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs">
              <span>Mes: {getFilterLabel(monthFilter, monthsFilter)}</span>
              <button onClick={() => setMonthFilter("all")} className="ml-2">
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          )}
          {operationTypeFilter !== "all" && (
            <div className="flex items-center bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs">
              <span>
                Tipo:{" "}
                {getFilterLabel(operationTypeFilter, operationVentasTypeFilter)}
              </span>
              <button
                onClick={() => setOperationTypeFilter("all")}
                className="ml-2"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Panel de filtros expandible */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <Menu as="div" className="relative inline-block text-left w-full">
              <Menu.Button className="inline-flex justify-between w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mediumBlue">
                {getFilterLabel(statusFilter, statusOptions)}
                <ChevronDownIcon className="ml-2 -mr-1 h-5 w-5" />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-full origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="py-1">
                    {statusOptions.map((option) => (
                      <Menu.Item key={option.value}>
                        {({ active }) => (
                          <button
                            onClick={() => setStatusFilter(option.value)}
                            className={`${
                              active ? "bg-gray-100" : ""
                            } group flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                          >
                            {option.label}
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>

          {/* Año */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Año
            </label>
            <Menu as="div" className="relative inline-block text-left w-full">
              <Menu.Button className="inline-flex justify-between w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mediumBlue">
                {yearFilter}
                <ChevronDownIcon className="ml-2 -mr-1 h-5 w-5" />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-full origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="py-1">
                    {yearsFilter.map((option) => (
                      <Menu.Item key={option.value}>
                        {({ active }) => (
                          <button
                            onClick={() => setYearFilter(option.value)}
                            className={`${
                              active ? "bg-gray-100" : ""
                            } group flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                          >
                            {option.label}
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>

          {/* Mes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mes
            </label>
            <Menu as="div" className="relative inline-block text-left w-full">
              <Menu.Button className="inline-flex justify-between w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mediumBlue">
                {getFilterLabel(monthFilter, monthsFilter)}
                <ChevronDownIcon className="ml-2 -mr-1 h-5 w-5" />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-full origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="py-1">
                    {monthsFilter.map((option) => (
                      <Menu.Item key={option.value}>
                        {({ active }) => (
                          <button
                            onClick={() => setMonthFilter(option.value)}
                            className={`${
                              active ? "bg-gray-100" : ""
                            } group flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                          >
                            {option.label}
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>

          {/* Tipo de Operación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Operación
            </label>
            <Menu as="div" className="relative inline-block text-left w-full">
              <Menu.Button className="inline-flex justify-between w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mediumBlue">
                {getFilterLabel(operationTypeFilter, operationVentasTypeFilter)}
                <ChevronDownIcon className="ml-2 -mr-1 h-5 w-5" />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-full origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="py-1">
                    {operationVentasTypeFilter.map((option) => (
                      <Menu.Item key={option.value}>
                        {({ active }) => (
                          <button
                            onClick={() => setOperationTypeFilter(option.value)}
                            className={`${
                              active ? "bg-gray-100" : ""
                            } group flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                          >
                            {option.label}
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationsMobileFilters;
