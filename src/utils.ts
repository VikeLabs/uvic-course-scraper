import * as cheerio from 'cheerio';
import dayjs from 'dayjs';

import { NestedType } from './types';

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

const quantityRegex = /(Complete|(?<coreq>Completed or concurrently enrolled in)) *(?<quantity>all|\d)* (of|(?<units>units from))/;
const earnMinimumRegex = /Earn(ed)? a minimum (?<unit>grade|GPA) of (?<min>[^ ]+) (in (?<quantity>\d+))?/;

export const parsePreCoReqs = (preCoReqs: string): Array<NestedType | string> => {
  const reqs: Array<NestedType | string> = [];

  const $ = cheerio.load(preCoReqs);

  // Iterate through each unordered list in the HTML
  $('ul')
    .first()
    .children('li,div')

    .each((_i, el) => {
      const item = $(el);

      const quantityMatch = quantityRegex.exec(item.text());
      const earnMinMatch = earnMinimumRegex.exec(item.text());

      // If the current target has nested information
      if (item.find('ul').length) {
        const nestedReq: NestedType = {};

        // If the nested requisites require a certain quantity
        // i.e. "Complete X of the following:"
        if (quantityRegex.test(item.text()) && quantityMatch?.groups) {
          nestedReq.quantity = quantityMatch.groups.quantity;
          if (quantityMatch.groups.coreq) {
            nestedReq.coreq = true;
          }
          if (quantityMatch.groups.units) {
            nestedReq.units = true;
          }
        }
        // Else if the nested requisites require a minimum
        // i.e. "Earned a minimum GPA of X in Y"
        else if (earnMinimumRegex.test(item.text()) && earnMinMatch?.groups) {
          if (earnMinMatch.groups.quantity) {
            nestedReq.quantity = earnMinMatch.groups.quantity;
          } else {
            nestedReq.quantity = 'all';
          }
          // add grade or gpa values to nestedReq object
          nestedReq[earnMinMatch.groups.unit.toLowerCase() as 'grade' | 'gpa'];
        } else {
          nestedReq.unparsed = item.text();
        }
        nestedReq.reqList = parsePreCoReqs(item.html()!);
        reqs.push(nestedReq);
      } else {
        if (item.find('a').length) {
          reqs.push(item.find('a').text());
        } else {
          reqs.push(item.text());
        }
      }
    });

  return reqs;
};
