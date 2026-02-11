import { useState, Fragment, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import { signOut } from "firebase/auth";
import {
  XMarkIcon,
  Bars3Icon,
  HomeIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  UsersIcon,
  QuestionMarkCircleIcon,
  PlusIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowLeftStartOnRectangleIcon,
  ChartBarIcon,
  CalendarIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import { Dialog, Transition } from "@headlessui/react";

import { auth } from "@/lib/firebase";
import { useUserDataStore } from "@/stores/userDataStore";
import { useAuthStore } from "@/stores/authStore";
import { useCalculationsStore } from "@/stores/calculationsStore";
import { UserRole } from "@gds-si/shared-utils";
import { useTeamMembership } from "@/common/hooks/useTeamMembership";

interface MenuItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface MenuSection {
  title: string;
  icon: React.ReactNode;
  items: MenuItem[];
}

interface MenuSections {
  [key: string]: MenuSection;
}

const MOBILE_SCROLL_POSITION_KEY = "mobileNavbarScrollPosition";

const Navbar = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { userData } = useUserDataStore();
  const { role: authRole } = useAuthStore();
  const resetAuthStore = useAuthStore((state) => state.reset);
  const clearUserData = useUserDataStore((state) => state.clearUserData);
  const resetCalculationsStore = useCalculationsStore(
    (state) => state.resetStore
  );
  const { isTeamMember, isLoading: isTeamLoading } = useTeamMembership();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      closeMenu();
      clearUserData();
      resetCalculationsStore();
      queryClient.clear();
      await signOut(auth);
      resetAuthStore();
      const redirected = await router.push("/login");
      if (!redirected) {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      window.location.href = "/login";
    }
  };

  // Restaurar la posición del scroll cuando el menú se abre
  useEffect(() => {
    if (isMenuOpen) {
      const savedScrollPosition = sessionStorage.getItem(
        MOBILE_SCROLL_POSITION_KEY
      );
      if (savedScrollPosition && scrollContainerRef.current) {
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = parseInt(
              savedScrollPosition,
              10
            );
          }
        }, 50);
      }
    }
  }, [isMenuOpen]);

  // Guardar la posición del scroll cuando el usuario hace scroll
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || !isMenuOpen) return;

    const handleScroll = () => {
      sessionStorage.setItem(
        MOBILE_SCROLL_POSITION_KEY,
        scrollContainer.scrollTop.toString()
      );
    };

    scrollContainer.addEventListener("scroll", handleScroll);

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [isMenuOpen]);

  const dashboardItems = [
    {
      href: "/dashboard",
      label: "Dashboard Principal",
      icon: <HomeIcon className="h-4 w-4" />,
    },
  ];

  if (isTeamMember || isTeamLoading) {
    dashboardItems.push({
      href: "/messages",
      label: "Notificaciones y Mensajes",
      icon: (
        <svg
          className="h-4 w-4"
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
      ),
    });
  }

  const menuSections: MenuSections = {
    dashboard: {
      title: "Dashboard",
      icon: <HomeIcon className="h-5 w-5" />,
      items: dashboardItems,
    },
    operations: {
      title: "Operaciones",
      icon: <DocumentTextIcon className="h-5 w-5" />,
      items: [
        {
          href: "/operationsList",
          label: "Lista de Operaciones",
          icon: <DocumentTextIcon className="h-4 w-4" />,
        },
        {
          href: "/reservationInput",
          label: "Nueva Operación",
          icon: <PlusIcon className="h-4 w-4" />,
        },
        {
          href: "/cartera",
          label: "Cartera",
          icon: <BuildingOffice2Icon className="h-4 w-4" />,
        },
      ],
    },
    prospeccionProyeccion: {
      title: "Prospección y Proyección",
      icon: <ChartBarIcon className="h-5 w-5" />,
      items: [
        {
          href: "/prospection",
          label: "Prospección",
          icon: <UsersIcon className="h-4 w-4" />,
        },
        {
          href: "/projections",
          label: "Proyección",
          icon: <ChartBarIcon className="h-4 w-4" />,
        },
        {
          href: "/calendar",
          label: "Calendario",
          icon: <CalendarIcon className="h-4 w-4" />,
        },
      ],
    },
    expenses: {
      title: "Gastos",
      icon: <CurrencyDollarIcon className="h-5 w-5" />,
      items: [
        {
          href: "/expensesList",
          label: "Lista de Gastos",
          icon: <CurrencyDollarIcon className="h-4 w-4" />,
        },
        {
          href: "/expenses",
          label: "Nuevo Gasto",
          icon: <PlusIcon className="h-4 w-4" />,
        },
        {
          href: "/expenses-agents-form",
          label: "Nuevo Movimiento por Asesor",
          icon: <UsersIcon className="h-4 w-4" />,
        },
      ],
    },
  };

  const adminSections: MenuSections = {
    ...menuSections,
    admin: {
      title: "Administración",
      icon: <UsersIcon className="h-5 w-5" />,
      items: [
        {
          href: "/team-admin",
          label: "Seguimiento del Equipo",
          icon: <UsersIcon className="h-4 w-4" />,
        },
        {
          href: "/agents",
          label: "Tabla de Asesores",
          icon: <UserCircleIcon className="h-4 w-4" />,
        },
        {
          href: "/expenses-agents",
          label: "Movimientos por Asesor",
          icon: <CurrencyDollarIcon className="h-4 w-4" />,
        },
      ],
    },
  };

  const supportItems: MenuItem[] = [
    {
      href: "/faqs",
      label: "Preguntas Frecuentes",
      icon: <QuestionMarkCircleIcon className="h-4 w-4" />,
    },
  ];

  const getSections = (): MenuSections => {
    const roleToUse = userData?.role || authRole;

    switch (roleToUse) {
      case UserRole.TEAM_LEADER_BROKER:
        return adminSections;
      case UserRole.AGENTE_ASESOR:
        return menuSections;
      default:
        return { dashboard: menuSections.dashboard };
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 w-full bg-darkBlue z-50 text-center">
        <div className="flex items-center justify-between w-full px-4 py-6">
          <div className="xl:hidden flex items-center">
            <button
              className="text-white focus:outline-none p-3 hover:bg-white/10 rounded-lg transition-colors duration-200"
              onClick={toggleMenu}
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
          </div>

          {/* Logo con más espacio */}
          <div className="flex-1 flex justify-center xl:hidden">
            <div className="flex items-center justify-center py-2">
              <Image
                src="/trackproLogoWhite.png"
                alt="Logo"
                width={280}
                height={280}
                priority
              />
            </div>
          </div>

          {/* Espacio para balancear el layout */}
          <div className="xl:hidden w-[60px]"></div>
        </div>
      </nav>

      {/* Menú Móvil - Solo para móviles */}
      <Transition show={isMenuOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 xl:hidden"
          onClose={closeMenu}
        >
          {/* Overlay */}
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
          </Transition.Child>

          {/* Panel del Menú */}
          <div className="fixed inset-0 overflow-hidden">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-300"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-300"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="fixed inset-y-0 left-0 flex w-full max-w-sm flex-col bg-white">
                {/* Header del menú con perfil - fijo arriba */}
                <div className="shrink-0 px-6 pt-6 pb-4 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-lightBlue to-mediumBlue flex items-center justify-center">
                        <UserCircleIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {userData?.firstName || userData?.email || "Usuario"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {userData?.role === UserRole.TEAM_LEADER_BROKER
                          ? "Team Leader"
                          : "Agente Asesor"}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
                      onClick={closeMenu}
                    >
                      <XMarkIcon className="h-6 w-6 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Área scrollable con navegación */}
                <div
                  ref={scrollContainerRef}
                  className="flex-1 overflow-y-auto px-6 py-4"
                >
                  <nav className="space-y-2">
                    {Object.entries(getSections()).map(([key, section]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg">
                          <span className="text-mediumBlue">
                            {section.icon}
                          </span>
                          <span>{section.title}</span>
                        </div>

                        <div className="ml-4 space-y-1">
                          {section.items.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={closeMenu}
                              className="group flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-lightBlue/10 hover:text-mediumBlue transition-all duration-200"
                            >
                              <span className="text-gray-400 group-hover:text-mediumBlue transition-colors duration-200">
                                {item.icon}
                              </span>
                              <span>{item.label}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Sección de Soporte */}
                    <div className="space-y-1 pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg">
                        <QuestionMarkCircleIcon className="h-5 w-5 text-mediumBlue" />
                        <span>Soporte</span>
                      </div>

                      <div className="ml-4 space-y-1">
                        {supportItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={closeMenu}
                            className="group flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-lightBlue/10 hover:text-mediumBlue transition-all duration-200"
                          >
                            <span className="text-gray-400 group-hover:text-mediumBlue transition-colors duration-200">
                              {item.icon}
                            </span>
                            <span>{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </nav>
                </div>

                {/* Footer fijo con Configuración y Cerrar Sesión */}
                <div className="shrink-0 border-t border-gray-200 px-6 py-3 space-y-1.5">
                  <Link
                    href="/settings"
                    onClick={closeMenu}
                    className="flex items-center space-x-2 w-full px-3 py-2 bg-white rounded-md border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                  >
                    <Cog6ToothIcon className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-sm text-gray-700">
                      Configuración y Perfil
                    </span>
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 w-full px-3 py-2 bg-red-50/30 rounded-md border border-red-200/50 hover:border-red-300/70 hover:bg-red-50/50 hover:shadow-sm transition-all duration-200 text-left"
                  >
                    <ArrowLeftStartOnRectangleIcon className="h-4 w-4 text-red-500" />
                    <span className="font-medium text-sm text-red-600">
                      Cerrar Sesión
                    </span>
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default Navbar;
