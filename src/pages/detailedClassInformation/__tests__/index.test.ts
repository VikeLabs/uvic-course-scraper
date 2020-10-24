import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { detailedClassInfoExtractor } from '../index';

const getFilePath = (term: string, crn: string) => {
  return path.join(__dirname, `../../../static/${term}_${crn}.html`);
};

describe('Detailed Class Information', () => {
  it('parses ECE260 correctly', async () => {
    const $ = cheerio.load(fs.readFileSync(getFilePath('202009', '10953')));
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
