import got from 'got';
import { performance } from 'perf_hooks';
import fs from 'fs';
import { forEachHelper } from './common';
import { Course } from '../types';

const COURSES_URL = 'https://uvic.kuali.co/api/v1/catalog/courses/5d9ccc4eab7506001ae4c225';
const COURSE_DETAIL_URL = 'https://uvic.kuali.co/api/v1/catalog/course/5d9ccc4eab7506001ae4c225/';

/**
 * Downloads Course subject, code, pid for all courses
 *
 * @returns {Course[]} an array of all the courses
 */
const downloadCourses = async (): Promise<Course[]> => {
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

const main = async () => {
  // start timer
  const start = performance.now();

  console.log('Getting all course ids');
  // const courses = (await getCourses()).filter(e => e.subject === 'CSC');
  const courses = await downloadCourses();

  console.log('Getting course details');
  await forEachHelper(
    courses,
    async (course: Course) => {
      // ex: https://uvic.kuali.co/api/v1/catalog/course/5d9ccc4eab7506001ae4c225/r1xcyOamN
      Object.assign(course, await got(COURSE_DETAIL_URL + course.pid).json());
    },
    35
  );

  // Stop timer
  const finish = performance.now();

  console.log(`Getting course data took ${(finish - start) / 60000} minutes`);
  console.log(`${(finish - start) / courses.length} ms/course`);

  fs.writeFileSync('src/static/courses.json', JSON.stringify(courses));
  // write addtional metadata.
  fs.writeFileSync(
    'src/static/courses.metadata.json',
    JSON.stringify({
      path: COURSES_URL,
      courseDetailPath: COURSE_DETAIL_URL,
      // TODO this may contain links that don't work. should remove them
      pids: courses.map((course: Course) => course.pid),
      datetime: Date.now(),
    })
  );
};

main();
