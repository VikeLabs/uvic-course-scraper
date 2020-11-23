import fs from 'fs';
import path from 'path';
import appRoot from 'app-root-path';
import globby from 'globby';

const getFilePath = (term: string, crn: string) => {
  return path.join(appRoot.toString(), `static/schedule/${term}/sections/${crn}.html`);
};

export const getSectionsByTerm = (term: string) => {
  const pattern = path.join(appRoot.toString(), `static/schedule/${term}/sections/*.html`);
  const files = globby.sync(pattern);
  return files.map(p => [path.basename(p).replace('.html', ''), p]);
};

export const getSectionByTerm = async (term: string, crn: string) => {
  return fs.promises.readFile(getFilePath(term, crn));
};
