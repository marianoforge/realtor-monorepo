import { toZonedTime, format } from "date-fns-tz";

export const formatDateForUser = (
  utcDateString: string,
  userTimeZone: string
) => {
  const utcDate = new Date(utcDateString);

  if (isNaN(utcDate.getTime())) {
    console.error(`Invalid date string: ${utcDateString}`);
    throw new RangeError("Invalid time value");
  }

  const zonedDate = toZonedTime(utcDate, userTimeZone);
  return format(zonedDate, "dd/MM/yyyy HH:mm:ss");
};
