/*
A simple example of how cheerio & RegEx work to do web-scraping.
Specifically focuses on how data from the sites we're hitting in this project is parsed.
Feel free to make changes to this code and use it when working on tasks to experiment with ideas!
*/

import got from 'got';
import cheerio from 'cheerio';
import Element = cheerio.Element;

console.log('Starting scraping...');

(async () => {
  // Make a request to ECE 260's class schedule listing for the Sep - Dec 2020 term.

  const html = await got(
    'https://www.uvic.ca/BAN1P/bwckctlg.p_disp_listcrse?term_in=202009&subj_in=ECE&crse_in=260&schd_in='
  );
  // Load the HTML into a cheerio object
  const $ = cheerio.load(html.body);

  // Get the part of the HTML response that includes a table with the following summary's tbody
  const table = $(
    `table[summary="This table lists the scheduled meeting times and assigned instructors for this class.."] tbody`
  );

  // find all descendants of `table` that have the tag `tr`
  const tableRows = table.find('tr');

  // Since there are multiple table rows in tableRows, we can iterate through them all
  tableRows.each((i: number, el: Element) => {
    const info = $(el)
      .text() // get the text attributes of what we found
      .split('\n') // split the text into an array, splitting at any new line
      .map((e: string) => e.trim()); // trim each element of the array so there's no extra white space

    console.log(info);

    const regex = /\d{2}/;
    // Test if any elements in the info parsed above matches the given RegEx pattern
    info.forEach((el: string) => {
      if (regex.test(el)) {
        console.log('Found a `td` element with 2 numbers in it', el);
      }
    });
  });
  console.log('Scraping done...');
})();
