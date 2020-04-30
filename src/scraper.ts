import cheerio from 'cheerio';
import request from 'request-promise';
import { performance } from 'perf_hooks';
import fs from 'fs';
import * as readline from 'readline';

import { getCurrentTerms } from './utils';

const COURSES_URL = 'https://uvic.kuali.co/api/v1/catalog/courses/5d9ccc4eab7506001ae4c225';
const COURSE_DETAIL_URLS = 'https://uvic.kuali.co/api/v1/catalog/course/5d9ccc4eab7506001ae4c225/';
const DOMAIN_URL = 'https://www.uvic.ca';
const SECTIONS_URL = 'https://www.uvic.ca/BAN1P/bwckctlg.p_disp_listcrse';

const TERMS = getCurrentTerms(1);

interface Course {
  code: string;
  sections: Section[];
  subject: string;
  title: string;
  term: string;
}

interface ParsedCourse {
  [key: string]: string;
  __catalogCourseId: string;
  pid: string;
  subject: string;
  code: string;
}

interface Section {
  schedule?: Schedule[];
  [key: string]: string | string[] | Schedule[] | undefined | Seating;
}

interface Schedule {
  Type: string;
  Time: string;
  Days: string;
  Where: string;
  'Date Range': string;
  'Schedule Type': string;
  Instructors: string;
}

interface Seating {
  Capacity: number;
  Actual: number;
  Remaining: number;
}

/**
 * Gets Course subject, code, pid for all courses
 *
 * @returns {ParsedCourse[]} an array of all the courses
 */
const getCourses = async (): Promise<ParsedCourse[]> => {
  try {
    const response = await request(COURSES_URL);
    const courses = JSON.parse(response);
    for (const course of courses) {
      course.subject = course.subjectCode.name;
      course.code = course.__catalogCourseId.slice(course.subject.length);
    }
    return courses;
  } catch (error) {
    console.log(error);
    throw new Error('Failed to get department data');
  }
};

/**
 * Gets more details of the section. Most importantly, the section capacities
 * @param endpoint section details endpoint provided by the sections page
 */
const getSectionDetails = async (endpoint: string | undefined) => {
  if (!endpoint) {
    return {};
  }
  // ex: https://www.uvic.ca/BAN1P/bwckschd.p_disp_detail_sched?term_in=202005&crn_in=30184
  const response = await request(DOMAIN_URL + endpoint);
  const $ = cheerio.load(response);
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
    Seats: {
      Capacity: seatInfo[0],
      Actual: seatInfo[1],
      Remaining: seatInfo[2],
    },
    'Waitlist Seats': {
      Capacity: seatInfo[3],
      Actual: seatInfo[4],
      Remaining: seatInfo[5],
    },
    Requirements: requirements.slice(idx + 1),
  };
};

/**
 * Gets section info from "Class schedule Listing page"
 * @param {string} term term code - e.g. '202005'
 * @param {string} subject a subject/department code - e.g. 'CSC'
 * @param {string} code a subject code - e.g. '421'
 *
 * @returns {number[]} - an array of crns
 */
const getSections = async (term: string, subject: string, code: string) => {
  try {
    // ex: https://www.uvic.ca/BAN1P/bwckctlg.p_disp_listcrse?term_in=202005&subj_in=CSC&crse_in=225&schd_in=
    const response = await request(`${SECTIONS_URL}?term_in=${term}&subj_in=${subject}&crse_in=${code}&schd_in=`);
    const $ = cheerio.load(response);

    const sections: Section[] = [];

    const sectionEntries = $(`table[summary="This layout table is used to present the sections found"]>tbody>tr`);
    for (let sectionIdx = 0; sectionIdx < sectionEntries.length; sectionIdx += 2) {
      let section: Section = {};

      // Parse Title block e.g. "Algorithms and Data Structures I - 30184 - CSC 225 - A01"
      const title = $('a', sectionEntries[sectionIdx]);
      section['Description'] = title.text();
      const parsedTitle = title.text().split('-');
      section['CRN'] = parsedTitle[1].trim();
      section['Section Code'] = parsedTitle[3].trim();

      // Get more information from section details page
      section = { ...section, ...(await getSectionDetails($('a', sectionEntries[sectionIdx]).attr('href'))) };

      // Section info is divided into 2 table rows, here we get the second one
      const sectionEntry = sectionEntries[sectionIdx + 1];

      // Parse block before schdule table
      const sectionInfo = $(`tr td`, sectionEntry)
        .text()
        .split('\n')
        .filter(e => e.length)
        .map(e => e.trim());
      section[`Additional Info`] = sectionInfo[0];
      for (let i = 1; i < 4; i++) {
        const temp = sectionInfo[i].split(/:(.+)/);
        section[`${temp[0]}`] = temp[1];
      }
      section['Location'] = sectionInfo[4];
      section['Section Type'] = sectionInfo[5];
      section['Instructional Method'] = sectionInfo[6];
      section['Credits'] = sectionInfo[7];

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
          Type: scheduleEntries[0],
          Time: scheduleEntries[1],
          Days: scheduleEntries[2],
          Where: scheduleEntries[3],
          'Date Range': scheduleEntries[4],
          'Schedule Type': scheduleEntries[5],
          Instructors: scheduleEntries[6],
        });
      }
      section['Schedule'] = scheduleData;

      sections.push(section);
    }
    console.log('hi');

    return sections;
  } catch (error) {
    throw new Error('Failed to get sections');
  }
};

/**
 * Gets the courses that are currently being offered
 *
 * @param {string} subject a subject/department code - e.g. 'CSC'
 * @param {string} code a subject code - e.g. '421'
 *
 * @typedef {Object} Course
 * @property {numer} code - course code
 * @property {number[]} crns - section crns
 * @property {string} subject - the course department/subject
 * @property {string} title - the course title
 * @property {number} term - the term the course is offered
 *
 * @returns {Course} - an array of all courses currently offered
 */
const getOffered = async (title: string, subject: string, code: string) => {
  try {
    const courses: Course[] = [];
    for (const term of TERMS) {
      const sections = await getSections(term, subject, code);
      if (sections.length) {
        courses.push({ code, sections, subject, title, term: term || '0' });
      }
    }
    return courses;
  } catch (error) {
    throw new Error('Failed to get avaliable sections');
  }
};

const main = async () => {
  // Hide cursor and start timer
  process.stdout.write('\u001B[?25l');
  const start = performance.now();

  const failed: string[] = [];
  const courseCodes = await getCourses();

  process.stdout.write('Getting courses for ');
  const results: Course[] = [];
  for (const course of courseCodes) {
    try {
      if (course.subject !== `CSC`) {
        continue;
      }
      readline.cursorTo(process.stdout, 20);
      process.stdout.write(`${course.__catalogCourseId}  `);
      const courses = await getOffered(course.title, course.subject, course.code);
      results.push(...courses.flat());
      break;
    } catch (error) {
      failed.push(course.__catalogCourseId);
    }
  }
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);

  // Stop timer and show cursor
  const finish = performance.now();
  process.stdout.write('\u001B[?25h');

  if (failed.length) {
    console.log(failed);
  }
  console.log(`Getting course data took ${(finish - start) / 60000} minutes`);

  fs.writeFileSync('courses.json', JSON.stringify(results));
};

main();
