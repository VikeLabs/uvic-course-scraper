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

const quantityRegex = /(Complete|(?<coreq>Completed or concurrently enrolled in)) *(?<quantity>all|\d)* (of|(?<units>units from))/;
const earnMinimumRegex = /Earn(ed)? a minimum (?<unit>grade|GPA) of (?<min>[^ ]+) (in (?<quantity>\d+))?/;

const parsePreCoReqs = (courseDetails: string): Array<NestedType | string> => {
  const reqs: Array<NestedType | string> = [];

  const $ = cheerio.load(courseDetails);
  console.log(courseDetails);
  $('ul')
    .find('li')
    .each((i, el) => {
      const item = $(el);
      const quantityMatch = quantityRegex.exec(item.text());
      const earnMinMatch = earnMinimumRegex.exec(item.text());
      if (item.find('ul').length) {
        // console.log('has ul');
        const nestedReq: NestedType = {};
        if (quantityRegex.test(item.text()) && quantityMatch?.groups) {
          // console.log(quantityMatch?.groups!.quantity);
          nestedReq.quantity = quantityMatch.groups.quantity;
          if (quantityMatch.groups.coreq) {
            nestedReq.coreq = true;
          }
          if (quantityMatch.groups.units) {
            nestedReq.units = true;
          }
        } else if (earnMinimumRegex.test(item.text()) && earnMinMatch?.groups) {
          if (earnMinMatch.groups.quantity) {
            nestedReq.quantity = earnMinMatch.groups.quantity;
          } else {
            nestedReq.quantity = 'all';
          }
          // this is so cheese lol could easily be if statements but waddup
          nestedReq[earnMinMatch.groups.unit.toLowerCase() as 'grade' | 'gpa'];
        } else {
          nestedReq.unparsed = item.text();
        }
        nestedReq.reqList = parsePreCoReqs(item.find('ul').html()!);
        reqs.push(nestedReq);
      } else {
        if (item.find('a').length) {
          reqs.push(item.find('a').text());
        } else {
          reqs.push(item.text());
        }
      }
    });
  // console.log(reqs);
  return reqs;
};

export class UVicCourseScraper {
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
    // parse hoursCatalogText into object
    const hoursCatalogText = courseDetails.hoursCatalogText as string;
    if (hoursCatalogText) {
      const hours: string[] = hoursCatalogText.split('-');
      courseDetails.hoursCatalogText = hours ? { lecture: hours[0], lab: hours[1], tutorial: hours[2] } : undefined;
    }
    if (courseDetails.preAndCorequisites)
      courseDetails.preAndCorequisites = parsePreCoReqs(courseDetails.preAndCorequisites as string);
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

const main = async () => {
  const client = new UVicCourseScraper();
  const yo = await client.getCourseDetails('CHEM', '101');
  console.log(yo.preAndCorequisites);
};

main();
