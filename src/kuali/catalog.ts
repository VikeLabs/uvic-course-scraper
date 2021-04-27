import * as cheerio from 'cheerio';

import { KualiCourseItem, KualiCourseItemParsed, NestedType } from '../types';

/**
 * Parses the pre and co-reqs from the Kuali data into a usable format.
 *
 * @param preCoReqs HTML from the Kuali attribute
 * @returns parsed pre and co-reqs in JSON format
 */
function parsePreCoReqs(preCoReqs: string): Array<NestedType | string> {
  const reqs: Array<NestedType | string> = [];

  const quantityRegex = /(Complete|(?<coreq>Completed or concurrently enrolled in)) *(?<quantity>all|\d)* (of|(?<units>units from))/;
  const earnMinimumRegex = /Earn(ed)? a minimum (?<unit>grade|GPA) of (?<min>[^ ]+) (in (?<quantity>\d+))?/;

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
}

export function KualiCourseItemParser(course: KualiCourseItem): KualiCourseItemParsed {
  // strip HTML tags from courseDetails.description
  course.description = course.description.replace(/(<([^>]+)>)/gi, '');

  const hoursCatalogText = course.hoursCatalogText;
  const hours = hoursCatalogText?.split('-');
  const preAndCorequisitesText = course.preAndCorequisites;
  const preOrCorequisitesText = course.preOrCorequisites;

  return {
    ...course,
    hoursCatalog: hours ? { lecture: hours[0], lab: hours[1], tutorial: hours[2] } : undefined,
    preAndCorequisites: preAndCorequisitesText ? parsePreCoReqs(preAndCorequisitesText) : undefined,
    preOrCorequisites: preOrCorequisitesText ? parsePreCoReqs(preOrCorequisitesText) : undefined,
  };
}
