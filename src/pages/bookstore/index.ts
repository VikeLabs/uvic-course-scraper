import * as cheerio from 'cheerio';

import { CourseTextbooks, Textbook } from '../../types';

const BASE_URL = 'https://www.uvicbookstore.ca';
const subjectAndCodeRegex = /(.*) (A\d{2}|B\d{2}|T\d{2})?/;
const sectionRegex = /(A\d{2}|B\d{2}|T\d{2})/;
const multipleSectionRegex = /((?:A\d{2}|B\d{2}|T\d{2})\/?){2,}/;
const authorRegex = /Author: (.*)$/;
const digitalAccessRegex = /^Digital Access: (\$.*$)/;
const newBookRegex = /^New Book: (\$.*$)/;
const usedBookRegex = /^Used Book: (\$.*$)/;
const newAndDigitalAccessRegex = /^New Book \+ Digital Access: (\$.*$)/;
const instructorRegex = /Instructor: (.*)$/;

export const textbookExtractor = ($: cheerio.Root): CourseTextbooks[] => {
  const courseTextbooks: CourseTextbooks[] = [];
  const courseDivs = $('div[class="row course"]');

  courseDivs.each((_, el) => {
    const courseDiv = $(el);

    const subjectAndCode = subjectAndCodeRegex.exec(courseDiv.find('div[class="six columns"]').text().trim())?.[0];
    const subjectAndCodeArray = subjectAndCode?.split(' ');

    const subject = subjectAndCodeArray?.[0] ?? '';
    const code = subjectAndCodeArray?.[1] ?? '';

    const textbooks: Textbook[] = [];

    const textbooksDiv = courseDiv.find('.textbook-item');
    textbooksDiv.each((_, el) => {
      const textbookDiv = $(el);

      const bookstoreUrl = BASE_URL + textbookDiv.find('.textbook-image-container').find('a').attr('href');
      const imageUrl = BASE_URL + textbookDiv.find('.textbook-image-container').find('a > img').attr('src');
      const title = textbookDiv.find('.textbook-results-title').text().trim();

      const authorsText = authorRegex.exec(textbookDiv.find('span.textbook-results-author').text().trim())?.[1];
      const authors = authorsText?.split(',').map((author) => author.trim());

      const required = textbookDiv.find('.required-tag').text() ? true : false;
      const isbn = textbookDiv.find('.textbook-results-skew').text().trim();

      const prices = textbookDiv.find('.textbook-results-price');
      const price: {
        newCad?: string;
        usedCad?: string;
        digitalAccessCad?: string;
        newAndDigitalAccessCad?: string;
      } = {};
      prices.each((_, el) => {
        const priceSpan = $(el);
        if (newBookRegex.exec(priceSpan.text().trim())?.[1])
          price.newCad = newBookRegex.exec(priceSpan.text().trim())?.[1];
        if (digitalAccessRegex.exec(priceSpan.text().trim())?.[1])
          price.digitalAccessCad = digitalAccessRegex.exec(priceSpan.text().trim())?.[1];
        if (usedBookRegex.exec(priceSpan.text().trim())?.[1])
          price.usedCad = usedBookRegex.exec(priceSpan.text().trim())?.[1];
        if (newAndDigitalAccessRegex.exec(priceSpan.text().trim())?.[1])
          price.newAndDigitalAccessCad = newAndDigitalAccessRegex.exec(priceSpan.text().trim())?.[1];
      });

      textbooks.push({ bookstoreUrl, imageUrl, title, authors, required, price, isbn });
    });

    const additionalInfo: string[] = [];
    const additionalInfoHtml = courseDiv.find('.course-comment');
    additionalInfoHtml.each((_, el) => {
      const infoHtml = $(el);
      additionalInfo.push(infoHtml.text().trim());
    });

    const instructor = instructorRegex.exec(courseDiv.find('.textbook-results-instructor').text().trim())?.[1];

    if (multipleSectionRegex.test(courseDiv.find(`h3:contains("${subject} ${code}")`).text().trim())) {
      const sections = multipleSectionRegex.exec(
        courseDiv.find(`h3:contains("${subject} ${code}")`).text().trim()
      )?.[0];
      sections
        ?.split('/')
        .forEach((section) => courseTextbooks.push({ subject, code, section, textbooks, additionalInfo, instructor }));
    } else {
      const section = sectionRegex.exec(courseDiv.find(`h3:contains("${subject} ${code}")`).text().trim())?.[0] ?? '';

      courseTextbooks.push({ subject, code, section, textbooks, additionalInfo, instructor });
    }
  });

  return courseTextbooks;
};
