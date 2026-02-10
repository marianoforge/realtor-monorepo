export const formatNumber = (
  number: number | string,
  isPercentage?: boolean
) => {
  const num = typeof number === "string" ? parseFloat(number) : number;
  if (isNaN(num)) {
    return null;
  }

  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const parts = absNum.toFixed(2).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const formattedNumber = parts[1] === "00" ? parts[0] : parts.join(",");

  if (isPercentage) {
    return `${isNegative ? "-" : ""}${formattedNumber}%`;
  }

  return isNegative ? `-${formattedNumber}` : formattedNumber;
};

/**
 * Format number for operations tables - never shows negative values
 * Always displays the absolute value of the number
 */
export const formatOperationsNumber = (
  number: number | string,
  isPercentage?: boolean
) => {
  const num = typeof number === "string" ? parseFloat(number) : number;
  if (isNaN(num)) {
    return null;
  }

  // Always use the absolute value for operations
  const absNum = Math.abs(num);

  const parts = absNum.toFixed(2).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const formattedNumber = parts[1] === "00" ? parts[0] : parts.join(",");

  return isPercentage ? `${formattedNumber}%` : formattedNumber;
};
