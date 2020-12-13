import fs from 'fs';
import { performance } from 'perf_hooks';

import got from 'got';

import { Course } from '../types';

import { forEachHelper } from './utils';

const COURSES_URL = 'https://uvic.kuali.co/api/v1/catalog/courses/5d9ccc4eab7506001ae4c225';
const COURSE_DETAIL_URL = 'https://uvic.kuali.co/api/v1/catalog/course/5d9ccc4eab7506001ae4c225/';

const writeCoursesToFS = (courses: Course[]) => {
  fs.writeFileSync('static/courses/courses.json', JSON.stringify(courses));

  const coursesMetadata = JSON.stringify({
    path: COURSES_URL,
    courseDetailPath: COURSE_DETAIL_URL,
    // TODO this may contain links that don't work. should remove them
    pids: courses.map((course: Course) => course.pid),
    datetime: Date.now(),
  });

  fs.writeFileSync('static/courses/courses.metadata.json', coursesMetadata);
};

/**
 * Downloads all courses. Saves this to courses.json and courses.metadata.json.
 */
export const coursesUtil = async () => {
  const courseMapper = async (course: Course) => {
    // ex: https://uvic.kuali.co/api/v1/catalog/course/5d9ccc4eab7506001ae4c225/r1xcyOamN
    Object.assign(course, await got(COURSE_DETAIL_URL + course.pid).json());
  };

  // Start timer
  const start = performance.now();

  console.log('Downloading all courses');
  const courses: Course[] = await got(COURSES_URL).json();

  // Must explicitly set these fields
  for (const course of courses) {
    course.subject = course.subjectCode.name;
    course.catalogCourseId = course.__catalogCourseId;
    course.code = course.__catalogCourseId.slice(course.subject.length);
  }

  console.log('Downloading details for each course');
  await forEachHelper(courses, courseMapper, 35);

  // Stop timer
  const finish = performance.now();

  console.log(`Getting course data took ${(finish - start) / 60000} minutes`);
  console.log(`${(finish - start) / courses.length} ms/course`);

  writeCoursesToFS(courses);
};
