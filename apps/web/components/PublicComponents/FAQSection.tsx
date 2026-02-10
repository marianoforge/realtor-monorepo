const FAQSection = ({ id }: { id: string }) => {
  const faqs = [
    {
      question:
        "¿Qué medidas de seguridad existen para proteger los datos de los usuarios?",
      answer:
        "La seguridad de tus datos es nuestra máxima prioridad, lo cual es irónico si consideramos que en el mundo inmobiliario a veces se pasa por alto la privacidad. Para evitar que nuestros clientes se muden, por así decirlo, a otra plataforma o que terminemos figurando en los titulares por un desastre de datos, utilizamos métodos de seguridad robustos: cifrado de datos, centros de datos ultra-seguros y auditorías regulares para asegurarnos de que todo permanezca a salvo. Ni tus cifras ni tus secretos inmobiliarios saldrán por la puerta sin tu permiso.",
    },
    {
      question: "¿Hay una aplicación móvil disponible para Realtor Trackpro?",
      answer:
        'Sí, ofrecemos una aplicación móvil que pone todas las herramientas poderosas de Realtor Trackpro en la palma de tu mano. Ahora, ¿qué sería de un asesor inmobiliario sin poder consultar métricas y hacer pronósticos mientras toma café en una casa en venta? Nuestra app no escuchará tus conversaciones ni accederá a tu cámara sin tu autorización… pero siempre agradecemos que te mantengas "ubicado".',
    },
    {
      question:
        "¿Puedo personalizar el flujo de trabajo para que se ajuste a nuestro proceso de cierre de ventas?",
      answer:
        "Por supuesto que sí. Realtor Trackpro se adapta más rápido que un agente a una oferta de última hora. Sin embargo, no nos sorprendas: ya hemos investigado (legalmente, por supuesto) cómo trabajas y optimizamos la plataforma para que coincida con tus necesidades. Por eso te pedimos que tengas lista tu identidad y autorización bancaria, no para espantarte, sino porque creemos que la personalización es clave para cerrar mejores negocios.",
    },
    {
      question: "¿Qué tipo de soporte ofrecen",
      answer:
        "Nuestro equipo de soporte está siempre listo, sin descanso, las 24 horas del día, todos los días del año. Puedes contactarnos por chat, correo electrónico o teléfono, aunque, sinceramente, es probable que detectemos un problema antes de que tú lo hagas. No es que seamos espías; simplemente somos increíblemente eficientes.",
    },
    {
      question: "¿Qué opciones de licencia ofrecen?",
      answer: [
        "Disponemos de tres tipos de licencia que se ajustan a las necesidades de todos:",
        "<strong>Licencia Asesor:</strong> Ideal para los agentes individuales que desean llevar un control financiero de primera categoría. ¡A un precio que no vaciará tu cuenta de ahorros! (9.99 USD/mes o 99.99 USD/año).",
        "<strong>Licencia Team Leader:</strong> Para los líderes que quieren estar al tanto de cada cierre de negocio y cada informe de equipo. La herramienta que todo líder necesita, sin las complicaciones (11.99 USD/mes o 119.99 USD/año).",
        "<strong>Licencia Desarrollo (Add-Ons):</strong> Si tu agencia tiene grandes ideas (y un gran presupuesto para desarrollo), esta licencia es para ti. Creamos a medida, a la carta y cotizamos según el alcance. Porque aquí no vendemos sueños… ¡sino desarrollos personalizados!",
      ],
    },
    {
      question: "¿Cómo es el proceso de registro?",
      answer: [
        "",
        '<strong>Ve a www.realtortrackpro.com y selecciona "Registrarse</strong>',
        "<strong>Escoge la licencia que prefieras</strong>",
        "<strong>Ingresa tus datos básicos (prometemos no preguntar tu película favorita).</strong>",
        "<strong>¡Listo! Disfruta de una prueba gratuita de 15 días. Si decides continuar, se te cobrará automáticamente al octavo día.</strong>",
      ],
    },
    {
      question: "¿Cuáles son mis derechos y cuánto tiempo los conservo?",
      answer: [
        "Tus derechos están atados a la licencia que elijas:",
        "<strong>Acceso a funcionalidades:</strong>",
        "<strong>Actualizaciones y soporte:</strong>",
        "<strong>Licencia Desarrollo:</strong>",
      ],
    },
    {
      question:
        "¿La plataforma tiene políticas de devolución o lleva a otras páginas web?",
      answer:
        "No, y tampoco. Tienes 15 días de prueba, luego de eso puedes cancelar la licencia cuando desees.",
    },
  ];
  return (
    <section
      id={id}
      className="relative flex-col items-center justify-center w-full hidden xl:flex"
    >
      <div className="flex flex-col justify-around items-center mb-[40px] mt-40">
        <h3 className="text-sm text-gray-400 font-bold">
          PREGUNTAS FRECUENTES
        </h3>
        <h1 className="text-[52px] -mt-4 font-semibold">
          Resolvemos tus dudas
        </h1>
      </div>
      <div className="flex flex-col gap-8 justify-center items-center">
        {faqs.map((faq, index) => (
          <div key={index} className="flex flex-col gap-1 w-[29%]">
            <h3 className="text-sm font-bold">{faq.question}</h3>
            {Array.isArray(faq.answer) ? (
              <div className="text-sm text-gray-400">
                <p className="mb-2">{faq.answer[0]}</p>
                <ol className="list-decimal ml-5">
                  {faq.answer.slice(1).map((item, idx) => (
                    <li
                      key={idx}
                      dangerouslySetInnerHTML={{ __html: item }}
                      className="mb-2"
                    ></li>
                  ))}
                </ol>
              </div>
            ) : (
              <p className="text-sm text-gray-400">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
