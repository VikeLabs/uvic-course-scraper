import fs from 'fs';
import { performance } from 'perf_hooks';

import got from 'got';

import { CourseJSON } from '../types';

import { forEachHelper } from './utils';

const COURSES_URL = 'https://uvic.kuali.co/api/v1/catalog/courses/5d9ccc4eab7506001ae4c225';
const COURSE_DETAIL_URL = 'https://uvic.kuali.co/api/v1/catalog/course/5d9ccc4eab7506001ae4c225/';

const writeCoursesToFS = (courses: CourseJSON[]) => {
  fs.writeFileSync('static/courses/courses.json', JSON.stringify(courses));

  const coursesMetadata = JSON.stringify({
    path: COURSES_URL,
    courseDetailPath: COURSE_DETAIL_URL,
    // TODO this may contain links that don't work. should remove them
    pids: courses.map((course: CourseJSON) => course.pid),
    datetime: Date.now(),
  });

  fs.writeFileSync('static/courses/courses.metadata.json', coursesMetadata);
};

/**
 * Downloads all courses. Saves this to courses.json and courses.metadata.json.
 */
export const coursesUtil = async () => {
  const courseMapper = async (jsonCourses: CourseJSON) => {
    // ex: https://uvic.kuali.co/api/v1/catalog/course/5d9ccc4eab7506001ae4c225/r1xcyOamN
    Object.assign(jsonCourses, await got(COURSE_DETAIL_URL + jsonCourses.pid).json());
  };

  // Start timer
  const start = performance.now();

  console.log('Downloading all courses');
  const jsonCourses: CourseJSON[] = await got(COURSES_URL).json();

  for (const jsonCourse of jsonCourses) {
    if (!jsonCourse['__catalogCourseId'] || !jsonCourse['pid']) {
      console.error("course did not contain '__catalogCourseId' or 'pid' field: " + JSON.stringify(jsonCourse));
      continue;
    }

    // Must explicitly set these fields
    jsonCourse.catalogCourseId = jsonCourse.__catalogCourseId;
    jsonCourse.subject = jsonCourse.subjectCode.name;
    jsonCourse.code = jsonCourse.__catalogCourseId.slice(jsonCourse.subject.length);
  }

  console.log('Downloading details for each course');
  await forEachHelper(jsonCourses, courseMapper, 35);

  // Stop timer
  const finish = performance.now();

  console.log(`Getting course data took ${(finish - start) / 60000} minutes`);
  console.log(`${(finish - start) / jsonCourses.length} ms/course`);

  writeCoursesToFS(jsonCourses);
};
