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

export const textbookExtractor = async ($: cheerio.Root): Promise<CourseTextbooks[]> => {
  const courseTextbooks: CourseTextbooks[] = [];
  const courseDivs = $('div[class="row course"]');
  courseDivs.map((_, el) => {
    const courseDiv = $(el);

    const materials: { textbooks: Textbook[]; section: string }[] = [];

    const subjectAndCodeRegex = /(.*) (A\d{2}|B\d{2}|T\d{2})/;
    const sectionRegex = /(A\d{2}|B\d{2}|T\d{2})/;
    const multipleSectionRegex = /((?:A\d{2}|B\d{2}|T\d{2})\/?){2,}/;
    const authorRegex = /Author: (.*)$/;
    const digitalAccessRegex = /^Digital Access: (\$.*$)/;
    const newBookRegex = /^New Book: (\$.*$)/;
    const usedBookRegex = /^Used Book: (\$.*$)/;
    const newAndDigitalAccessRegex = /^New Book \+ Digital Access: (\$.*$)/;

    const subjectAndCode = subjectAndCodeRegex.exec(courseDiv.find('div[class="six columns"]').text().trim())?.[0];
    const subjectAndCodeArray = subjectAndCode?.split(' ');

    const subject = subjectAndCodeArray?.[0] ?? '';
    const code = subjectAndCodeArray?.[1] ?? '';

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
        const section =
          sectionRegex.exec(sectionDiv.find(`h3:contains("${subject} ${code}")`).text().trim())?.[0] ?? '';
        materials.push({ section, textbooks });
      }
    });

    courseTextbooks.push({ subject, code, materials });
  });

  return courseTextbooks;
};

const main = async () => {
  const $ = cheerio.load(await fs.promises.readFile(`src/pages/bookstore/textbooks.html`));
  console.log(JSON.stringify(await textbookExtractor($), null, 2));
};

main();
