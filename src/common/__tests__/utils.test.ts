import dayjs from 'dayjs';

import { getCatalogIdByTerm, getCatalogIdForTerm, getCurrentTerm } from '../utils';

describe('getCurrentTerm', () => {
  it('returns the current term', () => {
    const date = dayjs('2021-01-01');
    const term = getCurrentTerm(date);
    expect(term).toEqual('202101');
  });
});

describe('getCatalogIdByTerm', () => {
  describe('undergraduate', () => {
    const level = 'undergraduate';
    it('returns the catalog ID for Fall 2020', () => {
      expect(getCatalogIdByTerm('202009', level)).toBe('5eb09dad7a30f7001af74eb1');
    });

    it('returns the catalog ID for Winter 2021', () => {
      expect(getCatalogIdByTerm('202101', level)).toBe('5f21b66d95f09c001ac436a0');
    });

    it('returns the catalog ID for Summer 2021', () => {
      expect(getCatalogIdByTerm('202105', level)).toBe('5ff357f8d30280001b0c26dd');
    });

    it('returns an empty string for a invalid term', () => {
      expect(getCatalogIdByTerm('202000', level)).toBeNull();
    });
  });

  describe('graduate', () => {
        const level = 'graduate';
        it('returns the catalog ID for Fall 2020', () => {
      expect(getCatalogIdByTerm('202009', level)).toBe('5eb09c845f06e0001a5ad4ea');
    });

    it('returns the catalog ID for Winter 2021', () => {
      expect(getCatalogIdByTerm('202101', level)).toBe('5f21b607847fd9001a54a406');
    });

    it('returns the catalog ID for Summer 2021', () => {
      expect(getCatalogIdByTerm('202105', level)).toBe('5ff377d15e3876001b6dbd0d');
    });

    it('returns an empty string for a invalid term', () => {
      expect(getCatalogIdByTerm('202000', level)).toBeNull();
    });
  })
});

describe('getCatalogIdForTerm', () => {
  it('returns the catalog ID for Fall 2020', () => {
    expect(getCatalogIdForTerm('202009')).toBe('5eb09dad7a30f7001af74eb1');
  });

  it('returns the catalog ID for Winter 2021', () => {
    expect(getCatalogIdForTerm('202101')).toBe('5f21b66d95f09c001ac436a0');
  });

  it('returns the catalog ID for Summer 2021', () => {
    expect(getCatalogIdForTerm('202105')).toBe('5ff357f8d30280001b0c26dd');
  });

  it('returns an empty string for a invalid term', () => {
    expect(getCatalogIdForTerm('202000')).toBe('');
  });
});
