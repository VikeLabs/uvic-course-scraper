import yargs from 'yargs/yargs';
import got from 'got';
import fs from 'fs';
import ProgressBar from 'progress';
import async from 'async';
import * as cheerio from 'cheerio';

import { getScheduleFilePathsByTerm } from './tests/getSchedule';
import { classScheduleListingExtractor } from '../pages/courseListingEntries';
import { coursesUtil } from './kuali-dump';
import { scheduleUtil } from './schedule-dump';
import { detailedClassInformationUrl } from '../lib/urls';

// TODO: don't need term for courses
const argv = yargs(process.argv.slice(2)).options({
  term: { type: 'string', demandOption: true, description: 'term eg. 202009' },
  type: {
    alias: 't',
    choices: ['courses', 'schedules', 'class', 'sections'] as const,
    demandOption: true,
    description: 'dump target type',
  },
  update: { type: 'boolean', default: false, alias: 'u' },
  crn: {
    alias: 'c',
    type: 'string',
  },
}).argv;

export const forEachHelper = async (crns: string[], asyncfn: (crn: string) => void, rateLimit: number) => {
  const bar = new ProgressBar(':bar :current/:total', { total: crns.length });
  await async.forEachOfLimit(crns, rateLimit, async (crn, key, callback) => {
    try {
      await asyncfn(crn);
    } catch (error) {
      console.error(error);
      bar.interrupt(`failed on course crn: ${crn} at iteration ${key}\n`);
    } finally {
      bar.tick();
      callback();
      return;
    }
  });
};


const handleClass = async (term: string, crn: string) => {
  const response = await got(detailedClassInformationUrl(term, crn));
  await fs.promises.writeFile(`tmp/${term}_${crn}.html`, response.rawBody);
};

// TODO: Add sections to readme
const handleSections = async (term: string) => {
  const parseCRNsFromClassScheduleListing = async (path: string): Promise<void> => {
    const $ = cheerio.load(await fs.promises.readFile(path));
    const parsed = await classScheduleListingExtractor($); // TODO: this coupling isn't great
    CRNs.push(...parsed.map(section => section.crn));
  }

  const writeCourseSectionsToFS = async (crn: string) => {
    const url = detailedClassInformationUrl(term, crn);
    const res = await got(url);
    if (res.body.search(/No classes were found that meet your search criteria/) === -1) {
      const destDir = `static/sections/${term}`;
      const destFilePath = `${destDir}/${crn}.html`;

      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, {recursive: true});
      }
      await fs.promises.writeFile(destFilePath, res.rawBody);
    }
  }

  const paths: string[] = getScheduleFilePathsByTerm(term); // TODO: change where these urls are made...

  const CRNs: string[] = [];
  await Promise.all(paths.map(async path => await parseCRNsFromClassScheduleListing(path)));

  await forEachHelper(CRNs, writeCourseSectionsToFS, 50);
};

const main = async () => {
  switch (argv.type) {
    case 'courses':
      await coursesUtil();
      break;
    case 'schedules':
      await scheduleUtil(argv.term);
      break;
    case 'class':
      if (!argv.crn) {
        console.error('require CRN flag for class ');
        return;
      }
      await handleClass(argv.term, argv.crn);
      break;
    case 'sections':
      await handleSections(argv.term);
      break;
  }
};
main();
