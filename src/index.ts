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
  /**
   * Gets all courses from the Kuali catalog
   *
   * @return {KualiCourseCatalog[]}
   */
  public static async getAllCourses(): Promise<KualiCourseCatalog[]> {
    const courseCatalog = await got(COURSES_URL).json<KualiCourseCatalog[]>();
    return courseCatalog;
  };

  /**
   * Gets details of a single course from Kuali
   *
   * @param pid ie. ByS23Pp7E
   */
  public static async getCourseDetails(pid: string): Promise<KualiCourseItem> {
    // TODO: we probably don't want to return the Kuali data as-is.
    const courseDetails = await got(COURSE_DETAIL_URL + pid).json<KualiCourseItem>();
    // strip HTML tags from courseDetails.description
    courseDetails.description = courseDetails.description.replace(/(<([^>]+)>)/gi, '');
    // parse hoursCatalogText into object
    const hoursCatalogText = courseDetails.hoursCatalogText as string;
    const hours: string[] = hoursCatalogText.split('-');
    courseDetails.hoursCatalogText = hours ? { lecture: hours[0], lab: hours[1], tutorial: hours[2] } : undefined;
    return courseDetails;
  };

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
    const res = await got(classScheduleListingUrl(term, subject, code));
    const $ = cheerio.load(res.body);
    return classScheduleListingExtractor($);
  };

  /**
   * Gets seats and waitlist seats for a given course section from BAN1P
   *
   * @param term i.e. '202009', '202101'
   * @param crn ie. '12345', '20001'
   * @return {Promise<DetailedClassInformation>}
   */
  public static async getSectionSeats(term: string, crn: string): Promise<DetailedClassInformation> {
    const res = await got(detailedClassInformationUrl(term, crn));
    const $ = cheerio.load(res.body);
    return detailedClassInfoExtractor($);
  };
};
