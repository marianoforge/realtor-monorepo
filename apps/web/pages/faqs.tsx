import { useState, useMemo } from "react";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import PrivateLayout from "@/components/PrivateComponente/PrivateLayout";
import PrivateRoute from "@/components/PrivateComponente/PrivateRoute";

interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
}

const faqs: FAQ[] = [
  // REGISTRO Y ACCESO
  {
    id: 1,
    category: "Registro y Acceso",
    question: "¿Cómo me registro en Realtor Trackpro?",
    answer:
      'Ve a www.realtortrackpro.com, selecciona "Registrarse", elige tu licencia, ingresa tus datos básicos y disfruta de 15 días de prueba gratuita.',
    keywords: ["registro", "crear cuenta", "sign up", "registrarse"],
  },
  {
    id: 2,
    category: "Registro y Acceso",
    question: "¿Qué tipos de licencia están disponibles?",
    answer:
      "Licencia Asesor ($9.99/mes o $99.99/año), Licencia Team Leader ($11.99/mes o $119.99/año), y Licencia Desarrollo personalizada.",
    keywords: [
      "licencia",
      "precios",
      "planes",
      "suscripción",
      "asesor",
      "team leader",
    ],
  },
  {
    id: 3,
    category: "Registro y Acceso",
    question: "¿Cómo recupero mi contraseña?",
    answer:
      'Usa la opción "Olvidé mi contraseña" en la página de login para recibir un enlace de restablecimiento.',
    keywords: ["contraseña", "password", "recuperar", "olvidé", "reset"],
  },
  {
    id: 4,
    category: "Registro y Acceso",
    question: "¿Hay una aplicación móvil disponible?",
    answer:
      "Sí, la aplicación móvil te permite acceder a todas las funcionalidades desde tu dispositivo móvil.",
    keywords: ["móvil", "app", "aplicación", "celular", "smartphone"],
  },

  // DASHBOARD Y MÉTRICAS
  {
    id: 5,
    category: "Dashboard y Métricas",
    question: "¿Qué información muestra el dashboard principal?",
    answer:
      "Honorarios netos y brutos, operaciones cerradas, cantidad de puntas, promedios mensuales, gráficos de evolución y proyecciones.",
    keywords: ["dashboard", "panel", "métricas", "estadísticas", "información"],
  },
  {
    id: 6,
    category: "Dashboard y Métricas",
    question: "¿Cómo establecer mi objetivo anual de ventas?",
    answer:
      "Puedes configurar tu objetivo anual en la configuración inicial para que el sistema calcule tu progreso automáticamente.",
    keywords: ["objetivo", "meta", "ventas anuales", "configurar", "progreso"],
  },
  {
    id: 7,
    category: "Dashboard y Métricas",
    question: '¿Qué significa "cantidad total de puntas"?',
    answer:
      "Se refiere al número total de compradores y vendedores involucrados en tus operaciones (una operación con comprador y vendedor = 2 puntas).",
    keywords: ["puntas", "compradores", "vendedores", "cantidad"],
  },
  {
    id: 8,
    category: "Dashboard y Métricas",
    question: "¿Cómo ver las estadísticas de honorarios mes a mes?",
    answer:
      "El dashboard incluye gráficos que muestran la evolución mensual de honorarios comparando años anteriores.",
    keywords: [
      "estadísticas",
      "honorarios",
      "mensual",
      "gráficos",
      "evolución",
    ],
  },
  {
    id: 9,
    category: "Dashboard y Métricas",
    question: '¿Qué son los "honorarios en curso"?',
    answer:
      "Representan el monto potencial que ganarías si todas las reservas actuales se cierran exitosamente.",
    keywords: ["honorarios en curso", "potencial", "reservas", "proyección"],
  },

  // OPERACIONES INMOBILIARIAS
  {
    id: 10,
    category: "Operaciones Inmobiliarias",
    question: "¿Qué tipos de operaciones puedo registrar?",
    answer:
      "Ventas, alquileres temporales, alquileres tradicionales, alquileres comerciales, fondos de comercio, desarrollos inmobiliarios, cocheras y loteamientos.",
    keywords: [
      "tipos operaciones",
      "ventas",
      "alquileres",
      "desarrollos",
      "cocheras",
      "loteamientos",
    ],
  },
  {
    id: 11,
    category: "Operaciones Inmobiliarias",
    question: "¿Cómo registro una nueva operación?",
    answer:
      'Ve a "Form de Operaciones", completa todos los campos requeridos incluyendo ubicación, tipo de operación, valores y comisiones.',
    keywords: ["registrar operación", "nueva operación", "formulario", "crear"],
  },
  {
    id: 12,
    category: "Operaciones Inmobiliarias",
    question: "¿Cómo asignar porcentajes de comisión?",
    answer:
      "En el formulario de operaciones puedes asignar porcentajes para punta vendedora y compradora, y el sistema calculará automáticamente el total.",
    keywords: [
      "comisión",
      "porcentajes",
      "punta vendedora",
      "punta compradora",
    ],
  },
  {
    id: 13,
    category: "Operaciones Inmobiliarias",
    question:
      "¿Puedo registrar operaciones compartidas con otras inmobiliarias?",
    answer:
      "Sí, indica si tienes la parte vendedora o compradora y asigna el porcentaje correspondiente a la otra inmobiliaria.",
    keywords: [
      "operaciones compartidas",
      "inmobiliarias",
      "compartir",
      "colaboración",
    ],
  },
  {
    id: 14,
    category: "Operaciones Inmobiliarias",
    question: "¿Cómo registrar un referido en una operación?",
    answer:
      "En el formulario puedes ingresar el nombre de quien refirió la propiedad y el porcentaje acordado.",
    keywords: ["referido", "referencia", "comisión referido"],
  },
  {
    id: 15,
    category: "Operaciones Inmobiliarias",
    question: "¿Qué es la exclusividad de operación?",
    answer:
      "Puedes marcar si la operación es exclusiva o no exclusiva, lo que afecta las estadísticas de tu cartera.",
    keywords: ["exclusividad", "exclusiva", "no exclusiva", "cartera"],
  },
  {
    id: 16,
    category: "Operaciones Inmobiliarias",
    question: "¿Cómo editar o eliminar una operación?",
    answer:
      "En la lista de operaciones, usa los botones de editar o eliminar en cada registro.",
    keywords: ["editar operación", "eliminar operación", "modificar", "borrar"],
  },
  {
    id: 17,
    category: "Operaciones Inmobiliarias",
    question: "¿Puedo filtrar operaciones por fecha, tipo o estado?",
    answer:
      "Sí, la lista de operaciones incluye filtros por año, mes, tipo de operación y estado.",
    keywords: ["filtrar operaciones", "filtros", "fecha", "tipo", "estado"],
  },

  // GESTIÓN DE GASTOS
  {
    id: 18,
    category: "Gestión de Gastos",
    question: "¿Cómo registro mis gastos?",
    answer:
      'Ve a "Form de Gastos", ingresa fecha, monto, tipo de gasto y descripción. El sistema maneja conversión de monedas automáticamente.',
    keywords: ["registrar gastos", "gastos", "formulario gastos", "expenses"],
  },
  {
    id: 19,
    category: "Gestión de Gastos",
    question: "¿Qué tipos de gastos puedo registrar?",
    answer:
      "Fee de franquicia, cartelería, marketing, publicidad, contador, sueldos, matrícula, alquiler de oficina, portales inmobiliarios, CRM, viáticos, entre otros.",
    keywords: [
      "tipos gastos",
      "franquicia",
      "marketing",
      "publicidad",
      "contador",
      "alquiler",
    ],
  },
  {
    id: 20,
    category: "Gestión de Gastos",
    question: "¿Cómo funciona la conversión de monedas en gastos?",
    answer:
      "Si trabajas en USD, puedes ingresar gastos en moneda local con la cotización del dólar, y el sistema calcula automáticamente el equivalente.",
    keywords: ["conversión monedas", "dólares", "cotización", "moneda local"],
  },
  {
    id: 21,
    category: "Gestión de Gastos",
    question: "¿Puedo programar gastos recurrentes?",
    answer:
      'Sí, marca la opción "Repetir Mensualmente" y el gasto se registrará automáticamente cada mes.',
    keywords: ["gastos recurrentes", "repetir mensualmente", "automático"],
  },
  {
    id: 22,
    category: "Gestión de Gastos",
    question: "¿Cómo ver mis gastos por categoría?",
    answer:
      "En la lista de gastos puedes filtrar por tipo y ver el total por categoría.",
    keywords: ["gastos por categoría", "filtrar gastos", "categorías"],
  },

  // CALENDARIO Y EVENTOS
  {
    id: 23,
    category: "Calendario y Eventos",
    question: "¿Cómo agendar eventos en el calendario?",
    answer:
      'Ve a "Form de Eventos", ingresa título, fecha, hora de inicio y fin, dirección y descripción del evento.',
    keywords: ["agendar eventos", "calendario", "eventos", "citas"],
  },
  {
    id: 24,
    category: "Calendario y Eventos",
    question: "¿Puedo ver el calendario en diferentes vistas?",
    answer:
      "Sí, puedes alternar entre vista diaria, semanal y mensual según tus necesidades.",
    keywords: ["vistas calendario", "diaria", "semanal", "mensual"],
  },
  {
    id: 25,
    category: "Calendario y Eventos",
    question: "¿Cómo eliminar un evento del calendario?",
    answer:
      'Haz clic en el evento y selecciona la opción "Eliminar" en el modal que aparece.',
    keywords: ["eliminar evento", "borrar evento", "cancelar cita"],
  },
  {
    id: 26,
    category: "Calendario y Eventos",
    question: "¿Los eventos se sincronizan entre dispositivos?",
    answer:
      "Sí, todos los eventos se guardan en la nube y se sincronizan automáticamente.",
    keywords: ["sincronización", "nube", "dispositivos", "sync"],
  },

  // GESTIÓN DE EQUIPOS
  {
    id: 27,
    category: "Gestión de Equipos",
    question: "¿Cómo agregar asesores a mi equipo?",
    answer:
      "Como Team Leader, puedes crear asesores desde el formulario de operaciones o gestionar tu equipo desde la sección correspondiente.",
    keywords: ["agregar asesores", "team leader", "equipo", "crear asesor"],
  },
  {
    id: 28,
    category: "Gestión de Equipos",
    question: "¿Cómo asignar operaciones a mis asesores?",
    answer:
      "En el formulario de operaciones, selecciona el asesor responsable y define los porcentajes de comisión.",
    keywords: ["asignar operaciones", "asesores", "responsable", "comisiones"],
  },
  {
    id: 29,
    category: "Gestión de Equipos",
    question: "¿Puedo ver las operaciones de cada asesor?",
    answer:
      'Sí, en "Seguimiento del Equipo" y "Tabla de Asesores" puedes ver el rendimiento individual de cada miembro.',
    keywords: [
      "operaciones asesor",
      "seguimiento equipo",
      "rendimiento",
      "tabla asesores",
    ],
  },
  {
    id: 30,
    category: "Gestión de Equipos",
    question: "¿Cómo funcionan los cálculos cuando participo como asesor?",
    answer:
      "Cuando el Team Leader participa como asesor, recibe el 100% del porcentaje asignado, no los honorarios netos.",
    keywords: ["team leader asesor", "cálculos", "participación", "honorarios"],
  },
  {
    id: 31,
    category: "Gestión de Equipos",
    question: "¿Qué pasa con operaciones sin asesor asignado?",
    answer:
      "Se asignan automáticamente al Team Leader con 100% de facturación.",
    keywords: [
      "operaciones sin asesor",
      "asignación automática",
      "team leader",
    ],
  },
  {
    id: 32,
    category: "Gestión de Equipos",
    question: "¿Puedo registrar gastos para mis asesores?",
    answer:
      'Sí, usa "Form de Gastos de Asesores" para asignar gastos específicos a cada miembro del equipo.',
    keywords: ["gastos asesores", "gastos equipo", "asignar gastos"],
  },

  // PROYECCIONES Y ANÁLISIS
  {
    id: 33,
    category: "Proyecciones y Análisis",
    question: "¿Cómo ver mis proyecciones de ventas?",
    answer:
      'La sección "Proyecciones" te ayuda a planificar ventas y actividades basándose en tus datos históricos.',
    keywords: ["proyecciones", "ventas futuras", "planificación", "análisis"],
  },
  {
    id: 34,
    category: "Proyecciones y Análisis",
    question: "¿Qué muestra el gráfico de operaciones caídas?",
    answer:
      "Muestra las operaciones que se cancelaron, permitiendo analizar patrones y mejorar tu proceso.",
    keywords: ["operaciones caídas", "canceladas", "análisis", "patrones"],
  },
  {
    id: 35,
    category: "Proyecciones y Análisis",
    question: "¿Cómo interpretar los días promedio de venta?",
    answer:
      "Calcula el tiempo promedio entre la captación de una propiedad y su reserva/cierre.",
    keywords: ["días promedio", "tiempo venta", "captación", "cierre"],
  },
  {
    id: 36,
    category: "Proyecciones y Análisis",
    question: "¿Puedo comparar mi rendimiento entre años?",
    answer:
      "Sí, los gráficos muestran comparaciones año a año para identificar tendencias.",
    keywords: ["comparar años", "rendimiento", "tendencias", "histórico"],
  },

  // CONFIGURACIÓN Y PERSONALIZACIÓN
  {
    id: 37,
    category: "Configuración y Personalización",
    question: "¿Cómo cambiar mi moneda de trabajo?",
    answer:
      "En configuración puedes seleccionar entre diferentes monedas (USD, ARS, etc.).",
    keywords: ["cambiar moneda", "configuración", "USD", "ARS", "divisa"],
  },
  {
    id: 38,
    category: "Configuración y Personalización",
    question: "¿Puedo personalizar los tipos de gastos?",
    answer:
      'Existe la opción "Otros" donde puedes especificar tipos de gastos personalizados.',
    keywords: [
      "personalizar gastos",
      "tipos gastos",
      "otros",
      "personalización",
    ],
  },
  {
    id: 39,
    category: "Configuración y Personalización",
    question: "¿Cómo actualizar mis datos personales?",
    answer:
      "Ve a la sección de configuración para modificar tu información de perfil.",
    keywords: ["datos personales", "perfil", "actualizar", "configuración"],
  },

  // SEGURIDAD Y SOPORTE
  {
    id: 40,
    category: "Seguridad y Soporte",
    question: "¿Qué medidas de seguridad protegen mis datos?",
    answer:
      "Utilizamos cifrado de datos, centros de datos seguros y auditorías regulares para proteger tu información.",
    keywords: ["seguridad", "cifrado", "protección datos", "privacidad"],
  },
  {
    id: 41,
    category: "Seguridad y Soporte",
    question: "¿Qué tipo de soporte ofrecen?",
    answer:
      "Soporte 24/7 por chat, correo electrónico o teléfono, además de WhatsApp integrado.",
    keywords: ["soporte", "ayuda", "chat", "teléfono", "whatsapp"],
  },
  {
    id: 42,
    category: "Seguridad y Soporte",
    question: "¿Puedo exportar mis datos?",
    answer:
      "Sí, puedes generar reportes y exportar información para análisis externos.",
    keywords: ["exportar datos", "reportes", "análisis", "backup"],
  },
  {
    id: 43,
    category: "Seguridad y Soporte",
    question: "¿Hay políticas de devolución?",
    answer:
      "Tienes 15 días de prueba gratuita, después puedes cancelar cuando desees.",
    keywords: ["devolución", "cancelar", "prueba gratuita", "políticas"],
  },

  // PROBLEMAS TÉCNICOS
  {
    id: 44,
    category: "Problemas Técnicos",
    question: "¿Por qué no aparecen mis operaciones en el dashboard?",
    answer:
      "Verifica que hayas asignado correctamente el asesor y que la operación esté guardada.",
    keywords: [
      "operaciones no aparecen",
      "dashboard",
      "problemas",
      "no se ven",
    ],
  },
  {
    id: 45,
    category: "Problemas Técnicos",
    question: "¿Cómo solucionar problemas de sincronización?",
    answer: "Refresca la página o cierra y abre la aplicación nuevamente.",
    keywords: ["sincronización", "problemas", "refrescar", "reload"],
  },
  {
    id: 46,
    category: "Problemas Técnicos",
    question: "¿Qué hacer si no puedo acceder a mi cuenta?",
    answer:
      "Verifica tu conexión a internet y contacta soporte si el problema persiste.",
    keywords: ["no puedo acceder", "login", "cuenta", "conexión"],
  },
  {
    id: 47,
    category: "Problemas Técnicos",
    question: "¿Por qué los cálculos no coinciden con mis expectativas?",
    answer:
      "Revisa que todos los porcentajes estén correctamente ingresados y considera descuentos de franquicia.",
    keywords: [
      "cálculos incorrectos",
      "porcentajes",
      "franquicia",
      "descuentos",
    ],
  },
];

