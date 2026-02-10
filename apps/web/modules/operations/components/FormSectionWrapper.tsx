import React from "react";

interface FormSectionWrapperProps {
  icon: React.ReactNode;
  title: string;
  sectionNumber?: number;
  children: React.ReactNode;
  className?: string;
}

const FormSectionWrapper: React.FC<FormSectionWrapperProps> = ({
  icon,
  title,
  sectionNumber,
  children,
  className = "",
}) => {
  return (
    <div
      className={`bg-gray-50 rounded-xl p-6 border border-gray-200 ${className}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 text-[#0077b6]">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-800">
          {sectionNumber ? `${sectionNumber}. ` : ""}
          {title}
        </h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
};

export default FormSectionWrapper;
