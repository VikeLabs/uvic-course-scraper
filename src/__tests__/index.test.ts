import classSchedules from '../index';

describe('CSC226 Class Schedule', () => {
  it('parses CSC226 correctly', async () => {
    const myClass = await classSchedules('CSC', '226');
    expect(myClass.getCRN()).toStrictEqual(['10770', '10771', '10772', '10773', '10774', '10775']);
    expect(myClass.getSections()).toStrictEqual(['A01', 'A02', 'B01', 'B02', 'B03', 'B04']);
  });
});
