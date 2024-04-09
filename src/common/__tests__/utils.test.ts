import { getCatalogIdForTerm, getCurrentTerm } from '../term';

describe('getCurrentTerm', () => {
  it('returns the correct term for January', () => {
    const date = new Date('2021-01-05T00:00:00Z');
    const term = getCurrentTerm(date);
    expect(term).toEqual('202101');
  });

  it('returns the correct term for February', () => {
    const date = new Date('2021-02-01T00:00:00Z');
    const term = getCurrentTerm(date);
    expect(term).toEqual('202101');
  });

  it('returns the correct term for March', () => {
    const date = new Date('2021-03-01T00:00:00Z');
    const term = getCurrentTerm(date);
    expect(term).toEqual('202101');
  });

  it('returns the correct term for April', () => {
    const date = new Date('2021-04-01T00:00:00Z');
    const term = getCurrentTerm(date);
    expect(term).toEqual('202101');
  });

  it('returns the correct term for May', () => {
    const date = new Date('2021-05-05T00:00:00Z');
    const term = getCurrentTerm(date);
    expect(term).toEqual('202105');
  });

  it('returns the correct term for June', () => {
    const date = new Date('2021-06-01T00:00:00Z');
    const term = getCurrentTerm(date);
    expect(term).toEqual('202105');
  });

  it('returns the correct term for July', () => {
    const date = new Date('2021-07-01T00:00:00Z');
    const term = getCurrentTerm(date);
    expect(term).toEqual('202105');
  });

  it('returns the correct term for August', () => {
    const date = new Date('2021-08-01T00:00:00Z');
    const term = getCurrentTerm(date);
    expect(term).toEqual('202105');
  });

  it('returns the correct term for September', () => {
    const date = new Date('2021-09-02T00:00:00Z');
    const term = getCurrentTerm(date);
    expect(term).toEqual('202109');
  });

  it('returns the correct term for October', () => {
    const date = new Date('2021-10-01T00:00:00Z');
    const term = getCurrentTerm(date);
    expect(term).toEqual('202109');
  });

  it('returns the correct term for November', () => {
    const date = new Date('2021-11-01T00:00:00Z');
    const term = getCurrentTerm(date);
    expect(term).toEqual('202109');
  });

  it('returns the correct term for December', () => {
    const date = new Date('2021-12-01T00:00:00Z');
    const term = getCurrentTerm(date);
    expect(term).toEqual('202109');
  });

  it('returns the current term when no date is provided', () => {
    const date = new Date();
    const term = getCurrentTerm(date);
    const expectedTerm = getCurrentTerm();
    expect(term).toEqual(expectedTerm);
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
