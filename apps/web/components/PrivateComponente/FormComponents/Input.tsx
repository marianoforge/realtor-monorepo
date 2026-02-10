import React from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "react-tooltip";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  marginBottom?: string;
  marginTop?: string;
  label?: string;
  error?: string;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
  isPasswordVisible?: boolean;
  width?: string;
  labelSize?: string;
  showTooltip?: boolean;
  tooltipContent?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      marginBottom = "mb-6",
      marginTop = "mt-1",
      label,
      error,
      showPasswordToggle,
      onTogglePassword,
      isPasswordVisible,
      labelSize = "text-base",
      showTooltip = false,
      tooltipContent = "",
      ...props
    },
    ref
  ) => {
    return (
      <div className={`${marginBottom} ${marginTop}`}>
        {label && (
          <div className="flex items-center">
            <label className={`font-semibold text-mediumBlue ${labelSize}`}>
              {label}
            </label>
            {showTooltip && (
              <>
                <InformationCircleIcon
                  className="inline-block ml-1 text-lightBlue h-4 w-4 cursor-pointer"
                  data-tooltip-id={`tooltip-${label}`}
                  data-tooltip-content={tooltipContent}
                />
                <Tooltip id={`tooltip-${label}`} place="top" />
              </>
            )}
          </div>
        )}
        <div className="relative mt-2">
          <input
            ref={ref}
            className={`w-full p-2 border border-gray-300 rounded ${className}`}
            {...props}
            type={showPasswordToggle && isPasswordVisible ? "text" : props.type}
          />
          {showPasswordToggle && (
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-2 top-3"
            >
              {isPasswordVisible ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          )}
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
