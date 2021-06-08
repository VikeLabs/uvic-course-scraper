import dayjs from 'dayjs';

import { getCatalogIdForTerm, getCurrentTerm } from '../utils';

describe('getCurrentTerm', () => {
  it('returns the current term', () => {
    const date = dayjs('2021-01-01');
    const term = getCurrentTerm(date);
    expect(term).toEqual('202101');
  });
});

describe('getCatalogIdForTerm', () => {
  it('returns the catalog ID for Fall 2020', () => {
    expect(getCatalogIdForTerm('202009')).toBe('5d9ccc4eab7506001ae4c225');
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
