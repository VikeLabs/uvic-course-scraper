import * as cheerio from 'cheerio';

import { getScheduleFileByCourse, getSectionFileByCRN } from '../../../dev/path-builders';
import { detailedClassInfoExtractor } from '../index';

describe('Detailed Class Information', () => {
  it('should throw error when wrong page type is given', async () => {
    const $ = cheerio.load(await getScheduleFileByCourse('202009', 'CHEM', '101'));

    await expect(async () => await detailedClassInfoExtractor($)).rejects.toThrowError('wrong page type for parser');
  });

  it.skip('parses ECE260 correctly', async () => {
    const $ = cheerio.load(await getSectionFileByCRN('202009', '10953'));
    const parsed = await detailedClassInfoExtractor($);

    expect(parsed.seats.capacity).toBe(130);
    expect(parsed.seats.actual).toBe(99);
    expect(parsed.seats.remaining).toBe(31);

    expect(parsed.waitListSeats.capacity).toBe(50);
    expect(parsed.waitListSeats.actual).toBe(0);
    expect(parsed.waitListSeats.remaining).toBe(50);

    // this should be broken up to optional attributes.
    // levels is can probably be removed as it's also information we have from the class listing.
    // the field restrictions can probably be extracted cleaner.
    expect(parsed.requirements).toBe(`
    Must be enrolled in one of the following Levels:
    Undergraduate
Must be enrolled in one of the following Fields of Study (Major, Minor, or Concentration):
    EN: Biomedical Engineering
    EN: Computer Engineering
    EN: Electrical Engr
    EN: Software Engineering BSENG
`);
  });
});
