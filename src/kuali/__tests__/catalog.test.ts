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
});
