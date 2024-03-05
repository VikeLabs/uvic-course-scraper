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

// https://uvic.kuali.co/api/v1/catalog/public/catalogs/
export function getCatalogIdForTerm(term: string): string {
  switch (term) {
    case '202009':
      return '5d9ccc4eab7506001ae4c225';
    case '202101':
      return '5f21b66d95f09c001ac436a0';
    case '202105':
      return '5ff357f8d30280001b0c26dd';
    case '202109':
      return '6092db6ebae543001bc23ca1';
    case '202201':
      return '61325cd1a7d5ec3519bf62a0';
    case '202205':
      return '61a51d59910ba59a0464f787';
    case '202209':
      return '620d23ca4bbc91fd3dbe3f64';
    case '202301':
      // TODO: remove when catalog is updated
      return '620d23ca4bbc91fd3dbe3f64';
    case '202305':
      return '63580b862ddbf3001d4805b5';
    case '202309':
      return '63f510ea5295ea001cb85899';
    case '202401':
      return '64b07a85168098001c8e8a42';
    case '202405':
      return '64b07a85168098001c8e8a42'; // TODO: change when catalog is updated
    default:
      return '';
  }
}
