import * as cheerio from 'cheerio';
import got from 'got';

import {
  classScheduleListingUrl,
  courseDetailUrl,
  coursesUrl,
  detailedClassInformationUrl,
  subjectsUrl,
} from './common/urls';
import { classScheduleListingExtractor } from './pages/courseListingEntries';
import { detailedClassInfoExtractor } from './pages/detailedClassInformation';
import {
  KualiCourseCatalog,
  KualiCourseItem,
  KualiCourseCatalogRes,
  KualiCourseItemRes,
  ClassScheduleListingRes,
  DetailedClassInformationRes,
  KualiSubject,
} from './types';
import { getCatalogIdForTerm, getCurrentTerm } from './utils';

export * from './types';

export class UVicCourseScraper {
  private static subjectCodeToPidMap: Map<string, string> = new Map();

  /**
   * Gets all courses from the Kuali catalog. Automatically uses the current term if not defined.
   * @param term i.e. '202009', '202101'
   */

  public static async getCourses(term = getCurrentTerm()): Promise<KualiCourseCatalogRes> {
    const url = coursesUrl(getCatalogIdForTerm(term));
    const courseCatalog = await got(url).json<KualiCourseCatalog[]>();
    return { data: courseCatalog, timestamp: new Date().toISOString(), url };
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

  public async getCourseDetails(term = getCurrentTerm(), subject: string, code: string): Promise<KualiCourseItemRes> {
    if (UVicCourseScraper.subjectCodeToPidMap.size === 0) {
      const { data: courseCatalog } = await UVicCourseScraper.getCourses(term);
      UVicCourseScraper.subjectCodeToPidMapper(term, courseCatalog);
    }

    const pid = UVicCourseScraper.subjectCodeToPidMap.get(`${term}${subject.toUpperCase()}${code}`) as string;
    const { data, url } = await UVicCourseScraper.getCourseDetailsByPid(term, pid);
    return { data, timestamp: new Date().toISOString(), url };
  }

  /**
   * Gets details of a single course from Kuali by pid
   *
   * @param term i.e. '202009', '202101'
   * @param pid ie. 'ByS23Pp7E'
   */

  public static async getCourseDetailsByPid(term = getCurrentTerm(), pid: string): Promise<KualiCourseItemRes> {
    // TODO: we probably don't want to return the Kuali data as-is.
    const url = courseDetailUrl(getCatalogIdForTerm(term), pid);
    const courseDetails = await got(url).json<KualiCourseItem>();
    // strip HTML tags from courseDetails.description
    courseDetails.description = courseDetails.description.replace(/(<([^>]+)>)/gi, '');
    // parse hoursCatalogText into object
    const hoursCatalogText = courseDetails.hoursCatalogText as string;
    if (hoursCatalogText) {
      const hours: string[] = hoursCatalogText.split('-');
      courseDetails.hoursCatalogText = hours ? { lecture: hours[0], lab: hours[1], tutorial: hours[2] } : undefined;
    }
    return { data: courseDetails, timestamp: new Date().toISOString(), url };
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
  ): Promise<ClassScheduleListingRes> {
    const url = classScheduleListingUrl(term, subject.toUpperCase(), code);
    const res = await got(url);
    return {
      data: await classScheduleListingExtractor(cheerio.load(res.body)),
      timestamp: new Date().toISOString(),
      url,
    };
  }

  /**
   * Gets seats and waitList seats for a given course section from BAN1P
   *
   * @param term i.e. '202009', '202101'
   * @param crn ie. '12345', '20001'
   */

  public static async getSectionSeats(term: string, crn: string): Promise<DetailedClassInformationRes> {
    const url = detailedClassInformationUrl(term, crn);
    const res = await got(url);
    return { data: await detailedClassInfoExtractor(cheerio.load(res.body)), timestamp: new Date().toISOString(), url };
  }

  /**
   * Gets all subjects from the BAN1P. Automatically uses the current term if not defined.
   * @param term i.e. '202009', '202101'
   */
  public static async getSubjects(term = getCurrentTerm()): Promise<KualiSubject[]> {
    return await got(subjectsUrl(getCatalogIdForTerm(term))).json<KualiSubject[]>();
  }
}
