import cheerio from 'cheerio';
import fs from 'fs';
import { classScheduleListingExtractor } from '../pages/courseListingEntries';
import { detailedClassInformationUrl } from './urls';
import got from 'got';
import { getScheduleFilePathsByTerm } from '../common/pathBuilders';
import { forEachCRNHelper } from './helpers';

export const sectionsUtil = async (term: string) => {
  const CRNs: string[] = [];
  const paths: string[] = getScheduleFilePathsByTerm(term);

  const parseCRNsFromClassScheduleListing = async (path: string): Promise<void> => {
    const $ = cheerio.load(await fs.promises.readFile(path));
    const parsed = await classScheduleListingExtractor($);
    CRNs.push(...parsed.map(section => section.crn));
  };

  const writeCourseSectionsToFS = async (crn: string) => {
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

  await Promise.all(paths.map(async path => await parseCRNsFromClassScheduleListing(path)));

  await forEachCRNHelper(CRNs, writeCourseSectionsToFS, 50);
};
