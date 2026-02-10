import React, { useEffect, useRef, useState } from "react";

import { formatCompactNumber, formatSmartNumber } from "@gds-si/shared-utils";

interface ResponsiveNumberProps {
  value: number | string;
  prefix?: string;
  suffix?: string;
  className?: string;
  maxLength?: number;
  forceCompact?: boolean;
  compactThreshold?: number;
}

const ResponsiveNumber: React.FC<ResponsiveNumberProps> = ({
  value,
  prefix = "",
  suffix = "",
  className = "",
  maxLength = 12,
  forceCompact = false,
  compactThreshold = 10000,
}) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState("100%");
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    const num = typeof value === "string" ? parseFloat(value) : value;

    if (isNaN(num)) {
      setDisplayValue("0");
      return;
    }

    let formattedValue: string;

    if (forceCompact || Math.abs(num) >= compactThreshold) {
      formattedValue = formatCompactNumber(num, 2, compactThreshold);
    } else {
      formattedValue = formatSmartNumber(num, maxLength);
    }

    setDisplayValue(formattedValue);
  }, [value, maxLength, forceCompact, compactThreshold]);

  useEffect(() => {
    const adjustFontSize = () => {
      if (!textRef.current || !containerRef.current) return;

      const container = containerRef.current;
      const text = textRef.current;

      // Reset font size to measure natural size
      text.style.fontSize = "100%";

      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      const textWidth = text.scrollWidth;
      const textHeight = text.scrollHeight;

      // Calculate scale factors
      const scaleX = containerWidth / textWidth;
      const scaleY = containerHeight / textHeight;
      const scale = Math.min(scaleX, scaleY, 1); // Never scale up

      // Apply scale with some padding margin (90% of calculated scale)
      const finalScale = Math.max(scale * 0.9, 0.5); // Minimum 50% size
      setFontSize(`${finalScale * 100}%`);
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(adjustFontSize, 10);

    // Also adjust on window resize
    window.addEventListener("resize", adjustFontSize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", adjustFontSize);
    };
  }, [displayValue]);

  return (
    <div
      ref={containerRef}
      className={`flex items-center justify-center h-full w-full overflow-hidden ${className}`}
    >
      <span
        ref={textRef}
        style={{ fontSize }}
        className="font-bold whitespace-nowrap transition-all duration-200 ease-in-out"
        title={`${prefix}${typeof value === "number" ? value.toLocaleString("es-AR") : value}${suffix}`}
      >
        {prefix}
        {displayValue}
        {suffix}
      </span>
    </div>
  );
};

export default ResponsiveNumber;
