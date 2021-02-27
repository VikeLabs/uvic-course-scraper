import * as cheerio from 'cheerio';
import got from 'got';

import { classScheduleListingUrl, courseDetailUrl, coursesUrl, detailedClassInformationUrl } from './common/urls';
import { classScheduleListingExtractor } from './pages/courseListingEntries';
import { detailedClassInfoExtractor } from './pages/detailedClassInformation';
import { DetailedClassInformation, KualiCourseCatalog, KualiCourseItem, ClassScheduleListing } from './types';
import { getCatalogForTerm, getCurrentTerm } from './utils';

export * from './types';

export class UVicCourseScraper {
  private static subjectCodeToPidMap: Map<string, string> = new Map();

  /**
   * Gets all courses from the Kuali catalog. Automatically uses the current term if not defined.
   * @param term i.e. '202009', '202101'
   */
  public static async getCourses(term = getCurrentTerm()): Promise<KualiCourseCatalog[]> {
    return await got(coursesUrl(getCatalogForTerm(term))).json<KualiCourseCatalog[]>();
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
  public async getCourseDetails(term = getCurrentTerm(), subject: string, code: string): Promise<KualiCourseItem> {
    if (UVicCourseScraper.subjectCodeToPidMap.size === 0) {
      const courseCatalog = await UVicCourseScraper.getCourses(term);
      UVicCourseScraper.subjectCodeToPidMapper(term, courseCatalog);
    }

    const pid = UVicCourseScraper.subjectCodeToPidMap.get(`${term}${subject.toUpperCase()}${code}`) as string;
    return await UVicCourseScraper.getCourseDetailsByPid(term, pid);
  }

  /**
   * Gets details of a single course from Kuali by pid
   *
   * @param term i.e. '202009', '202101'
   * @param pid ie. 'ByS23Pp7E'
   */
  public static async getCourseDetailsByPid(term = getCurrentTerm(), pid: string): Promise<KualiCourseItem> {
    // TODO: we probably don't want to return the Kuali data as-is.
    const courseDetails = await got(courseDetailUrl(getCatalogForTerm(term), pid)).json<KualiCourseItem>();
    // strip HTML tags from courseDetails.description
    courseDetails.description = courseDetails.description.replace(/(<([^>]+)>)/gi, '');
    // parse hoursCatalogText into object
    const hoursCatalogText = courseDetails.hoursCatalogText as string;
    if (hoursCatalogText) {
      const hours: string[] = hoursCatalogText.split('-');
      courseDetails.hoursCatalogText = hours ? { lecture: hours[0], lab: hours[1], tutorial: hours[2] } : undefined;
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
    return classScheduleListingExtractor(cheerio.load(res.body));
  }

  /**
   * Gets seats and waitList seats for a given course section from BAN1P
   *
   * @param term i.e. '202009', '202101'
   * @param crn ie. '12345', '20001'
   */
  public static async getSectionSeats(term: string, crn: string): Promise<DetailedClassInformation> {
    const res = await got(detailedClassInformationUrl(term, crn));
    return detailedClassInfoExtractor(cheerio.load(res.body));
  }
}
