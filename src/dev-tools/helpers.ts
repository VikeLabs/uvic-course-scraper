import ProgressBar from 'progress';
import async from 'async';

import { Course } from '../types';

/**
 * This is a helper function to iterate through courses and apply a given function for each course.
 * This helper will retry failed function calls until the given function passes for all courses.
 *
 * @param courses courses to iterate through
 * @param asyncfn function to apply to each course
 * @param rateLimit limit the number of concurrently running functions
 */
export const forEachCourseHelper = async (courses: Course[], asyncfn: (course: Course) => void, rateLimit: number) => {
  const bar = new ProgressBar(':bar :current/:total', { total: courses.length });
  await async.forEachOfLimit(courses, rateLimit, async (course, key, callback) => {
    try {
      await asyncfn(course);
    } catch (error) {
      console.error(error);
      bar.interrupt(`failed on course pid: ${course.pid} at iteration ${key}\n`);
    } finally {
      bar.tick();
      callback();
      return;
    }
  });
};

export const forEachCRNHelper = async (crns: string[], asyncfn: (crn: string) => void, rateLimit: number) => {
  const bar = new ProgressBar(':bar :current/:total', { total: crns.length });
  await async.forEachOfLimit(crns, rateLimit, async (crn, key, callback) => {
    try {
      await asyncfn(crn);
    } catch (error) {
      console.error(error);
      bar.interrupt(`failed on course crn: ${crn} at iteration ${key}\n`);
    } finally {
      bar.tick();
      callback();
      return;
    }
  });
};
