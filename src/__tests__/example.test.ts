import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

test('example test', () => {
  // this test is pretty useless but shows the basic structure of a Jest test.
  describe('an assertion', () => {
    expect('hello').toBe('hello');
  });
});

describe('a example test using Jest and Cheerio', (): void => {
  // load the HTML file from the file system, in this case
  // the page which lists the sections of ECE260 for 202009.
  const filePath = path.join(__dirname, '../static/ECE260_202009.html');
  //   pass the HTML file to cheerio to interact with the DOM
  const $ = cheerio.load(fs.readFileSync(filePath));
  it('has page has the expected title', (): void => {
    // expect all BAN1P pages to have 'Class Schedule Listing' in their title
    expect(
      $('title')
        .first()
        .text()
    ).toBe('Class Schedule Listing');
  });
});
