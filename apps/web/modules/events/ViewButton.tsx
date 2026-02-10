import { CalendarView } from "@gds-si/shared-utils";
import Button from "@/components/PrivateComponente/FormComponents/Button";

export const ViewButton = ({
  view,
  currentView,
  onClick,
}: {
  view: CalendarView;
  currentView: CalendarView;
  onClick: () => void;
}) => (
  <Button
    onClick={onClick}
    label={
      view === CalendarView.DAY
        ? "Día"
        : view === CalendarView.WEEK
          ? "Semana"
          : "Mes"
    }
    isActive={currentView === view}
    type="button"
  />
);
