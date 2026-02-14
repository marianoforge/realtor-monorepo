export const safeDateToYYYYMMDD = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "";

  if (
    typeof value === "object" &&
    value !== null &&
    ("seconds" in value || "_seconds" in value)
  ) {
    const seconds =
      (value as Record<string, number>).seconds ??
      (value as Record<string, number>)._seconds;
    if (typeof seconds === "number") {
      return new Date(seconds * 1000).toISOString().split("T")[0];
    }
  }

  if (typeof value !== "string") return "";

  const trimmed = value.trim();
  if (trimmed === "") return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const ddmmyyyy = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (ddmmyyyy) {
    const day = ddmmyyyy[1].padStart(2, "0");
    const month = ddmmyyyy[2].padStart(2, "0");
    return `${ddmmyyyy[3]}-${month}-${day}`;
  }

  const iso = new Date(trimmed);
  if (!isNaN(iso.getTime())) {
    return iso.toISOString().split("T")[0];
  }

  return "";
};
