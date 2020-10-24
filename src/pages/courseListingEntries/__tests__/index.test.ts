import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { classScheduleListingExtractor } from '../index';
import appRoot from 'app-root-path';

const getFilePath = (term: string, course: string) => {
  return path.join(appRoot.toString(), `src/static/${course}_${term}.html`);
};

describe('Class Schedule Listing Parser', () => {
  it('parses ECE260 correctly', async () => {
    const $ = cheerio.load(fs.readFileSync(getFilePath('202009', 'ECE260')));
    const parsed = await classScheduleListingExtractor($);

    expect(parsed[0].title).toBe('Continuous-Time Signals and Systems');
    expect(parsed[0].crn).toBe('10953');
    expect(parsed[0].associatedTerm).toBe({ start: '202009', end: '202012' });
    expect(parsed[0].registrationDates).toBe({ start: 'Jun 22, 2020', end: 'Sep 25, 2020' });
    expect(parsed[0].campus).toBe('online');
    expect(parsed[0].instructionalMethod).toBe('online');
    expect(parsed[0].sectionType).toBe('lecture');
    expect(parsed[0].credits).toBe('1.5');
    expect(parsed[0].levels).toBe(['law', 'undergraduate']);
    expect(parsed[0].schedule[0].type).toBe('weekly');
    expect(parsed[0].schedule[0].instructors).toBe(['Michael David Adams']);
  });
});
