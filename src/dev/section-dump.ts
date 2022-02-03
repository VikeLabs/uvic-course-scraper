import fs from 'fs';

import cheerio from 'cheerio';
import got from 'got';

import { detailedClassInformationUrl } from '../common/urls';
import { classScheduleListingExtractor } from '../pages/courseListingEntries';

import { getSchedulePathsByTerm } from './path-builders';
import { forEachHelper } from './utils';

const writeCourseSectionsToFS = (term: string) => async (crn: string) => {
  const url = detailedClassInformationUrl(term, crn);
  const res = await got(url);
  if (res.body.search(/No classes were found that meet your search criteria/) === -1) {
    const destDir = `static/sections/${term}`;
    const destFilePath = `${destDir}/${crn}.html`;

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    await fs.promises.writeFile(destFilePath, res.rawBody);
  }
};

/**
 * Reads the course listing page and extracts the CRNs of the sections.
 * @param path
 * @returns
 */
const parseCRNsFromClassScheduleListing = async (path: string): Promise<string[]> => {
  const $ = cheerio.load(await fs.promises.readFile(path));
  const parsed = await classScheduleListingExtractor($);
  return parsed.map((section) => section.crn);
};

export const sectionsDownloader = async (term: string): Promise<void> => {
  console.log('Starting section dump for', term);
  const namePathPairs: string[][] = getSchedulePathsByTerm(term);
  console.log('Found', namePathPairs.length, 'schedules');
  const paths: string[] = namePathPairs.map((namePathPair) => namePathPair[1]);

  console.log('Converting schedule listings to CRNs');
  const crns = await Promise.all(paths.map(async (path) => await parseCRNsFromClassScheduleListing(path)));

  const writeSections = writeCourseSectionsToFS(term);

  console.log('Fetching and writing section data "Detailed Class Information" to disk.');
  await forEachHelper(crns.flat(), writeSections, 50);
};
