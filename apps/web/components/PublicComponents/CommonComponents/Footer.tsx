import Link from "next/link";
import React from "react";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="p-4 pt-0 relative h-auto w-full rounded-xl">
      <div className="absolute inset-2 bottom-0 rounded-b-xl ring-1 ring-black/5 bg-gradient-to-r from-mediumBlue via-lightBlue to-darkBlue -z-10"></div>
      <div className="flex flex-col mx-auto justify-around text-white items-center z-50">
        <div className="text-white text-[40px] text-center mt-10 leading-tight">
          <p>¿Estás listo para emprender</p>
          <p>como los profesionales?</p>
        </div>
        <div className="text-white text-md text-center mt-6">
          <p>Descubre la herramienta que cambiará tu vida</p>
          <p>y te permitirá maximizar tus ingresos.</p>
        </div>
        <Link href="/register">
          <button className="w-full max-w-[182px] px-4 mt-10 lg:mt-10 sm:px-4 py-2 sm:py-2 text-md sm:text-md font-bold rounded-full bg-white text-mediumBlue hover:bg-mediumBlue hover:text-white">
            Empieza Gratis
          </button>
        </Link>

        <hr className="w-full border-t border-dotted border-opacity-50 border-white mt-10" />
        <hr className="w-full border-t border-dotted border-opacity-50 border-white my-1" />
        <div className="flex flex-col md:flex-row justify-center md:justify-start w-full h-auto items-center md:items-start text-center md:text-left">
          <div className="flex flex-row justify-center md:justify-start h-32 items-center mt-4 w-full md:w-2/6 ml-2">
            <Image
              src="/trackproLogoWhite.png"
              alt="logo"
              width={200}
              height={100}
            />
          </div>
          <div className="flex flex-col md:flex-row justify-center md:justify-start h-auto items-center md:items-start w-full md:w-4/7 gap-10 md:gap-20">
            <div className="flex flex-col justify-center md:justify-start h-auto items-center md:items-start text-white">
              <h5 className="mt-1 mb-6 text-slate-300">Companía</h5>
              <a
                href="/RealtorTrackproTerminosYPolíticas.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline mb-3"
              >
                Términos y condiciones
              </a>
              <Link href="/politicas-privacidad">
                <span className="hover:underline cursor-pointer">
                  Política de privacidad
                </span>
              </Link>
            </div>
            <div className="flex flex-col justify-center md:justify-start h-auto items-center md:items-start text-white">
              <h5 className="mt-1 mb-6 text-slate-300">Contacto</h5>

              <a href="tel:+5491130411111" className="hover:underline mb-2">
                Argentina: +54 9 11 6676-6615
              </a>
              <a href="tel:+34613739274" className="hover:underline mb-2">
                España: +34 613 73 92 74
              </a>
              <a href="tel:+14077511733" className="hover:underline mb-4">
                USA: +1 (407) 751-1733
              </a>
              <a
                href="mailto:info@realtortrackpro.com"
                className="hover:underline mb-3"
              >
                info@realtortrackpro.com
              </a>
            </div>
            <div className="flex flex-col justify-center md:justify-start h-auto items-center md:items-start text-white">
              <h5 className="mt-1 mb-6 text-slate-300">Dirección</h5>
              <a
                href="https://www.google.com/maps?q=Carrer+De+L%27argenter+Suarez+4+-+Apto+1"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline mb-3"
              >
                Argentina: Avda. Cabildo 3950, Piso 13, CABA 1602
              </a>
              <a
                href="https://www.google.com/maps?q=Carrer+De+L%27argenter+Suarez+4+-+Apto+1"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline mb-3"
              >
                España: Carrer De L&apos;argenter Suarez 4, Valencia 46009
              </a>
              <a
                href="https://www.google.com/maps?q=8330+SW+12th+Street,+Pembroke+Pines,+FL+33025"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                USA: 8330 SW 12th Street, Pembroke Pines, FL 33025
              </a>
            </div>
            <div className="flex flex-col justify-center md:justify-start h-auto items-center md:items-start text-white">
              <h5 className="mt-1 mb-6 text-slate-300">Producto</h5>
              <p className="hover:underline mb-3">
                <Link href="#faq-section">FAQs</Link>
              </p>
              <p className="hover:underline">
                <Link href="#licenses-section">Pricing</Link>
              </p>
            </div>
          </div>
        </div>
        <hr className="w-full border-t border-dotted border-opacity-50 border-white" />
        <hr className="w-full border-t border-dotted border-opacity-50 border-white my-1" />

        <div className="flex flex-col md:flex-row justify-center  w-full h-16 items-center ml-4 text-center md:text-left">
          <p>© 2024 Realtor Track Pro - Avemiller LLC.</p>
        </div>
        <hr className="w-full border-t border-dotted border-opacity-50 border-white" />
        <hr className="w-full border-t border-dotted border-opacity-50 border-white my-1" />
      </div>
    </footer>
  );
};

export default Footer;
