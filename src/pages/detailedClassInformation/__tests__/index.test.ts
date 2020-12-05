import * as cheerio from 'cheerio';

import { detailedClassInfoExtractor } from '../index';
import { getSchedule } from '../../../utils/tests/getSchedule';
import { getDetailedClassInfoByTerm } from '../../../utils/tests/getDetailedClassInfo';

describe('Detailed Class Information', () => {
  it('should throw error when wrong page type is given', async () => {
    const $ = cheerio.load(await getSchedule('202009', 'CHEM', '101'));

    await expect(async () => await detailedClassInfoExtractor($)).rejects.toThrowError('wrong page type for parser');
  });

  it.skip('parses ECE260 correctly', async () => {
    const $ = cheerio.load(await getDetailedClassInfoByTerm('202009', '10953'));
    const parsed = await detailedClassInfoExtractor($);

    expect(parsed.seats.capacity).toBe(130);
    expect(parsed.seats.actual).toBe(107);
    expect(parsed.seats.remaining).toBe(23);

    expect(parsed.waitlistSeats.capacity).toBe(50);
    expect(parsed.waitlistSeats.actual).toBe(0);
    expect(parsed.waitlistSeats.remaining).toBe(50);

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
