/**
 * Formats large numbers into compact notation (K, M, B, T)
 * @param number - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @param threshold - Minimum number to start compacting (default: 10000)
 * @returns Formatted compact number string
 */
export const formatCompactNumber = (
  number: number | string,
  decimals: number = 2,
  threshold: number = 10000
): string => {
  const num = typeof number === "string" ? parseFloat(number) : number;

  if (isNaN(num)) {
    return "0";
  }

  const isNegative = num < 0;
  const absNum = Math.abs(num);

  // If number is below threshold, use regular formatting
  if (absNum < threshold) {
    const parts = absNum.toFixed(2).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const formattedNumber = parts[1] === "00" ? parts[0] : parts.join(",");
    return isNegative ? `-${formattedNumber}` : formattedNumber;
  }

  const units = [
    { value: 1e12, symbol: "T" }, // Trillion
    { value: 1e9, symbol: "B" }, // Billion
    { value: 1e6, symbol: "M" }, // Million
    { value: 1e3, symbol: "K" }, // Thousand
  ];

  for (const unit of units) {
    if (absNum >= unit.value) {
      const compactValue = (absNum / unit.value).toFixed(decimals);
      // Remove trailing zeros and decimal point if not needed
      const cleanValue = parseFloat(compactValue).toString().replace(".", ",");
      return `${isNegative ? "-" : ""}${cleanValue}${unit.symbol}`;
    }
  }

  // Fallback (should not reach here due to threshold check)
  return absNum.toString();
};

/**
 * Formats a number and returns both compact and full versions
 * @param number - The number to format
 * @param currencySymbol - Currency symbol to prepend (optional)
 * @param threshold - Minimum number to start compacting (default: 100000)
 * @returns Object with compact and full formatted versions
 */
export const formatNumberWithTooltip = (
  number: number | string,
  currencySymbol: string = "",
  threshold: number = 100000
): { compact: string; full: string; shouldShowTooltip: boolean } => {
  const num = typeof number === "string" ? parseFloat(number) : number;

  if (isNaN(num)) {
    return {
      compact: `${currencySymbol}0`,
      full: `${currencySymbol}0`,
      shouldShowTooltip: false,
    };
  }

  const isNegative = num < 0;
  const absNum = Math.abs(num);

  // Format full number (always with regular formatting)
  const parts = absNum.toFixed(2).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const fullFormatted = parts[1] === "00" ? parts[0] : parts.join(",");
  const fullNumber = `${currencySymbol}${isNegative ? "-" : ""}${fullFormatted}`;

  // If number is below threshold, use regular formatting for both
  if (absNum < threshold) {
    return {
      compact: fullNumber,
      full: fullNumber,
      shouldShowTooltip: false,
    };
  }

  // Format compact number
  const compactFormatted = formatCompactNumber(num, 2, threshold);
  const compactNumber = `${currencySymbol}${compactFormatted}`;

  return {
    compact: compactNumber,
    full: fullNumber,
    shouldShowTooltip: true,
  };
};

/**
 * Smart formatter that chooses between compact and regular formatting
 * based on available space and number size
 */
export const formatSmartNumber = (
  number: number | string,
  maxLength: number = 12
): string => {
  const num = typeof number === "string" ? parseFloat(number) : number;

  if (isNaN(num)) {
    return "0";
  }

  // Try regular formatting first
  const regularFormat = formatRegularNumber(num);

  // If it fits within maxLength, use regular format
  if (regularFormat.length <= maxLength) {
    return regularFormat;
  }

  // Otherwise, use compact format
  return formatCompactNumber(num);
};

/**
 * Helper function for regular number formatting
 */
const formatRegularNumber = (num: number): string => {
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const parts = absNum.toFixed(2).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const formattedNumber = parts[1] === "00" ? parts[0] : parts.join(",");

  return isNegative ? `-${formattedNumber}` : formattedNumber;
};
