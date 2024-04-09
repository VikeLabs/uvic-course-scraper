import fs from 'fs';

import cheerio, { load } from 'cheerio';

import { detailedClassInformationUrl } from '../common/urls';
import { classScheduleListingExtractor } from '../uvic.ca/BAN1P/courseListingEntries';

import { getSchedulePathsByTerm } from './path-builders';
import { forEachHelper } from './utils';

export const sectionsUtil = async (term: string) => {
  const CRNs: string[] = [];
  const namePathPairs: string[][] = getSchedulePathsByTerm(term);
  const paths: string[] = namePathPairs.map((namePathPair) => namePathPair[1]);

  const parseCRNsFromClassScheduleListing = async (path: string): Promise<void> => {
    const $ = load(await fs.promises.readFile(path));
    const parsed = await classScheduleListingExtractor($);
    CRNs.push(...parsed.map((section) => section.crn));
  };

  const writeCourseSectionsToFS = async (crn: string) => {
    const url = detailedClassInformationUrl(term, crn);
    const res = await fetch(url);
    const body = await res.text();
    if (body.search(/No classes were found that meet your search criteria/) === -1) {
      const destDir = `static/sections/${term}`;
      const destFilePath = `${destDir}/${crn}.html`;

      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      await fs.promises.writeFile(destFilePath, body);
    }
  };

  await Promise.all(paths.map(async (path) => await parseCRNsFromClassScheduleListing(path)));

  await forEachHelper(CRNs, writeCourseSectionsToFS, 50);
};
