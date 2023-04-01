import { CheerioAPI } from 'cheerio';

/**
 * This is the scraper for the old API. The API changed 2020-05
 */

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
export const parseDepartments = async ($: CheerioAPI) => {
  try {
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
export const parseCourseCodes = async ($: CheerioAPI, department: string) => {
  try {
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
export const parseSections = async ($: CheerioAPI, params: string) => {
  try {
    // response = await request(url, { family: 4 });
    // console.log(`${SECTIONS_URL}${params}`);

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
export const parseOffered = async ($: CheerioAPI, subject: string, code: string) => {
  try {
    const title = $('h2').text();

    const schedules: string[] = [];
    $('#schedules')
      .find('a')
      .each((index, element) => {
        const temp = $(element).attr('href');
        if (temp) schedules.push(temp.slice(temp.indexOf('?'), temp.length));
      });

    const courses: Course[] = [];
    // for (const schedule of schedules) {
    //   // const crns = await parseSections(schedule);
    //   const term = (schedule.match(/term_in=(\d+)/) || [])[1];
    //   if (crns.length) {
    //     courses.push({ code, crns, subject, title, term: term || '0' });
    //   }
    // }
    return courses;
  } catch (error) {
    throw new Error('Failed to get avaliable sections');
  }
};

// const main = async () => {
//   // Hide cursor and start timer
//   process.stdout.write('\u001B[?25l');
//   const start = performance.now();

//   const failed: string[] = [];
//   const departments = await getDepartments();

//   process.stdout.write('Getting courses for ');
//   const results: Course[] = [];
//   let idx = 0;
//   for (const department of departments) {
//     idx++;
//     if (idx > 2) {
//       break;
//     }
//     try {
//       readline.cursorTo(process.stdout, 20);
//       process.stdout.write(`${department}  `);
//       const courseCodes = await getCourseCodes(department);
//       const courses = await Promise.all(courseCodes.map(async code => await getOffered(department, code)));
//       results.push(...courses.flat());
//     } catch (error) {
//       failed.push(department);
//     }
//   }
//   readline.clearLine(process.stdout, 0);
//   readline.cursorTo(process.stdout, 0);

//   // Stop timer and show cursor
//   const finish = performance.now();
//   process.stdout.write('\u001B[?25h');

//   if (failed.length) {
//     console.log(failed);
//   }
//   console.log(`Getting course data took ${(finish - start) / 60000} minutes`);

//   fs.writeFileSync('courses.json', JSON.stringify(results));
// };

// main();
