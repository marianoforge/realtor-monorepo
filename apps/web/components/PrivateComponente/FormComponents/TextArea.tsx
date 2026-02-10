import React from "react";

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  label?: string;
  error?: string;
  rows?: number;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, className, error, rows = 4, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="block mb-1 text-mediumBlue font-semibold">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={
            className || "w-full p-2 mb-4 border border-gray-300 rounded"
          }
          rows={rows}
          {...props}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";

export default TextArea;
