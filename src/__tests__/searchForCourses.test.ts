import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

import { extractSubjects } from '../pages/searchForCourses/extractor';
import { getSchedule } from '../utils/tests/getSchedule';

// title: Search for Courses
// https://www.uvic.ca/BAN1P/bwckctlg.p_disp_cat_term_date
// the following fetches the page with the appropriate POST request data
// curl -qd 'call_proc_in=bwckctlg.p_disp_dyn_ctlg&cat_term_in=202001' \
// https://www.uvic.ca/BAN1P/bwckctlg.p_disp_cat_term_date > src/static/UVIC_SearchForCourses.html

describe('page extractor: Search for Courses', (): void => {
  it('should throw error when wrong page type is given', async () => {
    const $ = cheerio.load(await getSchedule('202009', 'CHEM', '101'));

    await expect(async () => await extractSubjects($)).rejects.toThrowError(
      'wrong page type for parser'
    );
  });

  // pull from local filesystem
  const filePath = path.join(__dirname, '../static/UVIC_SearchForCourses.html');
  // pass the HTML file to cheerio to interact with the DOM
  const $ = cheerio.load(fs.readFileSync(filePath));
  it('has page has the expected title', (): void => {
    expect(
      $('title')
        .first()
        .text()
    ).toBe('Search for Courses');
    // console.log(extractSubjects($));
  });
});
