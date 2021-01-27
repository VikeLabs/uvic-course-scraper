import nock from 'nock';

import { UvicCourseScraper } from '..';
import coursesJSON from '../../static/courses/courses.json';
import { getSectionFileByCRN } from '../dev/path-builders';

afterEach(() => {
  nock.cleanAll();
});

describe('call getAllCourses()', () => {
  it('should have all expected data for a course', async () => {
    nock('https://uvic.kuali.co')
      .get('/api/v1/catalog/courses/5f21b66d95f09c001ac436a0')
      .reply(200, coursesJSON);

    const client = await UvicCourseScraper();
    const allCourses = await client.getAllCourses();

    const courseIdx = Math.floor(Math.random() * allCourses.length);

    expect(allCourses[courseIdx]).toHaveProperty('__catalogCourseId');
    expect(allCourses[courseIdx]).toHaveProperty('__passedCatalogQuery');
    expect(allCourses[courseIdx]).toHaveProperty('_score');
    expect(allCourses[courseIdx]).toHaveProperty('catalogActivationDate');
    expect(allCourses[courseIdx]).toHaveProperty('dateStart');
    expect(allCourses[courseIdx]).toHaveProperty('getDetails');
    expect(allCourses[courseIdx]).toHaveProperty('id');
    expect(allCourses[courseIdx]).toHaveProperty('pid');
    expect(allCourses[courseIdx]).toHaveProperty('subjectCode');
    expect(allCourses[courseIdx]).toHaveProperty('title');
  });
});

describe('call getSeats()', () => {
  it('has the expected data for a given section', async () => {
    const htmlResponse = await getSectionFileByCRN('202101', '20001');
    nock('https://www.uvic.ca')
      .get('/BAN1P/bwckschd.p_disp_detail_sched?term_in=202101&crn_in=20001')
      .reply(200, htmlResponse);

    const client = await UvicCourseScraper();
    const classSeats = await client.getSeats('202101', '20001');

    const seats = classSeats.seats;
    const waitListSeats = classSeats.waitListSeats;

    expect(seats.capacity).toEqual(10);
    expect(seats.actual).toEqual(10);
    expect(seats.remaining).toEqual(0);
    expect(waitListSeats.capacity).toEqual(10);
    expect(waitListSeats.actual).toEqual(2);
    expect(waitListSeats.remaining).toEqual(8);
  });
});
