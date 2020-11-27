import * as cheerio from 'cheerio';
import got from 'got';
import { classScheduleListingUrl, detailedClassInformationUrl } from './lib/urls';
import { classScheduleListingExtractor } from './pages/courseListingEntries';
import { detailedClassInfoExtractor } from './pages/detailedClassInformation';
import { Course, KualiCourseCatalog } from './types';
import { getCurrTerm as getCurrentTerm } from './utils';

const COURSES_URL = 'https://uvic.kuali.co/api/v1/catalog/courses/5d9ccc4eab7506001ae4c225';
const COURSE_DETAIL_URL = 'https://uvic.kuali.co/api/v1/catalog/course/5d9ccc4eab7506001ae4c225/';

const subjectCodeToPidMapper = (kuali: KualiCourseCatalog[]) => {
  const dict: Map<string, string> = new Map();
  kuali.forEach(v => {
    dict.set(v.__catalogCourseId, v.pid);
  });
  return dict;
};

// TODO: change name of this
export const Demo = async () => {
  // upon initialization, we download the main Kuali courses JSON file.
  const kuali = (await got(COURSES_URL).json()) as KualiCourseCatalog[];

  // a map to map human readable subjectCode to a pid required for requests
  const pidMap = subjectCodeToPidMapper(kuali);

  const getCourses = () => {
    return kuali;
  };

  // don't directly return the "fetch" functions.
  const fetchSections = async (subject: string, code: string, term = getCurrentTerm()) => {
    const res = await got(classScheduleListingUrl(term, subject, code));
    const $ = cheerio.load(res.body);
    return classScheduleListingExtractor($);
  };

  const fetchSectionDetails = async (crn: string, term: string) => {
    const res = await got(detailedClassInformationUrl(term, crn));
    const $ = cheerio.load(res.body);
    return detailedClassInfoExtractor($);
  };

  const fetchCourseDetails = async (subject: string, code: string) => {
    const pid = pidMap.get(subject + code);
    return (got(COURSE_DETAIL_URL + pid).json() as unknown) as Course;
  };

  const getSections = async (subject: string, code: string, term = getCurrentTerm()) => {
    const sections = await fetchSections(subject, code, term);
    return {
      sections: sections.map(v => ({ ...v, getSectionDetails: () => fetchSectionDetails(v.crn, term) })),
      getCourseDetails: fetchCourseDetails(subject, code),
    };
  };

  const getSectionDetails = async (crn: string, term: string) => {
    const sectionDetails = await fetchSectionDetails(crn, term);
    return {
      ...sectionDetails,
    };
  };

  const getCourseDetails = async (subject: string, code: string) => {
    const course = await fetchCourseDetails(subject, code);
    return {
      ...course,
      getSections: async (term = getCurrentTerm()) => {
        return (await fetchSections(subject, code, term)).map(v => ({
          ...v,
          getSectionDetails: () => fetchSectionDetails(v.crn, term),
        }));
      },
    };
  };

  return {
    getSections,
    getSectionDetails,
    getCourses,
    getCourseDetails,
  };
};
