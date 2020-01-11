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
  try {
    const response = await request(`${SECTIONS_URL}${params}`);
    const $ = cheerio.load(response);

    const crns: string[] = [];
    $('a').each((index, element) => {
      const temp = $(element).attr('href');
      if (temp && /crn_in=(\d+)/g.test(temp)) {
        crns.push(temp.match(/crn_in=(\d+)/)![1]);
      }
    });
    return crns;
  } catch (error) {
    console.error(error);
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
  try {
    const response = await request(`${BASE_URL}${subject}/${code}.html`);
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
    throw new Error('Failed to get avaliable sections');
  }
};

const main = async () => {
  // Get all courses currently being offered
  const failed: string[] = [];
  //   const courses: {
  //     [key: string]: string[];
  //   } = {};
  // Get data about each course - e.g. crns, terms offered
  const start = performance.now();

  const departments = await getDepartments();

  const results: Course[] = [];
  for (const department of departments) {
    try {
      const courseCodes = await getCourseCodes(department);
      console.log(`Getting courses for ${department}`);
      const courses = await Promise.all(courseCodes.map(courseCode => getOffered(department, courseCode)));
      console.log(`Completed getting courses for ${department}`);
      if (!courses.flat) {
        console.log('No flat method');
        console.log(courses);
      }
      results.push(...courses.flat());
    } catch (err) {
      console.error(err);
    }
  }

  //   const results = getDepartments().then(departments =>
  //     departments.map(department =>
  //       getCourseCodes(department)
  //         .then(courseCodes =>
  //           courseCodes.map(course =>
  //             getOffered(department, course).catch(() => {
  //               failed.push(`failed to get offered: ${department} ${course}`);
  //             })
  //           )
  //         )
  //         .catch(() => {
  //           failed.push(`Failed to get course codes: ${department}`);
  //         })
  //     )
  //   );

  //   const departments = await getDepartments();
  //   process.stdout.write('Getting courses for ');
  //   for (const department of departments) {
  //     process.stdout.cursorTo(20);
  //     process.stdout.write(`${department}  `);
  //     try {
  //       const depatmentCourses = await getCourseCodes(department);
  //       courses[department] = depatmentCourses;
  //     } catch (error) {
  //       failed.push(department);
  //     }
  //   }
  //   process.stdout.clearLine(0);
  //   process.stdout.cursorTo(0);

  //   const test = [];
  //   process.stdout.write('Getting data for ');
  //   for (const subject of Object.keys(courses)) {
  //     for (const code of courses[subject]) {
  //       process.stdout.cursorTo(17);
  //       process.stdout.write(`${subject} ${code}  `);
  //       const avaliable = await getOffered(subject, code);
  //       test.push(avaliable);
  //     }
  //   }
  //   process.stdout.clearLine(0);
  //   process.stdout.cursorTo(0);

  const finish = performance.now();
  console.log(failed);
  console.log(`Getting course data took ${(finish - start) / 60000} minutes`);

  fs.writeFileSync('courses.json', JSON.stringify(results));
};

main();
