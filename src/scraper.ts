import cheerio from 'cheerio';
import got from 'got';
import { performance } from 'perf_hooks';
import fs from 'fs';
import async from 'async';
import ProgressBar from 'progress';

import { Course, Seating, Section, Schedule } from './types';
import { getCurrentTerms } from './utils';
const TERMS = getCurrentTerms(1);

const COURSES_URL = 'https://uvic.kuali.co/api/v1/catalog/courses/5d9ccc4eab7506001ae4c225';
const COURSE_DETAIL_URLS = 'https://uvic.kuali.co/api/v1/catalog/course/5d9ccc4eab7506001ae4c225/';
const DOMAIN_URL = 'https://www.uvic.ca';
const SECTIONS_URL = 'https://www.uvic.ca/BAN1P/bwckctlg.p_disp_listcrse';
interface SectionDetails {
  seats: Seating;
  waitlistSeats: Seating;
  requirements: string[];
}

/**
 * Gets Course subject, code, pid for all courses
 *
 * @returns {Course[]} an array of all the courses
 */
const getCourses = async (): Promise<Course[]> => {
  try {
    const courses: Course[] = await got(COURSES_URL).json();
    for (const course of courses) {
      course.subject = course.subjectCode.name;
      course.catalogCourseId = course.__catalogCourseId;
      course.code = course.__catalogCourseId.slice(course.subject.length);
    }
    return courses;
  } catch (error) {
    console.log(error);
    throw new Error('Failed to get department data');
  }
};

/**
 * Adds infomation to the provided course object.
 *
 * @param {Course} course the course object to extend
 */
const getCourseDetail = async (course: Course) => {
  // ex: https://uvic.kuali.co/api/v1/catalog/course/5d9ccc4eab7506001ae4c225/r1xcyOamN
  Object.assign(course, await got(COURSE_DETAIL_URLS + course.pid).json());
};

/**
 * Gets more details of the section. Most importantly, the section capacities
 * @param endpoint section details endpoint provided by the sections page
 */
const getSectionDetails = async (endpoint: string): Promise<SectionDetails> => {
  // ex: https://www.uvic.ca/BAN1P/bwckschd.p_disp_detail_sched?term_in=202005&crn_in=30184
  const response = await got(DOMAIN_URL + endpoint);
  const $ = cheerio.load(response.body);
  const seatElement = $(`table[summary="This layout table is used to present the seating numbers."]>tbody>tr`);

  const seatInfo = seatElement
    .text()
    .split('\n')
    .map(e => parseInt(e, 10))
    .filter(e => !Number.isNaN(e));
  const requirements = $(`table[summary="This table is used to present the detailed class information."]>tbody>tr>td`)
    .text()
    .split('\n')
    .filter(e => e.length);
  const idx = requirements.findIndex(e => e === 'Restrictions:');
  return {
    seats: {
      capacity: seatInfo[0],
      actual: seatInfo[1],
      remaining: seatInfo[2],
    },
    waitlistSeats: {
      capacity: seatInfo[3],
      actual: seatInfo[4],
      remaining: seatInfo[5],
    },
    requirements: requirements.slice(idx + 1),
  };
};

/**
 * Extends course object with section info for term.
 *
 * @param {Course} course the course object to extend
 * @param {string} term the term code
 */
