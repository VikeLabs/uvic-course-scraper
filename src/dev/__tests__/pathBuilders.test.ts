import { getSchedulePathsBySubject } from '../path-builders';

describe('getScheduleBySubject', () => {
  it('works correctly', async () => {
    // pick a subject with not many classes
    const namePathPairs: string[][] = getSchedulePathsBySubject('202009', 'ADMN');
    expect(namePathPairs.length).toBe(24);
  });
});
