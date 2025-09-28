/**
 * Utility functions for INR currency formatting
 */

/**
 * Formats a number as INR currency in simplified format
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "₹1,00,000")
 */
export function formatINR(amount: number): string {
  // Handle negative amounts
  if (amount < 0) {
    return `-₹${Math.abs(amount).toLocaleString('en-IN')}`;
  }

  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Formats a number as INR currency with decimal places when needed
 * @param amount - The amount to format
 * @param showDecimals - Whether to show decimal places (default: true for non-whole numbers)
 * @returns Formatted currency string
 */
export function formatINRWithDecimals(amount: number, showDecimals?: boolean): string {
  const hasDecimals = amount % 1 !== 0;
  const shouldShowDecimals = showDecimals ?? hasDecimals;

  if (amount < 0) {
    const absAmount = Math.abs(amount);
    return `-₹${absAmount.toLocaleString('en-IN', {
      minimumFractionDigits: shouldShowDecimals ? 2 : 0,
      maximumFractionDigits: 2
    })}`;
  }

  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: shouldShowDecimals ? 2 : 0,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Parses an INR formatted string back to a number
 * @param inrString - The INR formatted string
 * @returns The parsed number
 */
export function parseINR(inrString: string): number {
  // Remove INR symbol, commas, and spaces
  const cleanString = inrString.replace(/[₹,\s]/g, '');

  // Handle negative values
  if (cleanString.startsWith('-')) {
    return -parseFloat(cleanString.substring(1)) || 0;
  }

  return parseFloat(cleanString) || 0;
}