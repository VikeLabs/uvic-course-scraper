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

  describe('Fall 2020', () => {
    it('parses ECE260 correctly', async () => {
      const f = await getScheduleFileByCourse('202009', 'ECE', '260');
      const $ = cheerio.load(f);
      const parsed = await classScheduleListingExtractor($);

      expect(parsed[0].crn).toBe('10953');
      expect(parsed[0].associatedTerm).toStrictEqual({ start: '202009', end: '202012' });
      expect(parsed[0].registrationDates).toStrictEqual({
        start: 'Jun 22, 2020',
        end: 'Sep 25, 2020',
      });
      expect(parsed[0].campus).toBe('online');
      expect(parsed[0].instructionalMethod).toBe('online');
      expect(parsed[0].sectionType).toBe('lecture');
      expect(parsed[0].credits).toBe('1.500');
      expect(parsed[0].levels).toStrictEqual(['law', 'undergraduate']);
      expect(parsed[0].meetingTimes[0].type).toBe('Every Week');
      expect(parsed[0].meetingTimes[0].instructors).toStrictEqual(['Michael David Adams (P)']);
    });

    it('parses SENG480B correctly', async () => {
      const f = await getScheduleFileByCourse('202009', 'SENG', '480B');
      const $ = cheerio.load(f);
      const parsed = await classScheduleListingExtractor($);
      expect(parsed[0].title).toStrictEqual('TOPICS:SOFTWARE ENGINEER: Music Retrieval Techniques');
      expect(parsed[0].crn).toBe('13660');
      expect(parsed[0].associatedTerm).toStrictEqual({ start: '202009', end: '202012' });
      expect(parsed[0].registrationDates).toStrictEqual({
        start: 'Jun 22, 2020',
        end: 'Sep 25, 2020',
      });
      expect(parsed[0].campus).toBe('online');
      expect(parsed[0].instructionalMethod).toBe('online');
      expect(parsed[0].sectionType).toBe('lecture topic');
      expect(parsed[0].credits).toBe('1.500');
      expect(parsed[0].levels).toStrictEqual(['graduate', 'law', 'undergraduate']);
      expect(parsed[0].meetingTimes[0].type).toBe('Every Week');
      expect(parsed[0].meetingTimes[0].time).toBe('8:30 am - 9:50 am');
      expect(parsed[0].meetingTimes[0].instructors).toStrictEqual(['Jordan Mitchell Shier (P)']);
    });

    it('parses CHEM101 correctly', async () => {
      const f = await getScheduleFileByCourse('202009', 'CHEM', '101');
      const $ = cheerio.load(f);
      const parsed = await classScheduleListingExtractor($);

      expect(parsed[0].crn).toBe('10487');
      expect(parsed[0].associatedTerm).toStrictEqual({ start: '202009', end: '202012' });
      expect(parsed[0].registrationDates).toStrictEqual({
        start: 'Jun 22, 2020',
        end: 'Sep 25, 2020',
      });
      expect(parsed[0].campus).toBe('online');
      expect(parsed[0].instructionalMethod).toBe('online');
      expect(parsed[0].sectionType).toBe('lecture');
      expect(parsed[0].credits).toBe('1.500');
      expect(parsed[0].levels).toStrictEqual(['law', 'undergraduate']);
      expect(parsed[0].meetingTimes[0].type).toBe('Every Week');
      expect(parsed[0].meetingTimes[0].instructors).toStrictEqual([
        'Genevieve Nicole Boice (P)',
        'Neil Burford',
        'J. Scott McIndoe',
        'Harmen Zijlstra',
      ]);
    });
  });

  describe('Fall 2021', () => {
    it('parses CHEM101 A01', async () => {
      const f = await getScheduleFileByCourse('202109', 'CHEM', '101');
      const $ = cheerio.load(f);
      const parsed = await classScheduleListingExtractor($);

      expect(parsed[0].crn).toBe('10485');
      expect(parsed[0].associatedTerm).toStrictEqual({ start: '202109', end: '202112' });
      expect(parsed[0].registrationDates).toStrictEqual({
        start: 'Jun 14, 2021',
        end: 'Sep 24, 2021',
      });
      expect(parsed[0].campus).toBe('in-person');
      expect(parsed[0].instructionalMethod).toBe('face to face');
      expect(parsed[0].sectionType).toBe('lecture');
      expect(parsed[0].credits).toBe('1.500');
      expect(parsed[0].levels).toStrictEqual(['law', 'undergraduate']);
      expect(parsed[0].meetingTimes[0].type).toBe('Every Week');
      expect(parsed[0].meetingTimes[0].time).toBe('1:00 pm - 2:20 pm');
      expect(parsed[0].meetingTimes[0].days).toBe('MR');
      expect(parsed[0].meetingTimes[0].where).toBe('Engineering Comp Science Bldg 123');
      expect(parsed[0].meetingTimes[0].dateRange).toBe('Sep 08, 2021 - Dec 03, 2021');
      expect(parsed[0].meetingTimes[0].instructors).toStrictEqual([
        'Genevieve Nicole Boice (P)',
        'Cornelia Bohne',
        'J. Scott McIndoe',
      ]);
    });

    it('parses ECE260 A01 correctly', async () => {
      const f = await getScheduleFileByCourse('202109', 'ECE', '260');
      const $ = cheerio.load(f);
      const parsed = await classScheduleListingExtractor($);

      expect(parsed[0].crn).toBe('10971');
      expect(parsed[0].associatedTerm).toStrictEqual({ start: '202109', end: '202112' });
      expect(parsed[0].registrationDates).toStrictEqual({
        start: 'Jun 14, 2021',
        end: 'Sep 24, 2021',
      });
      expect(parsed[0].campus).toBe('in-person');
      expect(parsed[0].additionalNotes).toBe('Reserved for BME, BSEN, CENG, ELEC students');
      expect(parsed[0].instructionalMethod).toBe('face to face');
      expect(parsed[0].sectionType).toBe('lecture');
      expect(parsed[0].credits).toBe('1.500');
      expect(parsed[0].levels).toStrictEqual(['law', 'undergraduate']);
      expect(parsed[0].meetingTimes[0].type).toBe('Every Week');
      expect(parsed[0].meetingTimes[0].time).toBe('1:30 pm - 2:20 pm');
      expect(parsed[0].meetingTimes[0].days).toBe('TWF');
      expect(parsed[0].meetingTimes[0].where).toBe('Human & Social Development A240');
      expect(parsed[0].meetingTimes[0].dateRange).toBe('Sep 08, 2021 - Dec 03, 2021');
      expect(parsed[0].meetingTimes[0].instructors).toStrictEqual(['Michael David Adams (P)']);
    });

    it('parses ECE260 T01 correctly', async () => {
      const f = await getScheduleFileByCourse('202109', 'ECE', '260');
      const $ = cheerio.load(f);
      const parsed = await classScheduleListingExtractor($);

      expect(parsed[2].crn).toBe('10973');
      expect(parsed[2].associatedTerm).toStrictEqual({ start: '202109', end: '202112' });
      expect(parsed[2].registrationDates).toStrictEqual({
        start: 'Jun 14, 2021',
        end: 'Sep 24, 2021',
      });
      expect(parsed[2].campus).toBe('in-person');
      expect(parsed[2].instructionalMethod).toBe('face to face');
      expect(parsed[2].sectionType).toBe('tutorial');
      expect(parsed[2].credits).toBe('0.000');
      expect(parsed[2].levels).toStrictEqual(['law', 'undergraduate']);
      expect(parsed[2].meetingTimes[0].type).toBe('Every Week');
      expect(parsed[2].meetingTimes[0].time).toBe('1:30 pm - 2:20 pm');
      expect(parsed[2].meetingTimes[0].days).toBe('M');
      expect(parsed[2].meetingTimes[0].where).toBe('Engineering Lab Wing B215');
      expect(parsed[2].meetingTimes[0].dateRange).toBe('Sep 13, 2021 - Dec 03, 2021');
      expect(parsed[2].meetingTimes[0].instructors).toStrictEqual(['Michael David Adams (P)']);
    });
  });
});

