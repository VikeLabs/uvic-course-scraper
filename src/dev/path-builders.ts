import fs from 'fs';
import { join, basename } from 'path';

import { glob } from 'glob';

import { CalendarLevel, KualiCourseItem } from '../types';

const courses: { [term: string]: KualiCourseItem[] } = {};

const relPath = (p: string) => join(__dirname, `../../${p}`);

export const getSchedulePathsByTerm = (term: string): string[][] => {
  const paths = glob.sync(relPath(`static/schedule/${term}/*/*.html`));
  return paths.map((p) => [basename(p).replace('_', ' ').replace('.html', ''), p]);
};

export const getSchedulePathsBySubject = (term: string, subject: string): string[][] => {
  const paths = glob.sync(relPath(`static/schedule/${term}/${subject}/*.html`));
  return paths.map((p) => [basename(p).replace('_', ' ').replace('.html', ''), p]);
};

export const getScheduleFileByCourse = async (term: string, subject: string, code: string): Promise<Buffer> => {
  return fs.promises.readFile(relPath(`static/schedule/${term}/${subject}/${subject}_${code}.html`));
};

export const getSectionFileByCRN = (term: string, crn: string): Promise<Buffer> => {
  return fs.promises.readFile(relPath(`static/sections/${term}/${crn}.html`));
};

export const getDetailPathsByTerm = (term: string): string[][] => {
  const paths = glob.sync(relPath(`static/sections/${term}/*.html`));
  return paths.map((p) => [basename(p).replace('_', ' ').replace('.html', ''), p]);
};

export const getCoursesByTerm = async (term: string, level: CalendarLevel): Promise<KualiCourseItem[]> => {
  if (!courses[term]) {
    const data = fs.readFileSync(relPath(`static/courses/courses-${level}-${term}.json`));
    courses[term] = JSON.parse(data.toString()) as KualiCourseItem[];
  }
  return courses[term];
};

export const getCourseDetailByPidSync = (term: string, pid: string, level: CalendarLevel): KualiCourseItem => {
  // to speed up successive uses by caching into global memory. hot jank
  const key = term + level;
  if (!courses[key]) {
    const data = fs.readFileSync(relPath(`static/courses/courses-${level}-${term}.json`));
    courses[key] = JSON.parse(data.toString()) as KualiCourseItem[];
  }

  const course = courses[key].find((c) => c.pid === pid);
  if (course === undefined) {
    throw new Error(`Unable to find course details for pid: ${pid}`);
  }
  return course;
};

export const getMapsAndBuildings = async (): Promise<Buffer> => {
  return fs.promises.readFile(relPath(`static/uvic.ca/maps-buildings.html`));
};
