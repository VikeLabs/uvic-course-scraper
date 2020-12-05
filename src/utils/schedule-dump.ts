import got from 'got';
import * as fs from 'fs';
import { performance } from 'perf_hooks';
import courses from '../../static/courses/courses.json';
import { Course } from '../types';
import { forEachHelper } from './common';
import { classScheduleListingUrl } from '../lib/urls';

export const scheduleUtil = async (term: string) => {
  console.log('dump:schedule - starting...\n');
  const start = performance.now();

  const c = courses as Course[];

  await forEachHelper(
    c,
    async (course: Course) => {
      const url = classScheduleListingUrl(term, course.subject, course.code);
      const response = await got(url);
      if (
        response.body.search(
          /No classes were found that meet your search criteria/
        ) === -1
      ) {
        const dest = `static/schedule/${term}/${course.subject}`;
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        await fs.promises.writeFile(
          `${dest}/${course.subject}_${course.code}.html`,
          response.rawBody
        );
      }
    },
    10
  );

  const finish = performance.now();
  console.log(`Getting course data took ${(finish - start) / 60000} minutes`);
};
