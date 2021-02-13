import fs from 'fs';

import got from 'got';

import kualiUrls from '../../static/courses/kualiUrls.json';
import { getCurrentTerm } from '../utils';

const COURSE_SEARCH_URL = 'https://www.uvic.ca/calendar/undergrad/index.php#/courses';

const getKualiUrl = async (): Promise<string> => {
  const { body } = await got(COURSE_SEARCH_URL);
  const kualiIdRegex = /window.catalogId='(.*)'/i;
  if (kualiIdRegex.test(body)) {
    const slug = kualiIdRegex.exec(body)![1];
    return `https://uvic.kuali.co/api/v1/catalog/courses/${slug}/`;
  }
  return 'not found';
};

export const putNewKualiUrl = async (): Promise<void> => {
  const newKuali = await getKualiUrl();
  const term = getCurrentTerm();
  const newJson: any = { ...kualiUrls };
  newJson[term] = newKuali;
  fs.writeFileSync('static/courses/kualiUrls.json', JSON.stringify(newJson));
};
