import axios from 'axios';
import { load } from 'cheerio';

import {
  classScheduleListingUrl,
  courseDetailUrl,
  coursesUrl,
  detailedClassInformationUrl,
  subjectsUrl,
} from './common/urls';
import { getCatalogIdForTerm, getCurrentTerm } from './common/utils';
import { KualiCourseItemParser } from './kuali/catalog';
import { classScheduleListingExtractor } from './pages/courseListingEntries';
import { detailedClassInfoExtractor } from './pages/detailedClassInformation';
import { mapsAndBuildingsExtractor } from './pages/uvic.ca/mapsAndBuildings';
import {
  KualiCourseCatalog,
  KualiCourseItem,
  DetailedClassInformation,
  ClassScheduleListing,
  KualiSubject,
  Response,
  KualiCourseItemParsed,
  BuildingInfo,
} from './types';

export class UVicCourseScraper {
  private static subjectCodeToPidMap: Map<string, string> = new Map();

  /**
   * Gets all courses from the Kuali catalog. Automatically uses the current term if not defined.
   * @param term i.e. '202009', '202101'
   */
  public static async getCourses(term = getCurrentTerm()): Promise<Response<KualiCourseCatalog[]>> {
    const url = coursesUrl(getCatalogIdForTerm(term));
    const courseCatalog = await axios.get<KualiCourseCatalog[]>(url);
    return { response: courseCatalog.data, timestamp: new Date(), url };
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
    const courseDetails = await axios.get<KualiCourseItem>(url);
    return { response: KualiCourseItemParser(courseDetails.data), timestamp: new Date(), url };
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
    const res = await axios.get(url);
    return {
      response: await classScheduleListingExtractor(load(res.data)),
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
    const res = await axios.get(url);
    return {
      response: detailedClassInfoExtractor(load(res.data)),
      timestamp: new Date(),
      url,
    };
  }

  /**
   * Gets all subjects from the BAN1P. Automatically uses the current term if not defined.
   * @param term i.e. '202009', '202101'
   */
  public static async getSubjects(term = getCurrentTerm()): Promise<KualiSubject[]> {
    const res = await axios.get<KualiSubject[]>(subjectsUrl(getCatalogIdForTerm(term)));
    return res.data;
  }

  /**
   * Gets all the buildings on the UVic campus along with their full form and short form (abbreviation) and URL for more details.
   * @returns an array of BuildingInfo
   */
  public static async getBuildings(): Promise<Response<BuildingInfo[]>> {
    const url = 'https://www.uvic.ca/search/maps-buildings/index.php';
    const res = await axios.get(url);

    return {
      response: mapsAndBuildingsExtractor(load(res.data)),
      timestamp: new Date(),
      url,
    };
  }
}
