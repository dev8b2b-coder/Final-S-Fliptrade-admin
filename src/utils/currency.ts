/**
 * Formats a number as currency with proper negative sign placement
 * @param value - The number to format
 * @returns Formatted currency string (e.g., "$500" or "-$500")
 */
export function formatCurrency(value: number): string {
  return value < 0 
    ? `-$${Math.abs(value).toLocaleString()}` 
    : `$${value.toLocaleString()}`;
}
