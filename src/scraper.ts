import cheerio from 'cheerio';
import request from 'request-promise';
import { performance } from 'perf_hooks';
import fs from 'fs';

const BASE_URL = 'https://web.uvic.ca/calendar2020-01/CDs/';
const SECTIONS_URL = 'https://www.uvic.ca/BAN1P/bwckctlg.p_disp_listcrse';

interface Course {
  code: string;
  crns: string[];
  subject: string;
  title: string;
  term: string;
}

/**
 * Gets the department/subject codes
 *
 * @returns {string[]} an array of department codes
 */
const getDepartments = async () => {
  try {
    const response = await request(BASE_URL);
    const $ = cheerio.load(response);

    const departments: string[] = [];
    $('a').each((index, element) => {
      const department = $(element).attr('href');
      if (department && /^[A-Z]+/g.test(department)) {
        departments.push(department.slice(0, -1));
      }
    });
    return departments;
  } catch (error) {
    console.log(error);
    throw new Error('Failed to get department data');
  }
};

/**
 * Gets the course number codes
 *
 * @param {string} department a department code - e.g. 'CSC'
 *
 * @returns {string[]} an array of course codes
 */
const getCourseCodes = async (department: string) => {
  try {
    const response = await request(`${BASE_URL}${department}`);
    const $ = cheerio.load(response);

    const courses: string[] = [];
    $('a').each((index, element) => {
      const course = $(element).attr('href');
      if (course && /^[0-7]+/g.test(course)) {
        courses.push(course.slice(0, course.indexOf('.')));
      }
    });
    return courses;
  } catch (error) {
    throw new Error('Failed to get course data');
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
  const url = `${SECTIONS_URL}${params}`;
  try {
    let response;
    try {
      response = await request(url, { family: 4 });
    } catch (err) {
      console.error('request error, getSections');
      console.error(err);
      throw new Error(err);
    }
    const $ = cheerio.load(response);

    const crns: string[] = [];
    $('a').each((index, element) => {
      const temp = $(element).attr('href');
      const match = temp ? temp.match(/crn_in=(\d+)/) : undefined;
      if (match) {
        crns.push(match[1]);
      }
    });
    return crns;
  } catch (error) {
    console.error(url);
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
const getOffered = async (subject: string, code: string) => {
  const url = `${BASE_URL}${subject}/${code}.html`;
  try {
    let response;
    try {
      response = await request(url, { family: 4 });
    } catch (err) {
      console.error('request error, getOffered');
      console.error(err);

      throw new Error(err);
    }
    const $ = cheerio.load(response);

    const title = $('h2').text();

    const schedules: string[] = [];
    $('#schedules')
      .find('a')
      .each((index, element) => {
        const temp = $(element).attr('href');
        if (temp) schedules.push(temp.slice(temp.indexOf('?'), temp.length));
      });

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
    console.error(url);
    throw new Error('Failed to get avaliable sections');
  }
};

const main = async () => {
  const failed: string[] = [];
  const start = performance.now();

  const departments = await getDepartments();

  const results: Course[] = [];
  for (const department of departments) {
    try {
      const courseCodes = await getCourseCodes(department);
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(`Getting courses for ${department}`);
      const courses = await Promise.all(courseCodes.map(async courseCode => await getOffered(department, courseCode)));
      //   console.log(`Completed getting courses for ${department}`);
      results.push(...courses.flat());
    } catch (err) {
      console.error(err);
    }
  }

  const finish = performance.now();
  console.log(failed);
  console.log(`Getting course data took ${(finish - start) / 60000} minutes`);

  fs.writeFileSync('courses.json', JSON.stringify(results));
};

main();
