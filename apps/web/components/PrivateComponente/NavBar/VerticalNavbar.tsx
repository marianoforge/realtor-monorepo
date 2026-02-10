import { useEffect, useRef } from "react";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ClipboardDocumentCheckIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserPlusIcon,
  UsersIcon,
  Cog8ToothIcon,
  QuestionMarkCircleIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

import { auth } from "@/lib/firebase";
import { useUserDataStore } from "@/stores/userDataStore";
import { UserActions } from "@/components/PrivateComponente/NavComponents/UserActions";
import { UserRole } from "@gds-si/shared-utils";
import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import { useTeamMembership } from "@/common/hooks/useTeamMembership";
import { AUTHORIZED_ADMIN_OFFICE_UIDS } from "@/lib/authorizedUsers";

import { NavLink } from "../NavComponents/NavLink";

const SCROLL_POSITION_KEY = "verticalNavbarScrollPosition";

const VerticalNavbar = () => {
  const { userData, isLoading, fetchItems } = useUserDataStore();
  const { isTeamMember, isLoading: isTeamLoading } = useTeamMembership();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchItems(user.uid);
      }
    });

    return () => unsubscribe();
  }, [fetchItems]);

  // Restaurar la posición del scroll cuando el componente se monta
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);
    if (savedScrollPosition && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = parseInt(savedScrollPosition, 10);
    }
  }, [isLoading]);

  // Guardar la posición del scroll cuando el usuario hace scroll
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      sessionStorage.setItem(
        SCROLL_POSITION_KEY,
        scrollContainer.scrollTop.toString()
      );
    };

    scrollContainer.addEventListener("scroll", handleScroll);

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [isLoading]);

  const renderAdminLink = () => {
    if (AUTHORIZED_ADMIN_OFFICE_UIDS.includes(userData?.uid || "")) {
      return (
        <NavLink
          href="/admin-office"
          icon={<Cog8ToothIcon className="w-5 h-5 mr-2 text-lightBlue" />}
          label="Admin"
        />
      );
    }
    return null;
  };

  const renderNavButtons = () => (
    <>
      <div className="space-y-1">
        <div className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg">
          <span className="text-mediumBlue">
            <HomeIcon className="h-5 w-5" />
          </span>
          <span className="font-bold">Home</span>
        </div>
        <div className="ml-4 space-y-1">
          <NavLink
            href="/dashboard"
            icon={<HomeIcon className="w-4 h-4 mr-2 text-gray-400" />}
            label="Dashboard Principal"
          />
          {(isTeamMember || isTeamLoading) && (
            <NavLink
              href="/messages"
              icon={
                <svg
                  className="w-4 h-4 mr-2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              }
              label="Notificaciones y Mensajes"
            />
          )}
        </div>
      </div>

      <div className="space-y-1 pt-4 border-t border-gray-200 mt-4">
        <div className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg">
          <span className="text-mediumBlue">
            <ClipboardDocumentListIcon className="h-5 w-5" />
          </span>
          <span className="font-bold">Operaciones y Clientes</span>
        </div>
        <div className="ml-4 space-y-1">
          <NavLink
            href="/operationsList"
            icon={
              <ClipboardDocumentListIcon className="w-4 h-4 mr-2 text-gray-400" />
            }
            label="Lista de Operaciones"
          />
          <NavLink
            href="/reservationInput"
            icon={
              <ClipboardDocumentCheckIcon className="w-4 h-4 mr-2 text-gray-400" />
            }
            label="Nueva Operación"
          />
          <NavLink
            href="/projections"
            icon={<ChartBarIcon className="w-4 h-4 mr-2 text-gray-400" />}
            label="Proyecciones"
          />
          <NavLink
            href="/prospection"
            icon={<UsersIcon className="w-4 h-4 mr-2 text-gray-400" />}
            label="Prospección"
          />
          <NavLink
            href="/calendar"
            icon={<CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />}
            label="Calendario"
          />
        </div>
      </div>

      <div className="space-y-1 pt-4 border-t border-gray-200 mt-4">
        <div className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg">
          <span className="text-mediumBlue">
            <CurrencyDollarIcon className="h-5 w-5" />
          </span>
          <span className="font-bold">Gastos e Inversión</span>
        </div>
        <div className="ml-4 space-y-1">
          <NavLink
            href="/expensesList"
            icon={<CurrencyDollarIcon className="w-4 h-4 mr-2 text-gray-400" />}
            label="Lista de Gastos"
          />
          <NavLink
            href="/expenses"
            icon={<CurrencyDollarIcon className="w-4 h-4 mr-2 text-gray-400" />}
            label="Nuevo Gasto"
          />
          <NavLink
            href="/expenses-agents-form"
            icon={<UsersIcon className="w-4 h-4 mr-2 text-gray-400" />}
            label="Nuevo Movimiento por Asesor"
          />
        </div>
      </div>
    </>
  );

  const renderTeamLeaderNavButtons = () => (
    <>
      {renderNavButtons()}

      <div className="space-y-1 pt-4 border-t border-gray-200 mt-4">
        <div className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg">
          <span className="text-mediumBlue">
            <UsersIcon className="h-5 w-5" />
          </span>
          <span className="font-bold">Administración y Equipo</span>
        </div>
        <div className="ml-4 space-y-1">
          <NavLink
            href="/team-admin"
            icon={<UsersIcon className="w-4 h-4 mr-2 text-gray-400" />}
            label="Seguimiento del Equipo"
          />
          <NavLink
            href="/agents"
            icon={<UserPlusIcon className="w-4 h-4 mr-2 text-gray-400" />}
            label="Tabla de Asesores"
          />
          <NavLink
            href="/expenses-agents"
            icon={<CurrencyDollarIcon className="w-4 h-4 mr-2 text-gray-400" />}
            label="Movimientos por Asesor"
          />
        </div>
      </div>

      <div className="space-y-1 pt-4 border-t border-gray-200 mt-4">
        <div className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg">
          <span className="text-mediumBlue">
            <QuestionMarkCircleIcon className="h-5 w-5" />
          </span>
          <span className="font-bold">Soporte</span>
        </div>
        <div className="ml-4 space-y-1">
          <NavLink
            href="/faqs"
            icon={
              <QuestionMarkCircleIcon className="w-4 h-4 mr-2 text-gray-400" />
            }
            label="Preguntas Frecuentes"
          />
        </div>
      </div>
    </>
  );

  const renderNavLinksBasedOnRole = () => {
    if (!userData) return renderNavButtons();

    const adminLinkForSpecificUser = renderAdminLink();

    if (userData.role === UserRole.TEAM_LEADER_BROKER) {
      return (
        <>
          {adminLinkForSpecificUser}
          {renderTeamLeaderNavButtons()}
        </>
      );
    }

    return (
      <>
        {adminLinkForSpecificUser}
        {renderNavButtons()}
      </>
    );
  };

  if (isLoading) {
    return (
      <nav className="h-[calc(100vh-8rem)] text-sm flex-col w-[320px] fixed left-0 top-16 hidden xl:block z-40">
        <div className="flex flex-col h-full bg-white shadow-sm border-r border-gray-200">
          <div className="flex items-center justify-center h-20 flex-shrink-0">
            <Image
              src="/trackProLogo.png"
              alt="Logo"
              width={350}
              height={350}
            />
          </div>
          <div className="mx-6 h-[1px] bg-gray-300 flex-shrink-0"></div>
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
          >
            <div className="p-4 space-y-2 pb-8">
              <SkeletonLoader height={40} count={15} />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="h-[calc(100vh-8rem)] text-sm flex-col w-[320px] fixed left-0 top-16 hidden xl:block z-40">
      <div className="flex flex-col h-full bg-white shadow-sm border-r border-gray-200">
        <div className="flex items-center justify-center h-20 flex-shrink-0">
          <Image src="/trackProLogo.png" alt="Logo" width={350} height={350} />
        </div>
        <div className="mx-6 h-[1px] bg-gray-300 flex-shrink-0"></div>

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
        >
          <div className="p-4 space-y-2 pb-8">
            {renderNavLinksBasedOnRole()}

            <div className="border-t border-gray-200 pt-4 mt-6">
              <UserActions />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default VerticalNavbar;
