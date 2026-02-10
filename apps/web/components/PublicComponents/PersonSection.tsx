import Image from "next/image";
const PersonSection = () => {
  return (
    <section className="relative mt-[2500px] lg:mt-[2200px]  xl:mt-[596px] h-[500px] flex flex-col text-center sm:text-center md:text-start gap-8 md:flex-row pb-24 pt-16 sm:pb-32 xl:pb-0 sm:pt-24 md:pb-48 md:pt-20 items-center justify-center w-full">
      <div className="absolute -top-[400px] lg:top-0 inset-2 bottom-0 rounded-xl ring-1 ring-black/5 bg-gradient-to-r bg-black"></div>
      <div className="w-full ">
        <div className="flex relative flex-col top-16 xl:top-24 lg:flex-row justify-center items-center gap-10 mb-[120px]">
          <div className="bg-transparent/10 border lg:ml-20 border-gray-100/15 rounded-[5%] px-[6px] py-[6px]">
            <Image
              src={"/gustavoDeSimone.jpg"}
              width={330}
              height={330}
              alt="person"
              className="rounded-[5%] shadow-xl 0"
            />
          </div>
          <div className="flex flex-col mb-80 sm:mb-20 md:mb-0 md:flex-row justify-center lg:justify-start lg:flex-col lg:mr-8">
            <div className="flex flex-col mb-6 md:pl-10 lg:pl-0 lg:mb-20 md:mb-40 lg:mt-20 lg:leading-[3rem] lg:w-full items-center w-full md:w-1/2 ">
              <p className=" w-[300px] sm:w-full text-[20px] lg:text-[32px] xl:text-[36px] text-white">
                &quot;No saber cómo manejar tus finanzas es el camino directo a
                la ruina&quot;
              </p>
            </div>
            <div className="flex flex-col mb-10 sm:mb-60 lg:mb-20 lg:mt-10 md:items-start lg:w-full w-[full] md:w-1/2 items-center">
              <p className="text-[18px] text-white mb-1">Gustavo De Simone</p>
              <p className=" w-[300px] mb-1 sm:w-full text-sm text-white">
                <span className="text-xl pt-2">🇦🇷</span> CEO de Gustavo De
                Simone Soluciones Inmobiliarias, Buenos Aires - Argentina
              </p>
              <p className=" w-[300px] mb-1 sm:w-full text-sm  text-white text-transparent">
                <span className="text-xl">🇵🇾</span> CEO ULTRA Real Estate,
                Asunción - Paraguay
              </p>
              <p className=" w-[300px] sm:w-full text-sm text-white">
                <span className="text-xl">🇵🇪</span> Broker Owner Re/Max
                Almafuerte, Lima - Perú
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PersonSection;
