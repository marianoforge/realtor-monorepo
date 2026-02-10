import { useCallback, useState } from "react";

import { CalendarAction, CalendarView } from "@gds-si/shared-utils";

export const useDateNavigation = () => {
  const [date, setDate] = useState(new Date());

  const adjustDate = (date: Date, days: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  };

  const navigateCalendar = useCallback(
    (action: CalendarAction, view: CalendarView) => {
      const daysToAdjust =
        view === CalendarView.DAY ? 1 : view === CalendarView.WEEK ? 7 : 30;
      switch (action) {
        case CalendarAction.PREV:
          setDate((prevDate) => adjustDate(prevDate, -daysToAdjust));
          break;
        case CalendarAction.NEXT:
          setDate((prevDate) => adjustDate(prevDate, daysToAdjust));
          break;
        case CalendarAction.TODAY:
          setDate(new Date());
          break;
      }
    },
    []
  );

  return { date, setDate, navigateCalendar };
};
