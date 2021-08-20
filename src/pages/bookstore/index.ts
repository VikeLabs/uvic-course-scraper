import * as cheerio from 'cheerio';

import { CourseTextbooks, Textbook } from '../../types';

const BASE_URL = 'https://www.uvicbookstore.ca';

export const textbookExtractor = async ($: cheerio.Root): Promise<CourseTextbooks[]> => {
  const courseTextbooks: CourseTextbooks[] = [];
  const courseDivs = $('div[class="row course"]');

  const subjectAndCodeRegex = /(.*) (A\d{2}|B\d{2}|T\d{2})/;
  const sectionRegex = /(A\d{2}|B\d{2}|T\d{2})/;
  const multipleSectionRegex = /((?:A\d{2}|B\d{2}|T\d{2})\/?){2,}/;
  const authorRegex = /Author: (.*)$/;
  const digitalAccessRegex = /^Digital Access: (\$.*$)/;
  const newBookRegex = /^New Book: (\$.*$)/;
  const usedBookRegex = /^Used Book: (\$.*$)/;
  const newAndDigitalAccessRegex = /^New Book \+ Digital Access: (\$.*$)/;

  courseDivs.map((_, el) => {
    const courseDiv = $(el);

    const subjectAndCode = subjectAndCodeRegex.exec(courseDiv.find('div[class="six columns"]').text().trim())?.[0];
    const subjectAndCodeArray = subjectAndCode?.split(' ');

    const subject = subjectAndCodeArray?.[0] ?? '';
    const code = subjectAndCodeArray?.[1] ?? '';

    const textbooks: Textbook[] = [];

    const textbooksDiv = courseDiv.find('.textbook-item');
    textbooksDiv.map((_, el) => {
      const textbookDiv = $(el);

      const bookstoreUrl = BASE_URL + textbookDiv.find('.textbook-image-container').find('a').attr('href');
      const image = BASE_URL + textbookDiv.find('.textbook-image-container').find('a > img').attr('src');
      const title = textbookDiv.find('.textbook-results-title').text().trim();

      const authorsText = authorRegex.exec(textbookDiv.find('span.textbook-results-author').text().trim())?.[1];
      const authors = authorsText?.split(',').map((author) => author.trim());

      const required = textbookDiv.find('.required-tag').text() ? true : false;
      const isbn = textbookDiv.find('.textbook-results-skew').text().trim();

      const prices = textbookDiv.find('.textbook-results-price');
      const price: { new?: string; used?: string; digitalAccess?: string; newAndDigitalAccess?: string } = {};
      prices.map((_, el) => {
        const priceSpan = $(el);
        if (newBookRegex.exec(priceSpan.text().trim())?.[1])
          price.new = newBookRegex.exec(priceSpan.text().trim())?.[1];
        if (digitalAccessRegex.exec(priceSpan.text().trim())?.[1])
          price.digitalAccess = digitalAccessRegex.exec(priceSpan.text().trim())?.[1];
        if (usedBookRegex.exec(priceSpan.text().trim())?.[1])
          price.used = usedBookRegex.exec(priceSpan.text().trim())?.[1];
        if (newAndDigitalAccessRegex.exec(priceSpan.text().trim())?.[1])
          price.newAndDigitalAccess = newAndDigitalAccessRegex.exec(priceSpan.text().trim())?.[1];
      });

      textbooks.push({ bookstoreUrl, image, title, authors, required, price, isbn });
    });

    if (multipleSectionRegex.test(courseDiv.find(`h3:contains("${subject} ${code}")`).text().trim())) {
      const sections = multipleSectionRegex.exec(
        courseDiv.find(`h3:contains("${subject} ${code}")`).text().trim()
      )?.[0];
      sections?.split('/').forEach((section) => courseTextbooks.push({ subject, code, section, textbooks }));
    } else {
      const section = sectionRegex.exec(courseDiv.find(`h3:contains("${subject} ${code}")`).text().trim())?.[0] ?? '';

      courseTextbooks.push({ subject, code, section, textbooks });
    }
  });

  return courseTextbooks;
};
