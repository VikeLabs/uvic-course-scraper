import { Demo } from '..';

describe('client', () => {
  it('works properly', async () => {
    const client = await Demo();
    const courseDetails = await client.getCourseDetails('SENG', '265');
    console.log(courseDetails);
    //   const sections = await courseDetails.getSections('202005');
    //   console.log(sections);
    //   sections.forEach(v => {
    //     console.log(v);
    //   });
  });
});
