import ProgressBar from 'progress';
import async from 'async';
import cheerio from 'cheerio';

import { Course } from '../types';
/**
 * This is a helper function to iterate through courses and apply a given function for each course.
 * This helper will retry failed function calls until the given function passes for all courses.
 *
 * @param courses courses to iterate through
 * @param asyncfn function to apply to each course
 * @param rateLimit limit the number of concurrently running functions
 */
export const forEachHelper = async (
  courses: Course[],
  asyncfn: (course: Course) => void,
  rateLimit: number
) => {
  let current: Course[] = courses;
  while (current.length > 0) {
    const bar = new ProgressBar(':bar :current/:total', {
      total: current.length,
    });
    const failedCourses: Course[] = [];
    await async.forEachOfLimit(
      current,
      rateLimit,
      async (course, key, callback) => {
        try {
          await asyncfn(course);
        } catch (e) {
          bar.interrupt(`Failed ${course.catalogCourseId} ${key}: ${e}`);
          failedCourses.push(course);
        } finally {
          bar.tick();
          callback();
          return;
        }
      }
    );

    if (failedCourses.length > 0) {
      console.log(
        `Failed to get data on ${failedCourses.length} courses, retring`
      );
    }
    current = failedCourses;
  }
  return;
};

export const assertPageTitle = (expectedPageTitle: string, $: cheerio.Root) => {
  const actualPageTitle: string = $('title')
    .first()
    .text();

  if (expectedPageTitle != actualPageTitle) {
    throw new Error(
      `wrong page type for parser\n\nExpected: ${expectedPageTitle}\nReceived: ${actualPageTitle}`
    );
  }
};
