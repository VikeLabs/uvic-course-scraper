import { UvicCourseScraper } from '..';

describe('client', () => {
  it('works properly', async () => {
    const client = await UvicCourseScraper();
    const allCourses = await client.getAllCourses();
    console.log(allCourses);
    //TODO: write test for getAllCourses()

    // console.log(await courseDetails)
    //   const sections = await courseDetails.getSections('202005');
    //   console.log(sections);
    //   sections.forEach(v => {
    //     console.log(v);
    //   });
  });
});
