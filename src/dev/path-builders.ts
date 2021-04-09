import fs from 'fs';
import path from 'path';

import appRoot from 'app-root-path';
import { glob } from 'glob';

import { KualiCourseItem } from '../types';

const courses: { [term: string]: KualiCourseItem[] } = {};

export const getSchedulePathsByTerm = (term: string): string[][] => {
  const paths = glob.sync(path.join(appRoot.toString(), `static/schedule/${term}/*/*.html`));
  return paths.map((thisPath) => [path.basename(thisPath).replace('_', ' ').replace('.html', ''), thisPath]);
};

export const getSchedulePathsBySubject = (term: string, subject: string): string[][] => {
  const paths = glob.sync(path.join(appRoot.toString(), `static/schedule/${term}/${subject}/*.html`));
  return paths.map((thisPath) => [path.basename(thisPath).replace('_', ' ').replace('.html', ''), thisPath]);
};

export const getScheduleFileByCourse = async (term: string, subject: string, code: string): Promise<Buffer> => {
  return fs.promises.readFile(
    path.join(appRoot.toString(), `static/schedule/${term}/${subject}/${subject}_${code}.html`)
  );
};

export const getSectionFileByCRN = (term: string, crn: string): Promise<Buffer> => {
  return fs.promises.readFile(path.join(appRoot.toString(), `static/sections/${term}/${crn}.html`));
};

export const getDetailPathsByTerm = (term: string): string[][] => {
  const paths = glob.sync(path.join(appRoot.toString(), `static/sections/${term}/*.html`));
  return paths.map((thisPath) => [path.basename(thisPath).replace('_', ' ').replace('.html', ''), thisPath]);
};

export const getCourseDetailByPidSync = (term: string, pid: string): KualiCourseItem | undefined => {
  // to speed up successive uses by caching into global memory. hot jank
  if (!courses[term]) {
    const data = fs.readFileSync(path.join(appRoot.toString(), `static/courses/courses-${term}.json`));
    courses[term] = JSON.parse(data.toString()) as KualiCourseItem[];
  }
  return courses[term].find((c) => c.pid === pid);
};
