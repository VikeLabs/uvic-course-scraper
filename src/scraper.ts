import cheerio from 'cheerio';
import request from 'request-promise';
import { performance } from 'perf_hooks';
import fs from 'fs';
import * as readline from 'readline';
import async from 'async';

import { getCurrentTerms, rateLimitedRequest, totalRequests, failedRequests } from './utils';

const COURSES_URL = 'https://uvic.kuali.co/api/v1/catalog/courses/5d9ccc4eab7506001ae4c225';
const COURSE_DETAIL_URLS = 'https://uvic.kuali.co/api/v1/catalog/course/5d9ccc4eab7506001ae4c225/';
const DOMAIN_URL = 'https://www.uvic.ca';
const SECTIONS_URL = 'https://www.uvic.ca/BAN1P/bwckctlg.p_disp_listcrse';

const TERMS = getCurrentTerms(1);

interface Course {
  [key: string]: string | Offerings;
  catalogCourseId: string;
  code: string;
  offerings: Offerings;
  subject: string;
  title: string;
  term: string;
  pid: string;
}

interface Offerings {
  [key: string]: Section[];
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
 * @returns {Course[]} an array of all the courses
 */
const getCourses = async (): Promise<Course[]> => {
  try {
    const response = await request(COURSES_URL);
    const courses = JSON.parse(response);
    for (const course of courses) {
      course.subject = course.subjectCode.name;
      course.code = course.__catalogCourseId.slice(course.subject.length);
      course.catalogCourseId = course.__catalogCourseId;
    }
    return courses;
  } catch (error) {
    console.log(error);
    throw new Error('Failed to get department data');
  }
};

const getCourseDetail = async (course: Course) => {
  course.details = await request(COURSE_DETAIL_URLS + course.pid).then(JSON.parse);
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
const getSections = async (course: Course, term: string) => {
  try {
    // ex: https://www.uvic.ca/BAN1P/bwckctlg.p_disp_listcrse?term_in=202005&subj_in=CSC&crse_in=225&schd_in=
    const response = await request(
      `${SECTIONS_URL}?term_in=${term}&subj_in=${course.subject}&crse_in=${course.code}&schd_in=`
    );
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

      // Get more information from section details page. Uncommenting this would increase runtime by at least x2
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
    if (sections.length > 0) {
      course.offerings[`${term}`] = sections;
    }
  } catch (error) {
    throw new Error(`Failed to get sections: ${error}`);
  }
};

const getOfferings = async (course: Course) => {
  if (!course.offerings) {
    course.offerings = {};
  }
  for (const term of TERMS) {
    try {
      await getSections(course, term);
    } catch (e) {
      await getSections(course, term);
    }
  }
};

const forEachHelper = async (courses: Course[], asyncfn: (course: Course) => void, rateLimit: number) => {
  let current: Course[] = courses;
  while (current.length > 0) {
    console.log(`Running \'${asyncfn.name}\' on ${current.length} courses`);

    const failedCourses: Course[] = [];
    await async.forEachOfLimit(current, rateLimit, async (course, key, callback) => {
      try {
        await asyncfn(course);
      } catch (e) {
        console.log(`Failed ${course.catalogCourseId} ${key}: ${e}`);
        failedCourses.push(course);
      } finally {
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
  const courses = (await getCourses()).filter(e => e.subject === 'CSC');

  console.log('Getting course details');
  await forEachHelper(courses, getCourseDetail, 35);

  console.log('Getting courses offering');
  await forEachHelper(courses, getOfferings, 25);

  // Stop timer and show cursor
  const finish = performance.now();

  console.log(`Getting course data took ${(finish - start) / 60000} minutes`);
  console.log(`${(finish - start) / courses.length} ms/course`);

  fs.writeFileSync('courses.json', JSON.stringify(courses));
};

main();
