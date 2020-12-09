import fs from 'fs';
import path from 'path';
import appRoot from 'app-root-path';
import { glob } from 'glob';

const getFilePath = (term: string, subject: string, code: string): string => {
  return path.join(appRoot.toString(), `static/schedule/${term}/${subject}/${subject}_${code}.html`);
};

export const getScheduleFilePathsBySubject = (term: string, subject: string): string[] => {
  return glob.sync(path.join(appRoot.toString(), `static/schedule/${term}/${subject}/*.html`));
};

export const getScheduleFilePathsByTerm = (term: string): string[] => {
  return glob.sync(path.join(appRoot.toString(), `static/schedule/${term}/*/*.html`));
};

export const getSchedule = async (term: string, subject: string, code: string) => {
  return fs.promises.readFile(getFilePath(term, subject, code));
};
