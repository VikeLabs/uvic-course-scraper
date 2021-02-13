import dayjs from 'dayjs';

enum term {
  '01',
  '05',
  '09',
}

function monthToTerm(month: number): term {
  if (month < 1 || month > 12) {
    throw new Error(`${month} is Not a valid month`);
  }

  if (1 <= month && month < 5) {
    return term['01'];
  } else if (5 <= month && month < 9) {
    return term['05'];
  } else {
    return term['09'];
  }
}

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

function getTermString(currentYear: number, currentTerm: term, delta: number): string {
  const termNumber = currentTerm.valueOf() + delta;

  currentYear += Math.floor(termNumber / 3);
  currentTerm = mod(termNumber, 3);

  return currentYear.toString() + term[currentTerm].toString();
}

export function getCurrentTerms(plusMinus: number): string[] {
  const currentTime = new Date();

  const currentYear = currentTime.getFullYear();
  const currentMonth = currentTime.getMonth() + 1;
  const currentTerm = monthToTerm(currentMonth);

  const terms: string[] = [];
  for (let delta = 1; delta <= plusMinus; delta++) {
    terms.push(getTermString(currentYear, currentTerm, delta));
    terms.push(getTermString(currentYear, currentTerm, -1 * delta));
  }

  terms.push(getTermString(currentYear, currentTerm, 0));

  return terms.sort();
}

export function getCurrentTerm(date: dayjs.Dayjs = dayjs()): string {
  const year = date.year().toString();
  const currMonth = date.month();
  let month = '';

  if (0 <= currMonth && currMonth < 4) {
    month = '01';
  } else if (4 <= currMonth && currMonth < 10) {
    month = '05';
  } else {
    month = '09';
  }

  return year + month;
}

export function isKeyof<T extends Record<string, unknown>>(obj: T, possibleKey: keyof any): possibleKey is keyof T {
  return possibleKey in obj;
}
