import Link from "next/link";

import LicensesSection from "./LicensesSection";

const HeroSection = () => {
  return (
    <section className="text-white relative flex flex-col text-center sm:text-center md:text-start gap-8 md:flex-row w-full pb-16 pt-16 sm:pb-32 sm:pt-24 md:pb-48 md:pt-20 items-center justify-center">
      <div className="flex flex-col justify-center w-full  px-4 sm:px-8 md:px-16  text-white">
        <h4 className="text-lg sm:text-md font-medium mb-4 sm:mb-4 text-center">
          Se eficiente, se productivo, se parte del 1%
        </h4>
        <div className="flex justify-center items-center w-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[72px] font-medium mt-2 text-center leading-[1.5rem]">
            <span className="block mb-4">Optimiza tus números,</span>
            <span className="block">multiplica tus resultados</span>
          </h1>
        </div>
        <div className="flex flex-col justify-center items-center w-full">
          <h3 className="text-base sm:text-xl text-center mt-8">
            <span className="block">
              Realtor Trackpro fue diseñado específicamente para asesores y
              agencias inmobiliarias que buscan maximizar sus ingresos y
              optimizar sus inversiones.
            </span>
            <span className="hidden lg:hidden">Realtor Trackpro</span>
            <span className="hidden lg:hidden">
              fue diseñado específicamente para asesores y agencias
            </span>
            <span className="hidden lg:hidden">
              inmobiliarias que buscan maximizar sus ingresos y optimizar sus
              inversiones.
            </span>
          </h3>
          <div className="flex sm:flex-row flex-col justify-center items-center w-full sm:gap-4 lg:mt-6">
            <Link href="/register">
              <button className="w-[182px] px-4 mt-10 sm:px-4 py-2 sm:py-2 text-md sm:text-md font-bold rounded-full bg-white text-mediumBlue hover:bg-mediumBlue hover:text-white">
                Empieza Gratis
              </button>
            </Link>
            <Link
              href="https://calendly.com/mariano-realtortrackpro/realtor-demo"
              target="_blank"
            >
              <button className="w-[182px] px-4 mt-10 sm:px-4 py-2 sm:py-2 text-md sm:text-md font-bold rounded-full bg-white text-mediumBlue hover:bg-mediumBlue hover:text-white">
                Agenda un Demo
              </button>
            </Link>
          </div>
        </div>
      </div>
      <LicensesSection id="licenses-section" />
    </section>
  );
};

export default HeroSection;