const FAQItem = ({
  faq,
  isOpen,
  onToggle,
}: {
  faq: FAQ;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  return (
    <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
      <button
        className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex justify-between items-center"
        onClick={onToggle}
      >
        <span className="font-medium text-gray-900">{faq.question}</span>
        {isOpen ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-white">
          <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
          <div className="mt-3">
            <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              {faq.category}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const FAQsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const categories = [
    "Todas",
    ...Array.from(new Set(faqs.map((faq) => faq.category))),
  ];

  const filteredFAQs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesSearch =
        searchTerm === "" ||
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.keywords.some((keyword) =>
          keyword.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === "Todas" || faq.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const toggleItem = (id: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const expandAll = () => {
    setOpenItems(new Set(filteredFAQs.map((faq) => faq.id)));
  };

  const collapseAll = () => {
    setOpenItems(new Set());
  };

  return (
    <PrivateRoute>
      <PrivateLayout>
        <div className="max-w-4xl mx-auto px-4 py-8 mt-20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Preguntas Frecuentes
            </h1>
            <p className="text-lg text-gray-600">
              Encuentra respuestas a las preguntas más comunes sobre
              RealtorTrackpro
            </p>
          </div>

          {/* Buscador */}
          <div className="mb-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar en preguntas frecuentes..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filtros por categoría */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                    selectedCategory === category
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Controles de expansión */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              {filteredFAQs.length} pregunta
              {filteredFAQs.length !== 1 ? "s" : ""} encontrada
              {filteredFAQs.length !== 1 ? "s" : ""}
            </p>
            <div className="space-x-2">
              <button
                onClick={expandAll}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
              >
                Expandir todas
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
              >
                Contraer todas
              </button>
            </div>
          </div>

          {/* Lista de FAQs */}
          <div className="space-y-4">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq) => (
                <FAQItem
                  key={faq.id}
                  faq={faq}
                  isOpen={openItems.has(faq.id)}
                  onToggle={() => toggleItem(faq.id)}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No se encontraron preguntas que coincidan con tu búsqueda.
                </p>
                <p className="text-gray-400 mt-2">
                  Intenta con otros términos o selecciona una categoría
                  diferente.
                </p>
              </div>
            )}
          </div>

          {/* Contacto adicional */}
          <div className="mt-12 p-6 bg-blue-50 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¿No encontraste lo que buscabas?
            </h3>
            <p className="text-gray-600 mb-4">
              Nuestro equipo de soporte está disponible 24/7 para ayudarte
            </p>
            <a
              href="https://wa.me/+34613739274"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
              </svg>
              Contactar por WhatsApp
            </a>
          </div>
        </div>
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default FAQsPage;
