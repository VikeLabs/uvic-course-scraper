import * as fs from 'fs';
import { performance } from 'perf_hooks';
import { classScheduleListingUrl } from '../uvic.ca/BAN1P/urls';
import { forEachHelper } from './async';
import { KualiCourseItem } from '../uvic.kuali.co';

export const scheduleUtil = async (term: string): Promise<void> => {
  const writeCourseScheduleToFS = async (kualiCourseItem: KualiCourseItem) => {
    const subject = kualiCourseItem.subjectCode.name;
    const code = kualiCourseItem.__catalogCourseId.slice(subject.length);

    const url = classScheduleListingUrl(term, subject, code);
    const res = await fetch(url);
    const body = await res.text();
    if (body.search(/No classes were found that meet your search criteria/) === -1) {
      const destDir = `static/schedule/${term}/${subject}`;
      const destFilePath = `${destDir}/${subject}_${code}.html`;

      // Not all courses in courses.json are found in the class schedule listing as courses.json
      // is retrieved from the Kuali API and course schedule listing from BAN1P.
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      await fs.promises.writeFile(destFilePath, body);
    }
  };

  console.log('Starting schedule dump\n');
  const start = performance.now();

  const kualiCourseItems = JSON.parse(
    fs.readFileSync(`static/courses/courses-${term}.json`, 'utf-8')
  ) as KualiCourseItem[];

  await forEachHelper(kualiCourseItems, writeCourseScheduleToFS, 10);

  const finish = performance.now();
  console.log(`Getting course data took ${(finish - start) / 60000} minutes`);
};
