import appRoot from 'app-root-path';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { getScheduleFileByCourse } from '../../../dev-tools/pathBuilders';

import { extractSubjects } from '../extractor';

// title: Search for Courses
// https://www.uvic.ca/BAN1P/bwckctlg.p_disp_cat_term_date
// the following fetches the page with the appropriate POST request data
// curl -qd 'call_proc_in=bwckctlg.p_disp_dyn_ctlg&cat_term_in=202001' \
// https://www.uvic.ca/BAN1P/bwckctlg.p_disp_cat_term_date > src/static/UVIC_SearchForCourses.html

const getFilePath = (file: string) => {
  return path.join(appRoot.toString(), `static/${file}`);
};

describe('page extractor: Search for Courses', (): void => {
  it('should throw error when wrong page type is given', async () => {
    const $ = cheerio.load(await getScheduleFileByCourse('202009', 'CHEM', '101'));

    await expect(async () => await extractSubjects($)).rejects.toThrowError('wrong page type for parser');
  });

  // pass the HTML file to cheerio to interact with the DOM
  it('has page has the expected title', async () => {
    // pull from local filesystem
    const $ = cheerio.load(await fs.promises.readFile(getFilePath('misc/UVIC_SearchForCourses.html')));
    expect(
      $('title')
        .first()
        .text()
    ).toBe('Search for Courses');
  });
});
