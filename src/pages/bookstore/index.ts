import fs from 'fs';

import * as cheerio from 'cheerio';

type Textbook = {
  bookstoreUrl?: string;
  image?: string;
  title: string;
  authors?: string[];
  required: boolean;
  price: {
    new?: string;
    used?: string;
    digitalAccess?: string;
    newAndDigitalAccess?: string;
  };
  isbn: string;
};

type CourseTextbooks = {
  subject: string;
  code: string;
  materials: {
    textbooks: Textbook[];
    section: string;
  }[];
};

export const textbookExtractor = async (subject: string, code: string): Promise<CourseTextbooks> => {
  const $ = cheerio.load(await fs.promises.readFile(`src/pages/bookstore/textbooks.html`));
  const courseDiv = $(`div[class="row course"]:contains("${subject} ${code}")`);
  const materials: { textbooks: Textbook[]; section: string }[] = [];

  const sectionRegex = /(A\d{2}|B\d{2}|T\d{2})/;
  const multipleSectionRegex = /((?:A\d{2}|B\d{2}|T\d{2})\/?){2,}/;
  const authorRegex = /Author: (.*)$/;
  const digitalAccessRegex = /^Digital Access: (\$.*$)/;
  const newBookRegex = /^New Book: (\$.*$)/;
  const usedBookRegex = /^Used Book: (\$.*$)/;
  const newAndDigitalAccessRegex = /^New Book \+ Digital Access: (\$.*$)/;

  courseDiv.map((_, el) => {
    const sectionDiv = $(el);

    const textbooks: Textbook[] = [];

    const textbooksDiv = sectionDiv.find('.textbook-item');
    textbooksDiv.map((_, el) => {
      const textbookDiv = $(el);

      const bookstoreUrl = textbookDiv.find('.textbook-image-container').find('a').attr('href');
      const image = textbookDiv.find('.textbook-image-container').find('a > img').attr('src');
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

    if (multipleSectionRegex.test(sectionDiv.find(`h3:contains("${subject} ${code}")`).text().trim())) {
      const sections = multipleSectionRegex.exec(
        sectionDiv.find(`h3:contains("${subject} ${code}")`).text().trim()
      )?.[0];
      sections?.split('/').forEach((section) => materials.push({ section, textbooks }));
    } else {
      const section = sectionRegex.exec(sectionDiv.find(`h3:contains("${subject} ${code}")`).text().trim())?.[0];
      materials.push({ section: section ?? '', textbooks });
    }
  });

  return { subject, code, materials };
};

const main = async () => {
  console.log(JSON.stringify(await textbookExtractor('CSC', '111'), null, 2));
};

main();
