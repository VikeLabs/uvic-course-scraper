import { UvicCourseScraper } from '..';

describe('a random index from getAllCourses()', () => {
  it('has all the expected attributes', async () => {
    const client = await UvicCourseScraper();
    const allCourses = await client.getAllCourses();

    const courseIdx = Math.floor(Math.random() * allCourses.length);

    expect(allCourses[courseIdx]).toHaveProperty('__catalogCourseId')
    expect(allCourses[courseIdx]).toHaveProperty('__passedCatalogQuery')
    expect(allCourses[courseIdx]).toHaveProperty('_score')
    expect(allCourses[courseIdx]).toHaveProperty('catalogActivationDate')
    expect(allCourses[courseIdx]).toHaveProperty('dateStart')
    expect(allCourses[courseIdx]).toHaveProperty('getDetails')
    expect(allCourses[courseIdx]).toHaveProperty('id')
    expect(allCourses[courseIdx]).toHaveProperty('pid')
    expect(allCourses[courseIdx]).toHaveProperty('subjectCode')
    expect(allCourses[courseIdx]).toHaveProperty('title')
  });
});

describe('when getSeats() is envoked', () => {
  it('has the expected data', async () => {
    const client = await UvicCourseScraper();
    const seats = await client.getSeats('20001');
    expect(seats).toHaveProperty('seats')
    expect(seats).toHaveProperty('waitListSeats')
  });
});
