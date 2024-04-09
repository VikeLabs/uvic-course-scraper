import fetch from 'node-fetch';
import { load } from 'cheerio';
import {
  classScheduleListingUrl,
  detailedClassInformationUrl,
  subjectsUrl,
} from './uvic.ca/BAN1P/urls';
import { courseDetailUrl } from './uvic.kuali.co/urls';
import { coursesUrl } from './uvic.kuali.co/urls';
import { getCatalogIdForTerm, getCurrentTerm } from './common/utils';
import { KualiCourseItemParser } from './uvic.kuali.co/catalog';
import { classScheduleListingExtractor } from './uvic.ca/BAN1P/courseListingEntries';
import { detailedClassInfoExtractor } from './uvic.ca/BAN1P/detailedClassInformation';
import { DetailedClassInformation, ClassScheduleListing } from './uvic.ca/BAN1P/types';
import { BuildingInfo } from './uvic.ca/map-buildings/types';
import type { KualiCourseItemParsed, KualiCourseItem, KualiCourseCatalog, KualiSubject } from './uvic.kuali.co/types';
import { mapsAndBuildingsExtractor } from './uvic.ca/map-buildings';

export interface Response<T> {
  data: T;
  timestamp: Date;
  url: string;
}

export class UVicCourseScraper {
  public static subjectCodeToPidMap: Map<string, string> = new Map();

  /**
   * Gets all courses from the Kuali catalog. Automatically uses the current term if not defined.
   * @param term i.e. '202009', '202101'
   */
  public static async getCourses(term = getCurrentTerm()): Promise<Response<KualiCourseCatalog[]>> {
    const url = coursesUrl(getCatalogIdForTerm(term));
    const res = await fetch(url);
    const courseCatalog = (await res.json()) as KualiCourseCatalog[];
    return { data: courseCatalog, timestamp: new Date(), url };
  }

  public static subjectCodeToPidMapper = (term: string, kuali: KualiCourseCatalog[]) => {
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
      const { data: courseCatalog } = await UVicCourseScraper.getCourses(term);
      UVicCourseScraper.subjectCodeToPidMapper(term, courseCatalog);
    }

    const pid = UVicCourseScraper.subjectCodeToPidMap.get(`${term}${subject.toUpperCase()}${code}`);

    if (pid === undefined) {
      return;
    }

    const { data: response, url } = await UVicCourseScraper.getCourseDetailsByPid(term, pid);
    return { data: response, timestamp: new Date(), url };
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
    const res = await fetch(url);
    const courseDetails = (await res.json()) as KualiCourseItem;
    return { data: KualiCourseItemParser(courseDetails), timestamp: new Date(), url };
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
    const res = await fetch(url);
    const body = await res.text();
    return {
      data: await classScheduleListingExtractor(load(body)),
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
    const res = await fetch(url);
    const body = await res.text();
    return {
      data: detailedClassInfoExtractor(load(body)),
      timestamp: new Date(),
      url,
    };
  }

  /**
   * Gets all subjects from the BAN1P. Automatically uses the current term if not defined.
   * @param term i.e. '202009', '202101'
   */
  public static async getSubjects(term = getCurrentTerm()): Promise<KualiSubject[]> {
    const res = await fetch(subjectsUrl(getCatalogIdForTerm(term)));
    const data = (await res.json()) as KualiSubject[];
    return data;
  }

  /**
   * Gets all the buildings on the UVic campus along with their full form and short form (abbreviation) and URL for more details.
   * @returns an array of BuildingInfo
   */
  public static async getBuildings(): Promise<Response<BuildingInfo[]>> {
    const url = 'https://www.uvic.ca/search/maps-buildings/index.php';
    const res = await fetch(url);
    const body = await res.text();

    return {
      data: mapsAndBuildingsExtractor(load(body)),
      timestamp: new Date(),
      url,
    };
  }
}