const assertFields = async (path: string) => {
  const $ = cheerio.load(await fs.promises.readFile(path));
  const parsed = await classScheduleListingExtractor($);

  parsed.forEach((e) => {
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
  describe('202009 term', () => {
    const namePathPairs: string[][] = getSchedulePathsByTerm('202009');

    each(namePathPairs).it('%s parses correctly', async (name: string, path: string) => {
      await assertFields(path);
    });
  });

  describe('202101 term', () => {
    const namePathPairs: string[][] = getSchedulePathsByTerm('202101');

    each(namePathPairs).it('%s parses correctly', async (name: string, path: string) => {
      await assertFields(path);
    });
  });

  describe('202105 term', () => {
    const namePathPairs: string[][] = getSchedulePathsByTerm('202105');

    each(namePathPairs).it('%s parses correctly', async (name: string, path: string) => {
      await assertFields(path);
    });
  });

  describe('202109 term', () => {
    const namePathPairs: string[][] = getSchedulePathsByTerm('202109');

    each(namePathPairs).it('%s parses correctly', async (name: string, path: string) => {
      await assertFields(path);
    });
  });

  describe('202201 term', () => {
    const namePathPairs: string[][] = getSchedulePathsByTerm('202109');

    each(namePathPairs).it('%s parses correctly', async (name: string, path: string) => {
      await assertFields(path);
    });
  });
});
