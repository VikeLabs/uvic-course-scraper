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
} from './types';
import { getCurrentTerm } from './utils';

export class UVicCourseScraper {
  private static subjectCodeToPidMap: Map<string, string> = new Map();

  /**
   * Gets all courses from the Kuali catalog
   */
  public static async getAllCourses(): Promise<{ data: KualiCourseCatalog[]; timestamp: string; URL: string }> {
    const URL = COURSES_URL;
    const courseCatalog = await got(URL).json<KualiCourseCatalog[]>();
    const tmp_Date = new Date();
    const timestamp = tmp_Date.toISOString();
    return { data: courseCatalog, timestamp: timestamp, URL: URL };
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
  public async getCourseDetails(
    subject: string,
    code: string
  ): Promise<{ data: KualiCourseItem; timestamp: string; URL: string }> {
    if (UVicCourseScraper.subjectCodeToPidMap.size == 0) {
      const parsedData = await UVicCourseScraper.getAllCourses();
      const courseCatalog = parsedData.data;
      UVicCourseScraper.subjectCodeToPidMapper(courseCatalog);
    }
    const tmp_Date = new Date();
    const timestamp = tmp_Date.toISOString();
    const pid = UVicCourseScraper.subjectCodeToPidMap.get(subject.toUpperCase() + code) as string;
    const parsedData = await UVicCourseScraper.getCourseDetailsByPid(pid);
    const courseDetails = parsedData.data;
    return { data: courseDetails, timestamp: timestamp, URL: parsedData.URL };
  }

  /**
   * Gets details of a single course from Kuali by pid
   *
   * @param pid ie. 'ByS23Pp7E'
   */
  public static async getCourseDetailsByPid(
    pid: string
  ): Promise<{ data: KualiCourseItem; timestamp: string; URL: string }> {
    // TODO: we probably don't want to return the Kuali data as-is.
    const URL = COURSE_DETAIL_URL + pid;
    const tmp_Date = new Date();
    const timestamp = tmp_Date.toISOString();
    const courseDetails = await got(URL).json<KualiCourseItem>();
    // strip HTML tags from courseDetails.description
    courseDetails.description = courseDetails.description.replace(/(<([^>]+)>)/gi, '');
    // parse hoursCatalogText into object
    const hoursCatalogText = courseDetails.hoursCatalogText as string;
    if (hoursCatalogText) {
      const hours: string[] = hoursCatalogText.split('-');
      courseDetails.hoursCatalogText = hours ? { lecture: hours[0], lab: hours[1], tutorial: hours[2] } : undefined;
    }
    return { data: courseDetails, timestamp: timestamp, URL: URL };
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
  ): Promise<{ data: ClassScheduleListing[]; timestamp: string; URL: string }> {
    const URL = classScheduleListingUrl(term, subject.toUpperCase(), code);
    const tmp_Date = new Date();
    const timestamp = tmp_Date.toISOString();
    const res = await got(URL);
    const $ = cheerio.load(res.body);
    return { data: await classScheduleListingExtractor($), timestamp: timestamp, URL: URL };
  }

  /**
   * Gets seats and waitList seats for a given course section from BAN1P
   *
   * @param term i.e. '202009', '202101'
   * @param crn ie. '12345', '20001'
   */
  public static async getSectionSeats(
    term: string,
    crn: string
  ): Promise<{ data: DetailedClassInformation; timestamp: string; URL: string }> {
    const URL = detailedClassInformationUrl(term, crn);
    const tmp_Date = new Date();
    const timestamp = tmp_Date.toISOString();
    const res = await got(URL);
    const $ = cheerio.load(res.body);
    return { data: detailedClassInfoExtractor($), timestamp: timestamp, URL: URL };
  }
}
const main = async () => {
  const client = await UVicCourseScraper.getCourseSections('202009', 'SENG', '265');
  console.log(client);
};
main();
