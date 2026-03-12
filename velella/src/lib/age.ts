/**
 * Parses birth year from birthday string (MM/DD/YYYY).
 * Returns NaN if unparseable.
 */
export function birthYearFromBirthday(birthday: string): number {
  const parts = birthday.split("/");
  if (parts.length >= 3) {
    return parseInt(parts[2], 10);
  }
  return NaN;
}

/**
 * age = rowYear - birthYear (ignores month/day).
 */
export function ageInYear(birthday: string, rowYear: number): number {
  const birthYear = birthYearFromBirthday(birthday);
  if (Number.isNaN(birthYear)) return 0;
  return rowYear - birthYear;
}
