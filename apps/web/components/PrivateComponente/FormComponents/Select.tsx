import React, { useState, useEffect } from "react";
import { UseFormRegister, Path, FieldValues } from "react-hook-form";

interface SelectProps<T extends FieldValues> {
  label: string;
  options: { value: string; label: string }[];
  register: UseFormRegister<T>;
  name: Path<T>;
  required?: boolean;
  className?: string;
  mb?: string;
  error?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  defaultValue?: string;
  placeholder?: string;
}

const Select = <T extends FieldValues>({
  label,
  options,
  register,
  placeholder,
  name,
  required = false,
  className = "",
  mb = "-mb-2",
  error,
  onChange,
  defaultValue,
}: SelectProps<T>) => {
  const [hasValue, setHasValue] = useState(!!defaultValue);

  useEffect(() => {
    setHasValue(!!defaultValue);
  }, [defaultValue]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHasValue(!!e.target.value);
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className={mb}>
      <label className="font-semibold text-mediumBlue">{label}</label>
      <select
        {...register(name, {
          onChange: handleChange,
        })}
        className={`block w-full mt-2 mb-4 p-2 border border-gray-300 rounded ${
          hasValue ? "text-[#2D3748]" : "text-gray-400"
        } ${className}`}
        required={required}
        defaultValue={defaultValue}
      >
        <option value="" disabled className="text-gray-500">
          {placeholder || label}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Select;
