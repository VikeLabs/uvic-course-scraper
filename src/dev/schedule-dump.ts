import * as fs from 'fs';
import { performance } from 'perf_hooks';

import got from 'got';

import { classScheduleListingUrl } from '../common/urls';
import { CalendarLevel, KualiCourseItem } from '../types';

import { forEachHelper } from './utils';

const writeCourseScheduleToFS = (term: string) => async (kualiCourseItem: KualiCourseItem) => {
  const subject = kualiCourseItem.subjectCode.name;
  const code = kualiCourseItem.__catalogCourseId.slice(subject.length);

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

export const schedulesDownloader = async (term: string, level: CalendarLevel): Promise<void> => {
  console.log('Starting schedule dump');
  console.log(`Dumping ${level} schedule`);
  try {
    const start = performance.now();
    const kualiCourseItems = JSON.parse(
      await fs.promises.readFile(`static/courses/courses-${level}-${term}.json`, 'utf-8')
    ) as KualiCourseItem[];
    const writeCourses = writeCourseScheduleToFS(term);
    await forEachHelper(kualiCourseItems, writeCourses, 10);

    const finish = performance.now();
    console.log(`Getting course data took ${(finish - start) / 60000} minutes`);
  } catch (err) {
    console.error(err);
  }
};
