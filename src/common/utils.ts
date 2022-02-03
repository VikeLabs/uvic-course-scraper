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

const mod = (n: number, m: number) => ((n % m) + m) % m;

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

export function getCatalogIdByTerm(term: string, level: 'undergraduate' | 'graduate'): string | null {
  switch (level) {
    case 'undergraduate':
      return getUndergradCatalogIdByTerm(term);
    case 'graduate':
      return getGradCatalogIdByTerm(term);
    default:
      return null;
  }
}

function getUndergradCatalogIdByTerm(term: string): string | null {
  switch (term) {
    case '202005':
      return '5d9ccc4eab7506001ae4c225';
    case '202009':
      return '5eb09dad7a30f7001af74eb1';
    case '202101':
      return '5f21b66d95f09c001ac436a0';
    case '202105':
      return '5ff357f8d30280001b0c26dd';
    case '202109':
      return '6092db6ebae543001bc23ca1';
    case '202201':
      return '61325cd1a7d5ec3519bf62a0';
    default:
      return null;
  }
}

function getGradCatalogIdByTerm(term: string): string | null {
  switch (term) {
    case '202005':
      return '5db9a19063f365001a66a451';
    case '202009':
      return '5eb09c845f06e0001a5ad4ea';
    case '202101':
      return '5f21b607847fd9001a54a406';
    case '202105':
      return '5ff377d15e3876001b6dbd0d';
    case '202109':
      return '6092db40bae543001bc23ca0';
    case '202201':
      return '61325d5b705e91473edf95ea';
    default:
      return null;
  }
}

/**
 *
 * @param term
 * @returns
 * @deprecated use getCatalogIdByTerm instead
 */
export function getCatalogIdForTerm(term: string): string {
  return getUndergradCatalogIdByTerm(term) ?? '';
}
