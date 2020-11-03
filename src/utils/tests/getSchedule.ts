import fs from 'fs';
import path from 'path';
import appRoot from 'app-root-path';
import globby from 'globby';

const getFilePath = (term: string, subject: string, code: string) => {
  return path.join(appRoot.toString(), `static/schedule/${term}/${subject}/${subject}_${code}.html`);
};

export const getScheduleBySubject = (term: string, subject: string) => {
  const pattern = path.join(appRoot.toString(), `static/schedule/${term}/${subject}/*.html`);
  return globby.sync(pattern);
};

export const getScheduleByTerm = (term: string) => {
  const pattern = path.join(appRoot.toString(), `static/schedule/${term}/*/*.html`);
  return globby.sync(pattern);
};

export const getSchedule = async (term: string, subject: string, code: string) => {
  return fs.promises.readFile(getFilePath(term, subject, code));
};
