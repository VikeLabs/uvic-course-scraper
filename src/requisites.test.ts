import { parseCoAndPrerequisites } from './requisites';
import courses from '../static/courses/courses.json';
import { Course } from './types';
import * as cheerio from 'cheerio';

const coursesData = courses as Course[];
const getPreAndCoReqInfo = (courseCode: string): string => {
  for (let i = 0; i < coursesData.length; i++) {
    if (courseCode === coursesData[i].__catalogCourseId) {
      const preAndCoReqInfo = coursesData[i].preAndCorequisites;
      if (preAndCoReqInfo === undefined) throw new Error('Pre and Co-Requisites are undefined');
      return (preAndCoReqInfo as string).replace(/<span>(\d+)<\/span>/g, '$1');
    }
  }
  throw new Error(`No Course with the name "${courseCode}" found`);
};

describe('parseCoAndPrerequisites', () => {
  describe('COM', () => {
    it('works for COM220', () => {
      const data = getPreAndCoReqInfo('COM220');
      const $ = cheerio.load(data);
      const reqs = parseCoAndPrerequisites($);
      expect(reqs).toStrictEqual({
        complete: {
          all: ['_MIN_YEAR_3'],
        },
      });
    });
  });

  describe('ECON', () => {
    it('works for ECON180', () => {
      const data = getPreAndCoReqInfo('ECON180');
      const $ = cheerio.load(data);
      const reqs = parseCoAndPrerequisites($);
      expect(reqs).toStrictEqual({
        complete: {
          all: ['MATH101', { 1: ['_ADMISSION_BENG', '_ADMISSION_BSENG'] }],
        },
      });
    });
  });

  describe('MATH', () => {
    it('works for MATH120', () => {
      const data = getPreAndCoReqInfo('MATH120');
      const $ = cheerio.load(data);
      const reqs = parseCoAndPrerequisites($);
      expect(reqs).toStrictEqual({
        complete: {
          1: [{ 1: ['BC_PRECALC_11', 'BC_MATH_11'] }, '_DEPARTMENT_PERMISSION'],
        },
      });
    });

    it('works for MATH100', () => {
      const data = getPreAndCoReqInfo('MATH100');
      const $ = cheerio.load(data);
      const reqs = parseCoAndPrerequisites($);
      expect(reqs).toStrictEqual({
        complete: {
          1: [
            { all: ['MATH120'], minGrade: 'C+' },
            { 1: ['BC_PRECALC_12', 'BC_MATH_12'], minGrade: 'B' },
          ],
        },
      });
    });
  });

  describe('ECE/ELEC', () => {
    it('works for ECE260', () => {
      const data = getPreAndCoReqInfo('ECE260');
      const $ = cheerio.load(data);
      const reqs = parseCoAndPrerequisites($);
      expect(reqs).toStrictEqual({
        complete: {
          all: ['MATH101', { 1: [['MATH110'], { all: ['MATH211'], concurrent: true }] }],
        },
      });
    });

    it('works for ECE250', () => {
      const data = getPreAndCoReqInfo('ECE250');
      const $ = cheerio.load(data);
      const reqs = parseCoAndPrerequisites($);
      expect(reqs).toStrictEqual({
        complete: {
          all: ['MATH101', { 1: ['PHYS111', 'PHYS125', 'PHYS130'] }],
        },
      });
    });

    it('works for ECE360', () => {
      const data = getPreAndCoReqInfo('ECE360');
      const $ = cheerio.load(data);
      const reqs = parseCoAndPrerequisites($);
      expect(reqs).toStrictEqual({
        complete: {
          1: ['ECE260', 'ELEC260'],
        },
      });
    });

    it('works for ECE355', () => {
      const data = getPreAndCoReqInfo('ECE355');
      const $ = cheerio.load(data);
      const reqs = parseCoAndPrerequisites($);
      expect(reqs).toStrictEqual({
        complete: {
          1: [
            ['ECE241', 'CENG241', 'MATH122'],
            ['ECE255', 'CENG255', 'CSC230'],
          ],
        },
      });
    });
  });

  describe('CSC', () => {
    it('works for CSC225', () => {
      const data = getPreAndCoReqInfo('CSC225');
      const $ = cheerio.load(data);
      const reqs = parseCoAndPrerequisites($);
      expect(reqs).toStrictEqual({
        complete: {
          all: [{ 1: ['CSC115', 'CSC116'] }, ['MATH122']],
        },
      });
    });
  });

  describe('SENG', () => {
    it('works for SENG440', () => {
      const data = getPreAndCoReqInfo('SENG440');
      const $ = cheerio.load(data);
      const reqs = parseCoAndPrerequisites($);
      expect(reqs).toStrictEqual({
        complete: {
          1: ['CENG355', 'CSC355', 'ECE355'],
        },
      });
    });

    it('works for SENG475', () => {
      const data = getPreAndCoReqInfo('SENG475');
      const $ = cheerio.load(data);
      const reqs = parseCoAndPrerequisites($);
      expect(reqs).toStrictEqual({
        complete: {
          1: ['SENG265', 'CENG255', 'CSC230', 'CSC349A', 'ECE255', '_DEPARTMENT_PERMISSION'],
        },
      });
    });
  });

  describe('PAAS', () => {
    it('works for PAAS451', () => {
      const data = getPreAndCoReqInfo('PAAS451');
      const $ = cheerio.load(data);
      const reqs = parseCoAndPrerequisites($);
      expect(reqs).toStrictEqual({
        complete: {
          1: [['_MIN_YEAR_3_STANDING', '_AWR'], '_DEPARTMENT_PERMISSION'],
        },
      });
    });
  });

  describe('ASTR', () => {
    it('works for ASTR255', () => {
      const data = getPreAndCoReqInfo('ASTR255');
      const $ = cheerio.load(data);
      const reqs = parseCoAndPrerequisites($);
      expect(reqs).toStrictEqual({
        complete: {
          1: [['ASTR250', 'PHYS215', 'PHYS216'], { all: ['ASTR250', 'PHYS215', 'PHYS216'], concurrent: true }],
        },
      });
    });
  });

  it.skip('works for all', () => {
    const l = [];
    for (let i = 0; i < coursesData.length; i++) {
      const data = coursesData[i].preAndCorequisites;
      if (data) {
        const $ = cheerio.load(data);
        l.push(parseCoAndPrerequisites($).trim());
      }
    }
    // fs.writeFileSync('prereqs.json', JSON.stringify(l));
  });
});
