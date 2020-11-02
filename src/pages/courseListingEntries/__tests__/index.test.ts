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
    expect(parsed[0].associatedTerm).toStrictEqual({ start: '202009', end: '202012' });
    expect(parsed[0].registrationDates).toStrictEqual({ start: 'Jun 22, 2020', end: 'Sep 25, 2020' });
    expect(parsed[0].campus).toBe('online');
    expect(parsed[0].instructionalMethod).toBe('online');
    expect(parsed[0].sectionType).toBe('lecture');
    expect(parsed[0].credits).toBe('1.500');
    expect(parsed[0].levels).toStrictEqual(['law', 'undergraduate']);
    expect(parsed[0].schedule[0].type).toBe('Every Week');
    expect(parsed[0].schedule[0].instructors).toStrictEqual(['Michael David Adams (P)']);
  });
});

describe('Class Schedule Listing Parser', () => {
  it('parses CHEM101 correctly', async () => {
    const $ = cheerio.load(fs.readFileSync(getFilePath('201909', 'CHEM101')));
    const parsed = await classScheduleListingExtractor($);

    expect(parsed[0].title).toBe('Fundamentals of Chemistry from Atoms to Materials');
    expect(parsed[0].crn).toBe('10435');
    expect(parsed[0].associatedTerm).toStrictEqual({ start: '201909', end: '201912' });
    expect(parsed[0].registrationDates).toStrictEqual({ start: 'Jun 17, 2019', end: 'Sep 20, 2019' });
    expect(parsed[0].campus).toBe('in-person');
    expect(parsed[0].instructionalMethod).toBe('in-person');
    expect(parsed[0].sectionType).toBe('lecture');
    expect(parsed[0].credits).toBe('1.500');
    expect(parsed[0].levels).toStrictEqual(['law', 'undergraduate']);
    expect(parsed[0].schedule[0].type).toBe('Every Week');
    expect(parsed[0].schedule[0].instructors).toStrictEqual(['Neil   Burford (P)', 'Cornelia   Bohne' , 'Genevieve Nicole  Boice' , 'J. Scott   McIndoe']);
  });
});
