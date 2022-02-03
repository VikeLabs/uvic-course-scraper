import fs from 'fs';
import { performance } from 'perf_hooks';

import got from 'got';

import { courseDetailUrl, coursesUrl } from '../common/urls';
import { getCatalogIdByTerm } from '../common/utils';
import { CalendarLevel, KualiCourseItem } from '../types';

import { mapLimitProgressBar } from './utils';

async function writeCoursesToFS(term: string, level: CalendarLevel, kualiCourseItem: KualiCourseItem[]) {
  await fs.promises.writeFile(`static/courses/courses-${level}-${term}.json`, JSON.stringify(kualiCourseItem));

  // gets the catalog course id for a given.
  const catalogId = getCatalogIdByTerm(term, level);
  const coursesMetadata = JSON.stringify({
    path: catalogId ? coursesUrl(catalogId) : null,
    courseDetailPath: catalogId ? courseDetailUrl(catalogId, '') : null,
    // TODO this may contain links that don't work. should remove them
    pids: kualiCourseItem.filter((c) => !!c?.pid).map((kualiCourseItem: KualiCourseItem) => kualiCourseItem.pid),
    datetime: Date.now(),
  });

  await fs.promises.writeFile(`static/courses/courses-${level}-${term}.metadata.json`, coursesMetadata);
}

/**
 * Downloads all courses. Saves this to courses.json and courses.metadata.json.
 */
export async function calendarDownloader(term: string, level: CalendarLevel): Promise<void> {
  // gets the catalog course id for a given.
  const catalogId = getCatalogIdByTerm(term, level);
  if (!catalogId) {
    console.error(`No catalog id found for term ${term} and level ${level}`);
    return;
  }

  // Start timer
  const start = performance.now();

  console.log('Downloading all courses for', level, term);
  const kualiCourseItems = await got(coursesUrl(catalogId)).json<KualiCourseItem[]>();

  console.log('Downloading details for each course');
  const kualiCourseItemsWithDetails = await mapLimitProgressBar(
    kualiCourseItems,
    async (item) => {
      return await got(courseDetailUrl(catalogId, item.pid)).json<KualiCourseItem>();
    },
    35
  );

  // Stop timer
  const finish = performance.now();

  console.log(`Getting course data took ${(finish - start) / 60000} minutes`);
  console.log(`${(finish - start) / kualiCourseItemsWithDetails.length} ms/course`);

  await writeCoursesToFS(term, level, kualiCourseItemsWithDetails);
}
