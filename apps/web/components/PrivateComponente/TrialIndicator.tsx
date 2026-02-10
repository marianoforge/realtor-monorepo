import { useTrialStatus } from "@/common/hooks/useTrialStatus";

const TrialIndicator: React.FC = () => {
  const {
    status,
    daysRemaining,
    hoursRemaining,
    isInGracePeriod,
    graceDaysRemaining,
  } = useTrialStatus();

  if (status === "loading" || status === "paid" || status === "no-trial") {
    return null;
  }

  const getStatusColor = () => {
    if (status === "expired") return "bg-red-500";
    if (daysRemaining <= 1) return "bg-red-500";
    if (daysRemaining <= 3) return "bg-orange-500";
    return "bg-blue-500";
  };

  const getStatusText = () => {
    if (status === "expired" && isInGracePeriod) {
      return graceDaysRemaining > 0
        ? `Trial expirado - ${graceDaysRemaining} días restantes`
        : "Trial expirado";
    }

    if (daysRemaining > 0) {
      if (daysRemaining === 1) {
        return hoursRemaining > 24
          ? `${daysRemaining} día restante`
          : `${hoursRemaining} horas restantes`;
      }
      return `${daysRemaining} días de trial`;
    }

    return "Trial expirado";
  };

  return (
    <div
      className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor()}`}
    >
      {getStatusText()}
    </div>
  );
};

export default TrialIndicator;
