import fs from 'fs';
import path from 'path';

import nock from 'nock';

import { CalendarLevel } from '..';

import { getCatalogIdByTerm } from './utils';

export function nockCourseCatalog(term: string, level: CalendarLevel): void {
  const courses = fs.readFileSync(path.join(__dirname, `../../static/courses/courses-${level}-${term}.json`), 'utf8');
  nock('https://uvic.kuali.co')
    .get(`/api/v1/catalog/courses/${getCatalogIdByTerm(term, level)}`)
    .reply(200, courses);
}
