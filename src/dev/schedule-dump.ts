import * as fs from 'fs';
import { performance } from 'perf_hooks';

import got from 'got';

import coursesJSON from '../../static/courses/courses.json';
import { classScheduleListingUrl } from '../common/urls';
import { ParsedKualiCourse } from '../ParsedKualiCourse';

import { forEachHelper } from './utils';

export const scheduleUtil = async (term: string) => {
  const writeCourseScheduleToFS = async (parsedKualiCourse: ParsedKualiCourse) => {
    const subject = parsedKualiCourse.subjectCode.name;
    const code = parsedKualiCourse.__catalogCourseId.slice(subject.length);

    const url = classScheduleListingUrl(term, subject, code);
    const res = await got(url);
    if (res.body.search(/No classes were found that meet your search criteria/) === -1) {
      const destDir = `static/schedule/${term}/${subject}`;
      const destFilePath = `${destDir}/${subject}_${code}.html`;

      // Not all courses in courses.json are found in the class schedule listing as courses.json
      // is retrieved from the Kuali API and course schedule listing from BAN1P.
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      await fs.promises.writeFile(destFilePath, res.rawBody);
    }
  };

  console.log('Starting schedule dump\n');
  const start = performance.now();

  const parsedKualiCourses = coursesJSON as ParsedKualiCourse[];
  await forEachHelper(parsedKualiCourses, writeCourseScheduleToFS, 10);

  const finish = performance.now();
  console.log(`Getting course data took ${(finish - start) / 60000} minutes`);
};
