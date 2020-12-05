import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

import { extractCourseListingTerm } from '../pages/courseListingTerm/extractor';
import { getSchedule } from '../utils/tests/getSchedule';
import appRoot from 'app-root-path';

// title: Course Listing Term
// https://www.uvic.ca/BAN1P/bwckctlg.p_disp_cat_term_date

const getFilePath = (file: string) => {
  return path.join(appRoot.toString(), `static/${file}`);
};

describe('page extractor: Course Listing Term', (): void => {
  it('should throw error when wrong page type is given', async () => {
    const $ = cheerio.load(await getSchedule('202009', 'CHEM', '101'));

    await expect(async () => await extractCourseListingTerm($)).rejects.toThrowError('wrong page type for parser');
  });

  it('has page has the expected title', async () => {
    const $ = cheerio.load(await fs.promises.readFile(getFilePath('misc/UVIC_CourseListingTerm.html')));
    expect(
      $('title')
        .first()
        .text()
    ).toBe('Course Listing Term');
  });
});
