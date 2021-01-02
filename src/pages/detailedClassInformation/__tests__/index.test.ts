import * as cheerio from 'cheerio';

import { getScheduleFileByCourse, getSectionFileByCRN } from '../../../dev/path-builders';
import { detailedClassInfoExtractor } from '../index';

describe('Detailed Class Information', () => {
  it('should throw error when wrong page type is given', async () => {
    const $ = cheerio.load(await getScheduleFileByCourse('202009', 'CHEM', '101'));

    await expect(async () => await detailedClassInfoExtractor($)).rejects.toThrowError('wrong page type for parser');
  });

  it('parses ECE260 correctly', async () => {
    const $ = cheerio.load(await getSectionFileByCRN('202009', '10953'));
    const parsed = await detailedClassInfoExtractor($);

    expect(parsed.seats.capacity).toBe(130);
    expect(parsed.seats.actual).toBe(99);
    expect(parsed.seats.remaining).toBe(31);

    expect(parsed.waitListSeats.capacity).toBe(50);
    expect(parsed.waitListSeats.actual).toBe(0);
    expect(parsed.waitListSeats.remaining).toBe(50);

    const level = parsed.requirements!.level;
    const fieldOfStudy = parsed.requirements!.fieldOfStudy!;

    expect(level).toStrictEqual(['undergraduate']);
    expect(fieldOfStudy).toStrictEqual([
      'EN: Biomedical Engineering',
      'EN: Computer Engineering',
      'EN: Electrical Engr',
      'EN: Software Engineering BSENG',
    ]);
  });

  it('parses CSC355 correctly - case with no field requirements', async () => {
    const $ = cheerio.load(await getSectionFileByCRN('202009', '10801'));
    const parsed = await detailedClassInfoExtractor($);

    expect(parsed.seats.capacity).toBe(32);
    expect(parsed.seats.actual).toBe(17);
    expect(parsed.seats.remaining).toBe(15);

    expect(parsed.waitListSeats.capacity).toBe(10);
    expect(parsed.waitListSeats.actual).toBe(0);
    expect(parsed.waitListSeats.remaining).toBe(10);

    const level = parsed.requirements!.level;
    const fieldOfStudy = parsed.requirements!.fieldOfStudy!;

    expect(level).toStrictEqual(['undergraduate']);
    expect(fieldOfStudy).toBeUndefined();
  });

  it('parses LAW309 correctly - case with law restriction and no field requirements', async () => {
    const $ = cheerio.load(await getSectionFileByCRN('202009', '13082'));
    const parsed = await detailedClassInfoExtractor($);

    expect(parsed.seats.capacity).toBe(50);
    expect(parsed.seats.actual).toBe(50);
    expect(parsed.seats.remaining).toBe(0);

    expect(parsed.waitListSeats.capacity).toBe(100);
    expect(parsed.waitListSeats.actual).toBe(0);
    expect(parsed.waitListSeats.remaining).toBe(100);

    const level = parsed.requirements!.level;
    const fieldOfStudy = parsed.requirements!.fieldOfStudy!;

    expect(level).toStrictEqual(['law']);
    expect(fieldOfStudy).toBeUndefined();
  });
});
