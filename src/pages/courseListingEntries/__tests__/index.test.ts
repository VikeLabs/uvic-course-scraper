import * as cheerio from 'cheerio';
import * as fs from 'fs';
import each from 'jest-each';

import { classScheduleListingExtractor } from '../index';
import { getSchedule, getScheduleFilePathsBySubject, getScheduleFilePathsByTerm } from '../../../utils/tests/getSchedule';
import { getDetailedClassInfoByTerm } from "../../../utils/tests/getDetailedClassInfo";

describe('Class Schedule Listing Parser', () => {
  it('should throw error when wrong page type is given', async () => {
    const $ = cheerio.load(await getDetailedClassInfoByTerm('202009', '10953'));

    await expect(async () => await classScheduleListingExtractor($)).rejects.toThrowError('wrong page type for parser');
  });

  it('parses ECE260 correctly', async () => {
    const f = await getSchedule('202009', 'ECE', '260');
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
    const f = await getSchedule('202009', 'CHEM', '101');
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

describe('Class Schedule Listing Parser (CRN) CSC', () => {
  const paths = [...getScheduleFilePathsBySubject('202009', 'CSC'), ...getScheduleFilePathsBySubject('202101', 'CSC')];

  // load the HTML file from the file system, in this case
  each(paths).it('%s has the expected title ', async (path: string) => {
    //   pass the HTML file to cheerio to interact with the DOM
    const $ = cheerio.load(await fs.promises.readFile(path));
    // expect all BAN1P pages to have 'Class Schedule Listing' in their title
    const parsed = await classScheduleListingExtractor($);
    parsed.forEach(e => {
      expect(e.crn).toMatch(/\d{5}/);
    });
  });
});

describe('Class Schedule Listing Parser All', () => {
  describe('202001 term', () => {
    const paths: string[] = getScheduleFilePathsByTerm('202009');
    // load the HTML file from the file system, in this case
    each(paths).it('%s parses correctly', async (path: string) => {
      //   pass the HTML file to cheerio to interact with the DOM
      const $ = cheerio.load(await fs.promises.readFile(path));
      // expect all BAN1P pages to have 'Class Schedule Listing' in their title
      const parsed = await classScheduleListingExtractor($);
      parsed.forEach(e => {
        expect(e.crn).toMatch(/\d{5}/);
        expect(e.sectionCode).toMatch(/[A|B|T]\d+/);
        expect(e.credits).toMatch(/\d\.\d{3}/);
      });
    });
  });

  describe('202101 term', () => {
    const paths = getScheduleFilePathsByTerm('202101');
    // load the HTML file from the file system, in this case
    each(paths).it('%s parses correctly', async (name: string, p: string) => {
      //   pass the HTML file to cheerio to interact with the DOM
      const $ = cheerio.load(await fs.promises.readFile(p));
      // expect all BAN1P pages to have 'Class Schedule Listing' in their title
      const parsed = await classScheduleListingExtractor($);
      parsed.forEach(e => {
        expect(e.crn).toMatch(/\d{5}/);
        expect(e.sectionCode).toMatch(/[A|B|T]\d+/);
        expect(e.credits).toMatch(/\d\.\d{3}/);
      });
    });
  });
});
