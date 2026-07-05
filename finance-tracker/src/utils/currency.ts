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
 * Converts a number to words using the Indian numbering system
 * (crore / lakh / thousand). e.g. 600000 -> "Six Lakh",
 * 13100000 -> "One Crore Thirty One Lakh"
 * @param amount - The amount to convert (sign and paise are ignored)
 * @returns The amount written in words
 */
export function numberToIndianWords(amount: number): string {
  let num = Math.round(Math.abs(amount));
  if (num === 0) return 'Zero';

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const twoDigit = (n: number): string =>
    n < 20 ? ones[n] : `${tens[Math.floor(n / 10)]}${n % 10 ? ' ' + ones[n % 10] : ''}`;

  const threeDigit = (n: number): string => {
    const h = Math.floor(n / 100);
    const r = n % 100;
    return `${h ? ones[h] + ' Hundred' : ''}${h && r ? ' ' : ''}${r ? twoDigit(r) : ''}`;
  };

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  const rest = num % 1000;

  const parts: string[] = [];
  if (crore) parts.push(`${threeDigit(crore)} Crore`);
  if (lakh) parts.push(`${twoDigit(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigit(thousand)} Thousand`);
  if (rest) parts.push(threeDigit(rest));

  return parts.join(' ');
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