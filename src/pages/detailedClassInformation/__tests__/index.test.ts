import * as fs from 'fs';

import * as cheerio from 'cheerio';
import each from 'jest-each';

import { getDetailPathsByTerm, getScheduleFileByCourse, getSectionFileByCRN } from '../../../dev/path-builders';
import { detailedClassInfoExtractor } from '../index';

const assertFields = async (path: string) => {
  const $ = cheerio.load(await fs.promises.readFile(path));
  const parsed = detailedClassInfoExtractor($);
  expect(parsed.seats.capacity).toBeGreaterThanOrEqual(0);
};

describe('Detailed Class Information', () => {
  it('should throw error when wrong page type is given', async () => {
    const $ = cheerio.load(await getScheduleFileByCourse('202009', 'CHEM', '101'));

    await expect(async () => detailedClassInfoExtractor($)).rejects.toThrowError('wrong page type for parser');
  });

  it('parses AHVS 430 correctly - case with levels, fields, classifications', async () => {
    const $ = cheerio.load(await getSectionFileByCRN('202009', '10076'));
    const parsed = await detailedClassInfoExtractor($);

    expect(parsed.seats.capacity).toBe(10);
    expect(parsed.seats.actual).toBe(2);
    expect(parsed.seats.remaining).toBe(8);

    expect(parsed.waitListSeats.capacity).toBe(10);
    expect(parsed.waitListSeats.actual).toBe(0);
    expect(parsed.waitListSeats.remaining).toBe(10);

    const level = parsed.requirements?.level;
    const fieldOfStudy = parsed.requirements?.fieldOfStudy;
    const classification = parsed.requirements?.classification;

    expect(level).toStrictEqual(['undergraduate']);
    expect(fieldOfStudy).toStrictEqual(['Art History and Visual Studies', 'History in Art', 'Interdisciplinary']);
    expect(classification).toStrictEqual(['YEAR_4', 'YEAR_5']);
  });

  it('parses CYC 423 correctly - case with no end string', async () => {
    const $ = cheerio.load(await getSectionFileByCRN('202009', '10888'));
    const parsed = await detailedClassInfoExtractor($);

    expect(parsed.seats.capacity).toBe(60);
    expect(parsed.seats.actual).toBe(44);
    expect(parsed.seats.remaining).toBe(16);

    expect(parsed.waitListSeats.capacity).toBe(100);
    expect(parsed.waitListSeats.actual).toBe(0);
    expect(parsed.waitListSeats.remaining).toBe(100);

    const level = parsed.requirements?.level;
    const fieldOfStudy = parsed.requirements?.fieldOfStudy;
    const classification = parsed.requirements?.classification;

    expect(level).toStrictEqual(['undergraduate']);
    expect(fieldOfStudy).toStrictEqual(['Child & Youth Care']);
    expect(classification).toStrictEqual(['YEAR_3', 'YEAR_4', 'YEAR_5']);
  });


  //TODO: refactor index.ts to return classifications as undefined
  // currently classifications is returning empty list
  it('parses ECE260 correctly - case with levels, fields', async () => {
    const $ = cheerio.load(await getSectionFileByCRN('202009', '10953'));
    const parsed = await detailedClassInfoExtractor($);

    expect(parsed.seats.capacity).toBe(130);
    expect(parsed.seats.actual).toBe(99);
    expect(parsed.seats.remaining).toBe(31);

    expect(parsed.waitListSeats.capacity).toBe(50);
    expect(parsed.waitListSeats.actual).toBe(0);
    expect(parsed.waitListSeats.remaining).toBe(50);

    const level = parsed.requirements?.level;
    const fieldOfStudy = parsed.requirements?.fieldOfStudy;
    //const classification = parsed.requirements?.classification;

    expect(level).toStrictEqual(['undergraduate']);
    expect(fieldOfStudy).toStrictEqual([
      'EN: Biomedical Engineering',
      'EN: Computer Engineering',
      'EN: Electrical Engr',
      'EN: Software Engineering BSENG',
    ]);
    //expect(classification).toBeUndefined()
  });

  //TODO: fails classifications recieved: undefined
  it.skip('parses CSC 110 correctly - case with levels, classifications', async () => {
    const $ = cheerio.load(await getSectionFileByCRN('202009', '10720'));
    const parsed = await detailedClassInfoExtractor($);

    expect(parsed.seats.capacity).toBe(39);
    expect(parsed.seats.actual).toBe(34);
    expect(parsed.seats.remaining).toBe(5);

    expect(parsed.waitListSeats.capacity).toBe(10);
    expect(parsed.waitListSeats.actual).toBe(0);
    expect(parsed.waitListSeats.remaining).toBe(10);

    const level = parsed.requirements?.level;
    const fieldOfStudy = parsed.requirements?.fieldOfStudy;
    const classification = parsed.requirements?.classification;

    expect(level).toStrictEqual(['undergraduate']);
    expect(fieldOfStudy).toBeUndefined();
    expect(classification).toStrictEqual(['YEAR_1', 'YEAR_2']);
  });

  //TODO: currently does not handle negative classification
  it.skip('parses GNDR 100 correctly - case with levels, negative classifications', async () => {
    const $ = cheerio.load(await getSectionFileByCRN('202009', '11787'));
    const parsed = await detailedClassInfoExtractor($);

    expect(parsed.seats.capacity).toBe(50);
    expect(parsed.seats.actual).toBe(41);
    expect(parsed.seats.remaining).toBe(9);

    expect(parsed.waitListSeats.capacity).toBe(100);
    expect(parsed.waitListSeats.actual).toBe(0);
    expect(parsed.waitListSeats.remaining).toBe(100);

    const level = parsed.requirements?.level;
    const fieldOfStudy = parsed.requirements?.fieldOfStudy;
    const classification = parsed.requirements?.classification;

    expect(level).toStrictEqual(['undergraduate']);
    expect(fieldOfStudy).toBeUndefined();
    expect(classification).toStrictEqual(['YEAR_1', 'YEAR_2', 'YEAR_3', 'YEAR_5']);
  });

  it('parses CSC355 correctly - case with levels', async () => {
    const $ = cheerio.load(await getSectionFileByCRN('202009', '10801'));
    const parsed = await detailedClassInfoExtractor($);

    expect(parsed.seats.capacity).toBe(32);
    expect(parsed.seats.actual).toBe(17);
    expect(parsed.seats.remaining).toBe(15);

    expect(parsed.waitListSeats.capacity).toBe(10);
    expect(parsed.waitListSeats.actual).toBe(0);
    expect(parsed.waitListSeats.remaining).toBe(10);

    const level = parsed.requirements?.level;
    const fieldOfStudy = parsed.requirements?.fieldOfStudy;
    const classification = parsed.requirements?.classification;

    expect(level).toStrictEqual(['undergraduate']);
    expect(fieldOfStudy).toBeUndefined();
    expect(classification).toBeUndefined();
  });

  /*********************************************************************/
  // 'Must be enrolled in one of the following Degrees:'

  //TODO: failed, 'Must be enrolled in one of the following Degrees:' not handled
  it.skip('parses COM 400 correctly - case with levels, degrees, fields, classifications', async () => {
    const $ = cheerio.load(await getSectionFileByCRN('202009', '10673'));
    const parsed = await detailedClassInfoExtractor($);

    expect(parsed.seats.capacity).toBe(55);
    expect(parsed.seats.actual).toBe(44);
    expect(parsed.seats.remaining).toBe(11);

    expect(parsed.waitListSeats.capacity).toBe(50);
    expect(parsed.waitListSeats.actual).toBe(0);
    expect(parsed.waitListSeats.remaining).toBe(50);

    const level = parsed.requirements?.level;
    const fieldOfStudy = parsed.requirements?.fieldOfStudy;
    const classification = parsed.requirements?.classification;
    //TODO add degree type
    //const degree = parsed.requirements?.degree;

    expect(level).toStrictEqual(['undergraduate']);
    expect(fieldOfStudy).toStrictEqual(['Non-Specialized']);
    expect(classification).toStrictEqual(['YEAR_4', 'YEAR_5']);
    //expect(degree).toStrictEqual(['Bachelor of Commerce']);
  });

  it.skip('parses COM 402 correctly - case with levels, degrees, classifications', async () => {
    const $ = cheerio.load(await getSectionFileByCRN('202009', '10677'));
    const parsed = await detailedClassInfoExtractor($);

    expect(parsed.seats.capacity).toBe(60);
    expect(parsed.seats.actual).toBe(45);
    expect(parsed.seats.remaining).toBe(15);

    expect(parsed.waitListSeats.capacity).toBe(100);
    expect(parsed.waitListSeats.actual).toBe(0);
    expect(parsed.waitListSeats.remaining).toBe(100);

    const level = parsed.requirements?.level;
    const fieldOfStudy = parsed.requirements?.fieldOfStudy;
    const classification = parsed.requirements?.classification;
    //TODO add degree type
    //const degree = parsed.requirements?.degree;

    expect(level).toStrictEqual(['undergraduate']);
    expect(fieldOfStudy).toBeUndefined();
    expect(classification).toStrictEqual(['YEAR_4', 'YEAR_5']);
    //expect(degree).toStrictEqual(['Bachelor of Commerce']); 
  });

  it.skip('parses NURS 425 correctly - case with levels, degrees, field', async () => {
    const $ = cheerio.load(await getSectionFileByCRN('202009', '12359'));
    const parsed = await detailedClassInfoExtractor($);

    expect(parsed.seats.capacity).toBe(60);
    expect(parsed.seats.actual).toBe(58);
    expect(parsed.seats.remaining).toBe(2);

    expect(parsed.waitListSeats.capacity).toBe(100);
    expect(parsed.waitListSeats.actual).toBe(0);
    expect(parsed.waitListSeats.remaining).toBe(100);

    const level = parsed.requirements?.level;
    const fieldOfStudy = parsed.requirements?.fieldOfStudy;
    const classification = parsed.requirements?.classification;
    //TODO add degree type
    //const degree = parsed.requirements?.degree;

    expect(level).toStrictEqual(['undergraduate']);
    expect(fieldOfStudy).toStrictEqual(['Continuing Nursing']);
    expect(classification).toBeUndefined();
    //expect(degree).toStrictEqual(['Bachelor of Sc. in Nursing']); 
  });

  it.skip('parses ENGR 112 correctly - case with levels, degrees', async () => {
    const $ = cheerio.load(await getSectionFileByCRN('202009', '11400'));
    const parsed = await detailedClassInfoExtractor($);

    expect(parsed.seats.capacity).toBe(40);
    expect(parsed.seats.actual).toBe(30);
    expect(parsed.seats.remaining).toBe(10);

    expect(parsed.waitListSeats.capacity).toBe(5);
    expect(parsed.waitListSeats.actual).toBe(0);
    expect(parsed.waitListSeats.remaining).toBe(5);

    const level = parsed.requirements?.level;
    const fieldOfStudy = parsed.requirements?.fieldOfStudy;
    const classification = parsed.requirements?.classification;
    //TODO add degree type
    //const degree = parsed.requirements?.degree;

    expect(level).toStrictEqual(['undergraduate']);
    expect(fieldOfStudy).toBeUndefined();
    expect(classification).toBeUndefined();
    //expect(degree).toStrictEqual(['Bachelor of Engineering'], ['Bachelor of Software Engg']); 
  });

  /*********************************************************************/


  /*********************************************************************/
  // '[Must, May not] be enrolled in one of the following Programs:'
  // '[Must, May not] be enrolled in one of the following Colleges:'
  // 'Must be enrolled in one of the following Majors:'

  it.skip('parses EDCI 336 correctly - case with programs, levels, fields', async () => {
    const $ = cheerio.load(await getSectionFileByCRN('202009', '11400'));
    const parsed = await detailedClassInfoExtractor($);

    expect(parsed.seats.capacity).toBe(33);
    expect(parsed.seats.actual).toBe(29);
    expect(parsed.seats.remaining).toBe(4);

    expect(parsed.waitListSeats.capacity).toBe(0);
    expect(parsed.waitListSeats.actual).toBe(0);
    expect(parsed.waitListSeats.remaining).toBe(0);

    const level = parsed.requirements?.level;
    const fieldOfStudy = parsed.requirements?.fieldOfStudy;
    const classification = parsed.requirements?.classification;
    //const degree = parsed.requirements?.degree;
    //const program = parsed.requirements?.program;


    expect(level).toStrictEqual(['undergraduate']);
    expect(fieldOfStudy).toStrictEqual(['ED: Seco Teacher Educ']);
    expect(classification).toBeUndefined();
    //expect(degree).toBeUndefined(); 
    //expect(program).toStrictEqual(['Educ: Diploma']);
  });

  it.skip('parses EDCI 315 correctly - case with programs, levels', async () => {
    const $ = cheerio.load(await getSectionFileByCRN('202009', '11189'));
    const parsed = await detailedClassInfoExtractor($);

    expect(parsed.seats.capacity).toBe(33);
    expect(parsed.seats.actual).toBe(33);
    expect(parsed.seats.remaining).toBe(0);

    expect(parsed.waitListSeats.capacity).toBe(0);
    expect(parsed.waitListSeats.actual).toBe(0);
    expect(parsed.waitListSeats.remaining).toBe(0);

    const level = parsed.requirements?.level;
    const fieldOfStudy = parsed.requirements?.fieldOfStudy;
    const classification = parsed.requirements?.classification;
    //const degree = parsed.requirements?.degree;
    //const program = parsed.requirements?.program;

    expect(level).toStrictEqual(['undergraduate']);
    expect(fieldOfStudy).toBeUndefined();
    expect(classification).toBeUndefined();
    //expect(degree).toBeUndefined(); 
    //expect(program).toStrictEqual(['Educ: Elem Post Degree']);
  });

  it.skip('parses EDCI 402 correctly - case with programs, levels, classifications', async () => {
    const $ = cheerio.load(await getSectionFileByCRN('202009', '11204'));
    const parsed = await detailedClassInfoExtractor($);

    expect(parsed.seats.capacity).toBe(33);
    expect(parsed.seats.actual).toBe(31);
    expect(parsed.seats.remaining).toBe(2);

    expect(parsed.waitListSeats.capacity).toBe(0);
    expect(parsed.waitListSeats.actual).toBe(0);
    expect(parsed.waitListSeats.remaining).toBe(0);

    const level = parsed.requirements?.level;
    const fieldOfStudy = parsed.requirements?.fieldOfStudy;
    const classification = parsed.requirements?.classification;
    //const degree = parsed.requirements?.degree;
    //const program = parsed.requirements?.program;

    expect(level).toStrictEqual(['undergraduate']);
    expect(fieldOfStudy).toBeUndefined();
    expect(classification).toStrictEqual(['YEAR_3', 'YEAR_4']);
    //expect(degree).toBeUndefined(); 
    //expect(program).toStrictEqual(['Educ: Elementary Curriculum']);
  });

  it.skip('parses CSC 111 correctly - case with programs, levels, colleges', async () => {
    const $ = cheerio.load(await getSectionFileByCRN('202009', '10728'));
    const parsed = await detailedClassInfoExtractor($);

    expect(parsed.seats.capacity).toBe(195);
    expect(parsed.seats.actual).toBe(152);
    expect(parsed.seats.remaining).toBe(43);

    expect(parsed.waitListSeats.capacity).toBe(100);
    expect(parsed.waitListSeats.actual).toBe(0);
    expect(parsed.waitListSeats.remaining).toBe(100);

    const level = parsed.requirements?.level;
    const fieldOfStudy = parsed.requirements?.fieldOfStudy;
    const classification = parsed.requirements?.classification;
    //const degree = parsed.requirements?.degree;
    //const program = parsed.requirements?.program;
    //const college = parsed.requirements?.college;

    expect(level).toStrictEqual(['undergraduate']);
    expect(fieldOfStudy).toBeUndefined();
    expect(classification).toBeUndefined();
    //expect(degree).toBeUndefined(); 
    //expect(program).toStrictEqual(['Engineering: BENG','Engineering: BSENG','Engineering: Non-Degree']);
    //expect(college).toStrictEqual(['Faculty of Engineering']);
  });

  it.skip('parses EPHE 310 correctly - case with programs, levels, colleges, negative classifications', async () => {
    const $ = cheerio.load(await getSectionFileByCRN('202009', '11533'));
    const parsed = await detailedClassInfoExtractor($);

    expect(parsed.seats.capacity).toBe(32);
    expect(parsed.seats.actual).toBe(33);
    expect(parsed.seats.remaining).toBe(-1);

    expect(parsed.waitListSeats.capacity).toBe(0);
    expect(parsed.waitListSeats.actual).toBe(0);
    expect(parsed.waitListSeats.remaining).toBe(0);

    const level = parsed.requirements?.level;
    const fieldOfStudy = parsed.requirements?.fieldOfStudy;
    const classification = parsed.requirements?.classification;
    //const degree = parsed.requirements?.degree;
    //const program = parsed.requirements?.program;
    //const college = parsed.requirements?.college;

    expect(level).toStrictEqual(['undergraduate']);
    expect(fieldOfStudy).toBeUndefined();
    expect(classification).toStrictEqual(['YEAR_2', 'YEAR_3', 'YEAR_4', 'YEAR_5']);
    //expect(degree).toBeUndefined(); 
    //expect(program).toStrictEqual(['Educ: Elementary Curriculum']);
    //expect(college).toStrictEqual(['Faculty of Education']);
  });

  it.skip('parses EPHE 435 correctly - case with programs, levels, colleges, fields, classifications', async () => {
    const $ = cheerio.load(await getSectionFileByCRN('202009', '11552'));
    const parsed = await detailedClassInfoExtractor($);

    expect(parsed.seats.capacity).toBe(35);
    expect(parsed.seats.actual).toBe(35);
    expect(parsed.seats.remaining).toBe(0);

    expect(parsed.waitListSeats.capacity).toBe(10);
    expect(parsed.waitListSeats.actual).toBe(0);
    expect(parsed.waitListSeats.remaining).toBe(10);

    const level = parsed.requirements?.level;
    const fieldOfStudy = parsed.requirements?.fieldOfStudy;
    const classification = parsed.requirements?.classification;
    //const degree = parsed.requirements?.degree;
    //const program = parsed.requirements?.program;
    //const college = parsed.requirements?.college;

    expect(level).toStrictEqual(['undergraduate']);
    expect(fieldOfStudy).toStrictEqual(['ED: Elementary Education Curr']);
    expect(classification).toStrictEqual(['YEAR_3', 'YEAR_4']);
    //expect(degree).toBeUndefined(); 
    //expect(program).toStrictEqual(['Educ: Elementary Curriculum']);
    //expect(college).toStrictEqual(['Faculty of Education']);
  });

  it.skip('parses EPHE 441 correctly - case with levels, colleges, fields, classifications', async () => {
    const $ = cheerio.load(await getSectionFileByCRN('202009', '11553'));
    const parsed = await detailedClassInfoExtractor($);

    expect(parsed.seats.capacity).toBe(60);
    expect(parsed.seats.actual).toBe(59);
    expect(parsed.seats.remaining).toBe(1);

    expect(parsed.waitListSeats.capacity).toBe(50);
    expect(parsed.waitListSeats.actual).toBe(0);
    expect(parsed.waitListSeats.remaining).toBe(50);

    const level = parsed.requirements?.level;
    const fieldOfStudy = parsed.requirements?.fieldOfStudy;
    const classification = parsed.requirements?.classification;
    //const degree = parsed.requirements?.degree;
    //const program = parsed.requirements?.program;
    //const college = parsed.requirements?.college;

    expect(level).toStrictEqual(['undergraduate']);
    expect(fieldOfStudy).toStrictEqual(['Co-op Kinesiology', 'ED: Physical Education', 'Kinesiology: KNSH', 'Kinesiology: KNSM', 'Physical and Health Education', 'Recreation & Hlth Educ: RHAH', 'Recreation & Hlth Educ: RHAM']);
    expect(classification).toStrictEqual(['YEAR_3', 'YEAR_4', 'YEAR_5']);
    //expect(degree).toBeUndefined(); 
    //expect(program).toBeUndefined();
    //expect(college).toStrictEqual(['Faculty of Education']);
  });

  it.skip('parses CSC 110 correctly - case with negative programs, levels, negative colleges', async () => {
    const $ = cheerio.load(await getSectionFileByCRN('202009', '10714'));
    const parsed = await detailedClassInfoExtractor($);

    expect(parsed.seats.capacity).toBe(60);
    expect(parsed.seats.actual).toBe(59);
    expect(parsed.seats.remaining).toBe(1);

    expect(parsed.waitListSeats.capacity).toBe(50);
    expect(parsed.waitListSeats.actual).toBe(0);
    expect(parsed.waitListSeats.remaining).toBe(50);

    const level = parsed.requirements?.level;
    const fieldOfStudy = parsed.requirements?.fieldOfStudy;
    const classification = parsed.requirements?.classification;
    //const degree = parsed.requirements?.degree;
    //const program = parsed.requirements?.program;
    //const college = parsed.requirements?.college;
    //const negProgram = parsed.requirements?.negProgram;
    //const negCollege = parsed.requirements?.negCollege;

    expect(level).toStrictEqual(['undergraduate']);
    expect(fieldOfStudy).toBeUndefined();
    expect(classification).toBeUndefined();
    //expect(degree).toBeUndefined(); 
    //expect(program).toBeUndefined();
    //expect(college).toBeUndefined();
    //expect(negProgram).toStrictEqual(['Engineering: BSC', 'Engineering: CMSC Honours', 'Engineering: CMSC Major', 'H&SD: BSc', 'H&SD: BSC Major Combined']);
    //expect(negCollege).toStrictEqual(['Faculty of Engineering'])
  });

  it.skip('parses EPHE 344 correctly - case with levels, fields, negative classifications', async () => {
    const $ = cheerio.load(await getSectionFileByCRN('202009', '11534'));
    const parsed = await detailedClassInfoExtractor($);

    expect(parsed.seats.capacity).toBe(45);
    expect(parsed.seats.actual).toBe(30);
    expect(parsed.seats.remaining).toBe(15);

    expect(parsed.waitListSeats.capacity).toBe(30);
    expect(parsed.waitListSeats.actual).toBe(0);
    expect(parsed.waitListSeats.remaining).toBe(30);

    const level = parsed.requirements?.level;
    const fieldOfStudy = parsed.requirements?.fieldOfStudy;
    const classification = parsed.requirements?.classification;
    //const degree = parsed.requirements?.degree;
    //const program = parsed.requirements?.program;
    //const college = parsed.requirements?.college;
    //const negProgram = parsed.requirements?.negProgram;
    //const negCollege = parsed.requirements?.negCollege;

    expect(level).toStrictEqual(['undergraduate']);
    expect(fieldOfStudy).toStrictEqual(['Co-op Kinesiology', 'ED: Physical Education', 'Kinesiology: KNSH', 'Kinesiology: KNSM', 'Physical and Health Education', 'Recreation & Hlth Educ: RHAH', 'Recreation & Hlth Educ: RHAM']);
    expect(classification).toStrictEqual(['YEAR_2', 'YEAR_3', 'YEAR_4', 'YEAR_5']);
    //expect(degree).toBeUndefined(); 
    //expect(program).toBeUndefined();
    //expect(college).toBeUndefined();
    //expect(negProgram).toBeUndefined();
    //expect(negCollege).toBeUndefined();
  });

  it.skip('parses NURS 430 correctly - case with levels, majors', async () => {
    const $ = cheerio.load(await getSectionFileByCRN('202009', '12367'));
    const parsed = await detailedClassInfoExtractor($);

    expect(parsed.seats.capacity).toBe(35);
    expect(parsed.seats.actual).toBe(29);
    expect(parsed.seats.remaining).toBe(6);

    expect(parsed.waitListSeats.capacity).toBe(10);
    expect(parsed.waitListSeats.actual).toBe(0);
    expect(parsed.waitListSeats.remaining).toBe(10);

    const level = parsed.requirements?.level;
    const fieldOfStudy = parsed.requirements?.fieldOfStudy;
    const classification = parsed.requirements?.classification;
    //const degree = parsed.requirements?.degree;
    //const program = parsed.requirements?.program;
    //const college = parsed.requirements?.college;
    //const negProgram = parsed.requirements?.negProgram;
    //const negCollege = parsed.requirements?.negCollege;
    //const major = parsed.requirements?.major;

    expect(level).toStrictEqual(['undergraduate']);
    expect(fieldOfStudy).toBeUndefined();
    expect(classification).toBeUndefined();
    //expect(degree).toBeUndefined(); 
    //expect(program).toBeUndefined();
    //expect(college).toBeUndefined();
    //expect(negProgram).toBeUndefined();
    //expect(negCollege).toBeUndefined();
    //expect(major).toStrictEqual(['Continuing Nursing']);
  });

  /*********************************************************************/

});

describe('Detailed Class Information Parser All', () => {
  describe('202001 term', () => {
    const namePathPairs: string[][] = getDetailPathsByTerm('202009');

    each(namePathPairs).it.skip('%s parses correctly', async (name: string, path: string) => {
      await assertFields(path);
    });
  });
});
