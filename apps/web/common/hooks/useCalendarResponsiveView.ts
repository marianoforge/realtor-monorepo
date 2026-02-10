import { useEffect, useState } from "react";

import { CalendarView } from "@gds-si/shared-utils";

export const useCalendarResponsiveView = () => {
  const [view, setView] = useState<CalendarView>(CalendarView.MONTH);

  useEffect(() => {
    const updateView = () => {
      if (window.innerWidth < 640) {
        setView(CalendarView.DAY);
      } else if (window.innerWidth < 768) {
        setView(CalendarView.WEEK);
      } else {
        setView(CalendarView.MONTH);
      }
    };

    updateView();
    window.addEventListener("resize", updateView);

    return () => window.removeEventListener("resize", updateView);
  }, []);

  return { view, setView };
};
