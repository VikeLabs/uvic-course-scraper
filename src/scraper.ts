import cheerio from 'cheerio';
import request from 'request-promise';
import { performance } from 'perf_hooks';
import fs from 'fs';
import * as readline from 'readline';

import { getCurrentTerms } from './utils';

const COURSES_URL = 'https://uvic.kuali.co/api/v1/catalog/courses/5d9ccc4eab7506001ae4c225';
const SECTIONS_URL = 'https://www.uvic.ca/BAN1P/bwckctlg.p_disp_listcrse';

const TERMS = getCurrentTerms(1);

interface Course {
  code: string;
  crns: string[];
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
 * Gets the crns for the given course
 *
 * @param {string} params - query params used with the sections url
 *
 * @returns {number[]} - an array of crns
 */
const getSections = async (params: string) => {
  try {
    // response = await request(url, { family: 4 });
    const response = await request(`${SECTIONS_URL}${params}`);

    const $ = cheerio.load(response);

    const crns: string[] = [];
    $('a').each((index, element) => {
      const temp = $(element).attr('href');
      if (temp && /crn_in=(\d+)/g.test(temp)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        crns.push(temp.match(/crn_in=(\d+)/)![1]);
      }
    });
    return crns;
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
    const schedules: string[] = TERMS.map(term => `?term_in=${term}&subj_in=${subject}&crse_in=${code}&schd_in=`);

    const courses: Course[] = [];
    for (const schedule of schedules) {
      const crns = await getSections(schedule);
      const term = (schedule.match(/term_in=(\d+)/) || [])[1];
      if (crns.length) {
        courses.push({ code, crns, subject, title, term: term || '0' });
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
      readline.cursorTo(process.stdout, 20);
      process.stdout.write(`${course.__catalogCourseId}  `);
      const courses = await getOffered(course.title, course.subject, course.code);
      results.push(...courses.flat());
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
