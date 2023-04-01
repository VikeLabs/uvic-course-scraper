import fs from 'fs';

import axios from 'axios';
import  { load } from 'cheerio';

import { detailedClassInformationUrl } from '../common/urls';
import { classScheduleListingExtractor } from '../pages/courseListingEntries';

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
    const res = await axios.get(url);
    if (res.data.search(/No classes were found that meet your search criteria/) === -1) {
      const destDir = `static/sections/${term}`;
      const destFilePath = `${destDir}/${crn}.html`;

      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      await fs.promises.writeFile(destFilePath, res.data);
    }
  };

  await Promise.all(paths.map(async (path) => await parseCRNsFromClassScheduleListing(path)));

  await forEachHelper(CRNs, writeCourseSectionsToFS, 50);
};
