import React from "react";

const CarteraActiva = () => {
  return (
    <div className="bg-white p-3 rounded-xl shadow-md w-full h-[380px] overflow-y-auto">
      <h2 className="text-[30px] lg:text-[24px] xl:text-[20px] 2xl:text-[24px] text-center font-semibold mt-2 xl:mb-3">
        Cartera Activa
      </h2>
      <div className="text-gray-600 px-4">
        <p className="mb-4 text-center text-[20px] xl:text-[16px] 2xl:text-[16px]">
          Próximamente estará disponible la información de cartera activa.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2 text-[18px] xl:text-[16px] 2xl:text-[16px]">
            ¿Qué es una cartera activa en el rubro inmobiliario?
          </h3>
          <p className="mb-3 text-[16px] xl:text-[14px] 2xl:text-[14px]">
            En el ámbito inmobiliario, una cartera activa no es simplemente un
            listado de propiedades, sino un conjunto de inmuebles en
            exclusividad, con autorizaciones vigentes, y —clave— a valor real de
            mercado, no sobrevaluadas.
          </p>
          <p className="mb-3 text-[16px] xl:text-[14px] 2xl:text-[14px]">
            Estas propiedades están en condiciones reales de ser vendidas o
            alquiladas:
          </p>
          <p className="mt-3 text-[16px] xl:text-[14px] 2xl:text-[14px]">
            Una cartera activa y bien curada es uno de los principales activos
            de cualquier asesor inmobiliario, ya que no se trata de cantidad,
            sino de calidad y potencial de cierre real.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CarteraActiva;
