import fs from 'fs';

import * as cheerio from 'cheerio';
import each from 'jest-each';

import { assertPageTitle } from '../../common/assertions';
import { getScheduleFileByCourse, getSchedulePathsBySubject } from '../../dev/path-builders';

test('example test', () => {
  // this test is pretty useless but shows the basic structure of a Jest test.
  describe('an assertion', () => {
    expect('hello').toBe('hello');
  });
});

describe('a example test using Jest and Cheerio', () => {
  it('has page has the expected title', async () => {
    //   pass the HTML file for ECE260 in term 202009 to cheerio to interact with the DOM
    const $ = cheerio.load(await getScheduleFileByCourse('202009', 'ECE', '260'));

    try {
      // expect this title for all BAN1P pages
      assertPageTitle('Class Schedule Listing', $);
    } catch (error) {
      // should not throw
      fail(error);
    }
  });
});

describe('a example test using Jest and Cheerio with parameters', (): void => {
  const namePathPairs: string[][] = getSchedulePathsBySubject('202009', 'CSC');

  each(namePathPairs).it.concurrent('%s has the expected title ', async (name: string, path: string) => {
    const $ = cheerio.load(await fs.promises.readFile(path));

    try {
      assertPageTitle('Class Schedule Listing', $);
    } catch (error) {
      fail(error);
    }
  });
});
