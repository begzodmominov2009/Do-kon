// Formats a 9-digit local phone number as (90) 123-45-67, used everywhere a
// user types an Uzbekistan phone number after a fixed +998 prefix.
export function formatPhoneDigits(digits: string): string {
  let result = "";
  if (digits.length > 0) result += `(${digits.slice(0, 2)}`;
  if (digits.length >= 2) result += ")";
  if (digits.length > 2) result += ` ${digits.slice(2, 5)}`;
  if (digits.length > 5) result += `-${digits.slice(5, 7)}`;
  if (digits.length > 7) result += `-${digits.slice(7, 9)}`;
  return result;
}
