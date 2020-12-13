import fs from 'fs';

import got from 'got';
import yargs from 'yargs/yargs';

import { detailedClassInformationUrl } from '../common/urls';

import { coursesUtil } from './course-dump';
import { scheduleUtil } from './schedule-dump';
import { sectionsUtil } from './section-dump';

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

const handleClass = async (term: string, crn: string) => {
  const response = await got(detailedClassInformationUrl(term, crn));
  await fs.promises.writeFile(`tmp/${term}_${crn}.html`, response.rawBody);
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
      await sectionsUtil(argv.term);
      break;
  }
};
main();
