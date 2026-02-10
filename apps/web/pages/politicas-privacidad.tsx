import React from "react";
import Link from "next/link";
import Navbar from "@/components/PublicComponents/CommonComponents/Navbar";
import Footer from "@/components/PublicComponents/CommonComponents/Footer";

const PoliticasPrivacidad = () => {
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="relative w-full">
          <div className="absolute inset-2 bottom-0 rounded-xl ring-1 ring-black/5 bg-gradient-to-r from-lightBlue via-mediumBlue to-darkBlue"></div>
          <div className="relative flex flex-col justify-center items-center w-full px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 2xl:px-48">
            <Navbar />
          </div>
        </div>
        <main className="pt-8">
          <div className="max-w-4xl mx-auto px-4 py-16 bg-white rounded-lg shadow-sm mt-8 mb-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Política de Privacidad
              </h1>
              <p className="text-lg text-gray-600">
                Última actualización: Enero 2024
              </p>
            </div>

            <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  1. Información que Recopilamos
                </h2>
                <p className="mb-4">
                  En Realtor Trackpro, recopilamos información que usted nos
                  proporciona directamente cuando:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Se registra para crear una cuenta</li>
                  <li>Utiliza nuestros servicios y funcionalidades</li>
                  <li>Se comunica con nosotros para soporte técnico</li>
                  <li>Participa en encuestas o promociones</li>
                </ul>
                <p className="mt-4">
                  Los tipos de información que podemos recopilar incluyen:
                  nombre, dirección de correo electrónico, número de teléfono,
                  información de facturación, datos de transacciones
                  inmobiliarias, y otra información relacionada con su actividad
                  profesional.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  2. Cómo Utilizamos su Información
                </h2>
                <p className="mb-4">
                  Utilizamos la información recopilada para:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Proporcionar, mantener y mejorar nuestros servicios</li>
                  <li>Procesar transacciones y enviar confirmaciones</li>
                  <li>
                    Enviar comunicaciones técnicas y actualizaciones de
                    seguridad
                  </li>
                  <li>
                    Responder a sus comentarios, preguntas y solicitudes de
                    soporte
                  </li>
                  <li>Desarrollar nuevos productos y servicios</li>
                  <li>Cumplir con obligaciones legales y regulatorias</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  3. Compartir Información
                </h2>
                <p className="mb-4">
                  No vendemos, comercializamos ni transferimos su información
                  personal a terceros, excepto en las siguientes circunstancias:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Proveedores de servicios:</strong> Compartimos
                    información con terceros que nos ayudan a operar nuestro
                    negocio, como procesadores de pagos y proveedores de hosting
                  </li>
                  <li>
                    <strong>Cumplimiento legal:</strong> Cuando sea requerido
                    por ley o para proteger nuestros derechos legales
                  </li>
                  <li>
                    <strong>Transferencias comerciales:</strong> En caso de
                    fusión, adquisición o venta de activos
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  4. Seguridad de Datos
                </h2>
                <p className="mb-4">
                  Implementamos medidas de seguridad técnicas, administrativas y
                  físicas apropiadas para proteger su información personal
                  contra acceso no autorizado, alteración, divulgación o
                  destrucción. Estas medidas incluyen:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Cifrado de datos en tránsito y en reposo</li>
                  <li>Controles de acceso estrictos</li>
                  <li>Monitoreo regular de seguridad</li>
                  <li>Auditorías de seguridad periódicas</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  5. Retención de Datos
                </h2>
                <p>
                  Conservamos su información personal durante el tiempo que sea
                  necesario para cumplir con los propósitos descritos en esta
                  política, a menos que la ley requiera o permita un período de
                  retención más largo. Cuando ya no necesitemos su información,
                  la eliminaremos de forma segura.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  6. Sus Derechos
                </h2>
                <p className="mb-4">
                  Dependiendo de su ubicación, puede tener los siguientes
                  derechos con respecto a su información personal:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Acceder a la información que tenemos sobre usted</li>
                  <li>Corregir información inexacta o incompleta</li>
                  <li>Solicitar la eliminación de su información</li>
                  <li>Oponerse al procesamiento de su información</li>
                  <li>Solicitar la portabilidad de sus datos</li>
                  <li>
                    Retirar su consentimiento cuando el procesamiento se base en
                    el consentimiento
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  7. Cookies y Tecnologías Similares
                </h2>
                <p>
                  Utilizamos cookies y tecnologías similares para mejorar su
                  experiencia, analizar el uso de nuestros servicios y
                  personalizar el contenido. Puede controlar el uso de cookies a
                  través de la configuración de su navegador, aunque esto puede
                  afectar la funcionalidad de nuestros servicios.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  8. Transferencias Internacionales
                </h2>
                <p>
                  Su información puede ser transferida y procesada en países
                  distintos al suyo. Nos aseguramos de que dichas transferencias
                  cumplan con las leyes de protección de datos aplicables y que
                  su información reciba un nivel adecuado de protección.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  9. Menores de Edad
                </h2>
                <p>
                  Nuestros servicios no están dirigidos a menores de 18 años. No
                  recopilamos conscientemente información personal de menores de
                  18 años. Si descubrimos que hemos recopilado información de un
                  menor, la eliminaremos inmediatamente.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  10. Cambios a esta Política
                </h2>
                <p>
                  Podemos actualizar esta política de privacidad ocasionalmente.
                  Le notificaremos sobre cambios significativos publicando la
                  nueva política en nuestro sitio web y actualizando la fecha de
                  "última actualización" en la parte superior de esta página.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  11. Contacto
                </h2>
                <p className="mb-4">
                  Si tiene preguntas sobre esta política de privacidad o sobre
                  cómo manejamos su información personal, puede contactarnos a
                  través de:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <ul className="space-y-3">
                    <li>
                      <strong>Email:</strong>
                      <a
                        href="mailto:info@realtortrackpro.com"
                        className="text-blue-600 hover:underline ml-2"
                      >
                        info@realtortrackpro.com
                      </a>
                    </li>
                    <li>
                      <strong>Teléfono Argentina:</strong>
                      <a
                        href="tel:+5491166766615"
                        className="text-blue-600 hover:underline ml-2"
                      >
                        +54 9 11 6676-6615
                      </a>
                    </li>
                    <li>
                      <strong>Teléfono España:</strong>
                      <a
                        href="tel:+34613739274"
                        className="text-blue-600 hover:underline ml-2"
                      >
                        +34 613 73 92 74
                      </a>
                    </li>
                    <li>
                      <strong>Teléfono USA:</strong>
                      <a
                        href="tel:+14077511733"
                        className="text-blue-600 hover:underline ml-2"
                      >
                        +1 (407) 751-1733
                      </a>
                    </li>
                    <li>
                      <strong>WhatsApp:</strong>
                      <a
                        href="https://wa.me/+34613739274"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline ml-2"
                      >
                        +34 613 73 92 74
                      </a>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="border-t pt-8 mt-12">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Compromiso con su Privacidad
                  </h3>
                  <p className="text-gray-700">
                    En Realtor Trackpro, nos comprometemos a proteger su
                    privacidad y a ser transparentes sobre cómo recopilamos,
                    utilizamos y protegemos su información. Esta política
                    refleja nuestro compromiso continuo con la protección de sus
                    datos personales.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default PoliticasPrivacidad;
