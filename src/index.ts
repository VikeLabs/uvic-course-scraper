import * as cheerio from 'cheerio';
import got from 'got';

import {
  classScheduleListingUrl,
  courseDetailUrl,
  coursesUrl,
  detailedClassInformationUrl,
  subjectsUrl,
} from './common/urls';
import { KualiCourseItemParser } from './kuali/catalog';
import { classScheduleListingExtractor } from './pages/courseListingEntries';
import { detailedClassInfoExtractor } from './pages/detailedClassInformation';
import {
  KualiCourseCatalog,
  KualiCourseItem,
  DetailedClassInformation,
  ClassScheduleListing,
  KualiSubject,
  Response,
  KualiCourseItemParsed,
} from './types';
import { getCatalogIdForTerm, getCurrentTerm } from './utils';

export * from './types';

export class UVicCourseScraper {
  private static subjectCodeToPidMap: Map<string, string> = new Map();

  /**
   * Gets all courses from the Kuali catalog. Automatically uses the current term if not defined.
   * @param term i.e. '202009', '202101'
   */

  public static async getCourses(term = getCurrentTerm()): Promise<Response<KualiCourseCatalog[]>> {
    const url = coursesUrl(getCatalogIdForTerm(term));
    const courseCatalog = await got(url).json<KualiCourseCatalog[]>();
    return { response: courseCatalog, timestamp: new Date(), url };
  }

  private static subjectCodeToPidMapper = (term: string, kuali: KualiCourseCatalog[]) => {
    kuali.forEach((v) => {
      UVicCourseScraper.subjectCodeToPidMap.set(`${term}${v.__catalogCourseId}`, v.pid);
    });
    return UVicCourseScraper.subjectCodeToPidMap;
  };

  /**
   * Maps a subject and code to pid then gets course details from Kuali
   *
   * @param term i.e. '202009', '202101'
   * @param subject ie. 'CSC'
   * @param code ie. '111'
   */

  public async getCourseDetails(
    term = getCurrentTerm(),
    subject: string,
    code: string
  ): Promise<Response<KualiCourseItemParsed> | void> {
    if (UVicCourseScraper.subjectCodeToPidMap.size === 0) {
      const { response: courseCatalog } = await UVicCourseScraper.getCourses(term);
      UVicCourseScraper.subjectCodeToPidMapper(term, courseCatalog);
    }

    const pid = UVicCourseScraper.subjectCodeToPidMap.get(`${term}${subject.toUpperCase()}${code}`);

    if (pid === undefined) {
      return;
    }

    const { response, url } = await UVicCourseScraper.getCourseDetailsByPid(term, pid);
    return { response, timestamp: new Date(), url };
  }

  /**
   * Gets details of a single course from Kuali by pid
   *
   * @param term i.e. '202009', '202101'
   * @param pid ie. 'ByS23Pp7E'
   */

  public static async getCourseDetailsByPid(
    term = getCurrentTerm(),
    pid: string
  ): Promise<Response<KualiCourseItemParsed>> {
    const url = courseDetailUrl(getCatalogIdForTerm(term), pid);
    const courseDetails = await got(url).json<KualiCourseItem>();
    return { response: KualiCourseItemParser(courseDetails), timestamp: new Date(), url };
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
  ): Promise<Response<ClassScheduleListing[]>> {
    const url = classScheduleListingUrl(term, subject.toUpperCase(), code);
    const res = await got(url);
    return {
      response: await classScheduleListingExtractor(cheerio.load(res.body)),
      timestamp: new Date(),
      url,
    };
  }

  /**
   * Gets seats and waitList seats for a given course section from BAN1P
   *
   * @param term i.e. '202009', '202101'
   * @param crn ie. '12345', '20001'
   */

  public static async getSectionSeats(term: string, crn: string): Promise<Response<DetailedClassInformation>> {
    const url = detailedClassInformationUrl(term, crn);
    const res = await got(url);
    return { response: detailedClassInfoExtractor(cheerio.load(res.body)), timestamp: new Date(), url };
  }

  /**
   * Gets all subjects from the BAN1P. Automatically uses the current term if not defined.
   * @param term i.e. '202009', '202101'
   */
  public static async getSubjects(term = getCurrentTerm()): Promise<KualiSubject[]> {
    return await got(subjectsUrl(getCatalogIdForTerm(term))).json<KualiSubject[]>();
  }
}
