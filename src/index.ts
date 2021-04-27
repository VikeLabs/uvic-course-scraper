import * as cheerio from 'cheerio';
import got from 'got';

import { classScheduleListingUrl, detailedClassInformationUrl } from './common/urls';
import { classScheduleListingExtractor } from './pages/courseListingEntries';
import { detailedClassInfoExtractor } from './pages/detailedClassInformation';
import {
  DetailedClassInformation,
  KualiCourseCatalog,
  KualiCourseItem,
  COURSES_URL_W2021 as COURSES_URL,
  COURSE_DETAIL_URL,
  ClassScheduleListing,
  NestedType,
} from './types';
import { getCurrentTerm } from './utils';

export class UVicCourseScraper {
  /**
   * Parses the pre and co-reqs from the Kuali data into a usable format.
   *
   * @param preCoReqs HTML from the Kuali attribute
   * @returns parsed pre and co-reqs in JSON format
   */
  private static parsePreCoReqs(preCoReqs: string): Array<NestedType | string> {
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
          nestedReq.reqList = UVicCourseScraper.parsePreCoReqs(item.html()!);
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

  private static subjectCodeToPidMap: Map<string, string> = new Map();

  /**
   * Gets all courses from the Kuali catalog
   */
  public static async getAllCourses(): Promise<KualiCourseCatalog[]> {
    const courseCatalog = await got(COURSES_URL).json<KualiCourseCatalog[]>();
    return courseCatalog;
  }

  private static subjectCodeToPidMapper = (kuali: KualiCourseCatalog[]) => {
    kuali.forEach((v) => {
      UVicCourseScraper.subjectCodeToPidMap.set(v.__catalogCourseId, v.pid);
    });
    return UVicCourseScraper.subjectCodeToPidMap;
  };

  /**
   * Maps a subject and code to pid then gets course details from Kuali
   *
   * @param subject ie. 'CSC'
   * @param code ie. '111'
   */
  // TODO: support get course details by term
  public async getCourseDetails(subject: string, code: string): Promise<KualiCourseItem> {
    if (UVicCourseScraper.subjectCodeToPidMap.size == 0) {
      const courseCatalog = await UVicCourseScraper.getAllCourses();
      UVicCourseScraper.subjectCodeToPidMapper(courseCatalog);
    }

    const pid = UVicCourseScraper.subjectCodeToPidMap.get(subject.toUpperCase() + code) as string;
    const courseDetails = await UVicCourseScraper.getCourseDetailsByPid(pid);
    return courseDetails;
  }

  /**
   * Gets details of a single course from Kuali by pid
   *
   * @param pid ie. 'ByS23Pp7E'
   */
  public static async getCourseDetailsByPid(pid: string): Promise<KualiCourseItem> {
    // TODO: we probably don't want to return the Kuali data as-is.
    const courseDetails = await got(COURSE_DETAIL_URL + pid).json<KualiCourseItem>();
    // strip HTML tags from courseDetails.description
    courseDetails.description = courseDetails.description.replace(/(<([^>]+)>)/gi, '');

    // parse hoursCatalogText, pre and co reqs into object
    const hoursCatalogText = courseDetails.hoursCatalogText as string;
    const preAndCorequisites = courseDetails.preAndCorequisites as string;
    const preOrCorequisites = courseDetails.preOrCorequisites as string;
    if (hoursCatalogText) {
      const hours: string[] = hoursCatalogText.split('-');
      courseDetails.hoursCatalogText = hours ? { lecture: hours[0], lab: hours[1], tutorial: hours[2] } : undefined;
    }
    if (preAndCorequisites) {
      courseDetails.preAndCorequisites = UVicCourseScraper.parsePreCoReqs(preAndCorequisites);
    }
    if (preOrCorequisites) {
      courseDetails.preOrCorequisites = UVicCourseScraper.parsePreCoReqs(preOrCorequisites);
    }
    return courseDetails;
  }

  /**
   * Gets all sections for a course in a given term from BAN1P
   *
   * @param term i.e. '202009'
   * @param subject i.e. 'SENG', 'ECON'
   * @param code i.e. '180', '225'
   */
  public static async getCourseSections(
    term: string = getCurrentTerm(),
    subject: string,
    code: string
  ): Promise<ClassScheduleListing[]> {
    const res = await got(classScheduleListingUrl(term, subject.toUpperCase(), code));
    const $ = cheerio.load(res.body);
    return classScheduleListingExtractor($);
  }

  /**
   * Gets seats and waitList seats for a given course section from BAN1P
   *
   * @param term i.e. '202009', '202101'
   * @param crn ie. '12345', '20001'
   */
  public static async getSectionSeats(term: string, crn: string): Promise<DetailedClassInformation> {
    const res = await got(detailedClassInformationUrl(term, crn));
    const $ = cheerio.load(res.body);
    return detailedClassInfoExtractor($);
  }
}
