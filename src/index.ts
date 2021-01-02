import * as cheerio from 'cheerio';
import got from 'got';

import { classScheduleListingUrl, detailedClassInformationUrl } from './common/urls';
import { classScheduleListingExtractor } from './pages/courseListingEntries';
import { detailedClassInfoExtractor } from './pages/detailedClassInformation';
import { KualiCourseCatalog, KualiCourseItem } from './types';
import { getCurrTerm as getCurrentTerm } from './utils';

const COURSES_URL = 'https://uvic.kuali.co/api/v1/catalog/courses/5d9ccc4eab7506001ae4c225';
const COURSE_DETAIL_URL = 'https://uvic.kuali.co/api/v1/catalog/course/5d9ccc4eab7506001ae4c225/';

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
const fetchCourseDetails = (pidMap: Map<string, string>) => async (subject: string, code: string) => {
  const pid = pidMap.get(subject + code);
  // TODO: we probably don't want to return the Kuali data as-is.
  const courseDetails = await got(COURSE_DETAIL_URL + pid).json<KualiCourseItem>();
  // TODO: strip HTML tags from courseDetails.description
  return courseDetails;
};

export const UvicCourseScraper = async () => {
  // upon initialization, we download the main Kuali courses JSON file.
  const kuali = await got(COURSES_URL).json<KualiCourseCatalog[]>();

  // a map to map human readable subjectCode to a pid required for requests
  const pidMap = subjectCodeToPidMapper(kuali);

  /**
   * Gets a complete list of all courses and their data in the Kuali catalog.
   * @return {KualiCourseCatalog[]}
   */
  const getAllCourses = () => {
    return kuali.map(v => ({
      ...v,
      getDetails: () => got(COURSE_DETAIL_URL + v.pid).json<KualiCourseItem>(),
    }));
  };

  // /**
  //  * Gets the sections for a given subject, code and term.
  //  * @param subject ie. CSC, SENG, PHYS
  //  * @param code ie. 100, 265, 215
  //  * @param term ie. 202001, 202101
  //  */
  // const getSections = async (subject: string, code: string, term = getCurrentTerm()) => {
  //   const sections = await fetchSections(subject, code, term);
  //   return {
  //     sections: sections.map(v => ({ ...v, getSectionDetails: () => fetchSectionDetails(v.crn, term) })),
  //     getCourseDetails: () => fetchCourseDetails(pidMap)(subject, code),
  //   };
  // };

  // /**
  //  * Gets the section details for a given crn, code and term.
  //  * @param crn ie. 12523
  //  * @param term ie. 202001, 202101
  //  */
  // const getSectionDetails = async (crn: string, term: string) => {
  //   const sectionDetails = await fetchSectionDetails(crn, term);
  //   return {
  //     ...sectionDetails,
  //   };
  // };

  // /**
  //  * Gets the section details for a given crn, code and term.
  //  * @param subject ie. CSC, SENG, PHYS
  //  * @param code ie. 100, 265, 215
  //  */
  // const getCourseDetails = async (subject: string, code: string) => {
  //   const course = await fetchCourseDetails(pidMap)(subject, code);
  //   return {
  //     ...course,
  //     getSections: async (term = getCurrentTerm()) => {
  //       return (await fetchSections(subject, code, term)).map(v => ({
  //         ...v,
  //         getSectionDetails: () => fetchSectionDetails(v.crn, term),
  //       }));
  //     },
  //   };
  // };

  return {
    getAllCourses,
  };
};

// export class Course {
//   course: KualiCourseCatalog;
//   details?: KualiCourseItem;

//   private pid: string;

//   constructor(pid: string, course: KualiCourseCatalog) {
//     this.pid = pid;
//     this.course = course;
//   }

//   async init() {
//     this.details = await got(COURSE_DETAIL_URL + this.pid).json<KualiCourseItem>();
//     return this;
//   }

//   private invariant() {
//     if (this.details === undefined) {
//       new Error(`Client not initialized! Please run init()`);
//     }
//   }
// }

// export class Section {
//   private section: Section;
// }

// export class Client {
//   private kuali?: KualiCourseCatalog[];
//   private pidMap?: Map<string, string>;

//   async init() {
//     this.kuali = await got(COURSES_URL).json<KualiCourseCatalog[]>();
//     this.pidMap = subjectCodeToPidMapper(this.kuali);
//     return this;
//   }

//   public getCourses(details = false) {
//     this.invariant();
//     if (details) {
//       return this.kuali.map(c => new Course(this.pidMap.get(c.__catalogCourseId + c.subjectCode.name), c).init());
//     } else {
//       return this.kuali.map(c => new Course(this.pidMap.get(c.__catalogCourseId + c.subjectCode.name), c));
//     }
//   }

//   public async getSections(subject: string, code: string, term = getCurrentTerm()) {
//     const res = await got(classScheduleListingUrl(term, subject, code));
//     const $ = cheerio.load(res.body);
//     const sections = await classScheduleListingExtractor($);

//     return sections.map(() => new Section());
//   }

//   private invariant() {
//     if (this.kuali === undefined || this.pidMap === undefined) {
//       new Error(`Client not initialized! Please run init()`);
//     }
//   }
// }
