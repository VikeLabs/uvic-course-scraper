import fs from 'fs';

import got from 'got';
import yargs from 'yargs/yargs';

import { detailedClassInformationUrl } from '../common/urls';
import { CalendarLevel } from '../types';

import { calendarDownloader } from './course-dump';
import { schedulesDownloader } from './schedule-dump';
import { sectionsDownloader } from './section-dump';

const { argv } = yargs(process.argv.slice(2)).options({
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
  level: {
    alias: 'l',
    choices: ['undergraduate', 'graduate'],
  },
});

const handleClass = async (term: string, crn: string) => {
  const response = await got(detailedClassInformationUrl(term, crn));
  await fs.promises.writeFile(`tmp/${term}_${crn}.html`, response.rawBody);
};

const main = async () => {
  const args = await argv;

  switch (args.type) {
    case 'courses':
      if (!args.level) {
        console.error('require level flag for class ');
        return;
      }
      return await calendarDownloader(args.term, args.level as CalendarLevel);
    case 'schedules':
      if (!args.level) {
        console.error('require level flag for class ');
        return;
      }
      return await schedulesDownloader(args.term, args.level as CalendarLevel);
      break;
    case 'class':
      if (!args.crn) {
        console.error('require CRN flag for class ');
        return;
      }
      return await handleClass(args.term, args.crn);

    case 'sections':
      if (!args.level) {
        console.error('require level flag for sections');
        return;
      }
      return await sectionsDownloader(args.term);
  }
};

main();
