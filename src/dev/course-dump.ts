import fs from 'fs';
import { performance } from 'perf_hooks';

import got from 'got';

import { courseDetailUrl, coursesUrl } from '../common/urls';
import { KualiCourseItem } from '../types';
import { getCatalogForTerm } from '../utils';

import { forEachHelper } from './utils';

const writeCoursesToFS = (term: string, kualiCourseItem: KualiCourseItem[]) => {
  fs.writeFileSync(`static/courses/courses-${term}.json`, JSON.stringify(kualiCourseItem));

  // gets the catalog course id for a given.
  const catalogId = getCatalogForTerm(term);
  const coursesMetadata = JSON.stringify({
    path: coursesUrl(catalogId),
    courseDetailPath: courseDetailUrl(catalogId, ''),
    // TODO this may contain links that don't work. should remove them
    pids: kualiCourseItem.map((kualiCourseItem: KualiCourseItem) => kualiCourseItem.pid),
    datetime: Date.now(),
  });

  fs.writeFileSync(`static/courses/courses-${term}.metadata.json`, coursesMetadata);
};

/**
 * Downloads all courses. Saves this to courses.json and courses.metadata.json.
 */
export const coursesUtil = async (term: string): Promise<void> => {
  // gets the catalog course id for a given.
  const catalogId = getCatalogForTerm(term);
  const courseMapper = async (kualiCourseItem: KualiCourseItem) => {
    Object.assign(kualiCourseItem, await got(courseDetailUrl(catalogId, kualiCourseItem.pid)).json());
  };

  // Start timer
  const start = performance.now();

  console.log('Downloading all courses');
  const kualiCourseItems: KualiCourseItem[] = await got(coursesUrl(catalogId)).json();

  console.log('Downloading details for each course');
  await forEachHelper(kualiCourseItems, courseMapper, 35);

  // Stop timer
  const finish = performance.now();

  console.log(`Getting course data took ${(finish - start) / 60000} minutes`);
  console.log(`${(finish - start) / kualiCourseItems.length} ms/course`);

  writeCoursesToFS(term, kualiCourseItems);
};
