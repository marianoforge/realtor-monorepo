import React, { useState, useEffect, useRef } from "react";

import { usePlacesAutocomplete } from "@/common/hooks/useAutocompleteSuggestions";
import Input from "@/components/PrivateComponente/FormComponents/Input";
import { useDebounce } from "@/common/hooks/useDebounce";
import { useAuthStore } from "@/stores/authStore";

interface AddressComponent {
  types: string[];
  long_name: string;
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: {
    address: string;
    city: string | null;
    province: string | null;
    country: string | null;
  }) => void;
  onHouseNumberChange: (houseNumber: string) => void;
  initialAddress?: string;
  initialHouseNumber?: string;
}

export default function AddressAutocompleteManual({
  onAddressSelect,
  onHouseNumberChange,
  initialAddress = "",
  initialHouseNumber = "",
}: AddressAutocompleteProps) {
  const [value, setValue] = useState(initialAddress);
  const [houseNumber, setHouseNumber] = useState<string>(initialHouseNumber);
  const [country, setCountry] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [province, setProvince] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isUserTypingRef = useRef(false);
  const prevInitialAddressRef = useRef(initialAddress);
  const prevInitialHouseNumberRef = useRef(initialHouseNumber);

  const debouncedValue = useDebounce(value, 300);

  const {
    data: suggestions,
    isError,
    error: queryError,
  } = usePlacesAutocomplete(debouncedValue);

  // Solo actualizar desde props cuando realmente cambian desde fuera (no durante la escritura)
  useEffect(() => {
    // Si el usuario está escribiendo, no sobrescribir
    if (isUserTypingRef.current) {
      prevInitialAddressRef.current = initialAddress;
      prevInitialHouseNumberRef.current = initialHouseNumber;
      return;
    }

    // Solo actualizar si el prop cambió desde fuera y es diferente del estado actual
    const addressChanged = initialAddress !== prevInitialAddressRef.current;
    const houseNumberChanged =
      initialHouseNumber !== prevInitialHouseNumberRef.current;

    if (addressChanged && initialAddress !== value) {
      setValue(initialAddress);
    }
    if (houseNumberChanged && initialHouseNumber !== houseNumber) {
      setHouseNumber(initialHouseNumber);
    }

    prevInitialAddressRef.current = initialAddress;
    prevInitialHouseNumberRef.current = initialHouseNumber;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAddress, initialHouseNumber]);

  useEffect(() => {
    if (isError && queryError instanceof Error) {
      setError(queryError.message);
    }
  }, [isError, queryError]);

  const handleSelectSuggestion = async (
    description: string,
    placeId: string
  ) => {
    setValue(description);
    setIsDropdownOpen(false);

    try {
      const token = await useAuthStore.getState().getAuthToken();
      if (!token) throw new Error("User not authenticated");

      const response = await fetch(`/api/places/details?placeId=${placeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.status === "OK") {
        const addressComponents = data.result.address_components;

        const countryComponent = addressComponents.find(
          (comp: AddressComponent) => comp.types.includes("country")
        );
        const localityComponent = addressComponents.find(
          (comp: AddressComponent) => comp.types.includes("locality")
        );
        const provinceComponent = addressComponents.find(
          (comp: AddressComponent) =>
            comp.types.includes("administrative_area_level_1")
        );

        const selectedAddress = {
          address: description,
          country: countryComponent?.long_name || null,
          city: localityComponent?.long_name || null,
          province: provinceComponent?.long_name || null,
        };

        setCountry(selectedAddress.country);
        setCity(selectedAddress.city);
        setProvince(selectedAddress.province);
        onAddressSelect(selectedAddress);
        setError(null);
      } else {
        setError(`Error in Details API: ${data.status}`);
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
      setError("Failed to fetch place details.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isUserTypingRef.current = true;
    setValue(e.target.value);
    setError(null);
    setIsDropdownOpen(true);
    // Resetear el flag después de un breve delay para permitir actualizaciones desde fuera
    setTimeout(() => {
      isUserTypingRef.current = false;
    }, 100);
  };

  const handleHouseNumberInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    isUserTypingRef.current = true;
    const newValue = e.target.value;
    setHouseNumber(newValue);
    onHouseNumberChange(newValue);
    // Resetear el flag después de un breve delay para permitir actualizaciones desde fuera
    setTimeout(() => {
      isUserTypingRef.current = false;
    }, 100);
  };

  return (
    <div>
      <Input
        label="Dirección de la Operación*"
        value={value}
        onChange={handleInputChange}
        placeholder="Por Ejemplo: Caldas 123"
        className="p-2 border rounded w-full"
        error={error || undefined}
        required
      />
      {isDropdownOpen && suggestions && suggestions.length > 0 && (
        <ul className="border rounded mt-1">
          {suggestions.map(
            (suggestion: { place_id: string; description: string }) => (
              <li
                key={suggestion.place_id}
                onClick={() =>
                  handleSelectSuggestion(
                    suggestion.description,
                    suggestion.place_id
                  )
                }
                className="p-2 hover:bg-gray-200 cursor-pointer"
              >
                {suggestion.description}
              </li>
            )
          )}
        </ul>
      )}
      <Input
        label="Número de Apto - Casa - Piso - Barrio - Más Info"
        value={houseNumber}
        onChange={handleHouseNumberInputChange}
        placeholder="Por Ejemplo: Piso 4 - Apto D - Balvanera - Etc."
        className="p-2 border rounded w-full"
      />
      {country && city && province && (
        <div className="-mt-2 mb-4">
          <p>
            <strong>Localidad:</strong> {city}
          </p>
          <p>
            <strong>Provincia:</strong> {province}
          </p>
          <p>
            <strong>Pais:</strong> {country}
          </p>
        </div>
      )}
    </div>
  );
}
