import React from "react";
import { MapPinIcon } from "@heroicons/react/24/outline";
import { UseFormSetValue, FieldErrors } from "react-hook-form";

import AddressAutocompleteManual from "@/components/PrivateComponente/PlacesComponents/AddressAutocomplete";

import FormSectionWrapper from "./FormSectionWrapper";

export type AddressData = {
  address: string;
  city: string | null;
  province: string | null;
  country: string | null;
  houseNumber: string;
};

interface LocationSectionProps {
  addressData: AddressData;
  setAddressData: React.Dispatch<React.SetStateAction<AddressData>>;
  setValue: UseFormSetValue<any>;
  addressAutocompleteKey?: number;
  sectionNumber?: number;
  className?: string;
  errors?: FieldErrors<any>;
}

const LocationSection: React.FC<LocationSectionProps> = ({
  addressData,
  setAddressData,
  setValue,
  addressAutocompleteKey = 0,
  sectionNumber = 2,
  className = "",
  errors,
}) => {
  const handleAddressSelect = (address: {
    address: string;
    city: string | null;
    province: string | null;
  }) => {
    setAddressData((prev) => ({ ...prev, ...address }));
    setValue("direccion_reserva", address.address, { shouldValidate: true });
    setValue("localidad_reserva", address.city);
    setValue("provincia_reserva", address.province);
  };

  const handleHouseNumberChange = (houseNumber: string) => {
    setAddressData((prev) => ({ ...prev, houseNumber }));
  };

  return (
    <FormSectionWrapper
      icon={<MapPinIcon className="w-5 h-5" />}
      title="Ubicación"
      sectionNumber={sectionNumber}
      className={`location-section ${className}`}
    >
      <AddressAutocompleteManual
        key={addressAutocompleteKey}
        initialAddress={addressData.address}
        initialHouseNumber={addressData.houseNumber}
        onAddressSelect={handleAddressSelect}
        onHouseNumberChange={handleHouseNumberChange}
      />
      {errors?.direccion_reserva && (
        <p className="text-red-500 text-sm mt-1">
          {errors.direccion_reserva.message as string}
        </p>
      )}
    </FormSectionWrapper>
  );
};

export default LocationSection;
