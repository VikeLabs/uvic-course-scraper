import path from 'path';
import appRoot from 'app-root-path';
import fs from 'fs';

const getFilePath = (term: string, crn: string) => {
  return path.join(appRoot.toString(), `src/static/${term}_${crn}.html`);
};

export const getDetailedClassInfoByTerm = (term: string, crn: string) => {
  return fs.promises.readFile(getFilePath(term, crn));
};
