import React, { useState, useRef, useEffect } from "react";
import { PlusIcon, CalendarIcon } from "@heroicons/react/24/outline";

interface ActionsMenuProps {
  onScheduleEvent: () => void;
}

const ActionsMenu: React.FC<ActionsMenuProps> = ({ onScheduleEvent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOptionClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-6 h-6 bg-blue-100 hover:bg-blue-200 text-blue-600 hover:text-blue-700 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md border border-blue-200"
        title="Agendar actividad"
      >
        <PlusIcon
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
          <button
            onClick={() => handleOptionClick(onScheduleEvent)}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
          >
            <CalendarIcon className="w-4 h-4" />
            Agendar Evento
          </button>
        </div>
      )}
    </div>
  );
};

export default ActionsMenu;
