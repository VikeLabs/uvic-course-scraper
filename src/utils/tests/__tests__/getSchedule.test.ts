import { getScheduleFilePathsBySubject } from '../getSchedule';

describe.only('getScheduleBySubject', () => {
  it('works correctly', async () => {
    // pick a subject with not many classes
    const paths: string[] = getScheduleFilePathsBySubject('202009', 'ADMN');
    expect(paths.length).toBe(9);
  });
});
