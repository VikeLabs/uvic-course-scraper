import fs from 'fs';
import { performance } from 'perf_hooks';
import { courseDetailUrl } from '../uvic.kuali.co/urls';
import { coursesUrl } from '../uvic.kuali.co/urls';
import { getCatalogIdForTerm } from '../common/term';
import { forEachHelper } from './async';
import { KualiCourseItem } from '../uvic.kuali.co';

const writeCoursesToFS = (term: string, kualiCourseItem: KualiCourseItem[]) => {
  fs.writeFileSync(`static/courses/courses-${term}.json`, JSON.stringify(kualiCourseItem));

  // gets the catalog course id for a given.
  const catalogId = getCatalogIdForTerm(term);
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
  const catalogId = getCatalogIdForTerm(term);
  const courseMapper = async (kualiCourseItem: KualiCourseItem) => {
    // rewrite using fetch
    const response = await fetch(courseDetailUrl(catalogId, kualiCourseItem.pid));
    const body = await response.json();
    Object.assign(kualiCourseItem, body);
  };

  // Start timer
  const start = performance.now();

  console.log('Downloading all courses');
  const response = await fetch(coursesUrl(catalogId));
  const kualiCourseItems = (await response.json()) as KualiCourseItem[];

  console.log('Downloading details for each course');
  await forEachHelper(kualiCourseItems, courseMapper, 35);

  // Stop timer
  const finish = performance.now();

  console.log(`Getting course data took ${(finish - start) / 60000} minutes`);
  console.log(`${(finish - start) / kualiCourseItems.length} ms/course`);

  writeCoursesToFS(term, kualiCourseItems);
};
