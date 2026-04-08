/** Parse `MM/DD/YYYY` household birthday string. */
export function parseHouseholdBirthday(s: string): Date | null {
  const m = s.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) {
    return null;
  }
  const month = parseInt(m[1], 10) - 1;
  const day = parseInt(m[2], 10);
  const year = parseInt(m[3], 10);
  const d = new Date(year, month, day);
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month ||
    d.getDate() !== day
  ) {
    return null;
  }
  return d;
}

function ageOnCalendarDate(birth: Date, ref: Date): number {
  let age = ref.getFullYear() - birth.getFullYear();
  const md = ref.getMonth() - birth.getMonth();
  if (md < 0 || (md === 0 && ref.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

/** Age on Jan 1 of `calendarYear`. */
export function ageAtYearStart(birth: Date, calendarYear: number): number {
  return ageOnCalendarDate(birth, new Date(calendarYear, 0, 1));
}

/** Age on Dec 31 of `calendarYear`. */
export function ageAtYearEnd(birth: Date, calendarYear: number): number {
  return ageOnCalendarDate(birth, new Date(calendarYear, 11, 31));
}
