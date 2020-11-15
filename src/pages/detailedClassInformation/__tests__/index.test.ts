import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { detailedClassInfoExtractor } from '../index';
import appRoot from 'app-root-path';

const getFilePath = (term: string, crn: string) => {
  return path.join(appRoot.toString(), `src/static/${term}_${crn}.html`);
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

    //currently scraping data directly as UVic supplyies, may need to change how we want fieldOfStudy data is represented
    expect(parsed.requirements.level).toStrictEqual(['undergraduate']);
    expect(parsed.requirements.fieldOfStudy).toStrictEqual(['EN: Biomedical Engineering', 'EN: Computer Engineering', 'EN: Electrical Engr', 'EN: Software Engineering BSENG']);
  });
});
