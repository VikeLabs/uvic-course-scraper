import fs from 'fs';
import { performance } from 'perf_hooks';

import got from 'got';

import { KualiCourseItem } from '../types';

import { forEachHelper } from './utils';

const COURSES_URL = 'https://uvic.kuali.co/api/v1/catalog/courses/5d9ccc4eab7506001ae4c225';
const COURSE_DETAIL_URL = 'https://uvic.kuali.co/api/v1/catalog/course/5d9ccc4eab7506001ae4c225/';

const writeCoursesToFS = (kualiCourseItem: KualiCourseItem[]) => {
  fs.writeFileSync('static/courses/courses.json', JSON.stringify(kualiCourseItem));

  const coursesMetadata = JSON.stringify({
    path: COURSES_URL,
    courseDetailPath: COURSE_DETAIL_URL,
    // TODO this may contain links that don't work. should remove them
    pids: kualiCourseItem.map((kualiCourseItem: KualiCourseItem) => kualiCourseItem.pid),
    datetime: Date.now(),
  });

  fs.writeFileSync('static/courses/courses.metadata.json', coursesMetadata);
};

/**
 * Downloads all courses. Saves this to courses.json and courses.metadata.json.
 */
export const coursesUtil = async (): Promise<void> => {
  const courseMapper = async (kualiCourseItem: KualiCourseItem) => {
    // ex: https://uvic.kuali.co/api/v1/catalog/course/5d9ccc4eab7506001ae4c225/r1xcyOamN
    Object.assign(kualiCourseItem, await got(COURSE_DETAIL_URL + kualiCourseItem.pid).json());
  };

  // Start timer
  const start = performance.now();

  console.log('Downloading all courses');
  const kualiCourseItems: KualiCourseItem[] = await got(COURSES_URL).json();

  console.log('Downloading details for each course');
  await forEachHelper(kualiCourseItems, courseMapper, 35);

  // Stop timer
  const finish = performance.now();

  console.log(`Getting course data took ${(finish - start) / 60000} minutes`);
  console.log(`${(finish - start) / kualiCourseItems.length} ms/course`);

  writeCoursesToFS(kualiCourseItems);
};
