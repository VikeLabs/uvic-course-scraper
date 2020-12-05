import yargs from 'yargs/yargs';
import { coursesUtil } from './kuali-dump';
import { scheduleUtil } from './schedule-dump';
import { detailedClassInformationUrl } from '../lib/urls';
import got from 'got';
import fs from 'fs';
import { getScheduleByTerm } from './tests/getSchedule';
import { classScheduleListingExtractor } from '../pages/courseListingEntries';
import ProgressBar from 'progress';
import async from 'async';
import * as cheerio from 'cheerio';

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

const handleSections = async (term: string) => {
  // get the name, path of all schedule files
  const schedules = getScheduleByTerm(term);
  // parse out the crns found for each course for a given term.

  const crns: string[] = [];

  await Promise.all(
    schedules.map(async schedule => {
      const $ = cheerio.load(await fs.promises.readFile(schedule[1]));
      const parsed = await classScheduleListingExtractor($);
      // extract just the CRN values for the given course schedule.
      crns.push(...parsed.map(section => section.crn));
      return schedule;
    })
  );

  const rate = 50;

  let queue: string[] = crns;
  while (queue.length > 0) {
    const bar = new ProgressBar(':bar :current/:total', {
      total: queue.length,
    });
    const failed: string[] = [];
    await async.forEachOfLimit(queue, rate, async (crn, key, callback) => {
      try {
        const url = detailedClassInformationUrl(term, crn);
        const response = await got(url);
        if (
          response.body.search(
            /No classes were found that meet your search criteria/
          ) === -1
        ) {
          const dest = `static/sections/${term}`;
          if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
          }
          await fs.promises.writeFile(`${dest}/${crn}.html`, response.rawBody);
        }
      } catch (e) {
        bar.interrupt(`Failed ${crn} ${key}: ${e}`);
        failed.push(crn);
      } finally {
        bar.tick();
        callback();
        return;
      }
    });

    if (failed.length > 0) {
      console.log(`Failed to get data on ${failed.length} sections, retring`);
    }
    queue = failed;
  }
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
