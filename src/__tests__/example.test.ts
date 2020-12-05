import * as cheerio from 'cheerio';
import fs from 'fs';
import each from 'jest-each';
import { getSchedule, getScheduleBySubject } from '../utils/tests/getSchedule';

test('example test', () => {
  // this test is pretty useless but shows the basic structure of a Jest test.
  describe('an assertion', () => {
    expect('hello').toBe('hello');
  });
});

describe('a example test using Jest and Cheerio', () => {
  it('has page has the expected title', async () => {
    // expect all BAN1P pages to have 'Class Schedule Listing' in their title
    // load the HTML file from the file system, in this case
    // the page which lists the sections of ECE260 for 202009.
    const f = await getSchedule('202009', 'ECE', '260');
    //   pass the HTML file to cheerio to interact with the DOM
    const $ = cheerio.load(f);
    expect(
      $('title')
        .first()
        .text()
    ).toBe('Class Schedule Listing');
  });
});

describe('a example test using Jest and Cheerio with parameters', (): void => {
  const paths = getScheduleBySubject('202009', 'CSC');

  // load the HTML file from the file system, in this case
  each(paths).it.concurrent(
    '%s has the expected title ',
    async (name: string, p: string) => {
      //   pass the HTML file to cheerio to interact with the DOM
      const $ = cheerio.load(await fs.promises.readFile(p));
      // expect all BAN1P pages to have 'Class Schedule Listing' in their title
      expect(
        $('title')
          .first()
          .text()
      ).toBe('Class Schedule Listing');
    }
  );
});
