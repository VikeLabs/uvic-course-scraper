import { getCourseDetailByPidSync } from '../../dev/path-builders';
import { KualiCourseItemParser } from '../catalog';

describe('KualiCatalogItemParser', () => {
  describe('ADMN 311', () => {
    it('gets parsed correctly', () => {
      const details = getCourseDetailByPidSync('202101', 'r1F2hDT7E');

      const response = KualiCourseItemParser(details);
      expect(response.hoursCatalog).toBeUndefined();
      expect(response.credits.credits).toStrictEqual({ min: '1.5', max: '1.5' });
      expect(response.credits.value).toEqual('1.5');
      expect(response.credits.chosen).toEqual('fixed');
    });
  });

  describe('ASTR490 (when credits value are a range)', () => {
    it('gets parsed correctly', () => {
      const details = getCourseDetailByPidSync('202101', 'Sye6yAwTQV');

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
        const details = getCourseDetailByPidSync('202101', 'HJsvjl1TB');

        const response = KualiCourseItemParser(details);
        expect(response.preAndCorequisites).toBeUndefined();
        expect(response.preOrCorequisites).toBeUndefined();
      });
    });

    describe('CHEM102 (preAndCo and no preOrCo)', () => {
      it('gets parsed correctly', () => {
        const details = getCourseDetailByPidSync('202101', 'r11A0D6XN');

        const response = KualiCourseItemParser(details);
        expect(response.preAndCorequisites).toStrictEqual([
          {
            quantity: 'all',
            reqList: [
              {
                quantity: '1',
                reqList: [
                  'Chemistry 12',
                  {
                    quantity: 'all',
                    reqList: ['CHEM091'],
                  },
                ],
              },
              {
                quantity: '1',
                reqList: ['CHEM101', 'CHEM150'],
              },
            ],
          },
        ]);
        expect(response.preOrCorequisites).toBeUndefined();
      });
    });

    describe('PHYS110 (preOrCo and no preAndCo)', () => {
      it('gets parsed correctly', () => {
        const details = getCourseDetailByPidSync('202101', 'r1SYRd67V');

        const response = KualiCourseItemParser(details);
        expect(response.preAndCorequisites).toBeUndefined();
        expect(response.preOrCorequisites).toStrictEqual([
          {
            quantity: '1',
            coreq: true,
            reqList: ['MATH100', 'MATH102', 'MATH109'],
          },
        ]);
      });
    });

    describe('CSC360 (preOrCo and preAndCo)', () => {
      it('gets parsed correctly', () => {
        const details = getCourseDetailByPidSync('202101', 'SkWiJ_6mE');

        const response = KualiCourseItemParser(details);
        expect(response.preAndCorequisites).toStrictEqual([
          {
            quantity: 'all',
            reqList: [
              {
                quantity: 'all',
                reqList: ['SENG265'],
              },
              {
                quantity: '1',
                reqList: ['CSC230', 'CENG255', 'ECE255'],
              },
            ],
          },
        ]);
        expect(response.preOrCorequisites).toStrictEqual([
          {
            quantity: 'all',
            coreq: true,
            reqList: ['CSC226'],
          },
        ]);
      });
    });

    describe('HDCC490 (preOrCo and preAndCo)', () => {
      it('gets parsed correctly', () => {
        const details = getCourseDetailByPidSync('202101', 'r1KjwO6QV');

        const response = KualiCourseItemParser(details);
        expect(response.preAndCorequisites).toStrictEqual(['Permission of the program.']);
        expect(response.preOrCorequisites).toBeUndefined();
      });
    });
  });
});
