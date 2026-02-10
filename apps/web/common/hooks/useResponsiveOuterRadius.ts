import { useState, useEffect } from "react";

const useResponsiveOuterRadius = () => {
  const [outerRadius, setOuterRadius] = useState(60);

  useEffect(() => {
    const updateOuterRadius = () => {
      if (window.innerWidth > 1600) {
        setOuterRadius(100);
      } else if (window.innerWidth >= 376 && window.innerWidth <= 1023) {
        setOuterRadius(100);
      } else if (window.innerWidth < 376) {
        setOuterRadius(75);
      } else {
        setOuterRadius(75);
      }
    };

    updateOuterRadius();
    window.addEventListener("resize", updateOuterRadius);

    return () => window.removeEventListener("resize", updateOuterRadius);
  }, []);

  return outerRadius;
};

export default useResponsiveOuterRadius;
