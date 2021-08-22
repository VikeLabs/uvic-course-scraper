import fs from 'fs';

import * as cheerio from 'cheerio';

import { textbookExtractor } from '..';

describe('bookstore parser', () => {
  it('should parse every course', async () => {
    const $ = cheerio.load(await fs.promises.readFile(`static/misc/textbooks.html`));
    const textbooks = textbookExtractor($);

    expect(textbooks.length).toStrictEqual(1004);
  });

  // No required books
  describe('CSC 111 A02', () => {
    it('should have the correct data', async () => {
      const $ = cheerio.load(await fs.promises.readFile(`static/misc/textbooks.html`));
      const textbooks = textbookExtractor($);

      const csc111 = textbooks.find(
        (textbook) => textbook.subject === 'CSC' && textbook.code === '111' && textbook.section === 'A02'
      );

      expect(csc111).not.toBeUndefined();
      expect(csc111?.section).toStrictEqual('A02');
      expect(csc111?.textbooks.length).toStrictEqual(1);
      expect(csc111?.textbooks[0].authors).toStrictEqual(['Stephen Prata']);
      expect(csc111?.textbooks[0].bookstoreUrl).toStrictEqual(
        'https://www.uvicbookstore.ca/text/book/9780321928429?course_id=115483'
      );
      expect(csc111?.textbooks[0].imageUrl).toStrictEqual(
        'https://www.uvicbookstore.ca/images/textbook/9780321928429.jpg'
      );
      expect(csc111?.textbooks[0].title).toStrictEqual('C Primer Plus');
      expect(csc111?.textbooks[0].required).toBeFalsy();
      expect(csc111?.textbooks[0].price).toStrictEqual({ newCad: '$74.95', usedCad: '$56.95' });
      expect(csc111?.textbooks[0].isbn).toStrictEqual('9780321928429');
      expect(csc111?.instructor).toStrictEqual('William Bird');
      expect(csc111?.additionalInfo).toStrictEqual(['e-text free @ McPherson Library']);
    });
  });

  // Required and optional books
  describe('CSC 226 A01', () => {
    it('should have the correct data', async () => {
      const $ = cheerio.load(await fs.promises.readFile(`static/misc/textbooks.html`));
      const textbooks = textbookExtractor($);

      const csc226 = textbooks.find(
        (textbook) => textbook.subject === 'CSC' && textbook.code === '226' && textbook.section === 'A01'
      );

      expect(csc226).not.toBeUndefined();
      expect(csc226?.section).toStrictEqual('A01');
      expect(csc226?.textbooks.length).toStrictEqual(3);

      expect(csc226?.textbooks[0].authors).toStrictEqual(['Thomas H Cormen', 'Charles E Leiserson', 'Ronald L Rivest']);
      expect(csc226?.textbooks[0].bookstoreUrl).toStrictEqual(
        'https://www.uvicbookstore.ca/text/book/9780262033848?course_id=115492'
      );
      expect(csc226?.textbooks[0].imageUrl).toStrictEqual(
        'https://www.uvicbookstore.ca/images/textbook/9780262033848.jpg'
      );
      expect(csc226?.textbooks[0].title).toStrictEqual('Introduction to Algorithms');
      expect(csc226?.textbooks[0].required).toBeTruthy();
      expect(csc226?.textbooks[0].price).toStrictEqual({ newCad: '$129.95', usedCad: '$97.95' });
      expect(csc226?.textbooks[0].isbn).toStrictEqual('9780262033848');

      expect(csc226?.textbooks[1].authors).toStrictEqual(['Thomas H Cormen', 'Charles E Leiserson', 'Ronald L Rivest']);
      expect(csc226?.textbooks[1].bookstoreUrl).toStrictEqual(
        'https://www.uvicbookstore.ca/text/book/9780262533058?course_id=115492'
      );
      expect(csc226?.textbooks[1].imageUrl).toStrictEqual('https://www.uvicbookstore.ca/images/image_na_book.jpg');
      expect(csc226?.textbooks[1].title).toStrictEqual('Introduction to Algorithms');
      expect(csc226?.textbooks[1].required).toBeFalsy();
      expect(csc226?.textbooks[1].price).toStrictEqual({ newCad: '$147.95', usedCad: '$111.00' });
      expect(csc226?.textbooks[1].isbn).toStrictEqual('9780262533058');

      expect(csc226?.textbooks[2].authors).toStrictEqual(['Jon Kleinberg', 'Eva Tardos']);
      expect(csc226?.textbooks[2].bookstoreUrl).toStrictEqual(
        'https://www.uvicbookstore.ca/text/book/9780321295354?course_id=115492'
      );
      expect(csc226?.textbooks[2].imageUrl).toStrictEqual(
        'https://www.uvicbookstore.ca/images/textbook/9780321295354.jpg'
      );
      expect(csc226?.textbooks[2].title).toStrictEqual('Algorithm Design');
      expect(csc226?.textbooks[2].required).toBeFalsy();
      expect(csc226?.textbooks[2].price).toStrictEqual({ newCad: '$189.95' });
      expect(csc226?.textbooks[2].isbn).toStrictEqual('9780321295354');

      expect(csc226?.instructor).toStrictEqual('Nishant Mehta');
      expect(csc226?.additionalInfo).toStrictEqual([
        'e-text of Intro to Algorithms available free@McPherson Library',
        'This course contains book(s) that come in multiple formats (E-Text, Physical, Loose, etc.). You only need one format of each book.',
      ]);
    });
  });

  // A course that's listed with all sections together i.e. 'A01/A02/A03'
  describe('CYC 152 B01', () => {
    it('should have the correct data', async () => {
      const $ = cheerio.load(await fs.promises.readFile(`static/misc/textbooks.html`));
      const textbooks = textbookExtractor($);

      const cyc152 = textbooks.find(
        (textbook) => textbook.subject === 'CYC' && textbook.code === '152' && textbook.section === 'B01'
      );

      expect(cyc152).not.toBeUndefined();
      expect(cyc152?.section).toStrictEqual('B01');
      expect(cyc152?.textbooks.length).toStrictEqual(2);

      expect(cyc152?.textbooks[0].authors).toStrictEqual(['Bob Shebib']);
      expect(cyc152?.textbooks[0].bookstoreUrl).toStrictEqual(
        'https://www.uvicbookstore.ca/text/book/9780134842486?course_id=117617'
      );
      expect(cyc152?.textbooks[0].imageUrl).toStrictEqual(
        'https://www.uvicbookstore.ca/images/textbook/9780134842486.jpg'
      );
      expect(cyc152?.textbooks[0].title).toStrictEqual('Choices: Interviewing and Counselling Skills for Canadians');
      expect(cyc152?.textbooks[0].required).toBeTruthy();
      expect(cyc152?.textbooks[0].price).toStrictEqual({ newCad: '$148.95' });
      expect(cyc152?.textbooks[0].isbn).toStrictEqual('9780134842486');

      expect(cyc152?.textbooks[1].authors).toStrictEqual(['Shebib']);
      expect(cyc152?.textbooks[1].bookstoreUrl).toStrictEqual(
        'https://www.uvicbookstore.ca/text/book/9780135222072?course_id=117617'
      );
      expect(cyc152?.textbooks[1].imageUrl).toStrictEqual('https://www.uvicbookstore.ca/images/image_na_book.jpg');
      expect(cyc152?.textbooks[1].title).toStrictEqual('Choices:Interv+Couns.Skills Etext 180-da');
      expect(cyc152?.textbooks[1].required).toBeFalsy();
      expect(cyc152?.textbooks[1].price).toStrictEqual({ digitalAccessCad: '$59.95' });
      expect(cyc152?.textbooks[1].isbn).toStrictEqual('9780135222072');

      expect(cyc152?.instructor).toStrictEqual('TO BE ADVISED');
      expect(cyc152?.additionalInfo).toStrictEqual([
        'This course contains book(s) that come in multiple formats (E-Text, Physical, Loose, etc.). You only need one format of each book.',
      ]);
    });
  });

  // Multiple additional info elements
  describe('CIVE 351 A01', () => {
    it('should have the correct data', async () => {
      const $ = cheerio.load(await fs.promises.readFile(`static/misc/textbooks.html`));
      const textbooks = textbookExtractor($);

      const cive351 = textbooks.find(
        (textbook) => textbook.subject === 'CIVE' && textbook.code === '351' && textbook.section === 'A01'
      );

      expect(cive351?.additionalInfo).toHaveLength(2);
      expect(cive351?.additionalInfo?.[0]).toStrictEqual('Please see professor for course material info.');
      expect(cive351?.additionalInfo?.[1]).toStrictEqual('Texts available from www.cisc-icca.ca');
    });
  });

  // No section listed
  describe('CHEM 362', () => {
    it('should have the correct data', async () => {
      const $ = cheerio.load(await fs.promises.readFile(`static/misc/textbooks.html`));
      const textbooks = textbookExtractor($);

      const chem362 = textbooks.find((textbook) => textbook.subject === 'CHEM' && textbook.code === '362');

      expect(chem362).not.toBeUndefined();
      expect(chem362?.section).toStrictEqual('');
      expect(chem362?.textbooks.length).toStrictEqual(1);

      expect(chem362?.textbooks[0].authors).toStrictEqual(['Chem']);
      expect(chem362?.textbooks[0].bookstoreUrl).toStrictEqual(
        'https://www.uvicbookstore.ca/text/book/40064007635?course_id=117297'
      );
      expect(chem362?.textbooks[0].imageUrl).toStrictEqual('https://www.uvicbookstore.ca/images/image_na_book.jpg');
      expect(chem362?.textbooks[0].title).toStrictEqual('Chem 362 Lab Manual');
      expect(chem362?.textbooks[0].required).toBeTruthy();
      expect(chem362?.textbooks[0].price).toStrictEqual({ newCad: '$22.95' });
      expect(chem362?.textbooks[0].isbn).toStrictEqual('40064007635');
    });
  });
});
