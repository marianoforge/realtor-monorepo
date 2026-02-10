import React from "react";

interface ButtonProps {
  type: "button" | "submit" | "reset";
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
  label?: string;
  isActive?: boolean;
  id?: string;
  dataTestId?: string;
}

const Button: React.FC<ButtonProps> = ({
  type,
  className,
  onClick,
  children,
  label,
  id,
  dataTestId,
  disabled,
}) => {
  return (
    <button
      type={type}
      className={`bg-blue-500 text-white p-2 rounded hover:bg-blue-600 !cursor-pointer ${className} `}
      onClick={onClick}
      id={id}
      data-testid={dataTestId}
      disabled={disabled}
    >
      {label}
      {children}
    </button>
  );
};

export default Button;
