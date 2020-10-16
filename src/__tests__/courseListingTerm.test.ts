import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { extractCourseListingTerm } from '../pages/courseListingTerm/extractor';

// title: Course Listing Term
// https://www.uvic.ca/BAN1P/bwckctlg.p_disp_cat_term_date

describe('page extractor: Course Listing Term', (): void => {
  // pull from local filesystem
  const filePath = path.join(__dirname, '../static/UVIC_CourseListingTerm.html');
  // pass the HTML file to cheerio to interact with the DOM
  const $ = cheerio.load(fs.readFileSync(filePath));
  it('has page has the expected title', (): void => {
    expect(
      $('title')
        .first()
        .text()
    ).toBe('Course Listing Term');
    // console.log(extractCourseListingTerm($));
  });
});
