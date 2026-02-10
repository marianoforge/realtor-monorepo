import React, { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/solid";

interface LicenseCardProps {
  title: string;
  description: string;
  price: string;
  annualPrice?: string;
  buttonText: string;
  priceId?: string;
  annualPriceId?: string;
  features: string[];
  onSelect: (priceId: string) => void;
}

const LicenseCard: React.FC<LicenseCardProps> = ({
  title,
  description,
  price,
  annualPrice,
  buttonText,
  priceId,
  annualPriceId,
  features,
  onSelect,
}) => {
  const [isAnnual, setIsAnnual] = useState(false);

  const togglePrice = () => {
    setIsAnnual(!isAnnual);
  };

  const displayedPrice = isAnnual ? annualPrice : price;

  return (
    <div className="bg-gray-100/30 p-6 border rounded-xl shadow-xl lg:min-w-[360px] w-[360px] h-[630px] relative">
      <div className="absolute bg-white inset-2 rounded-xl border border-opacity-50 border-gray-300 py-4 px-6">
        <div className="flex flex-col mt-3 mb-4">
          <h2 className="text-xs text-gray-400 font-semibold mb-1">{title}</h2>
          <p className="text-sm">{description}</p>
        </div>
        <div className="flex items-center mb-2">
          <p className="text-[40px] font-bold mt-2">{displayedPrice}</p>
          <div className="flex flex-col">
            {price !== "Contáctanos" && (
              <>
                <p className="text-xs text-gray-600 flex mt-2 ml-3">USD</p>
                <p className="text-xs text-gray-600 flex  ml-3">
                  {isAnnual ? "por año" : "por mes"}
                </p>
              </>
            )}
          </div>
        </div>
        <button
          onClick={() =>
            onSelect(isAnnual ? (annualPriceId ?? "") : (priceId ?? ""))
          }
          className="bg-mediumBlue text-white py-2 px-4 my-4 rounded-full"
        >
          {buttonText}
        </button>
        <div className="mt-4 flex items-center">
          {price !== "Contáctanos" && (
            <button
              onClick={togglePrice}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition duration-150 ease-in-out z-100 ${
                isAnnual ? `bg-mediumBlue` : `bg-lightBlue`
              }`}
            >
              <span
                className={`${
                  isAnnual ? "translate-x-6" : "translate-x-1"
                } inline-block w-4 h-4 transform bg-white rounded-full transition duration-150 ease-in-out`}
              ></span>
            </button>
          )}
          {price !== "Contáctanos" && (
            <span className="ml-3 text-sm text-gray-700">
              Maximiza tu inversión con una licencia anual
            </span>
          )}
        </div>
        <ul className="mt-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm mb-3">
              <PlusIcon className="max-h-4 max-w-4 min-h-4 min-w-4 text-gray-300 mr-2" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LicenseCard;