const getSections = async (course: Course, term: string) => {
  try {
    // ex: https://www.uvic.ca/BAN1P/bwckctlg.p_disp_listcrse?term_in=202005&subj_in=CSC&crse_in=225&schd_in=
    const response = await got(
      `${SECTIONS_URL}?term_in=${term}&subj_in=${course.subject}&crse_in=${course.code}&schd_in=`
    );
    const $ = cheerio.load(response.body);

    const sections: Section[] = [];

    const sectionEntries = $(`table[summary="This layout table is used to present the sections found"]>tbody>tr`);
    for (let sectionIdx = 0; sectionIdx < sectionEntries.length; sectionIdx += 2) {
      const section = {} as Section;

      // Parse Title block e.g. "Algorithms and Data Structures I - 30184 - CSC 225 - A01"
      const title = $('a', sectionEntries[sectionIdx]);
      section.description = title.text();
      const parsedTitle = title.text().split('-');
      section.CRN = parsedTitle[1].trim();
      section.sectionCode = parsedTitle[3].trim();

      // Get more information from section details page. Uncommenting this would increase runtime by at least x2
      const sectionDetailsEndpoint = $('a', sectionEntries[sectionIdx]).attr('href');
      if (sectionDetailsEndpoint) {
        Object.assign(section, await getSectionDetails(sectionDetailsEndpoint));
      }

      // Section info is divided into 2 table rows, here we get the second one
      const sectionEntry = sectionEntries[sectionIdx + 1];

      // Parse block before schdule table
      const sectionInfo = $(`tr td`, sectionEntry)
        .text()
        .split('\n')
        .filter(e => e.length)
        .map(e => e.trim());
      section.additionalInfo = sectionInfo[0];
      section.associatedTerm = sectionInfo[1].split(/:(.+)/)[1];
      section.registrationDates = sectionInfo[2].split(/:(.+)/)[1];
      section.levels = sectionInfo[3].split(/:(.+)/)[1];
      section.location = sectionInfo[4];
      section.sectionType = sectionInfo[5];
      section.instructionalMethod = sectionInfo[6];
      section.credits = sectionInfo[7];

      // Parse schedule table
      let scheduleEntries = $(
        `table[summary="This table lists the scheduled meeting times and assigned instructors for this class.."] tbody`,
        sectionEntry
      )
        .text()
        .split('\n')
        .filter(e => e.length);
      const scheduleData: Schedule[] = [];
      while (true) {
        scheduleEntries = scheduleEntries.slice(7);
        if (scheduleEntries.length == 0) {
          break;
        }
        scheduleData.push({
          type: scheduleEntries[0],
          time: scheduleEntries[1],
          days: scheduleEntries[2],
          where: scheduleEntries[3],
          dateRange: scheduleEntries[4],
          scheduleType: scheduleEntries[5],
          instructors: scheduleEntries[6],
        });
      }
      section.schedule = scheduleData;

      sections.push(section);
    }
    if (sections.length > 0) {
      course.offerings.push({ term: term, sections: sections });
    }
  } catch (error) {
    throw new Error(`Failed to get sections: ${error}`);
  }
};

/**
 * Extends course with all course offerings.
 * Uses global TERMS const to get term strings.
 *
 * @param {Course} course course to extend with offerings
 */
const getOfferings = async (course: Course) => {
  if (!course.offerings) {
    course.offerings = [];
  }
  for (const term of TERMS) {
    await getSections(course, term);
  }
};

/**
 * This is a helper function to iterate through courses and apply a given function for each course.
 * This helper will retry failed function calls until the given function passes for all courses.
 *
 * @param courses courses to iterate through
 * @param asyncfn function to apply to each course
 * @param rateLimit limit the number of concurrently running functions
 */
const forEachHelper = async (courses: Course[], asyncfn: (course: Course) => void, rateLimit: number) => {
  let current: Course[] = courses;
  while (current.length > 0) {
    console.log(`Running \'${asyncfn.name}\' on ${current.length} courses`);

    const bar = new ProgressBar(':bar :current/:total', { total: current.length });
    const failedCourses: Course[] = [];
    await async.forEachOfLimit(current, rateLimit, async (course, key, callback) => {
      try {
        await asyncfn(course);
      } catch (e) {
        bar.interrupt(`Failed ${course.catalogCourseId} ${key}: ${e}`);
        failedCourses.push(course);
      } finally {
        bar.tick();
        callback();
        return;
      }
    });

    if (failedCourses.length > 0) {
      console.log(`Failed to get data on ${failedCourses.length} courses, retring`);
    }
    current = failedCourses;
  }
  return;
};

const main = async () => {
  // start timer
  const start = performance.now();

  console.log('Getting all course ids');
  // const courses = (await getCourses()).filter(e => e.subject === 'CSC');
  const courses = await getCourses();

  console.log('Getting course details');
  await forEachHelper(courses, getCourseDetail, 35);

  console.log('Getting courses offering');
  await forEachHelper(courses, getOfferings, 25);

  // Stop timer
  const finish = performance.now();

  console.log(`Getting course data took ${(finish - start) / 60000} minutes`);
  console.log(`${(finish - start) / courses.length} ms/course`);

  fs.writeFileSync('courses.json', JSON.stringify(courses));
};

main();
