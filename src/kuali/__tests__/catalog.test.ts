import { getCourseDetailByPidSync } from '../../dev/path-builders';
import { KualiCourseItemParser } from '../catalog';

describe('KualiCatalogItemParser', () => {
  describe('ADMN 311', () => {
    it('gets parsed correctly', () => {
      const details = getCourseDetailByPidSync('202101', 'r1F2hDT7E', 'undergraduate');

      const response = KualiCourseItemParser(details);
      expect(response.hoursCatalog).toBeUndefined();
      expect(response.credits.credits).toStrictEqual({ min: '1.5', max: '1.5' });
      expect(response.credits.value).toEqual('1.5');
      expect(response.credits.chosen).toEqual('fixed');
    });
  });

  describe('hourscatalog test (multiple hours)', () => {
    describe('PHIL207A', () => {
      it('gets parsed correctly', () => {
        const details = getCourseDetailByPidSync('202101', 'HkxKERd67E', 'undergraduate');

        const response = KualiCourseItemParser(details);
        expect(response.hoursCatalog).toStrictEqual([
          { lecture: '3', lab: '0', tutorial: '0' },
          { lecture: '2', lab: '1', tutorial: '0' },
        ]);
        expect(response.credits.credits).toStrictEqual({ min: '1.5', max: '1.5' });
        expect(response.credits.value).toEqual('1.5');
        expect(response.credits.chosen).toEqual('fixed');
      });
    });
  });

  describe('hourscatalog test (single hour)', () => {
    describe('AE103B', () => {
      it('gets parsed correctly', () => {
        const details = getCourseDetailByPidSync('202101', 'HJagTwaQN', 'undergraduate');

        const response = KualiCourseItemParser(details);
        expect(response.hoursCatalog).toStrictEqual([{ lecture: '3', lab: '0', tutorial: '0' }]);
        expect(response.credits.credits).toStrictEqual({ min: '1.5', max: '1.5' });
        expect(response.credits.value).toEqual('1.5');
        expect(response.credits.chosen).toEqual('fixed');
      });
    });
  });

  describe('ASTR490 (when credits value are a range)', () => {
    it('gets parsed correctly', () => {
      const details = getCourseDetailByPidSync('202101', 'Sye6yAwTQV', 'undergraduate');

      const response = KualiCourseItemParser(details);
      expect(response.hoursCatalog).toBeUndefined();
      expect(response.credits.credits).toStrictEqual({ min: '1.0', max: '3' });
      expect(response.credits.value).toStrictEqual({ min: '1.0', max: '3' });
      expect(response.credits.chosen).toEqual('range');
    });
  });

  describe('parsePreCoReqs', () => {
    describe('ATQP135 (no preAndCo or preOrCo)', () => {
      it('gets parsed correctly', () => {
        const details = getCourseDetailByPidSync('202101', 'HJsvjl1TB', 'undergraduate');

        const response = KualiCourseItemParser(details);
        expect(response.preAndCorequisites).toBeUndefined();
        expect(response.preOrCorequisites).toBeUndefined();
      });
    });

    describe('CHEM102 (preAndCo and no preOrCo)', () => {
      it('gets parsed correctly', () => {
        const details = getCourseDetailByPidSync('202101', 'r11A0D6XN', 'undergraduate');

        const response = KualiCourseItemParser(details);
        expect(response.preAndCorequisites).toStrictEqual([
          {
            quantity: 'ALL',
            reqList: [
              {
                quantity: 1,
                reqList: [
                  'Chemistry 12',
                  {
                    quantity: 'ALL',
                    reqList: [{ subject: 'CHEM', code: '091' }],
                  },
                ],
              },
              {
                quantity: 1,
                reqList: [
                  { subject: 'CHEM', code: '101' },
                  { subject: 'CHEM', code: '150' },
                ],
              },
            ],
          },
        ]);
        expect(response.preOrCorequisites).toBeUndefined();
      });
    });

    describe('PHYS110 (preOrCo and no preAndCo)', () => {
      it('gets parsed correctly', () => {
        const details = getCourseDetailByPidSync('202101', 'r1SYRd67V', 'undergraduate');

        const response = KualiCourseItemParser(details);
        expect(response.preAndCorequisites).toBeUndefined();
        expect(response.preOrCorequisites).toStrictEqual([
          {
            quantity: 1,
            coreq: true,
            reqList: [
              { subject: 'MATH', code: '100' },
              { subject: 'MATH', code: '102' },
              { subject: 'MATH', code: '109' },
            ],
          },
        ]);
      });
    });

    describe('CSC360 (preOrCo and preAndCo)', () => {
      it('gets parsed correctly', () => {
        const details = getCourseDetailByPidSync('202101', 'SkWiJ_6mE', 'undergraduate');

        const response = KualiCourseItemParser(details);
        expect(response.preAndCorequisites).toStrictEqual([
          {
            quantity: 'ALL',
            reqList: [
              {
                quantity: 'ALL',
                reqList: [{ subject: 'SENG', code: '265' }],
              },
              {
                quantity: 1,
                reqList: [
                  { subject: 'CSC', code: '230' },
                  { subject: 'CENG', code: '255' },
                  { subject: 'ECE', code: '255' },
                ],
              },
            ],
          },
        ]);
        expect(response.preOrCorequisites).toStrictEqual([
          {
            quantity: 'ALL',
            coreq: true,
            reqList: [{ subject: 'CSC', code: '226' }],
          },
        ]);
      });
    });

    describe('HDCC490', () => {
      it('gets parsed correctly', () => {
        const details = getCourseDetailByPidSync('202101', 'r1KjwO6QV', 'undergraduate');

        const response = KualiCourseItemParser(details);
        expect(response.preAndCorequisites).toStrictEqual(['Permission of the program.']);
        expect(response.preOrCorequisites).toBeUndefined();
      });
    });

    describe('ANTH380 (example with min. GPA required)', () => {
      it('gets parsed correctly', () => {
        const details = getCourseDetailByPidSync('202101', 'ry-KpwT7V', 'undergraduate');

        const response = KualiCourseItemParser(details);
        expect(response.preAndCorequisites).toStrictEqual([
          {
            quantity: 'ALL',
            reqList: [
              {
                gpa: '4.0',
                quantity: 'ALL',
                reqList: [
                  { subject: 'ANTH', code: '200' },
                  { subject: 'ANTH', code: '240' },
                  { subject: 'ANTH', code: '250' },
                ],
              },
              'minimum fourth-year standing',
            ],
          },
        ]);
        expect(response.preOrCorequisites).toBeUndefined();
      });
    });

    describe('BIOL248 (example with min. grade required)', () => {
      it('gets parsed correctly', () => {
        const details = getCourseDetailByPidSync('202101', 'B1xqmRwpQV', 'undergraduate');

        const response = KualiCourseItemParser(details);
        expect(response.preAndCorequisites).toStrictEqual([
          {
            quantity: 'ALL',
            reqList: [
              {
                grade: 'C+',
                quantity: 1,
                reqList: [
                  { subject: 'BIOL', code: '186' },
                  { subject: 'BIOL', code: '190A' },
                ],
              },
              {
                quantity: 1,
                reqList: [
                  { subject: 'BIOL', code: '184' },
                  { subject: 'BIOL', code: '190B' },
                  { subject: 'MICR', code: '200A' },
                ],
              },
            ],
          },
        ]);
        expect(response.preOrCorequisites).toBeUndefined();
      });
    });
  });
});
