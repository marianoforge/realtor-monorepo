import React from "react";

interface ModalSectionWrapperProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const ModalSectionWrapper: React.FC<ModalSectionWrapperProps> = ({
  title,
  children,
  className = "",
}) => {
  return (
    <div
      className={`bg-gray-50 p-6 rounded-lg border border-gray-200 ${className}`}
    >
      <h3 className="font-bold text-[#0077b6] text-lg border-b border-[#0077b6] pb-2 mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
};

export default ModalSectionWrapper;

export const InputSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
    <div className="h-10 bg-gray-200 rounded w-full"></div>
  </div>
);

export const FormSkeletonGrid: React.FC<{ count?: number }> = ({
  count = 12,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {Array(count)
      .fill(0)
      .map((_, index) => (
        <div
          key={`input-skeleton-${index}`}
          className="bg-gray-50 p-4 rounded-lg"
        >
          <InputSkeleton />
        </div>
      ))}
  </div>
);
