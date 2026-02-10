import React, { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import { motion } from "framer-motion";

interface LandingStats {
  totalUsers: number;
  activeUsers: number;
  totalOperations: number;
  closedOperations: number;
  countries: number;
}

const testimonials = [
  {
    quote:
      "Medir me permitió descubrir fallas en la gestión, corregirlas y optimizar mi rentabilidad. Hoy puedo mostrar números que antes no alcanzaba. Si buscas un cambio en tu rendimiento, probalo. Yo me resistía al cambio y hoy lo recomiendo.",
    name: "Lucas Delgado",
    role: "Team Leader y Corredor Inmobiliario de ReMax Buró II",
    image: "/testimonial-1.png",
    imageStyle: "",
  },
  {
    quote:
      "Poder acceder en cualquier momento a números, estadísticas y detalles de operaciones, nos permitió identificar mejor la rentabilidad y nuestros agentes logran más cierres gracias al seguimiento constante y la planificación de inversiones.",
    name: "Ángeles Guajardo",
    role: "Broker de RE/MAX - Icon Chile",
    image: "/testimonial-2.png",
    imageStyle: "scale-150 translate-y-4",
  },
  {
    quote:
      "La centralización de la información. Clientes, propiedades, seguimientos y reportes, todo en un mismo lugar. Eso nos dio orden, rapidez y respuestas más oportunas. Si buscas un cambio en tu rendimiento, probalo. Yo me resistía al cambio y hoy lo recomiendo.",
    name: "Jorge Giralt",
    role: "CEO de Ultra Real Estate Paraguay",
    image: "/testimonial-3.png",
    imageStyle: "",
  },
];

const faqs = [
  {
    question:
      "¿Qué medidas de seguridad existen para proteger los datos de los usuarios?",
    answer:
      "Utilizamos cifrado de datos de última generación, servidores seguros en la nube y auditorías regulares de seguridad. Tus datos financieros y de operaciones están protegidos bajo los más altos estándares de la industria.",
  },
  {
    question: "¿Hay una aplicación móvil disponible para Realtor Trackpro?",
    answer:
      "Sí, Realtor Trackpro es 100% responsive y funciona perfectamente desde cualquier dispositivo móvil. Además, puedes instalarlo como una Progressive Web App (PWA) para acceso rápido desde tu celular.",
  },
  {
    question:
      "¿Puedo personalizar el flujo de trabajo ajustado a nuestro proceso de cierre?",
    answer:
      "Absolutamente. Realtor Trackpro se adapta a tu forma de trabajar. Puedes configurar tipos de operaciones, porcentajes de comisión, franquicias, referidos y mucho más según las necesidades de tu inmobiliaria.",
  },
  {
    question: "¿Qué tipo de soporte ofrecen?",
    answer:
      "Ofrecemos soporte por email, WhatsApp y videollamadas. Además, contamos con tutoriales en video, una sección de preguntas frecuentes y un chatbot inteligente que responde tus dudas 24/7.",
  },
];

const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isAsesorAnnual, setIsAsesorAnnual] = useState(false);
  const [isTeamLeaderAnnual, setIsTeamLeaderAnnual] = useState(false);
  const [stats, setStats] = useState<LandingStats>({
    totalUsers: 500,
    activeUsers: 500,
    totalOperations: 10000,
    closedOperations: 10000,
    countries: 15,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/landing-stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen font-montserrat overflow-x-hidden">
      <Head>
        <title>
          Realtor Trackpro - Optimiza tus números, multiplica tus resultados
        </title>
        <meta
          name="description"
          content="La plataforma que transforma la gestión inmobiliaria. Automatiza el cálculo de honorarios, trackea operaciones y gestiona tu equipo de forma profesional."
        />
      </Head>

      {/* Hero Section */}
      <section className="relative min-h-[700px] lg:min-h-[800px] xl:min-h-[900px] bg-gradient-to-br from-lightBlue via-mediumBlue to-darkBlue">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="/hero-background.png"
            alt="Hero Background"
            fill
            className="object-cover object-right-bottom"
            priority
            sizes="100vw"
            quality={100}
          />
        </div>
        {/* Navbar */}
        <header className="relative z-10 flex items-center justify-between px-6 md:px-16 lg:px-[150px] py-8 md:py-12">
          <Image
            src="/trackproLogoWhite.png"
            alt="Realtor Trackpro Logo"
            width={251}
            height={56}
            className="h-10 md:h-14 w-auto"
            priority
          />
          <div className="hidden md:flex items-center gap-4">
            <Link href="/register">
              <button className="px-6 py-2 bg-darkBlue text-white font-semibold rounded-full hover:bg-opacity-80 transition-all">
                Registrer
              </button>
            </Link>
            <Link href="/login">
              <button className="px-6 py-2 bg-white text-darkBlue font-semibold rounded-full hover:bg-opacity-90 transition-all">
                Login
              </button>
            </Link>
          </div>
          <div className="md:hidden flex items-center gap-3">
            <Link href="/login">
              <button className="px-4 py-2 bg-white text-darkBlue text-sm font-semibold rounded-full">
                Login
              </button>
            </Link>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 px-6 md:px-16 lg:px-[150px] pt-8 md:pt-16 pb-32 md:pb-48">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white text-4xl md:text-6xl lg:text-7xl xl:text-[85px] font-bold leading-tight"
          >
            Optimiza
            <br />
            tus números,
            <br />
            multiplica
            <br />
            tus resultados
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white text-lg md:text-xl lg:text-[22px] mt-8 max-w-[655px] font-medium"
          >
            Realtor Trackpro fue diseñado específicamente para asesores y
            agencias inmobiliarias que buscan maximizar sus ingresos y optimizar
            sus inversiones.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link href="/register">
              <button className="mt-10 px-8 py-3 bg-white text-darkBlue font-semibold rounded-full hover:bg-opacity-90 transition-all text-base">
                Empieza gratis
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/70 to-transparent" />
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-white -mt-1">
        <div className="px-6 md:px-16 lg:px-[150px]">
          <div className="text-center mb-16">
            <p className="text-lightBlue font-semibold text-sm uppercase tracking-wider mb-4">
              Cómo funciona
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
              Gestión inmobiliaria simplificada
            </h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg">
              Realtor Trackpro automatiza los cálculos más complejos para que
              vos te enfoques en lo que mejor hacés: vender.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center p-8"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-lightBlue to-darkBlue rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Cargá tu operación</h3>
              <p className="text-gray-600">
                Ingresá los datos de la propiedad, tipo de operación, valores y
                participantes en un formulario intuitivo de 6 pasos.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center p-8"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-lightBlue to-darkBlue rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Cálculo automático</h3>
              <p className="text-gray-600">
                El sistema calcula automáticamente honorarios, referidos,
                franquicias y reparticiones. Sin errores, sin planillas.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center p-8"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-lightBlue to-darkBlue rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Visualizá tu negocio</h3>
              <p className="text-gray-600">
                Dashboard con métricas en tiempo real, proyecciones de ingresos
                y análisis de rentabilidad para tomar mejores decisiones.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="px-6 md:px-16 lg:px-[150px]">
          <div className="text-center mb-12 md:mb-20">
            <p className="text-lightBlue font-bold text-sm uppercase tracking-widest mb-4">
              Potenciá tu negocio
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Todo lo que necesitás
              <br />
              <span className="text-darkBlue">en un solo lugar</span>
            </h2>
            <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
              Dejá de perder tiempo con planillas. Automatizá tu gestión y
              enfocate en cerrar más operaciones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Dashboard analítico */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-lightBlue to-darkBlue rounded-2xl flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-900">
                Dashboard en tiempo real
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Visualizá tus honorarios, operaciones cerradas, proyecciones y
                KPIs de tu negocio <strong>al instante</strong>.
              </p>
            </motion.div>

            {/* Cálculo de honorarios */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-lightBlue to-darkBlue rounded-2xl flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-900">
                Cálculo automático de honorarios
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                <strong>33 escenarios</strong> de cálculo. Referidos,
                compartidos, franquicias. Sin errores, sin planillas.
              </p>
            </motion.div>

            {/* Gestión de operaciones */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-lightBlue to-darkBlue rounded-2xl flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-900">
                Todos los tipos de operaciones
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Ventas, alquileres, desarrollos, loteamientos, fondos de
                comercio. <strong>Todo en un solo lugar</strong>.
              </p>
            </motion.div>

            {/* Control de gastos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-lightBlue to-darkBlue rounded-2xl flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-900">
                Conocé tu rentabilidad real
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Registrá gastos de marketing, operativos e inversiones. Sabé
                <strong> exactamente cuánto ganás</strong>.
              </p>
            </motion.div>

            {/* Calendario integrado */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-lightBlue to-darkBlue rounded-2xl flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-900">
                Calendario sincronizado
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Integración con <strong>Google Calendar</strong>. Programá
                visitas, seguimientos y nunca pierdas una cita.
              </p>
            </motion.div>

            {/* Gestión de equipos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-lightBlue to-darkBlue rounded-2xl flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-900">
                Liderá tu equipo
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Para brokers: <strong>seguimiento en tiempo real</strong> del
                equipo, tabla de asesores y reportes consolidados.
              </p>
            </motion.div>
          </div>

          {/* CTA dentro de features */}
          <div className="text-center mt-16">
            <Link href="/register">
              <button className="px-10 py-4 bg-gradient-to-r from-lightBlue to-darkBlue text-white font-bold rounded-full text-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl">
                Probalo gratis por 15 días
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Did You Know Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="px-6 md:px-16 lg:px-[150px]">
          <div className="text-center mb-16">
            <p className="text-lightBlue font-semibold text-sm uppercase tracking-wider mb-4">
              Datos del sector
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
              ¿Sabías que...?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="border-l-4 border-lightBlue pl-6 py-4"
            >
              <p className="text-2xl md:text-3xl font-bold text-darkBlue mb-2">
                El 72% de los inmobiliarios
              </p>
              <p className="text-gray-600">
                todavía usa Excel o papel para trackear sus honorarios. Con
                Realtor Trackpro, automatizás todo y eliminás errores de
                cálculo.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="border-l-4 border-lightBlue pl-6 py-4"
            >
              <p className="text-2xl md:text-3xl font-bold text-darkBlue mb-2">
                Más de 4 horas semanales
              </p>
              <p className="text-gray-600">
                se pierden en cálculos manuales de honorarios. Realtor Trackpro
                lo hace en segundos, liberando tiempo para vender.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="border-l-4 border-lightBlue pl-6 py-4"
            >
              <p className="text-2xl md:text-3xl font-bold text-darkBlue mb-2">
                El 85% de los brokers
              </p>
              <p className="text-gray-600">
                no tiene visibilidad real del rendimiento de su equipo. Con
                nuestro módulo de Team Leader, ves todo al instante.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="border-l-4 border-lightBlue pl-6 py-4"
            >
              <p className="text-2xl md:text-3xl font-bold text-darkBlue mb-2">
                Solo el 23% conoce
              </p>
              <p className="text-gray-600">
                su rentabilidad real después de gastos. Realtor Trackpro te
                muestra exactamente cuánto ganás y cuánto invertís.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="relative py-16 md:py-24 px-6 md:px-16 lg:px-[150px] bg-white overflow-hidden">
        {/* Decorative SVG */}
        <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4">
          <Image
            src="/logo-fondo.svg"
            alt=""
            width={564}
            height={718}
            className="opacity-40"
          />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-auto"
          >
            <Image
              src="/gustavoDeSimone.jpg"
              alt="Gustavo De Simone"
              width={364}
              height={495}
              className="rounded-2xl shadow-2xl w-full max-w-[364px] mx-auto lg:mx-0 object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1"
          >
            <h2 className="text-darkBlue text-3xl md:text-4xl lg:text-[48px] font-bold leading-snug lg:leading-[1.1] max-w-2xl">
              &quot;No saber cómo manejar tus finanzas es el camino directo a la
              ruina&quot;
            </h2>
            <div className="mt-8 text-sm">
              <p className="font-semibold text-black">Gustavo De Simone</p>
              <p className="text-gray-700 mt-1">
                🇦🇷 CEO de Gustavo De Simone Soluciones Inmobiliarias, Buenos
                Aires - Argentina
                <br />
                🇵🇾 CEO ULTRA Real Estate, Asunción - Paraguay
                <br />
                🇵🇪 Broker Owner Re/Max Almafuerte, Lima - Perú
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-lightBlue to-darkBlue">
        <div className="px-6 md:px-16 lg:px-[150px]">
          <div className="flex justify-center mb-12">
            <Image
              src="/trackproLogoWhite.png"
              alt="Realtor Trackpro"
              width={332}
              height={75}
              className="h-12 md:h-16 w-auto"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Asesor Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl p-8 shadow-xl flex flex-col"
            >
              <h3 className="text-darkBlue text-3xl md:text-4xl font-bold">
                Asesor
              </h3>
              <p className="text-gray-500 mt-2">
                Lo que necesitás para empezar.
              </p>

              <div className="mt-6">
                <span className="text-darkBlue text-2xl font-bold">
                  {isAsesorAnnual ? "$99.90" : "$9.99"}
                </span>
                <span className="text-gray-500 ml-2">
                  USD por {isAsesorAnnual ? "año" : "mes"}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => setIsAsesorAnnual(!isAsesorAnnual)}
                  className={`w-14 h-7 rounded-full relative transition-colors duration-200 ${
                    isAsesorAnnual ? "bg-darkBlue" : "bg-lightBlue"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                      isAsesorAnnual ? "translate-x-8" : "translate-x-1"
                    }`}
                  />
                </button>
                <p className="text-gray-500 text-sm">
                  Maximiza tu inversión con
                  <br />
                  una licencia anual
                </p>
              </div>

              <ul className="mt-8 space-y-4 text-[15px] flex-grow">
                <li>
                  Acceso completo a funcionalidades esenciales de Realtor
                  Trackpro
                </li>
                <li>
                  Dashboard de seguimiento de honorarios, operaciones y gastos.
                </li>
                <li>Análisis de rentabilidad.</li>
                <li>Cuadros de Operaciones dinámicos e interactivos.</li>
                <li>Programación de eventos y calendario de actividades.</li>
                <li>
                  Ideal para la gestión de ingresos, análisis de inversiones y
                  gastos.
                </li>
              </ul>

              <Link href="/register" className="mt-auto">
                <button className="w-full mt-8 py-3 bg-darkBlue text-white font-semibold rounded-full hover:bg-opacity-90 transition-all">
                  Empieza gratis
                </button>
              </Link>
            </motion.div>

            {/* Team Leader Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-xl flex flex-col"
            >
              <h3 className="text-darkBlue text-3xl md:text-4xl font-bold leading-tight whitespace-nowrap">
                Team Leader / Broker
              </h3>
              <p className="text-gray-500 mt-2">
                Todo lo que necesitas para liderar tu equipo.
              </p>

              <div className="mt-6">
                <span className="text-darkBlue text-2xl font-bold">
                  {isTeamLeaderAnnual ? "$129.90" : "$12.99"}
                </span>
                <span className="text-gray-500 ml-2">
                  USD por {isTeamLeaderAnnual ? "año" : "mes"}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => setIsTeamLeaderAnnual(!isTeamLeaderAnnual)}
                  className={`w-14 h-7 rounded-full relative transition-colors duration-200 ${
                    isTeamLeaderAnnual ? "bg-darkBlue" : "bg-lightBlue"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                      isTeamLeaderAnnual ? "translate-x-8" : "translate-x-1"
                    }`}
                  />
                </button>
                <p className="text-gray-500 text-sm">
                  Maximiza tu inversión con
                  <br />
                  una licencia anual
                </p>
              </div>

              <ul className="mt-8 space-y-4 text-[15px] flex-grow">
                <li>
                  Incluye todas las características de la Licencia Asesor.
                </li>
                <li>
                  Módulo adicional para análisis de rentabilidad e ingresos del
                  equipo de asesores.
                </li>
                <li>
                  Cuadros dinámicos e interactivos para el seguimiento de
                  operaciones de miembros del equipo.
                </li>
                <li>
                  Perfecta para líderes de equipo y gerentes de agencias
                  inmobiliarias.
                </li>
              </ul>

              <Link href="/register" className="mt-auto">
                <button className="w-full mt-8 py-3 bg-darkBlue text-white font-semibold rounded-full hover:bg-opacity-90 transition-all">
                  Empieza gratis
                </button>
              </Link>
            </motion.div>

            {/* Enterprise Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-xl md:col-span-2 lg:col-span-1 flex flex-col"
            >
              <h3 className="text-darkBlue text-3xl md:text-4xl font-bold">
                Enterprise
              </h3>
              <p className="text-gray-500 mt-2">
                Flexibilidad para operaciones
                <br />a gran escala.
              </p>

              <div className="mt-6">
                <span className="text-darkBlue text-2xl font-bold">
                  Contáctanos
                </span>
              </div>

              <ul className="mt-12 space-y-4 text-[15px] flex-grow">
                <li>Orientada a agencias con necesidades personalizadas.</li>
                <li>
                  Opción de desarrollar add-ons únicos adaptados a procesos
                  específicos.
                </li>
                <li>
                  Expande las capacidades de las licencias Asesor y Team Leader.
                </li>
                <li>Cotización independiente según el proyecto.</li>
              </ul>

              <a
                href="mailto:info@realtortrackpro.com"
                className="block w-full mt-auto"
              >
                <button className="w-full mt-8 py-3 bg-darkBlue text-white font-semibold rounded-full hover:bg-opacity-90 transition-all">
                  Contáctanos
                </button>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-lightBlue to-darkBlue py-8 px-6 md:px-16 lg:px-[150px]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <h2 className="text-white text-2xl md:text-4xl font-bold text-center md:text-left">
            ¿Quieres conocer el resto?
          </h2>
          <a
            href="https://calendly.com/mariano-realtortrackpro/realtor-demo"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-opacity-90 transition-all whitespace-nowrap">
              Agendar demo
            </button>
          </a>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="px-6 md:px-16 lg:px-[150px]">
          <h2 className="text-center text-3xl md:text-5xl font-bold mb-16">
            Testimonios
            <br />
            de nuestros clientes
          </h2>

          <div className="bg-gradient-to-b from-darkBlue to-lightBlue rounded-2xl py-12 px-6 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="rounded-full w-24 h-24 md:w-32 md:h-32 overflow-hidden border-4 border-white/20">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={180}
                      height={180}
                      className={`w-full h-full object-cover ${testimonial.imageStyle}`}
                    />
                  </div>
                  <p className="text-white font-medium text-sm md:text-base mt-6 leading-relaxed">
                    {testimonial.quote}
                  </p>
                  <p className="text-white/80 text-sm mt-4">
                    {testimonial.name}, {testimonial.role}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Bar */}
      <section className="bg-darkBlue py-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 px-6">
          <p className="text-white text-lg md:text-2xl">
            Síguenos en Instagram
          </p>
          <a
            href="https://instagram.com/realtor_trackpro"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:opacity-80 transition-opacity"
          >
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="px-6 md:px-16 lg:px-[150px]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6"
            >
              <p className="text-4xl md:text-5xl font-bold text-darkBlue">
                +{stats.activeUsers}
              </p>
              <p className="text-gray-600 mt-2">Asesores activos</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-6"
            >
              <p className="text-4xl md:text-5xl font-bold text-darkBlue">
                +
                {stats.totalOperations >= 1000
                  ? `${(stats.totalOperations / 1000).toFixed(1)}K`
                  : stats.totalOperations}
              </p>
              <p className="text-gray-600 mt-2">Operaciones registradas</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-6"
            >
              <p className="text-4xl md:text-5xl font-bold text-darkBlue">12</p>
              <p className="text-gray-600 mt-2">Países Activos</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="p-6"
            >
              <p className="text-4xl md:text-5xl font-bold text-darkBlue">
                98%
              </p>
              <p className="text-gray-600 mt-2">Satisfacción</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="px-6 md:px-16 lg:px-[150px]">
          <div className="flex justify-center mb-12">
            <div className="bg-darkBlue text-white text-2xl md:text-4xl font-bold py-4 px-12 md:px-24 rounded-full">
              Preguntas frecuentes
            </div>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="border-2 border-darkBlue rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-base md:text-lg pr-4">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-6 h-6 text-darkBlue flex-shrink-0 transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openFaq === index && (
                  <div className="px-4 pb-4 text-gray-600">{faq.answer}</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-lightBlue py-12 md:py-16">
        <div className="px-6 md:px-16 lg:px-[150px]">
          <div className="mb-12">
            <Image
              src="/trackproLogoWhite.png"
              alt="Realtor Trackpro"
              width={267}
              height={60}
              className="h-12 md:h-16 w-auto"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 text-white">
            <div>
              <h4 className="text-white/70 mb-4">Compañía</h4>
              <ul className="space-y-3 text-sm font-bold">
                <li>
                  <a
                    href="/RealtorTrackproTerminosYPolíticas.pdf"
                    target="_blank"
                    className="hover:underline"
                  >
                    Términos y condiciones
                  </a>
                </li>
                <li>
                  <Link
                    href="/politicas-privacidad"
                    className="hover:underline"
                  >
                    Política de privacidad
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white/70 mb-4">Contacto</h4>
              <ul className="space-y-3 text-sm font-bold">
                <li>Argentina: +54 9 11 6676-6615</li>
                <li>España: +34 613 73 92 74</li>
                <li>USA: +1 (407) 751-1733</li>
                <li>info@realtortrackpro.com</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white/70 mb-4">Dirección</h4>
              <ul className="space-y-3 text-sm font-bold">
                <li>
                  Argentina: Avda. Cabildo 3950,
                  <br />
                  Piso 13, CABA 1602
                </li>
                <li>
                  España: Carrer De L&apos;argenter
                  <br />
                  Suarez 4, Valencia 46009
                </li>
                <li>
                  USA: 8330 SW 12th Street,
                  <br />
                  Pembroke Pines, FL 33025
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white/70 mb-4">Producto</h4>
              <ul className="space-y-3 text-sm font-bold">
                <li>
                  <Link href="/faqs" className="hover:underline">
                    FAQs
                  </Link>
                </li>
                <li>
                  <a href="#pricing" className="hover:underline">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white/70 mb-4">Redes</h4>
              <ul className="space-y-3 text-sm font-bold">
                <li>
                  <a href="https://linkedin.com" className="hover:underline">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href="https://instagram.com/realtor_trackpro"
                    className="hover:underline"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="https://youtube.com/@Realtor Trackpro"
                    className="hover:underline"
                  >
                    YouTube
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/20 text-center text-white text-sm">
            © 2024 Realtor Track Pro - Avemiller LLC.
          </div>
        </div>
      </footer>

      {/* WhatsApp Float Button */}
      <a
        href="https://wa.me/+34613739274"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors z-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          fill="currentColor"
          className="w-6 h-6"
        >
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
        </svg>
      </a>
    </div>
  );
};

export default LandingPage;
