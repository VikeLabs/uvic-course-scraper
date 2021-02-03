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
} from './types';
import { getCurrentTerm } from './utils';

/**
 * Generates a Map that maps a subject and code to a pid used internally within Kuali.
 * @param kuali
 */
const subjectCodeToPidMapper = (kuali: KualiCourseCatalog[]) => {
  const dict: Map<string, string> = new Map();
  kuali.forEach(v => {
    dict.set(v.__catalogCourseId, v.pid);
  });
  return dict;
};

const fetchSections = async (subject: string, code: string, term = getCurrentTerm()) => {
  const res = await got(classScheduleListingUrl(term, subject, code));
  const $ = cheerio.load(res.body);
  return classScheduleListingExtractor($);
};

/**
 * Fetches the section details for a given crn and term.
 * To be used by functions defined interally only.
 *
 * @param crn ie. 12523
 * @param term ie. 202009, 202101
 */
const fetchSectionDetails = async (crn: string, term: string) => {
  const res = await got(detailedClassInformationUrl(term, crn));
  const $ = cheerio.load(res.body);
  return detailedClassInfoExtractor($);
};

/**
 * Fetches the course details of a given class.
 * To be used by functions defined interally only.
 *
 * @param subject ie. CSC, SENG, PHYS
 * @param code ie. 100, 265, 115
 */
const fetchCourseDetails = (pidMap: Map<string, string>) => async (
  subject: string,
  code: string
): Promise<KualiCourseItem> => {
  const pid = pidMap.get(subject + code);
  // TODO: we probably don't want to return the Kuali data as-is.
  const courseDetails = await got(COURSE_DETAIL_URL + pid).json<KualiCourseItem>();
  // strip HTML tags from courseDetails.description
  courseDetails.description = courseDetails.description.replace(/(<([^>]+)>)/gi, '');
  return courseDetails;
};

export const UvicCourseScraper = async () => {
  // upon initialization, we download the main Kuali courses JSON file.
  const kuali = await got(COURSES_URL).json<KualiCourseCatalog[]>();

  // a map to map human readable subjectCode to a pid required for requests
  const pidMap = subjectCodeToPidMapper(kuali);

  /**
   * Gets a complete list of all courses and their data in the Kuali catalog
   *
   * @return {KualiCourseCatalog[]}
   */
  const getAllCourses = (): KualiCourseCatalog[] => {
    return kuali.map(v => ({
      ...v,
      getDetails: () => got(COURSE_DETAIL_URL + v.pid).json<KualiCourseItem>(),
    }));
  };

  /**
   * Fetches the data on seats and waitlist seats for a given course section.
   *
   * @param crn ie. '12345', '20001'
   * @param term i.e. '202009', '202101'
   * @return {Promise<DetailedClassInformation>}
   */
  const getSeats = async (term: string, crn: string): Promise<DetailedClassInformation> => {
    const { seats, waitListSeats } = await fetchSectionDetails(crn, term);
    return { seats, waitListSeats };
  };

  /**
   * Fetches course details from Kuali for a given course.
   *
   * @param subject i.e. 'SENG', 'ECON'
   * @param code i.e. '360', '180A'
   * @param term i.e. '202009'
   * @return {Promise<KualiCourseItem>}
   */
  // TODO: Implement functionality for term parameter.
  // This will be a result of adding logic which uses the proper Kuali/BAN1P link
  const getCourseDetails = async (
    subject: string,
    code: string,
    term: string = getCurrentTerm()
  ): Promise<KualiCourseItem> => {
    const getDetails = await fetchCourseDetails(pidMap)(subject, code);

    return getDetails;
  };

  return {
    getAllCourses,
    getSeats,
    getCourseDetails,
  };
};
