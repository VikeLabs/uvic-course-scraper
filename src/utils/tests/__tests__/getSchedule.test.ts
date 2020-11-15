import { getScheduleBySubject } from '../getSchedule';

describe.only('getScheduleBySubject', () => {
  it('works correctly', async () => {
    // pick a subject with not many classes
    const schedules = getScheduleBySubject('202009', 'ADMN');
    expect(schedules.length).toBe(9);
  });
});
