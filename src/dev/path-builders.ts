import fs from 'fs';
import path from 'path';

import appRoot from 'app-root-path';
import { glob } from 'glob';

export const getSchedulePathsByTerm = (term: string): string[][] => {
  const paths = glob.sync(path.join(appRoot.toString(), `static/schedule/${term}/*/*.html`));
  return paths.map(thisPath => [
    path
      .basename(thisPath)
      .replace('_', ' ')
      .replace('.html', ''),
    thisPath,
  ]);
};

export const getSchedulePathsBySubject = (term: string, subject: string): string[][] => {
  const paths = glob.sync(path.join(appRoot.toString(), `static/schedule/${term}/${subject}/*.html`));
  return paths.map(thisPath => [
    path
      .basename(thisPath)
      .replace('_', ' ')
      .replace('.html', ''),
    thisPath,
  ]);
};

export const getScheduleFileByCourse = async (term: string, subject: string, code: string) => {
  return fs.promises.readFile(
    path.join(appRoot.toString(), `static/schedule/${term}/${subject}/${subject}_${code}.html`)
  );
};

export const getSectionFileByCRN = (term: string, crn: string) => {
  return fs.promises.readFile(path.join(appRoot.toString(), `static/sections/${term}/${crn}.html`));
};

export const getDetailPathsByTerm = (term: string): string[][] => {
  const paths = glob.sync(path.join(appRoot.toString(), `static/sections/${term}/*.html`));
  return paths.map(thisPath => [
    path
      .basename(thisPath)
      .replace('_', ' ')
      .replace('.html', ''),
    thisPath,
  ]);
};
