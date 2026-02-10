import BounceCard from "./BounceCard";

const CardsSection = () => {
  return (
    <section className="relative flex flex-col text-center sm:text-center md:text-start gap-8 md:flex-row pt-16 -mt-2 xl:mt-16 xl:pb-0 md:pt-20 items-center justify-center w-full">
      <div className="absolute inset-2 bottom-0 rounded-t-xl bg-gradient-to-r from-mediumBlue via-lightBlue to-darkBlue h-[1200px] sm:h-[820px]"></div>
      <div className="w-full">
        <div className="flex flex-col 2xl:flex-row lg:justify-around lg:items-center">
          <BounceCard
            title={<strong>¿Estás seguro que estás teniendo éxito?</strong>}
            description="Hoy en día me atrevo a asegurar que, al menos el 99% de los emprendedores a los que he capacitado, nunca han hecho un plan de negocio."
            delay={0.2}
          />

          <BounceCard
            title={<strong>Las preguntas fundamentales</strong>}
            description="El secreto está en que puedas responder con el mayor margen de certeza y detalle estas tres preguntas: ¿Dónde estoy?, ¿Para dónde voy?, ¿Cómo hago para llegar?"
            delay={0.6}
          />

          <BounceCard
            title={<strong>¿La Visión puede cambiar con el tiempo?</strong>}
            description="Estaba teniendo cierto éxito en mi carrera, pero estaba fracasando en vivir la vida que soñaba."
            delay={1}
          />
        </div>
      </div>
    </section>
  );
};

export default CardsSection;
