import * as fs from 'fs';

import * as cheerio from 'cheerio';
import each from 'jest-each';

import {
  getScheduleFileByCourse,
  getSchedulePathsBySubject,
  getSchedulePathsByTerm,
  getSectionFileByCRN,
} from '../../../dev/path-builders';
import { classScheduleListingExtractor } from '../index';

describe('Class Schedule Listing Parser', () => {
  it('should throw error when wrong page type is given', async () => {
    const $ = cheerio.load(await getSectionFileByCRN('202009', '10953'));

    await expect(async () => await classScheduleListingExtractor($)).rejects.toThrowError('wrong page type for parser');
  });

  it('parses ECE260 correctly', async () => {
    const f = await getScheduleFileByCourse('202009', 'ECE', '260');
    const $ = cheerio.load(f);
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
    expect(parsed[0].schedule[0].instructors).toStrictEqual(['Michael David  Adams (P)']);
  });
});

describe('Class Schedule Listing Parser', () => {
  it('parses CHEM101 correctly', async () => {
    const f = await getScheduleFileByCourse('202009', 'CHEM', '101');
    const $ = cheerio.load(f);
    const parsed = await classScheduleListingExtractor($);

    expect(parsed[0].title).toBe('Fundamentals of Chemistry from Atoms to Materials');
    expect(parsed[0].crn).toBe('10487');
    expect(parsed[0].associatedTerm).toStrictEqual({ start: '202009', end: '202012' });
    expect(parsed[0].registrationDates).toStrictEqual({ start: 'Jun 22, 2020', end: 'Sep 25, 2020' });
    expect(parsed[0].campus).toBe('online');
    expect(parsed[0].instructionalMethod).toBe('online');
    expect(parsed[0].sectionType).toBe('lecture');
    expect(parsed[0].credits).toBe('1.500');
    expect(parsed[0].levels).toStrictEqual(['law', 'undergraduate']);
    expect(parsed[0].schedule[0].type).toBe('Every Week');
    expect(parsed[0].schedule[0].instructors).toStrictEqual([
      'Genevieve Nicole  Boice (P)',
      'Neil   Burford',
      'J. Scott   McIndoe',
      'Harmen   Zijlstra',
    ]);
  });
});

const assertFields = async (path: string) => {
  const $ = cheerio.load(await fs.promises.readFile(path));
  const parsed = await classScheduleListingExtractor($);

  parsed.forEach(e => {
    expect(e.crn).toMatch(/\d{5}/);
    expect(e.sectionCode).toMatch(/[A|B|T]\d+/);
    expect(e.credits).toMatch(/\d\.\d{3}/);
  });
};

describe('Class Schedule Listing Parser (CRN) CSC', () => {
  const namePathPairs = [...getSchedulePathsBySubject('202009', 'CSC'), ...getSchedulePathsBySubject('202101', 'CSC')];

  each(namePathPairs).it('%s has the expected title ', async (name: string, path: string) => {
    await assertFields(path);
  });
});

describe('Class Schedule Listing Parser All', () => {
  describe('202001 term', () => {
    const namePathPairs: string[][] = getSchedulePathsByTerm('202009');

    each(namePathPairs).it('%s parses correctly', async (name: string, path: string) => {
      await assertFields(path);
    });
  });
});

describe('202101 term', () => {
  const namePathPairs: string[][] = getSchedulePathsByTerm('202101');

  each(namePathPairs).it('%s parses correctly', async (name: string, path: string) => {
    await assertFields(path);
  });
});
